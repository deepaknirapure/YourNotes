import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  KeyRound,
  ShieldCheck,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LifeBuoy,
} from "lucide-react";
import API from "../api/axios";

// ─── Shared Recovery Shell ──────────────────────────────────────────────────
function RecoveryShell({ children, title, subtitle }) {
  const theme = {
    primary: "#10B981",
    primarySoft: "#ECFDF5",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#E5E7EB",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* --- LEFT COLUMN: SAFETY INFO --- */}
      <div
        style={{
          flex: 1,
          backgroundColor: theme.primarySoft,
          padding: "80px 8%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "24px",
            fontWeight: "800",
            marginBottom: "48px",
          }}
        >
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            maxWidth: "400px",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <ShieldCheck size={24} color={theme.primary} />
            <div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  marginBottom: "4px",
                }}
              >
                Secure Recovery
              </h3>
              <p style={{ fontSize: "14px", color: theme.textSub }}>
                Hum secure tokens use karte hain taaki aapka account hamesha
                safe rahe.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <LifeBuoy size={24} color={theme.primary} />
            <div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  marginBottom: "4px",
                }}
              >
                Need Help?
              </h3>
              <p style={{ fontSize: "14px", color: theme.textSub }}>
                Agar aapko access pane mein dikkat ho rahi hai, toh support team
                se contact karein.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "60px",
            padding: "20px",
            borderRadius: "16px",
            backgroundColor: "#fff",
            border: `1px solid ${theme.border}`,
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: theme.primary,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            ✓ ACCOUNT SAFETY
          </p>
          <p
            style={{ fontSize: "13px", color: theme.textSub, marginTop: "4px" }}
          >
            Bhopal Student Network Support · 2026
          </p>
        </div>
      </div>

      {/* --- RIGHT COLUMN: FORM --- */}
      <div
        style={{
          flex: 1,
          padding: "80px 10%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderLeft: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <Link
            to="/login"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: theme.textSub,
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "32px",
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "36px",
              fontWeight: "800",
              letterSpacing: "-1.5px",
              marginBottom: "12px",
            }}
          >
            {title}
          </h2>
          <p style={{ color: theme.textSub, fontSize: "15px" }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── ForgotPassword View ─────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecoveryShell
      title={sent ? "Check Email." : "Forgot Password?"}
      subtitle={
        sent
          ? "Reset link bhej diya gaya hai."
          : "Enter email to receive a secure reset link."
      }
    >
      {!sent ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="you@example.com"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button disabled={loading} style={btnPrimary}>
            {loading ? "Sending..." : "Send Reset Link"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#ECFDF5",
            borderRadius: "20px",
          }}
        >
          <CheckCircle2
            size={40}
            color="#10B981"
            style={{ marginBottom: "16px" }}
          />
          <p style={{ fontSize: "14px", color: "#065F46", fontWeight: "600" }}>
            Check your inbox! Reset link <br /> {email} par bhej diya hai.
          </p>
        </div>
      )}
    </RecoveryShell>
  );
}

// ─── ResetPassword View ──────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      alert("Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecoveryShell
      title="New Password."
      subtitle={
        done
          ? "Redirecting to login..."
          : "Set a strong password for your account."
      }
    >
      {!done ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>New Password</label>
            <div style={{ position: "relative" }}>
              <KeyRound size={18} style={iconStyle} />
              <input
                type="password"
                placeholder="••••••••"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button disabled={loading} style={btnPrimary}>
            {loading ? "Updating..." : "Update Password"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <div style={{ textAlign: "center" }}>
          <CheckCircle2
            size={48}
            color="#10B981"
            style={{ marginBottom: "16px" }}
          />
          <p style={{ fontWeight: "700", color: "#111827" }}>
            Password changed successfully!
          </p>
        </div>
      )}
    </RecoveryShell>
  );
}

// --- Shared Internal Styles ---
const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "800",
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
};
const inputStyle = {
  width: "100%",
  padding: "14px 14px 14px 48px",
  borderRadius: "12px",
  border: "1.5px solid #E5E7EB",
  fontSize: "15px",
  outline: "none",
};
const iconStyle = {
  position: "absolute",
  left: "16px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9CA3AF",
};
const btnPrimary = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#10B981",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
};

export default ResetPasswordPage;
