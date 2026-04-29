import { useState, useEffect, useMemo } from "react";
import { Users, Download, Search, Heart, Clock, TrendingUp, Globe, Menu, FileText } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "recent",    label: "Recent",    icon: Clock },
  { key: "popular",   label: "Popular",   icon: TrendingUp },
  { key: "all",       label: "All Notes", icon: Globe },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  
  /* Topbar */
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  .pg-content { flex: 1; overflow-y: auto; padding: 32px 5vw; scrollbar-width: none; }
  
  /* Header Section (Tabs + Search) */
  .cm-header-bar {
    display: flex; justify-content: space-between; align-items: center; 
    margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
  }
  
  /* Segmented Tabs */
  .cm-tabs { 
    display: flex; gap: 4px; background: #F1F5F9; border-radius: 10px; padding: 4px; 
  }
  .cm-tab { 
    padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; 
    font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; 
    align-items: center; justify-content: center; gap: 6px; color: #64748B; background: transparent;
  }
  .cm-tab.active { background: #FFF; color: #0F172A; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .cm-tab:not(.active):hover { color: #0F172A; }
  
  /* Search Wrapper */
  .cm-search-wrap { 
    position: relative; display: flex; align-items: center; background: #FFF; 
    border: 1px solid #E2E8F0; border-radius: 10px; padding: 0 12px; 
    width: 300px; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .cm-search-wrap:focus-within { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  .cm-search { 
    width: 100%; padding: 10px 8px; background: transparent; border: none; 
    font-size: 14px; font-weight: 500; color: #0F172A; outline: none; 
  }
  .cm-search::placeholder { color: #94A3B8; font-weight: 400; }
  
  /* Grid & Cards */
  .cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  
  .cm-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; 
    animation: fadeUp 0.3s both; transition: all 0.2s; display: flex; flex-direction: column;
  }
  .cm-card:hover { border-color: #CBD5E1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); transform: translateY(-2px); }
  
  /* Card Internals */
  .cm-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .cm-author-avatar { 
    width: 36px; height: 36px; border-radius: 10px; background: #FFF5F2; 
    border: 1px solid #FFE4DB; display: flex; align-items: center; justify-content: center; 
    font-size: 14px; font-weight: 700; color: #E55B2D; flex-shrink: 0; 
  }
  .cm-author-name { font-size: 14px; font-weight: 600; color: #0F172A; line-height: 1.2; }
  .cm-date { font-size: 12px; color: #64748B; font-weight: 500; }
  
  .cm-card-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cm-card-preview { 
    font-size: 14px; color: #64748B; display: -webkit-box; -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; margin-bottom: 24px; flex: 1;
  }
  
  .cm-card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #F1F5F9; padding-top: 16px; }
  .cm-stats { display: flex; align-items: center; gap: 16px; }
  .cm-stat-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748B; font-weight: 600; }
  
  /* Download Button */
  .cm-dl-btn { 
    display: flex; align-items: center; gap: 6px; background: #FFF; color: #0F172A; 
    border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 12px; font-size: 13px; 
    font-weight: 600; font-family: inherit; cursor: pointer; transition: 0.2s; 
  }
  .cm-dl-btn:hover:not(:disabled) { background: #F8FAFC; border-color: #CBD5E1; color: #E55B2D; }
  .cm-dl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* Empty & Loading States */
  .pg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 12px; text-align: center; }
  .pg-empty-icon { 
    width: 56px; height: 56px; background: #F8FAFC; border: 1px solid #E2E8F0; 
    border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #94A3B8; margin-bottom: 8px; 
  }
  .pg-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) {
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; min-width: 38px; height: 38px; align-items: center !important; justify-content: center !important; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content, .saas-main, .flashcard-wrap { padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important; padding-left: 16px !important; padding-right: 16px !important; } 
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; padding: 8px !important; min-width: 38px; min-height: 38px; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content { padding: 16px !important; } 
    .cm-header-bar { flex-direction: column; align-items: stretch; gap: 10px !important; }
    .cm-search-wrap { width: 100%; }
    .cm-grid { grid-template-columns: 1fr !important; gap: 12px !important; } 
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
      .catch(() => toast.error("Failed to load community notes"))
      .finally(() => setLoading(false));
  }, [activeTab, refreshKey]);

  const filtered = useMemo(() => {
    let result = [...notes];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(q) ||
          (n.user?.name || "").toLowerCase().includes(q) ||
          (n.subject || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, searchQ]);

  const subjects = useMemo(() => {
    const map = new Map();
    for (const n of filtered) {
      const key = n.subject || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    }
    const keys = Array.from(map.keys());
    keys.sort((a, b) => {
      const aSum = (map.get(a) || []).reduce((acc, x) => acc + (x.likesCount || 0), 0);
      const bSum = (map.get(b) || []).reduce((acc, x) => acc + (x.likesCount || 0), 0);
      return bSum - aSum;
    });
    return keys.map((k) => ({ subject: k, items: map.get(k) || [] }));
  }, [filtered]);

  const downloadNote = async (noteId) => {
    setDownloading(noteId);
    try {
      const { data } = await API.post(`/community/${noteId}/download`);
      setNotes((prev) =>
        prev.map((n) => (n._id === noteId ? { ...n, downloads: (n.downloads || 0) + 1 } : n))
      );
      if (data?.fileUrl) window.open(data.fileUrl, "_blank");
      toast.success("Download started");
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed");
    } finally { setDownloading(null); }
  };

  const toggleLike = async (noteId) => {
    try {
      const { data } = await API.post(`/community/${noteId}/like`);
      setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, liked: data.liked, likesCount: data.likesCount } : n)));
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to like note");
    }
  };

  const toggleSave = async (noteId) => {
    try {
      const { data } = await API.post(`/community/${noteId}/save`);
      setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, saved: data.saved, savesCount: data.savesCount } : n)));
      setRefreshKey((k) => k + 1);
      toast.success(data.saved ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Save failed");
    }
  };

  const addComment = async (noteId) => {
    const text = window.prompt("Add your comment");
    if (!text?.trim()) return;
    try {
      await API.post(`/community/${noteId}/comment`, { text });
      toast.success("Comment posted");
    } catch {
      toast.error("Comment failed");
    }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <div className="pg-main">
        {/* Sleek Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={14} color="#64748B" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>Community Hub</span>
          {!loading && (
            <span style={{ marginLeft: 6, padding: "2px 8px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "100px", fontSize: 12, color: "#64748B", fontWeight: 600 }}>
              {filtered.length} Notes
            </span>
          )}
        </div>

        <div className="pg-content">
          {/* Header Controls */}
          <div className="cm-header-bar">
            <div className="cm-tabs">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} className={`cm-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            <div className="cm-search-wrap">
              <Search size={16} color="#94A3B8" />
              <input 
                className="cm-search" 
                placeholder="Search notes or authors..."
                value={searchQ} 
                onChange={e => setSearchQ(e.target.value)} 
              />
            </div>

            <button
              className="btn-create"
              onClick={() => navigate("/notes?shareToCommunity=1")}
              style={{ background: "#0F172A", color: "#FFF", borderRadius: 10, padding: "10px 14px", fontWeight: 800, border: "none", cursor: "pointer" }}
              disabled={loading}
            >
              Add Your Notes
            </button>
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <div className="pg-spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon"><FileText size={24} /></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                {searchQ ? "No matching notes found" : "Community is empty"}
              </div>
              <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                {searchQ ? "Try a different search term" : "Be the first to share a note from your dashboard"}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 30 }}>
              {subjects.map(({ subject, items }) => (
                <section key={subject}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{subject}</h3>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}>
                      {items.length} notes
                    </span>
                  </div>
                  <div className="cm-grid">
                    {items.map((note, i) => (
                      <div key={note._id} className="cm-card" style={{ animationDelay: `${i * 0.03}s` }}>
                        <div className="cm-card-header">
                          <div className="cm-author-avatar">
                            {(note.user?.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="cm-author-name">{note.user?.name || "Anonymous Scholar"}</div>
                            <div className="cm-date">Shared on {formatDate(note.createdAt)}</div>
                          </div>
                        </div>

                        <div className="cm-card-title">{note.title || "Untitled"}</div>
                        <div className="cm-card-preview">{note.plainText || note.content || "No preview text available..."}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                          {note.likesCount || 0} likes • {note.commentsCount || 0} comments
                        </div>

                        <div className="cm-card-footer">
                          <div className="cm-stats">
                            <button
                              className="cm-stat-item"
                              title="Likes"
                              onClick={() => toggleLike(note._id)}
                              style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                            >
                              <Heart size={14} fill={note.liked ? "#E55B2D" : "none"} color={note.liked ? "#E55B2D" : "#64748B"} />{" "}
                              {note.likesCount || 0}
                            </button>
                            <span className="cm-stat-item" title="Downloads">
                              <Download size={14} /> {note.downloads || 0}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="cm-dl-btn" onClick={() => addComment(note._id)}>
                              Comment
                            </button>
                            <button className="cm-dl-btn" onClick={() => toggleSave(note._id)}>
                              {note.saved ? "Saved" : "Save"}
                            </button>
                            <button className="cm-dl-btn" onClick={() => downloadNote(note._id)} disabled={downloading === note._id}>
                              {downloading === note._id ? (
                                <div style={{ width: 14, height: 14, border: "2px solid #E2E8F0", borderTopColor: "#E55B2D", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                              ) : (
                                <Download size={14} />
                              )}
                              {downloading === note._id ? "Downloading..." : "Download"}
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
      {/* Mobile bottom navigation - sab pages pe consistent */}
      <MobileNav />
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}