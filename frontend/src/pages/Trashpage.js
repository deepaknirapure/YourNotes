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
    height: 70px; display: flex; align-items: center; gap: 16px; padding: 0 32px; 
    background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0; z-index: 100;
  }
  .pg-menu-btn { 
    display: none; background: var(--border); border: none; border-radius: 10px; 
    cursor: pointer; padding: 10px; color: var(--text); align-items: center; justify-content: center;
  }

  /* FIX 1: .pg-title-section was used in JSX but never defined */
  .pg-title-section {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex-shrink: 1;
    overflow: hidden;
  }
  
  .pg-title-icon { 
    width: 34px; height: 34px; border-radius: 10px; background: var(--surface); 
    display: flex; align-items: center; justify-content: center; color: #ff5734; flex-shrink: 0;
  }
  .pg-title { 
    font-size: 20px; font-weight: 900; color: var(--text); letter-spacing: -1px; 
    text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pg-count { 
    background: var(--border); color: var(--text); font-size: 11px; font-weight: 900; 
    padding: 4px 12px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
  }

  /* FIX 2: Topbar right side — prevent overflow */
  .pg-topbar-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .pg-refresh-btn {
    background: none; border: none; cursor: pointer; color: var(--text);
    display: flex; align-items: center; justify-content: center; padding: 6px;
    border-radius: 8px; transition: background 0.2s;
  }
  .pg-refresh-btn:hover { background: var(--border); }

  /* FIX 3: .spin class was missing — only keyframes existed */
  .spin { animation: spin 0.7s linear infinite; }
  
  /* Floating Action Bar */
  .bulk-action-bar {
    /* FIX 4: position fixed (not absolute) so it works on mobile too */
    position: fixed;
    top: 85px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface);
    border: 2px solid #ff5734;
    padding: 12px 24px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 15px 40px rgba(255,87,52,0.2);
    z-index: 200;
    animation: fadeUp 0.3s ease;
    white-space: nowrap;
  }

  .btn-neon-sm { 
    background: #ff5734; color: var(--text); border: none; border-radius: 10px; 
    padding: 8px 16px; font-weight: 900; font-size: 11px; cursor: pointer; 
    text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
  }
  
  .pg-content { flex: 1; overflow-y: auto; padding: 40px 5vw; scrollbar-width: none; }
  
  .pg-alert { 
    display: flex; align-items: center; gap: 12px; background: var(--surface); 
    border-radius: 16px; padding: 16px 24px; margin-bottom: 40px; 
    font-size: 13px; color: #ff5734; font-weight: 700;
  }

  .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  
  .pg-card { 
    background: var(--bg); border: 1px solid var(--border); border-radius: 24px; 
    padding: 28px; position: relative; transition: 0.3s; 
    animation: fadeUp 0.4s both; display: flex; flex-direction: column;
  }
  .pg-card:hover { border-color: var(--text); transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.04); }
  .pg-card.selected { border-color: #ff5734; background: var(--surface); }
  
  .pg-card-title { font-size: 17px; font-weight: 900; color: var(--text); margin-bottom: 10px; line-height: 1.3; }
  .pg-card-preview { font-size: 14px; color: #8a7f7f; line-height: 1.7; margin-bottom: 24px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  
  .pg-card-footer { display: flex; gap: 10px; border-top: 1px solid var(--border); padding-top: 20px; }
  
  .pg-btn-sm { 
    flex: 1; border: none; border-radius: 10px; padding: 10px; 
    font-weight: 800; font-size: 12px; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 8px; transition: 0.2s; text-transform: uppercase;
  }
  .pg-restore { background: var(--surface); color: #ff5734; }
  .pg-delete-forever { background: var(--bg); color: #FF4444; border: 1px solid var(--border); }

  /* Modal */
  .modal-overlay { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); 
    z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; 
  }
  .modal-box { 
    background: var(--surface); border: 1px solid var(--border); border-radius: 28px; 
    padding: 40px; max-width: 440px; width: 100%; color: var(--text); text-align: center; 
  }
  .modal-title { font-size: 18px; font-weight: 900; margin-bottom: 12px; }
  .modal-desc { font-size: 14px; color: #8a7f7f; margin-bottom: 28px; line-height: 1.6; }

  /* FIX 5: Modal buttons need a proper flex container with full width */
  .modal-actions {
    display: flex;
    gap: 12px;
    width: 100%;
  }
  .modal-actions .pg-btn-sm {
    flex: 1;
  }

  .db-spinner { 
    width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--accent); 
    border-radius: 50%; animation: spin .7s linear infinite; 
  }
  .pg-overlay-blur { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 90; 
  }

  @media(max-width:768px) {
    .pg-menu-btn { display: flex; }
    .pg-topbar { padding: 0 16px; }

    /* FIX 6: On mobile, bulk bar sits above bottom nav (fixed position) */
    .bulk-action-bar { 
      width: calc(100% - 32px);
      top: auto;
      bottom: 80px;
      flex-wrap: wrap;
      gap: 10px;
      padding: 14px 16px;
    }

    .pg-title { font-size: 16px; }
    .pg-content { padding: 24px 16px; }
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
      toast.success("Note restored successfully! ✅");
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
            <ShieldAlert size={48} color="#FF4444" style={{ margin: '0 auto 20px' }} />
            <h3 className="modal-title">
              {confirmAll ? "EMPTY ALL TRASH?" : "DELETE FOREVER?"}
            </h3>
            <p className="modal-desc">
              {confirmAll
                ? "Are you sure? You will lose all notes in the trash. You cannot get them back."
                : confirmSelectedForever
                ? `Delete these ${selectedIds.length} notes forever? This cannot be undone.`
                : "This note will be permanently deleted. You won't be able to recover it later."}
            </p>
            {/* FIX 5: Replaced raw <div style={{display:'flex'}}> with .modal-actions class */}
            <div className="modal-actions">
              <button
                className="pg-btn-sm"
                onClick={closeModals}
                style={{ background: "var(--border)", color: "#888" }}
              >
                Go Back
              </button>
              <button
                className="pg-btn-sm"
                onClick={() => {
                  if (confirmId) deleteNoteForever(confirmId);
                  else if (confirmSelectedForever) deleteSelectedForever();
                  else emptyTrash();
                }}
                style={{ background: "#FF4444", color: "var(--text)" }}
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
            <Menu size={22} />
          </button>

          {/* FIX 1: .pg-title-section now has proper flex styles defined in STYLES */}
          <div className="pg-title-section">
            <div className="pg-title-icon"><Trash2 size={18} /></div>
            <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Settings</span>
            <span className="pg-count">{notes.length} NOTES</span>
          </div>

          {/* FIX 2: Replaced inline marginLeft:auto div with .pg-topbar-actions */}
          <div className="pg-topbar-actions">
            {/* FIX 3: .spin class now defined — RefreshCw animates correctly */}
            <button className="pg-refresh-btn" onClick={loadTrash} title="Refresh">
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>
            {notes.length > 0 && (
              <button
                className="btn-neon-sm"
                style={{ background: 'var(--bg)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                onClick={() => setConfirmAll(true)}
              >
                WIPE ALL
              </button>
            )}
          </div>
        </div>

        {/* BULK ACTION BAR — FIX 4: position fixed, mobile bottom override */}
        {selectedIds.length > 0 && (
          <div className="bulk-action-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} color="#ff5734" />
              <span style={{ color: 'var(--text)', fontWeight: 900, fontSize: 13 }}>
                {selectedIds.length} SELECTED
              </span>
            </div>
            <div style={{ height: '20px', width: '1px', background: 'var(--border)' }} />
            <button className="btn-neon-sm" onClick={() => setSelectedIds(notes.map(n => n._id))}>
              SELECT ALL
            </button>
            <button
              className="btn-neon-sm"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onClick={async () => { for (const id of selectedIds) await restoreNote(id); }}
            >
              RESTORE
            </button>
            <button
              className="btn-neon-sm"
              style={{ background: '#FF4444', color: '#f7f7f5' }}
              onClick={() => setConfirmSelectedForever(true)}
            >
              DELETE
            </button>
            <X size={18} color="#555" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setSelectedIds([])} />
          </div>
        )}

        <div className="pg-content">
          {notes.length > 0 && (
            <div className="pg-alert">
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>Reminder: Notes in the trash are not automatically deleted. Empty the trash to save space.</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <div className="db-spinner" />
            </div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Inbox size={60} color="#2a2525" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#3a3535', fontWeight: 900 }}>TRASH IS EMPTY</h3>
            </div>
          ) : (
            <div className="pg-grid">
              {notes.map((note, i) => (
                <div
                  key={note._id}
                  className={`pg-card ${selectedIds.includes(note._id) ? 'selected' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <h3 className="pg-card-title">{note.title || "Untitled Note"}</h3>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(note._id)}
                      onChange={() => toggleSelect(note._id)}
                      style={{ width: 18, height: 18, accentColor: "#ff5734", cursor: 'pointer', flexShrink: 0 }}
                    />
                  </div>
                  <p className="pg-card-preview">{note.plainText || "No content to show..."}</p>

                  <div style={{ fontSize: 11, fontWeight: 900, color: '#3a3535', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    <Clock size={12} />
                    DELETED ON {new Date(note.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="pg-card-footer">
                    <button className="pg-btn-sm pg-restore" onClick={() => restoreNote(note._id)}>
                      <RotateCcw size={13} /> RESTORE
                    </button>
                    <button className="pg-btn-sm pg-delete-forever" onClick={() => setConfirmId(note._id)}>
                      <Trash2 size={13} /> DELETE
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
