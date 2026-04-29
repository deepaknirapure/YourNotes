import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RefreshCw, Copy, Check, Menu, Paperclip, X, File, Plus, Trash2, Zap } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FFFFFF; color: #000; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .ai-wrap { display: flex; height: 100dvh; overflow: hidden; background: #FFFFFF; }
  .ai-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .ai-shell { flex: 1; display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 0; }
  
  /* Sidebar History */
  .ai-history { background: #F8FAFC; border-right: 1px solid #F1F5F9; overflow-y: auto; padding: 20px; }
  .ai-history-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .ai-history-title { font-size: 11px; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
  
  .ai-history-item { 
    width: 100%; text-align: left; border: 1px solid #E2E8F0; background: #FFF; 
    border-radius: 12px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.3s;
  }
  .ai-history-item:hover { border-color: #000; }
  .ai-history-item.active { background: #000; border-color: #000; }
  .ai-history-item.active .ai-history-name { color: #ccff00; }
  .ai-history-item.active .ai-history-date { color: #555; }
  
  .ai-history-name { font-size: 13px; font-weight: 800; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ai-history-date { font-size: 11px; font-weight: 700; color: #94A3B8; margin-top: 4px; }

  /* Topbar */
  .ai-topbar { 
    height: 70px; display: flex; align-items: center; gap: 16px; padding: 0 32px; 
    background: #FFF; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; 
  }
  .ai-menu-btn { display: none; background: #F1F5F9; border: none; border-radius: 10px; cursor: pointer; padding: 8px; color: #000; }
  
  /* Chat Messages */
  .ai-messages { 
    flex: 1; overflow-y: auto; padding: 40px 24px; display: flex; 
    flex-direction: column; gap: 32px; max-width: 850px; margin: 0 auto; width: 100%; scrollbar-width: none;
  }
  .ai-msg { display: flex; gap: 20px; align-items: flex-start; animation: fadeUp 0.4s ease-out both; }
  .ai-msg.user { flex-direction: row-reverse; }
  
  .ai-avatar { 
    width: 36px; height: 36px; border-radius: 10px; display: flex; 
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ai-avatar.bot { background: #000; color: #ccff00; }
  .ai-avatar.user { background: #F1F5F9; color: #000; border: 1px solid #E2E8F0; }
  
  .ai-bubble { 
    max-width: 85%; padding: 18px 22px; border-radius: 20px; font-size: 15px; 
    line-height: 1.7; color: #1E293B; font-weight: 600;
  }
  .ai-bubble.bot { background: #FFF; border: 1px solid #F1F5F9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
  .ai-bubble.user { background: #000; color: #FFF; }
  
  /* Input Section */
  .ai-bottom { 
    background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px);
    border-top: 1px solid #F1F5F9; padding: 24px; flex-shrink: 0;
  }
  .ai-bottom-inner { max-width: 850px; margin: 0 auto; width: 100%; }
  
  .ai-chip { 
    background: #FFF; border: 1px solid #F1F5F9; border-radius: 12px; 
    padding: 8px 16px; font-size: 12px; font-weight: 800; color: #64748B; 
    cursor: pointer; transition: 0.3s;
  }
  .ai-chip:hover { border-color: #ccff00; color: #000; background: #ccff00; }
  
  .ai-input-wrapper { 
    display: flex; gap: 12px; align-items: center; background: #FFF; 
    border: 1px solid #F1F5F9; border-radius: 18px; padding: 12px 16px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.03); transition: 0.3s; 
  }
  .ai-input-wrapper:focus-within { border-color: #000; }
  
  .ai-textarea { 
    flex: 1; background: transparent; border: none; font-size: 15px; 
    font-weight: 600; color: #000; outline: none; max-height: 150px; 
  }
  .ai-send-btn { 
    width: 42px; height: 42px; border-radius: 14px; border: none; cursor: pointer; 
    display: flex; align-items: center; justify-content: center; transition: 0.3s;
  }
  .ai-send-btn.active { background: #ccff00; color: #000; }
  .ai-send-btn.active:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(204,255,0,0.4); }
  
  .ai-spinner { width: 18px; height: 18px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: spin .8s linear infinite; }
  
  @media(max-width:768px) { 
    .ai-shell { grid-template-columns: 1fr !important; }
    .ai-history { display: none !important; }
    .ai-menu-btn { display: flex !important; }
    .ai-topbar { padding: 0 16px; }
  }
`;

const PROMPTS = [
  "Summarize my notes",
  "Create flashcards",
  "Exam strategy",
  "Explain concept",
];

const STARTER_MESSAGE = {
  role: "assistant",
  content: "Systems Online. How can I assist your learning process today?",
};

export default function AskAIPage() {
  const HISTORY_KEY = "yournotes_ai_history_v1";
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
        const title = messages.find((m) => m.role === "user")?.content?.slice(0, 60) || "New Conversation";
        const { data } = await API.post("/ai/chats", { id: chatId, title, messages });
        setChatId(data._id);
        setChatSessions((prev) => {
          const without = prev.filter((c) => c._id !== data._id);
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
    const userMessageObj = { role: "user", content: q, fileName: selectedFile?.name };
    setMessages(prev => [...prev, userMessageObj]);
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

      const reply = responseData.answer || responseData.response || "Neural link timed out. Try again.";
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: reply };
        return next;
      });
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Error communicating with AI engine." };
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
      setChatSessions((prev) => prev.filter((c) => c._id !== id));
      if (chatId === id) startNewChat();
      toast.success("Log deleted");
    } catch { toast.error("Action failed"); }
  };

  return (
    <div className="ai-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="ai-main">
        <div className="ai-topbar">
          <button className="ai-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div style={{ padding: "8px", borderRadius: "10px", background: "#000" }}><Bot size={18} color="#ccff00" /></div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px" }}>NEURAL <span style={{color: "#ccff00", background: "#000", padding: "2px 6px", borderRadius: "4px"}}>CHAT</span></span>
          <button onClick={startNewChat} style={{ marginLeft: "auto", background: "#000", color: "#ccff00", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>NEW SESSION</button>
        </div>

        <div className="ai-shell">
          <aside className="ai-history">
            <div className="ai-history-head">
              <span className="ai-history-title">Session History</span>
            </div>
            {chatSessions.map((chat) => (
              <div key={chat._id} className={`ai-history-item ${chatId === chat._id ? "active" : ""}`} onClick={() => { setChatId(chat._id); setMessages(chat.messages); }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ai-history-name">{chat.title || "Conversation"}</div>
                    <div className="ai-history-date">{new Date(chat.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <Trash2 size={14} color="#555" onClick={(e) => deleteChat(e, chat._id)} />
                </div>
              </div>
            ))}
          </aside>

          <section className="ai-chat-panel">
            <div className="ai-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ai-msg ${msg.role === "user" ? "user" : ""}`}>
                  <div className={`ai-avatar ${msg.role === "user" ? "user" : "bot"}`}>
                    {msg.role === "user" ? <User size={18} /> : <Zap size={18} />}
                  </div>
                  <div className={`ai-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                    {msg.fileName && <div style={{ fontSize: 11, fontWeight: 800, color: "#ccff00", marginBottom: 8 }}>ATTACHMENT: {msg.fileName}</div>}
                    {msg.streaming ? <div className="ai-spinner" /> : <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="ai-bottom">
              <div className="ai-bottom-inner">
                <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 5 }}>
                  {PROMPTS.map((p, i) => (
                    <button key={i} className="ai-chip" onClick={() => send(p)}>{p}</button>
                  ))}
                </div>

                {selectedFile && (
                  <div style={{ background: "#000", color: "#ccff00", padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 10, width: "fit-content" }}>
                    <File size={14} /> {selectedFile.name} <X size={14} onClick={() => setSelectedFile(null)} style={{cursor: "pointer"}} />
                  </div>
                )}

                <div className="ai-input-wrapper">
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <Paperclip size={20} color="#555" onClick={() => fileInputRef.current.click()} style={{cursor: "pointer"}} />
                  <textarea
                    ref={textareaRef}
                    className="ai-textarea"
                    placeholder="Input query for Neural Engine..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    rows={1}
                  />
                  <button className={`ai-send-btn ${input.trim() ? 'active' : ''}`} onClick={() => send()} disabled={loading || (!input.trim() && !selectedFile)}>
                    {loading ? <div className="ai-spinner" /> : <Send size={18} />}
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