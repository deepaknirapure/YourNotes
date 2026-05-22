import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Same design tokens as Settings + Register ─────────────────────────────────
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
  font:      "'Plus Jakarta Sans', sans-serif",
};

function InputBox({ icon, rightSlot, style, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center',
      background:T.surface2, border:`1.5px solid ${focus ? T.accent : T.border}`,
      borderRadius:12, transition:'border-color 0.18s', ...style }}>
      {icon && (
        <span style={{ position:'absolute', left:13, color:focus ? T.accent : T.textLight,
          transition:'color 0.18s', pointerEvents:'none', display:'flex' }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        onFocus={e=>{ setFocus(true); props.onFocus?.(e); }}
        onBlur={e=>{ setFocus(false); props.onBlur?.(e); }}
        style={{ flex:1, background:'transparent', border:'none', outline:'none',
          padding:`12px 14px 12px ${icon?'40px':'14px'}`,
          fontFamily:T.font, fontSize:14, color:T.text,
          paddingRight: rightSlot ? 44 : 14, ...props.style }}
      />
      {rightSlot}
    </div>
  );
}

function Btn({ loading, children, ...props }) {
  return (
    <button {...props} style={{
      width:'100%', padding:'13px 20px', borderRadius:12, border:'none',
      background: loading ? T.border : T.accent,
      color: loading ? T.textMuted : '#fff',
      fontFamily:T.font, fontSize:14, fontWeight:800,
      cursor: loading ? 'not-allowed' : 'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      transition:'background 0.2s, transform 0.1s', marginTop:8,
      ...props.style,
    }}
      onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background='#ea6c04'; }}
      onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background=T.accent; }}
      onMouseDown={e=>{ if(!loading) e.currentTarget.style.transform='scale(0.98)'; }}
      onMouseUp={e=>{ e.currentTarget.style.transform='scale(1)'; }}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email||!form.password) return toast.error('Sabhi fields fill karo');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/home');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Email ya password galat hai.');
    } finally { setLoading(false); }
  };

  const upd = k => e => setForm({...form, [k]: e.target.value});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:${T.bg}; }
        .lgn-root { display:flex; min-height:100vh; font-family:${T.font}; background:${T.bg}; }
        .lgn-left {
          width:420px; flex-shrink:0; display:flex; flex-direction:column;
          padding:36px 40px; background:${T.surface}; border-right:1px solid ${T.border};
          position:relative; overflow:hidden;
        }
        .lgn-left-noise {
          position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 70% 50% at 20% 30%, rgba(249,115,22,0.06) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 60% at 80% 80%, rgba(249,115,22,0.04) 0%, transparent 65%);
        }
        .lgn-right {
          flex:1; display:flex; align-items:center; justify-content:center;
          padding:40px 24px; overflow-y:auto;
        }
        .lgn-form-wrap { width:100%; max-width:420px; }
        .feat-card-lgn {
          display:flex; align-items:flex-start; gap:14px; padding:14px 16px;
          border-radius:14px; background:${T.surface2}; border:1px solid ${T.border};
          margin-bottom:10px;
        }
        a.auth-link { color:${T.accent}; text-decoration:none; font-weight:700; }
        a.auth-link:hover { text-decoration:underline; }
        @media(max-width:768px){
          .lgn-left { display:none; }
          .lgn-right { padding:24px 16px; }
        }
      `}</style>

      <div className="lgn-root">
        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <div className="lgn-left">
          <div className="lgn-left-noise" />

          {/* Logo */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', zIndex:1 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.accent,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.95"/>
              </svg>
            </div>
            <span style={{ fontSize:18, fontWeight:900, color:T.text, letterSpacing:'-0.3px' }}>YourNotes</span>
          </a>

          {/* Main content */}
          <div style={{ zIndex:1, paddingTop:56, paddingBottom:32, flex:1 }}>
            {/* Pill */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px',
              borderRadius:50, background:T.accentLow, border:`1px solid rgba(249,115,22,0.2)`,
              marginBottom:20 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:T.accent, display:'block' }} />
              <span style={{ fontSize:11, fontWeight:700, color:T.accent, letterSpacing:'0.04em',
                textTransform:'uppercase' }}>Smart note-taking</span>
            </div>

            <h1 style={{ fontSize:30, fontWeight:900, color:T.text, lineHeight:1.2,
              letterSpacing:'-0.5px', marginBottom:12 }}>
              Think clearer.<br />
              <span style={{ color:T.accent }}>Study smarter.</span>
            </h1>
            <p style={{ fontSize:14, color:T.textMuted, lineHeight:1.7, marginBottom:32 }}>
              Your notes, flashcards, and AI summaries — all in one minimal workspace designed for focused study.
            </p>

            {/* Feature cards */}
            {[
              { icon:<Sparkles size={17} color="#f97316"/>, bg:'rgba(249,115,22,0.08)', border:'rgba(249,115,22,0.15)',
                title:'AI-Powered Summaries', sub:'Auto-generate study materials from any note.' },
              { icon:<ShieldCheck size={17} color="#a78bfa"/>, bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.15)',
                title:'Private & Secure', sub:'Your intellectual work stays yours, always.' },
              { icon:<Zap size={17} color="#60a5fa"/>, bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.15)',
                title:'Fast & Organized', sub:'Folders, tags, and instant search built in.' },
            ].map(f => (
              <div key={f.title} className="feat-card-lgn">
                <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:f.bg, border:`1px solid ${f.border}` }}>
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
              All systems normal
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <div className="lgn-right">
          <div className="lgn-form-wrap">
            {/* Header */}
            <div style={{ marginBottom:32 }}>
              <div style={{ fontSize:11, fontWeight:800, color:T.accent, letterSpacing:'0.06em',
                textTransform:'uppercase', marginBottom:6 }}>Sign in</div>
              <h2 style={{ fontSize:26, fontWeight:900, color:T.text, letterSpacing:'-0.4px', marginBottom:6 }}>
                Welcome back
              </h2>
              <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.6 }}>
                Apna workspace access karne ke liye login karo.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:800, letterSpacing:'0.05em',
                  textTransform:'uppercase', color:T.textMuted, marginBottom:7 }}>
                  Email Address
                </label>
                <InputBox
                  icon={<Mail size={15}/>}
                  type="email" placeholder="name@example.com"
                  value={form.email} onChange={upd('email')}
                  required autoComplete="email"
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                  <label style={{ fontSize:11, fontWeight:800, letterSpacing:'0.05em',
                    textTransform:'uppercase', color:T.textMuted }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize:12, color:T.accent, fontWeight:700,
                    textDecoration:'none' }}
                    onMouseOver={e=>e.target.style.textDecoration='underline'}
                    onMouseOut={e=>e.target.style.textDecoration='none'}>
                    Bhool gaye?
                  </Link>
                </div>
                <InputBox
                  icon={<Lock size={15}/>}
                  type={showPw?'text':'password'}
                  placeholder="Apna password daalo"
                  value={form.password} onChange={upd('password')}
                  required autoComplete="current-password"
                  rightSlot={
                    <button type="button" onClick={()=>setShowPw(!showPw)}
                      style={{ position:'absolute', right:12, background:'none', border:'none',
                        cursor:'pointer', color:T.textMuted, display:'flex', padding:0 }}>
                      {showPw
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  }
                />
              </div>

              <Btn loading={loading} type="submit" disabled={loading}>
                {loading ? 'Sign in ho raha hai…' : <>Sign In <ArrowRight size={15} strokeWidth={2.5}/></>}
              </Btn>
            </form>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
              <div style={{ flex:1, height:1, background:T.border }} />
              <span style={{ fontSize:11, color:T.textLight, fontWeight:600, letterSpacing:'0.04em',
                textTransform:'uppercase' }}>ya</span>
              <div style={{ flex:1, height:1, background:T.border }} />
            </div>

            {/* Register CTA card */}
            <div style={{ padding:'16px 18px', borderRadius:14, background:T.surface,
              border:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:T.accentLow,
                border:`1px solid rgba(249,115,22,0.2)`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill={T.accent} fillOpacity="0.9"/>
                </svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:800, color:T.text, marginBottom:2 }}>
                  Naya account banana hai?
                </div>
                <div style={{ fontSize:12, color:T.textMuted }}>
                  Free hai — 1 minute mein shuru karo
                </div>
              </div>
              <Link to="/register" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                borderRadius:10, background:T.accent, color:'#fff', textDecoration:'none',
                fontSize:13, fontWeight:800, flexShrink:0, whiteSpace:'nowrap' }}>
                Register <ArrowRight size={13} strokeWidth={2.5}/>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
