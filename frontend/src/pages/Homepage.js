import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Star, Trash2, Folder, Tag, Bot, Users,
  CreditCard, Plus, ArrowRight, Flame, FileText,
  Search, Bell, User, ChevronRight, Zap, TrendingUp,
  Home, Settings, LogOut, Menu, X, MoreHorizontal, CheckCircle2, Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { icon: <Home size={16} />, label: "Overview", path: "/home" },
  { icon: <BookOpen size={16} />, label: "Dashboard", path: "/dashboard" },
  { icon: <Folder size={16} />, label: "Folders", path: "/folders" },
  { icon: <Star size={16} />, label: "Starred", path: "/starred" },
  { icon: <Tag size={16} />, label: "Tags", path: "/tags" },
  { icon: <CreditCard size={16} />, label: "Flashcards", path: "/flashcard-review" },
  { icon: <Bot size={16} />, label: "Ask AI", path: "/ask-ai" },
  { icon: <Users size={16} />, label: "Community", path: "/community" },
  { icon: <Trash2 size={16} />, label: "Trash", path: "/trash" },
];

const FEATURE_CARDS = [
  { icon: <BookOpen size={20} />, title: "Dashboard", desc: "All your notes organized in one place.", path: "/dashboard" },
  { icon: <Star size={20} />, title: "Starred Notes", desc: "Quickly access your most important notes.", path: "/starred" },
  { icon: <Folder size={20} />, title: "Folders", desc: "Organize subjects hierarchically.", path: "/folders" },
  { icon: <Bot size={20} />, title: "Ask AI", desc: "Your personal AI study assistant.", path: "/ask-ai" },
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
      setRecentNotes((notesRes.data || []).filter(n => !n.isTrashed).slice(0, 8));
    }).catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/dashboard?search=${encodeURIComponent(searchQ.trim())}`);
  };

  const timeAgo = (dateString) => {
    // A simple mock time-ago function for the Vercel look
    return "12m ago"; 
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#ededed", fontFamily: "'Inter', sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #000; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        
        .vercel-nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:6px; cursor:pointer; transition:background .15s, color .15s; color:#a1a1a1; font-size:14px; font-weight:400; text-decoration:none; margin-bottom: 2px; }
        .vercel-nav-item:hover { background:#111; color:#ededed; }
        .vercel-nav-item.active { background:#1a1a1a; color:#ededed; font-weight:500; }
        
        .vercel-card { background:#000; border:1px solid #333; border-radius:8px; padding:20px; cursor:pointer; transition:border-color .15s; }
        .vercel-card:hover { border-color:#666; }
        
        .vercel-input { background:#000; border:1px solid #333; border-radius:6px; padding:8px 12px; color:#ededed; font-size:14px; font-family:inherit; outline:none; width:100%; transition:border-color .15s; }
        .vercel-input:focus, .vercel-input:hover { border-color:#666; }
        .vercel-input::placeholder { color:#888; }
        
        .vercel-row { display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid #222; transition:background .15s; cursor:pointer; }
        .vercel-row:hover { background:#0a0a0a; }
        
        .vercel-btn-primary { background:#ededed; color:#000; border:1px solid #ededed; border-radius:6px; padding:8px 16px; font-size:14px; font-weight:500; cursor:pointer; transition:background .15s; display:flex; align-items:center; gap:8px; }
        .vercel-btn-primary:hover { background:#fff; }
        
        .vercel-btn-secondary { background:#000; color:#ededed; border:1px solid #333; border-radius:6px; padding:8px 16px; font-size:14px; font-weight:500; cursor:pointer; transition:border-color .15s; display:flex; align-items:center; gap:8px; }
        .vercel-btn-secondary:hover { border-color:#666; }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; }
        
        @media(max-width:768px){ .hn-sidebar { display:none !important; } .hn-main { padding:16px !important; } }
      `}</style>

      {/* Sidebar */}
      <div className={`hn-sidebar${sidebarOpen ? " open" : ""}`} style={{
        width: 260, background: "#000", borderRight: "1px solid #333",
        display: "flex", flexDirection: "column", padding: "16px 8px", flexShrink: 0,
      }}>
        {/* Workspace Selector (Like Vercel Scope) */}
        <div style={{ padding: "0 12px 24px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #333", marginBottom: 16, paddingBottom: 16 }}>
          <div style={{ width: 24, height: 24, background: "#ededed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 600, fontSize: 12 }}>{user?.name?.charAt(0) || "Y"}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#ededed" }}>{user?.name || "YourNotes"}</span>
          <div style={{ marginLeft: "auto", background: "#111", border: "1px solid #333", borderRadius: 4, padding: "2px 6px", fontSize: 11, color: "#a1a1a1" }}>Hobby</div>
        </div>

        {/* Search in sidebar */}
        <div style={{ padding: "0 8px 16px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input className="vercel-input" placeholder="Find..." style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 6, paddingTop: 6 }} />
            <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#222", border: "1px solid #444", borderRadius: 4, padding: "2px 4px", fontSize: 10, color: "#888" }}>F</div>
          </div>
        </div>

        {NAV_ITEMS.map(item => (
          <div key={item.path} className={`vercel-nav-item${window.location.pathname === item.path ? " active" : ""}`}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}>
            {item.icon} {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", borderTop: "1px solid #333", paddingTop: 16 }}>
          <div className="vercel-nav-item" onClick={() => navigate("/profile")}>
            <Settings size={16} /> Settings
          </div>
          <div className="vercel-nav-item" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut size={16} /> Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hn-main" style={{ flex: 1, padding: "0", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        
        {/* Top Header / Breadcrumbs */}
        <header style={{ padding: "16px 24px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#000", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#a1a1a1" }}>
            <BookOpen size={16} color="#ededed" />
            <span>your-notes</span>
            <span style={{ color: "#444" }}>/</span>
            <span style={{ color: "#ededed", fontWeight: 500 }}>Dashboard</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="vercel-btn-secondary" onClick={() => navigate("/ask-ai")}><Bot size={14}/> Ask AI</button>
            <button className="vercel-btn-primary" onClick={() => navigate("/dashboard")}><Plus size={16} /> New Note</button>
          </div>
        </header>

        <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          
          {/* Filters Bar (Like Vercel Branches/Authors/Environments) */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
              <input className="vercel-input" placeholder="Search notes..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <select className="vercel-input" style={{ width: "auto", appearance: "none", paddingRight: 32, backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23888\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center" }}>
              <option>All Folders</option>
              <option>Drafts</option>
              <option>Published</option>
            </select>
            <select className="vercel-input" style={{ width: "auto", appearance: "none", paddingRight: 32, backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23888\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center" }}>
              <option>All Tags</option>
              <option>Important</option>
            </select>
          </div>

          {/* Deployments-style Notes List */}
          <div style={{ border: "1px solid #333", borderRadius: 8, overflow: "hidden", background: "#000" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading notes...</div>
            ) : recentNotes.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#888" }}>
                <FileText size={32} style={{ marginBottom: 16, opacity: 0.5, margin: "0 auto" }} />
                <div style={{ fontSize: 14 }}>No notes found</div>
              </div>
            ) : recentNotes.map((note, i) => (
              <div key={note._id || i} className="vercel-row" onClick={() => navigate("/dashboard")}>
                
                {/* Col 1: Title & Environment */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#ededed", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    {note.title || "Untitled Note"}
                    {i === 0 && <span style={{ background: "#0070F3", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 12, fontWeight: 500 }}>Current</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                    Production <Clock size={12} />
                  </div>
                </div>

                {/* Col 2: Status */}
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ededed", fontSize: 13, marginBottom: 4 }}>
                    <span className="status-dot"></span> Ready
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>24s</div>
                </div>

                {/* Col 3: Branch / Folder */}
                <div style={{ flex: 2, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ededed", fontSize: 13, marginBottom: 4 }}>
                    <GitBranch size={14} color="#888" /> main
                  </div>
                  <div style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace" }}>
                    -o- {(note._id || "a1b2c3d4").slice(0,7)} <span style={{ fontFamily: "'Inter', sans-serif" }}>update</span>
                  </div>
                </div>

                {/* Col 4: Author & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {timeAgo(note.updatedAt)} by {user?.name?.split(" ")[0].toLowerCase() || "user"}
                  </div>
                  <div style={{ width: 24, height: 24, background: "#333", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <User size={14} color="#ededed" />
                  </div>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Quick Metrics / Features (Optional, matching minimal style) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 40 }}>
            {FEATURE_CARDS.map((card, i) => (
              <div key={i} className="vercel-card" onClick={() => navigate(card.path)}>
                <div style={{ color: "#ededed", marginBottom: 12 }}>{card.icon}</div>
                <div style={{ fontWeight: 500, fontSize: 14, color: "#ededed", marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{card.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}