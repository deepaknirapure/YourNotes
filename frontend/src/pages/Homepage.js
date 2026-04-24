import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Star, Trash2, Folder, Tag, Bot, Users,
  CreditCard, Plus, Flame, FileText, Search, Menu,
  Home, Settings, LogOut, ChevronRight, ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const FEATURE_CARDS = [
  { icon: BookOpen,  title: "Dashboard",       desc: "Create, edit, search notes.",              path: "/dashboard",        color: "#4F46E5", bg: "rgba(79,70,229,.1)" },
  { icon: Star,      title: "Starred",          desc: "Quick access to important notes.",         path: "/starred",          color: "#f59e0b", bg: "rgba(245,158,11,.1)" },
  { icon: Folder,    title: "Folders",          desc: "Organize by subject or topic.",            path: "/folders",          color: "#10b981", bg: "rgba(16,185,129,.1)" },
  { icon: Tag,       title: "Tags",             desc: "Find notes by exam, topic, subject.",      path: "/tags",             color: "#8b5cf6", bg: "rgba(139,92,246,.1)" },
  { icon: CreditCard,title: "Flashcards",       desc: "Spaced repetition review system.",         path: "/flashcard-review", color: "#E55B2D", bg: "rgba(229,91,45,.1)" },
  { icon: Bot,       title: "Ask AI",           desc: "AI study buddy for any question.",         path: "/ask-ai",           color: "#06b6d4", bg: "rgba(6,182,212,.1)" },
  { icon: Users,     title: "Community",        desc: "Share & download notes.",                  path: "/community",        color: "#f43f5e", bg: "rgba(244,63,94,.1)" },
  { icon: Trash2,    title: "Trash",            desc: "Restore or permanently delete notes.",     path: "/trash",            color: "#6b7280", bg: "rgba(107,114,128,.1)" },
];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .hp-wrap{display:flex;height:100vh;overflow:hidden;background:#0a0a0a;}
  .hp-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .hp-topbar{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .hp-topbar-left{display:flex;align-items:center;gap:10px;}
  .hp-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;}
  .hp-search{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:7px 12px 7px 30px;font-size:13px;font-family:inherit;color:#fff;outline:none;width:220px;transition:border-color .15s;}
  .hp-search:focus{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.07);}
  .hp-search::placeholder{color:rgba(255,255,255,.2);}
  .hp-search-wrap{position:relative;display:flex;align-items:center;}
  .hp-search-wrap svg{position:absolute;left:9px;color:rgba(255,255,255,.3);pointer-events:none;}
  .hp-content{flex:1;overflow-y:auto;padding:24px;}
  .hp-greeting{margin-bottom:28px;animation:fadeUp .4s both;}
  .hp-greeting h1{font-size:22px;font-weight:700;letter-spacing:-.5px;color:#fff;margin-bottom:4px;}
  .hp-greeting p{font-size:13px;color:rgba(255,255,255,.4);}
  .hp-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
  .hp-stat{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;animation:fadeUp .35s both;transition:border-color .15s;}
  .hp-stat:hover{border-color:rgba(255,255,255,.13);}
  .hp-stat-icon{width:34px;height:34px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hp-stat-val{font-size:20px;font-weight:700;color:#fff;line-height:1;}
  .hp-stat-lbl{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;font-weight:500;}
  .hp-section-title{font-size:12px;font-weight:600;color:rgba(255,255,255,.35);letter-spacing:.05em;text-transform:uppercase;margin-bottom:12px;}
  .hp-feature-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:28px;}
  .hp-feature-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px;cursor:pointer;transition:border-color .15s,transform .12s,background .15s;animation:fadeUp .35s both;}
  .hp-feature-card:hover{border-color:rgba(255,255,255,.14);background:#161616;transform:translateY(-1px);}
  .hp-feature-icon{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
  .hp-feature-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;}
  .hp-feature-desc{font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;}
  .hp-recent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;}
  .hp-note-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px 16px;cursor:pointer;transition:border-color .15s,background .15s;animation:fadeUp .35s both;}
  .hp-note-card:hover{border-color:rgba(255,255,255,.14);background:#161616;}
  .hp-note-title{font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .hp-note-preview{font-size:12px;color:rgba(255,255,255,.35);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;}
  .hp-note-meta{display:flex;align-items:center;justify-content:space-between;margin-top:10px;}
  .hp-note-date{font-size:11px;color:rgba(255,255,255,.25);font-weight:500;}
  .hp-new-btn{display:flex;align-items:center;gap:6px;background:#E55B2D;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;}
  .hp-new-btn:hover{background:#d14e24;box-shadow:0 4px 14px rgba(229,91,45,.3);}
  .hp-spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  @media(max-width:900px){.hp-stats-row{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:768px){.hp-menu-btn{display:flex!important}.hp-search{width:160px!important}.hp-content{padding:16px;}}
`;

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([API.get("/dashboard"), API.get("/notes")])
      .then(([d, n]) => {
        setStats(d.data);
        setRecentNotes((n.data || []).filter(x => !x.isTrashed).slice(0, 8));
      })
      .catch(() => toast.error("Data load nahi ho saka"))
      .finally(() => setLoading(false));
  }, []);

  const createNote = async () => {
    setCreating(true);
    try {
      await API.post("/notes", { title: "Untitled Note", content: "" });
      navigate("/dashboard");
    } catch { toast.error("Note create nahi ho saka"); }
    finally { setCreating(false); }
  };

  const filteredRecent = searchQ.trim()
    ? recentNotes.filter(n => (n.title || "").toLowerCase().includes(searchQ.toLowerCase()))
    : recentNotes;

  const STATS = [
    { icon: FileText, label: "Total Notes",    val: stats.totalNotes,    color: "#4F46E5", bg: "rgba(79,70,229,.12)" },
    { icon: Star,     label: "Starred",        val: stats.starredNotes,  color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
    { icon: CreditCard,label: "Flashcards Due",val: stats.flashcardsDue, color: "#E55B2D", bg: "rgba(229,91,45,.12)" },
    { icon: Folder,   label: "Folders",        val: stats.totalFolders,  color: "#10b981", bg: "rgba(16,185,129,.12)" },
  ];

  return (
    <div className="hp-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      )}

      <div className="hp-main">
        <div className="hp-topbar">
          <div className="hp-topbar-left">
            <button className="hp-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div className="hp-search-wrap">
              <Search size={13} />
              <input className="hp-search" placeholder="Search notes..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
          </div>
          <button className="hp-new-btn" onClick={createNote} disabled={creating}>
            <Plus size={14} />
            {creating ? "Creating..." : "New Note"}
          </button>
        </div>

        <div className="hp-content">
          <div className="hp-greeting">
            <h1>Good {getGreeting()}, {user?.name?.split(" ")[0] || "Student"} 👋</h1>
            <p>Aaj kya padhna hai?</p>
          </div>

          <div className="hp-stats-row">
            {STATS.map(({ icon: Icon, label, val, color, bg }, i) => (
              <div key={i} className="hp-stat" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="hp-stat-icon" style={{ background: bg }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  {loading ? <div style={{ width: 32, height: 20, background: "rgba(255,255,255,.06)", borderRadius: 4 }} /> : <div className="hp-stat-val">{val}</div>}
                  <div className="hp-stat-lbl">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 28 }}>
            <div className="hp-section-title">Quick Access</div>
            <div className="hp-feature-grid">
              {FEATURE_CARDS.map((f, i) => (
                <div key={i} className="hp-feature-card" onClick={() => navigate(f.path)} style={{ animationDelay: `${0.2 + i * 0.04}s` }}>
                  <div className="hp-feature-icon" style={{ background: f.bg }}>
                    <f.icon size={15} color={f.color} />
                  </div>
                  <div className="hp-feature-title">{f.title}</div>
                  <div className="hp-feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {filteredRecent.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="hp-section-title">Recent Notes</div>
                <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#E55B2D", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="hp-recent-grid">
                {filteredRecent.map((note, i) => (
                  <div key={note._id} className="hp-note-card" onClick={() => navigate("/dashboard")} style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
                    <div className="hp-note-title">{note.title || "Untitled Note"}</div>
                    <div className="hp-note-preview">{note.plainText || "No content yet..."}</div>
                    <div className="hp-note-meta">
                      <span className="hp-note-date">{formatDate(note.updatedAt)}</span>
                      {note.isStarred && <Star size={11} color="#f59e0b" fill="#f59e0b" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <div className="hp-spinner" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
