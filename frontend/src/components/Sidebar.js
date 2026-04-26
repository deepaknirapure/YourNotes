import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Star, Folder, Tag,
  CreditCard, Bot, Users, Trash2, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: Home,        label: 'Home',       path: '/home' },
  { icon: BookOpen,    label: 'Dashboard',  path: '/dashboard' },
  { icon: Star,        label: 'Starred',    path: '/starred' },
  { icon: Folder,      label: 'Folders',    path: '/folders' },
  { icon: Tag,         label: 'Tags',       path: '/tags' },
  { icon: CreditCard,  label: 'Flashcards', path: '/flashcard-review' },
  { icon: Bot,         label: 'Ask AI',     path: '/ask-ai' },
  { icon: Users,       label: 'Community',  path: '/community' },
  { icon: Trash2,      label: 'Trash',      path: '/trash' },
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

  const avatarLetter = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sidebar-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link-active {
          color: #FFF !important;
          background: #0F172A !important;
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.3);
        }

        .nav-link-active svg {
          color: #E55B2D !important;
        }

        @media (min-width: 769px) {
          .sidebar-container { display: flex !important; position: static !important; }
        }

        @media (max-width: 768px) {
          .sidebar-container {
            display: ${open ? 'flex' : 'none'} !important;
            position: fixed !important;
            z-index: 100;
            left: 12px;
            top: 12px;
            bottom: 12px;
            width: 280px !important;
            border-radius: 24px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
          }
        }
      `}</style>

      <aside className="sidebar-container" style={{
        width: 280,
        height: '100vh',
        background: '#FFF',
        borderRight: '1px solid #F1F5F9',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        gap: '8px',
        flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        
        {/* --- BRAND LOGO --- */}
        <div style={{
          padding: '24px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div onClick={() => goTo('/home')} style={{ cursor: 'pointer' }}>
            <span style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '28px', 
              color: '#0F172A',
              marginRight: '2px'
            }}>Your</span>
            <span style={{ 
              fontSize: '22px', 
              fontWeight: 800, 
              color: '#0F172A',
              letterSpacing: '-1.5px',
              textTransform: 'uppercase'
            }}>Notes</span>
            <div style={{ width: '32px', height: '4px', background: '#E55B2D', borderRadius: '10px', marginTop: '-2px' }} />
          </div>
          
          <button onClick={onClose} className="hide-desktop" style={{ display: 'none', background: '#F8FAFC', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
             <X size={18} color="#64748B" />
          </button>
        </div>

        {/* --- NAV MENU --- */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', paddingRight: '4px' }}>
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => goTo(path)}
                className={isActive ? 'nav-link-active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748B',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: '0.2s',
                  textAlign: 'left',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* --- USER PROFILE SECTION --- */}
        <div style={{
          marginTop: 'auto',
          padding: '16px',
          background: '#F8FAFC',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '14px',
              overflow: 'hidden'
            }}>
              {user?.profilePic ? <img src={user.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="P" /> : avatarLetter}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Pro Student'}
              </span>
              <span style={{ fontSize: '11px', color: '#E55B2D', fontWeight: 700, letterSpacing: '0.5px' }}>PREMIUM</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => goTo('/profile')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '12px', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
            >
              Profile
            </button>
            <button 
              onClick={handleLogout}
              style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}