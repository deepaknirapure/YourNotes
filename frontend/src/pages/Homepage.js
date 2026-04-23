import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Star, Trash2, Folder, Tag, Bot, Users,
  CreditCard, Plus, ArrowRight, Flame, FileText,
  Search, Bell, User, ChevronRight, Zap, TrendingUp,
  Home, Settings, LogOut, Menu, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { icon: <Home size={18} />, label: "Home", path: "/home" },
  { icon: <BookOpen size={18} />, label: "Dashboard", path: "/dashboard" },
  { icon: <Star size={18} />, label: "Starred", path: "/starred" },
  { icon: <Folder size={18} />, label: "Folders", path: "/folders" },
  { icon: <Tag size={18} />, label: "Tags", path: "/tags" },
  { icon: <Trash2 size={18} />, label: "Trash", path: "/trash" },
  { icon: <CreditCard size={18} />, label: "Flashcards", path: "/flashcard-review" },
  { icon: <Bot size={18} />, label: "Ask AI", path: "/ask-ai" },
  { icon: <Users size={18} />, label: "Community", path: "/community" },
];

const FEATURE_CARDS = [
  {
    icon: <BookOpen size={28} />,
    title: "Dashboard",
    desc: "Saare notes ek jagah. Create, edit, search karo apni speed se.",
    path: "/dashboard",
    color: "#4F46E5",
    bg: "rgba(79,70,229,0.1)",
  },
  {
    icon: <Star size={28} />,
    title: "Starred Notes",
    desc: "Important notes quickly access karo — sirf ek click mein.",
    path: "/starred",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: <Folder size={28} />,
    title: "Folders",
    desc: "Notes ko subjects aur topics ke hisaab se organize karo.",
    path: "/folders",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    icon: <Tag size={28} />,
    title: "Tags",
    desc: "Tags se notes dhundho — exam, topic, subject ke basis pe.",
    path: "/tags",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  {
    icon: <CreditCard size={28} />,
    title: "Flashcard Review",
    desc: "Spaced repetition se yaad karo — smart review system.",
    path: "/flashcard-review",
    color: "#E55B2D",
    bg: "rgba(229,91,45,0.1)",
  },
  {
    icon: <Bot size={28} />,
    title: "Ask AI",
    desc: "Koi bhi sawaal poochho — AI tumhara study buddy hai.",
    path: "/ask-ai",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
  },
  {
    icon: <Users size={28} />,
    title: "Community",
    desc: "Notes share karo, doosron ke notes download karo.",
    path: "/community",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
  },
  {
    icon: <Trash2 size={28} />,
    title: "Trash",
    desc: "Delete kiye notes wapas lao ya permanently hatao.",
    path: "/trash",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
  },
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    Promise.all([
      API.get("/dashboard"),
      API.get("/notes"),
    ]).then(([dashRes, notesRes]) => {
      setStats(dashRes.data);
      setRecentNotes((notesRes.data || []).filter(n => !n.isTrashed).slice(0, 5));
    }).catch(() => toast.error("Data load nahi ho saka"))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/dashboard?search=${encodeURIComponent(searchQ.trim())}`);
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const STAT_TILES = [
    { label: "Total Notes", value: stats.totalNotes, icon: <FileText size={20} />, color: "#4F46E5" },
    { label: "Starred", value: stats.starredNotes, icon: <Star size={20} />, color: "#f59e0b" },
    { label: "Folders", value: stats.totalFolders, icon: <Folder size={20} />, color: "#10b981" },
    { label: "Cards Due", value: stats.flashcardsDue, icon: <Flame size={20} />, color: "#E55B2D" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
        .hn-nav-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; cursor:pointer; transition:background .2s,color .2s; color:rgba(255,255,255,.5); font-size:14px; font-weight:500; text-decoration:none; }
        .hn-nav-item:hover, .hn-nav-item.active { background:rgba(229,91,45,.12); color:#E55B2D; }
        .hn-feature-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:24px; cursor:pointer; transition:border-color .2s,transform .2s,box-shadow .2s; animation: fadeUp .5s both; }
        .hn-feature-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,.4); }
        .hn-stat-tile { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; flex:1; min-width:0; }
        .hn-recent-row { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:10px; cursor:pointer; transition:background .15s; }
        .hn-recent-row:hover { background:rgba(255,255,255,.04); }
        .hn-search-bar { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:12px 16px; color:#fff; font-size:15px; font-family:inherit; outline:none; width:100%; transition:border-color .2s; }
        .hn-search-bar:focus { border-color:#E55B2D; }
        .hn-search-bar::placeholder { color:rgba(255,255,255,.3); }
        @media(max-width:768px){ .hn-sidebar { display:none !important; } .hn-sidebar.open { display:flex !important; position:fixed; top:0; left:0; height:100vh; z-index:100; } .hn-main { padding:16px !important; } .hn-grid { grid-template-columns:1fr 1fr !important; } }
      `}</style>

      {/* Sidebar */}
      <div className={`hn-sidebar${sidebarOpen ? " open" : ""}`} style={{
        width: 240, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,.07)",
        display: "flex", flexDirection: "column", padding: "24px 12px", gap: 4, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 12px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#E55B2D", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>YourNotes</span>
        </div>

        {NAV_ITEMS.map(item => (
          <div key={item.path} className={`hn-nav-item${window.location.pathname === item.path ? " active" : ""}`}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}>
            {item.icon} {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16 }}>
          <div className="hn-nav-item" onClick={() => navigate("/profile")}>
            <User size={18} /> Profile
          </div>
          <div className="hn-nav-item" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut size={18} /> Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hn-main" style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", display: "none" }}
            className="hn-menu-btn">
            <Menu size={22} />
          </button>
          <div>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginBottom: 4 }}>{greet()},</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>
              {user?.name?.split(" ")[0] || "Student"} 👋
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/profile")} style={{
              background: "rgba(255,255,255,.07)", border: "none", borderRadius: 10,
              padding: "8px 16px", color: "rgba(255,255,255,.7)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: "inherit"
            }}>
              <User size={15} /> Profile
            </button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: 32, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)" }} />
          <input className="hn-search-bar" placeholder="Notes dhundho..." value={searchQ}
            onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 44 }} />
        </form>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 40, flexWrap: "wrap" }}>
          {STAT_TILES.map((s, i) => (
            <div key={i} className="hn-stat-tile" style={{ animationDelay: `${i * 0.07}s`, animation: "fadeUp .5s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: `rgba(${s.color === "#4F46E5" ? "79,70,229" : s.color === "#f59e0b" ? "245,158,11" : s.color === "#10b981" ? "16,185,129" : "229,91,45"},.15)`, borderRadius: 8, padding: 8, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 28, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                {loading ? <span style={{ animation: "pulse 1s infinite", display: "block", width: 40, height: 28, background: "#1a1a1a", borderRadius: 6 }} /> : s.value}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#fff" }}>
            Saare Features
          </h2>
          <div className="hn-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {FEATURE_CARDS.map((card, i) => (
              <div key={i} className="hn-feature-card" onClick={() => navigate(card.path)}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                <div style={{ background: card.bg, borderRadius: 12, padding: 12, width: "fit-content", color: card.color, marginBottom: 14 }}>
                  {card.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#fff" }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>{card.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, color: card.color, fontSize: 13, fontWeight: 600 }}>
                  Open <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notes */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>Recent Notes</h2>
            <button onClick={() => navigate("/dashboard")} style={{
              background: "none", border: "none", color: "#E55B2D", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4
            }}>
              Sab dekho <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, background: "#1a1a1a", borderRadius: 8, animation: "pulse 1s infinite" }} />
                  <div>
                    <div style={{ width: 180, height: 14, background: "#1a1a1a", borderRadius: 4, marginBottom: 6, animation: "pulse 1s infinite" }} />
                    <div style={{ width: 100, height: 12, background: "#1a1a1a", borderRadius: 4, animation: "pulse 1s infinite" }} />
                  </div>
                </div>
              ))
            ) : recentNotes.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 14 }}>
                <FileText size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div>Abhi koi notes nahi hain</div>
                <button onClick={() => navigate("/dashboard")} style={{
                  marginTop: 12, background: "#E55B2D", border: "none", borderRadius: 8,
                  padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit"
                }}>
                  Pehla note banao
                </button>
              </div>
            ) : recentNotes.map((note, i) => (
              <div key={note._id} className="hn-recent-row"
                style={{ borderBottom: i < recentNotes.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}
                onClick={() => navigate("/dashboard")}>
                <div style={{ width: 36, height: 36, background: "rgba(229,91,45,.12)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#E55B2D", flexShrink: 0 }}>
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {note.title || "Untitled Note"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                    {new Date(note.updatedAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })}
                    {note.isStarred && <span style={{ marginLeft: 8, color: "#f59e0b" }}>★</span>}
                  </div>
                </div>
                <ChevronRight size={14} color="rgba(255,255,255,.2)" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/dashboard")} style={{
            background: "#E55B2D", border: "none", borderRadius: 12, padding: "12px 20px",
            color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <Plus size={16} /> Naya Note
          </button>
          <button onClick={() => navigate("/ask-ai")} style={{
            background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.3)", borderRadius: 12,
            padding: "12px 20px", color: "#06b6d4", cursor: "pointer", fontFamily: "inherit",
            fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8
          }}>
            <Bot size={16} /> AI se Poochho
          </button>
          <button onClick={() => navigate("/flashcard-review")} style={{
            background: "rgba(229,91,45,.1)", border: "1px solid rgba(229,91,45,.3)", borderRadius: 12,
            padding: "12px 20px", color: "#E55B2D", cursor: "pointer", fontFamily: "inherit",
            fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8
          }}>
            <Flame size={16} /> Flashcards Review
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 99 }} />}
    </div>
  );
}