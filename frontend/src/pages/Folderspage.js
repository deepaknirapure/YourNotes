import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder, FolderPlus, ArrowLeft, MoreHorizontal, Edit2,
  Trash2, FileText, X, Check, RefreshCw, ChevronRight
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const COLORS = ["#E55B2D", "#4F46E5", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
  .fp-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; cursor:pointer; animation:fadeUp .4s both; transition:border-color .2s,transform .2s,box-shadow .2s; position:relative; }
  .fp-card:hover { transform:translateY(-3px); box-shadow:0 16px 32px rgba(0,0,0,.35); }
  .fp-menu-btn { background:rgba(255,255,255,.05); border:none; borderRadius:8px; padding:6px; cursor:pointer; color:rgba(255,255,255,.4); display:flex; align-items:center; justify-content:center; transition:background .2s,color .2s; border-radius:8px; }
  .fp-menu-btn:hover { background:rgba(255,255,255,.1); color:#fff; }
  .fp-dropdown { position:absolute; top:44px; right:16px; background:#1a1a1a; border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:6px; min-width:140px; z-index:10; animation:slideIn .15s; box-shadow:0 16px 32px rgba(0,0,0,.5); }
  .fp-dd-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:7px; font-size:13px; cursor:pointer; transition:background .15s; color:rgba(255,255,255,.7); }
  .fp-dd-item:hover { background:rgba(255,255,255,.06); color:#fff; }
  .fp-input { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:12px 14px; color:#fff; font-size:14px; font-family:inherit; outline:none; width:100%; transition:border-color .2s; }
  .fp-input:focus { border-color:#E55B2D; }
  .fp-input::placeholder { color:rgba(255,255,255,.25); }
  .fp-btn { border:none; border-radius:9px; padding:10px 18px; font-family:inherit; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .2s; }
  .fp-btn-primary { background:#E55B2D; color:#fff; }
  .fp-btn-primary:hover { background:#d14e24; }
  .fp-btn-ghost { background:rgba(255,255,255,.06); color:rgba(255,255,255,.6); }
  .fp-btn-ghost:hover { background:rgba(255,255,255,.1); color:#fff; }
`;

export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadData();
    const handler = () => setOpenMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, nRes] = await Promise.all([API.get("/folders"), API.get("/notes")]);
      setFolders(fRes.data || []);
      setNotes((nRes.data || []).filter(n => !n.isTrashed));
    } catch {
      toast.error("Data load nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  const getNoteCount = (folderId) => notes.filter(n => n.folder === folderId || n.folder?._id === folderId).length;

  const createFolder = async () => {
    if (!newName.trim()) return toast.error("Folder ka naam dalo");
    setSaving(true);
    try {
      const { data } = await API.post("/folders", { name: newName.trim(), color: newColor });
      setFolders(prev => [...prev, data]);
      setCreating(false);
      setNewName(""); setNewColor(COLORS[0]);
      toast.success("Folder ban gaya! 📁");
    } catch {
      toast.error("Folder create nahi ho saka");
    } finally {
      setSaving(false);
    }
  };

  const updateFolder = async (id) => {
    if (!editName.trim()) return toast.error("Naam required hai");
    try {
      const { data } = await API.put(`/folders/${id}`, { name: editName.trim() });
      setFolders(prev => prev.map(f => f._id === id ? { ...f, name: data.name } : f));
      setEditId(null);
      toast.success("Folder update ho gaya");
    } catch {
      toast.error("Update nahi ho saka");
    }
  };

  const deleteFolder = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f._id !== id));
      setOpenMenu(null);
      toast.success("Folder delete ho gaya");
    } catch {
      toast.error("Delete nahi ho saka");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "32px 24px" }}>
      <style>{STYLES}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Back */}
        <button onClick={() => navigate("/home")} style={{
          background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 28,
          fontFamily: "inherit", transition: "color .2s", padding: 0
        }}
          onMouseOver={e => e.currentTarget.style.color = "#fff"}
          onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,.4)"}>
          <ArrowLeft size={16} /> Home
        </button>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(16,185,129,.12)", borderRadius: 12, padding: 10, color: "#10b981" }}>
              <Folder size={24} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800 }}>Folders</h1>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginTop: 2 }}>{folders.length} folder{folders.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button className="fp-btn fp-btn-primary" onClick={() => { setCreating(true); setNewName(""); }}>
            <FolderPlus size={15} /> Naya Folder
          </button>
        </div>

        {/* Create Form */}
        {creating && (
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 20, marginBottom: 24, animation: "fadeUp .3s" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#fff" }}>Naya Folder Banao</div>
            <input className="fp-input" placeholder="Folder ka naam (e.g. Physics, JEE Mains...)" value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setCreating(false); }}
              autoFocus style={{ marginBottom: 14 }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Color chuno:</div>
              <div style={{ display: "flex", gap: 8 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, border: newColor === c ? "2px solid #fff" : "2px solid transparent",
                    cursor: "pointer", transition: "transform .2s", transform: newColor === c ? "scale(1.15)" : "scale(1)"
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="fp-btn fp-btn-primary" onClick={createFolder} disabled={saving}>
                {saving ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={13} />}
                Banao
              </button>
              <button className="fp-btn fp-btn-ghost" onClick={() => setCreating(false)}>
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: "#111", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,.07)", animation: "pulse 1.2s infinite", height: 120 }} />
            ))}
          </div>
        ) : folders.length === 0 && !creating ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.04)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Folder size={36} color="rgba(255,255,255,.12)" />
            </div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Koi Folder Nahi Hai</h3>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14, marginBottom: 24 }}>Notes ko organize karne ke liye folders banao</p>
            <button className="fp-btn fp-btn-primary" style={{ margin: "0 auto" }} onClick={() => setCreating(true)}>
              <FolderPlus size={15} /> Pehla Folder Banao
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
            {folders.map((folder, i) => {
              const count = getNoteCount(folder._id);
              const color = folder.color || COLORS[i % COLORS.length];
              return (
                <div key={folder._id} className="fp-card" style={{ animationDelay: `${i * 0.06}s`, borderColor: editId === folder._id ? "rgba(229,91,45,.4)" : undefined }}>
                  {editId === folder._id ? (
                    <div onClick={e => e.stopPropagation()}>
                      <input className="fp-input" value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") updateFolder(folder._id); if (e.key === "Escape") setEditId(null); }}
                        autoFocus style={{ marginBottom: 10, fontSize: 13 }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="fp-btn fp-btn-primary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => updateFolder(folder._id)}>
                          <Check size={12} /> Save
                        </button>
                        <button className="fp-btn fp-btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => setEditId(null)}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div style={{ background: `${color}18`, borderRadius: 10, padding: 10, color }}>
                          <Folder size={22} fill={`${color}30`} />
                        </div>
                        <button className="fp-menu-btn" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === folder._id ? null : folder._id); }}>
                          <MoreHorizontal size={15} />
                        </button>
                        {openMenu === folder._id && (
                          <div className="fp-dropdown" onClick={e => e.stopPropagation()}>
                            <div className="fp-dd-item" onClick={() => { setEditId(folder._id); setEditName(folder.name); setOpenMenu(null); }}>
                              <Edit2 size={13} /> Rename
                            </div>
                            <div className="fp-dd-item" style={{ color: "#ef4444" }}
                              onClick={() => { if (window.confirm(`"${folder.name}" delete karo?`)) deleteFolder(folder._id); }}>
                              {deleting === folder._id
                                ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
                                : <Trash2 size={13} />}
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {folder.name}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,.35)", display: "flex", alignItems: "center", gap: 5 }}>
                          <FileText size={12} /> {count} note{count !== 1 ? "s" : ""}
                        </span>
                        <span onClick={() => navigate("/dashboard")} style={{ fontSize: 12, color, display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
                          Open <ChevronRight size={12} />
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}