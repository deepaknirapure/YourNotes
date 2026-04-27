// यह main App file hai - routing aur providers yahan set hote hain
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Lazy loading: pages tabhi load hote hain jab user unpar jaye
// (ye app ko fast banata hai)
const LandingPage         = lazy(() => import('./pages/LandingPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage       = lazy(() => import('./pages/DashboardPage'));
const FlashcardReviewPage = lazy(() => import('./pages/FlashcardReviewPage'));
const SharedNotePage      = lazy(() => import('./pages/SharedNotePage'));
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const CommunityPage       = lazy(() => import('./pages/CommunityPage'));
const AskAIPage           = lazy(() => import('./pages/AskAIPage'));
const HomePage            = lazy(() => import('./pages/HomePage'));
const TrashPage           = lazy(() => import('./pages/TrashPage'));
const StarredPage         = lazy(() => import('./pages/StarredPage'));
const FoldersPage         = lazy(() => import('./pages/FoldersPage'));
const TagsPage            = lazy(() => import('./pages/TagsPage'));

// 404 page - jab koi route na mile
function NotFoundPage() {
  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      fontFamily: "'Geist', sans-serif",
      color: '#fff',
    }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: '#E55B2D', letterSpacing: '-3px' }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Page not found</div>
      <a href="/" style={{ marginTop: 8, color: '#E55B2D', fontSize: 14, fontWeight: 600 }}>← Go Home</a>
    </div>
  );
}

// Loading screen - page load hone tak dikhta hai
function PageLoader() {
  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(229,91,45,0.2)',
        borderTopColor: '#E55B2D',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    // AuthProvider - poori app mein auth state available karta hai
    <AuthProvider>
      <Router>
        {/* Toast notifications - success/error messages ke liye */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontFamily: "'Geist', sans-serif",
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#E55B2D', secondary: '#fff' } },
          }}
        />

        {/* Suspense - lazy loaded pages ke liye fallback */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes - bina login ke accessible */}
            <Route path="/"                      element={<LandingPage />} />
            <Route path="/login"                 element={<LoginPage />} />
            <Route path="/register"              element={<RegisterPage />} />
            <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/shared/:token"         element={<SharedNotePage />} />

            {/* Protected routes - sirf logged-in users ke liye */}
            <Route path="/home"            element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/dashboard"       element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/starred"         element={<PrivateRoute><StarredPage /></PrivateRoute>} />
            <Route path="/folders"         element={<PrivateRoute><FoldersPage /></PrivateRoute>} />
            <Route path="/tags"            element={<PrivateRoute><TagsPage /></PrivateRoute>} />
            <Route path="/flashcard-review" element={<PrivateRoute><FlashcardReviewPage /></PrivateRoute>} />
            <Route path="/ask-ai"          element={<PrivateRoute><AskAIPage /></PrivateRoute>} />
            <Route path="/community"       element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
            <Route path="/trash"           element={<PrivateRoute><TrashPage /></PrivateRoute>} />
            <Route path="/profile"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            


            {/* 404 - koi route match na ho to */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
