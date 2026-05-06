import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Menu, Paperclip, X, File, Trash2, Zap } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }

  .ai-wrap { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; }
  .ai-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* Topbar */
  .ai-topbar {
    height: 58px; display: flex; align-items: center; gap: 12px; padding: 0 24px;
    background: var(--surface); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .ai-menu-btn {
    display: none; background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; cursor: pointer; padding: 7px; color: var(--text-muted);
    align-items: center; justify-content: center; transition: 0.15s;
  }
  .ai-menu-btn:hover { border-color: var(--accent); color: var(--accent); }
  .ai-title-badge {
    display: flex; align-items: center; gap: 8px;
  }
  .ai-icon-box {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
  }
  .ai-page-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }

  /* Shell */
  .ai-shell { flex: 1; display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 0; overflow: hidden; }

  /* History sidebar */
  .ai-history {
    background: var(--surface); border-right: 1px solid var(--border);
    overflow-y: auto; padding: 16px; scrollbar-width: none;
  }
  .ai-history::-webkit-scrollbar { display: none; }
  .ai-history-head {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
  }
  .ai-history-title {
    font-size: 11px; font-weight: 800; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .ai-history-item {
    width: 100%; text-align: left;
    border: 1px solid var(--border); background: var(--bg);
    border-radius: 10px; padding: 11px 12px; margin-bottom: 8px;
    cursor: pointer; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .ai-history-item:hover { border-color: var(--border-hover); background: var(--surface); }
  .ai-history-item.active {
    border-color: var(--accent); background: var(--accent-light);
  }
  .ai-history-name {
    font-size: 13px; font-weight: 700; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ai-history-item.active .ai-history-name { color: var(--accent); }
  .ai-history-date { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 3px; }

  /* Chat */
  .ai-chat-panel { display: flex; flex-direction: column; overflow: hidden; }
  .ai-messages {
    flex: 1; overflow-y: auto; padding: 32px 24px;
    display: flex; flex-direction: column; gap: 24px;
    max-width: 820px; margin: 0 auto; width: 100%;
    scrollbar-width: none;
  }
  .ai-messages::-webkit-scrollbar { display: none; }

  .ai-msg { display: flex; gap: 14px; align-items: flex-start; animation: fadeUp 0.35s ease-out both; }
  .ai-msg.user { flex-direction: row-reverse; }

  .ai-avatar {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ai-avatar.bot { background: var(--accent-light); color: var(--accent); border: 1px solid rgba(249,115,22,0.2); }
  .ai-avatar.user { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }

  .ai-bubble {
    max-width: 80%; padding: 14px 18px; border-radius: 16px;
    font-size: 14px; line-height: 1.75; font-weight: 500; color: var(--text);
  }
  .ai-bubble.bot {
    background: var(--surface); border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
  }
  .ai-bubble.user {
    background: var(--accent); color: #fff;
    border-bottom-right-radius: 4px;
  }

  /* Input area */
  .ai-bottom {
    background: var(--surface); border-top: 1px solid var(--border);
    padding: 16px 24px; flex-shrink: 0;
  }
  .ai-bottom-inner { max-width: 820px; margin: 0 auto; width: 100%; }

  .ai-chips { display: flex; gap: 7px; margin-bottom: 12px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .ai-chips::-webkit-scrollbar { display: none; }
  .ai-chip {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 100px; padding: 6px 14px;
    font-size: 12px; font-weight: 700; color: var(--text-muted);
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .ai-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  .ai-input-wrapper {
    display: flex; gap: 10px; align-items: center;
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 14px; padding: 10px 14px; transition: all 0.18s;
  }
  .ai-input-wrapper:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
    background: var(--surface);
  }
  .ai-textarea {
    flex: 1; background: transparent; border: none; font-size: 14px;
    font-weight: 500; color: var(--text); outline: none; max-height: 130px;
    resize: none; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.5;
  }
  .ai-textarea::placeholder { color: var(--text-light); }
  .ai-attach-btn {
    background: none; border: none; cursor: pointer; color: var(--text-muted);
    padding: 4px; border-radius: 6px; transition: 0.15s; flex-shrink: 0;
    display: flex; align-items: center;
  }
  .ai-attach-btn:hover { color: var(--accent); }

  .ai-send-btn {
    width: 38px; height: 38px; border-radius: 11px; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.18s; flex-shrink: 0;
    background: var(--border); color: var(--text-muted);
  }
  .ai-send-btn.active { background: var(--accent); color: #fff; }
  .ai-send-btn.active:hover { background: var(--accent-hover); box-shadow: 0 4px 14px rgba(249,115,22,0.3); }
  .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .ai-spinner {
    width: 16px; height: 16px; border: 2.5px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  .ai-spinner-sm {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
  }

  .ai-file-tag {
    background: var(--accent-light); color: var(--accent);
    border: 1px solid rgba(249,115,22,0.2);
    padding: 6px 12px; border-radius: 100px; font-size: 12px;
    font-weight: 700; margin-bottom: 10px; width: fit-content;
    display: flex; align-items: center; gap: 7px;
  }
  .ai-file-tag svg { cursor: pointer; opacity: 0.7; }
  .ai-file-tag svg:hover { opacity: 1; }

  .ai-new-btn {
    margin-left: auto; background: var(--bg); color: var(--text-muted);
    border: 1px solid var(--border); border-radius: 8px;
    padding: 7px 13px; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .ai-new-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  @media(max-width: 768px) {
    .ai-shell { grid-template-columns: 1fr; }
    .ai-history { display: none; }
    .ai-menu-btn { display: flex !important; }
    .ai-topbar { padding: 0 14px; }
    .ai-messages { padding: 16px 14px; padding-bottom: 0; }
    .ai-bottom { padding: 12px 14px; padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px)); }
  }
`;

const PROMPTS = ["Summarize my notes", "Create flashcards", "Exam strategy", "Explain concept"];

const STARTER_MESSAGE = {
  role: "assistant",
  content: "Hi! I'm your AI study assistant. Ask me anything about your notes, or use the quick prompts below to get started.",
};

export default function AskAIPage() {
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const [chatId, setChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await API.get("/ai/chats");
        const sessions = data || [];
        setChatSessions(sessions);
        if (sessions[0]) {
          setChatId(sessions[0]._id);
          setMessages(sessions[0].messages?.length ? sessions[0].messages : [STARTER_MESSAGE]);
        }
      } catch (_) {}
    };
    loadChats();
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const title = messages.find(m => m.role === "user")?.content?.slice(0, 60) || "New Conversation";
        const { data } = await API.post("/ai/chats", { id: chatId, title, messages });
        setChatId(data._id);
        setChatSessions(prev => {
          const without = prev.filter(c => c._id !== data._id);
          return [data, ...without].slice(0, 30);
        });
      } catch (_) {}
    }, 1000);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [messages, chatId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if ((!q && !selectedFile) || loading) return;
    setInput("");
    const userMsg = { role: "user", content: q, fileName: selectedFile?.name };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      let responseData;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("question", q);
        formData.append("file", selectedFile);
        formData.append("history", JSON.stringify(history));
        const { data } = await API.post("/ai/ask-with-file", formData);
        responseData = data;
        setSelectedFile(null);
      } else {
        const { data } = await API.post("/ai/ask", { question: q, history });
        responseData = data;
      }

      const reply = responseData.answer || responseData.response || "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: reply };
        return next;
      });
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
        return next;
      });
    } finally { setLoading(false); }
  };

  const startNewChat = () => {
    setChatId(null);
    setMessages([STARTER_MESSAGE]);
    setInput("");
  };

  const deleteChat = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/ai/chats/${id}`);
      setChatSessions(prev => prev.filter(c => c._id !== id));
      if (chatId === id) startNewChat();
      toast.success("Chat deleted");
    } catch { toast.error("Action failed"); }
  };

  return (
    <div className="ai-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="ai-main">
        <div className="ai-topbar">
          <button className="ai-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="ai-title-badge">
            <div className="ai-icon-box"><Bot size={15} color="#fff" /></div>
            <span className="ai-page-title">Ask AI</span>
          </div>
          <button className="ai-new-btn" onClick={startNewChat}>
            New Chat
          </button>
        </div>

        <div className="ai-shell">
          {/* History Sidebar */}
          <aside className="ai-history">
            <div className="ai-history-head">
              <span className="ai-history-title">History</span>
            </div>
            {chatSessions.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', padding: '20px 0' }}>
                No chats yet
              </p>
            )}
            {chatSessions.map(chat => (
              <button
                key={chat._id}
                className={`ai-history-item${chatId === chat._id ? " active" : ""}`}
                onClick={() => { setChatId(chat._id); setMessages(chat.messages); }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ai-history-name">{chat.title || "Conversation"}</div>
                    <div className="ai-history-date">{new Date(chat.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={e => deleteChat(e, chat._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 5, display: 'flex', alignItems: 'center', transition: '0.15s' }}
                    onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </button>
            ))}
          </aside>

          {/* Chat Panel */}
          <section className="ai-chat-panel">
            <div className="ai-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ai-msg${msg.role === "user" ? " user" : ""}`}>
                  <div className={`ai-avatar${msg.role === "user" ? " user" : " bot"}`}>
                    {msg.role === "user" ? <User size={16} /> : <Zap size={16} />}
                  </div>
                  <div className={`ai-bubble${msg.role === "user" ? " user" : " bot"}`}>
                    {msg.fileName && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: msg.role === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <File size={12} /> {msg.fileName}
                      </div>
                    )}
                    {msg.streaming
                      ? <div className="ai-spinner" />
                      : <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    }
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="ai-bottom">
              <div className="ai-bottom-inner">
                <div className="ai-chips">
                  {PROMPTS.map((p, i) => (
                    <button key={i} className="ai-chip" onClick={() => send(p)}>{p}</button>
                  ))}
                </div>

                {selectedFile && (
                  <div className="ai-file-tag">
                    <File size={12} /> {selectedFile.name}
                    <X size={12} onClick={() => setSelectedFile(null)} />
                  </div>
                )}

                <div className="ai-input-wrapper">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => setSelectedFile(e.target.files[0])}
                  />
                  <button className="ai-attach-btn" onClick={() => fileInputRef.current.click()}>
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    className="ai-textarea"
                    placeholder="Ask anything about your notes…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    rows={1}
                  />
                  <button
                    className={`ai-send-btn${input.trim() || selectedFile ? ' active' : ''}`}
                    onClick={() => send()}
                    disabled={loading || (!input.trim() && !selectedFile)}
                  >
                    {loading ? <div className="ai-spinner-sm" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
