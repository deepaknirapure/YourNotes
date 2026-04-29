import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, FolderPlus, MoreHorizontal, Edit2, Trash2, X, Menu, Library } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const COLORS = ["#ccff00", "#4F46E5", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }

  body { background: #FFFFFF; color: #000000; font-family: 'Plus Jakarta Sans', sans-serif; }

  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FFFFFF; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* ── Top Bar ── */
  .pg-topbar {
    height: 70px; display: flex; align-items: center; padding: 0 32px;
    background: #FFFFFF; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; gap: 16px;
  }

  .pg-menu-btn {
    display: none; background: #F1F5F9; border: none; border-radius: 12px; 
    cursor: pointer; padding: 10px; color: #000;
  }

  .pg-title-icon { width: 34px; height: 34px; border-radius: 10px; background: #000; display: flex; align-items: center; justify-content: center; color: #ccff00; }
  .pg-title { font-size: 20px; font-weight: 900; color: #000; letter-spacing: -1px; text-transform: uppercase; }
  .pg-count-badge { background: #F1F5F9; color: #64748B; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 100px; }

  .btn-neon {
    margin-left: auto; display: flex; align-items: center; gap: 8px;
    background: #ccff00; color: #000; border: none; border-radius: 14px;
    padding: 12px 24px; font-size: 13px; font-weight: 900; cursor: pointer;
    transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(204,255,0,0.3); }

  /* ── Content ── */
  .pg-content { flex: 1; overflow-y: auto; padding: 40px 5vw; scrollbar-width: none; }

  /* ── Grid ── */
  .fp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }

  /* ── Folder Card ── */
  .fp-card {
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 24px;
    padding: 28px; cursor: pointer; animation: fadeUp 0.4s both;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
  }
  .fp-card:hover { border-color: #000; transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.04); }

  .fp-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .fp-name { font-size: 17px; font-weight: 900; color: #000; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fp-count { font-size: 13px; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

  .fp-menu-btn {
    position: absolute; top: 18px; right: 18px; background: #F8FAFC;
    border: 1px solid #F1F5F9; color: #000; cursor: pointer; padding: 6px;
    border-radius: 10px; transition: 0.2s;
  }
  .fp-menu-btn:hover { background: #000; color: #ccff00; border-color: #000; }

  /* ── Modal ── */
  .fp-modal-overlay {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px); z-index: 200; display: flex;
    align-items: center; justify-content: center; padding: 20px;
  }
  .fp-modal {
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 28px;
    padding: 32px; max-width: 440px; width: 100%; animation: scaleIn 0.3s ease;
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  }
  .fp-modal-title { font-size: 20px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: -1px; }

  .fp-input {
    background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 14px;
    padding: 14px 18px; color: #000; font-size: 15px; font-weight: 700;
    outline: none; width: 100%; transition: 0.2s;
  }
  .fp-input:focus { border-color: #000; background: #FFF; box-shadow: 0 0 15px rgba(0,0,0,0.05); }

  .fp-btn-primary { background: #000; color: #ccff00; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 900; cursor: pointer; transition: 0.3s; }
  .fp-btn-primary:hover { background: #ccff00; color: #000; }

  .fp-color-dot { width: 30px; height: 30px; border-radius: 10px; cursor: pointer; transition: 0.2s; border: 3px solid transparent; }
  .fp-color-dot.sel { border-color: #000; transform: scale(1.15); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

  @media (max-width: 768px) {
    .pg-menu-btn { display: flex; }
    .pg-topbar { padding: 0 16px; }
    .fp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .btn-neon span { display: none; }
  }
`;

export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders]   = useState([]);
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [saving, setSaving]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    loadData();
    const handleClick = () => setOpenMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, nRes] = await Promise.all([API.get("/folders"), API.get("/notes")]);
      setFolders(fRes.data || []);
      setNotes((nRes.data || []).filter(n => !n.isTrashed));
    } catch { toast.error("Transfer failed"); }
    finally { setLoading(false); }
  };

  const createFolder = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.post("/folders", { name: newName.trim(), color: newColor, icon: "📁" });
      setFolders(prev => [...prev, data]);
      setNewName(""); setCreating(false);
      toast.success("DATA CLUSTER CREATED!");
    } catch { toast.error("Protocol Error"); }
    finally { setSaving(false); }
  };

  const deleteFolder = async (id) => {
    try {
      await API.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f._id !== id));
      toast.success("CLUSTER DELETED");
    } catch { toast.error("Delet failed"); }
  };

  const noteCount = (id) => notes.filter(n => n.folder?._id === id || n.folder === id).length;

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {creating && (
        <div className="fp-modal-overlay" onClick={() => setCreating(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 className="fp-modal-title">New Knowledge Cluster</h3>
              <X size={20} onClick={() => setCreating(false)} style={{ cursor: "pointer" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <input className="fp-input" placeholder="CLUSTER NAME..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              
              <div>
                <label style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", marginBottom: 12, display: "block" }}>TAG COLOR</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <div key={c} className={`fp-color-dot ${newColor === c ? "sel" : ""}`} style={{ background: c }} onClick={() => setNewColor(c)} />
                  ))}
                </div>
              </div>

              <button className="fp-btn-primary" onClick={createFolder} disabled={saving}>
                {saving ? "INITIALIZING..." : "CREATE CLUSTER"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="pg-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="pg-title-icon"><Library size={18} /></div>
            <span className="pg-title">Library <span className="pg-count-badge">{folders.length}</span></span>
          </div>
          <button className="btn-neon" onClick={() => setCreating(true)}>
            <FolderPlus size={18} strokeWidth={3} /> <span>NEW CLUSTER</span>
          </button>
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><div className="pg-spinner" /></div>
          ) : folders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Folder size={60} color="#F1F5F9" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ color: '#94A3B8', fontWeight: 900 }}>NO CLUSTERS FOUND</h3>
                <button className="btn-neon" style={{ margin: '20px auto 0' }} onClick={() => setCreating(true)}>INITIALIZE LIBRARY</button>
            </div>
          ) : (
            <div className="fp-grid">
              {folders.map((folder, i) => (
                <div key={folder._id} className="fp-card" onClick={() => navigate(`/notes?folder=${folder._id}`)} style={{ animationDelay: `${i * 0.05}s` }}>
                  <button className="fp-menu-btn" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === folder._id ? null : folder._id); }}>
                    <MoreHorizontal size={16} />
                  </button>
                  
                  {openMenu === folder._id && (
                    <div style={{ position: 'absolute', top: 50, right: 18, background: '#000', borderRadius: 12, padding: 8, zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ color: '#FF4444', fontSize: 12, fontWeight: 900, padding: '8px 12px', cursor: 'pointer' }} onClick={() => deleteFolder(folder._id)}>DELETE</div>
                    </div>
                  )}

                  <div className="fp-icon-wrap" style={{ background: `${folder.color || "#ccff00"}15` }}>
                    <Folder size={26} color={folder.color || "#000"} fill={folder.color === "#ccff00" ? "#ccff00" : "none"} />
                  </div>
                  <div className="fp-name">{folder.name}</div>
                  <div className="fp-count">{noteCount(folder._id)} FILES SYNCED</div>
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