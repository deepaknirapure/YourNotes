import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  Bot, Users, Trash2, LogOut, X, Settings, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Hindi: Navigation items list
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
  // Hindi: Theme context se dark mode value lo
  const { isDark, toggleTheme } = useTheme();

  const goTo = (path) => { navigate(path); if (onClose) onClose(); };
  const handleLogout = () => { logout(); navigate('/login'); };
  // Hindi: User ke naam ka pehla letter avatar ke liye
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {/* Hindi: Mobile overlay — sidebar ke bahar click karne pe close hoga */}
      {open && <div className="s-overlay" onClick={onClose} />}

      <aside className={`s-aside${open ? ' s-open' : ''}`}>
        {/* ── Header: Logo ── */}
        <div className="s-header">
          <div className="s-logo" onClick={() => goTo('/home')}>
            {/* Hindi: Text-only logo — "Your" kala, "Notes" orange */}
            YourNotes
          </div>
          <button className="s-close" onClick={onClose} aria-label="Close sidebar">
            <X size={15} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="s-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={`s-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.75} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Footer: User profile + actions ── */}
        <div className="s-footer">
          {/* Hindi: Profile row — click karne pe profile page khulega */}
          <div className="s-profile" onClick={() => goTo('/profile')}>
            <div className="s-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : initials}
            </div>
            <div className="s-user-info">
              <span className="s-username">{user?.name || 'User'}</span>
              <span className="s-usersub">View profile</span>
            </div>
          </div>

          {/* Hindi: Theme toggle */}
          <button onClick={toggleTheme} className="s-footer-btn">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Hindi: Logout button */}
          <button onClick={handleLogout} className="s-footer-btn s-logout-btn">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <style>{`
        /* Hindi: DM Sans font import — poore project me yahi font use hoga */
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        .s-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.38);
          backdrop-filter: blur(3px);
          z-index: 299; display: none;
        }

        .s-aside {
          width: 236px; min-width: 236px;
          height: 100vh; height: 100dvh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          position: relative; z-index: 300; flex-shrink: 0;
        }

        /* ── Header ── */
        .s-header {
          height: 56px;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        /* Hindi: Logo — sirf text, koi icon nahi */
        .s-logo {
          font-size: 17px; font-weight: 800; letter-spacing: -0.5px;
          cursor: pointer; user-select: none;
          /* Orange accent ke liye last 5 characters pe color lagao */
          background: linear-gradient(90deg, var(--text) 47%, var(--accent) 47%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .s-close {
          display: none; width: 28px; height: 28px;
          align-items: center; justify-content: center;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 6px; color: var(--text-3); cursor: pointer;
          transition: all 0.15s;
        }
        .s-close:hover { border-color: var(--accent); color: var(--accent); }

        /* ── Nav ── */
        .s-nav {
          flex: 1; padding: 10px 8px;
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; scrollbar-width: none;
        }
        .s-nav::-webkit-scrollbar { display: none; }

        .s-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; color: var(--text-3);
          background: transparent; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          border-radius: 10px; transition: all 0.15s;
          text-align: left; width: 100%;
        }
        .s-nav-item:hover { color: var(--text); background: var(--bg); }
        .s-nav-item.active {
          color: var(--accent); background: var(--accent-light);
          font-weight: 700;
        }

        /* ── Footer ── */
        .s-footer {
          padding: 10px; border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 4px;
          flex-shrink: 0;
        }

        .s-profile {
          display: flex; align-items: center; gap: 10px;
          padding: 8px; border-radius: 10px; cursor: pointer;
          transition: all 0.15s; border: 1px solid transparent;
        }
        .s-profile:hover { background: var(--bg); border-color: var(--border); }

        .s-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--accent); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; overflow: hidden; flex-shrink: 0;
        }
        .s-avatar img { width:100%; height:100%; object-fit:cover; }

        .s-user-info { display:flex; flex-direction:column; flex:1; min-width:0; }
        .s-username {
          font-size: 13px; font-weight: 700; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .s-usersub { font-size: 11px; color: var(--text-4); font-weight: 500; }

        .s-footer-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none;
          padding: 7px 10px; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; color: var(--text-3);
          cursor: pointer; border-radius: 8px; width: 100%;
          transition: all 0.15s;
        }
        .s-footer-btn:hover { color: var(--text); background: var(--bg); }
        .s-logout-btn:hover { color: var(--red); background: var(--red-light); }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .s-overlay { display: block; }
          .s-aside {
            position: fixed !important; left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.24s cubic-bezier(0.4,0,0.2,1);
            box-shadow: var(--shadow-lg);
          }
          .s-aside.s-open { transform: translateX(0); }
          .s-close { display: flex; }
        }
      `}</style>
    </>
  );
}