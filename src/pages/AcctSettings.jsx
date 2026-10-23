// src/pages/AcctSettings.jsx
// 가계부 설정 — 왼쪽 세로탭(번호 + 밑줄) + 오른쪽 내용. 새 설정은 TABS 에 한 줄 추가하면 됨
import { useState } from "react";
import AcctBookSettings from "./AcctBookSettings";
import AcctTypeSettings from "./AcctTypeSettings";
import AcctPhraseSettings from "./AcctPhraseSettings";

function AcctSettings({ book, onBack }) {
    const TABS = [
    { id: "books", label: "가계부", panel: <AcctBookSettings /> },
    { id: "types", label: "상세 항목", panel: <AcctTypeSettings book={book} /> },
    { id: "phrases", label: "문구", panel: <AcctPhraseSettings book={book} /> },
    ];
    const [tab, setTab] = useState(TABS[0].id);

    return (
    <div className="board-screen acct-set">
        <div className="acct-d-hdr">
            <div
                className="acct-d-ttl"
                style={{ paddingLeft: 4, display: "flex", alignItems: "center", gap: 8 }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>설정</span>
            </div>
            <div className="hdr-btn" onClick={onBack} aria-label="닫기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </div>
        </div>

        <div className="acct-set-layout">
            <div className="acct-set-tabs">
                {TABS.map((t, i) => (
                <div
                    key={t.id}
                    className={`acct-set-tab ${tab === t.id ? "active" : ""}`}
                    onClick={() => setTab(t.id)}
                >
                    <span className="acct-set-tab-no">{String(i + 1).padStart(2, "0")}</span>
                    <span className="acct-set-tab-lbl">{t.label}</span>
                </div>
                ))}
            </div>

            {/* 모든 탭을 그려 두고 숨김 처리 → 탭을 바꿔도 다시 불러오지 않음 */}
            <div className="acct-set-main">
                {TABS.map((t) => (
                <div key={t.id} className="acct-set-panel" style={{ display: tab === t.id ? "block" : "none" }}>
                    {t.panel}
                </div>
                ))}
            </div>
        </div>
    </div>
    );
}

export default AcctSettings;