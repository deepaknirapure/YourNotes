import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Star, Activity, 
  ChevronRight, Brain, Folder, Zap, Clock,
  MoreVertical, Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .saas-root { 
    display: flex; height: 100vh; background: #FAFAFA; 
    font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; overflow: hidden;
  }

  .saas-main { 
    flex: 1; padding: 48px 5vw; overflow-y: auto; scrollbar-width: none; 
  }

  /* Utility Classes */
  .text-muted { color: #64748B; }
  .text-xs-bold { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  
  /* Precision Cards */
  .clean-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
  }

  .clean-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  }

  /* Layout */
  .saas-grid { 
    display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; margin-top: 40px; 
  }
  .hero-span { grid-column: span 8; display: flex; flex-direction: column; justify-content: center; }
  .stat-span { grid-column: span 4; display: flex; flex-direction: column; gap: 24px; }

  /* Premium Typography */
  .hero-title {
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 800; letter-spacing: -1.5px; line-height: 1.1;
    color: #0F172A; margin: 16px 0 24px 0;
  }

  /* Buttons */
  .btn-primary {
    background: #0F172A; color: #FFF; border: none; padding: 14px 28px;
    border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; 
    transition: 0.2s; display: flex; align-items: center; gap: 10px; width: fit-content;
  }
  .btn-primary:hover { background: #E55B2D; }

  /* Spotlight Search */
  .search-wrapper {
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px;
    padding: 10px 16px; display: flex; align-items: center; gap: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02); transition: 0.2s; width: 300px;
  }
  .search-wrapper:focus-within { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229, 91, 45, 0.1); }
  .search-wrapper input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: #0F172A; }

  /* Minimal List */
  .list-item {
    padding: 20px; border-bottom: 1px solid #F1F5F9;
    display: flex; align-items: center; justify-content: space-between;
    transition: 0.2s; cursor: pointer; background: #FFF;
  }
  .list-item:hover { background: #F8FAFC; }
  .list-item:last-child { border-bottom: none; }

  /* Status Badge */
  .badge-ai {
    background: #FFF5F2; color: #E55B2D; border: 1px solid #FFE4DB;
    padding: 6px 12px; border-radius: 8px; display: inline-flex; 
    align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
  }
`;

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    API.get('/dashboard').then(res => setStats(res.data)).catch(() => {});
    API.get('/notes').then(res => setRecent(res.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="saas-root">
      <style>{STYLES}</style>
      <Sidebar />

      <main className="saas-main">
        {/* Sleek Navigation Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Overview
            </h1>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
            </p>
          </div>
          <div className="search-wrapper">
             <Search size={18} className="text-muted" />
             <input placeholder="Search YourNotes..." />
             <Command size={14} className="text-muted" />
          </div>
        </header>

        {/* Master Grid */}
        <div className="saas-grid">
          <div className="clean-card hero-span">
             <div className="badge-ai">
                <Zap size={14} fill="currentColor" /> Neural Engine Online
             </div>
             <h2 className="hero-title">
               Manage your knowledge.<br/>Accelerate your learning.
             </h2>
             <p className="text-muted" style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '480px', marginBottom: '32px' }}>
               Instantly generate summaries, organize subject modules, and review automated flashcards all in one unified workspace.
             </p>
             <div style={{ display: 'flex', gap: '16px' }}>
               <button className="btn-primary" onClick={() => navigate('/ask-ai')}>
                 New AI Chat <Plus size={16} />
               </button>
               <button style={{ background: '#FFF', color: '#0F172A', border: '1px solid #E2E8F0', padding: '14px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }} onClick={() => navigate('/folders')}>
                 Browse Modules
               </button>
             </div>
          </div>

          <div className="stat-span">
             <div className="clean-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="text-xs-bold text-muted">Review Queue</div>
                    <div style={{ fontSize: '40px', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>{stats.flashcardsDue}</div>
                  </div>
                  <div style={{ padding: '10px', background: '#FFF5F2', borderRadius: '10px' }}>
                    <Brain size={20} color="#E55B2D" />
                  </div>
                </div>
             </div>
             <div className="clean-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="text-xs-bold text-muted">Subject Folders</div>
                    <div style={{ fontSize: '40px', fontWeight: 800, marginTop: '8px', color: '#0F172A' }}>{stats.totalFolders}</div>
                  </div>
                  <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '10px' }}>
                    <Folder size={20} color="#64748B" />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Mini Analytics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '24px' }}>
          {[
            { lbl: "Total Notes", val: stats.totalNotes, icn: FileText },
            { lbl: "Starred", val: stats.starredNotes, icn: Star },
            { lbl: "Active Days", val: "12", icn: Activity },
            { lbl: "Last Sync", val: "Just now", icn: Clock }
          ].map((item, i) => (
            <div key={i} className="clean-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                 <item.icn size={18} className="text-muted" />
               </div>
               <div>
                  <div className="text-xs-bold text-muted">{item.lbl}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{item.val}</div>
               </div>
            </div>
          ))}
        </div>

        {/* Seamless Data Table/List */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Documents</h3>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Archive <ChevronRight size={14} />
            </button>
          </div>

          <div className="clean-card" style={{ padding: '0', overflow: 'hidden' }}>
            {recent.map((note, i) => (
              <div key={i} className="list-item" onClick={() => navigate('/dashboard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E55B2D' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>{note.title || "Untitled Note"}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Last edited {new Date(note.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <MoreVertical size={18} className="text-muted" />
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}