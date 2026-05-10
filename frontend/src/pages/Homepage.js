// HomePage.js — DM Sans, #f97316 accent, global design tokens
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Star, Globe, Zap, ArrowUpRight, Clock, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  .home-wrap { display:flex; height:100vh; height:100dvh; background:var(--bg); font-family:var(--font,'DM Sans',sans-serif); overflow:hidden; }

  /* Greeting */
  .home-greeting       { margin-bottom:24px; }
  .home-greeting-name  { font-size:clamp(20px,2.5vw,26px); font-weight:800; color:var(--text); letter-spacing:-0.8px; margin-bottom:3px; }
  .home-greeting-sub   { font-size:13px; color:var(--text-3); }

  /* Stats grid */
  .home-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:28px; }

  /* Quick actions */
  .quick-actions { display:flex; gap:8px; margin-bottom:28px; flex-wrap:wrap; }
  .qa-btn {
    display:flex; align-items:center; gap:7px;
    padding:9px 16px; background:var(--surface); border:1px solid var(--border);
    border-radius:var(--r-md); font-family:var(--font); font-size:13px; font-weight:700;
    color:var(--text-2); cursor:pointer; transition:all 0.15s;
  }
  .qa-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }
  .qa-btn-primary { background:var(--accent); color:#fff; border-color:var(--accent); }
  .qa-btn-primary:hover { background:var(--accent-dark); color:#fff; border-color:var(--accent-dark); }

  /* Recent notes */
  .recent-card    { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
  .recent-item    { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border-bottom:1px solid var(--border); transition:background 0.15s; cursor:pointer; }
  .recent-item:last-child { border-bottom:none; }
  .recent-item:hover      { background:var(--bg); }
  .recent-item-left  { display:flex; align-items:center; gap:11px; }
  .recent-note-icon  { width:34px; height:34px; border-radius:9px; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .recent-note-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:2px; }
  .recent-note-meta  { font-size:11px; color:var(--text-4); display:flex; align-items:center; gap:3px; }

  /* View all link */
  .view-all {
    display:inline-flex; align-items:center; gap:4px;
    font-size:12px; font-weight:700; color:var(--text-3);
    background:none; border:none; cursor:pointer; font-family:var(--font);
    transition:color 0.15s;
  }
  .view-all:hover { color:var(--accent); }

  @media(max-width:768px) {
    .home-stats { grid-template-columns:repeat(2,1fr); }
    .quick-actions { gap:6px; }
    .qa-btn { padding:8px 12px; font-size:12px; }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalNotes:0, starred:0, streak:0, public:0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get('/dashboard').then(res => {
      const d = res.data || {};
      setStats({ totalNotes:d.totalNotes||0, starred:d.starredNotes||0, streak:d.goals?.currentStreak||0, public:d.publicNotes||0 });
    }).catch(()=>{});
    API.get('/notes').then(res => setRecent((res.data||[]).slice(0,6))).catch(()=>{});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const STAT_CARDS = [
    { label:'Total Notes', value:stats.totalNotes, icon:FileText, color:'#f97316', bg:'rgba(249,115,22,0.09)' },
    { label:'Starred',     value:stats.starred,    icon:Star,     color:'#d97706', bg:'rgba(217,119,6,0.09)'  },
    { label:'Day Streak',  value:stats.streak,     icon:Zap,      color:'#16a34a', bg:'rgba(22,163,74,0.09)'  },
    { label:'Public',      value:stats.public,     icon:Globe,    color:'#7c3aed', bg:'rgba(124,58,237,0.09)' },
  ];

  return (
    <div className="home-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
          <div className="page-title-wrap">
            <div className="page-title-icon"><FileText size={15} /></div>
            <span className="page-title">Home</span>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              <Plus size={14} /> New Note
            </button>
          </div>
        </div>

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
            <button className="qa-btn qa-btn-primary" onClick={() => navigate('/dashboard')}><Plus size={14} /> New Note</button>
            <button className="qa-btn" onClick={() => navigate('/ask-ai')}>Ask AI</button>
            <button className="qa-btn" onClick={() => navigate('/community')}>Community</button>
            <button className="qa-btn" onClick={() => navigate('/folders')}>Folders</button>
          </div>

          {/* Stats */}
          <div className="home-stats">
            {STAT_CARDS.map(({ label, value, icon:Icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background:bg }}><Icon size={16} color={color} /></div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Notes */}
          <div className="section-header">
            <span className="section-title">Recent Notes</span>
            <button className="view-all" onClick={() => navigate('/dashboard')}>
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="recent-card">
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding:'40px 24px' }}>
                <div className="empty-icon"><FileText size={24} color="var(--text-4)" /></div>
                <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text-2)' }}>No notes yet</h4>
                <p style={{ fontSize:13 }}>Create your first note to get started</p>
              </div>
            ) : (
              recent.map((note, i) => (
                <div key={i} className="recent-item" onClick={() => navigate('/dashboard')}>
                  <div className="recent-item-left">
                    <div className="recent-note-icon"><FileText size={15} /></div>
                    <div>
                      <div className="recent-note-title">{note.title || 'Untitled Note'}</div>
                      <div className="recent-note-meta">
                        <Clock size={10} />
                        {new Date(note.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={14} color="var(--text-4)" />
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