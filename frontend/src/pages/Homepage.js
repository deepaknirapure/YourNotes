import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import './styles/global.css';
import './styles/mobile.css';

const LandingPage         = lazy(() => import('./pages/LandingPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'));
const NotesPage           = lazy(() => import('./pages/DashboardPage'));
const SharedNotePage      = lazy(() => import('./pages/SharedNotePage'));
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const SettingsPage        = lazy(() => import('./pages/SettingsPage'));
const CommunityPage       = lazy(() => import('./pages/CommunityPage'));
const AskAIPage           = lazy(() => import('./pages/AskAIPage'));
const HomePage            = lazy(() => import('./pages/Homepage'));
const TrashPage           = lazy(() => import('./pages/Trashpage'));
const StarredPage         = lazy(() => import('./pages/Starredpage'));
const FoldersPage         = lazy(() => import('./pages/Folderspage'));
const TagsPage            = lazy(() => import('./pages/Tagspage'));

function NotFoundPage() {
  return (
    <div style={{
      height: '100vh', height: '100dvh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-4px' }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Page not found</div>
      <a href="/" style={{ color: 'var(--purple)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Go Home</a>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{
      height: '100vh', height: '100dvh',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Hindi: Theme ke hisaab se Toaster ka style change karo
function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#1e1919' : '#ffffff',
          color: isDark ? '#f5f5f4' : '#1a1a1a',
          border: isDark ? '1px solid #2a2828' : '1px solid #e8e6e1',
          borderRadius: '12px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
        },
        success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Router>
        <ThemedToaster />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                      element={<LandingPage />} />
            <Route path="/login"                 element={<LoginPage />} />
            <Route path="/register"              element={<RegisterPage />} />
            <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/shared/:token"         element={<SharedNotePage />} />

            <Route path="/home"             element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/dashboard"        element={<PrivateRoute><NotesPage /></PrivateRoute>} />
            <Route path="/notes"            element={<PrivateRoute><NotesPage /></PrivateRoute>} />
            <Route path="/starred"          element={<PrivateRoute><StarredPage /></PrivateRoute>} />
            <Route path="/folders"          element={<PrivateRoute><FoldersPage /></PrivateRoute>} />
            <Route path="/tags"             element={<PrivateRoute><TagsPage /></PrivateRoute>} />
            <Route path="/ask-ai"           element={<PrivateRoute><AskAIPage /></PrivateRoute>} />
            <Route path="/community"        element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
            <Route path="/trash"            element={<PrivateRoute><TrashPage /></PrivateRoute>} />
            <Route path="/profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/settings"         element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

// यह component Login aur Register pages ka shared left panel hai
// Dono pages ka left side same dikhta tha - isliye ek component banaya

// Field input component - reusable input field
export function FieldGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      <label style={{
        fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
      }}>
        {label}
      </label>
      {/* Input with icon */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 11,
          top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'inherit',
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#E55B2D';
            e.target.style.background = 'rgba(229,91,45,0.04)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.background = '#111';
          }}
        />
      </div>
    </div>
  );
}

// Auth page CSS - Login aur Register dono ke liye
export const AUTH_STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  .auth-wrap {
    display: flex;
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Geist', -apple-system, sans-serif;
  }
  .auth-left {
    flex: 1;
    background: #000;
    border-right: 1px solid rgba(255,255,255,0.07);
    padding: 48px 6%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .auth-right {
    width: 440px;
    padding: 0 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #0a0a0a;
    animation: fadeUp 0.5s ease both;
  }
  .auth-grid-line {
    position: absolute;
    width: 1px;
    height: 200%;
    background: rgba(255,255,255,0.025);
    top: -50%;
    transform: rotate(12deg);
  }
  .auth-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(229,91,45,0.3);
    border-radius: 4px;
    padding: 3px 10px;
    margin-bottom: 24px;
  }
  .auth-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #E55B2D;
    animation: pulse 2s infinite;
  }
  .auth-btn {
    width: 100%;
    padding: 11px;
    background: #E55B2D;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-btn:hover:not(:disabled) {
    background: #d14e24;
    box-shadow: 0 6px 20px rgba(229,91,45,0.3);
  }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Mobile par left panel hide karo */
  @media (max-width: 768px) {
    .auth-left  { display: none !important; }
    .auth-right { width: 100% !important; padding: 40px 24px !important; min-height: 100vh; }
  }
`;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Star, Globe, ChevronRight, Brain, Folder, Zap, Menu, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .home-root { display: flex; height: 100dvh; background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; }
  .home-main { flex: 1; overflow-y: auto; scrollbar-width: none; min-width: 0; }
  .home-main::-webkit-scrollbar { display: none; }

  .home-topbar {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .menu-btn { display: none; background: transparent; border: 1px solid var(--border); border-radius: 7px; cursor: pointer; padding: 7px; color: var(--text-muted); align-items: center; justify-content: center; transition: 0.15s; }
  .menu-btn:hover { border-color: #f97316; color: #f97316; }
  .page-title { font-size: 14px; font-weight: 800; color: var(--text); }
  .user-greet { font-size: 12px; color: var(--text-light); font-weight: 500; }

  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 9px; padding: 7px 14px; width: 240px; transition: 0.18s;
  }
  .search-bar:focus-within { border-color: #f97316; background: var(--surface); }
  .search-bar input { border: none; outline: none; background: transparent; font-size: 13px; font-weight: 500; color: var(--text); font-family: inherit; width: 100%; }
  .search-bar input::placeholder { color: #c8c5be; }

  .home-body { padding: 28px 32px; }

  /* Hero */
  .hero-banner {
    background: #1a1a1a; border-radius: 20px; padding: 40px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; overflow: hidden; animation: fadeUp 0.4s both;
  }
  .hero-deco { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%); top: -80px; right: -80px; }
  .hero-deco2 { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%); bottom: -60px; left: 200px; }
  .hero-text { position: relative; z-index: 1; }
  .hero-eyebrow { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .hero-title { font-size: clamp(24px, 3vw, 36px); font-weight: 900; color: #fff; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 20px; }
  .hero-title em { color: #f97316; font-style: normal; }
  .hero-actions { display: flex; gap: 12px; }
  .btn-hero-primary { background: #f97316; color: #fff; border: none; border-radius: 9px; padding: 10px 20px; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit; display: flex; align-items: center; gap: 7px; }
  .btn-hero-primary:hover { background: #ea6c0a; box-shadow: 0 4px 16px rgba(249,115,22,0.35); }
  .btn-hero-secondary { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.12); border-radius: 9px; padding: 9px 18px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit; }
  .btn-hero-secondary:hover { background: rgba(255,255,255,0.12); }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; animation: fadeUp 0.35s both; transition: 0.2s; }
`;

