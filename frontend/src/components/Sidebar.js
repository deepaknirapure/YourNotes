import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Home, BookOpen, Folder, Bot, Users, Trash2, Settings, X, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

let _syneLoaded = false;
function useSyneFont() {
  useEffect(() => {
    if (_syneLoaded) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap';
    document.head.appendChild(link);
    _syneLoaded = true;
  }, []);
}

// Hindi: Navigation items — app ke main pages
const NAV_ITEMS = [
  { icon: Home,     label: 'Home',      path: '/home' },
  { icon: BookOpen, label: 'Notes',     path: '/dashboard' },
  { icon: Folder,   label: 'Folders',   path: '/folders' },
  { icon: Bot,      label: 'Ask AI',    path: '/ask-ai' },
  { icon: Users,    label: 'Community', path: '/community' },
  { icon: Trash2,   label: 'Trash',     path: '/trash' },
  { icon: Settings, label: 'Settings',  path: '/settings' },
];

export default function Sidebar({ open, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  // Hindi: Theme toggle ke liye
  const { isDark, toggleTheme } = useTheme();

  useSyneFont();
  const goTo = (path) => { navigate(path); if (onClose) onClose(); };
  const handleLogout = () => { logout(); navigate('/login'); };
  // Hindi: User ka pehla letter avatar ke liye
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {/* Hindi: Mobile overlay */}
      {open && <div className="s-overlay" onClick={onClose} />}

      <aside className={`s-aside${open ? ' s-open' : ''}`}>

        {/* Logo Header */}
        <div className="s-header">
          <div className="s-logo" onClick={() => goTo('/home')}>
            <span className="s-logo-your">Your</span>
            <span className="s-logo-notes">Notes</span>
            <div className="s-logo-bar" />
          </div>
          <button className="s-close" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="s-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={`s-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="s-footer">
          {/* Hindi: Profile row */}
          <div className="s-profile" onClick={() => goTo('/profile')} role="button" tabIndex={0}>
            <div className="s-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : initials}
            </div>
            <div className="s-user-info">
              <span className="s-username">{user?.name || 'User'}</span>
              <span className="s-usersub">View profile →</span>
            </div>
          </div>

          <div className="s-footer-actions">
            <button onClick={toggleTheme} className="s-action-btn">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={handleLogout} className="s-action-btn s-logout">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .s-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.32);backdrop-filter:blur(2px);z-index:299;display:none;}

        .s-aside{
          width:var(--sidebar-w,240px);min-width:var(--sidebar-w,240px);
          height:100vh;height:100dvh;
          background:var(--surface);border-right:1px solid var(--border);
          display:flex;flex-direction:column;
          font-family:var(--font,'DM Sans',sans-serif);
          position:relative;z-index:300;flex-shrink:0;
        }

        .s-header{
          height:54px;display:flex;align-items:center;justify-content:space-between;
          padding:0 16px;border-bottom:1px solid var(--border);flex-shrink:0;
        }

        /* Stacked Logo */
        .s-logo{
          display:flex;flex-direction:column;line-height:1;cursor:pointer;user-select:none;
          font-family:'Syne',sans-serif;
        }
        .s-logo-your{
          font-weight:700;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;
          color:#e8500a;line-height:1;margin-bottom:2px;
        }
        .s-logo-notes{
          font-weight:800;font-size:22px;letter-spacing:-0.04em;
          color:var(--text);line-height:0.92;
        }
        .s-logo-bar{
          width:18px;height:2px;background:#e8500a;border-radius:2px;margin-top:4px;
        }

        .s-close{
          display:none;width:26px;height:26px;align-items:center;justify-content:center;
          background:var(--bg);border:1px solid var(--border);border-radius:5px;
          color:var(--text-3);cursor:pointer;transition:all 0.15s;flex-shrink:0;
        }
        .s-close:hover{border-color:var(--accent);color:var(--accent);}

        .s-nav{flex:1;padding:8px 8px;display:flex;flex-direction:column;gap:1px;overflow-y:auto;scrollbar-width:none;}
        .s-nav::-webkit-scrollbar{display:none;}

        .s-nav-item{
          display:flex;align-items:center;gap:9px;padding:8px 10px;
          color:var(--text-3);background:transparent;border:none;cursor:pointer;
          font-family:var(--font,'DM Sans',sans-serif);font-size:13.5px;font-weight:500;
          border-radius:8px;transition:all 0.14s;text-align:left;width:100%;
        }
        .s-nav-item:hover{color:var(--text);background:var(--bg);}
        .s-nav-item.active{color:var(--accent);background:var(--accent-light);font-weight:700;}

        .s-footer{padding:10px 10px 12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:6px;flex-shrink:0;}

        .s-profile{
          display:flex;align-items:center;gap:9px;padding:8px;
          border-radius:9px;cursor:pointer;transition:all 0.14s;border:1px solid transparent;
        }
        .s-profile:hover{background:var(--bg);border-color:var(--border);}

        .s-avatar{
          width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:800;overflow:hidden;flex-shrink:0;
        }
        .s-avatar img{width:100%;height:100%;object-fit:cover;}

        .s-user-info{display:flex;flex-direction:column;flex:1;min-width:0;}
        .s-username{font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .s-usersub{font-size:11px;color:var(--text-4);font-weight:500;}

        .s-footer-actions{display:flex;flex-direction:column;gap:1px;}
        .s-action-btn{
          display:flex;align-items:center;gap:7px;background:none;border:none;
          padding:7px 8px;font-family:var(--font,'DM Sans',sans-serif);
          font-size:12.5px;font-weight:600;color:var(--text-3);
          cursor:pointer;border-radius:7px;width:100%;transition:all 0.14s;
        }
        .s-action-btn:hover{color:var(--text);background:var(--bg);}
        .s-logout:hover{color:var(--red);background:var(--red-light);}

        @media(max-width:768px){
          .s-overlay{display:block;}
          .s-aside{
            position:fixed!important;left:0;top:0;bottom:0;
            transform:translateX(-100%);
            transition:transform 0.22s cubic-bezier(0.4,0,0.2,1);
            box-shadow:var(--shadow-lg);
          }
          .s-aside.s-open{transform:translateX(0);}
          .s-close{display:flex;}
        }
      `}</style>
    </>
  );
}