// src/utils/alarmUtils.js
// 알림(todo_alarm) 요약 문구 + 반복 날짜 계산
import { parseDate, expandRepeat } from "./dateUtils";

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

    const start = parseDate(a.alrm_date);
    let rule;
    if (a.alrm_rpt === "day") rule = n === 1 ? "매일" : `${n}일마다`;
    else if (a.alrm_rpt === "week") {
        const days = (a.alrm_days || []).map((i) => WEEK_KO[i]).join("·");
        rule = `${n === 1 ? "매주" : `${n}주마다`} ${days}`;
    } else if (a.alrm_rpt === "year") {
        rule = `${n === 1 ? "매년" : `${n}년마다`} ${start.getMonth() + 1}월 ${start.getDate()}일`;
    } else {
        rule = `${n === 1 ? "매월" : `${n}개월마다`} ${start.getDate()}일`;
    }
    const range = `${a.alrm_date}부터${a.alrm_end ? ` ~ ${a.alrm_end}` : ""}`;
    return `${rule} ${time} (${range})`;
}

export function expandAlarm(a, from, to) {
    const start = parseDate(a.alrm_date);
    const end = a.alrm_end ? parseDate(a.alrm_end) : null;
    const limit = end && end < to ? end : to;

    const dates =
        a.alrm_rpt === "none"
            ? [start]
            : expandRepeat({
                type: a.alrm_rpt,
                start,
                end: limit,
                interval: a.alrm_intv,
                weekDays: a.alrm_days || [],
            });

    return dates.map((d) => atTime(d, a.alrm_time)).filter((at) => at > from && at <= to);
}