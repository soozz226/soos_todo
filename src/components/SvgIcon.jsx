// src/components/SvgIcon.jsx
// 아이콘 공통 파일 (기존 src/etc/icons.jsx 의 Ico 와 SvgIcon 을 하나로 합침)
//
// 사용법
//   <SvgIcon.Search />                              ← 코드 안에 있는 고정 UI 아이콘 (예전 <SvgIcon.Search />)
//   <SvgIcon icon={code_icon} className="..." />    ← DB 에 저장된 SVG 문자열(상태 아이콘, 가계부 항목 아이콘)
//
// 새 고정 아이콘을 추가하려면 아래 icons 객체에 한 줄 추가하면 됨
// (이름을 name, length 처럼 함수가 원래 가진 속성 이름으로 짓지 말 것)

/* ────────────────── SVG Icons ────────────────── */
const icons = {
    Board: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>
        </svg>
    ),
    Page: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
    ),
    Clip: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
    ),
    Check: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
    ),
    User: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    AccountBook: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
        <path d="M6 7h12M6 11h8"/>
        <path d="M12 14h4v4h-4z"/>
        </svg>
    ),
    Tag: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
    ),
    Play: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
    ),
    Cal: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    Minus: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    ),
    Box: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
    ),

    Todo2: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="4" height="4" rx="1"/>
            <path d="M9 6h12"/>

            <rect x="3" y="10" width="4" height="4" rx="1"/>
            <path d="M9 12h12"/>

            <rect x="3" y="16" width="4" height="4" rx="1"/>
            <path d="M9 18h12"/>
        </svg>
    ),

    /* 상태 아이콘 4개 — DB(todo_code.code_icon)가 SVG 문자열로 바뀌기 전까지 대신 사용됨 */
    Backlog: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="3"/>
        <line x1="8" y1="9" x2="16" y2="9"/>
        <line x1="8" y1="13" x2="13" y2="13"/>
        </svg>
    ),

    ToDo: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="3"/>
        <polyline points="8 12 11 15 16 9"/>
        </svg>
    ),

    Doing: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 8v5l3 2"/>
        </svg>
    ),

    Done: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="8 12 11 15 16 9"/>
        </svg>
    ),

    Sync: () => (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/>
        <path d="M3 21v-5h5"/>
        </svg>
    ),

    Search: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),

    Copy: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
    ),

    Trash: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7H20" strokeLinecap="round" />
            <path d="M9 3H15" strokeLinecap="round" />

            <path
                d="M18 7L17.2 18.2C17.1 19.2 16.3 20 15.3 20H8.7C7.7 20 6.9 19.2 6.8 18.2L6 7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path d="M10 11V16" strokeLinecap="round" />
            <path d="M14 11V16" strokeLinecap="round" />
        </svg>
    ),

    Alarm: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),

    Upload: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
    ),

    // 톱니바퀴 (설정) — 화면마다 복붙돼 있던 SVG 를 하나로 모은 것. 아직 안 바꿨다면 안 써도 됨
    Settings: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),

    // 사용처를 아직 못 찾은 아이콘 (기존 icons.jsx 에 있던 것을 그대로 옮김)
    Test: () => (
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M16.5,0c-4.206,0-7.5,1.977-7.5,4.5v2.587c-.484-.057-.985-.087-1.5-.087C3.294,7,0,8.977,0,11.5v8c0,2.523,3.294,4.5,7.5,4.5,3.416,0,6.231-1.304,7.167-3.146,.597,.087,1.207,.146,1.833,.146,4.206,0,7.5-1.977,7.5-4.5V4.5c0-2.523-3.294-4.5-7.5-4.5Zm0,2c3.148,0,5.5,1.32,5.5,2.5s-2.352,2.5-5.5,2.5-5.5-1.32-5.5-2.5,2.352-2.5,5.5-2.5ZM7.5,9c3.148,0,5.5,1.32,5.5,2.5s-2.352,2.5-5.5,2.5-5.5-1.32-5.5-2.5,2.352-2.5,5.5-2.5ZM2,14.582c1.36,.875,3.303,1.418,5.5,1.418s4.14-.543,5.5-1.418v.918c0,1.18-2.352,2.5-5.5,2.5s-5.5-1.32-5.5-2.5v-.918Zm5.5,7.418c-3.148,0-5.5-1.32-5.5-2.5v-.918c1.36,.875,3.303,1.418,5.5,1.418s4.14-.543,5.5-1.418v.918c0,1.18-2.352,2.5-5.5,2.5Zm9-3c-.514,0-1.012-.047-1.5-.116v-1.98c.492,.058,.99,.096,1.5,.096,2.197,0,4.14-.543,5.5-1.418v.918c0,1.18-2.352,2.5-5.5,2.5Zm0-4c-.514,0-1.012-.047-1.5-.116v-1.98c.492,.058,.99,.096,1.5,.096,2.197,0,4.14-.543,5.5-1.418v.918c0,1.18-2.352,2.5-5.5,2.5Zm0-4c-.542,0-1.066-.051-1.578-.127-.198-.887-.809-1.684-1.721-2.321,.992,.285,2.106,.449,3.299,.449,2.197,0,4.14-.543,5.5-1.418v.918c0,1.18-2.352,2.5-5.5,2.5Z"/></svg>
    ),
};

/* ────────────────── DB 에 저장된 SVG 문자열 그리기 ──────────────────
icon 이 "<svg" 로 시작하면 문자열 그대로 그림
   아직 문자열로 바뀌지 않은 옛 값(예: "Backlog")은 위 icons 의 아이콘으로 대신 그림 */
function SvgIcon({ icon, className }) {
    if (!icon) return null;

    if (icon.trim().startsWith("<svg")) {
        return <span className={className} dangerouslySetInnerHTML={{ __html: icon }} />;
    }

    const Fallback = icons[icon];
    return Fallback ? <Fallback /> : null;
}

// 고정 UI 아이콘을 SvgIcon.Search, SvgIcon.Check 처럼 쓸 수 있게 붙여줌
Object.assign(SvgIcon, icons);

export default SvgIcon;