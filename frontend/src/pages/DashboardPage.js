import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText, Star, Trash2, FolderOpen, Plus, Search, LogOut, Pin,
  Sparkles, BookOpen, Tag, Share2, Zap, RotateCcw, X, Upload, Download,
} from "lucide-react";
import API from "../api/axios";
import { YN_CSS, useNeuralCanvas, useCursor } from "./NeuralBackground";

// ─── Design tokens (dark theme) ──────────────────────────────────────────────
const D = {
  bg:          "#03030f",
  sidebar:     "rgba(5,5,20,0.92)",
  card:        "rgba(255,255,255,0.03)",
  cardHov:     "rgba(255,255,255,0.06)",
  border:      "rgba(0,229,255,0.1)",
  borderMid:   "rgba(255,255,255,0.07)",
  cyan:        "#00e5ff",
  purple:      "#8b5cf6",
  amber:       "#f59e0b",
  text:        "#f0f0ff",
  textMuted:   "rgba(240,240,255,0.5)",
  textFaint:   "rgba(240,240,255,0.28)",
  danger:      "#f87171",
  dangerBg:    "rgba(239,68,68,0.1)",
  success:     "#4ade80",
  successBg:   "rgba(74,222,128,0.1)",
};

const DASH_CSS = `
  ${YN_CSS}
  .ds-sidebar-btn {
    width:100%; background:none; border:none; cursor:pointer;
    padding:9px 12px; border-radius:10px;
    display:flex; align-items:center; gap:10px;
    font-family:'DM Sans',sans-serif; font-size:13px;
    color:${D.textMuted}; text-align:left;
    transition:background .15s, color .15s;
  }
  .ds-sidebar-btn:hover  { background:rgba(0,229,255,.06); color:${D.text}; }
  .ds-sidebar-btn.active { background:rgba(0,229,255,.1);  color:${D.cyan}; font-weight:600; }

  .ds-folder-btn {
    width:100%; background:none; border:none; cursor:pointer;
    padding:8px 12px; border-radius:8px;
    display:flex; align-items:center; gap:8px;
    font-family:'DM Sans',sans-serif; font-size:12.5px;
    color:${D.textMuted}; text-align:left;
    transition:background .15s, color .15s;
  }
  .ds-folder-btn:hover  { background:rgba(0,229,255,.05); color:${D.text}; }
  .ds-folder-btn.active { background:rgba(139,92,246,.12); color:#a78bfa; font-weight:500; }

  .ds-note-card {
    padding:18px 20px; border-radius:14px;
    background:${D.card}; border:1px solid ${D.borderMid};
    cursor:pointer; transition:background .18s, border-color .18s;
    position:relative;
  }
  .ds-note-card:hover { background:${D.cardHov}; border-color:rgba(0,229,255,.18); }
  .ds-note-card:hover .ds-note-actions { opacity:1 !important; }

  .ds-note-actions { opacity:0; transition:opacity .18s; display:flex; gap:4px; }

  .ds-icon-btn {
    background:none; border:none; cursor:pointer;
    padding:5px; border-radius:7px;
    display:flex; align-items:center; justify-content:center;
    transition:background .12s;
    color:${D.textMuted};
  }
  .ds-icon-btn:hover { background:rgba(0,229,255,.1); color:${D.cyan}; }
  .ds-icon-btn.danger:hover { background:${D.dangerBg}; color:${D.danger}; }

  .ds-field {
    background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.07);
    border-radius:10px; padding:10px 14px; color:${D.text};
    font-family:'DM Sans',sans-serif; font-size:13px; width:100%;
    transition:border-color .2s;
  }
  .ds-field:focus { outline:none; border-color:rgba(0,229,255,.3); }
  .ds-field::placeholder { color:${D.textFaint}; }

  .ds-editor-field {
    background:transparent; border:none; width:100%;
    color:${D.text}; font-family:'DM Sans',sans-serif;
    resize:none;
  }
  .ds-editor-field:focus { outline:none; }

  .ds-stat-card {
    background:${D.card}; border:1px solid ${D.borderMid};
    border-radius:16px; padding:20px 22px;
    transition:border-color .2s;
  }
  .ds-stat-card:hover { border-color:rgba(0,229,255,.2); }

  .ds-toolbar-btn {
    display:flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:8px;
    font-size:12px; font-weight:500; cursor:pointer;
    transition:all .15s; font-family:'DM Sans',sans-serif;
    border:1px solid rgba(255,255,255,.08);
    background:rgba(255,255,255,.04); color:${D.textMuted};
  }
  .ds-toolbar-btn:hover { background:rgba(0,229,255,.08); border-color:rgba(0,229,255,.2); color:${D.text}; }
  .ds-toolbar-btn.primary { background:${D.cyan}; color:#000; border-color:${D.cyan}; font-weight:700; }
  .ds-toolbar-btn.primary:hover { box-shadow:0 0 20px rgba(0,229,255,.4); }

  @media (max-width:768px) {
    .ds-sidebar { display:none !important; }
    .ds-mobile-bar { display:flex !important; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`; return `${d}d ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = D.cyan }) {
  return (
    <div className="ds-stat-card" style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:42, height:42, borderRadius:12, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", color, lineHeight:1 }}>{value ?? "—"}</div>
        <div style={{ fontSize:"11px", color:D.textMuted, marginTop:3, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" }}>{label}</div>
      </div>
    </div>
  );
}

function NoteCard({ note, isSelected, onClick, onStar, onPin, onShare, onTrash, onRestore }) {
  return (
    <div className={`ds-note-card${isSelected ? " selected" : ""}`}
      onClick={onClick}
      style={{ borderColor: isSelected ? "rgba(0,229,255,.35)" : undefined, background: isSelected ? "rgba(0,229,255,.05)" : undefined }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            {note.isPinned && <Pin size={10} color={D.amber} />}
            {note.isStarred && <Star size={10} color={D.amber} fill={D.amber} />}
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:".88rem", color:D.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {note.title || "Untitled"}
            </span>
          </div>
          <p style={{ fontSize:"12px", color:D.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.5, marginBottom:10 }}>
            {note.plainText || note.content || "Empty note"}
          </p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:D.textFaint }}>{timeAgo(note.updatedAt)}</span>
            {note.folder?.name && (
              <span style={{ fontSize:"10px", padding:"2px 8px", background:"rgba(139,92,246,.12)", color:"#a78bfa", borderRadius:99, fontFamily:"'JetBrains Mono',monospace" }}>
                {note.folder.name}
              </span>
            )}
            {note.tags?.slice(0,2).map(t => (
              <span key={t} style={{ fontSize:"10px", padding:"2px 8px", background:"rgba(0,229,255,.07)", color:D.cyan, borderRadius:99, fontFamily:"'JetBrains Mono',monospace" }}>
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="ds-note-actions">
          {!note.isTrashed ? (
            <>
              <button className="ds-icon-btn" onClick={onStar}  title="Star">
                <Star size={13} fill={note.isStarred ? D.amber : "none"} color={note.isStarred ? D.amber : D.textMuted} />
              </button>
              <button className="ds-icon-btn" onClick={onPin}   title="Pin">
                <Pin  size={13} color={note.isPinned ? D.amber : D.textMuted} />
              </button>
              <button className="ds-icon-btn" onClick={onShare} title="Share">
                <Share2 size={13} />
              </button>
              <button className="ds-icon-btn danger" onClick={onTrash} title="Trash">
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <button className="ds-icon-btn" onClick={onRestore} title="Restore">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  const [user,         setUser]         = useState(null);
  const [notes,        setNotes]        = useState([]);
  const [folders,      setFolders]      = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeFolder, setActiveFolder] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor,   setShowEditor]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [showNewFolder,setShowNewFolder]= useState(false);
  const [newFolderName,setNewFolderName]= useState("");
  const [stats,        setStats]        = useState({});
  const [aiLoading,    setAiLoading]    = useState(false);
  const [showImport,   setShowImport]   = useState(false);
  const [editTitle,    setEditTitle]    = useState("");
  const [editContent,  setEditContent]  = useState("");
  const [saveTimer,    setSaveTimer]    = useState(null);

  const neuralRef    = useRef(null);
  const mouseRef     = useRef({ x:null, y:null });
  const cursorRef    = useRef(null);
  const cursorDotRef = useRef(null);
  const textareaRef  = useRef(null);

  useNeuralCanvas(neuralRef);
  useCursor(mouseRef, cursorRef, cursorDotRef);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [userRes, notesRes, foldersRes, dashRes] = await Promise.all([
        API.get("/auth/me"), API.get("/notes"), API.get("/folders"), API.get("/dashboard/stats"),
      ]);
      setUser(userRes.data);
      setNotes(notesRes.data);
      setFolders(foldersRes.data);
      setStats(dashRes.data);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedNote || !showEditor) return;
    if (saveTimer) clearTimeout(saveTimer);
    const t = setTimeout(async () => {
      try {
        await API.patch(`/notes/${selectedNote._id}`, { title: editTitle, content: editContent });
        setNotes(p => p.map(n => n._id === selectedNote._id ? { ...n, title:editTitle, content:editContent, plainText:editContent, updatedAt:new Date() } : n));
      } catch { /* silently fail */ }
    }, 1200);
    setSaveTimer(t);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, editContent]);

  const openNote = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title || "");
    setEditContent(note.plainText || note.content || "");
    setShowEditor(true);
  };

  // ── Note actions ─────────────────────────────────────────────────────────
  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title:"Untitled Note", content:"" });
      setNotes(p => [data, ...p]);
      openNote(data);
    } catch { toast.error("Failed to create note"); }
  };

  const handleTrash   = async (id, e) => { e.stopPropagation(); try { await API.patch(`/notes/${id}/trash`);   setNotes(p => p.map(n => n._id===id ? {...n, isTrashed:!n.isTrashed} : n)); if (selectedNote?._id===id) setShowEditor(false); toast.success("Moved to trash"); } catch { toast.error("Failed"); } };
  const handleRestore = async (id, e) => { e.stopPropagation(); try { await API.patch(`/notes/${id}/restore`); setNotes(p => p.map(n => n._id===id ? {...n, isTrashed:false} : n)); toast.success("Note restored"); } catch { toast.error("Failed"); } };
  const handleStar    = async (id, e) => { e.stopPropagation(); try { const { data } = await API.patch(`/notes/${id}/star`); setNotes(p => p.map(n => n._id===id ? {...n, isStarred:data.isStarred} : n)); } catch { toast.error("Failed"); } };
  const handlePin     = async (id, e) => { e.stopPropagation(); try { const { data } = await API.patch(`/notes/${id}/pin`);  setNotes(p => p.map(n => n._id===id ? {...n, isPinned:data.isPinned} : n)); } catch { toast.error("Failed"); } };
  const handleShare   = async (id, e) => { e.stopPropagation(); try { const { data } = await API.patch(`/notes/${id}/share`); await navigator.clipboard.writeText(`${window.location.origin}/shared/${data.shareToken}`); toast.success("Share link copied!"); } catch { toast.error("Failed"); } };

  const handleAISummary = async () => {
    if (!selectedNote) return;
    setAiLoading(true);
    try {
      const { data } = await API.post(`/ai/summarize/${selectedNote._id}`);
      setEditContent(prev => prev + "\n\n---\n✦ AI SUMMARY\n" + data.summary);
      toast.success("Summary added!");
    } catch { toast.error("AI summary failed"); }
    finally { setAiLoading(false); }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedNote) return;
    setAiLoading(true);
    try {
      await API.post(`/ai/flashcards/${selectedNote._id}`);
      toast.success("Flashcards generated!");
    } catch { toast.error("Failed to generate flashcards"); }
    finally { setAiLoading(false); }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const { data } = await API.post("/folders", { name: newFolderName });
      setFolders(p => [...p, data]);
      setNewFolderName(""); setShowNewFolder(false);
      toast.success("Folder created");
    } catch { toast.error("Failed"); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredNotes = notes.filter(note => {
    if (note.isTrashed && activeFilter !== "trash")   return false;
    if (!note.isTrashed && activeFilter === "trash")  return false;
    if (activeFilter === "starred" && !note.isStarred) return false;
    if (activeFilter === "pinned"  && !note.isPinned)  return false;
    if (activeFolder && note.folder !== activeFolder)  return false;
    if (searchQuery)
      return note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{DASH_CSS}</style>
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", position:"relative", zIndex:10, flexDirection:"column", gap:16 }}>
        <div style={{ width:34, height:34, border:"1.5px solid rgba(0,229,255,.3)", borderTopColor:D.cyan, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", color:D.textFaint, letterSpacing:"2px" }}>LOADING…</span>
      </div>
    </>
  );

  // ── NAV filters ──────────────────────────────────────────────────────────
  const navFilters = [
    { key:"all",     icon:FileText,  label:"All Notes" },
    { key:"pinned",  icon:Pin,       label:"Pinned"    },
    { key:"starred", icon:Star,      label:"Starred"   },
    { key:"trash",   icon:Trash2,    label:"Trash"     },
  ];

  return (
    <>
      <style>{DASH_CSS}</style>
      <div ref={cursorRef}    className="yn-cursor-ring" />
      <div ref={cursorDotRef} className="yn-cursor-dot"  />
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />

      {/* ── Layout ── */}
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", position:"relative", zIndex:10 }}>

        {/* ── SIDEBAR ── */}
        <aside className="ds-sidebar" style={{ width:250, flexShrink:0, background:D.sidebar, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderRight:`1px solid ${D.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Logo */}
          <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${D.borderMid}` }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", letterSpacing:3, color:D.cyan, textShadow:`0 0 18px rgba(0,229,255,0.4)`, marginBottom:12 }}>YOURNOTES</div>
            {user && (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${D.cyan},${D.purple})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontSize:"11px", fontWeight:800, flexShrink:0 }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontSize:"12px", fontWeight:600, color:D.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{user.name}</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:D.textFaint }}>{stats.totalNotes || 0} notes</div>
                </div>
              </div>
            )}
          </div>

          {/* New Note */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${D.borderMid}` }}>
            <button onClick={createNote} className="ds-toolbar-btn primary" style={{ width:"100%", justifyContent:"center", gap:8, padding:"10px" }}>
              <Plus size={14} /> New Note
            </button>
          </div>

          {/* Nav filters */}
          <div style={{ padding:"12px 12px 8px", flex:1, overflowY:"auto" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".6rem", letterSpacing:"3px", color:D.textFaint, marginBottom:8, paddingLeft:4 }}>// NOTES</div>
            {navFilters.map(({ key, icon: Icon, label }) => (
              <button key={key} className={`ds-sidebar-btn${activeFilter===key ? " active" : ""}`}
                onClick={() => { setActiveFilter(key); setActiveFolder(null); }}>
                <Icon size={14} /> {label}
                <span style={{ marginLeft:"auto", fontSize:"10px", color:D.textFaint, fontFamily:"'JetBrains Mono',monospace" }}>
                  {key === "all"     ? notes.filter(n => !n.isTrashed).length
                  : key === "starred" ? notes.filter(n => n.isStarred && !n.isTrashed).length
                  : key === "pinned"  ? notes.filter(n => n.isPinned  && !n.isTrashed).length
                  : notes.filter(n => n.isTrashed).length}
                </span>
              </button>
            ))}

            {/* Folders */}
            <div style={{ marginTop:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingLeft:4, marginBottom:8 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".6rem", letterSpacing:"3px", color:D.textFaint }}>// FOLDERS</div>
                <button onClick={() => setShowNewFolder(v => !v)} className="ds-icon-btn" style={{ color:D.cyan, padding:"2px 4px" }}>
                  <Plus size={12} />
                </button>
              </div>
              {showNewFolder && (
                <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                  <input className="ds-field" placeholder="Folder name…" style={{ fontSize:"12px", padding:"7px 10px" }}
                    value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && createFolder()} autoFocus />
                </div>
              )}
              {folders.map(f => (
                <button key={f._id} className={`ds-folder-btn${activeFolder===f._id ? " active" : ""}`}
                  onClick={() => { setActiveFolder(f._id); setActiveFilter("all"); }}>
                  <FolderOpen size={13} /> {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding:"12px 12px 20px", borderTop:`1px solid ${D.borderMid}` }}>
            <button className="ds-sidebar-btn" onClick={() => navigate("/flashcards")}>
              <Zap size={14} color={D.amber} /> Review Cards
            </button>
            <button className="ds-sidebar-btn" onClick={() => setShowImport(v => !v)}>
              <Upload size={14} /> Import Notes
            </button>
            <button className="ds-sidebar-btn" onClick={handleLogout} style={{ color:D.danger }}>
              <LogOut size={14} color={D.danger} /> Logout
            </button>
          </div>
        </aside>

        {/* ── NOTES LIST ── */}
        <div style={{ width:300, flexShrink:0, borderRight:`1px solid ${D.border}`, display:"flex", flexDirection:"column", background:"rgba(3,3,15,.6)", backdropFilter:"blur(10px)", overflow:"hidden" }}>

          {/* Search */}
          <div style={{ padding:"16px 14px", borderBottom:`1px solid ${D.borderMid}` }}>
            <div style={{ position:"relative" }}>
              <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:D.textFaint }} />
              <input className="ds-field" placeholder="Search notes…"
                style={{ paddingLeft:34, fontSize:"13px" }}
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {/* List header */}
          <div style={{ padding:"12px 16px 8px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"2px", color:D.textFaint, textTransform:"uppercase" }}>
              {activeFilter === "trash" ? "Trash" : activeFilter === "starred" ? "Starred" : activeFilter === "pinned" ? "Pinned" : activeFolder ? folders.find(f=>f._id===activeFolder)?.name : "All Notes"}
            </span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:D.textFaint }}>
              {filteredNotes.length}
            </span>
          </div>

          {/* Notes */}
          <div style={{ flex:1, overflowY:"auto", padding:"0 10px 16px", display:"flex", flexDirection:"column", gap:8 }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"28px", marginBottom:12 }}>📝</div>
                <div style={{ fontSize:"13px", color:D.textMuted }}>No notes here</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:D.textFaint, marginTop:6 }}>
                  {activeFilter==="all" ? "Create your first note →" : "Nothing to show"}
                </div>
              </div>
            ) : filteredNotes.map(note => (
              <NoteCard key={note._id} note={note}
                isSelected={selectedNote?._id === note._id}
                onClick={() => openNote(note)}
                onStar={e => handleStar(note._id, e)}
                onPin={e => handlePin(note._id, e)}
                onShare={e => handleShare(note._id, e)}
                onTrash={e => handleTrash(note._id, e)}
                onRestore={e => handleRestore(note._id, e)}
              />
            ))}
          </div>
        </div>

        {/* ── MAIN EDITOR / DASHBOARD ── */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", background:"rgba(3,3,15,.4)", backdropFilter:"blur(6px)" }}>
          {showEditor && selectedNote ? (
            <>
              {/* Editor toolbar */}
              <div style={{ padding:"12px 20px", borderBottom:`1px solid ${D.borderMid}`, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <button className="ds-toolbar-btn" onClick={handleAISummary} disabled={aiLoading}
                  style={{ color:D.purple, borderColor:"rgba(139,92,246,.3)", background:"rgba(139,92,246,.08)" }}>
                  <Sparkles size={13} /> {aiLoading ? "Generating…" : "AI Summary"}
                </button>
                <button className="ds-toolbar-btn" onClick={handleGenerateFlashcards} disabled={aiLoading}
                  style={{ color:D.amber, borderColor:"rgba(245,158,11,.3)", background:"rgba(245,158,11,.08)" }}>
                  <BookOpen size={13} /> Flashcards
                </button>
                <button className="ds-toolbar-btn" onClick={e => handleShare(selectedNote._id, e)}>
                  <Share2 size={13} /> Share
                </button>
                <button className="ds-toolbar-btn" onClick={e => handleTrash(selectedNote._id, e)}
                  style={{ color:D.danger, borderColor:"rgba(248,113,113,.2)", background:"rgba(239,68,68,.05)", marginLeft:"auto" }}>
                  <Trash2 size={13} /> Delete
                </button>
                <button className="ds-icon-btn" onClick={() => setShowEditor(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Editor content */}
              <div style={{ flex:1, overflowY:"auto", padding:"36px 48px" }}>
                <input className="ds-editor-field" value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.9rem", letterSpacing:"-1px", marginBottom:24, color:D.text, width:"100%" }}
                  placeholder="Note title…" />
                <div style={{ height:1, background:`linear-gradient(90deg,${D.cyan},transparent)`, marginBottom:28, opacity:.15 }} />
                <textarea ref={textareaRef} className="ds-editor-field"
                  value={editContent} onChange={e => setEditContent(e.target.value)}
                  style={{ fontSize:"15px", lineHeight:1.85, color:"rgba(240,240,255,.7)", minHeight:"60vh", display:"block" }}
                  placeholder="Start writing…" />
              </div>

              {/* Status bar */}
              <div style={{ padding:"8px 20px", borderTop:`1px solid ${D.borderMid}`, display:"flex", gap:20, alignItems:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:D.textFaint, letterSpacing:"1px" }}>
                  {editContent.split(/\s+/).filter(Boolean).length} words
                </span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:D.textFaint }}>
                  AUTO-SAVING…
                </span>
              </div>
            </>
          ) : (
            /* ── Dashboard Home ── */
            <div style={{ flex:1, overflowY:"auto", padding:"40px 40px" }}>
              <div style={{ marginBottom:36 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"3px", color:D.cyan, marginBottom:10 }}>// DASHBOARD</div>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.9rem", letterSpacing:-1, color:D.text, marginBottom:6 }}>
                  Hey, {user?.name?.split(" ")[0] || "Scholar"} 👋
                </h1>
                <p style={{ color:D.textMuted, fontSize:"14px" }}>Here's your study progress at a glance.</p>
              </div>

              {/* Stats grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:36 }}>
                <StatCard icon={FileText} label="TOTAL NOTES"       value={stats.totalNotes}       color={D.cyan}   />
                <StatCard icon={FolderOpen} label="FOLDERS"         value={stats.totalFolders}     color={D.purple} />
                <StatCard icon={Sparkles}  label="AI SUMMARIES"     value={stats.aiSummaries}      color={D.amber}  />
                <StatCard icon={BookOpen}  label="FLASHCARDS DUE"   value={stats.flashcardsDue}    color={D.cyan}   />
              </div>

              {/* Quick actions */}
              <div style={{ marginBottom:32 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".62rem", letterSpacing:"3px", color:D.textFaint, marginBottom:14 }}>// QUICK ACTIONS</div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <button className="ds-toolbar-btn primary" onClick={createNote} style={{ gap:8 }}>
                    <Plus size={14} /> New Note
                  </button>
                  <button className="ds-toolbar-btn" onClick={() => navigate("/flashcards")} style={{ color:D.amber, borderColor:"rgba(245,158,11,.25)", background:"rgba(245,158,11,.06)" }}>
                    <Zap size={14} /> Review Flashcards
                  </button>
                  <button className="ds-toolbar-btn" onClick={() => setActiveFilter("starred")}>
                    <Star size={14} /> Starred
                  </button>
                </div>
              </div>

              {/* Recent notes */}
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".62rem", letterSpacing:"3px", color:D.textFaint, marginBottom:14 }}>// RECENT NOTES</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {notes.filter(n => !n.isTrashed).slice(0,5).map(note => (
                    <div key={note._id} className="ds-note-card" onClick={() => openNote(note)}
                      style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <FileText size={16} color={D.textFaint} style={{ flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:"13px", color:D.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{note.title || "Untitled"}</div>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:D.textFaint, marginTop:2 }}>{timeAgo(note.updatedAt)}</div>
                      </div>
                      {note.isStarred && <Star size={12} color={D.amber} fill={D.amber} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
