import { useState, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { useFetch } from "../../hooks/useFetch";
import { fetchAcctBookCodes, fetchAcctEntriesByTodo } from "../../api/acctApi";
import CheckListModal from "../../components/todo/CheckListModal";
import CheckListItemRepeatPicker from "../../components/todo/CheckListItemRepeatPicker";
import SvgIcon from "../../components/SvgIcon";

import {
    fetchToDoStatusCodes,
    fetchToDoCardDetail,
    fetchToDoTagCodes,
    fetchToDoSubCodes,
    createTodo,
    updateTodo,
    deleteTodo,
    saveTodoFile,
    saveTodoChck,
    uploadTodoFile,
    deleteTodoFile ,
    copyTodoFile,
    saveTodoAlarm,
} from "../../api/todoApi";

import AlarmModal from "../../components/todo/AlarmModal";

const emptyCard = {
todo_uuid: null,
todo_name: "",
todo_stat: "A001",
todo_tags: "",
todo_subs: "",
todo_file: [],
todo_chck: [],
todo_alrm: [],
};

const fmtFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (name = "") => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["png","jpg","jpeg","gif","webp"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    if (["doc","docx"].includes(ext)) return "📝";
    if (["xls","xlsx"].includes(ext)) return "📊";
    if (["zip","rar","7z"].includes(ext)) return "🗜️";
    return "📎";
};

function CardDetail({ todoUuid, onBack, guardRef, sharedFiles, onOpenAcct }) {
    const { data: card, loading } = useFetch(
        () => (todoUuid ? fetchToDoCardDetail(todoUuid) : Promise.resolve(emptyCard)),
        [todoUuid]
    );
    const { data: status } = useFetch(fetchToDoStatusCodes);
    const { data: tags } = useFetch(fetchToDoTagCodes);
    const { data: subs } = useFetch(fetchToDoSubCodes);
    const { data: acctBooks } = useFetch(fetchAcctBookCodes);

    // 가계부로 넘길 일자 ("" = 오늘)
    const [acctDate, setAcctDate] = useState(() => {
        const n = new Date();
        return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    });

    const acctDateRef = useRef(null);
    
    const [acctLinked, setAcctLinked] = useState([]);
    useEffect(() => {
        if (!todoUuid) return;
        let alive = true;
        fetchAcctEntriesByTodo(todoUuid)
            .then((d) => alive && setAcctLinked(d))
            .catch((err) => console.error("연동 가계부 내역 불러오기 실패:", err));
        return () => { alive = false; };
    }, [todoUuid]);

    // 편집 데이터 (사용자가 실제로 수정하는 대상)
    const [localCard, setLocalCard] = useState(emptyCard);
    const isNew = !localCard.todo_uuid;
    const [openDropdown, setOpenDropdown] = useState(null);
    const [lightbox, setLightbox] = useState(null);
    const [saving, setSaving] = useState(false);

    const [secOpen, setSecOpen] = useState({
        props: true,
        desc: true,
        checklist: true,
        attach: true,
    });

    const [dateModalTarget, setDateModalTarget] = useState(null);
    const [repeatModalTarget, setRepeatModalTarget] = useState(null);

    const [isDirty, setIsDirty] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const [copying, setCopying] = useState(false);

    const isDirtyRef = useRef(false);
    useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);
    
    useEffect(() => {
        if (!guardRef) return;
        guardRef.current = () => {
            if (isDirtyRef.current) { setShowLeaveConfirm(true); return true; }
            return false;
        };
        return () => { guardRef.current = null; };
    }, [guardRef]);

    // 서버 데이터(card)가 도착하거나 바뀌면 편집용에 반영
    useEffect(() => {
        if (card) {
        setLocalCard({
            ...emptyCard,
            ...card,
            todo_name: card.todo_name || "",
            todo_tags: card.todo_tags || "",
            todo_subs: card.todo_subs || "",
            todo_file: card.todo_file || [],
            todo_alrm: card.todo_alrm || [],
        });
        setIsDirty(false);   // 추가
        }
    }, [card]);

    const sharedDone = useRef(false);
    useEffect(() => {
        if (loading || Array.isArray(card) || sharedDone.current || !sharedFiles?.length) return;
        sharedDone.current = true;
    
        (async () => {
            const blocks = [];
            for (const f of sharedFiles) {
                try {
                    const src = f.uri.startsWith("data:") ? f.uri : Capacitor.convertFileSrc(f.uri);
                    const blob = await (await fetch(src)).blob();
                    const file = new File([blob], f.name || `shared-${Date.now()}.jpg`, {
                        type: f.mimeType || blob.type,
                    });
                    blocks.push({
                        file_uuid: crypto.randomUUID(),
                        file_kind: "content",
                        file_type: "image",
                        file_cont: URL.createObjectURL(file),
                        file_path: null,
                        file_name: "Photo",
                        file_clpd: false,
                        file_upld: false,
                        _file: file,
                    });
                } catch (e) {
                    console.error("공유 이미지 처리 실패:", e);
                }
            }
            if (blocks.length) {
                setLocalCard((prev) => ({ ...prev, todo_file: [...(prev.todo_file || []), ...blocks] }));
                setIsDirty(true);
            }
        })();
    }, [loading, card, sharedFiles]);

    const handleChange = (field, value) => {
        setLocalCard((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);   // 추가
    };

    const toggleDropdown = (key) => setOpenDropdown((prev) => (prev === key ? null : key));
    const closeDropdown = () => setOpenDropdown(null);

    const toggleSec = (key) => {
        setSecOpen((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const activeStatusInfo = status?.find((s) => s.code_cdid === localCard.todo_stat);
    const activeTagInfo = tags?.find((t) => t.code_cdid === localCard.todo_tags);
    const activeSubInfo = subs?.find((s) => s.code_cdid === localCard.todo_subs);

    const filteredSubs = localCard.todo_tags
        ? subs?.filter((s) => s.code_root === localCard.todo_tags) || []
        : [];

    /* ── Description 블록 조작 ── */
    const addTextBlock = () => {
        const newBlock = {
            file_uuid: crypto.randomUUID(),
            file_kind: "content",
            file_type: "text",
            file_cont: "",
            file_name: "Text",
            file_clpd: false,
        };
        setLocalCard((prev) => ({ ...prev, todo_file: [...(prev.todo_file || []), newBlock] }));
        setIsDirty(true);   // 추가
    };

    const updateBlock = (id, patch) => {
        setLocalCard((prev) => ({
        ...prev,
        todo_file: prev.todo_file.map((b) => (b.file_uuid === id ? { ...b, ...patch } : b)),
        }));
        setIsDirty(true);   // 추가
    };

    const removeBlock = (id) => {
        setLocalCard((prev) => ({
            ...prev,
            todo_file: prev.todo_file.filter((b) => b.file_uuid !== id),
        }));
        setIsDirty(true);
    };

    const handleDescFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        const newBlocks = files.map((file) => ({
            file_uuid: crypto.randomUUID(),
            file_kind: "content",
            file_type: "image",
            file_cont: URL.createObjectURL(file),
            file_path: null,
            file_name: "Photo",
            file_clpd: false,
            file_upld: false,
            _file: file,
        }));
        setLocalCard((prev) => ({ ...prev, todo_file: [...(prev.todo_file || []), ...newBlocks] }));
        setIsDirty(true);   // 추가
        e.target.value = "";
    };
    
    // 체크리스트 함수들
    const addGroup = () => {
        const newGroup = {
            chck_uuid: crypto.randomUUID(),
            chck_name: "체크리스트",
            chck_clpd: false,
            todo_chck_item: [],
        };
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: [...(prev.todo_chck || []), newGroup],
        }));
        setIsDirty(true);
    };

    const toggleCollapse = (groupId) => {
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: prev.todo_chck.map((g) =>
            g.chck_uuid === groupId ? { ...g, chck_clpd: !g.chck_clpd } : g
            ),
        }));
    };

    const updateGroupName = (groupId, name) => {
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: prev.todo_chck.map((g) =>
            g.chck_uuid === groupId ? { ...g, chck_name: name } : g
            ),
        }));
        setIsDirty(true);
    };

    const removeGroup = (groupId) => {
        setLocalCard((prev) => ({
        ...prev,
        todo_chck: prev.todo_chck.filter((g) => g.chck_uuid !== groupId),
        }));
        setIsDirty(true);
    };

    const checkedCount = (group) =>
        group.todo_chck_item.filter((item) => item.item_done).length;

    const addItem = (groupId) => {
        const newItem = {
            item_uuid: crypto.randomUUID(),
            item_name: "",
            item_done: false,
            item_date: null,
            item_type: null,
            item_rslt: null,
        };
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: prev.todo_chck.map((g) =>
            g.chck_uuid === groupId ? { ...g, todo_chck_item: [...g.todo_chck_item, newItem] } : g
            ),
        }));
        setIsDirty(true);
    };

    const updateItem = (groupId, itemId, patch) => {
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: prev.todo_chck.map((g) =>
            g.chck_uuid === groupId
                ? {
                    ...g,
                    todo_chck_item: g.todo_chck_item.map((it) =>
                    it.item_uuid === itemId ? { ...it, ...patch } : it
                    ),
                }
                : g
            ),
        }));
        setIsDirty(true);
    };

    const removeItem = (groupId, itemId) => {
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: prev.todo_chck.map((g) =>
            g.chck_uuid === groupId
                ? { ...g, todo_chck_item: g.todo_chck_item.filter((it) => it.item_uuid !== itemId) }
                : g
            ),
        }));
        setIsDirty(true);
    };

    const toggleItemDone = (groupId, itemId, item) => {
        updateItem(groupId, itemId, { item_done: !item.item_done });
    };

    // 날짜 모달 확인 시 (item_type, item_rslt로 저장)
    const handleDateConfirm = ({ date, entryType, won }) => {
        const { gid, iid } = dateModalTarget;
        updateItem(gid, iid, {
            item_date: date || null,
            item_type: entryType,
            item_rslt: won === true ? "O" : won === false ? "X" : null,
        });
    };

    const openRepeatModal = (groupId) => setRepeatModalTarget(groupId);

    const handleRepeatConfirm = ({ name, dates, entryType }) => {
        const newItems = dates.map((date) => ({
            item_uuid: crypto.randomUUID(),
            item_name: name,
            item_done: false,
            item_date: date,
            item_type: entryType,
            item_rslt: null,
        }));
        
        setLocalCard((prev) => ({
            ...prev,
            todo_chck: prev.todo_chck.map((g) =>
            g.chck_uuid === repeatModalTarget
                ? { ...g, todo_chck_item: [...g.todo_chck_item, ...newItems] }
                : g
            ),
        }));

        setIsDirty(true);
    };

    // 첨부파일 함수들
    const handleAttachFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        const newBlocks = files.map((file) => ({
            file_uuid: crypto.randomUUID(),
            file_kind: "attach",
            file_type: file.type.startsWith("image/") ? "image" : "file",
            file_name: file.name,
            file_size: String(file.size),
            file_cont: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
            file_path: null,
            file_clpd: false,
            file_upld: false,
            _file: file,
        }));
        setLocalCard((prev) => ({ ...prev, todo_file: [...(prev.todo_file || []), ...newBlocks] }));
        setIsDirty(true);
        e.target.value = "";
    };

    const removeAttach = (id) => {
        setLocalCard((prev) => {
            const target = prev.todo_file.find((a) => a.file_uuid === id);
            if (target?.file_cont?.startsWith("blob:")) URL.revokeObjectURL(target.file_cont);
            return { ...prev, todo_file: prev.todo_file.filter((a) => a.file_uuid !== id) };
        });
        setIsDirty(true);
    };

    // JSX에서 쓰는 통합 리스트 형태로 변환
    const attachments = (localCard.todo_file || [])
    .filter((b) => b.file_kind === "attach")
    .map((a) => ({
        id: a.file_uuid,
        type: a.file_type,
        src: a.file_cont,
        name: a.file_name,
        size: fmtFileSize(Number(a.file_size)),
    }));

    /* ── 저장 / 삭제 ── */
    const handleSave = async () => {
        if (!localCard.todo_name?.trim()) {
            alert("제목을 입력해주세요");
            return;
        }
    
        setSaving(true);
        try {
            const payload = {
                todo_name: localCard.todo_name,
                todo_stat: localCard.todo_stat,
                todo_tags: localCard.todo_tags || null,
                todo_subs: localCard.todo_subs || null,
            };
    
            if (!isNew) {
                const removedBlocks = (card?.todo_file || []).filter(
                    (orig) => !(localCard.todo_file || []).some((b) => b.file_uuid === orig.file_uuid)
                );
                for (const removed of removedBlocks) {
                    if (removed.file_path) {
                        await deleteTodoFile(removed.file_path).catch(console.error);
                    }
                }
            }

            const finalFileBlocks = [];
            for (const b of localCard.todo_file || []) {
                if (b._file) {
                    // 새로 업로드된 파일 (기존 로직)
                    const ext = b._file.name.split(".").pop();
                    const path = `${b.file_uuid}.${ext}`;
                    const publicUrl = await uploadTodoFile(b._file, path);
                    if (b.file_cont?.startsWith("blob:")) URL.revokeObjectURL(b.file_cont);
                    const { _file, ...rest } = b;
                    finalFileBlocks.push({ ...rest, file_cont: publicUrl, file_path: path, file_upld: true });
                } else if (b._copySrc) {
                    // 복사 대기 중인 파일 — 이제 실제로 Storage에서 복제
                    const ext = b._copySrc.split(".").pop();
                    const newPath = `${b.file_uuid}.${ext}`;
                    const publicUrl = await copyTodoFile(b._copySrc, newPath);
                    const { _copySrc, ...rest } = b;
                    finalFileBlocks.push({ ...rest, file_cont: publicUrl, file_path: newPath, file_upld: true });
                } else {
                    finalFileBlocks.push(b);
                }
            }
    
            setLocalCard((prev) => ({ ...prev, todo_file: finalFileBlocks }));
    
            if (isNew) {
                const created = await createTodo(payload);
                await saveTodoFile(created.todo_uuid, finalFileBlocks, []);
                await saveTodoChck(created.todo_uuid, localCard.todo_chck, []);
                await saveTodoAlarm(created.todo_uuid, localCard.todo_alrm || [], []);   // 추가
            } else {
                await updateTodo(localCard.todo_uuid, payload);
                await saveTodoFile(localCard.todo_uuid, finalFileBlocks, card?.todo_file || []);
                await saveTodoChck(localCard.todo_uuid, localCard.todo_chck, card?.todo_chck || []);
                await saveTodoAlarm(localCard.todo_uuid, localCard.todo_alrm || [], card?.todo_alrm || []);   // 추가
            }
            setIsDirty(false);
            isDirtyRef.current = false;
            onBack();
        } catch (err) {
            console.error("저장 실패:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleCopyCard = () => {
        if (isDirty) {
            alert("저장되지 않은 변경사항이 있습니다. 먼저 저장한 후 복사해주세요.");
            closeDropdown();
            return;
        }
    
        const copiedFileBlocks = (localCard.todo_file || []).map((b) => {
            const newUuid = crypto.randomUUID();
            if (b.file_path) {
                // 실제 복사는 저장 시점으로 미룸 — 원본 경로만 기억해둠
                return { ...b, file_uuid: newUuid, _copySrc: b.file_path };
            }
            return { ...b, file_uuid: newUuid };
        });
    
        const copiedGroups = (localCard.todo_chck || []).map((g) => ({
            ...g,
            chck_uuid: crypto.randomUUID(),
            todo_chck_item: (g.todo_chck_item || []).map((it) => ({
                ...it,
                item_uuid: crypto.randomUUID(),
            })),
        }));

        setLocalCard((prev) => ({
            ...prev,
            todo_uuid: null,
            todo_name: `${prev.todo_name} (복사본)`,
            todo_file: copiedFileBlocks,
            todo_chck: copiedGroups,
            todo_alrm: [],
        }));

        setAcctLinked([]);
        setIsDirty(true);
        closeDropdown();
    };

    const handleDelete = async () => {
        const ok = window.confirm("카드를 삭제하시겠습니까?");
        if (!ok) return;
        try {
        await deleteTodo(localCard.todo_uuid);
        onBack();
        } catch (err) {
        console.error("삭제 실패:", err);
        }
    };

    const handleBackClick = () => onBack();

    return (
        <div className="detail-screen">
        <div className="detail-hdr">
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={loading ? onBack : handleBackClick}>
            <span style={{ fontSize: 20, color: "#1e2a3a" }}>←</span>
            <span className="detail-hdr-title">Card Details</span>
            </div>

            {!loading && openDropdown && openDropdown !== "menu" && <div className="filter-backdrop" onClick={closeDropdown} />}

            <div style={{ position: "relative" }}>
            <div
                onClick={() => !loading && !isNew && toggleDropdown("menu")}
                style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: -1,
                    color: openDropdown === "menu" ? "#1e2a3a" : "#9ca3af",
                    background: openDropdown === "menu" ? "#f0f2f7" : "transparent",
                    cursor: (loading || isNew) ? "default" : "pointer",
                    transition: "background 0.15s, color 0.15s",
                    visibility: (loading || isNew) ? "hidden" : "visible",
                    pointerEvents: (loading || isNew) ? "none" : "auto",
                }}
                onMouseEnter={(e) => { if (!loading && !isNew && openDropdown !== "menu") e.currentTarget.style.background = "#f5f6f8"; }}
                onMouseLeave={(e) => { if (openDropdown !== "menu") e.currentTarget.style.background = "transparent"; }}
            >
                ···
            </div>
            </div>
        </div>

        {!loading && !isNew && openDropdown === "menu" && (
        <div className="modal-overlay" onClick={closeDropdown} style={{ zIndex: 300 }}>
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: "24px 20px 36px" }}>
                <div className="modal-close" onClick={closeDropdown}>✕</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1e2a3a" }}>카드 관리</div>
                <div style={{ fontSize: 13, color: "#5b6472", marginTop: 4 }}>
                    {localCard.todo_name || "(제목 없음)"}
                </div>

                <div
                    onClick={() => { if (!copying) { closeDropdown(); handleCopyCard(); } }}
                    style={{
                        display: "flex", alignItems: "center", gap: 14,
                        marginTop: 18, padding: "14px 4px",
                        cursor: copying ? "not-allowed" : "pointer",
                        opacity: copying ? 0.5 : 1,
                    }}
                >
                    <span style={{ color: "#2f6fd6", display: "flex" }}><SvgIcon.Copy /></span>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1e2a3a" }}>{copying ? "복사 중..." : "카드 복사"}</div>
                        <div style={{ fontSize: 12, color: "#5b6472", marginTop: 3 }}>내용·체크리스트를 그대로 새 카드로 만들어요</div>
                    </div>
                </div>

                <div style={{ height: 1, background: "#eef0f4", margin: "4px 0" }} />

                <div
                    onClick={() => { closeDropdown(); handleDelete(); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 4px", cursor: "pointer" }}
                >
                    <span style={{ color: "#d9463f", display: "flex" }}><SvgIcon.Trash /></span>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#d9463f" }}>카드 삭제</div>
                        <div style={{ fontSize: 12, color: "#5b6472", marginTop: 3 }}>삭제하면 되돌릴 수 없어요</div>
                    </div>
                </div>
            </div>
        </div>
    )}

        {loading ? (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    minHeight: "60vh",
                }}
            >
                <span
                    style={{
                        width: 32,
                        height: 32,
                        border: "3px solid #eef0f4",
                        borderTopColor: "#4a8ef5",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "skeletonSpin 0.7s linear infinite",
                    }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>로딩중...</span>
            </div>
        ) : !localCard ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#9ca3af" }}>데이터를 찾을 수 없습니다</div>
        ) : (
        <div className="detail-body">
            {/* Title */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
            {localCard.todo_subs && (
                <span
                style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: activeTagInfo?.code_fgcl || "#4a8ef5",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                }}
                >
                [{activeSubInfo?.code_cdnm}]
                </span>
            )}

            <input
                className="detail-card-title-input"
                placeholder="제목을 입력하세요"
                value={localCard.todo_name || ""}
                onChange={(e) => handleChange("todo_name", e.target.value)}
                style={{ marginBottom: 0 }}
            />
            </div>

            {/* Board + Status */}
            <div className="detail-meta-row">
            <div className="detail-board-info"><SvgIcon.Board /> Card List</div>
            <div style={{ position: "relative" }}>
                <div
                className="status-badge"
                onClick={() => toggleDropdown("status")}
                style={{
                    background: `${activeStatusInfo?.code_bgcl}20`,
                    color: activeStatusInfo?.code_bgcl,
                    border: `1.5px solid ${activeStatusInfo?.code_bgcl}`,
                    fontWeight: 600,
                }}
                >
                <span className="status-badge-icon"><SvgIcon icon={activeStatusInfo?.code_icon} /></span>
                <span>{activeStatusInfo?.code_cdnm} </span>
                </div>

                {openDropdown === "status" && (
                <div
                    style={{
                    position: "absolute",
                    right: 0,
                    top: "110%",
                    background: "#fff",
                    border: "1px solid rgba(20,24,33,0.06)",
                    borderRadius: 16,
                    zIndex: 50,
                    minWidth: 240,
                    padding: 12,
                    boxShadow: "0 12px 24px rgba(20,24,33,0.1)",
                    }}
                >
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}> * 상태값 선택</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                    
                    {status?.map((s) => {
                    const isActive = localCard.todo_stat === s.code_cdid;

                    return (
                        <span
                        key={s.code_cdid}
                        onClick={() => {
                            handleChange("todo_stat", s.code_cdid);
                            closeDropdown();
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "10px 12px",
                            borderRadius: 100,
                            fontSize: 14,
                            fontWeight: isActive ? 600 : 400,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                            background: `${s.code_bgcl}20`,
                            color: s.code_bgcl,
                            border: isActive ? `1px solid ${s.code_bgcl}` : "1px solid transparent",
                            transition: "border 0.15s",
                        }}
                        >
                        {s.code_icon && (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 17, height: 17, flexShrink: 0 }}>
                                <SvgIcon icon={s.code_icon} />
                            </span>
                        )}
                        {s.code_cdnm}
                        {isActive && <span style={{ fontSize: 11, marginLeft: 1 }}>✓</span>}
                        </span>
                    );
                    })}
                    </div>
                </div>
                )}
            </div>
            </div>

            {/* Properties 헤더 */}
            <div style={{ marginBottom: 20 }}>
            <div className="detail-section-hdr" style={{ marginBottom: secOpen.props ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                    style={{ fontSize: 15, color: secOpen.props ? "#4a8ef5" : "#9ca3af", cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSec("props")}
                >
                    ✓
                </span>
                <span className="detail-section-lbl">Properties</span>
                </div>
            </div>

            {secOpen.props && (
                <div className="props-chips" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {/* TAG */}
                <div style={{ position: "relative" }}>
                    <div
                    className={`prop-chip ${activeTagInfo ? "tagged" : ""}`}
                    style={
                        activeTagInfo
                        ? { background: activeTagInfo.code_bgcl, color: activeTagInfo.code_fgcl, borderColor: activeTagInfo.code_fgcl, cursor: "pointer" }
                        : { cursor: "pointer" }
                    }
                    onClick={() => toggleDropdown("tags")}
                    >
                    <SvgIcon.Tag />
                    {activeTagInfo ? activeTagInfo.code_cdnm : "Tags"}
                    </div>

                    {openDropdown === "tags" && (
                    <div style={{ position: "absolute", right: 0, top: "110%", left: 0, background: "#fff", border: "1px solid rgba(20,24,33,0.06)", borderRadius: 16, zIndex: 50, minWidth: 200, padding: 12, boxShadow: "0 12px 24px rgba(20,24,33,0.1)" }}>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>* 대분류 선택</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6 }}>
                        {tags?.map((t) => {
                        const active = localCard.todo_tags === t.code_cdid;
                        return (
                            <span
                            key={t.code_cdid}
                            onClick={() => {
                                handleChange("todo_tags", t.code_cdid);
                                handleChange("todo_subs", "");
                                closeDropdown();
                            }}
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
                                background: active ? t.code_fgcl : "#f5f6f8",
                                color: active ? "#fff" : "#6b7280",
                                transition: "background 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#eef0f4"; }}
                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#f5f6f8"; }}
                            >
                            {t.code_cdnm}
                            </span>
                        );
                        })}
                        </div>
                    </div>
                    )}
                </div>

                {/* SUB */}
                <div style={{ position: "relative" }}>
                    <div
                    className={`prop-chip ${activeSubInfo ? "tagged" : ""}`}
                    style={
                        activeSubInfo
                        ? {
                            background: activeTagInfo ? activeTagInfo.code_bgcl : "#f3f4f6",
                            color: activeTagInfo ? activeTagInfo.code_fgcl : "#6b7280",
                            borderColor: activeTagInfo ? activeTagInfo.code_fgcl : "#6b7280",
                            cursor: "pointer",
                            }
                        : { cursor: "pointer" }
                    }
                    onClick={() => toggleDropdown("subs")}
                    >
                    <SvgIcon.Tag />
                    {activeSubInfo?.code_cdnm || "Sub"}
                    </div>

                    {openDropdown === "subs" && (
                    <div style={{ position: "absolute", right: 0, top: "110%", left: 0, background: "#fff", border: "1px solid rgba(20,24,33,0.06)", borderRadius: 16, zIndex: 50, minWidth: 200, maxHeight: 260, overflowY: "auto", padding: 12, boxShadow: "0 12px 24px rgba(20,24,33,0.1)" }}>
                        {filteredSubs.length === 0 ? (
                        <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>선택 가능한 소분류가 없습니다</div>
                        ) : (
                        <>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>* 소분류 선택</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6 }}>
                        {filteredSubs.map((s) => {
                            const active = localCard.todo_subs === s.code_cdid;
                            return (
                            <span
                                key={s.code_cdid}
                                onClick={() => {
                                handleChange("todo_subs", s.code_cdid);
                                closeDropdown();
                                }}
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
                                    background: active ? (activeTagInfo?.code_fgcl || "#4a8ef5") : "#f5f6f8",
                                    color: active ? "#fff" : "#6b7280",
                                    transition: "background 0.15s, color 0.15s",
                                }}
                                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#eef0f4"; }}
                                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#f5f6f8"; }}
                            >
                                {s.code_cdnm}
                            </span>
                            );
                        })}
                        </div>
                        </>
                        )}
                    </div>
                    )}
                </div>

                {/* 알람 */}
                <div
                    className="prop-chip"
                    onClick={() => toggleDropdown("alarm")}
                    style={(localCard.todo_alrm?.length ?? 0) > 0 ? { background: "#eef3ff", color: "#4a8ef5", borderColor: "#4a8ef5", cursor: "pointer" } : { cursor: "pointer" }}
                >
                    <SvgIcon.Cal />
                    {(localCard.todo_alrm?.length ?? 0) > 0 ? `Alert · ${localCard.todo_alrm.length}개` : "Alert"}
                </div>
                {openDropdown === "alarm" && (
                    <AlarmModal
                        todoName={localCard.todo_name}
                        alarms={localCard.todo_alrm || []}
                        onChange={(list) => handleChange("todo_alrm", list)}
                        onClose={closeDropdown}
                    />
                )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <div style={{ position: "relative" }}>
                    <div
                        className="prop-chip"
                        style={acctLinked.length > 0
                            ? { background: "#eef3ff", color: "#4a8ef5", borderColor: "#4a8ef5", cursor: "pointer" }
                            : { cursor: "pointer" }}
                        onClick={() => {
                            if (isNew) { window.alert("카드를 먼저 저장한 뒤 가계부를 연동할 수 있어요."); return; }
                            toggleDropdown("acct");
                        }}
                    >
                        <SvgIcon.Cal />
                        {acctLinked.length > 0 ? `Account Book · ${acctLinked.length}건` : "Account Book"}
                    </div>
                    {openDropdown === "acct" && (
                    <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid rgba(20,24,33,0.06)", borderRadius: 16, zIndex: 50, minWidth: 220, maxHeight: 320, overflowY: "auto", padding: 12, boxShadow: "0 12px 24px rgba(20,24,33,0.1)" }}>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>* 일자 선택</div>
                        <input
                            type="date"
                            value={acctDate}
                            onChange={(e) => setAcctDate(e.target.value)}
                            style={{
                                display: "block", width: "100%", boxSizing: "border-box", minHeight: 38,
                                padding: "9px 14px", border: "none", outline: "none",
                                borderRadius: 100, background: "#f5f6f8",
                                fontSize: 13, fontWeight: 600, color: "#1e2a3a",
                                textAlign: "center", fontFamily: "inherit",
                                WebkitAppearance: "none", appearance: "none",
                                marginBottom: 6,
                            }}
                        />

                        <div style={{ fontSize: 12, color: "#9ca3af", margin: "12px 0 8px" }}>* 가계부 선택</div>
                        {(acctBooks || []).length === 0 && (
                            <div style={{ fontSize: 13, color: "#9ca3af", padding: "6px 2px" }}>등록된 가계부가 없어요</div>
                        )}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {(acctBooks || []).map((b) => (
                                <span
                                    key={b.code_cdid}
                                    onClick={() => {
                                        if (isDirty && !window.confirm("저장하지 않은 변경 내용은 사라져요. 이동할까요?")) return;
                                        closeDropdown();
                                        onOpenAcct && onOpenAcct({
                                            book: b.code_cdid,
                                            memo: (localCard.todo_name || "").trim(),
                                            todoUuid: localCard.todo_uuid,
                                            date: acctDate || null,
                                        });
                                    }}
                                    style={{
                                        padding: "7px 12px", borderRadius: 100, fontSize: 13, cursor: "pointer",
                                        background: b.code_color || "#f5f6f8", color: b.code_color ? "#374151" : "#6b7280",
                                    }}
                                >
                                    {b.code_cdnm}
                                </span>
                            ))}
                        </div>
                    </div>
                    )}
                </div>
                <div className="prop-chip"><SvgIcon.Play />Start date</div>
                <div className="prop-chip"><SvgIcon.Minus />No priority</div>
                </div>
                </div>
            )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
            <div className="detail-section-hdr" style={{ marginBottom: secOpen.desc ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                    style={{ fontSize: 15, color: secOpen.desc ? "#4a8ef5" : "#9ca3af", cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSec("desc")}
                >
                    ✓
                </span>
                <span className="detail-section-lbl">
                    Description {(localCard.todo_file?.length ?? 0) > 0 ? `(${localCard.todo_file.length})` : ""}
                </span>
                </div>
            </div>

            {secOpen.desc && (
                <div className="desc-toolbar">
                <div className="attach-add-btn" onClick={addTextBlock}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    텍스트
                </div>
                <label className="attach-add-btn" style={{ cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                    </svg>
                    사진
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleDescFileUpload} />
                </label>
                </div>
            )}

            {secOpen.desc && (
                <div className="desc-editor">
                {(localCard.todo_file || []).filter((b) => b.file_kind !== "attach").map((block) => (
                    <div key={block.file_uuid} className="desc-block" style={{ marginBottom: 8 }}>
                    {block.file_type === "text" ? (
                        <div className={block.file_clpd ? "collapsed-block" : "expanded-block"}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", userSelect: "none" }}>
                            <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                            style={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => updateBlock(block.file_uuid, { file_clpd: !block.file_clpd })}
                            >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="15" y2="12" />
                            <line x1="3" y1="18" x2="18" y2="18" />
                            </svg>
                            <input
                            style={{ fontSize: 13, color: "#374151", fontWeight: 600, flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", cursor: "text" }}
                            value={block.file_name ?? "Text"}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateBlock(block.file_uuid, { file_name: e.target.value })}
                            onBlur={(e) => { if (!e.target.value.trim()) updateBlock(block.file_uuid, { file_name: "Text" }); }}
                            />
                            <div
                            style={{ fontSize: 13, color: "#c4c9d4", padding: "0 4px", cursor: "pointer", flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); removeBlock(block.file_uuid); }}
                            >
                            ✕
                            </div>
                        </div>

                        {!block.file_clpd && <div style={{ height: 1, background: "#d7dce5", margin: "0 14px" }} />}

                        {!block.file_clpd && (
                            <textarea
                            className="desc-block-text"
                            placeholder="내용을 입력하세요..."
                            value={block.file_cont || ""}
                            onChange={(e) => updateBlock(block.file_uuid, { file_cont: e.target.value })}
                            style={{ borderRadius: 0, overflow: "hidden", resize: "none" }}
                            rows={Math.max(2, (block.file_cont || "").split("\n").length)}
                            />
                        )}
                        </div>
                    ) : (
                        <div className={block.file_clpd ? "collapsed-block" : "expanded-block"}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", userSelect: "none" }}>
                            <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                            style={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => updateBlock(block.file_uuid, { file_clpd: !block.file_clpd })}
                            >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <input
                            style={{ fontSize: 13, color: "#374151", fontWeight: 600, flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", cursor: "text" }}
                            value={block.file_name ?? "Photo"}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateBlock(block.file_uuid, { file_name: e.target.value })}
                            onBlur={(e) => { if (!e.target.value.trim()) updateBlock(block.file_uuid, { file_name: "Photo" }); }}
                            />
                            <div
                            style={{ fontSize: 13, color: "#c4c9d4", padding: "0 4px", cursor: "pointer", flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); removeBlock(block.file_uuid); }}
                            >
                            ✕
                            </div>
                        </div>

                        {!block.file_clpd && (
                            <div className="desc-block-img" style={{ borderRadius: 0, position: "relative" }}>
                            <img src={block.file_cont} alt="" onClick={() => setLightbox(block.file_cont)} style={{ borderRadius: 0 }} />
                            {saving && block._file && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 500 }}>
                                ⏳ 업로드 중...
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                    )}
                    </div>
                ))}
                </div>
            )}
            </div>

            {/* ── Checklists ── */}
            <div style={{ marginBottom: 20 }}>
            <div className="detail-section-hdr">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                    style={{ fontSize: 15, color: secOpen.checklist ? "#4a8ef5" : "#9ca3af", cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSec("checklist")}
                >
                    ✓
                </span>
                <span className="detail-section-lbl">
                    Check Lists {(localCard.todo_chck?.length ?? 0) > 0 ? `(${localCard.todo_chck.length})` : ""}
                </span>
                </div>
                <div className="icon-btn" onClick={addGroup} title="체크리스트 그룹 추가">＋</div>
            </div>

            {secOpen.checklist && (localCard.todo_chck || []).map((group) => (
                <div key={group.chck_uuid} className={`cl-group ${group.chck_clpd ? "collapsed-block" : "expanded-block"}`}>
                <div className="cl-group-hdr" onClick={() => toggleCollapse(group.chck_uuid)} style={{ cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ cursor: "pointer", flexShrink: 0 }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <polyline points="7 12 10 15 17 8" />
                    </svg>
                    <input
                    style={{ fontSize: 13, color: "#374151", fontWeight: 600, flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", cursor: "text" }}
                    value={group.chck_name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateGroupName(group.chck_uuid, e.target.value)}
                    />
                    <span className="cl-count">{checkedCount(group)}/{group.todo_chck_item.length}</span>
                    <div style={{ fontSize: 12, color: "#c4c9d4", padding: "0 4px", cursor: "pointer", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); removeGroup(group.chck_uuid); }}>✕</div>
                </div>

                {!group.chck_clpd && (
                    <>
                    <div className="cl-items">
                        {group.todo_chck_item.map((item) => (
                        <div key={item.item_uuid} className="cl-item">
                            <div
                            className={`cl-checkbox${item.item_done ? " checked" : ""}`}
                            onClick={() => toggleItemDone(group.chck_uuid, item.item_uuid, item)}
                            >
                            {item.item_done && <span className="cl-check-mark">✓</span>}
                            </div>

                            {item.item_type && (
                            <div
                                className={`cl-entry-badge${item.item_type === "추첨" ? " lottery" : item.item_type === "선착순" ? " fcfs" : item.item_type === "실패" ? " fail" : ""}`}
                                onClick={() => setDateModalTarget({ gid: group.chck_uuid, iid: item.item_uuid })}
                            >
                                {item.item_type}{item.item_rslt === "O" ? "O" : item.item_rslt === "X" ? "X" : ""}
                            </div>
                            )}

                            <input
                            className={`cl-item-title${item.item_done ? " done" : ""}`}
                            value={item.item_name}
                            placeholder="항목 입력..."
                            onChange={(e) => updateItem(group.chck_uuid, item.item_uuid, { item_name: e.target.value })}
                            />

                            <div
                            className="cl-item-date-input"
                            onClick={() => setDateModalTarget({ gid: group.chck_uuid, iid: item.item_uuid })}
                            style={{ color: item.item_date ? "#6b7280" : "#c4c9d4", cursor: "pointer" }}
                            >
                            {item.item_date || "날짜 선택"}
                            </div>

                            <div
                            style={{ fontSize: 10, color: "#c4c9d4", padding: "0 4px", cursor: "pointer", flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); removeItem(group.chck_uuid, item.item_uuid); }}
                            >
                            ✕
                            </div>
                        </div>
                        ))}
                    </div>

                    <div style={{ display: "flex" }}>
                        <div className="cl-add-item" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => addItem(group.chck_uuid)}>
                        ＋ Add item
                        </div>
                        <div className="cl-add-item" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => openRepeatModal(group.chck_uuid)}>
                        ↻ 반복 item
                        </div>
                    </div>
                    </>
                )}
                </div>
            ))}

            {secOpen.checklist && (localCard.todo_chck?.length ?? 0) === 0 && (
                <div style={{ color: "#9ca3af", fontSize: 14, padding: "8px 0 8px" }}>＋ 버튼을 눌러 체크리스트를 추가하세요</div>
            )}
            </div>

            {repeatModalTarget && (
                <CheckListItemRepeatPicker
                    onClose={() => setRepeatModalTarget(null)}
                    onConfirm={handleRepeatConfirm}
                />
            )}

            {/* 날짜 선택 모달 */}
            {dateModalTarget && (
            <CheckListModal
                initialDate={
                localCard.todo_chck
                    .find((g) => g.chck_uuid === dateModalTarget.gid)
                    ?.todo_chck_item.find((it) => it.item_uuid === dateModalTarget.iid)?.item_date
                }
                initialEntryType={
                localCard.todo_chck
                    .find((g) => g.chck_uuid === dateModalTarget.gid)
                    ?.todo_chck_item.find((it) => it.item_uuid === dateModalTarget.iid)?.item_type
                }
                initialWon={(() => {
                const it = localCard.todo_chck
                    .find((g) => g.chck_uuid === dateModalTarget.gid)
                    ?.todo_chck_item.find((it) => it.item_uuid === dateModalTarget.iid);
                return it?.item_rslt === "O" ? true : it?.item_rslt === "X" ? false : null;
                })()}
                onClose={() => setDateModalTarget(null)}
                onConfirm={handleDateConfirm}
            />
            )}

            {/* ── Attachments ── */}
            <div style={{ marginBottom: 24 }}>
            <div className="detail-section-hdr">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, color: secOpen.attach ? "#4a8ef5" : "#9ca3af", cursor: "pointer", userSelect: "none" }} onClick={() => toggleSec("attach")}>✓</span>
                <span className="detail-section-lbl">Attachments {attachments.length > 0 ? `(${attachments.length})` : ""}</span>
                </div>
            </div>
            {secOpen.attach && (
                <>
                {attachments.length > 0 && (
                    <div className="attach-list">
                    {attachments.map(a => (
                        <div key={a.id} className="attach-file-row">
                        <div
                            className="attach-file-icon"
                            style={{ background: a.type === "image" ? "transparent" : "#fff", padding: a.type === "image" ? 0 : undefined, overflow: "hidden" }}
                            onClick={() => a.type === "image" && setLightbox(a.src)}
                        >
                            {a.type === "image"
                            ? <img src={a.src} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, cursor: "zoom-in" }} />
                            : fileIcon(a.name)
                            }
                        </div>
                        <div className="attach-file-info">
                            <div className="attach-file-name">{a.name}</div>
                            <div className="attach-file-size">{a.type === "image" ? "이미지" : a.size}</div>
                        </div>
                        <div className="attach-file-del" onClick={() => removeAttach(a.id)}>✕</div>
                        </div>
                    ))}
                    </div>
                )}
                <label className="attach-add-btn" style={{ width: "100%" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    파일 첨부
                    <input type="file" multiple style={{ display: "none" }} onChange={handleAttachFileUpload} />
                </label>
                {attachments.length === 0 && (
                    <div style={{ color: "#9ca3af", fontSize: 13, padding: "8px 0 4px", textAlign: "center"}}>첨부된 파일이 없습니다</div>
                )}
                </>
            )}
            </div>

            {/* 저장 버튼 */}
            <div
            onClick={(!saving && isDirty) ? handleSave : undefined}
            style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                textAlign: "center",
                fontSize: 16,
                fontWeight: 700,
                cursor: (!saving && isDirty) ? "pointer" : "not-allowed",
                background: (!saving && isDirty) ? "#4a8ef5" : "#e5e7eb",
                color: (!saving && isDirty) ? "#fff" : "#9ca3af",
                marginTop: 24,
            }}
            >
            {saving ? "저장 중..." : isNew ? "생성" : "저장"}
            </div>
                    </div>
        )}

        {/* Lightbox */}
        {lightbox && (
            <div
            onClick={() => setLightbox(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
            <img src={lightbox} alt="" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 8 }} />
            </div>
        )}

        {/* 뒤로가기 시 저장 확인 팝업 */}
        {showLeaveConfirm && (
            <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)} style={{ zIndex: 500 }}>
                <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: "20px 24px 32px" }}>
                    {/* 닫기 버튼 */}
                    <div className="modal-close" onClick={() => setShowLeaveConfirm(false)}>✕</div>

                    <div style={{ margin: "0 auto 20px" }} />
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, textAlign: "center" }}>저장하지 않은 변경사항이 있습니다</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24, textAlign: "center" }}>변경사항을 저장하시겠습니까?</div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <div
                            onClick={() => {
                                setShowLeaveConfirm(false);
                                isDirtyRef.current = false;
                                onBack();
                            }}
                            style={{
                                flex: 1,
                                padding: "14px 0",
                                borderRadius: 14,
                                textAlign: "center",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                background: "#f0f2f7",
                                color: "#6b7280"
                            }}
                        >
                            저장하지 않고 나가기
                        </div>

                        <div
                            onClick={() => {
                                setShowLeaveConfirm(false);
                                isDirtyRef.current = false;
                                handleSave();
                            }}
                            style={{
                                flex: 1,
                                padding: "14px 0",
                                borderRadius: 14,
                                textAlign: "center",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                background: "#4a8ef5",
                                color: "#fff"
                            }}
                        >
                            저장
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}

export default CardDetail;