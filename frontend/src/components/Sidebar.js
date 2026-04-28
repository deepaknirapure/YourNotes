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
          padding: 11px 16px;
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
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-button:hover { color: #000000; background: #F8FAFC; border-radius: 10px; }
        .nav-button-active {
          color: #000000 !important;
          font-weight: 800 !important;
        }
        .nav-button-active::before {
          content: '';
          position: absolute;
          left: 0;
          width: 3px;
          height: 20px;
          background: #E55B2D;
          border-radius: 0 4px 4px 0;
        }
      `}</style>

      {/* Mobile backdrop overlay — tap to close */}
      <div
        className="sidebar-overlay"
        onClick={onClose}
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 299,
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      <aside
        className={`sidebar-main ${open ? 'sidebar-open' : ''}`}
        style={{
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
        }}
      >
        {/* Logo + Close button */}
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #F8FAFC',
        }}>
          <div onClick={() => goTo('/home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#000000', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
              Your
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#E55B2D', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
              Notes
            </span>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={onClose}
            style={{
              display: 'none',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '10px',
              color: '#64748B',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              height: '36px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '12px 8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
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

        {/* Footer: avatar + signout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div onClick={() => goTo('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#E55B2D', flexShrink: 0,
              overflow: 'hidden',
            }}>
              {user?.avatar
                ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                : avatarLetter}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Settings</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent' }}
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
