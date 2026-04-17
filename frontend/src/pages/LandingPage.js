import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── YourNotes ke actual features ────────────────────────────────────────────
const features = [
  { icon: "✨", title: "AI Note Summaries", desc: "One click to get a structured summary and key points from any note, powered by Gemini AI." },
  { icon: "🃏", title: "Smart Flashcards", desc: "Auto-generate question-answer pairs with SM-2 spaced repetition scheduling for better recall." },
  { icon: "📁", title: "Folders & Tags", desc: "Color-coded folders with tags. Organize all your subjects perfectly and find notes instantly." },
  { icon: "🔍", title: "Full-Text Search", desc: "Instant search across all your notes, including content, tags, and titles." },
  { icon: "🔗", title: "Share Notes", desc: "Generate a public link to share any note with classmates. No login needed to read." },
  { icon: "🔒", title: "Secure & Private", desc: "JWT authentication, bcrypt-hashed passwords. Your notes are only yours — always." },
];

// ── Feature band tabs — YourNotes ke actual features ───────────────────────
const featureTabs = [
  { title: "AI Summaries", desc: "Paste your lecture notes and get a clean, structured summary with key points in one click." },
  { title: "Smart Flashcards", desc: "Auto-generate Q&A flashcards from your notes using SM-2 spaced repetition algorithm." },
  { title: "Folders & Tags", desc: "Keep all subjects organized in named folders with searchable tags." },
  { title: "Study Dashboard", desc: "Track weekly activity, starred notes, flashcard due count, and your study streak." },
];

// ── Notes preview data ──────────────────────────────────────────────────────
const notesPreview = [
  { title: "Newton's 3 Laws of Motion", subject: "Physics", tags: "#mechanics", updated: "2h ago", sc: "#dbeafe", tc: "#1e40af" },
  { title: "World War II – Key Events", subject: "History", tags: "#wars", updated: "5h ago", sc: "#fef3c7", tc: "#92400e" },
  { title: "Calculus: Limits", subject: "Maths", tags: "#calculus", updated: "Yesterday", sc: "#ede9fe", tc: "#5b21b6" },
  { title: "Cell Division – Mitosis", subject: "Biology", tags: "#cells", updated: "2d ago", sc: "#d1fae5", tc: "#065f46" },
  { title: "Organic Chemistry", subject: "Chemistry", tags: "#organic", updated: "3d ago", sc: "#fee2e2", tc: "#991b1b" },
];

const flashcardsPreview = [
  { card: "What is Newton's 1st Law?", subject: "Physics", diff: "Easy", due: "Now", dc: "#d1fae5", dtc: "#065f46" },
  { card: "Define mitosis phases", subject: "Biology", diff: "Medium", due: "Now", dc: "#fef3c7", dtc: "#92400e" },
  { card: "Derivative of sin(x)?", subject: "Maths", diff: "Hard", due: "+1h", dc: "#fee2e2", dtc: "#991b1b" },
  { card: "Year WW2 ended?", subject: "History", diff: "Easy", due: "+2h", dc: "#d1fae5", dtc: "#065f46" },
];

// ── Testimonials — Indian students ─────────────────────────────────────────
const testimonials = [
  { text: "The AI summaries save me hours every week. I paste in my lecture notes and get a clean bullet-point summary instantly. My grades have improved a lot.", name: "Aarav Rajput", role: "B.Tech, IIT Indore", avatar: "AR", color: "#667eea" },
  { text: "The flashcard system with spaced repetition is exactly what I needed for MBBS exams. I've memorised more in two weeks than in three months before.", name: "Priya Sharma", role: "MBBS Year 2, Bhopal", avatar: "PS", color: "#f093fb" },
  { text: "Clean interface, fast search, the folder system keeps all my subjects separated. I recommended it to my entire class immediately.", name: "Rohan Kulkarni", role: "Diploma Engineering, RGPV", avatar: "RK", color: "#4facfe" },
  { text: "I love being able to share notes with my study group. We each summarise one topic and share it. Game changer for group study.", name: "Neha Patel", role: "BSc Chemistry, Pune", avatar: "NP", color: "#43e97b" },
  { text: "The study streak feature keeps me consistent. I've had a 21-day streak and my weekly note count is up 3x compared to paper notebooks.", name: "Karan Mehta", role: "BBA Finance, Delhi", avatar: "KM", color: "#fa709a" },
  { text: "Finally an app that feels designed for students — not bloated like Notion, not too simple like Google Keep. YourNotes is just right.", name: "Sneha Joshi", role: "Commerce, Nagpur University", avatar: "SJ", color: "#a18cd1" },
];

// ── Pricing — YourNotes actual plans ───────────────────────────────────────
const pricing = [
  {
    plan: "Starter", price: "₹0", sub: "Free forever",
    desc: "Perfect for getting started with smart notes.",
    btn: "Get started free", featured: false,
    features: ["50 notes", "3 subject folders", "5 AI summaries / hour", "Basic flashcards", "Public note sharing"],
  },
  {
    plan: "Student Pro", price: "₹99", sub: "per month",
    desc: "Everything you need to ace your exams.",
    btn: "Get started", featured: true,
    features: ["Unlimited notes", "Unlimited folders", "Unlimited AI summaries", "Smart flashcard scheduling (SM-2)", "Study dashboard & analytics", "Priority support"],
  },
  {
    plan: "Team", price: "₹299", sub: "per month for 5 students",
    desc: "Collaborate with your study group.",
    btn: "Get started", featured: false,
    features: ["Everything in Pro", "Up to 5 team members", "Shared folders", "Collaborative notes", "Team analytics", "Dedicated support"],
  },
];

// ── FAQ — YourNotes relevant questions ─────────────────────────────────────
const faqs = [
  { q: "Does YourNotes have a free plan?", a: "Yes! Our free Starter plan includes 50 notes, 3 folders, and 5 AI summaries per hour. No credit card required — just sign up and start studying." },
  { q: "How does the AI summarisation work?", a: "We send your note content to Gemini AI. It returns a structured summary with key points, which we display alongside your original note instantly." },
  { q: "What is spaced repetition (SM-2)?", a: "SM-2 is a scientifically proven algorithm that schedules flashcard reviews based on how well you remember each card, so you study more efficiently over time." },
  { q: "Can I share notes with classmates?", a: "Yes. Any note can be shared via a unique public link in view-only mode. Recipients don't need an account to read shared notes." },
  { q: "Can I import existing notes?", a: "Yes! You can import .txt, .md, .pdf, .doc, and .docx files directly from the dashboard. The content becomes a new editable note instantly." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. Cancel anytime from your account settings. You'll keep Pro access until end of billing period, then drop back to the free plan." },
  { q: "Is my data secure?", a: "All data is stored in MongoDB Atlas with JWT authentication. Passwords are hashed with bcrypt. We never share your data with third parties." },
  { q: "Does YourNotes work on mobile?", a: "Yes, YourNotes is fully responsive and works on all devices — mobile, tablet, and desktop." },
  { q: "Can I export my notes as PDF?", a: "Yes! Every note has a one-click PDF export button in the editor toolbar so you can save or print your notes anytime." },
];

// ── Stack ─────────────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".animate-in").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", minHeight: "100vh", overflowX: "hidden", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .animate-in { opacity: 0; transform: translateY(22px); transition: opacity .7s cubic-bezier(0.16,1,0.3,1), transform .7s cubic-bezier(0.16,1,0.3,1); }
        .animate-in.visible { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay:.1s!important } .d2 { transition-delay:.2s!important }
        .d3 { transition-delay:.3s!important } .d4 { transition-delay:.4s!important }
        .d5 { transition-delay:.5s!important }

        @keyframes heroFade { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .btn-primary { background:#2563EB; color:#fff; border:none; padding:13px 28px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; }
        .btn-primary:hover { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 8px 28px rgba(37,99,235,.3); }
        .btn-secondary { background:transparent; color:#374151; border:1.5px solid #d1d5db; padding:12px 24px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:all .2s; }
        .btn-secondary:hover { border-color:#2563EB; color:#2563EB; }
        .btn-white { background:#fff; color:#2563EB; border:none; padding:12px 32px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; }
        .btn-white:hover { background:#eff6ff; transform:translateY(-1px); }

        .nav-a { color:#374151; text-decoration:none; font-size:14px; font-weight:400; transition:color .2s; }
        .nav-a:hover { color:#111827; }

        .ftab { padding:18px 0 18px 20px; border-left:2px solid transparent; cursor:pointer; transition:all .2s; }
        .ftab.on { border-left-color:#fff; }
        .ftab h4 { font-size:14px; font-weight:500; margin-bottom:4px; color:rgba(255,255,255,.45); }
        .ftab.on h4 { color:#fff; }
        .ftab p { font-size:12px; color:rgba(255,255,255,.55); line-height:1.55; margin:0; }

        .f3card { border:1.5px solid #e5e7eb; border-radius:10px; padding:24px; transition:all .2s; }
        .f3card:hover { box-shadow:0 12px 40px rgba(0,0,0,.08); border-color:#93c5fd; transform:translateY(-2px); }

        .tcard { background:#fff; border:1.5px solid #f0f0f0; border-radius:10px; padding:22px; transition:box-shadow .2s; }
        .tcard:hover { box-shadow:0 8px 32px rgba(0,0,0,.07); }

        .pcard { background:#fff; border:1.5px solid #e5e7eb; border-radius:14px; padding:30px; transition:all .2s; }
        .pcard:hover { box-shadow:0 20px 60px rgba(0,0,0,.09); transform:translateY(-2px); }
        .pcard.featured { background:#2563EB; border-color:#2563EB; color:#fff; }

        .faq-item { border-bottom:1px solid #f3f4f6; }
        .faq-q { padding:18px 0; font-size:14px; font-weight:500; color:#111827; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:color .2s; }
        .faq-q:hover { color:#2563EB; }
        .faq-a { font-size:13px; color:#6b7280; line-height:1.75; padding-bottom:16px; }

        .trow:hover td { background:#f9fafb; }

        @media(max-width:900px){
          .grid3 { grid-template-columns:1fr 1fr !important; }
          .fbgrid { grid-template-columns:1fr !important; }
          .simpgrid { grid-template-columns:1fr !important; }
          .faqgrid { grid-template-columns:1fr !important; }
        }
        @media(max-width:640px){
          .hero-h1 { font-size:32px !important; }
          .grid3 { grid-template-columns:1fr !important; }
          .pgrid { grid-template-columns:1fr !important; }
          .nav-links { display:none !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrollY > 20 ? "rgba(255,255,255,.97)" : "#fff",
        borderBottom: "1px solid #f3f4f6",
        padding: "0 5%", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: scrollY > 20 ? "0 1px 20px rgba(0,0,0,.06)" : "none",
        transition: "box-shadow .3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#2563EB,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827", letterSpacing: "-.3px" }}>YourNotes</span>
        </div>

        <div className="nav-links" style={{ display: "flex", gap: 28 }}>
          <a href="#features" className="nav-a">Features</a>
          <a href="#how-it-works" className="nav-a">How it works</a>
          <a href="#pricing" className="nav-a">Pricing</a>
          <a href="#faq" className="nav-a">FAQ</a>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign in</button>
          <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/register")}>Get started free →</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ padding: "88px 5% 72px", textAlign: "center", background: "#fff" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", animation: "heroFade .9s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 99, padding: "5px 16px", marginBottom: 28 }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e40af", letterSpacing: ".04em" }}>AI-Powered Notes for Students</span>
          </div>
          <h1 className="hero-h1" style={{ fontSize: 52, fontWeight: 700, color: "#111827", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
            Study smarter.<br />
            <span style={{ color: "#2563EB" }}>Remember more.</span>
          </h1>
          <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.75, maxWidth: 500, margin: "0 auto 36px", fontWeight: 400 }}>
            YourNotes is a clean, AI-powered workspace built for students. Organize by subject, generate flashcards, and let AI summarize your notes in one click.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: "14px 32px" }} onClick={() => navigate("/register")}>
              Start for free — no card needed
            </button>
            <button className="btn-secondary" style={{ fontSize: 15, padding: "13px 28px" }} onClick={() => navigate("/login")}>
              Sign in →
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: "#9ca3af", letterSpacing: ".04em" }}>
            Free forever · 50 notes · No credit card required
          </p>
        </div>
      </section>

      {/* ── TECH STACK STRIP ────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", padding: "22px 5%" }}>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 18, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em" }}>
          Built with the MERN stack
        </p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          {stack.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, color: "#6b7280" }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE BAND (blue) ──────────────────────────────────────── */}
      <section id="features" style={{ background: "linear-gradient(150deg,#1e3a8a 0%,#2563EB 50%,#4338ca 100%)", padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="animate-in" style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: "#fff", letterSpacing: "-.8px", marginBottom: 12, lineHeight: 1.1 }}>
              Everything you need to study better.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", maxWidth: 460, margin: "0 auto" }}>
              One clean workspace with AI tools, flashcards, and smart organization — all built for students.
            </p>
          </div>

          <div className="fbgrid animate-in" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, background: "rgba(255,255,255,.05)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)" }}>
            {/* Tabs */}
            <div style={{ padding: "28px 20px", borderRight: "1px solid rgba(255,255,255,.08)" }}>
              {featureTabs.map((tab, i) => (
                <div key={i} className={`ftab ${activeTab === i ? "on" : ""}`} onClick={() => setActiveTab(i)} style={{ marginBottom: 4 }}>
                  <h4>{tab.title}</h4>
                  {activeTab === i && <p>{tab.desc}</p>}
                </div>
              ))}
            </div>

            {/* Preview — Notes table */}
            <div style={{ padding: "24px 24px 24px 16px" }}>
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,.28)" }}>
                <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                  {["#FF5F57","#FFBD2E","#28C840"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                  <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8, fontFamily: "monospace" }}>YourNotes — Notes</span>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>Recent Notes</span>
                    <button style={{ background: "#2563EB", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>+ New Note</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, color: "#374151" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        {["Title","Subject","Tags","Updated"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "#9ca3af", fontWeight: 500, fontSize: 10 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {notesPreview.map((r, i) => (
                        <tr key={i} className="trow">
                          <td style={{ padding: "8px 10px", fontWeight: 500, color: "#111827" }}>{r.title}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: r.sc, color: r.tc }}>{r.subject}</span>
                          </td>
                          <td style={{ padding: "8px 10px", color: "#9ca3af" }}>{r.tags}</td>
                          <td style={{ padding: "8px 10px", color: "#9ca3af" }}>{r.updated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>Total notes</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB" }}>5 notes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "88px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="animate-in" style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#111827", letterSpacing: "-.8px", marginBottom: 10 }}>
              Simplify your study workflow.
            </h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 440, margin: "0 auto" }}>
              Focus on learning while YourNotes handles organisation and memory work behind the scenes.
            </p>
          </div>

          <div className="simpgrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            {/* Left: feature list */}
            <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "✨", title: "AI Summaries in one click", desc: "Paste your lecture notes and get a structured summary with key points, powered by Gemini AI." },
                { icon: "🃏", title: "SM-2 Spaced Repetition Flashcards", desc: "Auto-generate flashcards and review them on an optimal schedule so you remember more with less effort." },
                { icon: "📁", title: "Subject Folders & Tags", desc: "Keep every subject in its own folder with searchable tags. Find any note instantly." },
                { icon: "📤", title: "Import your existing notes", desc: "Import .txt, .md, .pdf, .doc, or .docx files and turn them into editable notes right away." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "#f9fafb", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ width: 38, height: 38, background: "#eff6ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: two tables */}
            <div className="animate-in d2" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Notes table */}
              <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.05)" }}>
                <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>Recent Notes</span>
                  <span style={{ fontSize: 11, color: "#2563EB", cursor: "pointer" }}>View all →</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                    {["Title","Subject","Tags","Updated"].map(h => <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: "#9ca3af", fontWeight: 500, fontSize: 10 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {notesPreview.slice(0,4).map((r, i) => (
                      <tr key={i} className="trow" style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500, color: "#111827", fontSize: 12 }}>{r.title}</td>
                        <td style={{ padding: "8px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: r.sc, color: r.tc }}>{r.subject}</span></td>
                        <td style={{ padding: "8px 12px", color: "#9ca3af" }}>{r.tags}</td>
                        <td style={{ padding: "8px 12px", color: "#9ca3af" }}>{r.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Flashcards due */}
              <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}>
                <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>Flashcards Due Today</span>
                  <span style={{ fontSize: 11, color: "#2563EB", cursor: "pointer" }}>Start review →</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                    {["Card","Subject","Difficulty","Due"].map(h => <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: "#9ca3af", fontWeight: 500, fontSize: 10 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {flashcardsPreview.map((r, i) => (
                      <tr key={i} className="trow" style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500, color: "#111827" }}>{r.card}</td>
                        <td style={{ padding: "8px 12px", color: "#6b7280" }}>{r.subject}</td>
                        <td style={{ padding: "8px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: r.dc, color: r.dtc }}>{r.diff}</span></td>
                        <td style={{ padding: "8px 12px", color: "#9ca3af" }}>{r.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 FEATURES GRID ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 5%", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="animate-in" style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#111827", letterSpacing: "-.6px", marginBottom: 10 }}>All the tools you need to learn.</h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 400, margin: "0 auto" }}>Built for students from the ground up.</p>
          </div>
          <div className="grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className={`f3card animate-in d${Math.min(i,5)}`}>
                <div style={{ width: 40, height: 40, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(140deg,#1e3a8a,#2563EB,#4338ca)", padding: "72px 5%", textAlign: "center" }}>
        <div className="animate-in">
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: "-.5px", marginBottom: 12 }}>Ready to study smarter?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.75)", marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
            Join students using YourNotes to ace their exams.<br />Your first 50 notes are completely free — no credit card required.
          </p>
          <button className="btn-white" onClick={() => navigate("/register")} style={{ fontSize: 15, padding: "14px 36px" }}>
            Create your free account →
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: "88px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="animate-in" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: "#111827", letterSpacing: "-.6px", marginBottom: 10 }}>Loved by students worldwide.</h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 400, margin: "0 auto" }}>Here's what students from across India say about using YourNotes.</p>
          </div>
          <div className="grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`tcard animate-in d${Math.min(i,5)}`}>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, marginBottom: 18 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "88px 5%", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="animate-in" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: "#111827", letterSpacing: "-.6px", marginBottom: 10 }}>Simple pricing, for everyone.</h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 400, margin: "0 auto" }}>Start free and upgrade when you're ready. Cancel anytime, no surprises.</p>
          </div>
          <div className="pgrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
            {pricing.map((p, i) => (
              <div key={i} className={`pcard animate-in d${i} ${p.featured ? "featured" : ""}`} style={{ position: "relative" }}>
                {p.featured && (
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 14px", borderRadius: 99, textTransform: "uppercase", letterSpacing: ".07em", whiteSpace: "nowrap" }}>Most Popular</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", opacity: .6, marginBottom: 8 }}>{p.plan}</div>
                <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{p.price}</div>
                <div style={{ fontSize: 12, opacity: .65, marginBottom: 22 }}>{p.sub}</div>
                <button onClick={() => navigate("/register")}
                  style={{ width: "100%", padding: "11px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", marginBottom: 22, background: p.featured ? "#fff" : "#2563EB", color: p.featured ? "#2563EB" : "#fff", transition: "all .2s" }}>
                  {p.btn}
                </button>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: p.featured ? "rgba(255,255,255,.85)" : "#374151" }}>
                      <span style={{ width: 16, height: 16, background: p.featured ? "rgba(255,255,255,.2)" : "#d1fae5", color: p.featured ? "#fff" : "#065f46", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "88px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="animate-in" style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: "#111827", letterSpacing: "-.6px", marginBottom: 10 }}>Frequently asked questions</h2>
            <p style={{ fontSize: 15, color: "#6b7280" }}>Can't find what you're looking for? Reach out and we'll help.</p>
          </div>
          <div className="faqgrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 56px" }}>
            {faqs.map((f, i) => (
              <div key={i} className="faq-item animate-in">
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ paddingRight: 12 }}>{f.q}</span>
                  <span style={{ fontSize: 18, color: "#9ca3af", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
                </div>
                {openFaq === i && <p className="faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ background: "#0f172a", color: "rgba(255,255,255,.55)", padding: "52px 5% 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#2563EB,#7c3aed)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>YourNotes</span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.75, maxWidth: 220 }}>
                AI-powered notes workspace for students.<br />
                Diploma Final Year Project · S.V. Polytechnic College, Bhopal · RGPV 2024–25
              </p>
            </div>
            {[
              { title: "Product", links: ["Features","Pricing","FAQ"] },
              { title: "Account", links: ["Sign in","Register","Forgot password"] },
              { title: "Legal", links: ["Privacy","Terms","Cookies"] },
            ].map((col, i) => (
              <div key={i}>
                <h5 style={{ fontSize: 11, fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>{col.title}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l, j) => (
                    <li key={j}><a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,.45)", textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={e => e.target.style.color="#fff"} onMouseLeave={e => e.target.style.color="rgba(255,255,255,.45)"}>{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12, color: "rgba(255,255,255,.25)" }}>
            <span>© 2025 YourNotes. All rights reserved.</span>
            <span>Made with ♥ in Bhopal, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}