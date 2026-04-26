-e // ye Trash page hai - deleted notes dekhne, restore karne ya permanently delete karne ke liye
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, RotateCcw, X, AlertTriangle, FileText, RefreshCw, Menu } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .pg-wrap{display:flex;height:100vh;overflow:hidden;}
  .pg-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .pg-topbar{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .pg-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .pg-title{font-size:14px;font-weight:600;color:#fff;}
  .pg-content{flex:1;overflow-y:auto;padding:20px;}
  .pg-alert{display:flex;align-items:center;gap:10px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:12px 14px;margin-bottom:20px;font-size:12px;color:rgba(245,158,11,.8);}
  .pg-empty-all-btn{margin-left:auto;background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);border-radius:6px;padding:5px 12px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s;}
  .pg-empty-all-btn:hover{background:rgba(239,68,68,.18);}
  .pg-notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;}
  .pg-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px;animation:fadeUp .3s both;transition:border-color .15s;}
  .pg-card:hover{border-color:rgba(239,68,68,.2);}
  .pg-card-title{font-size:13px;font-weight:600;color:rgba(255,255,255,.8);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .pg-card-preview{font-size:12px;color:rgba(255,255,255,.3);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;margin-bottom:10px;}
  .pg-card-actions{display:flex;gap:6px;margin-top:2px;}
  .pg-btn{border:none;border-radius:6px;padding:6px 12px;font-family:inherit;font-weight:600;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .12s;}
  .pg-btn:hover{transform:translateY(-1px);}
  .pg-restore{background:rgba(16,185,129,.1);color:#10b981;}
  .pg-restore:hover{background:rgba(16,185,129,.18);}
  .pg-delete{background:rgba(239,68,68,.1);color:#ef4444;}
  .pg-delete:hover{background:rgba(239,68,68,.18);}
  .pg-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:10px;text-align:center;}
  .pg-empty-icon{width:44px;height:44px;background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);margin-bottom:4px;}
  .pg-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  .pg-confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;}
  .pg-confirm-box{background:#1a1a1a;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;max-width:360px;width:100%;}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-content{padding:14px;}.pg-notes-grid{grid-template-columns:1fr!important}}
`;

export default function TrashPage() {
  const navigate = useNavigate();
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [confirmId, setConfirmId]     = useState(null);
  const [confirmAll, setConfirmAll]   = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // BUG FIX: use trashed=true filter
  const loadTrash = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes?trashed=true");
      setNotes((data || []).filter(n => n.isTrashed));
    } catch { toast.error("Trash load nahi ho saka"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTrash(); }, []);

  const restoreNote = async (noteId) => {
    setActionLoading(noteId + "_restore");
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("Note restore ho gaya! ✅");
    } catch { toast.error("Could not restore"); }
    finally { setActionLoading(null); }
  };

  const deleteNote = async (noteId) => {
    setActionLoading(noteId + "_delete");
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setConfirmId(null);
      toast.success("Note permanently deleted");
    } catch { toast.error("Could not delete"); }
    finally { setActionLoading(null); }
  };

  const emptyTrash = async () => {
    setActionLoading("all");
    try {
      await Promise.all(notes.map(n => API.delete(`/notes/${n._id}`)));
      setNotes([]);
      setConfirmAll(false);
      toast.success("Trash empty ho gaya!");
    } catch { toast.error("Trash empty nahi ho saka"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}

      {confirmId && (
        <div className="pg-confirm-overlay">
          <div className="pg-confirm-box">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Permanently Delete?</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 20 }}>Ye action undo nahi ho sakta.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="pg-btn" onClick={() => setConfirmId(null)} style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)" }}>Cancel</button>
              <button className="pg-btn pg-delete" onClick={() => deleteNote(confirmId)} disabled={actionLoading === confirmId + "_delete"}>
                <Trash2 size={12} />Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAll && (
        <div className="pg-confirm-overlay">
          <div className="pg-confirm-box">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Empty Trash?</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 20 }}>Saare {notes.length} notes permanently delete ho jayenge.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="pg-btn" onClick={() => setConfirmAll(false)} style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)" }}>Cancel</button>
              <button className="pg-btn pg-delete" onClick={emptyTrash} disabled={actionLoading === "all"}>
                <Trash2 size={12} />Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <Trash2 size={15} color="rgba(255,255,255,.4)" />
          <span className="pg-title">Trash <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>({notes.length})</span></span>
          <button onClick={loadTrash} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", display: "flex", padding: "4px", marginLeft: "auto" }}>
            <RefreshCw size={13} />
          </button>
          {notes.length > 0 && (
            <button className="pg-empty-all-btn" onClick={() => setConfirmAll(true)}>
              <Trash2 size={12} />Empty Trash
            </button>
          )}
        </div>

        <div className="pg-content">
          {notes.length > 0 && (
            <div className="pg-alert">
              <AlertTriangle size={14} />
              <span>Trash mein notes auto-delete nahi hote. Manually delete karein.</span>
            </div>
          )}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}><div className="pg-spinner" /></div>
          ) : notes.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Trash2 size={20} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>Trash empty hai</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>Delete kiye notes yahan dikhenge</div>
            </div>
          ) : (
            <div className="pg-notes-grid">
              {notes.map((note, i) => (
                <div key={note._id} className="pg-card" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="pg-card-title">{note.title || "Untitled Note"}</div>
                  <div className="pg-card-preview">{note.plainText || "No content..."}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.22)", marginBottom: 10 }}>{formatDate(note.updatedAt)}</div>
                  <div className="pg-card-actions">
                    <button className="pg-btn pg-restore" onClick={() => restoreNote(note._id)} disabled={actionLoading === note._id + "_restore"}>
                      <RotateCcw size={11} />Restore
                    </button>
                    <button className="pg-btn pg-delete" onClick={() => setConfirmId(note._id)}>
                      <X size={11} />Delete
                    </button>
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
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}
