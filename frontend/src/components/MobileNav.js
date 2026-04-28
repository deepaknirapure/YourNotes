// MobileNav.js - Bottom navigation bar for mobile only
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Bot, Folder, Star } from 'lucide-react';

const BOTTOM_NAV = [
  { icon: Home,     label: 'Home',      path: '/home' },
  { icon: BookOpen, label: 'Notes',     path: '/dashboard' },
  { icon: Bot,      label: 'Ask AI',    path: '/ask-ai' },
  { icon: Folder,   label: 'Folders',   path: '/folders' },
  { icon: Star,     label: 'Starred',   path: '/starred' },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: #FFFFFF;
            border-top: 1px solid #E2E8F0;
            z-index: 100;
            align-items: center;
            justify-content: space-around;
            padding: 0 4px;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
          }
          .mb-nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            flex: 1;
            padding: 8px 4px;
            background: none;
            border: none;
            cursor: pointer;
            color: #94A3B8;
            transition: color 0.2s;
            -webkit-tap-highlight-color: transparent;
            font-size: 10px;
            font-weight: 600;
            font-family: inherit;
            min-height: 44px;
          }
          .mb-nav-btn.active {
            color: #E55B2D;
          }
          .mb-nav-btn span {
            font-size: 10px;
            font-weight: 600;
          }
          .pg-content, .saas-main, .flashcard-wrap {
            padding-bottom: 72px !important;
          }
        }
      `}</style>

      <nav className="mobile-bottom-nav">
        {BOTTOM_NAV.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className={`mb-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
