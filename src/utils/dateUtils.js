// src/utils/dateUtils.js
// OverdueList.jsx의 fmt, ToDoList.jsx의 fmt, DateEntryModal.jsx/RepeatItemModal.jsx의
// fmtDate가 전부 동일한 "yyyy-mm-dd" 변환 로직이라 하나로 통합.
// RepeatItemModal.jsx의 parseDate도 함께 이동.

/** Date 객체 -> "yyyy-mm-dd" 문자열 */
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