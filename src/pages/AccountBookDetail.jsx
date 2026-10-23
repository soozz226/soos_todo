import { useState, useEffect } from "react";
import { fmtDate } from "../utils/dateUtils";
import YearMonthPickerModal from "../components/YearMonthPickerModal";
import { insertAcctEntry, updateAcctEntry, deleteAcctEntry, fetchAcctCodes } from "../api/acctApi";
import AcctPhraseSettings from "./AcctPhraseSettings"; // 설정 화면의 문구 탭과 같은 컴포넌트

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// acct_code 테이블 컬럼명 (실제 컬럼명에 맞게 수정하세요)
const TYPE_CODE_KEY = "code_cdid";   // soos_acct.acct_type 에 저장되는 값
const TYPE_NAME_KEY = "code_cdnm"; // 화면에 보여줄 이름
// 수입/지출에 따라 불러올 acct_code.code_flag
const TYPE_FLAG = { A001: "B", A002: "C" }; // 수입: B, 지출: C

const TYPE_ICON_KEY = "code_icon"; // 아이콘 (SVG 전체 코드)
const PHRASE_FLAG = "D";            // 자주 쓰는 문구가 들어 있는 acct_code.code_flag

// 테이블의 아이콘 값(SVG 마크업)을 그대로 그림. 비어 있으면 이름 첫 글자
function TypeIcon({ icon, name }) {
  if (!icon) return <span>{name.slice(0, 1)}</span>;
  return <span className="acct-d-type-icon" dangerouslySetInnerHTML={{ __html: icon }} />;
}

function formatDateLabel(str) {
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dow = WEEK[new Date(y, m - 1, d).getDay()];
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")} (${dow})`;
}

function buildWeeks(year, month) {
  const gridStart = new Date(year, month, 1 - new Date(year, month, 1).getDay());
  const cursor = new Date(gridStart);
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function AccountBookDetail({ book, typeCodes, zero, lockedBefore, date, entry, initialMemo, linkTodo, onBack, onOpenTypeSettings }) {
  const isEdit = !!entry;
  const [iofl, setIofl] = useState(entry?.acct_iofl || "A001");
  const [entryDate, setEntryDate] = useState(entry?.acct_date || date || fmtDate(new Date()));
  const [amount, setAmount] = useState(entry ? String(entry.acct_amnt) : "");   
  const [memo, setMemo] = useState(entry?.acct_memo || (initialMemo || "").slice(0, 50));
  const [saving, setSaving] = useState(false);
  const [isZero, setIsZero] = useState(entry ? !!entry.acct_zero : !!zero); // 보관금(0일 내역) 체크
  const [typeCode, setTypeCode] = useState(entry?.acct_type || null);
  // AccountBook 에서 받은 항목 코드를 그대로 사용. (아직 못 받아 왔을 때만 직접 불러옴)
  const [allCodes, setAllCodes] = useState(typeCodes || []);

  useEffect(() => {
    if (allCodes.length > 0) return;
    let alive = true;
    fetchAcctCodes()
      .then((data) => alive && setAllCodes(data))
      .catch((err) => console.error("항목 불러오기 실패:", err));
    return () => { alive = false; };
  }, []);

  // code_root(가계부 코드 배열)가 비어 있으면 공통, 값이 있으면 해당 가계부에서만 보여줌
  const inThisBook = (t) => !t.code_root?.length || t.code_root.includes(book);
  const visibleTypes = allCodes.filter((t) => t.code_flag === TYPE_FLAG[iofl] && inThisBook(t));
  const phrases = allCodes.filter((t) => t.code_flag === PHRASE_FLAG && inThisBook(t));

  // 문구 칩을 누르면 내용에 입력: 비어 있으면 그대로, 이미 입력돼 있으면 뒤에 이어 붙임
  const pickPhrase = (text) =>
    setMemo((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text).slice(0, 50));

  // 문구 관리 화면을 닫으면 문구 시트로 돌아가고, 바뀐 문구를 다시 불러옴
  const closePhraseManager = async () => {
    setPhraseManageOpen(false);
    setPhraseOpen(true);
    try {
      setAllCodes(await fetchAcctCodes());
    } catch (err) {
      console.error("문구 다시 불러오기 실패:", err);
    }
  };

  // 수입/지출을 바꾸면 항목 목록이 달라지므로 선택한 항목은 초기화
  const changeIofl = (v) => {
    if (v === iofl) return;
    setIofl(v);
    setTypeCode(null);
  };
  const [calOpen, setCalOpen] = useState(false);
  const [ymOpen, setYmOpen] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false); // 자주 쓰는 문구 시트
  const [phraseManageOpen, setPhraseManageOpen] = useState(false); // 문구 추가/삭제 페이지
  const [viewYear, setViewYear] = useState(() => Number(entryDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => Number(entryDate.slice(5, 7)) - 1);

  const openCal = () => {
    setViewYear(Number(entryDate.slice(0, 4)));
    setViewMonth(Number(entryDate.slice(5, 7)) - 1);
    setCalOpen(true);
  };
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1);
  };
  const pickDate = (dateStr) => { setEntryDate(dateStr); setCalOpen(false); };

  const todayStr = fmtDate(new Date());
  const weeks = calOpen ? buildWeeks(viewYear, viewMonth) : [];

  const isIn = iofl === "A001";
  const hasType = visibleTypes.some((t) => t[TYPE_CODE_KEY] === typeCode); // 상세 항목 선택 필수
  const hasAmount = amount !== ""; // "0"을 직접 입력한 경우도 허용
  const canSave = hasAmount && hasType && !saving;
  const amountText = amount ? Number(amount).toLocaleString() : "";

  const handleSave = async () => {
    if (!canSave) return;

    // 이월이 확정된 달보다 이전 달에는 저장 불가
    const saveDate = entryDate;
    if (lockedBefore && saveDate.slice(0, 7) < lockedBefore.slice(0, 7)) {
      window.alert("이월이 확정된 이전 달에는 저장할 수 없어요.\n날짜를 바꾸거나, 이월 확정을 해제해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const row = {
        acct_book: entry?.acct_book ?? book,
        acct_date: entryDate, 
        acct_zero: isZero,
        acct_iofl: iofl,
        acct_amnt: Number(amount),
        acct_memo: memo.trim(),
        acct_type: typeCode,
        acct_todo: entry?.acct_todo ?? linkTodo ?? null,   // ← 추가
      };
      if (isEdit) await updateAcctEntry(entry.acct_uuid, row);
      else await insertAcctEntry(row);
      onBack();
    } catch (err) {
      console.error("가계부 저장 실패:", err);
      window.alert("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 내역을 삭제할까요?")) return;
    try {
      await deleteAcctEntry(entry.acct_uuid);
      onBack();
    } catch (err) {
      console.error("가계부 삭제 실패:", err);
      window.alert("삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className={`board-screen acct-detail ${isIn ? "is-in" : "is-out"}`}>
      <div className="acct-d-hdr">
        <div className="hdr-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div className="acct-d-ttl">{isEdit ? "내역 수정" : "내역 추가"}</div>
        {isEdit ? (
          <div className="acct-d-del" onClick={handleDelete}>삭제</div>
        ) : (
          <div className="acct-d-del-space" />
        )}
      </div>

      <div className="acct-d-body">
        {/* 지출 / 수입 */}
        <div className="acct-d-seg">
          <div className={`acct-d-seg-btn in ${isIn ? "active" : ""}`} onClick={() => changeIofl("A001")}>수입</div>
          <div className={`acct-d-seg-btn out ${!isIn ? "active" : ""}`} onClick={() => changeIofl("A002")}>지출</div>
        </div>

        {/* 금액 (주인공) */}
        <div className="acct-d-amount">
          <span className="acct-d-sign">{amount ? (isIn ? "+" : "-") : ""}</span>
          <input
            className="acct-d-amount-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            style={{ width: `${Math.max(amountText.length, 1) + 1}ch` }}
            value={amountText}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 12))}
          />
          <span className="acct-d-won">원</span>
        </div>


        {/* 날짜 / 내용 */}
        <div className="acct-d-card">
          <div className="acct-d-row" onClick={openCal}>
            <span className="acct-d-row-label">날짜</span>
            <span className="acct-d-row-value">
              {isZero ? `${entryDate.slice(0, 4)}.${entryDate.slice(5, 7)}` : formatDateLabel(entryDate)}
            </span>
            <div
              className={`acct-d-zero ${isZero ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setIsZero((v) => !v); }}
            >
              <span className="acct-d-zero-box">
                {isZero && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5 12.5 10 17.5 19 7.5" />
                  </svg>
                )}
              </span>
              <span>보관금</span>
            </div>
          </div>
          <div className="acct-d-divider" />
          <label className="acct-d-row">
            <span className="acct-d-row-label">내용</span>
            <input
              className="acct-d-memo-input"
              type="text"
              placeholder="어디에 썼나요?"
              maxLength={50}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
            <div
              className="acct-d-phrase-btn"
              onClick={(e) => { e.preventDefault(); setPhraseOpen(true); }}
            >
              문구
            </div>
          </label>
        </div>

        {/* 상세 항목 (분류) */}
        <div className="acct-d-types">
          <div className="acct-d-types-hdr">
            <span className="acct-d-types-ttl">상세 항목</span>
            {onOpenTypeSettings && (
              <div className="acct-d-types-set" onClick={onOpenTypeSettings}>설정</div>
            )}
          </div>
          <div className="acct-d-types-grid">
            {visibleTypes.map((t) => {
              const code = t[TYPE_CODE_KEY];
              const name = t[TYPE_NAME_KEY] || "";
              return (
                <div
                  key={code}
                  className={`acct-d-type ${typeCode === code ? "active" : ""}`}
                  onClick={() => setTypeCode(typeCode === code ? null : code)}
                >
                  <div className="acct-d-type-circle"><TypeIcon icon={t[TYPE_ICON_KEY]} name={name} /></div>
                  <div className="acct-d-type-name">{name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="acct-d-footer">
        <button className="acct-d-save" disabled={!canSave} onClick={handleSave}>
        {saving ? "저장 중..." : hasAmount && !hasType ? "상세 항목을 선택해 주세요" : isEdit ? "수정 저장" : "저장"}
        </button>
      </div>

      {phraseManageOpen && (
        <div className="acct-pm">
          <div className="acct-d-hdr">
            <div
              className="acct-d-ttl"
              style={{ paddingLeft: 4, display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>자주 쓰는 문구 관리</span>
            </div>
            <div className="hdr-btn" onClick={closePhraseManager} aria-label="닫기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
          <AcctPhraseSettings book={book} />
        </div>
      )}

      {phraseOpen && (
        <div className="modal-overlay acct-phrase-overlay" onClick={() => setPhraseOpen(false)}>
          <div className="modal-sheet acct-phrase-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="acct-phrase-bar" onClick={() => { setPhraseOpen(false); setPhraseManageOpen(true); }}>
              <span className="acct-phrase-plus">＋</span>
              <span>자주 쓰는 문구</span>
            </div>
            <div className="acct-phrase-body">
              {phrases.length === 0 && <div className="acct-phrase-empty">등록된 문구가 없어요</div>}
              {phrases.map((p, i) => {
                const text = p[TYPE_NAME_KEY] || "";
                return (
                  <div
                    key={p[TYPE_CODE_KEY]}
                    className="acct-phrase-item"
                    onClick={() => { pickPhrase(text); setPhraseOpen(false); }}
                  >
                    <div className="acct-phrase-badge">{i + 1}</div>
                    <div className="acct-phrase-text">{text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {calOpen && (
        <div className="acct-cal-overlay" onClick={() => setCalOpen(false)}>
          <div className="acct-cal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="acct-cal-head">
              <div className="acct-cal-nav" onClick={prevMonth}>‹</div>
              <div className="acct-cal-title" onClick={() => setYmOpen(true)}>
                {viewYear}년 {viewMonth + 1}월
              </div>
              <div className="acct-cal-nav" onClick={nextMonth}>›</div>
            </div>

            <div className="acct-cal-week">
              {WEEK.map((d, i) => (
                <div key={d} className={`acct-cal-wd ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{d}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="acct-cal-row">
                {week.map((day, di) => {
                  const ds = fmtDate(day);
                  const cls = [
                    "acct-cal-day",
                    day.getMonth() !== viewMonth ? "out" : "",
                    di === 0 ? "sun" : di === 6 ? "sat" : "",
                    ds === todayStr ? "today" : "",
                    ds === entryDate ? "selected" : "",
                  ].join(" ");
                  return (
                    <div key={di} className={cls} onClick={() => pickDate(ds)}>
                      <span>{day.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="acct-cal-foot">
              <div className="acct-cal-today-btn" onClick={() => pickDate(todayStr)}>오늘</div>
              <div className="acct-cal-close-btn" onClick={() => setCalOpen(false)}>닫기</div>
            </div>
          </div>
        </div>
      )}

      {ymOpen && (
        <YearMonthPickerModal
          initialYear={viewYear}
          initialMonth={viewMonth}
          onClose={() => setYmOpen(false)}
          onConfirm={(y, m) => { setViewYear(y); setViewMonth(m); }}
        />
      )}
    </div>
  );
}

export default AccountBookDetail;