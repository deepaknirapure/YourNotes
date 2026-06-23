import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:          '#0d0c0c',
  surface:     '#161514',
  surface2:    '#1e1c1b',
  surface3:    '#252321',
  border:      '#2c2a28',
  border2:     '#363330',
  text:        '#f2f1ef',
  textMuted:   '#7d7975',
  textLight:   '#4a4745',
  accent:      '#f97316',
  accentHover: '#ea6c04',
  accentLow:   'rgba(249,115,22,0.09)',
  accentBorder:'rgba(249,115,22,0.22)',
  green:       '#10b981',
  greenLow:    'rgba(16,185,129,0.08)',
  greenBorder: 'rgba(16,185,129,0.22)',
  red:         '#ef4444',
  font:        "'Plus Jakarta Sans', sans-serif",
};

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function InputBox({ icon, rightSlot, error, label, hint, ...props }) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? T.red : focus ? T.accent : T.border;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 700,
          color: error ? T.red : T.textMuted, marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        background: T.surface2,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        boxShadow: focus || error ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)'}` : 'none',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 13,
            color: error ? T.red : focus ? T.accent : T.textLight,
            transition: 'color 0.18s', pointerEvents: 'none', display: 'flex',
          }}>
            {icon}
          </span>
        )}
        <input
          {...props}
          onFocus={e => { setFocus(true); props.onFocus?.(e); }}
          onBlur={e => { setFocus(false); props.onBlur?.(e); }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: `13px 14px 13px ${icon ? '41px' : '14px'}`,
            fontFamily: T.font, fontSize: 14, color: T.text,
            paddingRight: rightSlot ? 44 : 14,
          }}
        />
        {rightSlot}
      </div>
      {error && <p style={{ marginTop: 5, fontSize: 12, color: T.red, fontWeight: 600 }}>⚠ {error}</p>}
      {hint && !error && <p style={{ marginTop: 5, fontSize: 12, color: T.textLight }}>{hint}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  // ── Final Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Naam minimum 2 characters ka hona chahiye';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Valid email daalo';
    if (password.length < 6) errs.password = 'Password minimum 6 characters ka hona chahiye';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      login(data.token, data.user);
      toast.success('Account ban gaya! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Dobara try karo.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors(e => ({ ...e, email: msg }));
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .reg-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: ${T.bg}; font-family: ${T.font}; padding: 24px 16px;
        }
        .reg-card {
          width: 100%; max-width: 460px;
          background: ${T.surface}; border: 1px solid ${T.border};
          border-radius: 20px; padding: 36px 32px;
          animation: fadeUp 0.3s ease;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        @media (max-width: 480px) {
          .reg-card { padding: 28px 20px; border-radius: 16px; }
        }
        a.auth-link { color: ${T.accent}; text-decoration: none; font-weight: 700; }
        a.auth-link:hover { text-decoration: underline; }
        .submit-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          font-family: ${T.font}; font-size: 15px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          letter-spacing: 0.01em; margin-top: 8px;
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-card">

          {/* Logo + Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
              }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.95" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: T.text }}>YourNotes</span>
            </a>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 6 }}>
              Account Banao
            </h2>
            <p style={{ fontSize: 13, color: T.textMuted }}>
              Free account — koi payment nahi chahiye
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <InputBox
              label="Pura Naam"
              icon={<User size={15} />}
              type="text"
              placeholder="Apna naam likhoo"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })); }}
              error={errors.name}
              autoComplete="name"
              autoFocus
            />

            {/* Email */}
            <InputBox
              label="Email Address"
              icon={<Mail size={15} />}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: '' })); }}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password */}
            <InputBox
              label="Password"
              icon={<Lock size={15} />}
              type={showPw ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
              error={errors.password}
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', padding: 0 }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Submit button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
              style={{
                marginTop: 24,
                background: loading ? T.surface3 : T.accent,
                color: loading ? T.textMuted : '#fff',
                boxShadow: !loading ? '0 4px 14px rgba(249,115,22,0.25)' : 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? <><Spinner /> Account ban raha hai…</> : <><span>Account Banao</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, marginTop: 20 }}>
            Pehle se account hai?{' '}
            <Link to="/login" className="auth-link">Login karo</Link>
          </p>

        </div>
      </div>
    </>
  );
}
