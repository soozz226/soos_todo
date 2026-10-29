function Loading() {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: "60vh" }}>
        <span style={{ width: 32, height: 32, border: "3px solid #eef0f4", borderTopColor: "#4a8ef5", borderRadius: "50%", display: "inline-block", animation: "skeletonSpin 0.7s linear infinite" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>로딩중...</span>
      </div>
    );
  }
  
  export default Loading;