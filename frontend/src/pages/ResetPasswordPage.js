import { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { YN_CSS, useNeuralCanvas, useTorusCanvas, useFlowCanvas, useCursor } from "./NeuralBackground";

// ─── Shared Auth Shell ────────────────────────────────────────────────────────
function AuthShell({ children }) {
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

  return (
    <>
      <style>{YN_CSS + `
        .yn-auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; z-index:10; padding-top:100px; }
        .yn-auth-card { width:100%; max-width:420px; animation:fadeUp .7s .2s both; }
      `}</style>
      <div ref={cursorRef}    className="yn-cursor-ring" />
      <div ref={cursorDotRef} className="yn-cursor-dot"  />
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />
      <canvas ref={torusRef}  className="yn-canvas" style={{ zIndex:1, opacity:.45, pointerEvents:"none" }} />
      <canvas ref={flowRef}   className="yn-canvas" style={{ zIndex:2, opacity:.25, pointerEvents:"none" }} />
      <nav className="yn-nav">
        <Link to="/" className="yn-nav-logo">YOURNOTES</Link>
        <Link to="/login" className="yn-btn-ghost" style={{ padding:"8px 20px", fontSize:".78rem" }}>Sign in</Link>
      </nav>
      <div className="yn-auth-wrap">
        <div className="yn-auth-card">{children}</div>
      </div>
    </>
  );
}

const lbl = { display:"block", fontSize:"12px", fontWeight:500, color:"rgba(240,240,255,.6)", marginBottom:7, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" };

// ─── ForgotPasswordPage ───────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true); setError("");
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"4px", color:"var(--yn-cyan)", marginBottom:16 }}>// RECOVER</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2rem", letterSpacing:-1, marginBottom:8, color:"#f0f0ff" }}>
          {sent ? "Check your inbox" : "Forgot password?"}
        </h1>
        <p style={{ color:"rgba(240,240,255,.45)", fontSize:".88rem" }}>
          {sent ? "We sent a reset link to your email" : "We'll send you a secure reset link"}
        </p>
      </div>

      <div className="yn-card" style={{ padding:36 }}>
        {!sent ? (
          <>
            {error && <div className="yn-error">{error}</div>}
            <div style={{ marginBottom:28 }}>
              <label style={lbl}>Email address</label>
              <input type="email" className="yn-field" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSubmit(e)} />
            </div>
            <button className="yn-btn-primary" disabled={loading} onClick={handleSubmit}
              style={{ width:"100%", padding:"13px", textAlign:"center" }}>
              {loading ? "Sending…" : "Send reset link →"}
            </button>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 20px", fontSize:26,
            }}>📬</div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", marginBottom:8, color:"#f0f0ff" }}>Email sent!</h3>
            <p style={{ fontSize:"13px", color:"rgba(240,240,255,.45)", lineHeight:1.7, marginBottom:28 }}>
              Reset link sent to <strong style={{ color:"var(--yn-cyan)" }}>{email}</strong>.<br />
              Expires in 15 minutes.
            </p>
            <Link to="/login" className="yn-btn-primary" style={{ padding:"11px 28px" }}>Back to login</Link>
          </div>
        )}
      </div>

      <p style={{ textAlign:"center", marginTop:20, fontSize:"13px", color:"rgba(240,240,255,.4)" }}>
        Remember it?{" "}
        <Link to="/login" style={{ color:"var(--yn-cyan)", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
      </p>
    </AuthShell>
  );
}

// ─── ResetPasswordPage ────────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");
  const { token }               = useParams();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 6)  return setError("Password must be at least 6 characters");
    setLoading(true); setError("");
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"4px", color:"var(--yn-cyan)", marginBottom:16 }}>// RESET</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2rem", letterSpacing:-1, marginBottom:8, color:"#f0f0ff" }}>
          {done ? "Password reset!" : "Set new password"}
        </h1>
        <p style={{ color:"rgba(240,240,255,.45)", fontSize:".88rem" }}>
          {done ? "Redirecting to login in 3 seconds…" : "Choose a strong password"}
        </p>
      </div>

      <div className="yn-card" style={{ padding:36 }}>
        {!done ? (
          <>
            {error && <div className="yn-error">{error}</div>}
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>New password</label>
              <input type="password" className="yn-field" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div style={{ marginBottom:28 }}>
              <label style={lbl}>Confirm password</label>
              <input type="password" className="yn-field" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSubmit(e)} />
            </div>
            <button className="yn-btn-primary" disabled={loading} onClick={handleSubmit}
              style={{ width:"100%", padding:"13px", textAlign:"center" }}>
              {loading ? "Resetting…" : "Reset password →"}
            </button>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 20px", fontSize:22, color:"var(--yn-cyan)", fontWeight:700,
            }}>✓</div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", marginBottom:8, color:"#f0f0ff" }}>All set!</h3>
            <p style={{ fontSize:"13px", color:"rgba(240,240,255,.45)", lineHeight:1.7, marginBottom:28 }}>
              Your password has been changed successfully.
            </p>
            <Link to="/login" className="yn-btn-primary" style={{ padding:"11px 28px" }}>Login now →</Link>
          </div>
        )}
      </div>

      <p style={{ textAlign:"center", marginTop:20, fontSize:"13px", color:"rgba(240,240,255,.4)" }}>
        <Link to="/login" style={{ color:"var(--yn-cyan)", fontWeight:600, textDecoration:"none" }}>← Back to login</Link>
      </p>
    </AuthShell>
  );
}

export default ResetPasswordPage;
