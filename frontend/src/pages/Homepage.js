import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Star, Globe, ChevronRight, 
  Zap, Menu, ArrowUpRight, Sparkles, Clock, LayoutGrid 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const THEME_STYLES = `
  :root {
    --brand-primary: #f97316;
    --brand-secondary: #8b5cf6;
    --app-bg: var(--bg);
    --card-bg: var(--surface);
    --border-color: var(--border);
    --text-main: var(--text);
    --text-dim: var(--text-muted);
  }

  .home-root { 
    display: flex; 
    height: 100dvh; 
    background: var(--app-bg); 
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* Glassmorphism Header */
  .pro-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    background: rgba(var(--surface-rgb), 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .main-content { 
    flex: 1; 
    overflow-y: auto; 
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Modern Premium Hero */
  .premium-hero {
    background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
    border-radius: 24px;
    padding: 48px;
    color: white;
    position: relative;
    overflow: hidden;
    margin-bottom: 32px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .premium-hero::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-tag {
    background: rgba(249,115,22,0.2);
    color: var(--brand-primary);
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
  }

  /* Bento Grid Stats */
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .bento-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bento-card:hover {
    transform: translateY(-5px);
    border-color: var(--brand-primary);
    box-shadow: 0 12px 24px rgba(0,0,0,0.05);
  }

  /* Activity List Design */
  .activity-container {
    background: var(--card-bg);
    border-radius: 24px;
    border: 1px solid var(--border-color);
    overflow: hidden;
  }

  .activity-item {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s;
  }

  .activity-item:hover {
    background: rgba(var(--brand-primary-rgb), 0.03);
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-create {
    background: var(--brand-primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(249,115,22,0.2);
  }

  @media (max-width: 768px) {
    .bento-grid { grid-template-columns: repeat(2, 1fr); }
    .main-content { padding: 16px; }
    .premium-hero { padding: 32px 24px; }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, starred: 0, streak: 0, public: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Fetch logic remains same as per your API
    API.get('/dashboard').then(res => {
      const d = res.data || {};
      setStats({ 
        totalNotes: d.totalNotes || 0, 
        starred: d.starredNotes || 0, 
        streak: d.goals?.currentStreak || 0,
        public: d.publicNotes || 0 
      });
    }).catch(() => {});
    API.get('/notes').then(res => setRecent((res.data || []).slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="home-root">
      <style>{THEME_STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="pro-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)} style={{ display: 'block' }}>
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Dashboard</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="search-bar" style={{ display: 'flex' }}>
              <Search size={16} />
              <input placeholder="Quick search (⌘K)" />
            </div>
            <button className="btn-create" onClick={() => navigate('/dashboard')}>
              <Plus size={18} /> New
            </button>
          </div>
        </header>

        <main className="main-content">
          <section className="premium-hero">
            <div className="hero-tag">
              <Sparkles size={14} /> AI-Powered Workspace
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </h2>
            <p style={{ opacity: 0.7, maxWidth: '500px', marginBottom: '32px', lineHeight: 1.6 }}>
              Your knowledge base is growing. You've maintained a <strong>{stats.streak} day streak</strong>. 
              Keep the momentum going!
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-create" onClick={() => navigate('/ask-ai')}>
                Ask Intelligence
              </button>
              <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '12px', color: 'white', fontWeight: 600 }}>
                Review Flashcards
              </button>
            </div>
          </section>

          <section className="bento-grid">
            <StatCard label="Total Notes" value={stats.totalNotes} icon={FileText} color="#f97316" />
            <StatCard label="Starred" value={stats.starred} icon={Star} color="#f59e0b" />
            <StatCard label="Day Streak" value={stats.streak} icon={Zap} color="#10b981" />
            <StatCard label="Public" value={stats.public} icon={Globe} color="#8b5cf6" />
          </section>

          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Activity</h3>
            <button onClick={() => navigate('/dashboard')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Archive <ChevronRight size={16} />
            </button>
          </div>

          <div className="activity-container">
            {recent.map((note, i) => (
              <div key={i} className="activity-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="icon-box" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{note.title || 'Untitled'}</div>
                    <div style={{ fontSize: '12px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)' }}>
                  <ArrowUpRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bento-card">
      <div className="icon-box" style={{ background: `${color}15`, color: color, marginBottom: '16px' }}>
        <Icon size={20} />
      </div>
      <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.6 }}>{label}</div>
    </div>
  );
}