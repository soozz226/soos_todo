// src/components/RepeatItemModal.jsx
import { useState, useMemo } from "react";
import { fmtDate, parseDate } from "../../utils/dateUtils";
import { ENTRY_TYPE_OPTIONS, MONTHS, WEEK_LABELS, entryTypeOptionClassName } from "../../constants/entryTypes";

const REPEAT_TYPES = [
{ id: "day", label: "매일" },
{ id: "week", label: "매주" },
{ id: "month", label: "매월" },
{ id: "year", label: "매년" },
];

function RepeatItemModal({ onClose, onConfirm }) {
const [repeatName, setRepeatName] = useState("");
const [startDate, setStartDate] = useState(fmtDate(new Date()));
const [endDate, setEndDate] = useState("");
const [repeatType, setRepeatType] = useState("day");
const [interval, setInterval] = useState(1);
const [weekDays, setWeekDays] = useState([]);
const [monthDay, setMonthDay] = useState(null);
const [yearDate, setYearDate] = useState(null);
const [yearCalMonth, setYearCalMonth] = useState(new Date().getMonth());
const [entryType, setEntryType] = useState(null);

const toggleWeekDay = (idx) => {
setWeekDays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]));
};

const goPrevYearMonth = () => setYearCalMonth((m) => (m === 0 ? 11 : m - 1));
const goNextYearMonth = () => setYearCalMonth((m) => (m === 11 ? 0 : m + 1));

const renderYearCal = () => {
const refYear = startDate ? parseDate(startDate).getFullYear() : new Date().getFullYear();
const firstDay = new Date(refYear, yearCalMonth, 1).getDay();
const daysInMonth = new Date(refYear, yearCalMonth + 1, 0).getDate();
const cells = [];
for (let i = 0; i < firstDay; i++) cells.push(null);
for (let d = 1; d <= daysInMonth; d++) cells.push(d);

return (
    <div style={{ background: "#f0f2f7", borderRadius: 12, padding: "12px 10px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div onClick={goPrevYearMonth} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: "#e8ebf2", fontSize: 16, color: "#1e2a3a" }}>‹</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e2a3a" }}>{MONTHS[yearCalMonth]}</div>
        <div onClick={goNextYearMonth} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: "#e8ebf2", fontSize: 16, color: "#1e2a3a" }}>›</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0", marginBottom: 4 }}>
        {WEEK_LABELS.map((d, i) => (
        <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: i === 0 ? "#ef4444" : i === 6 ? "#4a8ef5" : "#9ca3af", padding: "3px 0" }}>{d}</div>
        ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
        {cells.map((day, idx) => {
        if (!day) return <div key={`e-${idx}`} />;
        const isSelected = yearDate === day;
        const dowIdx = idx % 7;
        return (
            <div
            key={day}
            onClick={() => setYearDate(day)}
            style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 8, background: isSelected ? "#4a8ef5" : "transparent" }}
            >
            <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 400, color: isSelected ? "#fff" : dowIdx === 0 ? "#ef4444" : dowIdx === 6 ? "#4a8ef5" : "#1e2a3a" }}>
                {day}
            </span>
            </div>
        );
        })}
    </div>
    </div>
);
};

/* ── 미리보기 날짜 계산 ── */
const previewDates = useMemo(() => {
if (!startDate || !endDate) return [];
const start = parseDate(startDate);
const end = parseDate(endDate);
if (start > end) return [];

const result = [];
const msPerDay = 24 * 60 * 60 * 1000;

if (repeatType === "day") {
    let cur = new Date(start);
    while (cur <= end) {
    result.push(fmtDate(cur));
    cur = new Date(cur.getTime() + interval * msPerDay);
    }
}

if (repeatType === "week") {
    if (weekDays.length === 0) return [];
    // 시작일이 속한 주의 일요일
    const startOfWeek = new Date(start);
    startOfWeek.setDate(start.getDate() - start.getDay());

    let cur = new Date(start);
    while (cur <= end) {
    if (weekDays.includes(cur.getDay())) {
        const weekIndex = Math.floor((cur - startOfWeek) / (7 * msPerDay));
        if (weekIndex % interval === 0) {
        result.push(fmtDate(cur));
        }
    }
    cur = new Date(cur.getTime() + msPerDay);
    }
}

if (repeatType === "month") {
    if (!monthDay) return [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    let count = 0;
    while (cur <= end) {
    const lastDay = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    const day = Math.min(monthDay, lastDay);
    const target = new Date(cur.getFullYear(), cur.getMonth(), day);
    if (target >= start && target <= end) {
        result.push(fmtDate(target));
    }
    cur = new Date(cur.getFullYear(), cur.getMonth() + interval, 1);
    count++;
    if (count > 500) break; // 안전장치
    }
}

if (repeatType === "year") {
    if (!yearDate) return [];
    let year = start.getFullYear();
    let count = 0;
    while (true) {
    const target = new Date(year, yearCalMonth, yearDate);
    if (target > end) break;
    if (target >= start) result.push(fmtDate(target));
    year += interval;
    count++;
    if (count > 100) break; // 안전장치
    }
}

return result;
}, [startDate, endDate, repeatType, interval, weekDays, monthDay, yearDate, yearCalMonth]);

const canConfirm = repeatName.trim() && previewDates.length > 0;

const handleConfirm = () => {
if (!canConfirm) return;
onConfirm({ name: repeatName.trim(), dates: previewDates, entryType });
onClose();
};

return (
<div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
    <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto", padding: "20px 20px 40px" }}>
    <div className="modal-close" onClick={onClose}>✕</div>
        <div style={{ margin: "0 auto 20px" }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", marginBottom: 20, textAlign: "center" }}>↻ 반복 아이템 생성</div>

        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>반복명</div>
            <input
            value={repeatName}
            onChange={(e) => setRepeatName(e.target.value)}
            placeholder="예: 운동, 미팅, 약 먹기"
            style={{ width: "100%", border: "1.5px solid #dde1ea", borderRadius: 10, padding: "10px 14px", fontSize: 15, fontFamily: "inherit", outline: "none", color: "#1e2a3a" }}
            />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>시작일</div>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                style={{ width: "100%", border: "1.5px solid #dde1ea", borderRadius: 10, padding: "10px 10px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#1e2a3a" }} />
            </div>
            <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>종료일</div>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate}
                style={{ width: "100%", border: "1.5px solid #dde1ea", borderRadius: 10, padding: "10px 10px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#1e2a3a" }} />
            </div>
        </div>

        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>반복 주기</div>
            <div style={{ display: "flex", gap: 8 }}>
            {REPEAT_TYPES.map((t) => (
                <div key={t.id} onClick={() => { setRepeatType(t.id); setInterval(1); setWeekDays([]); }}
                style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer",
                    background: repeatType === t.id ? "#4a8ef5" : "#f0f2f7",
                    color: repeatType === t.id ? "#fff" : "#6b7280",
                    transition: "all 0.15s" }}>
                {t.label}
                </div>
            ))}
            </div>
        </div>

        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
            {repeatType === "day" ? "일" : repeatType === "week" ? "주" : repeatType === "month" ? "월" : "년"}마다 반복
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" min="1" max="99" value={interval} onChange={(e) => setInterval(Math.max(1, Number(e.target.value)))}
                style={{ width: 72, border: "1.5px solid #dde1ea", borderRadius: 10, padding: "10px 12px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", outline: "none", color: "#1e2a3a", textAlign: "center" }} />
            <span style={{ fontSize: 15, color: "#6b7280" }}>
                {repeatType === "day" ? "일마다" : repeatType === "week" ? "주마다" : repeatType === "month" ? "월마다" : "년마다"}
            </span>
            </div>
        </div>

        {repeatType === "week" && (
            <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>요일 선택</div>
            <div style={{ display: "flex", gap: 6 }}>
                {WEEK_LABELS.map((lbl, idx) => (
                <div key={idx} onClick={() => toggleWeekDay(idx)}
                    style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
                    background: weekDays.includes(idx) ? (idx === 0 ? "#fef2f2" : idx === 6 ? "#eff6ff" : "#eef3ff") : "#f0f2f7",
                    color: weekDays.includes(idx) ? (idx === 0 ? "#ef4444" : idx === 6 ? "#4a8ef5" : "#1e2a3a") : "#9ca3af",
                    border: weekDays.includes(idx) ? `2px solid ${idx === 0 ? "#ef4444" : idx === 6 ? "#4a8ef5" : "#4a8ef5"}` : "2px solid transparent",
                    transition: "all 0.15s" }}>
                    {lbl}
                </div>
                ))}
            </div>
            </div>
        )}

        {repeatType === "month" && (
            <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>반복할 날짜 선택 (1~31일)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <div key={d} onClick={() => setMonthDay(d)}
                    style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: monthDay === d ? 700 : 400,
                    background: monthDay === d ? "#4a8ef5" : "#f0f2f7",
                    color: monthDay === d ? "#fff" : "#1e2a3a",
                    transition: "all 0.15s" }}>
                    {d}
                </div>
                ))}
            </div>
            </div>
        )}

        {repeatType === "year" && (
            <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>반복할 날짜 선택</div>
            {yearDate && (
                <div style={{ fontSize: 13, color: "#4a8ef5", fontWeight: 600, marginBottom: 4 }}>
                {String(yearCalMonth + 1).padStart(2, "0")}월 {yearDate}일
                </div>
            )}
            {renderYearCal()}
            </div>
        )}

        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>구분</div>
            <div style={{ display: "flex", gap: 8 }}>
            {ENTRY_TYPE_OPTIONS.map((opt) => (
                <div
                    key={opt.label}
                    className={entryTypeOptionClassName(opt.id, entryType === opt.id)}
                    onClick={() => setEntryType(opt.id)}
                >
                    {opt.label}
                </div>
            ))}
            </div>
        </div>

        <div style={{ background: "#f0f2f7", borderRadius: 12, padding: "12px 16px", marginBottom: 20, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!endDate ? (
            <span style={{ fontSize: 13, color: "#9ca3af" }}>종료일을 선택하면 개수를 확인할 수 있어요</span>
            ) : previewDates.length === 0 ? (
            <span style={{ fontSize: 13, color: "#9ca3af" }}>조건에 맞는 날짜가 없습니다</span>
            ) : (
            <span style={{ fontSize: 14, color: "#1e2a3a" }}>
                총 <span style={{ fontWeight: 700, color: "#4a8ef5", fontSize: 16 }}>{previewDates.length}</span>개 생성 예정
                <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 6 }}>({previewDates[0]} ~ {previewDates[previewDates.length - 1]})</span>
            </span>
            )}
        </div>

        <div onClick={handleConfirm}
            style={{ width: "100%", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 16, fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed",
            background: canConfirm ? "#4a8ef5" : "#e5e7eb",
            color: canConfirm ? "#fff" : "#9ca3af",
            transition: "all 0.2s" }}>
            ✓ 생성 확인 {previewDates.length > 0 ? `(${previewDates.length}개)` : ""}
        </div>
    </div>
</div>
);
}

export default RepeatItemModal;