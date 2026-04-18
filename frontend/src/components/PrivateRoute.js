import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Full-screen loading while auth state is being restored from localStorage
const AuthLoader = () => (
  <div style={{
    height: '100vh', background: '#0a0a0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid rgba(229,91,45,.2)',
      borderTopColor: '#E55B2D',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  // ✅ Wait for auth to load — prevents redirect-on-refresh bug
  if (loading) return <AuthLoader />;

  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
