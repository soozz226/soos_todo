// 카드 구분값있는 내역 체크 시 결과 팝업
function WinCheckModal({ item, onClose, onConfirm }) {
    return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 250 }}>
    <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: "20px 20px 36px" }}>
        <div className="modal-close" onClick={onClose}>✕</div>
        <div style={{ margin: "0 auto 20px" }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", textAlign: "center", marginBottom: 6 }}>
        {item.entryType} 결과가 어떻게 되셨나요?
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 20 }}>
        {item.title || "(제목 없음)"}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div
            onClick={() => onConfirm(true)}
            style={{ flex: 1, textAlign: "center", padding: "14px 0", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", background: "#eaf6ec", color: "#2e9e4f", border: "1px solid #b7e4c0" }}
        >
            O 당첨
        </div>
        <div
            onClick={() => onConfirm(false)}
            style={{ flex: 1, textAlign: "center", padding: "14px 0", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", background: "#fdecec", color: "#d9463f", border: "1px solid #f5c2bf" }}
        >
            X 낙첨
        </div>
        </div>
        <div onClick={() => onConfirm(null)} style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", cursor: "pointer", padding: "6px 0" }}>
        나중에 선택할게요
        </div>
    </div>
    </div>
);
}

export default WinCheckModal;