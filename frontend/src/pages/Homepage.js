import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Star, Globe, Zap, ArrowUpRight, Clock, Menu, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hp-wrap {
    display: flex;
    height: 100dvh;
    overflow: hidden;
    background: var(--bg);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  .hp-topbar {
    height: 56px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 24px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .hp-menu-btn {
    display: none;
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    padding: 7px;
    color: var(--text-muted);
    align-items: center;
    justify-content: center;
  }
  .hp-topbar-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.2px;
  }
  .hp-new-btn {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: var(--text);
    color: var(--bg);
    border: none;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .hp-new-btn:hover { opacity: 0.8; }

  .hp-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 28px 28px 100px;
  }
  .hp-content::-webkit-scrollbar { display: none; }

  /* Greeting */
  .hp-greeting {
    margin-bottom: 28px;
    animation: fadeUp 0.35s ease both;
  }
  .hp-greeting-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .hp-greeting-sub {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 400;
  }

  /* Stats */
  .hp-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 28px;
  }
  .hp-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    animation: fadeUp 0.35s ease both;
  }
  .hp-stat-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  .hp-stat-val {
    font-size: 22px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.8px;
    line-height: 1;
    margin-bottom: 4px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-stat-lbl {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  /* Quick actions */
  .hp-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
    flex-wrap: wrap;
    animation: fadeUp 0.35s ease both;
  }
  .hp-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.15s;
    white-space: nowrap;
  }
  .hp-action-btn:hover { color: var(--text); border-color: var(--text-muted); }
  .hp-action-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .hp-action-btn.primary:hover { opacity: 0.88; }

  /* Section */
  .hp-section-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    animation: fadeUp 0.35s ease both;
  }
  .hp-section-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.7px;
  }
  .hp-view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: color 0.15s;
    padding: 0;
  }
  .hp-view-all:hover { color: var(--text); }

  /* Recent notes */
  .hp-recent {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    animation: fadeUp 0.35s ease both;
  }
  .hp-note-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.12s;
  }
  .hp-note-row:last-child { border-bottom: none; }
  .hp-note-row:hover { background: var(--bg); }
  .hp-note-thumb {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(249,115,22,0.08);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .hp-note-info { flex: 1; min-width: 0; }
  .hp-note-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .hp-note-meta {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .hp-note-arr { color: var(--text-muted); flex-shrink: 0; }

  .hp-empty {
    text-align: center;
    padding: 36px 20px;
  }
  .hp-empty p {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 8px;
  }

  @media (max-width: 768px) {
    .hp-menu-btn { display: flex !important; }
    .hp-content  { padding: 20px 16px 100px; }
    .hp-stats    { grid-template-columns: repeat(2, 1fr); }
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
        totalNotes: d.totalNotes        || 0,
        starred:    d.starredNotes      || 0,
        streak:     d.goals?.currentStreak || 0,
        public:     d.publicNotes       || 0,
      });
    }).catch(() => {});
    API.get('/notes').then(res => setRecent((res.data || []).slice(0, 6))).catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const STAT_CARDS = [
    { label: 'Notes',   value: stats.totalNotes, icon: FileText, color: '#f97316', bg: 'rgba(249,115,22,0.08)', delay: '0s'    },
    { label: 'Starred', value: stats.starred,    icon: Star,     color: '#d97706', bg: 'rgba(217,119,6,0.08)',  delay: '0.05s' },
    { label: 'Streak',  value: stats.streak,     icon: Zap,      color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  delay: '0.10s' },
    { label: 'Public',  value: stats.public,     icon: Globe,    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', delay: '0.15s' },
  ];

  return (
    <div className="hp-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="hp-main">
        <div className="hp-topbar">
          <button className="hp-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
          <span className="hp-topbar-title">Home</span>
          <button className="hp-new-btn" onClick={() => navigate('/dashboard')}>
            <Plus size={14} /> New Note
          </button>
        </div>

        <div className="hp-content">

          {/* Greeting */}
          <div className="hp-greeting">
            <div className="hp-greeting-name">Good day, {firstName}</div>
            <div className="hp-greeting-sub">
              {stats.streak > 0
                ? `${stats.streak}-day streak — keep it up.`
                : 'Start writing to begin your streak.'}
            </div>
          </div>

          {/* Stats */}
          <div className="hp-stats">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, delay }) => (
              <div className="hp-stat" key={label} style={{ animationDelay: delay }}>
                <div className="hp-stat-icon" style={{ background: bg }}>
                  <Icon size={14} color={color} />
                </div>
                <div className="hp-stat-val">{value.toLocaleString()}</div>
                <div className="hp-stat-lbl">{label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="hp-actions" style={{ animationDelay: '0.2s' }}>
            <button className="hp-action-btn primary" onClick={() => navigate('/dashboard')}><Plus size={14} /> New Note</button>
            <button className="hp-action-btn" onClick={() => navigate('/ask-ai')}><Zap size={14} /> Ask AI</button>
            <button className="hp-action-btn" onClick={() => navigate('/community')}><Globe size={14} /> Community</button>
            <button className="hp-action-btn" onClick={() => navigate('/folders')}><BookOpen size={14} /> Folders</button>
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
                <FileText size={20} color="var(--text-muted)" />
                <p>No notes yet. Create one to get started.</p>
              </div>
            ) : (
              recent.map((note, i) => (
                <div className="hp-note-row" key={note._id || i} onClick={() => navigate('/dashboard')}>
                  <div className="hp-note-thumb"><FileText size={14} /></div>
                  <div className="hp-note-info">
                    <div className="hp-note-title">{note.title || 'Untitled Note'}</div>
                    <div className="hp-note-meta">
                      <Clock size={10} />
                      {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <ArrowUpRight size={13} className="hp-note-arr" />
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