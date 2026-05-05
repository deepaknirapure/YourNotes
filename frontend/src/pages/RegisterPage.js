import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock, Loader2, Sparkles, CheckCircle2, Globe, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #f5f5f3; color: #1a1a1a; font-family: 'Plus Jakarta Sans', sans-serif; }

  .reg-root { display: flex; min-height: 100vh; background: #f5f5f3; }

  .reg-left {
    flex: 1.1; background: #ffffff; border-right: 1px solid #e8e6e1;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 56px; position: relative; overflow: hidden;
  }
  .reg-left-deco {
    position: absolute; bottom: -100px; right: -100px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .brand-logo {
    font-size: 22px; font-weight: 900; letter-spacing: -0.5px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .logo-dot { 
    width: 28px; height: 28px; background: #f97316; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
  }

  .left-content { max-width: 440px; }
  .left-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f5f5f3; border: 1px solid #e8e6e1;
    border-radius: 100px; padding: 5px 14px;
    font-size: 11px; font-weight: 700; color: #888580;
    letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 28px;
  }
  .left-title {
    font-size: clamp(30px, 3vw, 44px); font-weight: 900; color: #1a1a1a;
    line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 16px;
  }
  .left-title em { color: #f97316; font-style: normal; }
  .left-desc { font-size: 16px; color: #888580; line-height: 1.65; margin-bottom: 40px; }

  .feat-list { display: flex; flex-direction: column; gap: 18px; }
  .feat-row { display: flex; align-items: flex-start; gap: 14px; }
  .feat-icon-box {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .feat-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
  .feat-desc { font-size: 13px; color: #888580; line-height: 1.5; }

  .left-footer {
    border-top: 1px solid #e8e6e1; padding-top: 24px;
    font-size: 12px; color: #b0ada6; font-weight: 600;
  }

  /* RIGHT */
  .reg-right {
    flex: 1; background: #f5f5f3; display: flex; align-items: center;
    justify-content: center; padding: 56px 6%;
  }
  .form-container {
    width: 100%; max-width: 400px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  .form-header { margin-bottom: 32px; }
  .form-title { font-size: 28px; font-weight: 900; color: #1a1a1a; letter-spacing: -1px; margin-bottom: 6px; }
  .form-subtitle { font-size: 15px; color: #888580; }

  .input-group { margin-bottom: 16px; }
  .input-label {
    display: block; font-size: 12px; font-weight: 700; color: #888580;
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 7px;
  }
  .input-wrap { position: relative; }
  .input-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #b0ada6; pointer-events: none; }
  .form-input {
    width: 100%; padding: 12px 14px 12px 42px;
    background: #ffffff; border: 1.5px solid #e8e6e1;
    border-radius: 10px; font-size: 15px; font-weight: 500;
    color: #1a1a1a; font-family: inherit; outline: none; transition: all 0.18s;
  }
  .form-input::placeholder { color: #c8c5be; }
  .form-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }

  .btn-submit {
    width: 100%; padding: 14px; background: #1a1a1a; color: #fff;
    border: none; border-radius: 10px; font-size: 15px; font-weight: 800;
    font-family: inherit; cursor: pointer; transition: all 0.2s; margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-submit:hover:not(:disabled) { background: #f97316; box-shadow: 0 6px 20px rgba(249,115,22,0.25); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .login-prompt { text-align: center; margin-top: 24px; font-size: 14px; color: #888580; }
  .login-link { color: #f97316; font-weight: 700; text-decoration: none; }
  .login-link:hover { text-decoration: underline; }

  @media(max-width: 960px) {
    .reg-left { display: none; }
    .reg-right { background: #fff; padding: 40px 24px; }
  }
`;

const FEATURES = [
  { icon: CheckCircle2, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Smart Organization', desc: 'Create folders, add tags, and keep your subjects perfectly organized.' },
  { icon: Sparkles,    color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'AI Summaries & Flashcards', desc: 'Auto-generate study materials from your notes in one click.' },
  { icon: Globe,       color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Community Learning', desc: 'Share knowledge and access notes from top students.' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="reg-root">
      <style>{STYLES}</style>

      <div className="reg-left">
        <div className="reg-left-deco" />
        <div className="brand-logo">
          <div className="logo-dot"><BookOpen size={14} color="#fff" strokeWidth={2.5} /></div>
          <span style={{ color: '#1a1a1a' }}>Your</span><span style={{ color: '#f97316' }}>Notes</span>
        </div>

        <div className="left-content">
          <div className="left-badge">✦ Free forever</div>
          <h2 className="left-title">Start your<br /><em>learning journey.</em></h2>
          <p className="left-desc">Join students who are organizing their notes, memorizing faster, and acing exams.</p>

          <div className="feat-list">
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-row">
                <div className="feat-icon-box" style={{ background: f.bg, color: f.color }}>
                  <f.icon size={17} />
                </div>
                <div>
                  <div className="feat-title">{f.label}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="left-footer">S.V. Polytechnic College, Bhopal · 2026</div>
      </div>

      <div className="reg-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Create account</h2>
            <p className="form-subtitle">Set up your free student workspace</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrap">
                <User size={16} className="input-ico" />
                <input type="text" placeholder="Your full name" value={form.name} onChange={updateField('name')} className="form-input" required />
              </div>
            </div>
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
                <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={updateField('password')} className="form-input" required minLength={6} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</>
                : <>Create account <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="login-prompt">
            Already have an account? <Link to="/login" className="login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
