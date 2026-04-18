import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "✨", title: "AI Note Summaries", desc: "One click to get a structured summary and key points from any note, powered by Gemini AI." },
  { icon: "🃏", title: "Smart Flashcards", desc: "Auto-generate question-answer pairs with SM-2 spaced repetition scheduling for better recall." },
  { icon: "📁", title: "Folders & Tags", desc: "Color-coded folders with tags. Organize all your subjects perfectly and find notes instantly." },
  { icon: "🔍", title: "Full-Text Search", desc: "Instant search across all your notes, including content, tags, and titles." },
  { icon: "🔗", title: "Share Notes", desc: "Generate a public link to share any note with classmates. No login needed to read." },
  { icon: "🔒", title: "Secure & Private", desc: "JWT authentication, bcrypt-hashed passwords. Your notes are only yours — always." },
];

const notesPreview = [
  { title: "Newton's 3 Laws of Motion", subject: "Physics", tags: "#mechanics", updated: "2h ago", sc: "#dcfce7", tc: "#166534" },
  { title: "World War II – Key Events", subject: "History", tags: "#wars", updated: "5h ago", sc: "#fef9c3", tc: "#854d0e" },
  { title: "Calculus: Limits", subject: "Maths", tags: "#calculus", updated: "Yesterday", sc: "#dcfce7", tc: "#166534" },
  { title: "Cell Division – Mitosis", subject: "Biology", tags: "#cells", updated: "2d ago", sc: "#f0fdf4", tc: "#15803d" },
  { title: "Organic Chemistry", subject: "Chemistry", tags: "#organic", updated: "3d ago", sc: "#dcfce7", tc: "#166534" },
];

const flashcardsPreview = [
  { card: "What is Newton's 1st Law?", subject: "Physics", diff: "Easy", due: "Now", dc: "#dcfce7", dtc: "#166534" },
  { card: "Define mitosis phases", subject: "Biology", diff: "Medium", due: "Now", dc: "#fef9c3", dtc: "#854d0e" },
  { card: "Derivative of sin(x)?", subject: "Maths", diff: "Hard", due: "+1h", dc: "#fee2e2", dtc: "#991b1b" },
  { card: "Year WW2 ended?", subject: "History", diff: "Easy", due: "+2h", dc: "#dcfce7", dtc: "#166534" },
];

const testimonials = [
  { text: "The AI summaries save me hours every week. I paste in my lecture notes and get a clean bullet-point summary instantly.", name: "Aarav Rajput", role: "B.Tech, IIT Indore", avatar: "AR", color: "#10b981" },
  { text: "The flashcard system with spaced repetition is exactly what I needed for MBBS exams. Game changer for memory.", name: "Priya Sharma", role: "MBBS Year 2, Bhopal", avatar: "PS", color: "#059669" },
  { text: "Clean interface, fast search, the folder system keeps all my subjects separated. Recommended it to my entire class.", name: "Rohan Kulkarni", role: "Diploma Engineering, RGPV", avatar: "RK", color: "#34d399" },
  { text: "I love being able to share notes with my study group. We each summarise one topic and share it.", name: "Neha Patel", role: "BSc Chemistry, Pune", avatar: "NP", color: "#10b981" },
  { text: "The study streak feature keeps me consistent. My weekly note count is up 3x compared to paper notebooks.", name: "Karan Mehta", role: "BBA Finance, Delhi", avatar: "KM", color: "#059669" },
  { text: "Finally an app designed for students — not bloated like Notion, not too simple like Google Keep.", name: "Sneha Joshi", role: "Commerce, Nagpur University", avatar: "SJ", color: "#34d399" },
];

const faqs = [
  { q: "Is YourNotes completely free?", a: "Yes! YourNotes is free for all students. No credit card, no hidden fees, no limits. Just sign up and start studying." },
  { q: "How does the AI summarisation work?", a: "We send your note content to Gemini AI. It returns a structured summary with key points, which we display alongside your original note instantly." },
  { q: "What is spaced repetition (SM-2)?", a: "SM-2 is a scientifically proven algorithm that schedules flashcard reviews based on how well you remember each card, so you study more efficiently over time." },
  { q: "Can I share notes with classmates?", a: "Yes. Any note can be shared via a unique public link in view-only mode. Recipients don't need an account to read shared notes." },
  { q: "Can I import existing notes?", a: "Yes! You can import .txt, .md, .pdf, .doc, and .docx files directly from the dashboard. The content becomes a new editable note instantly." },
  { q: "Is my data secure?", a: "All data is stored in MongoDB Atlas with JWT authentication. Passwords are hashed with bcrypt. We never share your data with third parties." },
  { q: "Does YourNotes work on mobile?", a: "Yes, YourNotes is fully responsive and works on all devices — mobile, tablet, and desktop." },
  { q: "Can I export my notes as PDF?", a: "Yes! Every note has a one-click PDF export button in the editor toolbar so you can save or print your notes anytime." },
];

const stack = [
  { name: "MongoDB", icon: "🍃" },
  { name: "Express.js", icon: "⚡" },
  { name: "React.js", icon: "⚛️" },
  { name: "Node.js", icon: "🟢" },
  { name: "Gemini AI", icon: "✨" },
  { name: "JWT Auth", icon: "🔐" },
];

export default function LandingPage() {
  const navigate = useNavigate();
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
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", minHeight: "100vh", overflowX: "hidden", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .yn-anim { opacity: 0; transform: translateY(24px); transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1); }
        .yn-anim.yn-visible { opacity: 1; transform: translateY(0); }
        .yn-d1 { transition-delay: .1s !important }
        .yn-d2 { transition-delay: .2s !important }
        .yn-d3 { transition-delay: .3s !important }
        .yn-d4 { transition-delay: .4s !important }
        .yn-d5 { transition-delay: .5s !important }

        @keyframes ynHero { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ynFloat { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
        @keyframes ynPulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }

        .yn-btn-primary {
          background: #10b981; color: #fff; border: none;
          padding: 13px 28px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all .2s; letter-spacing: -.2px;
        }
        .yn-btn-primary:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(16,185,129,.3); }

        .yn-btn-outline {
          background: transparent; color: #374151;
          border: 1.5px solid #d1d5db; padding: 12px 24px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .yn-btn-outline:hover { border-color: #10b981; color: #10b981; }

        .yn-btn-white {
          background: #fff; color: #10b981; border: none;
          padding: 13px 32px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all .2s;
        }
        .yn-btn-white:hover { background: #f0fdf4; transform: translateY(-2px); }

        .yn-nav-link { color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
        .yn-nav-link:hover { color: #10b981; }

        .yn-feat-card {
          background: #fff; border: 1.5px solid #e5e7eb;
          border-radius: 14px; padding: 24px;
          transition: all .25s;
        }
        .yn-feat-card:hover { box-shadow: 0 16px 48px rgba(16,185,129,.1); border-color: #6ee7b7; transform: translateY(-3px); }

        .yn-test-card {
          background: #fff; border: 1.5px solid #f0fdf4;
          border-radius: 14px; padding: 24px;
          transition: box-shadow .2s;
        }
        .yn-test-card:hover { box-shadow: 0 8px 32px rgba(16,185,129,.08); }

        .yn-faq-item { border-bottom: 1px solid #f0fdf4; }
        .yn-faq-q {
          padding: 18px 0; font-size: 14px; font-weight: 600; color: #111827;
          cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          transition: color .2s; gap: 12px;
        }
        .yn-faq-q:hover { color: #10b981; }
        .yn-faq-a { font-size: 13px; color: #6b7280; line-height: 1.8; padding-bottom: 18px; }

        .yn-trow:hover td { background: #f0fdf4; }

        .yn-step-num {
          width: 40px; height: 40px; background: #10b981; color: #fff;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }

        .yn-tab-btn {
          padding: 14px 0 14px 18px;
          border-left: 2px solid rgba(255,255,255,.15);
          cursor: pointer; transition: all .2s;
        }
        .yn-tab-btn.active { border-left-color: #6ee7b7; }
        .yn-tab-btn h4 { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.45); margin-bottom: 3px; }
        .yn-tab-btn.active h4 { color: #fff; }
        .yn-tab-btn p { font-size: 12px; color: rgba(255,255,255,.5); line-height: 1.5; margin: 0; }

        @media(max-width:900px){
          .yn-grid3 { grid-template-columns: 1fr 1fr !important; }
          .yn-2col { grid-template-columns: 1fr !important; }
          .yn-fbgrid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:640px){
          .yn-hero-h1 { font-size: 34px !important; letter-spacing: -1px !important; }
          .yn-grid3 { grid-template-columns: 1fr !important; }
          .yn-nav-links { display: none !important; }
          .yn-faq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrollY > 20 ? "rgba(255,255,255,.97)" : "#fff",
        borderBottom: "1px solid #f0fdf4",
        padding: "0 5%", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: scrollY > 20 ? "0 1px 24px rgba(16,185,129,.08)" : "none",
        transition: "all .3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16,185,129,.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#111827", letterSpacing: "-.4px" }}>
            Your<span style={{ color: "#10b981" }}>Notes</span>
          </span>
        </div>

        <div className="yn-nav-links" style={{ display: "flex", gap: 28 }}>
          {["Features", "How it works", "FAQ"].map((l, i) => (
            <a key={i} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="yn-nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="yn-btn-outline" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign in</button>
          <button className="yn-btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/register")}>Get started free →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "96px 5% 80px", textAlign: "center", background: "#fff", position: "relative", overflow: "hidden" }}>
        {/* Decorative background blobs */}
        <div style={{ position: "absolute", top: -80, left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(16,185,129,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: "8%", width: 320, height: 320, background: "radial-gradient(circle, rgba(52,211,153,.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", animation: "ynHero .85s cubic-bezier(.16,1,.3,1) both", position: "relative" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 99, padding: "5px 16px", marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "ynPulse 2s infinite", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46", letterSpacing: ".04em" }}>
              Free for all students · No credit card required
            </span>
          </div>

          <h1 className="yn-hero-h1" style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 56, fontWeight: 800, color: "#111827",
            lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 22,
          }}>
            Study smarter.<br />
            <span style={{ color: "#10b981" }}>Remember more.</span>
          </h1>

          <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 38px", fontWeight: 400 }}>
            YourNotes is an AI-powered workspace built for students. Organize by subject, auto-generate flashcards, and let Gemini AI summarize your notes in one click.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="yn-btn-primary" style={{ fontSize: 15, padding: "15px 34px" }} onClick={() => navigate("/register")}>
              Start for free — no card needed
            </button>
            <button className="yn-btn-outline" style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => navigate("/login")}>
              Sign in →
            </button>
          </div>

          <p style={{ marginTop: 22, fontSize: 12, color: "#9ca3af", letterSpacing: ".04em" }}>
            ✓ Completely free &nbsp;·&nbsp; ✓ No limits &nbsp;·&nbsp; ✓ No credit card
          </p>
        </div>
      </section>

      {/* ── STACK STRIP ── */}
      <section style={{ borderTop: "1px solid #f0fdf4", borderBottom: "1px solid #f0fdf4", padding: "20px 5%", background: "#f9fafb" }}>
        <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em" }}>
          Built with
        </p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          {stack.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, color: "#6b7280" }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE BAND (green gradient) ── */}
      <section id="features" style={{ background: "linear-gradient(150deg, #064e3b 0%, #065f46 40%, #047857 100%)", padding: "88px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 12, lineHeight: 1.1 }}>
              Everything you need to study better.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", maxWidth: 460, margin: "0 auto" }}>
              One clean workspace with AI tools, flashcards, and smart organization — all built for students.
            </p>
          </div>

          <div className="yn-fbgrid yn-anim" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0, background: "rgba(255,255,255,.06)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)" }}>
            {/* Tabs */}
            <div style={{ padding: "28px 20px", borderRight: "1px solid rgba(255,255,255,.08)", display: "flex", flexDirection: "column", gap: 4 }}>
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

            {/* Preview */}
            <div style={{ padding: "24px" }}>
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 28px 64px rgba(0,0,0,.3)" }}>
                <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                  {["#FF5F57","#FFBD2E","#28C840"].map((c, i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                  ))}
                  <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8, fontFamily: "monospace" }}>YourNotes — Notes</span>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Recent Notes</span>
                    <button style={{ background: "#10b981", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ New Note</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, color: "#374151" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f0fdf4" }}>
                        {["Title","Subject","Tags","Updated"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 10 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {notesPreview.map((r, i) => (
                        <tr key={i} className="yn-trow">
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "#111827" }}>{r.title}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: r.sc, color: r.tc }}>{r.subject}</span>
                          </td>
                          <td style={{ padding: "8px 10px", color: "#9ca3af" }}>{r.tags}</td>
                          <td style={{ padding: "8px 10px", color: "#9ca3af" }}>{r.updated}</td>
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
      <section id="how-it-works" style={{ padding: "96px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#111827", letterSpacing: "-1px", marginBottom: 10 }}>
              Simplify your study workflow.
            </h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 440, margin: "0 auto" }}>
              Focus on learning while YourNotes handles organisation and memory work.
            </p>
          </div>

          <div className="yn-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
            {/* Steps */}
            <div className="yn-anim" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {[
                { n: "01", icon: "📝", title: "Create or import your notes", desc: "Write directly in the editor, or import .txt, .md, .pdf, .doc, .docx files instantly." },
                { n: "02", icon: "✨", title: "Let AI summarize and create flashcards", desc: "One click on any note generates a clean summary or a full set of Q&A flashcards." },
                { n: "03", icon: "🃏", title: "Review with spaced repetition", desc: "The SM-2 algorithm schedules your flashcard reviews so you remember everything long-term." },
                { n: "04", icon: "📁", title: "Stay organized with folders & tags", desc: "Keep every subject in its own folder with color-coded tags. Find any note in seconds." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div className="yn-step-num">{step.n}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 5 }}>
                      {step.icon} {step.title}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview tables */}
            <div className="yn-anim yn-d2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ border: "1.5px solid #d1fae5", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 20px rgba(16,185,129,.06)" }}>
                <div style={{ background: "#f0fdf4", borderBottom: "1px solid #d1fae5", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>📝 Recent Notes</span>
                  <span style={{ fontSize: 11, color: "#10b981", cursor: "pointer", fontWeight: 600 }}>View all →</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ borderBottom: "1px solid #f0fdf4", background: "#f9fafb" }}>
                    {["Title","Subject","Updated"].map(h => (
                      <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {notesPreview.slice(0,4).map((r, i) => (
                      <tr key={i} className="yn-trow" style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111827", fontSize: 12 }}>{r.title}</td>
                        <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: r.sc, color: r.tc }}>{r.subject}</span></td>
                        <td style={{ padding: "9px 12px", color: "#9ca3af" }}>{r.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ border: "1.5px solid #d1fae5", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(16,185,129,.05)" }}>
                <div style={{ background: "#f0fdf4", borderBottom: "1px solid #d1fae5", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>🃏 Flashcards Due Today</span>
                  <span style={{ fontSize: 11, color: "#10b981", cursor: "pointer", fontWeight: 600 }}>Start review →</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ borderBottom: "1px solid #f0fdf4", background: "#f9fafb" }}>
                    {["Card","Difficulty","Due"].map(h => (
                      <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {flashcardsPreview.map((r, i) => (
                      <tr key={i} className="yn-trow" style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111827" }}>{r.card}</td>
                        <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: r.dc, color: r.dtc }}>{r.diff}</span></td>
                        <td style={{ padding: "9px 12px", color: "#9ca3af" }}>{r.due}</td>
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
      <section style={{ padding: "80px 5%", background: "#f9fafb", borderTop: "1px solid #f0fdf4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#111827", letterSpacing: "-.8px", marginBottom: 10 }}>
              All the tools you need to learn.
            </h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 380, margin: "0 auto" }}>Built for students from the ground up.</p>
          </div>
          <div className="yn-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className={`yn-feat-card yn-anim yn-d${Math.min(i, 5)}`}>
                <div style={{
                  width: 42, height: 42, background: "#f0fdf4", borderRadius: 11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14, fontSize: 18, border: "1px solid #d1fae5",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ background: "linear-gradient(140deg, #064e3b, #10b981, #059669)", padding: "80px 5%", textAlign: "center" }}>
        <div className="yn-anim">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>
            Ready to study smarter?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.75)", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Join students using YourNotes to ace their exams.<br />
            Completely free — no credit card, no limits, no catch.
          </p>
          <button className="yn-btn-white" onClick={() => navigate("/register")} style={{ fontSize: 15, padding: "15px 36px" }}>
            Create your free account →
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "96px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, color: "#111827", letterSpacing: "-.8px", marginBottom: 10 }}>
              Loved by students.
            </h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 380, margin: "0 auto" }}>
              Here's what students from across India say about YourNotes.
            </p>
          </div>
          <div className="yn-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`yn-test-card yn-anim yn-d${Math.min(i, 5)}`}>
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {[...Array(5)].map((_, s) => (
                    <span key={s} style={{ color: "#10b981", fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, marginBottom: 18 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "88px 5%", background: "#f9fafb", borderTop: "1px solid #f0fdf4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="yn-anim" style={{ marginBottom: 52 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, color: "#111827", letterSpacing: "-.8px", marginBottom: 8 }}>
              Frequently asked questions
            </h2>
            <p style={{ fontSize: 15, color: "#6b7280" }}>Can't find what you're looking for? Reach out and we'll help.</p>
          </div>
          <div className="yn-faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 56px" }}>
            {faqs.map((f, i) => (
              <div key={i} className="yn-faq-item yn-anim">
                <div className="yn-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ paddingRight: 8 }}>{f.q}</span>
                  <span style={{
                    fontSize: 20, color: openFaq === i ? "#10b981" : "#9ca3af",
                    flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none",
                    transition: "transform .2s, color .2s", fontWeight: 400,
                  }}>+</span>
                </div>
                {openFaq === i && <p className="yn-faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0a2e1f", color: "rgba(255,255,255,.5)", padding: "52px 5% 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
                  </svg>
                </div>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
                  Your<span style={{ color: "#10b981" }}>Notes</span>
                </span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.8, maxWidth: 220 }}>
                AI-powered notes for students.<br />
                Diploma Final Year Project<br />
                S.V. Polytechnic College, Bhopal · RGPV 2024–25
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "How it works", "FAQ"] },
              { title: "Account", links: ["Sign in", "Register", "Forgot password"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map((col, i) => (
              <div key={i}>
                <h5 style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>{col.title}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,.4)", textDecoration: "none", transition: "color .2s" }}
                        onMouseEnter={e => e.target.style.color = "#10b981"}
                        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.4)"}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12, color: "rgba(255,255,255,.2)" }}>
            <span>© 2025 YourNotes. Free for all students, forever.</span>
            <span>Made with ♥ in Bhopal, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}