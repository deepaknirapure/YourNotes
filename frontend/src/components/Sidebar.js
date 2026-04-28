//sidebar.js - Desktop sidebar + Mobile drawer (hamburger se khulta hai)
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  CreditCard, Bot, Users, Trash2, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Sidebar ke navigation links
const NAV_ITEMS = [
  { icon: Home,       label: 'Home',       path: '/home' },
  { icon: BookOpen,   label: 'Dashboard',  path: '/dashboard' },
  { icon: Star,       label: 'Starred',    path: '/starred' },
  { icon: Folder,     label: 'Folders',    path: '/folders' },
  { icon: Tag,        label: 'Tags',       path: '/tags' },
  { icon: CreditCard, label: 'Flashcards', path: '/flashcard-review' },
  { icon: Bot,        label: 'Ask AI',     path: '/ask-ai' },
  { icon: Users,      label: 'Community',  path: '/community' },
  { icon: Trash2,     label: 'Trash',      path: '/trash' },
];

export default function Sidebar({ open, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  // Page navigate karo aur mobile mein sidebar band karo
  const goTo = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User ka pehla letter avatar ke liye
  const avatarLetter = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {/* Mobile backdrop - bahar click karne pe sidebar band ho */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-main${open ? ' sidebar-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Logo + Close button (mobile mein dikhta hai) */}
        <div className="sidebar-header">
          <div
            onClick={() => goTo('/home')}
            className="sidebar-logo"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goTo('/home')}
            aria-label="Go to Home"
          >
            <span className="logo-your">Your</span>
            <span className="logo-notes">Notes</span>
          </div>

          {/* Mobile mein sirf close button dikhta hai */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav" aria-label="Page Navigation">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={`nav-btn${isActive ? ' nav-btn--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer: Profile + Logout */}
        <div className="sidebar-footer">
          <div
            onClick={() => goTo('/profile')}
            className="sidebar-profile"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goTo('/profile')}
            aria-label="Go to Profile"
          >
            <div className="sidebar-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name || 'User'} className="sidebar-avatar-img" />
                : avatarLetter}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user?.name || 'User'}</span>
              <span className="sidebar-settings-label">Settings</span>
            </div>
          </div>

          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        /* ── Sidebar Overlay (mobile backdrop) ── */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          z-index: 299;
          display: none;
        }

        /* ── Main Sidebar ── */
        .sidebar-main {
          width: 240px;
          height: 100vh;
          background: #FFFFFF;
          border-right: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          z-index: 300;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        /* ── Sidebar Header ── */
        .sidebar-header {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid #F8FAFC;
          flex-shrink: 0;
        }

        .sidebar-logo {
          cursor: pointer;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .logo-your {
          font-size: 20px;
          font-weight: 900;
          color: #000;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        .logo-notes {
          font-size: 20px;
          font-weight: 900;
          color: #E55B2D;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        /* Close button - sirf mobile mein dikhta hai */
        .sidebar-close-btn {
          display: none;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          padding: 6px;
          border-radius: 10px;
          color: #64748B;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
        }

        .sidebar-close-btn:hover {
          background: #FFF5F2;
          color: #E55B2D;
          border-color: #FFE4DB;
        }

        /* ── Navigation Area ── */
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .sidebar-nav::-webkit-scrollbar { display: none; }

        /* Nav Buttons */
        .nav-btn {
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
          transition: all 0.15s ease;
          min-height: 44px;
          border-radius: 10px;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-btn:hover {
          color: #000;
          background: #F8FAFC;
        }

        /* Active nav item */
        .nav-btn--active {
          color: #000 !important;
          font-weight: 700 !important;
          background: #FFF5F2 !important;
        }

        /* Active indicator bar (left side) */
        .nav-btn--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #E55B2D;
          border-radius: 0 4px 4px 0;
        }

        /* ── Footer Section ── */
        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-shrink: 0;
        }

        /* Profile section */
        .sidebar-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          border-radius: 10px;
          padding: 6px 0;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
        }

        .sidebar-profile:hover { opacity: 0.8; }

        /* Avatar circle */
        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #E55B2D;
          flex-shrink: 0;
          overflow: hidden;
        }

        .sidebar-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .sidebar-username {
          font-size: 13px;
          font-weight: 700;
          color: #000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-settings-label {
          font-size: 11px;
          color: #94A3B8;
          font-weight: 600;
        }

        /* Logout button */
        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          cursor: pointer;
          transition: color 0.2s;
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        .sidebar-logout-btn:hover { color: #EF4444; }

        /* ══════════════════════════════
           MOBILE RESPONSIVE STYLES
           (768px se chhote screens ke liye)
           ══════════════════════════════ */
        @media (max-width: 768px) {
          /* Mobile mein sidebar fixed drawer ban jaata hai */
          .sidebar-main {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100dvh !important;
            height: -webkit-fill-available !important;
            z-index: 300 !important;
            box-shadow: 4px 0 32px rgba(0, 0, 0, 0.15) !important;
            /* Shuru mein hidden hoga */
            transform: translateX(-100%) !important;
          }

          /* Jab open ho to dikhao */
          .sidebar-main.sidebar-open {
            transform: translateX(0) !important;
          }

          /* Mobile mein overlay dikhao */
          .sidebar-overlay {
            display: block !important;
          }

          /* Close button mobile mein dikhao */
          .sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
