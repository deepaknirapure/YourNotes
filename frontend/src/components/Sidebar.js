import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag, CreditCard,
  Bot, Users, Trash2, User, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: Home,       label: 'Home',        path: '/home' },
  { icon: BookOpen,   label: 'Dashboard',   path: '/dashboard' },
  { icon: Star,       label: 'Starred',     path: '/starred' },
  { icon: Folder,     label: 'Folders',     path: '/folders' },
  { icon: Tag,        label: 'Tags',        path: '/tags' },
  { icon: CreditCard, label: 'Flashcards',  path: '/flashcard-review' },
  { icon: Bot,        label: 'Ask AI',      path: '/ask-ai' },
  { icon: Users,      label: 'Community',   path: '/community' },
  { icon: Trash2,     label: 'Trash',       path: '/trash' },
];

const S = `
  @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
  .yn-sidebar{
    width:220px;height:100vh;background:#000;border-right:1px solid rgba(255,255,255,.07);
    display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;
    font-family:'Geist',-apple-system,sans-serif;
  }
  .yn-sidebar.mobile{
    position:fixed;left:0;top:0;z-index:50;animation:slideIn .22s cubic-bezier(.16,1,.3,1);
  }
  .yn-sb-header{
    height:52px;display:flex;align-items:center;justify-content:space-between;
    padding:0 14px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;
  }
  .yn-sb-logo{display:flex;align-items:center;gap:7px;}
  .yn-sb-logo-icon{width:22px;height:22px;background:#E55B2D;border-radius:5px;display:flex;align-items:center;justify-content:center;}
  .yn-sb-logo-text{font-size:13px;font-weight:700;color:#fff;}
  .yn-sb-close{background:none;border:none;color:rgba(255,255,255,.35);cursor:pointer;padding:4px;display:none;}
  .yn-sidebar.mobile .yn-sb-close{display:flex;}
  .yn-sb-nav{flex:1;overflow-y:auto;padding:8px 6px;}
  .yn-sb-item{
    display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;
    font-size:13px;font-weight:500;color:rgba(255,255,255,.45);cursor:pointer;
    transition:background .12s,color .12s;margin-bottom:2px;border:none;background:none;
    width:100%;text-align:left;font-family:inherit;
  }
  .yn-sb-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);}
  .yn-sb-item.active{background:rgba(229,91,45,.1);color:#E55B2D;}
  .yn-sb-footer{
    padding:10px 6px;border-top:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;gap:2px;
  }
  .yn-sb-user{
    display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;
    font-size:12px;color:rgba(255,255,255,.5);overflow:hidden;
  }
  .yn-sb-avatar{
    width:26px;height:26px;border-radius:50%;background:#E55B2D;display:flex;align-items:center;
    justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;
  }
  .yn-sb-username{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;color:rgba(255,255,255,.65);}
`;

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // On desktop: always visible (no mobile class).
  // On mobile: shown only when open=true, with slide-in animation.
  const isMobileOpen = open === true;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 769;

  return (
    <>
      <style>{S}</style>
      {/* Desktop sidebar */}
      <aside className="yn-sidebar" style={{ display: 'none' }}
        data-desktop-sidebar="true" />

      {/* The real sidebar — always rendered, visibility controlled via CSS */}
      <style>{`
        @media(min-width:769px){
          [data-yn-sidebar]{display:flex!important;position:static!important;}
        }
        @media(max-width:768px){
          [data-yn-sidebar]{display:${isMobileOpen ? 'flex' : 'none'}!important;position:fixed!important;}
        }
      `}</style>
      <aside
        data-yn-sidebar
        className={`yn-sidebar${isMobileOpen ? ' mobile' : ''}`}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div className="yn-sb-header">
          <div className="yn-sb-logo">
            <div className="yn-sb-logo-icon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
            </div>
            <span className="yn-sb-logo-text">Your<span style={{ color: '#E55B2D' }}>Notes</span></span>
          </div>
          <button className="yn-sb-close" onClick={onClose}><X size={16} /></button>
        </div>

        <nav className="yn-sb-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              className={`yn-sb-item${location.pathname === path ? ' active' : ''}`}
              onClick={() => handleNav(path)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="yn-sb-footer">
          <button className="yn-sb-item" onClick={() => handleNav('/profile')}>
            <User size={15} />Profile
          </button>
          <div className="yn-sb-user">
            <div className="yn-sb-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="yn-sb-username">{user?.name || 'Student'}</span>
          </div>
          <button className="yn-sb-item" style={{ color: '#ef4444' }} onClick={handleLogout}>
            <LogOut size={15} />Logout
          </button>
        </div>
      </aside>
    </>
  );
}
