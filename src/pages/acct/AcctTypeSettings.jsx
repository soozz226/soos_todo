// src/pages/AcctTypeSettings.jsx
// 상세 항목(분류) 추가/수정/삭제 패널 — 수입(code_flag B) / 지출(code_flag C) — AcctSettings 의 탭 안에 표시됨
import { useState, useEffect, lazy, Suspense } from "react";
import { fetchAcctCodes, fetchAcctBookCodes, insertAcctType, updateAcctType, deleteAcctType, countAcctEntriesByType } from "../../api/acctApi";
import SvgIcon from "../../components/SvgIcon";

const IconPickerSheet = lazy(() => import("../../components/acct/IconPickerSheet"));

const CODE_KEY = "code_cdid";
const NAME_KEY = "code_cdnm";
const BOOK_KEY = "acct_selected_book"; // AccountBook.jsx 에서 선택한 가계부를 저장하는 키와 같아야 함
const TYPE_FLAG = { A001: "B", A002: "C" }; // 수입: B, 지출: C

function AcctTypeSettings({ book }) {
    const [rows, setRows] = useState([]);   // 수입/지출 항목 전체
    const [books, setBooks] = useState([]); // 가계부 목록
    const [sel, setSel] = useState(book || localStorage.getItem(BOOK_KEY) || null); // 선택한 가계부 코드
    const [io, setIo] = useState("A001");   // 수입(A001) / 지출(A002)
    const [text, setText] = useState("");
    const [icon, setIcon] = useState("");         // 새 항목용: 선택한 아이콘 SVG 소스
    const [iconName, setIconName] = useState(""); // 새 항목용: 시트에서 선택 표시용
    const [picker, setPicker] = useState(null);   // null | "new"(새 항목) | 항목 row(기존 항목 아이콘 변경)
    const [editKey, setEditKey] = useState(null); // 이름 수정 중인 항목
    const [editText, setEditText] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
    let alive = true;
    Promise.all([fetchAcctCodes(), fetchAcctBookCodes()])
        .then(([codes, bookRows]) => {
        if (!alive) return;
        setRows(codes.filter((c) => c.code_flag === "B" || c.code_flag === "C"));
        setBooks(bookRows);
        setSel((prev) => (prev && bookRows.some((b) => b[CODE_KEY] === prev) ? prev : bookRows[0]?.[CODE_KEY] ?? null));
        })
        .catch((err) => console.error("항목 불러오기 실패:", err));
    return () => { alive = false; };
    }, []);

    const flag = TYPE_FLAG[io];
    const isCommon = (t) => !t.code_root?.length;
    const rowKey = (t) => `${t.code_flag}-${t[CODE_KEY]}`;
    const visible = rows.filter((t) => t.code_flag === flag && (isCommon(t) || (sel && t.code_root.includes(sel))));

    const add = async () => {
    const name = text.trim();
    if (!name || !sel || busy) return;
    setBusy(true);
    try {
        const ordr = rows
        .filter((t) => t.code_flag === flag)
        .reduce((mx, t) => Math.max(mx, Number(t.code_ordr) || 0), 0) + 1;
        const row = await insertAcctType({ flag, name, ordr, book: sel, icon }); // code_cdid 는 DB가 자동 생성
        setRows((prev) => [...prev, row]);
        setText("");
        setIcon("");
        setIconName("");
    } catch (err) {
        console.error("항목 추가 실패:", err);
        window.alert("항목 추가에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
        setBusy(false);
    }
    };

    // 기존 항목의 이름/아이콘 수정
    const patchRow = async (t, patch) => {
    try {
        const row = await updateAcctType(t.code_flag, t[CODE_KEY], patch);
        setRows((prev) => prev.map((r) => (r.code_flag === t.code_flag && r[CODE_KEY] === t[CODE_KEY] ? { ...r, ...row } : r)));
    } catch (err) {
        console.error("항목 수정 실패:", err);
        window.alert("항목 수정에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
    };

    const startEdit = (t) => {
    setEditKey(rowKey(t));
    setEditText(t[NAME_KEY]);
    };

    const saveName = async (t) => {
    const name = editText.trim();
    setEditKey(null);
    if (!name || name === t[NAME_KEY]) return;
    await patchRow(t, { [NAME_KEY]: name });
    };

    const remove = async (t) => {
    try {
        const cnt = await countAcctEntriesByType(t[CODE_KEY]);
        if (cnt > 0) {
        window.alert(`"${t[NAME_KEY]}"(으)로 저장된 내역이 ${cnt}건 있어서 삭제할 수 없어요.`);
        return;
        }
        if (!window.confirm(`"${t[NAME_KEY]}" 항목을 삭제할까요?`)) return;
        await deleteAcctType(t.code_flag, t[CODE_KEY]);
        setRows((prev) => prev.filter((r) => !(r.code_flag === t.code_flag && r[CODE_KEY] === t[CODE_KEY])));
    } catch (err) {
        console.error("항목 삭제 실패:", err);
        window.alert("항목 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
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

        {/* 수입 / 지출 */}
        <div className="acct-d-seg">
        <div className={`acct-d-seg-btn in ${io === "A001" ? "active" : ""}`} onClick={() => setIo("A001")}>수입</div>
        <div className={`acct-d-seg-btn out ${io === "A002" ? "active" : ""}`} onClick={() => setIo("A002")}>지출</div>
        </div>

        {/* 새 항목 추가 */}
        <div className="acct-pm-add">
        <button
            type="button"
            className={`acct-pm-iconbtn ${icon ? "has" : ""}`}
            onClick={() => setPicker("new")}
        >
            {t.code_icon ? <span dangerouslySetInnerHTML={{ __html: t.code_icon }} /> : "＋"}
        </button>
        <input
            className="acct-pm-input"
            type="text"
            placeholder="추가할 항목 이름"
            maxLength={20}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <button className="acct-pm-addbtn" disabled={!text.trim() || !sel || busy} onClick={add}>추가</button>
        </div>

        {/* 항목 목록 */}
        <div className="acct-pm-list">
        {visible.length === 0 ? (
            <div className="acct-pm-empty">등록된 항목이 없어요</div>
        ) : (
            visible.map((t, i) => (
            <div key={rowKey(t)} className="acct-pm-item">
                <span className="acct-pm-num">{i + 1}</span>

                {/* 아이콘 누르면 변경 */}
                <span
                className={`acct-pm-icbtn ${t.code_icon ? "" : "empty"}`}
                onClick={() => setPicker(t)}
                >
                {t.code_icon ? <SvgIcon icon={t.code_icon} /> : "＋"}
                </span>

                {/* 이름 누르면 수정 (공통 항목은 수정 불가) */}
                {!isCommon(t) && editKey === rowKey(t) ? (
                <input
                    className="acct-pm-edit"
                    type="text"
                    maxLength={20}
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveName(t)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                />
                ) : (
                <span
                    className={`acct-pm-text ${isCommon(t) ? "" : "acct-pm-text-edit"}`}
                    onClick={isCommon(t) ? undefined : () => startEdit(t)}
                >
                    {t[NAME_KEY]}
                </span>
                )}

                {isCommon(t) && <span className="acct-pm-tag">공통</span>}
                {!isCommon(t) && <span className="acct-pm-del" onClick={() => remove(t)}>삭제</span>}
            </div>
            ))
        )}
        </div>

        {/* 아이콘 선택 하단 시트 (새 항목 / 기존 항목 공용) */}
        {picker && (
        <Suspense fallback={null}>
            <IconPickerSheet
            selected={picker === "new" ? iconName : ""}
            onSelect={(svg, name) => {
                if (picker === "new") { setIcon(svg); setIconName(name); }
                else patchRow(picker, { code_icon: svg });
                setPicker(null);
            }}
            onClose={() => setPicker(null)}
            />
        </Suspense>
        )}
    </>
    );
}

export default AcctTypeSettings;