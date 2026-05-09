import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, Bot, Users, FolderOpen, Star, ShieldCheck } from 'lucide-react';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

  @keyframes fadeUp { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }
  @keyframes lineGrow { from{transform:scaleX(0);}to{transform:scaleX(1);} }

  :root {
    --ln-bg:       #f7f6f3;
    --ln-bg2:      #ffffff;
    --ln-border:   #e9e6e0;
    --ln-text:     #18181a;
    --ln-muted:    #8a8794;
    --ln-accent:   #f97316;
    --ln-accent-d: #ea6c0a;
    --ln-font:     'DM Sans', sans-serif;
    --ln-serif:    'Instrument Serif', Georgia, serif;
  }

  body { font-family: var(--ln-font); background: var(--ln-bg); color: var(--ln-text); -webkit-font-smoothing: antialiased; }

  /* NAV */
  .ln-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(247,246,243,0.90); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--ln-border);
  }
  .ln-logo {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; font-family: var(--ln-font);
    font-size: 16px; font-weight: 800; color: var(--ln-text); letter-spacing: -0.4px;
  }
  .ln-logo-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ln-accent); flex-shrink: 0; }

  .ln-nav-links { display: flex; align-items: center; gap: 8px; }
  .ln-btn-ghost {
    padding: 7px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500;
    color: var(--ln-muted); text-decoration: none; transition: color 0.15s;
    font-family: var(--ln-font);
  }
  .ln-btn-ghost:hover { color: var(--ln-text); }
  .ln-btn-solid {
    padding: 8px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 700;
    color: #fff; text-decoration: none; background: var(--ln-text); transition: all 0.15s;
    font-family: var(--ln-font);
  }
  .ln-btn-solid:hover { background: var(--ln-accent); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,0.28); }

  /* HERO */
  .ln-hero {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: 110px 40px 96px; max-width: 780px; margin: 0 auto;
    animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ln-eyebrow {
    display: inline-flex; align-items: center; gap: 12px;
    font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ln-muted); margin-bottom: 36px;
  }
  .ln-eyebrow-line {
    width: 28px; height: 1px; background: var(--ln-border);
    transform-origin: left; animation: lineGrow 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ln-h1 {
    font-family: var(--ln-serif);
    font-size: clamp(48px, 7vw, 84px); font-weight: 400;
    line-height: 1.02; letter-spacing: -1.5px; color: var(--ln-text); margin-bottom: 24px;
  }
  .ln-h1 em { font-style: italic; color: var(--ln-accent); }
  .ln-subtext {
    font-size: clamp(15px, 1.8vw, 17px); color: var(--ln-muted);
    line-height: 1.75; max-width: 420px; margin-bottom: 44px; font-weight: 400;
  }
  .ln-hero-btns { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .ln-cta-primary {
    display: inline-flex; align-items: center; gap: 9px;
    background: var(--ln-text); color: #fff; text-decoration: none;
    padding: 13px 26px; border-radius: 10px; font-size: 14.5px; font-weight: 700;
    transition: all 0.2s; font-family: var(--ln-font);
  }
  .ln-cta-primary:hover { background: var(--ln-accent); box-shadow: 0 8px 24px rgba(249,115,22,0.28); transform: translateY(-2px); }
  .ln-cta-secondary {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid var(--ln-border); color: var(--ln-muted); text-decoration: none;
    padding: 13px 22px; border-radius: 10px; font-size: 14.5px; font-weight: 500;
    transition: all 0.15s; background: var(--ln-bg2); font-family: var(--ln-font);
  }
  .ln-cta-secondary:hover { border-color: var(--ln-text); color: var(--ln-text); }

  /* DIVIDER */
  .ln-divider { height: 1px; background: var(--ln-border); }

  /* FEATURES */
  .ln-features { padding: 88px 48px; background: var(--ln-bg2); }
  .ln-features-inner { max-width: 1040px; margin: 0 auto; }
  .ln-features-head { margin-bottom: 56px; }
  .ln-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ln-accent); margin-bottom: 14px; }
  .ln-features-title {
    font-family: var(--ln-serif); font-size: clamp(30px, 4vw, 46px); font-weight: 400;
    letter-spacing: -0.8px; color: var(--ln-text); line-height: 1.1; max-width: 380px;
  }
  .ln-features-title em { font-style: italic; color: var(--ln-muted); }
  .ln-feat-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 1px; background: var(--ln-border);
    border: 1px solid var(--ln-border); border-radius: 16px; overflow: hidden;
  }
  .ln-feat-card { background: var(--ln-bg2); padding: 30px 28px; transition: background 0.2s; }
  .ln-feat-card:hover { background: var(--ln-bg); }
  .ln-feat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
  .ln-feat-name { font-size: 14.5px; font-weight: 700; color: var(--ln-text); margin-bottom: 8px; letter-spacing: -0.1px; }
  .ln-feat-desc { font-size: 13px; color: var(--ln-muted); line-height: 1.7; }

  /* BOTTOM CTA */
  .ln-bottom-cta { padding: 96px 48px; background: var(--ln-text); text-align: center; }
  .ln-bottom-inner { max-width: 500px; margin: 0 auto; }
  .ln-bottom-title {
    font-family: var(--ln-serif); font-size: clamp(32px, 4.5vw, 52px); font-weight: 400;
    color: #fff; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.05;
  }
  .ln-bottom-title em { font-style: italic; color: rgba(255,255,255,0.38); }
  .ln-bottom-sub { font-size: 15px; color: rgba(255,255,255,0.40); margin-bottom: 36px; line-height: 1.7; }
  .ln-bottom-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: #fff; color: var(--ln-text); text-decoration: none;
    padding: 13px 28px; border-radius: 10px; font-size: 14.5px; font-weight: 700;
    transition: all 0.2s; font-family: var(--ln-font);
  }
  .ln-bottom-btn:hover { background: var(--ln-accent); color: #fff; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.35); }

  /* FOOTER */
  .ln-footer {
    padding: 28px 48px; display: flex; align-items: center; justify-content: space-between;
    background: var(--ln-bg); border-top: 1px solid var(--ln-border); flex-wrap: wrap; gap: 10px;
  }
  .ln-footer-logo { font-size: 15px; font-weight: 800; color: var(--ln-text); display: flex; align-items: center; gap: 5px; letter-spacing: -0.3px; }
  .ln-footer-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--ln-accent); }
  .ln-footer-text { font-size: 12px; color: var(--ln-muted); }

  /* RESPONSIVE */
  @media(max-width:768px){
    .ln-nav { padding: 0 20px; height: 58px; }
    .ln-hero { padding: 72px 24px 64px; }
    .ln-features { padding: 64px 24px; }
    .ln-feat-grid { grid-template-columns: 1fr; }
    .ln-bottom-cta { padding: 72px 24px; }
    .ln-footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; }
  }
  @media(max-width:480px){
    .ln-hero-btns { flex-direction: column; width: 100%; }
    .ln-cta-primary,.ln-cta-secondary { width: 100%; justify-content: center; }
    .ln-nav-links .ln-btn-ghost { display: none; }
  }
`;

const FEATURES = [
  { icon: BookOpen, color: '#f97316', bg: 'rgba(249,115,22,0.09)', name: 'Rich Note Editor', desc: 'Write with a clean, distraction-free editor. Add tags, pin important notes, and find anything instantly.' },
  { icon: Bot,      color: '#7c3aed', bg: 'rgba(124,58,237,0.09)', name: 'Ask AI',           desc: 'Chat with AI about your notes. Generate summaries, flashcards, and explanations on demand.' },
  { icon: FolderOpen, color: '#2563eb', bg: 'rgba(37,99,235,0.09)', name: 'Folders & Tags', desc: 'Organize with nested folders and color-coded tags. Structure that adapts to how you think.' },
  { icon: Users,    color: '#16a34a', bg: 'rgba(22,163,74,0.09)',   name: 'Community',        desc: 'Share notes publicly and explore what others are learning. Build a public knowledge profile.' },
  { icon: Star,     color: '#d97706', bg: 'rgba(217,119,6,0.09)',   name: 'Star & Pin',       desc: 'Keep your most important notes always within reach. Starred notes surface instantly.' },
  { icon: ShieldCheck, color: '#dc2626', bg: 'rgba(220,38,38,0.09)', name: 'Private by Default', desc: 'Your notes belong to you. Full control over visibility — share only what you choose.' },
];

export default function LandingPage() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && token) navigate('/home', { replace: true });
  }, [token, loading, navigate]);

  return (
    <div>
      <style>{STYLES}</style>

      {/* Nav */}
      <nav className="ln-nav">
        <a href="/" className="ln-logo">
          YourNotes <span className="ln-logo-dot" />
        </a>
        <div className="ln-nav-links">
          <Link to="/login" className="ln-btn-ghost">Sign in</Link>
          <Link to="/register" className="ln-btn-solid">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section>
        <div className="ln-hero">
          <div className="ln-eyebrow">
            <span className="ln-eyebrow-line" />
            Note-taking, reimagined
            <span className="ln-eyebrow-line" style={{ transformOrigin: 'right' }} />
          </div>
          <h1 className="ln-h1">Think clearly,<br /><em>write freely.</em></h1>
          <p className="ln-subtext">A minimal workspace for notes, AI-powered insights, and shared knowledge. Everything you need — nothing you don't.</p>
          <div className="ln-hero-btns">
            <Link to="/register" className="ln-cta-primary">Start for free <ArrowRight size={16} /></Link>
            <Link to="/login" className="ln-cta-secondary">Sign in</Link>
          </div>
        </div>
      </section>

      <div className="ln-divider" />

      {/* Features */}
      <section className="ln-features">
        <div className="ln-features-inner">
          <div className="ln-features-head">
            <div className="ln-section-label">Features</div>
            <h2 className="ln-features-title">Built for<br /><em>focused thinking</em></h2>
          </div>
          <div className="ln-feat-grid">
            {FEATURES.map(({ icon: Icon, color, bg, name, desc }) => (
              <div key={name} className="ln-feat-card">
                <div className="ln-feat-icon" style={{ background: bg }}>
                  <Icon size={17} color={color} strokeWidth={1.75} />
                </div>
                <div className="ln-feat-name">{name}</div>
                <div className="ln-feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="ln-bottom-cta">
        <div className="ln-bottom-inner">
          <h2 className="ln-bottom-title">Your notes,<br /><em>your way.</em></h2>
          <p className="ln-bottom-sub">Free to use. No credit card. No clutter. Just a better way to think and learn.</p>
          <Link to="/register" className="ln-bottom-btn">Create free account <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="ln-footer">
        <div className="ln-footer-logo">YourNotes <span className="ln-footer-dot" /></div>
        <div className="ln-footer-text">© {new Date().getFullYear()} YourNotes · Free forever</div>
      </footer>
    </div>
  );
}