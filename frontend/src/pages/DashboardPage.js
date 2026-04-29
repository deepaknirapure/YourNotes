import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2,
  Menu, LayoutGrid, FilePlus
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  .pg-topbar { 
    height: 60px; display: flex; align-items: center; justify-content: space-between; 
    padding: 0 24px; background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  
  .topbar-left { display: flex; align-items: center; gap: 14px; }
  .pg-menu-btn { 
    display: none; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 10px; cursor: pointer; padding: 8px;
    color: #64748B; align-items: center; justify-content: center;
    transition: 0.15s; min-width: 38px; min-height: 38px;
  }
  .pg-menu-btn:hover { background: #FFF5F2; color: #E55B2D; border-color: #FFE4DB; }
  
  .search-wrapper {
    display: flex; align-items: center; gap: 10px; background: #F8FAFC; 
    border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 9px 16px; 
    width: 300px; transition: 0.2s;
  }
  .search-wrapper:focus-within { border-color: #E55B2D; background: #FFF; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  .search-wrapper input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: #0F172A; font-family: inherit; }

  .btn-create {
    display: flex; align-items: center; gap: 8px; background: #0F172A; color: #FFF; 
    border: none; border-radius: 10px; padding: 10px 18px; font-size: 14px; 
    font-weight: 600; cursor: pointer; transition: 0.2s; font-family: inherit;
    white-space: nowrap;
  }
  .btn-create:hover { background: #E55B2D; transform: translateY(-1px); }

  .pg-content { flex: 1; overflow-y: auto; padding: 28px 5vw; scrollbar-width: none; }
  
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-size: 17px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
  
  .notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  
  .note-card {
    background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 22px; 
    display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s ease;
    animation: fadeUp 0.3s both; position: relative;
  }
  .note-card:hover { border-color: #CBD5E1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-2px); }
  
  .note-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
  .note-excerpt { font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 20px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  /* Notes card top row: title + compact actions */
  .note-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .note-title { margin-bottom: 0; }
  .note-card-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .bulk-check {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    accent-color: #E55B2D;
    cursor: pointer;
  }
  
  .note-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 14px; }
  .note-date { font-size: 11px; font-weight: 600; color: #94A3B8; }
  
  .ai-actions-mini { display: flex; gap: 6px; }
  .ai-btn-mini {
    padding: 6px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF;
    color: #64748B; transition: 0.2s; display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .ai-btn-mini:hover { border-color: #E55B2D; color: #E55B2D; background: #FFF5F2; }

  .btn-trash {
    padding: 6px;
    border-radius: 8px;
    color: #94A3B8;
    background: transparent;
    border: 1px solid transparent;
    opacity: 1;
    transition: 0.2s;
    cursor: pointer;
  }
  .btn-trash:hover { color: #EF4444; background: #FEF2F2; border-color: #FEE2E2; }

  .spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }

  /* ===== MOBILE ===== */
  @media(max-width: 768px) { 
    .pg-menu-btn { display: flex !important; } 
    .search-wrapper { display: none; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content { padding: 16px !important; }
    .notes-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    .note-card { padding: 16px !important; border-radius: 12px !important; }
    .section-header { margin-bottom: 14px !important; }
    .btn-create { padding: 10px 14px !important; font-size: 13px !important; }
    .topbar-right-mobile { display: flex !important; gap: 10px; align-items: center; }
  }
`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const importInputRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeFolderId = searchParams.get("folder");
  const shareToCommunityMode = searchParams.get("shareToCommunity") === "1";
  const bulkMode = shareToCommunityMode || searchParams.get("bulk") === "1";

  const [selectedIds, setSelectedIds] = useState([]);
  const [folders, setFolders] = useState([]);
  const [bulkTargetFolderId, setBulkTargetFolderId] = useState(null);
  const [foldersLoading, setFoldersLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeFolderId ? `/notes?folder=${activeFolderId}` : "/notes";
      const { data } = await API.get(endpoint);
      setNotes(data || []);
    } catch { toast.error("Failed to sync workspace"); }
    finally { setLoading(false); }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    // Bulk mode me folder dropdown chahiye (Move to Folder action ke liye)
    if (!bulkMode) return;
    setFoldersLoading(true);
    API.get("/folders")
      .then(({ data }) => {
        const list = data || [];
        setFolders(list);
        setBulkTargetFolderId((prev) => prev || (list[0]?._id || null));
      })
      .catch(() => toast.error("Could not load folders"))
      .finally(() => setFoldersLoading(false));
  }, [bulkMode]);

  const createNote = async () => {
    try {
      const payload = { title: "Untitled Document", content: "", folder: activeFolderId || null };
      const { data } = await API.post("/notes", payload);
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    } catch { toast.error("Error creating document"); }
  };

  const toggleStar = async (e, id) => {
    e.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${id}/star`);
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, isStarred: data.isStarred } : n)));
    } catch {
      toast.error("Failed to update star");
    }
  };

  const togglePrivacy = async (e, note) => {
    e.stopPropagation();
    try {
      const { data } = await API.put(`/notes/${note._id}`, { isPublic: !note.isPublic });
      setNotes((prev) => prev.map((n) => (n._id === note._id ? data : n)));
      toast.success(data.isPublic ? "Marked as public" : "Marked as private");
    } catch {
      toast.error("Failed to update privacy");
    }
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await API.post("/ai/import", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Notes imported successfully");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      e.target.value = "";
    }
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

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const makeSelectedPublic = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => API.put(`/notes/${id}`, { isPublic: true })));
      toast.success("Notes are now public");
      navigate("/community");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish notes");
    }
  };

  const moveSelectedToFolder = async () => {
    if (!selectedIds.length) return;
    if (!bulkTargetFolderId) {
      toast.error("Select a folder first");
      return;
    }
    try {
      await Promise.all(selectedIds.map((id) => API.put(`/notes/${id}`, { folder: bulkTargetFolderId })));
      toast.success("Notes moved to folder");
      clearSelection();
    } catch {
      toast.error("Move failed");
    }
  };

  const deleteSelectedToTrash = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Move ${selectedIds.length} notes to trash?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => API.patch(`/notes/${id}/trash`)));
      setNotes((prev) => prev.filter((n) => !selectedIds.includes(n._id)));
      toast.success("Selected notes moved to trash");
      clearSelection();
    } catch {
      toast.error("Bulk delete failed");
    }
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

      <main className="pg-main">
        <header className="pg-topbar">
          <div className="topbar-left">
            <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LayoutGrid size={14} color="#64748B" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Workspace</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="search-wrapper">
              <Search size={15} color="#94A3B8" />
              <input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn-create" onClick={createNote}>
              <Plus size={15} /> 
              <span>New Note</span>
            </button>
            <button className="btn-create" style={{ background: "#334155" }} onClick={handleImportClick}>
              <span>Import</span>
            </button>
            <input ref={importInputRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={handleImportFile} />
          </div>
        </header>

        {/* Mobile Search Bar - visible only on mobile */}
        <div className="mobile-search-bar">
          <div className="search-inner">
            <Search size={16} color="#94A3B8" />
            <input 
              placeholder="Search notes..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="pg-content">
          <div className="section-header">
            <h2 className="section-title">All Documents</h2>
            {!loading && <span style={{fontSize: '12px', fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '3px 10px', borderRadius: '100px'}}>{filteredNotes.length} Items</span>}
          </div>

          {bulkMode && selectedIds.length > 0 && (
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 16, border: "1px solid #E2E8F0", background: "#FFF" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800, color: "#0F172A" }}>{selectedIds.length} selected</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {shareToCommunityMode ? (
                    <button className="btn-create" onClick={makeSelectedPublic} disabled={loading}>
                      <span>Make Public</span>
                    </button>
                  ) : null}

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      value={bulkTargetFolderId || ""}
                      onChange={(e) => setBulkTargetFolderId(e.target.value || null)}
                      disabled={foldersLoading}
                      style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", fontWeight: 700, color: "#0F172A" }}
                      aria-label="Select target folder"
                    >
                      {foldersLoading ? <option value="">Loading...</option> : null}
                      {!foldersLoading && folders.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                  </div>

                  <button className="btn-create" style={{ background: "#334155" }} onClick={moveSelectedToFolder} disabled={foldersLoading}>
                    <span>Move</span>
                  </button>

                  <button className="btn-create" style={{ background: "#EF4444" }} onClick={deleteSelectedToTrash}>
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={clearSelection}
                    style={{ background: "#FFF", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><div className="spinner" /></div>
          ) : filteredNotes.length === 0 ? (
            <div style={{textAlign: 'center', padding: '60px 0'}}>
              <div style={{marginBottom: '16px', color: '#CBD5E1'}}><FilePlus size={44} style={{margin: '0 auto'}}/></div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{searchQuery ? "No matching notes" : "Workspace empty"}</h3>
              <button className="btn-create" onClick={createNote} style={{marginTop: 16, marginInline: 'auto'}}><Plus size={15} /> Create Note</button>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note, i) => (
                <div key={note._id} className="note-card" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => setSelectedNote(note)}>
                  <div className="note-card-top">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                      {bulkMode && (
                        <input
                          type="checkbox"
                          className="bulk-check"
                          checked={selectedIds.includes(note._id)}
                          onChange={() => toggleSelected(note._id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Select note"
                        />
                      )}
                      <h3 className="note-title" style={{ flex: 1, minWidth: 0 }}>{note.title || "Untitled Document"}</h3>
                    </div>
                    <div className="note-card-actions">
                      <button className="ai-btn-mini" onClick={(e) => toggleStar(e, note._id)} title="Toggle star" aria-label="Toggle star">
                        <Star size={15} fill={note.isStarred ? "#E55B2D" : "none"} color={note.isStarred ? "#E55B2D" : "#64748B"} />
                      </button>
                      {!shareToCommunityMode && (
                        <button className="ai-btn-mini" onClick={(e) => togglePrivacy(e, note)} title="Toggle privacy" aria-label="Toggle privacy">
                          {note.isPublic ? "Public" : "Private"}
                        </button>
                      )}
                      <button className="btn-trash" onClick={(e) => deleteNote(e, note._id)} title="Move to trash" aria-label="Move to trash">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="note-excerpt">{note.plainText || "No content available..."}</p>
                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <div className="ai-actions-mini" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile FAB - New Note */}
      <button className="mobile-fab" onClick={createNote} title="New Note">
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
