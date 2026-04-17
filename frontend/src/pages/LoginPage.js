import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Email aur password dono zaroori hain");
    setLoading(true);
    try {
      // FIX: was calling /auth/register (register code was pasted here by mistake)
      const { data } = await API.post("/auth/login", form);
      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    primary: "#10B981",
    primarySoft: "#ECFDF5",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#E5E7EB",
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* LEFT COLUMN */}
      <div style={{
        flex: 1, backgroundColor: theme.primarySoft, padding: "80px 8%",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: "800",
          marginBottom: "48px", display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>

        <div style={{ maxWidth: 380 }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "38px", fontWeight: "800",
            color: theme.dark, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20,
          }}>
            Welcome back to your workspace.
          </h2>
          <p style={{ color: theme.textSub, fontSize: "16px", lineHeight: 1.7 }}>
            Apne notes, AI summaries aur flashcards se dobara connect karein.
          </p>
        </div>

        <div style={{
          marginTop: "60px", padding: "24px", borderRadius: "16px",
          backgroundColor: "#fff", border: `1px solid ${theme.border}`,
        }}>
          <p style={{ fontSize: "12px", fontWeight: "800", color: theme.primary, letterSpacing: "1px", marginBottom: "4px" }}>
            ✓ STUDENT PROJECT
          </p>
          <p style={{ fontSize: "14px", color: theme.textSub }}>
            S.V. Polytechnic College, Bhopal · 2026
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{
        width: "500px", padding: "80px 60px", display: "flex",
        flexDirection: "column", justifyContent: "center",
        borderLeft: `1px solid ${theme.border}`,
      }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "36px", fontWeight: "800",
            color: theme.dark, marginBottom: "12px", letterSpacing: "-1.5px",
          }}>
            Sign In.
          </h2>
          <p style={{ color: theme.textSub, fontSize: "15px" }}>Apne account mein login karein.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <InputGroup label="Email Address" icon={<Mail size={18} />} type="email"
            placeholder="name@example.com" value={form.email}
            onChange={(val) => setForm({ ...form, email: val })} />
          <InputGroup label="Password" icon={<Lock size={18} />} type="password"
            placeholder="••••••••" value={form.password}
            onChange={(val) => setForm({ ...form, password: val })} />

          <div style={{ textAlign: "right", marginTop: "-8px" }}>
            <Link to="/forgot-password" style={{ fontSize: "13px", color: theme.primary, textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "16px", backgroundColor: theme.primary,
            color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700",
            fontSize: "16px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "10px",
          }}>
            {loading ? "Logging in..." : <><span>Sign In</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: theme.textSub }}>
          Account nahi hai?{" "}
          <Link to="/register" style={{ color: theme.primary, fontWeight: "700", textDecoration: "none" }}>
            Register karein
          </Link>
        </p>

        <p style={{ marginTop: "auto", textAlign: "center", fontSize: "10px", color: "#ccc", letterSpacing: "2px", fontWeight: "600" }}>
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "11px", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
          {icon}
        </div>
        <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: "14px 14px 14px 48px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}