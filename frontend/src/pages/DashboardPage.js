import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2, Menu, LayoutGrid,
  FilePlus, Upload, Globe, Lock, CheckCircle2,
  X, ChevronRight, Hash
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

/* ─── Optimized Styles ─────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }

  .db-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; }
  .db-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }

  /* ── Header ── */
  .db-topbar {
    height: 70px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; background: #000000; border-bottom: 1px solid #111;
    flex-shrink: 0; z-index: 100;
  }
  .db-topbar-left { display: flex; align-items: center; gap: 16px; }
  .db-menu-btn { display: none; background: #111; border: 1px solid #222; border-radius: 12px; cursor: pointer; padding: 8px; color: #FFF; }

  .search-box {
    display: flex; align-items: center; gap: 12px; background: #111;
    border: 1px solid #222; border-radius: 14px; padding: 10px 18px; width: 320px; transition: 0.3s;
  }
  .search-box:focus-within { border-color: #ccff00; box-shadow: 0 0 15px rgba(204,255,0,0.1); }
  .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 600; color: #FFF; }

  /* ── Buttons ── */
  .btn-neon {
    background: #ccff00; color: #000; border: none; border-radius: 14px; padding: 12px 24px;
    font-weight: 900; font-size: 13px; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(204,255,0,0.3); }

  .btn-black {
    background: #000; color: #ccff00; border: 1px solid #222; border-radius: 14px; padding: 10px 20px;
    font-weight: 800; font-size: 13px; cursor: pointer; transition: 0.2s;
  }
  .btn-black:hover { background: #111; border-color: #ccff00; }

  /* ── Content Area ── */
  .db-content { flex: 1; overflow-y: auto; padding: 40px 5vw; scrollbar-width: none; background: #FFFFFF; }
  
  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .section-title { font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #000; }
  .count-badge { background: #000; color: #ccff00; font-size: 10px; font-weight: 900; padding: 4px 12px; border-radius: 100px; }

  /* ── Note Cards ── */
  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  
  .note-card {
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 24px; padding: 28px;
    cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); animation: fadeUp 0.4s both;
    position: relative; display: flex; flex-direction: column;
  }
  .note-card:hover { 
    border-color: #000; transform: translateY(-5px); 
    box-shadow: 0 15px 30px rgba(0,0,0,0.05); 
  }
  .note-card.selected { border-color: #ccff00; background: #F8FAFC; border-width: 2px; }

  .note-title { font-size: 18px; font-weight: 900; color: #000; margin-bottom: 12px; line-height: 1.3; }
  .note-excerpt { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 24px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  /* ── Card Footer ── */
  .note-footer { 
    display: flex; justify-content: space-between; align-items: center; 
    border-top: 1px solid #F1F5F9; padding-top: 20px; 
  }
  .note-date { font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; }

  .icon-btn { 
    width: 34px; height: 34px; border-radius: 10px; border: 1px solid #F1F5F9; 
    background: #F8FAFC; color: #000; display: flex; align-items: center; justify-content: center; 
    transition: 0.2s;
  }
  .icon-btn:hover { background: #000; color: #ccff00; border-color: #000; }
  .icon-btn.active { background: #000; color: #ccff00; border-color: #000; }

  /* ── Bulk Actions ── */
  .bulk-bar {
    position: sticky; top: 0; z-index: 50; margin-bottom: 24px; padding: 16px 28px;
    background: #000; border-radius: 20px; border: 2px solid #ccff00;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 10px 40px rgba(204,255,0,0.15); animation: fadeUp 0.3s ease;
  }

  .db-spinner { width: 30px; height: 30px; border: 3px solid #F1F5F9; border-top-color: #ccff00; border-radius: 50%; animation: spin .8s linear infinite; }

  /* ── Mobile FAB ── */
  .mobile-fab {
    position: fixed; bottom: 90px; right: 20px; width: 60px; height: 60px;
    background: #ccff00; color: #000; border-radius: 50%; display: none;
    align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(204,255,0,0.4);
    z-index: 100; border: none; cursor: pointer;
  }

  @media(max-width: 768px) {
    .db-topbar { padding: 0 16px; height: 64px; }
    .search-box { display: none; }
    .db-menu-btn { display: flex; }
    .mobile-fab { display: flex; }
    .db-content { padding: 24px 16px; }
    .db-grid { grid-template-columns: 1fr; }
    .section-title { font-size: 20px; }
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
  const bulkMode = searchParams.get("bulk") === "1" || selectedIds.length > 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeFolderId ? `/notes?folder=${activeFolderId}` : "/notes";
      const { data } = await API.get(endpoint);
      setNotes(data || []);
      const fRes = await API.get("/folders");
      setFolders(fRes.data || []);
    } catch { toast.error("Sync failed"); }
    finally { setLoading(false); }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title: "Untitled Log", content: "", folder: activeFolderId });
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    } catch { toast.error("Creation failed"); }
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
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#ccff00', padding: '6px', borderRadius: '10px' }}>
                <LayoutGrid size={18} color="#000" />
              </div>
              <span style={{ color: '#FFF', fontWeight: 900, letterSpacing: '-0.5px' }}>WORKSPACE</span>
            </div>
          </div>

          <div className="search-box">
            <Search size={18} color="#555" />
            <input placeholder="Search knowledge base..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-black" onClick={() => importInputRef.current.click()}>IMPORT</button>
            <button className="btn-neon" onClick={createNote}><Plus size={18} strokeWidth={3} /> <span className="mobile-hide">NEW NOTE</span></button>
            <input ref={importInputRef} type="file" style={{ display: 'none' }} />
          </div>
        </header>

        <div className="db-content">
          {selectedIds.length > 0 && (
            <div className="bulk-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <CheckCircle2 size={22} color="#ccff00" />
                <span style={{ color: '#FFF', fontWeight: 900 }}>{selectedIds.length} SELECTED</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-neon" style={{ padding: '8px 16px', fontSize: '11px' }}>PUBLISH</button>
                <button className="btn-black" style={{ padding: '8px 16px', fontSize: '11px', color: '#FF4444' }}>TRASH</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', color: '#888', fontWeight: 800, cursor: 'pointer', marginLeft: 10 }}>CANCEL</button>
              </div>
            </div>
          )}

          <div className="section-hd">
            <h2 className="section-title">{activeFolderId ? "CLUSTER LOGS" : "ALL DOCUMENTS"}</h2>
            {!loading && <span className="count-badge">{filteredNotes.length} FILES</span>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="db-spinner" /></div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', border: '2px dashed #F1F5F9', borderRadius: '30px' }}>
              <FilePlus size={50} color="#CBD5E1" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#94A3B8', fontWeight: 800 }}>WORKSPACE IS EMPTY</h3>
              <button className="btn-neon" onClick={createNote} style={{ margin: '20px auto 0' }}>CREATE YOUR FIRST LOG</button>
            </div>
          ) : (
            <div className="db-grid">
              {filteredNotes.map((note, i) => (
                <div key={note._id} 
                     className={`note-card ${selectedIds.includes(note._id) ? 'selected' : ''}`} 
                     onClick={() => selectedIds.length > 0 ? setSelectedIds(prev => prev.includes(note._id) ? prev.filter(x => x !== note._id) : [...prev, note._id]) : setSelectedNote(note)}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="note-title">{note.title || "UNTITLED LOG"}</h3>
                    <button className={`icon-btn ${note.isStarred ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); }}>
                      <Star size={16} fill={note.isStarred ? "#ccff00" : "none"} />
                    </button>
                  </div>

                  <p className="note-excerpt">{note.plainText || "Initialize data stream to begin documentation..."}</p>

                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {note.isPublic ? <Globe size={14} color="#ccff00" style={{ background: '#000', padding: 2, borderRadius: 4 }} /> : <Lock size={14} color="#CBD5E1" />}
                      <Trash2 size={14} color="#CBD5E1" className="hover-red" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <button className="mobile-fab" onClick={createNote}><Plus size={30} strokeWidth={3} /></button>
      <MobileNav />
    </div>
  );
}