// src/components/CalendarPicker.jsx
// 공용 달력 + 연/월 선택 팝업 (한 파일에 두 컴포넌트)
//  - CalendarPicker(기본 export) : 월 이동 / 오늘로 이동 / 요일 / 날짜 칸 / 연월 선택
//      팝업 틀과 "날짜를 누른 뒤 동작"은 사용하는 쪽에서 정함
//      props
//       - initialDate : 처음 보여줄 달을 정하는 Date (없으면 오늘)
//       - selected    : 선택된 날짜 "yyyy-mm-dd" (없으면 "")
//       - onSelect(date: Date) : 날짜를 눌렀을 때 / "오늘로 이동"을 눌렀을 때 호출
//       - dotMap      : (선택) { "yyyy-mm-dd": { total, done } } 있으면 날짜 아래 점 표시
//       - bordered    : (선택) 테두리 박스 여부, 기본 false
//  - YearMonthPickerModal(이름 있는 export) : 연/월을 고르는 바텀시트
//      AccountBook, AcctDayModal 에서도 따로 불러 씀
import { useState } from "react";
import { createPortal } from "react-dom";
import { fmtDate, buildWeeks } from "../utils/dateUtils";
import { WEEK_LABELS, MONTHS } from "../constants/entryTypes";

/* ────────────────── 연/월 선택 ────────────────── */
export function YearMonthPickerModal({ initialYear, initialMonth, onClose, onConfirm }) {
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);

    const goPrevYear = () => setYear(y => y - 1);
    const goNextYear = () => setYear(y => y + 1);

    const today = new Date();
    const isTodaySelected = year === today.getFullYear() && month === today.getMonth();

    const goToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    };

    const handleConfirm = () => {
        onConfirm(year, month);
        onClose();
    };

    return (
        // 팝업 안에서 열려도 다른 시트(zIndex 200)보다 위에 보이도록 바깥 래퍼에서 zIndex 300 부여
        <div style={{ position: "relative", zIndex: 300 }}>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
                <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: "20px 20px 32px" }}>
                    <div className="modal-close" onClick={onClose}>✕</div>
                    <div style={{ margin: "0 auto 10px" }} />

                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a", marginBottom: 20, textAlign: "left" }}>
                        연/월 선택
                    </div>

                    {/* 연도 선택 */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 10 }}>
                        <div onClick={goPrevYear} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: "#f0f2f7", fontSize: 16, color: "#1e2a3a" }}>‹</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e2a3a", minWidth: 60, textAlign: "center" }}>{year}년</div>
                        <div onClick={goNextYear} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: "#f0f2f7", fontSize: 16, color: "#1e2a3a" }}>›</div>
                    </div>

                    {/* 오늘로 이동 - 전체너비 버튼 */}
                    {!isTodaySelected && (
                        <div
                            onClick={goToday}
                            style={{
                                textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280",
                                padding: "8px 0", borderTop: "0.5px solid #eef0f4", marginBottom: 10,
                                cursor: "pointer",
                            }}
                        >
                            오늘로 이동
                        </div>
                    )}
                    {isTodaySelected && <div style={{ marginBottom: 20 }} />}

                    {/* 월 선택 (4x3 그리드) */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
                        {MONTHS.map((label, idx) => (
                            <div
                                key={idx}
                                onClick={() => setMonth(idx)}
                                style={{
                                    textAlign: "center", padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                                    background: month === idx ? "#eef3ff" : "#f0f2f7",
                                    color: month === idx ? "#4a8ef5" : "#6b7280",
                                    border: month === idx ? "1.5px solid #4a8ef5" : "1.5px solid transparent",
                                    boxSizing: "border-box",
                                    transition: "all 0.15s",
                                }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    <div onClick={handleConfirm}
                        style={{ width: "100%", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 16, fontWeight: 700, cursor: "pointer",
                        background: "#4a8ef5", color: "#fff" }}>
                        확인
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ────────────────── 공용 달력 ────────────────── */
function CalendarPicker({ initialDate, selected = "", onSelect, dotMap, bordered = false }) {
    const base = initialDate || new Date();
    const [viewYear, setViewYear] = useState(base.getFullYear());
    const [viewMonth, setViewMonth] = useState(base.getMonth());
    const [ymOpen, setYmOpen] = useState(false);

    const todayStr = fmtDate(new Date());
    const weeks = buildWeeks(viewYear, viewMonth);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };

    // 이전/다음 달의 연한 날짜를 누르면 그 달로 같이 이동
    const handleDay = (day) => {
        if (day.getMonth() !== viewMonth) {
            setViewYear(day.getFullYear());
            setViewMonth(day.getMonth());
        }
        onSelect(day);
    };

    const goToday = () => {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        onSelect(now);
    };

    return (
        <>
            <div
                style={bordered
                    ? { border: "1.5px solid #dde1ea", borderRadius: 14, padding: "0 4px 4px", margin: "8px 8px 0" }
                    : undefined}
            >
                <div className="acct-cal-head">
                    <div className="acct-cal-nav" onClick={prevMonth}>‹</div>
                    <div className="acct-cal-title" onClick={() => setYmOpen(true)}>{viewYear}년 {viewMonth + 1}월</div>
                    <div className="acct-cal-nav" onClick={nextMonth}>›</div>
                </div>

                <div
                    onClick={goToday}
                    style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#4a8ef5", padding: "0 0 8px", cursor: "pointer" }}
                >
                    오늘로 이동
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
                            const dot = dotMap && dotMap[ds];
                            const cls = [
                                "acct-cal-day",
                                day.getMonth() !== viewMonth ? "out" : "",
                                di === 0 ? "sun" : di === 6 ? "sat" : "",
                                ds === todayStr ? "today" : "",
                                ds === selected ? "selected" : "",
                            ].join(" ");
                            return (
                                <div key={di} className={cls} onClick={() => handleDay(day)}>
                                    <span>{day.getDate()}</span>
                                    {dot && ds !== selected && <div className={`acct-cal-dot${dot.done === dot.total ? " done" : ""}`} />}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* 연/월 선택: body 로 따로 그려서 팝업 안에서도 잘리거나 같이 닫히지 않게 함 */}
            {ymOpen && createPortal(
                <YearMonthPickerModal
                    initialYear={viewYear}
                    initialMonth={viewMonth}
                    onClose={() => setYmOpen(false)}
                    onConfirm={(y, m) => { setViewYear(y); setViewMonth(m); }}
                />,
                document.body
            )}
        </>
    );
}

export default CalendarPicker;