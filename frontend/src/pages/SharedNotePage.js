import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Globe,
  Calendar,
  User,
  ArrowRight,
  FileText,
  Sparkles,
  Share2,
  BookOpen,
} from "lucide-react";
import API from "../api/axios";

export default function SharedNotePage() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const theme = {
    primary: "#10B981",
    primarySoft: "#ECFDF5",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#F3F4F6",
    bgSidebar: "#F9FAFB",
  };

  useEffect(() => {
    API.get(`/notes/shared/${token}`)
      .then(({ data }) => setNote(data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Note not found or link expired",
        ),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState theme={theme} />;
  if (error) return <ErrorState theme={theme} error={error} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* --- TOP BAR (Minimal) --- */}
      <nav
        style={{
          height: "72px",
          borderBottom: `1px solid ${theme.border}`,
          padding: "0 8%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ color: theme.dark }}>Your</span>
          <span style={{ color: theme.primary }}>Notes.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: theme.textSub,
              textTransform: "uppercase",
              letterSpacing: "1px",
              backgroundColor: theme.border,
              padding: "4px 10px",
              borderRadius: "6px",
            }}
          >
            View Only
          </span>
          <Link to="/register" style={btnCtaNav}>
            Get Your Free Account
          </Link>
        </div>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          maxWidth: "1200px",
          margin: "0 auto",
          gap: "60px",
          padding: "80px 24px",
        }}
      >
        {/* --- LEFT COLUMN: NOTE CONTENT --- */}
        <article>
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            {note.folder && <span style={badge}>{note.folder.name}</span>}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: theme.textSub,
              }}
            >
              <Calendar size={14} />{" "}
              {new Date(note.updatedAt).toLocaleDateString("en-IN")}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "52px",
              fontWeight: "800",
              letterSpacing: "-2.5px",
              lineHeight: "1.1",
              marginBottom: "32px",
              color: theme.dark,
            }}
          >
            {note.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: theme.primary,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              {note.author?.[0]?.toUpperCase() || "U"}
            </div>
            <span
              style={{ fontSize: "15px", fontWeight: "600", color: theme.dark }}
            >
              {note.author || "Guest Author"}
            </span>
          </div>

          <div
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              color: "#374151",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {note.plainText || note.content || "This note has no content."}
          </div>
        </article>

        {/* --- RIGHT COLUMN: CTA SIDEBAR --- */}
        <aside
          style={{ position: "sticky", top: "152px", height: "fit-content" }}
        >
          <div
            style={{
              backgroundColor: theme.bgSidebar,
              padding: "32px",
              borderRadius: "24px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "20px",
                fontWeight: "800",
                marginBottom: "16px",
              }}
            >
              Take smarter notes.
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: theme.textSub,
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              Bhopal ke students ke liye built YourNotes AI summaries aur
              flashcards provide karta hai—woh bhi bilkul free.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "32px",
              }}
            >
              <FeatureRow
                icon={<Sparkles size={16} />}
                text="AI Note Summaries"
              />
              <FeatureRow
                icon={<BookOpen size={16} />}
                text="Smart Flashcards"
              />
              <FeatureRow icon={<Share2 size={16} />} text="Instant Sharing" />
            </div>

            <Link to="/register" style={btnCtaFull}>
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "11px",
              color: "#ccc",
              letterSpacing: "2px",
              fontWeight: "700",
            }}
          >
            YOURNOTES · 2026
          </p>
        </aside>
      </div>
    </div>
  );
}

// --- Internal UI Components ---
function FeatureRow({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#111827",
      }}
    >
      <div style={{ color: "#10B981" }}>{icon}</div>
      {text}
    </div>
  );
}

function LoadingState({ theme }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: `3px solid ${theme.primarySoft}`,
          borderTopColor: theme.primary,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: theme.textSub,
          letterSpacing: "2px",
        }}
      >
        READING NOTE...
      </p>
    </div>
  );
}

function ErrorState({ theme, error }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          textAlign: "center",
          padding: "48px",
          borderRadius: "32px",
          backgroundColor: theme.bgSidebar,
          border: `1px solid ${theme.border}`,
        }}
      >
        <Globe
          size={48}
          color={theme.textSub}
          style={{ marginBottom: "24px" }}
        />
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "24px",
            fontWeight: "800",
            marginBottom: "12px",
          }}
        >
          Link Expired
        </h2>
        <p
          style={{
            color: theme.textSub,
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          {error}
        </p>
        <Link
          to="/"
          style={{
            color: theme.primary,
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          Go to Homepage →
        </Link>
      </div>
    </div>
  );
}

const btnCtaNav = {
  backgroundColor: "#10B981",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "700",
  textDecoration: "none",
};
const btnCtaFull = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  backgroundColor: "#111827",
  color: "#fff",
  padding: "16px",
  borderRadius: "14px",
  fontSize: "14px",
  fontWeight: "700",
  textDecoration: "none",
};
const badge = {
  backgroundColor: "#ECFDF5",
  color: "#10B981",
  padding: "4px 12px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
};
