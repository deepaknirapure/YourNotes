import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder, FolderPlus, MoreHorizontal, Trash2, X,
  Menu, Library, Plus, Check, Search
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const COLORS = ["#ff5734", "#4F46E5", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
  @keyframes spin    { to { transform:rotate(360deg) } }

  .pg-wrap { display:flex; height:100dvh; overflow:hidden; background:var(--bg); font-family:'Plus Jakarta Sans',sans-serif; }
  .pg-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  .pg-topbar { height:70px; display:flex; align-items:center; padding:0 32px; background:var(--bg); border-bottom:1px solid var(--border); flex-shrink:0; gap:16px; }
  .pg-menu-btn { display:none; background:var(--border); border:none; border-radius:12px; cursor:pointer; padding:10px; color:var(--text); }
  .pg-title-icon { width:34px; height:34px; border-radius:10px; background:var(--surface); display:flex; align-items:center; justify-content:center; color:#ff5734; }
  .pg-title { font-size:20px; font-weight:900; color:var(--text); letter-spacing:-1px; }
  .pg-count-badge { background:var(--border); color:#8a7f7f; font-size:11px; font-weight:900; padding:4px 10px; border-radius:100px; margin-left:8px; }
  .btn-neon { margin-left:auto; display:flex; align-items:center; gap:8px; background:#ff5734; color:#fff; border:none; border-radius:14px; padding:12px 24px; font-size:13px; font-weight:900; cursor:pointer; transition:0.3s; }
  .btn-neon:hover { transform:translateY(-2px); box-shadow:0 5px 15px rgba(255,87,52,0.3); }

  .pg-content { flex:1; overflow-y:auto; padding:40px 5vw; scrollbar-width:none; }
  .pg-content::-webkit-scrollbar { display:none; }

  .fp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:24px; }

  .fp-card { background:var(--bg); border:1px solid var(--border); border-radius:24px; padding:24px; cursor:pointer; animation:fadeUp 0.4s both; transition:0.3s; position:relative; }
  .fp-card:hover { border-color:var(--text); transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,0.08); }
  .fp-icon-wrap { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
  .fp-name { font-size:16px; font-weight:900; color:var(--text); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .fp-count { font-size:12px; color:#8a7f7f; font-weight:700; margin-bottom:14px; }
  .fp-menu-btn { position:absolute; top:16px; right:16px; background:var(--bg); border:1px solid var(--border); color:var(--text-muted); cursor:pointer; padding:6px; border-radius:10px; transition:0.2s; }
  .fp-menu-btn:hover { color:#ff5734; border-color:#ff5734; }

  .fp-add-btn { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:8px; border-radius:10px; border:1.5px dashed var(--border); background:transparent; color:var(--text-muted); font-size:12px; font-weight:700; cursor:pointer; transition:0.2s; font-family:inherit; }
  .fp-add-btn:hover { border-color:#ff5734; color:#ff5734; background:rgba(255,87,52,0.05); }

  .fp-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); backdrop-filter:blur(6px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .fp-modal { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:28px; width:100%; animation:scaleIn 0.22s ease; box-shadow:0 24px 60px rgba(0,0,0,0.25); }
  .fp-modal.create { max-width:420px; }
  .fp-modal.addnotes { max-width:540px; max-height:82vh; display:flex; flex-direction:column; }

  .modal-hd { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; flex-shrink:0; }
  .modal-title { font-size:16px; font-weight:900; color:var(--text); }
  .modal-sub { font-size:12px; color:var(--text-muted); font-weight:600; margin-top:3px; }
  .modal-close { background:none; border:none; cursor:pointer; color:var(--text-muted); padding:2px; border-radius:6px; flex-shrink:0; }
  .modal-close:hover { color:var(--text); }

  .note-search { display:flex; align-items:center; gap:9px; background:var(--bg); border:1.5px solid var(--border); border-radius:10px; padding:9px 14px; margin-bottom:12px; flex-shrink:0; }
  .note-search:focus-within { border-color:#ff5734; }
  .note-search input { border:none; outline:none; background:transparent; flex:1; font-size:13px; font-weight:500; color:var(--text); font-family:inherit; }

  .notes-list { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px; min-height:0; scrollbar-width:thin; }

  .note-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:11px; border:1.5px solid var(--border); cursor:pointer; transition:0.15s; background:var(--bg); }
  .note-item:hover:not(.in-folder) { border-color:#ff5734; }
  .note-item.sel { border-color:#ff5734; background:rgba(255,87,52,0.06); }
  .note-item.in-folder { opacity:0.45; cursor:not-allowed; }

  .n-check { width:19px; height:19px; border-radius:5px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:0.15s; }
  .note-item.sel .n-check { background:#ff5734; border-color:#ff5734; }
  .n-title { font-size:13px; font-weight:700; color:var(--text); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .n-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; background:var(--border); color:var(--text-muted); flex-shrink:0; }
  .n-badge.other { background:rgba(245,158,11,0.12); color:#f59e0b; }
  .n-date { font-size:11px; color:var(--text-light); font-weight:600; flex-shrink:0; }

  .modal-footer { display:flex; gap:10px; margin-top:14px; flex-shrink:0; padding-top:14px; border-top:1px solid var(--border); }
  .btn-cancel { flex:1; background:transparent; border:1.5px solid var(--border); border-radius:10px; padding:10px; font-weight:700; cursor:pointer; font-family:inherit; color:var(--text-muted); transition:0.15s; }
  .btn-cancel:hover { border-color:var(--text); color:var(--text); }
  .btn-add { flex:2; background:#ff5734; color:#fff; border:none; border-radius:10px; padding:10px; font-weight:900; cursor:pointer; font-family:inherit; font-size:13px; transition:0.2s; }
  .btn-add:disabled { background:var(--border); cursor:not-allowed; color:var(--text-muted); }
  .btn-add:not(:disabled):hover { box-shadow:0 4px 14px rgba(255,87,52,0.3); }

  .fp-input { background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:13px 16px; color:var(--text); font-size:14px; font-weight:700; outline:none; width:100%; font-family:inherit; transition:0.2s; }
  .fp-input:focus { border-color:#ff5734; }
  .fp-color-dot { width:28px; height:28px; border-radius:8px; cursor:pointer; transition:0.2s; border:3px solid transparent; }
  .fp-color-dot.sel { border-color:var(--text); transform:scale(1.15); }

  .ctx-menu { position:absolute; top:48px; right:16px; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:6px; z-index:50; box-shadow:0 8px 24px rgba(0,0,0,0.2); min-width:148px; animation:scaleIn 0.15s ease; }
  .ctx-item { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; color:var(--text-muted); transition:0.12s; }
  .ctx-item:hover { background:var(--bg); color:var(--text); }
  .ctx-item.danger { color:#ef4444; }
  .ctx-item.danger:hover { background:rgba(239,68,68,0.08); color:#ef4444; }

  .pg-spinner { width:26px; height:26px; border:3px solid var(--border); border-top-color:#ff5734; border-radius:50%; animation:spin 0.8s linear infinite; }

  @media (max-width:768px) {
    .pg-menu-btn { display:flex; }
    .pg-topbar { padding:0 16px; height:58px; }
    .fp-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
    .btn-neon span { display:none; }
    .fp-modal.addnotes { max-height:90vh; }
    .pg-content { padding:20px 16px 100px; }
  }
`;

// ─── Add Notes Modal ──────────────────────────────────────────────────────────
function AddNotesModal({ folder, allNotes, onClose, onAdded }) {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState([]);
  const [saving, setSaving]     = useState(false);

  const inFolderIds = new Set(
    allNotes
      .filter(n => n.folder?._id === folder._id || n.folder === folder._id)
      .map(n => n._id)
  );

  const visible = allNotes.filter(n =>
    !n.isTrashed &&
    (n.title || 'Untitled').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    if (inFolderIds.has(id)) return;
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleAdd = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await Promise.all(selected.map(id => API.patch(`/notes/${id}`, { folder: folder._id })));
      toast.success(`${selected.length} note${selected.length > 1 ? 's' : ''} "${folder.name}" mein add ho gaye ✅`);
      onAdded(selected);
      onClose();
    } catch {
      toast.error('Notes add karne mein error aaya');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal addnotes" onClick={e => e.stopPropagation()}>

        <div className="modal-hd">
          <div>
            <div className="modal-title">📂 Add Notes to Folder</div>
            <div className="modal-sub">
              Folder: <span style={{ color: folder.color || '#ff5734', fontWeight: 800 }}>{folder.name}</span>
              {selected.length > 0 && <span style={{ color: '#ff5734', marginLeft: 8 }}>· {selected.length} selected</span>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="note-search">
          <Search size={14} color="var(--text-light)" />
          <input
            placeholder="Note dhundo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="notes-list">
          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
              Koi note nahi mila
            </div>
          ) : visible.map(note => {
            const alreadyIn  = inFolderIds.has(note._id);
            const isSel      = selected.includes(note._id);
            const otherFolder = note.folder && (note.folder._id || note.folder) !== folder._id;

            return (
              <div
                key={note._id}
                className={`note-item${isSel ? ' sel' : ''}${alreadyIn ? ' in-folder' : ''}`}
                onClick={() => toggle(note._id)}
              >
                <div className="n-check">
                  {alreadyIn
                    ? <Check size={11} color="#8a7f7f" />
                    : isSel ? <Check size={11} color="#fff" /> : null
                  }
                </div>
                <span className="n-title">{note.title || 'Untitled Note'}</span>
                {alreadyIn && <span className="n-badge">Already here</span>}
                {otherFolder && !alreadyIn && (
                  <span className="n-badge other">{note.folder?.name || 'Other folder'}</span>
                )}
                <span className="n-date">
                  {new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={handleAdd} disabled={!selected.length || saving}>
            {saving ? 'Adding…' : selected.length > 0 ? `Add ${selected.length} Note${selected.length > 1 ? 's' : ''}` : 'Notes Select Karo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders]         = useState([]);
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [creating, setCreating]       = useState(false);
  const [newName, setNewName]         = useState('');
  const [newColor, setNewColor]       = useState(COLORS[0]);
  const [saving, setSaving]           = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu]       = useState(null);
  const [addNotesTo, setAddNotesTo]   = useState(null);

  useEffect(() => {
    loadData();
    const h = () => setOpenMenu(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, nRes] = await Promise.all([API.get('/folders'), API.get('/notes')]);
      setFolders(fRes.data || []);
      setNotes((nRes.data || []).filter(n => !n.isTrashed));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const createFolder = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.post('/folders', { name: newName.trim(), color: newColor, icon: '📁' });
      setFolders(p => [...p, data]);
      setNewName(''); setCreating(false);
      toast.success('Folder created! ✅');
    } catch { toast.error('Folder create karne mein error'); }
    finally { setSaving(false); }
  };

  const deleteFolder = async (id) => {
    try {
      await API.delete(`/folders/${id}`);
      setFolders(p => p.filter(f => f._id !== id));
      toast.success('Folder deleted');
    } catch { toast.error('Delete failed'); }
  };

  const noteCount = (id) => notes.filter(n => n.folder?._id === id || n.folder === id).length;

  const handleNotesAdded = (addedIds) => {
    setNotes(p => p.map(n =>
      addedIds.includes(n._id) ? { ...n, folder: addNotesTo } : n
    ));
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Create Folder Modal */}
      {creating && (
        <div className="fp-overlay" onClick={() => setCreating(false)}>
          <div className="fp-modal create" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <div className="modal-title">📁 New Folder</div>
              <button className="modal-close" onClick={() => setCreating(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                className="fp-input"
                placeholder="Folder ka naam…"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFolder()}
                autoFocus
              />
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} className={`fp-color-dot${newColor === c ? ' sel' : ''}`} style={{ background: c }} onClick={() => setNewColor(c)} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-cancel" onClick={() => setCreating(false)}>Cancel</button>
                <button className="btn-add" onClick={createFolder} disabled={saving || !newName.trim()}>
                  {saving ? 'Creating…' : 'Create Folder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes Modal */}
      {addNotesTo && (
        <AddNotesModal
          folder={addNotesTo}
          allNotes={notes}
          onClose={() => setAddNotesTo(null)}
          onAdded={handleNotesAdded}
        />
      )}

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pg-title-icon"><Library size={18} /></div>
            <span className="pg-title">Folders</span>
            <span className="pg-count-badge">{folders.length}</span>
          </div>
          <button className="btn-neon" onClick={() => setCreating(true)}>
            <FolderPlus size={17} strokeWidth={2.5} /> <span>New Folder</span>
          </button>
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div className="pg-spinner" />
            </div>
          ) : folders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Folder size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-muted)', fontWeight: 900, marginBottom: 16 }}>Koi folder nahi hai</h3>
              <button className="btn-neon" style={{ margin: '0 auto' }} onClick={() => setCreating(true)}>
                <FolderPlus size={16} /> New Folder
              </button>
            </div>
          ) : (
            <div className="fp-grid">
              {folders.map((folder, i) => (
                <div
                  key={folder._id}
                  className="fp-card"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/notes?folder=${folder._id}`)}
                >
                  {/* 3-dot menu */}
                  <button
                    className="fp-menu-btn"
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === folder._id ? null : folder._id); }}
                  >
                    <MoreHorizontal size={15} />
                  </button>

                  {openMenu === folder._id && (
                    <div className="ctx-menu" onClick={e => e.stopPropagation()}>
                      <div className="ctx-item" onClick={() => { setAddNotesTo(folder); setOpenMenu(null); }}>
                        <Plus size={13} /> Add Notes
                      </div>
                      <div className="ctx-item danger" onClick={() => { deleteFolder(folder._id); setOpenMenu(null); }}>
                        <Trash2 size={13} /> Delete
                      </div>
                    </div>
                  )}

                  <div className="fp-icon-wrap" style={{ background: `${folder.color || '#ff5734'}1a` }}>
                    <Folder size={26} color={folder.color || '#ff5734'} />
                  </div>
                  <div className="fp-name">{folder.name}</div>
                  <div className="fp-count">{noteCount(folder._id)} notes</div>

                  {/* Quick add button */}
                  <button
                    className="fp-add-btn"
                    onClick={e => { e.stopPropagation(); setAddNotesTo(folder); }}
                  >
                    <Plus size={12} /> Add Existing Notes
                  </button>
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
