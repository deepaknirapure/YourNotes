-e // ye Starred page hai - starred/important notes dekhne ke liye
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, FileText, Search, RefreshCw, Menu } from "lucide-react";
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
  .pg-topbar{height:52px;display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .pg-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .pg-title{font-size:14px;font-weight:600;color:#fff;}
  .pg-search-wrap{position:relative;margin-left:auto;display:flex;align-items:center;}
  .pg-search-wrap svg{position:absolute;left:9px;color:rgba(255,255,255,.3);pointer-events:none;}
  .pg-search{padding:7px 12px 7px 30px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:6px;font-size:13px;font-family:inherit;color:#fff;outline:none;width:200px;transition:border-color .15s;}
  .pg-search:focus{border-color:rgba(255,255,255,.15);}
  .pg-search::placeholder{color:rgba(255,255,255,.2);}
  .pg-content{flex:1;overflow-y:auto;padding:20px;}
  .pg-notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;}
  .pg-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px;cursor:pointer;transition:border-color .15s,background .15s;animation:fadeUp .3s both;}
  .pg-card:hover{border-color:rgba(245,158,11,.25);background:#161616;}
  .pg-card-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .pg-card-preview{font-size:12px;color:rgba(255,255,255,.35);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;margin-bottom:10px;}
  .pg-card-meta{display:flex;align-items:center;justify-content:space-between;}
  .pg-card-date{font-size:11px;color:rgba(255,255,255,.22);}
  .pg-unstar-btn{background:none;border:none;cursor:pointer;color:#f59e0b;padding:2px;border-radius:4px;transition:all .12s;display:flex;}
  .pg-unstar-btn:hover{transform:scale(1.2);}
  .pg-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:10px;text-align:center;}
  .pg-empty-icon{width:44px;height:44px;background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);margin-bottom:4px;}
  .pg-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  .pg-tag{background:rgba(255,255,255,.06);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:500;color:rgba(255,255,255,.35);}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-search{width:150px!important}.pg-content{padding:14px;}.pg-notes-grid{grid-template-columns:1fr!important}}
`;

export default function StarredPage() {
  const navigate = useNavigate();
  const [notes, setNotes]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchQ, setSearchQ]   = useState("");
  const [sortBy, setSortBy]     = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // BUG FIX: use dedicated starred endpoint
  const loadStarred = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes?starred=true");
      setNotes((data || []).filter(n => n.isStarred && !n.isTrashed));
    } catch { toast.error("Starred notes load nahi ho sake"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStarred(); }, []);

  useEffect(() => {
    let result = [...notes];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(n => (n.title || "").toLowerCase().includes(q) || (n.plainText || "").toLowerCase().includes(q));
    }
    if (sortBy === "newest") result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    else if (sortBy === "oldest") result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    else result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    setFiltered(result);
  }, [notes, searchQ, sortBy]);

  const unstar = async (noteId, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${noteId}/star`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("Unstarred!");
    } catch { toast.error("Action failed"); }
  };

  return (
    <div className="pg-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <Star size={15} color="#f59e0b" />
          <span className="pg-title">Starred <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>({filtered.length})</span></span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, color: "rgba(255,255,255,.5)", fontSize: 12, padding: "5px 8px", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A–Z</option>
          </select>
          <div className="pg-search-wrap">
            <Search size={13} />
            <input className="pg-search" placeholder="Search starred..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <button onClick={loadStarred} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", display: "flex", padding: "4px" }}>
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}><div className="pg-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Star size={20} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>{searchQ ? "Koi result nahi" : "Koi starred note nahi"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>Dashboard mein notes ko star karein</div>
            </div>
          ) : (
            <div className="pg-notes-grid">
              {filtered.map((note, i) => (
                <div key={note._id} className="pg-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="pg-card-title">{note.title || "Untitled Note"}</div>
                  <div className="pg-card-preview">{note.plainText || "No content..."}</div>
                  {note.tags?.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      {note.tags.slice(0, 2).map((t, ti) => <span key={ti} className="pg-tag">#{t}</span>)}
                    </div>
                  )}
                  <div className="pg-card-meta">
                    <span className="pg-card-date">{formatDate(note.updatedAt)}</span>
                    <button className="pg-unstar-btn" onClick={e => unstar(note._id, e)} title="Unstar">
                      <Star size={13} fill="#f59e0b" />
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
