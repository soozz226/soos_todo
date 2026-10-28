// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = email.trim() && password && !busy;

    const handleLogin = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });
    if (error) {
        console.error("로그인 실패:", error);
        setError("이메일 또는 비밀번호를 확인해 주세요.");
        setBusy(false);
    }
    // 성공하면 App.jsx 의 onAuthStateChange 가 알아서 화면을 바꿔줌
    };

    const inputStyle = {
    width: "100%", height: 48, border: "1.5px solid #dde1ea", borderRadius: 12,
    padding: "0 14px", fontSize: 15, fontFamily: "inherit", outline: "none",
    color: "#1e2a3a", background: "#fff", boxSizing: "border-box",
    };

    return (
    <div style={{ minHeight: "100vh", background: "#f0f2f7", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1e2a3a", marginBottom: 6 }}>로그인</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>soo's ToDo</div>

        <input
        style={{ ...inputStyle, marginBottom: 10 }}
        type="email"
        placeholder="이메일"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
        <input
        style={{ ...inputStyle, marginBottom: 12 }}
        type="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
        />

        {error && <div style={{ fontSize: 13, color: "#d9463f", marginBottom: 12 }}>{error}</div>}

        <div
        onClick={handleLogin}
        style={{
            width: "100%", padding: "14px 0", borderRadius: 14, textAlign: "center",
            fontSize: 16, fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            background: canSubmit ? "#4a8ef5" : "#e5e7eb",
            color: canSubmit ? "#fff" : "#9ca3af",
        }}
        >
        {busy ? "로그인 중..." : "로그인"}
        </div>
    </div>
    );
}

export default Login;