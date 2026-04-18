import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCard, CheckCircle2, Trophy } from "lucide-react";
import API from "../api/axios";

export default function FlashcardReviewPage() {
  const navigate  = useNavigate();

  const [cards,   setCards]   = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done,    setDone]    = useState(false);
  const [stats,   setStats]   = useState({ reviewed: 0, total: 0 });

  useEffect(() => {
    API.get("/ai/flashcards-due")
      .then(({ data }) => { setCards(data); setStats({ reviewed: 0, total: data.length }); })
      .catch(() => toast.error("Error loading flashcards"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.code === "Space") { e.preventDefault(); setFlipped(f => !f); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleRate = async (quality) => {
    const card = cards[current];
    try {
      await API.patch(`/ai/flashcards/${card._id}/review`, { quality });
      const labels = ["Again","Hard","Hard","Good","Good","Easy"];
      toast.success(`Marked as ${labels[quality]}`);
    } catch { toast.error("Error saving review"); }
    const next = current + 1;
    if (next >= cards.length) { setDone(true); setStats(s => ({ ...s, reviewed: s.total })); }
    else { setCurrent(next); setFlipped(false); setStats(s => ({ ...s, reviewed: next })); }
  };

  const progress = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;
  const card = cards[current];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes ynFadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ynSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fc-card { background: #111; border: 1px solid rgba(255,255,255,.09); border-radius: 20px; padding: 48px 44px; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; cursor: pointer; transition: border-color .2s, box-shadow .2s; animation: ynFadeUp .5s cubic-bezier(.16,1,.3,1) both; user-select: none; }
        .fc-card:hover { border-color: rgba(229,91,45,.3); }
        .fc-card.flipped { border-color: rgba(229,91,45,.4); box-shadow: 0 0 40px rgba(229,91,45,.08); }
        .fc-rate-btn { padding: 13px 10px; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; border: none; cursor: pointer; transition: all .2s; flex: 1; }
        .fc-rate-btn:hover { transform: translateY(-2px); }
        .fc-nav-btn { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.6); padding: 10px 20px; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
        .fc-nav-btn:hover { background: rgba(255,255,255,.1); color: #fff; }
        @media (max-width: 600px) { .fc-card { padding: 32px 20px !important; min-height: 220px !important; } .fc-top-logo { display: none !important; } }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: "1px", height: "200%", background: "rgba(255,255,255,0.018)", left: `${10 + i * 20}%`, top: "-50%", transform: "rotate(15deg)" }} />
        ))}
        <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(229,91,45,.06) 0%, transparent 70%)" }} />
      </div>

      {/* Top Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", zIndex: 10 }}>
        <button className="fc-nav-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        <div className="fc-top-logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#E55B2D", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
            Your<span style={{ color: "#E55B2D" }}>Notes</span>
            <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 400 }}> · Flashcards</span>
          </span>
        </div>
        <div style={{ width: 120 }} />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", animation: "ynFadeUp .5s both", zIndex: 1 }}>
          <div style={{ width: 36, height: 36, border: "2px solid rgba(229,91,45,.25)", borderTopColor: "#E55B2D", borderRadius: "50%", animation: "ynSpin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Loading flashcards...</p>
        </div>
      )}

      {/* Done screen */}
      {!loading && done && (
        <div style={{ textAlign: "center", maxWidth: 440, animation: "ynFadeUp .6s both", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Trophy size={56} color="#E55B2D" />
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: "-1.2px", marginBottom: 12 }}>Session Complete!</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.45)", marginBottom: 8 }}>
            Aapne <strong style={{ color: "#E55B2D" }}>{stats.total}</strong> flashcards review kiye.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.3)", marginBottom: 36 }}>Kal phir review schedule hoga based on your performance.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="fc-nav-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <button style={{ background: "#E55B2D", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => { setCurrent(0); setFlipped(false); setDone(false); setStats(s => ({ ...s, reviewed: 0 })); }}>
              Restart →
            </button>
          </div>
        </div>
      )}

      {/* All Clear */}
      {!loading && !done && cards.length === 0 && (
        <div style={{ textAlign: "center", zIndex: 1, animation: "ynFadeUp .5s both" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <CheckCircle2 size={52} color="#10b981" />
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#fff", marginBottom: 10 }}>Sab Clear!</h2>
          <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 28 }}>Aaj ke liye koi flashcard due nahi hai.</p>
          <button className="fc-nav-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
      )}

      {/* Cards */}
      {!loading && !done && card && (
        <div style={{ width: "100%", maxWidth: 600, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{stats.reviewed + 1} / {stats.total}</span>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 99, margin: "0 16px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#E55B2D", borderRadius: 99, transition: "width .4s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>

          <div className={`fc-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)} key={`${current}-${flipped}`}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: flipped ? "#E55B2D" : "rgba(255,255,255,.3)", letterSpacing: ".1em", textTransform: "uppercase" }}>
                {flipped ? "ANSWER" : "QUESTION"}
              </span>
            </div>
            <p style={{ fontSize: flipped ? 18 : 22, fontWeight: flipped ? 500 : 700, color: "#fff", lineHeight: 1.5, maxWidth: 460 }}>
              {flipped ? card.answer : card.question}
            </p>
            {!flipped && (
              <p style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,.2)", letterSpacing: ".06em" }}>
                CLICK TO REVEAL · SPACE KEY
              </p>
            )}
          </div>

          {flipped && (
            <div style={{ display: "flex", gap: 10, marginTop: 20, animation: "ynFadeUp .35s both" }}>
              {[
                { label: "Again", q: 0, bg: "rgba(239,68,68,.15)", bc: "rgba(239,68,68,.25)", c: "#ef4444" },
                { label: "Hard",  q: 2, bg: "rgba(245,158,11,.12)", bc: "rgba(245,158,11,.22)", c: "#f59e0b" },
                { label: "Good",  q: 4, bg: "rgba(16,185,129,.12)", bc: "rgba(16,185,129,.22)", c: "#10b981" },
                { label: "Easy",  q: 5, bg: "rgba(229,91,45,.12)",  bc: "rgba(229,91,45,.22)",  c: "#E55B2D" },
              ].map(({ label, q, bg, bc, c }) => (
                <button key={label} className="fc-rate-btn" onClick={() => handleRate(q)}
                  style={{ background: bg, border: `1px solid ${bc}`, color: c }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {!flipped && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button className="fc-nav-btn" onClick={() => setFlipped(true)}>Show Answer →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
