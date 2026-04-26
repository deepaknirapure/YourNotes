-e // ye Community page hai - doosre students ke notes dekhne aur share karne ke liye
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Download, Search, Eye, Heart, Clock, TrendingUp, Globe, Menu, User, FileText } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const TABS = [
  { key: "recent",    label: "Recent",    icon: Clock },
  { key: "popular",   label: "Popular",   icon: TrendingUp },
  { key: "all",       label: "All Notes", icon: Globe },
];

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
  .pg-content{flex:1;overflow-y:auto;padding:20px;}
  .cm-tabs{display:flex;gap:2px;margin-bottom:20px;background:#111;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:3px;}
  .cm-tab{flex:1;padding:6px 12px;border:none;border-radius:6px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px;color:rgba(255,255,255,.4);}
  .cm-tab.active{background:#1a1a1a;color:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);}
  .cm-tab:not(.active):hover{color:rgba(255,255,255,.7);}
  .cm-search-wrap{position:relative;display:flex;align-items:center;margin-bottom:18px;}
  .cm-search-wrap svg{position:absolute;left:10px;color:rgba(255,255,255,.3);pointer-events:none;}
  .cm-search{width:100%;padding:8px 12px 8px 32px;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:7px;font-size:13px;font-family:inherit;color:#fff;outline:none;transition:border-color .15s;}
  .cm-search:focus{border-color:rgba(255,255,255,.18);}
  .cm-search::placeholder{color:rgba(255,255,255,.2);}
  .cm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}
  .cm-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px;animation:fadeUp .3s both;transition:border-color .15s,background .15s;}
  .cm-card:hover{border-color:rgba(255,255,255,.13);background:#161616;}
  .cm-card-header{display:flex;align-items:center;gap:9px;margin-bottom:10px;}
  .cm-author-avatar{width:26px;height:26px;border-radius:50%;background:rgba(229,91,45,.15);border:1px solid rgba(229,91,45,.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#E55B2D;flex-shrink:0;}
  .cm-author-name{font-size:12px;font-weight:500;color:rgba(255,255,255,.55);}
  .cm-card-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .cm-card-preview{font-size:12px;color:rgba(255,255,255,.35);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;margin-bottom:10px;}
  .cm-card-footer{display:flex;align-items:center;justify-content:space-between;}
  .cm-stats{display:flex;align-items:center;gap:10px;}
  .cm-stat-item{display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.3);font-weight:500;}
  .cm-dl-btn{display:flex;align-items:center;gap:5px;background:rgba(229,91,45,.1);color:#E55B2D;border:1px solid rgba(229,91,45,.2);border-radius:6px;padding:5px 10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .12s;}
  .cm-dl-btn:hover{background:rgba(229,91,45,.18);}
  .cm-dl-btn:disabled{opacity:.4;cursor:not-allowed;}
  .pg-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:10px;text-align:center;}
  .pg-empty-icon{width:44px;height:44px;background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);margin-bottom:4px;}
  .pg-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-content{padding:14px;}.cm-grid{grid-template-columns:1fr!important}}
`;

export default function CommunityPage() {
  const navigate = useNavigate();
  const [notes, setNotes]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQ, setSearchQ]     = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [downloading, setDownloading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    API.get("/community/notes")
      .then(({ data }) => setNotes(data || []))
      .catch(() => toast.error("Community notes load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...notes];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(n => (n.title || "").toLowerCase().includes(q) || (n.author?.name || "").toLowerCase().includes(q));
    }
    if (activeTab === "popular") result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    else if (activeTab === "recent") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFiltered(result);
  }, [notes, searchQ, activeTab]);

  const downloadNote = async (noteId) => {
    setDownloading(noteId);
    try {
      await API.post(`/community/notes/${noteId}/download`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, downloadCount: (n.downloadCount || 0) + 1 } : n));
      toast.success("Note apne dashboard mein aa gaya! ✅");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed");
    } finally { setDownloading(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <Users size={15} color="rgba(255,255,255,.5)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Community</span>
          {!loading && (
            <span style={{ marginLeft: 4, fontSize: 12, color: "rgba(255,255,255,.3)", fontWeight: 500 }}>({filtered.length})</span>
          )}
        </div>

        <div className="pg-content">
          <div className="cm-tabs">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={`cm-tab${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          <div className="cm-search-wrap">
            <Search size={14} />
            <input className="cm-search" placeholder="Notes ya author search karein..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}><div className="pg-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Users size={20} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>
                {searchQ ? "Koi result nahi" : "Community mein koi note nahi"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>
                {searchQ ? "Different search try karein" : "Dashboard se notes share karein"}
              </div>
            </div>
          ) : (
            <div className="cm-grid">
              {filtered.map((note, i) => (
                <div key={note._id} className="cm-card" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="cm-card-header">
                    <div className="cm-author-avatar">
                      {(note.author?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="cm-author-name">{note.author?.name || "Anonymous"}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>{formatDate(note.createdAt)}</div>
                    </div>
                  </div>
                  <div className="cm-card-title">{note.title || "Untitled Note"}</div>
                  <div className="cm-card-preview">{note.plainText || "No preview available..."}</div>
                  <div className="cm-card-footer">
                    <div className="cm-stats">
                      <span className="cm-stat-item"><Download size={10} />{note.downloadCount || 0}</span>
                      <span className="cm-stat-item"><Eye size={10} />{note.viewCount || 0}</span>
                    </div>
                    <button className="cm-dl-btn" onClick={() => downloadNote(note._id)} disabled={downloading === note._id}>
                      {downloading === note._id
                        ? <div style={{ width: 12, height: 12, border: "2px solid rgba(229,91,45,.3)", borderTopColor: "#E55B2D", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                        : <Download size={12} />}
                      {downloading === note._id ? "..." : "Download"}
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
