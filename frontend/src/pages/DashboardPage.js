import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Folder, Trash2, Home,
  MoreHorizontal, CreditCard, Share2, LogOut,
  RefreshCw, User, Inbox, BookOpen, Flame,
  FolderPlus, X, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("all");
  const [selectedNote, setSelectedNote] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [notesRes, foldersRes, dashRes] = await Promise.all([
        API.get("/notes"),
        API.get("/folders"),
        API.get("/dashboard"),
      ]);
      setNotes(notesRes.data);
      setFolders(foldersRes.data);
      setStats(dashRes.data);
    } catch {
      toast.error("Data load nahi ho saka. Refresh karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Close menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title: "Untitled Note", content: "" });
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    } catch { toast.error("Note create nahi ho saka"); }
  };

  const toggleStar = async (note, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${note._id}/star`);
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, isStarred: !n.isStarred } : n));
    } catch { toast.error("Star update nahi ho saka"); }
  };

  const trashNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}/trash`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isTrashed: true } : n));
      if (selectedNote?._id === noteId) setSelectedNote(null);
      toast.success("Note trash mein move ho gaya");
      setOpenMenuId(null);
    } catch { toast.error("Trash nahi ho saka"); }
  };

  const restoreNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isTrashed: false } : n));
      toast.success("Note restore ho gaya!");
    } catch { toast.error("Restore nahi ho saka"); }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Note permanently delete ho jayega. Sure ho?")) return;
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) setSelectedNote(null);
      toast.success("Note delete ho gaya");
      setOpenMenuId(null);
    } catch { toast.error("Delete nahi ho saka"); }
  };

  const shareNote = async (note, e) => {
    e.stopPropagation();
    try {
      const { data } = await API.post(`/notes/${note._id}/share`);
      const link = `${window.location.origin}/shared/${data.shareToken}`;
      await navigator.clipboard.writeText(link);
      toast.success("Share link copy ho gaya!");
    } catch { toast.error("Share link generate nahi ho saka"); }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const { data } = await API.post("/folders", { name: newFolderName.trim(), color: "#E55B2D", icon: "📁" });
      setFolders(prev => [...prev, data]);
      setNewFolderName(""); setShowNewFolder(false);
      toast.success("Folder create ho gaya!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Folder create nahi ho saka");
    } finally { setCreatingFolder(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const filteredNotes = notes.filter(note => {
    if (activeView === "trash") return note.isTrashed;
    if (note.isTrashed) return false;
    if (activeView === "starred") return note.isStarred;
    if (activeView.startsWith("folder:")) return note.folder?._id === activeView.split(":")[1];
    const q = searchQuery.toLowerCase();
    return !q || note.title?.toLowerCase().includes(q) || note.plainText?.toLowerCase().includes(q) || note.tags?.some(t => t.toLowerCase().includes(q));
  });

  // ── Editor view (full screen on mobile, split on desktop) ──
  if (selectedNote) {
    return (
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', 'DM Sans', sans-serif", overflow: "hidden" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          @media(max-width:768px){.yn-editor-sidebar{display:none!important}}
        `}</style>
        {/* Mini sidebar on desktop */}
        <aside className="yn-editor-sidebar" style={{ width: 56, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#E55B2D", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, cursor: "pointer" }} onClick={() => setSelectedNote(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
          {[
            { icon: <Home size={17} />, onClick: () => setSelectedNote(null) },
            { icon: <User size={17} />, onClick: () => navigate("/profile") },
            { icon: <LogOut size={17} />, onClick: handleLogout },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", padding: 10, borderRadius: 8, display: "flex", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,.3)"; }}>
              {item.icon}
            </button>
          ))}
        </aside>
        <NoteEditor
          note={selectedNote}
          onClose={() => { setSelectedNote(null); loadData(); }}
          onUpdate={(updated) => {
            setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
            setSelectedNote(updated);
          }}
        />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
          Your<span style={{ color: "#E55B2D" }}>Notes</span>
        </span>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { icon: <BookOpen size={13} />, label: stats.totalNotes, sub: "Notes" },
          { icon: <Flame size={13} />, label: `${user?.streak?.count || 0}d`, sub: "Streak" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,.04)", borderRadius: 8, padding: "10px 10px", textAlign: "center" }}>
            <div style={{ color: "#E55B2D", display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.2)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6, paddingLeft: 12 }}>Library</p>
          {[
            { key: "all", icon: <Home size={16} />, label: "All Notes", count: stats.totalNotes },
            { key: "starred", icon: <Star size={16} />, label: "Starred", count: stats.starredNotes },
            { key: "trash", icon: <Trash2 size={16} />, label: "Trash", count: null },
          ].map(item => (
            <div key={item.key} className={`yn-sidebar-item ${activeView === item.key ? "active" : ""}`} onClick={() => { setActiveView(item.key); setSidebarOpen(false); }}>
              {item.icon} {item.label}
              {item.count != null && <span style={{ marginLeft: "auto", fontSize: 11, background: activeView === item.key ? "rgba(229,91,45,.2)" : "rgba(255,255,255,.06)", color: activeView === item.key ? "#E55B2D" : "rgba(255,255,255,.3)", borderRadius: 5, padding: "1px 7px", fontWeight: 600 }}>{item.count}</span>}
            </div>
          ))}
        </div>

        {/* Folders */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 12, marginBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.2)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Folders</p>
            <button onClick={() => setShowNewFolder(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", display: "flex", padding: 2, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#E55B2D"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
              <FolderPlus size={14} />
            </button>
          </div>

          {showNewFolder && (
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, padding: "10px", marginBottom: 6, display: "flex", gap: 6 }}>
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." onKeyDown={e => e.key === "Enter" && createFolder()} autoFocus
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "'Inter', 'DM Sans', sans-serif" }} />
              <button onClick={createFolder} disabled={creatingFolder} style={{ background: "#E55B2D", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                {creatingFolder ? "..." : "Add"}
              </button>
              <button onClick={() => setShowNewFolder(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", display: "flex" }}>
                <X size={14} />
              </button>
            </div>
          )}

          {folders.map(folder => (
            <div key={folder._id} className={`yn-sidebar-item ${activeView === `folder:${folder._id}` ? "active" : ""}`}
              onClick={() => { setActiveView(`folder:${folder._id}`); setSidebarOpen(false); }}>
              <Folder size={16} style={{ color: folder.color || "#E55B2D" }} />
              {folder.name}
              {folder.noteCount != null && <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,.2)", fontWeight: 600 }}>{folder.noteCount}</span>}
            </div>
          ))}
        </div>

        {/* Flashcards due */}
        {stats.flashcardsDue > 0 && (
          <div style={{ background: "rgba(229,91,45,.08)", border: "1px solid rgba(229,91,45,.2)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "background .2s" }}
            onClick={() => navigate("/flashcard-review")}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(229,91,45,.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(229,91,45,.08)"}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <CreditCard size={14} color="#E55B2D" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#E55B2D" }}>{stats.flashcardsDue} CARDS DUE</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Review karne ke liye tap karein →</p>
          </div>
        )}
      </nav>

      {/* User */}
      <div style={{ marginTop: "auto", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", padding: "14px 16px", borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#E55B2D,#c94d23)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>
            {(user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => navigate("/profile")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", borderRadius: 7, padding: "7px 0", fontSize: 11, cursor: "pointer", fontFamily: "'Inter', 'DM Sans', sans-serif", fontWeight: 600, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>
            <User size={12} /> Profile
          </button>
          <button onClick={() => navigate("/community")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.2)", color: "#a78bfa", borderRadius: 7, padding: "7px 0", fontSize: 11, cursor: "pointer", fontFamily: "'Inter', 'DM Sans', sans-serif", fontWeight: 600, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,.18)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,.08)"}>
            <Users size={12} /> Community
          </button>
          <button onClick={handleLogout} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)", color: "#ef4444", borderRadius: 7, padding: "7px 0", fontSize: 11, cursor: "pointer", fontFamily: "'Inter', 'DM Sans', sans-serif", fontWeight: 600, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,.08)"}>
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", fontFamily: "'Inter', 'DM Sans', sans-serif", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes ynFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynSlideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        .yn-sidebar-item{display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:9px;font-size:13px;cursor:pointer;transition:all .15s;margin-bottom:2px;font-weight:500;color:rgba(255,255,255,.4)}
        .yn-sidebar-item:hover{background:rgba(255,255,255,.04);color:rgba(255,255,255,.7)}
        .yn-sidebar-item.active{background:rgba(229,91,45,.1);color:#E55B2D;font-weight:700}
        .yn-note-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:22px;cursor:pointer;transition:all .22s;animation:ynFadeIn .4s cubic-bezier(.16,1,.3,1) both;position:relative}
        .yn-note-card:hover{border-color:rgba(229,91,45,.3);transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,.4)}
        .yn-note-card.trash-card{cursor:default;opacity:.7}
        .yn-search-input{width:100%;padding:11px 16px 11px 42px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:10px;font-size:14px;color:#fff;font-family:'Inter','DM Sans',sans-serif;transition:border-color .2s}
        .yn-search-input::placeholder{color:rgba(255,255,255,.2)}
        .yn-search-input:focus{outline:none;border-color:rgba(229,91,45,.4)}
        .yn-btn-new{background:#E55B2D;color:#fff;padding:10px 20px;border-radius:9px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-family:'Inter','DM Sans',sans-serif;transition:all .2s;white-space:nowrap}
        .yn-btn-new:hover{background:#c94d23;transform:translateY(-1px);box-shadow:0 8px 24px rgba(229,91,45,.3)}
        .yn-menu{position:absolute;top:52px;right:16px;background:#1c1c1c;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:6px;box-shadow:0 12px 40px rgba(0,0,0,.6);z-index:100;min-width:170px;animation:ynFadeIn .15s ease}
        .yn-menu-btn{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;background:none;border:none;border-radius:7px;cursor:pointer;font-size:13px;font-family:'Inter','DM Sans',sans-serif;color:rgba(255,255,255,.6);transition:background .15s;text-align:left}
        .yn-menu-btn:hover{background:rgba(255,255,255,.06);color:#fff}
        .yn-menu-btn.danger{color:#ef4444}
        .yn-menu-btn.danger:hover{background:rgba(239,68,68,.08)}
        .yn-tag{background:rgba(229,91,45,.1);border:1px solid rgba(229,91,45,.2);color:#E55B2D;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
        @media(max-width:900px){
          .yn-desktop-sidebar{display:none!important}
          .yn-mobile-topbar{display:flex!important}
        }
        @media(min-width:901px){
          .yn-mobile-topbar{display:none!important}
          .yn-mobile-sidebar-overlay{display:none!important}
        }
        .yn-skeleton{background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.05) 75%);background-size:400% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="yn-desktop-sidebar" style={{ width: 250, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,.07)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16, flexShrink: 0, overflowY: "auto" }}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="yn-mobile-sidebar-overlay" style={{ position: "fixed", inset: 0, zIndex: 300 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)" }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 270, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,.07)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", animation: "ynSlideIn .25s ease" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Mobile topbar */}
        <div className="yn-mobile-topbar" style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 16px", height: 56, display: "none", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", padding: 6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>Your<span style={{ color: "#E55B2D" }}>Notes</span></span>
          <button onClick={createNote} style={{ background: "#E55B2D", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+</button>
        </div>

        <div style={{ flex: 1, padding: "36px 5%", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1.5px", color: "#fff", lineHeight: 1.1 }}>
              {activeView === "starred" ? "Starred." :
               activeView === "trash" ? "Trash." :
               activeView.startsWith("folder:") ? (folders.find(f => `folder:${f._id}` === activeView)?.name || "Folder") + "." :
               "My Library."}
            </h1>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={loadData} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.4)", cursor: "pointer", padding: "9px", borderRadius: 9, display: "flex", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.4)"}>
                <RefreshCw size={15} />
              </button>
              {activeView !== "trash" && (
                <button onClick={createNote} className="yn-btn-new">
                  <Plus size={17} /> New Note
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          {activeView !== "trash" && (
            <div style={{ position: "relative", marginBottom: 32, maxWidth: 520 }}>
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.2)", pointerEvents: "none" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Notes, tags search karein..." className="yn-search-input" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", display: "flex" }}>
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Notes */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 22, minHeight: 200 }}>
                  <div className="yn-skeleton" style={{ height: 12, width: "40%", marginBottom: 14 }} />
                  <div className="yn-skeleton" style={{ height: 18, width: "80%", marginBottom: 10 }} />
                  <div className="yn-skeleton" style={{ height: 12, width: "100%", marginBottom: 6 }} />
                  <div className="yn-skeleton" style={{ height: 12, width: "70%", marginBottom: 24 }} />
                  <div className="yn-skeleton" style={{ height: 12, width: "30%" }} />
                </div>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.3)", animation: "ynFadeIn .4s ease" }}>
              <div style={{ color: "rgba(255,255,255,.1)", display: "flex", justifyContent: "center", marginBottom: 20 }}>
                {activeView === "trash" ? <Trash2 size={52} /> : activeView === "starred" ? <Star size={52} /> : <Inbox size={52} />}
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 8 }}>
                {activeView === "trash" ? "Trash Khali Hai" : activeView === "starred" ? "Koi Starred Note Nahi" : "Koi Note Nahi Mila"}
              </p>
              <p style={{ fontSize: 14, maxWidth: 300, margin: "0 auto 24px" }}>
                {activeView === "trash" ? "Delete kiye notes yahan dikhte hain" : "Upar \"New Note\" button se apna pehla note banao!"}
              </p>
              {activeView === "all" && (
                <button onClick={createNote} className="yn-btn-new" style={{ margin: "0 auto" }}>
                  <Plus size={16} /> Create Your First Note
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
              {filteredNotes.map((note, idx) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  idx={idx}
                  isTrash={activeView === "trash"}
                  isMenuOpen={openMenuId === note._id}
                  onOpen={() => { if (!note.isTrashed) setSelectedNote(note); }}
                  onStar={(e) => toggleStar(note, e)}
                  onShare={(e) => shareNote(note, e)}
                  onMenuToggle={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === note._id ? null : note._id); }}
                  onTrash={() => trashNote(note._id)}
                  onRestore={() => restoreNote(note._id)}
                  onDelete={() => deleteNote(note._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NoteCard({ note, idx, isTrash, isMenuOpen, onOpen, onStar, onShare, onMenuToggle, onTrash, onRestore, onDelete }) {
  const snippet = note.plainText?.slice(0, 120) || note.content?.replace(/<[^>]+>/g, "").slice(0, 120) || "";
  const timeAgo = getTimeAgo(new Date(note.updatedAt));

  return (
    <div onClick={onOpen} className={`yn-note-card${isTrash ? " trash-card" : ""}`}
      style={{ animationDelay: `${idx * 0.03}s`, display: "flex", flexDirection: "column", minHeight: 200 }}>
      {/* Top */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {note.isPinned && <span className="yn-tag">📌 PINNED</span>}
          {note.aiSummary && <span className="yn-tag">⚡ AI</span>}
          {note.folder && <span style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.35)", borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 600 }}>📂 {note.folder.name}</span>}
        </div>
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          {!isTrash && (
            <>
              <button onClick={onStar} style={{ background: "none", border: "none", color: note.isStarred ? "#E55B2D" : "rgba(255,255,255,.18)", cursor: "pointer", padding: 5, borderRadius: 6, display: "flex", transition: "color .15s" }}
                onMouseEnter={e => e.currentTarget.style.color="#E55B2D"} onMouseLeave={e => e.currentTarget.style.color = note.isStarred ? "#E55B2D" : "rgba(255,255,255,.18)"}>
                <Star size={14} fill={note.isStarred ? "#E55B2D" : "none"} />
              </button>
              <button onClick={onShare} style={{ background: "none", border: "none", color: "rgba(255,255,255,.18)", cursor: "pointer", padding: 5, borderRadius: 6, display: "flex", transition: "color .15s" }}
                onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.18)"}
                title="Share note">
                <Share2 size={14} />
              </button>
            </>
          )}
          <button onClick={onMenuToggle} style={{ background: "none", border: "none", color: "rgba(255,255,255,.18)", cursor: "pointer", padding: 5, borderRadius: 6, display: "flex", transition: "color .15s" }}
            onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.18)"}>
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {isMenuOpen && (
        <div className="yn-menu" onClick={e => e.stopPropagation()}>
          {isTrash ? (
            <>
              <button className="yn-menu-btn" onClick={onRestore}>♻️ Restore</button>
              <button className="yn-menu-btn danger" onClick={onDelete}>🗑️ Delete Forever</button>
            </>
          ) : (
            <button className="yn-menu-btn danger" onClick={onTrash}>🗑️ Move to Trash</button>
          )}
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#fff", lineHeight: 1.3, flex: "none" }}>
        {note.title || "Untitled Note"}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.33)", lineHeight: 1.7, flex: 1 }}>
        {snippet || "No content yet..."}
        {snippet?.length >= 120 && "..."}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.05)", marginTop: 14 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {note.tags?.slice(0, 2).map(tag => (
            <span key={tag} style={{ background: "rgba(255,255,255,.05)", borderRadius: 4, padding: "2px 7px", fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 600 }}>#{tag}</span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>{timeAgo}</span>
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
