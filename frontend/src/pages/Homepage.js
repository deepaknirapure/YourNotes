import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Star, Globe, Zap, ArrowUpRight, Clock, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

// Hindi: Dashboard/Home page — user ke notes, stats, aur recent activity

const STYLES = `
  .home-root{display:flex;height:100vh;height:100dvh;background:var(--bg);font-family:var(--font,'DM Sans',sans-serif);}

  /* Hindi: Hero greeting section */
  .home-greeting{margin-bottom:28px;}
  .home-greeting-name{font-size:clamp(22px,3vw,28px);font-weight:800;color:var(--text);letter-spacing:-0.8px;margin-bottom:4px;}
  .home-greeting-sub{font-size:14px;color:var(--text-3);}

  /* Hindi: Stats bento grid */
  .home-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;transition:all 0.18s;}
  .stat-card:hover{border-color:var(--accent);box-shadow:0 4px 14px var(--accent-ring);transform:translateY(-1px);}
  .stat-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
  .stat-value{font-size:28px;font-weight:900;color:var(--text);letter-spacing:-1.5px;line-height:1;margin-bottom:4px;}
  .stat-label{font-size:12px;font-weight:600;color:var(--text-3);}

  /* Hindi: Recent notes list */
  .recent-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;}
  .recent-item{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);transition:background 0.15s;cursor:pointer;}
  .recent-item:last-child{border-bottom:none;}
  .recent-item:hover{background:var(--bg);}
  .recent-item-left{display:flex;align-items:center;gap:12px;}
  .recent-note-icon{width:36px;height:36px;border-radius:9px;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .recent-note-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px;}
  .recent-note-meta{font-size:11.5px;color:var(--text-4);display:flex;align-items:center;gap:4px;}

  /* Hindi: Quick actions row */
  .quick-actions{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;}
  .qa-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-family:var(--font,'DM Sans',sans-serif);font-size:13.5px;font-weight:700;color:var(--text-2);cursor:pointer;transition:all 0.15s;}
  .qa-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light);}
  .qa-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);}
  .qa-btn-primary:hover{background:var(--accent-dark);color:#fff;border-color:var(--accent-dark);}

  @media(max-width:768px){
    .home-stats{grid-template-columns:repeat(2,1fr);}
    .quick-actions{gap:8px;}
    .qa-btn{padding:9px 14px;font-size:13px;}
  }
  @media(max-width:400px){
    .home-stats{grid-template-columns:1fr 1fr;}
    .stat-card{padding:16px;}
    .stat-value{font-size:24px;}
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, starred: 0, streak: 0, public: 0 });
  const [recent, setRecent] = useState([]);

  // Hindi: Dashboard stats aur recent notes fetch karo
  useEffect(() => {
    API.get('/dashboard').then(res => {
      const d = res.data || {};
      setStats({
        totalNotes: d.totalNotes || 0,
        starred: d.starredNotes || 0,
        streak: d.goals?.currentStreak || 0,
        public: d.publicNotes || 0
      });
    }).catch(() => {});
    API.get('/notes').then(res => setRecent((res.data || []).slice(0, 6))).catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const STAT_CARDS = [
    { label: 'Total Notes', value: stats.totalNotes, icon: FileText, color: '#f97316', bg: 'rgba(249,115,22,0.09)' },
    { label: 'Starred',     value: stats.starred,    icon: Star,     color: '#b45309', bg: 'rgba(180,83,9,0.09)' },
    { label: 'Day Streak',  value: stats.streak,     icon: Zap,      color: '#15803d', bg: 'rgba(21,128,61,0.09)' },
    { label: 'Public',      value: stats.public,     icon: Globe,    color: '#6d28d9', bg: 'rgba(109,40,217,0.09)' },
  ];

  return (
    <div className="home-root">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        {/* Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={17} /></button>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Home</span>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              <Plus size={15} /> New Note
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pg-content">

          {/* Greeting */}
          <div className="home-greeting">
            <div className="home-greeting-name">Good day, {firstName} 👋</div>
            <div className="home-greeting-sub">
              {stats.streak > 0
                ? `You're on a ${stats.streak}-day streak. Keep going!`
                : 'Start writing to begin your streak today.'}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="qa-btn qa-btn-primary" onClick={() => navigate('/dashboard')}>
              <Plus size={15} /> New Note
            </button>
            <button className="qa-btn" onClick={() => navigate('/ask-ai')}>
              Ask AI
            </button>
            <button className="qa-btn" onClick={() => navigate('/community')}>
              Community
            </button>
            <button className="qa-btn" onClick={() => navigate('/folders')}>
              Folders
            </button>
          </div>

          {/* Stats */}
          <div className="home-stats">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: bg }}>
                  <Icon size={17} color={color} />
                </div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Notes */}
          <div className="section-header">
            <span className="section-title">Recent Notes</span>
            <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="recent-card">
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <FileText size={32} />
                <h4>No notes yet</h4>
                <p>Create your first note to get started</p>
              </div>
            ) : (
              recent.map((note, i) => (
                <div key={i} className="recent-item" onClick={() => navigate('/dashboard')}>
                  <div className="recent-item-left">
                    <div className="recent-note-icon">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="recent-note-title">{note.title || 'Untitled Note'}</div>
                      <div className="recent-note-meta">
                        <Clock size={11} />
                        {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={15} color="var(--text-4)" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}