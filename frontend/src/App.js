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
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const SettingsPage        = lazy(() => import('./pages/SettingsPage'));
const CommunityPage       = lazy(() => import('./pages/CommunityPage'));
const AskAIPage           = lazy(() => import('./pages/AskAIPage'));
const HomePage            = lazy(() => import('./pages/Homepage'));
const TrashPage           = lazy(() => import('./pages/Trashpage'));
const FoldersPage         = lazy(() => import('./pages/Folderspage'));
const AdminPage           = lazy(() => import('./pages/AdminPage'));
const SharedNotePage      = lazy(() => import('./pages/SharedNotePage'));
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

function ThemedToaster() {
  const { isDark } = useTheme();

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateY(0)   scale(1);    }
          to   { opacity: 0; transform: translateY(10px) scale(0.95); }
        }
      `}</style>
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1c1b1b' : '#ffffff',
            color: isDark ? '#f0efef' : '#1a1a1a',
            border: isDark ? '1px solid #2e2c2c' : '1px solid #e8e6e1',
            borderRadius: '14px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13.5px',
            fontWeight: 600,
            padding: '12px 16px',
            boxShadow: isDark
              ? '0 12px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)'
              : '0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
            maxWidth: '300px',
            lineHeight: '1.45',
            animation: 'toastSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
          },
          success: {
            duration: 2500,
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: {
              background: isDark ? '#0f1f18' : '#f0fdf4',
              color: isDark ? '#6ee7b7' : '#065f46',
              border: isDark ? '1px solid #1a3a2a' : '1px solid #bbf7d0',
              borderLeft: '3px solid #10b981',
            },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: {
              background: isDark ? '#1f0f0f' : '#fff5f5',
              color: isDark ? '#fca5a5' : '#991b1b',
              border: isDark ? '1px solid #3a1a1a' : '1px solid #fecaca',
              borderLeft: '3px solid #ef4444',
            },
          },
          loading: {
            iconTheme: { primary: 'var(--accent)', secondary: 'transparent' },
            style: {
              background: isDark ? '#1c1b1b' : '#ffffff',
              color: isDark ? '#f0efef' : '#1a1a1a',
              border: isDark ? '1px solid #2e2c2c' : '1px solid #e8e6e1',
              borderLeft: '3px solid #f97316',
            },
          },
        }}
      />
    </>
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
            <Route path="/folders"          element={<PrivateRoute><FoldersPage /></PrivateRoute>} />
            <Route path="/ask-ai"           element={<PrivateRoute><AskAIPage /></PrivateRoute>} />
            <Route path="/community"        element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
            <Route path="/trash"            element={<PrivateRoute><TrashPage /></PrivateRoute>} />
            <Route path="/profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/settings"         element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/admin"            element={<PrivateRoute><AdminPage /></PrivateRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;