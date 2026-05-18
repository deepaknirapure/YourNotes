import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { AUTH_SHARED_STYLES } from '../styles/auth.css.js';

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

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
      <style>{AUTH_SHARED_STYLES}</style>

      <div className="auth-left">
        <div className="al-bg" />
        <div className="al-glow-bottom" />
        <div className="al-ring" />

        <a href="/" className="al-logo">
          <div className="al-logo-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="al-logo-name">YourNotes</span>
        </a>

        <div className="al-body">
          <div className="al-pill">
            <span className="al-pill-dot" />
            Smart note-taking
          </div>
          <h1 className="al-headline">
            Think clearer.<br />
            <em>Study smarter.</em>
          </h1>
          <p className="al-desc">
            Your notes, flashcards, and AI summaries — all in one minimal workspace designed for focused study.
          </p>

          <div className="al-feats">
            <div className="al-feat">
              <div className="al-feat-icon" style={{ borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(249,115,22,0.06)' }}>
                <Sparkles style={{ color: '#f97316', width: 17, height: 17 }} />
              </div>
              <div>
                <div className="al-feat-name">AI-Powered Summaries</div>
                <div className="al-feat-text">Auto-generate study materials from any note.</div>
              </div>
            </div>
            <div className="al-feat">
              <div className="al-feat-icon" style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.06)' }}>
                <ShieldCheck style={{ color: '#a78bfa', width: 17, height: 17 }} />
              </div>
              <div>
                <div className="al-feat-name">Private & Secure</div>
                <div className="al-feat-text">Your intellectual work stays yours, always.</div>
              </div>
            </div>
            <div className="al-feat">
              <div className="al-feat-icon" style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)' }}>
                <Zap style={{ color: '#60a5fa', width: 17, height: 17 }} />
              </div>
              <div>
                <div className="al-feat-name">Fast & Organized</div>
                <div className="al-feat-text">Folders, tags, and instant search built in.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="al-footer">
          <span className="al-footer-copy">S.V. Polytechnic College, Bhopal · 2026</span>
          <span className="al-footer-badge">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#16a34a"/></svg>
            All systems normal
          </span>
        </div>
      </div>

      <div className="auth-right">
        <div className="ar-wrap">
          <div className="ar-step">Sign in</div>
          <h2 className="ar-title">Welcome back</h2>
          <p className="ar-sub">Enter your credentials to access your workspace.</p>

          <form onSubmit={handleSubmit}>
            <div className="ar-field">
              <label className="ar-label">Email address</label>
              <div className="ar-iw">
                <span className="ar-ico"><Mail size={15} /></span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={update('email')}
                  className="ar-input"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="ar-field">
              <label className="ar-label">Password</label>
              <div className="ar-iw">
                <span className="ar-ico"><Lock size={15} /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={update('password')}
                  className="ar-input has-right-icon"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="ar-ico-right"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <Link to="/forgot-password" className="ar-forgot">Forgot password?</Link>

            <button type="submit" disabled={loading} className="ar-btn">
              {loading
                ? <><span className="ar-spinner" /> Signing in…</>
                : <>Sign in <ArrowRight size={15} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          <p className="ar-nav">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
