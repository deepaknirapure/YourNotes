import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, CheckCircle2, Globe, Sparkles, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Design tokens — Settings page se match kiye ──────────────────────────────
const T = {
  bg:        '#111010',
  surface:   '#1a1919',
  surface2:  '#211f1f',
  border:    '#2a2828',
  border2:   '#333130',
  text:      '#f5f5f4',
  textMuted: '#888580',
  textLight: '#555250',
  accent:    '#f97316',
  accentLow: 'rgba(249,115,22,0.10)',
  accentMid: 'rgba(249,115,22,0.18)',
  green:     '#10b981',
  greenLow:  'rgba(16,185,129,0.08)',
  greenBorder:'rgba(16,185,129,0.22)',
  font:      "'Plus Jakarta Sans', sans-serif",
};

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
        textTransform: 'uppercase', color: T.textMuted, marginBottom: 7 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ marginTop: 5, fontSize: 11, color: T.textLight }}>{hint}</p>}
    </div>
  );
}

function InputBox({ icon, rightSlot, style, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
      background: T.surface2, border: `1.5px solid ${focus ? T.accent : T.border}`,
      borderRadius: 12, transition: 'border-color 0.18s', ...style }}>
      {icon && (
        <span style={{ position: 'absolute', left: 13, color: focus ? T.accent : T.textLight,
          transition: 'color 0.18s', pointerEvents: 'none', display: 'flex' }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        onFocus={e => { setFocus(true); props.onFocus?.(e); }}
        onBlur={e => { setFocus(false); props.onBlur?.(e); }}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          padding: `12px 14px 12px ${icon ? '40px' : '14px'}`,
          fontFamily: T.font, fontSize: 14, color: T.text,
          paddingRight: rightSlot ? 44 : 14,
        }}
      />
      {rightSlot}
    </div>
  );
}

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Mobile', 'OTP', 'Details'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 28 }}>
      {steps.map((label, i) => {
        const num    = i + 1;
        const done   = step > num;
        const active = step === num;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done || active ? T.accent : T.surface2,
                border: `2px solid ${done || active ? T.accent : T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                color: done || active ? '#fff' : T.textLight,
                transition: 'all 0.25s',
                fontFamily: T.font,
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 500,
                color: active ? T.accent : T.textLight, letterSpacing: '0.03em',
                textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, margin: '15px 8px 0',
                background: step > num ? T.accent : T.border, borderRadius: 2,
                transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────
function PwStrength({ pw }) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) s++;
  const colors = ['', '#ef4444', '#f59e0b', '#10b981'];
  if (!pw) return null;
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
          background: i <= s ? colors[s] : T.border, transition: 'background 0.3s' }} />
      ))}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
function Btn({ loading, children, ...props }) {
  return (
    <button {...props} style={{
      width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
      background: loading ? T.border : T.accent,
      color: loading ? T.textMuted : '#fff',
      fontFamily: T.font, fontSize: 14, fontWeight: 800,
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'background 0.2s, transform 0.1s',
      marginTop: 8,
      ...props.style,
    }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#ea6c04'; }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.accent; }}
      onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep]           = useState(1);
  const [phone, setPhone]         = useState('');
  const [cc, setCc]               = useState('+91');
  const [otp, setOtp]             = useState(['','','','','','']);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [form, setForm]           = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(0);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const fullPhone = `${cc}${phone.replace(/^0/,'')}`;

  const startTimer = () => {
    setTimer(30);
    const iv = setInterval(() => setTimer(t => { if(t<=1){clearInterval(iv);return 0;} return t-1; }), 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) return toast.error('10 digit ka valid number daalo');
    setLoading(true);
    try {
      await API.post('/auth/send-otp', { phone: fullPhone });
      toast.success('OTP bhej diya!');
      setStep(2); startTimer();
    } catch(err) { toast.error(err.response?.data?.message || 'OTP bhejne mein error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.error('6 digit ka OTP daalo');
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { phone: fullPhone, otp: otpStr });
      toast.success('Phone verify ho gaya! 🎉');
      setPhoneVerified(true); setStep(3);
    } catch(err) { toast.error(err.response?.data?.message || 'OTP galat hai'); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (p.length === 6) { setOtp(p.split('')); document.getElementById('otp-5')?.focus(); }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) return toast.error('Sabhi fields fill karo');
    if (form.password.length < 6) return toast.error('Password 6+ characters ka hona chahiye');
    if (!phoneVerified) return toast.error('Phone verify karo pehle');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { ...form, phone: fullPhone, phoneVerified: 'true' });
      login(data.user, data.token);
      toast.success('Account ban gaya! Welcome 🎉');
      navigate('/home');
    } catch(err) { toast.error(err.response?.data?.message || 'Registration fail ho gayi'); }
    finally { setLoading(false); }
  };

  const upd = k => e => setForm({...form, [k]: e.target.value});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; }
        .reg-root { display:flex; min-height:100vh; font-family:${T.font}; background:${T.bg}; }
        /* Left panel */
        .reg-left {
          width: 420px; flex-shrink: 0; display:flex; flex-direction:column;
          padding: 36px 40px; background: ${T.surface}; border-right: 1px solid ${T.border};
          position: relative; overflow: hidden;
        }
        .reg-left-noise {
          position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 70% 50% at 20% 30%, rgba(249,115,22,0.06) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 60% at 80% 80%, rgba(249,115,22,0.04) 0%, transparent 65%);
        }
        /* Right panel */
        .reg-right {
          flex: 1; display:flex; align-items:center; justify-content:center;
          padding: 40px 24px; overflow-y:auto;
        }
        .reg-form-wrap { width:100%; max-width: 420px; }
        /* Feature cards */
        .feat-card {
          display:flex; align-items:flex-start; gap:14px;
          padding: 14px 16px; border-radius: 14px;
          background: ${T.surface2}; border: 1px solid ${T.border};
          margin-bottom: 10px;
        }
        .feat-icon {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        /* OTP boxes */
        .otp-box {
          width:46px; height:54px; text-align:center; font-size:22px; font-weight:800;
          border-radius:12px; border:2px solid ${T.border}; background:${T.surface2};
          color:${T.text}; outline:none; font-family:${T.font};
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .otp-box:focus { border-color:${T.accent}; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .otp-box.filled { border-color:${T.accent}; }
        /* Country select */
        .cc-select {
          background:transparent; border:none; outline:none;
          color:${T.textMuted}; font-size:13px; font-weight:700;
          font-family:${T.font}; cursor:pointer; padding: 12px 0 12px 13px;
        }
        .cc-select option { background:#1a1919; color:${T.text}; }
        /* Phone divider */
        .cc-divider { width:1px; height:22px; background:${T.border}; flex-shrink:0; }
        /* Link style */
        a.auth-link { color:${T.accent}; text-decoration:none; font-weight:700; }
        a.auth-link:hover { text-decoration:underline; }
        /* Resend btn */
        .resend-btn {
          background:none; border:none; cursor:pointer; padding:0;
          color:${T.accent}; font-size:13px; font-family:${T.font}; font-weight:700;
          text-decoration:underline;
        }
        .resend-btn:disabled { color:${T.textLight}; cursor:not-allowed; text-decoration:none; }
        @media(max-width:768px){
          .reg-left { display:none; }
          .reg-right { padding:24px 16px; }
        }
      `}</style>

      <div className="reg-root">
        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <div className="reg-left">
          <div className="reg-left-noise" />

          {/* Logo */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', zIndex:1, marginBottom:'auto' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.accent,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.95"/>
              </svg>
            </div>
            <span style={{ fontSize:18, fontWeight:900, color:T.text, letterSpacing:'-0.3px' }}>YourNotes</span>
          </a>

          {/* Main content */}
          <div style={{ zIndex:1, paddingTop:48, paddingBottom:32 }}>
            {/* Pill */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px',
              borderRadius:50, background:T.accentLow, border:`1px solid rgba(249,115,22,0.2)`,
              marginBottom:20 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:T.accent, display:'block' }} />
              <span style={{ fontSize:11, fontWeight:700, color:T.accent, letterSpacing:'0.04em',
                textTransform:'uppercase' }}>Join thousands of students</span>
            </div>

            <h1 style={{ fontSize:30, fontWeight:900, color:T.text, lineHeight:1.2,
              letterSpacing:'-0.5px', marginBottom:12 }}>
              Your notes,<br />
              <span style={{ color:T.accent }}>beautifully organized.</span>
            </h1>
            <p style={{ fontSize:14, color:T.textMuted, lineHeight:1.7, marginBottom:32 }}>
              Create your free account and start taking smarter notes today — no subscription needed.
            </p>

            {/* Feature cards */}
            {[
              { icon:<CheckCircle2 size={17} color="#f97316"/>, bg:'rgba(249,115,22,0.08)', border:'rgba(249,115,22,0.15)',
                title:'Free forever', sub:'No subscription or payment required, ever.' },
              { icon:<Globe size={17} color="#a78bfa"/>, bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.15)',
                title:'Community sharing', sub:"Publish notes and discover others' work." },
              { icon:<Sparkles size={17} color="#60a5fa"/>, bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.15)',
                title:'AI study tools', sub:'Summaries, flashcards, and Q&A built in.' },
            ].map(f => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon" style={{ background:f.bg, border:`1px solid ${f.border}` }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:T.text, marginBottom:2 }}>{f.title}</div>
                  <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.5 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            borderTop:`1px solid ${T.border}`, paddingTop:16, zIndex:1 }}>
            <span style={{ fontSize:11, color:T.textLight }}>S.V. Polytechnic College, Bhopal · 2026</span>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:T.textMuted, fontWeight:600 }}>
              <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#16a34a"/></svg>
              Free to join
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <div className="reg-right">
          <div className="reg-form-wrap">
            {/* Header */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:800, color:T.accent, letterSpacing:'0.06em',
                textTransform:'uppercase', marginBottom:6 }}>Get started</div>
              <h2 style={{ fontSize:26, fontWeight:900, color:T.text, letterSpacing:'-0.4px', marginBottom:6 }}>
                Create your account
              </h2>
              <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.6 }}>
                Start your free workspace — takes less than a minute.
              </p>
            </div>

            <StepBar step={step} />

            {/* ── STEP 1: Mobile Number ─────────────────────────── */}
            {step === 1 && (
              <form onSubmit={handleSendOTP}>
                <Field label="Mobile Number" hint="Is number pe OTP bheja jayega">
                  <div style={{ display:'flex', alignItems:'center', background:T.surface2,
                    border:`1.5px solid ${T.border}`, borderRadius:12, overflow:'hidden' }}>
                    <select className="cc-select" value={cc} onChange={e=>setCc(e.target.value)}>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+61">🇦🇺 +61</option>
                    </select>
                    <div className="cc-divider" />
                    <input
                      type="tel" placeholder="10-digit number"
                      value={phone}
                      onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                      style={{ flex:1, background:'transparent', border:'none', outline:'none',
                        padding:'12px 14px', fontFamily:T.font, fontSize:14, color:T.text }}
                      required autoComplete="tel"
                    />
                    {phone.length === 10 && (
                      <span style={{ paddingRight:12, color:T.green }}>
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </div>
                </Field>
                <Btn loading={loading} type="submit" disabled={loading}>
                  {loading ? 'OTP bhej rahe hain…' : <><Phone size={15}/> OTP Bhejo <ArrowRight size={15} strokeWidth={2.5}/></>}
                </Btn>
              </form>
            )}

            {/* ── STEP 2: OTP ───────────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <div style={{ textAlign:'center', marginBottom:20 }}>
                  <div style={{ fontSize:13, color:T.textMuted, marginBottom:4 }}>
                    6-digit code bheja gaya:
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{fullPhone}</div>
                </div>

                <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20 }}
                  onPaste={handleOtpPaste}>
                  {otp.map((d,i) => (
                    <input
                      key={i} id={`otp-${i}`}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={e=>handleOtpChange(i,e.target.value)}
                      onKeyDown={e=>handleOtpKey(i,e)}
                      className={`otp-box${d?' filled':''}`}
                      autoFocus={i===0}
                    />
                  ))}
                </div>

                <Btn loading={loading} type="submit" disabled={loading}>
                  {loading ? 'Verify ho raha hai…' : <><ShieldCheck size={15}/> OTP Verify Karo <ArrowRight size={15} strokeWidth={2.5}/></>}
                </Btn>

                <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:T.textMuted }}>
                  OTP nahi mila?{' '}
                  <button type="button" className="resend-btn"
                    disabled={timer>0||loading}
                    onClick={async()=>{
                      setLoading(true);
                      try{
                        await API.post('/auth/send-otp',{phone:fullPhone});
                        toast.success('Naya OTP bhej diya!');
                        setOtp(['','','','','','']); startTimer();
                      }catch(err){toast.error(err.response?.data?.message||'Retry failed');}
                      finally{setLoading(false);}
                    }}>
                    {timer>0?`Resend (${timer}s)`:'Dobara Bhejo'}
                  </button>
                </div>

                <div style={{ textAlign:'center', marginTop:10 }}>
                  <button type="button"
                    onClick={()=>{setStep(1);setOtp(['','','','','','']);}}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      color:T.textLight, fontSize:12, fontFamily:T.font }}>
                    ← Number change karna hai?
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: Details ───────────────────────────────── */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                {/* Verified badge */}
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
                  borderRadius:12, background:T.greenLow, border:`1px solid ${T.greenBorder}`,
                  marginBottom:20 }}>
                  <ShieldCheck size={15} color={T.green} />
                  <span style={{ fontSize:13, fontWeight:700, color:T.green }}>{fullPhone} — Verified ✓</span>
                </div>

                <Field label="Full Name">
                  <InputBox icon={<User size={15}/>} type="text" placeholder="Your full name"
                    value={form.name} onChange={upd('name')} required autoComplete="name" />
                </Field>

                <Field label="Email Address">
                  <InputBox icon={<Mail size={15}/>} type="email" placeholder="name@example.com"
                    value={form.email} onChange={upd('email')} required autoComplete="email" />
                </Field>

                <Field label="Password">
                  <InputBox
                    icon={<Lock size={15}/>}
                    type={showPw?'text':'password'}
                    placeholder="Minimum 6 characters"
                    value={form.password} onChange={upd('password')}
                    required autoComplete="new-password"
                    rightSlot={
                      <button type="button"
                        onClick={()=>setShowPw(!showPw)}
                        style={{ position:'absolute', right:12, background:'none', border:'none',
                          cursor:'pointer', color:T.textMuted, display:'flex', padding:0 }}>
                        {showPw
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    }
                  />
                  <PwStrength pw={form.password} />
                </Field>

                <p style={{ fontSize:12, color:T.textLight, marginBottom:4, lineHeight:1.6 }}>
                  Account banane par aap hamare{' '}
                  <a href="/terms" className="auth-link" style={{ fontSize:12 }}>Terms</a>
                  {' '}aur{' '}
                  <a href="/privacy" className="auth-link" style={{ fontSize:12 }}>Privacy Policy</a>
                  {' '}se agree karte hain.
                </p>

                <Btn loading={loading} type="submit" disabled={loading}>
                  {loading ? 'Account ban raha hai…' : <>Account Banao <ArrowRight size={15} strokeWidth={2.5}/></>}
                </Btn>
              </form>
            )}

            <p style={{ textAlign:'center', fontSize:13, color:T.textMuted, marginTop:20 }}>
              Account hai pehle se?{' '}
              <Link to="/login" className="auth-link">Sign in karo</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
