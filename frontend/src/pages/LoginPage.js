import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #FFF; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; margin: 0; }

  .login-root { display: flex; min-height: 100vh; overflow: hidden; }

  /* ── LEFT PANEL ── */
  .login-left {
    flex: 1; background: #F8FAFC; border-right: 1px solid #E2E8F0;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 60px; position: relative; overflow: hidden;
  }
  
  .bg-dots {
    position: absolute; inset: 0; z-index: 0; opacity: 0.5; pointer-events: none;
    background-image: radial-gradient(#CBD5E1 1px, transparent 1px); background-size: 24px 24px;
  }

  .brand-logo {
    font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;
    position: relative; z-index: 1;
  }

  .left-content { position: relative; z-index: 1; max-width: 480px; }
  
  .saas-badge {
    display: inline-flex; align-items: center; gap: 8px; background: #FFF5F2;
    border: 1px solid #FFE4DB; border-radius: 100px; padding: 6px 14px;
    font-size: 11px; font-weight: 700; color: #E55B2D; letter-spacing: 0.5px;
    margin-bottom: 24px; text-transform: uppercase;
  }

  .left-title {
    font-size: 48px; font-weight: 800; color: #0F172A;
    line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 20px;
  }

  .features-stack { display: flex; flex-direction: column; gap: 24px; margin-top: 40px; }
  .feat-item { display: flex; gap: 16px; align-items: flex-start; }
  .feat-icon { 
    width: 32px; height: 32px; border-radius: 8px; background: #FFF; 
    border: 1px solid #E2E8F0; display: flex; align-items: center; 
    justify-content: center; color: #E55B2D; flex-shrink: 0;
  }
  .feat-text h4 { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
  .feat-text p { font-size: 13px; color: #64748B; line-height: 1.5; font-weight: 500; }

  .left-footer {
    position: relative; z-index: 1; background: #FFF; border: 1px solid #E2E8F0;
    border-radius: 12px; padding: 20px; display: inline-flex; flex-direction: column; gap: 4px;
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    flex: 1; background: #FFF; display: flex; flex-direction: column;
    justify-content: center; padding: 60px 8%; position: relative;
  }

  .form-container {
    width: 100%; max-width: 400px; margin: 0 auto;
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .form-header { margin-bottom: 40px; }
  .form-title { font-size: 32px; font-weight: 800; color: #0F172A; letter-spacing: -1px; margin-bottom: 8px; }
  .form-subtitle { font-size: 15px; color: #64748B; font-weight: 500; }

  .input-group { margin-bottom: 20px; }
  .input-label {
    display: block; font-size: 12px; font-weight: 700; color: #475569;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
  }
  
  .input-wrapper { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 16px; color: #94A3B8; pointer-events: none; }
  
  .form-input {
    width: 100%; padding: 14px 16px 14px 44px; background: #FFF;
    border: 1px solid #E2E8F0; border-radius: 12px; font-size: 15px; font-weight: 500;
    color: #0F172A; font-family: inherit; transition: 0.2s; outline: none;
  }
  .form-input:focus { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229, 91, 45, 0.1); }

  .forgot-link {
    display: block; text-align: right; font-size: 13px; font-weight: 600;
    color: #E55B2D; text-decoration: none; margin-top: -8px; margin-bottom: 24px;
  }

  .btn-submit {
    width: 100%; padding: 14px; background: #0F172A; color: #FFF;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
    font-family: inherit; cursor: pointer; transition: 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-submit:hover:not(:disabled) { background: #E55B2D; transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .register-prompt { text-align: center; margin-top: 32px; font-size: 14px; color: #64748B; font-weight: 500; }
  .register-link { color: #E55B2D; font-weight: 700; text-decoration: none; }

  .mobile-footer { display: none; text-align: center; margin-top: 40px; font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: 1px; }

  @media(max-width: 960px) {
    .login-left { display: none; }
    .login-right { padding: 40px 24px; }
    .mobile-footer { display: block; }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please enter your email and password.');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="login-root">
      <style>{STYLES}</style>

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="bg-dots" />
        <div className="brand-logo">Your<span style={{ color: "#E55B2D" }}>Notes</span>.</div>

        <div className="left-content">
          <div className="saas-badge"><Zap size={12} /> Workspace Ready</div>
          <h2 className="left-title">Focus on what matters most.</h2>
          
          <div className="features-stack">
            <div className="feat-item">
              <div className="feat-icon"><Sparkles size={16} /></div>
              <div className="feat-text">
                <h4>AI-Powered Review</h4>
                <p>Turn complex notes into structured summaries and smart flashcards instantly.</p>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><ShieldCheck size={16} /></div>
              <div className="feat-text">
                <h4>Private & Secure</h4>
                <p>Your data is encrypted and accessible only to you. Always private by design.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Built for Students</div>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>S.V. Polytechnic College, Bhopal · 2026</div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="name@example.com" value={form.email} onChange={updateField('email')} className="form-input" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} className="form-input" required />
              </div>
            </div>

            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="register-prompt">
            Don&apos;t have an account? <Link to="/register" className="register-link">Register for free</Link>
          </p>
          
          <div className="mobile-footer">YOURNOTES · BHOPAL · 2026</div>
        </div>
      </div>
    </div>
  );
}