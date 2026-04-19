import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Bot, User, Loader, Sparkles,
  Trash2, Copy, Check, ChevronDown, ChevronUp,
  Lightbulb, Calculator, BookOpen, Atom, Globe, Code2,
  Brain,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

// ── Suggestion categories ────────────────────────────────────────────────────
const SUGGESTIONS = [
  {
    category: "Concept Explain", icon: <Lightbulb size={13} />, color: "#f59e0b",
    prompts: [
      "Newton ke 3 laws simple bhasha mein samjhao",
      "DNA replication ka process explain karo",
      "Photosynthesis kya hota hai? Steps ke saath",
      "Ohm's Law kya hai aur kaise kaam karta hai?",
    ],
  },
  {
    category: "Maths", icon: <Calculator size={13} />, color: "#8b5cf6",
    prompts: [
      "Quadratic equation solve karne ke 3 tarike",
      "Integration aur differentiation mein fark",
      "Trigonometry ke saare formulas ek jagah do",
      "Probability basics examples ke saath",
    ],
  },
  {
    category: "Exam Prep", icon: <BookOpen size={13} />, color: "#E55B2D",
    prompts: [
      "JEE Physics ke top important topics kaunse hain?",
      "NEET Biology mein zyada marks kaise laayein?",
      "Last minute revision strategy kya hai?",
      "MCQ mein eliminate karne ka technique",
    ],
  },
  {
    category: "Science", icon: <Atom size={13} />, color: "#10b981",
    prompts: [
      "Periodic table ke trends explain karo",
      "Electromagnetic waves kya hoti hain?",
      "Chemical bonding types kaunse hain?",
      "Human digestive system explain karo",
    ],
  },
  {
    category: "Coding", icon: <Code2 size={13} />, color: "#06b6d4",
    prompts: [
      "Python mein list vs tuple ka fark",
      "REST API kya hota hai? Simple mein batao",
      "Recursion ko beginner ke liye samjhao",
      "Big O notation kya hai?",
    ],
  },
  {
    category: "General", icon: <Globe size={13} />, color: "#f43f5e",
    prompts: [
      "Current affairs ke important topics kya hain?",
      "Essay likhne ka best structure kya hai?",
      "Effective study schedule kaise banayein?",
      "Memory improve karne ke tips batao",
    ],
  },
];

// ── Message formatting ────────────────────────────────────────────────────────
function formatMessage(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace;">$1</code>')
    .replace(/^#{1,3}\s(.+)/gm, '<div style="font-family:\'Syne\',sans-serif;font-weight:700;font-size:16px;margin:12px 0 6px;color:#fff;">$1</div>')
    .replace(/^[-•]\s(.+)/gm, '<div style="padding-left:16px;margin:4px 0;">• $1</div>')
    .replace(/^\d+\.\s(.+)/gm, '<div style="padding-left:16px;margin:4px 0;">$&</div>')
    .replace(/\n\n/g, '<div style="height:10px;"></div>')
    .replace(/\n/g, "<br/>");
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isLast }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === "assistant";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copy ho gaya!");
  };

  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      flexDirection: isAI ? "row" : "row-reverse",
      marginBottom: 20,
      animation: "aiMsgIn .35s cubic-bezier(.16,1,.3,1) both"
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: isAI ? "linear-gradient(135deg,#E55B2D,#ff8c61)" : "rgba(255,255,255,.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isAI ? "0 0 16px rgba(229,91,45,.3)" : "none"
      }}>
        {isAI ? <Bot size={16} color="#fff" /> : <User size={16} color="rgba(255,255,255,.7)" />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "78%",
        background: isAI ? "#141414" : "rgba(229,91,45,.12)",
        border: `1px solid ${isAI ? "rgba(255,255,255,.07)" : "rgba(229,91,45,.2)"}`,
        borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        padding: "14px 16px",
        position: "relative",
      }}>
        {msg.loading ? (
          <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#E55B2D", animation: `aiDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: isAI ? "rgba(255,255,255,.87)" : "#fff" }}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
            {isAI && !msg.loading && (
              <button onClick={copy} style={{
                position: "absolute", top: 10, right: 10, background: "none",
                border: "none", cursor: "pointer", color: copied ? "#10b981" : "rgba(255,255,255,.25)",
                padding: 4, borderRadius: 6, transition: "all .2s"
              }}
                onMouseOver={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"}
                onMouseOut={e => e.currentTarget.style.color = copied ? "#10b981" : "rgba(255,255,255,.25)"}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AskAINewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    setInput("");
    setShowSuggestions(false);

    const userMsg = { role: "user", content: q, id: Date.now() };
    const aiMsg = { role: "assistant", content: "", loading: true, id: Date.now() + 1 };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await API.post("/ai/chat", {
        messages: [...history, { role: "user", content: q }],
      });
      const reply = data.reply || "Kuch problem aa gayi. Dobara try karo.";
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: reply, loading: false } : m));
    } catch (err) {
      const errMsg = err.response?.data?.message || "Network error aa gayi. Dobara try karo.";
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: errMsg, loading: false } : m));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, messages, loading]);

  const clearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm("Saari chat clear ho jayegi?")) {
      setMessages([]);
      setShowSuggestions(true);
      setSelectedCat(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d0d0d; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        @keyframes aiMsgIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes aiDot { 0%,80%,100%{transform:scale(0.7);opacity:.4}40%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:.6}50%{opacity:1} }
        .nai-send-btn { background:#E55B2D; border:none; border-radius:11px; padding:12px 20px; color:#fff; cursor:pointer; font-family:inherit; font-weight:700; font-size:14px; display:flex; align-items:center; gap:7px; transition:all .2s; flex-shrink:0; }
        .nai-send-btn:hover:not(:disabled) { background:#d14e24; transform:translateY(-1px); }
        .nai-send-btn:disabled { opacity:.45; cursor:not-allowed; }
        .nai-suggest-chip { border:none; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); color:rgba(255,255,255,.65); border-radius:10px; padding:9px 14px; font-family:inherit; font-size:13px; cursor:pointer; transition:all .2s; text-align:left; line-height:1.4; }
        .nai-suggest-chip:hover { background:rgba(229,91,45,.1); border-color:rgba(229,91,45,.3); color:#fff; }
        .nai-cat-btn { border:none; border-radius:99px; padding:7px 14px; font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:5px; }
        .nai-input { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:14px 18px; color:#fff; font-size:15px; font-family:inherit; outline:none; resize:none; flex:1; min-height:52px; max-height:140px; transition:border-color .2s; line-height:1.5; }
        .nai-input:focus { border-color:rgba(229,91,45,.5); }
        .nai-input::placeholder { color:rgba(255,255,255,.2); }
      `}</style>

      {/* Top Bar */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/home")} style={{
            background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontFamily: "inherit", padding: 0, transition: "color .2s"
          }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,.4)"}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#E55B2D,#ff8c61)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(229,91,45,.3)" }}>
              <Bot size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>YourNotes AI</div>
              <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                Online — kuch bhi poochho
              </div>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button onClick={clearChat} style={{
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9,
            padding: "7px 14px", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13,
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all .2s"
          }}
            onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
            onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 8px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Welcome / Suggestions */}
          {showSuggestions && messages.length === 0 && (
            <div style={{ animation: "fadeUp .5s" }}>
              <div style={{ textAlign: "center", paddingBottom: 32 }}>
                <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#E55B2D,#ff8c61)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 32px rgba(229,91,45,.3)" }}>
                  <Brain size={30} color="#fff" />
                </div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                  Namaste{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                </h2>
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>
                  Koi bhi sawaal poochho — padhai, science, maths, coding, ya kuch bhi!
                </p>
              </div>

              {/* Category Tabs */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {SUGGESTIONS.map((cat, i) => (
                  <button key={i} className="nai-cat-btn"
                    style={{
                      background: selectedCat === i ? `${cat.color}20` : "rgba(255,255,255,.05)",
                      color: selectedCat === i ? cat.color : "rgba(255,255,255,.5)",
                      border: `1px solid ${selectedCat === i ? cat.color + "40" : "rgba(255,255,255,.08)"}`
                    }}
                    onClick={() => setSelectedCat(selectedCat === i ? null : i)}>
                    {cat.icon} {cat.category}
                  </button>
                ))}
              </div>

              {/* Suggestion Prompts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 8 }}>
                {(selectedCat !== null ? SUGGESTIONS[selectedCat].prompts : SUGGESTIONS.flatMap(s => s.prompts.slice(0, 2))).map((prompt, i) => (
                  <button key={i} className="nai-suggest-chip"
                    style={{ animationDelay: `${i * 0.04}s`, animation: "fadeUp .4s both" }}
                    onClick={() => sendMessage(prompt)}>
                    <span style={{ color: "rgba(255,255,255,.3)", marginRight: 6, fontSize: 12 }}>→</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id || i} msg={msg} isLast={i === messages.length - 1} />
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div style={{ background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,.07)", padding: "16px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Quick re-suggest button */}
          {messages.length > 0 && (
            <button onClick={() => { setShowSuggestions(s => !s); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, marginBottom: 10, transition: "color .2s" }}
              onMouseOver={e => e.currentTarget.style.color = "rgba(255,255,255,.6)"}
              onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
              <Sparkles size={12} /> Suggestions {showSuggestions ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          )}

          {/* Inline suggestions toggle */}
          {showSuggestions && messages.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {SUGGESTIONS[0].prompts.slice(0, 3).map((p, i) => (
                <button key={i} className="nai-suggest-chip" style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={() => { setShowSuggestions(false); sendMessage(p); }}>
                  {p.slice(0, 40)}…
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              className="nai-input"
              placeholder="Koi bhi sawaal poochho..."
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={1}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              style={{ height: Math.min(140, Math.max(52, input.split("\n").length * 24 + 28)) }}
            />
            <button className="nai-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              {loading ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
              Send
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 10 }}>
            Enter = Send • Shift+Enter = New Line
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}