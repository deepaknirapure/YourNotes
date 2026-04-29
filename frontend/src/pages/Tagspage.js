import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Search, Clock, Hash, Inbox, Menu } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }

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

  .pg-search-wrap { position: relative; margin-left: auto; display: flex; align-items: center; }
  .pg-search-wrap svg { position: absolute; left: 14px; color: #94A3B8; pointer-events: none; }
  .pg-search {
    padding: 10px 16px 10px 42px; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 14px; font-size: 14px; font-weight: 700; color: #000;
    outline: none; width: 260px; transition: 0.3s;
  }
  .pg-search:focus { border-color: #000; background: #FFF; box-shadow: 0 0 15px rgba(0,0,0,0.05); }

  /* ── Content Layout ── */
  .pg-content { flex: 1; overflow: hidden; display: flex; }

  /* Left Panel (Tag list) */
  .tp-tags-panel {
    width: 280px; background: #F8FAFC; border-right: 1px solid #F1F5F9;
    padding: 24px; overflow-y: auto; scrollbar-width: none; flex-shrink: 0;
  }
  .panel-label { font-size: 10px; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; }

  .tp-tag-chip {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-radius: 14px; cursor: pointer;
    transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid transparent; margin-bottom: 6px;
    background: #FFF;
  }
  .tp-tag-chip:hover { border-color: #E2E8F0; transform: translateX(4px); }
  .tp-tag-chip.active { background: #000000; border-color: #000000; }

  .tp-tag-name { font-size: 14px; font-weight: 800; color: #000; display: flex; align-items: center; gap: 10px; }
  .tp-tag-chip.active .tp-tag-name { color: #ccff00; }
  .tp-tag-count { font-size: 11px; font-weight: 900; color: #94A3B8; background: #F1F5F9; padding: 3px 10px; border-radius: 100px; }
  .tp-tag-chip.active .tp-tag-count { color: #ccff00; background: #222; }

  /* Right Panel (Notes grid) */
  .tp-notes-panel { flex: 1; padding: 40px 5vw; overflow-y: auto; scrollbar-width: none; background: #FFFFFF; }
  .tp-notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

  /* Note card */
  .tp-card {
    background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 24px;
    padding: 28px; cursor: pointer; transition: 0.3s;
    animation: fadeUp 0.4s both; display: flex; flex-direction: column;
  }
  .tp-card:hover { border-color: #000; transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.04); }

  .tp-card-title { font-size: 17px; font-weight: 900; color: #000; margin-bottom: 10px; line-height: 1.3; }
  .tp-card-preview { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 20px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  .tp-tag-pill-list { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
  .tp-tag-pill { background: #000; color: #ccff00; border-radius: 8px; padding: 4px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
  .tp-tag-pill.dim { background: #F1F5F9; color: #64748B; }

  .tp-card-date { font-size: 11px; color: #94A3B8; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }

  .tp-spinner { width: 30px; height: 30px; border: 3px solid #F1F5F9; border-top-color: #ccff00; border-radius: 50%; animation: spin .7s linear infinite; }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .pg-menu-btn { display: flex !important; }
    .pg-topbar { padding: 0 16px; }
    .pg-search-wrap { display: none; }

    .pg-content { flex-direction: column; }
    .tp-tags-panel {
      width: 100%; height: auto; border-right: none; border-bottom: 1px solid #F1F5F9;
      display: flex; gap: 10px; padding: 16px; overflow-x: auto;
    }
    .panel-label { display: none; }
    .tp-tag-chip { white-space: nowrap; margin-bottom: 0; padding: 10px 16px; }
    .tp-notes-panel { padding: 24px 16px; }
    .tp-notes-grid { grid-template-columns: 1fr; }
  }
`;

export default function TagsPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    API.get("/notes")
      .then(({ data }) => setNotes((data || []).filter(n => !n.isTrashed)))
      .catch(() => toast.error("Sync failed"))
      .finally(() => setLoading(false));
  }, []);

  const tagMap = {};
  notes.forEach(note => {
    (note.tags || []).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(note);
    });
  });

  const allTags = Object.keys(tagMap).sort();
  const filteredTags = searchQ.trim()
    ? allTags.filter(t => t.toLowerCase().includes(searchQ.toLowerCase()))
    : allTags;
  const displayedNotes = selectedTag ? (tagMap[selectedTag] || []) : [];

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        {/* Top bar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="pg-title-icon"><Tag size={18} /></div>
            <h1 className="pg-title">Tags</h1>
          </div>

          <div className="pg-search-wrap">
            <Search size={18} />
            <input className="pg-search" placeholder="Filter index..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <div className="tp-spinner" />
          </div>
        ) : allTags.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <Hash size={60} color="#F1F5F9" style={{ marginBottom: 20 }} />
            <h3 style={{ color: '#94A3B8', fontWeight: 900 }}>NO CLUSTERS TAGGED</h3>
          </div>
        ) : (
          <div className="pg-content">
            {/* Left: tags list */}
            <div className="tp-tags-panel">
              <div className="panel-label">Indexed Meta</div>
              {filteredTags.map(tag => (
                <div key={tag} className={`tp-tag-chip ${selectedTag === tag ? "active" : ""}`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                  <span className="tp-tag-name"><Hash size={14} strokeWidth={3} /> {tag}</span>
                  <span className="tp-tag-count">{tagMap[tag].length}</span>
                </div>
              ))}
            </div>

            {/* Right: notes for selected tag */}
            <div className="tp-notes-panel">
              {!selectedTag ? (
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                  <Inbox size={50} color="#F1F5F9" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: '#CBD5E1', fontWeight: 900 }}>SELECT A FRAGMENT</h3>
                  <p style={{ color: '#E2E8F0', fontSize: 12, fontWeight: 700, marginTop: 8 }}>CHOOSE A TAG TO VIEW DATA NODES</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                    <div style={{ padding: "6px 16px", background: "#000", borderRadius: "10px", color: "#ccff00", fontSize: 13, fontWeight: 900 }}>
                      #{selectedTag.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }}></div>
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 900 }}>{displayedNotes.length} FRAGMENTS</span>
                  </div>

                  <div className="tp-notes-grid">
                    {displayedNotes.map((note, i) => (
                      <div key={note._id} className="tp-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${i * 0.05}s` }}>
                        <h3 className="tp-card-title">{note.title || "UNTITLED LOG"}</h3>
                        <p className="tp-card-preview">{note.plainText || "Data stream encrypted..."}</p>
                        <div className="tp-tag-pill-list">
                          {(note.tags || []).map((t, ti) => (
                            <span key={ti} className={`tp-tag-pill ${t === selectedTag ? "" : "dim"}`}>#{t}</span>
                          ))}
                        </div>
                        <div className="tp-card-date">
                          <Clock size={12} />
                          {new Date(note.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}