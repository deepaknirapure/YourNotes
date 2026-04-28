// MobileNav.js - Bottom navigation bar for mobile
// Pages pe import karke use karo: <MobileNav />
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
  );
}
