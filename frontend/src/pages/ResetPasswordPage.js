-e // ye Reset Password page hai - naya password set karne ke liye
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', 'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input:focus{outline:none}
        @keyframes ynFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .yn-rp-input{width:100%;padding:14px 14px 14px 48px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;font-size:15px;color:#fff;font-family:'Inter','DM Sans',sans-serif;transition:border-color .2s,background .2s}
        .yn-rp-input::placeholder{color:rgba(255,255,255,.25)}
        .yn-rp-input:focus{border-color:#E55B2D;background:rgba(229,91,45,.05)}
        .yn-rp-btn{width:100%;padding:15px;background:#E55B2D;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:15px;font-family:'Inter','DM Sans',sans-serif;cursor:pointer;transition:all .2s}
        .yn-rp-btn:hover:not(:disabled){background:#c94d23;transform:translateY(-1px);box-shadow:0 12px 32px rgba(229,91,45,.3)}
        .yn-rp-btn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>

      {/* Background lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: "1px", height: "200%", background: "rgba(255,255,255,0.02)", left: `${8 + i * 16}%`, top: "-50%", transform: "rotate(15deg)" }} />
        ))}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, background: "radial-gradient(ellipse, rgba(229,91,45,.06) 0%, transparent 70%)" }} />
      </div>

      {/* Logo */}
      <div style={{ position: "absolute", top: 32, left: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>
          Your<span style={{ color: "#E55B2D" }}>Notes</span>
        </span>
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1, animation: "ynFadeUp .7s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: done ? "rgba(16,185,129,.1)" : "rgba(229,91,45,.1)", border: done ? "1px solid rgba(16,185,129,.3)" : "1px solid rgba(229,91,45,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: done ? "#10b981" : "#E55B2D" }}>
            {done ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>
            {done ? "Password Reset!" : "Set New Password"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
            {done ? "Login page pe ja rahe hain..." : "Apna naya password set karo"}
          </p>
        </div>

        <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "32px" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginBottom: 24, lineHeight: 1.8 }}>
                Password successfully change ho gaya. Aap ab login kar sakte ho.
              </p>
              <Link to="/login" style={{ display: "block", padding: "14px", background: "#E55B2D", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15, textAlign: "center" }}>
                Go to Login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)" }}>
                    <KeyRound size={16} />
                  </div>
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" required className="yn-rp-input" />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", display: "flex" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)" }}>
                    <KeyRound size={16} />
                  </div>
                  <input type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Password dobara likhein" required className="yn-rp-input" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="yn-rp-btn">
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ynSpin 1s linear infinite", display: "inline-block" }} />
                    Resetting...
                  </span>
                ) : "Reset Password →"}
              </button>
            </form>
          )}
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,.25)" }}>
            <Link to="/login" style={{ color: "#E55B2D", textDecoration: "none", fontWeight: 600 }}>← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
