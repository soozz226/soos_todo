import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { fetchToDoCards, fetchToDoStatusCodes, fetchToDoTagCodes, fetchToDoSubCodes } from "../api/todoApi";
import QuickNav from "../components/QuickNav";
import FloatingAddButton from "../components/FloatingAddButton";
import Ico from "../etc/icons";
import Header from "../components/Header";

/* TAG/SUB 드롭다운에서 완전히 동일하게 복붙되어 있던 "전체 + 목록" pill 그리드.
   활성 상태 색상만 다르게 넘겨받아 하나의 컴포넌트로 통합.
   colorFor(item)는 "전체" pill에 대해서는 item=null로 호출됨 */
function FilterPillGrid({ items, activeKey, colorFor, onSelect }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6 }}>
            <FilterPill label="전체" active={activeKey === "all"} activeColor={colorFor(null)} onClick={() => onSelect("all")} />
            {items.map((item) => (
                <FilterPill
                    key={item.code_cdid}
                    label={item.code_cdnm}
                    active={activeKey === item.code_cdid}
                    activeColor={colorFor(item)}
                    onClick={() => onSelect(item.code_cdid)}
                />
            ))}
        </div>
    );
}

function FilterPill({ label, active, activeColor, onClick }) {
    return (
        <span
            onClick={onClick}
            style={{
                padding: "7px 10px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                background: active ? activeColor : "#f5f6f8",
                color: active ? "#fff" : "#6b7280",
                transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#eef0f4"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#f5f6f8"; }}
        >
            {label}
        </span>
    );
}

function CardList({ onBack, onUser, onOpenCard, onQuickNav }) {
    
    // 카드
    const { data: cards, loading: isSyncing, reload: sync } = useFetch(fetchToDoCards);

    // 탭 상태
    const [activeStatus, setActiveStatus] = useState("A001"); //Backlog
    const { data: status } = useFetch(fetchToDoStatusCodes);
    const activeStatusInfo = status.find((s) => s.code_cdid === activeStatus);
    const IconComponent = Ico[activeStatusInfo?.code_cdnm];

    const countBy = (statusId) => {
        if (statusId === "all") return cards.length;
        return cards.filter((c) => c.todo_stat === statusId).length;
    };

    // 검색, 태그, 서브 필터
    const [openDropdown, setOpenDropdown] = useState(null);
    const [activeTag, setActiveTag] = useState("all"); // 드롭박스 선택값
    const [activeSub, setActiveSub] = useState("all"); // 드롭박스 선택값
    
    const { data: tags } = useFetch(fetchToDoTagCodes);
    const { data: subs } = useFetch(fetchToDoSubCodes);

    const activeTagInfo = tags.find((t) => t.code_cdid === activeTag);
    const activeSubInfo = subs.find((s) => s.code_cdid === activeSub);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleDropdown = (name) => {
        setOpenDropdown((prev) => (prev === name ? null : name));
    };

    const closeDropdown = () => setOpenDropdown(null);

    const toggleSearch = () => {
        setIsSearchOpen((prev) => !prev);
        if (isSearchOpen) setSearchTerm(""); // 닫을 때 검색어 초기화 (선택사항)
    };

    const selectTag = (key) => {
        setActiveTag(key);
        setActiveSub("all");
        closeDropdown();
    };

    const selectSub = (key) => {
        setActiveSub(key);
        closeDropdown();
    };

    const filteredSubs = activeTag === "all" ? [] : subs.filter((s) => s.code_root === activeTag);

    const filteredCards = cards.filter((c) => {
        const statMatch = c.todo_stat === activeStatus;
        const tagMatch = activeTag === "all" || c.todo_tags === activeTag;
        const subMatch = activeSub === "all" || c.todo_subs === activeSub;
        const searchMatch = searchTerm === "" || c.todo_name.includes(searchTerm);
        return statMatch && tagMatch && subMatch && searchMatch;

    });

return (
    <div className="board-screen">
        <Header title="Card List" user={onUser} onBack={onBack} isSyncing={isSyncing} onSync={sync} />

        <div className="status-tabs">
        {status.map(s => (
            
            <div key={s.code_cdid} className={`stab${activeStatus === s.code_cdid ? " active" : ""}`} onClick={() => setActiveStatus(s.code_cdid)} style={activeStatus === s.code_cdid ? { color: s.code_bgcl, borderBottomColor: s.code_bgcl,}: {}}>
            {s.code_cdnm}
            
            {countBy(s.code_cdid) > 0 && (
                <span style={{ background: activeStatus === s.code_cdid ? "#1e2a3a" : "#e5e7eb", color: activeStatus === s.code_cdid ? "#fff" : "#6b7280", fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 10 }}>
                {countBy(s.code_cdid)}
                </span>
            )}
            </div>
        ))}
        </div>
    
            <div className="column" style={{ paddingBottom: 96 }}>
            <div className="col-hdr">
                <span className="col-ico" style={{ color: activeStatusInfo?.code_bgcl }}>
                {IconComponent && <IconComponent />}
                </span>

                <span className="col-lbl">
                    {activeStatusInfo?.code_cdnm}
                </span>

                <span className="col-cnt">
                    {filteredCards.length}
                </span>

                <span className="col-hdr-spacer" />
                <div className="filter-row">
                    {/* 검색 */}
                    <div className="filter-search-btn" onClick={toggleSearch}>
                        <Ico.Search/>
                    </div>
                </div>
            </div>
            
            {isSearchOpen && (
            <div className="search-bar" style={{ overflow: "visible" }}>
                <div className="search-bar-inner" style={{ overflow: "visible" }}>
                <span className="search-bar-icon">
                    <Ico.Search />
                </span>
                <input
                    type="text"
                    className="search-bar-input"
                    placeholder="검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                <div className="search-bar-divider" />
                    {/* TAG 칩 */}
                    <div className="filter-dropdown" style={{ position: "relative" }}>
                        <div className={`filter-btn${openDropdown === "tags" ? " open" : ""}${activeTag !== "all" ? " active" : ""}`}
                            style={activeTag !== "all" ? {
                                background: activeTagInfo?.code_bgcl,
                                color: activeTagInfo?.code_fgcl,
                                borderColor: activeTagInfo?.code_fgcl,
                                } : {}}
                            onClick={() => toggleDropdown("tags")}>

                            {activeTag === "all" ? "TAG" : activeTagInfo?.code_cdnm}
                            <span className="filter-chevron">⌄</span>
                        </div>

                        {openDropdown === "tags" && (
                        <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1px solid rgba(20,24,33,0.06)", borderRadius: 16, zIndex: 50, width: 200, padding: 12, boxShadow: "0 12px 24px rgba(20,24,33,0.1)" }}>
                            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>대분류 선택</div>
                            <FilterPillGrid
                                items={tags}
                                activeKey={activeTag}
                                colorFor={(t) => t ? t.code_fgcl : "#4a8ef5"}
                                onSelect={selectTag}
                            />
                        </div>
                        )}

                    </div>

                    {/* SUB 칩 */}
                    <div className="filter-dropdown" style={{ position: "relative" }}>
                        <div className={`filter-btn${openDropdown === "subs" ? " open" : ""}${activeSub !== "all" ? " active" : ""}`}
                            style={activeSub !== "all" ? ( activeTag !== "all" ? {
                                background: activeTagInfo?.code_bgcl,
                                color: activeTagInfo?.code_fgcl,
                                borderColor: activeTagInfo?.code_fgcl,
                            } : { background: "#e8f1ff", color: "#1e5aa8", borderColor: "#1e5aa8" }) : {}}
                            onClick={() => toggleDropdown("subs")}>

                            {activeSub === "all" ? "SUB" : activeSubInfo?.code_cdnm}
                            <span className="filter-chevron">⌄</span>
                        </div>

                        {openDropdown === "subs" && (
                        <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1px solid rgba(20,24,33,0.06)", borderRadius: 16, zIndex: 50, width: 200, maxHeight: 260, overflowY: "auto", padding: 12, boxShadow: "0 12px 24px rgba(20,24,33,0.1)" }}>
                            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>소분류 선택</div>
                            <FilterPillGrid
                                items={filteredSubs}
                                activeKey={activeSub}
                                colorFor={() => activeTagInfo?.code_fgcl || "#4a8ef5"}
                                onSelect={selectSub}
                            />
                        </div>
                        )}
                    </div>
                    </div>
            </div>
            )}

            {openDropdown && <div className="filter-backdrop" onClick={closeDropdown} />}

            {filteredCards.length === 0 ? (
            <div className="empty-state">카드가 없습니다</div>):

            filteredCards.map((s) => (
                
            <div key={s.todo_uuid} className="card" onClick={() => onOpenCard(s.todo_uuid)}>
                <div className="card-grid">
                    {s.todo_tagbg && (
                    <div className="card-cat-circle" style={{ background: s.todo_tagbg, color: s.todo_tagfg }}>
                    {s.todo_tagnm}
                    </div>
                    )}
                
                    <div className="card-main">
                        {s.todo_subnm && (
                        <span className="card-subtype" style={{ color: s.todo_tagfg || "#4a8ef5" }}>
                        [{s.todo_subnm}]
                        </span>
                        )}
                        {s.todo_name}
                    </div>

                    {s.todo_chckt > 0 && (
                    <div className="card-progress">
                        <Ico.Check />
                        {s.todo_chckd}/{s.todo_chckt}
                    </div>
                    )}
                </div>
            </div>
            ))}
        </div>

        <QuickNav current="cardlist" onNavigate={onQuickNav} />

        {/* 플로팅 + 버튼 */}
        <FloatingAddButton onClick={() => onOpenCard()} />
    </div>
);
}

export default CardList;