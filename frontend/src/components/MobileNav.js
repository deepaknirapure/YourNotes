// MobileNav.js - Optimized Bottom Navigation
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Bot, Folder, Star } from 'lucide-react';

const BOTTOM_NAV = [
  { icon: Home,     label: 'Home',    path: '/home' },
  { icon: BookOpen, label: 'Notes',   path: '/dashboard' },
  { icon: Bot,      label: 'AI Chat',  path: '/ask-ai' },
  { icon: Folder,   label: 'Folders', path: '/folders' },
  { icon: Star,     label: 'Starred', path: '/starred' },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav">
      <style>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(65px + env(safe-area-inset-bottom, 0px));
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          z-index: 500;
        }

        .mb-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          flex: 1;
          height: 100%;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .mb-nav-btn span {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Active State Style */
        .mb-nav-btn.active {
          color: #000000;
        }

        .mb-nav-btn.active svg {
          color: #000000;
          fill: #ccff00; /* Subtle neon fill for active icon */
          transform: translateY(-2px);
        }

        .mb-nav-btn.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: #ccff00;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 10px rgba(204, 255, 0, 0.5);
        }

        /* Hide on Desktop */
        @media (min-width: 769px) {
          .mobile-bottom-nav { display: none; }
        }
      `}</style>

      {BOTTOM_NAV.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            className={`mb-nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}