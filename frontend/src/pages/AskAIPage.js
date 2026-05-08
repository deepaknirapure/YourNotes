import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, Menu, Paperclip, X, File, Trash2, Zap, Plus, MessageSquare, ChevronLeft, Sparkles } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

/* ─────────────────────────── STYLES ─────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #0d0f14;
  --surface:     #13161e;
  --surface2:    #1a1e2a;
  --border:      rgba(255,255,255,0.07);
  --border-h:    rgba(255,255,255,0.13);
  --text:        #eef0f6;
  --text-2:      #8a8fa8;
  --text-3:      #4e5368;
  --accent:      #6c63ff;
  --accent-dim:  rgba(108,99,255,0.15);
  --accent-glow: rgba(108,99,255,0.25);
  --danger:      #ff4f6a;
  --font:        'Sora', sans-serif;
  --mono:        'JetBrains Mono', monospace;
  --radius:      12px;
  --radius-sm:   8px;
}

@keyframes fadeUp   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
@keyframes spin     { to   { transform:rotate(360deg) } }
@keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
@keyframes slideIn  { from { transform:translateX(-100%) } to { transform:translateX(0) } }
@keyframes slideOut { from { transform:translateX(0) } to { transform:translateX(-100%) } }
@keyframes blink    { 0%,100% { opacity:1 } 50% { opacity:0 } }

/* ── Root layout ── */
.aai-root {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font);
  color: var(--text);
  position: relative;
}

/* ── App sidebar (Sidebar component) ── */
.aai-app-sidebar { flex-shrink: 0; }

/* ── Main area ── */
.aai-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ── Topbar ── */
.aai-topbar {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 10;
}
.aai-topbar-icon-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); cursor: pointer; color: var(--text-2);
  transition: all 0.15s; flex-shrink: 0;
}
.aai-topbar-icon-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

.aai-brand {
  display: flex; align-items: center; gap: 9px; flex: 1;
}
.aai-brand-dot {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--accent); display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 12px var(--accent-glow);
}
.aai-brand-name {
  font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.3px;
}
.aai-brand-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 0.8px;
  background: var(--accent-dim); color: var(--accent);
  border: 1px solid var(--accent); border-radius: 4px;
  padding: 2px 6px; text-transform: uppercase;
}

.aai-new-chat-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 8px 14px;
  font-size: 12px; font-weight: 700; color: var(--text-2);
  cursor: pointer; transition: all 0.15s; font-family: var(--font);
  white-space: nowrap; flex-shrink: 0;
}
.aai-new-chat-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

/* ── Shell: history + chat ── */
.aai-shell {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ── History panel ── */
.aai-history-panel {
  width: 260px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.aai-history-head {
  padding: 16px 16px 10px;
  flex-shrink: 0;
}
.aai-history-label {
  font-size: 10px; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; color: var(--text-3);
}
.aai-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.aai-history-list::-webkit-scrollbar { width: 4px; }
.aai-history-list::-webkit-scrollbar-track { background: transparent; }
.aai-history-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.aai-history-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 32px 12px; color: var(--text-3);
}
.aai-history-empty-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.aai-history-empty p { font-size: 12px; font-weight: 600; text-align: center; }

.aai-hist-item {
  width: 100%; text-align: left;
  background: transparent; border: 1px solid transparent;
  border-radius: var(--radius-sm); padding: 10px 10px;
  cursor: pointer; font-family: var(--font);
  transition: all 0.15s; display: flex; align-items: center; gap: 8px;
  margin-bottom: 3px;
}
.aai-hist-item:hover { background: var(--surface2); border-color: var(--border); }
.aai-hist-item.active {
  background: var(--accent-dim); border-color: rgba(108,99,255,0.35);
}
.aai-hist-icon {
  width: 26px; height: 26px; border-radius: 7px;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--text-3); transition: 0.15s;
}
.aai-hist-item.active .aai-hist-icon { background: var(--accent-dim); color: var(--accent); border-color: rgba(108,99,255,0.3); }
.aai-hist-info { flex: 1; min-width: 0; }
.aai-hist-title {
  font-size: 12px; font-weight: 700; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.aai-hist-item.active .aai-hist-title { color: var(--accent); }
.aai-hist-date { font-size: 10px; font-weight: 600; color: var(--text-3); margin-top: 2px; }
.aai-hist-del {
  width: 24px; height: 24px; border-radius: 6px;
  background: none; border: none; cursor: pointer;
  color: var(--text-3); display: flex; align-items: center;
  justify-content: center; transition: all 0.15s; flex-shrink: 0; opacity: 0;
}
.aai-hist-item:hover .aai-hist-del { opacity: 1; }
.aai-hist-del:hover { color: var(--danger); background: rgba(255,79,106,0.1); }

/* ── Chat panel ── */
.aai-chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: var(--bg);
  position: relative;
}

/* ── Messages ── */
.aai-messages-wrap {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
  padding: 24px 0;
}
.aai-messages-wrap::-webkit-scrollbar { width: 4px; }
.aai-messages-wrap::-webkit-scrollbar-track { background: transparent; }
.aai-messages-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.aai-messages-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Welcome screen */
.aai-welcome {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 48px 16px 32px; gap: 16px;
  animation: fadeUp 0.4s ease-out both;
}
.aai-welcome-orb {
  width: 64px; height: 64px; border-radius: 18px;
  background: var(--accent-dim); border: 1px solid rgba(108,99,255,0.3);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 30px var(--accent-glow);
}
.aai-welcome-title {
  font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.5px;
}
.aai-welcome-sub {
  font-size: 14px; font-weight: 500; color: var(--text-2); max-width: 380px; line-height: 1.6;
}
.aai-welcome-chips {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px;
}
.aai-welcome-chip {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 100px; padding: 8px 16px;
  font-size: 12px; font-weight: 700; color: var(--text-2);
  cursor: pointer; transition: all 0.15s; font-family: var(--font);
}
.aai-welcome-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

/* Message row */
.aai-msg {
  display: flex; gap: 12px; align-items: flex-start;
  animation: fadeUp 0.3s ease-out both;
}
.aai-msg.user { flex-direction: row-reverse; }

.aai-av {
  width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.aai-av.bot {
  background: var(--accent-dim); color: var(--accent);
  border: 1px solid rgba(108,99,255,0.25);
}
.aai-av.user {
  background: var(--surface2); color: var(--text-2);
  border: 1px solid var(--border);
}

.aai-bubble {
  max-width: 78%; padding: 12px 16px; border-radius: 14px;
  font-size: 14px; line-height: 1.8; font-weight: 500;
}
.aai-bubble.bot {
  background: var(--surface);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  color: var(--text);
}
.aai-bubble.user {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.aai-file-ref {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700;
  margin-bottom: 8px; padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  opacity: 0.85;
}

/* Typing indicator */
.aai-typing { display: flex; gap: 5px; align-items: center; padding: 4px 2px; }
.aai-typing span {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent); animation: pulse 1.2s ease-in-out infinite;
}
.aai-typing span:nth-child(2) { animation-delay: 0.2s; }
.aai-typing span:nth-child(3) { animation-delay: 0.4s; }

/* ── Bottom input area ── */
.aai-input-area {
  flex-shrink: 0;
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 16px 24px;
  padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
}
.aai-input-inner { max-width: 760px; margin: 0 auto; width: 100%; }

.aai-chips-row {
  display: flex; gap: 6px; margin-bottom: 12px;
  overflow-x: auto; scrollbar-width: none; padding-bottom: 1px;
}
.aai-chips-row::-webkit-scrollbar { display: none; }
.aai-chip {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 100px; padding: 5px 13px;
  font-size: 11px; font-weight: 700; color: var(--text-2);
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
  font-family: var(--font);
}
.aai-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

.aai-file-preview {
  display: flex; align-items: center; gap: 8px;
  background: var(--accent-dim); border: 1px solid rgba(108,99,255,0.25);
  border-radius: var(--radius-sm); padding: 7px 12px;
  margin-bottom: 10px; width: fit-content;
  font-size: 12px; font-weight: 700; color: var(--accent);
}
.aai-file-preview-x {
  background: none; border: none; cursor: pointer;
  color: var(--accent); opacity: 0.7; padding: 0; display: flex;
}
.aai-file-preview-x:hover { opacity: 1; }

.aai-input-box {
  display: flex; align-items: flex-end; gap: 10px;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: 16px; padding: 12px 14px;
  transition: all 0.2s;
}
.aai-input-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.aai-input-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-3); padding: 2px; border-radius: 6px;
  transition: 0.15s; flex-shrink: 0; display: flex;
  align-items: center; justify-content: center;
}
.aai-input-btn:hover { color: var(--accent); }
.aai-textarea {
  flex: 1; background: transparent; border: none;
  font-size: 14px; font-weight: 500; color: var(--text);
  outline: none; resize: none; line-height: 1.6;
  font-family: var(--font); max-height: 120px; min-height: 22px;
}
.aai-textarea::placeholder { color: var(--text-3); }
.aai-send-btn {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  background: var(--surface2); color: var(--text-3);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.18s; flex-shrink: 0;
}
.aai-send-btn.ready { background: var(--accent); color: #fff; box-shadow: 0 4px 12px var(--accent-glow); }
.aai-send-btn.ready:hover { transform: scale(1.05); }
.aai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.aai-spinner {
  width: 16px; height: 16px; border: 2px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.aai-spinner-sm {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
}

/* ── Mobile overlay drawer ── */
.aai-drawer-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
  display: none;
}
.aai-drawer-overlay.open { display: block; }

.aai-drawer {
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 51;
  width: 280px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transform: translateX(-100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
}
.aai-drawer.open { transform: translateX(0); }

.aai-drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.aai-drawer-title {
  font-size: 13px; font-weight: 800; color: var(--text);
}
.aai-drawer-close {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-2); transition: 0.15s;
}
.aai-drawer-close:hover { color: var(--text); border-color: var(--border-h); }

.aai-drawer-new {
  margin: 12px 12px 8px;
  display: flex; align-items: center; gap: 8px;
  background: var(--accent-dim); border: 1px solid rgba(108,99,255,0.3);
  border-radius: var(--radius-sm); padding: 10px 14px;
  font-size: 13px; font-weight: 700; color: var(--accent);
  cursor: pointer; font-family: var(--font); transition: all 0.15s;
  flex-shrink: 0;
}
.aai-drawer-new:hover { background: rgba(108,99,255,0.2); }

.aai-drawer-list {
  flex: 1; overflow-y: auto; padding: 4px 8px 16px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.aai-drawer-list::-webkit-scrollbar { width: 3px; }
.aai-drawer-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .aai-history-panel { display: none; }
  .aai-input-area {
    padding: 12px 14px;
    padding-bottom: calc(68px + env(safe-area-inset-bottom, 16px));
  }
  .aai-messages-inner { padding: 0 14px; }
  .aai-topbar { padding: 0 14px; }
  .aai-brand-badge { display: none; }
}
@media (min-width: 769px) {
  .aai-drawer-overlay, .aai-drawer { display: none !important; }
  .aai-topbar-icon-btn.menu-toggle { display: none; }
  .aai-topbar-icon-btn.history-drawer-btn { display: none; }
}
`;

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const QUICK_PROMPTS = [
  "Summarize my notes",
  "Make flashcards",
  "Exam strategy tips",
  "Explain this concept",
  "Quiz me on topic",
];

const WELCOME_MSG = {
  role: "assistant",
  content: "Hey! I'm your AI study assistant 🎓\nAsk me anything about your notes, get flashcards, exam help, or concept explanations.",
  isWelcome: true,
};

/* ─────────────────────────── HELPERS ─────────────────────────── */
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function autoResize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

/* ─────────────────────────── HISTORY ITEM ─────────────────────────── */
function HistoryItem({ chat, active, onSelect, onDelete }) {
  return (
    <button
      className={`aai-hist-item${active ? " active" : ""}`}
      onClick={onSelect}
    >
      <div className="aai-hist-icon">
        <MessageSquare size={12} />
      </div>
      <div className="aai-hist-info">
        <div className="aai-hist-title">{chat.title || "Conversation"}</div>
        <div className="aai-hist-date">{formatDate(chat.updatedAt)}</div>
      </div>
      <button
        className="aai-hist-del"
        onClick={e => { e.stopPropagation(); onDelete(chat._id); }}
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </button>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function AskAIPage() {
  /* State */
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [chatId, setChatId] = useState(null);          // null = new unsaved chat
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);  // For outer Sidebar component

  /* Refs */
  const bottomRef    = useRef(null);
  const textareaRef  = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimer    = useRef(null);

  /* ── Load history on mount ── */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/ai/chats");
        const list = data || [];
        setSessions(list);
        // Always start fresh — new chat on page load
        setChatId(null);
        setMessages([WELCOME_MSG]);
      } catch (_) {}
    };
    load();
  }, []);

  /* ── Auto-save after messages change ── */
  useEffect(() => {
    const realMsgs = messages.filter(m => !m.isWelcome);
    if (realMsgs.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const title = realMsgs.find(m => m.role === "user")?.content?.slice(0, 55) || "New Chat";
        const payload = { id: chatId, title, messages: realMsgs };
        const { data } = await API.post("/ai/chats", payload);
        setChatId(data._id);
        setSessions(prev => {
          const without = prev.filter(c => c._id !== data._id);
          return [data, ...without].slice(0, 40);
        });
      } catch (_) {}
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [messages]); // eslint-disable-line

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Textarea auto resize ── */
  useEffect(() => { autoResize(textareaRef.current); }, [input]);

  /* ── Start new chat ── */
  const startNewChat = useCallback(() => {
    setChatId(null);
    setMessages([WELCOME_MSG]);
    setInput("");
    setSelectedFile(null);
    setDrawerOpen(false);
  }, []);

  /* ── Load existing chat ── */
  const loadChat = useCallback((chat) => {
    setChatId(chat._id);
    const msgs = chat.messages?.length ? chat.messages : [WELCOME_MSG];
    setMessages(msgs);
    setDrawerOpen(false);
  }, []);

  /* ── Delete chat ── */
  const deleteChat = useCallback(async (id) => {
    try {
      await API.delete(`/ai/chats/${id}`);
      setSessions(prev => prev.filter(c => c._id !== id));
      if (chatId === id) startNewChat();
      toast.success("Chat deleted");
    } catch {
      toast.error("Could not delete");
    }
  }, [chatId, startNewChat]);

  /* ── Send message ── */
  const send = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if ((!text && !selectedFile) || loading) return;

    setInput("");
    const userMsg = { role: "user", content: text, fileName: selectedFile?.name };
    setMessages(prev => {
      const base = prev.filter(m => !m.isWelcome);
      return [...base, userMsg];
    });
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const history = messages
        .filter(m => !m.isWelcome && !m.streaming)
        .map(m => ({ role: m.role, content: m.content }));

      let resp;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("question", text);
        fd.append("file", selectedFile);
        fd.append("history", JSON.stringify(history));
        const { data } = await API.post("/ai/ask-with-file", fd);
        resp = data;
        setSelectedFile(null);
      } else {
        const { data } = await API.post("/ai/ask", { question: text, history });
        resp = data;
      }

      const reply = resp?.answer || resp?.response || "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: reply };
        return next;
      });
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [input, selectedFile, loading, messages]);

  /* ── Keyboard handler ── */
  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  const canSend = (input.trim() || selectedFile) && !loading;
  const showWelcome = messages.length === 1 && messages[0].isWelcome;

  /* ── History panel content (shared between sidebar & drawer) ── */
  const HistoryContent = ({ inDrawer = false }) => (
    <>
      {inDrawer && (
        <>
          <div className="aai-drawer-head">
            <span className="aai-drawer-title">Chat History</span>
            <button className="aai-drawer-close" onClick={() => setDrawerOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <button className="aai-drawer-new" onClick={startNewChat}>
            <Plus size={14} /> New Chat
          </button>
        </>
      )}
      {!inDrawer && (
        <div className="aai-history-head">
          <span className="aai-history-label">History</span>
        </div>
      )}
      <div className={inDrawer ? "aai-drawer-list" : "aai-history-list"}>
        {sessions.length === 0 ? (
          <div className="aai-history-empty">
            <div className="aai-history-empty-icon">
              <MessageSquare size={16} color="var(--text-3)" />
            </div>
            <p>No chats yet.<br />Start a new conversation!</p>
          </div>
        ) : (
          sessions.map(chat => (
            <HistoryItem
              key={chat._id}
              chat={chat}
              active={chatId === chat._id}
              onSelect={() => loadChat(chat)}
              onDelete={deleteChat}
            />
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="aai-root">
      <style>{STYLES}</style>

      {/* Outer app sidebar (navigation) */}
      <div className="aai-app-sidebar">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={`aai-drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      {/* Mobile drawer */}
      <div className={`aai-drawer${drawerOpen ? " open" : ""}`}>
        <HistoryContent inDrawer />
      </div>

      {/* Main */}
      <div className="aai-main">
        {/* Topbar */}
        <div className="aai-topbar">
          {/* Mobile: open outer nav sidebar */}
          <button
            className="aai-topbar-icon-btn menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={17} />
          </button>

          <div className="aai-brand">
            <div className="aai-brand-dot">
              <Sparkles size={14} color="#fff" />
            </div>
            <span className="aai-brand-name">Ask AI</span>
            <span className="aai-brand-badge">Beta</span>
          </div>

          {/* Mobile: open history drawer */}
          <button
            className="aai-topbar-icon-btn history-drawer-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Chat history"
          >
            <MessageSquare size={15} />
          </button>

          <button className="aai-new-chat-btn" onClick={startNewChat}>
            <Plus size={13} /> New Chat
          </button>
        </div>

        {/* Shell */}
        <div className="aai-shell">
          {/* Desktop history panel */}
          <aside className="aai-history-panel">
            <HistoryContent />
          </aside>

          {/* Chat area */}
          <div className="aai-chat-panel">
            {/* Messages */}
            <div className="aai-messages-wrap">
              <div className="aai-messages-inner">
                {showWelcome && (
                  <div className="aai-welcome">
                    <div className="aai-welcome-orb">
                      <Sparkles size={28} color="var(--accent)" />
                    </div>
                    <div className="aai-welcome-title">Your AI Study Buddy</div>
                    <div className="aai-welcome-sub">
                      Ask anything about your notes, get summaries, flashcards, exam tips, and more.
                    </div>
                    <div className="aai-welcome-chips">
                      {QUICK_PROMPTS.map((p, i) => (
                        <button key={i} className="aai-welcome-chip" onClick={() => send(p)}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.filter(m => !m.isWelcome).map((msg, i) => (
                  <div
                    key={i}
                    className={`aai-msg${msg.role === "user" ? " user" : ""}`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className={`aai-av${msg.role === "user" ? " user" : " bot"}`}>
                      {msg.role === "user"
                        ? <User size={14} />
                        : <Zap size={14} />
                      }
                    </div>
                    <div className={`aai-bubble${msg.role === "user" ? " user" : " bot"}`}>
                      {msg.fileName && (
                        <div className="aai-file-ref">
                          <File size={11} /> {msg.fileName}
                        </div>
                      )}
                      {msg.streaming
                        ? <div className="aai-typing">
                            <span /><span /><span />
                          </div>
                        : <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                      }
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} style={{ height: 1 }} />
              </div>
            </div>

            {/* ── Fixed bottom input ── */}
            <div className="aai-input-area">
              <div className="aai-input-inner">
                {/* Quick chips (only show when no conversation yet) */}
                {showWelcome && (
                  <div className="aai-chips-row">
                    {QUICK_PROMPTS.map((p, i) => (
                      <button key={i} className="aai-chip" onClick={() => send(p)}>{p}</button>
                    ))}
                  </div>
                )}

                {/* File preview */}
                {selectedFile && (
                  <div className="aai-file-preview">
                    <File size={12} />
                    <span>{selectedFile.name}</span>
                    <button
                      className="aai-file-preview-x"
                      onClick={() => setSelectedFile(null)}
                      aria-label="Remove file"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Input box */}
                <div className="aai-input-box">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={e => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }}
                  />
                  <button
                    className="aai-input-btn"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>

                  <textarea
                    ref={textareaRef}
                    className="aai-textarea"
                    placeholder="Ask anything about your notes…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                  />

                  <button
                    className={`aai-send-btn${canSend ? " ready" : ""}`}
                    onClick={() => send()}
                    disabled={!canSend}
                    aria-label="Send message"
                  >
                    {loading
                      ? <div className="aai-spinner-sm" />
                      : <Send size={15} />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Inline script to wire up history drawer button on mobile */}
      {/* Using state + CSS is cleaner — handled via media query display:none on icon btn */}
    </div>
  );
}
