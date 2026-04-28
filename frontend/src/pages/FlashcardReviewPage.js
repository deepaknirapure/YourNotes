import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ChevronRight, ChevronLeft, RotateCcw, Check, X, Sparkles, Menu, Plus, Brain, Target } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes flipIn { from { opacity: 0; transform: rotateY(90deg) scale(0.95); } to { opacity: 1; transform: rotateY(0deg) scale(1); } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  
  /* Sleek Topbar */
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  .pg-content { 
    flex: 1; overflow-y: auto; padding: 40px 24px; display: flex; 
    flex-direction: column; align-items: center; scrollbar-width: none;
  }
  
  /* Progress Bar */
  .fc-progress-bar { 
    width: 100%; max-width: 560px; height: 6px; background: #F1F5F9; 
    border-radius: 99px; margin-bottom: 32px; overflow: hidden; 
  }
  .fc-progress-fill { height: 100%; background: #E55B2D; border-radius: 99px; transition: width 0.4s ease; }
  
  /* Score Headers */
  .fc-score-header { 
    display: flex; gap: 16px; margin-bottom: 24px; width: 100%; max-width: 560px; 
  }
  .fc-score-box { 
    flex: 1; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid; 
  }
  .fc-score-correct { background: #ECFDF5; border-color: #D1FAE5; }
  .fc-score-wrong { background: #FEF2F2; border-color: #FEE2E2; }
  
  /* Flashcard Container */
  .fc-card-wrap { width: 100%; max-width: 560px; perspective: 1000px; cursor: pointer; margin-bottom: 24px; }
  
  .fc-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 20px; 
    padding: 48px 40px; min-height: 260px; display: flex; flex-direction: column; 
    align-items: center; justify-content: center; text-align: center; 
    animation: flipIn 0.3s ease; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  }
  .fc-card:hover { border-color: #CBD5E1; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); }
  
  /* Flipped State */
  .fc-card.flipped { border-color: #FFE4DB; background: #FFF5F2; }
  
  /* Badges inside card */
  .fc-face-label { 
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; 
    color: #64748B; margin-bottom: 20px; background: #F1F5F9; padding: 4px 12px; border-radius: 100px;
  }
  .fc-face-label.answer { color: #E55B2D; background: #FFF; border: 1px solid #FFE4DB; }
  
  .fc-card-text { font-size: 20px; font-weight: 600; color: #0F172A; line-height: 1.6; }
  .fc-hint { font-size: 13px; color: #94A3B8; margin-top: 24px; font-weight: 500; }
  
  /* Action Buttons */
  .fc-actions { display: flex; gap: 16px; width: 100%; max-width: 560px; margin-bottom: 24px; }
  .fc-action-btn { 
    flex: 1; padding: 14px; border: none; border-radius: 12px; font-size: 14px; 
    font-weight: 600; font-family: inherit; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 8px; transition: 0.2s; 
  }
  .fc-wrong { background: #FEF2F2; color: #EF4444; border: 1px solid #FEE2E2; }
  .fc-wrong:hover { background: #FEE2E2; transform: translateY(-1px); }
  .fc-right { background: #ECFDF5; color: #10B981; border: 1px solid #D1FAE5; }
  .fc-right:hover { background: #D1FAE5; transform: translateY(-1px); }
  
  .fc-meta { font-size: 13px; color: #64748B; font-weight: 500; text-align: center; margin-bottom: 16px; }
  
  /* Navigation Buttons */
  .fc-btn { 
    border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; 
    font-weight: 600; font-family: inherit; cursor: pointer; display: flex; 
    align-items: center; gap: 8px; transition: 0.2s; 
  }
  .fc-btn-primary { background: #0F172A; color: #FFF; }
  .fc-btn-primary:hover { background: #E55B2D; transform: translateY(-1px); }
  .fc-btn-ghost { background: #FFF; color: #64748B; border: 1px solid #E2E8F0; }
  .fc-btn-ghost:hover:not(:disabled) { background: #F8FAFC; color: #0F172A; }
  .fc-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* End Screen Card */
  .fc-score-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 20px; 
    padding: 48px; width: 100%; max-width: 560px; text-align: center; 
    animation: fadeUp 0.4s both; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  }
  .fc-score-num { font-size: 56px; font-weight: 800; color: #E55B2D; line-height: 1; margin-bottom: 12px; letter-spacing: -1px; }
  
  /* Empty State */
  .fc-empty { 
    display: flex; flex-direction: column; align-items: center; justify-content: center; 
    padding: 80px 24px; gap: 16px; text-align: center; width: 100%; max-width: 560px; 
  }
  .fc-empty-icon { 
    width: 64px; height: 64px; background: #F8FAFC; border: 1px solid #E2E8F0; 
    border-radius: 16px; display: flex; align-items: center; justify-content: center; 
    color: #94A3B8; margin-bottom: 8px; 
  }
  
  .fc-spinner { width: 24px; height: 24px; border: 3px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) {
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; min-width: 38px; height: 38px; align-items: center !important; justify-content: center !important; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content, .saas-main, .flashcard-wrap { padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important; padding-left: 16px !important; padding-right: 16px !important; } 
    .pg-menu-btn { display: flex !important; background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; border-radius: 10px !important; padding: 8px !important; min-width: 38px; min-height: 38px; }
    .pg-topbar { padding: 0 14px !important; height: 56px !important; }
    .pg-content { padding: 16px !important; } 
    .fc-score-header { flex-direction: column; gap: 12px; }
    .fc-card-wrap { padding: 16px !important; }
    .fc-card { min-height: 200px !important; font-size: 18px !important; padding: 24px !important; border-radius: 16px !important; }
    .fc-action-row { gap: 10px !important; }
    .fc-action-row button { flex: 1; padding: 12px !important; font-size: 14px !important; }
  }
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
    API.get("/ai/flashcards-due")
      .then(({ data }) => {
        const due = (data || []).filter(fc => {
          if (!fc.nextReviewDate) return true;
          return new Date(fc.nextReviewDate) <= new Date();
        });
        setFlashcards(due);
      })
      .catch(() => toast.error("Could not load flashcards"))
      .finally(() => setLoading(false));
  }, []);

  const current = flashcards[currentIdx];
  const progress = flashcards.length ? (reviewed.size / flashcards.length) * 100 : 0;

  const flip = () => setFlipped(f => !f);

  const answer = (correct) => {
    if (!flipped) { toast("Please flip the card first to see the answer."); return; }
    setReviewed(prev => new Set([...prev, current?._id]));
    setScore(s => ({ ...s, [correct ? "correct" : "wrong"]: s[correct ? "correct" : "wrong"] + 1 }));

    // Added optional chaining here for safety
    if (current?._id) {
      API.patch(`/ai/flashcards/${current._id}/review`, { quality: correct ? 5 : 1 }).catch(() => {});
    }

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
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <div className="pg-main">
        {/* Clean Top Navigation */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          {/* Fixed the typo here: justify-content -> justifyContent */}
          <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={14} color="#64748B" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>Active Review</span>
          {!done && flashcards.length > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748B", fontWeight: 600, background: "#F8FAFC", padding: "4px 10px", borderRadius: "100px", border: "1px solid #E2E8F0" }}>
              Card {currentIdx + 1} of {flashcards.length}
            </span>
          )}
        </div>

        <div className="pg-content">
          {loading ? (
            <div style={{ padding: "80px 0" }}><div className="fc-spinner" /></div>
          ) : flashcards.length === 0 ? (
            <div className="fc-empty">
              <div className="fc-empty-icon"><Sparkles size={28} /></div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>You're all caught up!</div>
              <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5, maxWidth: 300 }}>
                No flashcards are due for review right now. You can create more from your notes or take a break.
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button className="fc-btn fc-btn-primary" onClick={() => navigate("/dashboard")}>
                  <Plus size={16} /> Create New Cards
                </button>
              </div>
            </div>
          ) : done ? (
            <div className="fc-score-card">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target size={32} color="#E55B2D" />
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>Session Complete</div>
              <div className="fc-score-num">{Math.round((score.correct / flashcards.length) * 100)}%</div>
              
              <div style={{ display: "flex", gap: 16, justifyContent: "center", margin: "24px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#10B981" }}>
                  <Check size={16} /> {score.correct} Correct
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#EF4444" }}>
                  <X size={16} /> {score.wrong} Needs Work
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
                <button className="fc-btn fc-btn-primary" onClick={restart}>
                  <RotateCcw size={16} /> Review Again
                </button>
                <button className="fc-btn fc-btn-ghost" onClick={() => navigate("/home")}>
                  Return Home
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="fc-progress-bar">
                <div className="fc-progress-fill" style={{ width: `${progress}%` }} />
              </div>

              {/* Dynamic Score Trackers */}
              <div className="fc-score-header">
                <div className="fc-score-box fc-score-correct">
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#10B981", lineHeight: 1 }}>{score.correct}</div>
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Mastered</div>
                </div>
                <div className="fc-score-box fc-score-wrong">
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#EF4444", lineHeight: 1 }}>{score.wrong}</div>
                  <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>Learning</div>
                </div>
              </div>

              {/* Flashcard Body */}
              <div className="fc-card-wrap" onClick={flip}>
                <div className={`fc-card ${flipped ? "flipped" : ""}`}>
                  <div className={`fc-face-label ${flipped ? "answer" : ""}`}>
                    {flipped ? "Answer" : "Question"}
                  </div>
                  <div className="fc-card-text">
                    {flipped ? (current?.back || current?.answer || "No answer available") : (current?.front || current?.question || "No question available")}
                  </div>
                  {!flipped && <div className="fc-hint">Click anywhere on the card to reveal</div>}
                </div>
              </div>

              {/* Action Buttons (Correct / Wrong) */}
              {flipped && (
                <div className="fc-actions" style={{ animation: "fadeUp .2s both" }}>
                  <button className="fc-action-btn fc-wrong" onClick={() => answer(false)}>
                    <X size={18} /> Needs Review
                  </button>
                  <button className="fc-action-btn fc-right" onClick={() => answer(true)}>
                    <Check size={18} /> Got It Right
                  </button>
                </div>
              )}

              {/* Bottom Nav Controls */}
              <div className="fc-meta">
                Card {currentIdx + 1} of {flashcards.length} · {flashcards.length - reviewed.size} remaining
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="fc-btn fc-btn-ghost" disabled={currentIdx === 0}
                  onClick={() => { setCurrentIdx(i => i - 1); setFlipped(false); }}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <button className="fc-btn fc-btn-ghost"
                  onClick={() => { setCurrentIdx(i => i + 1); setFlipped(false); }}
                  disabled={currentIdx >= flashcards.length - 1}>
                  Skip <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Mobile bottom navigation - sab pages pe consistent */}
      <MobileNav />
    </div>
  );
}