import { useState, useEffect, useMemo } from "react";
import { Users, Download, Search, Heart, Clock, TrendingUp, Globe, Menu, FileText, MessageCircle, Bookmark } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "recent",    label: "RECENT",    icon: Clock },
  { key: "popular",   label: "POPULAR",   icon: TrendingUp },
  { key: "all",       label: "ALL NOTES", icon: Globe },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FFFFFF; color: #000000; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FFFFFF; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  
  /* Header / Topbar */
  .pg-topbar { 
    height: 70px; display: flex; align-items: center; gap: 16px; padding: 0 32px; 
    background: #FFFFFF; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; cursor: pointer; padding: 10px; color: #000; }
  
  .pg-content { flex: 1; overflow-y: auto; padding: 40px 5vw; scrollbar-width: none; }
  
  /* Filter Bar */
  .cm-header-bar {
    display: flex; justify-content: space-between; align-items: center; 
    margin-bottom: 40px; flex-wrap: wrap; gap: 20px;
  }
  
  .cm-tabs { 
    display: flex; gap: 6px; background: #F1F5F9; border-radius: 14px; padding: 5px; 
  }
  .cm-tab { 
    padding: 10px 18px; border: none; border-radius: 10px; font-size: 11px; font-weight: 900; 
    cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; color: #64748B; background: transparent; letter-spacing: 0.5px;
  }
  .cm-tab.active { background: #000000; color: #ccff00; }
  
  .cm-search-wrap { 
    position: relative; display: flex; align-items: center; background: #F8FAFC; 
    border: 1px solid #E2E8F0; border-radius: 14px; padding: 0 16px; 
    width: 320px; transition: 0.3s;
  }
  .cm-search-wrap:focus-within { border-color: #000; background: #FFF; box-shadow: 0 0 15px rgba(0,0,0,0.05); }
  .cm-search { 
    width: 100%; padding: 12px 8px; background: transparent; border: none; 
    font-size: 14px; font-weight: 700; color: #000; outline: none; 
  }
  
  .btn-neon {
    background: #000000; color: #ccff00; border: none; border-radius: 14px; padding: 12px 20px; 
    font-weight: 900; font-size: 13px; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }

  /* Grid & Cards */
  .cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
  
  .cm-card { 
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 24px; padding: 28px; 
    animation: fadeUp 0.4s both; transition: 0.3s; display: flex; flex-direction: column;
    position: relative;
  }
  .cm-card:hover { border-color: #ccff00; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
  
  .cm-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .cm-author-avatar { 
    width: 44px; height: 44px; border-radius: 14px; background: #ccff00; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 18px; font-weight: 900; color: #000; flex-shrink: 0; 
  }
  .cm-author-name { font-size: 15px; font-weight: 800; color: #000; }
  .cm-date { font-size: 12px; color: #94A3B8; font-weight: 700; text-transform: uppercase; }
  
  .cm-card-title { font-size: 18px; font-weight: 900; color: #000; margin-bottom: 10px; line-height: 1.3; }
  .cm-card-preview { 
    font-size: 14px; color: #64748B; display: -webkit-box; -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical; overflow: hidden; line-height: 1.7; margin-bottom: 24px; flex: 1;
  }
  
  .cm-card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #F8FAFC; padding-top: 20px; }
  .cm-stat-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #000; font-weight: 800; background: #F8FAFC; padding: 6px 12px; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; }
  .cm-stat-item:hover { background: #ccff00; }
  
  .cm-action-btn { 
    display: flex; align-items: center; gap: 8px; background: #000; color: #ccff00; 
    border: none; border-radius: 12px; padding: 8px 16px; font-size: 12px; 
    font-weight: 900; cursor: pointer; transition: 0.3s;
  }
  .cm-action-btn:hover:not(:disabled) { transform: scale(1.05); }

  .pg-spinner { width: 30px; height: 30px; border: 3px solid #F1F5F9; border-top-color: #ccff00; border-radius: 50%; animation: spin .8s linear infinite; }

  @media(max-width:768px) {
    .pg-menu-btn { display: flex !important; }
    .pg-topbar { padding: 0 16px !important; }
    .cm-header-bar { flex-direction: column; align-items: stretch; }
    .cm-search-wrap { width: 100%; }
    .cm-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function CommunityPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [downloading, setDownloading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const sort = activeTab === "all" ? "popular" : activeTab;
    API.get(`/community/feed?sort=${sort}`)
      .then(({ data }) => setNotes(data?.notes || []))
      .catch(() => toast.error("Cloud sync failed"))
      .finally(() => setLoading(false));
  }, [activeTab, refreshKey]);

  const filtered = useMemo(() => {
    let result = [...notes];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(n => 
        (n.title || "").toLowerCase().includes(q) || 
        (n.user?.name || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, searchQ]);

  const subjects = useMemo(() => {
    const map = new Map();
    for (const n of filtered) {
      const key = n.subject || "General Hub";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    }
    return Array.from(map.keys()).map(k => ({ subject: k, items: map.get(k) }));
  }, [filtered]);

  const toggleLike = async (id) => {
    try {
      const { data } = await API.post(`/community/${id}/like`);
      setNotes(prev => prev.map(n => n._id === id ? { ...n, liked: data.liked, likesCount: data.likesCount } : n));
      setRefreshKey(k => k + 1);
    } catch { toast.error("Action failed"); }
  };

  const downloadNote = async (id) => {
    setDownloading(id);
    try {
      const { data } = await API.post(`/community/${id}/download`);
      setNotes(prev => prev.map(n => n._id === id ? { ...n, downloads: (n.downloads || 0) + 1 } : n));
      if (data?.fileUrl) window.open(data.fileUrl, "_blank");
      toast.success("Download Initiated");
    } catch { toast.error("Transfer failed"); }
    finally { setDownloading(null); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div style={{ padding: "8px", borderRadius: "10px", background: "#000" }}><Users size={18} color="#ccff00" /></div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>COMMUNITY <span style={{color: "#ccff00", background: "#000", padding: "2px 6px", borderRadius: "4px"}}>HUB</span></span>
        </div>

        <div className="pg-content">
          <div className="cm-header-bar">
            <div className="cm-tabs">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} className={`cm-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            <div className="cm-search-wrap">
              <Search size={18} color="#94A3B8" />
              <input className="cm-search" placeholder="Search knowledge..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>

            <button className="btn-neon" onClick={() => navigate("/notes?shareToCommunity=1")}>
              + SHARE KNOWLEDGE
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "120px 0" }}><div className="pg-spinner" /></div>
          ) : (
            <div style={{ display: "grid", gap: 50 }}>
              {subjects.map(({ subject, items }) => (
                <section key={subject}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>{subject}</h3>
                    <div style={{ flex: 1, height: "1px", background: "#F1F5F9" }}></div>
                    <span style={{ fontSize: 10, fontWeight: 900, background: "#000", color: "#ccff00", padding: "3px 10px", borderRadius: "6px" }}>{items.length} FILES</span>
                  </div>
                  
                  <div className="cm-grid">
                    {items.map((note, i) => (
                      <div key={note._id} className="cm-card" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="cm-card-header">
                          <div className="cm-author-avatar">{(note.user?.name || "U")[0]}</div>
                          <div>
                            <div className="cm-author-name">{note.user?.name || "Scholar"}</div>
                            <div className="cm-date">LOGGED {formatDate(note.createdAt)}</div>
                          </div>
                        </div>

                        <div className="cm-card-title">{note.title || "UNTITLED LOG"}</div>
                        <div className="cm-card-preview">{note.plainText || "Access full document for detailed knowledge insights..."}</div>

                        <div className="cm-card-footer">
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="cm-stat-item" onClick={() => toggleLike(note._id)}>
                              <Heart size={15} fill={note.liked ? "#000" : "none"} color={note.liked ? "#ccff00" : "#000"} />
                              {note.likesCount || 0}
                            </button>
                            <div className="cm-stat-item"><MessageCircle size={15} /> {note.commentsCount || 0}</div>
                          </div>

                          <div style={{ display: "flex", gap: 10 }}>
                            <button className="cm-stat-item" style={{background: note.saved ? "#ccff00" : "#F8FAFC"}} title="Save to Hub">
                                <Bookmark size={15} />
                            </button>
                            <button className="cm-action-btn" onClick={() => downloadNote(note._id)} disabled={downloading === note._id}>
                              {downloading === note._id ? <div className="pg-spinner" style={{width:14, height:14}} /> : <><Download size={14} /> ACCESS</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}