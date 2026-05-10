import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, Bot, Users, FolderOpen, Star, ShieldCheck } from 'lucide-react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  :root {
    --bg:      #f7f6f3;
    --bg2:     #ffffff;
    --border:  #e9e6e0;
    --text:    #18181a;
    --muted:   #8a8794;
    --accent:  #f97316;
  }

  body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); -webkit-font-smoothing:antialiased; }

  /* NAV */
  .ln-nav {
    position:sticky; top:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 48px; height:60px;
    background:rgba(247,246,243,0.88); backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
  }
  .ln-logo {
    display:flex; align-items:center; gap:6px; text-decoration:none;
    font-size:17px; font-weight:800; color:var(--text); letter-spacing:-0.5px;
  }
  .ln-logo-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0; }
  .ln-nav-links { display:flex; align-items:center; gap:6px; }
  .ln-btn-ghost {
    padding:7px 14px; border-radius:8px; font-size:13px; font-weight:600;
    color:var(--muted); text-decoration:none; transition:color 0.15s; font-family:'DM Sans',sans-serif;
  }
  .ln-btn-ghost:hover { color:var(--text); }
  .ln-btn-solid {
    padding:8px 18px; border-radius:8px; font-size:13px; font-weight:700;
    color:#fff; text-decoration:none; background:var(--text); transition:all 0.15s; font-family:'DM Sans',sans-serif;
  }
  .ln-btn-solid:hover { background:var(--accent); transform:translateY(-1px); box-shadow:0 4px 14px rgba(249,115,22,0.25); }

  /* HERO */
  .ln-hero {
    display:flex; flex-direction:column; align-items:center; text-align:center;
    padding:104px 40px 88px; max-width:720px; margin:0 auto;
    animation:fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ln-eyebrow {
    display:inline-flex; align-items:center; gap:12px;
    font-size:11px; font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; color:var(--muted); margin-bottom:32px;
  }
  .ln-eyebrow-line {
    width:28px; height:1px; background:var(--border);
    transform-origin:left; animation:lineGrow 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ln-h1 {
    font-size:clamp(44px,7vw,76px); font-weight:800; line-height:1.05;
    letter-spacing:-2px; color:var(--text); margin-bottom:22px;
    font-family:'DM Sans',sans-serif;
  }
  .ln-h1 em { font-style:italic; color:var(--accent); }
  .ln-subtext {
    font-size:clamp(14px,1.8vw,16px); color:var(--muted); line-height:1.8;
    max-width:400px; margin-bottom:40px; font-weight:400;
  }
  .ln-hero-btns { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center; }
  .ln-cta-primary {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--text); color:#fff; text-decoration:none;
    padding:12px 24px; border-radius:10px; font-size:14px; font-weight:700;
    transition:all 0.2s; font-family:'DM Sans',sans-serif;
  }
  .ln-cta-primary:hover { background:var(--accent); box-shadow:0 8px 24px rgba(249,115,22,0.28); transform:translateY(-2px); }
  .ln-cta-secondary {
    display:inline-flex; align-items:center; gap:6px;
    border:1px solid var(--border); color:var(--muted); text-decoration:none;
    padding:12px 20px; border-radius:10px; font-size:14px; font-weight:600;
    transition:all 0.15s; background:var(--bg2); font-family:'DM Sans',sans-serif;
  }
  .ln-cta-secondary:hover { border-color:var(--text); color:var(--text); }

  /* DIVIDER */
  .ln-divider { height:1px; background:var(--border); }

  /* FEATURES */
  .ln-features { padding:80px 48px; background:var(--bg2); }
  .ln-features-inner { max-width:1040px; margin:0 auto; }
  .ln-features-head { margin-bottom:52px; }
  .ln-section-label {
    font-size:11px; font-weight:700; letter-spacing:0.1em;
    text-transform:uppercase; color:var(--accent); margin-bottom:12px;
  }
  .ln-features-title {
    font-size:clamp(28px,3.5vw,40px); font-weight:800;
    letter-spacing:-1px; color:var(--text); line-height:1.1; max-width:340px;
  }
  .ln-features-title em { font-style:italic; color:var(--muted); }

  .ln-feat-grid {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:1px; background:var(--border);
    border:1px solid var(--border); border-radius:14px; overflow:hidden;
  }
  .ln-feat-card { background:var(--bg2); padding:28px 26px; transition:background 0.2s; }
  .ln-feat-card:hover { background:var(--bg); }
  .ln-feat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
  .ln-feat-name { font-size:14px; font-weight:700; color:var(--text); margin-bottom:7px; }
  .ln-feat-desc { font-size:13px; color:var(--muted); line-height:1.7; }

  /* BOTTOM CTA */
  .ln-bottom-cta { padding:88px 48px; background:var(--text); text-align:center; }
  .ln-bottom-inner { max-width:480px; margin:0 auto; }
  .ln-bottom-title {
    font-size:clamp(30px,4vw,48px); font-weight:800;
    color:#fff; letter-spacing:-1.2px; margin-bottom:14px; line-height:1.06;
  }
  .ln-bottom-title em { font-style:italic; color:rgba(255,255,255,0.35); }
  .ln-bottom-sub { font-size:14px; color:rgba(255,255,255,0.35); margin-bottom:32px; line-height:1.7; }
  .ln-bottom-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:#fff; color:var(--text); text-decoration:none;
    padding:12px 26px; border-radius:10px; font-size:14px; font-weight:700;
    transition:all 0.2s; font-family:'DM Sans',sans-serif;
  }
  .ln-bottom-btn:hover { background:var(--accent); color:#fff; transform:translateY(-2px); box-shadow:0 8px 28px rgba(249,115,22,0.35); }

  /* FOOTER */
  .ln-footer {
    padding:24px 48px; display:flex; align-items:center; justify-content:space-between;
    background:var(--bg); border-top:1px solid var(--border); flex-wrap:wrap; gap:10px;
  }
  .ln-footer-logo { font-size:15px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:5px; }
  .ln-footer-dot  { width:4px; height:4px; border-radius:50%; background:var(--accent); }
  .ln-footer-text { font-size:12px; color:var(--muted); }

  /* RESPONSIVE */
  @media(max-width:768px){
    .ln-nav { padding:0 20px; }
    .ln-hero { padding:72px 24px 64px; }
    .ln-features { padding:60px 24px; }
    .ln-feat-grid { grid-template-columns:1fr; }
    .ln-bottom-cta { padding:72px 24px; }
    .ln-footer { padding:22px 20px; flex-direction:column; align-items:flex-start; }
  }
  @media(max-width:480px){
    .ln-hero-btns { flex-direction:column; width:100%; }
    .ln-cta-primary,.ln-cta-secondary { width:100%; justify-content:center; }
    .ln-nav-links .ln-btn-ghost { display:none; }
  }
`;

const FEATURES = [
  { icon: BookOpen,   color:'#f97316', bg:'rgba(249,115,22,0.09)', name:'Rich Note Editor',     desc:'Write with a clean, distraction-free editor. Add tags, pin important notes, and find anything instantly.' },
  { icon: Bot,        color:'#7c3aed', bg:'rgba(124,58,237,0.09)', name:'Ask AI',               desc:'Chat with AI about your notes. Generate summaries, flashcards, and explanations on demand.' },
  { icon: FolderOpen, color:'#2563eb', bg:'rgba(37,99,235,0.09)',  name:'Folders & Tags',       desc:'Organize with nested folders and color-coded tags. Structure that adapts to how you think.' },
  { icon: Users,      color:'#16a34a', bg:'rgba(22,163,74,0.09)',  name:'Community',            desc:'Share notes publicly and explore what others are learning. Build a public knowledge profile.' },
  { icon: Star,       color:'#d97706', bg:'rgba(217,119,6,0.09)',  name:'Star & Pin',           desc:'Keep your most important notes always within reach. Starred notes surface instantly.' },
  { icon: ShieldCheck,color:'#dc2626', bg:'rgba(220,38,38,0.09)',  name:'Private by Default',  desc:'Your notes belong to you. Full control over visibility — share only what you choose.' },
];

export default function LandingPage() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && token) navigate('/home', { replace: true }); }, [token, loading, navigate]);

  return (
    <div>
      <style>{STYLES}</style>

      <nav className="ln-nav">
        <div className="ln-logo">
          YourNotes <span className="ln-logo-dot" />
        </div>
        <div className="ln-nav-links">
          <Link to="/login" className="ln-btn-ghost">Sign in</Link>
          <Link to="/register" className="ln-btn-solid">Get started</Link>
        </div>
      </nav>

      <section>
        <div className="ln-hero">
          <div className="ln-eyebrow">
            <span className="ln-eyebrow-line" />
            Note-taking, reimagined
            <span className="ln-eyebrow-line" style={{ transformOrigin:'right' }} />
          </div>
          <h1 className="ln-h1">Think clearly,<br /><em>write freely.</em></h1>
          <p className="ln-subtext">A minimal workspace for notes, AI-powered insights, and shared knowledge. Everything you need — nothing you don't.</p>
          <div className="ln-hero-btns">
            <Link to="/register" className="ln-cta-primary">Start for free <ArrowRight size={15} /></Link>
            <Link to="/login" className="ln-cta-secondary">Sign in</Link>
          </div>
        </div>
      </section>

      <div className="ln-divider" />

      <section className="ln-features">
        <div className="ln-features-inner">
          <div className="ln-features-head">
            <div className="ln-section-label">Features</div>
            <h2 className="ln-features-title">Built for<br /><em>focused thinking</em></h2>
          </div>
          <div className="ln-feat-grid">
            {FEATURES.map(({ icon: Icon, color, bg, name, desc }) => (
              <div key={name} className="ln-feat-card">
                <div className="ln-feat-icon" style={{ background:bg }}>
                  <Icon size={17} color={color} strokeWidth={1.75} />
                </div>
                <div className="ln-feat-name">{name}</div>
                <div className="ln-feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ln-bottom-cta">
        <div className="ln-bottom-inner">
          <h2 className="ln-bottom-title">Your notes,<br /><em>your way.</em></h2>
          <p className="ln-bottom-sub">Free to use. No credit card. No clutter. Just a better way to think and learn.</p>
          <Link to="/register" className="ln-bottom-btn">Create free account <ArrowRight size={15} /></Link>
        </div>
      </section>

      <footer className="ln-footer">
        <div className="ln-footer-logo">YourNotes <span className="ln-footer-dot" /></div>
        <div className="ln-footer-text">© {new Date().getFullYear()} YourNotes · Free forever</div>
      </footer>
    </div>
  );
}