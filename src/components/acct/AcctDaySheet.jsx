import { useState } from "react";
import YearMonthPickerModal from "../YearMonthPickerModal";
import SvgIcon from "../SvgIcon";

function AcctDaySheet({ date, title, entries, onClose, onAdd, onEditEntry, resolveType, onBulkMove }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  if (!date) return null;

  // 일괄전송: 이동할 달을 고르면 확인 후 onBulkMove 호출
  const nextMonth = new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 1); // 기본 선택: 다음 달
  const handleBulkConfirm = (y, m) => {
    setPickerOpen(false);
    const target = `${y}-${String(m + 1).padStart(2, "0")}`;
    if (target === date.slice(0, 7)) {
      window.alert("같은 달로는 이동할 수 없어요.");
      return;
    }
    if (!window.confirm(`${entries.length}건을 ${y}년 ${m + 1}월로 이동할까요?`)) return;
    onBulkMove(y, m);
  };

  const d = new Date(date);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dateLabel = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dowLabel = `${days[d.getDay()]}요일`;

    // 같은 상세 항목끼리 붙여서 보여줌 (수입 먼저 → 항목 코드 순, 항목 없는 건 맨 뒤)
  // sort 는 순서를 유지하므로 같은 항목 안에서는 기존 순서(날짜순)가 그대로 유지돼요
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.acct_iofl !== b.acct_iofl) return a.acct_iofl < b.acct_iofl ? -1 : 1;
    const ta = a.acct_type || "\uffff";
    const tb = b.acct_type || "\uffff";
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });

  const dayIn = entries.filter(e => e.acct_iofl === "A001").reduce((s, e) => s + e.acct_amnt, 0);
  const dayOut = entries.filter(e => e.acct_iofl === "A002").reduce((s, e) => s + e.acct_amnt, 0);

  return (
    <>
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: "78vh", overflowY: "auto", padding: 0 }}
      >
        <div
          onClick={onAdd}
          style={{
            position: "sticky", top: 0, zIndex: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "18px 0",
            background: "#f0f2f7", borderRadius: "20px 20px 0 0",
          }}
        >
          <span style={{ fontSize: 16, color: "#4a8ef5", fontWeight: 700 }}>＋</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a" }}>내역 추가</span>
        </div>
        
        <div style={{ padding: "20px 20px 32px" }}>
          {/* 날짜 헤더 + 합계 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#1e2a3a" }}>{title || dateLabel}</span>
              {!title && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", background: "#f0f2f7", padding: "4px 10px", borderRadius: 100 }}>
                  {dowLabel}
                </span>
              )}
              {title && onBulkMove && entries.length > 0 && (
                <span
                  onClick={() => setPickerOpen(true)}
                  style={{ fontSize: 13, fontWeight: 600, color: "#4a8ef5", background: "#eef3ff", padding: "4px 10px", borderRadius: 100, cursor: "pointer" }}
                >
                  일괄전송
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {dayIn > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14, color: "#2e9e4f" }}>↓</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#2e9e4f" }}>{dayIn.toLocaleString()}원</span>
                </div>
              )}
              {dayOut > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14, color: "#d9463f" }}>↑</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#d9463f" }}>{dayOut.toLocaleString()}원</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderBottom: "1px solid #eef0f4", marginBottom: 4 }} />

          {/* 리스트 */}
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
              등록된 내역이 없어요
            </div>
          ) : (
            sortedEntries.map((e) => {
              const type = resolveType ? resolveType(e) : null;
              const typeName = type?.name || "미분류";
              return (
                <div
                  key={e.acct_uuid}
                  onClick={() => onEditEntry && onEditEntry(e)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 0", borderBottom: "1px solid #f9fafb", cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#f0f2f7",
                    color: e.acct_iofl === "A001" ? "#2e9e4f" : "#d9463f",
                    fontSize: 16, fontWeight: 700,
                  }}>
                    {type?.icon ? (
                      <SvgIcon icon={type.icon} className="acct-ds-icon" />
                    ) : (
                      typeName.slice(0, 1)
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a" }}>
                      {typeName}
                    </div>
                    {e.acct_memo && (
                      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3, lineHeight: 1.4 }}>
                        {e.acct_memo}
                      </div>
                    )}
                  </div>

                  <div style={{
                    fontSize: 15, fontWeight: 700, flexShrink: 0,
                    color: e.acct_iofl === "A001" ? "#2e9e4f" : "#d9463f",
                  }}>
                    {e.acct_iofl === "A001" ? "+" : "-"}{e.acct_amnt.toLocaleString()}원
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>

    {pickerOpen && (
      <div style={{ position: "relative", zIndex: 300 }}>
        <YearMonthPickerModal
          initialYear={nextMonth.getFullYear()}
          initialMonth={nextMonth.getMonth()}
          onClose={() => setPickerOpen(false)}
          onConfirm={handleBulkConfirm}
        />
      </div>
    )}
    </>
  );
}

export default AcctDaySheet;