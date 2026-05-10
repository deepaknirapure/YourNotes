// ForgotPasswordPage.js — centered card, DM Sans, #f97316
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spin   { to{transform:rotate(360deg);} }

  body { font-family:'DM Sans',sans-serif; background:var(--bg,#f7f6f3); color:var(--text,#18181a); -webkit-font-smoothing:antialiased; }

  .auth-page  { min-height:100vh; min-height:100dvh; display:flex; flex-direction:column; background:var(--bg,#f7f6f3); }
  .auth-nav   {
    height:56px; display:flex; align-items:center; justify-content:space-between;
    padding:0 32px; border-bottom:1px solid var(--border,#e9e6e0);
    background:var(--surface,#fff);
  }
  .auth-nav-logo { font-size:16px; font-weight:800; letter-spacing:-0.5px; color:var(--text,#18181a); text-decoration:none; display:flex; align-items:center; gap:5px; }
  .auth-nav-logo-dot { width:5px; height:5px; border-radius:50%; background:#f97316; }
  .auth-center { flex:1; display:flex; align-items:center; justify-content:center; padding:32px 20px; }
  .auth-card   {
    width:100%; max-width:400px;
    background:var(--surface,#fff); border:1px solid var(--border,#e9e6e0);
    border-radius:20px; padding:40px;
    box-shadow:0 4px 20px rgba(0,0,0,0.05);
    animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }

  .fp-icon {
    width:48px; height:48px; background:var(--bg,#f7f6f3);
    border:1px solid var(--border,#e9e6e0); border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 20px; color:var(--text-3,#8a8794);
  }
  .fp-icon.success { background:rgba(22,163,74,0.08); border-color:rgba(22,163,74,0.2); color:#16a34a; }
  .fp-title  { font-size:22px; font-weight:800; color:var(--text,#18181a); letter-spacing:-0.5px; text-align:center; margin-bottom:7px; }
  .fp-sub    { font-size:13px; color:var(--text-3,#8a8794); text-align:center; line-height:1.65; margin-bottom:26px; }
  .fp-label  { display:block; font-size:11px; font-weight:700; color:var(--text-3,#8a8794); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; }
  .fp-iw     { position:relative; margin-bottom:16px; }
  .fp-ico    { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-4,#b8b5be); display:flex; pointer-events:none; }
  .fp-input  {
    width:100%; padding:10px 13px 10px 39px;
    background:var(--bg,#f7f6f3); border:1.5px solid var(--border,#e9e6e0);
    border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:14px; font-weight:500; color:var(--text,#18181a); outline:none; transition:all 0.18s;
  }
  .fp-input::placeholder { color:var(--text-4,#b8b5be); }
  .fp-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.10); background:var(--surface,#fff); }

  .fp-error {
    background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.18);
    border-radius:8px; padding:10px 13px;
    font-size:13px; color:var(--red,#dc2626); margin-bottom:14px;
  }

  .fp-submit {
    width:100%; padding:12px; background:var(--text,#18181a); color:var(--surface,#fff);
    border:none; border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;
  }
  .fp-submit:hover:not(:disabled) { background:#f97316; box-shadow:0 5px 18px rgba(249,115,22,0.28); }
  .fp-submit:disabled { opacity:0.5; cursor:not-allowed; }

  .fp-back {
    display:flex; align-items:center; gap:6px; color:var(--text-3,#8a8794);
    text-decoration:none; font-size:13px; font-weight:600;
    margin-top:20px; justify-content:center; transition:color 0.15s;
  }
  .fp-back:hover { color:#f97316; }

  @media(max-width:480px) {
    .auth-nav  { padding:0 16px; }
    .auth-card { padding:28px 20px; border-radius:16px; }
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email address');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <style>{STYLES}</style>

      <header className="auth-nav">
        <Link to="/" className="auth-nav-logo">YourNotes <span className="auth-nav-logo-dot" /></Link>
      </header>

      <div className="auth-center">
        <div className="auth-card">
          {sent ? (
            <>
              <div className="fp-icon success"><MailCheck size={22} /></div>
              <h2 className="fp-title">Check your email</h2>
              <p className="fp-sub">We've sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.</p>
              <Link to="/login" className="fp-back"><ArrowLeft size={14} /> Back to sign in</Link>
            </>
          ) : (
            <>
              <div className="fp-icon"><Mail size={22} /></div>
              <h2 className="fp-title">Forgot password?</h2>
              <p className="fp-sub">Enter your email address and we'll send you a link to reset your password.</p>
              <form onSubmit={handleSubmit}>
                <label className="fp-label">Email address</label>
                {error && <div className="fp-error">{error}</div>}
                <div className="fp-iw">
                  <span className="fp-ico"><Mail size={14} /></span>
                  <input
                    type="email" placeholder="name@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="fp-input" required
                  />
                </div>
                <button type="submit" disabled={loading} className="fp-submit">
                  {loading
                    ? <><span style={{width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} /> Sending…</>
                    : 'Send reset link'}
                </button>
              </form>
              <Link to="/login" className="fp-back"><ArrowLeft size={14} /> Back to sign in</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}