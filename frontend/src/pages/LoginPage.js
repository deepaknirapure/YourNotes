import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { YN_CSS, useNeuralCanvas, useTorusCanvas, useFlowCanvas, useCursor } from "./NeuralBackground";

export default function LoginPage() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  // canvas refs
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
    if (!form.email || !form.password) return toast.error("All fields required");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{YN_CSS + `
        .yn-auth-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          z-index: 10;
          padding-top: 100px;
        }
        .yn-auth-card {
          width: 100%;
          max-width: 420px;
          animation: fadeUp .7s .2s both;
        }
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef}    className="yn-cursor-ring" />
      <div ref={cursorDotRef} className="yn-cursor-dot"  />

      {/* Canvas stack */}
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />
      <canvas ref={torusRef}  className="yn-canvas" style={{ zIndex:1, opacity:.45, pointerEvents:"none" }} />
      <canvas ref={flowRef}   className="yn-canvas" style={{ zIndex:2, opacity:.25, pointerEvents:"none" }} />

      {/* Nav */}
      <nav className="yn-nav">
        <Link to="/" className="yn-nav-logo">YOURNOTES</Link>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:".8rem", color:"rgba(240,240,255,.4)" }}>No account?</span>
          <Link to="/register" className="yn-btn-primary" style={{ padding:"8px 20px", fontSize:".78rem" }}>Sign up free</Link>
        </div>
      </nav>

      {/* Auth wrap */}
      <div className="yn-auth-wrap">
        <div className="yn-auth-card">

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"4px", color:"var(--yn-cyan)", marginBottom:16 }}>// AUTH</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.2rem", letterSpacing:-1, marginBottom:8, color:"#f0f0ff" }}>Welcome back</h1>
            <p style={{ color:"rgba(240,240,255,.45)", fontSize:".88rem" }}>Sign in to your YourNotes account</p>
          </div>

          {/* Card */}
          <div className="yn-card" style={{ padding:36 }}>
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>Email address</label>
              <input type="email" className="yn-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <label style={lbl}>Password</label>
                <Link to="/forgot-password" style={{ fontSize:"12px", color:"var(--yn-cyan)", textDecoration:"none", fontFamily:"'JetBrains Mono',monospace" }}>
                  Forgot?
                </Link>
              </div>
              <input type="password" className="yn-field" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit(e)} />
            </div>
            <button className="yn-btn-primary" disabled={loading} onClick={handleSubmit}
              style={{ width:"100%", padding:"13px", textAlign:"center" }}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>

            <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid rgba(255,255,255,.06)", textAlign:"center" }}>
              <p style={{ fontSize:"13px", color:"rgba(240,240,255,.4)" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color:"var(--yn-cyan)", fontWeight:600, textDecoration:"none" }}>Create one free</Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontFamily:"'JetBrains Mono',monospace", fontSize:".62rem", color:"rgba(240,240,255,.2)", letterSpacing:"2px" }}>
            YOURNOTES · SECURE LOGIN · 2026
          </p>
        </div>
      </div>
    </>
  );
}

const lbl = { display:"block", fontSize:"12px", fontWeight:500, color:"rgba(240,240,255,.6)", marginBottom:7, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" };
