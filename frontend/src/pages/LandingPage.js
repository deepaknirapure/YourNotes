import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// Hindi: Landing page styles — DM Sans font use hoga poore project mein
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }

  body { background:#f7f6f3; color:#18181a; font-family:'DM Sans',sans-serif; }

  /* ── Root layout ── */
  .lp-root { display:flex; min-height:100vh; min-height:100dvh; background:#f7f6f3; }

  /* ── Left panel ── */
  .lp-left {
    flex:1.05; background:#18181a; display:flex; flex-direction:column;
    justify-content:space-between; padding:52px 56px;
    position:relative; overflow:hidden;
  }
  /* Hindi: Subtle dot pattern background */
  .lp-left-pattern {
    position:absolute; inset:0; z-index:0; opacity:0.04;
    background-image: radial-gradient(#fff 1px, transparent 1px);
    background-size:28px 28px;
  }
  /* Hindi: Orange accent glow */
  .lp-left-glow {
    position:absolute; width:360px; height:360px; border-radius:50%;
    background:radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 65%);
    top:-100px; right:-100px; z-index:0; pointer-events:none;
  }

  /* Hindi: Logo — text only, consistent across all pages */
  .lp-logo {
    font-size:18px; font-weight:800; letter-spacing:-0.5px;
    color:#f7f6f3; position:relative; z-index:1; display:flex; align-items:center;
  }
  .lp-logo-accent { color:#f97316; }

  /* Hindi: Main copy area */
  .lp-copy { position:relative; z-index:1; }
  .lp-eyebrow {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.25);
    color:#f97316; border-radius:999px; padding:5px 14px;
    font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;
    margin-bottom:28px;
  }
  .lp-headline {
    font-size:clamp(34px,4vw,52px); font-weight:800; color:#f7f6f3;
    line-height:1.06; letter-spacing:-1.5px; margin-bottom:18px;
  }
  .lp-headline em { color:#f97316; font-style:normal; }
  .lp-desc { font-size:15px; color:rgba(247,246,243,0.45); line-height:1.7; max-width:340px; }

  /* Hindi: Feature list */
  .lp-features { display:flex; flex-direction:column; gap:18px; margin-top:44px; }
  .lp-feat {
    display:flex; align-items:flex-start; gap:14px;
  }
  .lp-feat-icon {
    width:38px; height:38px; border-radius:10px; flex-shrink:0;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
  }
  .lp-feat-title { font-size:14px; font-weight:700; color:#f7f6f3; margin-bottom:2px; }
  .lp-feat-desc  { font-size:13px; color:rgba(247,246,243,0.4); line-height:1.55; }

  /* Hindi: Footer tag */
  .lp-footer {
    position:relative; z-index:1;
    border-top:1px solid rgba(255,255,255,0.07); padding-top:22px;
    font-size:12px; color:rgba(247,246,243,0.3); font-weight:500;
  }

  /* ── Right panel: form ── */
  .lp-right {
    flex:1; background:#f7f6f3; display:flex; align-items:center;
    justify-content:center; padding:52px 7%;
  }
  .lp-form-wrap {
    width:100%; max-width:396px;
    animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }
  .lp-form-head { margin-bottom:34px; }
  .lp-form-title {
    font-size:28px; font-weight:800; color:#18181a;
    letter-spacing:-0.8px; margin-bottom:6px;
  }
  .lp-form-sub { font-size:14px; color:#8a8794; font-weight:400; }

  /* Hindi: Input groups */
  .lp-field { margin-bottom:16px; }
  .lp-label {
    display:block; font-size:11px; font-weight:700;
    color:#8a8794; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:7px;
  }
  .lp-input-wrap { position:relative; }
  .lp-input-icon {
    position:absolute; left:13px; top:50%; transform:translateY(-50%);
    color:#b8b5be; pointer-events:none; display:flex;
  }
  .lp-input {
    width:100%; padding:11px 14px 11px 41px;
    background:#fff; border:1.5px solid #e9e6e0;
    border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:15px; font-weight:400; color:#18181a; outline:none;
    transition:all 0.18s;
  }
  .lp-input::placeholder { color:#b8b5be; }
  .lp-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.1); }

  .lp-forgot {
    display:block; text-align:right; font-size:13px; font-weight:600;
    color:#f97316; text-decoration:none; margin-top:-8px; margin-bottom:22px;
  }
  .lp-forgot:hover { color:#ea6c0a; }

  .lp-submit {
    width:100%; padding:13px; background:#18181a; color:#f7f6f3;
    border:none; border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:15px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:all 0.2s;
  }
  .lp-submit:hover:not(:disabled) {
    background:#f97316; box-shadow:0 6px 20px rgba(249,115,22,0.25);
  }
  .lp-submit:disabled { opacity:0.5; cursor:not-allowed; }

  .lp-register { text-align:center; margin-top:26px; font-size:14px; color:#8a8794; }
  .lp-register a { color:#f97316; font-weight:700; text-decoration:none; }
  .lp-register a:hover { text-decoration:underline; }

  /* Hindi: Mobile me left panel chhup jayega */
  @media(max-width:900px) {
    .lp-left { display:none; }
    .lp-right { background:#fff; padding:40px 24px; min-height:100vh; align-items:flex-start; padding-top:60px; }
    /* Hindi: Mobile pe logo dikhao form ke upar */
    .lp-form-wrap::before {
      content:'YourNotes';
      display:block; font-size:18px; font-weight:800; letter-spacing:-0.5px;
      color:#18181a; margin-bottom:32px;
      background:linear-gradient(90deg,#18181a 47%,#f97316 47%);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text;
    }
  }
`;

export default function LandingPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Hindi: Login form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="lp-root">
      <style>{STYLES}</style>

      {/* ── Left: Branding panel ── */}
      <div className="lp-left">
        <div className="lp-left-pattern" />
        <div className="lp-left-glow" />

        {/* Hindi: Text-only logo */}
        <div className="lp-logo">
          Your<span className="lp-logo-accent">Notes</span>
        </div>

        <div className="lp-copy">
          <div className="lp-eyebrow">
            <Sparkles size={10} /> Smart note-taking
          </div>
          <h1 className="lp-headline">
            Think clearer.<br /><em>Study smarter.</em>
          </h1>
          <p className="lp-desc">
            Your notes, flashcards, and AI summaries — all in one minimal workspace.
          </p>
          <div className="lp-features">
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <Sparkles size={17} color="#f97316" />
              </div>
              <div>
                <div className="lp-feat-title">AI-Powered Summaries</div>
                <div className="lp-feat-desc">Auto-generate study materials from any note.</div>
              </div>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <ShieldCheck size={17} color="#a78bfa" />
              </div>
              <div>
                <div className="lp-feat-title">Private & Secure</div>
                <div className="lp-feat-desc">Your intellectual work stays yours, always.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-footer">
          S.V. Polytechnic College, Bhopal · 2026
        </div>
      </div>

      {/* ── Right: Login form ── */}
      <div className="lp-right">
        <div className="lp-form-wrap">
          <div className="lp-form-head">
            <h2 className="lp-form-title">Welcome back</h2>
            <p className="lp-form-sub">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <label className="lp-label">Email</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><Mail size={15} /></span>
                <input
                  type="email" placeholder="name@example.com"
                  value={form.email} onChange={update('email')}
                  className="lp-input" required
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><Lock size={15} /></span>
                <input
                  type="password" placeholder="••••••••"
                  value={form.password} onChange={update('password')}
                  className="lp-input" required
                />
              </div>
            </div>

            <Link to="/forgot-password" className="lp-forgot">Forgot password?</Link>

            <button type="submit" disabled={loading} className="lp-submit">
              {loading
                ? <><span className="spinner" style={{width:16,height:16,borderWidth:'2px',borderColor:'rgba(255,255,255,0.3)',borderTopColor:'#fff'}} /> Signing in...</>
                : <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          <p className="lp-register">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}