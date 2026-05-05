import { useNavigate, useLocation } from 'react-router-dom';
// Users icon add kiya gaya hai
import { Home, BookOpen, Bot, Folder, Star, Users } from 'lucide-react';

const BOTTOM_NAV = [
  { icon: Home,     label: 'Home',      path: '/home' },
  { icon: BookOpen, label: 'Notes',     path: '/dashboard' },
  { icon: Bot,      label: 'AI',        path: '/ask-ai' },
  { icon: Users,    label: 'Community', path: '/community' }, // Naya Button
  { icon: Folder,   label: 'Folders',   path: '/folders' },
  { icon: Star,     label: 'Starred',   path: '/starred' },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav">
      <style>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: calc(64px + env(safe-area-inset-bottom, 0px));
          background: rgba(30, 27, 27, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid #2a2525;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          z-index: 500;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.4);
        }

        .mb-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: none;
          border: none;
          color: #8a7f7f;
          cursor: pointer;
          flex: 1;
          height: 100%;
          transition: color 0.2s;
          position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 0;
          min-height: 44px;
        }

        .mb-nav-btn span {
          font-size: 9px; /* Items badhne par font thoda chota kiya taaki fit ho sake */
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }

        .mb-nav-btn.active { color: #ff5734; }

        .mb-nav-btn.active svg {
          filter: drop-shadow(0 0 6px rgba(255,87,52,0.55));
        }

        .mb-nav-btn.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          background: #ff5734;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 10px rgba(255, 87, 52, 0.5);
        }

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
            aria-label={label}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}