import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Design tokens (same as RegisterPage) ─────────────────────────────────────
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
  red:         '#ef4444',
  redLow:      'rgba(239,68,68,0.08)',
  redBorder:   'rgba(239,68,68,0.2)',
  font:        "'Plus Jakarta Sans', sans-serif",
};

// ── Input box ─────────────────────────────────────────────────────────────────
function InputBox({ icon, rightSlot, error, style, ...props }) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? T.red : focus ? T.accent : T.border;
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center',
      background: T.surface2, border: `1.5px solid ${borderColor}`, borderRadius: 12,
      boxShadow: focus ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(249,115,22,0.12)'}` : 'none',
      transition: 'border-color 0.18s, box-shadow 0.18s', ...style,
    }}>
      {icon && (
        <span style={{ position: 'absolute', left: 13, color: error ? T.red : focus ? T.accent : T.textLight, transition: 'color 0.18s', pointerEvents: 'none', display: 'flex' }}>
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
          ...props.style,
        }}
      />
      {rightSlot}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({ loading, children, style, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
        background: loading ? T.surface3 : T.accent,
        color: loading ? T.textMuted : '#fff',
        fontFamily: T.font, fontSize: 14, fontWeight: 800,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.2s, transform 0.12s, box-shadow 0.2s',
        marginTop: 10, letterSpacing: '0.01em',
        boxShadow: !loading ? '0 4px 14px rgba(249,115,22,0.25)' : 'none',
        ...style,
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = T.accentHover; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.35)'; } }}
      onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = T.accent; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.25)'; } }}
      onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.975)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {loading
        ? <><Spinner /> Signing in…</>
        : children}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const upd = k => e => {
    setForm({ ...form, [k]: e.target.value });
    setErrors(prev => ({ ...prev, [k]: '' }));
    setLoginErr('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email address daalo';
    if (!form.password) e.password = 'Password daalo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setLoginErr('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back! 👋');
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Email ya password galat hai.';
      setLoginErr(msg);
      // Shake the form a bit
      const formEl = document.getElementById('login-form');
      if (formEl) { formEl.style.animation = 'none'; void formEl.offsetWidth; formEl.style.animation = 'shake 0.4s ease'; }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${T.bg}; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .lgn-root { display: flex; min-height: 100vh; font-family: ${T.font}; background: ${T.bg}; }

        /* ── Left panel ── */
        .lgn-left {
          width: 400px; flex-shrink: 0; display: flex; flex-direction: column;
          padding: 36px 38px; background: ${T.surface}; border-right: 1px solid ${T.border};
          position: relative; overflow: hidden;
        }
        .lgn-left-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 15% 25%, rgba(249,115,22,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 85% 85%, rgba(249,115,22,0.04) 0%, transparent 65%);
        }
        .lgn-left-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.025;
          background-image: linear-gradient(${T.textMuted} 1px, transparent 1px),
                            linear-gradient(90deg, ${T.textMuted} 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Right panel ── */
        .lgn-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 24px; overflow-y: auto;
        }
        .lgn-form-wrap { width: 100%; max-width: 400px; animation: fadeUp 0.35s ease; }

        /* ── Feature cards ── */
        .feat-card {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 13px 15px; border-radius: 12px;
          background: ${T.surface2}; border: 1px solid ${T.border};
          margin-bottom: 9px; transition: border-color 0.2s;
        }
        .feat-card:hover { border-color: ${T.border2}; }

        /* ── Error banner ── */
        .error-banner {
          display: flex; align-items: center; gap: 9px;
          padding: 12px 14px; border-radius: 12px;
          background: ${T.redLow}; border: 1px solid ${T.redBorder};
          margin-bottom: 18px; animation: fadeUp 0.2s ease;
        }

        /* ── Links ── */
        a.auth-link { color: ${T.accent}; text-decoration: none; font-weight: 700; }
        a.auth-link:hover { text-decoration: underline; }

        /* ── Register CTA ── */
        .register-cta {
          display: flex; align-items: center; gap: 14px; padding: 15px 17px;
          border-radius: 14px; background: ${T.surface}; border: 1px solid ${T.border};
          transition: border-color 0.2s;
        }
        .register-cta:hover { border-color: ${T.border2}; }

        @media (max-width: 768px) {
          .lgn-left { display: none; }
          .lgn-right { padding: 28px 18px; align-items: flex-start; padding-top: 48px; }
        }
      `}</style>

      <div className="lgn-root">
        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="lgn-left">
          <div className="lgn-left-glow" />
          <div className="lgn-left-grid" />

          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', zIndex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: T.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.95" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: '-0.3px' }}>YourNotes</span>
          </a>

          {/* Hero */}
          <div style={{ zIndex: 1, paddingTop: 56, paddingBottom: 28, flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px',
              borderRadius: 50, background: T.accentLow, border: `1px solid ${T.accentBorder}`,
              marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'block' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: T.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Smart note-taking
              </span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, lineHeight: 1.22, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Think clearer.<br />
              <span style={{ color: T.accent }}>Study smarter.</span>
            </h1>
            <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.75, marginBottom: 30 }}>
              Apne notes, flashcards, aur AI summaries — sab ek jagah. Focused study ke liye banaya gaya.
            </p>

            {[
              { icon: <Sparkles size={16} color="#f97316" />, bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.14)', title: 'AI-Powered Summaries', sub: 'Kisi bhi note se study material auto-generate karo.' },
              { icon: <ShieldCheck size={16} color="#a78bfa" />, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.14)', title: 'Private & Secure', sub: 'Tumhara kaam sirf tumhara — hamesha.' },
              { icon: <Zap size={16} color="#60a5fa" />, bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.14)', title: 'Fast & Organized', sub: 'Folders, tags, aur instant search built in.' },
            ].map(f => (
              <div key={f.title} className="feat-card">
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.bg, border: `1px solid ${f.border}` }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.border}`, paddingTop: 15, zIndex: 1 }}>
            <span style={{ fontSize: 11, color: T.textLight }}>S.V. Polytechnic College, Bhopal · 2026</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
              <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#16a34a" /></svg>
              All systems normal
            </span>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="lgn-right">
          <div className="lgn-form-wrap">

            {/* Header */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                Sign in
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.4px', marginBottom: 6 }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.65 }}>
                Apna workspace access karne ke liye login karo.
              </p>
            </div>

            {/* Error banner */}
            {loginErr && (
              <div className="error-banner">
                <AlertCircle size={15} color={T.red} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: T.red, fontWeight: 600 }}>{loginErr}</span>
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: errors.email ? T.red : T.textMuted, marginBottom: 7 }}>
                  Email Address
                </label>
                <InputBox
                  icon={<Mail size={15} />}
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={upd('email')}
                  error={errors.email}
                  required
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && <p style={{ marginTop: 5, fontSize: 11.5, color: T.red, fontWeight: 600 }}>⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: errors.password ? T.red : T.textMuted }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12, color: T.accent, fontWeight: 700, textDecoration: 'none' }}
                    onMouseOver={e => e.target.style.textDecoration = 'underline'}
                    onMouseOut={e => e.target.style.textDecoration = 'none'}
                  >
                    Bhool gaye?
                  </Link>
                </div>
                <InputBox
                  icon={<Lock size={15} />}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Apna password daalo"
                  value={form.password}
                  onChange={upd('password')}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', padding: 0 }}
                      title={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                {errors.password && <p style={{ marginTop: 5, fontSize: 11.5, color: T.red, fontWeight: 600 }}>⚠ {errors.password}</p>}
              </div>

              <Btn loading={loading} type="submit">
                <>Sign In <ArrowRight size={15} strokeWidth={2.5} /></>
              </Btn>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.textLight, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>ya</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Register CTA */}
            <div className="register-cta">
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: T.accentLow,
                border: `1px solid ${T.accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill={T.accent} fillOpacity="0.9" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 2 }}>Naya account banana hai?</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Free hai — 2 minute mein shuru karo</div>
              </div>
              <Link
                to="/register"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px',
                  borderRadius: 10, background: T.accent, color: '#fff', textDecoration: 'none',
                  fontSize: 13, fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap',
                  boxShadow: '0 3px 10px rgba(249,115,22,0.25)',
                  transition: 'background 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accentHover; e.currentTarget.style.boxShadow = '0 5px 16px rgba(249,115,22,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.boxShadow = '0 3px 10px rgba(249,115,22,0.25)'; }}
              >
                Register <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}