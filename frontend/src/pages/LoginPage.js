// यह Login page hai - user apna account access karta hai
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { FieldGroup, AUTH_STYLES } from '../components/AuthLayout';

export default function LoginPage() {
  // Form data state
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.email || !form.password) {
      return toast.error('Please enter email and password');
    }

    setLoading(true);
    try {
      // API call karo login ke liye
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token); // auth context update karo
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Form field update helper
  const updateField = (key) => (val) => setForm({ ...form, [key]: val });

  return (
    <div className="auth-wrap">
      <style>{AUTH_STYLES}</style>

      {/* Left decorative panel - desktop par dikhta hai */}
      <div className="auth-left">
        {/* Diagonal grid lines */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="auth-grid-line" style={{ left: `${8 + i * 21}%` }} />
        ))}

        {/* Glow effect */}
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(229,91,45,0.07) 0%, transparent 70%)',
        }} />

        {/* Logo - top left */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, background: '#E55B2D',
              borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Your<span style={{ color: '#E55B2D' }}>Notes</span>
            </span>
          </div>
        </div>

        {/* Main marketing text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-badge">
            <span className="auth-dot" />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#E55B2D', letterSpacing: '0.08em' }}>
              STUDENT NOTES PLATFORM
            </span>
          </div>
          <h2 style={{
            fontSize: 42, fontWeight: 800, color: '#fff',
            letterSpacing: '-2px', lineHeight: 1.06, marginBottom: 16,
          }}>
            Welcome back<br />to your workspace.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.65, maxWidth: 300 }}>
            Notes, AI summaries and flashcards — all in one place.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 28, marginTop: 40 }}>
            {[
              { v: '1M+',  l: 'Students' },
              { v: '662k', l: 'Notes'    },
              { v: 'Free', l: 'Always'   },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#E55B2D', letterSpacing: '-1px' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer card */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '16px 18px',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#E55B2D', letterSpacing: '0.08em', marginBottom: 3 }}>
            ✓ STUDENT PROJECT
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            S.V. Polytechnic College, Bhopal · 2026
          </p>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="auth-right">
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1.2px', marginBottom: 6 }}>
            Sign In
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            Log in to your account to continue.
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldGroup
            label="Email Address"
            icon={<Mail size={14} />}
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={updateField('email')}
          />
          <FieldGroup
            label="Password"
            icon={<Lock size={14} />}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={updateField('password')}
          />

          {/* Forgot password link */}
          <div style={{ textAlign: 'right', marginTop: -6 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: '#E55B2D', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 4 }}>
            {loading ? 'Signing in...' : (
              <><span>Sign In</span><ArrowRight size={15} /></>
            )}
          </button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: '#E55B2D', fontWeight: 700 }}>Register here</Link>
        </p>

        <p style={{
          marginTop: 'auto', paddingTop: 36,
          textAlign: 'center', fontSize: 10,
          color: 'rgba(255,255,255,0.1)', letterSpacing: '3px', fontWeight: 700,
        }}>
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}
