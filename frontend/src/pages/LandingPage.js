import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, Bot, Users, FolderOpen, Star, ShieldCheck, Sparkles } from 'lucide-react';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

  @keyframes fadeUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  @keyframes lineGrow { from{transform:scaleX(0);}to{transform:scaleX(1);} }
  @keyframes floatDot { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-8px);} }

  :root {
    --ln-bg:       #f8f7f4;
    --ln-bg2:      #ffffff;
    --ln-border:   #eae7e1;
    --ln-text:     #17171a;
    --ln-muted:    #87849a;
    --ln-light:    #b5b2c0;
    --ln-accent:   #f97316;
    --ln-accent-d: #ea6c0a;
    --ln-surface:  #f1efea;
    --ln-font:     'Plus Jakarta Sans', sans-serif;
  }

  body { font-family: var(--ln-font); background: var(--ln-bg); color: var(--ln-text); -webkit-font-smoothing: antialiased; }

  /* NAV */
  .ln-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 52px; height: 66px;
    background: rgba(248,247,244,0.92); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--ln-border);
  }
  .ln-logo {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none; font-family: var(--ln-font);
    font-size: 16px; font-weight: 800; color: var(--ln-text); letter-spacing: -0.5px;
  }
  .ln-logo-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--ln-text); display: flex; align-items: center; justify-content: center;
  }

  .ln-nav-links { display: flex; align-items: center; gap: 6px; }
  .ln-btn-ghost {
    padding: 8px 16px; border-radius: 9px; font-size: 14px; font-weight: 600;
    color: var(--ln-muted); text-decoration: none; transition: all 0.15s;
    font-family: var(--ln-font); letter-spacing: -0.1px;
  }
  .ln-btn-ghost:hover { color: var(--ln-text); background: var(--ln-surface); }
  .ln-btn-solid {
    padding: 9px 20px; border-radius: 9px; font-size: 14px; font-weight: 700;
    color: #fff; text-decoration: none; background: var(--ln-text); transition: all 0.18s;
    font-family: var(--ln-font); letter-spacing: -0.2px;
  }
  .ln-btn-solid:hover { background: var(--ln-accent); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249,115,22,0.30); }

  /* HERO */
  .ln-hero-wrap { padding: 0 52px; background: var(--ln-bg); }
  .ln-hero {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: 104px 40px 96px; max-width: 820px; margin: 0 auto;
    animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ln-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--ln-bg2); border: 1px solid var(--ln-border);
    border-radius: 100px; padding: 6px 16px; margin-bottom: 40px;
    font-size: 12px; font-weight: 700; color: var(--ln-muted); letter-spacing: 0.02em;
  }
  .ln-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ln-accent); animation: floatDot 2.5s ease-in-out infinite; }
  .ln-h1 {
    font-family: var(--ln-font);
    font-size: clamp(48px, 6.5vw, 80px); font-weight: 900;
    line-height: 1.0; letter-spacing: -3px; color: var(--ln-text); margin-bottom: 26px;
  }
  .ln-h1 span { color: var(--ln-accent); }
  .ln-subtext {
    font-size: clamp(15px, 1.8vw, 17px); color: var(--ln-muted);
    line-height: 1.75; max-width: 440px; margin-bottom: 48px; font-weight: 500;
  }
  .ln-hero-btns { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .ln-cta-primary {
    display: inline-flex; align-items: center; gap: 9px;
    background: var(--ln-text); color: #fff; text-decoration: none;
    padding: 14px 28px; border-radius: 12px; font-size: 14.5px; font-weight: 800;
    transition: all 0.2s; font-family: var(--ln-font); letter-spacing: -0.2px;
  }
  .ln-cta-primary:hover { background: var(--ln-accent); box-shadow: 0 10px 28px rgba(249,115,22,0.30); transform: translateY(-2px); }
  .ln-cta-secondary {
    display: inline-flex; align-items: center; gap: 7px;
    border: 1.5px solid var(--ln-border); color: var(--ln-muted); text-decoration: none;
    padding: 13px 24px; border-radius: 12px; font-size: 14.5px; font-weight: 600;
    transition: all 0.15s; background: var(--ln-bg2); font-family: var(--ln-font);
  }
  .ln-cta-secondary:hover { border-color: var(--ln-text); color: var(--ln-text); transform: translateY(-1px); }

  /* STATS BAR */
  .ln-stats {
    display: flex; align-items: center; justify-content: center; gap: 0;
    border-top: 1px solid var(--ln-border); border-bottom: 1px solid var(--ln-border);
    background: var(--ln-bg2); overflow: hidden;
  }
  .ln-stat {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    padding: 28px 20px; position: relative;
  }
  .ln-stat + .ln-stat::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 1px; background: var(--ln-border); }
  .ln-stat-num { font-size: 28px; font-weight: 900; color: var(--ln-text); letter-spacing: -1.5px; margin-bottom: 4px; }
  .ln-stat-lbl { font-size: 12px; font-weight: 600; color: var(--ln-muted); letter-spacing: 0.02em; }

  /* FEATURES */
  .ln-features { padding: 96px 52px; background: var(--ln-bg); }
  .ln-features-inner { max-width: 1060px; margin: 0 auto; }
  .ln-features-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 52px; flex-wrap: wrap; gap: 16px; }
  .ln-section-tag { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ln-accent); margin-bottom: 14px; }
  .ln-features-title {
    font-family: var(--ln-font); font-size: clamp(30px, 3.8vw, 46px); font-weight: 900;
    letter-spacing: -1.8px; color: var(--ln-text); line-height: 1.05;
  }
  .ln-features-sub { font-size: 14px; color: var(--ln-muted); max-width: 220px; line-height: 1.6; font-weight: 500; text-align: right; }
  .ln-feat-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 16px;
  }
  .ln-feat-card {
    background: var(--ln-bg2); border: 1.5px solid var(--ln-border);
    padding: 28px 26px; border-radius: 18px; transition: all 0.22s; cursor: default;
  }
  .ln-feat-card:hover { border-color: var(--ln-text); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(23,23,26,0.07); }
  .ln-feat-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
  .ln-feat-name { font-size: 15px; font-weight: 800; color: var(--ln-text); margin-bottom: 8px; letter-spacing: -0.3px; }
  .ln-feat-desc { font-size: 13px; color: var(--ln-muted); line-height: 1.7; font-weight: 500; }

  /* BOTTOM CTA */
  .ln-bottom-cta {
    padding: 100px 52px;
    background: var(--ln-text);
    text-align: center;
    position: relative; overflow: hidden;
  }
  .ln-bottom-cta::before {
    content: ''; position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .ln-bottom-inner { max-width: 540px; margin: 0 auto; position: relative; z-index: 1; }
  .ln-bottom-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.25); border-radius: 100px; padding: 6px 16px; margin-bottom: 28px; font-size: 12px; font-weight: 700; color: #f97316; letter-spacing: 0.02em; }
  .ln-bottom-title {
    font-family: var(--ln-font); font-size: clamp(34px, 4.5vw, 54px); font-weight: 900;
    color: #fff; letter-spacing: -2px; margin-bottom: 18px; line-height: 1.0;
  }
  .ln-bottom-sub { font-size: 15px; color: rgba(255,255,255,0.42); margin-bottom: 40px; line-height: 1.7; font-weight: 500; }
  .ln-bottom-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: #fff; color: var(--ln-text); text-decoration: none;
    padding: 14px 30px; border-radius: 12px; font-size: 15px; font-weight: 800;
    transition: all 0.2s; font-family: var(--ln-font); letter-spacing: -0.3px;
  }
  .ln-bottom-btn:hover { background: var(--ln-accent); color: #fff; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(249,115,22,0.38); }

  /* FOOTER */
  .ln-footer {
    padding: 28px 52px; display: flex; align-items: center; justify-content: space-between;
    background: var(--ln-bg); border-top: 1px solid var(--ln-border); flex-wrap: wrap; gap: 10px;
  }
  .ln-footer-logo { font-size: 15px; font-weight: 800; color: var(--ln-text); display: flex; align-items: center; gap: 8px; letter-spacing: -0.4px; }
  .ln-footer-logo-icon { width: 22px; height: 22px; border-radius: 6px; background: var(--ln-text); display: flex; align-items: center; justify-content: center; }
  .ln-footer-text { font-size: 12px; color: var(--ln-light); font-weight: 500; }

  /* RESPONSIVE */
  @media(max-width:900px){
    .ln-nav { padding: 0 24px; }
    .ln-hero-wrap { padding: 0 24px; }
    .ln-hero { padding: 80px 0 64px; }
    .ln-features { padding: 72px 24px; }
    .ln-feat-grid { grid-template-columns: 1fr 1fr; }
    .ln-bottom-cta { padding: 80px 24px; }
    .ln-footer { padding: 24px; }
    .ln-features-sub { display: none; }
  }
  @media(max-width:600px){
    .ln-feat-grid { grid-template-columns: 1fr; }
    .ln-hero-btns { flex-direction: column; width: 100%; }
    .ln-cta-primary,.ln-cta-secondary { width: 100%; justify-content: center; }
    .ln-nav-links .ln-btn-ghost { display: none; }
    .ln-stats { flex-wrap: wrap; }
    .ln-stat { min-width: 50%; }
  }
`;

const FEATURES = [
  { icon: BookOpen,    color: '#f97316', bg: 'rgba(249,115,22,0.10)', name: 'Rich Note Editor',      desc: 'Write with a clean, distraction-free editor. Add tags, pin important notes, and find anything instantly.' },
  { icon: Bot,         color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', name: 'Ask AI',                desc: 'Chat with AI about your notes. Generate summaries, flashcards, and explanations on demand.' },
  { icon: FolderOpen,  color: '#2563eb', bg: 'rgba(37,99,235,0.10)',  name: 'Folders & Tags',        desc: 'Organize with nested folders and color-coded tags. Structure that adapts to how you think.' },
  { icon: Users,       color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  name: 'Community',             desc: 'Share notes publicly and explore what others are learning. Build a public knowledge profile.' },
  { icon: Star,        color: '#d97706', bg: 'rgba(217,119,6,0.10)',  name: 'Star & Pin',            desc: 'Keep your most important notes always within reach. Starred notes surface instantly.' },
  { icon: ShieldCheck, color: '#dc2626', bg: 'rgba(220,38,38,0.10)',  name: 'Private by Default',   desc: 'Your notes belong to you. Full control over visibility — share only what you choose.' },
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
          <div className="ln-logo-icon">
            <Sparkles size={14} color="#fff" strokeWidth={2.5} />
          </div>
          YourNotes
        </a>
        <div className="ln-nav-links">
          <Link to="/login" className="ln-btn-ghost">Sign in</Link>
          <Link to="/register" className="ln-btn-solid">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="ln-hero-wrap">
        <section>
          <div className="ln-hero">
            <div className="ln-pill">
              <span className="ln-pill-dot" />
              Note-taking, reimagined
            </div>
            <h1 className="ln-h1">Think clearly,<br /><span>write freely.</span></h1>
            <p className="ln-subtext">A minimal workspace for notes, AI-powered insights, and shared knowledge. Everything you need — nothing you don't.</p>
            <div className="ln-hero-btns">
              <Link to="/register" className="ln-cta-primary">Start for free <ArrowRight size={16} strokeWidth={2.5} /></Link>
              <Link to="/login" className="ln-cta-secondary">Sign in →</Link>
            </div>
          </div>
        </section>
      </div>

      {/* Stats */}
      <div className="ln-stats">
        <div className="ln-stat"><div className="ln-stat-num">10k+</div><div className="ln-stat-lbl">Notes Created</div></div>
        <div className="ln-stat"><div className="ln-stat-num">Free</div><div className="ln-stat-lbl">Forever Plan</div></div>
        <div className="ln-stat"><div className="ln-stat-num">AI</div><div className="ln-stat-lbl">Powered Insights</div></div>
        <div className="ln-stat"><div className="ln-stat-num">6</div><div className="ln-stat-lbl">Powerful Features</div></div>
      </div>

      {/* Features */}
      <section className="ln-features">
        <div className="ln-features-inner">
          <div className="ln-features-head">
            <div>
              <div className="ln-section-tag">Features</div>
              <h2 className="ln-features-title">Built for<br />focused thinking</h2>
            </div>
            <div className="ln-features-sub">Everything you need to capture, organize and understand your ideas.</div>
          </div>
          <div className="ln-feat-grid">
            {FEATURES.map(({ icon: Icon, color, bg, name, desc }) => (
              <div key={name} className="ln-feat-card">
                <div className="ln-feat-icon" style={{ background: bg }}>
                  <Icon size={18} color={color} strokeWidth={2} />
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
          <div className="ln-bottom-tag"><Sparkles size={11} /> Free forever, no card needed</div>
          <h2 className="ln-bottom-title">Your notes,<br />your way.</h2>
          <p className="ln-bottom-sub">Free to use. No credit card. No clutter. Just a better way to think and learn.</p>
          <Link to="/register" className="ln-bottom-btn">Create free account <ArrowRight size={16} strokeWidth={2.5} /></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="ln-footer">
        <div className="ln-footer-logo">
          <div className="ln-footer-logo-icon"><Sparkles size={12} color="#fff" strokeWidth={2.5} /></div>
          YourNotes
        </div>
        <div className="ln-footer-text">© {new Date().getFullYear()} YourNotes · Free forever</div>
      </footer>
    </div>
  );
}