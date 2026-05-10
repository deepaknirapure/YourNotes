// Trashpage.js — DM Sans, #f97316, global tokens (was using Plus Jakarta Sans + #ff5734)
import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X, AlertTriangle, RefreshCw, Menu, Clock, Inbox, ShieldAlert, CheckCircle2 } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  .trash-wrap { display:flex; height:100dvh; overflow:hidden; background:var(--bg); font-family:var(--font,'DM Sans',sans-serif); }

  /* Topbar */
  .trash-topbar-section { display:flex; align-items:center; gap:10px; min-width:0; flex-shrink:1; }

  /* Bulk action bar */
  .bulk-bar {
    position:sticky; top:0; z-index:50; margin-bottom:18px;
    padding:10px 18px; background:var(--surface); border-radius:var(--r-lg);
    border:1.5px solid var(--accent); display:flex; align-items:center;
    justify-content:space-between; box-shadow:0 4px 16px var(--accent-ring);
    animation:fadeUp 0.2s ease;
  }
  .bulk-bar-info { font-size:13px; font-weight:700; color:var(--text); }
  .bulk-bar-actions { display:flex; gap:8px; }

  /* Alert */
  .trash-alert {
    display:flex; align-items:center; gap:10px;
    background:var(--red-light); border:1px solid rgba(220,38,38,0.2);
    border-radius:var(--r-md); padding:12px 16px; margin-bottom:24px;
    font-size:13px; color:var(--red); font-weight:600;
  }

  /* Grid */
  .trash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(272px,1fr)); gap:14px; }

  /* Card */
  .trash-card {
    background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg);
    padding:20px; position:relative; transition:all 0.2s;
    animation:fadeUp 0.35s both; display:flex; flex-direction:column; cursor:pointer;
  }
  .trash-card:hover { border-color:var(--border-2); transform:translateY(-1px); box-shadow:var(--shadow-sm); }
  .trash-card.selected { border-color:var(--accent) !important; border-width:1.5px; background:var(--accent-light); }

  .trash-card-title   { font-size:14px; font-weight:800; color:var(--text); margin-bottom:6px; line-height:1.35; padding-right:22px; }
  .trash-card-preview { font-size:12px; color:var(--text-3); line-height:1.7; margin-bottom:16px; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .trash-card-footer  { display:flex; gap:8px; border-top:1px solid var(--border); padding-top:14px; }

  .trash-card-meta    { font-size:11px; color:var(--text-4); display:flex; align-items:center; gap:4px; margin-bottom:12px; }
  .select-dot {
    position:absolute; top:12px; right:12px; width:18px; height:18px;
    border-radius:50%; border:1.5px solid var(--border-2); background:var(--bg);
    display:flex; align-items:center; justify-content:center; transition:all 0.15s;
  }
  .trash-card.selected .select-dot { background:var(--accent); border-color:var(--accent); }

  /* Spinner */
  .trash-spin { width:26px; height:26px; border:2.5px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }

  @media(max-width:768px) {
    .trash-grid { grid-template-columns:1fr; }
  }
`;

export default function TrashPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrash = async () => {
    try {
      const { data } = await API.get('/notes/trash');
      setNotes(data || []);
    } catch { toast.error('Failed to load trash'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrash(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchTrash();
    setRefreshing(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const restoreSelected = async () => {
    try {
      await Promise.all([...selected].map(id => API.put(`/notes/${id}/restore`)));
      toast.success(`${selected.size} note${selected.size > 1 ? 's' : ''} restored`);
      setSelected(new Set());
      fetchTrash();
    } catch { toast.error('Restore failed'); }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all([...selected].map(id => API.delete(`/notes/${id}/permanent`)));
      toast.success(`${selected.size} note${selected.size > 1 ? 's' : ''} permanently deleted`);
      setSelected(new Set());
      fetchTrash();
    } catch { toast.error('Delete failed'); }
  };

  const restoreOne = async (id) => {
    try { await API.put(`/notes/${id}/restore`); toast.success('Note restored'); fetchTrash(); }
    catch { toast.error('Restore failed'); }
  };

  const deleteOne = async (id) => {
    try { await API.delete(`/notes/${id}/permanent`); toast.success('Permanently deleted'); fetchTrash(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="trash-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        {/* Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
          <div className="trash-topbar-section">
            <div className="page-title-icon" style={{ background:'var(--red-light)', color:'var(--red)' }}>
              <Trash2 size={15} />
            </div>
            <span className="page-title">Trash</span>
            {notes.length > 0 && <span className="count-badge">{notes.length}</span>}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button
              onClick={refresh}
              style={{ width:32, height:32, border:'1px solid var(--border)', borderRadius:'var(--r-sm)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', transition:'all 0.15s' }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div className="pg-content">
          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="bulk-bar">
              <span className="bulk-bar-info">{selected.size} selected</span>
              <div className="bulk-bar-actions">
                <button className="btn-secondary" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => setSelected(new Set())}>
                  <X size={13} /> Clear
                </button>
                <button className="btn-secondary" style={{ padding:'6px 12px', fontSize:12 }} onClick={restoreSelected}>
                  <RotateCcw size={13} /> Restore
                </button>
                <button className="btn-primary" style={{ padding:'6px 12px', fontSize:12, background:'var(--red)' }} onClick={deleteSelected}>
                  <Trash2 size={13} /> Delete Forever
                </button>
              </div>
            </div>
          )}

          {/* Warning */}
          {notes.length > 0 && (
            <div className="trash-alert">
              <ShieldAlert size={16} />
              Notes in trash are permanently deleted after 30 days.
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="empty-state"><div className="trash-spin" /></div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Inbox size={24} color="var(--text-4)" /></div>
              <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text-2)' }}>Trash is empty</h4>
              <p style={{ fontSize:13 }}>Deleted notes will appear here</p>
            </div>
          ) : (
            <div className="trash-grid">
              {notes.map((note, i) => (
                <div
                  key={note._id}
                  className={`trash-card${selected.has(note._id) ? ' selected' : ''}`}
                  style={{ animationDelay:`${i * 0.04}s` }}
                  onClick={() => toggleSelect(note._id)}
                >
                  <div className="select-dot">
                    {selected.has(note._id) && <CheckCircle2 size={12} color="#fff" />}
                  </div>
                  <div className="trash-card-title">{note.title || 'Untitled Note'}</div>
                  <div className="trash-card-meta">
                    <Clock size={11} />
                    Deleted {new Date(note.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  </div>
                  <div className="trash-card-preview">
                    {note.content?.replace(/<[^>]+>/g, '').slice(0, 100) || 'No content'}
                  </div>
                  <div className="trash-card-footer" onClick={e => e.stopPropagation()}>
                    <button className="btn-secondary" style={{ flex:1, padding:'6px 10px', fontSize:12 }} onClick={() => restoreOne(note._id)}>
                      <RotateCcw size={12} /> Restore
                    </button>
                    <button className="btn-primary" style={{ flex:1, padding:'6px 10px', fontSize:12, background:'var(--red)', borderColor:'var(--red)' }} onClick={() => deleteOne(note._id)}>
                      <Trash2 size={12} /> Delete
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