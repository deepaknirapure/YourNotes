import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X, AlertTriangle, RefreshCw, Menu, Clock, Inbox, ShieldAlert, CheckCircle2 } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  /* Topbar */
  .pg-topbar { 
    height: 68px; display: flex; align-items: center; gap: 14px; padding: 0 28px; 
    background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0; z-index: 100;
  }
  .pg-menu-btn { 
    display: none; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; 
    cursor: pointer; padding: 9px; color: var(--text); align-items: center; justify-content: center;
    transition: 0.15s;
  }
  .pg-menu-btn:hover { border-color: var(--text); }

  .pg-title-section {
    display: flex; align-items: center; gap: 12px;
    min-width: 0; flex-shrink: 1; overflow: hidden;
  }
  
  .pg-title-icon { 
    width: 36px; height: 36px; border-radius: 10px; background: rgba(255,87,52,0.10); 
    display: flex; align-items: center; justify-content: center; color: #ff5734; flex-shrink: 0;
  }
  .pg-title { 
    font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -0.6px; 
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pg-count { 
    background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);
    font-size: 11px; font-weight: 700; 
    padding: 4px 12px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  .pg-topbar-actions {
    margin-left: auto; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .pg-refresh-btn {
    background: none; border: none; cursor: pointer; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center; padding: 8px;
    border-radius: 9px; transition: background 0.15s;
  }
  .pg-refresh-btn:hover { background: var(--surface); color: var(--text); }

  .spin { animation: spin 0.7s linear infinite; }
  
  /* Floating Action Bar */
  .bulk-action-bar {
    position: fixed; top: 84px; left: 50%; transform: translateX(-50%);
    background: var(--surface); border: 1.5px solid var(--border);
    padding: 10px 20px; border-radius: 18px;
    display: flex; align-items: center; gap: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15); z-index: 200;
    animation: fadeUp 0.25s ease; white-space: nowrap;
  }
  .bulk-action-bar .bulk-count {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 700; color: var(--text); letter-spacing: -0.2px;
  }
  .bulk-divider { height: 18px; width: 1px; background: var(--border); }

  .btn-neon-sm { 
    background: #ff5734; color: #fff; border: none; border-radius: 9px; 
    padding: 8px 14px; font-weight: 700; font-size: 12px; cursor: pointer; 
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap; flex-shrink: 0; transition: 0.2s; letter-spacing: 0.01em;
  }
  .btn-neon-sm:hover { background: #e8461e; }
  .btn-neon-sm.ghost { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
  .btn-neon-sm.ghost:hover { border-color: var(--text); }
  .btn-neon-sm.danger { background: #ef4444; }
  .btn-neon-sm.danger:hover { background: #dc2626; }
  .btn-neon-sm.restore { background: rgba(22,163,74,0.12); color: #16a34a; border: 1px solid rgba(22,163,74,0.2); }
  .btn-neon-sm.restore:hover { background: rgba(22,163,74,0.2); }
  
  .pg-content { flex: 1; overflow-y: auto; padding: 32px 28px; scrollbar-width: none; }
  .pg-content::-webkit-scrollbar { display: none; }
  
  .pg-alert { 
    display: flex; align-items: center; gap: 12px; background: rgba(245,158,11,0.08); 
    border: 1px solid rgba(245,158,11,0.20); border-radius: 14px; 
    padding: 14px 20px; margin-bottom: 32px; 
    font-size: 13px; color: #d97706; font-weight: 600; line-height: 1.5;
  }

  .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }
  
  .pg-card { 
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px; 
    padding: 24px; position: relative; transition: all 0.22s; 
    animation: fadeUp 0.4s both; display: flex; flex-direction: column; cursor: default;
  }
  .pg-card:hover { border-color: var(--text-muted); transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.07); }
  .pg-card.selected { border-color: #ff5734; background: rgba(255,87,52,0.04); }
  
  .pg-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .pg-card-title { font-size: 16px; font-weight: 800; color: var(--text); line-height: 1.3; letter-spacing: -0.3px; }
  .pg-card-checkbox {
    width: 19px; height: 19px; border-radius: 6px; border: 2px solid var(--border);
    cursor: pointer; flex-shrink: 0; accent-color: #ff5734; margin-top: 2px;
    transition: 0.15s;
  }
  .pg-card-preview { font-size: 13.5px; color: var(--text-muted); line-height: 1.7; margin-bottom: 18px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 500; }
  .pg-card-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--text-light); margin-bottom: 18px; letter-spacing: 0.02em; text-transform: uppercase; }
  
  .pg-card-footer { display: flex; gap: 8px; border-top: 1px solid var(--border); padding-top: 18px; }
  
  .pg-btn-sm { 
    flex: 1; border: none; border-radius: 10px; padding: 10px 8px; 
    font-weight: 700; font-size: 12px; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 7px; transition: 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.01em;
  }
  .pg-restore { background: rgba(22,163,74,0.10); color: #16a34a; }
  .pg-restore:hover { background: rgba(22,163,74,0.18); }
  .pg-delete-forever { background: rgba(239,68,68,0.08); color: #ef4444; border: 1px solid rgba(239,68,68,0.15); }
  .pg-delete-forever:hover { background: rgba(239,68,68,0.15); }

  /* Empty State */
  .pg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px; text-align: center; }
  .pg-empty-icon { width: 72px; height: 72px; border-radius: 20px; background: var(--surface); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .pg-empty-title { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 8px; letter-spacing: -0.5px; }
  .pg-empty-sub { font-size: 14px; color: var(--text-muted); font-weight: 500; }

  /* Modal */
  .modal-overlay { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); 
    z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; 
  }
  .modal-box { 
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 24px; 
    padding: 36px; max-width: 420px; width: 100%; color: var(--text); text-align: center; 
    animation: fadeUp 0.25s ease;
  }
  .modal-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(239,68,68,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .modal-title { font-size: 18px; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.5px; }
  .modal-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; line-height: 1.65; font-weight: 500; }
  .modal-actions { display: flex; gap: 10px; width: 100%; }
  .modal-actions .pg-btn-sm { flex: 1; padding: 12px; font-size: 13px; }

  .db-spinner { 
    width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: #ff5734; 
    border-radius: 50%; animation: spin .7s linear infinite; 
  }
  .pg-overlay-blur { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 90; 
  }

  /* Wipe all button */
  .btn-wipe-all {
    display: flex; align-items: center; gap: 7px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
    color: #ef4444; border-radius: 10px; padding: 8px 16px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif; transition: 0.2s; letter-spacing: 0.01em;
  }
  .btn-wipe-all:hover { background: rgba(239,68,68,0.15); }

  @media(max-width:768px) {
    .pg-menu-btn { display: flex; }
    .pg-topbar { padding: 0 16px; }
    .bulk-action-bar { 
      width: calc(100% - 24px); top: auto; bottom: 80px;
      flex-wrap: wrap; gap: 8px; padding: 12px 14px;
    }
    .pg-title { font-size: 15px; }
    .pg-content { padding: 20px 16px 100px; }
    .pg-grid { grid-template-columns: 1fr; }
  }
`;

export default function TrashPage() {
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmId, setConfirmId]     = useState(null);
  const [confirmAll, setConfirmAll]   = useState(false);
  const [confirmSelectedForever, setConfirmSelectedForever] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadTrash(); }, []);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes?trashed=true");
      setNotes((data || []).filter(n => n.isTrashed));
    } catch { toast.error("Could not sync trash"); }
    finally { setLoading(false); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const restoreNote = async (noteId) => {
    setActionLoading(noteId + "_restore");
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setSelectedIds(prev => prev.filter(id => id !== noteId));
      toast.success("Note restored successfully!");
    } catch { toast.error("Failed to restore"); }
    finally { setActionLoading(null); }
  };

  const deleteNoteForever = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setSelectedIds(prev => prev.filter(id => id !== noteId));
      setConfirmId(null);
      toast.success("Deleted forever");
    } catch { toast.error("Failed to delete"); }
  };

  const deleteSelectedForever = async () => {
    setActionLoading("bulk_delete");
    try {
      await Promise.all(selectedIds.map(id => API.delete(`/notes/${id}`)));
      setNotes(prev => prev.filter(n => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      setConfirmSelectedForever(false);
      toast.success("Selected notes deleted");
    } catch { toast.error("Something went wrong"); }
    finally { setActionLoading(null); }
  };

  const emptyTrash = async () => {
    setActionLoading("empty_all");
    try {
      await Promise.all(notes.map(n => API.delete(`/notes/${n._id}`)));
      setNotes([]);
      setSelectedIds([]);
      setConfirmAll(false);
      toast.success("Trash is now empty");
    } catch { toast.error("Action failed"); }
    finally { setActionLoading(null); }
  };

  const closeModals = () => {
    setConfirmId(null);
    setConfirmAll(false);
    setConfirmSelectedForever(false);
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay-blur" onClick={() => setSidebarOpen(false)} />}

      {/* CONFIRMATION MODALS */}
      {(confirmId || confirmAll || confirmSelectedForever) && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <ShieldAlert size={26} color="#ef4444" />
            </div>
            <h3 className="modal-title">
              {confirmAll ? "Empty all trash?" : "Delete forever?"}
            </h3>
            <p className="modal-desc">
              {confirmAll
                ? "This will permanently delete all notes in trash. This action cannot be undone."
                : confirmSelectedForever
                ? `This will permanently delete ${selectedIds.length} selected note${selectedIds.length > 1 ? 's' : ''}. This cannot be undone.`
                : "This note will be permanently deleted. You won't be able to recover it."}
            </p>
            <div className="modal-actions">
              <button
                className="pg-btn-sm"
                onClick={closeModals}
                style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }}
              >
                Cancel
              </button>
              <button
                className="pg-btn-sm pg-delete-forever"
                onClick={() => {
                  if (confirmId) deleteNoteForever(confirmId);
                  else if (confirmSelectedForever) deleteSelectedForever();
                  else emptyTrash();
                }}
                style={{ background: "#ef4444", color: "#fff", border: "none" }}
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        {/* TOPBAR */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="pg-title-section">
            <div className="pg-title-icon"><Trash2 size={17} /></div>
            <span className="pg-title">Trash</span>
            <span className="pg-count">{notes.length} notes</span>
          </div>

          <div className="pg-topbar-actions">
            <button className="pg-refresh-btn" onClick={loadTrash} title="Refresh">
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>
            {notes.length > 0 && (
              <button className="btn-wipe-all" onClick={() => setConfirmAll(true)}>
                <Trash2 size={13} /> Empty Trash
              </button>
            )}
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedIds.length > 0 && (
          <div className="bulk-action-bar">
            <div className="bulk-count">
              <CheckCircle2 size={16} color="#ff5734" />
              {selectedIds.length} selected
            </div>
            <div className="bulk-divider" />
            <button className="btn-neon-sm ghost" onClick={() => setSelectedIds(notes.map(n => n._id))}>
              Select All
            </button>
            <button
              className="btn-neon-sm restore"
              onClick={async () => { for (const id of selectedIds) await restoreNote(id); }}
            >
              Restore
            </button>
            <button
              className="btn-neon-sm danger"
              onClick={() => setConfirmSelectedForever(true)}
            >
              Delete
            </button>
            <X size={16} color="var(--text-muted)" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setSelectedIds([])} />
          </div>
        )}

        <div className="pg-content">
          {notes.length > 0 && (
            <div className="pg-alert">
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              <span>Notes in trash are not automatically deleted. Empty the trash to free up space.</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <div className="db-spinner" />
            </div>
          ) : notes.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon">
                <Inbox size={30} color="var(--text-muted)" />
              </div>
              <h3 className="pg-empty-title">Trash is empty</h3>
              <p className="pg-empty-sub">Deleted notes will appear here</p>
            </div>
          ) : (
            <div className="pg-grid">
              {notes.map((note, i) => (
                <div
                  key={note._id}
                  className={`pg-card ${selectedIds.includes(note._id) ? 'selected' : ''}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="pg-card-header">
                    <h3 className="pg-card-title">{note.title || "Untitled Note"}</h3>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(note._id)}
                      onChange={() => toggleSelect(note._id)}
                      className="pg-card-checkbox"
                    />
                  </div>
                  <p className="pg-card-preview">{note.plainText || "No content to show..."}</p>

                  <div className="pg-card-meta">
                    <Clock size={11} />
                    Deleted {new Date(note.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="pg-card-footer">
                    <button className="pg-btn-sm pg-restore" onClick={() => restoreNote(note._id)}>
                      <RotateCcw size={13} /> Restore
                    </button>
                    <button className="pg-btn-sm pg-delete-forever" onClick={() => setConfirmId(note._id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}