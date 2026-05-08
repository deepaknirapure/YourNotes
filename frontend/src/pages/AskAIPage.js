import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, Menu, Paperclip, X, File, Trash2, Plus, MessageSquare } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

/* ─────────────────────────── STYLES ─────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Scoped vars — use app's existing theme tokens */
.aai-root {
  --aai-accent:      var(--accent, #f97316);
  --aai-accent-dim:  var(--accent-light, rgba(249,115,22,0.12));
  --aai-accent-glow: rgba(249,115,22,0.2);
  --aai-danger:      #ef4444;
  --aai-radius:      12px;
  --aai-radius-sm:   8px;
  --aai-font:        'Plus Jakarta Sans', sans-serif;
}

@keyframes aai-fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
@keyframes aai-spin   { to { transform:rotate(360deg) } }
@keyframes aai-pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }

.aai-root {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--aai-font);
  color: var(--text);
  position: relative;
}

.aai-main {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-width: 0;
}

/* ── Topbar ── */
.aai-topbar {
  height: 58px; display: flex; align-items: center; gap: 10px;
  padding: 0 20px; background: var(--surface);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.aai-icon-btn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--aai-radius-sm); cursor: pointer; color: var(--text-muted);
  transition: all 0.15s; flex-shrink: 0;
}
.aai-icon-btn:hover { border-color: var(--aai-accent); color: var(--aai-accent); background: var(--aai-accent-dim); }

.aai-brand { display: flex; align-items: center; gap: 9px; flex: 1; }
.aai-brand-logo {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--aai-accent); display: flex; align-items: center; justify-content: center;
}
.aai-brand-name { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }

.aai-new-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--aai-radius-sm); padding: 7px 14px;
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  cursor: pointer; transition: all 0.15s; font-family: var(--aai-font);
  white-space: nowrap; flex-shrink: 0;
}
.aai-new-btn:hover { border-color: var(--aai-accent); color: var(--aai-accent); background: var(--aai-accent-dim); }

/* ── Shell ── */
.aai-shell { flex: 1; display: flex; overflow: hidden; min-height: 0; }

/* ── History panel ── */
.aai-history-panel {
  width: 260px; flex-shrink: 0;
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
}
.aai-history-head {
  padding: 16px 16px 10px; flex-shrink: 0;
}
.aai-history-label {
  font-size: 10px; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; color: var(--text-muted);
}
.aai-history-list {
  flex: 1; overflow-y: auto; padding: 4px 10px 16px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.aai-history-list::-webkit-scrollbar { width: 4px; }
.aai-history-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.aai-history-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 32px 12px; color: var(--text-muted); text-align: center;
}
.aai-history-empty-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.aai-history-empty p { font-size: 12px; font-weight: 600; line-height: 1.5; }

.aai-hist-item {
  width: 100%; text-align: left; background: transparent;
  border: 1px solid transparent; border-radius: var(--aai-radius-sm);
  padding: 10px; cursor: pointer; font-family: var(--aai-font);
  transition: all 0.15s; display: flex; align-items: center;
  gap: 8px; margin-bottom: 3px;
}
.aai-hist-item:hover { background: var(--bg); border-color: var(--border); }
.aai-hist-item.active { background: var(--aai-accent-dim); border-color: var(--aai-accent); }

.aai-hist-icon {
  width: 26px; height: 26px; border-radius: 7px;
  background: var(--bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--text-muted); transition: 0.15s;
}
.aai-hist-item.active .aai-hist-icon {
  background: var(--aai-accent-dim); color: var(--aai-accent); border-color: var(--aai-accent);
}
.aai-hist-info { flex: 1; min-width: 0; }
.aai-hist-title {
  font-size: 12px; font-weight: 700; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.aai-hist-item.active .aai-hist-title { color: var(--aai-accent); }
.aai-hist-date { font-size: 10px; font-weight: 600; color: var(--text-muted); margin-top: 2px; }

.aai-hist-del {
  width: 24px; height: 24px; border-radius: 6px; background: none; border: none;
  cursor: pointer; color: var(--text-muted); display: flex;
  align-items: center; justify-content: center; transition: all 0.15s;
  flex-shrink: 0; opacity: 0;
}
.aai-hist-item:hover .aai-hist-del { opacity: 1; }
.aai-hist-del:hover { color: var(--aai-danger); background: rgba(239,68,68,0.08); }

/* ── Chat panel ── */
.aai-chat-panel {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-width: 0; background: var(--bg);
}

/* ── Messages ── */
.aai-messages-wrap {
  flex: 1; overflow-y: auto; padding: 28px 0;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.aai-messages-wrap::-webkit-scrollbar { width: 4px; }
.aai-messages-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.aai-messages-inner {
  max-width: 780px; margin: 0 auto;
  padding: 0 24px; display: flex; flex-direction: column; gap: 22px;
}

.aai-welcome {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 48px 16px 24px; gap: 14px;
  animation: aai-fadeUp 0.4s ease-out both;
}
.aai-welcome-orb {
  width: 62px; height: 62px; border-radius: 18px;
  background: var(--aai-accent-dim); border: 1px solid var(--aai-accent);
  display: flex; align-items: center; justify-content: center;
}
.aai-welcome-title { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; }
.aai-welcome-sub { font-size: 14px; font-weight: 500; color: var(--text-muted); max-width: 380px; line-height: 1.65; }
.aai-welcome-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 6px; }
.aai-welcome-chip {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 100px; padding: 8px 16px;
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  cursor: pointer; transition: all 0.15s; font-family: var(--aai-font);
}
.aai-welcome-chip:hover { border-color: var(--aai-accent); color: var(--aai-accent); background: var(--aai-accent-dim); }

.aai-msg { display: flex; gap: 12px; align-items: flex-start; animation: aai-fadeUp 0.3s ease-out both; }
.aai-msg.user { flex-direction: row-reverse; }

.aai-av {
  width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.aai-av.bot { background: var(--aai-accent-dim); color: var(--aai-accent); border: 1px solid var(--aai-accent); }
.aai-av.user { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }

.aai-bubble {
  max-width: 78%; padding: 13px 16px; border-radius: 14px;
  font-size: 14px; line-height: 1.8; font-weight: 500;
}
.aai-bubble.bot { background: var(--surface); border: 1px solid var(--border); border-bottom-left-radius: 4px; color: var(--text); }
.aai-bubble.user { background: var(--aai-accent); color: #fff; border-bottom-right-radius: 4px; }

.aai-file-ref {
  display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
  margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); opacity: 0.85;
}

.aai-typing { display: flex; gap: 5px; align-items: center; padding: 4px 2px; }
.aai-typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--aai-accent); animation: aai-pulse 1.2s ease-in-out infinite; }
.aai-typing span:nth-child(2) { animation-delay: 0.2s; }
.aai-typing span:nth-child(3) { animation-delay: 0.4s; }

/* ── Input area ── */
.aai-input-area {
  flex-shrink: 0; background: var(--surface); border-top: 1px solid var(--border);
  padding: 14px 24px;
  padding-bottom: max(14px, env(safe-area-inset-bottom, 0px));
}
.aai-input-inner { max-width: 780px; margin: 0 auto; width: 100%; }

.aai-chips-row {
  display: flex; gap: 6px; margin-bottom: 11px;
  overflow-x: auto; scrollbar-width: none; padding-bottom: 1px;
}
.aai-chips-row::-webkit-scrollbar { display: none; }
.aai-chip {
  background: var(--bg); border: 1px solid var(--border); border-radius: 100px;
  padding: 5px 13px; font-size: 11px; font-weight: 700; color: var(--text-muted);
  cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: var(--aai-font);
}
.aai-chip:hover { border-color: var(--aai-accent); color: var(--aai-accent); background: var(--aai-accent-dim); }

.aai-file-tag {
  display: flex; align-items: center; gap: 7px;
  background: var(--aai-accent-dim); border: 1px solid var(--aai-accent);
  border-radius: 100px; padding: 6px 12px; margin-bottom: 10px;
  width: fit-content; font-size: 12px; font-weight: 700; color: var(--aai-accent);
}
.aai-file-tag-x { background: none; border: none; cursor: pointer; color: var(--aai-accent); opacity: 0.7; padding: 0; display: flex; }
.aai-file-tag-x:hover { opacity: 1; }

.aai-input-box {
  display: flex; align-items: flex-end; gap: 10px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 14px; padding: 11px 14px; transition: all 0.18s;
}
.aai-input-box:focus-within {
  border-color: var(--aai-accent);
  box-shadow: 0 0 0 3px var(--aai-accent-dim);
  background: var(--surface);
}
.aai-attach-btn {
  background: none; border: none; cursor: pointer; color: var(--text-muted);
  padding: 2px; border-radius: 6px; transition: 0.15s; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.aai-attach-btn:hover { color: var(--aai-accent); }
.aai-textarea {
  flex: 1; background: transparent; border: none; font-size: 14px;
  font-weight: 500; color: var(--text); outline: none; resize: none;
  line-height: 1.6; font-family: var(--aai-font); max-height: 120px; min-height: 22px;
}
.aai-textarea::placeholder { color: var(--text-muted); }

.aai-send-btn {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  background: var(--border); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.aai-send-btn.active { background: var(--aai-accent); color: #fff; box-shadow: 0 4px 12px var(--aai-accent-glow); }
.aai-send-btn.active:hover { transform: scale(1.05); }
.aai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.aai-spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--aai-accent); border-radius: 50%; animation: aai-spin 0.7s linear infinite; }
.aai-spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: aai-spin 0.7s linear infinite; }

/* ── Mobile drawer ── */
.aai-drawer-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.5); display: none; }
.aai-drawer-overlay.open { display: block; }
.aai-drawer {
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 51; width: 280px;
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transform: translateX(-100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
}
.aai-drawer.open { transform: translateX(0); }
.aai-drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.aai-drawer-title { font-size: 13px; font-weight: 800; color: var(--text); }
.aai-drawer-close {
  width: 30px; height: 30px; border-radius: 8px; background: var(--bg);
  border: 1px solid var(--border); display: flex; align-items: center;
  justify-content: center; cursor: pointer; color: var(--text-muted); transition: 0.15s;
}
.aai-drawer-close:hover { color: var(--text); }
.aai-drawer-new-btn {
  margin: 12px 12px 8px; display: flex; align-items: center; gap: 8px;
  background: var(--aai-accent-dim); border: 1px solid var(--aai-accent);
  border-radius: var(--aai-radius-sm); padding: 10px 14px;
  font-size: 13px; font-weight: 700; color: var(--aai-accent);
  cursor: pointer; font-family: var(--aai-font); transition: all 0.15s; flex-shrink: 0;
}
.aai-drawer-new-btn:hover { opacity: 0.85; }
.aai-drawer-list { flex: 1; overflow-y: auto; padding: 4px 8px 16px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.aai-drawer-list::-webkit-scrollbar { width: 3px; }
.aai-drawer-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .aai-history-panel { display: none; }
  .aai-input-area {
    padding: 12px 14px;
    padding-bottom: calc(68px + env(safe-area-inset-bottom, 12px));
  }
  .aai-messages-inner { padding: 0 14px; }
  .aai-topbar { padding: 0 14px; }
}
@media (min-width: 769px) {
  .aai-drawer-overlay, .aai-drawer { display: none !important; }
  .aai-icon-btn.mobile-only { display: none; }
}
`;

/* ─────────────────────────── DATA ─────────────────────────── */
const QUICK_PROMPTS = [
  "Summarize my notes", "Make flashcards",
  "Exam strategy tips", "Explain this concept", "Quiz me on topic",
];
const WELCOME_MSG = {
  role: "assistant",
  content: "Hey! I'm your AI study assistant 🎓\nAsk me anything about your notes — get summaries, flashcards, exam help, or concept explanations.",
  isWelcome: true,
};

function formatDate(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso);
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function autoResize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function HistoryItem({ chat, active, onSelect, onDelete }) {
  return (
    <button className={`aai-hist-item${active ? " active" : ""}`} onClick={onSelect}>
      <div className="aai-hist-icon"><MessageSquare size={12} /></div>
      <div className="aai-hist-info">
        <div className="aai-hist-title">{chat.title || "Conversation"}</div>
        <div className="aai-hist-date">{formatDate(chat.updatedAt)}</div>
      </div>
      <button className="aai-hist-del" onClick={e => { e.stopPropagation(); onDelete(chat._id); }} title="Delete">
        <Trash2 size={12} />
      </button>
    </button>
  );
}

/* ─────────────────────────── COMPONENT ─────────────────────────── */
export default function AskAIPage() {
  const [messages, setMessages]         = useState([WELCOME_MSG]);
  const [chatId, setChatId]             = useState(null);
  const [sessions, setSessions]         = useState([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const fileRef     = useRef(null);
  const saveTimer   = useRef(null);

  useEffect(() => {
    (async () => {
      try { const { data } = await API.get("/ai/chats"); setSessions(data || []); } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    const real = messages.filter(m => !m.isWelcome);
    if (!real.length) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const title = real.find(m => m.role === "user")?.content?.slice(0, 55) || "New Chat";
        const { data } = await API.post("/ai/chats", { id: chatId, title, messages: real });
        setChatId(data._id);
        setSessions(prev => [data, ...prev.filter(c => c._id !== data._id)].slice(0, 40));
      } catch (_) {}
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [messages]); // eslint-disable-line

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { autoResize(textareaRef.current); }, [input]);

  const startNewChat = useCallback(() => {
    setChatId(null); setMessages([WELCOME_MSG]);
    setInput(""); setSelectedFile(null); setDrawerOpen(false);
  }, []);

  const loadChat = useCallback((chat) => {
    setChatId(chat._id);
    setMessages(chat.messages?.length ? chat.messages : [WELCOME_MSG]);
    setDrawerOpen(false);
  }, []);

  const deleteChat = useCallback(async (id) => {
    try {
      await API.delete(`/ai/chats/${id}`);
      setSessions(p => p.filter(c => c._id !== id));
      if (chatId === id) startNewChat();
      toast.success("Chat deleted");
    } catch { toast.error("Could not delete"); }
  }, [chatId, startNewChat]);

  const send = useCallback(async (override) => {
    const text = (override ?? input).trim();
    if ((!text && !selectedFile) || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text, fileName: selectedFile?.name };
    setMessages(prev => [...prev.filter(m => !m.isWelcome), userMsg]);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);
    try {
      const history = messages.filter(m => !m.isWelcome && !m.streaming).map(m => ({ role: m.role, content: m.content }));
      let resp;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("question", text); fd.append("file", selectedFile); fd.append("history", JSON.stringify(history));
        const { data } = await API.post("/ai/ask-with-file", fd); resp = data; setSelectedFile(null);
      } else {
        const { data } = await API.post("/ai/ask", { question: text, history }); resp = data;
      }
      const reply = resp?.answer || resp?.response || "Sorry, I couldn't get a response.";
      setMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: "assistant", content: reply }; return n; });
    } catch {
      setMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." }; return n; });
    } finally { setLoading(false); }
  }, [input, selectedFile, loading, messages]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }, [send]);

  const canSend     = (input.trim() || selectedFile) && !loading;
  const showWelcome = messages.length === 1 && messages[0].isWelcome;

  const HistoryList = ({ drawer = false }) => (
    <div className={drawer ? "aai-drawer-list" : "aai-history-list"}>
      {sessions.length === 0 ? (
        <div className="aai-history-empty">
          <div className="aai-history-empty-icon"><MessageSquare size={16} /></div>
          <p>No chats yet.<br />Start a conversation!</p>
        </div>
      ) : sessions.map(c => (
        <HistoryItem key={c._id} chat={c} active={chatId === c._id}
          onSelect={() => loadChat(c)} onDelete={deleteChat} />
      ))}
    </div>
  );

  return (
    <div className="aai-root">
      <style>{STYLES}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile drawer */}
      <div className={`aai-drawer-overlay${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`aai-drawer${drawerOpen ? " open" : ""}`}>
        <div className="aai-drawer-head">
          <span className="aai-drawer-title">Chat History</span>
          <button className="aai-drawer-close" onClick={() => setDrawerOpen(false)}><X size={14} /></button>
        </div>
        <button className="aai-drawer-new-btn" onClick={startNewChat}><Plus size={14} /> New Chat</button>
        <HistoryList drawer />
      </div>

      <div className="aai-main">
        {/* Topbar */}
        <div className="aai-topbar">
          <button className="aai-icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Navigation">
            <Menu size={17} />
          </button>
          <div className="aai-brand">
            <div className="aai-brand-logo">
              <Bot size={16} color="#fff" />
            </div>
            <span className="aai-brand-name">Ask AI</span>
          </div>
          <button className="aai-icon-btn mobile-only" onClick={() => setDrawerOpen(true)} aria-label="History">
            <MessageSquare size={15} />
          </button>
          <button className="aai-new-btn" onClick={startNewChat}>
            <Plus size={13} /> New Chat
          </button>
        </div>

        <div className="aai-shell">
          {/* Desktop history */}
          <aside className="aai-history-panel">
            <div className="aai-history-head">
              <span className="aai-history-label">History</span>
            </div>
            <HistoryList />
          </aside>

          {/* Chat */}
          <div className="aai-chat-panel">
            <div className="aai-messages-wrap">
              <div className="aai-messages-inner">
                {showWelcome && (
                  <div className="aai-welcome">
                    <div className="aai-welcome-orb">
                      <Bot size={28} color="var(--aai-accent)" />
                    </div>
                    <div className="aai-welcome-title">Your AI Study Buddy</div>
                    <div className="aai-welcome-sub">
                      Ask anything about your notes — get summaries, flashcards, exam tips and more.
                    </div>
                    <div className="aai-welcome-chips">
                      {QUICK_PROMPTS.map((p, i) => (
                        <button key={i} className="aai-welcome-chip" onClick={() => send(p)}>{p}</button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.filter(m => !m.isWelcome).map((msg, i) => (
                  <div key={i} className={`aai-msg${msg.role === "user" ? " user" : ""}`} style={{ animationDelay: `${i * 0.03}s` }}>
                    <div className={`aai-av${msg.role === "user" ? " user" : " bot"}`}>
                      {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`aai-bubble${msg.role === "user" ? " user" : " bot"}`}>
                      {msg.fileName && <div className="aai-file-ref"><File size={11} /> {msg.fileName}</div>}
                      {msg.streaming
                        ? <div className="aai-typing"><span /><span /><span /></div>
                        : <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                      }
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} style={{ height: 1 }} />
              </div>
            </div>

            {/* Bottom input — always sticks to bottom */}
            <div className="aai-input-area">
              <div className="aai-input-inner">
                {showWelcome && (
                  <div className="aai-chips-row">
                    {QUICK_PROMPTS.map((p, i) => (
                      <button key={i} className="aai-chip" onClick={() => send(p)}>{p}</button>
                    ))}
                  </div>
                )}
                {selectedFile && (
                  <div className="aai-file-tag">
                    <File size={12} /> <span>{selectedFile.name}</span>
                    <button className="aai-file-tag-x" onClick={() => setSelectedFile(null)}><X size={12} /></button>
                  </div>
                )}
                <div className="aai-input-box">
                  <input type="file" ref={fileRef} style={{ display: "none" }}
                    onChange={e => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                  <button className="aai-attach-btn" onClick={() => fileRef.current?.click()} aria-label="Attach">
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    ref={textareaRef} className="aai-textarea"
                    placeholder="Ask anything about your notes…"
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown} rows={1}
                  />
                  <button className={`aai-send-btn${canSend ? " active" : ""}`}
                    onClick={() => send()} disabled={!canSend} aria-label="Send">
                    {loading ? <div className="aai-spinner-sm" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
