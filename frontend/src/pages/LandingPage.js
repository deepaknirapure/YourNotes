import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, Zap, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #000; color: #FFF; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; }

  .login-root { display: flex; min-height: 100vh; overflow: hidden; background: #000; }

  /* ── LEFT PANEL ── */
  .login-left {
    flex: 1.2; background: radial-gradient(circle at top left, #0a0a0a, #000); 
    border-right: 1px solid #1a1a1a; display: flex; flex-direction: column; 
    justify-content: space-between; padding: 60px; position: relative; overflow: hidden;
  }
  
  .bg-grid {
    position: absolute; inset: 0; z-index: 0; opacity: 0.1;
    background-image: linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .brand-logo {
    font-size: 26px; font-weight: 900; color: #FFF; letter-spacing: -1px;
    position: relative; z-index: 1; display: flex; align-items: center; gap: 10px;
  }

  .left-content { position: relative; z-index: 1; max-width: 520px; margin-top: 40px; }
  
  .neon-badge {
    display: inline-flex; align-items: center; gap: 8px; background: rgba(204, 255, 0, 0.1);
    border: 1px solid #ccff00; border-radius: 100px; padding: 6px 16px;
    font-size: 11px; font-weight: 800; color: #ccff00; text-transform: uppercase;
    margin-bottom: 32px; letter-spacing: 1px;
  }

  .left-title {
    font-size: 56px; font-weight: 800; color: #FFF; line-height: 1;
    letter-spacing: -2px; margin-bottom: 24px;
  }

  .features-stack { display: flex; flex-direction: column; gap: 30px; margin-top: 50px; }
  .feat-item { display: flex; gap: 20px; align-items: center; }
  .feat-icon { 
    width: 44px; height: 44px; border-radius: 12px; background: #111; 
    border: 1px solid #222; display: flex; align-items: center; 
    justify-content: center; color: #ccff00; flex-shrink: 0;
  }
  .feat-text h4 { font-size: 16px; font-weight: 800; color: #FFF; margin-bottom: 4px; }
  .feat-text p { font-size: 14px; color: #888; line-height: 1.5; font-weight: 500; }

  .left-footer {
    position: relative; z-index: 1; border-top: 1px solid #1a1a1a;
    padding-top: 30px; display: flex; align-items: center; gap: 20px;
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    flex: 1; background: #000; display: flex; flex-direction: column;
    justify-content: center; padding: 60px 8%; position: relative;
  }

  .form-container {
    width: 100%; max-width: 400px; margin: 0 auto;
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .form-header { margin-bottom: 40px; }
  .form-title { font-size: 36px; font-weight: 800; color: #FFF; letter-spacing: -1.5px; margin-bottom: 12px; }
  .form-subtitle { font-size: 15px; color: #888; font-weight: 500; }

  .input-group { margin-bottom: 24px; }
  .input-label {
    display: block; font-size: 12px; font-weight: 800; color: #555;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
  }
  
  .input-wrapper { position: relative; }
  .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #444; transition: 0.3s; }
  
  .form-input {
    width: 100%; padding: 16px 16px 16px 48px; background: #0a0a0a;
    border: 1px solid #222; border-radius: 12px; font-size: 15px; font-weight: 600;
    color: #FFF; font-family: inherit; transition: 0.3s; outline: none;
  }
  .form-input:focus { 
    border-color: #ccff00; background: #000;
    box-shadow: 0 0 20px rgba(204, 255, 0, 0.05); 
  }
  .form-input:focus + .input-icon { color: #ccff00; }

  .forgot-link {
    display: block; text-align: right; font-size: 13px; font-weight: 700;
    color: #ccff00; text-decoration: none; margin-top: -12px; margin-bottom: 30px;
  }

  .btn-submit {
    width: 100%; padding: 16px; background: #ccff00; color: #000;
    border: none; border-radius: 12px; font-size: 16px; font-weight: 900;
    cursor: pointer; transition: 0.3s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(204, 255, 0, 0.3); }
  .btn-submit:disabled { opacity: 0.5; filter: grayscale(1); }

  .register-prompt { text-align: center; margin-top: 32px; font-size: 14px; color: #555; font-weight: 600; }
  .register-link { color: #FFF; font-weight: 800; text-decoration: none; border-bottom: 2px solid #ccff00; padding-bottom: 2px; }

  @media(max-width: 1024px) {
    .login-left { display: none; }
    .login-right { padding: 40px 24px; }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Check your inputs!');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Access Granted ⚡');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unauthorized Access.');
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
        <div className="bg-grid" />
        <div className="brand-logo">
           <div style={{ background: '#ccff00', padding: '6px', borderRadius: '8px' }}>
             <Terminal size={20} color="#000" />
           </div>
           Your<span style={{ color: "#ccff00" }}>Notes</span>.
        </div>

        <div className="left-content">
          <div className="neon-badge"><Zap size={12} fill="#ccff00" /> v2.0 Live Now</div>
          <h2 className="left-title">Master your <br/> Knowledge.</h2>
          
          <div className="features-stack">
            <div className="feat-item">
              <div className="feat-icon"><Sparkles size={20} /></div>
              <div className="feat-text">
                <h4>Quantum Summaries</h4>
                <p>AI that understands your lecture depth and creates pixel-perfect flashcards.</p>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><ShieldCheck size={20} /></div>
              <div className="feat-text">
                <h4>End-to-End Privacy</h4>
                <p>Your intellectual property stays yours. Encrypted, secure, and decentralized nodes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#444', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Deployment</div>
            <div style={{ fontSize: 13, color: '#FFF', fontWeight: 700 }}>S.V. Polytechnic College, Bhopal</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#1a1a1a' }} />
          <div style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>Est. 2026</div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Login</h2>
            <p className="form-subtitle">Welcome back, Scholar. Authenticate to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Identity / Email</label>
              <div className="input-wrapper">
                <input type="email" placeholder="name@svpoly.edu" value={form.email} onChange={updateField('email')} className="form-input" required />
                <Mail size={18} className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Security Key</label>
              <div className="input-wrapper">
                <input type="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} className="form-input" required />
                <Lock size={18} className="input-icon" />
              </div>
            </div>

            <Link to="/forgot-password" className="forgot-link">Recover Key?</Link>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <>Enter Dashboard <ArrowRight size={20} strokeWidth={3} /></>}
            </button>
          </form>

          <p className="register-prompt">
            New to the hub? <Link to="/register" className="register-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}