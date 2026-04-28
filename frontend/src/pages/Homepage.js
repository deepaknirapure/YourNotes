import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Star, Activity, 
  ChevronRight, Brain, Folder, Zap, Clock,
  MoreVertical, Command, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .saas-root { 
    display: flex; height: 100dvh; background: #FAFAFA; 
    font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; overflow: hidden;
  }

  .saas-main { 
    flex: 1; padding: 40px 5vw; overflow-y: auto; scrollbar-width: none; min-width: 0;
  }

  .home-topbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 0;
  }

  .home-menu-btn {
    display: none; /* shown via CSS on mobile */ background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 10px; cursor: pointer; padding: 8px;
    color: #64748B; align-items: center; justify-content: center;
    transition: 0.15s;
  }
  .home-menu-btn:hover { background: #FFF5F2; color: #E55B2D; border-color: #FFE4DB; }

  .text-muted { color: #64748B; }
  .text-xs-bold { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  
  .clean-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
  }
  .clean-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  }

  .saas-grid { 
    display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; margin-top: 32px; 
  }
  .hero-span { grid-column: span 8; display: flex; flex-direction: column; justify-content: center; }
  .stat-span { grid-column: span 4; display: flex; flex-direction: column; gap: 20px; }

  .hero-title {
    font-size: clamp(26px, 3.5vw, 44px);
    font-weight: 800; letter-spacing: -1.5px; line-height: 1.1;
    color: #0F172A; margin: 14px 0 20px 0;
  }

  .btn-primary {
    background: #0F172A; color: #FFF; border: none; padding: 13px 24px;
    border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; 
    transition: 0.2s; display: flex; align-items: center; gap: 10px; width: fit-content;
    font-family: inherit;
  }
  .btn-primary:hover { background: #E55B2D; }
  .btn-secondary {
    background: #FFF; color: #0F172A; border: 1.5px solid #E2E8F0; padding: 13px 22px;
    border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer;
    transition: 0.2s; font-family: inherit;
  }
  .btn-secondary:hover { border-color: #CBD5E1; background: #F8FAFC; }

  .search-wrapper {
    background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 12px;
    padding: 10px 16px; display: flex; align-items: center; gap: 12px;
    transition: 0.2s; width: 280px;
  }
  .search-wrapper:focus-within { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  .search-wrapper input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: #0F172A; font-family: inherit; }

  .list-item {
    padding: 18px 20px; border-bottom: 1px solid #F1F5F9;
    display: flex; align-items: center; justify-content: space-between;
    transition: 0.2s; cursor: pointer; background: #FFF;
  }
  .list-item:hover { background: #F8FAFC; }
  .list-item:last-child { border-bottom: none; }

  .badge-ai {
    background: #FFF5F2; color: #E55B2D; border: 1px solid #FFE4DB;
    padding: 5px 12px; border-radius: 8px; display: inline-flex; 
    align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
  }

  .stats-mini-row {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;
  }

  @media(max-width: 768px) {
    .saas-main { padding: 20px 16px !important; }
    .home-menu-btn { display: flex !important; }
    .search-wrapper { display: none !important; }
    .home-title-text h1 { font-size: 20px !important; }
    .saas-grid {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
      margin-top: 20px !important;
    }
    .hero-span { grid-column: span 1 !important; }
    .stat-span {
      grid-column: span 1 !important;
      flex-direction: row !important;
      gap: 12px !important;
    }
    .stat-span > * { flex: 1 !important; }
    .clean-card { padding: 18px !important; border-radius: 12px !important; }
    .hero-title { font-size: 24px !important; letter-spacing: -0.8px !important; margin: 10px 0 16px !important; }
    .hero-buttons { flex-direction: column !important; gap: 10px !important; }
    .btn-primary, .btn-secondary { width: 100% !important; justify-content: center; }
    .stats-mini-row {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
    }
    .list-item { padding: 14px 16px !important; }
  }

  @media(max-width: 380px) {
    .stat-span { flex-direction: column !important; }
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get('/dashboard').then(res => setStats(res.data)).catch(() => {});
    API.get('/notes').then(res => setRecent(res.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="saas-root">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="saas-main">
        {/* Topbar */}
        <header className="home-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="home-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="home-title-text">
              <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>Overview</h1>
              <p className="text-muted" style={{ fontSize: '13px', marginTop: '2px' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
              </p>
            </div>
          </div>
          <div className="search-wrapper">
            <Search size={17} className="text-muted" />
            <input placeholder="Search YourNotes..." />
            <Command size={13} className="text-muted" />
          </div>
        </header>

        {/* Master Grid */}
        <div className="saas-grid">
          <div className="clean-card hero-span">
            <div className="badge-ai">
              <Zap size={13} fill="currentColor" /> Neural Engine Online
            </div>
            <h2 className="hero-title">
              Manage your knowledge.<br/>Accelerate your learning.
            </h2>
            <p className="text-muted" style={{ fontSize: '15px', lineHeight: 1.6, maxWidth: '480px', marginBottom: '28px' }}>
              Instantly generate summaries, organize subject modules, and review automated flashcards all in one unified workspace.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => navigate('/ask-ai')}>
                New AI Chat <Plus size={15} />
              </button>
              <button className="btn-secondary" onClick={() => navigate('/folders')}>
                Browse Modules
              </button>
            </div>
          </div>

          <div className="stat-span">
            <div className="clean-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="text-xs-bold text-muted">Review Queue</div>
                  <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '6px', color: '#0F172A' }}>{stats.flashcardsDue}</div>
                </div>
                <div style={{ padding: '10px', background: '#FFF5F2', borderRadius: '10px' }}>
                  <Brain size={19} color="#E55B2D" />
                </div>
              </div>
            </div>
            <div className="clean-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="text-xs-bold text-muted">Folders</div>
                  <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '6px', color: '#0F172A' }}>{stats.totalFolders}</div>
                </div>
                <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '10px' }}>
                  <Folder size={19} color="#64748B" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div className="stats-mini-row">
          {[
            { lbl: "Total Notes", val: stats.totalNotes, icn: FileText },
            { lbl: "Starred",     val: stats.starredNotes, icn: Star },
            { lbl: "Active Days", val: "12",        icn: Activity },
            { lbl: "Last Sync",   val: "Just now",  icn: Clock }
          ].map((item, i) => (
            <div key={i} className="clean-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '9px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9', flexShrink: 0 }}>
                <item.icn size={17} color="#64748B" />
              </div>
              <div>
                <div className="text-xs-bold text-muted">{item.lbl}</div>
                <div style={{ fontSize: '17px', fontWeight: 700, marginTop: '2px' }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Documents */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Documents</h3>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
              View Archive <ChevronRight size={13} />
            </button>
          </div>

          <div className="clean-card" style={{ padding: '0', overflow: 'hidden' }}>
            {recent.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>
                No recent documents
              </div>
            ) : recent.map((note, i) => (
              <div key={i} className="list-item" onClick={() => navigate('/dashboard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E55B2D', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>{note.title || "Untitled Note"}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Last edited {new Date(note.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <MoreVertical size={17} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
