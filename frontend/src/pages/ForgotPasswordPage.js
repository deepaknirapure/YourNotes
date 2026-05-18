import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck, AlertCircle } from 'lucide-react';
import API from '../api/axios';
import { AUTH_SHARED_STYLES } from '../styles/auth.css.js';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email address.');
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
    <div className="auth-page">
      <style>{AUTH_SHARED_STYLES}</style>

      {/* Top nav */}
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

      {/* Card */}
      <div className="auth-center">
        <div className="auth-card">

          {sent ? (
            <>
              <div className="ac-icon-wrap" style={{ background: 'rgba(22,163,74,0.08)' }}>
                <MailCheck size={22} color="#16a34a" />
              </div>
              <h2 className="ac-title">Check your inbox</h2>
              <p className="ac-sub">
                We sent a reset link to <strong>{email}</strong>.
                Check your inbox and follow the instructions to reset your password.
              </p>
              <div className="ac-alert success">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginTop:1}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Reset email sent successfully
              </div>
              <Link to="/login" className="ar-btn" style={{ textDecoration: 'none', marginTop: 0 }}>
                <ArrowLeft size={15} />
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <div className="ac-icon-wrap" style={{ background: 'rgba(249,115,22,0.08)' }}>
                <Mail size={22} color="#f97316" />
              </div>
              <h2 className="ac-title">Reset your password</h2>
              <p className="ac-sub">
                Enter your account email and we'll send you a secure link to reset your password.
              </p>

              {error && (
                <div className="ac-alert error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ar-field">
                  <label className="ar-label">Email address</label>
                  <div className="ar-iw">
                    <span className="ar-ico"><Mail size={15} /></span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="ar-input"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="ar-btn">
                  {loading
                    ? <><span className="ar-spinner" /> Sending…</>
                    : 'Send reset link'
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
