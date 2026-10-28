// src/pages/AcctSettings.jsx
// 가계부 설정 — 왼쪽 세로탭(번호 + 밑줄) + 오른쪽 내용. 새 설정은 TABS 에 한 줄 추가하면 됨
import { useState } from "react";
import AcctBookSettings from "./AcctBookSettings";
import AcctTypeSettings from "./AcctTypeSettings";
import AcctPhraseSettings from "./AcctPhraseSettings";
import SvgIcon from "../../components/SvgIcon";

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
                <SvgIcon.Settings />
                <span>설정</span>
            </div>
            <div className="hdr-btn" onClick={onBack} aria-label="닫기">
                <SvgIcon.Close />
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