import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Search, RefreshCw, Menu, Clock } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  /* Sleek Topbar */
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; gap: 16px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  .pg-title-section { display: flex; align-items: center; gap: 10px; }
  .pg-title { font-size: 18px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; }
  .pg-count { background: #FFF5F2; color: #E55B2D; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 100px; border: 1px solid #FFE4DB; }
  
  /* Topbar Actions */
  .pg-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
  
  .pg-search-wrap { position: relative; display: flex; align-items: center; }
  .pg-search-wrap svg { position: absolute; left: 12px; color: #94A3B8; pointer-events: none; }
  .pg-search { 
    padding: 8px 12px 8px 36px; background: #F8FAFC; border: 1px solid #E2E8F0; 
    border-radius: 10px; font-size: 14px; font-family: inherit; color: #0F172A; 
    outline: none; width: 220px; transition: 0.2s; 
  }
  .pg-search:focus { border-color: #E55B2D; background: #FFF; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }

  .pg-sort-select {
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 10px;
    padding: 8px 12px; font-size: 13px; font-weight: 600; color: #64748B;
    outline: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center;
  }
  .pg-sort-select:hover { border-color: #CBD5E1; color: #0F172A; }

  /* Content Area */
  .pg-content { flex: 1; overflow-y: auto; padding: 32px 5vw; scrollbar-width: none; }
  .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  
  /* Starred Note Card */
  .pg-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; 
    padding: 24px; cursor: pointer; position: relative;
    transition: all 0.2s ease; animation: fadeUp 0.3s both;
    display: flex; flex-direction: column;
  }
  .pg-card:hover { 
    border-color: #CBD5E1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); 
    transform: translateY(-2px); 
  }
  
  .pg-card-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px; line-height: 1.4; }
  .pg-card-preview { 
    font-size: 14px; color: #64748B; display: -webkit-box; -webkit-line-clamp: 3; 
    -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; margin-bottom: 20px; flex: 1;
  }
  
  .pg-card-footer { 
    display: flex; align-items: center; justify-content: space-between; 
    border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: auto;
  }
  
  .pg-tag-list { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .pg-tag { 
    background: #F1F5F9; border-radius: 6px; padding: 2px 8px; 
    font-size: 11px; font-weight: 700; color: #64748B; border: 1px solid #E2E8F0; 
  }

  .pg-unstar-btn { 
    width: 32px; height: 32px; border-radius: 8px; border: none; 
    background: #FFF5F2; color: #E55B2D; cursor: pointer; 
    display: flex; align-items: center; justify-content: center; transition: 0.2s; 
  }
  .pg-unstar-btn:hover { background: #E55B2D; color: #FFF; transform: scale(1.1); }
  
  /* States */
  .pg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 24px; text-align: center; }
  .pg-empty-icon { width: 64px; height: 64px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #94A3B8; margin-bottom: 16px; }
  .pg-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) {
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; min-width: 38px; height: 38px; align-items: center !important; justify-content: center !important; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content, .saas-main, .flashcard-wrap { padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important; padding-left: 16px !important; padding-right: 16px !important; } 
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; padding: 8px !important; min-width: 38px; min-height: 38px; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; gap: 8px !important; }
    .pg-search { width: 110px !important; font-size: 13px !important; }
    .pg-sort-select { display: none !important; }
    .pg-content { padding: 16px !important; } 
    .pg-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    .pg-card { padding: 16px !important; border-radius: 12px !important; }
    .pg-card-title { font-size: 15px !important; }
  }
`;

export default function StarredPage() {
  const navigate = useNavigate();
  const [notes, setNotes]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchQ, setSearchQ]   = useState("");
  const [sortBy, setSortBy]     = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadStarred = async () => {
    setLoading(true);
    try {
      // DirectStarred check on dashboard/notes logic
      const { data } = await API.get("/notes?starred=true");
      setNotes((data || []).filter(n => n.isStarred && !n.isTrashed));
    } catch { toast.error("Sync failed"); }
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
      toast.success("Removed from stars");
    } catch { toast.error("Action failed"); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <div className="pg-main">
        {/* Sleek Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="pg-title-section">
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#FFF5F2', border: '1px solid #FFE4DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={14} color="#E55B2D" fill="#E55B2D" />
            </div>
            <h1 className="pg-title">Starred</h1>
            <span className="pg-count">{filtered.length}</span>
          </div>

          <div className="pg-actions">
            <div className="pg-search-wrap">
              <Search size={16} />
              <input className="pg-search" placeholder="Search important notes..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            
            <select className="pg-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>

            <button onClick={loadStarred} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", display: "flex", padding: "8px", borderRadius: "8px", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="#F1F5F9"} onMouseOut={e=>e.currentTarget.style.background="none"}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <div className="pg-spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><Star size={28} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{searchQ ? "No matches found" : "No starred notes"}</h3>
              <p style={{ fontSize: 14, color: "#64748B", maxWidth: 300, lineHeight: 1.5 }}>
                {searchQ ? "Try adjusting your search terms." : "Mark notes as important in your workspace to see them here."}
              </p>
            </div>
          ) : (
            <div className="pg-grid">
              {filtered.map((note, i) => (
                <div key={note._id} className="pg-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${i * 0.03}s` }}>
                  <h3 className="pg-card-title">{note.title || "Untitled Intelligence"}</h3>
                  <p className="pg-card-preview">{note.plainText || "No content available for this note yet..."}</p>
                  
                  {note.tags?.length > 0 && (
                    <div className="pg-tag-list">
                      {note.tags.slice(0, 3).map((t, ti) => <span key={ti} className="pg-tag">#{t}</span>)}
                    </div>
                  )}

                  <div className="pg-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>
                      <Clock size={12} /> {formatDate(note.updatedAt)}
                    </div>
                    <button className="pg-unstar-btn" onClick={e => unstar(note._id, e)} title="Unstar this note">
                      <Star size={14} fill="currentColor" />
                    </button>
                  </div>
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

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}
