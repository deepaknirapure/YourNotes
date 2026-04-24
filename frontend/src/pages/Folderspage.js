import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, FolderPlus, MoreHorizontal, Edit2, Trash2, FileText, X, Check, RefreshCw, Menu } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const COLORS = ["#E55B2D","#4F46E5","#10b981","#f59e0b","#8b5cf6","#06b6d4","#f43f5e","#84cc16"];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .pg-wrap{display:flex;height:100vh;overflow:hidden;}
  .pg-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .pg-topbar{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .pg-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .pg-title{font-size:14px;font-weight:600;color:#fff;}
  .pg-new-btn{margin-left:auto;display:flex;align-items:center;gap:6px;background:#E55B2D;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;}
  .pg-new-btn:hover{background:#d14e24;box-shadow:0 4px 14px rgba(229,91,45,.3);}
  .pg-content{flex:1;overflow-y:auto;padding:20px;}
  .fp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;}
  .fp-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px;cursor:pointer;animation:fadeUp .3s both;transition:border-color .15s,transform .12s;position:relative;}
  .fp-card:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.3);}
  .fp-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
  .fp-name{font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .fp-count{font-size:12px;color:rgba(255,255,255,.35);}
  .fp-menu-btn{position:absolute;top:10px;right:10px;background:none;border:none;color:rgba(255,255,255,.25);cursor:pointer;padding:3px;border-radius:4px;transition:all .12s;display:flex;}
  .fp-menu-btn:hover{color:#fff;background:rgba(255,255,255,.08);}
  .fp-dropdown{position:absolute;top:34px;right:8px;background:#1a1a1a;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:4px;min-width:140px;z-index:30;animation:scaleIn .12s ease;box-shadow:0 12px 32px rgba(0,0,0,.6);}
  .fp-dd-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:5px;font-size:12px;font-weight:500;color:rgba(255,255,255,.65);cursor:pointer;transition:background .12s;}
  .fp-dd-item:hover{background:rgba(255,255,255,.06);color:#fff;}
  .fp-dd-item.danger{color:#ef4444;}
  .fp-dd-item.danger:hover{background:rgba(239,68,68,.1);}
  .fp-input{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:8px 12px;color:#fff;font-size:13px;font-family:inherit;outline:none;width:100%;transition:border-color .15s;}
  .fp-input:focus{border-color:#E55B2D;}
  .fp-input::placeholder{color:rgba(255,255,255,.2);}
  .fp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;}
  .fp-modal{background:#1a1a1a;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;max-width:380px;width:100%;animation:scaleIn .15s ease;}
  .fp-btn{border:none;border-radius:6px;padding:8px 16px;font-family:inherit;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .12s;}
  .fp-btn-primary{background:#E55B2D;color:#fff;}
  .fp-btn-primary:hover:not(:disabled){background:#d14e24;}
  .fp-btn-primary:disabled{opacity:.5;cursor:not-allowed;}
  .fp-btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.08);}
  .fp-btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}
  .fp-color-dot{width:20px;height:20px;border-radius:50%;cursor:pointer;transition:transform .12s;flex-shrink:0;}
  .fp-color-dot:hover{transform:scale(1.15);}
  .fp-color-dot.sel{outline:2px solid #fff;outline-offset:2px;}
  .pg-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:10px;text-align:center;}
  .pg-empty-icon{width:44px;height:44px;background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);margin-bottom:4px;}
  .pg-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-content{padding:14px;}.fp-grid{grid-template-columns:repeat(2,1fr)!important}}
`;

export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders]     = useState([]);
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState("");
  const [newColor, setNewColor]   = useState(COLORS[0]);
  const [saving, setSaving]       = useState(false);
  const [openMenu, setOpenMenu]   = useState(null);
  const [editId, setEditId]       = useState(null);
  const [editName, setEditName]   = useState("");
  const [deleting, setDeleting]   = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
    const h = () => setOpenMenu(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, nRes] = await Promise.all([API.get("/folders"), API.get("/notes")]);
      setFolders(fRes.data || []);
      setNotes((nRes.data || []).filter(n => !n.isTrashed));
    } catch { toast.error("Data load nahi ho saka"); }
    finally { setLoading(false); }
  };

  const noteCount = (folderId) => notes.filter(n => n.folder?._id === folderId || n.folder === folderId).length;

  const createFolder = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.post("/folders", { name: newName.trim(), color: newColor, icon: "📁" });
      setFolders(prev => [...prev, data]);
      setNewName(""); setCreating(false);
      toast.success("Folder created!");
    } catch (err) { toast.error(err.response?.data?.message || "Create failed"); }
    finally { setSaving(false); }
  };

  const updateFolder = async () => {
    if (!editName.trim()) return;
    try {
      const { data } = await API.put(`/folders/${editId}`, { name: editName.trim() });
      setFolders(prev => prev.map(f => f._id === editId ? data : f));
      setEditId(null); toast.success("Folder updated!");
    } catch { toast.error("Update failed"); }
  };

  const deleteFolder = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f._id !== id));
      setOpenMenu(null); toast.success("Folder deleted!");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}

      {creating && (
        <div className="fp-modal-overlay" onClick={() => setCreating(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>New Folder</h3>
              <button onClick={() => setCreating(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", display: "flex" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input className="fp-input" placeholder="Folder naam likhein..." value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createFolder()} autoFocus />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)", marginBottom: 8, letterSpacing: ".05em", textTransform: "uppercase" }}>Color</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <div key={c} className={`fp-color-dot${newColor === c ? " sel" : ""}`}
                      style={{ background: c }} onClick={() => setNewColor(c)} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="fp-btn fp-btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
                <button className="fp-btn fp-btn-primary" onClick={createFolder} disabled={saving || !newName.trim()}>
                  {saving ? "Creating..." : "Create Folder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <Folder size={15} color="rgba(255,255,255,.5)" />
          <span className="pg-title">Folders <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>({folders.length})</span></span>
          <button className="pg-new-btn" onClick={() => setCreating(true)}><FolderPlus size={14} />New Folder</button>
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}><div className="pg-spinner" /></div>
          ) : folders.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Folder size={20} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>Koi folder nahi hai</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>New Folder button se banayein</div>
            </div>
          ) : (
            <div className="fp-grid">
              {folders.map((folder, i) => (
                <div key={folder._id} className="fp-card" onClick={() => navigate("/dashboard")}
                  style={{ animationDelay: `${i * 0.04}s`, borderColor: openMenu === folder._id ? "rgba(255,255,255,.14)" : "" }}>
                  <button className="fp-menu-btn" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === folder._id ? null : folder._id); }}>
                    <MoreHorizontal size={14} />
                  </button>
                  {openMenu === folder._id && (
                    <div className="fp-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="fp-dd-item" onClick={() => { setEditId(folder._id); setEditName(folder.name); setOpenMenu(null); }}>
                        <Edit2 size={12} />Rename
                      </div>
                      <div className="fp-dd-item danger" onClick={() => deleteFolder(folder._id)}>
                        <Trash2 size={12} />{deleting === folder._id ? "Deleting..." : "Delete"}
                      </div>
                    </div>
                  )}
                  {editId === folder._id ? (
                    <div onClick={e => e.stopPropagation()} style={{ marginBottom: 8 }}>
                      <input className="fp-input" value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") updateFolder(); if (e.key === "Escape") setEditId(null); }}
                        autoFocus style={{ marginBottom: 8 }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="fp-btn fp-btn-primary" style={{ padding: "5px 10px", fontSize: 12 }} onClick={updateFolder}><Check size={11} />Save</button>
                        <button className="fp-btn fp-btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setEditId(null)}><X size={11} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="fp-icon" style={{ background: `${folder.color}20` }}>
                        <Folder size={18} color={folder.color || "#E55B2D"} />
                      </div>
                      <div className="fp-name">{folder.name}</div>
                      <div className="fp-count">{noteCount(folder._id)} notes</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
