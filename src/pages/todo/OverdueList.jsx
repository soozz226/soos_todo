import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { fetchAllChckItems, updateChckItem } from "../../api/todoApi";
import { fmtDate as fmt } from "../../utils/dateUtils";
import { entryBadgeClassName, entryBadgeText } from "../../constants/entryTypes";
import Loading from "../../components/Loading";
import Header from "../../components/Header";
import WinCheckModal from "../../components/todo/WinCheckModal";

function OverdueScreen({ onBack, onOpenCard, onUser }) {
  const { data: cards, loading, reload: sync } = useFetch(fetchAllChckItems);
  const [winCheckTarget, setWinCheckTarget] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await sync();
    } finally {
      setIsSyncing(false);
    }
  };

  const allCards = cards || [];
  const today = new Date();
  const todayFmt = fmt(today);

  const overdueItems = [];
  allCards.forEach((card) => {
    (card.todo_chck || []).forEach((group) => {
      (group.todo_chck_item || []).forEach((item) => {
        if (item.item_date && item.item_date < todayFmt && !item.item_done) {
          overdueItems.push({
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

  const overdueByDate = overdueItems.reduce((acc, d) => {
    const date = d.item.item_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(d);
    return acc;
  }, {});
  const overdueDates = Object.keys(overdueByDate).sort();

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

  return (
    <div style={{ maxWidth: "var(--app-max-w, 100%)", margin: "0 auto", minHeight: "100vh", background: "#f0f2f7", display: "flex", flexDirection: "column", fontFamily: "inherit" }}>

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
      <Header
        title="미체크 항목"
        titleExtra={
          !loading && overdueItems.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#d9463f", background: "#fdecec", padding: "2px 8px", borderRadius: 10 }}>
              {overdueItems.length}개
            </span>
          )
        }
        user={onUser}
        onBack={onBack}
        isSyncing={isSyncing}
        onSync={handleSync}
      />

      {loading ? (
        <Loading />
      ) : (
        <div style={{ padding: 16, flex: 1, overflowY: "auto" }}>
          {overdueDates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280" }}>미체크 항목이 없어요</div>
            </div>
          ) : (
            overdueDates.map((date) => {
              const d = new Date(date);
              const days = ["일", "월", "화", "수", "목", "금", "토"];
              const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;

              return (
                <div key={date} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#4a8ef5", marginBottom: 8 }}>
                    {dateLabel}
                  </div>

                  <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    {overdueByDate[date].map(({ cardId, cardTitle, cardSubType, groupName, item }, idx) => (
                      <div
                        key={item.item_uuid}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: idx < overdueByDate[date].length - 1 ? "1px solid #f9fafb" : "none" }}
                      >
                        <div
                          onClick={() => handleCheckboxClick(item)}
                          style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer", border: "2px solid #d1d5db", background: "transparent" }}
                        />
                        <div onClick={() => onOpenCard(cardId)} style={{ flex: 1, cursor: "pointer" }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#1e2a3a", marginBottom: 2 }}>
                            {item.item_type && (
                              <span className={entryBadgeClassName(item.item_type)} style={{ marginRight: 6 }}>
                                {entryBadgeText(item.item_type, item.item_rslt)}
                              </span>
                            )}
                            {item.item_name || "(제목 없음)"}
                          </div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>
                            {cardSubType ? `[${cardSubType}] ` : ""}{cardTitle} · {groupName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default OverdueScreen;