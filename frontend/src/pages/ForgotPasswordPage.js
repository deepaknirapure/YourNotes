import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; }

        @keyframes ynFadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ynPulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes ynSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .yn-fp-input {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,.04);
          border: 1.5px solid rgba(255,255,255,.1);
          border-radius: 10px; font-size: 15px; color: #fff;
          font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, background .2s;
        }
        .yn-fp-input::placeholder { color: rgba(255,255,255,.25); }
        .yn-fp-input:focus { border-color: #E55B2D; background: rgba(229,91,45,.05); }

        .yn-fp-btn {
          width: 100%; padding: 15px;
          background: #E55B2D; color: #fff; border: none;
          border-radius: 10px; font-weight: 700; font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all .2s;
        }
        .yn-fp-btn:hover:not(:disabled) { background: #c94d23; transform: translateY(-1px); box-shadow: 0 12px 32px rgba(229,91,45,.3); }
        .yn-fp-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      {/* Background decorative lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", width: "1px", height: "200%",
            background: "rgba(255,255,255,0.02)",
            left: `${8 + i * 16}%`, top: "-50%",
            transform: "rotate(15deg)",
          }} />
        ))}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 300, background: "radial-gradient(ellipse, rgba(229,91,45,.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      </div>

      {/* Logo top */}
      <div style={{ position: "absolute", top: 32, left: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, background: "#E55B2D", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>
          Your<span style={{ color: "#E55B2D" }}>Notes</span>
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
        animation: "ynFadeUp .7s cubic-bezier(.16,1,.3,1) both",
      }}>
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 14, background: "rgba(229,91,45,.1)",
            border: "1px solid rgba(229,91,45,.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: 28,
          }}>
            {sent ? "✅" : "🔑"}
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800,
            color: "#fff", letterSpacing: "-1.2px", marginBottom: 8,
          }}>
            {sent ? "Check Your Inbox" : "Forgot Password?"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
            {sent ? "Reset link bhej diya gaya hai" : "Hum aapko reset link bhejenge"}
          </p>
        </div>

        {/* Card body */}
        <div style={{
          background: "#111", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16, padding: "32px",
        }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: 28 }}>
                <strong style={{ color: "#E55B2D" }}>{email}</strong> pe ek reset link bheja gaya hai.<br />
                Apna inbox check karein aur link par click karein.
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.25)", marginBottom: 24 }}>
                Email nahi mili? Spam folder check karein.
              </p>
              <Link to="/login" style={{
                display: "block", padding: "14px", background: "#E55B2D",
                color: "#fff", borderRadius: 10, textDecoration: "none",
                fontWeight: 700, fontSize: 15, textAlign: "center",
              }}>
                Back to Login →
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 20,
                }}>
                  <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="yn-fp-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="yn-fp-btn">
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ynSpin 1s linear infinite", display: "inline-block" }} />
                      Sending...
                    </span>
                  ) : "Send Reset Link →"}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,.25)" }}>
            <Link to="/login" style={{ color: "#E55B2D", textDecoration: "none", fontWeight: 600 }}>← Back to login</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 10, color: "rgba(255,255,255,.1)", letterSpacing: "3px", fontWeight: 700 }}>
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}
