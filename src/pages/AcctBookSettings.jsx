// src/pages/AcctBookSettings.jsx
// 가계부 추가/삭제 패널 (acct_code 의 code_flag = 'Z') — AcctSettings 의 탭 안에 표시됨
import { useState, useEffect } from "react";
import { fetchAcctBookCodes, insertAcctBook, updateAcctType, deleteAcctBook, countAcctEntriesByBook } from "../api/acctApi";

const CODE_KEY = "code_cdid";
const NAME_KEY = "code_cdnm";
const BOOK_KEY = "acct_selected_book"; // AccountBook.jsx 에서 선택한 가계부를 저장하는 키와 같아야 함

// 선택할 수 있는 파스텔 배경색 — 바꾸고 싶으면 여기만 고치면 됨
const COLORS = ["#FCA5A5", "#FDBA74", "#FDE68A", "#BBF7D0", "#99F6E4", "#BAE6FD", "#C7D2FE", "#DDD6FE", "#FBCFE8"];
const ON_COLOR = "#374151"; // 파스텔 배경 위에 올라가는 글자색

// 색 고르는 한 줄 (새 가계부 / 기존 가계부 공용). "" = 색 없음
function ColorRow({ value, onPick }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 4px", flexBasis: "100%" }}>
      <div
        onClick={() => onPick("")}
        title="색 없음"
        style={{
          width: 24, height: 24, borderRadius: 8, boxSizing: "border-box",
          border: `2px ${value ? "dashed" : "solid"} currentColor`,
          opacity: value ? 0.4 : 1, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
        }}
      >
        ✕
      </div>
      {COLORS.map((c) => (
        <div
          key={c}
          onClick={() => onPick(c)}
          style={{
            width: 24, height: 24, borderRadius: 8, boxSizing: "border-box", background: c, cursor: "pointer",
            border: value === c ? "2px solid currentColor" : "2px solid transparent",
          }}
        />
      ))}
    </div>
  );
}

function AcctBookSettings() {
  const [books, setBooks] = useState([]);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");       // 새 가계부용 배경색
  const [palette, setPalette] = useState(null); // null | "new"(새 가계부) | 가계부 코드(기존 가계부 색 변경 중)
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAcctBookCodes()
      .then((data) => alive && setBooks(data))
      .catch((err) => console.error("가계부 불러오기 실패:", err));
    return () => { alive = false; };
  }, []);

  const add = async () => {
    const name = text.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const ordr = books.reduce((mx, b) => Math.max(mx, Number(b.code_ordr) || 0), 0) + 1;
      const row = await insertAcctBook({ name, ordr, color });
      setBooks((prev) => [...prev, row]);
      setText("");
      setColor("");
      setPalette(null);
    } catch (err) {
      console.error("가계부 추가 실패:", err);
      window.alert("가계부 추가에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  // 기존 가계부의 배경색 변경
  const changeColor = async (b, c) => {
    setPalette(null);
    try {
      const row = await updateAcctType(b.code_flag, b[CODE_KEY], { code_color: c || null });
      setBooks((prev) => prev.map((x) => (x[CODE_KEY] === b[CODE_KEY] ? { ...x, ...row } : x)));
    } catch (err) {
      console.error("색 변경 실패:", err);
      window.alert("색 변경에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const remove = async (b) => {
    if (books.length <= 1) {
      window.alert("가계부는 최소 하나가 필요해요.");
      return;
    }
    try {
      const cnt = await countAcctEntriesByBook(b[CODE_KEY]);
      if (cnt > 0) {
        window.alert(`"${b[NAME_KEY]}"에는 내역이 ${cnt}건 있어서 삭제할 수 없어요.`);
        return;
      }
      if (!window.confirm(`"${b[NAME_KEY]}" 가계부를 삭제할까요?`)) return;
      await deleteAcctBook(b[CODE_KEY]);
      setBooks((prev) => prev.filter((x) => x[CODE_KEY] !== b[CODE_KEY]));
      if (localStorage.getItem(BOOK_KEY) === b[CODE_KEY]) localStorage.removeItem(BOOK_KEY);
    } catch (err) {
      console.error("가계부 삭제 실패:", err);
      window.alert("가계부 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <div className="acct-pm-add" style={{ flexWrap: "wrap" }}>
        {/* 새 가계부 배경색 선택 버튼 */}
        <button
          type="button"
          className="acct-pm-iconbtn"
          onClick={() => setPalette(palette === "new" ? null : "new")}
          title="배경색 선택"
          style={color ? { background: color, borderColor: color, color: ON_COLOR } : undefined}
        >
          {color ? "" : "＋"}
        </button>
        <input
          className="acct-pm-input"
          type="text"
          placeholder="추가할 가계부 이름"
          maxLength={20}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <button className="acct-pm-addbtn" disabled={!text.trim() || busy} onClick={add}>추가</button>

        {/* 박스 안, 입력 줄 아래에 펼쳐지는 팔레트 */}
        {palette === "new" && <ColorRow value={color} onPick={(c) => { setColor(c); setPalette(null); }} />}
      </div>

      <div className="acct-pm-list">
        {books.length === 0 ? (
          <div className="acct-pm-empty">등록된 가계부가 없어요</div>
        ) : (
          books.map((b, i) => (
            <div key={b[CODE_KEY]}>
              <div className="acct-pm-item">
                {/* 번호 칸: 배경색이 칠해지고, 누르면 색 변경 */}
                <span
                  className="acct-pm-num"
                  onClick={() => setPalette(palette === b[CODE_KEY] ? null : b[CODE_KEY])}
                  title="배경색 변경"
                  style={{
                    cursor: "pointer",
                    ...(b.code_color && {
                      background: b.code_color, color: ON_COLOR, borderRadius: 8,
                      minWidth: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }),
                  }}
                >
                  {i + 1}
                </span>
                <span className="acct-pm-text">{b[NAME_KEY]}</span>
                <span className="acct-pm-del" onClick={() => remove(b)}>삭제</span>
              </div>
              {palette === b[CODE_KEY] && <ColorRow value={b.code_color || ""} onPick={(c) => changeColor(b, c)} />}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default AcctBookSettings;