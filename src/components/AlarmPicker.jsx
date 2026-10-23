function AlarmPicker({ localCard, handleChange, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 300 }}>
        <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "20px 24px 40px" }}
        >
            <div className="modal-close" onClick={onClose}>✕</div>
            <div style={{ margin: "0 auto 20px" }} />
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", marginBottom: 6 }}>카드 알림 설정</div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>
            {localCard.todo_name || "(제목 없음)"}
            </div>
    
            {/* 알림 ON/OFF */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1e2a3a" }}>알림 사용</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>지정 날짜·시간에 알림을 받아요</div>
            </div>
            <div
                onClick={() => handleChange("todo_noti", !localCard.todo_noti)}
                style={{
                width: 50, height: 28, borderRadius: 14, cursor: "pointer",
                background: localCard.todo_noti ? "#4a8ef5" : "#e5e7eb",
                position: "relative", transition: "background 0.2s",
                }}
            >
                <div
                style={{
                    position: "absolute", top: 3, left: localCard.todo_noti ? 24 : 3,
                    width: 22, height: 22, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                }}
                />
            </div>
            </div>
    
            {localCard.todo_noti && (
            <>
                <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>알림 날짜</div>
                <input
                    type="date"
                    value={localCard.noti_date || ""}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => handleChange("noti_date", e.target.value)}
                    style={{
                    width: "100%", border: "1.5px solid #dde1ea", borderRadius: 12,
                    padding: "12px 16px", fontSize: 16, fontFamily: "inherit",
                    outline: "none", color: "#1e2a3a",
                    }}
                />
                </div>
    
                <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>알림 시간</div>
                <input
                    type="time"
                    value={localCard.noti_time?.slice(0, 5) || ""}
                    onChange={(e) => handleChange("noti_time", e.target.value)}
                    style={{
                    width: "100%", border: "1.5px solid #dde1ea", borderRadius: 12,
                    padding: "12px 16px", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                    outline: "none", color: "#1e2a3a", textAlign: "center",
                    }}
                />
                </div>
    
                <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
                    알림 메시지 <span style={{ fontWeight: 400, color: "#c4c9d4" }}>(선택)</span>
                </div>
                <textarea
                    value={localCard.noti_note || ""}
                    onChange={(e) => handleChange("noti_note", e.target.value)}
                    placeholder="알림에 표시할 메시지를 입력하세요"
                    rows={3}
                    style={{
                    width: "100%", border: "1.5px solid #dde1ea", borderRadius: 12,
                    padding: "12px 16px", fontSize: 14, fontFamily: "inherit",
                    outline: "none", color: "#1e2a3a", resize: "none",
                    lineHeight: 1.6, boxSizing: "border-box",
                    }}
                />
                </div>
    
                {localCard.noti_date && (
                <div style={{ background: "#eef3ff", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>알림 미리보기</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e2a3a", marginBottom: 4 }}>
                    {localCard.todo_name || "(제목 없음)"}
                    </div>
                    <div style={{ fontSize: 13, color: "#4a8ef5" }}>
                    {localCard.noti_note?.trim() || "카드를 확인해보세요"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                    🔔 {localCard.noti_date} {localCard.noti_time?.slice(0, 5)}
                    </div>
                </div>
                )}
            </>
            )}
    
            <div
            onClick={() => {
                if (localCard.todo_noti && !localCard.noti_date) return;
                onClose();
            }}
            style={{
                width: "100%", padding: "14px 0", borderRadius: 14, textAlign: "center",
                fontSize: 16, fontWeight: 700,
                cursor: localCard.todo_noti && !localCard.noti_date ? "not-allowed" : "pointer",
                background: localCard.todo_noti && !localCard.noti_date ? "#e5e7eb" : "#4a8ef5",
                color: localCard.todo_noti && !localCard.noti_date ? "#9ca3af" : "#fff",
            }}
            >
            확인
            </div>
        </div>
        </div>
    );
    }
    
    export default AlarmPicker;