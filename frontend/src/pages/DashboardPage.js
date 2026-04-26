-e // यह Dashboard page hai - notes create, search, aur manage karne ke liye
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Star, Folder, Trash2,
  MoreHorizontal, Share2, LogOut, RefreshCw, Menu,
  FolderPlus, X, FileText, Clock, Hash
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .db-wrap{display:flex;height:100vh;overflow:hidden;}
  .db-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .db-topbar{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;gap:12px;}
  .db-search-wrap{position:relative;flex:1;max-width:340px;display:flex;align-items:center;}
  .db-search-wrap svg{position:absolute;left:9px;color:rgba(255,255,255,.3);pointer-events:none;}
  .db-search{width:100%;padding:7px 12px 7px 30px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:6px;font-size:13px;font-family:inherit;color:#fff;outline:none;transition:border-color .15s;}
  .db-search:focus{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.07);}
  .db-search::placeholder{color:rgba(255,255,255,.2);}
  .db-new-btn{display:flex;align-items:center;gap:6px;background:#E55B2D;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;}
  .db-new-btn:hover{background:#d14e24;box-shadow:0 4px 14px rgba(229,91,45,.3);}
  .db-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .db-notes-area{flex:1;overflow-y:auto;padding:16px;}
  .db-view-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
  .db-notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;}
  .db-note-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px;cursor:pointer;transition:border-color .15s,background .15s;animation:fadeUp .3s both;position:relative;}
  .db-note-card:hover{border-color:rgba(255,255,255,.14);background:#161616;}
  .db-note-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:24px;}
  .db-note-preview{font-size:12px;color:rgba(255,255,255,.35);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;margin-bottom:10px;}
  .db-note-meta{display:flex;align-items:center;justify-content:space-between;}
  .db-note-date{font-size:11px;color:rgba(255,255,255,.22);font-weight:500;}
  .db-note-actions{display:flex;gap:4px;align-items:center;}
  .db-icon-btn{background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;padding:3px;border-radius:4px;transition:all .12s;display:flex;align-items:center;justify-content:center;}
  .db-icon-btn:hover{color:#fff;background:rgba(255,255,255,.08);}
  .db-more-btn{position:absolute;top:10px;right:10px;background:none;border:none;color:rgba(255,255,255,.25);cursor:pointer;padding:3px;border-radius:4px;transition:all .12s;display:flex;}
  .db-more-btn:hover{color:#fff;background:rgba(255,255,255,.08);}
  .db-dropdown{position:absolute;top:32px;right:8px;background:#1a1a1a;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:4px;min-width:148px;z-index:30;animation:fadeUp .12s ease;box-shadow:0 12px 32px rgba(0,0,0,.6);}
  .db-dd-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:5px;font-size:12px;font-weight:500;color:rgba(255,255,255,.65);cursor:pointer;transition:background .12s;}
  .db-dd-item:hover{background:rgba(255,255,255,.06);color:#fff;}
  .db-dd-item.danger{color:#ef4444;}
  .db-dd-item.danger:hover{background:rgba(239,68,68,.1);}
  .db-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:10px;text-align:center;}
  .db-empty-icon{width:44px;height:44px;background:#1a1a1a;border:1px solid rgba(255,255,255,.08);border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.25);margin-bottom:4px;}
  .db-tag{display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,.06);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:500;color:rgba(255,255,255,.35);}
  .db-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .db-folder-section{border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:8px;margin-bottom:8px;}
  .db-new-folder-row{display:flex;gap:8px;margin-top:8px;}
  .db-folder-input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:5px;padding:6px 10px;font-size:12px;font-family:inherit;color:#fff;outline:none;}
  .db-folder-input:focus{border-color:#E55B2D;}
  .db-folder-input::placeholder{color:rgba(255,255,255,.2);}
  .db-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.db-menu-btn{display:flex!important}.db-notes-grid{grid-template-columns:1fr!important}}
`;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes]             = useState([]);
  const [folders, setFolders]         = useState([]);
  const [stats, setStats]             = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView]   = useState("all");
  const [selectedNote, setSelectedNote] = useState(null);
  const [openMenuId, setOpenMenuId]   = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    } catch { toast.error("Could not load data. Please refresh."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
    } catch { toast.error("Could not create note"); }
  };

  const toggleStar = async (note, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${note._id}/star`);
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, isStarred: !n.isStarred } : n));
    } catch { toast.error("Could not update star"); }
  };

  const trashNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}/trash`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isTrashed: true } : n));
      if (selectedNote?._id === noteId) setSelectedNote(null);
      toast.success("Note moved to trash");
      setOpenMenuId(null);
    } catch { toast.error("Could not move to trash"); }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to permanently delete this note??")) return;
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) setSelectedNote(null);
      toast.success("Note deleted permanently");
      setOpenMenuId(null);
    } catch { toast.error("Could not delete note"); }
  };

  const restoreNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isTrashed: false } : n));
      toast.success("Note restored!");
    } catch { toast.error("Could not restore note"); }
  };

  const shareNote = async (note, e) => {
    e.stopPropagation();
    try {
      const { data } = await API.post(`/notes/${note._id}/share`);
      const link = `${window.location.origin}/shared/${data.shareToken}`;
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied!");
    } catch { toast.error("Could not generate share link"); }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const { data } = await API.post("/folders", { name: newFolderName.trim(), color: "#E55B2D", icon: "📁" });
      setFolders(prev => [...prev, data]);
      setNewFolderName(""); setShowNewFolder(false);
      toast.success("Folder created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Folder create nahi ho saka");
    } finally { setCreatingFolder(false); }
  };

  // BUG FIX: search now works in all views
  const filteredNotes = notes.filter(note => {
    if (activeView === "trash") return note.isTrashed;
    if (note.isTrashed) return false;
    if (activeView === "starred") return note.isStarred;
    if (activeView.startsWith("folder:")) return note.folder?._id === activeView.split(":")[1];
    const q = searchQuery.toLowerCase();
    return !q || note.title?.toLowerCase().includes(q) || note.plainText?.toLowerCase().includes(q) || note.tags?.some(t => t.toLowerCase().includes(q));
  });

  const viewLabel = () => {
    if (activeView === "all") return `All Notes`;
    if (activeView === "starred") return "Starred Notes";
    if (activeView === "trash") return "Trash";
    const f = folders.find(x => `folder:${x._id}` === activeView);
    return f ? f.name : "Notes";
  };

  if (selectedNote) {
    return (
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Geist',-apple-system,sans-serif", overflow: "hidden" }}>
        <style>{S}</style>
        <aside style={{ width: 44, background: "#000", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#E55B2D", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setSelectedNote(null)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
        </aside>
        <NoteEditor
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdate={(updated) => setNotes(prev => prev.map(n => n._id === updated._id ? updated : n))}
        />
      </div>
    );
  }

  return (
    <div className="db-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="db-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="db-main">
        <div className="db-topbar">
          <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <div className="db-search-wrap">
            <Search size={13} />
            <input className="db-search" placeholder="Search notes..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className="db-new-btn" onClick={createNote}><Plus size={14} />New Note</button>
        </div>

        <div className="db-notes-area">
          <div className="db-view-title">
            <span>{viewLabel()} <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>({filteredNotes.length})</span></span>
            <button onClick={loadData} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", display: "flex", alignItems: "center", padding: "3px" }}>
              <RefreshCw size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
              <div className="db-spinner" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon"><FileText size={20} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>
                {searchQuery ? "No notes found" : "No notes yet"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>
                {searchQuery ? "Try a different search" : "Click New Note to get started"}
              </div>
            </div>
          ) : (
            <div className="db-notes-grid">
              {filteredNotes.map((note, i) => (
                <div key={note._id} className="db-note-card" onClick={() => setSelectedNote(note)}
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <button className="db-more-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === note._id ? null : note._id); }}>
                    <MoreHorizontal size={14} />
                  </button>
                  {openMenuId === note._id && (
                    <div className="db-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="db-dd-item" onClick={e => { toggleStar(note, e); setOpenMenuId(null); }}>
                        <Star size={13} />{note.isStarred ? "Unstar" : "Star"}
                      </div>
                      <div className="db-dd-item" onClick={e => shareNote(note, e)}>
                        <Share2 size={13} />Share
                      </div>
                      {activeView === "trash" ? (
                        <>
                          <div className="db-dd-item" onClick={() => restoreNote(note._id)}>
                            <RefreshCw size={13} />Restore
                          </div>
                          <div className="db-dd-item danger" onClick={() => deleteNote(note._id)}>
                            <Trash2 size={13} />Delete Forever
                          </div>
                        </>
                      ) : (
                        <div className="db-dd-item danger" onClick={() => trashNote(note._id)}>
                          <Trash2 size={13} />Move to Trash
                        </div>
                      )}
                    </div>
                  )}
                  <div className="db-note-title">{note.title || "Untitled Note"}</div>
                  <div className="db-note-preview">{note.plainText || "No content yet..."}</div>
                  {note.tags?.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      {note.tags.slice(0, 2).map((t, ti) => <span key={ti} className="db-tag">#{t}</span>)}
                    </div>
                  )}
                  <div className="db-note-meta">
                    <span className="db-note-date">{formatDate(note.updatedAt)}</span>
                    <div className="db-note-actions">
                      {note.isStarred && <Star size={12} color="#f59e0b" fill="#f59e0b" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diff = now - dt;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
