import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, FileText, Search, ChevronRight, Menu, Hash, Clock, Inbox } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .pg-wrap { display: flex; height: 100vh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  
  /* Sleek Topbar */
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; gap: 16px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  .pg-title-section { display: flex; align-items: center; gap: 10px; }
  .pg-title { font-size: 18px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; }
  
  .pg-search-wrap { position: relative; margin-left: auto; display: flex; align-items: center; }
  .pg-search-wrap svg { position: absolute; left: 12px; color: #94A3B8; pointer-events: none; }
  .pg-search { 
    padding: 8px 12px 8px 36px; background: #F8FAFC; border: 1px solid #E2E8F0; 
    border-radius: 10px; font-size: 14px; font-family: inherit; color: #0F172A; 
    outline: none; width: 240px; transition: 0.2s; 
  }
  .pg-search:focus { border-color: #E55B2D; background: #FFF; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }

  /* Two-Panel Layout */
  .pg-content { flex: 1; overflow: hidden; display: flex; }
  
  /* Left Panel: Tags List */
  .tp-tags-panel { 
    width: 280px; background: #FFF; border-right: 1px solid #E2E8F0; 
    padding: 24px; overflow-y: auto; scrollbar-width: none;
  }
  .panel-label { font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  
  .tp-tag-chip { 
    display: flex; align-items: center; justify-content: space-between; 
    padding: 10px 14px; border-radius: 10px; cursor: pointer; 
    transition: 0.2s; border: 1px solid transparent; margin-bottom: 4px;
  }
  .tp-tag-chip:hover { background: #F8FAFC; }
  .tp-tag-chip.active { background: #FFF5F2; border-color: #FFE4DB; }
  
  .tp-tag-name { font-size: 14px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px; }
  .tp-tag-chip.active .tp-tag-name { color: #E55B2D; }
  
  .tp-tag-count { font-size: 11px; font-weight: 700; color: #94A3B8; background: #F1F5F9; padding: 2px 8px; border-radius: 100px; }
  .tp-tag-chip.active .tp-tag-count { color: #E55B2D; background: #FFF; }
  
  /* Right Panel: Notes Grid */
  .tp-notes-panel { flex: 1; padding: 32px 5vw; overflow-y: auto; scrollbar-width: none; background: #FAFAFA; }
  .tp-notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  
  /* Modern Note Card */
  .tp-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; 
    padding: 24px; cursor: pointer; transition: all 0.2s ease; 
    animation: fadeUp 0.3s both; display: flex; flex-direction: column;
  }
  .tp-card:hover { border-color: #CBD5E1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); transform: translateY(-2px); }
  
  .tp-card-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px; line-height: 1.4; }
  .tp-card-preview { 
    font-size: 14px; color: #64748B; display: -webkit-box; -webkit-line-clamp: 3; 
    -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; margin-bottom: 20px; flex: 1;
  }
  
  .tp-tag-pill-list { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .tp-tag-pill { 
    background: #F1F5F9; border-radius: 6px; padding: 2px 8px; 
    font-size: 11px; font-weight: 700; color: #64748B; border: 1px solid #E2E8F0; 
  }
  .tp-tag-pill.highlight { background: #FFF5F2; color: #E55B2D; border-color: #FFE4DB; }
  
  .tp-card-date { font-size: 12px; color: #94A3B8; font-weight: 600; display: flex; align-items: center; gap: 6px; }
  
  /* Empty States & Loaders */
  .tp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 24px; text-align: center; }
  .tp-empty-icon { width: 64px; height: 64px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #94A3B8; margin-bottom: 16px; }
  .tp-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) { 
    .pg-menu-btn { display: flex !important; } 
    .pg-content { flex-direction: column !important; }
    .tp-tags-panel { width: 100% !important; height: auto; max-height: 200px; border-right: none; border-bottom: 1px solid #E2E8F0; }
    .tp-notes-panel { padding: 24px 16px; }
    .tp-notes-grid { grid-template-columns: 1fr !important; }
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

  // Build tag map
  const tagMap = {};
  notes.forEach(note => {
    (note.tags || []).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(note);
    });
  });

  const allTags = Object.keys(tagMap).sort();
  const filteredTags = searchQ.trim() ? allTags.filter(t => t.toLowerCase().includes(searchQ.toLowerCase())) : allTags;
  const displayedNotes = selectedTag ? (tagMap[selectedTag] || []) : [];

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
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={14} color="#64748B" />
            </div>
            <h1 className="pg-title">Tag Explorer</h1>
          </div>
          
          <div className="pg-search-wrap">
            <Search size={16} />
            <input className="pg-search" placeholder="Search tags..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <div className="tp-spinner" />
          </div>
        ) : allTags.length === 0 ? (
          <div className="tp-empty" style={{ flex: 1 }}>
            <div className="tp-empty-icon"><Hash size={28} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>No tags found</h3>
            <p style={{ fontSize: 14, color: "#64748B", maxWidth: 300 }}>Add #tags to your notes in the workspace to see them organized here.</p>
          </div>
        ) : (
          <div className="pg-content">
            {/* Left Panel: Tags */}
            <div className="tp-tags-panel">
              <div className="panel-label">Collection</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filteredTags.map(tag => (
                  <div key={tag} className={`tp-tag-chip ${selectedTag === tag ? "active" : ""}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                    <span className="tp-tag-name"><Hash size={14} strokeWidth={selectedTag === tag ? 3 : 2} /> {tag}</span>
                    <span className="tp-tag-count">{tagMap[tag].length}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Notes */}
            <div className="tp-notes-panel">
              {!selectedTag ? (
                <div className="tp-empty">
                  <div className="tp-empty-icon"><Inbox size={28} /></div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Select a tag</h3>
                  <p style={{ fontSize: 13, color: "#64748B" }}>Choose a topic from the left to view related documents.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: '4px 12px', background: '#FFF5F2', border: '1px solid #FFE4DB', borderRadius: '100px', color: '#E55B2D', fontSize: 13, fontWeight: 700 }}>
                      #{selectedTag}
                    </div>
                    <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{displayedNotes.length} documents found</span>
                  </div>

                  <div className="tp-notes-grid">
                    {displayedNotes.map((note, i) => (
                      <div key={note._id} className="tp-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${i * 0.03}s` }}>
                        <h3 className="tp-card-title">{note.title || "Untitled Intelligence"}</h3>
                        <p className="tp-card-preview">{note.plainText || "No preview available..."}</p>
                        
                        <div className="tp-tag-pill-list">
                          {(note.tags || []).map((t, ti) => (
                            <span key={ti} className={`tp-tag-pill ${t === selectedTag ? "highlight" : ""}`}>
                              #{t}
                            </span>
                          ))}
                        </div>
                        
                        <div className="tp-card-date">
                          <Clock size={12} /> {formatDate(note.updatedAt)}
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
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}