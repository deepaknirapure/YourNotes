import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { YN_CSS, useNeuralCanvas, useCursor } from "./NeuralBackground";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const EXTRA_CSS = `
  .fc-rate-btn {
    padding: 13px 8px; border-radius: 12px;
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: .82rem; cursor: pointer;
    transition: all .2s; text-align: center;
    border: 1px solid;
  }
  .fc-rate-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,.35); }
`;

export default function FlashcardReviewPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const headers  = { Authorization: `Bearer ${token}` };

  const [cards,   setCards]   = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done,    setDone]    = useState(false);
  const [stats,   setStats]   = useState({ reviewed: 0, total: 0 });

  const neuralRef    = useRef(null);
  const mouseRef     = useRef({ x: null, y: null });
  const cursorRef    = useRef(null);
  const cursorDotRef = useRef(null);

  useNeuralCanvas(neuralRef);
  useCursor(mouseRef, cursorRef, cursorDotRef);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get(`${API_URL}/ai/flashcards-due`, { headers })
      .then(({ data }) => { setCards(data); setStats({ reviewed: 0, total: data.length }); })
      .catch(() => toast.error("Error loading flashcards"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.code === "Space") { e.preventDefault(); setFlipped(f => !f); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleRate = async (quality) => {
    const card = cards[current];
    try {
      await axios.patch(`${API_URL}/ai/flashcards/${card._id}/review`, { quality }, { headers });
      const labels = ["Again","Hard","Hard","Good","Good","Easy"];
      toast.success(`Marked as ${labels[quality]}`);
    } catch { toast.error("Error saving review"); }
    const next = current + 1;
    if (next >= cards.length) { setDone(true); setStats(s => ({ ...s, reviewed: s.total })); }
    else { setCurrent(next); setFlipped(false); setStats(s => ({ ...s, reviewed: next })); }
  };

  const Shell = ({ children }) => (
    <>
      <style>{YN_CSS + EXTRA_CSS}</style>
      <div ref={cursorRef}    className="yn-cursor-ring" />
      <div ref={cursorDotRef} className="yn-cursor-dot"  />
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex: 0 }} />
      <div style={{ minHeight: "100vh", position: "relative", zIndex: 10 }}>
        {children}
      </div>
    </>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <Shell>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 34, height: 34, border: "1.5px solid rgba(16,185,129,.3)", borderTopColor: "#10B981", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".72rem", color: "rgba(240,255,248,.35)", letterSpacing: "2px" }}>LOADING CARDS…</p>
      </div>
    </Shell>
  );

  // ── Done / Empty ────────────────────────────────────────────────────────────
  if (done || cards.length === 0) return (
    <Shell>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 480, animation: "fadeUp .7s both" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px", fontSize: 30,
          }}>
            {cards.length === 0 ? "🎉" : "✓"}
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: ".65rem", letterSpacing: "4px", color: "#10B981", marginBottom: 16 }}>
            // SESSION END
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#f0fff8", marginBottom: 12, letterSpacing: -1 }}>
            {cards.length === 0 ? "All caught up!" : "Session complete!"}
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(240,255,248,.5)", marginBottom: 8, lineHeight: 1.7 }}>
            {cards.length === 0 ? "No flashcards due — check back later." : `You reviewed ${stats.total} flashcard${stats.total !== 1 ? "s" : ""}.`}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ".8rem", color: "rgba(240,255,248,.3)", marginBottom: 44, letterSpacing: "0.5px" }}>
            Great work keeping up with your studies.
          </p>
          <button onClick={() => navigate("/dashboard")} className="yn-btn-primary" style={{ padding: "13px 36px" }}>
            Back to dashboard
          </button>
        </div>
      </div>
    </Shell>
  );

  const card     = cards[current];
  const progress = Math.round((stats.reviewed / stats.total) * 100);

  return (
    <Shell>
      {/* ── Topbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5,15,10,.8)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(16,185,129,.12)",
        padding: "0 5%", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Wordmark */}
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.3px" }}>
            Your<span style={{ color: "#10B981" }}>Notes</span>
          </span>
          <span style={{ color: "rgba(255,255,255,.1)" }}>·</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ".72rem", color: "rgba(240,255,248,.35)", letterSpacing: "1px", textTransform: "uppercase" }}>
            Flashcard Review
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ".72rem", color: "rgba(240,255,248,.35)" }}>
            {stats.reviewed} / {stats.total}
          </span>
          <button onClick={() => navigate("/dashboard")} style={{
            padding: "7px 16px", background: "transparent",
            border: "1px solid rgba(16,185,129,.2)", borderRadius: 100,
            fontSize: "12px", color: "rgba(240,255,248,.45)", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "border-color .2s",
          }}>
            Exit
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 2, background: "rgba(255,255,255,.05)" }}>
        <div style={{ height: 2, background: "#10B981", width: `${progress}%`, transition: "width .4s ease", boxShadow: "0 0 8px #10B981" }} />
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>

        {/* Card flip scene */}
        <div style={{ perspective: 1200, height: 280, marginBottom: 24 }}>
          <div key={current} style={{
            width: "100%", height: "100%", position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform .65s cubic-bezier(.4,0,.2,1)",
            transform: flipped ? "rotateY(180deg)" : "none",
          }}>
            {/* Front */}
            <div style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "rgba(16,185,129,.04)", border: "1px solid rgba(16,185,129,.15)",
              borderRadius: 24,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: 40, textAlign: "center",
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ".62rem", letterSpacing: "3px", color: "rgba(16,185,129,.6)", marginBottom: 16, textTransform: "uppercase" }}>
                Question · {current + 1}/{stats.total}
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.45, color: "#f0fff8" }}>
                {card.question}
              </p>
            </div>

            {/* Back */}
            <div style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)",
              background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.3)",
              borderRadius: 24,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: 40, textAlign: "center",
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ".62rem", letterSpacing: "3px", color: "rgba(16,185,129,.6)", marginBottom: 16, textTransform: "uppercase" }}>
                Answer
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.45, color: "#f0fff8", marginBottom: 12 }}>
                {card.question}
              </p>
              <div style={{ height: 1, width: "60%", background: "rgba(16,185,129,.2)", margin: "12px 0" }} />
              <p style={{ fontSize: ".92rem", color: "rgba(240,255,248,.65)", lineHeight: 1.75 }}>
                {card.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!flipped ? (
          <div style={{ textAlign: "center" }}>
            <button onClick={() => setFlipped(true)} className="yn-btn-primary" style={{ padding: "14px 52px", fontSize: ".92rem" }}>
              Show answer
            </button>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ".66rem", color: "rgba(240,255,248,.3)", marginTop: 12, letterSpacing: "1px", textTransform: "uppercase" }}>
              Press Space to flip
            </p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: ".66rem", color: "rgba(240,255,248,.4)", marginBottom: 16, letterSpacing: "2px", textTransform: "uppercase" }}>
              How well did you know this?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { label: "Again", quality: 1, color: "#f87171",  border: "rgba(248,113,113,.25)", bg: "rgba(239,68,68,.08)"   },
                { label: "Hard",  quality: 2, color: "#fbbf24",  border: "rgba(251,191,36,.25)",  bg: "rgba(245,158,11,.08)"  },
                { label: "Good",  quality: 4, color: "#10B981",  border: "rgba(16,185,129,.3)",   bg: "rgba(16,185,129,.08)"  },
                { label: "Easy",  quality: 5, color: "#4ade80",  border: "rgba(74,222,128,.25)",  bg: "rgba(74,222,128,.07)"  },
              ].map(r => (
                <button key={r.label} className="fc-rate-btn"
                  onClick={() => handleRate(r.quality)}
                  style={{ color: r.color, borderColor: r.border, background: r.bg }}>
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}