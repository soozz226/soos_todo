import { useState } from "react";
import { createPortal } from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { icons } from "lucide-react";
import tags from "lucide-static/tags.json";
import CATEGORY_DATA from "../../constants/lucideCategories.json";

/* ════════════════════════════════════════
  ① 탭 설정 — 순서와 한글 이름만 바꾸면 돼요
  id = lucide 공식 카테고리 이름
   ════════════════════════════════════════ */
const TABS = [
  ["finance", "금융"],
  ["food-beverage", "식음료"],
  ["shopping", "쇼핑"],
  ["transportation", "교통"],
  ["home", "주거"],
  ["medical", "의료"],
  ["travel", "여행"],
  ["sports", "스포츠"],
  ["gaming", "게임"],
  ["multimedia", "멀티미디어"],
  ["photography", "사진"],
  ["social", "소셜"],
  ["communication", "커뮤니케이션"],
  ["mail", "메일"],
  ["notifications", "알림"],
  ["people", "사람"],
  ["account", "계정·접근"],
  ["animals", "동물"],
  ["nature", "자연"],
  ["weather", "날씨"],
  ["seasons", "계절"],
  ["buildings", "건물"],
  ["science", "과학"],
  ["math", "수학"],
  ["development", "개발·코딩"],
  ["devices", "기기"],
  ["connectivity", "연결"],
  ["charts", "차트"],
  ["files", "파일"],
  ["design", "디자인"],
  ["tools", "도구"],
  ["time", "시간·달력"],
  ["security", "보안"],
  ["emoji", "이모지"],
  ["shapes", "도형"],
  ["sustainability", "지속가능성"],
  ["arrows", "화살표"],
  ["layout", "레이아웃"],
  ["text", "텍스트"],
  ["cursors", "커서"],
  ["accessibility", "접근성"],
];

/* ════════════════════════════════════════
   ② 검색·목록 만들기 — 건드릴 필요 없음
   ════════════════════════════════════════ */
const norm = (s) => s.toLowerCase().replace(/[\s_-]/g, "");
const pascal = (k) => k.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");

const CATS = TABS.map(([id, label]) => ({
  id,
  label,
  list: (CATEGORY_DATA[id] || []).filter((n) => icons[n]).map((n) => ({ name: n, Cmp: icons[n] })),
}));

// 검색 인덱스: 이름 + 태그(단어 단위)
const INDEX = Object.entries(tags)
  .map(([kebab, tagList]) => ({
    name: pascal(kebab),
    kebab,
    words: tagList.flatMap((t) => t.toLowerCase().split(/[\s-]+/)),
  }))
  .filter((e) => icons[e.name]);

function search(q, limit = 150) {
  const key = q.trim().toLowerCase();
  if (!key) return [];
  const flat = norm(key);
  const byName = [];
  const byTag = [];
  for (const e of INDEX) {
    if (norm(e.kebab).includes(flat)) byName.push(e);
    else if (e.words.includes(key)) byTag.push(e);
  }
  return [...byName, ...byTag].slice(0, limit).map((e) => ({ name: e.name, Cmp: icons[e.name] }));
}

/* ════════════════════════════════════════
   ③ 화면 — 건드릴 필요 없음
   ════════════════════════════════════════ */
export default function IconPickerModal({ selected, onSelect, onClose }) {
  const [cat, setCat] = useState(CATS[0].id);
  const [q, setQ] = useState("");
  const current = CATS.find((c) => c.id === cat) ?? CATS[0];

  const searching = q.trim().length > 0;
  const list = searching ? search(q) : current.list;

  const pick = (ic) => {
    // SVG 소스 문자열로 변환해서 넘김 (stroke="currentColor" 라서 CSS 색상을 따라감)
    const svg = renderToStaticMarkup(<ic.Cmp size={24} strokeWidth={2} />);
    onSelect(svg, ic.name);
  };

  return createPortal(
    <div className="acct-sheet-dim" onClick={onClose}>
      <div className="acct-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="acct-sheet-head">
          <span>아이콘 선택</span>
          <button type="button" className="acct-sheet-x" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="acct-sheet-search">
          <input
            type="text"
            placeholder="아이콘 검색 (영문, 예: wallet)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="acct-sheet-cats">
          {CATS.map((c) => (
            <div
              key={c.id}
              className={`acct-sheet-cat ${!searching && cat === c.id ? "active" : ""}`}
              onClick={() => { setQ(""); setCat(c.id); }}
            >
              {c.label}
            </div>
          ))}
        </div>

        <div className="acct-sheet-grid">
          {list.length === 0 && <div className="acct-sheet-empty">검색 결과가 없어요</div>}
          {list.map((ic) => (
            <div
              key={ic.name}
              className={`acct-sheet-ic ${selected === ic.name ? "active" : ""}`}
              title={ic.name}
              onClick={() => pick(ic)}
            >
              <ic.Cmp size={26} strokeWidth={1.75} />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}