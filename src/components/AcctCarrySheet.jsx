// src/components/AcctCarrySheet.jsx
// 이월 총잔액 확정 시트
// autoAmount: 이전 달까지 자동 계산한 값 (null 이면 계산 중), autoError: 자동 계산 실패 여부
// confirmedAmount: 이미 확정된 값 (없으면 null)
import { useState, useEffect } from "react";

function AcctCarrySheet({ open, year, month, autoAmount, autoError, confirmedAmount, saving, onConfirm, onUnconfirm, onClose }) {
    const [digits, setDigits] = useState("");
    const [neg, setNeg] = useState(false);
    const [touched, setTouched] = useState(false); // 직접 고치기 시작하면 자동값으로 덮어쓰지 않음

    // 열릴 때: 확정값이 있으면 그 값, 없으면 자동 계산값으로 채움
    useEffect(() => {
    if (!open) { setTouched(false); return; }
    if (touched) return;
    const v = confirmedAmount ?? autoAmount;
    if (v == null) return;
    setNeg(v < 0);
    setDigits(String(Math.abs(v)));
    }, [open, confirmedAmount, autoAmount]);

    if (!open) return null;

    const isConfirmed = confirmedAmount != null;
    const display = digits ? Number(digits).toLocaleString() : "";
    const value = (neg ? -1 : 1) * Number(digits || 0);

    const reapplyAuto = () => {
    if (autoAmount == null) return;
    setNeg(autoAmount < 0);
    setDigits(String(Math.abs(autoAmount)));
    };

    return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
        <div className="modal-sheet acct-carry-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="acct-carry-ttl">{year}년 {month + 1}월 이월 총잔액</div>
        <div className="acct-carry-sub">
            {isConfirmed
            ? "확정된 금액이에요. 수정하거나 해제할 수 있어요."
            : "이전 달까지의 잔액을 계산한 값이에요. 고쳐서 확정할 수 있어요."}
        </div>

        <div className={`acct-carry-amount ${neg ? "neg" : ""}`}>
            <div className="acct-carry-sign" onClick={() => { setNeg((v) => !v); setTouched(true); }}>
            {neg ? "−" : "+"}
            </div>
            <input
            className="acct-carry-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            style={{ width: `${Math.max(display.length, 1) + 1}ch` }}
            value={display}
            onChange={(e) => { setDigits(e.target.value.replace(/\D/g, "").slice(0, 12)); setTouched(true); }}
            />
            <span className="acct-carry-won">원</span>
        </div>

        <div className="acct-carry-auto">
            {autoError ? (
            "자동 계산에 실패했어요. 직접 입력해 주세요."
            ) : autoAmount == null ? (
            "자동 계산 중..."
            ) : (
            <>
                자동 계산값 {autoAmount.toLocaleString()}원
                <span className="acct-carry-reapply" onClick={reapplyAuto}>다시 적용</span>
            </>
            )}
        </div>

        <button className="acct-carry-ok" disabled={saving || digits === ""} onClick={() => onConfirm(value)}>
            {saving ? "저장 중..." : isConfirmed ? "수정 확정" : "확정"}
        </button>
        {isConfirmed && (
            <div className="acct-carry-cancel" onClick={onUnconfirm}>확정 해제</div>
        )}
        </div>
    </div>
    );
}

export default AcctCarrySheet;