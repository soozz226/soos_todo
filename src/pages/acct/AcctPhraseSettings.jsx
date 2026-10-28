import { useState, useEffect } from "react";
import { fetchAcctCodes, fetchAcctBookCodes, insertAcctPhrase, deleteAcctPhrase } from "../../api/acctApi";

const CODE_KEY = "code_cdid";
const NAME_KEY = "code_cdnm";
const PHRASE_FLAG = "D";
const BOOK_KEY = "acct_selected_book"; // AccountBook.jsx 에서 선택한 가계부를 저장하는 키와 같아야 함

function AcctPhraseSettings({ book }) {
  const [rows, setRows] = useState([]);   // 모든 가계부의 문구
  const [books, setBooks] = useState([]); // 가계부 목록
  const [sel, setSel] = useState(book || localStorage.getItem(BOOK_KEY) || null); // 선택한 가계부 코드
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchAcctCodes(), fetchAcctBookCodes()])
      .then(([codes, bookRows]) => {
        if (!alive) return;
        setRows(codes.filter((c) => c.code_flag === PHRASE_FLAG));
        setBooks(bookRows);
        // 선택된 가계부가 없거나 목록에 없으면 첫 번째 가계부로
        setSel((prev) => (prev && bookRows.some((b) => b[CODE_KEY] === prev) ? prev : bookRows[0]?.[CODE_KEY] ?? null));
      })
      .catch((err) => console.error("문구 불러오기 실패:", err));
    return () => { alive = false; };
  }, []);

  const isCommon = (p) => !p.code_root?.length;
  const visible = rows.filter((p) => isCommon(p) || (sel && p.code_root.includes(sel)));

  const add = async () => {
    const name = text.trim();
    if (!name || !sel || busy) return;
    setBusy(true);
    try {
      const ordr = rows.reduce((mx, p) => Math.max(mx, Number(p.code_ordr) || 0), 0) + 1;
      const row = await insertAcctPhrase({ name, ordr, book: sel }); // code_root 에 선택한 가계부가 들어감
      setRows((prev) => [...prev, row]);
      setText("");
    } catch (err) {
      console.error("문구 추가 실패:", err);
      window.alert("문구 추가에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    const msg = isCommon(p)
      ? `"${p[NAME_KEY]}" 문구를 삭제할까요?\n모든 가계부에서 사라져요.`
      : `"${p[NAME_KEY]}" 문구를 삭제할까요?`;
    if (!window.confirm(msg)) return;
    try {
      await deleteAcctPhrase(p[CODE_KEY]);
      setRows((prev) => prev.filter((r) => r[CODE_KEY] !== p[CODE_KEY]));
    } catch (err) {
      console.error("문구 삭제 실패:", err);
      window.alert("문구 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <>
      {/* 가계부 선택 */}
      <div className="acct-pm-books">
        {books.map((b) => (
          <div
            key={b[CODE_KEY]}
            className={`acct-pm-book ${sel === b[CODE_KEY] ? "active" : ""}`}
            onClick={() => setSel(b[CODE_KEY])}
          >
            {b[NAME_KEY]}
          </div>
        ))}
      </div>

      <div className="acct-pm-add">
        <input
          className="acct-pm-input"
          type="text"
          placeholder="추가할 문구를 입력하세요"
          maxLength={50}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <button className="acct-pm-addbtn" disabled={!text.trim() || !sel || busy} onClick={add}>추가</button>
      </div>

      <div className="acct-pm-list">
        {visible.length === 0 ? (
          <div className="acct-pm-empty">등록된 문구가 없어요</div>
        ) : (
          visible.map((p, i) => (
            <div key={p[CODE_KEY]} className="acct-pm-item">
              <span className="acct-pm-num">{i + 1}</span>
              <span className="acct-pm-text">{p[NAME_KEY]}</span>
              {isCommon(p) && <span className="acct-pm-tag">공통</span>}
              <span className="acct-pm-del" onClick={() => remove(p)}>삭제</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default AcctPhraseSettings;