import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { YN_CSS, useNeuralCanvas, useTorusCanvas, useFlowCanvas, useCursor } from "./NeuralBackground";

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const neuralRef    = useRef(null);
  const torusRef     = useRef(null);
  const flowRef      = useRef(null);
  const mouseRef     = useRef({ x: null, y: null });
  const cursorRef    = useRef(null);
  const cursorDotRef = useRef(null);

  useNeuralCanvas(neuralRef);
  useTorusCanvas(torusRef, mouseRef);
  useFlowCanvas(flowRef, mouseRef);
  useCursor(mouseRef, cursorRef, cursorDotRef);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("All fields required");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data.user, data.token);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const fields = [
    { label: "Full name",     key: "name",     type: "text",     placeholder: "Your name" },
    { label: "Email address", key: "email",    type: "email",    placeholder: "you@example.com" },
    { label: "Password",      key: "password", type: "password", placeholder: "Min. 6 characters" },
  ];

  return (
    <>
      <style>{YN_CSS + `
        .yn-auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; z-index:10; padding-top:100px; }
        .yn-auth-card { width:100%; max-width:440px; animation:fadeUp .7s .2s both; }
      `}</style>

      <div ref={cursorRef}    className="yn-cursor-ring" />
      <div ref={cursorDotRef} className="yn-cursor-dot"  />
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />
      <canvas ref={torusRef}  className="yn-canvas" style={{ zIndex:1, opacity:.45, pointerEvents:"none" }} />
      <canvas ref={flowRef}   className="yn-canvas" style={{ zIndex:2, opacity:.25, pointerEvents:"none" }} />

      <nav className="yn-nav">
        <Link to="/" className="yn-nav-logo">YOURNOTES</Link>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:".8rem", color:"rgba(240,240,255,.4)" }}>Already have one?</span>
          <Link to="/login" className="yn-btn-ghost" style={{ padding:"8px 20px", fontSize:".78rem" }}>Sign in</Link>
        </div>
      </nav>

      <div className="yn-auth-wrap">
        <div className="yn-auth-card">
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"4px", color:"var(--yn-cyan)", marginBottom:16 }}>// REGISTER</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.2rem", letterSpacing:-1, marginBottom:8, color:"#f0f0ff" }}>Create your account</h1>
            <p style={{ color:"rgba(240,240,255,.45)", fontSize:".88rem" }}>Start taking smarter notes — free forever</p>
          </div>

          {/* Free plan badge */}
          <div style={{ background:"rgba(139,92,246,.1)", border:"1px solid rgba(139,92,246,.25)", borderRadius:12, padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color:"#a78bfa", fontSize:"13px" }}>✦</span>
            <span style={{ fontSize:"12px", color:"rgba(167,139,250,.9)", fontFamily:"'JetBrains Mono',monospace" }}>
              FREE: 50 notes · 3 folders · 5 AI summaries/hr · No card
            </span>
          </div>

          <div className="yn-card" style={{ padding:36 }}>
            {fields.map((f, i) => (
              <div key={f.key} style={{ marginBottom: i < fields.length-1 ? 20 : 28 }}>
                <label style={lbl}>{f.label}</label>
                <input type={f.type} className="yn-field" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleSubmit(e)} />
              </div>
            ))}
            <button className="yn-btn-primary" disabled={loading} onClick={handleSubmit}
              style={{ width:"100%", padding:"13px", textAlign:"center" }}>
              {loading ? "Creating account…" : "Create free account →"}
            </button>
            <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid rgba(255,255,255,.06)", textAlign:"center" }}>
              <p style={{ fontSize:"13px", color:"rgba(240,240,255,.4)" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color:"var(--yn-cyan)", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontFamily:"'JetBrains Mono',monospace", fontSize:".62rem", color:"rgba(240,240,255,.2)", letterSpacing:"2px" }}>
            YOURNOTES · FREE FOREVER · 2026
          </p>
        </div>
      </div>
    </>
  );
}

const lbl = { display:"block", fontSize:"12px", fontWeight:500, color:"rgba(240,240,255,.6)", marginBottom:7, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" };
