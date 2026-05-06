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
