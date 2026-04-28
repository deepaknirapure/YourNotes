// Folderspage.js - Notes folders manage karne ka page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, FolderPlus, MoreHorizontal, Edit2, Trash2, X, Menu } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

// Folder ke liye available colors
const COLORS = ["#E55B2D", "#4F46E5", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
  @keyframes spin { to { transform: rotate(360deg) } }

  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }

  /* ── Page Layout ── */
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* ── Top Bar ── */
  .pg-topbar {
    height: 60px; display: flex; align-items: center; padding: 0 24px;
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; gap: 12px;
  }

  .pg-menu-btn {
    display: none; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 10px; cursor: pointer; padding: 8px;
    color: #64748B; align-items: center; justify-content: center;
    min-width: 38px; height: 38px; transition: 0.15s; flex-shrink: 0;
  }
  .pg-menu-btn:hover { background: #FFF5F2; color: #E55B2D; border-color: #FFE4DB; }

  .pg-title-wrap { display: flex; align-items: center; gap: 10px; }
  .pg-title-icon { width: 30px; height: 30px; border-radius: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; }
  .pg-title { font-size: 17px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
  .pg-count-badge { background: #F1F5F9; color: #64748B; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 100px; }

  /* New Folder button */
  .btn-create {
    margin-left: auto; display: flex; align-items: center; gap: 8px;
    background: #0F172A; color: #FFF; border: none; border-radius: 10px;
    padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer;
    transition: 0.2s; font-family: inherit; white-space: nowrap;
  }
  .btn-create:hover { background: #E55B2D; transform: translateY(-1px); }

  /* ── Scrollable Content ── */
  .pg-content {
    flex: 1; overflow-y: auto; padding: 28px;
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .pg-content::-webkit-scrollbar { display: none; }

  /* ── Folders Grid ── */
  .fp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

  /* ── Folder Card ── */
  .fp-card {
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px;
    padding: 22px; cursor: pointer; animation: fadeUp 0.3s both;
    transition: all 0.2s ease; position: relative;
  }
  .fp-card:hover {
    border-color: #CBD5E1; box-shadow: 0 8px 20px rgba(0,0,0,0.05);
    transform: translateY(-2px);
  }

  .fp-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .fp-name { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fp-count { font-size: 13px; color: #64748B; font-weight: 500; }

  /* Card 3-dot menu button */
  .fp-menu-btn {
    position: absolute; top: 14px; right: 14px; background: transparent;
    border: none; color: #94A3B8; cursor: pointer; padding: 5px;
    border-radius: 8px; transition: 0.2s; display: flex;
  }
  .fp-menu-btn:hover { color: #0F172A; background: #F1F5F9; }

  /* Dropdown */
  .fp-dropdown {
    position: absolute; top: 44px; right: 14px; background: #FFF;
    border: 1px solid #E2E8F0; border-radius: 12px; padding: 6px;
    min-width: 160px; z-index: 30; animation: scaleIn 0.15s ease;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  }
  .fp-dd-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569;
    cursor: pointer; transition: 0.2s;
  }
  .fp-dd-item:hover { background: #F8FAFC; color: #0F172A; }
  .fp-dd-item.danger { color: #EF4444; }
  .fp-dd-item.danger:hover { background: #FEF2F2; }

  /* ── Form Inputs ── */
  .fp-input {
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;
    padding: 11px 14px; color: #0F172A; font-size: 14px; font-weight: 500;
    font-family: inherit; outline: none; width: 100%; transition: 0.2s;
  }
  .fp-input:focus { border-color: #E55B2D; background: #FFF; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  .fp-input::placeholder { color: #94A3B8; font-weight: 400; }

  /* ── Modal ── */
  .fp-modal-overlay {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px); z-index: 200; display: flex;
    align-items: center; justify-content: center; padding: 20px;
  }
  .fp-modal {
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 20px;
    padding: 28px; max-width: 420px; width: 100%; animation: scaleIn 0.2s ease;
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
  .fp-modal-title { font-size: 17px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; }

  /* Modal buttons */
  .fp-btn { border: none; border-radius: 10px; padding: 10px 18px; font-family: inherit; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
  .fp-btn-primary { background: #0F172A; color: #FFF; }
  .fp-btn-primary:hover:not(:disabled) { background: #E55B2D; }
  .fp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .fp-btn-ghost { background: #FFF; color: #64748B; border: 1px solid #E2E8F0; }
  .fp-btn-ghost:hover { background: #F8FAFC; border-color: #CBD5E1; }

  /* Color dots */
  .fp-color-dot { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; transition: 0.2s; flex-shrink: 0; border: 2px solid transparent; }
  .fp-color-dot:hover { transform: scale(1.1); }
  .fp-color-dot.sel { box-shadow: 0 0 0 2px #FFF, 0 0 0 4px #0F172A; }

  /* ── Empty & Loading ── */
  .pg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; }
  .pg-empty-icon { width: 60px; height: 60px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #94A3B8; margin-bottom: 14px; }
  .pg-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }

  /* ── Mobile Responsive ── */
  @media (max-width: 768px) {
    .pg-menu-btn { display: flex !important; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content {
      padding: 16px !important;
      padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
    }
    .fp-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .fp-card { padding: 16px !important; }
    .btn-create span { display: none; }
    .btn-create { padding: 10px 12px !important; border-radius: 10px !important; }
    .fp-modal { padding: 20px !important; border-radius: 16px !important; }
  }

  @media (max-width: 380px) {
    .fp-grid { grid-template-columns: 1fr !important; }
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
  const [openMenu, setOpenMenu] = useState(null);
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
    // Click se dropdown band karo
    const handleClick = () => setOpenMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Folders aur notes load karo
  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, nRes] = await Promise.all([API.get("/folders"), API.get("/notes")]);
      setFolders(fRes.data || []);
      setNotes((nRes.data || []).filter(n => !n.isTrashed));
    } catch { toast.error("Could not load folders"); }
    finally { setLoading(false); }
  };

  // Folder mein kitne notes hain
  const noteCount = (folderId) =>
    notes.filter(n => n.folder?._id === folderId || n.folder === folderId).length;

  // Naya folder banao
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

  // Folder rename karo
  const updateFolder = async () => {
    if (!editName.trim()) return;
    try {
      const { data } = await API.put(`/folders/${editId}`, { name: editName.trim() });
      setFolders(prev => prev.map(f => f._id === editId ? data : f));
      setEditId(null); toast.success("Folder renamed!");
    } catch { toast.error("Update failed"); }
  };

  // Folder delete karo
  const deleteFolder = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f._id !== id));
      setOpenMenu(null); toast.success("Folder deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Folder create karne ka modal */}
      {creating && (
        <div className="fp-modal-overlay" onClick={() => setCreating(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <h3 className="fp-modal-title">Create New Folder</h3>
              <button onClick={() => setCreating(false)} style={{ background: "#F1F5F9", border: "none", color: "#64748B", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Folder Name</label>
                <input className="fp-input" placeholder="e.g. Mathematics, Projects..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && createFolder()} autoFocus />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 10 }}>Color</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <div key={c} className={`fp-color-dot ${newColor === c ? "sel" : ""}`} style={{ background: c }} onClick={() => setNewColor(c)} />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="fp-btn fp-btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
                <button className="fp-btn fp-btn-primary" onClick={createFolder} disabled={saving || !newName.trim()}>
                  {saving ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pg-main">
        {/* Top bar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="pg-title-wrap">
            <div className="pg-title-icon"><Folder size={15} color="#64748B" /></div>
            <span className="pg-title">
              Library <span className="pg-count-badge">{folders.length}</span>
            </span>
          </div>
          <button className="btn-create" onClick={() => setCreating(true)}>
            <FolderPlus size={16} /> <span>New Folder</span>
          </button>
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <div className="pg-spinner" />
            </div>
          ) : folders.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Folder size={28} /></div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>No folders yet</h3>
              <p style={{ fontSize: 14, color: "#64748B", maxWidth: 280, lineHeight: 1.5, marginBottom: 20 }}>Organize your notes by creating folders for subjects or projects.</p>
              <button className="btn-create" onClick={() => setCreating(true)} style={{ marginInline: "auto" }}>
                <FolderPlus size={15} /> Create First Folder
              </button>
            </div>
          ) : (
            <div className="fp-grid">
              {folders.map((folder, i) => (
                <div
                  key={folder._id}
                  className="fp-card"
                  onClick={() => navigate("/dashboard")}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  {/* 3-dot menu button */}
                  <button className="fp-menu-btn" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === folder._id ? null : folder._id); }}>
                    <MoreHorizontal size={17} />
                  </button>

                  {/* Dropdown menu */}
                  {openMenu === folder._id && (
                    <div className="fp-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="fp-dd-item" onClick={() => { setEditId(folder._id); setEditName(folder.name); setOpenMenu(null); }}>
                        <Edit2 size={13} /> Rename
                      </div>
                      <div className="fp-dd-item danger" onClick={() => deleteFolder(folder._id)}>
                        <Trash2 size={13} /> {deleting === folder._id ? "Deleting..." : "Delete"}
                      </div>
                    </div>
                  )}

                  {/* Edit mode ya normal display */}
                  {editId === folder._id ? (
                    <div onClick={e => e.stopPropagation()} style={{ position: "relative", zIndex: 10 }}>
                      <input
                        className="fp-input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") updateFolder(); if (e.key === "Escape") setEditId(null); }}
                        autoFocus
                        style={{ marginBottom: 10 }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="fp-btn fp-btn-primary" style={{ flex: 1, padding: "7px 12px", fontSize: 13 }} onClick={updateFolder}>Save</button>
                        <button className="fp-btn fp-btn-ghost" style={{ padding: "7px 12px", fontSize: 13 }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="fp-icon-wrap" style={{ background: `${folder.color || "#E55B2D"}18` }}>
                        <Folder size={22} color={folder.color || "#E55B2D"} fill={`${folder.color || "#E55B2D"}20`} />
                      </div>
                      <div className="fp-name">{folder.name}</div>
                      <div className="fp-count">{noteCount(folder._id)} documents</div>
                    </>
                  )}
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
