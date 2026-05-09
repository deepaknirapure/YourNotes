import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

// Hindi: Reset password page — same auth card layout

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  body{font-family:'DM Sans',sans-serif;background:var(--bg,#f9f8f6);color:var(--text,#111110);-webkit-font-smoothing:antialiased;}

  .auth-root{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg,#f9f8f6);}
  .auth-header{height:60px;display:flex;align-items:center;padding:0 32px;border-bottom:1px solid var(--border,#e8e5df);background:var(--surface,#fff);}
  .auth-logo{font-size:17px;font-weight:800;letter-spacing:-0.5px;color:var(--text,#111110);text-decoration:none;}
  .auth-logo span{color:#f97316;}
  .auth-center{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 20px;}
  .auth-card{width:100%;max-width:400px;background:var(--surface,#fff);border:1px solid var(--border,#e8e5df);border-radius:20px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.05);animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;}

  .rp-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 22px;}
  .rp-title{font-size:22px;font-weight:800;color:var(--text,#111110);letter-spacing:-0.5px;text-align:center;margin-bottom:8px;}
  .rp-sub{font-size:13.5px;color:var(--text-3,#87857d);text-align:center;line-height:1.65;margin-bottom:28px;}

  .auth-label{display:block;font-size:11px;font-weight:700;color:var(--text-3,#87857d);text-transform:uppercase;letter-spacing:0.7px;margin-bottom:7px;}
  .auth-field{margin-bottom:16px;}
  .auth-iw{position:relative;}
  .auth-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-4,#b5b2aa);display:flex;pointer-events:none;}
  .auth-input{width:100%;padding:10px 40px 10px 40px;background:var(--bg,#f9f8f6);border:1.5px solid var(--border,#e8e5df);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text,#111110);outline:none;transition:all 0.15s;}
  .auth-input::placeholder{color:var(--text-4,#b5b2aa);}
  .auth-input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.1);background:var(--surface,#fff);}
  .pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-3,#87857d);cursor:pointer;display:flex;padding:0;}

  .auth-submit{width:100%;padding:12px;background:#111110;color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;}
  .auth-submit:hover:not(:disabled){background:#f97316;box-shadow:0 5px 18px rgba(249,115,22,0.28);}
  .auth-submit:disabled{opacity:0.5;cursor:not-allowed;}

  .fp-back{display:flex;align-items:center;gap:6px;color:var(--text-3,#87857d);text-decoration:none;font-size:13.5px;font-weight:600;margin-top:22px;justify-content:center;transition:color 0.15s;}
  .fp-back:hover{color:#f97316;}

  @media(max-width:480px){.auth-card{padding:28px 20px;border-radius:16px;}}
`;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  // Hindi: Password reset submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is expired or invalid');
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
          <div className="rp-icon" style={{ background: done ? 'rgba(21,128,61,0.09)' : 'rgba(249,115,22,0.09)' }}>
            {done ? <CheckCircle2 size={22} color="#15803d" /> : <KeyRound size={22} color="#f97316" />}
          </div>
          <h2 className="rp-title">{done ? 'Password Updated!' : 'Set New Password'}</h2>
          <p className="rp-sub">{done ? 'Your password has been updated. Redirecting you to sign in...' : 'Create a new strong password for your account.'}</p>

          {done ? (
            <Link to="/login" className="auth-submit" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              Go to Sign in
            </Link>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <div className="auth-iw">
                  <span className="auth-ico"><Lock size={15} /></span>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" required className="auth-input" />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-iw">
                  <span className="auth-ico"><Lock size={15} /></span>
                  <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter new password" required className="auth-input" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="auth-submit">
                {loading
                  ? <><span style={{width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} /> Updating...</>
                  : 'Reset Password'}
              </button>
            </form>
          )}

          {!done && <Link to="/login" className="fp-back"><ArrowLeft size={14} /> Back to sign in</Link>}
        </div>
      </div>
    </div>
  );
}