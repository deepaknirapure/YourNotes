// Tagspage.js - Notes ke tags explore karne ka page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Search, Clock, Hash, Inbox, Menu } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }

  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }

  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* Top bar */
  .pg-topbar {
    height: 60px; display: flex; align-items: center; gap: 12px; padding: 0 24px;
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0;
  }
  .pg-menu-btn {
    display: none; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 10px; cursor: pointer; padding: 8px; color: #64748B;
    align-items: center; justify-content: center; min-width: 38px; height: 38px;
    transition: 0.15s; flex-shrink: 0;
  }
  .pg-menu-btn:hover { background: #FFF5F2; color: #E55B2D; border-color: #FFE4DB; }

  .pg-title-section { display: flex; align-items: center; gap: 10px; }
  .pg-title { font-size: 17px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; }

  .pg-search-wrap { position: relative; margin-left: auto; display: flex; align-items: center; }
  .pg-search-wrap svg { position: absolute; left: 12px; color: #94A3B8; pointer-events: none; }
  .pg-search {
    padding: 8px 12px 8px 36px; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 10px; font-size: 14px; font-family: inherit; color: #0F172A;
    outline: none; width: 220px; transition: 0.2s;
  }
  .pg-search:focus { border-color: #E55B2D; background: #FFF; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }

  /* Two-panel layout */
  .pg-content { flex: 1; overflow: hidden; display: flex; }

  /* Left: tags list */
  .tp-tags-panel {
    width: 260px; background: #FFF; border-right: 1px solid #E2E8F0;
    padding: 20px; overflow-y: auto; scrollbar-width: none; flex-shrink: 0;
  }
  .tp-tags-panel::-webkit-scrollbar { display: none; }

  .panel-label { font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }

  .tp-tag-chip {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    transition: 0.15s; border: 1px solid transparent; margin-bottom: 3px;
  }
  .tp-tag-chip:hover { background: #F8FAFC; }
  .tp-tag-chip.active { background: #FFF5F2; border-color: #FFE4DB; }

  .tp-tag-name { font-size: 14px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px; }
  .tp-tag-chip.active .tp-tag-name { color: #E55B2D; }
  .tp-tag-count { font-size: 11px; font-weight: 700; color: #94A3B8; background: #F1F5F9; padding: 2px 8px; border-radius: 100px; }
  .tp-tag-chip.active .tp-tag-count { color: #E55B2D; background: #FFF; }

  /* Right: notes grid */
  .tp-notes-panel { flex: 1; padding: 28px; overflow-y: auto; scrollbar-width: none; background: #FAFAFA; }
  .tp-notes-panel::-webkit-scrollbar { display: none; }
  .tp-notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }

  /* Note card */
  .tp-card {
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px;
    padding: 22px; cursor: pointer; transition: all 0.2s ease;
    animation: fadeUp 0.3s both; display: flex; flex-direction: column;
  }
  .tp-card:hover { border-color: #CBD5E1; box-shadow: 0 8px 20px rgba(0,0,0,0.04); transform: translateY(-2px); }

  .tp-card-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 8px; line-height: 1.4; }
  .tp-card-preview { font-size: 13px; color: #64748B; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; margin-bottom: 16px; flex: 1; }

  .tp-tag-pill-list { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 14px; }
  .tp-tag-pill { background: #F1F5F9; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #64748B; border: 1px solid #E2E8F0; }
  .tp-tag-pill.highlight { background: #FFF5F2; color: #E55B2D; border-color: #FFE4DB; }

  .tp-card-date { font-size: 12px; color: #94A3B8; font-weight: 600; display: flex; align-items: center; gap: 5px; }

  /* Empty states */
  .tp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; }
  .tp-empty-icon { width: 60px; height: 60px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #94A3B8; margin-bottom: 14px; }
  .tp-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .pg-menu-btn { display: flex !important; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-search { display: none; }
    .pg-search-wrap { display: none; }

    /* Two panels vertically stack karo */
    .pg-content { flex-direction: column !important; overflow-y: auto !important; padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)); }
    .tp-tags-panel {
      width: 100% !important; height: auto; max-height: 160px;
      border-right: none; border-bottom: 1px solid #E2E8F0;
      overflow-x: auto; overflow-y: hidden; display: flex; gap: 6px;
      padding: 12px 14px;
    }
    .panel-label { display: none; }
    /* Tags horizontal scroll on mobile */
    .tp-tags-panel > div {
      display: flex !important; flex-direction: row !important; gap: 6px;
      white-space: nowrap; padding-bottom: 4px;
    }
    .tp-tag-chip { white-space: nowrap; flex-shrink: 0; margin-bottom: 0 !important; }
    .tp-notes-panel { padding: 14px !important; }
    .tp-notes-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    .tp-card { padding: 16px !important; }
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

  // Tags ka map banao: tag => notes[]
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
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="pg-title-section">
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tag size={14} color="#64748B" />
            </div>
            <h1 className="pg-title">Tags</h1>
          </div>

          <div className="pg-search-wrap">
            <Search size={15} />
            <input className="pg-search" placeholder="Search tags..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <div className="tp-spinner" />
          </div>
        ) : allTags.length === 0 ? (
          <div className="tp-empty" style={{ flex: 1 }}>
            <div className="tp-empty-icon"><Hash size={26} /></div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>No tags yet</h3>
            <p style={{ fontSize: 14, color: "#64748B", maxWidth: 280 }}>Add #tags to your notes to see them organized here.</p>
          </div>
        ) : (
          <div className="pg-content">
            {/* Left: tags list */}
            <div className="tp-tags-panel">
              <div className="panel-label">All Tags</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filteredTags.map(tag => (
                  <div key={tag} className={`tp-tag-chip ${selectedTag === tag ? "active" : ""}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                    <span className="tp-tag-name"><Hash size={13} strokeWidth={selectedTag === tag ? 3 : 2} /> {tag}</span>
                    <span className="tp-tag-count">{tagMap[tag].length}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: notes for selected tag */}
            <div className="tp-notes-panel">
              {!selectedTag ? (
                <div className="tp-empty">
                  <div className="tp-empty-icon"><Inbox size={26} /></div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Select a tag</h3>
                  <p style={{ fontSize: 13, color: "#64748B" }}>Choose a tag to see related notes.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ padding: "4px 12px", background: "#FFF5F2", border: "1px solid #FFE4DB", borderRadius: "100px", color: "#E55B2D", fontSize: 13, fontWeight: 700 }}>
                      #{selectedTag}
                    </div>
                    <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>{displayedNotes.length} notes</span>
                  </div>

                  <div className="tp-notes-grid">
                    {displayedNotes.map((note, i) => (
                      <div key={note._id} className="tp-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${i * 0.03}s` }}>
                        <h3 className="tp-card-title">{note.title || "Untitled"}</h3>
                        <p className="tp-card-preview">{note.plainText || "No preview..."}</p>
                        <div className="tp-tag-pill-list">
                          {(note.tags || []).map((t, ti) => (
                            <span key={ti} className={`tp-tag-pill ${t === selectedTag ? "highlight" : ""}`}>#{t}</span>
                          ))}
                        </div>
                        <div className="tp-card-date">
                          <Clock size={11} />
                          {new Date(note.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
