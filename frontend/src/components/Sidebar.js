import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  Bot, Users, Trash2, LogOut, X, Settings, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { icon: Home,       label: 'Home',       path: '/home' },
  { icon: BookOpen,   label: 'Notes',      path: '/dashboard' },
  { icon: Folder,     label: 'Folders',    path: '/folders' },
  { icon: Bot,        label: 'Ask AI',     path: '/ask-ai' },
  { icon: Users,      label: 'Community',  path: '/community' },
  { icon: Trash2,     label: 'Trash',      path: '/trash' },
  { icon: Settings,   label: 'Settings',   path: '/settings' },
];

export default function Sidebar({ open, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  // Hindi: Theme context se isDark value lo
  const { isDark, toggleTheme } = useTheme();

  const goTo = (path) => { navigate(path); if (onClose) onClose(); };
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar-main${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => goTo('/home')}>
            <div className="logo-mark">
              <BookOpen size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="logo-txt">Your<span className="logo-accent">Notes</span></span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button key={path} onClick={() => goTo(path)} className={`nav-btn${isActive ? ' active' : ''}`}>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-row" onClick={() => goTo('/profile')}>
            <div className="avatar">
              {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
            </div>
            <div className="user-info">
              <span className="username">{user?.name || 'User'}</span>
              <span className="user-sub">My account</span>
            </div>
            <Settings size={13} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={14} /> Sign out
          </button>

          {/* Hindi: Dark/Light mode toggle button */}
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Hindi: CSS variables use kar rahe hain — dark/light automatic switch hoga */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .sidebar-overlay {
          position: fixed; inset: 0;
          background: rgba(26,26,26,0.45);
          backdrop-filter: blur(4px);
          z-index: 299; display: none;
        }

        .sidebar-main {
          width: 240px; min-width: 240px; height: 100vh; height: 100dvh;
          background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; z-index: 300; flex-shrink: 0;
        }

        .sidebar-header {
          height: 58px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 18px;
          border-bottom: 1px solid var(--border); flex-shrink: 0;
        }

        .sidebar-logo {
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          font-size: 18px; font-weight: 900; letter-spacing: -0.5px; user-select: none;
        }
        .logo-mark {
          width: 26px; height: 26px; background: #f97316; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-txt { color: var(--text); }
        .logo-accent { color: #f97316; }

        .sidebar-close-btn {
          display: none; background: var(--bg); border: 1px solid var(--border);
          color: var(--text-muted); padding: 6px; border-radius: 7px;
          cursor: pointer; align-items: center; justify-content: center; transition: 0.15s;
        }
        .sidebar-close-btn:hover { border-color: #f97316; color: #f97316; }

        .sidebar-nav {
          flex: 1; padding: 12px 10px;
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; scrollbar-width: none;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; color: var(--text-muted);
          background: transparent; border: none; cursor: pointer;
          font-size: 13.5px; font-weight: 600; border-radius: 9px;
          transition: all 0.15s; text-align: left; width: 100%; font-family: inherit;
        }
        .nav-btn:hover { color: var(--text); background: var(--bg); }
        .nav-btn.active {
          color: #f97316 !important; background: rgba(249,115,22,0.08) !important;
          font-weight: 700;
        }

        .sidebar-footer {
          padding: 12px; border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
        }

        .profile-row {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          padding: 10px; border-radius: 10px; transition: 0.15s;
          border: 1px solid transparent;
        }
        .profile-row:hover { background: var(--bg); border-color: var(--border); }

        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #f97316; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px; overflow: hidden; flex-shrink: 0;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }

        .user-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .username {
          font-size: 13px; font-weight: 700; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .user-sub { font-size: 11px; color: var(--text-light); font-weight: 600; }

        .logout-btn {
          display: flex; align-items: center; gap: 7px;
          background: none; border: none; padding: 7px 10px;
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; transition: 0.15s; font-family: inherit;
          border-radius: 7px; width: 100%;
        }
        .logout-btn:hover { color: #f97316; background: rgba(249,115,22,0.06); }

        /* Hindi: Theme toggle button */
        .theme-toggle-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--bg); border: 1px solid var(--border); padding: 7px 10px;
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; transition: 0.15s; font-family: inherit;
          border-radius: 7px; width: 100%;
        }
        .theme-toggle-btn:hover { border-color: #f97316; color: #f97316; }

        @media (max-width: 768px) {
          .sidebar-overlay { display: block; }
          .sidebar-main {
            position: fixed; transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
            transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          }
          .sidebar-main.sidebar-open { transform: translateX(0); }
          .sidebar-close-btn { display: flex; }
        }
      `}</style>
    </>
  );
}
