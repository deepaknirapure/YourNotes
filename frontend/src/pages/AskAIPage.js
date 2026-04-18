import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Bot, User, Loader, X, ChevronDown,
  Sparkles, BookOpen, Trash2, RotateCcw, Copy, Check,
  Lightbulb, FlaskConical, Calculator, Globe, Atom
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

// ── Suggested prompts by category ────────────────────────────────────────────
const SUGGESTIONS = [
  {
    category: "Concept Explain",
    icon: <Lightbulb size={14} />,
    color: "#f59e0b",
    prompts: [
      "Newton ke 3 laws of motion simple bhasha mein samjhao",
      "Photosynthesis kya hota hai? Steps ke saath batao",
      "Ohm's Law kya hai aur kahan use hota hai?",
      "DNA replication ka process explain karo",
    ],
  },
  {
    category: "Maths Help",
    icon: <Calculator size={14} />,
    color: "#8b5cf6",
    prompts: [
      "Quadratic equation solve karne ke 3 tarike batao",
      "Integration aur differentiation mein kya fark hai?",
      "Probability ke basic rules samjhao with examples",
      "Trigonometry ke saare formulas ek jagah do",
    ],
  },
  {
    category: "Exam Prep",
    icon: <BookOpen size={14} />,
    color: "#E55B2D",
    prompts: [
      "JEE Physics ke liye sabse important topics kaunse hain?",
      "NEET Biology mein zyada marks kaise laayein?",
      "Last minute revision ke liye best strategy kya hai?",
      "MCQ mein eliminate karne ka technique batao",
    ],
  },
  {
    category: "Science",
    icon: <Atom size={14} />,
    color: "#10b981",
    prompts: [
      "Periodic table ke trends explain karo",
      "Human digestive system ka diagram se explain",
      "Electromagnetic waves kya hoti hain?",
      "Chemical bonding types kaunse hain?",
    ],
  },
];

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy && onCopy();
  };

  const isAI = msg.role === "assistant";

  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      flexDirection: isAI ? "row" : "row-reverse",
      marginBottom: 20,
      animation: "ynFadeUp .3s cubic-bezier(.16,1,.3,1) both",
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isAI ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "linear-gradient(135deg,#E55B2D,#c94d23)",
        marginTop: 2,
      }}>
        {isAI ? <Bot size={15} color="#fff" /> : <User size={15} color="#fff" />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "72%",
        background: isAI ? "#111" : "rgba(229,91,45,.1)",
        border: `1px solid ${isAI ? "rgba(255,255,255,.08)" : "rgba(229,91,45,.2)"}`,
        borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        padding: "12px 16px",
        position: "relative",
        group: true,
      }}>
        <div style={{
          fontSize: 14, lineHeight: 1.75,
          color: isAI ? "rgba(255,255,255,.88)" : "rgba(255,255,255,.9)",
          fontFamily: "'Inter', sans-serif",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>

        {/* Copy button — only for AI messages */}
        {isAI && (
          <button onClick={handleCopy} style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(255,255,255,.06)", border: "none",
            borderRadius: 6, padding: "3px 6px", cursor: "pointer",
            color: copied ? "#10b981" : "rgba(255,255,255,.3)",
            display: "flex", alignItems: "center", gap: 3,
            fontSize: 11, transition: "all .2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = copied ? "#10b981" : "rgba(255,255,255,.3)"}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        )}

        {/* Timestamp */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", marginTop: 6, textAlign: isAI ? "left" : "right" }}>
          {new Date(msg.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Bot size={15} color="#fff" />
      </div>
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: "4px 14px 14px 14px", padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%", background: "#4F46E5",
              animation: `ynDot 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AskAIPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteDropdown, setShowNoteDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeSuggCategory, setActiveSuggCategory] = useState(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load user notes for context selection
  useEffect(() => {
    API.get("/notes").then(r => setNotes(r.data || [])).catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNoteDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendMessage = useCallback(async (questionOverride = null) => {
    const question = (questionOverride || input).trim();
    if (!question || loading) return;

    setInput("");
    setShowSuggestions(false);
    setLoading(true);

    const userMsg = { role: "user", content: question, time: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await API.post("/ai/ask", {
        question,
        messages: history,
        noteId: selectedNote?._id || null,
      });

      const aiMsg = { role: "assistant", content: data.answer, time: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = err.response?.data?.message || "AI jawab nahi de pa raha. Thodi der baad try karo.";
      toast.error(errMsg);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errMsg,
        time: Date.now(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, selectedNote]);

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setSelectedNote(null);
    toast.success("Chat clear ho gaya");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ height: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes ynFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynDot{0%,80%,100%{transform:scale(.7);opacity:.4}40%{transform:scale(1);opacity:1}}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        @keyframes ynFadeIn{from{opacity:0}to{opacity:1}}
        textarea:focus,input:focus{outline:none}
        textarea{resize:none}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
        .yn-sugg-pill{padding:7px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:99px;font-size:13px;color:rgba(255,255,255,.65);cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'Inter',sans-serif}
        .yn-sugg-pill:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2);color:#fff}
        .yn-cat-btn{padding:6px 14px;background:none;border:1px solid rgba(255,255,255,.08);border-radius:99px;font-size:12px;color:rgba(255,255,255,.4);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px;font-family:'Inter',sans-serif;font-weight:500}
        .yn-cat-btn.active{color:#fff;border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.06)}
        .yn-note-opt{padding:9px 14px;font-size:13px;color:rgba(255,255,255,.7);cursor:pointer;transition:background .15s;display:flex;align-items:center;gap:8px;font-family:'Inter',sans-serif}
        .yn-note-opt:hover{background:rgba(255,255,255,.06);color:#fff}
        .yn-send-btn{width:40px;height:40px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ height: 58, background: "rgba(10,10,10,.97)", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.45)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, transition: "color .2s", padding: "6px 0" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}>
            <ArrowLeft size={15} /> Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,.12)" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Ask <span style={{ color: "#7C3AED" }}>AI</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Note context selector */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button onClick={() => setShowNoteDropdown(v => !v)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
              background: selectedNote ? "rgba(79,70,229,.15)" : "rgba(255,255,255,.04)",
              border: `1px solid ${selectedNote ? "rgba(79,70,229,.35)" : "rgba(255,255,255,.1)"}`,
              borderRadius: 8, cursor: "pointer", color: selectedNote ? "#a78bfa" : "rgba(255,255,255,.5)",
              fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: "all .2s",
            }}>
              <BookOpen size={13} />
              {selectedNote ? selectedNote.title.slice(0, 22) + (selectedNote.title.length > 22 ? "…" : "") : "Note context add karo"}
              <ChevronDown size={12} />
            </button>

            {showNoteDropdown && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, minWidth: 240, maxHeight: 280, overflowY: "auto", zIndex: 200, boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>
                <div className="yn-note-opt" onClick={() => { setSelectedNote(null); setShowNoteDropdown(false); }}
                  style={{ color: "rgba(255,255,255,.4)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  <X size={13} /> No context (general chat)
                </div>
                {notes.filter(n => !n.isTrashed).slice(0, 30).map(note => (
                  <div key={note._id} className="yn-note-opt" onClick={() => { setSelectedNote(note); setShowNoteDropdown(false); }}>
                    <BookOpen size={13} color="rgba(255,255,255,.35)" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.title || "Untitled"}</span>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,.3)", textAlign: "center" }}>Koi note nahi mila</div>
                )}
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button onClick={clearChat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,.08)"}>
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </nav>

      {/* ── Chat Area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", maxWidth: 800, width: "100%", margin: "0 auto", alignSelf: "stretch" }}>

        {/* Welcome / suggestions screen */}
        {messages.length === 0 && showSuggestions && (
          <div style={{ animation: "ynFadeIn .5s ease" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", padding: "40px 0 36px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Sparkles size={28} color="#fff" />
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", marginBottom: 10 }}>
                Kuch bhi poochho
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.4)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
                Concept samajhna ho, exam prep chahiye, ya koi formula — AI tutor hamesha ready hai.
                <br />Hindi, English, Hinglish — sab supported.
              </p>
              {selectedNote && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, padding: "6px 14px", background: "rgba(79,70,229,.12)", border: "1px solid rgba(79,70,229,.25)", borderRadius: 99, fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
                  <BookOpen size={12} /> Context: {selectedNote.title.slice(0, 30)}
                </div>
              )}
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
              {SUGGESTIONS.map((cat, i) => (
                <button key={i} className={`yn-cat-btn ${activeSuggCategory === i ? "active" : ""}`}
                  onClick={() => setActiveSuggCategory(i)}>
                  {cat.icon} {cat.category}
                </button>
              ))}
            </div>

            {/* Suggestion pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560, margin: "0 auto" }}>
              {SUGGESTIONS[activeSuggCategory].prompts.map((p, i) => (
                <button key={i} className="yn-sugg-pill" onClick={() => sendMessage(p)}
                  style={{ textAlign: "left", borderRadius: 10, padding: "10px 16px" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} onCopy={() => toast.success("Copied!")} />
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", background: "#0d0d0d", padding: "14px 20px", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* Active note context badge */}
          {selectedNote && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, padding: "5px 10px", background: "rgba(79,70,229,.08)", border: "1px solid rgba(79,70,229,.2)", borderRadius: 8, width: "fit-content" }}>
              <BookOpen size={12} color="#7C3AED" />
              <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>{selectedNote.title.slice(0, 40)}</span>
              <button onClick={() => setSelectedNote(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(167,139,250,.5)", display: "flex", padding: 0, marginLeft: 2 }}>
                <X size={11} />
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "10px 14px", transition: "border-color .2s" }}
              onFocus={() => {}} onBlur={() => {}}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kuch bhi poochho... (Enter = send, Shift+Enter = new line)"
                rows={1}
                style={{
                  width: "100%", background: "none", border: "none", color: "#fff",
                  fontSize: 14, fontFamily: "'Inter',sans-serif", lineHeight: 1.6,
                  maxHeight: 120, overflowY: "auto",
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
            </div>

            <button className="yn-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "rgba(255,255,255,.06)",
                color: input.trim() && !loading ? "#fff" : "rgba(255,255,255,.25)",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              }}>
              {loading
                ? <Loader size={16} style={{ animation: "ynSpin 1s linear infinite" }} />
                : <Send size={16} />}
            </button>
          </div>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,.18)", marginTop: 8, textAlign: "center" }}>
            Groq Llama 3.3 · 20 AI calls/hour · Answers may not always be accurate — verify important info
          </p>
        </div>
      </div>
    </div>
  );
}
