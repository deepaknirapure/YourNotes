import { Sparkles, Bot, CreditCard, Folder, Search, Share2, Lock, ChevronDown, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Updated Features Array
const features = [
  { icon: Sparkles, title: "AI Note Summaries", desc: "One click to get a structured summary and key points from any note, powered by Groq AI." },
  { icon: Bot, title: "AI Assistant", desc: "Get instant help with your studies using our AI-powered assistant." },
  { icon: CreditCard, title: "Smart Flashcards", desc: "Auto-generate question-answer pairs with SM-2 spaced repetition scheduling for better recall." },
  { icon: Folder, title: "Folders & Tags", desc: "Color-coded folders with tags. Organize all your subjects perfectly and find notes instantly." },
  { icon: Search, title: "Full-Text Search", desc: "Instant search across all your notes, including content, tags, and titles." },
  { icon: Share2, title: "Share Notes", desc: "Generate a public link to share any note with classmates. No login needed to read." },
  { icon: Lock, title: "Secure & Private", desc: "JWT authentication, bcrypt-hashed passwords. Your notes are only yours — always." },
];

const faqs = [
  { q: "Is YourNotes completely free?", a: "Yes! YourNotes is free for all students. No credit card, no hidden fees, no limits. Just sign up and start studying." },
  { q: "How does the AI summarisation work?", a: "We use Groq AI (Llama 3.3) to process your note content. It returns a structured summary with key points, which we display alongside your original note instantly." },
  { q: "What is spaced repetition (SM-2)?", a: "SM-2 is a scientifically proven algorithm that schedules flashcard reviews based on how well you remember each card, so you study more efficiently over time." },
  { q: "Can I share notes with classmates?", a: "Yes. Any note can be shared via a unique public link in view-only mode. Recipients don't need an account to read shared notes." },
  { q: "Is my data secure?", a: "All data is stored in MongoDB Atlas with JWT authentication. Passwords are hashed with bcrypt. We never share your data with third parties." },
];

const stack = [
  { name: "MongoDB", label: "M" }, { name: "Express.js", label: "E" },
  { name: "React.js", label: "R" }, { name: "Node.js", label: "N" },
  { name: "Groq AI", label: "AI" }, { name: "JWT Auth", label: "🔒" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
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
        
        .bg-dots {
          background-image: radial-gradient(#CBD5E1 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .btn-primary {
          background: #0F172A; color: #FFF; border: none; padding: 14px 28px;
          border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer;
          transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: #E55B2D; transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(229, 91, 45, 0.4); }
        
        .btn-secondary {
          background: #FFF; color: #0F172A; border: 1px solid #E2E8F0; padding: 14px 28px;
          border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .btn-secondary:hover { background: #F8FAFC; border-color: #CBD5E1; color: #0F172A; }

        .feature-card {
          background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px;
          transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .feature-card:hover { border-color: #CBD5E1; transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.05); }

        .tab-btn {
          padding: 20px 24px; border-left: 3px solid transparent; cursor: pointer; transition: 0.2s; background: #FFF; width: 100%; text-align: left;
        }
        .tab-btn.active { border-left-color: #E55B2D; background: #F8FAFC; }
        .tab-btn h4 { font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .tab-btn p { font-size: 13px; color: #64748B; line-height: 1.5; margin: 0; }

        @media(max-width: 768px) {
          .mobile-stack { flex-direction: column !important; }
          .hide-mobile { display: none !important; }
          .hero-title { font-size: 40px !important; letter-spacing: -1px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 200,
        background: scrollY > 10 ? "rgba(255, 255, 255, 0.85)" : "transparent",
        backdropFilter: scrollY > 10 ? "blur(12px)" : "none",
        borderBottom: scrollY > 10 ? "1px solid #E2E8F0" : "1px solid transparent",
        padding: "0 5%", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s"
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
          Your<span style={{ color: "#E55B2D" }}>Notes</span>.
        </div>
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
          <h1 className="hero-title" style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24 }}>
            Master your subjects.<br />
            <span style={{ color: "#E55B2D" }}>Ace your exams.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#64748B", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 40px", fontWeight: 500 }}>
            YourNotes is the intelligent workspace that automatically summarizes lectures, generates flashcards, and organizes your study life.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Start Learning for Free <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => navigate("/login")}>Sign In</button>
          </div>
        </div>
      </section>

      {/* REAL STATS SECTION */}
      <section className="saas-anim" style={{ padding: "0 5% 100px" }}>
        <div className="mobile-stack" style={{ maxWidth: 900, margin: "0 auto", background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: "32px", display: "flex", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#0F172A" }}>AI</div>
            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Powered Summaries</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#0F172A" }}>∞</div>
            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Unlimited Notes</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#E55B2D" }}>Free</div>
            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>For Students</div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" style={{ padding: "100px 5%", background: "#FFF", borderTop: "1px solid #E2E8F0" }}>
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
      <section id="faq" style={{ padding: "100px 5%", background: "#FAFAFA", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 48 }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} className="saas-anim" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "24px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{f.q}</span>
                <ChevronDown size={20} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "0.2s" }} />
              </div>
              {openFaq === i && <p style={{ paddingBottom: 24, color: "#64748B", lineHeight: 1.6 }}>{f.a}</p>}
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
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#94A3B8" }}>
            © 2026 Nandkishor Barkhade. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}