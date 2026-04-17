import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SharedNotePage from "./pages/SharedNotePage";
import LandingPage from "./pages/LandingPage";
import FlashcardReviewPage from "./pages/FlashcardReviewPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/shared/:token" element={<SharedNotePage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          {/* FIX: dashboard uses navigate('/flashcards'), so both routes needed */}
          <Route
            path="/flashcards"
            element={
              <PrivateRoute>
                <FlashcardReviewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/flashcard-review"
            element={
              <PrivateRoute>
                <FlashcardReviewPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 