import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2, Menu, FilePlus, Globe, Lock,
  CheckCircle2, X, ArrowLeft, FolderOpen, Pin, PinOff,
  Tag, Upload, Palette, Heart, ChevronDown, StickyNote,
  Hash, Layers, FileText, Clock, NotebookPen, AlignLeft,
  LayoutGrid, LayoutList
} from "lucide-react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useTheme } from "../context/ThemeContext";

// ─── Note Colors ───────────────────────────────────────────────────────────────
const NOTE_COLORS_DARK = {
  default: { bg: 'var(--surface)',  border: 'var(--border)', accent: null },
  red:     { bg: '#1e0f0f',         border: '#4a1818',       accent: '#ef4444' },
  orange:  { bg: '#1e1108',         border: '#4a2208',       accent: '#f97316' },
  yellow:  { bg: '#1e1c08',         border: '#4a430a',       accent: '#eab308' },
  green:   { bg: '#0a1e10',         border: '#0e4020',       accent: '#22c55e' },
  blue:    { bg: '#08101e',         border: '#0f2548',       accent: '#3b82f6' },
  purple:  { bg: '#110a1e',         border: '#281048',       accent: '#a855f7' },
  pink:    { bg: '#1e0a12',         border: '#4a1030',       accent: '#ec4899' },
};
const NOTE_COLORS_LIGHT = {
  default: { bg: 'var(--surface)',  border: 'var(--border)', accent: null },
  red:     { bg: '#fff5f5',         border: '#fecaca',       accent: '#ef4444' },
  orange:  { bg: '#fff8f3',         border: '#fed7aa',       accent: '#f97316' },
  yellow:  { bg: '#fefce8',         border: '#fde68a',       accent: '#eab308' },
  green:   { bg: '#f0fdf4',         border: '#bbf7d0',       accent: '#22c55e' },
  blue:    { bg: '#eff6ff',         border: '#bfdbfe',       accent: '#3b82f6' },
  purple:  { bg: '#faf5ff',         border: '#e9d5ff',       accent: '#a855f7' },
  pink:    { bg: '#fdf2f8',         border: '#fbcfe8',       accent: '#ec4899' },
};

const COLOR_DOTS = {
  default:'#94a3b8', red:'#ef4444', orange:'#f97316',
  yellow:'#eab308',  green:'#22c55e', blue:'#3b82f6',
  purple:'#a855f7',  pink:'#ec4899',
};

const DB_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');

  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp  { from { ; (8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes scaleIn { from { ; (0.94); } to { opacity:1; transform:scale(1); } }
  @keyframes slideIn { from { ; (-6px); } to { opacity:1; transform:translateX(0); } }

  /* ── Layout Shell ── */
  .db-wrap { display:flex; height:100dvh; overflow:hidden; background:var(--bg); font-family:'Geist',var(--font,sans-serif); }
  .db-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  /* ── Topbar ── */
  .db-topbar {
    height:60px; display:flex; align-items:center;
    justify-content:space-between; padding:0 20px;
    background:var(--surface); border-bottom:1px solid var(--border);
    flex-shrink:0; gap:12px;
    box-shadow: 0 1px 0 var(--border);
  }
  .db-topbar-left { display:flex; align-items:center; gap:10px; flex-shrink:0; min-width:0; }
  .db-menu-btn {
    display:none; background:transparent; border:1.5px solid var(--border);
    border-radius:8px; cursor:pointer; padding:6px;
    color:var(--text-muted); align-items:center; justify-content:center; transition:0.15s;
    flex-shrink:0;
  }
  .db-menu-btn:hover { border-(--accent); color:var(--accent); }

  .page-breadcrumb { display:flex; align-items:center; gap:6px; }
  .page-icon-wrap {
    width:32px; height:32px; border-radius:9px;
    background:var(--accent-light); display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .page-label { font-size:15px; font-weight:800; color:var(--text); letter-spacing:-0.4px; white-space:nowrap; }
  .page-sublabel { font-size:12px; color:var(--text-muted); font-weight:500; }

  /* Search */
  .db-search {
    flex:1; max-width:320px;
    display:flex; align-items:center; gap:8px;
    background:var(--bg); border:1.5px solid var(--border);
    border-radius:10px; padding:8px 12px;
    transition:border-color 0.15s, box-shadow 0.15s;
  }
  .db-search:focus-within {
    border-color:var(--accent);
    box-shadow: 0 0 0 3px var(--accent-ring);
    background:var(--surface);
  }
  .db-search input {
    border:none; outline:none; background:transparent;
    width:100%; font-size:13px; font-weight:500;
    color:var(--text); font-family:inherit;
  }
  .db-search input::placeholder { color:var(--text-light); }

  /* Top actions */
  .db-topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .btn-icon {
    width:36px; height:36px; border-radius:9px;
    border:1.5px solid var(--border); background:transparent;
    color:var(--text-muted); cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.15s;
  }
  .btn-icon:hover { border-(--border-hover); color:var(--text); background:var(--bg); }
  .btn-icon.active { border-(--accent); color:var(--accent); background:var(--accent-light); }
  .btn-import {
    display:flex; align-items:center; gap:6px;
    background:transparent; border:1.5px solid var(--border);
    border-radius:9px; padding:7px 14px;
    font-weight:700; font-size:13px; cursor:pointer;
    color:var(--text-muted); font-family:inherit; white-space:nowrap;
    transition:all 0.15s;
  }
  .btn-import:hover { border-(--border-hover); color:var(--text); }
  .btn-new {
    display:flex; align-items:center; gap:6px;
    background:var(--text); color:var(--surface);
    border:none; border-radius:9px; padding:8px 16px;
    font-weight:800; font-size:13px; cursor:pointer;
    font-family:inherit; white-space:nowrap; transition:all 0.18s;
  }
  .btn-new:hover { background:var(--accent); box-shadow:0 4px 16px rgba(249,115,22,0.28); }

  /* ── Filter Bar ── */
  .db-filters {
    padding:0 20px; height:46px;
    background:var(--surface); border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:4px;
    overflow-x:auto; overflow-y:visible; scrollbar-width:none;
    flex-shrink:0; position:relative; z-index:50;
  }
  .db-filters::-webkit-scrollbar { display:none; }
  .filter-sep { width:1px; height:18px; background:var(--border); flex-shrink:0; margin:0 4px; }
  .f-chip {
    padding:5px 13px; border-radius:8px; border:1.5px solid transparent;
    font-size:12.5px; font-weight:700; cursor:pointer; transition:all 0.15s;
    background:transparent; color:var(--text-muted); font-family:inherit;
    white-space:nowrap; display:flex; align-items:center; gap:5px; flex-shrink:0;
  }
  .f-chip:hover { background:var(--bg); color:var(--text); }
  .f-chip.active {
    background:var(--text); color:var(--surface);
    border-color:var(--text);
  }
  .f-chip.tag-active { background:var(--accent-light); (--accent); border-color:var(--accent-ring); }

  /* ── Tag Dropdown ── */
  .tag-drop {
    position:fixed; background:var(--surface);
    border:1px solid var(--border); border-radius:12px;
    padding:8px; z-index:9999;
    box-shadow:0 8px 32px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08);
    min-width:200px; animation:scaleIn 0.15s ease;
    max-height:280px; overflow-y:auto;
  }
  .tag-search-wrap {
    display:flex; align-items:center; gap:7px;
    background:var(--bg); border:1.5px solid var(--border);
    border-radius:8px; padding:6px 10px; margin-bottom:6px; transition:0.15s;
  }
  .tag-search-wrap:focus-within { border-color:var(--accent); }
  .tag-search-wrap input {
    border:none; outline:none; background:transparent;
    width:100%; font-size:12px; font-weight:600;
    color:var(--text); font-family:inherit;
  }
  .tag-drop-item {
    padding:7px 10px; border-radius:7px; cursor:pointer;
    font-size:12.5px; font-weight:600; color:var(--text-muted);
    display:flex; align-items:center; gap:7px; transition:0.12s;
  }
  .tag-drop-item:hover { background:var(--bg); color:var(--text); }
  .tag-drop-item.selected { color:var(--accent); background:var(--accent-light); }
  .tag-empty { padding:16px 12px; font-size:12px; color:var(--text-light); text-align:center; }

  /* ── Content Area ── */
  .db-content {
    flex:1; overflow-y:auto; padding:20px 22px;
    scrollbar-width:none; background:var(--bg);
  }
  .db-content::-webkit-scrollbar { display:none; }

  /* ── Stats Row ── */
  .stats-row {
    display:grid; grid-template-columns:repeat(4,1fr); gap:10px;
    margin-bottom:20px; animation:fadeUp 0.3s both;
  }
  .stat-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:12px; padding:14px 16px;
    display:flex; align-items:center; gap:12px;
    transition:border-color 0.15s, box-shadow 0.15s;
  }
  .stat-card:hover { border-color:var(--border-hover); box-shadow:var(--shadow-sm); }
  .stat-icon {
    width:36px; height:36px; border-radius:9px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .stat-num { font-size:20px; font-weight:800; color:var(--text); letter-spacing:-0.5px; line-height:1; }
  .stat-label { font-size:11px; font-weight:600; color:var(--text-muted); margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }

  /* ── Section header ── */
  .section-hd {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:14px; padding:0 2px;
  }
  .section-title {
    font-size:12px; font-weight:800; color:var(--text-muted);
    text-transform:uppercase; letter-spacing:0.8px;
    display:flex; align-items:center; gap:6px;
  }
  .section-count {
    background:var(--bg); border:1px solid var(--border);
    color:var(--text-muted); font-size:11px; font-weight:700;
    padding:2px 8px; border-radius:100px;
  }

  /* Pinned label */
  .pinned-section { margin-bottom:22px; }
  .pinned-label {
    display:flex; align-items:center; gap:6px;
    font-size:11px; font-weight:800; color:var(--accent);
    text-transform:uppercase; letter-spacing:0.8px;
    margin-bottom:12px; padding:0 2px;
  }

  /* ── Note Grid / List ── */
  .notes-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
  .notes-list { display:flex; flex-direction:column; gap:8px; }

  /* ── Note Card (Grid) ── */
  .note-card {
    border:1.5px solid var(--border); border-radius:14px;
    padding:16px 18px; cursor:pointer; transition:all 0.18s;
    animation:fadeUp 0.3s both; display:flex; flex-direction:column;
    position:relative; overflow:hidden; min-height:140px;
  }
  .note-card::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; border-radius:3px 0 0 3px;
    background:transparent; transition:background 0.15s;
  }
  .note-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
  .note-card:hover::before { background:var(--accent); }
  .note-card.selected { border-color:var(--accent) !important; border-width:2px; }
  .note-card.selected::before { background:var(--accent); }

  .note-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px; }
  .note-title { font-size:14px; font-weight:700; color:var(--text); line-height:1.35; flex:1; padding-right:8px; }
  .note-pin-badge { color:var(--accent); flex-shrink:0; }
  .note-tags { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }
  .note-tag {
    font-size:10px; font-weight:700; padding:2px 7px; border-radius:5px;
    background:var(--accent-light); color:var(--accent);
    display:flex; align-items:center; gap:3px;
  }
  .note-excerpt {
    font-size:12.5px; color:var(--text-muted); line-height:1.65;
    flex:1; display:-webkit-box; -webkit-line-clamp:3;
    -webkit-box-orient:vertical; overflow:hidden; margin-bottom:14px;
  }
  .note-footer {
    display:flex; justify-content:space-between; align-items:center;
    padding-; border-solid var(--border); margin-top:auto;
  }
  .note-date { font-size:10.5px; font-weight:500; color:var(--text-light); display:flex; align-items:center; gap:4px; }
  .note-actions { display:flex; gap:2px; align-items:center; opacity:0; transition:opacity 0.15s; }
  .note-card:hover .note-actions { opacity:1; }

  /* ── Note Row (List) ── */
  .note-row {
    border:1.5px solid var(--border); border-radius:11px;
    padding:12px 16px; cursor:pointer; transition:all 0.15s;
    animation:fadeUp 0.25s both; display:flex; align-items:center;
    gap:14px; background:var(--surface); position:relative; overflow:hidden;
  }
  .note-row::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; border-radius:3px 0 0 3px;
    background:transparent; transition:background 0.15s;
  }
  .note-row:hover { box-shadow:var(--shadow-sm); }
  .note-row:hover::before { background:var(--accent); }
  .note-row.selected { border-color:var(--accent); border-width:2px; }
  .note-row-body { flex:1; min-width:0; }
  .note-row-title { font-size:13.5px; font-weight:700; color:var(--text); margin-bottom:2px; white-space:nowrap; ; text-overflow:ellipsis; }
  .note-row-excerpt { font-size:12px; color:var(--text-muted); white-space:nowrap; ; text-overflow:ellipsis; }
  .note-row-meta { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .note-row .note-actions { opacity:0; transition:opacity 0.15s; }
  .note-row:hover .note-actions { opacity:1; }

  /* Action buttons */
  .ico-btn {
    width:27px; height:27px; border-radius:7px; border:none;
    background:transparent; color:var(--text-light);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.12s;
  }
  .ico-btn:hover { background:var(--bg); color:var(--text); }
  .ico-btn.starred  { color:#f59e0b; }
  .ico-btn.fav      { color:#ec4899; }
  .ico-btn.pinned   { color:var(--accent); }

  /* Color picker */
  .color-menu {
    position:absolute; background:var(--surface);
    border:1px solid var(--border); border-radius:12px;
    padding:10px; display:flex; gap:6px; flex-wrap:wrap;
    z-index:200; box-shadow:var(--shadow-lg);
    width:168px; animation:scaleIn 0.15s ease;
    bottom:calc(100% + 4px); right:0;
  }
  .cdot { width:22px; height:22px; border-radius:50%; cursor:pointer; border:2.5px solid transparent; transition:0.15s; }
  .cdot:hover,.cdot.sel { border-color:var(--text); transform:scale(1.15); }

  /* ── Bulk Bar ── */
  .bulk-bar {
    position:sticky; top:0; z-index:50; margin-bottom:16px;
    padding:10px 16px; background:var(--surface);
    border-radius:12px; border:1.5px solid var(--accent);
    display:flex; align-items:center; justify-content:space-between;
    box-shadow:0 4px 20px rgba(249,115,22,0.12);
    animation:fadeUp 0.2s ease;
  }

  /* ── Import Modal ── */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; backdrop-filter:blur(2px); }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:28px; ; max-width:420px; animation:scaleIn 0.2s ease; box-shadow:var(--shadow-lg); }
  .drop-zone { border:2px dashed var(--border); border-radius:12px; padding:36px 20px; text-align:center; cursor:pointer; transition:all 0.2s; }
  .drop-zone:hover,.drop-zone.dov { border-color:var(--accent); background:var(--accent-light); }
  .drop-zone input { display:none; }

  /* ── Empty state ── */
  .db-empty {
    text-align:center; padding:64px 20px;
    border:1.5px dashed var(--border); border-radius:16px;
    display:flex; flex-direction:column; align-items:center; gap:12px;
  }
  .db-empty-icon {
    width:56px; height:56px; border-radius:16px;
    background:var(--surface); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center;
  }

  /* ── Spinner ── */
  .db-spinner { width:24px; height:24px; border:2.5px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin .8s linear infinite; }

  /* divider */
  .sec-divider { border:none; border-top:1px solid var(--border); margin:18px 0 16px; }

  /* ── Responsive ── */
  @media (max-width:768px) {
    .db-topbar { padding:0 12px; height:52px; }
    .db-search { display:none; }
    .db-menu-btn { display:flex !important; }
    .btn-import span { display:none; }
    .stats-row { grid-template-columns:repeat(2,1fr); }
    .db-filters { padding:0 12px; }
    .db-content { padding:12px 12px calc(80px + env(safe-area-inset-bottom)); }
    .notes-grid { grid-template-columns:1fr; gap:10px; }
    .stat-card { padding:12px; }
  }
`;

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImported }) {
  const [drag, setDrag]       = useState(false);
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const pick = (f) => {
    const ext = f.name.match(/\.(pdf|docx|doc|txt|md)$/i);
    if (!ext) { toast.error('PDF, DOCX, TXT, MD only'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setFile(f);
  };

  const doImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('importFile', file);
      const { data } = await API.post('/import', fd);
      toast.success(data.message);
      onImported(data.note);
      onClose();
    } catch (e) { toast.error(e?.response?.data?.message || 'Import failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Upload size={16} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:'var(--text)' }}>Import Note</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>PDF, DOCX, TXT, or MD</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:4, borderRadius:6 }}>
            <X size={16} />
          </button>
        </div>

        <div
          className={`drop-zone${drag ? ' dov' : ''}`}
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
        >
          <input ref={ref} type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={e => { if (e.target.files[0]) pick(e.target.files[0]); }} />
          <Upload size={28} color="var(--text-light)" style={{ margin:'0 auto 12px', display:'block' }} />
          {file ? (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontWeight:700, color:'var(--text)', fontSize:13 }}>
                <FileText size={13} color="var(--accent)" /> {file.name}
              </div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{(file.size / 1024).toFixed(0)} KB</div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight:700, color:'var(--text)', fontSize:13, marginBottom:4 }}>Drop a file or click to browse</div>
              <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>PDF · DOCX · TXT · MD &nbsp;·&nbsp; Max 10MB</div>
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:10, marginTop:18 }}>
          <button onClick={onClose} style={{ flex:1, background:'transparent', border:'1.5px solid var(--border)', borderRadius:9, padding:'10px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', color:'var(--text-muted)', fontSize:13 }}>
            Cancel
          </button>
          <button
            onClick={doImport}
            disabled={!file || loading}
            style={{ flex:2, background:file && !loading ? 'var(--accent)' : 'var(--border)', color:'#fff', border:'none', borderRadius:9, padding:'10px', fontWeight:800, cursor:file ? 'pointer' : 'not-allowed', fontFamily:'inherit', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
          >
            {loading
              ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .8s linear infinite' }} /> Importing…</>
              : <><Upload size={13} /> Import Note</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter config ─────────────────────────────────────────────────────────────
const FILTERS = [
  { id:'all',       label:'All',      icon: StickyNote },
  { id:'pinned',    label:'Pinned',   icon: Pin        },
  { id:'starred',   label:'Starred',  icon: Star       },
  { id:'favorites', label:'Favorites',icon: Heart      },
];

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [searchParams]                  = useSearchParams();
  const [notes, setNotes]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [folderName, setFolderName]     = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTag, setActiveTag]       = useState('');
  const [showTagMenu, setShowTagMenu]   = useState(false);
  const [tagMenuPos, setTagMenuPos]     = useState({ top:0, left:0 });
  const [tagSearch, setTagSearch]       = useState('');
  const [showImport, setShowImport]     = useState(false);
  const [colorMenu, setColorMenu]       = useState(null);
  const [viewMode, setViewMode]         = useState('grid'); // 'grid' | 'list'

  const colorRef   = useRef(null);
  const tagBtnRef  = useRef(null);
  const tagDropRef = useRef(null);

  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const location   = useLocation();
  const activeFolderId = searchParams.get('folder');

  useEffect(() => {
    if (location.pathname === '/starred') {
      setActiveFilter('starred');
      setShowTagMenu(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if (colorRef.current && !colorRef.current.contains(e.target)) setColorMenu(null);
      if (
        tagBtnRef.current  && !tagBtnRef.current.contains(e.target) &&
        tagDropRef.current && !tagDropRef.current.contains(e.target)
      ) { setShowTagMenu(false); setTagSearch(''); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ep = activeFolderId ? `/notes?folder=${activeFolderId}` : '/notes';
      const [nRes, fRes] = await Promise.all([
        API.get(ep),
        activeFolderId ? API.get('/folders') : Promise.resolve(null),
      ]);
      setNotes(nRes.data || []);
      if (activeFolderId && fRes) {
        const f = (fRes.data || []).find(f => f._id === activeFolderId);
        setFolderName(f?.name || 'Folder');
      } else { setFolderName(''); }
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post('/notes', { title:'Untitled Note', content:'', folder:activeFolderId });
      setNotes(p => [data, ...p]);
      setSelectedNote(data);
    } catch { toast.error('Could not create note'); }
  };

  const toggleStar = async (e, id) => {
    e.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${id}/star`);
      setNotes(p => p.map(n => n._id === id ? { ...n, isStarred:data.isStarred } : n));
    } catch { toast.error('Failed'); }
  };

  const togglePin = async (e, id) => {
    e.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${id}/pin`);
      setNotes(p => p.map(n => n._id === id ? { ...n, isPinned:data.isPinned } : n));
      toast.success(data.isPinned ? 'Pinned' : 'Unpinned');
    } catch { toast.error('Failed'); }
  };

  const toggleFav = async (e, id) => {
    e.stopPropagation();
    const note = notes.find(n => n._id === id);
    const val  = !note.isFavorite;
    setNotes(p => p.map(n => n._id === id ? { ...n, isFavorite:val } : n));
    try { await API.patch(`/notes/${id}`, { isFavorite:val }); }
    catch {
      setNotes(p => p.map(n => n._id === id ? { ...n, isFavorite:!val } : n));
      toast.error('Failed');
    }
  };

  const trashNote = async (e, id) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${id}/trash`);
      setNotes(p => p.filter(n => n._id !== id));
      toast.success('Moved to trash');
    } catch { toast.error('Failed'); }
  };

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => API.patch(`/notes/${id}/trash`)));
      setNotes(p => p.filter(n => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} notes moved to trash`);
    } catch { toast.error('Bulk delete failed'); }
  };

  const setColor = async (id, color) => {
    setNotes(p => p.map(n => n._id === id ? { ...n, color } : n));
    try { await API.patch(`/notes/${id}`, { color }); }
    catch { toast.error('Color update failed'); }
    setColorMenu(null);
  };

  const openTagMenu = () => {
    if (showTagMenu) { setShowTagMenu(false); setTagSearch(''); return; }
    if (tagBtnRef.current) {
      const rect = tagBtnRef.current.getBoundingClientRect();
      setTagMenuPos({ top:rect.bottom + 6, left:rect.left });
    }
    setTagSearch('');
    setShowTagMenu(true);
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags || []).filter(Boolean))];
  const filteredTags = allTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase().replace(/^#/, '')));

  const filtered = notes.filter(n => {
    if (n.isTrashed) return false;
    const q  = searchQuery.toLowerCase();
    const ms = !q || n.title?.toLowerCase().includes(q) || n.plainText?.toLowerCase().includes(q);
    const mf = activeFilter === 'all'       ? true
             : activeFilter === 'starred'   ? n.isStarred
             : activeFilter === 'favorites' ? n.isFavorite
             : activeFilter === 'pinned'    ? n.isPinned
             : true;
    const mt = !activeTag || (n.tags || []).includes(activeTag);
    return ms && mf && mt;
  });

  const pinned   = filtered.filter(n =>  n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  // Stats from all non-trashed notes
  const all = notes.filter(n => !n.isTrashed);
  const stats = [
    { label:'Total Notes',  num:all.length,                     icon:StickyNote,  color:'var(--accent)',  bg:'var(--accent-light)' },
    { label:'Starred',      num:all.filter(n=>n.isStarred).length, icon:Star,     color:'#f59e0b',        bg:'rgba(245,158,11,0.1)' },
    { label:'Favorites',    num:all.filter(n=>n.isFavorite).length,icon:Heart,    color:'#ec4899',        bg:'rgba(236,72,153,0.1)' },
    { label:'Pinned',       num:all.filter(n=>n.isPinned).length,  icon:Pin,      color:'var(--purple)',  bg:'var(--purple-light)' },
  ];

  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onUpdate={u => setNotes(p => p.map(n => n._id === u._id ? u : n))}
      />
    );
  }

  const showStats = !activeFolderId && activeFilter === 'all' && !activeTag && !searchQuery;

  return (
    <div className="db-wrap">
      <style>{DB_STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="db-main">

        {/* ── Topbar ── */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={17} />
            </button>

            {activeFolderId ? (
              <div className="page-breadcrumb">
                <button
                  onClick={() => navigate('/folders')}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:'4px', borderRadius:6, transition:'0.15s' }}
                >
                  <ArrowLeft size={14} />
                </button>
                <div className="page-icon-wrap" style={{ background:'rgba(249,115,22,0.1)' }}>
                  <FolderOpen size={15} color="var(--accent)" />
                </div>
                <div>
                  <div className="page-label">{folderName || 'Folder'}</div>
                </div>
              </div>
            ) : (
              <div className="page-breadcrumb">
                <div className="page-icon-wrap">
                  <NotebookPen size={15} color="var(--accent)" />
                </div>
                <div>
                  <div className="page-label">My Notes</div>
                </div>
              </div>
            )}
          </div>

          <div className="db-search">
            <Search size={13} color="var(--text-light)" style={{ flexShrink:0 }} />
            <input
              placeholder="Search notes…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="db-topbar-right">
            {/* View toggle */}
            <button
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <LayoutList size={15} />
            </button>

            <div style={{ width:1, height:22, background:'var(--border)', margin:'0 2px' }} />

            <button className="btn-import" onClick={() => setShowImport(true)}>
              <Upload size={13} /><span>Import</span>
            </button>
            <button className="btn-new" onClick={createNote}>
              <Plus size={14} strokeWidth={2.5} /> New Note
            </button>
          </div>
        </header>

        {/* ── Filter Bar ── */}
        <div className="db-filters">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`f-chip${activeFilter === id && !activeTag ? ' active' : ''}`}
              onClick={() => { setActiveFilter(id); setActiveTag(''); setShowTagMenu(false); }}
            >
              <Icon size={11} /> {label}
            </button>
          ))}

          <div className="filter-sep" />

          <button
            ref={tagBtnRef}
            className={`f-chip${activeTag ? ' tag-active' : ''}`}
            onClick={openTagMenu}
          >
            <Tag size={11} />
            {activeTag ? (activeTag.startsWith('#') ? activeTag : `#${activeTag}`) : 'Tags'}
            <ChevronDown size={10} style={{ transition:'transform 0.2s', transform:showTagMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
        </div>

        {/* Tag Dropdown */}
        {showTagMenu && (
          <div ref={tagDropRef} className="tag-drop" style={{ top:tagMenuPos.top, left:tagMenuPos.left }}>
            <div className="tag-search-wrap">
              <Search size={11} color="var(--text-light)" style={{ flexShrink:0 }} />
              <input
                autoFocus
                placeholder="Search tags…"
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
              />
              {tagSearch && (
                <button onClick={() => setTagSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}>
                  <X size={10} />
                </button>
              )}
            </div>

            {allTags.length === 0 ? (
              <div className="tag-empty">No tags yet — add them in the note editor</div>
            ) : filteredTags.length === 0 ? (
              <div className="tag-empty">No tags match "{tagSearch}"</div>
            ) : (
              <>
                {!tagSearch && (
                  <div className={`tag-drop-item${!activeTag ? ' selected' : ''}`} onClick={() => { setActiveTag(''); setShowTagMenu(false); }}>
                    <Layers size={11} /> All notes
                  </div>
                )}
                {filteredTags.map(t => (
                  <div
                    key={t}
                    className={`tag-drop-item${activeTag === t ? ' selected' : ''}`}
                    onClick={() => { setActiveTag(t); setShowTagMenu(false); setTagSearch(''); }}
                  >
                    <Hash size={10} />
                    {t.startsWith('#') ? t.slice(1) : t}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Content ── */}
        <div className="db-content">

          {/* Stats row */}
          {showStats && !loading && (
            <div className="stats-row">
              {stats.map(({ label, num, icon:Icon, color, bg }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-icon" style={{ background:bg }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <div className="stat-num">{num}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk bar */}
          {selectedIds.length > 0 && (
            <div className="bulk-bar">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle2 size={15} color="var(--accent)" />
                <span style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>{selectedIds.length} selected</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  onClick={bulkDelete}
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', borderRadius:8, padding:'6px 14px', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}
                >
                  <Trash2 size={12} /> Move to trash
                </button>
                <button onClick={() => setSelectedIds([])} style={{ background:'none', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:8, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', fontFamily:'inherit' }}>
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
              <div className="db-spinner" />
            </div>

          ) : filtered.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">
                {activeTag ? <Tag size={22} color="var(--text-muted)" />
                  : activeFilter === 'starred'   ? <Star size={22} color="var(--text-muted)" />
                  : activeFilter === 'favorites' ? <Heart size={22} color="var(--text-muted)" />
                  : activeFilter === 'pinned'    ? <Pin size={22} color="var(--text-muted)" />
                  : activeFolderId               ? <FolderOpen size={22} color="var(--text-muted)" />
                  : <FilePlus size={22} color="var(--text-muted)" />
                }
              </div>
              <div style={{ fontWeight:800, fontSize:15, color:'var(--text)' }}>
                {activeTag
                  ? `No notes tagged "${activeTag.startsWith('#') ? activeTag : '#' + activeTag}"`
                  : activeFilter !== 'all' ? `No ${activeFilter} notes`
                  : activeFolderId ? `"${folderName}" is empty`
                  : 'No notes yet'}
              </div>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>
                {activeFilter === 'all' && !activeTag ? 'Create or import a note to get started' : 'Try a different filter'}
              </p>
              {activeFilter === 'all' && !activeTag && (
                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button className="btn-new" onClick={createNote}><Plus size={13} /> Create</button>
                  <button className="btn-import" onClick={() => setShowImport(true)}><Upload size={13} /><span>Import</span></button>
                </div>
              )}
            </div>

          ) : (
            <>
              {/* Pinned section */}
              {pinned.length > 0 && activeFilter === 'all' && !activeTag && (
                <div className="pinned-section">
                  <div className="pinned-label">
                    <Pin size={10} fill="currentColor" /> Pinned
                  </div>
                  <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}>
                    {pinned.map((note, i) => viewMode === 'grid'
                      ? <NoteCard key={note._id} note={note} i={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds} onOpen={setSelectedNote} toggleStar={toggleStar} togglePin={togglePin} toggleFav={toggleFav} trashNote={trashNote} colorMenu={colorMenu} setColorMenu={setColorMenu} setColor={setColor} colorRef={colorRef} isDark={isDark} />
                      : <NoteRow  key={note._id} note={note} i={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds} onOpen={setSelectedNote} toggleStar={toggleStar} togglePin={togglePin} toggleFav={toggleFav} trashNote={trashNote} colorMenu={colorMenu} setColorMenu={setColorMenu} setColor={setColor} colorRef={colorRef} isDark={isDark} />
                    )}
                  </div>
                  {unpinned.length > 0 && <hr className="sec-divider" />}
                </div>
              )}

              {/* Main section */}
              <div className="section-hd">
                <span className="section-title">
                  {activeFolderId ? <><FolderOpen size={11} /> {folderName}</>
                    : activeFilter === 'starred'   ? <><Star size={11} /> Starred</>
                    : activeFilter === 'favorites' ? <><Heart size={11} /> Favorites</>
                    : activeFilter === 'pinned'    ? <><Pin size={11} /> Pinned</>
                    : pinned.length > 0 && unpinned.length > 0 && !activeTag
                      ? <><AlignLeft size={11} /> Other notes</>
                      : <><StickyNote size={11} /> All notes</>
                  }
                </span>
                <span className="section-count">
                  {(activeFilter === 'pinned' ? pinned : unpinned).length}
                </span>
              </div>

              <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}>
                {(activeFilter === 'pinned' ? pinned : unpinned).map((note, i) => viewMode === 'grid'
                  ? <NoteCard key={note._id} note={note} i={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds} onOpen={setSelectedNote} toggleStar={toggleStar} togglePin={togglePin} toggleFav={toggleFav} trashNote={trashNote} colorMenu={colorMenu} setColorMenu={setColorMenu} setColor={setColor} colorRef={colorRef} isDark={isDark} />
                  : <NoteRow  key={note._id} note={note} i={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds} onOpen={setSelectedNote} toggleStar={toggleStar} togglePin={togglePin} toggleFav={toggleFav} trashNote={trashNote} colorMenu={colorMenu} setColorMenu={setColorMenu} setColor={setColor} colorRef={colorRef} isDark={isDark} />
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onImported={note => setNotes(p => [note, ...p])} />
      )}

      <button
        style={{ position:'fixed', bottom:'calc(80px + env(safe-area-inset-bottom))', right:16, width:52, height:52, borderRadius:'50%', background:'var(--accent)', color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(249,115,22,0.40)', zIndex:100, transition:'transform 0.15s' }}
        onClick={createNote}
        aria-label="Create note"
        className="mobile-fab"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
      <MobileNav />
    </div>
  );
}

// ─── Note Card (Grid) ──────────────────────────────────────────────────────────
function NoteCard({ note, i, selectedIds, setSelectedIds, onOpen, toggleStar, togglePin, toggleFav, trashNote, colorMenu, setColorMenu, setColor, colorRef, isDark }) {
  const NOTE_COLORS = isDark ? NOTE_COLORS_DARK : NOTE_COLORS_LIGHT;
  const cs  = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const sel = selectedIds.includes(note._id);

  return (
    <div
      className={`note-card${sel ? ' selected' : ''}`}
      style={{
        background:cs.bg,
        borderColor:sel ? 'var(--accent)' : cs.border,
        animationDelay:`${i * 0.035}s`,
      }}
      onClick={() =>
        selectedIds.length > 0
          ? setSelectedIds(p => p.includes(note._id) ? p.filter(x => x !== note._id) : [...p, note._id])
          : onOpen(note)
      }
    >
      {/* Colored top bar for non-default colors */}
      {cs.accent && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:cs.accent, borderRadius:'12px 12px 0 0' }} />
      )}

      <div className="note-card-top">
        <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
        {note.isPinned && (
          <span className="note-pin-badge"><Pin size={12} fill="currentColor" /></span>
        )}
      </div>

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.slice(0, 3).map(t => (
            <span key={t} className="note-tag">
              <Hash size={8} />
              {t.startsWith('#') ? t.slice(1) : t}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="note-tag">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      <p className="note-excerpt">{note.plainText || 'Click to start writing…'}</p>

      <div className="note-footer">
        <span className="note-date">
          <Clock size={9} />
          {new Date(note.updatedAt).toLocaleDateString('en-IN', { month:'short', day:'numeric' })}
        </span>

        <div className="note-actions" onClick={e => e.stopPropagation()}>
          <button className={`ico-btn${note.isStarred ? ' starred' : ''}`} onClick={e => toggleStar(e, note._id)} title="Star">
            <Star size={11} fill={note.isStarred ? 'currentColor' : 'none'} />
          </button>
          <button className={`ico-btn${note.isFavorite ? ' fav' : ''}`} onClick={e => toggleFav(e, note._id)} title="Favorite">
            <Heart size={11} fill={note.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className={`ico-btn${note.isPinned ? ' pinned' : ''}`} onClick={e => togglePin(e, note._id)} title={note.isPinned ? 'Unpin' : 'Pin'}>
            {note.isPinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          <div style={{ position:'relative' }} ref={colorMenu === note._id ? colorRef : null}>
            <button className="ico-btn" onClick={e => { e.stopPropagation(); setColorMenu(colorMenu === note._id ? null : note._id); }} title="Color">
              <Palette size={11} />
            </button>
            {colorMenu === note._id && (
              <div className="color-menu" onClick={e => e.stopPropagation()}>
                {Object.entries(COLOR_DOTS).map(([k, d]) => (
                  <div key={k} className={`cdot${(note.color || 'default') === k ? ' sel' : ''}`} style={{ background:d }} title={k} onClick={() => setColor(note._id, k)} />
                ))}
              </div>
            )}
          </div>
          {note.isPublic
            ? <Globe size={10} color="var(--purple)" title="Public" style={{ margin:'0 2px' }} />
            : <Lock  size={10} color="var(--text-light)" title="Private" style={{ margin:'0 2px' }} />
          }
          <button className="ico-btn" onClick={e => trashNote(e, note._id)} title="Trash">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Note Row (List) ───────────────────────────────────────────────────────────
function NoteRow({ note, i, selectedIds, setSelectedIds, onOpen, toggleStar, togglePin, toggleFav, trashNote, colorMenu, setColorMenu, setColor, colorRef, isDark }) {
  const NOTE_COLORS = isDark ? NOTE_COLORS_DARK : NOTE_COLORS_LIGHT;
  const cs  = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const sel = selectedIds.includes(note._id);

  return (
    <div
      className={`note-row${sel ? ' selected' : ''}`}
      style={{ background:cs.bg, borderColor:sel ? 'var(--accent)' : cs.border, animationDelay:`${i * 0.025}s` }}
      onClick={() =>
        selectedIds.length > 0
          ? setSelectedIds(p => p.includes(note._id) ? p.filter(x => x !== note._id) : [...p, note._id])
          : onOpen(note)
      }
    >
      {cs.accent && (
        <div style={{ width:3, alignSelf:'stretch', background:cs.accent, borderRadius:3, flexShrink:0 }} />
      )}

      <div className="note-row-body">
        <div className="note-row-title">
          {note.isPinned && <Pin size={10} style={{ display:'inline', marginRight:5, verticalAlign:'middle', color:'var(--accent)' }} fill="currentColor" />}
          {note.title || 'Untitled Note'}
        </div>
        <div className="note-row-excerpt">{note.plainText || 'No content yet…'}</div>
      </div>

      {note.tags?.length > 0 && (
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          {note.tags.slice(0, 2).map(t => (
            <span key={t} className="note-tag" style={{ fontSize:9.5 }}>
              <Hash size={8} />{t.startsWith('#') ? t.slice(1) : t}
            </span>
          ))}
        </div>
      )}

      <div className="note-row-meta">
        <span className="note-date"><Clock size={9} />{new Date(note.updatedAt).toLocaleDateString('en-IN', { month:'short', day:'numeric' })}</span>
        <div className="note-actions" onClick={e => e.stopPropagation()}>
          <button className={`ico-btn${note.isStarred ? ' starred' : ''}`} onClick={e => toggleStar(e, note._id)}><Star size={11} fill={note.isStarred ? 'currentColor' : 'none'} /></button>
          <div style={{ position:'relative' }} ref={colorMenu === note._id ? colorRef : null}>
            <button className="ico-btn" onClick={e => { e.stopPropagation(); setColorMenu(colorMenu === note._id ? null : note._id); }}><Palette size={11} /></button>
            {colorMenu === note._id && (
              <div className="color-menu" onClick={e => e.stopPropagation()}>
                {Object.entries(COLOR_DOTS).map(([k, d]) => (
                  <div key={k} className={`cdot${(note.color || 'default') === k ? ' sel' : ''}`} style={{ background:d }} onClick={() => setColor(note._id, k)} />
                ))}
              </div>
            )}
          </div>
          <button className="ico-btn" onClick={e => trashNote(e, note._id)}><Trash2 size={11} /></button>
        </div>
      </div>
    </div>
  );
}