import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Star, Trash2,
  Menu, LayoutGrid, FilePlus, Sparkles, Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .pg-wrap { display: flex; height: 100vh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; justify-content: space-between; 
    padding: 0 24px; background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; }
  
  .search-wrapper {
    display: flex; align-items: center; gap: 10px; background: #F8FAFC; 
    border: 1px solid #E2E8F0; border-radius: 10px; padding: 8px 16px; 
    width: 320px; transition: 0.2s;
  }
  .search-wrapper:focus-within { border-color: #E55B2D; background: #FFF; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  .search-wrapper input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: #0F172A; }

  .btn-create {
    display: flex; align-items: center; gap: 8px; background: #0F172A; color: #FFF; 
    border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; 
    font-weight: 600; cursor: pointer; transition: 0.2s;
  }
  .btn-create:hover { background: #E55B2D; transform: translateY(-1px); }

  .pg-content { flex: 1; overflow-y: auto; padding: 32px 5vw; scrollbar-width: none; }
  
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .section-title { font-size: 18px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
  
  .notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  
  .note-card {
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; 
    display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s ease;
    animation: fadeUp 0.3s both; position: relative;
  }
  .note-card:hover { border-color: #CBD5E1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); transform: translateY(-2px); }
  
  .note-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
  .note-excerpt { font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 24px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  
  .note-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 16px; }
  .note-date { font-size: 12px; font-weight: 600; color: #94A3B8; }
  
  .ai-actions-mini { display: flex; gap: 8px; }
  .ai-btn-mini {
    padding: 6px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF;
    color: #64748B; transition: 0.2s; display: flex; align-items: center; justify-content: center;
  }
  .ai-btn-mini:hover { border-color: #E55B2D; color: #E55B2D; background: #FFF5F2; }

  .btn-trash {
    position: absolute; top: 12px; right: 12px; padding: 6px; border-radius: 8px;
    color: #94A3B8; background: transparent; border: none; opacity: 0; transition: 0.2s;
  }
  .note-card:hover .btn-trash { opacity: 1; }
  .btn-trash:hover { color: #EF4444; background: #FEF2F2; }

  .spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) { 
    .pg-menu-btn { display: flex !important; } 
    .search-wrapper { display: none; } 
    .note-card .btn-trash { opacity: 1; }
  }
`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes");
      setNotes(data || []);
    } catch { toast.error("Failed to sync workspace"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title: "Untitled Document", content: "" });
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    } catch { toast.error("Error creating document"); }
  };

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Move this note to trash?")) return;
    try {
      await API.patch(`/notes/${id}/trash`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success("Note moved to trash");
    } catch { toast.error("Failed to delete note"); }
  };

  const filteredNotes = notes.filter(n => 
    !n.isTrashed && 
    (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     n.plainText?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedNote) {
    return (
      <NoteEditor 
        note={selectedNote} 
        onClose={() => setSelectedNote(null)} 
        onUpdate={(u) => setNotes(prev => prev.map(n => n._id === u._id ? u : n))} 
      />
    );
  }

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="pg-main">
        <header className="pg-topbar">
          <div className="topbar-left">
            <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LayoutGrid size={14} color="#64748B" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Workspace</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="search-wrapper">
              <Search size={16} color="#94A3B8" />
              <input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn-create" onClick={createNote}><Plus size={16} /> New Note</button>
          </div>
        </header>

        <div className="pg-content">
          <div className="section-header">
            <h2 className="section-title">All Documents</h2>
            {!loading && <span style={{fontSize: '12px', fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '4px 10px', borderRadius: '100px'}}>{filteredNotes.length} Items</span>}
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><div className="spinner" /></div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state" style={{textAlign: 'center', padding: '80px 0'}}>
              <div style={{marginBottom: '16px', color: '#CBD5E1'}}><FilePlus size={48} style={{margin: '0 auto'}}/></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{searchQuery ? "No matching notes" : "Workspace empty"}</h3>
              <button className="btn-create" onClick={createNote} style={{marginTop: 16, marginInline: 'auto'}}><Plus size={16} /> Create Note</button>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note, i) => (
                <div key={note._id} className="note-card" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => setSelectedNote(note)}>
                  
                  <button className="btn-trash" onClick={(e) => deleteNote(e, note._id)} title="Delete Note">
                    <Trash2 size={16} />
                  </button>

                  <div className="note-header">
                    <h3 className="note-title">{note.title || "Untitled Document"}</h3>
                    {note.isStarred && <Star size={16} fill="#E55B2D" color="#E55B2D" />}
                  </div>
                  
                  <p className="note-excerpt">{note.plainText || "No content available..."}</p>
                  
                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    
                    <div className="ai-actions-mini">
                      {/* AI Buttons now just open the note, functions are handled inside NoteEditor */}
                      <button className="ai-btn-mini" title="AI Summary">
                        <Sparkles size={14} />
                      </button>
                      <button className="ai-btn-mini" title="AI Flashcards">
                        <Brain size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}