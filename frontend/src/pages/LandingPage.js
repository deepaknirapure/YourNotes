import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  BrainCircuit,
  Share2,
  ArrowRight,
  Star,
  Layout,
  CheckCircle,
  Code,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const theme = {
    primary: "#10B981",
    primaryDark: "#059669",
    bgSoft: "#F0FDF4",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#E5E7EB",
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: "#fff",
        color: theme.dark,
        overflowX: "hidden",
      }}
    >
      {/* --- NAVIGATION --- */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 8%",
          height: "80px",
          borderBottom: `1px solid ${theme.border}`,
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "24px",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>

        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: theme.textSub,
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Sign in
          </Link>
          <button
            onClick={() => navigate("/register")}
            style={{
              backgroundColor: theme.primary,
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              transition: "0.2s",
            }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          padding: "100px 8%",
          alignItems: "center",
          gap: "80px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: theme.bgSoft,
              color: theme.primary,
              padding: "8px 16px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: "700",
              marginBottom: "24px",
            }}
          >
            <CheckCircle size={14} /> 100% FREE FOR STUDENTS
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "72px",
              lineHeight: "1.05",
              letterSpacing: "-3.5px",
              marginBottom: "28px",
            }}
          >
            Capture ideas. <br />
            <span style={{ color: theme.primary }}>Study faster.</span>
          </h1>
          <p
            style={{
              fontSize: "19px",
              color: theme.textSub,
              marginBottom: "40px",
              maxWidth: "540px",
              lineHeight: "1.7",
            }}
          >
            A minimalist, AI-powered workspace designed for the modern student.
            Organize your subjects, generate flashcards, and summarize notes
            instantly.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={() => navigate("/register")} style={btnPrimary}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <a href="#features" style={btnSecondary}>
              Explore Features
            </a>
          </div>
        </div>

        {/* Feature Preview Card */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              backgroundColor: theme.bgSoft,
              padding: "50px",
              borderRadius: "40px",
              border: `1px solid rgba(16, 185, 129, 0.1)`,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "32px",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: theme.bgSoft,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BrainCircuit size={18} color={theme.primary} />
                </div>
                <span
                  style={{
                    color: theme.primary,
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "1px",
                  }}
                >
                  AI ANALYSIS
                </span>
              </div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                PLC & SCADA Recap
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: theme.textSub,
                  lineHeight: "1.6",
                }}
              >
                Industrial automation logic built during the 5-week CRISP
                internship in Bhopal (2025)...
              </p>
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${theme.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: theme.primary,
                  }}
                >
                  ✨ Key Points Extracted
                </span>
                <div style={{ display: "flex", gap: "2px" }}>
                  <Star size={12} fill={theme.primary} color={theme.primary} />
                  <Star size={12} fill={theme.primary} color={theme.primary} />
                  <Star size={12} fill={theme.primary} color={theme.primary} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section
        id="features"
        style={{ padding: "120px 8%", backgroundColor: "#fafafa" }}
      >
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "42px",
              letterSpacing: "-2px",
              marginBottom: "16px",
            }}
          >
            Everything you need to excel.
          </h2>
          <p style={{ color: theme.textSub, fontSize: "17px" }}>
            No paid plans. No limits. Just pure productivity.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <FeatureCard
            icon={<Zap size={24} color={theme.primary} />}
            title="Instant Summaries"
            desc="One click to get a structured summary and key points from any note, powered by Gemini AI."
          />
          <FeatureCard
            icon={<Layout size={24} color={theme.primary} />}
            title="Clean Organization"
            desc="Color-coded folders and searchable tags. Keep your subjects perfectly organized."
          />
          <FeatureCard
            icon={<Share2 size={24} color={theme.primary} />}
            title="Easy Sharing"
            desc="Generate a public link to share any note with classmates instantly. No login needed."
          />
        </div>
      </section>

      {/* --- TECH STACK STRIP --- */}
      <div
        style={{
          padding: "40px 8%",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
          opacity: 0.6,
        }}
      >
        <div style={stackItem}>
          <Code size={16} /> MongoDB
        </div>
        <div style={stackItem}>
          <Code size={16} /> Express
        </div>
        <div style={stackItem}>
          <Code size={16} /> React
        </div>
        <div style={stackItem}>
          <Code size={16} /> Node.js
        </div>
        <div style={stackItem}>
          <Zap size={16} /> Gemini AI
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer
        style={{
          padding: "80px 8% 40px",
          borderTop: `1px solid ${theme.border}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: "800",
            fontSize: "20px",
            marginBottom: "16px",
          }}
        >
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: theme.textSub,
            marginBottom: "8px",
          }}
        >
          Diploma Final Year Project · S.V. Polytechnic College, Bhopal
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "#ccc",
            marginTop: "24px",
            letterSpacing: "1px",
          }}
        >
          © 2026 FOREVER FREE FOR STUDENTS
        </p>
      </footer>
    </div>
  );
}

// --- Internal Components & Styles ---
const btnPrimary = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "16px 32px",
  borderRadius: "14px",
  backgroundColor: "#10B981",
  color: "#fff",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  transition: "0.3s",
  fontSize: "16px",
};

const btnSecondary = {
  padding: "16px 32px",
  borderRadius: "14px",
  backgroundColor: "#F0FDF4",
  color: "#10B981",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  fontSize: "16px",
};

const stackItem = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B7280",
};

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "48px 40px",
        borderRadius: "28px",
        border: "1px solid #E5E7EB",
        transition: "0.3s",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          backgroundColor: "#F0FDF4",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "28px",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "22px",
          marginBottom: "16px",
          fontWeight: "700",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "#6B7280", fontSize: "15px", lineHeight: "1.7" }}>
        {desc}
      </p>
    </div>
  );
}
