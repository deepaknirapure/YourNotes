import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, ArrowLeft, FileText, X, ChevronRight, Search, Hash } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const TAG_COLORS = [
  "rgba(229,91,45,.15)", "rgba(79,70,229,.15)", "rgba(16,185,129,.15)",
  "rgba(245,158,11,.15)", "rgba(139,92,246,.15)", "rgba(6,182,212,.15)",
  "rgba(244,63,94,.15)", "rgba(132,204,22,.15)",
];
const TAG_TEXT_COLORS = ["#E55B2D", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  .tg-tag-chip { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:99px; cursor:pointer; font-size:13px; font-weight:600; transition:transform .2s,box-shadow .2s; animation:fadeUp .4s both; border:1px solid transparent; }
  .tg-tag-chip:hover { transform:scale(1.05); box-shadow:0 4px 16px rgba(0,0,0,.3); }
  .tg-tag-chip.active { border-color:rgba(255,255,255,.2) !important; }
  .tg-note-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:13px; padding:16px 18px; cursor:pointer; animation:fadeUp .35s both; transition:border-color .2s,transform .15s; }
  .tg-note-card:hover { border-color:rgba(255,255,255,.15); transform:translateY(-2px); }
  .tg-search { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:11px; padding:10px 16px; color:#fff; font-size:14px; font-family:inherit; outline:none; width:100%; transition:border-color .2s; }
  .tg-search:focus { border-color:#8b5cf6; }
  .tg-search::placeholder { color:rgba(255,255,255,.25); }
`;

export default function TagsPage() {
  const navigate = useNavigate();
  const [allTags, setAllTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tagsRes, notesRes] = await Promise.all([
        API.get("/tags"),
        API.get("/notes"),
      ]);
      setAllTags(tagsRes.data || []);
      setNotes((notesRes.data || []).filter(n => !n.isTrashed));
    } catch {
      toast.error("Data load nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  // Get notes for selected tag
  const getNotesForTag = (tag) => notes.filter(n => (n.tags || []).includes(tag));

  // Filter tags by search
  const filteredTags = allTags.filter(t =>
    !searchQ.trim() || t.tag.toLowerCase().includes(searchQ.toLowerCase())
  );

  const selectedNotes = selectedTag ? getNotesForTag(selectedTag) : [];

  const formatDate = (d) => new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "short" });

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ background: "rgba(139,92,246,.12)", borderRadius: 12, padding: 10, color: "#8b5cf6" }}>
            <Tag size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800 }}>Tags</h1>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginTop: 2 }}>
              {allTags.length} unique tag{allTags.length !== 1 ? "s" : ""} — tag select karo notes dekhne ke liye
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", margin: "24px 0" }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.25)" }} />
          <input className="tg-search" placeholder="Tag dhundho..." value={searchQ}
            onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>

        {loading ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ width: 80 + i * 12, height: 36, background: "#1a1a1a", borderRadius: 99, animation: "pulse 1.2s infinite" }} />
            ))}
          </div>
        ) : allTags.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.04)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Hash size={36} color="rgba(255,255,255,.12)" />
            </div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Koi Tags Nahi Hain</h3>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14, marginBottom: 24 }}>
              Dashboard mein notes banate waqt tags add karo
            </p>
            <button onClick={() => navigate("/dashboard")} style={{
              background: "#E55B2D", border: "none", borderRadius: 10, padding: "10px 20px",
              color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600
            }}>
              Dashboard Pe Jao
            </button>
          </div>
        ) : (
          <>
            {/* Tag Cloud */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
              {selectedTag && (
                <button onClick={() => setSelectedTag(null)} className="tg-tag-chip active"
                  style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)", borderColor: "rgba(255,255,255,.15)" }}>
                  <X size={12} /> Sab
                </button>
              )}
              {filteredTags.map((tagObj, i) => {
                const isActive = selectedTag === tagObj.tag;
                const ci = i % TAG_COLORS.length;
                return (
                  <button key={tagObj.tag} className={`tg-tag-chip${isActive ? " active" : ""}`}
                    style={{
                      background: isActive ? TAG_COLORS[ci].replace(".15", ".3") : TAG_COLORS[ci],
                      color: TAG_TEXT_COLORS[ci],
                      borderColor: isActive ? TAG_TEXT_COLORS[ci] : "transparent",
                      animationDelay: `${i * 0.04}s`
                    }}
                    onClick={() => setSelectedTag(isActive ? null : tagObj.tag)}>
                    <Hash size={12} /> {tagObj.tag}
                    <span style={{ background: "rgba(255,255,255,.15)", borderRadius: 99, padding: "1px 7px", fontSize: 11 }}>{tagObj.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Tag Notes */}
            {selectedTag && (
              <div style={{ animation: "fadeUp .35s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700 }}>
                    <span style={{ color: "rgba(255,255,255,.4)", fontWeight: 400 }}>#</span>{selectedTag}
                    <span style={{ color: "rgba(255,255,255,.3)", fontSize: 14, fontWeight: 400, marginLeft: 8 }}>({selectedNotes.length} notes)</span>
                  </h2>
                </div>

                {selectedNotes.length === 0 ? (
                  <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 40, textAlign: "center", color: "rgba(255,255,255,.35)", fontSize: 14 }}>
                    Is tag ke koi notes nahi hain
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {selectedNotes.map((note, i) => (
                      <div key={note._id} className="tg-note-card" style={{ animationDelay: `${i * 0.05}s` }}
                        onClick={() => navigate("/dashboard")}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ background: "rgba(139,92,246,.12)", borderRadius: 8, padding: 8, color: "#8b5cf6", flexShrink: 0 }}>
                            <FileText size={15} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {note.title || "Untitled Note"}
                            </div>
                            {note.content && (
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {note.content.replace(/<[^>]*>/g, "").slice(0, 80)}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{formatDate(note.updatedAt)}</div>
                            {note.isStarred && <div style={{ color: "#f59e0b", fontSize: 13, marginTop: 2 }}>★</div>}
                          </div>
                          <ChevronRight size={14} color="rgba(255,255,255,.2)" />
                        </div>
                        {/* Other tags */}
                        {note.tags && note.tags.length > 1 && (
                          <div style={{ display: "flex", gap: 5, marginTop: 10, paddingLeft: 40, flexWrap: "wrap" }}>
                            {note.tags.filter(t => t !== selectedTag).slice(0, 4).map((t, j) => {
                              const ci = allTags.findIndex(x => x.tag === t) % TAG_COLORS.length;
                              return (
                                <span key={j} style={{ background: TAG_COLORS[ci >= 0 ? ci : j % TAG_COLORS.length], color: TAG_TEXT_COLORS[ci >= 0 ? ci : j % TAG_COLORS.length], borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>
                                  #{t}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All tags summary (when none selected) */}
            {!selectedTag && (
              <div style={{ background: "rgba(139,92,246,.05)", border: "1px solid rgba(139,92,246,.12)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, alignItems: "center" }}>
                <Tag size={15} color="#8b5cf6" />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
                  Koi bhi tag pe click karo us tag ke saare notes dekhne ke liye
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}