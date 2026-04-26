// यह component protected pages ko guard karta hai
// Agar user logged in nahi hai to login page par redirect karo
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading screen jab auth check ho raha ho
function LoadingScreen() {
  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Spinning loader */}
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid rgba(229,91,45,0.2)',
        borderTopColor: '#E55B2D',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// PrivateRoute: sirf logged-in users ko andar jaane deta hai
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  // Auth load ho raha hai - wait karo (refresh par redirect bug fix)
  if (loading) return <LoadingScreen />;

  // Token hai to page dikhao, nahi hai to login par bhejo
  return token ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
