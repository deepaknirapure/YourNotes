// RegisterPage.js — same left-panel pattern as Login, light variant
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  body { background:var(--bg,#f7f6f3); font-family:'DM Sans',sans-serif; }

  .auth-root { display:flex; min-height:100vh; min-height:100dvh; }

  /* Left — light branding panel (contrast from Login) */
  .auth-left {
    flex:1.05; background:var(--surface,#ffffff); border-right:1px solid var(--border,#e9e6e0);
    display:flex; flex-direction:column; justify-content:space-between;
    padding:52px 56px; position:relative; overflow:hidden;
  }
  .al-glow {
    position:absolute; bottom:-120px; right:-120px; width:360px; height:360px;
    border-radius:50%; background:radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%);
    pointer-events:none; z-index:0;
  }
  .al-logo { font-size:17px; font-weight:800; letter-spacing:-0.5px; position:relative; z-index:1; color:var(--text,#18181a); display:flex; align-items:center; gap:5px; }
  .al-logo-dot { width:5px; height:5px; border-radius:50%; background:#f97316; }
  .al-content { position:relative; z-index:1; max-width:400px; }
  .al-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:var(--bg,#f7f6f3); border:1px solid var(--border,#e9e6e0);
    border-radius:999px; padding:5px 14px;
    font-size:11px; font-weight:700; color:var(--text-3,#8a8794);
    letter-spacing:0.5px; text-transform:uppercase; margin-bottom:24px;
  }
  .al-title { font-size:clamp(26px,3vw,38px); font-weight:800; color:var(--text,#18181a); line-height:1.1; letter-spacing:-1.2px; margin-bottom:12px; }
  .al-title em { color:#f97316; font-style:normal; }
  .al-desc { font-size:14px; color:var(--text-3,#8a8794); line-height:1.7; margin-bottom:32px; }
  .al-feats { display:flex; flex-direction:column; gap:14px; }
  .al-feat  { display:flex; align-items:flex-start; gap:12px; }
  .al-feat-ico { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .al-feat-title { font-size:13px; font-weight:700; color:var(--text,#18181a); margin-bottom:2px; }
  .al-feat-desc  { font-size:12px; color:var(--text-3,#8a8794); line-height:1.5; }
  .al-footer { position:relative; z-index:1; border-top:1px solid var(--border,#e9e6e0); padding-top:20px; font-size:12px; color:var(--text-4,#b8b5be); font-weight:500; }

  /* Right — form (same as LoginPage) */
  .auth-right {
    flex:1; background:var(--bg,#f7f6f3); display:flex; align-items:center;
    justify-content:center; padding:52px 7%;
  }
  .ar-wrap {
    width:100%; max-width:392px;
    animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ar-head  { margin-bottom:28px; }
  .ar-title { font-size:26px; font-weight:800; color:var(--text,#18181a); letter-spacing:-0.8px; margin-bottom:5px; }
  .ar-sub   { font-size:13px; color:var(--text-3,#8a8794); }
  .ar-field { margin-bottom:13px; }
  .ar-label { display:block; font-size:11px; font-weight:700; color:var(--text-3,#8a8794); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; }
  .ar-iw    { position:relative; }
  .ar-ico   { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-4,#b8b5be); pointer-events:none; display:flex; }
  .ar-input {
    width:100%; padding:10px 14px 10px 39px;
    background:var(--surface,#fff); border:1.5px solid var(--border,#e9e6e0);
    border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:14px; font-weight:500; color:var(--text,#18181a); outline:none; transition:all 0.18s;
  }
  .ar-input::placeholder { color:var(--text-4,#b8b5be); }
  .ar-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.10); }
  .ar-submit {
    width:100%; padding:12px; background:var(--text,#18181a); color:var(--surface,#fff);
    border:none; border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:all 0.2s; margin-top:6px;
  }
  .ar-submit:hover:not(:disabled) { background:#f97316; box-shadow:0 6px 20px rgba(249,115,22,0.25); }
  .ar-submit:disabled { opacity:0.5; cursor:not-allowed; }
  .ar-switch { text-align:center; margin-top:22px; font-size:13px; color:var(--text-3,#8a8794); }
  .ar-switch a { color:#f97316; font-weight:700; text-decoration:none; }
  .ar-switch a:hover { text-decoration:underline; }

  @media(max-width:900px) {
    .auth-left  { display:none; }
    .auth-right { background:var(--surface,#fff) !important; padding:40px 24px; min-height:100vh; align-items:flex-start; padding-top:60px; }
    .ar-wrap::before {
      content:'YourNotes ·';
      display:block; font-size:17px; font-weight:800; letter-spacing:-0.5px;
      margin-bottom:30px; color:var(--text,#18181a);
    }
  }
`;

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-root">
      <style>{STYLES}</style>

      <div className="auth-left">
        <div className="al-glow" />
        <div className="al-logo">YourNotes <span className="al-logo-dot" /></div>
        <div className="al-content">
          <div className="al-badge"><Sparkles size={10} /> Join thousands of students</div>
          <h1 className="al-title">Your notes,<br /><em>organized beautifully.</em></h1>
          <p className="al-desc">Create an account and start taking smarter notes today — free forever.</p>
          <div className="al-feats">
            {[
              { icon: CheckCircle2, color:'#f97316', bg:'rgba(249,115,22,0.10)', title:'Free to use',         desc:'No subscription or payment required.' },
              { icon: Globe,        color:'#7c3aed', bg:'rgba(124,58,237,0.10)', title:'Share with community',desc:'Publish notes and discover others work.' },
              { icon: Sparkles,     color:'#2563eb', bg:'rgba(37,99,235,0.10)',  title:'AI study tools',      desc:'Summaries, flashcards, and Q&A built in.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="al-feat">
                <div className="al-feat-ico" style={{ background:bg }}><Icon size={16} color={color} /></div>
                <div><div className="al-feat-title">{title}</div><div className="al-feat-desc">{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="al-footer">S.V. Polytechnic College, Bhopal · 2026</div>
      </div>

      <div className="auth-right">
        <div className="ar-wrap">
          <div className="ar-head">
            <h2 className="ar-title">Create account</h2>
            <p className="ar-sub">Start your free workspace today</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="ar-field">
              <label className="ar-label">Full Name</label>
              <div className="ar-iw">
                <span className="ar-ico"><User size={14} /></span>
                <input type="text" placeholder="Your full name" value={form.name} onChange={update('name')} className="ar-input" required />
              </div>
            </div>
            <div className="ar-field">
              <label className="ar-label">Email</label>
              <div className="ar-iw">
                <span className="ar-ico"><Mail size={14} /></span>
                <input type="email" placeholder="name@example.com" value={form.email} onChange={update('email')} className="ar-input" required />
              </div>
            </div>
            <div className="ar-field">
              <label className="ar-label">Password</label>
              <div className="ar-iw">
                <span className="ar-ico"><Lock size={14} /></span>
                <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={update('password')} className="ar-input" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="ar-submit">
              {loading
                ? <><span style={{width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}} /> Creating account…</>
                : <>Create account <ArrowRight size={15} strokeWidth={2.5} /></>}
            </button>
          </form>
          <p className="ar-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}