import { Sparkles, Bot, CreditCard, Folder, Search, Share2, Lock, ChevronDown, CheckCircle2, XCircle, ArrowRight, MessageSquare, Zap, Brain, Users, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Updated Features Array (Included Community)
const features = [
  { icon: Bot, title: "Ask AI Assistant", desc: "Instantly chat with your notes. Ask questions and get explanations like a personal tutor." },
  { icon: Users, title: "Student Community", desc: "Browse, discover, and learn from public notes shared by other students in the community." },
  { icon: Sparkles, title: "AI Note Summaries", desc: "One click to get a structured summary and key points from any note, powered by Groq AI." },
  { icon: CreditCard, title: "Smart Flashcards", desc: "Auto-generate QA pairs with spaced repetition scheduling for better recall." },
  { icon: Share2, title: "Public Sharing", desc: "Share your notes with a link. No login needed for others to read your insights." },
  { icon: Lock, title: "Secure & Private", desc: "JWT auth and hashed passwords. Your personal notes are only yours — always." },
];

const faqs = [
  { q: "What is the Community feature?", a: "The Community page is a hub where students can discover public notes shared by others. You can learn from their summaries and expand your knowledge base." },
  { q: "Is YourNotes completely free?", a: "Yes! YourNotes is free for all students. No credit card, no hidden fees, no limits." },
  { q: "How does the Ask AI feature work?", a: "Ask AI uses Groq Llama 3.3 to read your notes and answer questions about them, making complex topics easy to understand." },
  { q: "Can I choose not to share my notes?", a: "Absolutely. All notes are private by default. They only appear in the community if you explicitly choose to make them public." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("saas-visible"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".saas-anim").forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FFFFFF", minHeight: "100vh", overflowX: "hidden", color: "#0F172A" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .saas-anim { opacity: 0; transform: translateY(20px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .saas-anim.saas-visible { opacity: 1; transform: translateY(0); }
        
        .bg-grid { background-image: radial-gradient(#E2E8F0 1px, transparent 1px); background-size: 32px 32px; }
        
        .btn-minimal { background: #0F172A; color: #FFF; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-minimal:hover { background: #E55B2D; transform: translateY(-1px); }
        
        .btn-outline { background: transparent; color: #0F172A; border: 1px solid #E2E8F0; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-outline:hover { background: #F8FAFC; border-color: #CBD5E1; }

        .f-card { border: 1px solid #F1F5F9; border-radius: 12px; padding: 32px; transition: 0.3s; background: #FFF; }
        .f-card:hover { border-color: #E2E8F0; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }

        @media(max-width: 768px) { .mobile-stack { flex-direction: column !important; } .hero-title { font-size: 38px !important; } }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 200, background: scrollY > 10 ? "rgba(255, 255, 255, 0.9)" : "transparent", backdropFilter: "blur(10px)", borderBottom: scrollY > 10 ? "1px solid #F1F5F9" : "1px solid transparent", padding: "0 6%", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "0.3s" }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", display: 'flex', alignItems: 'center', gap: '4px' }}>
          YOUR<span style={{ color: "#E55B2D" }}>NOTES</span><span style={{ color: "#E2E8F0" }}>|</span><span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>STUDENT OS</span>
        </div>
        <div className="hide-mobile" style={{ display: "flex", gap: 32 }}>
          <a href="#features" style={{ color: "#64748B", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Features</a>
          <a href="#community" style={{ color: "#64748B", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Community</a>
          <a href="#faq" style={{ color: "#64748B", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>FAQ</a>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-outline hide-mobile" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-minimal" onClick={() => navigate("/register")}>Sign Up</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ paddingTop: 180, paddingBottom: 120, paddingLeft: "6%", paddingRight: "6%", position: "relative", textAlign: "center" }}>
        <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: -1, opacity: 0.5 }} />
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="saas-anim" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '24px' }}>
            <Sparkles size={14} color="#E55B2D" /> Built for Modern Students
          </div>
          <h1 className="hero-title" style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-2.5px", marginBottom: 28, color: '#0F172A' }}>
            Elevate your learning with <br /><span style={{ color: "#E55B2D" }}>Artificial Intelligence.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#64748B", lineHeight: 1.6, maxWidth: 580, margin: "0 auto 40px" }}>
            The minimalist workspace to capture notes, automate study cards, and collaborate with a global student community.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-minimal" onClick={() => navigate("/register")}>Get Started for Free</button>
            <button className="btn-outline" onClick={() => navigate("/login")}>View Community</button>
          </div>
        </div>
      </section>

      {/* COMMUNITY SPOTLIGHT */}
      <section id="community" style={{ padding: "100px 6%", background: "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="mobile-stack" style={{ display: "flex", gap: "60px", alignItems: "center" }}>
            <div style={{ flex: 1 }} className="saas-anim">
              <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20, letterSpacing: '-1px' }}>Learn together in the <span style={{ color: '#E55B2D' }}>Community</span>.</h2>
              <p style={{ color: "#64748B", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
                Education is better when shared. Our Community page allows you to explore public notes from students worldwide. Find summaries on complex topics, discover new study techniques, and get inspired by others.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                  <CheckCircle2 size={18} color="#E55B2D" /> Discover high-quality public notes
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                  <CheckCircle2 size={18} color="#E55B2D" /> Share your insights with the world
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                  <CheckCircle2 size={18} color="#E55B2D" /> Grow the global student knowledge base
                </li>
              </ul>
            </div>
            
            {/* Visual Minimal Mockup */}
            <div style={{ flex: 1, background: "#FFF", borderRadius: "16px", padding: "24px", border: "1px solid #E2E8F0", boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }} className="saas-anim">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '14px' }}>Global Feed</span>
                <Globe size={16} color="#94A3B8" />
              </div>
              <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', marginBottom: '12px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#E55B2D', marginBottom: '4px' }}>#COMPUTER_SCIENCE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Data Structures & Algorithms</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>By Nandkishor B. • 4 min ago</div>
              </div>
              <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #F1F5F9', opacity: 0.6 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#E55B2D', marginBottom: '4px' }}>#ELECTRICAL</div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Power Systems Basics</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>By Rahul S. • 1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" style={{ padding: "100px 6%", background: "#FFF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }} className="saas-anim">
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Everything you need to succeed.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            {features.map((f, i) => (
              <div key={i} className="f-card saas-anim">
                <div style={{ color: "#E55B2D", marginBottom: 20 }}><f.icon size={24} /></div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{ padding: "100px 6%", background: "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: '-1px' }}>Common Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} className="saas-anim" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "24px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{f.q}</span>
                <ChevronDown size={18} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "0.2s", color: "#94A3B8" }} />
              </div>
              {openFaq === i && <p style={{ paddingBottom: 24, color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#FFF", borderTop: "1px solid #F1F5F9", padding: "60px 6% 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>YOURNOTES.</div>
            <p style={{ fontSize: 13, color: "#94A3B8" }}>Built with purpose at S.V. Polytechnic College, Bhopal.</p>
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
            © 2026 YourNotes Team. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}