import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2, Menu, FilePlus, Globe, Lock,
  CheckCircle2, X, ArrowLeft, FolderOpen, Pin, PinOff,
  Tag, Upload, Palette, Heart, ChevronDown
} from "lucide-react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useTheme } from "../context/ThemeContext";

// ─── Note Colors ──────────────────────────────────────────────────────────────
const NOTE_COLORS = {
  default: { bg: 'var(--surface)',  border: 'var(--border)' },
  red:     { bg: '#2d1515',         border: '#7f1d1d'        },
  orange:  { bg: '#2d1a0e',         border: '#7c2d12'        },
  yellow:  { bg: '#2d2a0e',         border: '#713f12'        },
  green:   { bg: '#0f2d1a',         border: '#14532d'        },
  blue:    { bg: '#0f1d2d',         border: '#1e3a5f'        },
  purple:  { bg: '#1d0f2d',         border: '#4c1d95'        },
  pink:    { bg: '#2d0f1d',         border: '#831843'        },
};

const COLOR_DOTS = {
  default:'#64748b', red:'#ef4444', orange:'#f97316',
  yellow:'#eab308',  green:'#22c55e', blue:'#3b82f6',
  purple:'#a855f7',  pink:'#ec4899',
};

const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

  .db-wrap  { display:flex; height:100dvh; overflow:hidden; background:var(--bg); font-family:'Plus Jakarta Sans',sans-serif; }
  .db-main  { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  /* Topbar */
  .db-topbar { height:58px; display:flex; align-items:center; justify-content:space-between; padding:0 24px; background:var(--surface); border-bottom:1px solid var(--border); flex-shrink:0; gap:10px; }
  .db-topbar-left { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .db-menu-btn { display:none; background:transparent; border:1px solid var(--border); border-radius:7px; cursor:pointer; padding:7px; color:var(--text-muted); align-items:center; justify-content:center; transition:0.15s; }
  .db-menu-btn:hover { border-color:var(--accent); color:var(--accent); }
  .page-label { font-size:14px; font-weight:800; color:var(--text); letter-spacing:-0.3px; white-space:nowrap; }

  .search-box { display:flex; align-items:center; gap:9px; background:var(--bg); border:1.5px solid var(--border); border-radius:9px; padding:7px 14px; width:240px; transition:0.2s; flex-shrink:0; }
  .search-box:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
  .search-box input { border:none; outline:none; background:transparent; width:100%; font-size:13px; font-weight:500; color:var(--text); font-family:inherit; }
  .search-box input::placeholder { color:var(--text-light); }

  .topbar-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .btn-new { background:var(--text); color:var(--surface); border:none; border-radius:9px; padding:8px 16px; font-weight:700; font-size:13px; cursor:pointer; transition:0.2s; font-family:inherit; display:flex; align-items:center; gap:6px; white-space:nowrap; }
  .btn-new:hover { background:var(--accent); color:#fff; box-shadow:0 4px 14px rgba(249,115,22,0.25); }
  .btn-import { background:transparent; border:1.5px solid var(--border); border-radius:9px; padding:7px 14px; font-weight:700; font-size:13px; cursor:pointer; transition:0.2s; font-family:inherit; display:flex; align-items:center; gap:6px; color:var(--text-muted); white-space:nowrap; }
  .btn-import:hover { border-color:var(--accent); color:var(--accent); }

  /* Filter Bar */
  .filter-bar { padding:10px 24px; background:var(--surface); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; overflow-x:auto; scrollbar-width:none; flex-shrink:0; }
  .filter-bar::-webkit-scrollbar { display:none; }
  .filter-chip { padding:5px 14px; border-radius:100px; border:1.5px solid var(--border); font-size:12px; font-weight:700; cursor:pointer; transition:0.15s; background:transparent; color:var(--text-muted); font-family:inherit; white-space:nowrap; display:flex; align-items:center; gap:5px; }
  .filter-chip:hover { border-color:var(--text-muted); color:var(--text); }
  .filter-chip.active { background:var(--text); color:var(--surface); border-color:var(--text); }
  .filter-chip.tag-active { background:var(--accent); color:#fff; border-color:var(--accent); }

  /* Content */
  .db-content { flex:1; overflow-y:auto; padding:24px 28px; scrollbar-width:none; background:var(--bg); }
  .db-content::-webkit-scrollbar { display:none; }
  .section-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .section-title { font-size:14px; font-weight:800; color:var(--text); letter-spacing:-0.3px; }
  .count-pill { background:var(--bg); border:1px solid var(--border); color:var(--text-muted); font-size:11px; font-weight:700; padding:2px 9px; border-radius:100px; }
  .pinned-label { font-size:10px; font-weight:900; color:var(--text-muted); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
  .db-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:12px; }

  /* Note Card */
  .note-card { border:1.5px solid var(--border); border-radius:14px; padding:18px; cursor:pointer; transition:all 0.2s; animation:fadeUp 0.3s both; display:flex; flex-direction:column; position:relative; }
  .note-card:hover { border-color:var(--accent); box-shadow:0 4px 20px rgba(0,0,0,0.15); transform:translateY(-2px); }
  .note-card.selected { border-color:var(--accent) !important; border-width:2px; }
  .note-title  { font-size:14px; font-weight:800; color:var(--text); margin-bottom:6px; line-height:1.35; padding-right:18px; }
  .note-excerpt{ font-size:12px; color:var(--text-muted); line-height:1.65; margin-bottom:14px; flex:1; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .note-tags   { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px; }
  .note-tag    { font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; background:var(--accent-light); color:var(--accent); }
  .note-footer { display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px; }
  .note-date   { font-size:10px; font-weight:600; color:var(--text-light); }
  .note-actions{ display:flex; gap:4px; align-items:center; }
  .ico-btn { width:26px; height:26px; border-radius:6px; border:1px solid transparent; background:transparent; color:var(--text-light); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.15s; }
  .ico-btn:hover { border-color:var(--border); color:var(--text); background:var(--bg); }
  .ico-btn.s { color:#f59e0b; }
  .ico-btn.f { color:#ec4899; }
  .ico-btn.p { color:var(--accent); }
  .pin-badge { position:absolute; top:10px; right:10px; color:var(--accent); }

  /* Color Menu */
  .color-menu { position:absolute; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:10px; display:flex; gap:6px; flex-wrap:wrap; z-index:200; box-shadow:0 8px 24px rgba(0,0,0,0.35); width:168px; animation:scaleIn 0.15s ease; bottom:100%; right:0; margin-bottom:6px; }
  .cdot { width:24px; height:24px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:0.15s; }
  .cdot:hover,.cdot.sel { border-color:var(--text); transform:scale(1.15); }

  /* Tag Dropdown */
  .tag-drop { position:absolute; top:calc(100% + 4px); left:0; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:8px; z-index:200; box-shadow:0 8px 24px rgba(0,0,0,0.3); min-width:150px; animation:scaleIn 0.15s ease; max-height:200px; overflow-y:auto; }
  .tag-drop-item { padding:7px 12px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; color:var(--text-muted); }
  .tag-drop-item:hover { background:var(--bg); color:var(--text); }
  .tag-drop-item.a { color:var(--accent); background:var(--accent-light); }

  /* Import Modal */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:28px; width:100%; max-width:440px; animation:scaleIn 0.2s ease; }
  .drop-zone { border:2px dashed var(--border); border-radius:14px; padding:40px 20px; text-align:center; cursor:pointer; transition:0.2s; }
  .drop-zone:hover,.drop-zone.dov { border-color:var(--accent); background:var(--accent-light); }
  .drop-zone input { display:none; }

  /* Bulk */
  .bulk-bar { position:sticky; top:0; z-index:50; margin-bottom:16px; padding:10px 18px; background:var(--surface); border-radius:12px; border:1.5px solid var(--accent); display:flex; align-items:center; justify-content:space-between; box-shadow:0 4px 16px rgba(249,115,22,0.1); animation:fadeUp 0.2s ease; }
  .db-spinner { width:24px; height:24px; border:2.5px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin .8s linear infinite; }
  .db-empty { text-align:center; padding:60px 20px; border:1.5px dashed var(--border); border-radius:16px; display:flex; flex-direction:column; align-items:center; gap:12px; }

  @media (max-width:768px) {
    .db-topbar { padding:0 12px; height:52px; }
    .search-box { display:none; }
    .db-menu-btn { display:flex; }
    .btn-import span { display:none; }
    .filter-bar { padding:8px 12px; }
    .db-content { padding:12px; padding-bottom:calc(80px + env(safe-area-inset-bottom)); }
    .db-grid { grid-template-columns:1fr; gap:10px; }
  }
`;

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImported }) {
  const [drag, setDrag]       = useState(false);
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const pick = (f) => {
    const ok = ['application/pdf','text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'];
    const ext = f.name.match(/\.(pdf|docx|doc|txt|md)$/i);
    if (!ok.includes(f.type) && !ext) { toast.error('PDF, DOCX, TXT, MD only'); return; }
    if (f.size > 10*1024*1024) { toast.error('Max 10MB'); return; }
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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontWeight:900, fontSize:17, color:'var(--text)' }}>📂 Import Note</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={18}/></button>
        </div>
        <div className={`drop-zone${drag?' dov':''}`} onClick={() => ref.current?.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)pick(f);}}>
          <input ref={ref} type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={e=>{if(e.target.files[0])pick(e.target.files[0]);}}/>
          <Upload size={32} color="var(--text-light)" style={{margin:'0 auto 12px'}}/>
          {file ? (
            <div><div style={{fontWeight:800,color:'var(--text)',fontSize:14}}>✅ {file.name}</div><div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>{(file.size/1024).toFixed(0)} KB</div></div>
          ) : (
            <div><div style={{fontWeight:700,color:'var(--text)',fontSize:14}}>Click ya drag & drop</div><div style={{fontSize:12,color:'var(--text-muted)',marginTop:6}}>PDF • DOCX • TXT • MD &nbsp;|&nbsp; Max 10MB</div></div>
          )}
        </div>
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={onClose} style={{flex:1,background:'transparent',border:'1.5px solid var(--border)',borderRadius:10,padding:'10px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',color:'var(--text-muted)'}}>Cancel</button>
          <button onClick={doImport} disabled={!file||loading} style={{flex:2,background:file&&!loading?'var(--accent)':'var(--border)',color:'#fff',border:'none',borderRadius:10,padding:'10px',fontWeight:800,cursor:file?'pointer':'not-allowed',fontFamily:'inherit',fontSize:14}}>
            {loading?'Importing…':'Import Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [searchParams]                = useSearchParams();
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [folderName, setFolderName]   = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTag, setActiveTag]     = useState('');
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showImport, setShowImport]   = useState(false);
  const [colorMenu, setColorMenu]     = useState(null);
  const colorRef = useRef(null);
  const tagRef   = useRef(null);
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const location   = useLocation();
  const activeFolderId = searchParams.get('folder');

  // Auto-set filter based on route: /starred → starred, /tags → tags dropdown
  useEffect(() => {
    if (location.pathname === '/starred') {
      setActiveFilter('starred');
    } else if (location.pathname === '/tags') {
      setActiveFilter('all');
      setShowTagMenu(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if (colorRef.current && !colorRef.current.contains(e.target)) setColorMenu(null);
      if (tagRef.current   && !tagRef.current.contains(e.target))   setShowTagMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ep = activeFolderId ? `/notes?folder=${activeFolderId}` : '/notes';
      const [nRes, fRes] = await Promise.all([API.get(ep), activeFolderId ? API.get('/folders') : Promise.resolve(null)]);
      setNotes(nRes.data || []);
      if (activeFolderId && fRes) { const f = (fRes.data||[]).find(f=>f._id===activeFolderId); setFolderName(f?.name||'Folder'); }
      else setFolderName('');
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post('/notes', { title:'Untitled Note', content:'', folder:activeFolderId });
      setNotes(p => [data,...p]); setSelectedNote(data);
    } catch { toast.error('Could not create note'); }
  };

  const toggleStar = async (e, id) => {
    e.stopPropagation();
    try { const {data} = await API.patch(`/notes/${id}/star`); setNotes(p=>p.map(n=>n._id===id?{...n,isStarred:data.isStarred}:n)); }
    catch { toast.error('Failed'); }
  };

  const togglePin = async (e, id) => {
    e.stopPropagation();
    try { const {data} = await API.patch(`/notes/${id}/pin`); setNotes(p=>p.map(n=>n._id===id?{...n,isPinned:data.isPinned}:n)); toast.success(data.isPinned?'Pinned 📌':'Unpinned'); }
    catch { toast.error('Failed'); }
  };

  const toggleFav = async (e, id) => {
    e.stopPropagation();
    const note = notes.find(n=>n._id===id);
    const val  = !note.isFavorite;
    setNotes(p=>p.map(n=>n._id===id?{...n,isFavorite:val}:n));
    try { await API.patch(`/notes/${id}`, {isFavorite:val}); }
    catch { setNotes(p=>p.map(n=>n._id===id?{...n,isFavorite:!val}:n)); toast.error('Failed'); }
  };

  const trashNote = async (e, id) => {
    e.stopPropagation();
    try { await API.patch(`/notes/${id}/trash`); setNotes(p=>p.filter(n=>n._id!==id)); toast.success('Moved to trash'); }
    catch { toast.error('Failed'); }
  };

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id=>API.patch(`/notes/${id}/trash`)));
      setNotes(p=>p.filter(n=>!selectedIds.includes(n._id))); setSelectedIds([]);
      toast.success(`${selectedIds.length} notes moved to trash`);
    } catch { toast.error('Bulk delete failed'); }
  };

  const setColor = async (id, color) => {
    setNotes(p=>p.map(n=>n._id===id?{...n,color}:n));
    try { await API.patch(`/notes/${id}`, {color}); }
    catch { toast.error('Color update failed'); }
    setColorMenu(null);
  };

  const allTags = [...new Set(notes.flatMap(n=>n.tags||[]).filter(Boolean))];

  const filtered = notes.filter(n => {
    if (n.isTrashed) return false;
    const q = searchQuery.toLowerCase();
    const ms = !q || n.title?.toLowerCase().includes(q) || n.plainText?.toLowerCase().includes(q);
    const mf = activeFilter==='all' ? true : activeFilter==='starred' ? n.isStarred : activeFilter==='favorites' ? n.isFavorite : activeFilter==='pinned' ? n.isPinned : true;
    const mt = !activeTag || (n.tags||[]).includes(activeTag);
    return ms && mf && mt;
  });

  const pinned   = filtered.filter(n=>n.isPinned);
  const unpinned = filtered.filter(n=>!n.isPinned);

  if (selectedNote) return <NoteEditor note={selectedNote} onClose={()=>setSelectedNote(null)} onUpdate={u=>setNotes(p=>p.map(n=>n._id===u._id?u:n))} />;

  return (
    <div className="db-wrap">
      <style>{getStyles(isDark)}</style>
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} />
      <main className="db-main">

        {/* Topbar */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-menu-btn" onClick={()=>setSidebarOpen(true)}><Menu size={18}/></button>
            {activeFolderId ? (
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <button onClick={()=>navigate('/folders')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',padding:2}}><ArrowLeft size={15}/></button>
                <FolderOpen size={15} color="var(--accent)"/>
                <span className="page-label" style={{color:'var(--accent)'}}>{folderName||'Folder'}</span>
              </div>
            ) : <span className="page-label">My Notes</span>}
          </div>
          <div className="search-box">
            <Search size={14} color="var(--text-light)"/>
            <input placeholder="Search notes…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
          </div>
          <div className="topbar-actions">
            <button className="btn-import" onClick={()=>setShowImport(true)}><Upload size={14}/><span>Import</span></button>
            <button className="btn-new" onClick={createNote}><Plus size={15} strokeWidth={2.5}/><span>New Note</span></button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="filter-bar">
          {[{id:'all',l:'📝 All'},{id:'pinned',l:'📌 Pinned'},{id:'starred',l:'⭐ Starred'},{id:'favorites',l:'❤️ Favorites'}].map(f=>(
            <button key={f.id} className={`filter-chip${activeFilter===f.id?' active':''}`} onClick={()=>{setActiveFilter(f.id);setActiveTag('');}}>{f.l}</button>
          ))}
          {/* Tags dropdown — hamesha dikhega */}
          <div style={{position:'relative'}} ref={tagRef}>
            <button className={`filter-chip${activeTag?' tag-active':''}`} onClick={()=>setShowTagMenu(p=>!p)}>
              <Tag size={11}/> {activeTag ? `#${activeTag}` : 'Tags'} <ChevronDown size={11}/>
            </button>
            {showTagMenu && (
              <div className="tag-drop">
                {allTags.length === 0 ? (
                  <div className="tag-drop-item" style={{color:'var(--text-light)',cursor:'default'}}>Koi tag nahi — Note editor mein add karo</div>
                ) : (
                  <>
                    <div className="tag-drop-item" onClick={()=>{setActiveTag('');setShowTagMenu(false);}}>🏷️ All Notes</div>
                    {allTags.map(t=>(
                      <div key={t} className={`tag-drop-item${activeTag===t?' a':''}`} onClick={()=>{setActiveTag(t);setShowTagMenu(false);}}>#{t}</div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="db-content">
          {selectedIds.length>0 && (
            <div className="bulk-bar">
              <div style={{display:'flex',alignItems:'center',gap:8}}><CheckCircle2 size={16} color="var(--accent)"/><span style={{fontWeight:700,fontSize:13,color:'var(--text)'}}>{selectedIds.length} selected</span></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={bulkDelete} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Delete</button>
                <button onClick={()=>setSelectedIds([])} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-muted)',borderRadius:8,padding:'6px 10px',cursor:'pointer',display:'flex',alignItems:'center',fontFamily:'inherit'}}><X size={13}/></button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{display:'flex',justifyContent:'center',padding:'80px 0'}}><div className="db-spinner"/></div>
          ) : filtered.length===0 ? (
            <div className="db-empty">
              <FilePlus size={36} color="var(--border)"/>
              <h3 style={{color:'var(--text)',fontWeight:800,fontSize:15}}>
                {activeFilter!=='all'?`Koi ${activeFilter} note nahi`:activeFolderId?`"${folderName}" mein koi note nahi`:'No notes yet'}
              </h3>
              <p style={{color:'var(--text-muted)',fontSize:13}}>{activeFilter==='all'?'Create karo ya import karo':'Filter change karo'}</p>
              {activeFilter==='all' && (
                <div style={{display:'flex',gap:10,marginTop:4}}>
                  <button className="btn-new" onClick={createNote}><Plus size={14}/> Create</button>
                  <button className="btn-import" onClick={()=>setShowImport(true)}><Upload size={14}/> Import</button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Pinned section (only when filter=all) */}
              {pinned.length>0 && activeFilter==='all' && (
                <div style={{marginBottom:24}}>
                  <div className="pinned-label"><Pin size={11}/> Pinned</div>
                  <div className="db-grid">
                    {pinned.map((note,i)=>(
                      <NoteCard key={note._id} note={note} i={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                        onOpen={setSelectedNote} toggleStar={toggleStar} togglePin={togglePin} toggleFav={toggleFav}
                        trashNote={trashNote} colorMenu={colorMenu} setColorMenu={setColorMenu} setColor={setColor} colorRef={colorRef}/>
                    ))}
                  </div>
                  {unpinned.length>0 && <div style={{borderTop:'1px solid var(--border)',margin:'20px 0 16px'}}/>}
                </div>
              )}

              {/* Main notes */}
              <div className="section-hd">
                <h2 className="section-title">
                  {activeFolderId?`📁 ${folderName}`:activeFilter==='all'?(pinned.length>0&&unpinned.length>0?'Other Notes':'All Notes'):activeFilter==='starred'?'⭐ Starred':activeFilter==='favorites'?'❤️ Favorites':'📌 Pinned'}
                </h2>
                <span className="count-pill">{(activeFilter==='pinned'?pinned:unpinned).length}</span>
              </div>
              <div className="db-grid">
                {(activeFilter==='pinned'?pinned:unpinned).map((note,i)=>(
                  <NoteCard key={note._id} note={note} i={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                    onOpen={setSelectedNote} toggleStar={toggleStar} togglePin={togglePin} toggleFav={toggleFav}
                    trashNote={trashNote} colorMenu={colorMenu} setColorMenu={setColorMenu} setColor={setColor} colorRef={colorRef}/>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showImport && <ImportModal onClose={()=>setShowImport(false)} onImported={note=>setNotes(p=>[note,...p])}/>}
      <button className="mobile-fab" onClick={createNote} aria-label="Create note"><Plus size={22} strokeWidth={2.5}/></button>
      <MobileNav/>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, i, selectedIds, setSelectedIds, onOpen, toggleStar, togglePin, toggleFav, trashNote, colorMenu, setColorMenu, setColor, colorRef }) {
  const cs  = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const sel = selectedIds.includes(note._id);
  return (
    <div
      className={`note-card${sel?' selected':''}`}
      style={{background:cs.bg, borderColor:sel?'var(--accent)':cs.border, animationDelay:`${i*0.04}s`}}
      onClick={()=>selectedIds.length>0?setSelectedIds(p=>p.includes(note._id)?p.filter(x=>x!==note._id):[...p,note._id]):onOpen(note)}
    >
      {note.isPinned && <div className="pin-badge"><Pin size={12} fill="currentColor"/></div>}
      <h3 className="note-title">{note.title||'Untitled Note'}</h3>
      {note.tags?.length>0 && (
        <div className="note-tags">
          {note.tags.slice(0,3).map(t=><span key={t} className="note-tag">#{t}</span>)}
          {note.tags.length>3 && <span className="note-tag">+{note.tags.length-3}</span>}
        </div>
      )}
      <p className="note-excerpt">{note.plainText||'Click to start writing…'}</p>
      <div className="note-footer">
        <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</span>
        <div className="note-actions" onClick={e=>e.stopPropagation()}>
          <button className={`ico-btn${note.isStarred?' s':''}`} onClick={e=>toggleStar(e,note._id)} title="Star"><Star size={12} fill={note.isStarred?'currentColor':'none'}/></button>
          <button className={`ico-btn${note.isFavorite?' f':''}`} onClick={e=>toggleFav(e,note._id)} title="Favorite"><Heart size={12} fill={note.isFavorite?'currentColor':'none'}/></button>
          <button className={`ico-btn${note.isPinned?' p':''}`} onClick={e=>togglePin(e,note._id)} title={note.isPinned?'Unpin':'Pin'}>{note.isPinned?<PinOff size={12}/>:<Pin size={12}/>}</button>
          <div style={{position:'relative'}}>
            <button className="ico-btn" onClick={e=>{e.stopPropagation();setColorMenu(colorMenu===note._id?null:note._id);}} title="Color"><Palette size={12}/></button>
            {colorMenu===note._id && (
              <div className="color-menu" ref={colorRef} onClick={e=>e.stopPropagation()}>
                {Object.entries(COLOR_DOTS).map(([k,d])=>(
                  <div key={k} className={`cdot${(note.color||'default')===k?' sel':''}`} style={{background:d}} title={k} onClick={()=>setColor(note._id,k)}/>
                ))}
              </div>
            )}
          </div>
          {note.isPublic?<Globe size={11} color="var(--purple)"/>:<Lock size={11} color="var(--text-light)"/>}
          <button className="ico-btn" onClick={e=>trashNote(e,note._id)} title="Delete"><Trash2 size={12}/></button>
        </div>
      </div>
    </div>
  );
}
