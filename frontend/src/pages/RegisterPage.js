import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { AUTH_SHARED_STYLES } from '../styles/auth.css.js';

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  return score; // 0–3
}

export default function RegisterPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const strength = getStrength(form.password);
  const strengthClass = strength === 1 ? 'filled-weak' : strength === 2 ? 'filled-fair' : strength === 3 ? 'filled-strong' : '';

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
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-root">
      <style>{AUTH_SHARED_STYLES}</style>

      {/* ── Dark Left Panel ── */}
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
            Join thousands of students
          </div>
          <h1 className="al-headline">
            Your notes,<br />
            <em>beautifully organized.</em>
          </h1>
          <p className="al-desc">
            Create your free account and start taking smarter notes today — no subscription needed.
          </p>

          <div className="al-feats">
            <div className="al-feat">
              <div className="al-feat-icon" style={{ borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(249,115,22,0.06)' }}>
                <CheckCircle2 style={{ color: '#f97316', width: 17, height: 17 }} />
              </div>
              <div>
                <div className="al-feat-name">Free forever</div>
                <div className="al-feat-text">No subscription or payment required, ever.</div>
              </div>
            </div>
            <div className="al-feat">
              <div className="al-feat-icon" style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.06)' }}>
                <Globe style={{ color: '#a78bfa', width: 17, height: 17 }} />
              </div>
              <div>
                <div className="al-feat-name">Community sharing</div>
                <div className="al-feat-text">Publish notes and discover others' work.</div>
              </div>
            </div>
            <div className="al-feat">
              <div className="al-feat-icon" style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)' }}>
                <Sparkles style={{ color: '#60a5fa', width: 17, height: 17 }} />
              </div>
              <div>
                <div className="al-feat-name">AI study tools</div>
                <div className="al-feat-text">Summaries, flashcards, and Q&A built in.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="al-footer">
          <span className="al-footer-copy">S.V. Polytechnic College, Bhopal · 2026</span>
          <span className="al-footer-badge">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#16a34a"/></svg>
            Free to join
          </span>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right">
        <div className="ar-wrap">
          <div className="ar-step">Get started</div>
          <h2 className="ar-title">Create your account</h2>
          <p className="ar-sub">Start your free workspace today — takes less than a minute.</p>

          <form onSubmit={handleSubmit}>
            <div className="ar-field">
              <label className="ar-label">Full name</label>
              <div className="ar-iw">
                <span className="ar-ico"><User size={15} /></span>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={update('name')}
                  className="ar-input"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={update('password')}
                  className="ar-input has-right-icon"
                  required
                  autoComplete="new-password"
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
              {form.password && (
                <div className="pw-strength">
                  {[1,2,3].map(i => (
                    <div key={i} className={`pw-seg ${i <= strength ? strengthClass : ''}`} />
                  ))}
                </div>
              )}
            </div>

            <p className="ar-terms">
              By creating an account you agree to our{' '}
              <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} className="ar-btn">
              {loading
                ? <><span className="ar-spinner" /> Creating account…</>
                : <>Create account <ArrowRight size={15} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          <p className="ar-nav">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}