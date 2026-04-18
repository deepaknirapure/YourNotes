import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Sparkles, Layers, Globe, ArrowRight, ShieldCheck, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("All fields required");
    if (form.password.length < 6)
      return toast.error("Password kam se kam 6 characters ka hona chahiye");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data.user, data.token);
      toast.success("Account created! Welcome aboard 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{`
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; }

        @keyframes ynHeroIn { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ynPulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }

        .yn-input {
          width: 100%; padding: 14px 14px 14px 48px;
          background: rgba(255,255,255,.04);
          border: 1.5px solid rgba(255,255,255,.1);
          border-radius: 10px; font-size: 15px; color: #fff;
          font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, background .2s;
        }
        .yn-input::placeholder { color: rgba(255,255,255,.25); }
        .yn-input:focus { border-color: #E55B2D; background: rgba(229,91,45,.05); }

        .yn-submit-btn {
          width: 100%; padding: 16px;
          background: #E55B2D; color: #fff; border: none;
          border-radius: 10px; font-weight: 700; font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .yn-submit-btn:hover:not(:disabled) { background: #c94d23; transform: translateY(-1px); box-shadow: 0 12px 32px rgba(229,91,45,.3); }
        .yn-submit-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        background: "#0d0d0d",
        borderRight: "1px solid rgba(255,255,255,.06)",
        padding: "72px 8%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        {/* Diagonal lines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", width: "1px", height: "200%",
              background: "rgba(255,255,255,0.025)",
              left: `${10 + i * 20}%`, top: "-50%",
              transform: "rotate(15deg)",
            }} />
          ))}
          <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(229,91,45,.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        </div>

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>
              Your<span style={{ color: "#E55B2D" }}>Notes</span>
            </span>
          </div>
        </div>

        {/* Features list */}
        <div style={{ position: "relative", zIndex: 1, animation: "ynHeroIn .8s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(229,91,45,.3)", borderRadius: 4,
            padding: "4px 12px", marginBottom: 28,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E55B2D", letterSpacing: ".08em" }}>START YOUR JOURNEY</span>
          </div>

          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800,
            color: "#fff", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 36,
          }}>
            Join 1 Million+<br />Students Learning<br />Smarter.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { icon: <Sparkles size={18} color="#E55B2D" />, title: "AI Powered Summaries", desc: "Gemini AI ka use karke apne lambe notes ko seconds mein summarize karein." },
              { icon: <Layers size={18} color="#E55B2D" />, title: "Smart Flashcards", desc: "Spaced Repetition (SM-2) algorithm se complex topics ko asani se yaad karein." },
              { icon: <Globe size={18} color="#E55B2D" />, title: "Universal Access", desc: "Apne notes ko kahi bhi, kabhi bhi access karein. Students ke liye hamesha free." },
              { icon: <ShieldCheck size={18} color="#E55B2D" />, title: "Secure & Private", desc: "Aapka data encrypted hai. Aapke notes sirf aapke hain." },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, background: "rgba(229,91,45,.1)", border: "1px solid rgba(229,91,45,.2)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{
          position: "relative", zIndex: 1,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 10, padding: "18px 22px",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#E55B2D", letterSpacing: ".08em", marginBottom: 4 }}>✓ STUDENT PROJECT</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>S.V. Polytechnic College, Bhopal · 2026</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 520, padding: "72px 60px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        background: "#0a0a0a",
        animation: "ynHeroIn .9s .1s cubic-bezier(.16,1,.3,1) both",
      }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-1.5px" }}>
            Create Account.
          </h2>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>Start your journey with a clean AI workspace.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <InputGroup label="Full Name" icon={<User size={17} />} type="text" placeholder="Your full name" value={form.name} onChange={(val) => setForm({ ...form, name: val })} />
          <InputGroup label="Email Address" icon={<Mail size={17} />} type="email" placeholder="name@example.com" value={form.email} onChange={(val) => setForm({ ...form, email: val })} />
          <InputGroup label="Password" icon={<Lock size={17} />} type="password" placeholder="Min. 6 characters" value={form.password} onChange={(val) => setForm({ ...form, password: val })} />

          <button type="submit" disabled={loading} className="yn-submit-btn" style={{ marginTop: 10 }}>
            {loading ? "Creating account..." : <><span>Create Free Account</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "rgba(255,255,255,.3)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#E55B2D", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>

        <p style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: "rgba(255,255,255,.1)", letterSpacing: "3px", fontWeight: 700 }}>
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.25)" }}>
          {icon}
        </div>
        <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          className="yn-input"
        />
      </div>
    </div>
  );
}
