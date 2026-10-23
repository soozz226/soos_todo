// src/components/DateEntryModal.jsx
import { useState } from "react";
import { fmtDate } from "../utils/dateUtils";
import { ENTRY_TYPE_OPTIONS, MONTHS, WEEK_LABELS, entryTypeOptionClassName } from "../constants/entryTypes";

function DateEntryModal({ initialDate, initialEntryType, initialWon, onClose, onConfirm }) {
    const baseDate = initialDate ? new Date(initialDate) : new Date();
    const [calYear, setCalYear] = useState(baseDate.getFullYear());
    const [calMonth, setCalMonth] = useState(baseDate.getMonth());
    const [selectedDate, setSelectedDate] = useState(initialDate || "");
    const [entryType, setEntryType] = useState(initialEntryType || null);
    const [won, setWon] = useState(initialWon ?? null);

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const goPrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
    const goNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

    const handleSelectDay = (day) => setSelectedDate(fmtDate(new Date(calYear, calMonth, day)));

    const handleSelectEntryType = (id) => {
        setEntryType(id);
        setWon(null); // 구분이 바뀌면 당첨여부는 다시 미정으로
    };

    const handleConfirm = () => {
        if (!selectedDate) return;
        const hasWon = entryType === "추첨" || entryType === "선착순";
        onConfirm({ date: selectedDate, entryType, won: hasWon ? won : null });
        onClose();
    };

    const handleClear = () => {
        onConfirm({ date: "", entryType: null, won: null });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto", padding: "20px 20px 32px" }}>
        <div className="modal-close" onClick={onClose}>✕</div>
        <div style={{ margin: "0 auto 20px" }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", marginBottom: 20, textAlign: "center"}}>날짜 선택</div>

        {/* 달력 */}
        <div style={{ background: "#f0f2f7", borderRadius: 12, padding: "12px 10px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div onClick={goPrevMonth} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: "#e8ebf2", fontSize: 16, color: "#1e2a3a" }}>‹</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e2a3a" }}>{calYear}년 {MONTHS[calMonth]}</div>
            <div onClick={goNextMonth} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: "#e8ebf2", fontSize: 16, color: "#1e2a3a" }}>›</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0", marginBottom: 4 }}>
            {WEEK_LABELS.map((d, i) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: i===0?"#ef4444":i===6?"#4a8ef5":"#9ca3af", padding: "3px 0" }}>{d}</div>
            ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
            {cells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} />;
                const cellDate = fmtDate(new Date(calYear, calMonth, day));
                const isSelected = selectedDate === cellDate;
                const dowIdx = idx % 7;
                return (
                <div key={day} onClick={() => handleSelectDay(day)}
                    style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8,
                        background: isSelected ? "#4a8ef5" : "transparent" }}>
                    <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 400,
                        color: isSelected ? "#fff" : dowIdx===0 ? "#ef4444" : dowIdx===6 ? "#4a8ef5" : "#1e2a3a" }}>{day}</span>
                </div>
                );
            })}
            </div>
        </div>

        {/* 선택된 날짜 표시 */}
        <div style={{ fontSize: 13, color: selectedDate ? "#4a8ef5" : "#9ca3af", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
            {selectedDate || "날짜를 선택하세요"}
        </div>

        {/* 구분 선택 */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>구분</div>
        <div style={{ display: "flex", gap: 8, marginBottom: (entryType === "추첨" || entryType === "선착순") ? 16 : 20 }}>
            {ENTRY_TYPE_OPTIONS.map(opt => (
                <div
                    key={opt.label}
                    className={entryTypeOptionClassName(opt.id, entryType === opt.id)}
                    onClick={() => handleSelectEntryType(opt.id)}
                >
                    {opt.label}
                </div>
            ))}
        </div>

        {/* 당첨여부 선택 (추첨/선착순일 때만) */}
        {(entryType === "추첨" || entryType === "선착순") && (
            <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>당첨여부</div>
            <div style={{ display: "flex", gap: 8 }}>
                <div onClick={() => setWon(true)}
                style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: won === true ? "#eaf6ec" : "#fff", color: won === true ? "#2e9e4f" : "#9ca3af",
                    border: won === true ? "1px solid #b7e4c0" : "1px dashed #d8dce8" }}>
                O 당첨
                </div>
                <div onClick={() => setWon(false)}
                style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: won === false ? "#fdecec" : "#fff", color: won === false ? "#d9463f" : "#9ca3af",
                    border: won === false ? "1px solid #f5c2bf" : "1px dashed #d8dce8" }}>
                X 낙첨
                </div>
            </div>
            </div>
        )}

        {/* 액션 버튼 */}
        <div style={{ display: "flex", gap: 8 }}>
            {(initialDate || initialEntryType) && (
            <div onClick={handleClear} style={{ flex: 1, padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "#f0f2f7", color: "#9ca3af" }}>
                초기화
            </div>
            )}
            <div onClick={handleConfirm}
            style={{ flex: 2, padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 16, fontWeight: 700, cursor: selectedDate ? "pointer" : "not-allowed",
                background: selectedDate ? "#4a8ef5" : "#e5e7eb", color: selectedDate ? "#fff" : "#9ca3af" }}>
            완료
            </div>
        </div>
        </div>
    </div>
    );
}

export default DateEntryModal;