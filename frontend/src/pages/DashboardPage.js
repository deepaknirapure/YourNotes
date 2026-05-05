import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Star, Trash2, Menu, LayoutGrid, FilePlus, Globe, Lock, CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .db-wrap { display: flex; height: 100dvh; overflow: hidden; background: #f5f5f3; font-family: 'Plus Jakarta Sans', sans-serif; }
  .db-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  .db-topbar {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; background: #ffffff; border-bottom: 1px solid #e8e6e1; flex-shrink: 0; gap: 12px;
  }
  .db-topbar-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .db-menu-btn {
    display: none; background: transparent; border: 1px solid #e8e6e1;
    border-radius: 7px; cursor: pointer; padding: 7px; color: #888580;
    align-items: center; justify-content: center; transition: 0.15s;
  }
  .db-menu-btn:hover { border-color: #f97316; color: #f97316; }

  .page-label { font-size: 14px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.3px; }

  .search-box {
    display: flex; align-items: center; gap: 9px;
    background: #f5f5f3; border: 1.5px solid #e8e6e1;
    border-radius: 9px; padding: 8px 14px; width: 280px; transition: 0.2s;
  }
  .search-box:focus-within { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249,115,22,0.08); }
  .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: #1a1a1a; font-family: inherit; }
  .search-box input::placeholder { color: #c8c5be; }

  .btn-new {
    background: #1a1a1a; color: #fff; border: none; border-radius: 9px; padding: 9px 18px;
    font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit;
    display: flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .btn-new:hover { background: #f97316; box-shadow: 0 4px 14px rgba(249,115,22,0.25); }

  .db-content { flex: 1; overflow-y: auto; padding: 28px 32px; scrollbar-width: none; background: #f5f5f3; }
  .db-content::-webkit-scrollbar { display: none; }

  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .section-title { font-size: 15px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.3px; }
  .count-pill { background: #f5f5f3; border: 1px solid #e8e6e1; color: #888580; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }

  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

  .note-card {
    background: #fff; border: 1px solid #e8e6e1; border-radius: 14px; padding: 20px;
    cursor: pointer; transition: all 0.2s; animation: fadeUp 0.35s both;
    display: flex; flex-direction: column;
  }
  .note-card:hover { border-color: #f97316; box-shadow: 0 6px 20px rgba(249,115,22,0.08); transform: translateY(-2px); }
  .note-card.selected { border-color: #f97316; background: rgba(249,115,22,0.02); border-width: 1.5px; }

  .note-title { font-size: 15px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; line-height: 1.35; }
  .note-excerpt { font-size: 13px; color: #888580; line-height: 1.65; margin-bottom: 18px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  .note-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0ede8; padding-top: 14px; }
  .note-date { font-size: 11px; font-weight: 600; color: #b0ada6; }

  .ico-btn {
    width: 28px; height: 28px; border-radius: 7px; border: 1px solid #e8e6e1;
    background: transparent; color: #b0ada6; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: 0.15s;
  }
  .ico-btn:hover { border-color: #f97316; color: #f97316; background: rgba(249,115,22,0.06); }
  .ico-btn.starred { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }

  .bulk-bar {
    position: sticky; top: 0; z-index: 50; margin-bottom: 16px; padding: 12px 20px;
    background: #fff; border-radius: 12px; border: 1.5px solid #f97316;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 4px 16px rgba(249,115,22,0.1); animation: fadeUp 0.2s ease;
  }

  .db-spinner { width: 24px; height: 24px; border: 2.5px solid #e8e6e1; border-top-color: #f97316; border-radius: 50%; animation: spin .8s linear infinite; }

  .db-empty {
    text-align: center; padding: 80px 20px; border: 1.5px dashed #e8e6e1; border-radius: 16px;
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
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <span className="page-label">{activeFolderId ? "Folder" : "My Notes"}</span>
          </div>

          <div className="search-box">
            <Search size={15} color="#b0ada6" />
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
                <CheckCircle2 size={18} color="#f97316" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{selectedIds.length} selected</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: '1px solid #e8e6e1', color: '#888580', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'inherit' }}><X size={14} /></button>
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
              <FilePlus size={40} color="#e8e6e1" />
              <h3 style={{ color: '#1a1a1a', fontWeight: 800, fontSize: 16 }}>No notes yet</h3>
              <p style={{ color: '#888580', fontSize: 14 }}>Create your first note to get started.</p>
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
                    <button className={`ico-btn${note.isStarred ? ' starred' : ''}`} onClick={e => e.stopPropagation()}>
                      <Star size={13} fill={note.isStarred ? "#f59e0b" : "none"} />
                    </button>
                  </div>

                  <p className="note-excerpt">{note.plainText || "Click to start writing..."}</p>

                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {note.isPublic ? <Globe size={12} color="#8b5cf6" /> : <Lock size={12} color="#c8c5be" />}
                      <button className="ico-btn" onClick={e => e.stopPropagation()}>
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

      <button className="mobile-fab" onClick={createNote} aria-label="Create note" style={{ display: 'none' }}>
        <Plus size={24} strokeWidth={2.5} />
      </button>
      <MobileNav />
    </div>
  );
}
