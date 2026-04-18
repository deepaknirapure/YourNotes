import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Email aur password dono zaroori hain");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
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
          <div style={{ position: "absolute", bottom: -80, right: -80, width: 360, height: 360, background: "radial-gradient(circle, rgba(229,91,45,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        </div>

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>
              Your<span style={{ color: "#E55B2D" }}>Notes</span>
            </span>
          </div>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1, animation: "ynHeroIn .8s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(229,91,45,.3)", borderRadius: 4,
            padding: "4px 12px", marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E55B2D", animation: "ynPulse 2s infinite", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E55B2D", letterSpacing: ".08em" }}>LEARN. BUILD. GET PLACED.</span>
          </div>

          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800,
            color: "#fff", letterSpacing: "-2px", lineHeight: 1.08, marginBottom: 20,
          }}>
            Welcome back to<br />your workspace.
          </h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 16, lineHeight: 1.7, maxWidth: 340 }}>
            Apne notes, AI summaries aur flashcards se dobara connect karein.
          </p>

          {/* Mini stats */}
          <div style={{ display: "flex", gap: 24, marginTop: 44 }}>
            {[
              { label: "Students", value: "1M+" },
              { label: "Notes Created", value: "662k" },
              { label: "Always Free", value: "✓" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#E55B2D" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{s.label}</div>
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
        <div style={{ marginBottom: 44 }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800,
            color: "#fff", marginBottom: 12, letterSpacing: "-1.5px",
          }}>Sign In.</h2>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>Apne account mein login karein.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <InputGroup label="Email Address" icon={<Mail size={17} />} type="email"
            placeholder="name@example.com" value={form.email}
            onChange={(val) => setForm({ ...form, email: val })} />
          <InputGroup label="Password" icon={<Lock size={17} />} type="password"
            placeholder="••••••••" value={form.password}
            onChange={(val) => setForm({ ...form, password: val })} />

          <div style={{ textAlign: "right", marginTop: -8 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: "#E55B2D", textDecoration: "none", fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="yn-submit-btn" style={{ marginTop: 10 }}>
            {loading ? "Logging in..." : <><span>Sign In</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "rgba(255,255,255,.3)" }}>
          Account nahi hai?{" "}
          <Link to="/register" style={{ color: "#E55B2D", fontWeight: 700, textDecoration: "none" }}>
            Register karein
          </Link>
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
