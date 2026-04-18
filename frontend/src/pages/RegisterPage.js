import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Sparkles, Layers, Globe, ArrowRight, ShieldCheck, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const theme = {
  primary:     "#10B981",
  primarySoft: "#f0fdf4",
  dark:        "#111827",
  textSub:     "#6B7280",
  border:      "#E5E7EB",
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  input:focus { outline: none; }
  button { font-family: inherit; }

  .yn-reg-input {
    width: 100%; padding: 14px 14px 14px 48px;
    border-radius: 12px; border: 1.5px solid #E5E7EB;
    font-size: 15px; outline: none; box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
    transition: border-color .15s, box-shadow .15s;
    color: #111827; background: #fff;
  }
  .yn-reg-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,.1);
  }

  .yn-reg-btn {
    width: 100%; padding: 16px;
    background: #10B981; color: #fff;
    border: none; border-radius: 12px;
    font-weight: 700; font-size: 16px;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 10px; margin-top: 10px;
    font-family: 'DM Sans', sans-serif;
    transition: background .2s, transform .2s, box-shadow .2s;
  }
  .yn-reg-btn:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(16,185,129,.3);
  }
  .yn-reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
`;

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

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

  return (
    <>
      <style>{globalCss}</style>
      <div style={{ display: "flex", height: "100vh", backgroundColor: "#fff", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          flex: 1,
          background: "linear-gradient(160deg, #052e16 0%, #064e3b 50%, #10B981 100%)",
          padding: "80px 8%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", border: "1px solid rgba(16,185,129,.2)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 40, left: -80, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(16,185,129,.15)", pointerEvents: "none" }} />

          {/* Wordmark */}
          <div style={{ marginBottom: "48px" }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.5px" }}>
              Your<span style={{ color: "#34d399" }}>Notes</span>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px", position: "relative", zIndex: 1 }}>
            <FeatureRow icon={<Sparkles size={20} color="#34d399" />} title="AI Powered Summaries"
              desc="Gemini AI ka use karke apne lambe notes ko seconds mein summarize karein." />
            <FeatureRow icon={<Layers size={20} color="#34d399" />} title="Smart Flashcards"
              desc="Spaced Repetition (SM-2) algorithm se complex topics ko asani se yaad karein." />
            <FeatureRow icon={<Globe size={20} color="#34d399" />} title="Universal Access"
              desc="Apne notes ko kahi bhi, kabhi bhi access karein. Students ke liye hamesha free." />
            <FeatureRow icon={<ShieldCheck size={20} color="#34d399" />} title="Secure & Private"
              desc="Aapka data encrypted hai. Aapke notes sirf aapke hain." />
          </div>

          <div style={{
            marginTop: "52px", padding: "20px 24px", borderRadius: "14px",
            background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
            position: "relative", zIndex: 1,
          }}>
            <p style={{ fontSize: "12px", fontWeight: "800", color: "#6ee7b7", letterSpacing: "1px", marginBottom: "4px" }}>✓ STUDENT PROJECT</p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.55)" }}>S.V. Polytechnic College, Bhopal · 2026</p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          width: "500px", padding: "80px 60px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          borderLeft: `1px solid ${theme.border}`, backgroundColor: "#fff",
        }}>
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "36px", fontWeight: "800", color: theme.dark, marginBottom: "12px", letterSpacing: "-1.5px" }}>
              Create Account.
            </h2>
            <p style={{ color: theme.textSub, fontSize: "15px" }}>Start your journey with a clean AI workspace.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <InputGroup label="Full Name"      icon={<User size={18} />}  type="text"     placeholder="Your full name"    value={form.name}     onChange={(val) => setForm({ ...form, name: val })} />
            <InputGroup label="Email Address"  icon={<Mail size={18} />}  type="email"    placeholder="name@example.com" value={form.email}    onChange={(val) => setForm({ ...form, email: val })} />
            <InputGroup label="Password"       icon={<Lock size={18} />}  type="password" placeholder="Min. 6 characters" value={form.password} onChange={(val) => setForm({ ...form, password: val })} />

            <button type="submit" disabled={loading} className="yn-reg-btn">
              {loading ? "Creating account..." : <><span>Create Free Account</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: theme.textSub }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: theme.primary, fontWeight: "700", textDecoration: "none" }}>Sign in</Link>
          </p>

          <p style={{ marginTop: "auto", textAlign: "center", fontSize: "11px", color: "#d1d5db", letterSpacing: "2px", fontWeight: "600", fontFamily: "'Syne', sans-serif" }}>
            YOURNOTES · BHOPAL · 2026
          </p>
        </div>
      </div>
    </>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
      <div style={{
        width: "44px", height: "44px",
        background: "rgba(255,255,255,.1)",
        borderRadius: "12px", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0,
        border: "1px solid rgba(52,211,153,.2)",
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "4px", fontFamily: "'Syne', sans-serif" }}>{title}</h3>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,.55)", lineHeight: "1.6" }}>{desc}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "11px", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
          {icon}
        </div>
        <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="yn-reg-input" />
      </div>
    </div>
  );
}