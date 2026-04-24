import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, RefreshCw, Copy, Check, Menu, Paperclip, StopCircle } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .ai-wrap{display:flex;height:100vh;overflow:hidden;}
  .ai-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .ai-topbar{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .ai-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .ai-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;}
  .ai-msg{display:flex;gap:10px;align-items:flex-start;animation:fadeUp .2s both;}
  .ai-msg.user{flex-direction:row-reverse;}
  .ai-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
  .ai-avatar.bot{background:rgba(229,91,45,.15);border:1px solid rgba(229,91,45,.25);}
  .ai-avatar.user{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);}
  .ai-bubble{max-width:72%;padding:12px 14px;border-radius:10px;font-size:13px;line-height:1.65;}
  .ai-bubble.bot{background:#161616;border:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.85);border-bottom-left-radius:3px;}
  .ai-bubble.user{background:#E55B2D;color:#fff;border-bottom-right-radius:3px;}
  .ai-bubble code{background:rgba(255,255,255,.08);border-radius:4px;padding:1px 5px;font-family:'Geist Mono',monospace;font-size:12px;}
  .ai-bubble pre{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:10px;overflow-x:auto;margin:8px 0;}
  .ai-bubble pre code{background:none;padding:0;}
  .ai-bottom{border-top:1px solid rgba(255,255,255,.07);padding:14px 20px;flex-shrink:0;}
  .ai-input-row{display:flex;gap:10px;align-items:flex-end;}
  .ai-textarea{flex:1;background:#111;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 14px;font-size:13px;font-family:inherit;color:#fff;resize:none;outline:none;max-height:140px;min-height:40px;transition:border-color .15s;line-height:1.5;}
  .ai-textarea:focus{border-color:rgba(255,255,255,.2);}
  .ai-textarea::placeholder{color:rgba(255,255,255,.2);}
  .ai-send-btn{width:36px;height:36px;border-radius:8px;background:#E55B2D;border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
  .ai-send-btn:hover:not(:disabled){background:#d14e24;transform:scale(1.05);}
  .ai-send-btn:disabled{opacity:.4;cursor:not-allowed;}
  .ai-copy-btn{background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;padding:3px;border-radius:4px;transition:color .12s;display:flex;margin-top:4px;}
  .ai-copy-btn:hover{color:rgba(255,255,255,.7);}
  .ai-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.15);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  .ai-cursor{display:inline-block;width:2px;height:13px;background:#E55B2D;animation:blink 1s step-end infinite;vertical-align:middle;margin-left:2px;}
  .ai-prompt-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
  .ai-chip{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:6px;padding:5px 10px;font-size:12px;color:rgba(255,255,255,.5);cursor:pointer;transition:all .12s;font-family:inherit;}
  .ai-chip:hover{background:rgba(229,91,45,.08);border-color:rgba(229,91,45,.25);color:#E55B2D;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.ai-menu-btn{display:flex!important}.ai-bubble{max-width:88%!important}}
`;

const PROMPTS = [
  "Notes summarize karo",
  "Flashcards banao",
  "Concept explain karo",
  "Exam tips do",
  "Practice questions do",
];

export default function AskAIPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Haan bolo! Main YourNotes AI assistant hoon. Apne notes, subjects, ya koi bhi study-related sawaal poochho. Kya help chahiye? 🎓" }
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef                 = useRef(null);
  const textareaRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    // Add streaming placeholder
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await API.post("/ai/ask", { question: q, history });
      const reply = data.answer || data.response || data.message || "Samajh nahi aaya, dobara try karo.";
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: reply };
        return next;
      });
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Maafi chahta hoon, kuch error aa gayi. Dobara try karo." };
        return next;
      });
    } finally { setLoading(false); }
  };

  const copyMsg = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
    toast.success("Copied!");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat clear ho gaya! Naya sawaal poochho. 🎓" }]);
  };

  return (
    <div className="ai-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="ai-main">
        <div className="ai-topbar">
          <button className="ai-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(229,91,45,.15)", border: "1px solid rgba(229,91,45,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={13} color="#E55B2D" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Ask AI</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={clearChat} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", transition: "all .12s" }}>
              <RefreshCw size={11} />Clear
            </button>
          </div>
        </div>

        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-msg ${msg.role === "user" ? "user" : ""}`}>
              <div className={`ai-avatar ${msg.role === "user" ? "user" : "bot"}`}>
                {msg.role === "user"
                  ? <User size={13} color="rgba(255,255,255,.6)" />
                  : <Sparkles size={13} color="#E55B2D" />}
              </div>
              <div>
                <div className={`ai-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                  {msg.streaming ? (
                    <span><span className="ai-cursor" /></span>
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  )}
                </div>
                {msg.role === "assistant" && !msg.streaming && msg.content && (
                  <button className="ai-copy-btn" onClick={() => copyMsg(msg.content, i)}>
                    {copiedIdx === i ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="ai-bottom">
          <div className="ai-prompt-chips">
            {PROMPTS.map((p, i) => (
              <button key={i} className="ai-chip" onClick={() => send(p)} disabled={loading}>{p}</button>
            ))}
          </div>
          <div className="ai-input-row">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              placeholder="Koi bhi sawaal poochho..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              style={{ height: "auto" }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
              disabled={loading}
            />
            <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
              {loading ? <div className="ai-spinner" /> : <Send size={14} />}
            </button>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.2)", marginTop: 8, textAlign: "center" }}>
            AI mistakes kar sakta hai — important info verify karein
          </p>
        </div>
      </div>
    </div>
  );
}
