import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f9fafb; }
  input:focus { outline: none; }
  button { font-family: inherit; }

  .yn-fp-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #E5E7EB; border-radius: 10px;
    font-size: 14px; color: #111827;
    background: #fff; font-family: 'DM Sans', sans-serif;
    transition: border-color .15s, box-shadow .15s;
  }
  .yn-fp-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,.1);
  }
  .yn-fp-input::placeholder { color: #9ca3af; }

  .yn-fp-btn {
    width: 100%; padding: 12px;
    background: #10B981; color: #fff;
    border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .2s, transform .2s, box-shadow .2s;
  }
  .yn-fp-btn:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(16,185,129,.25);
  }
  .yn-fp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
`;

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

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
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Wordmark */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ marginBottom: "18px" }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: "-0.5px" }}>
                Your<span style={{ color: "#10B981" }}>Notes</span>
              </span>
            </div>
            <h1 style={{
              fontSize: "26px", fontWeight: 800,
              color: "#111827", fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.5px", marginBottom: "6px",
            }}>
              Forgot Password?
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af" }}>
              {sent ? "Check your inbox" : "We'll send you a reset link"}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1px solid #e5e7eb", padding: "32px",
            boxShadow: "0 2px 16px rgba(0,0,0,.05)",
          }}>
            {!sent ? (
              <>
                {error && (
                  <div style={{
                    background: "#fff5f5", border: "1px solid #fecaca",
                    borderRadius: "10px", padding: "10px 14px",
                    marginBottom: "18px", fontSize: "13px", color: "#dc2626",
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block", fontSize: "11px", fontWeight: 800,
                      color: "#6b7280", textTransform: "uppercase",
                      letterSpacing: "1px", marginBottom: "8px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email" placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      required className="yn-fp-input"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="yn-fp-btn">
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px", fontSize: 28,
                }}>
                  📬
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginBottom: "10px", fontFamily: "'Syne', sans-serif" }}>
                  Email sent!
                </h3>
                <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.7, marginBottom: "24px" }}>
                  Reset link bhej diya hai{" "}
                  <strong style={{ color: "#111827" }}>{email}</strong> pe.{" "}
                  15 minutes mein expire hoga.
                </p>
                <Link to="/login" style={{
                  display: "inline-block", padding: "11px 28px",
                  background: "#10B981", color: "#fff", borderRadius: "10px",
                  textDecoration: "none", fontSize: "14px", fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "background .2s",
                }}>
                  Back to Login
                </Link>
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#9ca3af" }}>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "#10B981", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}