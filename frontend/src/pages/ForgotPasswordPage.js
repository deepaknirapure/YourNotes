import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MailCheck, Loader2 } from "lucide-react";
import API from "../api/axios";

// Hindi: Forgot password page — clean centered card layout
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  body { background:var(--bg,#f7f6f3); color:var(--text,#18181a); font-family:'DM Sans',sans-serif; }

  .fp-root {
    min-height:100vh; min-height:100dvh;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:24px; background:var(--bg,#f7f6f3);
  }

  /* Hindi: Logo at top */
  .fp-logo {
    font-size:18px; font-weight:800; letter-spacing:-0.5px;
    margin-bottom:36px;
    background:linear-gradient(90deg,var(--text,#18181a) 47%,#f97316 47%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .fp-card {
    background:var(--surface,#fff); border:1px solid var(--border,#e9e6e0);
    border-radius:20px; padding:44px 40px; width:100%; max-width:420px;
    box-shadow:0 4px 16px rgba(0,0,0,0.06);
    animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }

  .fp-icon-wrap {
    width:52px; height:52px; background:var(--bg,#f7f6f3);
    border:1px solid var(--border,#e9e6e0); border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 22px; color:var(--text-3,#8a8794);
  }
  .fp-icon-wrap.success { background:#f0fdf4; border-color:#bbf7d0; color:#16a34a; }

  .fp-title {
    font-size:24px; font-weight:800; color:var(--text,#18181a);
    letter-spacing:-0.5px; text-align:center; margin-bottom:10px;
  }
  .fp-sub {
    font-size:14px; color:var(--text-3,#8a8794); text-align:center;
    line-height:1.65; margin-bottom:30px;
  }

  .fp-field { margin-bottom:18px; }
  .fp-label { display:block; font-size:11px; font-weight:700; color:var(--text-3,#8a8794); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:7px; }
  .fp-iw { position:relative; }
  .fp-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--text-4,#b8b5be); pointer-events:none; display:flex; }
  .fp-input {
    width:100%; padding:11px 14px 11px 41px;
    background:var(--surface,#fff); border:1.5px solid var(--border,#e9e6e0);
    border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:15px; color:var(--text,#18181a); outline:none; transition:all 0.18s;
  }
  .fp-input::placeholder { color:var(--text-4,#b8b5be); }
  .fp-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.10); }

  .fp-submit {
    width:100%; padding:13px; background:#18181a; color:#f7f6f3;
    border:none; border-radius:10px; font-family:'DM Sans',sans-serif;
    font-size:15px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;
  }
  .fp-submit:hover:not(:disabled) { background:#f97316; box-shadow:0 6px 20px rgba(249,115,22,0.25); }
  .fp-submit:disabled { opacity:0.5; cursor:not-allowed; }

  .fp-back {
    display:flex; align-items:center; gap:6px;
    color:var(--text-3,#8a8794); text-decoration:none;
    font-size:14px; font-weight:600; margin-top:22px;
    justify-content:center; transition:color 0.15s;
  }
  .fp-back:hover { color:#f97316; }

  @media(max-width:480px) {
    .fp-card { padding:32px 24px; }
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Hindi: Email send karne ka handler
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-root">
      <style>{STYLES}</style>

      <div className="fp-logo">YourNotes</div>

      <div className="fp-card">
        <div className={`fp-icon-wrap${sent ? ' success' : ''}`}>
          {sent ? <MailCheck size={24} /> : <Mail size={24} />}
        </div>

        {sent ? (
          <>
            <h2 className="fp-title">Check your email</h2>
            <p className="fp-sub">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="fp-back">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h2 className="fp-title">Reset your password</h2>
            <p className="fp-sub">
              Enter the email address associated with your account. We'll send you a link to reset your password.
            </p>

            {error && (
              <div style={{ background:'var(--red-light,rgba(220,38,38,0.08))', border:'1px solid rgba(220,38,38,0.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--red,#dc2626)', marginBottom:16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="fp-field">
                <label className="fp-label">Email address</label>
                <div className="fp-iw">
                  <span className="fp-ico"><Mail size={15} /></span>
                  <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="fp-input" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="fp-submit">
                {loading
                  ? <><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}} /> Sending...</>
                  : 'Send reset link'
                }
              </button>
            </form>

            <Link to="/login" className="fp-back">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}