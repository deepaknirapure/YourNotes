import { Sparkles, Bot, CreditCard, Folder, Search, Share2, Lock, ChevronDown, CheckCircle2, XCircle, ArrowRight, MessageSquare, Zap, Brain } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Updated Features Array
const features = [
  { icon: Sparkles, title: "AI Note Summaries", desc: "One click to get a structured summary and key points from any note, powered by Groq AI." },
  { icon: Bot, title: "Ask AI Assistant", desc: "Instantly chat with your notes. Ask questions, clarify doubts, and get explanations like a personal tutor." },
  { icon: CreditCard, title: "Smart Flashcards", desc: "Auto-generate question-answer pairs with SM-2 spaced repetition scheduling for better recall." },
  { icon: Folder, title: "Folders & Tags", desc: "Color-coded folders with tags. Organize all your subjects perfectly and find notes instantly." },
  { icon: Search, title: "Full-Text Search", desc: "Instant search across all your notes, including content, tags, and titles." },
  { icon: Share2, title: "Share Notes", desc: "Generate a public link to share any note with classmates. No login needed to read." },
  { icon: Lock, title: "Secure & Private", desc: "JWT authentication, bcrypt-hashed passwords. Your notes are only yours — always." },
];

const faqs = [
  { q: "Is YourNotes completely free?", a: "Yes! YourNotes is free for all students. No credit card, no hidden fees, no limits. Just sign up and start studying." },
  { q: "How does the Ask AI feature work?", a: "Ask AI is your personal study assistant. It uses Groq AI to read your specific notes and answer any questions you have about them, making complex topics easy to understand." },
  { q: "What is spaced repetition (SM-2)?", a: "SM-2 is a scientifically proven algorithm that schedules flashcard reviews based on how well you remember each card, so you study more efficiently over time." },
  { q: "Can I share notes with classmates?", a: "Yes. Any note can be shared via a unique public link in view-only mode. Recipients don't need an account to read shared notes." },
  { q: "Is my data secure?", a: "All data is stored in MongoDB Atlas with JWT authentication. Passwords are hashed with bcrypt. We never share your data with third parties." },
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
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAFAFA", minHeight: "100vh", overflowX: "hidden", color: "#0F172A" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .saas-anim { opacity: 0; transform: translateY(24px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .saas-anim.saas-visible { opacity: 1; transform: translateY(0); }
        .bg-dots { background-image: radial-gradient(#CBD5E1 1px, transparent 1px); background-size: 24px 24px; }
        .btn-primary { background: #0F172A; color: #FFF; border: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary:hover { background: #E55B2D; transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(229, 91, 45, 0.4); }
        .btn-secondary { background: #FFF; color: #0F172A; border: 1px solid #E2E8F0; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .feature-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; transition: 0.2s; }
        .feature-card:hover { border-color: #CBD5E1; transform: translateY(-4px); }
        @media(max-width: 768px) { .mobile-stack { flex-direction: column !important; } .hero-title { font-size: 40px !important; } }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 200, background: scrollY > 10 ? "rgba(255, 255, 255, 0.85)" : "transparent", backdropFilter: scrollY > 10 ? "blur(12px)" : "none", borderBottom: scrollY > 10 ? "1px solid #E2E8F0" : "1px solid transparent", padding: "0 5%", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s" }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>YOUR<span style={{ color: "#E55B2D" }}>NOTES</span ><span style={{color:"#5bb447"}}>.</span></div>
        <div className="hide-mobile" style={{ display: "flex", gap: 32 }}>
          <a href="#features" style={{ color: "#64748B", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Features</a>
          <a href="#how-it-works" style={{ color: "#64748B", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>How it works</a>
          <a href="#faq" style={{ color: "#64748B", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>FAQ</a>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary hide-mobile" onClick={() => navigate("/login")}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ paddingTop: 160, paddingBottom: 100, paddingLeft: "5%", paddingRight: "5%", position: "relative", textAlign: "center" }}>
        <div className="bg-dots" style={{ position: "absolute", inset: 0, zIndex: -1, opacity: 0.6 }} />
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <h1 className="hero-title" style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24 }}>Your Notes,<br /><span style={{ color: "#E55B2D" }}>Supercharged by AI.</span></h1>
          <p style={{ fontSize: 18, color: "#64748B", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 40px", fontWeight: 500 }}>The all-in-one workspace where you can write notes, generate flashcards, and chat with an AI assistant to clear your doubts instantly.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/register")}>Start Learning Free <ArrowRight size={18} /></button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>View Demo</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (Ask AI Spotlight) */}
      <section id="how-it-works" style={{ padding: "100px 5%", background: "#FFF", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="saas-anim" style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>Simplify Your Workflow</h2>
            <p style={{ color: "#64748B", fontSize: 18 }}>From messy lectures to organized intelligence in 3 steps.</p>
          </div>

          <div className="mobile-stack" style={{ display: "flex", gap: "40px", alignItems: "center" }}>
            <div style={{ flex: 1 }} className="saas-anim">
              <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#F1F5F9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#0F172A" }}>1</div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Write or Import</h3>
                    <p style={{ color: "#64748B" }}>Create rich-text notes or paste your lecture content into our clean editor.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#FFF5F2", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#E55B2D" }}>2</div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Ask AI & Summarize</h3>
                    <p style={{ color: "#64748B" }}>Use <b>Ask AI</b> to explain tough concepts or get a structured summary in seconds.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", background: "#F1F5F9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#0F172A" }}>3</div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Master with Flashcards</h3>
                    <p style={{ color: "#64748B" }}>Let AI generate flashcards from your notes for active recall and better exam prep.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ASK AI FEATURE SPOTLIGHT */}
            <div style={{ flex: 1, background: "#F8FAFC", borderRadius: "24px", padding: "32px", border: "1px solid #E2E8F0" }} className="saas-anim">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "32px", background: "#0F172A", borderRadius: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={18} color="#FFF" />
                </div>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>Your AI Assistant</span>
              </div>
              
              <div style={{ background: "#FFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0", marginBottom: "16px", fontSize: "14px", color: "#64748B", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                "Explain the laws of Thermodynamics in simple terms from my Physics note."
              </div>
              <div style={{ background: "#FFF5F2", padding: "16px", borderRadius: "12px", border: "1px solid #FFE4DB", fontSize: "14px", color: "#0F172A", lineHeight: "1.6" }}>
                <Zap size={14} color="#E55B2D" style={{ marginBottom: "8px" }} />
                Based on your notes: Thermodynamics is like a game where Energy is the score. The 1st Law says you can't win (energy is conserved), and the 2nd says you can't even break even...
              </div>
              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" }}>Powered by Groq Llama 3.3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" style={{ padding: "100px 5%", background: "#FAFAFA", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card saas-anim">
                <div style={{ width: 48, height: 48, background: "#FFF5F2", border: "1px solid #FFE4DB", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#E55B2D", marginBottom: 20 }}>
                  <f.icon size={22} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{ padding: "100px 5%", background: "#FFF", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 48 }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} className="saas-anim" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "24px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{f.q}</span>
                <ChevronDown size={20} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "0.2s" }} />
              </div>
              {openFaq === i && <p style={{ paddingBottom: 24, color: "#64748B", fontSize: 15, lineHeight: 1.6 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#FFF", borderTop: "1px solid #E2E8F0", padding: "60px 5% 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>YourNotes.</div>
            <p style={{ fontSize: 14, color: "#64748B", maxWidth: 280 }}>Diploma Final Year Project<br />S.V. Polytechnic College, Bhopal</p>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#94A3B8" }}>© 2026 YourNotes Team. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}