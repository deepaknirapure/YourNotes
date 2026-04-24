import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, FileText, Search, ChevronRight, Menu } from "lucide-react";
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
  .pg-topbar{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .pg-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .pg-title{font-size:14px;font-weight:600;color:#fff;}
  .pg-search-wrap{position:relative;margin-left:auto;display:flex;align-items:center;}
  .pg-search-wrap svg{position:absolute;left:9px;color:rgba(255,255,255,.3);pointer-events:none;}
  .pg-search{padding:7px 12px 7px 30px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:6px;font-size:13px;font-family:inherit;color:#fff;outline:none;width:200px;transition:border-color .15s;}
  .pg-search:focus{border-color:rgba(255,255,255,.15);}
  .pg-search::placeholder{color:rgba(255,255,255,.2);}
  .pg-content{flex:1;overflow-y:auto;padding:20px;display:flex;gap:20px;}
  .tp-tags-panel{width:240px;flex-shrink:0;}
  .tp-notes-panel{flex:1;min-width:0;}
  .tp-tag-chip{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:7px;cursor:pointer;transition:background .12s;border:1px solid transparent;}
  .tp-tag-chip:hover{background:rgba(255,255,255,.05);}
  .tp-tag-chip.active{background:rgba(229,91,45,.1);border-color:rgba(229,91,45,.25);}
  .tp-tag-name{font-size:13px;font-weight:500;color:rgba(255,255,255,.7);}
  .tp-tag-chip.active .tp-tag-name{color:#E55B2D;}
  .tp-tag-count{font-size:11px;font-weight:600;color:rgba(255,255,255,.25);background:rgba(255,255,255,.06);border-radius:4px;padding:1px 6px;}
  .tp-tag-chip.active .tp-tag-count{color:#E55B2D;background:rgba(229,91,45,.15);}
  .tp-notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;}
  .tp-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px;cursor:pointer;animation:fadeUp .3s both;transition:border-color .15s,background .15s;}
  .tp-card:hover{border-color:rgba(255,255,255,.14);background:#161616;}
  .tp-card-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .tp-card-preview{font-size:12px;color:rgba(255,255,255,.35);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;margin-bottom:10px;}
  .tp-card-date{font-size:11px;color:rgba(255,255,255,.22);}
  .tp-tag-pill{display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,.06);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:500;color:rgba(255,255,255,.35);margin:0 3px 4px 0;}
  .tp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:10px;text-align:center;}
  .tp-empty-icon{width:44px;height:44px;background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);margin-bottom:4px;}
  .tp-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-content{flex-direction:column!important;padding:14px;}.tp-tags-panel{width:100%!important}.tp-notes-grid{grid-template-columns:1fr!important}}
`;

export default function TagsPage() {
  const navigate = useNavigate();
  const [notes, setNotes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQ, setSearchQ]       = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    API.get("/notes")
      .then(({ data }) => setNotes((data || []).filter(n => !n.isTrashed)))
      .catch(() => toast.error("Notes load nahi ho sake"))
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
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <Tag size={15} color="rgba(255,255,255,.5)" />
          <span className="pg-title">Tags <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>({allTags.length})</span></span>
          <div className="pg-search-wrap">
            <Search size={13} />
            <input className="pg-search" placeholder="Search tags..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <div className="tp-spinner" />
          </div>
        ) : allTags.length === 0 ? (
          <div className="tp-empty" style={{ flex: 1 }}>
            <div className="tp-empty-icon"><Tag size={20} /></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>Koi tag nahi hai</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>Notes mein tags add karein</div>
          </div>
        ) : (
          <div className="pg-content">
            <div className="tp-tags-panel">
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>All Tags</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {filteredTags.map(tag => (
                  <div key={tag} className={`tp-tag-chip${selectedTag === tag ? " active" : ""}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                    <span className="tp-tag-name">#{tag}</span>
                    <span className="tp-tag-count">{tagMap[tag].length}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tp-notes-panel">
              {!selectedTag ? (
                <div className="tp-empty">
                  <div className="tp-empty-icon"><Tag size={20} /></div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Tag select karein notes dekhne ke liye</div>
                </div>
              ) : displayedNotes.length === 0 ? (
                <div className="tp-empty">
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Is tag mein koi note nahi</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.35)", marginBottom: 12 }}>
                    #{selectedTag} · {displayedNotes.length} notes
                  </div>
                  <div className="tp-notes-grid">
                    {displayedNotes.map((note, i) => (
                      <div key={note._id} className="tp-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${i * 0.03}s` }}>
                        <div className="tp-card-title">{note.title || "Untitled Note"}</div>
                        <div className="tp-card-preview">{note.plainText || "No content..."}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 8 }}>
                          {(note.tags || []).map((t, ti) => (
                            <span key={ti} className="tp-tag-pill" style={{ color: t === selectedTag ? "#E55B2D" : undefined, background: t === selectedTag ? "rgba(229,91,45,.12)" : undefined }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                        <div className="tp-card-date">{formatDate(note.updatedAt)}</div>
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
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}
