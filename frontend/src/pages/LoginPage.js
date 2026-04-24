import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .yn-auth{display:flex;min-height:100vh;background:#0a0a0a;font-family:'Geist',-apple-system,sans-serif;}
  .yn-left{flex:1;background:#000;border-right:1px solid rgba(255,255,255,.07);padding:48px 6%;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;}
  .yn-right{width:440px;padding:0 48px;display:flex;flex-direction:column;justify-content:center;background:#0a0a0a;animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both;}
  .yn-grid-line{position:absolute;width:1px;height:200%;background:rgba(255,255,255,.025);top:-50%;transform:rotate(12deg);}
  .yn-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(229,91,45,.3);border-radius:4px;padding:3px 10px;margin-bottom:24px;}
  .yn-dot{width:6px;height:6px;border-radius:50%;background:#E55B2D;animation:pulse 2s infinite;}
  .yn-h1{font-size:42px;font-weight:800;color:#fff;letter-spacing:-2px;line-height:1.06;margin-bottom:16px;}
  .yn-sub{color:rgba(255,255,255,.4);font-size:15px;line-height:1.65;max-width:300px;}
  .yn-stats{display:flex;gap:28px;margin-top:40px;}
  .yn-stat-v{font-size:22px;font-weight:800;color:#E55B2D;letter-spacing:-1px;}
  .yn-stat-l{font-size:11px;color:rgba(255,255,255,.3);margin-top:2px;font-weight:500;}
  .yn-footer-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px 18px;}
  .yn-label{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;}
  .yn-field{position:relative;}
  .yn-field svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.25);pointer-events:none;}
  .yn-input{width:100%;padding:10px 12px 10px 36px;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:6px;font-size:14px;font-family:inherit;color:#fff;outline:none;transition:border-color .15s,background .15s;}
  .yn-input:focus{border-color:#E55B2D;background:rgba(229,91,45,.04);}
  .yn-input::placeholder{color:rgba(255,255,255,.2);}
  .yn-btn{width:100%;padding:11px;background:#E55B2D;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-.1px;}
  .yn-btn:hover:not(:disabled){background:#d14e24;box-shadow:0 6px 20px rgba(229,91,45,.3);}
  .yn-btn:disabled{opacity:.5;cursor:not-allowed;}
  @media(max-width:768px){.yn-left{display:none!important}.yn-right{width:100%!important;padding:40px 24px!important;min-height:100vh;}}
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) return toast.error("Email aur password dono zaroori hain");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="yn-auth">
      <style>{S}</style>
      <div className="yn-left">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="yn-grid-line" style={{ left: `${8 + i * 21}%` }} />
        ))}
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(229,91,45,.07) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, background: "#E55B2D", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Your<span style={{ color: "#E55B2D" }}>Notes</span></span>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="yn-badge">
            <span className="yn-dot" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#E55B2D", letterSpacing: ".08em" }}>STUDENT NOTES PLATFORM</span>
          </div>
          <h2 className="yn-h1">Welcome back<br />to your workspace.</h2>
          <p className="yn-sub">Notes, AI summaries aur flashcards — sab ek jagah.</p>
          <div className="yn-stats">
            {[{ v: "1M+", l: "Students" }, { v: "662k", l: "Notes" }, { v: "Free", l: "Always" }].map((s, i) => (
              <div key={i}>
                <div className="yn-stat-v">{s.v}</div>
                <div className="yn-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="yn-footer-card" style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#E55B2D", letterSpacing: ".08em", marginBottom: 3 }}>✓ STUDENT PROJECT</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>S.V. Polytechnic College, Bhopal · 2026</p>
        </div>
      </div>

      <div className="yn-right">
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-1.2px", marginBottom: 6 }}>Sign In</h2>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Apne account mein login karein.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FieldGroup label="Email Address" icon={<Mail size={14} />} type="email" placeholder="name@example.com"
            value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <FieldGroup label="Password" icon={<Lock size={14} />} type="password" placeholder="••••••••"
            value={form.password} onChange={v => setForm({ ...form, password: v })} />
          <div style={{ textAlign: "right", marginTop: -6 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: "#E55B2D", fontWeight: 600 }}>Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="yn-btn" style={{ marginTop: 4 }}>
            {loading ? "Logging in..." : <><span>Sign In</span><ArrowRight size={15} /></>}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "rgba(255,255,255,.3)" }}>
          Account nahi hai?{" "}
          <Link to="/register" style={{ color: "#E55B2D", fontWeight: 700 }}>Register karein</Link>
        </p>
        <p style={{ marginTop: "auto", paddingTop: 36, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,.1)", letterSpacing: "3px", fontWeight: 700 }}>
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}

function FieldGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="yn-label">{label}</label>
      <div className="yn-field">
        {icon}
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} className="yn-input" />
      </div>
    </div>
  );
}
