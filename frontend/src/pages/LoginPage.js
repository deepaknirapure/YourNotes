import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// Hindi: Login page — LandingPage se alag route hai, same design follow karta hai
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }

  body { background:#f7f6f3; font-family:'DM Sans',sans-serif; }

  .login-root { display:flex; min-height:100vh; min-height:100dvh; background:#f7f6f3; }

  .login-left {
    flex:1.05; background:#18181a; display:flex; flex-direction:column;
    justify-content:space-between; padding:52px 56px;
    position:relative; overflow:hidden;
  }
  .ll-pattern {
    position:absolute; inset:0; z-index:0; opacity:0.04;
    background-image:radial-gradient(#fff 1px, transparent 1px);
    background-size:28px 28px;
  }
  .ll-glow {
    position:absolute; width:360px; height:360px; border-radius:50%;
    background:radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 65%);
    top:-100px; right:-100px; z-index:0;
  }
  .ll-glow2 {
    position:absolute; width:240px; height:240px; border-radius:50%;
    background:radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%);
    bottom:60px; left:-80px; z-index:0;
  }
  .ll-logo {
    font-size:18px; font-weight:800; letter-spacing:-0.5px;
    position:relative; z-index:1;
    background:linear-gradient(90deg,#f7f6f3 47%,#f97316 47%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .ll-content { position:relative; z-index:1; }
  .ll-tag {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.25);
    color:#f97316; border-radius:999px; padding:5px 14px;
    font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;
    margin-bottom:26px;
  }
  .ll-title {
    font-size:clamp(34px,4vw,50px); font-weight:800; color:#f7f6f3;
    line-height:1.06; letter-spacing:-1.5px; margin-bottom:16px;
  }
  .ll-title em { color:#f97316; font-style:normal; }
  .ll-desc { font-size:15px; color:rgba(247,246,243,0.45); line-height:1.7; max-width:340px; }
  .ll-feats { display:flex; flex-direction:column; gap:16px; margin-top:40px; }
  .ll-feat { display:flex; align-items:flex-start; gap:14px; }
  .ll-feat-ico {
    width:38px; height:38px; border-radius:10px; flex-shrink:0;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
  }
  .ll-feat-title { font-size:14px; font-weight:700; color:#f7f6f3; margin-bottom:2px; }
  .ll-feat-desc  { font-size:13px; color:rgba(247,246,243,0.4); line-height:1.5; }
  .ll-footer {
    position:relative; z-index:1;
    border-top:1px solid rgba(255,255,255,0.07); padding-top:22px;
    font-size:12px; color:rgba(247,246,243,0.3); font-weight:500;
  }

  /* ── Right: Form ── */
  .login-right {
    flex:1; background:#f7f6f3; display:flex; align-items:center;
    justify-content:center; padding:52px 7%;
  }
  .lr-wrap {
    width:100%; max-width:396px;
    animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }
  .lr-head { margin-bottom:34px; }
  .lr-title { font-size:28px; font-weight:800; color:#18181a; letter-spacing:-0.8px; margin-bottom:6px; }
  .lr-sub   { font-size:14px; color:#8a8794; }
  .lr-field { margin-bottom:16px; }
  .lr-label { display:block; font-size:11px; font-weight:700; color:#8a8794; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:7px; }
  .lr-iw    { position:relative; }
  .lr-ico   { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#b8b5be; pointer-events:none; display:flex; }
  .lr-input {
    width:100%; padding:11px 14px 11px 41px;
    background:#fff; border:1.5px solid #e9e6e0;
    border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:15px; font-weight:400; color:#18181a; outline:none; transition:all 0.18s;
  }
  .lr-input::placeholder { color:#b8b5be; }
  .lr-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.10); }
  .lr-forgot { display:block; text-align:right; font-size:13px; font-weight:600; color:#f97316; text-decoration:none; margin-top:-8px; margin-bottom:22px; }
  .lr-forgot:hover { color:#ea6c0a; }
  .lr-submit {
    width:100%; padding:13px; background:#18181a; color:#f7f6f3;
    border:none; border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:15px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;
  }
  .lr-submit:hover:not(:disabled) { background:#f97316; box-shadow:0 6px 20px rgba(249,115,22,0.25); }
  .lr-submit:disabled { opacity:0.5; cursor:not-allowed; }
  .lr-register { text-align:center; margin-top:26px; font-size:14px; color:#8a8794; }
  .lr-register a { color:#f97316; font-weight:700; text-decoration:none; }
  .lr-register a:hover { text-decoration:underline; }

  @media(max-width:900px) {
    .login-left { display:none; }
    .login-right { background:#fff; padding:40px 24px; min-height:100vh; align-items:flex-start; padding-top:60px; }
    .lr-wrap::before {
      content:'YourNotes';
      display:block; font-size:18px; font-weight:800; letter-spacing:-0.5px;
      margin-bottom:32px;
      background:linear-gradient(90deg,#18181a 47%,#f97316 47%);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Hindi: Form submit handler
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
    <div className="login-root">
      <style>{STYLES}</style>

      {/* Left branding */}
      <div className="login-left">
        <div className="ll-pattern" /><div className="ll-glow" /><div className="ll-glow2" />
        <div className="ll-logo">YourNotes</div>
        <div className="ll-content">
          <div className="ll-tag"><Sparkles size={10} /> Smart note-taking</div>
          <h1 className="ll-title">Think clearer.<br /><em>Study smarter.</em></h1>
          <p className="ll-desc">Your notes, flashcards, and AI summaries — all in one minimal workspace.</p>
          <div className="ll-feats">
            <div className="ll-feat">
              <div className="ll-feat-ico"><Sparkles size={17} color="#f97316" /></div>
              <div><div className="ll-feat-title">AI-Powered Summaries</div><div className="ll-feat-desc">Auto-generate study materials from any note.</div></div>
            </div>
            <div className="ll-feat">
              <div className="ll-feat-ico"><ShieldCheck size={17} color="#a78bfa" /></div>
              <div><div className="ll-feat-title">Private & Secure</div><div className="ll-feat-desc">Your intellectual work stays yours, always.</div></div>
            </div>
            <div className="ll-feat">
              <div className="ll-feat-ico"><Zap size={17} color="#60a5fa" /></div>
              <div><div className="ll-feat-title">Fast & Organized</div><div className="ll-feat-desc">Folders, tags, and instant search built in.</div></div>
            </div>
          </div>
        </div>
        <div className="ll-footer">S.V. Polytechnic College, Bhopal · 2026</div>
      </div>

      {/* Right form */}
      <div className="login-right">
        <div className="lr-wrap">
          <div className="lr-head">
            <h2 className="lr-title">Welcome back</h2>
            <p className="lr-sub">Sign in to your workspace</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="lr-field">
              <label className="lr-label">Email</label>
              <div className="lr-iw">
                <span className="lr-ico"><Mail size={15} /></span>
                <input type="email" placeholder="name@example.com" value={form.email} onChange={update('email')} className="lr-input" required />
              </div>
            </div>
            <div className="lr-field">
              <label className="lr-label">Password</label>
              <div className="lr-iw">
                <span className="lr-ico"><Lock size={15} /></span>
                <input type="password" placeholder="••••••••" value={form.password} onChange={update('password')} className="lr-input" required />
              </div>
            </div>
            <Link to="/forgot-password" className="lr-forgot">Forgot password?</Link>
            <button type="submit" disabled={loading} className="lr-submit">
              {loading
                ? <><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}} /> Signing in...</>
                : <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>}
            </button>
          </form>
          <p className="lr-register">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}