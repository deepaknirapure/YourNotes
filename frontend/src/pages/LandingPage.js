import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

  :root {
    --bg-primary: #f8f9fa;
    --bg-dark: #0f1115;
    --brand: #f97316;
    --brand-hover: #ea580c;
    --text-main: #1a1c20;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --radius: 12px;
    --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { 
    background: var(--bg-primary); 
    color: var(--text-main); 
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .lp-root { display: flex; min-height: 100vh; }

  /* ── Left Branding Panel ── */
  .lp-left {
    flex: 1.2;
    background: var(--bg-dark);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px;
    position: relative;
    overflow: hidden;
  }

  .lp-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  .lp-left-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%);
    top: -150px;
    right: -150px;
    filter: blur(40px);
  }

  .lp-logo {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: #fff;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lp-logo span { color: var(--brand); }

  .lp-headline {
    font-size: clamp(40px, 5vw, 64px);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -2px;
    margin-bottom: 24px;
    z-index: 10;
  }

  .lp-headline em { color: var(--brand); font-style: normal; }

  .lp-desc {
    font-size: 17px;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 400px;
    margin-bottom: 48px;
    z-index: 10;
  }

  .lp-feat-grid {
    display: grid;
    gap: 24px;
    z-index: 10;
  }

  .lp-feat-item {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius);
  }

  .lp-feat-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: rgba(249,115,22,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--brand);
  }

  .lp-feat-text h4 { font-size: 15px; color: #fff; margin-bottom: 2px; }
  .lp-feat-text p { font-size: 13px; color: var(--text-muted); }

  /* ── Right Form Panel ── */
  .lp-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: #fff;
  }

  .form-container {
    width: 100%;
    max-width: 400px;
    animation: fadeUp 0.6s ease-out;
  }

  .form-header { margin-bottom: 40px; }
  .form-header h2 { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
  .form-header p { color: var(--text-muted); font-size: 15px; }

  .input-group { margin-bottom: 20px; }
  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-main);
  }

  .input-wrapper { position: relative; }
  .input-wrapper svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    transition: var(--transition);
  }

  .input-control {
    width: 100%;
    padding: 14px 14px 14px 44px;
    border: 1.5px solid var(--border-color);
    border-radius: var(--radius);
    font-size: 15px;
    font-family: inherit;
    transition: var(--transition);
  }

  .input-control:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow: 0 0 0 4px rgba(249,115,22,0.08);
  }

  .input-control:focus + svg { color: var(--brand); }

  .forgot-link {
    display: block;
    text-align: right;
    font-size: 13px;
    color: var(--brand);
    text-decoration: none;
    font-weight: 600;
    margin: -12px 0 24px;
  }

  .btn-submit {
    width: 100%;
    padding: 14px;
    background: var(--text-main);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: var(--transition);
  }

  .btn-submit:hover:not(:disabled) {
    background: var(--brand);
    transform: translateY(-1px);
    box-shadow: 0 10px 20px -10px rgba(249,115,22,0.5);
  }

  .social-login {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border-color);
    text-align: center;
  }

  .register-text {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: var(--text-muted);
  }

  .register-text a {
    color: var(--brand);
    text-decoration: none;
    font-weight: 700;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1024px) {
    .lp-left { display: none; }
    .lp-right { background: var(--bg-primary); }
  }
`;

export default function LandingPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <style>{STYLES}</style>

      <section className="lp-left">
        <div className="lp-left-glow" />
        <div className="lp-logo">
          Your<span>Notes</span>
        </div>

        <div className="lp-content">
          <h1 className="lp-headline">Your mind, <br /><em>organized.</em></h1>
          <p className="lp-desc">The intelligent workspace for students and researchers at S.V. Polytechnic.</p>
          
          <div className="lp-feat-grid">
            <div className="lp-feat-item">
              <div className="lp-feat-icon"><Sparkles size={20} /></div>
              <div className="lp-feat-text">
                <h4>AI Insights</h4>
                <p>Summarize lectures in seconds.</p>
              </div>
            </div>
            <div className="lp-feat-item">
              <div className="lp-feat-icon"><ShieldCheck size={20} /></div>
              <div className="lp-feat-text">
                <h4>Enterprise Security</h4>
                <p>Your data is encrypted and private.</p>
              </div>
            </div>
          </div>
        </div>

        <footer style={{ color: 'var(--text-muted)', fontSize: '12px', zIndex: 10 }}>
          © 2026 S.V. Polytechnic College · Department of CS
        </footer>
      </section>

      <section className="lp-right">
        <div className="form-container">
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Enter your details to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  className="input-control"
                  placeholder="e.g. rahul@example.com"
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  className="input-control"
                  placeholder="••••••••"
                  required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

            <button className="btn-submit" disabled={loading}>
              {loading ? "Verifying..." : "Sign in to Dashboard"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="social-login">
             <p className="register-text">
              Don't have an account? <Link to="/register">Sign up for free</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}