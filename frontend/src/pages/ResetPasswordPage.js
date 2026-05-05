import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { KeyRound, Eye, EyeOff, CheckCircle2, Lock, ArrowLeft, Loader2 } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #151313; color: #f7f7f5; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; margin: 0; }

  .reset-root {
    min-height: 100vh; display: flex; flex-direction: column; 
    align-items: center; justify-content: center; padding: 24px;
    background: #151313; position: relative;
  }

  /* Subtle Background Pattern */
  .bg-pattern {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(#3a3535 1px, transparent 1px);
    background-size: 32px 32px; opacity: 0.4;
  }

  .brand-logo {
    font-size: 24px; font-weight: 800; color: #f7f7f5; 
    letter-spacing: -0.5px; margin-bottom: 32px; z-index: 1;
    display: flex; align-items: center; justify-content: center;
  }

  .auth-card {
    background: #1e1b1b; border: 1px solid #2a2525; border-radius: 20px;
    padding: 48px 40px; width: 100%; max-width: 440px; z-index: 1;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .icon-wrap {
    width: 56px; height: 56px; background: #FFF5F2; border: 1px solid #FFE4DB;
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px; color: #E55B2D;
  }

  .icon-wrap.success {
    background: #ECFDF5; border-color: #D1FAE5; color: #10B981;
  }

  .auth-title {
    font-size: 24px; font-weight: 800; color: #f7f7f5; 
    letter-spacing: -0.5px; text-align: center; margin-bottom: 12px;
  }

  .auth-subtitle {
    font-size: 14px; color: #8a7f7f; text-align: center; 
    line-height: 1.6; margin-bottom: 32px; font-weight: 500;
  }

  .form-group { margin-bottom: 20px; }
  
  .form-label {
    display: block; font-size: 12px; font-weight: 700; color: #8a7f7f;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
  }

  .input-wrapper { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 16px; color: #8a7f7f; pointer-events: none; }
  
  .form-input {
    width: 100%; padding: 14px 44px; background: #1e1b1b; 
    border: 1px solid #2a2525; border-radius: 12px; font-size: 15px; font-weight: 500;
    color: #f7f7f5; font-family: inherit; transition: 0.2s; outline: none;
  }
  .form-input::placeholder { color: #8a7f7f; font-weight: 400; }
  .form-input:focus { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229, 91, 45, 0.1); }

  .pw-toggle-btn {
    position: absolute; right: 12px; background: transparent; border: none;
    color: #8a7f7f; cursor: pointer; display: flex; align-items: center;
    justify-content: center; padding: 4px; border-radius: 6px; transition: 0.2s;
  }
  .pw-toggle-btn:hover { color: #f7f7f5; background: #2a2525; }

  .btn-primary {
    width: 100%; padding: 14px; background: #f7f7f5; color: #f7f7f5;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 12px;
  }
  .btn-primary:hover:not(:disabled) { background: #E55B2D; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(229, 91, 45, 0.2); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .back-link {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    color: #8a7f7f; font-size: 14px; font-weight: 600; text-decoration: none;
    transition: 0.2s; margin-top: 32px;
  }
  .back-link:hover { color: #f7f7f5; }

  .footer-text {
    font-size: 11px; font-weight: 700; color: #8a7f7f; letter-spacing: 2px;
    text-transform: uppercase; position: absolute; bottom: 32px;
  }
`;

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
      toast.success("Password reset successfully! 🔐");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-root">
      <style>{STYLES}</style>
      <div className="bg-pattern" />

      {/* Brand Logo */}
      <div className="brand-logo">
        Your<span style={{ color: "#E55B2D" }}>Notes</span>.
      </div>

      <div className="auth-card">
        <div className={`icon-wrap ${done ? "success" : ""}`}>
          {done ? <CheckCircle2 size={28} strokeWidth={2} /> : <KeyRound size={28} strokeWidth={2} />}
        </div>

        <h1 className="auth-title">
          {done ? "Password Reset Complete!" : "Set New Password"}
        </h1>
        <p className="auth-subtitle">
          {done 
            ? "Your password has been successfully updated. Redirecting you to login..." 
            : "Create a new, strong password for your account."}
        </p>

        {done ? (
          <div>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button className="btn-primary">
                Return to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPw ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Minimum 6 characters" 
                  required 
                  className="form-input" 
                />
                <button type="button" className="pw-toggle-btn" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPw ? "text" : "password"} 
                  value={confirm} 
                  onChange={e => setConfirm(e.target.value)} 
                  placeholder="Re-type new password" 
                  required 
                  className="form-input" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Updating...
                </>
              ) : "Reset Password"}
            </button>
          </form>
        )}

        {/* Back Link */}
        {!done && (
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