import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Lazy-load all pages for better performance
const LandingPage       = lazy(() => import("./pages/LandingPage"));
const LoginPage         = lazy(() => import("./pages/LoginPage"));
const RegisterPage      = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage     = lazy(() => import("./pages/DashboardPage"));
const FlashcardReviewPage = lazy(() => import("./pages/FlashcardReviewPage"));
const SharedNotePage    = lazy(() => import("./pages/SharedNotePage"));
const ProfilePage       = lazy(() => import("./pages/ProfilePage"));
const CommunityPage     = lazy(() => import("./pages/CommunityPage"));
const AskAIPage         = lazy(() => import("./pages/AskAIPage"));
const NotFoundPage      = lazy(() => import("./pages/NotFoundPage"));

// Full-screen spinner shown during lazy load
const PageLoader = () => (
  <div style={{
    height: "100vh", background: "#0a0a0a",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      width: 40, height: 40,
      border: "3px solid rgba(229,91,45,.2)",
      borderTopColor: "#E55B2D",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#E55B2D", secondary: "#fff" } },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                   element={<LandingPage />} />
            <Route path="/login"              element={<LoginPage />} />
            <Route path="/register"           element={<RegisterPage />} />
            <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/shared/:token"      element={<SharedNotePage />} />
            <Route path="/dashboard"          element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/flashcard-review"   element={<PrivateRoute><FlashcardReviewPage /></PrivateRoute>} />
            <Route path="/profile"            element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/community"          element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
            <Route path="/ask-ai"             element={<PrivateRoute><AskAIPage /></PrivateRoute>} />
            <Route path="*"                   element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
