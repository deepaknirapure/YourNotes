import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2, Menu, LayoutGrid,
  FilePlus, Globe, Lock, CheckCircle2, X
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }

  .db-wrap { display: flex; height: 100dvh; overflow: hidden; background: #151313; font-family: 'Plus Jakarta Sans', sans-serif; }
  .db-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* Header */
  .db-topbar {
    height: 64px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; background: #1e1b1b; border-bottom: 1px solid #2a2525; flex-shrink: 0;
  }
  .db-topbar-left { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .db-menu-btn { display: none; background: #2a2525; border: 1px solid #3a3535; border-radius: 10px; cursor: pointer; padding: 8px; color: #f7f7f5; align-items: center; justify-content: center; transition: 0.2s; }
  .db-menu-btn:hover { background: #ff5734; border-color: #ff5734; }

  .search-box {
    display: flex; align-items: center; gap: 10px; background: #2a2525;
    border: 1.5px solid #3a3535; border-radius: 12px; padding: 10px 16px; width: 300px; transition: 0.25s;
  }
  .search-box:focus-within { border-color: #ff5734; box-shadow: 0 0 0 3px rgba(255,87,52,0.12); }
  .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 600; color: #f7f7f5; font-family: inherit; }
  .search-box input::placeholder { color: #4a4040; }

  /* Buttons */
  .btn-neon {
    background: #ff5734; color: #fff; border: none; border-radius: 12px; padding: 11px 22px;
    font-weight: 800; font-size: 13px; cursor: pointer; transition: 0.25s; font-family: inherit;
    display: flex; align-items: center; gap: 8px; white-space: nowrap;
  }
  .btn-neon:hover { background: #e64a2a; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,87,52,0.35); }

  .btn-outline {
    background: transparent; color: #be94f5; border: 1.5px solid #be94f5; border-radius: 12px; padding: 9px 18px;
    font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-outline:hover { background: rgba(190,148,245,0.1); }

  /* Content */
  .db-content { flex: 1; overflow-y: auto; padding: 32px 5vw; scrollbar-width: none; background: #151313; }
  .db-content::-webkit-scrollbar { display: none; }

  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
  .section-title { font-size: 22px; font-weight: 900; letter-spacing: -0.8px; color: #f7f7f5; }
  .count-badge { background: rgba(255,87,52,0.12); color: #ff5734; border: 1px solid rgba(255,87,52,0.2); font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 100px; }

  /* Note Cards */
  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }

  .note-card {
    background: #1e1b1b; border: 1.5px solid #2a2525; border-radius: 20px; padding: 24px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); animation: fadeUp 0.4s both;
    position: relative; display: flex; flex-direction: column;
  }
  .note-card:hover { border-color: #ff5734; transform: translateY(-4px); box-shadow: 0 14px 35px rgba(255,87,52,0.12); }
  .note-card.selected { border-color: #ff5734; background: rgba(255,87,52,0.05); border-width: 2px; }

  .note-title { font-size: 16px; font-weight: 800; color: #f7f7f5; margin-bottom: 10px; line-height: 1.35; }
  .note-excerpt { font-size: 13.5px; color: #8a7f7f; line-height: 1.7; margin-bottom: 20px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  .note-footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid #2a2525; padding-top: 16px;
  }
  .note-date { font-size: 11px; font-weight: 700; color: #4a4040; text-transform: uppercase; letter-spacing: 0.5px; }

  .icon-btn {
    width: 32px; height: 32px; border-radius: 9px; border: 1px solid #2a2525;
    background: #2a2525; color: #8a7f7f; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: 0.2s;
  }
  .icon-btn:hover { background: rgba(255,87,52,0.15); color: #ff5734; border-color: rgba(255,87,52,0.3); }
  .icon-btn.active { background: rgba(252,196,45,0.15); color: #fcc42d; border-color: rgba(252,196,45,0.3); }

  /* Bulk Actions */
  .bulk-bar {
    position: sticky; top: 0; z-index: 50; margin-bottom: 20px; padding: 14px 24px;
    background: #1e1b1b; border-radius: 16px; border: 1.5px solid #ff5734;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 8px 30px rgba(255,87,52,0.15); animation: fadeUp 0.3s ease;
  }

  .db-spinner { width: 28px; height: 28px; border: 3px solid #2a2525; border-top-color: #ff5734; border-radius: 50%; animation: spin .8s linear infinite; }

  /* Empty state */
  .db-empty {
    text-align: center; padding: 80px 20px;
    border: 2px dashed #2a2525; border-radius: 24px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }

  @media (max-width: 1024px) {
    .db-content { padding: 24px; }
    .search-box { width: 240px; }
  }

  @media (max-width: 768px) {
    .db-topbar { padding: 0 14px; height: 58px; }
    .search-box { display: none; }
    .db-menu-btn { display: flex; }
    .db-content { padding: 16px; padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
    .db-grid { grid-template-columns: 1fr; gap: 12px; }
    .section-title { font-size: 18px; }
    .note-card { padding: 18px; border-radius: 16px; }
    .btn-neon span { display: none; }
  }
`;

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const importInputRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [folders, setFolders] = useState([]);

  const activeFolderId = searchParams.get("folder");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeFolderId ? `/notes?folder=${activeFolderId}` : "/notes";
      const { data } = await API.get(endpoint);
      setNotes(data || []);
      const fRes = await API.get("/folders");
      setFolders(fRes.data || []);
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
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#ff5734', padding: '7px', borderRadius: '10px', display: 'flex' }}>
                <LayoutGrid size={17} color="#fff" />
              </div>
              <span style={{ color: '#f7f7f5', fontWeight: 900, fontSize: 15, letterSpacing: '-0.3px' }}>My Notes</span>
            </div>
          </div>

          <div className="search-box">
            <Search size={17} color="#4a4040" />
            <input placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-neon" onClick={createNote}>
              <Plus size={18} strokeWidth={3} /> <span>New Note</span>
            </button>
          </div>
        </header>

        <div className="db-content">
          {selectedIds.length > 0 && (
            <div className="bulk-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 size={20} color="#ff5734" />
                <span style={{ color: '#f7f7f5', fontWeight: 800, fontSize: 14 }}>{selectedIds.length} selected</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-neon" style={{ padding: '8px 14px', fontSize: 12 }}>Move to Folder</button>
                <button style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', color: '#8a7f7f', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'inherit' }}><X size={14} /> Cancel</button>
              </div>
            </div>
          )}

          <div className="section-hd">
            <h2 className="section-title">{activeFolderId ? "Folder Notes" : "All Notes"}</h2>
            {!loading && <span className="count-badge">{filteredNotes.length} notes</span>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div className="db-spinner" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="db-empty">
              <FilePlus size={48} color="#2a2525" />
              <h3 style={{ color: '#4a4040', fontWeight: 800, fontSize: 16 }}>No notes yet</h3>
              <p style={{ color: '#4a4040', fontSize: 14 }}>Create your first note to get started.</p>
              <button className="btn-neon" onClick={createNote} style={{ marginTop: 4 }}>
                <Plus size={18} /> Create Note
              </button>
            </div>
          ) : (
            <div className="db-grid">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`note-card ${selectedIds.includes(note._id) ? 'selected' : ''}`}
                  onClick={() => selectedIds.length > 0
                    ? setSelectedIds(prev => prev.includes(note._id) ? prev.filter(x => x !== note._id) : [...prev, note._id])
                    : setSelectedNote(note)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <h3 className="note-title">{note.title || "Untitled Note"}</h3>
                    <button className={`icon-btn ${note.isStarred ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); }}>
                      <Star size={15} fill={note.isStarred ? "#fcc42d" : "none"} />
                    </button>
                  </div>

                  <p className="note-excerpt">{note.plainText || "Click to start writing..."}</p>

                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {note.isPublic
                        ? <Globe size={14} color="#be94f5" />
                        : <Lock size={14} color="#4a4040" />}
                      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }} style={{ width: 28, height: 28 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <button className="mobile-fab" onClick={createNote} aria-label="Create note">
        <Plus size={26} strokeWidth={3} />
      </button>
      <MobileNav />
    </div>
  );
}
