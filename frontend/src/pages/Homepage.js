import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Star, Globe, Zap, ArrowUpRight, Clock, Menu, TrendingUp, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.7; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }

  /* ── Page shell ── */
  .hp-wrap {
    display: flex;
    height: 100dvh;
    overflow: hidden;
    background: var(--bg);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  /* ── Topbar ── */
  .hp-topbar {
    height: 60px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 24px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    z-index: 10;
  }
  .hp-menu-btn {
    display: none;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 9px;
    cursor: pointer;
    padding: 8px;
    color: var(--text-muted);
    align-items: center;
    justify-content: center;
    transition: 0.15s;
  }
  .hp-menu-btn:hover { border-color: var(--accent); color: var(--accent); }
  .hp-topbar-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.4px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-new-btn {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.15s;
  }
  .hp-new-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ── Scrollable content ── */
  .hp-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 28px 28px 100px;
  }
  .hp-content::-webkit-scrollbar { display: none; }

  /* ── Hero greeting ── */
  .hp-hero {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 28px 24px;
    margin-bottom: 20px;
    overflow: hidden;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hp-hero-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 90% 50%, rgba(249,115,22,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hp-hero-deco {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    animation: float 4s ease-in-out infinite;
  }
  .hp-streak-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(249,115,22,0.10);
    border: 1px solid rgba(249,115,22,0.18);
    color: #f97316;
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .hp-streak-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #f97316;
    animation: pulse-dot 2s ease infinite;
  }
  .hp-greeting-name {
    font-size: clamp(18px, 2.8vw, 24px);
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.6px;
    margin-bottom: 5px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
  }
  .hp-greeting-sub {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 500;
    position: relative;
    line-height: 1.5;
  }

  /* ── Stats grid ── */
  .hp-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .hp-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: 0.2s;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
    cursor: default;
  }
  .hp-stat:hover { transform: translateY(-3px); border-color: rgba(249,115,22,0.25); }
  .hp-stat-top { display: flex; align-items: center; justify-content: space-between; }
  .hp-stat-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .hp-stat-trend {
    font-size: 10px;
    font-weight: 700;
    color: #16a34a;
    background: rgba(22,163,74,0.08);
    border-radius: 6px;
    padding: 2px 6px;
  }
  .hp-stat-val {
    font-size: 26px;
    font-weight: 900;
    color: var(--text);
    letter-spacing: -1px;
    line-height: 1;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-stat-lbl {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── Quick actions ── */
  .hp-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .hp-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.2s;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hp-action-btn:hover { border-color: rgba(249,115,22,0.3); color: var(--text); background: rgba(249,115,22,0.04); }
  .hp-action-btn.accent {
    background: #f97316;
    border-color: #f97316;
    color: #fff;
  }
  .hp-action-btn.accent:hover { background: #ea6c0a; border-color: #ea6c0a; }
  .hp-action-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(249,115,22,0.10);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hp-action-btn.accent .hp-action-icon {
    background: rgba(255,255,255,0.20);
  }

  /* ── Section header ── */
  .hp-section-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hp-section-title {
    font-size: 13px;
    font-weight: 800;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hp-section-title::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background: #f97316;
    border-radius: 2px;
  }
  .hp-view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 5px 10px;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: 0.15s;
  }
  .hp-view-all:hover { color: #f97316; border-color: rgba(249,115,22,0.3); }

  /* ── Recent notes ── */
  .hp-recent {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hp-note-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: 0.15s;
  }
  .hp-note-row:last-child { border-bottom: none; }
  .hp-note-row:hover { background: rgba(249,115,22,0.03); }
  .hp-note-thumb {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(249,115,22,0.09);
    color: #f97316;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .hp-note-info { flex: 1; min-width: 0; }
  .hp-note-title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-note-meta {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .hp-note-arrow { color: var(--text-muted); flex-shrink: 0; transition: 0.15s; }
  .hp-note-row:hover .hp-note-arrow { color: #f97316; transform: translate(2px, -2px); }

  /* ── Empty state ── */
  .hp-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-muted);
  }
  .hp-empty-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(249,115,22,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
  }
  .hp-empty h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 5px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-empty p { font-size: 12.5px; line-height: 1.6; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .hp-menu-btn   { display: flex !important; }
    .hp-content    { padding: 20px 16px 100px; }
    .hp-stats      { grid-template-columns: repeat(2, 1fr); }
    .hp-actions    { grid-template-columns: repeat(2, 1fr); }
    .hp-hero-deco  { display: none; }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,  setStats]  = useState({ totalNotes: 0, starred: 0, streak: 0, public: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get('/dashboard').then(res => {
      const d = res.data || {};
      setStats({
        totalNotes: d.totalNotes   || 0,
        starred:    d.starredNotes || 0,
        streak:     d.goals?.currentStreak || 0,
        public:     d.publicNotes  || 0,
      });
    }).catch(() => {});
    API.get('/notes').then(res => setRecent((res.data || []).slice(0, 6))).catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const STAT_CARDS = [
    { label: 'Total Notes', value: stats.totalNotes, icon: FileText,   color: '#f97316', bg: 'rgba(249,115,22,0.10)',  delay: '0.05s' },
    { label: 'Starred',     value: stats.starred,    icon: Star,        color: '#d97706', bg: 'rgba(217,119,6,0.10)',   delay: '0.10s' },
    { label: 'Day Streak',  value: stats.streak,     icon: Zap,         color: '#16a34a', bg: 'rgba(22,163,74,0.10)',   delay: '0.15s' },
    { label: 'Public',      value: stats.public,     icon: Globe,       color: '#7c3aed', bg: 'rgba(124,58,237,0.10)',  delay: '0.20s' },
  ];

  const QUICK_ACTIONS = [
    { label: 'New Note',  icon: Plus,      path: '/dashboard', accent: true,  delay: '0.05s' },
    { label: 'Ask AI',    icon: Zap,       path: '/ask-ai',    accent: false, delay: '0.10s' },
    { label: 'Community', icon: Globe,     path: '/community', accent: false, delay: '0.15s' },
    { label: 'Folders',   icon: BookOpen,  path: '/folders',   accent: false, delay: '0.20s' },
  ];

  const greetingEmoji = stats.streak > 7 ? '🔥' : stats.streak > 0 ? '⚡' : '👋';

  return (
    <div className="hp-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="hp-main">
        {/* Topbar */}
        <div className="hp-topbar">
          <button className="hp-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={17} />
          </button>
          <span className="hp-topbar-title">Home</span>
          <button className="hp-new-btn" onClick={() => navigate('/dashboard')}>
            <Plus size={14} /> New Note
          </button>
        </div>

        {/* Content */}
        <div className="hp-content">

          {/* Hero Greeting */}
          <div className="hp-hero" style={{ animationDelay: '0s' }}>
            <div className="hp-hero-bg" />
            <div className="hp-hero-deco">{greetingEmoji}</div>
            {stats.streak > 0 && (
              <div className="hp-streak-pill">
                <span className="hp-streak-dot" />
                {stats.streak}-day streak
              </div>
            )}
            <div className="hp-greeting-name">Good day, {firstName} {greetingEmoji}</div>
            <div className="hp-greeting-sub">
              {stats.streak > 0
                ? `You're on a ${stats.streak}-day streak — keep the momentum going!`
                : 'Start writing today to build your streak.'}
            </div>
          </div>

          {/* Stats */}
          <div className="hp-stats">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, delay }) => (
              <div className="hp-stat" key={label} style={{ animationDelay: delay }}>
                <div className="hp-stat-top">
                  <div className="hp-stat-icon" style={{ background: bg }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div className="hp-stat-trend">
                    <TrendingUp size={9} style={{ display: 'inline', marginRight: 2 }} />
                    +0
                  </div>
                </div>
                <div className="hp-stat-val">{value.toLocaleString()}</div>
                <div className="hp-stat-lbl">{label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="hp-actions">
            {QUICK_ACTIONS.map(({ label, icon: Icon, path, accent, delay }) => (
              <button
                key={label}
                className={`hp-action-btn${accent ? ' accent' : ''}`}
                onClick={() => navigate(path)}
                style={{ animationDelay: delay }}
              >
                <div className="hp-action-icon">
                  <Icon size={16} color={accent ? '#fff' : '#f97316'} />
                </div>
                {label}
              </button>
            ))}
          </div>

          {/* Recent Notes */}
          <div className="hp-section-hd" style={{ animationDelay: '0.25s' }}>
            <span className="hp-section-title">Recent Notes</span>
            <button className="hp-view-all" onClick={() => navigate('/dashboard')}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="hp-recent" style={{ animationDelay: '0.3s' }}>
            {recent.length === 0 ? (
              <div className="hp-empty">
                <div className="hp-empty-icon">
                  <FileText size={22} color="#f97316" />
                </div>
                <h4>No notes yet</h4>
                <p>Create your first note to get started.</p>
              </div>
            ) : (
              recent.map((note, i) => (
                <div className="hp-note-row" key={note._id || i} onClick={() => navigate('/dashboard')}>
                  <div className="hp-note-thumb">
                    <FileText size={15} />
                  </div>
                  <div className="hp-note-info">
                    <div className="hp-note-title">{note.title || 'Untitled Note'}</div>
                    <div className="hp-note-meta">
                      <Clock size={10} />
                      {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="hp-note-arrow" />
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