// src/utils/alarmUtils.js
// 알림(todo_alarm) 요약 문구 + 반복 날짜 계산
import { parseDate } from "./dateUtils";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];

const atTime = (d, time) => {
    const [hh, mm] = (time || "00:00").split(":").map(Number);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm);
};

/** 목록에 보여줄 한 줄 요약 */
export function alarmSummary(a) {
    const time = (a.alrm_time || "").slice(0, 5);
    const n = a.alrm_intv || 1;
    if (a.alrm_rpt === "none") return `${a.alrm_date} ${time}`;

    let rule;
    if (a.alrm_rpt === "day") rule = n === 1 ? "매일" : `${n}일마다`;
    else if (a.alrm_rpt === "week") {
    const days = (a.alrm_days || []).map((i) => WEEK_KO[i]).join("·");
    rule = `${n === 1 ? "매주" : `${n}주마다`} ${days}`;
    } else {
    rule = `${n === 1 ? "매월" : `${n}개월마다`} ${parseDate(a.alrm_date).getDate()}일`;
    }
    const range = `${a.alrm_date}부터${a.alrm_end ? ` ~ ${a.alrm_end}` : ""}`;
    return `${rule} ${time} (${range})`;
}

/** from(지금) 이후 ~ to 사이에 울려야 하는 시각들을 Date 배열로 돌려줌 */
export function expandAlarm(a, from, to) {
    const start = parseDate(a.alrm_date);
    const end = a.alrm_end ? parseDate(a.alrm_end) : null;
    const limit = end && end < to ? end : to;
    const n = Math.max(1, a.alrm_intv || 1);
    const dates = [];

    if (a.alrm_rpt === "none") {
        dates.push(start);
    } else if (a.alrm_rpt === "day") {
        for (let d = new Date(start); d <= limit; d.setDate(d.getDate() + n)) dates.push(new Date(d));
    } else if (a.alrm_rpt === "week") {
        const days = a.alrm_days?.length ? a.alrm_days : [start.getDay()];
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - start.getDay());

        for (let d = new Date(start); d <= limit; d.setDate(d.getDate() + 1)) {
            if (!days.includes(d.getDay())) continue;
                const weekIdx = Math.floor(Math.round((d - weekStart) / DAY_MS) / 7);
            if (weekIdx % n === 0) dates.push(new Date(d));
        }

    } else if (a.alrm_rpt === "month") {
        let cur = new Date(start.getFullYear(), start.getMonth(), 1);
        
        for (let i = 0; i < 1200 && cur <= limit; i++) {
            const last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
            const target = new Date(cur.getFullYear(), cur.getMonth(), Math.min(start.getDate(), last));
            if (target >= start && target <= limit) dates.push(target);
            cur = new Date(cur.getFullYear(), cur.getMonth() + n, 1);
        }
    }

    return dates.map((d) => atTime(d, a.alrm_time)).filter((at) => at > from && at <= to);
}