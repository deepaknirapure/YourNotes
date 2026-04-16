import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  LogIn
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    primary: "#10B981",
    primarySoft: "#ECFDF5",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#E5E7EB"
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* --- LEFT COLUMN: BRAND & TRUST --- */}
      <div style={{ flex: 1.2, backgroundColor: theme.primarySoft, padding: "80px 10%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: "800", marginBottom: "48px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>

        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "48px", lineHeight: "1.1", letterSpacing: "-2.5px", color: theme.dark, marginBottom: "32px" }}>
          Welcome back to your <br />
          <span style={{ color: theme.primary }}>AI Workspace.</span>
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "480px" }}>
          <div style={featureRow}>
            <Sparkles size={18} color={theme.primary} />
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Access your AI-generated summaries</span>
          </div>
          <div style={featureRow}>
            <ShieldCheck size={18} color={theme.primary} />
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Your data is secure and encrypted</span>
          </div>
          <div style={featureRow}>
            <CheckCircle2 size={18} color={theme.primary} />
            <span style={{ fontSize: "15px", fontWeight: "500" }}>100% Free for Students in Bhopal</span>
          </div>
        </div>

        <div style={{ marginTop: "60px", padding: "24px", borderRadius: "16px", backgroundColor: "#fff", border: `1px solid ${theme.border}` }}>
          <p style={{ fontSize: "11px", fontWeight: "800", color: theme.primary, letterSpacing: "1px", marginBottom: "4px" }}>✓ VERIFIED ACCESS</p>
          <p style={{ fontSize: "14px", color: theme.textSub }}>S.V. Polytechnic College, Bhopal · 2026</p>
        </div>
      </div>

      {/* --- RIGHT COLUMN: LOGIN FORM --- */}
      <div style={{ flex: 0.8, padding: "80px 80px", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: `1px solid ${theme.border}` }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "36px", fontWeight: "800", color: theme.dark, marginBottom: "12px", letterSpacing: "-1.5px" }}>Sign In.</h2>
          <p style={{ color: theme.textSub, fontSize: "16px" }}>Login to access your notes and flashcards.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={iconStyle} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={labelStyle}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: "12px", color: theme.primary, fontWeight: "700", textDecoration: "none" }}>Forgot Password?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={iconStyle} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={btnSubmit}
          >
            {loading ? "Signing in..." : <>Login to Workspace <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "40px", fontSize: "14px", color: theme.textSub }}>
          Don't have an account? <Link to="/register" style={{ color: theme.primary, fontWeight: "700", textDecoration: "none" }}>Join Free</Link>
        </p>

        <p style={{ marginTop: "auto", textAlign: "center", fontSize: "10px", color: "#ccc", letterSpacing: "2px", fontWeight: "600", textTransform: "uppercase" }}>
          SECURE ENCRYPTION · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}

// --- Internal UI Components ---
const featureRow = { display: "flex", alignItems: "center", gap: "12px", color: "#111827" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "11px", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" };
const iconStyle = { position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" };
const inputStyle = { width: "100%", padding: "14px 14px 14px 48px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "15px", outline: "none", transition: "0.2s" };
const btnSubmit = { 
  width: "100%", padding: "16px", backgroundColor: "#10B981", color: "#fff", 
  border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", 
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "12px" 
};