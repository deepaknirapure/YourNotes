import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, Loader2, Sparkles, CheckCircle2, Globe, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes floatDot {
    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
    50%       { transform: translateY(-12px) scale(1.1); opacity: 1; }
  }
  @keyframes staggerIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  body {
    background: #0e0c0c;
    color: #f0ebe4;
    font-family: 'Geist', sans-serif;
    margin: 0;
  }

  .rr-root {
    display: flex;
    min-height: 100dvh;
    background: #0e0c0c;
    position: relative;
    overflow: hidden;
  }

  /* ── Ambient bg ── */
  .rr-ambient {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }
  .rr-blob1 {
    position: absolute; width: 550px; height: 550px;
    background: radial-gradient(circle, rgba(255,87,52,0.07) 0%, transparent 65%);
    top: -180px; left: -80px; border-radius: 50%;
  }
  .rr-blob2 {
    position: absolute; width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(190,148,245,0.04) 0%, transparent 65%);
    bottom: -80px; right: 25%; border-radius: 50%;
  }
  .rr-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%);
  }

  /* ── Left ── */
  .rr-left {
    flex: 1.15;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 52px 60px;
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative; z-index: 1;
    overflow: hidden;
  }

  /* Decorative number */
  .rr-deco-num {
    position: absolute;
    bottom: 80px; right: -20px;
    font-family: 'Instrument Serif', serif;
    font-size: 220px; line-height: 1;
    color: rgba(255,255,255,0.015);
    pointer-events: none; user-select: none;
    letter-spacing: -10px;
  }

  /* Logo */
  .rr-logo {
    display: inline-flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .rr-logo-mark {
    width: 34px; height: 34px; background: #ff5734;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 1px rgba(255,87,52,0.4), 0 4px 16px rgba(255,87,52,0.3);
    flex-shrink: 0;
  }
  .rr-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 22px; letter-spacing: -0.3px; line-height: 1;
    color: #f0ebe4;
  }
  .rr-logo-text span { color: #ff5734; }

  /* Hero */
  .rr-hero { max-width: 460px; position: relative; z-index: 1; }

  .rr-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px; padding: 5px 14px 5px 10px;
    font-size: 11px; font-weight: 700; color: #5a5050;
    letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 32px;
  }
  .rr-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #ff5734;
    animation: floatDot 2.8s ease-in-out infinite;
  }

  .rr-headline {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(38px, 4vw, 56px);
    line-height: 1.08; letter-spacing: -1px;
    color: #f0ebe4; margin-bottom: 20px;
  }
  .rr-headline em {
    font-style: italic; color: #ff5734;
    background: linear-gradient(90deg, #ff5734, #ff8c52, #ff5734);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  .rr-sub {
    font-size: 15px; color: #7a706a; line-height: 1.7;
    font-weight: 500; max-width: 360px; margin-bottom: 40px;
  }

  /* Feature list */
  .rr-feat-list { display: flex; flex-direction: column; gap: 20px; }
  .rr-feat {
    display: flex; align-items: flex-start; gap: 14px;
    animation: staggerIn 0.4s ease-out both;
  }
  .rr-feat:nth-child(1) { animation-delay: 0.1s; }
  .rr-feat:nth-child(2) { animation-delay: 0.2s; }
  .rr-feat:nth-child(3) { animation-delay: 0.3s; }

  .rr-feat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rr-feat-title { font-size: 14px; font-weight: 700; color: #d4cdc6; margin-bottom: 2px; }
  .rr-feat-desc  { font-size: 12px; color: #4a4040; line-height: 1.55; font-weight: 500; }

  /* Footer */
  .rr-footer {
    display: flex; align-items: center; gap: 14px;
    padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.06);
    position: relative; z-index: 1;
  }
  .rr-footer-college { font-size: 13px; color: #4a4040; font-weight: 600; }
  .rr-footer-yr {
    font-size: 11px; color: #ff5734; font-weight: 700;
    background: rgba(255,87,52,0.08);
    border: 1px solid rgba(255,87,52,0.2);
    border-radius: 4px; padding: 2px 8px;
  }

  /* ── Right ── */
  .rr-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 52px 7%;
    position: relative; z-index: 1;
  }

  .rr-form-wrap {
    width: 100%; max-width: 400px;
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: 0.1s;
  }

  /* Step counter */
  .rr-step-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 28px;
  }
  .rr-step-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,87,52,0.08);
    border: 1px solid rgba(255,87,52,0.2);
    border-radius: 100px; padding: 4px 12px;
    font-size: 11px; font-weight: 800; color: #ff7a5c;
    text-transform: uppercase; letter-spacing: 0.8px;
  }

  .rr-form-title {
    font-family: 'Instrument Serif', serif;
    font-size: 38px; font-weight: 400;
    color: #f0ebe4; letter-spacing: -0.5px;
    line-height: 1.1; margin-bottom: 10px;
  }
  .rr-form-title strong { font-weight: 400; color: #ff5734; }
  .rr-form-sub { font-size: 14px; color: #5a5050; font-weight: 500; margin-bottom: 32px; }

  .rr-field { margin-bottom: 16px; }
  .rr-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #4a4040; text-transform: uppercase;
    letter-spacing: 1.1px; margin-bottom: 8px;
  }
  .rr-input-wrap { position: relative; }
  .rr-input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%); color: #3a3030;
    pointer-events: none; transition: color 0.2s;
  }
  .rr-input {
    width: 100%; padding: 13px 14px 13px 44px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 11px; font-size: 14px; font-weight: 500;
    color: #f0ebe4; font-family: 'Geist', sans-serif;
    outline: none; transition: all 0.2s;
  }
  .rr-input::placeholder { color: #3a3030; }
  .rr-input:focus {
    border-color: #ff5734;
    background: rgba(255,87,52,0.04);
    box-shadow: 0 0 0 3px rgba(255,87,52,0.1);
  }
  .rr-input:focus ~ .rr-input-icon,
  .rr-input-wrap:focus-within .rr-input-icon { color: #ff7a5c; }

  /* Password hint */
  .rr-hint { font-size: 11px; color: #3a3030; margin-top: 6px; font-weight: 500; }

  .rr-btn {
    width: 100%; padding: 14px;
    background: #ff5734; color: #fff;
    border: none; border-radius: 11px;
    font-family: 'Geist', sans-serif;
    font-size: 14px; font-weight: 800;
    cursor: pointer; transition: all 0.22s;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    letter-spacing: 0.2px; margin-top: 8px;
    box-shadow: 0 4px 20px rgba(255,87,52,0.25);
  }
  .rr-btn:hover:not(:disabled) {
    background: #e84a25; transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(255,87,52,0.4);
  }
  .rr-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .rr-terms {
    text-align: center; margin-top: 14px;
    font-size: 11px; color: #3a3030; font-weight: 500; line-height: 1.5;
  }

  .rr-sep {
    display: flex; align-items: center; gap: 12px; margin: 22px 0;
  }
  .rr-sep::before, .rr-sep::after { content:''; flex:1; height:1px; background: rgba(255,255,255,0.06); }
  .rr-sep span { font-size: 11px; color: #3a3030; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }

  .rr-login-prompt {
    text-align: center; font-size: 13px; color: #4a4040; font-weight: 600;
  }
  .rr-login-link { color: #ff7a5c; font-weight: 800; text-decoration: none; margin-left: 4px; }
  .rr-login-link:hover { text-decoration: underline; }

  @media (max-width: 1024px) {
    .rr-left { display: none; }
    .rr-right { padding: 40px 24px; }
  }
  @media (max-width: 480px) {
    .rr-right { padding: 32px 20px; }
    .rr-form-title { font-size: 30px; }
  }
`;

const FEATURES = [
  {
    icon: CheckCircle2, color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    label: 'Smart Organization',
    desc: 'Folders, tags & subject filters keep your notes effortlessly sorted.',
  },
  {
    icon: Sparkles, color: '#ff5734',
    bg: 'rgba(255,87,52,0.1)',
    label: 'AI Summaries & Flashcards',
    desc: 'Auto-generate study materials from your notes in one click.',
  },
  {
    icon: Globe, color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    label: 'Community Learning',
    desc: 'Share notes and access resources from top students.',
  },
];

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="rr-root">
      <style>{STYLES}</style>

      {/* Ambient */}
      <div className="rr-ambient">
        <div className="rr-blob1" />
        <div className="rr-blob2" />
        <div className="rr-grid" />
      </div>

      {/* ── LEFT ── */}
      <div className="rr-left">
        <div className="rr-deco-num">YN</div>

        <a href="/" className="rr-logo">
          <div className="rr-logo-mark">
            <BookOpen size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="rr-logo-text">Your<span>Notes</span></span>
        </a>

        <div className="rr-hero">
          <div className="rr-badge">
            <div className="rr-badge-dot" />
            Free Forever
          </div>
          <h1 className="rr-headline">
            Start your<br />
            <em>learning journey.</em>
          </h1>
          <p className="rr-sub">
            Join thousands of students organizing notes, memorizing faster, and acing exams.
          </p>

          <div className="rr-feat-list">
            {FEATURES.map((f, i) => (
              <div key={i} className="rr-feat">
                <div className="rr-feat-icon" style={{ background: f.bg, color: f.color }}>
                  <f.icon size={17} />
                </div>
                <div>
                  <div className="rr-feat-title">{f.label}</div>
                  <div className="rr-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rr-footer">
          <div className="rr-footer-college">S.V. Polytechnic College, Bhopal</div>
          <span className="rr-footer-yr">2026</span>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="rr-right">
        <div className="rr-form-wrap">
          <div className="rr-step-pill" style={{ marginBottom: 24 }}>
            ✦ Create your account
          </div>

          <h2 className="rr-form-title">
            Get started<br /><strong>today.</strong>
          </h2>
          <p className="rr-form-sub">Set up your free student workspace in seconds.</p>

          <form onSubmit={handleSubmit}>
            <div className="rr-field">
              <label className="rr-label">Full Name</label>
              <div className="rr-input-wrap">
                <User size={16} className="rr-input-icon" />
                <input
                  type="text" placeholder="Your full name"
                  value={form.name} onChange={set('name')}
                  className="rr-input" required
                />
              </div>
            </div>

            <div className="rr-field">
              <label className="rr-label">Email Address</label>
              <div className="rr-input-wrap">
                <Mail size={16} className="rr-input-icon" />
                <input
                  type="email" placeholder="name@example.com"
                  value={form.email} onChange={set('email')}
                  className="rr-input" required
                />
              </div>
            </div>

            <div className="rr-field">
              <label className="rr-label">Password</label>
              <div className="rr-input-wrap">
                <Lock size={16} className="rr-input-icon" />
                <input
                  type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')}
                  className="rr-input" required minLength={6}
                />
              </div>
              <div className="rr-hint">Must be at least 6 characters long.</div>
            </div>

            <button type="submit" disabled={loading} className="rr-btn">
              {loading
                ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
                : <>Create account <ArrowRight size={17} strokeWidth={2.5} /></>
              }
            </button>

            <p className="rr-terms">
              By creating an account, you agree to our Terms of Service & Privacy Policy.
            </p>
          </form>

          <div className="rr-sep"><span>already a member?</span></div>

          <p className="rr-login-prompt">
            Have an account?
            <Link to="/login" className="rr-login-link">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
