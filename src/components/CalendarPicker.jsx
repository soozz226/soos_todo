// src/components/CalendarPicker.jsx
// 공용 달력 본체 (월 이동 / 오늘로 이동 / 요일 / 날짜 칸 / 연월 선택)
// 팝업 틀과 "날짜를 누른 뒤 동작"은 사용하는 쪽에서 정함
// props
//  - initialDate : 처음 보여줄 달을 정하는 Date (없으면 오늘)
//  - selected    : 선택된 날짜 "yyyy-mm-dd" (없으면 "")
//  - onSelect(date: Date) : 날짜를 눌렀을 때 / "오늘로 이동"을 눌렀을 때 호출
//  - dotMap      : (선택) { "yyyy-mm-dd": { total, done } } 있으면 날짜 아래 점 표시
//  - bordered    : (선택) 테두리 박스 여부, 기본 true
import { useState } from "react";
import { createPortal } from "react-dom";
import { fmtDate, buildWeeks } from "../utils/dateUtils";
import { WEEK_LABELS } from "../constants/entryTypes";
import YearMonthPickerModal from "./YearMonthPickerModal";

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
                <div style={{ position: "relative", zIndex: 300 }}>
                    <YearMonthPickerModal
                        initialYear={viewYear}
                        initialMonth={viewMonth}
                        onClose={() => setYmOpen(false)}
                        onConfirm={(y, m) => { setViewYear(y); setViewMonth(m); }}
                    />
                </div>,
                document.body
            )}
        </>
    );
}

export default CalendarPicker;