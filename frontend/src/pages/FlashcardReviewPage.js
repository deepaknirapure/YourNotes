import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ChevronRight, ChevronLeft, RotateCcw, Check, X, Sparkles, Menu, Plus, Flame } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes flipIn{from{opacity:0;transform:rotateY(90deg) scale(.95)}to{opacity:1;transform:rotateY(0deg) scale(1)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .pg-wrap{display:flex;height:100vh;overflow:hidden;}
  .pg-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .pg-topbar{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .pg-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .pg-content{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;align-items:center;}
  .fc-progress-bar{width:100%;max-width:520px;height:3px;background:rgba(255,255,255,.07);border-radius:99px;margin-bottom:28px;overflow:hidden;}
  .fc-progress-fill{height:100%;background:#E55B2D;border-radius:99px;transition:width .4s ease;}
  .fc-card-wrap{width:100%;max-width:520px;perspective:1000px;cursor:pointer;margin-bottom:20px;}
  .fc-card{background:#111;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:40px 32px;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;animation:flipIn .3s ease;transition:border-color .15s,transform .15s;}
  .fc-card:hover{border-color:rgba(255,255,255,.16);transform:translateY(-2px);}
  .fc-card.flipped{border-color:rgba(229,91,45,.25);background:linear-gradient(135deg,#111 0%,rgba(229,91,45,.04) 100%);}
  .fc-face-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px;}
  .fc-face-label.answer{color:rgba(229,91,45,.7);}
  .fc-card-text{font-size:17px;font-weight:600;color:#fff;line-height:1.55;}
  .fc-hint{font-size:12px;color:rgba(255,255,255,.2);margin-top:20px;}
  .fc-actions{display:flex;gap:10px;width:100%;max-width:520px;margin-bottom:20px;}
  .fc-action-btn{flex:1;padding:10px;border:none;border-radius:8px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .15s;}
  .fc-action-btn:hover{transform:translateY(-1px);}
  .fc-wrong{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);}
  .fc-wrong:hover{background:rgba(239,68,68,.18);}
  .fc-right{background:rgba(16,185,129,.1);color:#10b981;border:1px solid rgba(16,185,129,.2);}
  .fc-right:hover{background:rgba(16,185,129,.18);}
  .fc-meta{font-size:12px;color:rgba(255,255,255,.3);text-align:center;margin-bottom:12px;}
  .fc-score-card{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px;width:100%;max-width:520px;text-align:center;animation:fadeUp .4s both;}
  .fc-score-num{font-size:48px;font-weight:800;color:#E55B2D;line-height:1;margin-bottom:8px;}
  .fc-btn{border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s;}
  .fc-btn-primary{background:#E55B2D;color:#fff;}
  .fc-btn-primary:hover{background:#d14e24;box-shadow:0 4px 14px rgba(229,91,45,.3);}
  .fc-btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.08);}
  .fc-btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff;}
  .fc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;gap:12px;text-align:center;width:100%;max-width:520px;}
  .fc-empty-icon{width:52px;height:52px;background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:12px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);margin-bottom:4px;}
  .fc-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-content{padding:16px;}}
`;

export default function FlashcardReviewPage() {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [score, setScore]           = useState({ correct: 0, wrong: 0 });
  const [done, setDone]             = useState(false);
  const [reviewed, setReviewed]     = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // FIX Bug 3: correct endpoint is /ai/flashcards-due (not /flashcards)
    API.get("/ai/flashcards-due")
      .then(({ data }) => {
        // FIX Bug 4: field is nextReviewDate, not nextReview
        const due = (data || []).filter(fc => {
          if (!fc.nextReviewDate) return true;
          return new Date(fc.nextReviewDate) <= new Date();
        });
        setFlashcards(due);
      })
      .catch(() => toast.error("Flashcards load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  const current = flashcards[currentIdx];
  const progress = flashcards.length ? (reviewed.size / flashcards.length) * 100 : 0;

  const flip = () => setFlipped(f => !f);

  const answer = (correct) => {
    if (!flipped) { toast("Pehle card flip karein!"); return; }
    setReviewed(prev => new Set([...prev, current._id]));
    setScore(s => ({ ...s, [correct ? "correct" : "wrong"]: s[correct ? "correct" : "wrong"] + 1 }));

    // FIX Bug 5: backend expects {quality} (SM-2 scale 0-5), not {correct}.
    // Also fix route prefix: /ai/flashcards/... not /flashcards/...
    API.patch(`/ai/flashcards/${current._id}/review`, { quality: correct ? 5 : 1 }).catch(() => {});

    if (currentIdx < flashcards.length - 1) {
      setCurrentIdx(i => i + 1);
      setFlipped(false);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setFlipped(false);
    setScore({ correct: 0, wrong: 0 });
    setDone(false);
    setReviewed(new Set());
  };

  return (
    <div className="pg-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <CreditCard size={15} color="rgba(255,255,255,.5)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Flashcard Review</span>
          {!done && flashcards.length > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>
              {currentIdx + 1} / {flashcards.length}
            </span>
          )}
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ padding: "64px 0" }}><div className="fc-spinner" /></div>
          ) : flashcards.length === 0 ? (
            <div className="fc-empty">
              <div className="fc-empty-icon"><CreditCard size={22} /></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>Koi due flashcard nahi</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Saare flashcards review ho gaye ya abhi koi scheduled nahi!</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="fc-btn fc-btn-ghost" onClick={() => navigate("/dashboard")}>
                  <Plus size={13} />Create from Notes
                </button>
              </div>
            </div>
          ) : done ? (
            <div className="fc-score-card">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Session Complete!</div>
              <div className="fc-score-num">{Math.round((score.correct / flashcards.length) * 100)}%</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 24 }}>
                ✅ {score.correct} correct · ❌ {score.wrong} wrong · {flashcards.length} total
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="fc-btn fc-btn-primary" onClick={restart}>
                  <RotateCcw size={13} />Review Again
                </button>
                <button className="fc-btn fc-btn-ghost" onClick={() => navigate("/home")}>
                  Go Home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="fc-progress-bar">
                <div className="fc-progress-fill" style={{ width: `${progress}%` }} />
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 20, width: "100%", maxWidth: 520 }}>
                <div style={{ flex: 1, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.15)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{score.correct}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 500 }}>Correct</div>
                </div>
                <div style={{ flex: 1, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444" }}>{score.wrong}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 500 }}>Wrong</div>
                </div>
              </div>

              <div className="fc-card-wrap" onClick={flip}>
                <div className={`fc-card${flipped ? " flipped" : ""}`}>
                  <div className={`fc-face-label${flipped ? " answer" : ""}`}>
                    {flipped ? "✨ Answer" : "❓ Question"}
                  </div>
                  <div className="fc-card-text">
                    {flipped ? (current.back || current.answer || "No answer") : (current.front || current.question || "No question")}
                  </div>
                  {!flipped && <div className="fc-hint">Click to reveal answer</div>}
                </div>
              </div>

              {flipped && (
                <div className="fc-actions" style={{ animation: "fadeUp .2s both" }}>
                  <button className="fc-action-btn fc-wrong" onClick={() => answer(false)}>
                    <X size={15} />Wrong
                  </button>
                  <button className="fc-action-btn fc-right" onClick={() => answer(true)}>
                    <Check size={15} />Correct
                  </button>
                </div>
              )}

              <div className="fc-meta">
                {currentIdx + 1} of {flashcards.length} · {flashcards.length - reviewed.size - (flipped ? 0 : 0)} remaining
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="fc-btn fc-btn-ghost" disabled={currentIdx === 0}
                  onClick={() => { setCurrentIdx(i => i - 1); setFlipped(false); }}>
                  <ChevronLeft size={13} />Prev
                </button>
                <button className="fc-btn fc-btn-ghost"
                  onClick={() => { setCurrentIdx(i => i + 1); setFlipped(false); }}
                  disabled={currentIdx >= flashcards.length - 1}>
                  Skip <ChevronRight size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
