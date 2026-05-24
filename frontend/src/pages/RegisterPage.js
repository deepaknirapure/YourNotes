import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, CheckCircle2, Globe, Sparkles, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
  accentMid:   'rgba(249,115,22,0.16)',
  accentBorder:'rgba(249,115,22,0.22)',
  green:       '#10b981',
  greenLow:    'rgba(16,185,129,0.08)',
  greenBorder: 'rgba(16,185,129,0.22)',
  red:         '#ef4444',
  font:        "'Plus Jakarta Sans', sans-serif",
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: error ? T.red : T.textMuted, marginBottom: 7,
        }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <p style={{ marginTop: 5, fontSize: 11.5, color: T.red, fontWeight: 600 }}>⚠ {error}</p>
      )}
      {hint && !error && (
        <p style={{ marginTop: 5, fontSize: 11.5, color: T.textLight }}>{hint}</p>
      )}
    </div>
  );
}

// ── Input box ─────────────────────────────────────────────────────────────────
function InputBox({ icon, rightSlot, error, style, ...props }) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? T.red : focus ? T.accent : T.border;
  const shadowColor = error
    ? 'rgba(239,68,68,0.12)'
    : focus ? 'rgba(249,115,22,0.12)' : 'none';
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center',
      background: T.surface2,
      border: `1.5px solid ${borderColor}`,
      borderRadius: 12,
      boxShadow: focus || error ? `0 0 0 3px ${shadowColor}` : 'none',
      transition: 'border-color 0.18s, box-shadow 0.18s', ...style,
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
          ...props.style,
        }}
      />
      {rightSlot}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = [
    { label: 'Mobile', icon: <Phone size={13} /> },
    { label: 'OTP', icon: <ShieldCheck size={13} /> },
    { label: 'Details', icon: <User size={13} /> },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32 }}>
      {steps.map(({ label, icon }, i) => {
        const num    = i + 1;
        const done   = step > num;
        const active = step === num;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: done ? T.green : active ? T.accent : T.surface2,
                border: `2px solid ${done ? T.green : active ? T.accent : T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done || active ? '#fff' : T.textLight,
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                fontFamily: T.font, fontSize: 12, fontWeight: 800,
                boxShadow: active ? `0 0 0 4px ${T.accentLow}` : 'none',
              }}>
                {done ? <CheckCircle2 size={15} /> : active ? icon : <span style={{ fontSize: 11, fontWeight: 800 }}>{num}</span>}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active || done ? 800 : 500,
                color: active ? T.accent : done ? T.green : T.textLight,
                letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 2, margin: '16px 8px 0',
                background: step > num ? T.green : T.border,
                borderRadius: 2, transition: 'background 0.4s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Password strength meter ───────────────────────────────────────────────────
function PwStrength({ pw }) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  const meta = [
    null,
    { color: '#ef4444', label: 'Weak' },
    { color: '#f59e0b', label: 'Fair' },
    { color: '#10b981', label: 'Strong' },
  ];
  return (
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= s ? meta[s].color : T.border,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: meta[s].color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {meta[s].label}
      </span>
    </div>
  );
}

// ── Primary button ────────────────────────────────────────────────────────────
function Btn({ loading, children, style, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
        background: loading || props.disabled ? T.surface3 : T.accent,
        color: loading || props.disabled ? T.textMuted : '#fff',
        fontFamily: T.font, fontSize: 14, fontWeight: 800,
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.2s, transform 0.12s, box-shadow 0.2s',
        marginTop: 10, letterSpacing: '0.01em',
        boxShadow: !loading && !props.disabled ? '0 4px 14px rgba(249,115,22,0.25)' : 'none',
        ...style,
      }}
      onMouseEnter={e => { if (!loading && !props.disabled) { e.currentTarget.style.background = T.accentHover; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.35)'; } }}
      onMouseLeave={e => { if (!loading && !props.disabled) { e.currentTarget.style.background = T.accent; e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.25)'; } }}
      onMouseDown={e => { if (!loading && !props.disabled) e.currentTarget.style.transform = 'scale(0.975)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {loading
        ? <><Spinner /> {typeof children === 'string' ? children : 'Please wait…'}</>
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
// REGISTER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep]                   = useState(1);
  const [phone, setPhone]                 = useState('');
  const [cc, setCc]                       = useState('+91');
  const [otp, setOtp]                     = useState(['', '', '', '', '', '']);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [form, setForm]                   = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]               = useState({});
  const [showPw, setShowPw]               = useState(false);
  const [loading, setLoading]             = useState(false);
  const [timer, setTimer]                 = useState(0);
  const timerRef                          = useRef(null);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const fullPhone  = `${cc}${phone.replace(/^0/, '')}`;

  // ── Cleanup timer on unmount ──────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  // ── Validate phone ────────────────────────────────────────────────────────
  const validatePhone = () => {
    if (cc === '+91' && !/^\d{10}$/.test(phone)) {
      setErrors({ phone: '10 digit ka valid Indian number daalo' });
      return false;
    }
    if (phone.length < 7) {
      setErrors({ phone: 'Valid phone number daalo' });
      return false;
    }
    setErrors({});
    return true;
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validatePhone()) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/send-otp', { phone: fullPhone });
      // Dev mode mein OTP console pe aata hai — toast mein bhi dikhao
      if (res.data.devOtp) {
        toast.success(`[DEV] OTP: ${res.data.devOtp}`, { duration: 15000, icon: '🔑' });
      } else {
        toast.success('OTP bhej diya! Check karo SMS.');
      }
      setStep(2);
      startTimer();
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP bhejne mein error. Dobara try karo.';
      toast.error(msg);
      setErrors({ phone: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setErrors({ otp: '6 digit ka OTP daalo' });
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { phone: fullPhone, otp: otpStr });
      toast.success('Phone verify ho gaya! 🎉');
      setPhoneVerified(true);
      setStep(3);
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP galat hai ya expire ho gaya.';
      toast.error(msg);
      setErrors({ otp: msg });
      // Wrong OTP pe boxes clear karo
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => document.getElementById('otp-0')?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp];
    n[i] = v.slice(-1);
    setOtp(n);
    setErrors({});
    if (v && i < 5) {
      setTimeout(() => document.getElementById(`otp-${i + 1}`)?.focus(), 0);
    }
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (otp[i]) {
        // Clear current box
        const n = [...otp]; n[i] = ''; setOtp(n);
      } else if (i > 0) {
        // Move to previous
        document.getElementById(`otp-${i - 1}`)?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  // FIX: paste on any individual box — spread from that box or from start
  const handleOtpPaste = (e, startIndex = 0) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - startIndex);
    if (!pasted) return;
    const n = [...otp];
    for (let j = 0; j < pasted.length; j++) {
      n[startIndex + j] = pasted[j];
    }
    setOtp(n);
    setErrors({});
    const nextFocus = Math.min(startIndex + pasted.length, 5);
    setTimeout(() => document.getElementById(`otp-${nextFocus}`)?.focus(), 0);
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/send-otp', { phone: fullPhone });
      if (res.data.devOtp) {
        toast.success(`[DEV] New OTP: ${res.data.devOtp}`, { duration: 15000, icon: '🔑' });
      } else {
        toast.success('Naya OTP bhej diya!');
      }
      setOtp(['', '', '', '', '', '']);
      setErrors({});
      startTimer();
      setTimeout(() => document.getElementById('otp-0')?.focus(), 50);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Retry failed. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Register ──────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Naam required hai';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email daalo';
    if (form.password.length < 6) e.password = 'Password minimum 6 characters ka hona chahiye';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!phoneVerified) { toast.error('Phone verify karo pehle'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', {
        ...form,
        phone: fullPhone,
        phoneVerified: true,   // FIX: boolean true, not string 'true'
      });
      login(data.user, data.token);
      toast.success('Account ban gaya! Welcome 🎉');
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration fail ho gayi. Dobara try karo.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const upd = k => e => { setForm({ ...form, [k]: e.target.value }); setErrors(prev => ({ ...prev, [k]: '' })); };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${T.bg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .reg-root { display: flex; min-height: 100vh; font-family: ${T.font}; background: ${T.bg}; }

        /* ── Left panel ── */
        .reg-left {
          width: 400px; flex-shrink: 0; display: flex; flex-direction: column;
          padding: 36px 38px; background: ${T.surface}; border-right: 1px solid ${T.border};
          position: relative; overflow: hidden;
        }
        .reg-left-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 15% 25%, rgba(249,115,22,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 85% 85%, rgba(249,115,22,0.04) 0%, transparent 65%);
        }
        .reg-left-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.025;
          background-image: linear-gradient(${T.textMuted} 1px, transparent 1px),
                            linear-gradient(90deg, ${T.textMuted} 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Right panel ── */
        .reg-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 24px; overflow-y: auto;
        }
        .reg-form-wrap { width: 100%; max-width: 420px; animation: fadeUp 0.35s ease; }

        /* ── Feature cards ── */
        .feat-card {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 13px 15px; border-radius: 12px;
          background: ${T.surface2}; border: 1px solid ${T.border};
          margin-bottom: 9px; transition: border-color 0.2s;
        }
        .feat-card:hover { border-color: ${T.border2}; }

        /* ── OTP boxes ── */
        .otp-row { display: flex; gap: 9px; justify-content: center; margin-bottom: 8px; }
        .otp-box {
          width: 48px; height: 56px; text-align: center; font-size: 22px; font-weight: 800;
          border-radius: 12px; border: 2px solid ${T.border}; background: ${T.surface2};
          color: ${T.text}; outline: none; font-family: ${T.font};
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.12s;
          caret-color: ${T.accent};
        }
        .otp-box:focus {
          border-color: ${T.accent};
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
          transform: scale(1.04);
        }
        .otp-box.filled { border-color: ${T.accent}; background: ${T.accentLow}; }
        .otp-box.error  { border-color: ${T.red}; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }

        /* ── Country code select ── */
        .cc-select {
          background: transparent; border: none; outline: none;
          color: ${T.textMuted}; font-size: 13px; font-weight: 700;
          font-family: ${T.font}; cursor: pointer; padding: 13px 0 13px 13px;
          flex-shrink: 0;
        }
        .cc-select option { background: #1a1919; color: ${T.text}; }
        .cc-divider { width: 1px; height: 22px; background: ${T.border}; flex-shrink: 0; margin: 0 4px; }

        /* ── Step animation ── */
        .step-content { animation: slideIn 0.28s ease; }

        /* ── Links ── */
        a.auth-link { color: ${T.accent}; text-decoration: none; font-weight: 700; }
        a.auth-link:hover { text-decoration: underline; }

        /* ── Resend ── */
        .resend-btn {
          background: none; border: none; cursor: pointer; padding: 0;
          color: ${T.accent}; font-size: 13px; font-family: ${T.font}; font-weight: 700;
        }
        .resend-btn:disabled { color: ${T.textLight}; cursor: default; }

        /* ── Phone already verified notice ── */
        .verified-badge {
          display: flex; align-items: center; gap: 9px; padding: 11px 14px;
          border-radius: 12px; background: ${T.greenLow};
          border: 1px solid ${T.greenBorder}; margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .reg-left { display: none; }
          .reg-right { padding: 28px 18px; align-items: flex-start; padding-top: 48px; }
        }
      `}</style>

      <div className="reg-root">
        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="reg-left">
          <div className="reg-left-glow" />
          <div className="reg-left-grid" />

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

          {/* Hero content */}
          <div style={{ zIndex: 1, paddingTop: 52, paddingBottom: 28, flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px',
              borderRadius: 50, background: T.accentLow, border: `1px solid ${T.accentBorder}`,
              marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'block' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: T.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Join thousands of students
              </span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, lineHeight: 1.22, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Your notes,<br />
              <span style={{ color: T.accent }}>beautifully organized.</span>
            </h1>
            <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.75, marginBottom: 30 }}>
              Create your free account and start taking smarter notes — no subscription needed, ever.
            </p>

            {[
              { icon: <CheckCircle2 size={16} color="#f97316" />, bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.14)', title: 'Free forever', sub: 'No payment required — always free.' },
              { icon: <Globe size={16} color="#a78bfa" />, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.14)', title: 'Community sharing', sub: "Publish notes, discover others' work." },
              { icon: <Sparkles size={16} color="#60a5fa" />, bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.14)', title: 'AI study tools', sub: 'Summaries, flashcards & Q&A built in.' },
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
              Free to join
            </span>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="reg-right">
          <div className="reg-form-wrap">

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                Get started — it's free
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.4px', marginBottom: 6 }}>
                Create your account
              </h2>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.65 }}>
                Phone verify karo, account banao — 2 minutes mein shuru.
              </p>
            </div>

            <StepBar step={step} />

            {/* ══ STEP 1: Mobile number ══ */}
            {step === 1 && (
              <div className="step-content">
                <form onSubmit={handleSendOTP}>
                  <Field label="Mobile Number" hint="Is number pe OTP bheja jayega" error={errors.phone}>
                    <div style={{
                      display: 'flex', alignItems: 'center', background: T.surface2,
                      border: `1.5px solid ${errors.phone ? T.red : T.border}`, borderRadius: 12, overflow: 'hidden',
                      transition: 'border-color 0.18s',
                    }}>
                      <select className="cc-select" value={cc} onChange={e => setCc(e.target.value)}>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+60">🇲🇾 +60</option>
                      </select>
                      <div className="cc-divider" />
                      <input
                        type="tel"
                        placeholder={cc === '+91' ? '10-digit number' : 'Phone number'}
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, cc === '+91' ? 10 : 12));
                          setErrors({});
                        }}
                        style={{
                          flex: 1, background: 'transparent', border: 'none', outline: 'none',
                          padding: '13px 12px', fontFamily: T.font, fontSize: 14, color: T.text,
                        }}
                        autoComplete="tel"
                        autoFocus
                      />
                      {((cc === '+91' && phone.length === 10) || (cc !== '+91' && phone.length >= 7)) && (
                        <span style={{ paddingRight: 12, color: T.green, display: 'flex' }}>
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>
                  </Field>

                  <Btn loading={loading} type="submit">
                    <>
                      <Phone size={15} />
                      {loading ? 'OTP bhej rahe hain…' : 'OTP Bhejo'}
                      {!loading && <ArrowRight size={15} strokeWidth={2.5} />}
                    </>
                  </Btn>
                </form>
              </div>
            )}

            {/* ══ STEP 2: OTP verification ══ */}
            {step === 2 && (
              <div className="step-content">
                <form onSubmit={handleVerifyOTP}>
                  {/* Phone display */}
                  <div style={{
                    textAlign: 'center', marginBottom: 22, padding: '12px 16px',
                    background: T.surface2, borderRadius: 12, border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 3 }}>OTP bheja gaya:</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: '0.03em' }}>{fullPhone}</div>
                  </div>

                  {/* OTP boxes */}
                  <Field error={errors.otp}>
                    <div className="otp-row">
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKey(i, e)}
                          onPaste={e => handleOtpPaste(e, i)}   // FIX: paste from any box
                          className={`otp-box${d ? ' filled' : ''}${errors.otp ? ' error' : ''}`}
                          autoFocus={i === 0}
                          autoComplete="one-time-code"
                        />
                      ))}
                    </div>
                  </Field>

                  <Btn loading={loading} type="submit" disabled={otp.join('').length !== 6}>
                    <>
                      <ShieldCheck size={15} />
                      {loading ? 'Verify ho raha hai…' : 'OTP Verify Karo'}
                      {!loading && <ArrowRight size={15} strokeWidth={2.5} />}
                    </>
                  </Btn>

                  {/* Resend + back */}
                  <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: T.textMuted }}>
                    OTP nahi mila?{' '}
                    <button type="button" className="resend-btn" disabled={timer > 0 || loading} onClick={handleResend}>
                      {timer > 0 ? `Resend (${timer}s)` : 'Dobara Bhejo'}
                    </button>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setErrors({}); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textLight, fontSize: 12, fontFamily: T.font, fontWeight: 600 }}
                    >
                      ← Number change karna hai?
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ══ STEP 3: Account details ══ */}
            {step === 3 && (
              <div className="step-content">
                {/* Verified badge */}
                <div className="verified-badge">
                  <ShieldCheck size={15} color={T.green} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{fullPhone} — Verified ✓</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <Field label="Full Name" error={errors.name}>
                    <InputBox
                      icon={<User size={15} />}
                      type="text"
                      placeholder="Apna pura naam likhoo"
                      value={form.name}
                      onChange={upd('name')}
                      error={errors.name}
                      required
                      autoComplete="name"
                      autoFocus
                    />
                  </Field>

                  <Field label="Email Address" error={errors.email}>
                    <InputBox
                      icon={<Mail size={15} />}
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={upd('email')}
                      error={errors.email}
                      required
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Password" error={errors.password}>
                    <InputBox
                      icon={<Lock size={15} />}
                      type={showPw ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={upd('password')}
                      error={errors.password}
                      required
                      autoComplete="new-password"
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
                    <PwStrength pw={form.password} />
                  </Field>

                  <p style={{ fontSize: 11.5, color: T.textLight, marginBottom: 4, lineHeight: 1.65 }}>
                    Account banane par aap hamare{' '}
                    <a href="/terms" className="auth-link" style={{ fontSize: 11.5 }}>Terms</a>
                    {' '}aur{' '}
                    <a href="/privacy" className="auth-link" style={{ fontSize: 11.5 }}>Privacy Policy</a>
                    {' '}se agree karte hain.
                  </p>

                  <Btn loading={loading} type="submit">
                    <>
                      {loading ? 'Account ban raha hai…' : 'Account Banao'}
                      {!loading && <ArrowRight size={15} strokeWidth={2.5} />}
                    </>
                  </Btn>
                </form>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, marginTop: 22 }}>
              Account hai pehle se?{' '}
              <Link to="/login" className="auth-link">Sign in karo</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}