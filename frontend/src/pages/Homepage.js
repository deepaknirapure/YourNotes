import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Star, Globe, ChevronRight, Brain, Folder, Zap, Menu, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .home-root { display: flex; height: 100dvh; background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; }
  .home-main { flex: 1; overflow-y: auto; scrollbar-width: none; min-width: 0; }
  .home-main::-webkit-scrollbar { display: none; }

  .home-topbar {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .menu-btn { display: none; background: transparent; border: 1px solid var(--border); border-radius: 7px; cursor: pointer; padding: 7px; color: var(--text-muted); align-items: center; justify-content: center; transition: 0.15s; }
  .menu-btn:hover { border-color: #f97316; color: #f97316; }
  .page-title { font-size: 14px; font-weight: 800; color: var(--text); }
  .user-greet { font-size: 12px; color: var(--text-light); font-weight: 500; }

  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 9px; padding: 7px 14px; width: 240px; transition: 0.18s;
  }
  .search-bar:focus-within { border-color: #f97316; background: var(--surface); }
  .search-bar input { border: none; outline: none; background: transparent; font-size: 13px; font-weight: 500; color: var(--text); font-family: inherit; width: 100%; }
  .search-bar input::placeholder { color: #c8c5be; }

  .home-body { padding: 28px 32px; }

  /* Hero */
  .hero-banner {
    background: #1a1a1a; border-radius: 20px; padding: 40px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; overflow: hidden; animation: fadeUp 0.4s both;
  }
  .hero-deco { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%); top: -80px; right: -80px; }
  .hero-deco2 { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%); bottom: -60px; left: 200px; }
  .hero-text { position: relative; z-index: 1; }
  .hero-eyebrow { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .hero-title { font-size: clamp(24px, 3vw, 36px); font-weight: 900; color: #fff; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 20px; }
  .hero-title em { color: #f97316; font-style: normal; }
  .hero-actions { display: flex; gap: 12px; }
  .btn-hero-primary { background: #f97316; color: #fff; border: none; border-radius: 9px; padding: 10px 20px; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit; display: flex; align-items: center; gap: 7px; }
  .btn-hero-primary:hover { background: #ea6c0a; box-shadow: 0 4px 16px rgba(249,115,22,0.35); }
  .btn-hero-secondary { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.12); border-radius: 9px; padding: 9px 18px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit; }
  .btn-hero-secondary:hover { background: rgba(255,255,255,0.12); }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; animation: fadeUp 0.35s both; transition: 0.2s; }
  .stat-card:hover { border-color: #d0cdc6; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .stat-val { font-size: 28px; font-weight: 900; color: var(--text); letter-spacing: -1px; line-height: 1; margin-bottom: 4px; }
  .stat-lbl { font-size: 12px; font-weight: 600; color: var(--text-light); }

  /* Recent */
  .section-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .section-title { font-size: 14px; font-weight: 800; color: var(--text); }
  .section-link { font-size: 12px; font-weight: 600; color: var(--text-muted); text-decoration: none; display: flex; align-items: center; gap: 4px; cursor: pointer; background: none; border: none; font-family: inherit; }
  .section-link:hover { color: #f97316; }

  .recent-list { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .recent-item {
    padding: 16px 20px; border-bottom: 1px solid #f0ede8; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; transition: 0.15s;
  }
  .recent-item:last-child { border-bottom: none; }
  .recent-item:hover { background: #faf9f7; }
  .recent-dot { width: 8px; height: 8px; border-radius: 50%; background: #f97316; flex-shrink: 0; }
  .recent-title { font-size: 14px; font-weight: 700; color: var(--text); }
  .recent-date { font-size: 12px; color: var(--text-light); font-weight: 500; margin-top: 2px; }

  @media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px) {
    .menu-btn { display: flex; }
    .search-bar { display: none; }
    .home-body { padding: 16px; padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .hero-banner { padding: 28px; }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const { isDark } = useTheme(); // Hindi: theme change hone par re-render trigger hoga
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, publicNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0, streakCount: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get('/dashboard').then(res => {
      const d = res.data || {};
      setStats({ totalNotes: d.totalNotes || 0, publicNotes: d.publicNotes || 0, starredNotes: d.starredNotes || 0, flashcardsDue: d.flashcardsDue || 0, totalFolders: d.totalFolders || 0, streakCount: d.goals?.currentStreak || 0 });
    }).catch(() => {});
    API.get('/notes').then(res => setRecent((res.data || []).slice(0, 5))).catch(() => {});
  }, []);

  const STATS = [
    { lbl: 'Total Notes',  val: stats.totalNotes,    icon: FileText, bg: 'rgba(249,115,22,0.1)',   color: '#f97316' },
    { lbl: 'Community',    val: stats.publicNotes,   icon: Globe,    bg: 'rgba(139,92,246,0.1)',   color: '#8b5cf6' },
    { lbl: 'Starred',      val: stats.starredNotes,  icon: Star,     bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b' },
    { lbl: 'Day Streak',   val: stats.streakCount,   icon: Zap,      bg: 'rgba(16,185,129,0.1)',   color: '#10b981' },
  ];

  return (
    <div className="home-root">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="home-main">
        <header className="home-topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div>
              <div className="page-title">Overview</div>
              <div className="user-greet">Hello, {user?.name?.split(' ')[0] || 'there'} 👋</div>
            </div>
          </div>
          <div className="search-bar">
            <Search size={14} color="#b0ada6" />
            <input placeholder="Search anything..." />
          </div>
        </header>

        <div className="home-body">
          <div className="hero-banner">
            <div className="hero-deco" /><div className="hero-deco2" />
            <div className="hero-text">
              <div className="hero-eyebrow">Your workspace</div>
              <h2 className="hero-title">Master your <em>knowledge</em>.<br />Ace your exams.</h2>
              <div className="hero-actions">
                <button className="btn-hero-primary" onClick={() => navigate('/ask-ai')}>
                  <Plus size={16} /> Ask AI
                </button>
                <button className="btn-hero-secondary" onClick={() => navigate('/dashboard')}>
                  View all notes
                </button>
              </div>
            </div>
          </div>

          <div className="stats-row">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                  <s.icon size={17} />
                </div>
                <div className="stat-val">{s.val}</div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="section-row">
            <span className="section-title">Recent Notes</span>
            <button className="section-link" onClick={() => navigate('/dashboard')}>
              View all <ChevronRight size={13} />
            </button>
          </div>

          <div className="recent-list">
            {recent.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#b0ada6', fontSize: 14 }}>No notes yet — create your first one!</div>
            ) : recent.map((note, i) => (
              <div key={i} className="recent-item" onClick={() => navigate('/dashboard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="recent-dot" />
                  <div>
                    <div className="recent-title">{note.title || 'Untitled Note'}</div>
                    <div className="recent-date">Updated {new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                <ArrowUpRight size={15} color="#b0ada6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
