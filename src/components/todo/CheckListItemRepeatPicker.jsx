// src/components/CheckListItemRepeatPicker.jsx
import { useState, useMemo } from "react";
import { fmtDate, parseDate, expandRepeat } from "../../utils/dateUtils";
import { ENTRY_TYPE_OPTIONS, entryTypeOptionClassName } from "../../constants/entryTypes";
import AlarmRepeatPicker from "./AlarmRepeatPicker";

function CheckListItemRepeatPicker({ onClose, onConfirm }) {
const [repeatName, setRepeatName] = useState("");
const [startDate, setStartDate] = useState(fmtDate(new Date()));
const [endDate, setEndDate] = useState("");
const [repeatType, setRepeatType] = useState("day");
const [interval, setInterval] = useState(1);
const [weekDays, setWeekDays] = useState([]);
const [entryType, setEntryType] = useState(null);

const toggleWeekDay = (idx) => {
setWeekDays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]));
};

/* ── 미리보기 날짜 계산 (시작일 기준) ── */
const previewDates = useMemo(() => {
if (!startDate || !endDate) return [];
return expandRepeat({
    type: repeatType,
    start: parseDate(startDate),
    end: parseDate(endDate),
    interval,
    weekDays,
}).map(fmtDate);
}, [startDate, endDate, repeatType, interval, weekDays]);

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

        <AlarmRepeatPicker
            options={["day", "week", "month", "year"]}
            type={repeatType}
            interval={interval}
            weekDays={weekDays}
            startDate={startDate}
            onType={(id) => { setRepeatType(id); setInterval(1); setWeekDays([]); }}
            onInterval={setInterval}
            onToggleDay={toggleWeekDay}
        />

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

export default CheckListItemRepeatPicker;