import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X, AlertTriangle, RefreshCw, Menu, Clock, Inbox, ShieldAlert } from "lucide-react";
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
    background: #FFFFFF; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: #F1F5F9; border: none; border-radius: 10px; cursor: pointer; padding: 10px; color: #000; }
  
  .pg-title-icon { width: 34px; height: 34px; border-radius: 10px; background: #000; display: flex; align-items: center; justify-content: center; color: #ccff00; }
  .pg-title { font-size: 20px; font-weight: 900; color: #000; letter-spacing: -1px; text-transform: uppercase; }
  .pg-count { background: #F1F5F9; color: #000; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 100px; }
  
  /* Action Buttons */
  .btn-action { 
    display: flex; align-items: center; gap: 8px; background: #000; color: #ccff00; 
    border: none; border-radius: 12px; padding: 10px 18px; font-size: 12px; 
    font-weight: 900; cursor: pointer; transition: 0.3s; text-transform: uppercase;
  }
  .btn-action:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
  .btn-danger-outline { background: transparent; color: #FF4444; border: 1px solid #FF4444; border-radius: 12px; padding: 10px 18px; font-weight: 800; font-size: 12px; cursor: pointer; transition: 0.2s; }
  .btn-danger-outline:hover { background: #FF4444; color: #FFF; }

  /* Alert Banner */
  .pg-alert { 
    display: flex; align-items: center; gap: 12px; background: #000; 
    border-radius: 16px; padding: 16px 24px; margin-bottom: 40px; 
    font-size: 13px; color: #ccff00; font-weight: 700; letter-spacing: 0.5px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }

  .pg-content { flex: 1; overflow-y: auto; padding: 40px 5vw; scrollbar-width: none; }
  .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  
  /* Trash Card */
  .pg-card { 
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 24px; 
    padding: 28px; position: relative; transition: 0.3s; 
    animation: fadeUp 0.4s both; display: flex; flex-direction: column; opacity: 0.85;
  }
  .pg-card:hover { border-color: #000; transform: translateY(-5px); opacity: 1; box-shadow: 0 15px 30px rgba(0,0,0,0.04); }
  
  .pg-card-title { font-size: 17px; font-weight: 900; color: #000; margin-bottom: 10px; line-height: 1.3; }
  .pg-card-preview { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 24px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  
  .pg-card-footer { display: flex; gap: 10px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
  
  .pg-btn-sm { 
    flex: 1; border: none; border-radius: 10px; padding: 10px; font-family: inherit; 
    font-weight: 800; font-size: 12px; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 8px; transition: 0.2s; text-transform: uppercase;
  }
  .pg-restore { background: #000; color: #ccff00; }
  .pg-restore:hover { transform: scale(1.05); }
  .pg-delete-forever { background: #F8FAFC; color: #FF4444; border: 1px solid #F1F5F9; }
  .pg-delete-forever:hover { background: #FF4444; color: #FFF; border-color: #FF4444; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal-box { background: #000; border: 1px solid #222; border-radius: 28px; padding: 40px; max-width: 440px; width: 100%; color: #FFF; text-align: center; }
  .modal-title { font-size: 22px; font-weight: 900; color: #FFF; margin-bottom: 12px; text-transform: uppercase; letter-spacing: -1px; }
  .modal-desc { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 30px; }

  .db-spinner { width: 30px; height: 30px; border: 3px solid #F1F5F9; border-top-color: #ccff00; border-radius: 50%; animation: spin .8s linear infinite; }

  @media(max-width:768px) {
    .pg-menu-btn { display: flex; }
    .pg-topbar { padding: 0 16px; }
    .pg-grid { grid-template-columns: 1fr; }
    .btn-action span { display: none; }
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

  const restoreNote = async (noteId) => {
    setActionLoading(noteId + "_restore");
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("FRAGEMENT RESTORED ⚡");
    } catch { toast.error("Restore failed"); }
    finally { setActionLoading(null); }
  };

  const deleteNoteForever = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setConfirmId(null);
      toast.success("PERMANENTLY WIPED");
    } catch { toast.error("Wipe failed"); }
  };

  const emptyTrash = async () => {
    setActionLoading("all");
    try {
      await Promise.all(notes.map(n => API.delete(`/notes/${n._id}`)));
      setNotes([]);
      setConfirmAll(false);
      setSelectedIds([]);
      toast.success("TRASH BUFFER CLEARED");
    } catch { toast.error("Action failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Confirmation Modals (Styled Dark) */}
      {(confirmId || confirmAll || confirmSelectedForever) && (
        <div className="modal-overlay">
          <div className="modal-box">
            <ShieldAlert size={48} color="#FF4444" style={{ margin: '0 auto 20px' }} />
            <h3 className="modal-title">Irreversible Action</h3>
            <p className="modal-desc">This data node will be permanently purged from the neural network. Do you wish to proceed?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="pg-btn-sm" onClick={() => {setConfirmId(null); setConfirmAll(false); setConfirmSelectedForever(false);}} style={{ background: "#222", color: "#888" }}>Abort</button>
              <button className="pg-btn-sm" onClick={() => { if(confirmId) deleteNoteForever(confirmId); else emptyTrash(); }} style={{ background: "#FF4444", color: "#FFF" }}>Confirm Purge</button>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="pg-title-section">
            <div className="pg-title-icon"><Trash2 size={18} /></div>
            <h1 className="pg-title">Trash Hub</h1>
            <span className="pg-count">{notes.length} NODES</span>
          </div>

          <div className="pg-actions">
            <button onClick={loadTrash} style={{ background: "none", border: "none", color: "#000", cursor: "pointer", padding: "8px" }}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>
            {notes.length > 0 && (
              <button className="btn-action" onClick={() => setConfirmAll(true)}>
                <Trash2 size={16} strokeWidth={3} /> <span>EMPTY TRASH</span>
              </button>
            )}
          </div>
        </div>

        <div className="pg-content">
          {notes.length > 0 && (
            <div className="pg-alert">
              <AlertTriangle size={18} />
              <span>TERMINAL WARNING: Purged items stay in buffer until manual wipe. Memory is not auto-reclaimed.</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><div className="db-spinner" /></div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Inbox size={60} color="#F1F5F9" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#94A3B8', fontWeight: 900 }}>BUFFER IS EMPTY</h3>
              <p style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 700, marginTop: 10 }}>NO DELETED NODES DETECTED</p>
            </div>
          ) : (
            <div className="pg-grid">
              {notes.map((note, i) => (
                <div key={note._id} className="pg-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <h3 className="pg-card-title">{note.title || "UNTITLED FRAGMENT"}</h3>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(note._id)}
                      onChange={() => setSelectedIds(prev => prev.includes(note._id) ? prev.filter(x => x !== note._id) : [...prev, note._id])}
                      style={{ width: 18, height: 18, accentColor: "#ccff00" }}
                    />
                  </div>
                  <p className="pg-card-preview">{note.plainText || "Neural data stream inactive..."}</p>
                  
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    <Clock size={12} /> MARKED FOR DELETION
                  </div>
                  
                  <div className="pg-card-footer">
                    <button className="pg-btn-sm pg-restore" onClick={() => restoreNote(note._id)}>
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button className="pg-btn-sm pg-delete-forever" onClick={() => setConfirmId(note._id)}>
                      Purge
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