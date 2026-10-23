// src/components/FloatingAddButton.jsx
// 오른쪽 아래 + 버튼 — CardList / AccountBook 공통
// 색·크기·그림자는 QuickNav.jsx(왼쪽 바로가기 버튼)와 반드시 같게 유지
import { Plus } from "lucide-react";

const COLOR = "#4a8ef5";                          // 파란색
const SHADOW = "0 4px 12px rgba(74,142,245,0.4)"; // 파란 그림자

function FloatingAddButton({ onClick, bottom = 24 }) {
  return (
    <div
      onClick={onClick}
      aria-label="추가"
      style={{
        position: "fixed", right: 24, bottom, width: 56, height: 56, borderRadius: "50%",
        background: COLOR, color: "#fff", display: "flex",
        alignItems: "center", justifyContent: "center", cursor: "pointer",
        boxShadow: SHADOW, zIndex: 10,
      }}
    >
      <Plus size={24} strokeWidth={2.2} />
    </div>
  );
}

export default FloatingAddButton;