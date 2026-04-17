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
  primary: "#10B981",
  primarySoft: "#ECFDF5",
  dark: "#111827",
  textSub: "#6B7280",
  border: "#F3F4F6",
  sidebar: "#F9FAFB",
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("all"); // all | starred | trash | folder:<id>
  const [selectedNote, setSelectedNote] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ─── Load data ──────────────────────────────────────────────────────────────
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

  // ─── Create note ────────────────────────────────────────────────────────────
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

  // ─── Star toggle ────────────────────────────────────────────────────────────
  const toggleStar = async (note, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${note._id}/star`);
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, isStarred: !n.isStarred } : n));
    } catch { toast.error("Star update nahi ho saka"); }
  };

  // ─── Trash ──────────────────────────────────────────────────────────────────
  const trashNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}/trash`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isTrashed: true } : n));
      if (selectedNote?._id === noteId) setSelectedNote(null);
      toast.success("Note trash mein move ho gaya");
      setOpenMenuId(null);
    } catch { toast.error("Trash nahi ho saka"); }
  };

  // ─── Restore from trash ─────────────────────────────────────────────────────
  const restoreNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isTrashed: false } : n));
      toast.success("Note restore ho gaya!");
    } catch { toast.error("Restore nahi ho saka"); }
  };

  // ─── Permanent delete ───────────────────────────────────────────────────────
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

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ─── Filter notes ───────────────────────────────────────────────────────────
  const filteredNotes = notes.filter(note => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || note.title.toLowerCase().includes(q) || note.content?.toLowerCase().includes(q);
    if (activeView === "starred") return !note.isTrashed && note.isStarred && matchesSearch;
    if (activeView === "trash") return note.isTrashed && matchesSearch;
    if (activeView.startsWith("folder:")) {
      const folderId = activeView.split(":")[1];
      return !note.isTrashed && note.folder?._id === folderId && matchesSearch;
    }
    return !note.isTrashed && matchesSearch;
  });

  // ─── If note is open, show editor ───────────────────────────────────────────
  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onClose={() => { setSelectedNote(null); loadData(); }}
        onUpdate={(updated) => {
          setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
          setSelectedNote(updated);
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: "280px", backgroundColor: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,
        padding: "32px 24px", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginBottom: "48px", fontFamily: "'Syne', sans-serif",
        }}>
          <span style={{ fontSize: "22px", fontWeight: "800", color: theme.dark }}>Your</span>
          <span style={{ fontSize: "22px", fontWeight: "800", color: theme.primary }}>Notes.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div>
            <p style={navLabel}>Library</p>
            <SidebarItem icon={<Home size={18} />} label="All Notes"
              count={stats.totalNotes} active={activeView === "all"}
              onClick={() => setActiveView("all")} />
            <SidebarItem icon={<Star size={18} />} label="Starred"
              count={stats.starredNotes} active={activeView === "starred"}
              onClick={() => setActiveView("starred")} />
            <SidebarItem icon={<Trash2 size={18} />} label="Trash"
              active={activeView === "trash"}
              onClick={() => setActiveView("trash")} />
          </div>

          {folders.length > 0 && (
            <div>
              <p style={navLabel}>Folders</p>
              {folders.map(folder => (
                <SidebarItem key={folder._id}
                  icon={<Folder size={18} style={{ color: folder.color || theme.primary }} />}
                  label={folder.name}
                  active={activeView === `folder:${folder._id}`}
                  onClick={() => setActiveView(`folder:${folder._id}`)} />
              ))}
            </div>
          )}

          {stats.flashcardsDue > 0 && (
            <div style={{
              backgroundColor: "#FFF7ED", border: "1px solid #FED7AA",
              borderRadius: 12, padding: "14px 16px", cursor: "pointer",
            }} onClick={() => navigate("/flashcard-review")}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#EA580C", marginBottom: 4 }}>
                🃏 {stats.flashcardsDue} FLASHCARDS DUE
              </p>
              <p style={{ fontSize: 12, color: "#9A3412" }}>Review karne ke liye tap karein</p>
            </div>
          )}
        </div>

        {/* User info */}
        <div style={{
          marginTop: "auto", backgroundColor: theme.dark,
          padding: "20px", borderRadius: "16px", color: "#fff",
        }}>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: 4 }}>{user?.name || "User"}</p>
          <p style={{ fontSize: "11px", opacity: 0.5, marginBottom: 12 }}>{user?.email}</p>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", borderRadius: 8, padding: "6px 12px",
            fontSize: 12, cursor: "pointer", width: "100%", justifyContent: "center",
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: "48px 5%", overflowY: "auto" }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "32px",
        }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "38px",
            fontWeight: "800", letterSpacing: "-2px", color: theme.dark,
          }}>
            {activeView === "starred" ? "Starred Notes." :
             activeView === "trash" ? "Trash." :
             activeView.startsWith("folder:") ? (folders.find(f => `folder:${f._id}` === activeView)?.name || "Folder") + "." :
             "My Library."}
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={loadData} style={{
              background: "none", border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer", color: theme.textSub,
            }}>
              <RefreshCw size={16} />
            </button>
            {activeView !== "trash" && (
              <button onClick={createNote} style={btnNew}>
                <Plus size={18} /> New Note
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "32px", maxWidth: 480 }}>
          <Search size={16} style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: theme.textSub,
          }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Notes search karein..."
            style={{
              width: "100%", padding: "12px 16px 12px 40px",
              borderRadius: 12, border: `1.5px solid ${theme.border}`,
              fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: theme.textSub }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
            <p>Notes load ho rahe hain...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: theme.textSub }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {activeView === "trash" ? "🗑️" : activeView === "starred" ? "⭐" : "📭"}
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: theme.dark, marginBottom: 8 }}>
              {activeView === "trash" ? "Trash Empty Hai" :
               activeView === "starred" ? "Koi Starred Note Nahi" :
               "Koi Note Nahi Mila"}
            </p>
            <p>
              {activeView === "trash" ? "Deleted notes yahan dikhte hain" :
               "Upar \"New Note\" se note banao!"}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}>
            {filteredNotes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
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

// ── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, isTrash, isMenuOpen, onOpen, onStar, onMenuToggle, onTrash, onRestore, onDelete }) {
  const snippet = note.plainText?.slice(0, 100) || note.content?.replace(/<[^>]+>/g, "").slice(0, 100) || "";
  const updatedAt = new Date(note.updatedAt);
  const timeAgo = getTimeAgo(updatedAt);

  return (
    <div
      onClick={onOpen}
      style={{
        border: `1px solid ${note.isPinned ? "#10B981" : "#F3F4F6"}`,
        borderRadius: "20px", padding: "24px", backgroundColor: "#fff",
        cursor: isTrash ? "default" : "pointer",
        display: "flex", flexDirection: "column", minHeight: "200px",
        position: "relative",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {note.isPinned && <span style={tagStyle}>📌 PINNED</span>}
          {note.aiSummary && <span style={tagStyle}>⚡ AI READY</span>}
          {note.folder && <span style={{ ...tagStyle, color: "#6B7280" }}>📂 {note.folder.name}</span>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {!isTrash && (
            <button onClick={onStar} style={{ ...iconBtn, color: note.isStarred ? "#F59E0B" : "#9CA3AF" }}>
              <Star size={15} fill={note.isStarred ? "#F59E0B" : "none"} />
            </button>
          )}
          <button onClick={onMenuToggle} style={iconBtn}><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div style={{
          position: "absolute", top: 56, right: 16, background: "#fff",
          border: "1px solid #F3F4F6", borderRadius: 12, padding: "6px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 160,
        }}
          onClick={e => e.stopPropagation()}
        >
          {isTrash ? (
            <>
              <MenuBtn icon="♻️" label="Restore" onClick={onRestore} />
              <MenuBtn icon="🗑️" label="Delete Forever" onClick={onDelete} danger />
            </>
          ) : (
            <MenuBtn icon="🗑️" label="Move to Trash" onClick={onTrash} />
          )}
        </div>
      )}

      <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px", color: "#111827" }}>
        {note.title || "Untitled Note"}
      </h3>
      <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6", flex: 1 }}>
        {snippet || "No content yet..."}
      </p>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "16px", borderTop: "1px solid #F3F4F6", marginTop: "16px",
        fontSize: "12px", color: "#9CA3AF",
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          {note.tags?.slice(0, 2).map(tag => (
            <span key={tag} style={{
              background: "#F3F4F6", borderRadius: 6, padding: "2px 8px",
              fontSize: 11, color: "#6B7280",
            }}>#{tag}</span>
          ))}
        </div>
        <span>{timeAgo}</span>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%",
      padding: "8px 12px", background: "none", border: "none",
      borderRadius: 8, cursor: "pointer", fontSize: 13, textAlign: "left",
      color: danger ? "#EF4444" : "#374151",
    }}>
      {icon} {label}
    </button>
  );
}

function SidebarItem({ icon, label, active, count, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "11px 14px", borderRadius: "12px", fontSize: "14px",
      fontWeight: active ? "700" : "500",
      color: active ? "#10B981" : "#6B7280",
      backgroundColor: active ? "#ECFDF5" : "transparent",
      cursor: "pointer", marginBottom: "4px",
      justifyContent: "space-between",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>{icon} {label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: 11, background: active ? "#10B98120" : "#F3F4F6",
          color: active ? "#10B981" : "#9CA3AF",
          borderRadius: 8, padding: "1px 7px", fontWeight: 600,
        }}>{count}</span>
      )}
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

const navLabel = {
  fontSize: "11px", fontWeight: "800", color: "#6B7280",
  textTransform: "uppercase", letterSpacing: "1.5px",
  marginBottom: "10px", paddingLeft: "12px",
};

const btnNew = {
  backgroundColor: "#10B981", color: "#fff", padding: "12px 20px",
  borderRadius: "12px", fontWeight: "700", border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", gap: "8px", fontSize: "14px",
};

const tagStyle = {
  color: "#10B981", fontWeight: "800", fontSize: "10px",
  textTransform: "uppercase", letterSpacing: "1px",
};

const iconBtn = {
  background: "none", border: "none", color: "#9CA3AF",
  cursor: "pointer", padding: "4px", borderRadius: 6,
  display: "flex", alignItems: "center",
};
