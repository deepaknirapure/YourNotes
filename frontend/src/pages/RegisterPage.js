// ye Register page hai - naya account banane ke liye
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { FieldGroup, AUTH_STYLES } from '../components/AuthLayout';

export default function RegisterPage() {
  // Form state - teen fields: naam, email, password
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // Form submit karne par account banao
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name || !form.email || !form.password) {
      return toast.error('All fields are required');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      // Register API call
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token); // auto login after register
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Field update helper
  const updateField = (key) => (val) => setForm({ ...form, [key]: val });

  // Features list for left panel
  const FEATURES = [
    { color: '#4F46E5', bg: 'rgba(79,70,229,0.12)',   label: 'Smart Notes',  desc: 'Rich text editor with auto-save' },
    { color: '#E55B2D', bg: 'rgba(229,91,45,0.12)',   label: 'AI Powered',   desc: 'Summaries & flashcards in seconds' },
    { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Community',    desc: 'Share notes with other students' },
  ];

  return (
    <div className="auth-wrap">
      <style>{AUTH_STYLES}</style>

      {/* Left decorative panel */}
      <div className="auth-left">
        {/* Diagonal grid lines */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="auth-grid-line" style={{ left: `${8 + i * 21}%` }} />
        ))}

        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '30%', right: -80,
          width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(229,91,45,0.07) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, background: '#E55B2D',
              borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Your<span style={{ color: '#E55B2D' }}>Notes</span>
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-badge">
            <span className="auth-dot" />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#E55B2D', letterSpacing: '0.08em' }}>
              FREE FOREVER
            </span>
          </div>
          <h2 style={{
            fontSize: 42, fontWeight: 800, color: '#fff',
            letterSpacing: '-2px', lineHeight: 1.06, marginBottom: 16,
          }}>
            Start your<br />learning journey.
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: 15,
            lineHeight: 1.65, maxWidth: 300, marginBottom: 32,
          }}>
            Notes, AI summaries, flashcards and community — all free.
          </p>

          {/* Feature list */}
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: f.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {/* Checkmark icon */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={f.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer card */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '16px 18px',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#E55B2D', letterSpacing: '0.08em', marginBottom: 3 }}>
            ✓ STUDENT PROJECT
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            S.V. Polytechnic College, Bhopal · 2026
          </p>
        </div>
      </div>

      {/* Right side: Register form */}
      <div className="auth-right">
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1.2px', marginBottom: 6 }}>
            Create Account
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            Create your free account and get started.
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldGroup
            label="Full Name"
            icon={<User size={14} />}
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={updateField('name')}
          />
          <FieldGroup
            label="Email Address"
            icon={<Mail size={14} />}
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={updateField('email')}
          />
          <FieldGroup
            label="Password"
            icon={<Lock size={14} />}
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={updateField('password')}
          />

          {/* Submit button */}
          <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : (
              <><span>Create Account</span><ArrowRight size={15} /></>
            )}
          </button>
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#E55B2D', fontWeight: 700 }}>Sign in here</Link>
        </p>

        <p style={{
          marginTop: 'auto', paddingTop: 36,
          textAlign: 'center', fontSize: 10,
          color: 'rgba(255,255,255,0.1)', letterSpacing: '3px', fontWeight: 700,
        }}>
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}
