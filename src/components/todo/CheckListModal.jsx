
import { useState } from "react";
import { fmtDate, parseDate } from "../../utils/dateUtils";
import CalendarPicker from "../CalendarPicker";
import { ENTRY_TYPE_OPTIONS, entryTypeOptionClassName } from "../../constants/entryTypes";

// 카드 디테일화면 체크리스트 일자선택 상세팝업(날짜,구분)
function CheckListModal({ initialDate, initialEntryType, initialWon, onClose, onConfirm }) {
    const [selectedDate, setSelectedDate] = useState(initialDate || "");
    const [entryType, setEntryType] = useState(initialEntryType || null);
    const [won, setWon] = useState(initialWon ?? null);

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
        <div className="acct-cal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
        <div className="acct-cal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>

            {/* 달력 */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", margin: "12px 12px 0" }}># 날짜</div>
            <CalendarPicker
                initialDate={initialDate ? parseDate(initialDate) : undefined}
                selected={selectedDate}
                onSelect={(day) => setSelectedDate(fmtDate(day))}
                bordered
            />

            <div style={{ padding: "16px 12px 8px" }}>

                {/* 구분 선택 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}># 구분</div>
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
        </div>
    );
}

export default CheckListModal;