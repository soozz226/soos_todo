
import { useState, useRef, useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";
import { fetchAcctEntries, fetchAcctEntriesRange, fetchAcctBookCodes, fetchAcctCodes, moveAcctEntries,
  insertAcctEntry, updateAcctEntry, deleteAcctEntry, fetchAcctCarryBase } from "../../api/acctApi";
import { fmtDate } from "../../utils/dateUtils";
import YearMonthPickerModal from "../../components/YearMonthPickerModal";
import AcctDaySheet from "../../components/acct/AcctDaySheet";
import QuickNav from "../../components/QuickNav";
import FloatingAddButton from "../../components/FloatingAddButton";
import AcctCarrySheet from "../../components/acct/AcctCarrySheet";

const TYPE_FLAG = { A001: "B", A002: "C" }; // 수입: B, 지출: C
const BOOK_KEY = "acct_selected_book";
const BOOK_CODE_KEY = "code_cdid"; // acct_code의 코드 컬럼 (soos_acct.acct_book 에 저장되는 값)
const BOOK_NAME_KEY = "code_cdnm"; // acct_code의 이름 컬럼
const BOOK_COLOR_KEY = "code_color"; // 설정 화면에서 저장한 배경색
const ON_COLOR = "#374151";          // 파스텔 배경 위 글자색 (AcctBookSettings와 동일)

const YM_KEY = "acct_selected_ym";

const loadYM = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(YM_KEY));
    if (s && Number.isInteger(s.y) && Number.isInteger(s.m)) return s;
  } catch { /* 무시 */ }
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() };
};

const TABS = [
  { id: "calendar", label: "달력" },
  { id: "budget", label: "예산" },
  { id: "ledger", label: "가계부" },
];

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS_NUM = (m) => `${m + 1}월`;

function AccountBook({ onBack, onOpenEntry, onOpenSettings, onQuickNav }) {
  const [calYear, setCalYear] = useState(() => loadYM().y);      // ← 교체
  const [calMonth, setCalMonth] = useState(() => loadYM().m);    // ← 교체
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isYearMonthOpen, setIsYearMonthOpen] = useState(false);
  const [isZeroOpen, setIsZeroOpen] = useState(false);   // ← 기존 줄

  // ↓ 새로 추가
  useEffect(() => {
    sessionStorage.setItem(YM_KEY, JSON.stringify({ y: calYear, m: calMonth }));
  }, [calYear, calMonth]);

  const [isCarryOpen, setIsCarryOpen] = useState(false);
  const [carryAuto, setCarryAuto] = useState(null);
  const [carryAutoError, setCarryAutoError] = useState(false);
  const [carrySaving, setCarrySaving] = useState(false);
  const carryDate = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
  
  const openCarry = async () => {
    setIsCarryOpen(true);
    setCarryAuto(null);
    setCarryAutoError(false);
    try {
      setCarryAuto(await fetchAcctCarryBase(book, calYear, calMonth));
    } catch (err) {
      console.error("이월 자동 계산 실패:", err);
      setCarryAutoError(true);
    }
  };
  
  const confirmCarry = async (amount) => {
    setCarrySaving(true);
    try {
      const row = { acct_book: book, acct_date: carryDate, acct_iofl: "A001", acct_amnt: amount, acct_carry: true, acct_memo: "이월" };
      if (carryRow) await updateAcctEntry(carryRow.acct_uuid, row);
      else await insertAcctEntry(row);
      sync();
      setIsCarryOpen(false);
    } catch (err) {
      console.error("이월 확정 실패:", err);
      window.alert("이월 확정에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setCarrySaving(false);
    }
  };
  
  const unconfirmCarry = async () => {
    if (!carryRow) return;
    if (!window.confirm("이월 확정을 해제할까요?")) return;
    try {
      await deleteAcctEntry(carryRow.acct_uuid);
      sync();
      setIsCarryOpen(false);
    } catch (err) {
      console.error("이월 해제 실패:", err);
      window.alert("해제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };
  const zeroDate = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;

  const [book, setBook] = useState(() => localStorage.getItem(BOOK_KEY) || "Z001");
  const selectBook = (code) => {
    setBook(code);
    localStorage.setItem(BOOK_KEY, code);
  };

  const openEntry = (date, entry, zero = false) =>
    onOpenEntry && onOpenEntry(date, entry, book, typeCodes, zero);

  // 달력 6주 그리드의 시작/끝 날짜 (이전/다음 달 칸 포함)
  const gridStartDate = new Date(calYear, calMonth, 1 - new Date(calYear, calMonth, 1).getDay());
  const gridEndDate = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + 41);

  const { data: entries, reload: sync } = useFetch(() =>
    fetchAcctEntriesRange(fmtDate(gridStartDate), fmtDate(gridEndDate), book), [calYear, calMonth, book], "acct-entries"
  );

  const { data: books } = useFetch(() => fetchAcctBookCodes(), [], "acct-books");

  const { data: typeCodes } = useFetch(() => fetchAcctCodes(), [], "acct-codes");

  // 내역의 acct_type 코드로 acct_code에서 이름/아이콘을 찾음
  const resolveType = (e) => {
    const t = (typeCodes || []).find(
      (c) => c.code_flag === TYPE_FLAG[e.acct_iofl] && c.code_cdid === e.acct_type
    );
    return t ? { name: t.code_cdnm, icon: t.code_icon } : null;
  };

  // entries 는 이전/다음 달 칸까지 포함. 합계/이월/보관금은 "이번 달" 것만 사용
  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((e) => e.acct_date.startsWith(monthPrefix));

  const carryRow = monthEntries.find((e) => e.acct_carry);
  const baseEntries = monthEntries.filter((e) => !e.acct_carry);
  const carryAmount = carryRow ? carryRow.acct_amnt : 0;

  const sumBy = (list, iofl) => list.filter((e) => e.acct_iofl === iofl).reduce((s, e) => s + e.acct_amnt, 0);

  // 보관금 제외 (큰 숫자로 표시)
  const nonZeroEntries = baseEntries.filter((e) => !e.acct_zero);
  const totalIn = sumBy(nonZeroEntries, "A001");
  const totalOut = sumBy(nonZeroEntries, "A002");
  const netMonth = totalIn - totalOut; // 수입 - 지출 (보관금 제외)
  
  // 보관금 포함 (작은 숫자로 표시, 총 잔액 계산에도 사용)
  const totalInAll = sumBy(baseEntries, "A001");
  const totalOutAll = sumBy(baseEntries, "A002");
  const totalBalance = carryAmount + totalInAll - totalOutAll;
  const zeroIn = totalInAll - totalIn;    // 보관금 중 수입
  const zeroOut = totalOutAll - totalOut; // 보관금 중 지출
  const zeroNet = zeroIn - zeroOut;       // 보관금 합친 값
  const zeroEntries = baseEntries.filter((e) => e.acct_zero);

  // 달력 칸에 표시할 내역: 이전/다음 달 칸 포함 (이월, 보관금 제외)
  const entriesByDate = entries.reduce((acc, e) => {
    if (e.acct_carry || e.acct_zero) return acc;
    (acc[e.acct_date] ||= []).push(e);
    return acc;
  }, {});

  // 보관금 일괄전송: 현재 달의 보관금 내역을 선택한 달(1일)로 이동
  const bulkMoveZero = async (y, m) => {
    try {
      const newDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      await moveAcctEntries(zeroEntries.map((e) => e.acct_uuid), newDate);
      sync(); // 달력 다시 불러오기
    } catch (err) {
      console.error("보관금 일괄전송 실패:", err);
      window.alert("이동에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };
  
  // 6주 그리드 (이전달/다음달 날짜 포함, 스크린샷처럼)
  const firstOfMonth = new Date(calYear, calMonth, 1);
  const startOffset = firstOfMonth.getDay(); // 이번달 1일이 무슨 요일인지
  const gridStart = new Date(calYear, calMonth, 1 - startOffset);

  const weeks = [];
  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const goPrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const goNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const touchRef = useRef(null);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;

    // 가로로 충분히 움직였고, 세로 스크롤이 아닐 때만
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx > 0) goPrevMonth();   // 오른쪽으로 스와이프 → 이전달
    else goNextMonth();          // 왼쪽으로 스와이프 → 다음달
  };

  const lastDayOfMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = fmtDate(new Date());

  return (
    <div className="board-screen">

    {/* 상단 타이틀 */}
    <div style={{ padding: "12px 20px 10px", display: "flex", alignItems: "center", gap: 4, background: "#ffffff" }}>
      <div className="hdr-btn" onClick={onBack} style={{ marginLeft: -8 }}>←
      </div>

      <div>
        <div onClick={() => setIsYearMonthOpen(true)} style={{ cursor: "pointer" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1e2a3a" }}>{calYear}년 {MONTHS_NUM(calMonth)}</span>
        </div>
        <div style={{
          display: "inline-block", marginTop: 4,
          background: "#eef3ff", color: "#6b7280", fontSize: 10, fontWeight: 600,
          padding: "2px 10px", borderRadius: 100,
        }}>
          {`${String(calMonth+1).padStart(2,"0")}.01 ~ ${String(calMonth+1).padStart(2,"0")}.${String(lastDayOfMonth).padStart(2,"0")}`}
        </div>
      </div>

      <div
        className="hdr-btn"
        onClick={() => onOpenSettings && onOpenSettings(book)}
        style={{ marginLeft: "auto", marginRight: -8 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>
    </div>
<div style={{ height: 1, background: "#e5e7eb" }} />
      {/* 3탭 (언더라인 스타일) */}
      <div style={{ display: "flex", marginTop: 0 ,background: "#ffffff"}}>
        {TABS.map(t => (
          <div
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, textAlign: "center", padding: "10px 0",
              fontSize: 14, fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? "#1e2a3a" : "#c4c9d4",
              cursor: "pointer",
            }}
          >
            {t.label}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", height: 1, background: "#eef0f4" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: 2, width: `${100 / TABS.length}%`,
          background: "#4a8ef5",
          transform: `translateX(${TABS.findIndex(t => t.id === activeTab) * 100}%)`,
          transition: "transform 0.2s",
        }} />
      </div>

      {activeTab === "calendar" && (
        <>
          {/* 요약 카드 */}
          <div style={{ padding: "12px 12px 10px" ,background: "#f5f6f8" }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={openCarry}>
                <div style={{ fontSize: 11, color: "#4b5563" }}>수입</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2e9e4f", marginTop: 3 }}>
                  +{totalIn.toLocaleString()}원
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#4b5563" }}>지출</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#d9463f", marginTop: 3 }}>
                  -{totalOut.toLocaleString()}원
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#4b5563" }}>잔액</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a", marginTop: 3 }}>
                  {totalBalance.toLocaleString()}원
                </div>
              </div>

              <div style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => setIsZeroOpen(true)}>
                <div style={{ fontSize: 11, color: "#4b5563" }}>보관금</div>
                <div className={`acct-star ${zeroEntries.length > 0 ? "has-items" : ""}`}>⭐</div>
              </div>
            </div>
{/* 수입-지출 / 이월 포함 / 보관금 합친 값 */}
{(() => {
  const AMT = { fontWeight: 700, color: "#654235" }; // 금액 색 (여기만 바꾸면 세 곳 모두 바뀜)
  return (
    <div style={{ display: "flex", marginTop: 6 }}>
      <div style={{ flex: 2, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>
      {netMonth !== 0 && (
        <>
        수익{" "}
        <span style={AMT}>{netMonth > 0 ? "+" : ""}{netMonth.toLocaleString()}</span>
        </>
      )}
    </div>

      <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>
        {carryRow && (
          <>
            이월{" "}
            <span style={AMT}>{carryAmount > 0 ? "+" : ""}{carryAmount.toLocaleString()}</span>
          </>
        )}
      </div>

      <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>
        {zeroNet !== 0 && (
          <>
            보관금{" "}
            <span style={AMT}>{zeroNet > 0 ? "+" : ""}{zeroNet.toLocaleString()}</span>
          </>
        )}
      </div>
    </div>
  );
})()}
          </div>


          {/* 요일 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #eef0f4",background: "#ffffff"}}>
            {WEEK_LABELS.map((d, i) => (
              <div key={d} style={{
                textAlign: "center", fontSize: 10, fontWeight: 600, padding: "5px 0",
                color: i === 0 ? "#ef4444" : i === 6 ? "#4a8ef5" : "#4b5563",
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* 캘린더 그리드 */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ borderLeft: "1px solid #f5f6f8", touchAction: "pan-y" }}
          >
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f0f2f7" }}>
                {week.map((date, di) => {
                  const inMonth = date.getMonth() === calMonth;
                  const dateStr = fmtDate(date);
                  const dayEntries = entriesByDate[dateStr] || [];
                  const inList = dayEntries.filter(e => e.acct_iofl === "A001");
                  const outList = dayEntries.filter(e => e.acct_iofl === "A002");
                  const dIn = inList.reduce((s, e) => s + e.acct_amnt, 0);
                  const dOut = outList.reduce((s, e) => s + e.acct_amnt, 0);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  return (
                    
                    <div
                      key={di}
                      onClick={() => {
                        setSelectedDate(dateStr);
            
                      }}
                      style={{
                        minHeight: 88, cursor: "pointer",
                        background: inMonth ? "#fff" : "#f7f8fa",
                        borderTop: isSelected ? "1.5px solid #4a8ef5" : "1px solid transparent",
                        borderBottom: isSelected ? "1.5px solid #4a8ef5" : "1px solid transparent",
                        borderLeft: isSelected ? "1.5px solid #4a8ef5" : "1px solid transparent",
                        borderRight: isSelected ? "1.5px solid #4a8ef5" : "1px solid #f5f6f8",
                        boxSizing: "border-box",
                        position: "relative",
                      }}
                    >
                      {isToday ? (
                        <div style={{
                          background: "#4a8ef5", color: "#fff",
                          fontSize: 12, fontWeight: 700,
                          padding: "3px 0 3px 6px",
                        }}>
                          {date.getDate()}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: 11, fontWeight: 400, padding: "3px 0 0 4px",
                          color: !inMonth ? "#d1d5db" : "#1e2a3a",
                        }}>
                          {date.getDate()}
                        </div>
                      )}

                      <div style={{ padding: "4px 4px 0", opacity: inMonth ? 1 : 0.45 }}>
                        {inList.length > 0 && (
                          <div style={{ fontSize: 11, color: "#2e9e4f", fontWeight: 500 }}>
                            +{dIn.toLocaleString()}
                          </div>
                        )}
                        {outList.length > 0 && (
                          <div style={{ fontSize: 11, color: "#d9463f", marginTop: 2, fontWeight: 500 }}>
                            -{dOut.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "budget" && (
        <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>예산 화면 준비중</div>
      )}

      {activeTab === "ledger" && (
        <div className="acct-book-list">
          {(books || []).length === 0 ? (
            <div className="acct-book-empty">등록된 가계부가 없어요</div>
          ) : (
            books.map((b, i) => {
              const code = b[BOOK_CODE_KEY];
              const name = b[BOOK_NAME_KEY] || "";
              const bookColor = b[BOOK_COLOR_KEY];
              const selected = code === book;
              return (
                <div
                  key={code}
                  className={`acct-book-item ${selected ? "active" : ""}`}
                  onClick={() => { selectBook(code); setActiveTab("calendar"); }}
                >
                  <div
                    className="acct-book-circle"
                    style={bookColor ? { background: bookColor, color: ON_COLOR } : undefined}
                  >
                    {i + 1}
                  </div>
                  <div className="acct-book-name">{name}</div>
                  {selected && (
                    <svg className="acct-book-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="5 12.5 10 17.5 19 7.5" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <QuickNav current="acctbook" onNavigate={onQuickNav} />

      {/* 플로팅 + 버튼 */}
      <FloatingAddButton onClick={() => openEntry(selectedDate)} />

      {isYearMonthOpen && (
        <YearMonthPickerModal
          initialYear={calYear}
          initialMonth={calMonth}
          onClose={() => setIsYearMonthOpen(false)}
          onConfirm={(y, m) => { setCalYear(y); setCalMonth(m); }}
        />
      )}

      {/* 날짜 선택 시트 */}
      <AcctDaySheet
        date={selectedDate}
        entries={selectedDate ? (entriesByDate[selectedDate] || []) : []}
        resolveType={resolveType}
        onClose={() => setSelectedDate(null)}
        onAdd={() => openEntry(selectedDate)}
        onEditEntry={(entry) => openEntry(selectedDate, entry)}
      />

      {/* 보관금 시트 */}
      <AcctDaySheet
        date={isZeroOpen ? zeroDate : null}
        title="보관금"
        entries={isZeroOpen ? zeroEntries : []}
        resolveType={resolveType}
        onBulkMove={bulkMoveZero}
        onClose={() => setIsZeroOpen(false)}
        onAdd={() => openEntry(zeroDate, null, true)}
        onEditEntry={(entry) => openEntry(zeroDate, entry, true)}
      />

      <AcctCarrySheet
        open={isCarryOpen}
        year={calYear}
        month={calMonth}
        autoAmount={carryAuto}
        autoError={carryAutoError}
        confirmedAmount={carryRow ? carryRow.acct_amnt : null}
        saving={carrySaving}
        onConfirm={confirmCarry}
        onUnconfirm={unconfirmCarry}
        onClose={() => setIsCarryOpen(false)}
      />
    </div>

    
  );
}

export default AccountBook;