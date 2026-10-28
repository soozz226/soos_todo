
import { useState } from "react";
import { fmtDate } from "../../utils/dateUtils";
import { alarmSummary } from "../../utils/alarmUtils";
import AlarmRepeatPicker from "./AlarmRepeatPicker";

const inputStyle = {
width: "100%", border: "1.5px solid #dde1ea", borderRadius: 12,
padding: "12px 16px", fontSize: 16, fontFamily: "inherit",
outline: "none", color: "#1e2a3a", boxSizing: "border-box",
};
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 };

const newDraft = () => ({
alrm_uuid: null,
alrm_date: fmtDate(new Date()),
alrm_time: "09:00",
alrm_note: "",
alrm_rpt: "none",
alrm_intv: 1,
alrm_days: [],
alrm_end: "",
});

const toDraft = (a) => ({
...a,
alrm_time: (a.alrm_time || "09:00").slice(0, 5),
alrm_note: a.alrm_note || "",
alrm_days: a.alrm_days || [],
alrm_end: a.alrm_end || "",
alrm_intv: a.alrm_intv || 1,
});

function AlarmModal({ todoName, alarms, onChange, onClose }) {
const [draft, setDraft] = useState(null); // null이면 목록 화면, 값이 있으면 추가/수정 화면

const patch = (p) => setDraft((d) => ({ ...d, ...p }));
const toggleDay = (i) =>
patch({ alrm_days: draft.alrm_days.includes(i) ? draft.alrm_days.filter((d) => d !== i) : [...draft.alrm_days, i] });

const canSave =
draft &&
draft.alrm_date && draft.alrm_time &&
(!draft.alrm_end || draft.alrm_end >= draft.alrm_date);

const saveDraft = () => {
if (!canSave) return;
const isOnce = draft.alrm_rpt === "none";
const row = {
...draft,
alrm_uuid: draft.alrm_uuid || crypto.randomUUID(),
alrm_note: draft.alrm_note.trim(),
alrm_intv: isOnce ? 1 : draft.alrm_intv,
alrm_days: draft.alrm_rpt === "week" ? [...draft.alrm_days].sort() : [],
alrm_end: isOnce ? "" : draft.alrm_end,
};
const exists = alarms.some((a) => a.alrm_uuid === row.alrm_uuid);
onChange(exists ? alarms.map((a) => (a.alrm_uuid === row.alrm_uuid ? row : a)) : [...alarms, row]);
setDraft(null);
};

const removeAlarm = (id) => onChange(alarms.filter((a) => a.alrm_uuid !== id));

const sorted = [...alarms].sort((a, b) =>
`${a.alrm_date} ${(a.alrm_time || "").slice(0, 5)}`.localeCompare(`${b.alrm_date} ${(b.alrm_time || "").slice(0, 5)}`)
);

return (
<div className="modal-overlay" onClick={onClose} style={{ zIndex: 300 }}>
<div
className="modal-sheet"
onClick={(e) => e.stopPropagation()}
style={{ padding: "20px 24px 40px", maxHeight: "90vh", overflowY: "auto" }}
>
<div className="modal-close" onClick={onClose}>✕</div>
<div style={{ margin: "0 auto 20px" }} />
<div style={{ fontSize: 17, fontWeight: 700, color: "#1e2a3a", marginBottom: 6 }}>카드 알림 설정</div>
<div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>{todoName || "(제목 없음)"}</div>

{!draft ? (
    <>
    {sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "#9ca3af" }}>설정된 알림이 없어요</div>
    )}
    {sorted.map((a) => (
        <div key={a.alrm_uuid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: "1px solid #f0f2f7" }}>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setDraft(toDraft(a))}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e2a3a" }}>{alarmSummary(a)}</div>
            {a.alrm_note && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.alrm_note}
            </div>
            )}
        </div>
        <div style={{ fontSize: 14, color: "#c4c9d4", padding: "4px 6px", cursor: "pointer" }} onClick={() => removeAlarm(a.alrm_uuid)}>✕</div>
        </div>
    ))}

    <div
        onClick={() => setDraft(newDraft())}
        style={{ margin: "16px 0 20px", padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: 600, color: "#4a8ef5", border: "1.5px dashed #4a8ef5", borderRadius: 12, cursor: "pointer" }}
    >
        ＋ 알림 추가
    </div>

    <div
        onClick={onClose}
        style={{ width: "100%", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 16, fontWeight: 700, cursor: "pointer", background: "#4a8ef5", color: "#fff" }}
    >
        확인
    </div>
    </>
) : (
    <>
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
        <div style={labelStyle}>{draft.alrm_rpt === "none" ? "알림 날짜" : "시작일"}</div>
        <input type="date" value={draft.alrm_date} onChange={(e) => patch({ alrm_date: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
        <div style={labelStyle}>알림 시간</div>
        <input type="time" value={draft.alrm_time} onChange={(e) => patch({ alrm_time: e.target.value })} style={{ ...inputStyle, fontWeight: 700, textAlign: "center" }} />
        </div>
    </div>

    <AlarmRepeatPicker
        options={["none", "day", "week", "month", "year"]}
        type={draft.alrm_rpt}
        interval={draft.alrm_intv}
        weekDays={draft.alrm_days}
        startDate={draft.alrm_date}
        onType={(id) => patch({ alrm_rpt: id, alrm_intv: 1 })}
        onInterval={(n) => patch({ alrm_intv: n })}
        onToggleDay={toggleDay}
    />

    {draft.alrm_rpt !== "none" && (
        <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>종료일 <span style={{ fontWeight: 400, color: "#c4c9d4" }}>(선택, 비우면 계속 반복)</span></div>
            <input type="date" value={draft.alrm_end} min={draft.alrm_date} onChange={(e) => patch({ alrm_end: e.target.value })} style={inputStyle} />
        </div>
    )}

    

    <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>알림 메시지 <span style={{ fontWeight: 400, color: "#c4c9d4" }}>(선택)</span></div>
        <textarea
        value={draft.alrm_note}
        onChange={(e) => patch({ alrm_note: e.target.value })}
        placeholder="알림에 표시할 메시지를 입력하세요"
        rows={2}
        style={{ ...inputStyle, fontSize: 14, resize: "none", lineHeight: 1.6 }}
        />
    </div>

    <div style={{ display: "flex", gap: 8 }}>
        <div
        onClick={() => setDraft(null)}
        style={{ flex: 1, padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 15, fontWeight: 700, cursor: "pointer", background: "#f0f2f7", color: "#6b7280" }}
        >
        취소
        </div>
        <div
        onClick={saveDraft}
        style={{
            flex: 2, padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 16, fontWeight: 700,
            cursor: canSave ? "pointer" : "not-allowed",
            background: canSave ? "#4a8ef5" : "#e5e7eb", color: canSave ? "#fff" : "#9ca3af",
        }}
        >
        {draft.alrm_uuid ? "수정" : "추가"}
        </div>
    </div>
    </>
)}
</div>
</div>
);
}

export default AlarmModal;