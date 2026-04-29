import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  CreditCard, Bot, Users, Trash2, LogOut, X, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: Home,       label: 'Home',       path: '/home' },
  { icon: BookOpen,   label: 'Notes',      path: '/notes' },
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

  const goTo = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar-main${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => goTo('/home')}>
            <span className="logo-txt">YOUR</span>
            <span className="logo-highlight">NOTES</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
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
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
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
              <span className="username">{user?.name || 'Developer'}</span>
              <span className="subtext">Account Settings</span>
            </div>
            <Settings size={14} className="settings-icon" />
          </div>

          <button onClick={handleLogout} className="logout-action">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 299;
        }

        .sidebar-main {
          width: 260px;
          height: 100vh;
          background: #000000;
          border-right: 1px solid #1A1A1A;
          display: flex;
          flex-direction: column;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          z-index: 300;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid #1A1A1A;
        }

        .sidebar-logo {
          cursor: pointer;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .logo-txt { color: #FFFFFF; }
        .logo-highlight { color: #ccff00; margin-left: 2px; }

        .sidebar-close-btn {
          display: none;
          background: #1A1A1A;
          border: 1px solid #333;
          color: #FFF;
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          color: #888;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          transition: 0.2s;
        }

        .nav-btn:hover {
          color: #FFF;
          background: #111;
        }

        .nav-btn.active {
          color: #000 !important;
          background: #ccff00 !important;
          box-shadow: 0 4px 15px rgba(204, 255, 0, 0.2);
        }

        .sidebar-footer {
          padding: 20px;
          background: #050505;
          border-top: 1px solid #1A1A1A;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profile-section {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 10px;
          border-radius: 12px;
          transition: 0.2s;
          border: 1px solid transparent;
        }

        .profile-section:hover {
          background: #111;
          border-color: #222;
        }

        .avatar-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #ccff00;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
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
          color: #FFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subtext {
          font-size: 11px;
          color: #555;
          font-weight: 700;
          text-transform: uppercase;
        }

        .settings-icon { color: #333; }

        .logout-action {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          padding: 8px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #555;
          cursor: pointer;
          transition: 0.2s;
        }

        .logout-action:hover { color: #FF4444; }

        @media (max-width: 768px) {
          .sidebar-main {
            position: fixed;
            transform: translateX(-100%);
          }
          .sidebar-main.sidebar-open { transform: translateX(0); }
          .sidebar-close-btn { display: flex; }
        }
      `}</style>
    </>
  );
}