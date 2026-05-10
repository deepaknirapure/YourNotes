import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}

  :root{
    --a: #f97316; --ad: #ea6c0a; --al: rgba(249,115,22,0.10); --ar: rgba(249,115,22,0.20);
    --bg: #f7f6f3; --sur: #ffffff; --brd: #e9e6e0; --brd2: #d8d4cc;
    --tx: #18181a; --tx2: #4a4a54; --tx3: #8a8794; --tx4: #b8b5be;
    --fn: 'DM Sans', sans-serif;
  }
  body{background:var(--bg);font-family:var(--fn);}

  .auth-root{display:flex;min-height:100vh;min-height:100dvh;}

  /* ── Left Panel ── */
  .auth-left{
    flex:1.05;background:#18181a;display:flex;flex-direction:column;
    justify-content:space-between;padding:52px 56px;
    position:relative;overflow:hidden;
  }
  .al-dot-grid{
    position:absolute;inset:0;z-index:0;opacity:0.04;
    background-image:radial-gradient(#fff 1px,transparent 1px);
    background-size:28px 28px;
  }
  .al-glow1{
    position:absolute;width:340px;height:340px;border-radius:50%;
    background:radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 65%);
    top:-90px;right:-90px;z-index:0;
  }
  .al-glow2{
    position:absolute;width:220px;height:220px;border-radius:50%;
    background:radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 65%);
    bottom:60px;left:-70px;z-index:0;
  }
  .al-logo{
    font-size:17px;font-weight:800;letter-spacing:-0.5px;
    position:relative;z-index:1;
    background:linear-gradient(90deg,#f7f6f3 47%,#f97316 47%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }
  .al-content{position:relative;z-index:1;}
  .al-tag{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.25);
    color:#f97316;border-radius:999px;padding:5px 14px;
    font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:26px;
  }
  .al-title{font-size:clamp(32px,4vw,50px);font-weight:800;color:#f7f6f3;line-height:1.06;letter-spacing:-1.5px;margin-bottom:14px;}
  .al-title em{color:#f97316;font-style:normal;}
  .al-desc{font-size:15px;color:rgba(247,246,243,0.45);line-height:1.7;max-width:340px;}
  .al-feats{display:flex;flex-direction:column;gap:16px;margin-top:36px;}
  .al-feat{display:flex;align-items:flex-start;gap:14px;}
  .al-feat-ico{
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
  }
  .al-feat-title{font-size:14px;font-weight:700;color:#f7f6f3;margin-bottom:2px;}
  .al-feat-desc{font-size:13px;color:rgba(247,246,243,0.40);line-height:1.5;}
  .al-footer{
    position:relative;z-index:1;
    border-top:1px solid rgba(255,255,255,0.07);padding-top:22px;
    font-size:12px;color:rgba(247,246,243,0.28);font-weight:500;
  }

  /* ── Right: Form ── */
  .auth-right{
    flex:1;background:var(--bg);display:flex;align-items:center;
    justify-content:center;padding:52px 7%;
  }
  .ar-wrap{width:100%;max-width:400px;animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;}
  .ar-head{margin-bottom:32px;}
  .ar-title{font-size:28px;font-weight:800;color:var(--tx);letter-spacing:-0.8px;margin-bottom:6px;}
  .ar-sub{font-size:14px;color:var(--tx3);}

  .ar-field{margin-bottom:16px;}
  .ar-label{display:block;font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:7px;}
  .ar-iw{position:relative;}
  .ar-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--tx4);pointer-events:none;display:flex;}
  .ar-input{
    width:100%;padding:11px 14px 11px 41px;
    background:var(--sur);border:1.5px solid var(--brd);
    border-radius:10px;font-family:var(--fn);
    font-size:15px;font-weight:400;color:var(--tx);outline:none;transition:all 0.18s;
  }
  .ar-input::placeholder{color:var(--tx4);}
  .ar-input:focus{border-color:var(--a);box-shadow:0 0 0 3px var(--al);}

  .ar-forgot{display:block;text-align:right;font-size:13px;font-weight:600;color:var(--a);text-decoration:none;margin-top:-8px;margin-bottom:22px;}
  .ar-forgot:hover{color:var(--ad);}

  .ar-submit{
    width:100%;padding:13px;background:var(--tx);color:var(--sur);
    border:none;border-radius:10px;font-family:var(--fn);
    font-size:15px;font-weight:700;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;
  }
  .ar-submit:hover:not(:disabled){background:var(--a);box-shadow:0 6px 20px var(--ar);}
  .ar-submit:disabled{opacity:0.5;cursor:not-allowed;}

  .ar-footer-link{text-align:center;margin-top:26px;font-size:14px;color:var(--tx3);}
  .ar-footer-link a{color:var(--a);font-weight:700;text-decoration:none;}
  .ar-footer-link a:hover{text-decoration:underline;}

  @media(max-width:900px){
    .auth-left{display:none;}
    .auth-right{background:var(--sur);padding:40px 24px;min-height:100vh;align-items:flex-start;padding-top:60px;}
    .ar-wrap::before{
      content:'YourNotes';display:block;font-size:18px;font-weight:800;letter-spacing:-0.5px;margin-bottom:32px;
      background:linear-gradient(90deg,#18181a 47%,#f97316 47%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="auth-root">
      <style>{STYLES}</style>

      {/* Left branding */}
      <div className="auth-left">
        <div className="al-dot-grid" /><div className="al-glow1" /><div className="al-glow2" />
        <div className="al-logo">YourNotes</div>
        <div className="al-content">
          <div className="al-tag"><Sparkles size={10} /> Smart note-taking</div>
          <h1 className="al-title">Think clearer.<br /><em>Study smarter.</em></h1>
          <p className="al-desc">Your notes, flashcards, and AI summaries — all in one minimal workspace.</p>
          <div className="al-feats">
            <div className="al-feat">
              <div className="al-feat-ico"><Sparkles size={17} color="#f97316" /></div>
              <div><div className="al-feat-title">AI-Powered Summaries</div><div className="al-feat-desc">Auto-generate study materials from any note.</div></div>
            </div>
            <div className="al-feat">
              <div className="al-feat-ico"><ShieldCheck size={17} color="#a78bfa" /></div>
              <div><div className="al-feat-title">Private & Secure</div><div className="al-feat-desc">Your intellectual work stays yours, always.</div></div>
            </div>
            <div className="al-feat">
              <div className="al-feat-ico"><Zap size={17} color="#60a5fa" /></div>
              <div><div className="al-feat-title">Fast & Organized</div><div className="al-feat-desc">Folders, tags, and instant search built in.</div></div>
            </div>
          </div>
        </div>
        <div className="al-footer">S.V. Polytechnic College, Bhopal · 2026</div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="ar-wrap">
          <div className="ar-head">
            <h2 className="ar-title">Welcome back</h2>
            <p className="ar-sub">Sign in to your workspace</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="ar-field">
              <label className="ar-label">Email</label>
              <div className="ar-iw">
                <span className="ar-ico"><Mail size={15} /></span>
                <input type="email" placeholder="name@example.com" value={form.email} onChange={update('email')} className="ar-input" required />
              </div>
            </div>
            <div className="ar-field">
              <label className="ar-label">Password</label>
              <div className="ar-iw">
                <span className="ar-ico"><Lock size={15} /></span>
                <input type="password" placeholder="••••••••" value={form.password} onChange={update('password')} className="ar-input" required />
              </div>
            </div>
            <Link to="/forgot-password" className="ar-forgot">Forgot password?</Link>
            <button type="submit" disabled={loading} className="ar-submit">
              {loading
                ? <><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}}/> Signing in...</>
                : <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>}
            </button>
          </form>
          <p className="ar-footer-link">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}