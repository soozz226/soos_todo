// src/components/YearMonthPickerModal.jsx
import { useState } from "react";

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

function YearMonthPickerModal({ initialYear, initialMonth, onClose, onConfirm }) {
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
    );
}

export default YearMonthPickerModal;