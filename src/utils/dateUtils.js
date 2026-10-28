
export const fmtDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

/** "yyyy-mm-dd" 문자열 -> Date 객체 (local time 기준, new Date(str) 파싱과 달리 timezone 이슈 없음) */
export const parseDate = (str) => {
const [y, m, d] = str.split("-").map(Number);
return new Date(y, m - 1, d);
};

/** "n월 d일 (요일)" 형태의 표시용 포맷. ToDoList.jsx의 fmtDisplay, OverdueList.jsx의 dateLabel 로직 통합 */
export const fmtDisplay = (date) => {
const days = ["일", "월", "화", "수", "목", "금", "토"];
return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
};

/** 오늘 날짜 문자열 */
export const todayStr = () => fmtDate(new Date());

/** 달력 6주 그리드 (이전/다음 달 날짜 포함). month 는 0부터 */
export const buildWeeks = (year, month) => {
    const cursor = new Date(year, month, 1 - new Date(year, month, 1).getDay());
    const weeks = [];
    for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function expandRepeat({ type, start, end, interval = 1, weekDays = [] }) {
    if (!start || !end || start > end) return [];
    const n = Math.max(1, interval || 1);
    const dates = [];

    if (type === "day") {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + n)) dates.push(new Date(d));
    } else if (type === "week") {
        const days = weekDays.length ? weekDays : [start.getDay()];
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - start.getDay());

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (!days.includes(d.getDay())) continue;
            const weekIdx = Math.floor(Math.round((d - weekStart) / DAY_MS) / 7);
            if (weekIdx % n === 0) dates.push(new Date(d));
        }
    } else if (type === "month") {
        let cur = new Date(start.getFullYear(), start.getMonth(), 1);

        for (let i = 0; i < 1200 && cur <= end; i++) {
            const last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
            const target = new Date(cur.getFullYear(), cur.getMonth(), Math.min(start.getDate(), last));
            if (target >= start && target <= end) dates.push(target);
            cur = new Date(cur.getFullYear(), cur.getMonth() + n, 1);
        }
    } else if (type === "year") {
        let year = start.getFullYear();

        for (let i = 0; i < 100; i++) {
            const last = new Date(year, start.getMonth() + 1, 0).getDate();
            const target = new Date(year, start.getMonth(), Math.min(start.getDate(), last));
            if (target > end) break;
            if (target >= start) dates.push(target);
            year += n;
        }
    }

    return dates;
}