import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  CreditCard, Bot, Users, Trash2, LogOut, X, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: Home,       label: 'Home',       path: '/home' },
  { icon: BookOpen,   label: 'Notes',      path: '/dashboard' },
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

  const goTo = (path) => { navigate(path); if (onClose) onClose(); };
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar-main${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => goTo('/home')}>
            <span className="logo-txt">Your</span>
            <span className="logo-highlight">Notes</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={`nav-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-section" onClick={() => goTo('/profile')}>
            <div className="avatar-box">
              {user?.avatar ? <img src={user.avatar} alt="User" /> : initials}
            </div>
            <div className="user-details">
              <span className="username">{user?.name || 'User'}</span>
              <span className="subtext">Account Settings</span>
            </div>
            <Settings size={14} className="settings-icon" />
          </div>

          <button onClick={handleLogout} className="logout-action">
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(21, 19, 19, 0.7);
          backdrop-filter: blur(5px);
          z-index: 299;
          display: none;
        }

        .sidebar-main {
          width: 252px;
          min-width: 252px;
          height: 100vh;
          height: 100dvh;
          background: #1e1b1b;
          border-right: 1px solid #2a2525;
          display: flex;
          flex-direction: column;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          z-index: 300;
          flex-shrink: 0;
        }

        .sidebar-header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          border-bottom: 1px solid #2a2525;
          flex-shrink: 0;
        }

        .sidebar-logo {
          cursor: pointer;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.5px;
          user-select: none;
        }

        .logo-txt { color: #f7f7f5; }
        .logo-highlight {
          color: #ff5734;
          margin-left: 2px;
          position: relative;
        }

        .sidebar-close-btn {
          display: none;
          background: #2a2525;
          border: 1px solid #3a3535;
          color: #f7f7f5;
          padding: 7px;
          border-radius: 8px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
          flex-shrink: 0;
        }
        .sidebar-close-btn:hover { background: #ff5734; border-color: #ff5734; }

        .sidebar-nav {
          flex: 1;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          color: #8a7f7f;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 12px;
          transition: all 0.18s;
          text-align: left;
          width: 100%;
          font-family: inherit;
        }

        .nav-btn:hover {
          color: #f7f7f5;
          background: #2a2525;
        }

        .nav-btn.active {
          color: #ff5734 !important;
          background: rgba(255, 87, 52, 0.12) !important;
          border: 1px solid rgba(255, 87, 52, 0.2) !important;
        }

        .sidebar-footer {
          padding: 16px;
          background: #1e1b1b;
          border-top: 1px solid #2a2525;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
        }

        .profile-section {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 10px;
          border-radius: 12px;
          transition: 0.2s;
          background: #2a2525;
          border: 1px solid #3a3535;
        }

        .profile-section:hover {
          background: #2f2a2a;
          border-color: #ff5734;
        }

        .avatar-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ff5734;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 15px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .avatar-box img { width: 100%; height: 100%; object-fit: cover; }

        .user-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .username {
          font-size: 13px;
          font-weight: 800;
          color: #f7f7f5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subtext {
          font-size: 10px;
          color: #8a7f7f;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .settings-icon { color: #8a7f7f; flex-shrink: 0; }

        .logout-action {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #8a7f7f;
          cursor: pointer;
          transition: 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: inherit;
          border-radius: 8px;
          width: 100%;
        }

        .logout-action:hover { color: #ff5734; background: rgba(255,87,52,0.08); }

        @media (max-width: 768px) {
          .sidebar-overlay { display: block; }
          .sidebar-main {
            position: fixed;
            transform: translateX(-100%);
            box-shadow: 4px 0 40px rgba(0,0,0,0.5);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar-main.sidebar-open { transform: translateX(0); }
          .sidebar-close-btn { display: flex; }
        }
      `}</style>
    </>
  );
}
