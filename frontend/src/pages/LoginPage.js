import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

  body { background: #151313; color: #f7f7f5; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; }

  .login-root { display: flex; min-height: 100vh; min-height: 100dvh; overflow: hidden; background: #151313; }

  /* ── LEFT PANEL ── */
  .login-left {
    flex: 1.1; background: linear-gradient(135deg, #1e1b1b 0%, #151313 100%);
    border-right: 1px solid #2a2525; display: flex; flex-direction: column;
    justify-content: space-between; padding: 56px; position: relative; overflow: hidden;
  }

  .bg-dots {
    position: absolute; inset: 0; z-index: 0; opacity: 0.08;
    background-image: radial-gradient(#be94f5 1px, transparent 1px);
    background-size: 28px 28px;
  }

  .accent-blob {
    position: absolute; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,87,52,0.15) 0%, transparent 70%);
    top: -80px; right: -80px; z-index: 0;
  }

  .brand-logo {
    font-size: 24px; font-weight: 900; letter-spacing: -0.5px;
    position: relative; z-index: 1; display: flex; align-items: center; gap: 10px;
    color: #f7f7f5;
  }
  .brand-icon { background: #ff5734; padding: 7px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

  .left-content { position: relative; z-index: 1; max-width: 480px; margin-top: 48px; }

  .accent-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255, 87, 52, 0.1); border: 1px solid rgba(255,87,52,0.3);
    border-radius: 100px; padding: 7px 16px; font-size: 11px; font-weight: 800;
    color: #ff5734; text-transform: uppercase; margin-bottom: 28px; letter-spacing: 1px;
  }

  .left-title {
    font-size: clamp(36px, 4vw, 52px); font-weight: 900; color: #f7f7f5; line-height: 1.05;
    letter-spacing: -2px; margin-bottom: 20px;
  }
  .left-title .highlight { color: #ff5734; }

  .features-stack { display: flex; flex-direction: column; gap: 24px; margin-top: 44px; }
  .feat-item { display: flex; gap: 18px; align-items: flex-start; }
  .feat-icon {
    width: 42px; height: 42px; border-radius: 12px; background: #1e1b1b;
    border: 1px solid #2a2525; display: flex; align-items: center;
    justify-content: center; color: #be94f5; flex-shrink: 0;
  }
  .feat-text h4 { font-size: 15px; font-weight: 800; color: #f7f7f5; margin-bottom: 4px; }
  .feat-text p { font-size: 13px; color: #8a7f7f; line-height: 1.55; font-weight: 500; }

  .left-footer {
    position: relative; z-index: 1; border-top: 1px solid #2a2525;
    padding-top: 24px; display: flex; align-items: center; gap: 18px;
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    flex: 1; background: #151313; display: flex; flex-direction: column;
    justify-content: center; padding: 56px 8%; position: relative;
    min-height: 100vh;
  }

  .form-container {
    width: 100%; max-width: 400px; margin: 0 auto;
    animation: fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .form-header { margin-bottom: 36px; }
  .form-title { font-size: 34px; font-weight: 900; color: #f7f7f5; letter-spacing: -1.5px; margin-bottom: 10px; }
  .form-subtitle { font-size: 15px; color: #8a7f7f; font-weight: 500; }

  .input-group { margin-bottom: 20px; }
  .input-label {
    display: block; font-size: 11px; font-weight: 800; color: #8a7f7f;
    text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;
  }

  .input-wrapper { position: relative; }
  .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #4a4040; transition: 0.25s; pointer-events: none; }

  .form-input {
    width: 100%; padding: 15px 15px 15px 46px; background: #1e1b1b;
    border: 1.5px solid #2a2525; border-radius: 12px; font-size: 15px; font-weight: 600;
    color: #f7f7f5; font-family: inherit; transition: 0.25s; outline: none;
  }
  .form-input::placeholder { color: #4a4040; }
  .form-input:focus { border-color: #ff5734; background: #1e1b1b; box-shadow: 0 0 0 3px rgba(255,87,52,0.12); }

  .forgot-link {
    display: block; text-align: right; font-size: 13px; font-weight: 700;
    color: #be94f5; text-decoration: none; margin-top: -8px; margin-bottom: 28px;
    transition: 0.2s;
  }
  .forgot-link:hover { color: #ff5734; }

  .btn-submit {
    width: 100%; padding: 16px; background: #ff5734; color: #fff;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 900;
    cursor: pointer; transition: 0.25s; font-family: inherit;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    letter-spacing: 0.3px;
  }
  .btn-submit:hover:not(:disabled) { background: #e64a2a; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,87,52,0.4); }
  .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  .divider { display: flex; align-items: center; gap: 14px; margin: 28px 0; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #2a2525; }
  .divider span { font-size: 12px; color: #4a4040; font-weight: 700; }

  .register-prompt { text-align: center; font-size: 14px; color: #8a7f7f; font-weight: 600; }
  .register-link { color: #ff5734; font-weight: 800; text-decoration: none; }
  .register-link:hover { text-decoration: underline; }

  @media (max-width: 1024px) {
    .login-left { display: none; }
    .login-right { padding: 40px 28px; }
  }

  @media (max-width: 480px) {
    .login-right { padding: 32px 20px; }
    .form-title { font-size: 28px; }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields.');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back! ✨');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="login-root">
      <style>{STYLES}</style>

      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="bg-dots" />
        <div className="accent-blob" />

        <div className="brand-logo">
          <div className="brand-icon"><BookOpen size={20} color="#fff" /></div>
          Your<span style={{ color: '#ff5734' }}>Notes</span>
        </div>

        <div className="left-content">
          <div className="accent-badge"><Zap size={12} fill="#ff5734" /> Smart Workspace</div>
          <h2 className="left-title">
            Capture ideas,<br />
            <span className="highlight">build knowledge.</span>
          </h2>

          <div className="features-stack">
            <div className="feat-item">
              <div className="feat-icon"><Sparkles size={19} /></div>
              <div className="feat-text">
                <h4>AI-Powered Summaries</h4>
                <p>Transform your notes into flashcards and insights instantly with AI.</p>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><ShieldCheck size={19} /></div>
              <div className="feat-text">
                <h4>Private & Secure</h4>
                <p>Your notes are encrypted and accessible only by you, always.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#4a4040', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>Made at</div>
            <div style={{ fontSize: 13, color: '#f7f7f5', fontWeight: 700 }}>S.V. Polytechnic College, Bhopal</div>
          </div>
          <div style={{ width: 1, height: 28, background: '#2a2525' }} />
          <div style={{ fontSize: 13, color: '#8a7f7f', fontWeight: 600 }}>Est. 2026</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to access your notes & workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <input type="email" placeholder="you@example.com" value={form.email} onChange={updateField('email')} className="form-input" required />
                <Mail size={17} className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input type="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} className="form-input" required />
                <Lock size={17} className="input-icon" />
              </div>
            </div>

            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                : <>Sign In <ArrowRight size={18} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          <div className="divider"><span>New here?</span></div>

          <p className="register-prompt">
            Don't have an account? <Link to="/register" className="register-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
