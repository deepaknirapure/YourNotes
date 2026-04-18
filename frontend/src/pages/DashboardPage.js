import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Star, Folder, Trash2, Home,
  MoreHorizontal, Sparkles, CreditCard, Share2,
  FileDown, LogOut, Pin, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";

const theme = {
  primary: "#E55B2D",
  bg: "#0a0a0a",
  sidebar: "#0d0d0d",
  card: "#111111",
  border: "rgba(255,255,255,0.07)",
  text: "#ffffff",
  textSub: "rgba(255,255,255,0.4)",
};

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
    } catch (err) {
      toast.error("Data load nahi ho saka. Please refresh karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title: "Untitled Note", content: "" });
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
      toast.success("Note create ho gaya!");
    } catch {
      toast.error("Note create nahi ho saka");
    }
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

  const handleLogout = () => { logout(); navigate("/login"); };

  const filteredNotes = notes.filter(note => {
    if (activeView === "trash") return note.isTrashed;
    if (note.isTrashed) return false;
    if (activeView === "starred") return note.isStarred;
    if (activeView.startsWith("folder:")) return note.folder?._id === activeView.split(":")[1];
    const q = searchQuery.toLowerCase();
    return !q || note.title?.toLowerCase().includes(q) || note.plainText?.toLowerCase().includes(q);
  });

  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onBack={() => { setSelectedNote(null); loadData(); }}
        onUpdate={(updated) => {
          setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
          setSelectedNote(updated);
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, fontFamily: "'DM Sans', sans-serif", color: theme.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes ynFadeIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ynSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .yn-note-card {
          background: #111; border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 22px;
          cursor: pointer; transition: all .2s;
          animation: ynFadeIn .4s cubic-bezier(.16,1,.3,1) both;
        }
        .yn-note-card:hover { border-color: rgba(229,91,45,.3); transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,.4); }
        .yn-note-card.pinned { border-color: rgba(229,91,45,.35); }

        .yn-sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 9px; font-size: 14px;
          cursor: pointer; transition: all .15s; margin-bottom: 2px;
          font-weight: 500; color: rgba(255,255,255,.4);
        }
        .yn-sidebar-item:hover { background: rgba(255,255,255,.04); color: rgba(255,255,255,.7); }
        .yn-sidebar-item.active { background: rgba(229,91,45,.1); color: #E55B2D; font-weight: 700; }

        .yn-search-input {
          width: 100%; padding: 12px 16px 12px 42px;
          background: rgba(255,255,255,.04);
          border: 1.5px solid rgba(255,255,255,.08);
          border-radius: 10px; font-size: 14px; color: #fff;
          font-family: 'DM Sans', sans-serif; transition: border-color .2s;
        }
        .yn-search-input::placeholder { color: rgba(255,255,255,.2); }
        .yn-search-input:focus { outline: none; border-color: rgba(229,91,45,.4); }

        .yn-btn-new {
          background: #E55B2D; color: #fff; padding: 11px 20px;
          border-radius: 9px; font-weight: 700; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; transition: all .2s;
        }
        .yn-btn-new:hover { background: #c94d23; transform: translateY(-1px); }

        .yn-icon-btn {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          color: rgba(255,255,255,.4); cursor: pointer; padding: 10px;
          border-radius: 9px; transition: all .2s; display: flex; align-items: center;
        }
        .yn-icon-btn:hover { background: rgba(255,255,255,.08); color: #fff; }

        .yn-tag { background: rgba(229,91,45,.1); border: 1px solid rgba(229,91,45,.2); color: #E55B2D; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
        .yn-menu { position: absolute; top: 52px; right: 16px; background: #1a1a1a; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 6px; box-shadow: 0 12px 40px rgba(0,0,0,.5); z-index: 100; min-width: 160px; }
        .yn-menu-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; background: none; border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,.6); transition: background .15s; }
        .yn-menu-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
        .yn-menu-btn.danger { color: #ef4444; }
        .yn-menu-btn.danger:hover { background: rgba(239,68,68,.08); }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 256, background: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,
        padding: "28px 16px",
        display: "flex", flexDirection: "column", gap: 24, flexShrink: 0, overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
          <div style={{ width: 30, height: 30, background: "#E55B2D", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
            Your<span style={{ color: "#E55B2D" }}>Notes</span>
          </span>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, paddingLeft: 12 }}>Library</p>
            <div className={`yn-sidebar-item ${activeView === "all" ? "active" : ""}`} onClick={() => setActiveView("all")}>
              <Home size={16} /> All Notes
              <span style={{ marginLeft: "auto", fontSize: 11, background: activeView === "all" ? "rgba(229,91,45,.2)" : "rgba(255,255,255,.06)", color: activeView === "all" ? "#E55B2D" : "rgba(255,255,255,.3)", borderRadius: 5, padding: "1px 7px", fontWeight: 600 }}>{stats.totalNotes}</span>
            </div>
            <div className={`yn-sidebar-item ${activeView === "starred" ? "active" : ""}`} onClick={() => setActiveView("starred")}>
              <Star size={16} /> Starred
              <span style={{ marginLeft: "auto", fontSize: 11, background: activeView === "starred" ? "rgba(229,91,45,.2)" : "rgba(255,255,255,.06)", color: activeView === "starred" ? "#E55B2D" : "rgba(255,255,255,.3)", borderRadius: 5, padding: "1px 7px", fontWeight: 600 }}>{stats.starredNotes}</span>
            </div>
            <div className={`yn-sidebar-item ${activeView === "trash" ? "active" : ""}`} onClick={() => setActiveView("trash")}>
              <Trash2 size={16} /> Trash
            </div>
          </div>

          {folders.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, paddingLeft: 12 }}>Folders</p>
              {folders.map(folder => (
                <div key={folder._id} className={`yn-sidebar-item ${activeView === `folder:${folder._id}` ? "active" : ""}`}
                  onClick={() => setActiveView(`folder:${folder._id}`)}>
                  <Folder size={16} style={{ color: folder.color || "#E55B2D" }} />
                  {folder.name}
                </div>
              ))}
            </div>
          )}

          {stats.flashcardsDue > 0 && (
            <div style={{
              background: "rgba(229,91,45,.08)", border: "1px solid rgba(229,91,45,.2)",
              borderRadius: 10, padding: "14px 16px", cursor: "pointer",
            }} onClick={() => navigate("/flashcard-review")}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#E55B2D", marginBottom: 4 }}>
                🃏 {stats.flashcardsDue} FLASHCARDS DUE
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Review karne ke liye tap karein</p>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ marginTop: "auto", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", padding: "18px", borderRadius: 12, color: "#fff" }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{user?.name || "User"}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 14 }}>{user?.email}</p>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.5)", borderRadius: 8, padding: "7px 12px",
            fontSize: 12, cursor: "pointer", width: "100%", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
          }} onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
             onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: "44px 5%", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: "-2px", color: "#fff" }}>
            {activeView === "starred" ? "Starred Notes." :
             activeView === "trash" ? "Trash." :
             activeView.startsWith("folder:") ? (folders.find(f => `folder:${f._id}` === activeView)?.name || "Folder") + "." :
             "My Library."}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={loadData} className="yn-icon-btn"><RefreshCw size={15} /></button>
            {activeView !== "trash" && (
              <button onClick={createNote} className="yn-btn-new">
                <Plus size={17} /> New Note
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 36, maxWidth: 480 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.2)" }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Notes search karein..." className="yn-search-input" />
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0", color: "rgba(255,255,255,.3)" }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgba(229,91,45,.3)", borderTopColor: "#E55B2D", borderRadius: "50%", animation: "ynSpin 1s linear infinite", margin: "0 auto 16px" }} />
            <p>Notes load ho rahe hain...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", color: "rgba(255,255,255,.3)" }}>
            <div style={{ fontSize: 52, marginBottom: 18 }}>
              {activeView === "trash" ? "🗑️" : activeView === "starred" ? "⭐" : "📭"}
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              {activeView === "trash" ? "Trash Empty Hai" :
               activeView === "starred" ? "Koi Starred Note Nahi" :
               "Koi Note Nahi Mila"}
            </p>
            <p style={{ fontSize: 14 }}>
              {activeView === "trash" ? "Deleted notes yahan dikhte hain" : "Upar \"New Note\" se note banao!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
            {filteredNotes.map((note, idx) => (
              <NoteCard
                key={note._id}
                note={note}
                idx={idx}
                isTrash={activeView === "trash"}
                isMenuOpen={openMenuId === note._id}
                onOpen={() => !note.isTrashed && setSelectedNote(note)}
                onStar={(e) => toggleStar(note, e)}
                onMenuToggle={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === note._id ? null : note._id); }}
                onTrash={() => trashNote(note._id)}
                onRestore={() => restoreNote(note._id)}
                onDelete={() => deleteNote(note._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function NoteCard({ note, idx, isTrash, isMenuOpen, onOpen, onStar, onMenuToggle, onTrash, onRestore, onDelete }) {
  const snippet = note.plainText?.slice(0, 110) || note.content?.replace(/<[^>]+>/g, "").slice(0, 110) || "";
  const timeAgo = getTimeAgo(new Date(note.updatedAt));

  return (
    <div onClick={onOpen} className={`yn-note-card${note.isPinned ? " pinned" : ""}`}
      style={{ cursor: isTrash ? "default" : "pointer", display: "flex", flexDirection: "column", minHeight: 200, position: "relative", animationDelay: `${idx * 0.04}s` }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {note.isPinned && <span className="yn-tag">📌 PINNED</span>}
          {note.aiSummary && <span className="yn-tag">⚡ AI READY</span>}
          {note.folder && <span style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>📂 {note.folder.name}</span>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {!isTrash && (
            <button onClick={onStar} style={{ background: "none", border: "none", color: note.isStarred ? "#E55B2D" : "rgba(255,255,255,.2)", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", transition: "color .2s" }}>
              <Star size={15} fill={note.isStarred ? "#E55B2D" : "none"} />
            </button>
          )}
          <button onClick={onMenuToggle} style={{ background: "none", border: "none", color: "rgba(255,255,255,.2)", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", transition: "color .2s" }}>
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

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

      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#fff", lineHeight: 1.3 }}>
        {note.title || "Untitled Note"}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.7, flex: 1 }}>
        {snippet || "No content yet..."}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 16, fontSize: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {note.tags?.slice(0, 2).map(tag => (
            <span key={tag} style={{ background: "rgba(255,255,255,.05)", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "rgba(255,255,255,.3)" }}>#{tag}</span>
          ))}
        </div>
        <span style={{ color: "rgba(255,255,255,.25)" }}>{timeAgo}</span>
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
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
