import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'reg-spin 0.8s linear infinite', flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function Field({ label, icon: Icon, error, rightSlot, ...inputProps }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: error ? 'var(--red)' : 'var(--text-2)',
        marginBottom: 7, letterSpacing: '0.01em',
      }}>{label}</label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        background: 'var(--bg-alt)',
        border: `1.5px solid ${error ? 'var(--red)' : focus ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-md)',
        boxShadow: focus ? `0 0 0 3px ${error ? 'var(--red-light)' : 'var(--accent-ring)'}` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        {Icon && (
          <Icon size={15} style={{
            position: 'absolute', left: 13, pointerEvents: 'none',
            color: error ? 'var(--red)' : focus ? 'var(--accent)' : 'var(--text-4)',
            transition: 'color 0.15s', flexShrink: 0,
          }} />
        )}
        <input
          {...inputProps}
          onFocus={e => { setFocus(true); inputProps.onFocus?.(e); }}
          onBlur={e => { setFocus(false); inputProps.onBlur?.(e); }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: `12px 14px 12px ${Icon ? '40px' : '14px'}`,
            paddingRight: rightSlot ? 44 : 14,
            fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)',
          }}
        />
        {rightSlot}
      </div>
      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
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
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async e => {
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
      if (msg.toLowerCase().includes('email')) setErrors(ex => ({ ...ex, email: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes reg-spin { to { transform: rotate(360deg); } }
        @keyframes reg-up   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .reg-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          font-family: var(--font);
          padding: 24px 16px;
        }

        .reg-card {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 36px 32px 32px;
          box-shadow: var(--shadow-md);
          animation: reg-up 0.3s ease;
        }

        .reg-submit {
          width: 100%; padding: 13px 20px;
          border-radius: var(--r-md); border: none;
          background: var(--accent); color: #fff;
          font-family: var(--font); font-size: 14px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          box-shadow: 0 3px 12px var(--accent-ring); margin-top: 4px;
          letter-spacing: 0.01em;
        }
        .reg-submit:hover:not(:disabled) {
          background: var(--accent-dark);
          box-shadow: 0 6px 20px rgba(249,115,22,0.35);
        }
        .reg-submit:active:not(:disabled) { transform: scale(0.975); }
        .reg-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .reg-theme-btn {
          position: absolute; top: 16px; right: 16px;
          width: 34px; height: 34px; border-radius: 8px;
          background: var(--surface-2); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-3);
          transition: background 0.15s, color 0.15s;
        }
        .reg-theme-btn:hover { background: var(--bg-alt); color: var(--accent); }

        .reg-secondary-link {
          display: block; text-align: center;
          padding: 12px; border-radius: var(--r-md);
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-2); font-size: 13px; font-weight: 600;
          text-decoration: none; transition: border-color 0.15s, background 0.15s;
        }
        .reg-secondary-link span { color: var(--accent); font-weight: 700; }
        .reg-secondary-link:hover { border-color: var(--accent); background: var(--accent-light); }

        @media (max-width: 480px) {
          .reg-card { padding: 28px 20px 24px; border-radius: var(--r-lg); }
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-card" style={{ position: 'relative' }}>

          {/* Theme toggle */}
          <button className="reg-theme-btn" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Logo + header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 20 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px var(--accent-ring)',
              }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.95" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>YourNotes</span>
            </a>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: 6 }}>
              Account Banao
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
              Free account — koi payment nahi chahiye
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              label="Pura Naam"
              icon={User}
              type="text"
              placeholder="Apna naam likhoo"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })); }}
              error={errors.name}
              autoComplete="name"
              autoFocus
            />

            <Field
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: '' })); }}
              error={errors.email}
              autoComplete="email"
            />

            <Field
              label="Password"
              icon={Lock}
              type={showPw ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
              error={errors.password}
              autoComplete="new-password"
              rightSlot={
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 4 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <button type="submit" className="reg-submit" disabled={loading}>
              {loading ? <><Spinner /> Account ban raha hai…</> : <>Account Banao <ArrowRight size={15} strokeWidth={2.5} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ya</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <Link to="/login" className="reg-secondary-link">
            Pehle se account hai? <span>Login karo →</span>
          </Link>

        </div>
      </div>
    </>
  );
}
