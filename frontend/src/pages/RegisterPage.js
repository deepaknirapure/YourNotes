import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, ShieldCheck, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
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
  // Form fields
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [phone, setPhone]     = useState('');
  const [cc, setCc]           = useState('+91');

  // OTP state
  const [otpSent, setOtpSent]         = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [timer, setTimer]             = useState(0);
  const timerRef                      = useRef(null);

  // UI state
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const fullPhone  = `${cc}${phone.replace(/^0/, '')}`;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  }, []);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (cc === '+91' && !/^\d{10}$/.test(phone)) {
      setErrors(e => ({ ...e, phone: '10 digit ka valid Indian number daalo' }));
      return;
    }
    if (phone.length < 7) {
      setErrors(e => ({ ...e, phone: 'Valid phone number daalo' }));
      return;
    }
    setErrors(e => ({ ...e, phone: '' }));
    setOtpLoading(true);
    try {
      const res = await API.post('/auth/send-otp', { phone: fullPhone });
      if (res.data.devOtp) {
        toast.success(`[DEV] OTP: ${res.data.devOtp}`, { duration: 15000, icon: '🔑' });
      } else {
        toast.success('OTP bhej diya! SMS check karo.');
      }
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      startTimer();
      setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP bhejne mein error. Dobara try karo.';
      toast.error(msg);
      setErrors(e => ({ ...e, phone: msg }));
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setErrors(e => ({ ...e, otp: '6 digit ka OTP daalo' }));
      return;
    }
    setOtpLoading(true);
    try {
      await API.post('/auth/verify-otp', { phone: fullPhone, otp: otpStr });
      toast.success('Phone verify ho gaya! ✓');
      setOtpVerified(true);
      setErrors(e => ({ ...e, otp: '' }));
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP galat hai ya expire ho gaya.';
      toast.error(msg);
      setErrors(e => ({ ...e, otp: msg }));
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => document.getElementById('otp-0')?.focus(), 50);
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    setErrors(e => ({ ...e, otp: '' }));
    if (v && i < 5) setTimeout(() => document.getElementById(`otp-${i + 1}`)?.focus(), 0);
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (otp[i]) { const n = [...otp]; n[i] = ''; setOtp(n); }
      else if (i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
    else if (e.key === 'ArrowRight' && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    else if (e.key === 'Enter') { e.preventDefault(); handleVerifyOTP(); }
  };

  const handleOtpPaste = (e, startIndex = 0) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - startIndex);
    if (!pasted) return;
    const n = [...otp];
    for (let j = 0; j < pasted.length; j++) n[startIndex + j] = pasted[j];
    setOtp(n);
    setErrors(e2 => ({ ...e2, otp: '' }));
    setTimeout(() => document.getElementById(`otp-${Math.min(startIndex + pasted.length, 5)}`)?.focus(), 0);
  };

  // ── Final Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Naam minimum 2 characters ka hona chahiye';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Valid email daalo';
    if (password.length < 6) errs.password = 'Password minimum 6 characters ka hona chahiye';
    if (!otpVerified) errs.otp = 'Pehle phone verify karo';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', {
        name, email, password,
        phone: fullPhone,
        phoneVerified: true,
      });
      login(data.user, data.token);
      toast.success('Account ban gaya! Welcome 🎉');
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration fail ho gayi. Dobara try karo.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors(e => ({ ...e, email: msg }));
      else if (msg.toLowerCase().includes('mobile') || msg.toLowerCase().includes('phone')) setErrors(e => ({ ...e, phone: msg }));
    } finally {
      setLoading(false);
    }
  };

  const phoneOk = (cc === '+91' && phone.length === 10) || (cc !== '+91' && phone.length >= 7);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${T.bg}; }
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
        .otp-row { display: flex; gap: 8px; margin: 10px 0 6px; }
        .otp-box {
          width: 44px; height: 52px; text-align: center; font-size: 20px; font-weight: 800;
          border-radius: 10px; border: 2px solid ${T.border}; background: ${T.surface2};
          color: ${T.text}; outline: none; font-family: ${T.font};
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.1s;
          caret-color: ${T.accent}; flex: 1;
        }
        .otp-box:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); transform: scale(1.04); }
        .otp-box.filled { border-color: ${T.accent}; background: ${T.accentLow}; }
        .otp-box.verified { border-color: ${T.green}; background: ${T.greenLow}; }
        .otp-box.error { border-color: ${T.red}; }
        .cc-select {
          background: transparent; border: none; outline: none;
          color: ${T.textMuted}; font-size: 13px; font-weight: 700;
          font-family: ${T.font}; cursor: pointer; padding: 13px 4px 13px 13px; flex-shrink: 0;
        }
        .cc-select option { background: #1a1919; color: ${T.text}; }
        .phone-wrap {
          display: flex; align-items: center; background: ${T.surface2};
          border-radius: 12px; overflow: hidden;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .cc-divider { width: 1px; height: 22px; background: ${T.border}; flex-shrink: 0; margin: 0 2px; }
        a.auth-link { color: ${T.accent}; text-decoration: none; font-weight: 700; }
        a.auth-link:hover { text-decoration: underline; }
        .send-otp-btn {
          padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer;
          font-family: ${T.font}; font-size: 12px; font-weight: 800; white-space: nowrap;
          margin: 4px 6px 4px 4px; flex-shrink: 0; transition: background 0.2s;
        }
        .divider { height: 1px; background: ${T.border}; margin: 20px 0; }
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

            <div className="divider" />

            {/* ── Phone + OTP Section ── */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: errors.phone ? T.red : T.textMuted, marginBottom: 6 }}>
                Mobile Number
              </label>

              {/* Phone input row */}
              <div className="phone-wrap" style={{
                border: `1.5px solid ${errors.phone ? T.red : otpVerified ? T.green : T.border}`,
                marginBottom: errors.phone ? 4 : 10,
              }}>
                <select className="cc-select" value={cc} onChange={e => { setCc(e.target.value); setOtpSent(false); setOtpVerified(false); }}>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>
                <div className="cc-divider" />
                <input
                  type="tel"
                  placeholder={cc === '+91' ? '10-digit number' : 'Phone number'}
                  value={phone}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, cc === '+91' ? 10 : 12);
                    setPhone(v);
                    setErrors(er => ({ ...er, phone: '' }));
                    if (otpSent) { setOtpSent(false); setOtpVerified(false); setOtp(['', '', '', '', '', '']); }
                  }}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    padding: '13px 8px', fontFamily: T.font, fontSize: 14, color: T.text,
                  }}
                  autoComplete="tel"
                  disabled={otpVerified}
                />
                {/* Verified badge OR Send/Resend button */}
                {otpVerified ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', color: T.green, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    <CheckCircle2 size={14} /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    className="send-otp-btn"
                    onClick={handleSendOTP}
                    disabled={!phoneOk || otpLoading}
                    style={{
                      background: !phoneOk || otpLoading ? T.surface3 : T.accent,
                      color: !phoneOk || otpLoading ? T.textLight : '#fff',
                    }}
                  >
                    {otpLoading && !otpSent ? <Spinner /> : otpSent ? (timer > 0 ? `${timer}s` : 'Resend') : 'OTP Bhejo'}
                  </button>
                )}
              </div>
              {errors.phone && <p style={{ marginBottom: 8, fontSize: 12, color: T.red, fontWeight: 600 }}>⚠ {errors.phone}</p>}

              {/* OTP boxes — shown after OTP is sent and not yet verified */}
              {otpSent && !otpVerified && (
                <div>
                  <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
                    OTP daalo jo {fullPhone} pe bheja gaya:
                  </p>
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
                        onPaste={e => handleOtpPaste(e, i)}
                        className={`otp-box${d ? ' filled' : ''}${errors.otp ? ' error' : ''}`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                  {errors.otp && <p style={{ fontSize: 12, color: T.red, fontWeight: 600, marginBottom: 6 }}>⚠ {errors.otp}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: T.textMuted }}>
                      {timer > 0 ? `Resend ${timer}s mein...` : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpLoading}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: 12, fontFamily: T.font, fontWeight: 700, padding: 0 }}
                        >
                          OTP dobara bhejo
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otp.join('').length !== 6 || otpLoading}
                      style={{
                        padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                        background: otp.join('').length === 6 ? T.green : T.surface3,
                        color: otp.join('').length === 6 ? '#fff' : T.textLight,
                        fontFamily: T.font, fontSize: 13, fontWeight: 800,
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'background 0.2s',
                      }}
                    >
                      {otpLoading ? <Spinner /> : <ShieldCheck size={14} />}
                      Verify Karo
                    </button>
                  </div>
                </div>
              )}

              {/* Already verified message */}
              {otpVerified && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10,
                  background: T.greenLow, border: `1px solid ${T.greenBorder}`,
                }}>
                  <ShieldCheck size={14} color={T.green} />
                  <span style={{ fontSize: 13, color: T.green, fontWeight: 700 }}>
                    Phone verify ho gaya ✓
                  </span>
                  <button
                    type="button"
                    onClick={() => { setOtpVerified(false); setOtpSent(false); setPhone(''); setOtp(['', '', '', '', '', '']); }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.textLight, fontSize: 11, fontFamily: T.font }}
                  >
                    Change
                  </button>
                </div>
              )}

              {errors.otp && !otpSent && (
                <p style={{ marginTop: 6, fontSize: 12, color: T.red, fontWeight: 600 }}>⚠ {errors.otp}</p>
              )}
            </div>

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
