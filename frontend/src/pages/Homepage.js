import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Star, Globe, 
  ChevronRight, Brain, Folder, Zap,
  MoreVertical, Command, Menu, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .saas-root { 
    display: flex; height: 100dvh; background: #FFFFFF; 
    font-family: 'Plus Jakarta Sans', sans-serif; color: #000; overflow: hidden;
  }

  .saas-main { 
    flex: 1; padding: 40px 5vw; overflow-y: auto; scrollbar-width: none; min-width: 0;
  }

  /* Header Redesign */
  .home-topbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 32px;
  }
  .home-menu-btn {
    display: none; background: #F1F5F9; border: none; border-radius: 12px; 
    cursor: pointer; padding: 10px; color: #000;
  }

  .search-wrapper {
    background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 14px;
    padding: 10px 18px; display: flex; align-items: center; gap: 12px;
    width: 320px; transition: 0.3s;
  }
  .search-wrapper:focus-within { border-color: #000; background: #FFF; box-shadow: 0 0 15px rgba(0,0,0,0.05); }
  .search-wrapper input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 700; color: #000; }

  /* Hero Section - The "Black & Neon" Look */
  .hero-card {
    grid-column: span 8; background: #000; border-radius: 28px; padding: 40px;
    color: #FFF; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: center;
  }
  .hero-card::after {
    content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
    background: #ccff00; filter: blur(80px); opacity: 0.2;
  }

  .hero-title {
    font-size: clamp(28px, 4vw, 42px); font-weight: 900; line-height: 1.1;
    letter-spacing: -1.5px; margin: 20px 0; color: #FFF;
  }
  .hero-title span { color: #ccff00; }

  /* Buttons */
  .btn-neon {
    background: #ccff00; color: #000; border: none; padding: 14px 28px;
    border-radius: 14px; font-weight: 900; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; gap: 10px; transition: 0.3s;
  }
  .btn-neon:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(204,255,0,0.3); }

  .btn-outline {
    background: transparent; color: #FFF; border: 2px solid #333; padding: 12px 26px;
    border-radius: 14px; font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.3s;
  }
  .btn-outline:hover { border-color: #ccff00; color: #ccff00; }

  /* Grid Layout */
  .saas-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }
  .stat-span { grid-column: span 4; display: flex; flex-direction: column; gap: 24px; }

  .indicator-card {
    background: #FFF; border: 1px solid #F1F5F9; border-radius: 24px; padding: 28px;
    display: flex; flex-direction: column; justify-content: space-between; transition: 0.3s;
  }
  .indicator-card:hover { border-color: #000; transform: translateY(-5px); }

  .mini-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 32px; }
  
  .mini-card {
    background: #F8FAFC; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 15px;
    border: 1px solid transparent; transition: 0.3s;
  }
  .mini-card:hover { background: #FFF; border-color: #000; }
  .mini-icon { width: 40px; height: 40px; border-radius: 12px; background: #000; display: flex; align-items: center; justify-content: center; color: #ccff00; }

  /* Recent List */
  .list-container { background: #FFF; border: 1px solid #F1F5F9; border-radius: 24px; overflow: hidden; margin-top: 16px; }
  .list-item {
    padding: 20px 24px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; transition: 0.2s;
  }
  .list-item:hover { background: #F8FAFC; }
  .neon-dot { width: 10px; height: 10px; border-radius: 50%; background: #ccff00; box-shadow: 0 0 10px #ccff00; }

  @media(max-width: 1024px) {
    .hero-card { grid-column: span 12; }
    .stat-span { grid-column: span 12; flex-direction: row; }
    .stat-span > * { flex: 1; }
    .mini-stat-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media(max-width: 768px) {
    .saas-main { padding: 20px 16px; }
    .home-menu-btn { display: flex; }
    .stat-span { flex-direction: column; }
    .search-wrapper { display: none; }
    .mini-stat-grid { grid-template-columns: 1fr; }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, publicNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0, streakCount: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get('/dashboard').then(res => {
      const data = res.data || {};
      setStats({
        totalNotes: data.totalNotes || 0,
        publicNotes: data.publicNotes || 0,
        starredNotes: data.starredNotes || 0,
        flashcardsDue: data.flashcardsDue || 0,
        totalFolders: data.totalFolders || 0,
        streakCount: data.goals?.currentStreak || 0,
      });
    }).catch(() => {});
    API.get('/notes').then(res => setRecent(res.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="saas-root">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="saas-main">
        {/* Topbar */}
        <header className="home-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <button className="home-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>DASHBOARD</h1>
              <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 700 }}>Pulse check for {user?.name || 'Developer'}</p>
            </div>
          </div>
          <div className="search-wrapper">
            <Search size={18} color="#94A3B8" />
            <input placeholder="Jump to document..." />
            <Command size={14} color="#CBD5E1" />
          </div>
        </header>

        {/* Master Grid */}
        <div className="saas-grid">
          <div className="hero-card">
            <div style={{ background: 'rgba(204,255,0,0.1)', color: '#ccff00', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} /> SYSTEM OPERATIONAL
            </div>
            <h2 className="hero-title">
              Master your <span>Knowledge</span>.<br/>Accelerate your <span>Growth</span>.
            </h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button className="btn-neon" onClick={() => navigate('/ask-ai')}>
                <Plus size={18} strokeWidth={3} /> START AI CHAT
              </button>
              <button className="btn-outline" onClick={() => navigate('/folders')}>
                VIEW REPOS
              </button>
            </div>
          </div>

          <div className="stat-span">
            <div className="indicator-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px' }}>REVISION QUEUE</span>
                <Brain size={20} color="#ccff00" />
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, marginTop: '10px' }}>{stats.flashcardsDue}</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', marginTop: '5px' }}>Items due for review</p>
            </div>
            <div className="indicator-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px' }}>DATA CLUSTERS</span>
                <Folder size={20} color="#000" />
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, marginTop: '10px' }}>{stats.totalFolders}</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '5px' }}>Active modules</p>
            </div>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div className="mini-stat-grid">
          {[
            { lbl: "Total Notes", val: stats.totalNotes, icn: FileText },
            { lbl: "Community", val: stats.publicNotes, icn: Globe },
            { lbl: "Starred",     val: stats.starredNotes, icn: Star },
            { lbl: "Streak",      val: stats.streakCount, icn: Zap }
          ].map((item, i) => (
            <div key={i} className="mini-card">
              <div className="mini-icon">
                <item.icn size={18} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{item.lbl}</div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Documents */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900 }}>RECENT LOGS</h3>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              ACCESS ARCHIVE <ChevronRight size={14} />
            </button>
          </div>

          <div className="list-container">
            {recent.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontWeight: 800 }}>NO RECENT ACTIVITY</div>
            ) : recent.map((note, i) => (
              <div key={i} className="list-item" onClick={() => navigate('/dashboard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="neon-dot" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{note.title || "UNTITLED LOG"}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>Modified {new Date(note.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <MoreVertical size={18} color="#CBD5E1" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}