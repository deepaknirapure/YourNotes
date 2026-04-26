import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, Loader2, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #FFF; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; margin: 0; }

  .register-root { display: flex; min-height: 100vh; overflow: hidden; }

  /* ── LEFT PANEL (Marketing) ── */
  .register-left {
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

  .left-desc { font-size: 16px; color: #64748B; line-height: 1.6; margin-bottom: 40px; font-weight: 500; }

  .feature-list { display: flex; flex-direction: column; gap: 20px; }
  .feature-item { display: flex; gap: 16px; align-items: flex-start; }
  .feature-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .feature-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 2px; }
  .feature-desc { font-size: 13px; color: #64748B; font-weight: 500; line-height: 1.5; }

  .left-footer {
    position: relative; z-index: 1; background: #FFF; border: 1px solid #E2E8F0;
    border-radius: 12px; padding: 20px; display: inline-flex; flex-direction: column; gap: 4px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  }

  /* ── RIGHT PANEL (Form) ── */
  .register-right {
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
  .form-input::placeholder { color: #94A3B8; font-weight: 400; }
  .form-input:focus { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229, 91, 45, 0.1); }

  .btn-submit {
    width: 100%; padding: 14px; background: #0F172A; color: #FFF;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
    font-family: inherit; cursor: pointer; transition: 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 12px;
  }
  .btn-submit:hover:not(:disabled) { background: #E55B2D; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(229, 91, 45, 0.2); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-prompt { text-align: center; margin-top: 32px; font-size: 14px; color: #64748B; font-weight: 500; }
  .login-link { color: #E55B2D; font-weight: 700; text-decoration: none; transition: 0.2s; }
  .login-link:hover { color: #0F172A; }

  /* Mobile Footer */
  .mobile-footer {
    display: none;
    text-align: center;
    margin-top: 40px;
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 1px;
  }

  @media(max-width: 960px) {
    .register-left { display: none; }
    .register-right { padding: 40px 24px; }
    .mobile-footer { display: block; }
  }
`;

const FEATURES = [
  { icon: CheckCircle2, color: '#4F46E5', bg: '#EEF2FF', label: 'Smart Organization', desc: 'Create folders, add tags, and keep your subjects perfectly separated.' },
  { icon: Sparkles, color: '#E55B2D', bg: '#FFF5F2', label: 'AI Summaries & Flashcards', desc: 'Auto-generate study materials from your notes in a single click.' },
  { icon: Globe, color: '#10B981', bg: '#ECFDF5', label: 'Community Learning', desc: 'Share your knowledge and access notes from top students.' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return toast.error('All fields are required');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard'); // Match routing logic with login
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="register-root">
      <style>{STYLES}</style>

      {/* ── LEFT PANEL (Marketing) ── */}
      <div className="register-left">
        <div className="bg-dots" />
        
        <div className="brand-logo">
          Your<span style={{ color: "#E55B2D" }}>Notes</span>.
        </div>

        <div className="left-content">
          <div className="saas-badge">
            <Sparkles size={14} /> Free Forever
          </div>
          <h2 className="left-title">
            Start your learning journey.
          </h2>
          <p className="left-desc">
            Join thousands of students who are organizing their notes, memorizing faster, and acing their exams.
          </p>

          <div className="feature-list">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon-wrap" style={{ background: f.bg, color: f.color }}>
                  <f.icon size={18} />
                </div>
                <div>
                  <div className="feature-title">{f.label}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="left-footer">
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Built for Students
          </div>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            S.V. Polytechnic College, Bhopal · 2026
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form) ── */}
      <div className="register-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Set up your free student workspace today.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={updateField('name')}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={updateField('email')}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={updateField('password')}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="login-prompt">
            Already have an account? <Link to="/login" className="login-link">Sign in here</Link>
          </p>

          <div className="mobile-footer">
            YOURNOTES · BHOPAL · 2026
          </div>
        </div>
      </div>
    </div>
  );
}