import { useState } from "react";
import { Link } from "react-router-dom";
import { Key, MailCheck, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import API from "../api/axios";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }

  .auth-root {
    min-height: 100vh; display: flex; flex-direction: column; 
    align-items: center; justify-content: center; padding: 24px;
    background: #FAFAFA; position: relative;
  }

  /* Subtle Background Pattern */
  .bg-pattern {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(#E2E8F0 1px, transparent 1px);
    background-size: 32px 32px; opacity: 0.4;
  }

  .brand-logo {
    font-size: 24px; font-weight: 800; color: #0F172A; 
    letter-spacing: -0.5px; margin-bottom: 32px; z-index: 1;
    display: flex; align-items: center; justify-content: center;
  }

  .auth-card {
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px;
    padding: 48px 40px; width: 100%; max-width: 440px; z-index: 1;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .icon-wrap {
    width: 56px; height: 56px; background: #F8FAFC; border: 1px solid #E2E8F0;
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px; color: #0F172A;
  }

  .icon-wrap.success {
    background: #ECFDF5; border-color: #D1FAE5; color: #10B981;
  }

  .auth-title {
    font-size: 24px; font-weight: 800; color: #0F172A; 
    letter-spacing: -0.5px; text-align: center; margin-bottom: 12px;
  }

  .auth-subtitle {
    font-size: 14px; color: #64748B; text-align: center; 
    line-height: 1.6; margin-bottom: 32px;
  }

  .form-group { margin-bottom: 24px; }
  
  .form-label {
    display: block; font-size: 12px; font-weight: 700; color: #475569;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
  }

  .form-input {
    width: 100%; padding: 14px 16px; background: #FFF; 
    border: 1px solid #E2E8F0; border-radius: 12px; font-size: 15px; 
    color: #0F172A; font-family: inherit; transition: 0.2s; outline: none;
  }
  .form-input::placeholder { color: #94A3B8; }
  .form-input:focus { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229, 91, 45, 0.1); }

  .btn-primary {
    width: 100%; padding: 14px; background: #0F172A; color: #FFF;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-primary:hover:not(:disabled) { background: #E55B2D; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(229, 91, 45, 0.2); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .error-alert {
    background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 10px;
    padding: 12px 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 10px;
  }
  .error-text { font-size: 13px; color: #EF4444; font-weight: 500; line-height: 1.5; }

  .back-link {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    color: #64748B; font-size: 14px; font-weight: 600; text-decoration: none;
    transition: 0.2s; margin-top: 32px;
  }
  .back-link:hover { color: #0F172A; }

  .footer-text {
    font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: 2px;
    text-transform: uppercase; position: absolute; bottom: 32px;
  }
`;

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
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <style>{STYLES}</style>
      <div className="bg-pattern" />

      {/* Brand Logo */}
      <div className="brand-logo">
        Your<span style={{ color: "#E55B2D" }}>Notes</span>.
      </div>

      <div className="auth-card">
        {/* Dynamic Header Icon */}
        <div className={`icon-wrap ${sent ? "success" : ""}`}>
          {sent ? <MailCheck size={28} strokeWidth={2} /> : <Key size={28} strokeWidth={2} />}
        </div>

        <h1 className="auth-title">
          {sent ? "Check your inbox" : "Forgot your password?"}
        </h1>
        
        <p className="auth-subtitle">
          {sent 
            ? "We have sent a password recovery link to your email address." 
            : "Enter the email address associated with your account and we'll send you a link to reset your password."}
        </p>

        {sent ? (
          <div>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "16px", borderRadius: "12px", marginBottom: "32px", textAlign: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>{email}</span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748B", textAlign: "center", marginBottom: "24px" }}>
              Didn't receive the email? Check your spam folder.
            </p>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button className="btn-primary">
                Return to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-alert">
                <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span className="error-text">{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {/* Back Link */}
        {!sent && (
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Back to login
          </Link>
        )}
      </div>

      <div className="footer-text">
        YOURNOTES · BHOPAL · 2026
      </div>
    </div>
  );
}