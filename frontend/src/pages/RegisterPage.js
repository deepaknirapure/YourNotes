import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  Layers,
  Globe,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("All fields required");
    if (form.password.length < 6)
      return toast.error("Password kam se kam 6 characters ka hona chahiye");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data.user, data.token);
      toast.success("Account created! Welcome aboard 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* LEFT COLUMN */}
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
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "48px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <FeatureRow
            icon={<Sparkles size={20} color={theme.primary} />}
            title="AI Powered Summaries"
            desc="Gemini AI ka use karke apne lambe notes ko seconds mein summarize karein."
          />
          <FeatureRow
            icon={<Layers size={20} color={theme.primary} />}
            title="Smart Flashcards"
            desc="Spaced Repetition (SM-2) algorithm se complex topics ko asani se yaad karein."
          />
          <FeatureRow
            icon={<Globe size={20} color={theme.primary} />}
            title="Universal Access"
            desc="Apne notes ko kahi bhi, kabhi bhi access karein. Students ke liye hamesha free."
          />
          <FeatureRow
            icon={<ShieldCheck size={20} color={theme.primary} />}
            title="Secure & Private"
            desc="Aapka data encrypted hai. Aapke notes sirf aapke hain."
          />
        </div>

        <div
          style={{
            marginTop: "60px",
            padding: "24px",
            borderRadius: "16px",
            backgroundColor: "#fff",
            border: `1px solid ${theme.border}`,
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: theme.primary,
              letterSpacing: "1px",
              marginBottom: "4px",
            }}
          >
            ✓ STUDENT PROJECT
          </p>
          <p style={{ fontSize: "14px", color: theme.textSub }}>
            S.V. Polytechnic College, Bhopal · 2026
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: SIGNUP FORM */}
      <div
        style={{
          width: "500px",
          padding: "80px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderLeft: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "36px",
              fontWeight: "800",
              color: theme.dark,
              marginBottom: "12px",
              letterSpacing: "-1.5px",
            }}
          >
            Create Account.
          </h2>
          <p style={{ color: theme.textSub, fontSize: "15px" }}>
            Start your journey with a clean AI workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <InputGroup
            label="Full Name"
            icon={<User size={18} />}
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(val) => setForm({ ...form, name: val })}
          />
          <InputGroup
            label="Email Address"
            icon={<Mail size={18} />}
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(val) => setForm({ ...form, email: val })}
          />
          <InputGroup
            label="Password"
            icon={<Lock size={18} />}
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={(val) => setForm({ ...form, password: val })}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: theme.primary,
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
              marginTop: "10px",
            }}
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                Create Free Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "32px",
            fontSize: "14px",
            color: theme.textSub,
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: theme.primary,
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>

        <p
          style={{
            marginTop: "auto",
            textAlign: "center",
            fontSize: "10px",
            color: "#ccc",
            letterSpacing: "2px",
            fontWeight: "600",
          }}
        >
          YOURNOTES · BHOPAL · 2026
        </p>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      <div
        style={{
          width: "44px",
          height: "44px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)",
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.5" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: "800",
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
          }}
        >
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 14px 14px 48px",
            borderRadius: "12px",
            border: "1.5px solid #E5E7EB",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}
