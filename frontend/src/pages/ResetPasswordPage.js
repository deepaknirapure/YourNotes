import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { AUTH_SHARED_STYLES } from '../styles/auth.css.js';

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) s++;
  return s;
}

export default function ResetPasswordPage() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const strength = getStrength(password);
  const strengthClass = strength === 1 ? 'filled-weak' : strength === 2 ? 'filled-fair' : strength === 3 ? 'filled-strong' : '';

  const match = confirm && password === confirm;
  const mismatch = confirm && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password updated! Redirecting…');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => showPw
    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <div className="auth-page">
      <style>{AUTH_SHARED_STYLES}</style>

      <nav className="auth-nav">
        <a href="/" className="auth-nav-logo">
          <div className="auth-nav-mark">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="auth-nav-name">Your<span>Notes</span></span>
        </a>
        <Link to="/login" className="auth-nav-back">
          <ArrowLeft size={13} />
          Back to sign in
        </Link>
      </nav>

      <div className="auth-center">
        <div className="auth-card">

          {done ? (
            <>
              <div className="ac-icon-wrap" style={{ background: 'rgba(22,163,74,0.08)' }}>
                <CheckCircle2 size={22} color="#16a34a" />
              </div>
              <h2 className="ac-title">Password updated!</h2>
              <p className="ac-sub">
                Your password has been reset successfully. You'll be redirected to sign in shortly.
              </p>
              <Link to="/login" className="ar-btn" style={{ textDecoration: 'none' }}>
                Go to sign in
              </Link>
            </>
          ) : (
            <>
              <div className="ac-icon-wrap" style={{ background: 'rgba(249,115,22,0.08)' }}>
                <KeyRound size={22} color="#f97316" />
              </div>
              <h2 className="ac-title">Set new password</h2>
              <p className="ac-sub">
                Create a strong new password for your account.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="ar-field">
                  <label className="ar-label">New password</label>
                  <div className="ar-iw">
                    <span className="ar-ico"><Lock size={15} /></span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="ar-input has-right-icon"
                      autoComplete="new-password"
                    />
                    <button type="button" className="ar-ico-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                      <EyeIcon />
                    </button>
                  </div>
                  {password && (
                    <div className="pw-strength">
                      {[1,2,3].map(i => (
                        <div key={i} className={`pw-seg ${i <= strength ? strengthClass : ''}`} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="ar-field">
                  <label className="ar-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Confirm password</span>
                    {match && <span style={{ color: 'var(--green)', fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: 'none' }}>✓ Passwords match</span>}
                    {mismatch && <span style={{ color: 'var(--red)', fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: 'none' }}>✗ Does not match</span>}
                  </label>
                  <div className="ar-iw">
                    <span className="ar-ico"><Lock size={15} /></span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="ar-input"
                      style={mismatch ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px rgba(220,38,38,0.10)' } : match ? { borderColor: 'var(--green)', boxShadow: '0 0 0 3px rgba(22,163,74,0.10)' } : {}}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="ar-btn" style={{ marginTop: 4 }}>
                  {loading
                    ? <><span className="ar-spinner" /> Updating…</>
                    : 'Reset password'
                  }
                </button>
              </form>

              <Link to="/login" className="ac-back">
                <ArrowLeft size={13} />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
