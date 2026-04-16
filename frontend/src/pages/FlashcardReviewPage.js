import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Brain,
  Trophy,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Zap,
  ArrowLeft,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function FlashcardReviewPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const theme = {
    primary: "#10B981",
    primarySoft: "#ECFDF5",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#F3F4F6",
    sidebar: "#F9FAFB",
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get(`${API_URL}/ai/flashcards-due`, { headers })
      .then(({ data }) => {
        setCards(data);
      })
      .catch(() => toast.error("Error loading flashcards"))
      .finally(() => setLoading(false));
  }, []);

  const handleRate = async (quality) => {
    const card = cards[current];
    try {
      await axios.patch(
        `${API_URL}/ai/flashcards/${card._id}/review`,
        { quality },
        { headers },
      );
    } catch {
      toast.error("Error saving review");
    }

    if (current + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrent(current + 1);
      setFlipped(false);
    }
  };

  if (loading) return <LoadingState theme={theme} />;
  if (done || cards.length === 0)
    return (
      <CompletionState theme={theme} navigate={navigate} total={cards.length} />
    );

  const card = cards[current];
  const progress = Math.round((current / cards.length) * 100);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* --- LEFT SIDEBAR: SESSION STATS --- */}
      <aside
        style={{
          width: "300px",
          backgroundColor: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button onClick={() => navigate("/dashboard")} style={backBtn}>
          <ArrowLeft size={16} /> Exit Session
        </button>

        <div style={{ marginTop: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: theme.primary,
              marginBottom: "12px",
            }}
          >
            <Brain size={20} />
            <span
              style={{
                fontWeight: "800",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Focus Mode
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "28px",
              fontWeight: "800",
              letterSpacing: "-1.5px",
              marginBottom: "32px",
            }}
          >
            Active Review.
          </h2>

          <div style={statBox}>
            <p style={statLabel}>Current Progress</p>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              {current + 1}{" "}
              <span style={{ color: "#ccc", fontSize: "16px" }}>
                / {cards.length}
              </span>
            </div>
            <div
              style={{
                height: "6px",
                backgroundColor: "#E5E7EB",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: theme.primary,
                  transition: "0.4s ease",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: "32px" }}>
            <div style={infoRow}>
              <Zap size={14} /> <span>SM-2 Algorithm Active</span>
            </div>
            <div style={infoRow}>
              <CheckCircle2 size={14} /> <span>Bhopal Student Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- RIGHT COLUMN: FLASHCARD CANVAS --- */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 10%",
        }}
      >
        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "380px",
            cursor: "pointer",
            perspective: "1000px",
            transform: flipped ? "rotateY(10px)" : "none",
            transition: "0.4s",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: flipped ? theme.primarySoft : "#fff",
              border: `2px solid ${flipped ? theme.primary : theme.border}`,
              borderRadius: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              textAlign: "center",
              transition: "0.3s",
              boxShadow: "0 20px 40px rgba(0,0,0,0.02)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: theme.primary,
                textTransform: "uppercase",
                marginBottom: "24px",
                letterSpacing: "2px",
              }}
            >
              {flipped ? "The Answer" : "The Question"}
            </p>
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "28px",
                fontWeight: "700",
                lineHeight: "1.4",
              }}
            >
              {flipped ? card.answer : card.question}
            </h3>
            {!flipped && (
              <p
                style={{
                  marginTop: "40px",
                  fontSize: "13px",
                  color: theme.textSub,
                }}
              >
                Click to reveal answer
              </p>
            )}
          </div>
        </div>

        {/* Rating Actions */}
        {flipped && (
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              gap: "12px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <RatingBtn
              label="Again"
              onClick={() => handleRate(1)}
              color="#EF4444"
            />
            <RatingBtn
              label="Hard"
              onClick={() => handleRate(2)}
              color="#F59E0B"
            />
            <RatingBtn
              label="Good"
              onClick={() => handleRate(4)}
              color="#10B981"
            />
            <RatingBtn
              label="Easy"
              onClick={() => handleRate(5)}
              color="#059669"
            />
          </div>
        )}
      </main>
    </div>
  );
}

// --- Internal UI Components ---
function RatingBtn({ label, onClick, color }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        padding: "12px 24px",
        borderRadius: "12px",
        border: `1.5px solid ${color}`,
        backgroundColor: "#fff",
        color: color,
        fontWeight: "700",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      {label}
    </button>
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
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${theme.primarySoft}`,
          borderTopColor: theme.primary,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ fontSize: "14px", fontWeight: "600", color: theme.textSub }}>
        Preparing your session...
      </p>
    </div>
  );
}

function CompletionState({ theme, navigate, total }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        backgroundColor: theme.primarySoft,
      }}
    >
      <div
        style={{
          maxWidth: "450px",
          width: "100%",
          backgroundColor: "#fff",
          padding: "60px 40px",
          borderRadius: "32px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: theme.primarySoft,
            color: theme.primary,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Trophy size={40} />
        </div>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "12px",
          }}
        >
          Session Complete!
        </h2>
        <p style={{ color: theme.textSub, marginBottom: "40px" }}>
          You've reviewed {total} cards today. Your memory strength is
          improving!
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: theme.primary,
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Back to Workspace
        </button>
      </div>
    </div>
  );
}

const backBtn = {
  background: "none",
  border: "none",
  color: "#6B7280",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};
const statBox = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid #F3F4F6",
  marginTop: "32px",
};
const statLabel = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
};
const infoRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "13px",
  color: "#6B7280",
  marginBottom: "12px",
};
