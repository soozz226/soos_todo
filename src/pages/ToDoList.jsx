import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { fetchAllChckItems, updateChckItem } from "../api/todoApi";
import Header from "../components/Header";
import WinCheckModal from "../components/WinCheckModal";
import { fmtDate as fmt, fmtDisplay } from "../utils/dateUtils";
import { MONTHS, WEEK_LABELS, entryBadgeClassName, entryBadgeText } from "../constants/entryTypes";

/* ────────────────── Custom Calendar ────────────────── */
function Calendar({ selectedDate, onSelect, onClose, dateItemMap }) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const today = new Date();
  const todayStr = fmt(today);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: "20px 16px 36px" }}>
        <div style={{ margin: "0 auto 20px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, padding: "0 4px" }}>
          <div onClick={prevMonth} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 10, background: "#f0f2f7", fontSize: 18, color: "#1e2a3a" }}>‹</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a" }}>{viewYear}년 {MONTHS[viewMonth]}</div>
          <div onClick={nextMonth} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 10, background: "#f0f2f7", fontSize: 18, color: "#1e2a3a" }}>›</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
          {WEEK_LABELS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: i === 0 ? "#ef4444" : i === 6 ? "#4a8ef5" : "#9ca3af", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateObj = new Date(viewYear, viewMonth, day);
            const dateStr = fmt(dateObj);
            const isSelected = fmt(selectedDate) === dateStr;
            const isToday = todayStr === dateStr;
            const itemInfo = dateItemMap[dateStr];
            const hasItem = !!itemInfo;
            const allDone = hasItem && itemInfo.done === itemInfo.total;
            const isWeekend = idx % 7 === 0 ? "sun" : idx % 7 === 6 ? "sat" : "";

            return (
              <div
                key={day}
                onClick={() => { onSelect(dateObj); onClose(); }}
                style={{
                  height: 42, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", borderRadius: 10,
                  background: isSelected ? "#4a8ef5" : isToday ? "#eef3ff" : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <span style={{
                  fontSize: 14, fontWeight: isSelected || isToday ? 700 : 400,
                  color: isSelected ? "#fff" : isToday ? "#4a8ef5" : isWeekend === "sun" ? "#ef4444" : isWeekend === "sat" ? "#4a8ef5" : "#1e2a3a",
                }}>
                  {day}
                </span>
                {hasItem && (
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#fff" : allDone ? "#22c55e" : "#ef4444", marginTop: 2 }} />
                )}
              </div>
            );
          })}
        </div>

        <div
          onClick={() => { onSelect(new Date()); onClose(); }}
          style={{ marginTop: 16, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#4a8ef5", cursor: "pointer", padding: "10px 0" }}
        >
          오늘로 이동
        </div>
      </div>
    </div>
  );
}

/* ────────────────── Daily ToDo Screen ────────────────── */
function ToDoList({ onBack, onOpenCard, onNavigateOverdue, onUser, onSettings }) {
  const { data: cards, loading, reload: sync, } = useFetch(fetchAllChckItems);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await sync();
    } finally {
      setIsSyncing(false);
    }
  };

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [winCheckTarget, setWinCheckTarget] = useState(null);

  const dateStr = fmt(selectedDate);
  const isToday = fmt(today) === dateStr;

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); };

  const allCards = cards || [];

  // 날짜별 { total, done } 집계
  const dateItemMap = {};
  allCards.forEach((card) => {
    (card.todo_chck || []).forEach((group) => {
      (group.todo_chck_item || []).forEach((item) => {
        if (item.item_date) {
          if (!dateItemMap[item.item_date]) dateItemMap[item.item_date] = { total: 0, done: 0 };
          dateItemMap[item.item_date].total += 1;
          if (item.item_done) dateItemMap[item.item_date].done += 1;
        }
      });
    });
  });

  // 선택 날짜에 해당하는 체크리스트 항목 수집
  const dailyItems = [];
  allCards.forEach((card) => {
    (card.todo_chck || []).forEach((group) => {
      (group.todo_chck_item || []).forEach((item) => {
        if (item.item_date === dateStr) {
          dailyItems.push({
            cardId: card.todo_uuid,
            cardTitle: card.todo_name,
            cardSubType: card.todo_subnm,
            groupName: group.chck_name,
            item,
          });
        }
      });
    });
  });

  const doneCount = dailyItems.filter((d) => d.item.item_done).length;
  const progress = dailyItems.length ? Math.round((doneCount / dailyItems.length) * 100) : 0;

  const toggleItem = async (itemId, patch) => {
    try {
      await updateChckItem(itemId, patch);
      sync();
    } catch (err) {
      console.error("항목 업데이트 실패:", err);
    }
  };

  const handleCheckboxClick = (item) => {
    if (!item.item_done && item.item_type && item.item_type !== "실패") {
        setWinCheckTarget(item);
        return;
    }
    toggleItem(item.item_uuid, { item_done: !item.item_done });
  };

  const grouped = dailyItems.reduce((acc, d) => {
    if (!acc[d.cardId]) acc[d.cardId] = { cardTitle: d.cardTitle, cardSubType: d.cardSubType, items: [] };
    acc[d.cardId].items.push(d);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: "var(--app-max-w, 100%)", margin: "0 auto", minHeight: "100vh", background: "#f0f2f7", display: "flex", flexDirection: "column", fontFamily: "inherit",}}>

      {showCalendar && (
        <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} onClose={() => setShowCalendar(false)} dateItemMap={dateItemMap} />
      )}

      {winCheckTarget && (
        <WinCheckModal
          item={{ title: winCheckTarget.item_name, entryType: winCheckTarget.item_type }}
          onClose={() => setWinCheckTarget(null)}
          onConfirm={(won) => {
            const patch = won === null ? { item_done: true } : { item_done: true, item_rslt: won ? "O" : "X" };
            toggleItem(winCheckTarget.item_uuid, patch);
            setWinCheckTarget(null);
          }}
        />
      )}

      {/* Header */}
      <Header title="ToDo List" user={onUser} onBack={onBack} isSyncing={isSyncing} onSync={handleSync}>
        <div className="hdr-btn" onClick={() => onSettings && onSettings()} title="환경설정">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
      </Header>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: "60vh" }}>
          <span style={{ width: 32, height: 32, border: "3px solid #eef0f4", borderTopColor: "#4a8ef5", borderRadius: "50%", display: "inline-block", animation: "skeletonSpin 0.7s linear infinite" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>로딩중...</span>
        </div>
      ) : (
        <>

      {/* 날짜 네비게이션 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={prevDay} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 10, background: "#f0f2f7", fontSize: 20, color: "#1e2a3a" }}>‹</div>

        <div onClick={() => setShowCalendar(true)} style={{ textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", display: "flex", alignItems: "center", gap: 6 }}>
            {fmtDisplay(selectedDate)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          {isToday
            ? <div style={{ fontSize: 11, color: "#4a8ef5", fontWeight: 600, marginTop: 3 }}>오늘</div>
            : <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>탭하여 날짜 선택</div>}
        </div>

        <div onClick={nextDay} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 10, background: "#f0f2f7", fontSize: 20, color: "#1e2a3a" }}>›</div>
      </div>

      {/* 진행률 */}
      {dailyItems.length > 0 && (
        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>진행률</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: progress === 100 ? "#22c55e" : "#4a8ef5" }}>{doneCount}/{dailyItems.length} ({progress}%)</span>
          </div>
          <div style={{ height: 7, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "#22c55e" : "#4a8ef5", borderRadius: 4, transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}

      {/* 항목 목록 */}
      <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
        {dailyItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>이 날짜에 할 일이 없어요</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>카드 체크리스트에서<br />날짜를 지정하면 여기에 표시돼요</div>
          </div>
        ) : (
          Object.entries(grouped).map(([cardId, group]) => (
            <div key={cardId} style={{ background: "#fff", borderRadius: 14, marginBottom: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div onClick={() => onOpenCard(cardId)} style={{ padding: "13px 16px", borderBottom: "1px solid #f0f2f7", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#fafbff" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8ef5" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#4a8ef5", flex: 1 }}>{group.cardSubType ? `[${group.cardSubType}] ` : ""}{group.cardTitle}</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>›</span>
              </div>
              {group.items.map(({ item, groupName }) => (
                <div key={item.item_uuid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid #f9fafb" }}>
                  <div
                    onClick={() => handleCheckboxClick(item)}
                    style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer", border: item.item_done ? "none" : "2px solid #d1d5db", background: item.item_done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  >
                    {item.item_done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                      {item.item_type && (
                        <span className={entryBadgeClassName(item.item_type)} style={{ marginRight: 6 }}>
                          {entryBadgeText(item.item_type, item.item_rslt)}
                        </span>
                      )}
                      <span style={{ color: item.item_done ? "#9ca3af" : "#1e2a3a", textDecoration: item.item_done ? "line-through" : "none" }}>
                        {item.item_name || "(제목 없음)"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{groupName}</div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div
        onClick={onNavigateOverdue}
        style={{
          position: "sticky", bottom: 0, padding: "12px 16px", background: "#fff",
          borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8, cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#d9463f" }}>⚠ 미체크 항목</span>
      </div>
      </>
      )}
    </div>
  );
}

export default ToDoList;