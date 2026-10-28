/* ────────────────── Styles ────────────────── */
const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; }
.app { background: #f0f2f7; min-height: 100vh; }

/* ── Welcome ── */
.welcome-screen { max-width: 100%; margin: 0 auto; padding: 24px 20px; min-height: 100vh;background: #f0f2f7;  }
.back-row { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: #1e2a3a; margin-bottom: 28px; cursor: pointer; }
.workspace-row { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.ws-icon-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ws-name { font-size: 20px; font-weight: 600; color: #1e2a3a; margin-bottom: 4px; }
.ws-meta { font-size: 14px; color: #6b7280; }
.sec-title { font-size: 17px; font-weight: 600; color: #1e2a3a; margin-bottom: 12px; }
.sec { margin-bottom: 24px; }
.li-text { flex: 1; }
.li-name { font-size: 16px; font-weight: 500; color: #1e2a3a; }
.chevron { color: #9ca3af; font-size: 20px; }
.ws-icon { width: 72px; height: 72px; background: #dde8f7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; overflow: hidden; }
.list-item { background: #fff; border-radius: 18px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; margin-bottom: 12px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.06); transition: background .15s; }
.list-item:hover { background: #f7f8fb; }
.li-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.li-icon svg { width: 26px; height: 26px; }
.li-icon.blue { background: #e8f1ff; color: #2f6fd6; }
.li-icon.green { background: #eaf6ec; color: #2e7d46; }
.li-icon.orange { background: #fff3e0; color: #b36a00; }
.li-type { font-size: 12px; color: #5b6472; }

/* ── Board ── */
.board-screen { max-width: 100%; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background:#f5f6f8; }
.board-hdr { background: #fff; padding: 16px 20px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #e5e7eb; }
.board-hdr-left { flex: 1; }
.board-sub { font-size: 12px; color: #6b7280; }
.board-ttl { font-size: 20px; font-weight: 700; color: #1e2a3a; }
.hdr-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #1e2a3a; cursor: pointer; border-radius: 8px; transition: background .15s; }
.hdr-btn:hover { background: #f0f2f7; }
.hdr-btn.syncing { pointer-events: none; opacity: .6; }
.hdr-btn.syncing svg { animation: spin .8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.status-tabs { display: flex; overflow-x: auto; background: #fff; border-bottom: 1px solid #e5e7eb; scrollbar-width: none; }
.status-tabs::-webkit-scrollbar { display: none; }
.stab { padding: 10px 20px; font-size: 14px; font-weight: 500; color: #9ca3af; cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; transition: all .15s; display: flex; align-items: center; gap: 6px; }
.stab.active { color: #1e2a3a; border-bottom-color: #1e2a3a; }
.filter-row { display: flex; gap: 6px; }
.filter-dropdown { position: relative; }
.filter-btn { display: flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 7px; background: #dde1ea; border: 1.5px solid transparent; font-size: 11px; color: #1e2a3a; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background .12s; }
.filter-btn:hover { background: #d1d6e0; }
.filter-btn.active { border-color: #4a8ef5; color: #1e5aa8; }
.filter-chevron { font-size: 10px; line-height: 1; color: #9ca3af; transition: transform .15s; }
.filter-btn.open .filter-chevron { transform: rotate(180deg); }
.filter-menu { position: absolute; top: calc(100% + 5px); right: 0; min-width: 96px; background: #fff; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06); overflow: hidden; z-index: 30; }
.filter-menu-item { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 7px 10px; font-size: 12px; color: #1e2a3a; cursor: pointer; white-space: nowrap; transition: background .1s; }
.filter-menu-item:hover { background: #f5f6fa; }
.filter-menu-item.sel { background: #eef4fc; color: #1e5aa8; font-weight: 600; }
.filter-menu-item svg { width: 13px; height: 13px; color: #1e5aa8; flex-shrink: 0; }
.filter-menu-label { display: flex; align-items: center; }
.filter-menu-tag { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 8px; }
.filter-backdrop { position: fixed; inset: 0; z-index: 15; }
.column { padding: 16px; flex: 1; overflow-y: auto; }
.col-hdr { display: flex; align-items: center; gap: 8px; background: #e8ebf2; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; align-items:center; position: relative; z-index: 20; }
.col-hdr-spacer { flex: 1; }
.col-ico { font-size: 16px; color: #6b7280; align-items:center; line-height:0; justify-content:center;}
.col-lbl { font-size: 15px; font-weight: 600; color: #1e2a3a; }
.col-ico svg{display:block;}
.col-cnt { background: #c7cad4; color: #1e2a3a; font-size: 13px; font-weight: 600; padding: 2px 9px; border-radius: 20px; }
.card { background: #fff; border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: box-shadow .15s; }
.card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.card-grid { display: grid; grid-template-columns: auto 1fr auto; grid-template-rows: auto auto; column-gap: 12px; align-items: center; }
.card-cat-circle { grid-column: 1; grid-row: 1 / 3; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; font-weight: 700; line-height: 1.15; word-break: keep-all; padding: 2px; flex-shrink: 0; }
.card-main { grid-column: 2; grid-row: 1 / 3; font-size: 15px; font-weight: 500; color: #1e2a3a; line-height: 1.4; min-width: 0; overflow-wrap: break-word; }
.card-subtype { font-weight: 700; margin-right: 4px; }
.card-progress { grid-column: 3; grid-row: 1 / 3; display: flex; align-items: center; gap: 4px; font-size: 13px; color: #9ca3af; white-space: nowrap; flex-shrink: 0; }
.card-ttl { font-size: 15px; font-weight: 500; color: #1e2a3a; margin-bottom: 10px; line-height: 1.4; }
.card-tag { display: inline-block; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; }
.card-foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.card-meta { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #9ca3af; }
.empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }
.filter-search-btn { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #1e2a3a; cursor: pointer; border-radius: 8px; transition: background .15s; }
.filter-search-btn:hover { background: #f5f6fa; }

.search-bar {
padding: 0 12px 12px 12px;
margin-top: -3px;
position: relative;
}

.search-bar-inner {
display: flex;
align-items: center;
gap: 8px;
border-bottom: 1.5px solid #c5cadb;
padding: 0 0 8px 0;
}

.search-bar-input {
flex: 1;
min-width: 0;
border: none;
outline: none;
background: transparent;
font-size: 14px;
color: #2d3142;
padding: 2px 0;
}

.search-bar-input::placeholder {
color: #9aa0b4;
}

.search-bar-icon {
color: #8a8fa3;
font-size: 16px;
display: flex;
align-items: center;
flex-shrink: 0;
}

/* ── Create Card ── */
.create-screen { max-width: 100%; margin: 0 auto; min-height: 100vh; background: #f5f6fa; display: flex; flex-direction: column; }
.create-hdr { background: #f5f6fa; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
.create-cancel { font-size: 16px; color: #4a8ef5; cursor: pointer; }
.create-heading { font-size: 17px; font-weight: 700; color: #1e2a3a; }
.create-btn { border: none; font-family: inherit; font-size: 15px; font-weight: 600; padding: 9px 22px; border-radius: 22px; cursor: not-allowed; transition: all .2s; background: #e5e7eb; color: #adb5bd; }
.create-btn.active { background: #d1d5db; color: #1e2a3a; cursor: pointer; }
.create-div { height: 1px; background: #e5e7eb; }
.title-wrap { background: #fff; padding: 6px 20px 2px; }
.title-field { position: relative; }
.title-lbl { position: absolute; top: 14px; left: 0; font-size: 13px; color: #4a8ef5; font-weight: 500; pointer-events: none; }
.title-inp { width: 100%; border: none; border-bottom: 2px solid #4a8ef5; outline: none; font-size: 16px; color: #1e2a3a; padding: 30px 0 10px; background: transparent; font-family: inherit; }
.desc-wrap { margin: 12px 16px 0; background: #fff; border: 1px solid #dde1ea; border-radius: 14px; padding: 14px 16px; }
.desc-lbl { font-size: 13px; color: #9ca3af; margin-bottom: 6px; }
.desc-area { width: 100%; border: none; outline: none; resize: none; font-size: 15px; color: #1e2a3a; min-height: 96px; background: transparent; font-family: inherit; line-height: 1.6; }
.desc-area::placeholder { color: #c4c9d4; }
.meta-block { background: #fff; margin-top: 16px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
.meta-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f0f2f7; cursor: pointer; }
.meta-row:last-child { border-bottom: none; }
.meta-key { font-size: 15px; color: #1e2a3a; }
.meta-val { display: flex; align-items: center; gap: 5px; font-size: 15px; color: #6b7280; }
.meta-arr { color: #9ca3af; }
.status-picker { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; margin: 6px 16px 0; overflow: hidden; }
.sp-item { display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-bottom: 1px solid #f0f2f7; cursor: pointer; transition: background .1s; }
.sp-item:last-child { border-bottom: none; }
.sp-item:hover { background: #f5f6fa; }
.sp-item.sel { background: #f0f2f7; }
.sp-lbl { font-size: 15px; color: #1e2a3a; flex: 1; }
.sp-chk { color: #4a8ef5; font-size: 16px; font-weight: 700; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; padding: 14px 16px; }
.chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1.5px solid #dde1ea; border-radius: 22px; font-size: 13px; color: #4a5568; cursor: pointer; background: #fff; white-space: nowrap; transition: background .12s; }
.chip:hover { background: #f5f6fa; }

/* ── Card Details ── */
.detail-screen { max-width: 100%; margin: 0 auto; min-height: 100vh; background: #f5f6fa; overflow-y: auto; }
.detail-hdr { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #f5f6fa; }
.detail-hdr-title { font-size: 17px; font-weight: 700; color: #1e2a3a; }
.detail-body { padding: 0 20px 40px; }
.detail-card-title { font-size: 24px; font-weight: 700; color: #1e2a3a; margin-bottom: 16px; line-height: 1.3; }
.detail-card-title-input { font-size: 22px; font-weight: 700; color: #1e2a3a; border: none; outline: none; background: transparent; font-family: inherit; width: 100%; margin-bottom: 16px; line-height: 1.3; }
.detail-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.detail-board-info { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 14px; }
.status-badge { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #e8ebf2; border-radius: 20px; font-size: 14px; font-weight: 500; color: #1e2a3a; cursor: pointer; transition: background .15s; }
.status-badge:hover { background: #d8dce8; }
.detail-section-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.detail-section-lbl { font-size: 16px; font-weight: 700; color: #1e2a3a; }
.icon-btn { width: 20px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; border-radius: 6px; transition: background .15s; font-size: 18px; }
.icon-btn:hover { background: #e8ebf2; }
.detail-card-title-input::placeholder { color: #9ca3af; font-weight: 400;}
.status-badge-icon svg{ display:block; width:17px; height:17px;}





.custom-dropdown {
position: absolute;
top: 120%;
right: 0;
background: #fff;
border: 1px solid #e5e7eb;
border-radius: 12px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
overflow: hidden;
z-index: 100;
min-width: 140px;
}

.dropdown-item-blue {
display: flex;
gap: 8px;
align-items: center;
padding: 12px 14px;
cursor: pointer;
color: #4a8ef5;
font-size: 14px;
font-weight: 600;
border-bottom: 1px solid #f0f2f7;
background: transparent;
transition: background 0.15s;
}

.dropdown-item-blue:hover {
background: #f0f5ff;
}


.dropdown-item-danger {
display: flex;
gap: 8px;
align-items: center;
padding: 12px 14px;
cursor: pointer;
color: #ef4444;
font-size: 14px;
font-weight: 600;
background: transparent;
transition: background 0.15s;
}

.dropdown-item-danger:hover {
background: #fef2f2;
}






/* Properties chips in detail */
.props-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.prop-chip { display: flex; align-items: center; gap: 6px; padding: 9px 14px; border: 1.5px solid #dde1ea; border-radius: 22px; font-size: 13px; color: #4a5568; cursor: pointer; background: #fff; white-space: nowrap; }
.prop-chip.tagged { border-color: #00897b; background: #e0f7f4; color: #00695c; font-weight: 600; }

/* Description in detail – block editor */
.desc-editor { border-radius: 12px; margin-bottom: 4px; }
.desc-block { position: relative; margin-bottom: 2px; }
.desc-block-text { width: 100%; border: none; outline: none; background: #e8ebf2; font-family: inherit; font-size: 15px; color: #1e2a3a; resize: none; line-height: 1.7; padding: 10px 14px; border-radius: 10px; min-height: 44px; transition: background .12s; }
.desc-block-text:focus { background: #dde1ec; }
.desc-block-text::placeholder { color: #9ca3af; }
.desc-block-img { position: relative; border-radius: 12px; overflow: hidden; background: #f0f0f0; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.desc-block-img img { width: 100%; display: block; border-radius: 12px; cursor: zoom-in; object-fit: contain; max-height: none; }
.desc-block-del { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; background: rgba(0,0,0,0.45); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 13px; }
.desc-block-del:hover { background: rgba(180,0,0,0.75); }
.desc-toolbar { display: flex; gap: 6px; margin-bottom: 12px; }
.desc-tool-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border: 1.5px solid #dde1ea; border-radius: 10px; font-size: 13px; color: #6b7280; cursor: pointer; background: #fff; transition: all .12s; white-space: nowrap; }
.desc-tool-btn:hover { border-color: #4a8ef5; color: #4a8ef5; background: #f0f5ff; }

/* Lightbox */
.lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.lightbox-overlay img { max-width: 100%; max-height: 90vh; border-radius: 12px; object-fit: contain; }
.lightbox-close { position: absolute; top: 20px; right: 20px; color: #fff; font-size: 28px; cursor: pointer; line-height: 1; }

/* Attachments */
.attach-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.attach-file-row { display: flex; align-items: center; gap: 10px; background: #e8ebf2; border-radius: 12px; padding: 11px 14px; }
.attach-file-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
.attach-file-info { flex: 1; min-width: 0; }
.attach-file-name { font-size: 14px; font-weight: 500; color: #1e2a3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.attach-file-size { font-size: 12px; color: #9ca3af; margin-top: 1px; }
.attach-file-del { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #9ca3af; font-size: 14px; border-radius: 50%; flex-shrink: 0; }
.attach-file-del:hover { background: #d0d4e0; color: #e53e3e; }
.attach-img-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px; }
.attach-img-thumb { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: #e8ebf2; cursor: pointer; }
.attach-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.attach-add-row { display: flex; gap: 8px; }
.attach-add-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border: 1.5px dashed #9ca3af; border-radius: 10px; font-size: 13px; color: #6b7280; cursor: pointer; background: transparent; transition: all .12s; }
.attach-add-btn:hover { border-color: #4a8ef5; color: #4a8ef5; background: #f0f5ff; }

/* Collapsed / Expanded block (Description blocks & Checklist groups 공통) */
.collapsed-block { background: #f0f2f7; border: 1px solid #d4e0f5; border-radius: 12px; overflow: hidden; transition: background 0.2s, border-color 0.2s; }
.expanded-block  { background: #e8ebf2; border: 1.5px solid transparent; border-radius: 12px; overflow: hidden; transition: background 0.2s, border-color 0.2s; }

/* Checklist group */
.cl-group { border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
.cl-group-hdr { display: flex; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer; }
.cl-group-name { font-size: 15px; font-weight: 600; color: #1e2a3a; flex: 1; }
.cl-group-name-input { font-size: 13px; font-weight: 600; color: #1e2a3a; border: none; outline: none; background: transparent; font-family: inherit; flex: 1; }
.cl-count { font-size: 13px; color: #9ca3af; margin-right: 4px; }
.cl-toggle { color: #9ca3af; font-size: 14px; cursor: pointer; }
.cl-items { padding: 0 16px 4px; }
.cl-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-top: 1px solid #d8dce8; }
.cl-checkbox { width: 20px; height: 20px; border: 2px solid #9ca3af; border-radius: 5px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all .15s; }
.cl-checkbox.checked { border-color: #4a8ef5; background: #4a8ef5; }
.cl-check-mark { color: #fff; font-size: 12px; font-weight: 700; }
.cl-item-title { flex: 1; min-width: 0; font-size: 14px; color: #1e2a3a; border: none; outline: none; background: transparent; font-family: inherit; overflow: hidden; text-overflow: ellipsis; }
.cl-item-title.done { text-decoration: line-through; color: #9ca3af; }
.cl-item-date { font-size: 12px; color: #9ca3af; white-space: nowrap; }
.cl-item-date-input { font-size: 12px; color: #9ca3af; border: none; outline: none; background: transparent; font-family: inherit; width: 76px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.cl-entry-badge { width: 52px; box-sizing: border-box; text-align: center; font-size: 11px; font-weight: 600; padding: 3px 4px; border-radius: 8px; cursor: pointer; border: 1px dashed #d8dce8; color: #9ca3af; background: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select: none; flex-shrink: 0; }
.cl-entry-badge.lottery { background: #ede7f6; color: #6a3eb5; border: 1px solid #d9cdf0; }
.cl-entry-badge.fcfs { background: #fff3e0; color: #b36a00; border: 1px solid #f3ddb0; }
.cl-entry-badge.fail {
    background: #fdecec;
    color: #d9463f;
    border: 1px solid #f5c2bf;
}
.cl-add-item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: #4a8ef5; font-size: 14px; cursor: pointer; border-top: 1px solid #d8dce8; }
.cl-add-item:hover { background: #dde0ea; }

/* Add checklist group row */
.add-cl-btn { display: flex; align-items: center; gap: 8px; padding: 14px 0; color: #9ca3af; font-size: 14px; cursor: pointer; margin-bottom: 24px; }

/* Attachments */
.attach-row { display: flex; align-items: center; gap: 8px; padding: 14px 0; border-bottom: 1px solid #e5e7eb; cursor: pointer; }
.attach-hdr-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }

/* Comments */
.comments-section { margin-top: 8px; }
.no-comments { background: #e8ebf2; border-radius: 12px; padding: 24px 16px; text-align: center; color: #9ca3af; font-size: 14px; margin-bottom: 16px; }
.comment-input-row { display: flex; gap: 10px; align-items: flex-end; }
.comment-input { flex: 1; border: 1.5px solid #dde1ea; border-radius: 12px; padding: 10px 14px; font-size: 14px; font-family: inherit; outline: none; resize: none; color: #1e2a3a; background: #fff; }
.comment-input:focus { border-color: #4a8ef5; }
.comment-send { padding: 10px 16px; background: #1e2a3a; color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
.comment-item { background: #fff; border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
.comment-author { font-size: 12px; font-weight: 600; color: #4a8ef5; margin-bottom: 4px; }
.comment-text { font-size: 14px; color: #1e2a3a; line-height: 1.5; }

/* Bottom sheet modal wrapper (DateEntryModal, RepeatItemModal, AlarmPicker, WinCheckModal, Calendar 공통) */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: flex-end; justify-content: center; }
.modal-sheet { background: #fff; border-radius: 20px 20px 0 0; width: 100%; max-width: 100%; box-shadow: 0 -8px 32px rgba(0,0,0,0.12); animation: slideUpSheet 0.25s ease-out; position: relative; }
.modal-close { position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 18px; cursor: pointer; }
.modal-handle { width: 36px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 0 auto 20px; }

/* 구분(추첨/선착순/실패) 선택 pill — DateEntryModal, RepeatItemModal의 큰 선택 버튼.
   .cl-entry-badge(체크리스트 항목 옆 작은 배지)와 색상은 공유하되 크기/용도가 달라 별도 클래스 사용 */
.entry-type-option { flex: 1; text-align: center; padding: 10px 0; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; background: #fff; color: #9ca3af; border: 1px dashed #d8dce8; }
.entry-type-option.active { background: #eef0f4; color: #6b7280; border: 1px solid #e5e7eb; }
.entry-type-option.active.lottery { background: #ede7f6; color: #6a3eb5; border: 1px solid #d9cdf0; }
.entry-type-option.active.fcfs { background: #fff3e0; color: #b36a00; border: 1px solid #f3ddb0; }
.entry-type-option.active.fail { background: #fdecec; color: #d9463f; border: 1px solid #f5c2bf; }

@keyframes slideUpSheet {
    from {
        transform: translateY(100%);
        opacity: 0.6;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes skeletonSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* ────────────────── 가계부 (Account Book) ────────────────── */

/* ── 상세 화면: 공통 ── */
.acct-detail { --acct-accent: #d9463f; --acct-accent-bg: #fdeeed; background: #f5f6f8; display: flex; flex-direction: column; min-height: 100vh; }
.acct-detail.is-in { --acct-accent: #2e9e4f; --acct-accent-bg: #e8f6ed; }
.acct-d-hdr { display: flex; align-items: center; gap: 4px; padding: 12px 16px 8px; background: #f5f6f8; }
.acct-d-ttl { flex: 1; font-size: 16px; font-weight: 700; color: #1e2a3a; }
.acct-d-del { font-size: 14px; font-weight: 600; color: #d9463f; padding: 6px 8px; cursor: pointer; }
.acct-d-del-space { width: 40px; }
.acct-d-body { flex: 1; padding: 8px 20px 24px; }

/* ── 상세 화면: 수입 / 지출 토글 ── */
.acct-d-seg { display: flex; background: #e6e9f0; border-radius: 12px; padding: 4px; }
.acct-d-seg-btn { flex: 1; text-align: center; padding: 10px 0; border-radius: 9px; font-size: 14px; font-weight: 600; color: #9ca3af; cursor: pointer; transition: background .15s, color .15s; }
.acct-d-seg-btn.active { background: #fff; box-shadow: 0 1px 3px rgba(30, 42, 58, .12); }
.acct-d-seg-btn.out.active { color: #d9463f; }
.acct-d-seg-btn.in.active { color: #2e9e4f; }

/* ── 상세 화면: 금액 ── */
.acct-d-amount { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin: 40px 0; color: var(--acct-accent); }
.acct-d-sign { font-size: 32px; font-weight: 700; }
.acct-d-amount-input { flex: 0 0 auto; max-width: 70vw; border: 0; outline: 0; background: transparent; padding: 0; text-align: center; font-size: 44px; font-weight: 800; letter-spacing: -0.5px; color: inherit; }
.acct-d-amount-input::placeholder { color: #cbd0da; }
.acct-d-won { font-size: 22px; font-weight: 600; color: #6b7280; }

/* ── 상세 화면: 금액 가감 계산 (알약 한 줄) ── */
.acct-d-adj { margin: -16px 0 20px; }
.acct-d-adj-pill { display: flex; align-items: center; gap: 6px; width: fit-content; max-width: 100%; margin: 0 auto; height: 44px; padding: 0 5px; border-radius: 100px; border: 1px solid #d8dce5; background: transparent; }
.acct-d-adj-op { display: flex; flex-shrink: 0; background: #e6e9f0; border-radius: 100px; padding: 2px; }
.acct-d-adj-opbtn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 16px; font-weight: 700; color: #9ca3af; cursor: pointer; }
.acct-d-adj-opbtn.active { background: #fff; color: #1e2a3a; box-shadow: 0 1px 3px rgba(30, 42, 58, .12); }
.acct-d-adj-input { flex: 0 0 auto; width: 110px; min-width: 0; border: 0; outline: 0; background: transparent; padding: 0; text-align: center; font-size: 16px; font-weight: 600; color: #1e2a3a; }
.acct-d-adj-input::placeholder { color: #c4c9d4; font-weight: 500; font-size: 14px; }
.acct-d-adj-apply { flex-shrink: 0; height: 34px; padding: 0 16px; border: 0; border-radius: 100px; background: #4a8ef5; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
.acct-d-adj-apply:disabled { background: #d8dce5; cursor: default; }
.acct-d-adj-preview { margin-top: 10px; text-align: center; font-size: 12px; font-weight: 600; color: #9ca3af; }
.acct-d-adj-preview.neg { color: #d9463f; }

/* ── 상세 화면: 날짜 / 내용 카드 ── */
.acct-d-card { background: #fff; border-radius: 16px; padding: 0 16px; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); }
.acct-d-row { display: flex; align-items: center; gap: 16px; min-height: 56px; cursor: pointer; }
.acct-d-row-label { width: 36px; flex-shrink: 0; font-size: 14px; font-weight: 600; color: #9ca3af; }
.acct-d-row-value { flex: 1; font-size: 15px; font-weight: 600; color: #1e2a3a; }
.acct-d-row-arrow { font-size: 22px; color: #c4c9d4; line-height: 1; }
.acct-d-divider { height: 1px; background: #eef0f4; }
.acct-d-memo-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; padding: 0; font-size: 15px; font-weight: 600; color: #1e2a3a; }
.acct-d-memo-input::placeholder { color: #c4c9d4; font-weight: 500; }

/* 보관금 체크 (날짜 옆) */
.acct-d-zero { display: flex; align-items: center; gap: 6px; flex-shrink: 0; padding: 6px 10px; border-radius: 100px; background: #f0f2f7; font-size: 13px; font-weight: 600; color: #6b7280; cursor: pointer; }
.acct-d-zero-box { width: 16px; height: 16px; border-radius: 5px; background: #fff; box-shadow: inset 0 0 0 1.5px #c4c9d4; display: flex; align-items: center; justify-content: center; color: #fff; }
.acct-d-zero.active { background: #eef3ff; color: #4a8ef5; }
.acct-d-zero.active .acct-d-zero-box { background: #4a8ef5; box-shadow: none; }

/* ── 상세 화면: 상세 항목 (분류) ── */
.acct-d-types { margin: 16px 0; background: #fff; border-radius: 16px; padding: 16px 8px 18px; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); }
.acct-d-types-hdr { display: flex; align-items: center; gap: 10px; padding: 0 8px 14px; }
.acct-d-types-ttl { font-size: 16px; font-weight: 700; color: #1e2a3a; }
.acct-d-types-set { padding: 5px 12px; border-radius: 10px; background: #654235; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.acct-d-types-grid { display: grid; grid-template-columns: repeat(4, 1fr); row-gap: 14px; }
.acct-d-type { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 4px 2px; cursor: pointer; min-width: 0; }
.acct-d-type-circle { width: 56px; height: 56px; border-radius: 50%; background: #f5f2ee; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #1e2a3a; box-shadow: inset 0 0 0 2px transparent; transition: background .15s, box-shadow .15s; }
.acct-d-type-name { max-width: 100%; font-size: 12px; font-weight: 600; color: #4b5563; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.acct-d-type.active .acct-d-type-circle { background: var(--acct-accent-bg); color: var(--acct-accent); box-shadow: inset 0 0 0 2px var(--acct-accent); }
.acct-d-type.active .acct-d-type-name { color: var(--acct-accent); font-weight: 700; }

/* 항목 아이콘 (테이블의 SVG 코드를 그대로 그림) — 크기/선 굵기는 여기서 조절 */
.acct-d-type-icon, .acct-ds-icon { display: flex; align-items: center; justify-content: center; }
.acct-d-type-icon svg { width: 20px; height: 20px; }
.acct-ds-icon svg { width: 24px; height: 24px; }

/* ── 상세 화면: 하단 저장 버튼 ── */
.acct-d-footer { position: sticky; bottom: 0; padding: 12px 20px calc(16px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(to top, #f5f6f8 70%, rgba(245, 246, 248, 0)); }
.acct-d-save { width: 100%; height: 52px; border: 0; border-radius: 14px; background: var(--acct-accent); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.acct-d-save:disabled { background: #d8dce5; color: #fff; cursor: default; }
.acct-d-save:not(:disabled):active { opacity: .85; }

/* ── 날짜 선택 달력 (바텀시트) ── */
.acct-cal-overlay { position: fixed; inset: 0; z-index: 90; background: rgba(30, 42, 58, .4); display: flex; align-items: flex-end; justify-content: center; }
.acct-cal-sheet { width: 100%; max-width: 480px; background: #fff; border-radius: 20px 20px 0 0; padding: 8px 8px calc(12px + env(safe-area-inset-bottom, 0px)); animation: slideUpSheet 0.25s ease-out; }
.acct-cal-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 8px 8px; }
.acct-cal-nav { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #6b7280; cursor: pointer; }
.acct-cal-title { font-size: 17px; font-weight: 700; color: #1e2a3a; padding: 6px 12px; cursor: pointer; }
.acct-cal-week, .acct-cal-row { display: grid; grid-template-columns: repeat(7, 1fr); }
.acct-cal-week { border-bottom: 1px solid #eef0f4; margin-bottom: 4px; }
.acct-cal-wd { text-align: center; font-size: 11px; font-weight: 600; padding: 6px 0; color: #4b5563; }
.acct-cal-wd.sun { color: #ef4444; }
.acct-cal-wd.sat { color: #4a8ef5; }
.acct-cal-day { position: relative; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; color: #1e2a3a; }
.acct-cal-day span { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.acct-cal-day.sun { color: #ef4444; }
.acct-cal-day.sat { color: #4a8ef5; }
.acct-cal-day.out { color: #d1d5db; }
.acct-cal-day.today span { box-shadow: inset 0 0 0 1.5px #4a8ef5; font-weight: 700; }
.acct-cal-day.selected span { background: #4a8ef5; color: #fff; font-weight: 700; box-shadow: none; }
.acct-cal-dot { position: absolute; bottom: 3px; left: 50%; margin-left: -2px; width: 4px; height: 4px; border-radius: 50%; background: #ef4444; pointer-events: none; }
.acct-cal-dot.done { background: #22c55e; }
.acct-cal-day.selected .acct-cal-dot { background: #fff; }
.acct-cal-day.out .acct-cal-dot { opacity: .4; }
.acct-cal-foot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 0; }
.acct-cal-today-btn { font-size: 14px; font-weight: 600; color: #4a8ef5; padding: 8px; cursor: pointer; }
.acct-cal-close-btn { font-size: 14px; font-weight: 600; color: #9ca3af; padding: 8px; cursor: pointer; }

/* ── 가계부 선택 탭 ── */
.acct-book-list { display: flex; flex-direction: column; gap: 10px; padding: 16px; background: #f5f6f8; min-height: 60vh; }
.acct-book-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #fff; border-radius: 14px; border: 1.5px solid transparent; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); cursor: pointer; }
.acct-book-item.active { border-color: #4a8ef5; background: #f3f7ff; }
.acct-book-circle { width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; background: #f0f2f7; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #1e2a3a; }
.acct-book-item.active .acct-book-circle { background: #4a8ef5; color: #fff; }
.acct-book-name { flex: 1; min-width: 0; font-size: 15px; font-weight: 700; color: #1e2a3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.acct-book-check { flex-shrink: 0; color: #4a8ef5; }
.acct-book-empty { padding: 60px 0; text-align: center; font-size: 13px; color: #9ca3af; }

/* ── 달력 상단: 보관금 별표 (내역이 있으면 반짝임) ── */
.acct-star { display: inline-block; font-size: 15px; margin-top: 3px; }
.acct-star.has-items { animation: acctStarTwinkle 1.6s ease-in-out infinite; }
@keyframes acctStarTwinkle {
    0%, 100% { transform: scale(1); opacity: .85; filter: drop-shadow(0 0 0 rgba(255, 193, 7, 0)); }
    50% { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 0 5px rgba(255, 193, 7, .95)); }
}
@media (prefers-reduced-motion: reduce) {
    .acct-star.has-items { animation: none; }
}

/* ── 이월 총잔액 확정 시트 ── */
.acct-carry-sheet { padding: 22px 20px calc(20px + env(safe-area-inset-bottom, 0px)); }
.acct-carry-ttl { font-size: 17px; font-weight: 700; color: #1e2a3a; text-align: center; }
.acct-carry-sub { margin-top: 6px; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5; }
.acct-carry-amount { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 28px 0 10px; color: #1e2a3a; }
.acct-carry-amount.neg { color: #d9463f; }
.acct-carry-sign { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; background: #f0f2f7; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #4b5563; cursor: pointer; }
.acct-carry-input { flex: 0 0 auto; max-width: 60vw; border: 0; outline: 0; background: transparent; padding: 0; text-align: center; font-size: 36px; font-weight: 800; letter-spacing: -0.5px; color: inherit; }
.acct-carry-input::placeholder { color: #cbd0da; }
.acct-carry-won { font-size: 20px; font-weight: 600; color: #6b7280; }
.acct-carry-auto { min-height: 18px; text-align: center; font-size: 12px; color: #9ca3af; }
.acct-carry-reapply { margin-left: 8px; font-weight: 600; color: #4a8ef5; cursor: pointer; }
.acct-carry-ok { width: 100%; height: 50px; margin-top: 22px; border: 0; border-radius: 14px; background: #4a8ef5; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; }
.acct-carry-ok:disabled { background: #d8dce5; cursor: default; }
.acct-carry-cancel { margin-top: 14px; text-align: center; font-size: 13px; font-weight: 600; color: #d9463f; cursor: pointer; }

/* ── 상세 화면: 자주 쓰는 문구 (내용 옆 버튼 + 선택 시트) ── */
.acct-d-phrase-btn { flex-shrink: 0; padding: 6px 12px; border-radius: 100px; background: #f0f2f7; font-size: 13px; font-weight: 600; color: #6b7280; cursor: pointer; }
/* 선택 시트: 달력 날짜 시트(AcctDaySheet)와 같은 모양 — 바탕은 .modal-overlay / .modal-sheet 재사용 */
.acct-phrase-overlay { z-index: 200; }
.acct-phrase-sheet { max-height: 78vh; overflow-y: auto; padding: 0; }
.acct-phrase-bar { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 18px 0; background: #f0f2f7; border-radius: 20px 20px 0 0; font-size: 15px; font-weight: 700; color: #1e2a3a; cursor: pointer; }
.acct-phrase-plus { font-size: 16px; font-weight: 700; color: #4a8ef5; }
.acct-phrase-empty { padding: 40px 0; text-align: center; font-size: 13px; color: #9ca3af; }
.acct-phrase-body { padding: 8px 20px 32px; }
.acct-phrase-item { display: flex; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid #f9fafb; cursor: pointer; }
.acct-phrase-badge { width: 48px; height: 48px; flex-shrink: 0; border-radius: 12px; background: #f0f2f7; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: var(--acct-accent); }
.acct-phrase-text { flex: 1; min-width: 0; font-size: 15px; font-weight: 700; color: #1e2a3a; }

/* ── 상세 화면: 문구 추가/삭제 페이지 ── */
.acct-pm { position: fixed; inset: 0; z-index: 250; display: flex; flex-direction: column; background: #f5f6f8; }
.acct-pm-add { display: flex; gap: 8px; padding: 8px 20px 14px; }
.acct-pm-input { flex: 1; min-width: 0; height: 46px; border: 0; outline: 0; border-radius: 12px; background: #fff; padding: 0 14px; font-size: 15px; font-weight: 600; color: #1e2a3a; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); }
.acct-pm-input::placeholder { color: #c4c9d4; font-weight: 500; }
.acct-pm-addbtn { flex-shrink: 0; height: 46px; padding: 0 18px; border: 0; border-radius: 12px; background: #4a8ef5; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
.acct-pm-addbtn:disabled { background: #d8dce5; cursor: default; }
.acct-pm-list { flex: 0 1 auto; min-height: 0; overflow-y: auto; margin: 0 20px 20px; padding: 0 16px; background: #fff; border-radius: 16px; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); }
.acct-pm-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f0f2f7; }
.acct-pm-item:last-child { border-bottom: 0; }
.acct-pm-num { width: 24px; flex-shrink: 0; font-size: 13px; font-weight: 700; color: #9ca3af; }
.acct-pm-text { flex: 1; min-width: 0; font-size: 15px; font-weight: 600; color: #1e2a3a; word-break: break-all; }
.acct-pm-del { flex-shrink: 0; padding: 6px 10px; font-size: 13px; font-weight: 600; color: #d9463f; cursor: pointer; }
.acct-pm-empty { padding: 40px 0; text-align: center; font-size: 13px; color: #9ca3af; }

/* ── 가계부 설정 화면 (왼쪽 세로탭 + 오른쪽 내용) ── */
.acct-set { background: #f5f6f8; }
.acct-set-layout { flex: 1; display: flex; min-height: 0; }
.acct-set-tabs { width: 84px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; padding: 10px 10px; background: #fff; border-right: 1px solid #eef0f4; }
.acct-set-tab { padding: 10px 2px; font-size: 13px; font-weight: 600; line-height: 1.4; color: #9ca3af; cursor: pointer; word-break: keep-all; }
.acct-set-tab-no { display: block; margin-bottom: 2px; font-size: 11px; font-weight: 600; }
.acct-set-tab.active { color: #1e2a3a; font-weight: 700; }
.acct-set-tab.active .acct-set-tab-no { color: #4a8ef5; }
.acct-set-tab.active .acct-set-tab-lbl { text-decoration: underline; text-decoration-color: #4a8ef5; text-decoration-thickness: 2px; text-underline-offset: 5px; }
.acct-set-main { flex: 1; min-width: 0; overflow-y: auto; }
.acct-set-panel { padding-top: 8px; }
.acct-set-panel .acct-pm-add { padding: 0 12px 12px; }
.acct-set-panel .acct-pm-list { margin: 0 12px 16px; padding: 0 12px; }
.acct-pm-tag { flex-shrink: 0; padding: 2px 8px; border-radius: 100px; background: #f0f2f7; font-size: 11px; font-weight: 600; color: #6b7280; }
.acct-pm-books { display: flex; gap: 6px; overflow-x: auto; padding: 0 12px 12px; scrollbar-width: none; }
.acct-pm-books::-webkit-scrollbar { display: none; }
.acct-pm-book { flex-shrink: 0; padding: 7px 12px; border-radius: 100px; background: #fff; font-size: 13px; font-weight: 600; color: #6b7280; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); white-space: nowrap; cursor: pointer; }
.acct-pm-book.active { background: #4a8ef5; color: #fff; }
.acct-pm .acct-pm-books { padding: 8px 20px 12px; }
.acct-set-panel .acct-d-seg { margin: 0 12px 12px; }

/* 가계부 설정 화면 상세항목 아이콘 부분 */
/* ── 항목 아이콘 ── */
.acct-pm-iconbtn { flex-shrink: 0; width: 46px; height: 46px; border: 0; border-radius: 12px; background: #fff; color: #9ca3af; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 2px rgba(30, 42, 58, .05); }
.acct-pm-iconbtn.has { color: #1e2a3a; }
.acct-pm-iconbtn svg { width: 22px; height: 22px; }
.acct-pm-icon { flex-shrink: 0; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; color: #4a5568; }
.acct-pm-icon svg { width: 20px; height: 20px; }

/* ── 아이콘 선택 하단 시트 ── */
.acct-sheet-dim { position: fixed; inset: 0; z-index: 400; background: rgba(0, 0, 0, .5); display: flex; justify-content: center; align-items: flex-end; }
.acct-sheet { width: 100%; max-width: 420px; height: 72vh; background: #fff; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; animation: acctSheetUp .25s ease-out; }
@keyframes acctSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.acct-sheet-head { display: flex; justify-content: space-between; align-items: center; padding: 22px 20px 14px; font-size: 16px; font-weight: 700; color: #1e2a3a; }
.acct-sheet-x { border: 0; background: none; font-size: 18px; color: #1e2a3a; cursor: pointer; padding: 4px; }
.acct-sheet-cats { display: flex; gap: 8px; padding: 4px 20px 14px; overflow-x: auto; flex-shrink: 0; scrollbar-width: none; }
.acct-sheet-cats::-webkit-scrollbar { display: none; }
.acct-sheet-cat { flex-shrink: 0; padding: 8px 16px; border: 1px solid #dde1ea; border-radius: 100px; font-size: 13px; font-weight: 600; color: #9ca3af; white-space: nowrap; cursor: pointer; }
.acct-sheet-cat.active { border-color: #1e2a3a; color: #1e2a3a; }
.acct-sheet-grid { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(6, 1fr); align-content: start; gap: 4px 0; padding: 8px 12px 28px; }
.acct-sheet-ic { height: 54px; display: flex; align-items: center; justify-content: center; color: #1e2a3a; border-radius: 12px; cursor: pointer; }
.acct-sheet-ic.active { background: #1e2a3a; color: #fff; }
.acct-sheet-search { padding: 0 20px 12px; flex-shrink: 0; }
.acct-sheet-search input { width: 100%; height: 42px; border: 0; outline: 0; border-radius: 12px; background: #f0f2f7; padding: 0 14px; font-size: 14px; color: #1e2a3a; }
.acct-sheet-search input::placeholder { color: #9ca3af; }
.acct-sheet-empty { grid-column: 1 / -1; padding: 40px 0; text-align: center; font-size: 13px; color: #9ca3af; }

.acct-pm-icbtn { flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #4a5568; cursor: pointer; }
.acct-pm-icbtn.empty { background: #f5f6f8; color: #c4c9d4; font-size: 16px; }
.acct-pm-icbtn svg { width: 20px; height: 20px; }
.acct-pm-text-edit { cursor: pointer; }
.acct-pm-edit { flex: 1; min-width: 0; height: 34px; border: 0; outline: 0; border-radius: 8px; background: #f0f2f7; padding: 0 10px; font-size: 15px; font-weight: 600; color: #1e2a3a; }
`


;

export default styles;