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
  
  body { background: #FFFFFF; color: #000000; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FFFFFF; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  /* Topbar */
  .pg-topbar { 
    height: 70px; display: flex; align-items: center; gap: 16px; padding: 0 32px; 
    background: #FFFFFF; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; z-index: 100;
  }
  .pg-menu-btn { display: none; background: #F1F5F9; border: none; border-radius: 10px; cursor: pointer; padding: 10px; color: #000; }
  
  .pg-title-icon { width: 34px; height: 34px; border-radius: 10px; background: #000; display: flex; align-items: center; justify-content: center; color: #ccff00; }
  .pg-title { font-size: 20px; font-weight: 900; color: #000; letter-spacing: -1px; text-transform: uppercase; }
  .pg-count { background: #F1F5F9; color: #000; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 100px; }
  
  /* Floating Action Bar (Visible when selected) */
  .bulk-action-bar {
    position: absolute; top: 85px; left: 50%; transform: translateX(-50%);
    background: #000; border: 2px solid #ccff00; padding: 12px 24px;
    border-radius: 20px; display: flex; align-items: center; gap: 20px;
    box-shadow: 0 15px 40px rgba(204,255,0,0.2); z-index: 200;
    animation: fadeUp 0.3s ease;
  }

  .btn-neon-sm { background: #ccff00; color: #000; border: none; border-radius: 10px; padding: 8px 16px; font-weight: 900; font-size: 11px; cursor: pointer; text-transform: uppercase; }
  .btn-danger-sm { background: transparent; color: #FF4444; border: 1px solid #FF4444; border-radius: 10px; padding: 8px 16px; font-weight: 800; font-size: 11px; cursor: pointer; }

  .pg-content { flex: 1; overflow-y: auto; padding: 40px 5vw; scrollbar-width: none; }
  
  .pg-alert { 
    display: flex; align-items: center; gap: 12px; background: #000; 
    border-radius: 16px; padding: 16px 24px; margin-bottom: 40px; 
    font-size: 13px; color: #ccff00; font-weight: 700;
  }

  .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  
  /* Card Design */
  .pg-card { 
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 24px; 
    padding: 28px; position: relative; transition: 0.3s; 
    animation: fadeUp 0.4s both; display: flex; flex-direction: column;
  }
  .pg-card:hover { border-color: #000; transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.04); }
  .pg-card.selected { border-color: #ccff00; background: #FAFAFA; }
  
  .pg-card-title { font-size: 17px; font-weight: 900; color: #000; margin-bottom: 10px; line-height: 1.3; }
  .pg-card-preview { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 24px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  
  .pg-card-footer { display: flex; gap: 10px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
  
  .pg-btn-sm { 
    flex: 1; border: none; border-radius: 10px; padding: 10px; 
    font-weight: 800; font-size: 12px; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 8px; transition: 0.2s; text-transform: uppercase;
  }
  .pg-restore { background: #000; color: #ccff00; }
  .pg-delete-forever { background: #F8FAFC; color: #FF4444; border: 1px solid #F1F5F9; }

  /* Fixed Modals */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal-box { background: #000; border: 1px solid #222; border-radius: 28px; padding: 40px; max-width: 440px; width: 100%; color: #FFF; text-align: center; }

  .db-spinner { width: 30px; height: 30px; border: 3px solid #F1F5F9; border-top-color: #ccff00; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay-blur { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 90; }

  @media(max-width:768px) {
    .pg-menu-btn { display: flex; }
    .pg-topbar { padding: 0 16px; }
    .bulk-action-bar { width: 90%; bottom: 80px; top: auto; }
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
    } catch { toast.error("Sync failed"); }
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
      setSelectedIds(prev => prev.filter(id => id !== noteId)); // Fix: Sync selection
      toast.success("FRAGMENT RESTORED ⚡");
    } catch { toast.error("Restore failed"); }
    finally { setActionLoading(null); }
  };

  const deleteNoteForever = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setSelectedIds(prev => prev.filter(id => id !== noteId));
      setConfirmId(null);
      toast.success("PERMANENTLY WIPED");
    } catch { toast.error("Wipe failed"); }
  };

  const deleteSelectedForever = async () => {
    setActionLoading("bulk_delete");
    try {
      await Promise.all(selectedIds.map(id => API.delete(`/notes/${id}`)));
      setNotes(prev => prev.filter(n => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      setConfirmSelectedForever(false);
      toast.success("SELECTED NODES PURGED");
    } catch { toast.error("Bulk action failed"); }
    finally { setActionLoading(null); }
  };

  const emptyTrash = async () => {
    setActionLoading("empty_all");
    try {
      // Best practice: Backend should have a single endpoint for this
      await Promise.all(notes.map(n => API.delete(`/notes/${n._id}`)));
      setNotes([]);
      setSelectedIds([]);
      setConfirmAll(false);
      toast.success("BUFFER CLEARED");
    } catch { toast.error("Protocol error"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay-blur" onClick={() => setSidebarOpen(false)} />}

      {/* FIXED MODAL SYSTEM */}
      {(confirmId || confirmAll || confirmSelectedForever) && (
        <div className="modal-overlay" onClick={() => {setConfirmId(null); setConfirmAll(false); setConfirmSelectedForever(false);}}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <ShieldAlert size={48} color="#FF4444" style={{ margin: '0 auto 20px' }} />
            <h3 className="modal-title">{confirmAll ? "WIPE ALL DATA?" : "PURGE NODE?"}</h3>
            <p className="modal-desc">
                {confirmAll ? "This will erase your entire trash buffer. This action is irreversible." : 
                 confirmSelectedForever ? `Permanently delete ${selectedIds.length} selected fragments?` : 
                 "This node will be permanently erased from your neural network."}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="pg-btn-sm" onClick={() => {setConfirmId(null); setConfirmAll(false); setConfirmSelectedForever(false);}} style={{ background: "#222", color: "#888" }}>Abort</button>
              <button className="pg-btn-sm" 
                onClick={() => { 
                    if(confirmId) deleteNoteForever(confirmId); 
                    else if(confirmSelectedForever) deleteSelectedForever();
                    else emptyTrash();
                }} 
                style={{ background: "#FF4444", color: "#FFF" }}>
                {actionLoading ? "PURGING..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        {/* TOPBAR */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="pg-title-section">
            <div className="pg-title-icon"><Trash2 size={18} /></div>
            <h1 className="pg-title">Trash Hub</h1>
            <span className="pg-count">{notes.length} NODES</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
             <button onClick={loadTrash} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={18} className={loading ? "spin" : ""} />
             </button>
             {notes.length > 0 && (
                <button className="btn-neon-sm" style={{ background: '#000', color: '#ccff00' }} onClick={() => setConfirmAll(true)}>WIPE ALL</button>
             )}
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedIds.length > 0 && (
            <div className="bulk-action-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={18} color="#ccff00" />
                    <span style={{ color: '#FFF', fontWeight: 900, fontSize: 13 }}>{selectedIds.length} SELECTED</span>
                </div>
                <div style={{ height: '20px', width: '1px', background: '#333' }} />
                <button className="btn-neon-sm" onClick={() => setSelectedIds(notes.map(n => n._id))}>ALL</button>
                <button className="btn-neon-sm" style={{ background: '#FFF' }} onClick={async () => {
                    for(const id of selectedIds) await restoreNote(id);
                }}>RESTORE</button>
                <button className="btn-danger-sm" onClick={() => setConfirmSelectedForever(true)}>PURGE</button>
                <X size={18} color="#555" style={{ cursor: 'pointer' }} onClick={() => setSelectedIds([])} />
            </div>
        )}

        <div className="pg-content">
          {notes.length > 0 && (
            <div className="pg-alert">
              <AlertTriangle size={18} />
              <span>TERMINAL WARNING: Buffer reclaimed manually. Purged nodes cannot be recovered.</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><div className="db-spinner" /></div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Inbox size={60} color="#F1F5F9" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#CBD5E1', fontWeight: 900 }}>BUFFER CLEAR</h3>
            </div>
          ) : (
            <div className="pg-grid">
              {notes.map((note, i) => (
                <div key={note._id} className={`pg-card ${selectedIds.includes(note._id) ? 'selected' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <h3 className="pg-card-title">{note.title || "UNTITLED LOG"}</h3>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(note._id)}
                      onChange={() => toggleSelect(note._id)}
                      style={{ width: 18, height: 18, accentColor: "#ccff00", cursor: 'pointer' }}
                    />
                  </div>
                  <p className="pg-card-preview">{note.plainText || "Data nodes inactive..."}</p>
                  
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    <Clock size={12} /> DELETED {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="pg-card-footer">
                    <button className="pg-btn-sm pg-restore" onClick={() => restoreNote(note._id)}>
                      RESTORE
                    </button>
                    <button className="pg-btn-sm pg-delete-forever" onClick={() => setConfirmId(note._id)}>
                      PURGE
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