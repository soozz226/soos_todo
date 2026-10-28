// src/components/todo/RepeatRuleFields.jsx
// 반복 규칙 입력 화면 (반복 종류 / N마다 / 요일) — AlarmModal, CheckListItemRepeatPicker 공용
// options 로 보여줄 종류를 고름: "none"(한 번) "day" "week" "month" "year"
import { WEEK_LABELS } from "../../constants/entryTypes";

const LABEL = { none: "한 번", day: "매일", week: "매주", month: "매월", year: "매년" };
const UNIT = { day: "일마다", week: "주마다", month: "개월마다", year: "년마다" };
const tt = { fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 };

// type: 선택된 종류, interval: N, weekDays: [0~6], startDate: "yyyy-mm-dd"(안내 문구용)
function AlarmRepeatPicker({ options, type, interval, weekDays, startDate, onType, onInterval, onToggleDay }) {
    const sm = startDate ? Number(startDate.slice(5, 7)) : "-";
    const sd = startDate ? Number(startDate.slice(8, 10)) : "-";

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <div style={tt}>반복 주기</div>
                <div style={{ display: "flex", gap: 8 }}>
                    {options.map((id) => (
                        <div key={id} onClick={() => onType(id)}
                            style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer",
                                background: type === id ? "#4a8ef5" : "#f0f2f7",
                                color: type === id ? "#fff" : "#6b7280",
                                transition: "all 0.15s" }}>
                            {LABEL[id]}
                        </div>
                    ))}
                </div>
            </div>

            {type !== "none" && (
                <div style={{ marginBottom: 16 }}>
                    <div style={tt}>{UNIT[type].replace("마다", "")}마다 반복</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="number" min="1" max="99" value={interval}
                            onChange={(e) => onInterval(Math.max(1, Number(e.target.value) || 1))}
                            style={{ width: 72, border: "1.5px solid #dde1ea", borderRadius: 10, padding: "10px 12px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", outline: "none", color: "#1e2a3a", textAlign: "center" }} />
                        <span style={{ fontSize: 15, color: "#6b7280" }}>{UNIT[type]}</span>
                    </div>
                </div>
            )}

            {type === "week" && (
                <div style={{ marginBottom: 16 }}>
                    <div style={tt}>요일 선택 <span style={{ fontWeight: 400, color: "#c4c9d4" }}>(안 고르면 시작일의 요일)</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {WEEK_LABELS.map((lbl, idx) => (
                            <div key={idx} onClick={() => onToggleDay(idx)}
                                style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
                                    background: weekDays.includes(idx) ? (idx === 0 ? "#fef2f2" : idx === 6 ? "#eff6ff" : "#eef3ff") : "#f0f2f7",
                                    color: weekDays.includes(idx) ? (idx === 0 ? "#ef4444" : idx === 6 ? "#4a8ef5" : "#1e2a3a") : "#9ca3af",
                                    border: weekDays.includes(idx) ? `2px solid ${idx === 0 ? "#ef4444" : "#4a8ef5"}` : "2px solid transparent",
                                    transition: "all 0.15s" }}>
                                {lbl}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {type === "month" && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
                    시작일의 날짜({sd}일)에 반복돼요. 그 달에 없는 날이면 말일로 맞춰요.
                </div>
            )}

            {type === "year" && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
                    시작일의 월·일({sm}월 {sd}일)에 반복돼요. 그 달에 없는 날이면 말일로 맞춰요.
                </div>
            )}
        </>
    );
}

export default AlarmRepeatPicker;