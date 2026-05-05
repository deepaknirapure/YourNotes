import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #f5f5f3; color: #1a1a1a; font-family: 'Plus Jakarta Sans', sans-serif; }

  .login-root { display: flex; min-height: 100vh; background: #f5f5f3; }

  /* LEFT */
  .login-left {
    flex: 1.1; background: #1a1a1a; display: flex; flex-direction: column;
    justify-content: space-between; padding: 56px; position: relative; overflow: hidden;
  }
  .left-deco {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%);
    top: -80px; right: -80px; pointer-events: none;
  }
  .left-deco2 {
    position: absolute; width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
    bottom: 120px; left: -60px; pointer-events: none;
  }

  .brand-logo {
    font-size: 22px; font-weight: 900; letter-spacing: -0.5px;
    position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px;
  }
  .brand-logo .logo-dot { 
    width: 28px; height: 28px; background: #f97316; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-txt { color: #ffffff; }
  .brand-accent { color: #f97316; }

  .left-content { position: relative; z-index: 1; }
  .left-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3);
    color: #f97316; border-radius: 100px; padding: 5px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    margin-bottom: 28px;
  }
  .left-title {
    font-size: clamp(36px, 4vw, 52px); font-weight: 900; color: #ffffff;
    line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px;
  }
  .left-title em { color: #f97316; font-style: normal; }
  .left-desc { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.65; max-width: 360px; }

  .feat-stack { display: flex; flex-direction: column; gap: 20px; margin-top: 48px; }
  .feat-item { display: flex; align-items: center; gap: 16px; }
  .feat-ico {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .feat-text h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .feat-text p { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

  .left-footer {
    position: relative; z-index: 1;
    border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;
    display: flex; align-items: center; gap: 16px;
  }
  .footer-dot { width: 8px; height: 8px; border-radius: 50%; background: #f97316; }
  .footer-label { font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 600; }

  /* RIGHT */
  .login-right {
    flex: 1; background: #f5f5f3; display: flex; align-items: center;
    justify-content: center; padding: 56px 6%;
  }

  .form-container {
    width: 100%; max-width: 400px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .form-header { margin-bottom: 36px; }
  .form-title { font-size: 30px; font-weight: 900; color: #1a1a1a; letter-spacing: -1px; margin-bottom: 8px; }
  .form-subtitle { font-size: 15px; color: #888580; }

  .input-group { margin-bottom: 18px; }
  .input-label {
    display: block; font-size: 12px; font-weight: 700; color: #888580;
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;
  }
  .input-wrap { position: relative; }
  .input-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #b0ada6; pointer-events: none; }
  .form-input {
    width: 100%; padding: 13px 14px 13px 42px;
    background: #ffffff; border: 1.5px solid #e8e6e1;
    border-radius: 10px; font-size: 15px; font-weight: 500;
    color: #1a1a1a; font-family: inherit; outline: none; transition: all 0.18s;
  }
  .form-input::placeholder { color: #c8c5be; }
  .form-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }

  .forgot-link {
    display: block; text-align: right; font-size: 13px; font-weight: 700;
    color: #f97316; text-decoration: none; margin-top: -8px; margin-bottom: 24px;
  }
  .forgot-link:hover { color: #ea6c0a; }

  .btn-submit {
    width: 100%; padding: 14px; background: #1a1a1a; color: #ffffff;
    border: none; border-radius: 10px; font-size: 15px; font-weight: 800;
    font-family: inherit; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 9px;
  }
  .btn-submit:hover:not(:disabled) {
    background: #f97316;
    box-shadow: 0 6px 20px rgba(249,115,22,0.25);
  }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .register-prompt { text-align: center; margin-top: 28px; font-size: 14px; color: #888580; }
  .register-link { color: #f97316; font-weight: 700; text-decoration: none; }
  .register-link:hover { text-decoration: underline; }

  .divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .divider-line { flex: 1; height: 1px; background: #e8e6e1; }
  .divider-txt { font-size: 12px; font-weight: 600; color: #b0ada6; }

  @media(max-width: 960px) {
    .login-left { display: none; }
    .login-right { padding: 40px 24px; background: #ffffff; min-height: 100vh; }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
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

      <div className="login-left">
        <div className="left-deco" />
        <div className="left-deco2" />

        <div className="brand-logo">
          <div className="logo-dot">
            <BookOpen size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="brand-txt">Your</span><span className="brand-accent">Notes</span>
        </div>

        <div className="left-content">
          <div className="left-tag"><Sparkles size={11} /> Smart note-taking</div>
          <h2 className="left-title">Think clearer.<br /><em>Study smarter.</em></h2>
          <p className="left-desc">Your notes, flashcards, and AI summaries — all in one minimal workspace.</p>

          <div className="feat-stack">
            <div className="feat-item">
              <div className="feat-ico"><Sparkles size={18} color="#f97316" /></div>
              <div className="feat-text">
                <h4>AI-Powered Summaries</h4>
                <p>Auto-generate study materials from any note.</p>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-ico"><ShieldCheck size={18} color="#8b5cf6" /></div>
              <div className="feat-text">
                <h4>Private & Secure</h4>
                <p>Your intellectual work stays yours, always.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <div className="footer-dot" />
          <span className="footer-label">S.V. Polytechnic College, Bhopal · 2026</span>
        </div>
      </div>

      <div className="login-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrap">
                <Mail size={16} className="input-ico" />
                <input type="email" placeholder="name@example.com" value={form.email} onChange={updateField('email')} className="form-input" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-ico" />
                <input type="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} className="form-input" required />
              </div>
            </div>

            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</>
                : <>Sign in <ArrowRight size={17} strokeWidth={2.5} /></>}
            </button>
          </form>

          <p className="register-prompt">
            New here? <Link to="/register" className="register-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
