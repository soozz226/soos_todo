// src/utils/notify.js
// 앱 안 로컬 알림 예약 — 미체크 항목 알림 + 카드 알림(날짜·시간 설정한 경우)
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { fetchAllChckItems, fetchAllAlarms } from "../api/todoApi";
import { fmtDate } from "./dateUtils";
import { expandAlarm } from "./alarmUtils";

const REMIND_HOUR = 20;   // 미체크 알림 시각 (20시 0분)
const REMIND_MINUTE = 0;
const DAYS_AHEAD = 7;     // 오늘부터 며칠치를 미리 예약할지
const CHANNEL_ID = "todo";
const ALARM_DAYS_AHEAD = 30; // 반복 알림을 며칠 앞까지 펼쳐서 예약할지
const MAX_ALARMS = 100;      // 한 번에 예약할 카드 알림 최대 개수

// 카드 uuid → 알림 번호 (날짜 번호 20261026 같은 값과 겹치지 않게 1억 이상으로)
const hashId = (str) => {
    let h = 0;
    for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return 100000000 + (Math.abs(h) % 1000000000);
};

async function ensurePermission() {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display === "prompt" || perm.display === "prompt-with-rationale") {
        perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === "granted";
}

export async function refreshNotifications() {
    if (!Capacitor.isNativePlatform()) return; // 웹 브라우저에서는 동작 안 함
    try {
        if (!(await ensurePermission())) return;
        await LocalNotifications.createChannel({ id: CHANNEL_ID, name: "할 일 알림", importance: 4 });

        const [cards, alarms] = await Promise.all([fetchAllChckItems(), fetchAllAlarms()]);
        const now = new Date();
        const list = [];

        // 1) 날짜별 미체크 항목 알림
        const unchecked = {};
        cards.forEach((card) =>
        (card.todo_chck || []).forEach((group) =>
            (group.todo_chck_item || []).forEach((item) => {
            if (!item.item_date || item.item_done) return;
            (unchecked[item.item_date] ||= []).push(item.item_name || "(제목 없음)");
            })
        )
        );

        for (let i = 0; i < DAYS_AHEAD; i++) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        const ds = fmtDate(day);
        const names = unchecked[ds];
        if (!names || names.length === 0) continue;
        const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), REMIND_HOUR, REMIND_MINUTE);
        if (at <= now) continue; // 이미 지난 시각은 예약하지 않음
        list.push({
            id: Number(ds.replaceAll("-", "")),
            title: `오늘 미체크 항목이 ${names.length}개 있어요`,
            body: names.slice(0, 3).join(", ") + (names.length > 3 ? ` 외 ${names.length - 3}개` : ""),
            schedule: { at, allowWhileIdle: true },
            channelId: CHANNEL_ID,
        });
        }

        // 2) 카드 알림 (todo_alrm — 한 번 / 매일 / 매주 / 매월)
        const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ALARM_DAYS_AHEAD, 23, 59);
        const cardAlarms = [];
        alarms.forEach((a) => {
        expandAlarm(a, now, horizon).forEach((at) => {
            cardAlarms.push({
            id: hashId(`${a.alrm_uuid}|${fmtDate(at)}`),
            title: a.soos_todo?.todo_name || "(제목 없음)",
            body: a.alrm_note?.trim() || "카드를 확인해보세요",
            schedule: { at, allowWhileIdle: true },
            channelId: CHANNEL_ID,
            });
        });
        });
        cardAlarms.sort((x, y) => x.schedule.at - y.schedule.at);
        list.push(...cardAlarms.slice(0, MAX_ALARMS));

        // 기존 예약을 모두 지우고 새로 예약 (이 앱의 알림은 전부 여기서만 만들기 때문)
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
        }
        if (list.length > 0) await LocalNotifications.schedule({ notifications: list });
    } catch (err) {
        console.error("알림 예약 실패:", err);
    }
}