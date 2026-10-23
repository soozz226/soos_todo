import Ico from "../etc/icons";

function Header({ title, titleExtra, user, onBack, isSyncing, onSync, children }) {
  return (
    <div className="board-hdr">
      <span style={{ fontSize: 20, cursor: "pointer", marginRight: 4 }} onClick={onBack}>←</span>
      <div className="board-hdr-left">
        <div className="board-sub">{user}</div>
        <div className="board-ttl" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          {titleExtra}
        </div>
      </div>
      {onSync && (
        <div
          className={`hdr-btn${isSyncing ? " syncing" : ""}`}
          onClick={() => !isSyncing && onSync()}
          title="동기화"
        >
          <Ico.Sync />
        </div>
      )}
      {children}
    </div>
  );
}

export default Header;