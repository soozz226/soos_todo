// src/components/QuickNav.jsx
// 왼쪽 아래 바로가기 버튼 — CardList / ToDoList / AccountBook 공통
// 버튼 중심에서 12시 · 1시 반 · 3시 방향으로 메뉴 버튼이 펼쳐짐 (글자 없이 아이콘만)
// 현재 화면 버튼은 모서리에 작은 체크 배지가 붙음
// 색·크기·그림자는 FloatingAddButton.jsx(오른쪽 + 버튼)와 반드시 같게 유지
import { useState } from "react";
import { LayoutList, ListChecks, Wallet, LayoutGrid, X, Check } from "lucide-react";

const COLOR = "#4a8ef5";                          // 파란색
const SHADOW = "0 4px 12px rgba(74,142,245,0.4)"; // 파란 그림자

const MAIN = 56;   // 바로가기 버튼 크기
const MINI = 44;   // 메뉴 버튼 크기
const RADIUS = 76; // 버튼 중심에서 메뉴 버튼 중심까지 거리
const LEFT = 24;   // 화면 왼쪽 여백

// angle: 12시 방향이 0도, 시계 방향으로 증가 (0 = 12시, 45 = 1시 반, 90 = 3시)
const ITEMS = [
  { name: "cardlist", label: "카드 리스트", Icon: LayoutList, angle: 0 },
  { name: "todolist", label: "ToDo 리스트", Icon: ListChecks, angle: 45 },
  { name: "acctbook", label: "가계부", Icon: Wallet, angle: 90 },
];

// current: 지금 보고 있는 화면 이름, onNavigate(name): 이동 함수, bottom: 버튼 아래 여백(px)
function QuickNav({ current, onNavigate, bottom = 24 }) {
  const [open, setOpen] = useState(false);

  const go = (name) => {
    setOpen(false);
    if (name !== current && onNavigate) onNavigate(name);
  };

  // 메뉴 버튼은 항상 바로가기 버튼 뒤에 겹쳐 두고, 열릴 때 제 위치로 이동시킴
  const baseLeft = LEFT + MAIN / 2 - MINI / 2;
  const baseBottom = bottom + MAIN / 2 - MINI / 2;

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.25)" }}
        />
      )}

      {ITEMS.map(({ name, label, Icon, angle }, i) => {
        const rad = (angle * Math.PI) / 180;
        const dx = Math.sin(rad) * RADIUS;
        const dy = -Math.cos(rad) * RADIUS;
        const active = name === current;
        return (
          <div
            key={name}
            onClick={() => go(name)}
            title={label}
            aria-label={label}
            style={{
              position: "fixed", left: baseLeft, bottom: baseBottom,
              width: MINI, height: MINI, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: COLOR, color: "#fff",
              boxShadow: SHADOW, cursor: "pointer", zIndex: 41,
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transform: open ? `translate(${dx}px, ${dy}px) scale(1)` : "translate(0, 0) scale(0.5)",
              transition: `transform 0.22s ease-out ${open ? i * 0.03 : 0}s, opacity 0.18s ease-out`,
            }}
          >
            <Icon size={20} strokeWidth={2.2} />

            {/* 현재 화면 표시: 모서리 체크 배지 */}
            {active && (
              <span
                style={{
                  position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%",
                  background: "#fff", color: COLOR, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </div>
        );
      })}

      <div
        onClick={() => setOpen((v) => !v)}
        aria-label="바로가기"
        style={{
          position: "fixed", left: LEFT, bottom, width: MAIN, height: MAIN, borderRadius: "50%",
          background: COLOR, color: "#fff", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: SHADOW, zIndex: open ? 42 : 10,
        }}
      >
        {open ? <X size={24} strokeWidth={2.2} /> : <LayoutGrid size={24} strokeWidth={2.2} />}
      </div>
    </>
  );
}

export default QuickNav;