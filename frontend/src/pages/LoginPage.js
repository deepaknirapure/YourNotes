import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, BookOpen, Zap } from 'lucide-react';
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
  @keyframes borderPulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }

  body {
    background: #0e0c0c;
    color: #f0ebe4;
    font-family: 'Geist', sans-serif;
    margin: 0;
  }

  .lr-root {
    display: flex;
    min-height: 100dvh;
    background: #0e0c0c;
    position: relative;
    overflow: hidden;
  }

  /* ── Ambient bg ── */
  .lr-ambient {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }
  .lr-ambient-blob1 {
    position: absolute; width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(255,87,52,0.07) 0%, transparent 65%);
    top: -200px; left: -100px; border-radius: 50%;
  }
  .lr-ambient-blob2 {
    position: absolute; width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(255,140,80,0.05) 0%, transparent 65%);
    bottom: -100px; right: 30%; border-radius: 50%;
  }
  .lr-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%);
  }

  /* ── Left ── */
  .lr-left {
    flex: 1.15;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 60px;
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative;
    z-index: 1;
  }

  /* Logo */
  .lr-logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .lr-logo-mark {
    width: 34px; height: 34px;
    background: #ff5734;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 1px rgba(255,87,52,0.4), 0 4px 16px rgba(255,87,52,0.3);
    flex-shrink: 0;
  }
  .lr-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    letter-spacing: -0.3px;
    line-height: 1;
    color: #f0ebe4;
  }
  .lr-logo-text span { color: #ff5734; }

  /* Hero */
  .lr-hero { max-width: 460px; }

  .lr-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,87,52,0.08);
    border: 1px solid rgba(255,87,52,0.2);
    border-radius: 100px;
    padding: 5px 14px 5px 10px;
    font-size: 11px; font-weight: 700;
    color: #ff7a5c;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 32px;
  }
  .lr-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #ff5734;
    animation: floatDot 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }

  .lr-headline {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(40px, 4.2vw, 58px);
    line-height: 1.08;
    letter-spacing: -1px;
    color: #f0ebe4;
    margin-bottom: 20px;
  }
  .lr-headline em {
    font-style: italic;
    color: #ff5734;
    background: linear-gradient(90deg, #ff5734, #ff8c52, #ff5734);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  .lr-sub {
    font-size: 16px;
    color: #7a706a;
    line-height: 1.7;
    font-weight: 500;
    max-width: 360px;
  }

  /* Feature cards */
  .lr-feats { display: flex; flex-direction: column; gap: 14px; margin-top: 44px; }

  .lr-feat {
    display: flex; align-items: flex-start; gap: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 16px 18px;
    transition: border-color 0.2s;
  }
  .lr-feat:hover { border-color: rgba(255,87,52,0.25); }

  .lr-feat-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(255,87,52,0.1);
    display: flex; align-items: center; justify-content: center;
    color: #ff7a5c; flex-shrink: 0;
  }
  .lr-feat-title { font-size: 14px; font-weight: 700; color: #d4cdc6; margin-bottom: 3px; }
  .lr-feat-desc  { font-size: 12px; color: #5a5050; line-height: 1.55; font-weight: 500; }

  /* Footer */
  .lr-footer {
    display: flex; align-items: center; gap: 16px;
    padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .lr-footer-college { font-size: 13px; color: #4a4040; font-weight: 600; }
  .lr-footer-yr {
    font-size: 11px; color: #ff5734; font-weight: 700;
    background: rgba(255,87,52,0.08);
    border: 1px solid rgba(255,87,52,0.2);
    border-radius: 4px; padding: 2px 8px;
  }

  /* ── Right ── */
  .lr-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 52px 7%;
    position: relative; z-index: 1;
  }

  .lr-form-wrap {
    width: 100%; max-width: 400px;
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: 0.1s;
  }

  .lr-form-header { margin-bottom: 36px; }
  .lr-form-title {
    font-family: 'Instrument Serif', serif;
    font-size: 38px; font-weight: 400;
    color: #f0ebe4; letter-spacing: -0.5px;
    line-height: 1.1; margin-bottom: 10px;
  }
  .lr-form-title strong { font-weight: 400; color: #ff5734; }
  .lr-form-sub { font-size: 14px; color: #5a5050; font-weight: 500; line-height: 1.5; }

  .lr-field { margin-bottom: 18px; }
  .lr-label {
    display: block;
    font-size: 11px; font-weight: 700;
    color: #4a4040;
    text-transform: uppercase; letter-spacing: 1.1px;
    margin-bottom: 8px;
  }
  .lr-input-wrap { position: relative; }
  .lr-input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%); color: #3a3030;
    pointer-events: none; transition: color 0.2s;
  }
  .lr-input {
    width: 100%;
    padding: 13px 14px 13px 44px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 11px;
    font-size: 14px; font-weight: 500;
    color: #f0ebe4;
    font-family: 'Geist', sans-serif;
    outline: none;
    transition: all 0.2s;
  }
  .lr-input::placeholder { color: #3a3030; }
  .lr-input:focus {
    border-color: #ff5734;
    background: rgba(255,87,52,0.04);
    box-shadow: 0 0 0 3px rgba(255,87,52,0.1);
  }
  .lr-input:focus ~ .lr-input-icon,
  .lr-input-wrap:focus-within .lr-input-icon { color: #ff7a5c; }

  .lr-forgot {
    display: block; text-align: right;
    font-size: 12px; font-weight: 700;
    color: #4a4040; text-decoration: none;
    margin-top: -6px; margin-bottom: 26px;
    transition: color 0.2s;
  }
  .lr-forgot:hover { color: #ff7a5c; }

  .lr-btn {
    width: 100%; padding: 14px;
    background: #ff5734; color: #fff;
    border: none; border-radius: 11px;
    font-family: 'Geist', sans-serif;
    font-size: 14px; font-weight: 800;
    cursor: pointer; transition: all 0.22s;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 20px rgba(255,87,52,0.25);
  }
  .lr-btn:hover:not(:disabled) {
    background: #e84a25;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(255,87,52,0.4);
  }
  .lr-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .lr-sep {
    display: flex; align-items: center; gap: 12px;
    margin: 26px 0;
  }
  .lr-sep::before, .lr-sep::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(255,255,255,0.06);
  }
  .lr-sep span { font-size: 11px; color: #3a3030; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }

  .lr-register-prompt {
    text-align: center;
    font-size: 13px; color: #4a4040; font-weight: 600;
  }
  .lr-register-link {
    color: #ff7a5c; font-weight: 800;
    text-decoration: none; margin-left: 4px;
  }
  .lr-register-link:hover { text-decoration: underline; }

  @media (max-width: 1024px) {
    .lr-left { display: none; }
    .lr-right { padding: 40px 24px; background: #0e0c0c; }
  }
  @media (max-width: 480px) {
    .lr-right { padding: 32px 20px; }
    .lr-form-title { font-size: 30px; }
  }
`;

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields.');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back! ✨');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="lr-root">
      <style>{STYLES}</style>

      {/* Ambient background */}
      <div className="lr-ambient">
        <div className="lr-ambient-blob1" />
        <div className="lr-ambient-blob2" />
        <div className="lr-grid" />
      </div>

      {/* ── LEFT ── */}
      <div className="lr-left">
        <a href="/" className="lr-logo">
          <div className="lr-logo-mark">
            <BookOpen size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="lr-logo-text">Your<span>Notes</span></span>
        </a>

        <div className="lr-hero">
          <div className="lr-badge">
            <div className="lr-badge-dot" />
            Smart Note-Taking
          </div>
          <h1 className="lr-headline">
            Think clearer.<br />
            <em>Study smarter.</em>
          </h1>
          <p className="lr-sub">
            Your notes, flashcards, and AI summaries — all in one minimal workspace built for students.
          </p>

          <div className="lr-feats">
            <div className="lr-feat">
              <div className="lr-feat-icon"><Sparkles size={18} /></div>
              <div>
                <div className="lr-feat-title">AI-Powered Summaries</div>
                <div className="lr-feat-desc">Auto-generate study materials from any note in seconds.</div>
              </div>
            </div>
            <div className="lr-feat">
              <div className="lr-feat-icon"><ShieldCheck size={18} /></div>
              <div>
                <div className="lr-feat-title">Private & Secure</div>
                <div className="lr-feat-desc">Your intellectual work stays yours, always encrypted.</div>
              </div>
            </div>
            <div className="lr-feat">
              <div className="lr-feat-icon"><Zap size={18} /></div>
              <div>
                <div className="lr-feat-title">Instant Flashcards</div>
                <div className="lr-feat-desc">Turn any topic into a quiz-ready flashcard deck.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lr-footer">
          <div className="lr-footer-college">S.V. Polytechnic College, Bhopal</div>
          <span className="lr-footer-yr">2026</span>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="lr-right">
        <div className="lr-form-wrap">
          <div className="lr-form-header">
            <h2 className="lr-form-title">
              Welcome<br /><strong>back.</strong>
            </h2>
            <p className="lr-form-sub">Sign in to access your notes &amp; workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lr-field">
              <label className="lr-label">Email Address</label>
              <div className="lr-input-wrap">
                <Mail size={16} className="lr-input-icon" />
                <input
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={set('email')}
                  className="lr-input" required
                />
              </div>
            </div>

            <div className="lr-field">
              <label className="lr-label">Password</label>
              <div className="lr-input-wrap">
                <Lock size={16} className="lr-input-icon" />
                <input
                  type="password" placeholder="••••••••"
                  value={form.password} onChange={set('password')}
                  className="lr-input" required
                />
              </div>
            </div>

            <Link to="/forgot-password" className="lr-forgot">Forgot password?</Link>

            <button type="submit" disabled={loading} className="lr-btn">
              {loading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <>Sign In <ArrowRight size={17} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          <div className="lr-sep"><span>or</span></div>

          <p className="lr-register-prompt">
            New here?
            <Link to="/register" className="lr-register-link">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
