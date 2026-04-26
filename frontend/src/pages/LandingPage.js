-e // ye Landing page hai - app ka main marketing page, bina login ke dikhta hai
import { Sparkles, CreditCard, Folder, Search, Share2, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "Sparkles", title: "AI Note Summaries", desc: "One click to get a structured summary and key points from any note, powered by Groq AI." },
  { icon: "CreditCard", title: "Smart Flashcards", desc: "Auto-generate question-answer pairs with SM-2 spaced repetition scheduling for better recall." },
  { icon: "Folder", title: "Folders & Tags", desc: "Color-coded folders with tags. Organize all your subjects perfectly and find notes instantly." },
  { icon: "Search", title: "Full-Text Search", desc: "Instant search across all your notes, including content, tags, and titles." },
  { icon: "Share2", title: "Share Notes", desc: "Generate a public link to share any note with classmates. No login needed to read." },
  { icon: "Lock", title: "Secure & Private", desc: "JWT authentication, bcrypt-hashed passwords. Your notes are only yours — always." },
];

const notesPreview = [
  { title: "Newton's 3 Laws of Motion", subject: "Physics", tags: "#mechanics", updated: "2h ago" },
  { title: "World War II – Key Events", subject: "History", tags: "#wars", updated: "5h ago" },
  { title: "Calculus: Limits", subject: "Maths", tags: "#calculus", updated: "Yesterday" },
  { title: "Cell Division – Mitosis", subject: "Biology", tags: "#cells", updated: "2d ago" },
  { title: "Organic Chemistry", subject: "Chemistry", tags: "#organic", updated: "3d ago" },
];

const flashcardsPreview = [
  { card: "What is Newton's 1st Law?", subject: "Physics", diff: "Easy", due: "Now" },
  { card: "Define mitosis phases", subject: "Biology", diff: "Medium", due: "Now" },
  { card: "Derivative of sin(x)?", subject: "Maths", diff: "Hard", due: "+1h" },
  { card: "Year WW2 ended?", subject: "History", diff: "Easy", due: "+2h" },
];

const testimonials = [
  { text: "The AI summaries save me hours every week. I paste in my lecture notes and get a clean bullet-point summary instantly.", name: "Aarav Rajput", role: "B.Tech, IIT Indore", avatar: "AR" },
  { text: "The flashcard system with spaced repetition is exactly what I needed for MBBS exams. Game changer for memory.", name: "Priya Sharma", role: "MBBS Year 2, Bhopal", avatar: "PS" },
  { text: "Clean interface, fast search, the folder system keeps all my subjects separated. Recommended it to my entire class.", name: "Rohan Kulkarni", role: "Diploma Engineering, RGPV", avatar: "RK" },
  { text: "I love being able to share notes with my study group. We each summarise one topic and share it.", name: "Neha Patel", role: "BSc Chemistry, Pune", avatar: "NP" },
  { text: "The study streak feature keeps me consistent. My weekly note count is up 3x compared to paper notebooks.", name: "Karan Mehta", role: "BBA Finance, Delhi", avatar: "KM" },
  { text: "Finally an app designed for students — not bloated like Notion, not too simple like Google Keep.", name: "Sneha Joshi", role: "Commerce, Nagpur University", avatar: "SJ" },
];

const faqs = [
  { q: "Is YourNotes completely free?", a: "Yes! YourNotes is free for all students. No credit card, no hidden fees, no limits. Just sign up and start studying." },
  { q: "How does the AI summarisation work?", a: "We use Groq AI (Llama 3.3) to process your note content. It returns a structured summary with key points, which we display alongside your original note instantly." },
  { q: "What is spaced repetition (SM-2)?", a: "SM-2 is a scientifically proven algorithm that schedules flashcard reviews based on how well you remember each card, so you study more efficiently over time." },
  { q: "Can I share notes with classmates?", a: "Yes. Any note can be shared via a unique public link in view-only mode. Recipients don't need an account to read shared notes." },
  { q: "Can I import existing notes?", a: "Yes! You can import .txt, .md, .pdf, .doc, and .docx files directly from the dashboard. The content becomes a new editable note instantly." },
  { q: "Is my data secure?", a: "All data is stored in MongoDB Atlas with JWT authentication. Passwords are hashed with bcrypt. We never share your data with third parties." },
  { q: "Does YourNotes work on mobile?", a: "Yes, YourNotes is fully responsive and works on all devices — mobile, tablet, and desktop." },
  { q: "Can I export my notes as PDF?", a: "Yes! Every note has a one-click PDF export button in the editor toolbar so you can save or print your notes anytime." },
];

const stack = [
  { name: "MongoDB", bg: "#13AA52", label: "M" },
  { name: "Express.js", bg: "#444", label: "Ex" },
  { name: "React.js", bg: "#149ECA", label: "Re" },
  { name: "Node.js", bg: "#539E43", label: "N" },
  { name: "Groq AI", bg: "#F55036", label: "AI" },
  { name: "JWT Auth", bg: "#4B5563", label: "🔑" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Auto-redirect logged-in users to home
  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("yn-visible"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".yn-anim").forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Inter', 'DM Sans', sans-serif", background: "#0a0a0a", minHeight: "100vh", overflowX: "hidden", color: "#fff" }}>
      <style>{`
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .yn-anim { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .yn-anim.yn-visible { opacity: 1; transform: translateY(0); }
        .yn-d1 { transition-delay: .1s !important }
        .yn-d2 { transition-delay: .2s !important }
        .yn-d3 { transition-delay: .3s !important }
        .yn-d4 { transition-delay: .4s !important }
        .yn-d5 { transition-delay: .5s !important }

        @keyframes ynHero { from { opacity:0; transform:translateY(36px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ynPulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes ynDiag { 0% { transform: rotate(45deg) translate(-100%, -100%); } 100% { transform: rotate(45deg) translate(100%, 100%); } }
        @keyframes ynSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .yn-btn-primary {
          background: #E55B2D; color: #fff; border: none;
          padding: 14px 30px; border-radius: 8px;
          font-family: 'Inter', 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all .2s; letter-spacing: -.1px;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .yn-btn-primary:hover { background: #c94d23; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(229,91,45,.35); }

        .yn-btn-ghost {
          background: transparent; color: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(255,255,255,0.15); padding: 13px 24px; border-radius: 8px;
          font-family: 'Inter', 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .yn-btn-ghost:hover { border-color: rgba(255,255,255,.4); color: #fff; }

        .yn-nav-link { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
        .yn-nav-link:hover { color: #fff; }

        .yn-feat-card {
          background: #111111; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 28px;
          transition: all .25s;
        }
        .yn-feat-card:hover { border-color: rgba(229,91,45,.4); transform: translateY(-3px); box-shadow: 0 20px 48px rgba(0,0,0,.4); }

        .yn-test-card {
          background: #111; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 28px;
          transition: border-color .2s;
        }
        .yn-test-card:hover { border-color: rgba(229,91,45,.3); }

        .yn-faq-item { border-bottom: 1px solid rgba(255,255,255,.07); }
        .yn-faq-q {
          padding: 20px 0; font-size: 15px; font-weight: 600; color: rgba(255,255,255,.85);
          cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          transition: color .2s; gap: 12px;
        }
        .yn-faq-q:hover { color: #E55B2D; }
        .yn-faq-a { font-size: 14px; color: rgba(255,255,255,.45); line-height: 1.8; padding-bottom: 20px; }

        .yn-tab-btn {
          padding: 16px 0 16px 20px;
          border-left: 2px solid rgba(255,255,255,.08);
          cursor: pointer; transition: all .2s;
        }
        .yn-tab-btn.active { border-left-color: #E55B2D; }
        .yn-tab-btn h4 { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.3); margin-bottom: 4px; }
        .yn-tab-btn.active h4 { color: #fff; }
        .yn-tab-btn p { font-size: 12px; color: rgba(255,255,255,.4); line-height: 1.6; margin: 0; }

        .yn-tag-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid rgba(229,91,45,.35); border-radius: 4px;
          padding: 3px 10px; font-size: 11px; font-weight: 700;
          color: #E55B2D; letter-spacing: .08em; text-transform: uppercase;
        }

        .yn-grid-line {
          position: absolute; pointer-events: none;
          background: rgba(255,255,255,0.03);
        }

        .yn-stat-box {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px; padding: 28px; flex: 1;
        }

        @media(max-width:900px){
          .yn-grid3 { grid-template-columns: 1fr 1fr !important; }
          .yn-2col { grid-template-columns: 1fr !important; }
          .yn-fbgrid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:640px){
          .yn-hero-h1 { font-size: 38px !important; letter-spacing: -1px !important; }
          .yn-grid3 { grid-template-columns: 1fr !important; }
          .yn-nav-links { display: none !important; }
          .yn-faq-grid { grid-template-columns: 1fr !important; }
          .yn-stats-row { flex-direction: column !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrollY > 20 ? "rgba(10,10,10,.96)" : "transparent",
        borderBottom: scrollY > 20 ? "1px solid rgba(255,255,255,.07)" : "1px solid transparent",
        padding: "0 5%", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: scrollY > 20 ? "blur(20px)" : "none",
        transition: "all .4s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-.4px" }}>
            Your<span style={{ color: "#E55B2D" }}>Notes</span>
          </span>
        </div>

        <div className="yn-nav-links" style={{ display: "flex", gap: 32 }}>
          {["Features", "How it works", "FAQ"].map((l, i) => (
            <a key={i} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="yn-nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="yn-btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign in</button>
          <button className="yn-btn-primary" style={{ padding: "9px 18px", fontSize: 13 }} onClick={() => navigate("/register")}>Get started free →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "100px 5% 90px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Diagonal grid lines like Sheryians */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: "1px", height: "200%",
              background: "rgba(255,255,255,0.03)",
              left: `${15 + i * 15}%`,
              top: "-50%",
              transform: "rotate(15deg)",
            }} />
          ))}
          {/* Orange glow */}
          <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(229,91,45,.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", animation: "ynHero .9s cubic-bezier(.16,1,.3,1) both", position: "relative" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", marginBottom: 30 }}>
            <span className="yn-tag-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E55B2D", animation: "ynPulse 2s infinite", display: "inline-block" }} />
              LEARN. BUILD. GET PLACED.
            </span>
          </div>

          <h1 className="yn-hero-h1" style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 64, fontWeight: 800, color: "#fff",
            lineHeight: 1.05, letterSpacing: "-2.5px", marginBottom: 24,
          }}>
            Become The Student<br />
            That <span style={{ color: "#E55B2D", borderBottom: "3px solid #E55B2D" }}>Exams</span> Can't Stop!
          </h1>

          <p style={{ fontSize: 17, color: "rgba(255,255,255,.55)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 40px", fontWeight: 400 }}>
            YourNotes is an AI-powered workspace built for students. Organize by subject, auto-generate flashcards, and let Gemini AI summarize your notes in one click.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="yn-btn-primary" style={{ fontSize: 15, padding: "15px 34px" }} onClick={() => navigate("/register")}>
              Start Journey →
            </button>
            <button className="yn-btn-ghost" style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>

          <p style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,.25)", letterSpacing: ".06em" }}>
            ✓ COMPLETELY FREE &nbsp;·&nbsp; ✓ NO LIMITS &nbsp;·&nbsp; ✓ NO CREDIT CARD
          </p>
        </div>

        {/* Stats bar */}
        <div style={{ maxWidth: 860, margin: "72px auto 0", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "28px 40px", display: "flex", gap: 0, alignItems: "stretch" }} className="yn-stats-row">
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid rgba(255,255,255,.07)", paddingRight: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#E55B2D" }}>▶</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#fff" }}>1M+</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", letterSpacing: ".04em" }}>Students Learning</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid rgba(255,255,255,.07)", padding: "0 32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#E55B2D" }}>★</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#fff" }}>662k</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", letterSpacing: ".04em" }}>Notes Created</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", paddingLeft: 32 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#E55B2D" }}>Free</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", letterSpacing: ".04em" }}>Always, Forever</p>
          </div>
        </div>
      </section>

      {/* ── STACK STRIP ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 5%", background: "#0d0d0d" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
          {stack.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.3)" }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: ".04em" }}>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── IMPACT SECTION ── */}
      <section id="features" style={{ background: "#0a0a0a", padding: "100px 5% 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <span className="yn-tag-badge">IMPACT</span>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: 14, lineHeight: 1.1 }}>
              How We Are Doing It Faster<br />And Better Than Others!
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.45)", maxWidth: 480, margin: "0 auto" }}>
              One clean workspace with AI tools, flashcards, and smart organization.
            </p>
          </div>

          {/* Feature tabs panel */}
          <div className="yn-fbgrid yn-anim" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0, background: "rgba(255,255,255,.03)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ padding: "32px 24px", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", gap: 4, background: "#0d0d0d" }}>
              {[
                { title: "AI Summaries", desc: "Paste lecture notes, get structured summaries in one click." },
                { title: "Smart Flashcards", desc: "Auto-generate Q&A with SM-2 spaced repetition." },
                { title: "Folders & Tags", desc: "Keep subjects organized with searchable tags." },
                { title: "Study Dashboard", desc: "Track notes, streaks, and flashcards due today." },
              ].map((tab, i) => (
                <div key={i} className={`yn-tab-btn ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                  <h4>{tab.title}</h4>
                  {activeTab === i && <p>{tab.desc}</p>}
                </div>
              ))}
            </div>

            <div style={{ padding: "28px" }}>
              <div style={{ background: "#111", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                  {["#FF5F57","#FFBD2E","#28C840"].map((c, i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                  ))}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginLeft: 8, fontFamily: "monospace" }}>YourNotes — Dashboard</span>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Recent Notes</span>
                    <button style={{ background: "#E55B2D", color: "#fff", border: "none", padding: "5px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>+ New Note</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, color: "rgba(255,255,255,.7)" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                        {["Title","Subject","Tags","Updated"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "rgba(255,255,255,.25)", fontWeight: 600, fontSize: 10, letterSpacing: ".06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {notesPreview.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                          <td style={{ padding: "10px 10px", fontWeight: 600, color: "#fff" }}>{r.title}</td>
                          <td style={{ padding: "10px 10px" }}>
                            <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(229,91,45,.15)", color: "#E55B2D", border: "1px solid rgba(229,91,45,.25)" }}>{r.subject}</span>
                          </td>
                          <td style={{ padding: "10px 10px", color: "rgba(255,255,255,.3)" }}>{r.tags}</td>
                          <td style={{ padding: "10px 10px", color: "rgba(255,255,255,.3)" }}>{r.updated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "100px 5%", background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <span className="yn-tag-badge">COURSES</span>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: 12 }}>
              Simplify Your Study Workflow.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.4)", maxWidth: 440, margin: "0 auto" }}>
              Focus on learning while YourNotes handles organisation and memory work.
            </p>
          </div>

          <div className="yn-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            <div className="yn-anim" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                { n: "01", title: "Create or import your notes", desc: "Write directly in the editor, or import .txt, .md, .pdf, .doc, .docx files instantly." },
                { n: "02", title: "Let AI summarize and create flashcards", desc: "One click on any note generates a clean summary or a full set of Q&A flashcards." },
                { n: "03", title: "Review with spaced repetition", desc: "The SM-2 algorithm schedules your flashcard reviews so you remember everything long-term." },
                { n: "04", title: "Stay organized with folders & tags", desc: "Keep every subject in its own folder with color-coded tags. Find any note in seconds." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div style={{
                    width: 44, height: 44, background: i === 0 ? "#E55B2D" : "rgba(229,91,45,.1)",
                    border: i !== 0 ? "1px solid rgba(229,91,45,.25)" : "none",
                    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14,
                    color: i === 0 ? "#fff" : "#E55B2D", flexShrink: 0,
                  }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{step.title}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="yn-anim yn-d2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Notes table */}
              <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "rgba(229,91,45,.08)", borderBottom: "1px solid rgba(229,91,45,.15)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#E55B2D" }}>Recent Notes</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", cursor: "pointer" }}>View all →</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#111" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {["Title","Subject","Updated"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "rgba(255,255,255,.25)", fontWeight: 600, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {notesPreview.slice(0,4).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#fff" }}>{r.title}</td>
                        <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(229,91,45,.12)", color: "#E55B2D" }}>{r.subject}</span></td>
                        <td style={{ padding: "10px 14px", color: "rgba(255,255,255,.3)" }}>{r.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Flashcards table */}
              <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "rgba(229,91,45,.08)", borderBottom: "1px solid rgba(229,91,45,.15)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#E55B2D" }}>Flashcards Due Today</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", cursor: "pointer" }}>Start review →</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#111" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {["Card","Difficulty","Due"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "rgba(255,255,255,.25)", fontWeight: 600, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {flashcardsPreview.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#fff" }}>{r.card}</td>
                        <td style={{ padding: "10px 14px" }}><span style={{
                          padding: "2px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                          background: r.diff === "Easy" ? "rgba(16,185,129,.12)" : r.diff === "Medium" ? "rgba(245,158,11,.12)" : "rgba(239,68,68,.12)",
                          color: r.diff === "Easy" ? "#10b981" : r.diff === "Medium" ? "#f59e0b" : "#ef4444",
                        }}>{r.diff}</span></td>
                        <td style={{ padding: "10px 14px", color: "rgba(255,255,255,.3)" }}>{r.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 FEATURES GRID ── */}
      <section style={{ padding: "88px 5%", background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-1.2px", marginBottom: 12 }}>
              All the tools you need to learn.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.4)", maxWidth: 380, margin: "0 auto" }}>Built for students from the ground up.</p>
          </div>
          <div className="yn-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className={`yn-feat-card yn-anim yn-d${Math.min(i+1, 5)}`}>
                <div style={{
                  width: 44, height: 44, background: "rgba(229,91,45,.1)",
                  border: "1px solid rgba(229,91,45,.2)",
                  borderRadius: 10, display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 16, color: "#E55B2D",
                }}>
                  {f.icon === "Sparkles" && <Sparkles size={20} />}
                  {f.icon === "CreditCard" && <CreditCard size={20} />}
                  {f.icon === "Folder" && <Folder size={20} />}
                  {f.icon === "Search" && <Search size={20} />}
                  {f.icon === "Share2" && <Share2 size={20} />}
                  {f.icon === "Lock" && <Lock size={20} />}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ background: "#111", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "88px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(229,91,45,.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="yn-anim" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <span className="yn-tag-badge">COMMUNITY</span>
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: 14, lineHeight: 1.1 }}>
            They Came. They Cooked.<br />They Got Placed.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.45)", maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Join students using YourNotes to ace their exams.<br />
            Completely free — no credit card, no limits.
          </p>
          <button className="yn-btn-primary" onClick={() => navigate("/register")} style={{ fontSize: 16, padding: "16px 40px" }}>
            Start Learning Free →
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "100px 5%", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <span className="yn-tag-badge">HEAR FROM OUR STUDENTS</span>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-1.2px", marginBottom: 12 }}>
              We Help Learners Become<br />Industry-Ready Developers.
            </h2>
          </div>
          <div className="yn-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`yn-test-card yn-anim yn-d${Math.min(i+1, 5)}`}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, s) => (
                    <span key={s} style={{ color: "#E55B2D", fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", background: "#E55B2D",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ padding: "100px 5%", background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <span className="yn-tag-badge">COMPARISON</span>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-1.2px" }}>
              What Sets YourNotes Apart<br />From Other Apps
            </h2>
          </div>
          <div className="yn-anim" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* YourNotes */}
            <div style={{ background: "#111", border: "1px solid rgba(229,91,45,.25)", borderRadius: 14, padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", fontSize: 15 }}>YourNotes</span>
              </div>
              {["Completely Free, No Quality Cuts", "AI-Powered, Skill-First Learning", "Spaced Repetition Built In", "Smart Flashcards & Summaries", "Industry-Relevant Curriculum"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#10b981", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,.75)" }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Others */}
            <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "rgba(255,255,255,.4)", fontSize: 15 }}>Others</span>
              </div>
              {["Expensive or Paywalled Features", "Theory-Centric Learning", "Manual Review Scheduling", "No AI Integration", "Outdated, Static Curriculum"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ef4444", flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,.3)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "100px 5%", background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", marginBottom: 20 }}>
              <span className="yn-tag-badge">FAQS</span>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-1.2px", marginBottom: 10 }}>
              Frequently Asked Questions<br />From Our Students
            </h2>
          </div>
          <div className="yn-faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 64px" }}>
            {faqs.map((f, i) => (
              <div key={i} className="yn-faq-item yn-anim">
                <div className="yn-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ paddingRight: 8 }}>{f.q}</span>
                  <span style={{
                    fontSize: 22, color: openFaq === i ? "#E55B2D" : "rgba(255,255,255,.25)",
                    flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none",
                    transition: "transform .2s, color .2s", fontWeight: 300, lineHeight: 1,
                  }}>+</span>
                </div>
                {openFaq === i && <p className="yn-faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,.06)", padding: "120px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", width: "1px", height: "200%",
              background: "rgba(255,255,255,0.025)",
              left: `${10 + i * 20}%`, top: "-50%",
              transform: "rotate(15deg)",
            }} />
          ))}
        </div>
        <div className="yn-anim" style={{ position: "relative" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: "-2px", marginBottom: 16, lineHeight: 1.05 }}>
            Transform Your Learning Journey<br />Into A Career Breakthrough<br />With <span style={{ color: "#E55B2D" }}>YourNotes</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.4)", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Completely free — no credit card, no limits, no catch. Join now.
          </p>
          <button className="yn-btn-primary" onClick={() => navigate("/register")} style={{ fontSize: 16, padding: "18px 44px" }}>
            Start Learning Free →
          </button>
        </div>
        {/* Big faded brand text like Sheryians */}
        <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(60px, 12vw, 140px)", color: "rgba(255,255,255,.025)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", letterSpacing: "-4px" }}>
          YourNotes
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080808", borderTop: "1px solid rgba(255,255,255,.06)", color: "rgba(255,255,255,.35)", padding: "56px 5% 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
                  Your<span style={{ color: "#E55B2D" }}>Notes</span>
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 220 }}>
                AI-powered notes for students.<br />
                Diploma Final Year Project<br />
                S.V. Polytechnic College, Bhopal · RGPV 2025–26
              </p>
            </div>
            {[
              { title: "PRODUCT", links: [
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#howitworks" },
                { label: "FAQ", href: "#faq" },
                { label: "Community Notes", href: "/community", internal: true },
              ]},
              { title: "ACCOUNT", links: [
                { label: "Sign In", href: "/login", internal: true },
                { label: "Register Free", href: "/register", internal: true },
                { label: "Dashboard", href: "/dashboard", internal: true },
              ]},
              { title: "CONTACT", links: [
                { label: "hello@yournotes.in", href: "mailto:hello@yournotes.in" },
                { label: "Made in Bhopal, India", href: "#" },
              ]},
            ].map((col, i) => (
              <div key={i}>
                <h5 style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 18 }}>{col.title}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a href={l.href || "#"} onClick={l.internal ? (e) => { e.preventDefault(); navigate(l.href); } : undefined}
                        style={{ fontSize: 13, color: "rgba(255,255,255,.35)", textDecoration: "none", transition: "color .2s", cursor: "pointer" }}
                        onMouseEnter={e => e.target.style.color = "#fff"}
                        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.35)"}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12, color: "rgba(255,255,255,.18)" }}>
            <span>© 2025 YourNotes. Free for all students, forever.</span>
            <span>Made with ♥ in Bhopal, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
