// यह Sidebar component hai - sab pages par navigation ke liye
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  CreditCard, Bot, Users, Trash2, User, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Navigation links ki list
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

  // Page par navigate karo aur mobile sidebar band karo
  const goTo = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  // Logout karo aur login page par bhejo
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User ka naam ka pehla letter (avatar ke liye)
  const avatarLetter = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {/* CSS styles sidebar ke liye */}
      <style>{`
        /* Sidebar slide-in animation mobile ke liye */
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        /* Desktop par sidebar hamesha dikhta hai */
        @media (min-width: 769px) {
          .sidebar { display: flex !important; position: static !important; }
        }

        /* Mobile par sidebar tabhi dikhta hai jab open ho */
        @media (max-width: 768px) {
          .sidebar {
            display: ${open ? 'flex' : 'none'} !important;
            position: fixed !important;
            z-index: 50;
            animation: slideIn 0.22s ease;
          }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>

      {/* Main sidebar element */}
      <aside className="sidebar" style={{
        width: 220,
        height: '100vh',
        background: '#000',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        fontFamily: "'Geist', -apple-system, sans-serif",
        left: 0,
        top: 0,
      }}>

        {/* Header - logo aur close button */}
        <div style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 22, height: 22,
              background: '#E55B2D',
              borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Pencil icon */}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              Your<span style={{ color: '#E55B2D' }}>Notes</span>
            </span>
          </div>

          {/* Mobile close button - desktop par hidden */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            style={{
              display: 'none', // default hidden, CSS se mobile par dikhega
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 7,
                  fontSize: 13, fontWeight: 500,
                  color: isActive ? '#E55B2D' : 'rgba(255,255,255,0.45)',
                  background: isActive ? 'rgba(229,91,45,0.1)' : 'none',
                  cursor: 'pointer', border: 'none',
                  width: '100%', textAlign: 'left',
                  fontFamily: 'inherit', marginBottom: 2,
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                  }
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer - user info, profile, logout */}
        <div style={{
          padding: '10px 6px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {/* Profile button */}
          <button
            onClick={() => goTo('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 7,
              fontSize: 13, fontWeight: 500,
              color: 'rgba(255,255,255,0.45)',
              background: 'none', cursor: 'pointer', border: 'none',
              width: '100%', textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <User size={15} /> Profile
          </button>

          {/* User info row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 7, fontSize: 12,
            color: 'rgba(255,255,255,0.5)', overflow: 'hidden',
          }}>
            {/* Avatar circle with first letter */}
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#E55B2D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {avatarLetter}
            </div>
            <span style={{
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontWeight: 500, color: 'rgba(255,255,255,0.65)',
            }}>
              {user?.name || 'Student'}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 7,
              fontSize: 13, fontWeight: 500, color: '#ef4444',
              background: 'none', cursor: 'pointer', border: 'none',
              width: '100%', textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
