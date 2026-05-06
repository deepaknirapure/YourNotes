import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Star, Trash2, Menu, FilePlus, Globe, Lock, CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useTheme } from "../context/ThemeContext";

// Hindi: CSS variables use karo taaki dark/light mode automatic kaam kare
const getStyles = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .db-wrap { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; }
  .db-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  .db-topbar {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; background: var(--surface); border-bottom: 1px solid var(--border); flex-shrink: 0; gap: 12px;
  }
  .db-topbar-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .db-menu-btn {
    display: none; background: transparent; border: 1px solid var(--border);
    border-radius: 7px; cursor: pointer; padding: 7px; color: var(--text-muted);
    align-items: center; justify-content: center; transition: 0.15s;
  }
  .db-menu-btn:hover { border-color: var(--accent); color: var(--accent); }

  .page-label { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }

  .search-box {
    display: flex; align-items: center; gap: 9px;
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 9px; padding: 8px 14px; width: 280px; transition: 0.2s;
  }
  .search-box:focus-within { border-color: var(--accent); background: var(--surface); box-shadow: 0 0 0 3px var(--accent-light); }
  .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: var(--text); font-family: inherit; }
  .search-box input::placeholder { color: var(--text-light); }

  .btn-new {
    background: var(--text); color: var(--surface); border: none; border-radius: 9px; padding: 9px 18px;
    font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit;
    display: flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .btn-new:hover { background: var(--accent); color: #fff; box-shadow: 0 4px 14px rgba(249,115,22,0.25); }

  .db-content { flex: 1; overflow-y: auto; padding: 28px 32px; scrollbar-width: none; background: var(--bg); }
  .db-content::-webkit-scrollbar { display: none; }

  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .section-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }
  .count-pill { background: var(--bg); border: 1px solid var(--border); color: var(--text-muted); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }

  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

  .note-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px;
    cursor: pointer; transition: all 0.2s; animation: fadeUp 0.35s both;
    display: flex; flex-direction: column;
  }
  .note-card:hover { border-color: var(--accent); box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .note-card.selected { border-color: var(--accent); background: var(--accent-light); border-width: 1.5px; }

  .note-title { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1.35; }
  .note-excerpt { font-size: 13px; color: var(--text-muted); line-height: 1.65; margin-bottom: 18px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  .note-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 14px; }
  .note-date { font-size: 11px; font-weight: 600; color: var(--text-light); }

  .ico-btn {
    width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border);
    background: transparent; color: var(--text-light); display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: 0.15s;
  }
  .ico-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .ico-btn.starred { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }

  .bulk-bar {
    position: sticky; top: 0; z-index: 50; margin-bottom: 16px; padding: 12px 20px;
    background: var(--surface); border-radius: 12px; border: 1.5px solid var(--accent);
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 4px 16px rgba(249,115,22,0.1); animation: fadeUp 0.2s ease;
  }

  .db-spinner { width: 24px; height: 24px; border: 2.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; }

  .db-empty {
    text-align: center; padding: 80px 20px; border: 1.5px dashed var(--border); border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }

  @media (max-width: 768px) {
    .db-topbar { padding: 0 14px; height: 52px; }
    .search-box { display: none; }
    .db-menu-btn { display: flex; }
    .db-content { padding: 14px; padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
    .db-grid { grid-template-columns: 1fr; gap: 10px; }
    .note-card { padding: 16px; }
    .btn-new span { display: none; }
  }
`;

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  // Hindi: isDark se current theme pata karo
  const { isDark } = useTheme();

  const activeFolderId = searchParams.get("folder");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeFolderId ? `/notes?folder=${activeFolderId}` : "/notes";
      const { data } = await API.get(endpoint);
      setNotes(data || []);
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title: "Untitled Note", content: "", folder: activeFolderId });
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    } catch { toast.error("Could not create note"); }
  };

  // Hindi: Star toggle karne ka function
  const toggleStar = async (e, noteId) => {
    e.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${noteId}/star`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isStarred: data.isStarred } : n));
    } catch { toast.error("Could not update star"); }
  };

  // Hindi: Note trash mein daalne ka function
  const trashNote = async (e, noteId) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${noteId}/trash`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("Moved to trash");
    } catch { toast.error("Could not delete note"); }
  };

  // Hindi: Bulk delete — selected notes trash karo
  const bulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => API.patch(`/notes/${id}/trash`)));
      setNotes(prev => prev.filter(n => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} notes moved to trash`);
    } catch { toast.error("Bulk delete failed"); }
  };

  const filteredNotes = notes.filter(n =>
    !n.isTrashed &&
    (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     n.plainText?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedNote) {
    return <NoteEditor note={selectedNote} onClose={() => setSelectedNote(null)} onUpdate={(u) => setNotes(prev => prev.map(n => n._id === u._id ? u : n))} />;
  }

  return (
    <div className="db-wrap">
      <style>{getStyles(isDark)}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <span className="page-label">{activeFolderId ? "Folder" : "My Notes"}</span>
          </div>

          <div className="search-box">
            <Search size={15} color="var(--text-light)" />
            <input placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <button className="btn-new" onClick={createNote}>
            <Plus size={16} strokeWidth={2.5} /> <span>New Note</span>
          </button>
        </header>

        <div className="db-content">
          {selectedIds.length > 0 && (
            <div className="bulk-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{selectedIds.length} selected</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={bulkDelete} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'inherit' }}><X size={14} /></button>
              </div>
            </div>
          )}

          <div className="section-hd">
            <h2 className="section-title">{activeFolderId ? "Folder Notes" : "All Notes"}</h2>
            {!loading && <span className="count-pill">{filteredNotes.length}</span>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="db-spinner" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="db-empty">
              <FilePlus size={40} color="var(--border)" />
              <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: 16 }}>No notes yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Create your first note to get started.</p>
              <button className="btn-new" onClick={createNote} style={{ marginTop: 4 }}>
                <Plus size={16} /> Create Note
              </button>
            </div>
          ) : (
            <div className="db-grid">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`note-card${selectedIds.includes(note._id) ? ' selected' : ''}`}
                  onClick={() => selectedIds.length > 0
                    ? setSelectedIds(prev => prev.includes(note._id) ? prev.filter(x => x !== note._id) : [...prev, note._id])
                    : setSelectedNote(note)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <h3 className="note-title">{note.title || "Untitled Note"}</h3>
                    <button className={`ico-btn${note.isStarred ? ' starred' : ''}`} onClick={e => toggleStar(e, note._id)}>
                      <Star size={13} fill={note.isStarred ? "#f59e0b" : "none"} />
                    </button>
                  </div>

                  <p className="note-excerpt">{note.plainText || "Click to start writing..."}</p>

                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {note.isPublic ? <Globe size={12} color="var(--purple)" /> : <Lock size={12} color="var(--text-light)" />}
                      <button className="ico-btn" onClick={e => trashNote(e, note._id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Hindi: Mobile floating action button */}
      <button
        className="mobile-fab"
        onClick={createNote}
        aria-label="Create note"
        style={{
          position: 'fixed', bottom: 76, right: 16,
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--accent)', color: '#fff', border: 'none',
          cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(249,115,22,0.3)', zIndex: 199, transition: 'transform 0.18s',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
      <MobileNav />
    </div>
  );
}
