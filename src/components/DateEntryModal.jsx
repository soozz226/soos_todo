// src/components/DateEntryModal.jsx
import { useState } from "react";
import { fmtDate, buildWeeks } from "../utils/dateUtils";
import YearMonthPickerModal from "./YearMonthPickerModal";
import { ENTRY_TYPE_OPTIONS, WEEK_LABELS, entryTypeOptionClassName } from "../constants/entryTypes";

function DateEntryModal({ initialDate, initialEntryType, initialWon, onClose, onConfirm }) {
    const baseDate = initialDate ? new Date(initialDate) : new Date();
    const [calYear, setCalYear] = useState(baseDate.getFullYear());
    const [calMonth, setCalMonth] = useState(baseDate.getMonth());
    const [selectedDate, setSelectedDate] = useState(initialDate || "");
    const [entryType, setEntryType] = useState(initialEntryType || null);
    const [won, setWon] = useState(initialWon ?? null);
    const [ymOpen, setYmOpen] = useState(false);

    const todayStr = fmtDate(new Date());
    const weeks = buildWeeks(calYear, calMonth);

    const goPrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
    const goNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

    // 오늘이 있는 달로 이동하면서 오늘 날짜를 선택
    const goToday = () => {
        const now = new Date();
        setCalYear(now.getFullYear());
        setCalMonth(now.getMonth());
        setSelectedDate(fmtDate(now));
    };

    // 이전/다음 달의 연한 날짜를 눌렀으면 그 달로 같이 이동
    const handleSelectDay = (day) => {
        setSelectedDate(fmtDate(day));
        if (day.getMonth() !== calMonth) {
            setCalYear(day.getFullYear());
            setCalMonth(day.getMonth());
        }
    };

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
        <>
        <div className="acct-cal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
        <div className="acct-cal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>

            {/* 달력 */}
            <div className="acct-cal-head">
                <div className="acct-cal-nav" onClick={goPrevMonth}>‹</div>
                <div className="acct-cal-title" onClick={() => setYmOpen(true)}>{calYear}년 {calMonth + 1}월</div>
                <div className="acct-cal-nav" onClick={goNextMonth}>›</div>
            </div>

            <div className="acct-cal-week">
                {WEEK_LABELS.map((d, i) => (
                    <div key={d} className={`acct-cal-wd ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{d}</div>
                ))}
            </div>

            {weeks.map((week, wi) => (
                <div key={wi} className="acct-cal-row">
                    {week.map((day, di) => {
                        const ds = fmtDate(day);
                        const cls = [
                            "acct-cal-day",
                            day.getMonth() !== calMonth ? "out" : "",
                            di === 0 ? "sun" : di === 6 ? "sat" : "",
                            ds === todayStr ? "today" : "",
                            ds === selectedDate ? "selected" : "",
                        ].join(" ");
                        return (
                            <div key={di} className={cls} onClick={() => handleSelectDay(day)}>
                                <span>{day.getDate()}</span>
                            </div>
                        );
                    })}
                </div>
            ))}

            <div className="acct-cal-foot">
                <div className="acct-cal-today-btn" onClick={goToday}>오늘로 이동</div>
                <div className="acct-cal-close-btn" onClick={onClose}>닫기</div>
            </div>

            <div style={{ padding: "16px 12px 8px" }}>
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
        </div>

        {/* 연/월 선택 (달력 오버레이 밖에 둬야 눌러도 날짜 팝업이 같이 닫히지 않아요) */}
        {ymOpen && (
            <div style={{ position: "relative", zIndex: 300 }}>
                <YearMonthPickerModal
                    initialYear={calYear}
                    initialMonth={calMonth}
                    onClose={() => setYmOpen(false)}
                    onConfirm={(y, m) => { setCalYear(y); setCalMonth(m); }}
                />
            </div>
        )}
        </>
    );
}

export default DateEntryModal;