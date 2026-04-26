// ye Home page hai - user login ke baad sabse pehle yahan aata hai
// Stats, quick access cards, aur recent notes dikhata hai
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Star, Folder, Tag, Bot, Users, Trash2,
  CreditCard, Plus, FileText, Search, Menu, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

// Quick access cards - sab features ke shortcuts
const FEATURE_CARDS = [
  { icon: BookOpen,   title: 'Dashboard',  desc: 'Create and edit your notes.',      path: '/dashboard',        color: '#4F46E5', bg: 'rgba(79,70,229,0.1)'   },
  { icon: Star,       title: 'Starred',    desc: 'Quick access to important notes.', path: '/starred',          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  { icon: Folder,     title: 'Folders',    desc: 'Organize by subject or topic.',    path: '/folders',          color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  { icon: Tag,        title: 'Tags',       desc: 'Find notes by tag or topic.',      path: '/tags',             color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  { icon: CreditCard, title: 'Flashcards', desc: 'Spaced repetition review.',        path: '/flashcard-review', color: '#E55B2D', bg: 'rgba(229,91,45,0.1)'   },
  { icon: Bot,        title: 'Ask AI',     desc: 'AI study assistant.',              path: '/ask-ai',           color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  { icon: Users,      title: 'Community',  desc: 'Share and download notes.',        path: '/community',        color: '#f43f5e', bg: 'rgba(244,63,94,0.1)'   },
  { icon: Trash2,     title: 'Trash',      desc: 'Restore deleted notes.',           path: '/trash',            color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [stats, setStats]           = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQ, setSearchQ]       = useState('');
  const [creating, setCreating]     = useState(false);

  // Dashboard data aur notes load karo
  useEffect(() => {
    Promise.all([API.get('/dashboard'), API.get('/notes')])
      .then(([dashRes, notesRes]) => {
        setStats(dashRes.data);
        // Sirf non-trashed notes dikhao, max 8
        const active = (notesRes.data || []).filter(n => !n.isTrashed).slice(0, 8);
        setRecentNotes(active);
      })
      .catch(() => toast.error('Could not load data. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  // Naya note banao aur dashboard par jao
  const createNote = async () => {
    setCreating(true);
    try {
      await API.post('/notes', { title: 'Untitled Note', content: '' });
      navigate('/dashboard');
    } catch {
      toast.error('Could not create note. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Search filter - sirf matching notes dikhao
  const filteredNotes = searchQ.trim()
    ? recentNotes.filter(n => (n.title || '').toLowerCase().includes(searchQ.toLowerCase()))
    : recentNotes;

  // Stats cards data
  const STATS = [
    { icon: FileText,   label: 'Total Notes',    val: stats.totalNotes,    color: '#4F46E5', bg: 'rgba(79,70,229,0.12)'   },
    { icon: Star,       label: 'Starred',        val: stats.starredNotes,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    { icon: CreditCard, label: 'Flashcards Due', val: stats.flashcardsDue, color: '#E55B2D', bg: 'rgba(229,91,45,0.12)'   },
    { icon: Folder,     label: 'Folders',        val: stats.totalFolders,  color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0a', fontFamily: "'Geist', -apple-system, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hp-stat { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:14px 16px; display:flex; align-items:center; gap:12px; animation:fadeUp .35s both; transition:border-color .15s; }
        .hp-stat:hover { border-color:rgba(255,255,255,.13); }
        .hp-feature-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:16px; cursor:pointer; transition:border-color .15s,transform .12s,background .15s; animation:fadeUp .35s both; }
        .hp-feature-card:hover { border-color:rgba(255,255,255,.14); background:#161616; transform:translateY(-1px); }
        .hp-note-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:14px 16px; cursor:pointer; transition:border-color .15s,background .15s; animation:fadeUp .35s both; }
        .hp-note-card:hover { border-color:rgba(255,255,255,.14); background:#161616; }
        .hp-search { padding:7px 12px 7px 30px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:6px; font-size:13px; font-family:inherit; color:#fff; outline:none; width:220px; transition:border-color .15s; }
        .hp-search:focus { border-color:rgba(255,255,255,.15); }
        .hp-search::placeholder { color:rgba(255,255,255,.2); }
        .hp-new-btn { display:flex; align-items:center; gap:6px; background:#E55B2D; color:#fff; border:none; border-radius:6px; padding:7px 13px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:all .15s; }
        .hp-new-btn:hover:not(:disabled) { background:#d14e24; box-shadow:0 4px 14px rgba(229,91,45,.3); }
        .hp-new-btn:disabled { opacity:.5; cursor:not-allowed; }
        .hp-menu-btn { display:none; background:none; border:none; color:rgba(255,255,255,.5); cursor:pointer; padding:4px; }
        @media(max-width:900px) { .hp-stats { grid-template-columns:repeat(2,1fr)!important; } }
        @media(max-width:768px) { .hp-menu-btn{display:flex!important} .hp-search{width:160px!important} .hp-content{padding:16px!important} }
      `}</style>

      {/* Sidebar navigation */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile menu button */}
            <button className="hp-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            {/* Search bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                className="hp-search"
                placeholder="Search notes..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
          </div>
          {/* New note button */}
          <button className="hp-new-btn" onClick={createNote} disabled={creating}>
            <Plus size={14} />
            {creating ? 'Creating...' : 'New Note'}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="hp-content" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* Greeting */}
          <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s both' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: '#fff', marginBottom: 4 }}>
              Good {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              What would you like to study today?
            </p>
          </div>

          {/* Stats row */}
          <div className="hp-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
            {STATS.map(({ icon: Icon, label, val, color, bg }, i) => (
              <div key={i} className="hp-stat" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 34, height: 34, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  {/* Loading skeleton ya actual value */}
                  {loading
                    ? <div style={{ width: 32, height: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
                    : <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{val}</div>
                  }
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontWeight: 500 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick access feature cards */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              Quick Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
              {FEATURE_CARDS.map((f, i) => (
                <div
                  key={i}
                  className="hp-feature-card"
                  onClick={() => navigate(f.path)}
                  style={{ animationDelay: `${0.2 + i * 0.04}s` }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <f.icon size={15} color={f.color} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent notes section */}
          {!loading && filteredNotes.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Recent Notes
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ background: 'none', border: 'none', color: '#E55B2D', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
                {filteredNotes.map((note, i) => (
                  <div
                    key={note._id}
                    className="hp-note-card"
                    onClick={() => navigate('/dashboard')}
                    style={{ animationDelay: `${0.1 + i * 0.04}s` }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {note.title || 'Untitled Note'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, marginBottom: 10 }}>
                      {note.plainText || 'No content yet...'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                        {formatDate(note.updatedAt)}
                      </span>
                      {note.isStarred && <Star size={11} color="#f59e0b" fill="#f59e0b" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Time of day greeting function
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

// Date format helper - short format
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
