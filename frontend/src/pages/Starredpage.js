import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ArrowLeft, FileText, Search, SortAsc, RefreshCw, BookOpen } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sn-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; cursor:pointer; animation:fadeUp .4s both; transition:border-color .2s,transform .2s,box-shadow .2s; }
  .sn-card:hover { border-color:rgba(245,158,11,.3); transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,.3); }
  .sn-star-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:6px; transition:all .2s; color:#f59e0b; }
  .sn-star-btn:hover { transform:scale(1.2); }
  .sn-search { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:11px; padding:11px 16px; color:#fff; font-size:14px; font-family:inherit; outline:none; transition:border-color .2s; width:100%; }
  .sn-search:focus { border-color:#f59e0b; }
  .sn-search::placeholder { color:rgba(255,255,255,.25); }
  .sn-tag { background:rgba(255,255,255,.07); border-radius:6px; padding:3px 8px; font-size:11px; color:rgba(255,255,255,.4); font-weight:500; }
`;

export default function StarredPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [unstarring, setUnstarring] = useState(null);

  useEffect(() => {
    loadStarred();
  }, []);

  useEffect(() => {
    let result = [...notes];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(n =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").replace(/<[^>]*>/g, "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "newest") result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    else if (sortBy === "oldest") result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    else if (sortBy === "title") result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    setFiltered(result);
  }, [notes, searchQ, sortBy]);

  const loadStarred = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes?starred=true");
      setNotes(data || []);
    } catch {
      toast.error("Starred notes load nahi ho sake");
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async (note, e) => {
    e.stopPropagation();
    setUnstarring(note._id);
    try {
      await API.patch(`/notes/${note._id}/star`);
      setNotes(prev => prev.filter(n => n._id !== note._id));
      toast.success("Star hata diya");
    } catch {
      toast.error("Update nahi ho saka");
    } finally {
      setUnstarring(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });

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
          <div style={{ background: "rgba(245,158,11,.12)", borderRadius: 12, padding: 10, color: "#f59e0b" }}>
            <Star size={24} fill="#f59e0b" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800 }}>Starred Notes</h1>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginTop: 2 }}>
              {notes.length} starred note{notes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search + Sort */}
        <div style={{ display: "flex", gap: 12, margin: "28px 0", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.25)" }} />
            <input className="sn-search" placeholder="Starred notes mein search karo..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 40 }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 11,
            padding: "11px 16px", color: "rgba(255,255,255,.7)", fontFamily: "inherit", fontSize: 14,
            cursor: "pointer", outline: "none"
          }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">A–Z</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: "#111", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,.07)", animation: "pulse 1.2s infinite" }}>
                <div style={{ width: "70%", height: 16, background: "#1a1a1a", borderRadius: 6, marginBottom: 12 }} />
                <div style={{ width: "100%", height: 12, background: "#1a1a1a", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: "60%", height: 12, background: "#1a1a1a", borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.04)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Star size={36} color="rgba(255,255,255,.12)" />
            </div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {searchQ ? "Koi result nahi mila" : "Koi Starred Note Nahi"}
            </h3>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14, marginBottom: 24 }}>
              {searchQ ? "Dusra search karo" : "Dashboard mein notes ke star icon pe click karo"}
            </p>
            {!searchQ && (
              <button onClick={() => navigate("/dashboard")} style={{
                background: "#E55B2D", border: "none", borderRadius: 10,
                padding: "10px 20px", color: "#fff", cursor: "pointer",
                fontSize: 14, fontFamily: "inherit", fontWeight: 600
              }}>
                Dashboard Pe Jao
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {filtered.map((note, i) => (
              <div key={note._id} className="sn-card" style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate("/dashboard")}>
                {/* Card Top */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ background: "rgba(245,158,11,.1)", borderRadius: 8, padding: 8, color: "#f59e0b" }}>
                    <FileText size={16} />
                  </div>
                  <button className="sn-star-btn" onClick={e => toggleStar(note, e)}>
                    {unstarring === note._id
                      ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                      : <Star size={16} fill="#f59e0b" />}
                  </button>
                </div>

                {/* Title */}
                <h3 style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 8, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {note.title || "Untitled Note"}
                </h3>

                {/* Preview */}
                {note.content && (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.6, marginBottom: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {note.content.replace(/<[^>]*>/g, "").slice(0, 150)}
                  </p>
                )}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {note.tags.slice(0, 3).map((tag, j) => (
                      <span key={j} className="sn-tag">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{formatDate(note.updatedAt)}</span>
                  {note.folder && <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", gap: 4 }}>
                    <BookOpen size={11} /> {note.folder?.name || ""}
                  </span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}