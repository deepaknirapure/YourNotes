import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ArrowRight, BookOpen, Bot, Users, FolderOpen, Star, ShieldCheck } from 'lucide-react';

// Hindi: Yeh page sabse pehle dikhta hai — marketing landing page hai, login nahi

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  body{font-family:'DM Sans',sans-serif;background:#f9f8f6;color:#111110;-webkit-font-smoothing:antialiased;}

  .ln-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:62px;background:rgba(249,248,246,0.9);backdrop-filter:blur(14px);border-bottom:1px solid #e8e5df;}
  .ln-logo{font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#111110;text-decoration:none;}
  .ln-logo span{color:#f97316;}
  .ln-nav-links{display:flex;align-items:center;gap:8px;}
  .ln-btn-outline{padding:7px 16px;border:1.5px solid #e8e5df;border-radius:8px;font-size:13.5px;font-weight:700;color:#111110;text-decoration:none;transition:all 0.15s;background:#fff;}
  .ln-btn-outline:hover{border-color:#111110;}
  .ln-btn-fill{padding:7px 16px;border-radius:8px;font-size:13.5px;font-weight:700;color:#fff;text-decoration:none;background:#f97316;transition:all 0.15s;}
  .ln-btn-fill:hover{background:#ea6a0a;transform:translateY(-1px);box-shadow:0 4px 14px rgba(249,115,22,0.3);}

  .ln-hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:96px 40px 80px;max-width:820px;margin:0 auto;animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;}
  .ln-badge{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid #e8e5df;border-radius:999px;padding:5px 16px;font-size:12px;font-weight:700;color:#44433e;margin-bottom:28px;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
  .ln-badge-dot{width:6px;height:6px;border-radius:50%;background:#f97316;flex-shrink:0;}
  .ln-h1{font-size:clamp(44px,6.5vw,76px);font-weight:800;line-height:1.03;letter-spacing:-2.5px;color:#111110;margin-bottom:22px;}
  .ln-h1 em{color:#f97316;font-style:normal;}
  .ln-subtext{font-size:clamp(16px,2vw,18px);color:#87857d;line-height:1.7;max-width:500px;margin-bottom:40px;}
  .ln-hero-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;}
  .ln-cta-primary{display:inline-flex;align-items:center;gap:8px;background:#111110;color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:15px;font-weight:700;transition:all 0.2s;}
  .ln-cta-primary:hover{background:#f97316;box-shadow:0 6px 20px rgba(249,115,22,0.3);transform:translateY(-2px);}
  .ln-cta-secondary{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #e8e5df;color:#44433e;text-decoration:none;padding:13px 22px;border-radius:10px;font-size:15px;font-weight:600;transition:all 0.15s;background:#fff;}
  .ln-cta-secondary:hover{border-color:#111110;color:#111110;}
  .ln-trust{margin-top:28px;font-size:12.5px;color:#b5b2aa;font-weight:500;}

  .ln-stats-bar{display:flex;align-items:center;justify-content:center;border-top:1px solid #e8e5df;border-bottom:1px solid #e8e5df;background:#fff;flex-wrap:wrap;}
  .ln-stat{flex:1;min-width:150px;text-align:center;padding:28px 20px;}
  .ln-stat:not(:last-child){border-right:1px solid #e8e5df;}
  .ln-stat-num{font-size:36px;font-weight:800;color:#111110;letter-spacing:-2px;margin-bottom:3px;}
  .ln-stat-num em{color:#f97316;font-style:normal;}
  .ln-stat-label{font-size:13px;color:#87857d;font-weight:500;}

  .ln-features{padding:80px 40px;background:#fff;border-top:1px solid #e8e5df;border-bottom:1px solid #e8e5df;}
  .ln-features-inner{max-width:1000px;margin:0 auto;}
  .ln-features-head{text-align:center;margin-bottom:50px;}
  .ln-kicker{font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#f97316;margin-bottom:12px;}
  .ln-features-title{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-1.2px;color:#111110;margin-bottom:12px;}
  .ln-features-sub{font-size:16px;color:#87857d;line-height:1.65;max-width:440px;margin:0 auto;}
  .ln-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
  .ln-feat-card{background:#f9f8f6;border:1px solid #e8e5df;border-radius:16px;padding:26px;transition:all 0.2s;}
  .ln-feat-card:hover{border-color:#f97316;background:#fff;box-shadow:0 4px 20px rgba(249,115,22,0.07);transform:translateY(-2px);}
  .ln-feat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
  .ln-feat-name{font-size:15px;font-weight:800;color:#111110;margin-bottom:7px;letter-spacing:-0.2px;}
  .ln-feat-desc{font-size:13.5px;color:#87857d;line-height:1.65;}

  .ln-bottom-cta{padding:80px 40px;background:#111110;text-align:center;}
  .ln-bottom-inner{max-width:580px;margin:0 auto;}
  .ln-bottom-title{font-size:clamp(28px,4vw,46px);font-weight:800;color:#fff;letter-spacing:-1.5px;margin-bottom:14px;}
  .ln-bottom-title em{color:#f97316;font-style:normal;}
  .ln-bottom-sub{font-size:16px;color:rgba(255,255,255,0.45);margin-bottom:34px;line-height:1.65;}
  .ln-bottom-btn{display:inline-flex;align-items:center;gap:8px;background:#f97316;color:#fff;text-decoration:none;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:700;transition:all 0.2s;}
  .ln-bottom-btn:hover{background:#ea6a0a;transform:translateY(-2px);box-shadow:0 6px 24px rgba(249,115,22,0.4);}

  .ln-footer{padding:26px 40px;display:flex;align-items:center;justify-content:space-between;background:#f9f8f6;border-top:1px solid #e8e5df;flex-wrap:wrap;gap:10px;}
  .ln-footer-logo{font-size:15px;font-weight:800;color:#111110;}
  .ln-footer-logo span{color:#f97316;}
  .ln-footer-text{font-size:12px;color:#b5b2aa;}

  @media(max-width:768px){
    .ln-nav{padding:0 18px;height:56px;}
    .ln-hero{padding:60px 20px 52px;}
    .ln-h1{letter-spacing:-1.5px;}
    .ln-features{padding:60px 20px;}
    .ln-feat-grid{grid-template-columns:1fr;}
    .ln-stats-bar{flex-direction:column;}
    .ln-stat:not(:last-child){border-right:none;border-bottom:1px solid #e8e5df;}
    .ln-bottom-cta{padding:60px 20px;}
    .ln-footer{padding:20px;flex-direction:column;align-items:flex-start;}
  }
  @media(max-width:480px){
    .ln-hero-btns{flex-direction:column;width:100%;}
    .ln-cta-primary,.ln-cta-secondary{width:100%;justify-content:center;}
  }
`;

const FEATURES = [
  { icon: BookOpen, color: '#f97316', bg: 'rgba(249,115,22,0.09)', name: 'Smart Notes', desc: 'Rich text editor with tags, folders, pinning and instant search. Your thoughts, perfectly captured.' },
  { icon: Bot, color: '#6d28d9', bg: 'rgba(109,40,217,0.09)', name: 'Ask AI', desc: 'Chat with AI about your notes. Auto-generate summaries, flashcards, and explanations instantly.' },
  { icon: FolderOpen, color: '#1d4ed8', bg: 'rgba(29,78,216,0.09)', name: 'Folders & Tags', desc: 'Nested folders, color-coded tags, and smart filters. Everything organized, nothing lost.' },
  { icon: Users, color: '#15803d', bg: 'rgba(21,128,61,0.09)', name: 'Community', desc: 'Share notes publicly and discover what others are learning. Build a public knowledge profile.' },
  { icon: Star, color: '#b45309', bg: 'rgba(180,83,9,0.09)', name: 'Star & Pin', desc: 'Mark your most important notes. Starred and pinned notes always surface to the top.' },
  { icon: ShieldCheck, color: '#b91c1c', bg: 'rgba(185,28,28,0.09)', name: 'Private & Secure', desc: 'Notes are private by default. Full control over what you share with the community.' },
];

export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Hindi: Already logged in users ko dashboard par bhejo
  useEffect(() => {
    if (token) navigate('/home', { replace: true });
  }, [token, navigate]);

  return (
    <div>
      <style>{STYLES}</style>

      {/* Navigation */}
      <nav className="ln-nav">
        <a href="/" className="ln-logo">Your<span>Notes</span></a>
        <div className="ln-nav-links">
          <Link to="/login" className="ln-btn-outline">Sign in</Link>
          <Link to="/register" className="ln-btn-fill">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section>
        <div className="ln-hero">
          <div className="ln-badge">
            <div className="ln-badge-dot" />
            Free for everyone · No credit card needed
          </div>
          <h1 className="ln-h1">Your notes,<br /><em>brilliantly organized.</em></h1>
          <p className="ln-subtext">
            The minimal, AI-powered note-taking workspace for students and knowledge workers. Write more, learn faster, remember everything.
          </p>
          <div className="ln-hero-btns">
            <Link to="/register" className="ln-cta-primary">
              Start for free <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="ln-cta-secondary">
              Already have an account
            </Link>
          </div>
          <p className="ln-trust">Trusted by students at S.V. Polytechnic College, Bhopal</p>
        </div>
      </section>

      {/* Stats */}
      <div className="ln-stats-bar">
        <div className="ln-stat">
          <div className="ln-stat-num">10k<em>+</em></div>
          <div className="ln-stat-label">Notes created</div>
        </div>
        <div className="ln-stat">
          <div className="ln-stat-num">500<em>+</em></div>
          <div className="ln-stat-label">Active students</div>
        </div>
        <div className="ln-stat">
          <div className="ln-stat-num">99<em>%</em></div>
          <div className="ln-stat-label">Uptime</div>
        </div>
        <div className="ln-stat">
          <div className="ln-stat-num">0<em>₹</em></div>
          <div className="ln-stat-label">Forever free</div>
        </div>
      </div>

      {/* Features */}
      <section className="ln-features">
        <div className="ln-features-inner">
          <div className="ln-features-head">
            <div className="ln-kicker">Everything you need</div>
            <h2 className="ln-features-title">Built for focused learning</h2>
            <p className="ln-features-sub">Every feature is designed to help you capture ideas, organize knowledge, and study smarter.</p>
          </div>
          <div className="ln-feat-grid">
            {FEATURES.map(({ icon: Icon, color, bg, name, desc }) => (
              <div key={name} className="ln-feat-card">
                <div className="ln-feat-icon" style={{ background: bg }}>
                  <Icon size={19} color={color} />
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
          <h2 className="ln-bottom-title">Ready to take <em>better notes?</em></h2>
          <p className="ln-bottom-sub">Join hundreds of students already using YourNotes to study smarter. Free, forever.</p>
          <Link to="/register" className="ln-bottom-btn">
            Create your free account <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="ln-footer">
        <div className="ln-footer-logo">Your<span>Notes</span></div>
        <div className="ln-footer-text">© 2026 S.V. Polytechnic College, Bhopal · Dept. of Computer Science</div>
      </footer>
    </div>
  );
}