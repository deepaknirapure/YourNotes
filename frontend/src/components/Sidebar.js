import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  CreditCard, Bot, Users, Trash2, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: Home,        label: 'Home',       path: '/home' },
  { icon: BookOpen,    label: 'Dashboard',  path: '/dashboard' },
  { icon: Star,        label: 'Starred',    path: '/starred' },
  { icon: Folder,      label: 'Folders',    path: '/folders' },
  { icon: Tag,         label: 'Tags',       path: '/tags' },
  { icon: CreditCard,  label: 'Flashcards', path: '/flashcard-review' },
  { icon: Bot,         label: 'Ask AI',     path: '/ask-ai' },
  { icon: Users,       label: 'Community',  path: '/community' },
  { icon: Trash2,      label: 'Trash',      path: '/trash' },
];

export default function Sidebar({ open, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const goTo = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarLetter = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800;900&display=swap');

        .nav-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          color: #64748B;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          text-align: left;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .nav-button:hover { color: #000000; }

        .nav-button-active {
          color: #000000 !important;
          font-weight: 800 !important;
        }

        .nav-button-active::before {
          content: '';
          position: absolute;
          left: 0;
          width: 3px;
          height: 18px;
          background: #E55B2D;
          border-radius: 0 4px 4px 0;
        }

        @media (max-width: 768px) {
          .sidebar-main {
            display: ${open ? 'flex' : 'none'} !important;
            position: fixed !important;
            z-index: 100;
            box-shadow: 20px 0 50px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <aside className="sidebar-main" style={{
        width: 240, 
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #F1F5F9',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        left: 0,
        top: 0,
      }}>

        {/* --- High Contrast Capital Logo Area --- */}
        <div style={{
          height: 50, 
          marginTop: 24, // Upar rakha logo thoda gap ke saath
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <div onClick={() => goTo('/home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              fontSize: 24, 
              fontWeight: 900, 
              color: '#000000', // Black
              letterSpacing: '-0.5px',
              textTransform: 'uppercase' // Full Capital
            }}>
              Your
            </span>
            <span style={{ 
              fontSize: 24, 
              fontWeight: 900, 
              color: '#E55B2D', // Orange
              letterSpacing: '-0.5px',
              textTransform: 'uppercase' // Full Capital
            }}>
              Notes
            </span>
          </div>

          <button onClick={onClose} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }} className="sidebar-close-btn">
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* --- Navigation --- */}
        <nav style={{ flex: 1, padding: '24px 0 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={`nav-button ${isActive ? 'nav-button-active' : ''}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* --- Minimal Footer --- */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          <div 
            onClick={() => goTo('/profile')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#E55B2D', flexShrink: 0,
              overflow: 'hidden'
            }}>
              {user?.profilePic ? <img src={user.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="U" /> : avatarLetter}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Pro User'}
              </span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Settings</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none', border: 'none', padding: 0,
              fontSize: 13, fontWeight: 600, color: '#94A3B8',
              cursor: 'pointer', transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <LogOut size={14} /> <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}