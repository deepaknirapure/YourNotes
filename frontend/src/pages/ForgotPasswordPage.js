import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import API from '../api/axios';

// Hindi: Forgot password page — centered card, same auth layout

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  body{font-family:'DM Sans',sans-serif;background:var(--bg,#f9f8f6);color:var(--text,#111110);-webkit-font-smoothing:antialiased;}

  .auth-root{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg,#f9f8f6);}
  .auth-header{height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;border-bottom:1px solid var(--border,#e8e5df);background:var(--surface,#fff);}
  .auth-logo{font-size:17px;font-weight:800;letter-spacing:-0.5px;color:var(--text,#111110);text-decoration:none;}
  .auth-logo span{color:#f97316;}
  .auth-center{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 20px;}
  .auth-card{width:100%;max-width:400px;background:var(--surface,#fff);border:1px solid var(--border,#e8e5df);border-radius:20px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.05);animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;}

  .fp-icon{width:48px;height:48px;background:var(--bg,#f9f8f6);border:1px solid var(--border,#e8e5df);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 22px;color:var(--text-3,#87857d);}
  .fp-icon.success{background:#f0fdf4;border-color:#bbf7d0;color:#15803d;}
  .fp-title{font-size:22px;font-weight:800;color:var(--text,#111110);letter-spacing:-0.5px;text-align:center;margin-bottom:8px;}
  .fp-sub{font-size:13.5px;color:var(--text-3,#87857d);text-align:center;line-height:1.65;margin-bottom:28px;}

  .auth-label{display:block;font-size:11px;font-weight:700;color:var(--text-3,#87857d);text-transform:uppercase;letter-spacing:0.7px;margin-bottom:7px;}
  .auth-iw{position:relative;margin-bottom:18px;}
  .auth-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-4,#b5b2aa);display:flex;pointer-events:none;}
  .auth-input{width:100%;padding:10px 13px 10px 40px;background:var(--bg,#f9f8f6);border:1.5px solid var(--border,#e8e5df);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text,#111110);outline:none;transition:all 0.15s;}
  .auth-input::placeholder{color:var(--text-4,#b5b2aa);}
  .auth-input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.1);background:var(--surface,#fff);}

  .fp-error{background:rgba(185,28,28,0.06);border:1px solid rgba(185,28,28,0.18);border-radius:8px;padding:10px 13px;font-size:13px;color:var(--red,#b91c1c);margin-bottom:14px;}

  .auth-submit{width:100%;padding:12px;background:#111110;color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;}
  .auth-submit:hover:not(:disabled){background:#f97316;box-shadow:0 5px 18px rgba(249,115,22,0.28);}
  .auth-submit:disabled{opacity:0.5;cursor:not-allowed;}

  .fp-back{display:flex;align-items:center;gap:6px;color:var(--text-3,#87857d);text-decoration:none;font-size:13.5px;font-weight:600;margin-top:22px;justify-content:center;transition:color 0.15s;}
  .fp-back:hover{color:#f97316;}

  @media(max-width:480px){
    .auth-header{padding:0 16px;}
    .auth-card{padding:28px 20px;border-radius:16px;}
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Hindi: Email submit handler
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
    <div className="auth-root">
      <style>{STYLES}</style>

      <header className="auth-header">
        <Link to="/" className="auth-logo">Your<span>Notes</span></Link>
      </header>

      <div className="auth-center">
        <div className="auth-card">
          <div className={`fp-icon${sent ? ' success' : ''}`}>
            {sent ? <MailCheck size={22} /> : <Mail size={22} />}
          </div>

          {sent ? (
            <>
              <h2 className="fp-title">Check your email</h2>
              <p className="fp-sub">We sent a reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
              <Link to="/login" className="fp-back"><ArrowLeft size={14} /> Back to sign in</Link>
            </>
          ) : (
            <>
              <h2 className="fp-title">Reset your password</h2>
              <p className="fp-sub">Enter your account email and we'll send you a link to reset your password.</p>
              {error && <div className="fp-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <label className="auth-label">Email address</label>
                <div className="auth-iw">
                  <span className="auth-ico"><Mail size={15} /></span>
                  <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required />
                </div>
                <button type="submit" disabled={loading} className="auth-submit">
                  {loading
                    ? <><span style={{width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} /> Sending...</>
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