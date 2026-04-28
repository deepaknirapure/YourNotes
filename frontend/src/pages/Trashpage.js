import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, RotateCcw, X, AlertTriangle, FileText, RefreshCw, Menu, Clock, Inbox } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  /* Sleek Topbar */
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; gap: 16px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  .pg-title-section { display: flex; align-items: center; gap: 10px; }
  .pg-title { font-size: 18px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; }
  .pg-count { background: #F1F5F9; color: #64748B; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 100px; border: 1px solid #E2E8F0; }
  
  /* Topbar Actions */
  .pg-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
  
  .btn-empty { 
    display: flex; align-items: center; gap: 8px; background: #FFF; color: #EF4444; 
    border: 1px solid #FEE2E2; border-radius: 10px; padding: 8px 16px; 
    font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
  }
  .btn-empty:hover { background: #FEF2F2; border-color: #FCA5A5; }

  /* Content Area */
  .pg-content { flex: 1; overflow-y: auto; padding: 32px 5vw; scrollbar-width: none; }
  
  .pg-alert { 
    display: flex; align-items: center; gap: 12px; background: #FFFBEB; 
    border: 1px solid #FEF3C7; border-radius: 12px; padding: 14px 18px; 
    margin-bottom: 32px; font-size: 14px; color: #92400E; font-weight: 500;
  }

  .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  
  /* Trash Card */
  .pg-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; 
    padding: 24px; position: relative; transition: all 0.2s ease; 
    animation: fadeUp 0.3s both; display: flex; flex-direction: column;
  }
  .pg-card:hover { border-color: #FCA5A5; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.04); }
  
  .pg-card-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px; line-height: 1.4; opacity: 0.8; }
  .pg-card-preview { 
    font-size: 14px; color: #64748B; display: -webkit-box; -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; margin-bottom: 20px; flex: 1;
  }
  
  .pg-card-date { font-size: 12px; color: #94A3B8; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
  
  .pg-card-actions { display: flex; gap: 8px; border-top: 1px solid #F1F5F9; padding-top: 16px; }
  
  .pg-btn { 
    flex: 1; border: none; border-radius: 8px; padding: 8px; font-family: inherit; 
    font-weight: 600; font-size: 13px; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 6px; transition: 0.2s; 
  }
  .pg-restore { background: #F0FDF4; color: #16A34A; border: 1px solid #DCFCE7; }
  .pg-restore:hover { background: #DCFCE7; }
  
  .pg-delete { background: #FEF2F2; color: #EF4444; border: 1px solid #FEE2E2; }
  .pg-delete:hover { background: #FEE2E2; }

  /* Modern Confirm Modals */
  .modal-overlay { 
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); 
    backdrop-filter: blur(4px); z-index: 200; display: flex; 
    align-items: center; justify-content: center; padding: 24px; 
  }
  .modal-box { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 20px; 
    padding: 32px; max-width: 400px; width: 100%; animation: scaleIn 0.2s ease;
  }
  .modal-title { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
  .modal-desc { font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 24px; }
  
  /* Empty States */
  .pg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 24px; text-align: center; }
  .pg-empty-icon { width: 64px; height: 64px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #94A3B8; margin-bottom: 16px; }
  .pg-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay-blur { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) {
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; min-width: 38px; height: 38px; align-items: center !important; justify-content: center !important; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content, .saas-main, .flashcard-wrap { padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important; padding-left: 16px !important; padding-right: 16px !important; } 
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; padding: 8px !important; min-width: 38px; min-height: 38px; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; gap: 8px !important; }
    .pg-content { padding: 16px !important; } 
    .pg-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    .btn-empty span { display: none; }
    .pg-card { padding: 16px !important; border-radius: 12px !important; }
  }
`;

export default function TrashPage() {
  const navigate = useNavigate();
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [confirmId, setConfirmId]     = useState(null);
  const [confirmAll, setConfirmAll]   = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes?trashed=true");
      setNotes((data || []).filter(n => n.isTrashed));
    } catch { toast.error("Sync failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTrash(); }, []);

  const restoreNote = async (noteId) => {
    setActionLoading(noteId + "_restore");
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("Note restored! ✅");
    } catch { toast.error("Could not restore"); }
    finally { setActionLoading(null); }
  };

  const deleteNote = async (noteId) => {
    setActionLoading(noteId + "_delete");
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setConfirmId(null);
      toast.success("Permanently deleted");
    } catch { toast.error("Could not delete"); }
    finally { setActionLoading(null); }
  };

  const emptyTrash = async () => {
    setActionLoading("all");
    try {
      await Promise.all(notes.map(n => API.delete(`/notes/${n._id}`)));
      setNotes([]);
      setConfirmAll(false);
      toast.success("Trash emptied!");
    } catch { toast.error("Action failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay-blur" onClick={() => setSidebarOpen(false)} />}

      {/* Confirmation Modals */}
      {confirmId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Delete Permanently?</h3>
            <p className="modal-desc">This action cannot be undone. The note will be gone forever.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="pg-btn" onClick={() => setConfirmId(null)} style={{ background: "#F1F5F9", color: "#64748B" }}>Cancel</button>
              <button className="pg-btn pg-delete" onClick={() => deleteNote(confirmId)} disabled={actionLoading === confirmId + "_delete"}>
                {actionLoading === confirmId + "_delete" ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAll && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Empty Entire Trash?</h3>
            <p className="modal-desc">All {notes.length} items will be permanently erased. Are you sure?</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="pg-btn" onClick={() => setConfirmAll(false)} style={{ background: "#F1F5F9", color: "#64748B" }}>Cancel</button>
              <button className="pg-btn pg-delete" onClick={emptyTrash} disabled={actionLoading === "all"}>
                {actionLoading === "all" ? "Emptying..." : "Yes, Empty Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        {/* Sleek Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="pg-title-section">
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={14} color="#64748B" />
            </div>
            <h1 className="pg-title">Trash</h1>
            <span className="pg-count">{notes.length}</span>
          </div>

          <div className="pg-actions">
            <button onClick={loadTrash} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", display: "flex", padding: "8px", borderRadius: "8px", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="#F1F5F9"} onMouseOut={e=>e.currentTarget.style.background="none"}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
            {notes.length > 0 && (
              <button className="btn-empty" onClick={() => setConfirmAll(true)}>
                <Trash2 size={14} /> <span>Empty Trash</span>
              </button>
            )}
          </div>
        </div>

        <div className="pg-content">
          {notes.length > 0 && (
            <div className="pg-alert">
              <AlertTriangle size={16} />
              <span>Items in trash are not automatically deleted. They will stay here until you empty the trash.</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <div className="pg-spinner" />
            </div>
          ) : notes.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Inbox size={28} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Trash is empty</h3>
              <p style={{ fontSize: 14, color: "#64748B", maxWidth: 300 }}>Notes you delete will appear here. You can restore them or delete them forever.</p>
            </div>
          ) : (
            <div className="pg-grid">
              {notes.map((note, i) => (
                <div key={note._id} className="pg-card" style={{ animationDelay: `${i * 0.03}s` }}>
                  <h3 className="pg-card-title">{note.title || "Untitled Intelligence"}</h3>
                  <p className="pg-card-preview">{note.plainText || "No preview content available..."}</p>
                  
                  <div className="pg-card-date">
                    <Clock size={12} /> Deleted recently
                  </div>
                  
                  <div className="pg-card-actions">
                    <button className="pg-btn pg-restore" onClick={() => restoreNote(note._id)} disabled={actionLoading === note._id + "_restore"}>
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button className="pg-btn pg-delete" onClick={() => setConfirmId(note._id)}>
                      <X size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Mobile bottom navigation - sab pages pe consistent */}
      <MobileNav />
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}