// src/constants/entryTypes.js
// DateEntryModal.jsx / RepeatItemModal.jsx에 중복 정의되어 있던 ENTRY_TYPE_OPTIONS를 통합.
//
// 색상은 인라인 스타일이 아니라 styles.jsx의 CSS 클래스를 사용합니다.
// - 체크리스트 항목 옆 작은 배지: .cl-entry-badge (CardDetail.jsx가 이미 쓰던 클래스, 그대로 재사용)
// - 모달 안의 큰 선택 버튼(구분 고르기): .entry-type-option (이번에 styles.jsx에 새로 추가)
// 두 클래스 모두 "추첨"→lottery, "선착순"→fcfs, "실패"→fail 이라는 동일한 modifier 이름을 씀.

export const ENTRY_TYPE_OPTIONS = [
    { id: null, label: "없음" },
    { id: "추첨", label: "추첨" },
    { id: "선착순", label: "선착순" },
    { id: "실패", label: "실패" },
];

export const MONTHS = [
"1월", "2월", "3월", "4월", "5월", "6월",
"7월", "8월", "9월", "10월", "11월", "12월",
];

export const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** "추첨" | "선착순" | "실패" | null -> "lottery" | "fcfs" | "fail" | "" */
export const entryTypeModifier = (id) =>
id === "추첨" ? "lottery" : id === "선착순" ? "fcfs" : id === "실패" ? "fail" : "";

/**
 * 체크리스트/투두 항목의 작은 배지 className.
 * CardDetail.jsx에서 쓰던 `cl-entry-badge${...}` 템플릿과 동일한 패턴.
 * 사용처: OverdueList.jsx, ToDoList.jsx
 */
export const entryBadgeClassName = (type) => `cl-entry-badge${type ? ` ${entryTypeModifier(type)}` : ""}`;

/** item_type + item_rslt -> "추첨O" / "선착순X" / "실패" 같은 배지 텍스트 */
export const entryBadgeText = (type, result) => `${type}${result === "O" ? "O" : result === "X" ? "X" : ""}`;

/**
 * 구분 선택 모달의 큰 pill className.
 * 사용처: DateEntryModal.jsx, RepeatItemModal.jsx
 */
export const entryTypeOptionClassName = (id, active) =>
`entry-type-option${active ? ` active${id ? ` ${entryTypeModifier(id)}` : ""}` : ""}`;