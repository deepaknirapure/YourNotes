import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes floatUp{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }

  :root{
    --a:#f97316; --ad:#ea6c0a; --al:rgba(249,115,22,0.10); --ar:rgba(249,115,22,0.22);
    --bg:#f8f7f4; --sur:#ffffff; --brd:#eae7e1; --brd2:#d6d2ca;
    --tx:#17171a; --tx2:#44444e; --tx3:#87849a; --tx4:#b5b2c0;
    --fn:'Plus Jakarta Sans',sans-serif;
  }
  body{background:var(--bg);font-family:var(--fn);}

  .auth-root{display:flex;min-height:100vh;min-height:100dvh;}

  /* ── Left Panel ── */
  .auth-left{
    flex:1.1;background:#17171a;display:flex;flex-direction:column;
    justify-content:space-between;padding:52px 56px;
    position:relative;overflow:hidden;
  }
  .al-dot-grid{
    position:absolute;inset:0;z-index:0;opacity:0.035;
    background-image:radial-gradient(#fff 1px,transparent 1px);
    background-size:30px 30px;
  }
  .al-glow1{
    position:absolute;width:380px;height:380px;border-radius:50%;
    background:radial-gradient(circle,rgba(249,115,22,0.20) 0%,transparent 65%);
    top:-100px;right:-100px;z-index:0;
  }
  .al-glow2{
    position:absolute;width:240px;height:240px;border-radius:50%;
    background:radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%);
    bottom:50px;left:-80px;z-index:0;
  }
  .al-logo{
    font-size:16px;font-weight:800;letter-spacing:-0.5px;
    position:relative;z-index:1;display:flex;align-items:center;gap:9px;color:#f8f7f4;
    text-decoration:none;
  }
  .al-logo-icon{
    width:30px;height:30px;border-radius:8px;
    background:var(--a);display:flex;align-items:center;justify-content:center;
  }
  .al-content{position:relative;z-index:1;}
  .al-tag{
    display:inline-flex;align-items:center;gap:7px;
    background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.22);
    color:#f97316;border-radius:100px;padding:6px 16px;
    font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:28px;
  }
  .al-title{font-size:clamp(30px,3.8vw,48px);font-weight:900;color:#f8f7f4;line-height:1.05;letter-spacing:-2px;margin-bottom:16px;}
  .al-title em{color:#f97316;font-style:normal;}
  .al-desc{font-size:15px;color:rgba(248,247,244,0.45);line-height:1.72;max-width:340px;font-weight:500;}
  .al-feats{display:flex;flex-direction:column;gap:14px;margin-top:36px;}
  .al-feat{display:flex;align-items:flex-start;gap:14px;}
  .al-feat-ico{
    width:40px;height:40px;border-radius:11px;flex-shrink:0;
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);
    display:flex;align-items:center;justify-content:center;
  }
  .al-feat-title{font-size:14px;font-weight:700;color:#f8f7f4;margin-bottom:3px;letter-spacing:-0.2px;}
  .al-feat-desc{font-size:13px;color:rgba(248,247,244,0.38);line-height:1.5;font-weight:500;}
  .al-footer{
    position:relative;z-index:1;
    border-top:1px solid rgba(255,255,255,0.07);padding-top:22px;
    font-size:12px;color:rgba(248,247,244,0.25);font-weight:600;letter-spacing:0.02em;
  }

  /* ── Right: Form ── */
  .auth-right{
    flex:1;background:var(--bg);display:flex;align-items:center;
    justify-content:center;padding:52px 7%;
  }
  .ar-wrap{width:100%;max-width:400px;animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;}
  .ar-head{margin-bottom:34px;}
  .ar-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--a);margin-bottom:10px;}
  .ar-title{font-size:28px;font-weight:900;color:var(--tx);letter-spacing:-1.2px;margin-bottom:6px;}
  .ar-sub{font-size:14px;color:var(--tx3);font-weight:500;}

  .ar-field{margin-bottom:16px;}
  .ar-label{display:block;font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;}
  .ar-iw{position:relative;}
  .ar-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--tx4);pointer-events:none;display:flex;}
  .ar-input{
    width:100%;padding:12px 16px 12px 43px;
    background:var(--sur);border:1.5px solid var(--brd);
    border-radius:11px;font-family:var(--fn);
    font-size:14.5px;font-weight:500;color:var(--tx);outline:none;transition:all 0.18s;
  }
  .ar-input::placeholder{color:var(--tx4);}
  .ar-input:focus{border-color:var(--a);box-shadow:0 0 0 3.5px var(--al);}

  .ar-forgot{display:block;text-align:right;font-size:13px;font-weight:700;color:var(--a);text-decoration:none;margin-top:-8px;margin-bottom:24px;transition:color 0.15s;}
  .ar-forgot:hover{color:var(--ad);}

  .ar-submit{
    width:100%;padding:13.5px;background:var(--tx);color:var(--sur);
    border:none;border-radius:11px;font-family:var(--fn);
    font-size:15px;font-weight:800;cursor:pointer;letter-spacing:-0.2px;
    display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;
  }
  .ar-submit:hover:not(:disabled){background:var(--a);box-shadow:0 8px 24px var(--ar);}
  .ar-submit:disabled{opacity:0.5;cursor:not-allowed;}

  .ar-divider{display:flex;align-items:center;gap:12px;margin:22px 0;}
  .ar-divider-line{flex:1;height:1px;background:var(--brd);}
  .ar-divider-text{font-size:12px;color:var(--tx4);font-weight:600;}

  .ar-footer-link{text-align:center;margin-top:22px;font-size:14px;color:var(--tx3);font-weight:500;}
  .ar-footer-link a{color:var(--a);font-weight:800;text-decoration:none;}
  .ar-footer-link a:hover{text-decoration:underline;}

  @media(max-width:900px){
    .auth-left{display:none;}
    .auth-right{background:var(--sur);padding:40px 24px;min-height:100vh;align-items:flex-start;padding-top:64px;}
    .ar-wrap::before{
      content:'YourNotes';display:block;font-size:18px;font-weight:800;letter-spacing:-0.6px;margin-bottom:36px;color:var(--tx);
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
        <a href="/" className="al-logo">
          <div className="al-logo-icon"><Sparkles size={15} color="#fff" strokeWidth={2.5} /></div>
          YourNotes
        </a>
        <div className="al-content">
          <div className="al-tag"><Sparkles size={10} /> Smart note-taking</div>
          <h1 className="al-title">Think clearer.<br /><em>Study smarter.</em></h1>
          <p className="al-desc">Your notes, flashcards, and AI summaries — all in one minimal workspace.</p>
          <div className="al-feats">
            <div className="al-feat">
              <div className="al-feat-ico"><Sparkles size={18} color="#f97316" /></div>
              <div><div className="al-feat-title">AI-Powered Summaries</div><div className="al-feat-desc">Auto-generate study materials from any note.</div></div>
            </div>
            <div className="al-feat">
              <div className="al-feat-ico"><ShieldCheck size={18} color="#a78bfa" /></div>
              <div><div className="al-feat-title">Private & Secure</div><div className="al-feat-desc">Your intellectual work stays yours, always.</div></div>
            </div>
            <div className="al-feat">
              <div className="al-feat-ico"><Zap size={18} color="#60a5fa" /></div>
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
            <div className="ar-eyebrow">Welcome back</div>
            <h2 className="ar-title">Sign in to your workspace</h2>
            <p className="ar-sub">Enter your credentials to continue</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="ar-field">
              <label className="ar-label">Email address</label>
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