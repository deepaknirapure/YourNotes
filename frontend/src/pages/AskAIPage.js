import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RefreshCw, Copy, Check, Menu, Paperclip, X, File } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .ai-wrap { display: flex; height: 100vh; overflow: hidden; background: #FAFAFA; }
  .ai-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  
  /* Top Navigation */
  .ai-topbar { 
    height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .ai-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  /* Chat Area */
  .ai-messages { 
    flex: 1; overflow-y: auto; padding: 32px 24px; display: flex; 
    flex-direction: column; gap: 24px; max-width: 900px; margin: 0 auto; width: 100%; scrollbar-width: none;
  }
  .ai-msg { display: flex; gap: 16px; align-items: flex-start; animation: fadeUp .2s both; }
  .ai-msg.user { flex-direction: row-reverse; }
  
  /* Avatars */
  .ai-avatar { 
    width: 32px; height: 32px; border-radius: 10px; display: flex; 
    align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px;
  }
  .ai-avatar.bot { background: #FFF5F2; border: 1px solid #FFE4DB; color: #E55B2D; }
  .ai-avatar.user { background: #F8FAFC; border: 1px solid #E2E8F0; color: #64748B; }
  
  /* Message Bubbles */
  .ai-bubble { 
    max-width: 80%; padding: 16px 20px; border-radius: 16px; font-size: 15px; 
    line-height: 1.6; color: #0F172A; font-weight: 500;
  }
  .ai-bubble.bot { 
    background: #FFF; border: 1px solid #E2E8F0; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.02); border-top-left-radius: 4px; 
  }
  .ai-bubble.user { 
    background: #F1F5F9; border: 1px solid #E2E8F0; border-top-right-radius: 4px; 
  }
  
  .file-attachment-msg {
    display: flex; align-items: center; gap: 8px; background: #FFF; border: 1px solid #E2E8F0;
    padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; color: #64748B;
  }

  /* Code Blocks */
  .ai-bubble code { 
    background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; 
    padding: 2px 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #E55B2D; 
  }
  .ai-bubble pre { 
    background: #0F172A; border-radius: 10px; padding: 16px; overflow-x: auto; margin: 12px 0; 
  }
  .ai-bubble pre code { background: none; border: none; padding: 0; color: #E2E8F0; font-size: 13px; }
  
  /* Action Buttons */
  .ai-copy-btn { 
    background: none; border: none; color: #94A3B8; cursor: pointer; padding: 6px; 
    border-radius: 6px; transition: 0.2s; display: flex; margin-top: 8px; 
  }
  .ai-copy-btn:hover { background: #F1F5F9; color: #0F172A; }
  
  /* Bottom Input Area */
  .ai-bottom { background: #FFF; border-top: 1px solid #E2E8F0; padding: 24px; flex-shrink: 0; }
  .ai-bottom-inner { max-width: 900px; margin: 0 auto; width: 100%; position: relative; }
  
  .ai-prompt-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .ai-chip { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 100px; 
    padding: 8px 16px; font-size: 13px; font-weight: 600; color: #64748B; 
    cursor: pointer; transition: 0.2s; font-family: inherit; 
  }
  .ai-chip:hover:not(:disabled) { border-color: #CBD5E1; color: #0F172A; background: #F8FAFC; }
  
  /* File Preview Badge */
  .file-preview-badge {
    display: inline-flex; align-items: center; gap: 8px; background: #F8FAFC;
    border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 12px;
    font-size: 13px; font-weight: 600; color: #0F172A; margin-bottom: 12px;
    animation: fadeUp 0.2s ease;
  }
  .file-remove-btn {
    background: none; border: none; color: #94A3B8; cursor: pointer;
    display: flex; align-items: center; justify-content: center; padding: 2px;
    border-radius: 4px; transition: 0.2s;
  }
  .file-remove-btn:hover { background: #E2E8F0; color: #E55B2D; }

  /* Input Wrapper */
  .ai-input-wrapper { 
    display: flex; gap: 10px; align-items: flex-end; background: #FFF; 
    border: 1px solid #E2E8F0; border-radius: 16px; padding: 10px 10px 10px 12px; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: 0.2s; 
  }
  .ai-input-wrapper:focus-within { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  
  .ai-attach-btn {
    background: transparent; border: none; color: #94A3B8; cursor: pointer;
    padding: 8px; border-radius: 10px; transition: 0.2s; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ai-attach-btn:hover { background: #F1F5F9; color: #0F172A; }

  .ai-textarea { 
    flex: 1; background: transparent; border: none; padding: 8px 0; font-size: 15px; 
    font-family: inherit; color: #0F172A; font-weight: 500; resize: none; outline: none; 
    max-height: 150px; min-height: 40px; line-height: 1.5; 
  }
  .ai-textarea::placeholder { color: #94A3B8; font-weight: 400; }
  
  .ai-send-btn { 
    width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; 
    display: flex; align-items: center; justify-content: center; transition: 0.2s; flex-shrink: 0; 
  }
  .ai-send-btn.active { background: #0F172A; color: #FFF; }
  .ai-send-btn.active:hover { background: #E55B2D; transform: translateY(-1px); }
  .ai-send-btn.disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; }
  
  .ai-spinner { width: 16px; height: 16px; border: 2px solid #E2E8F0; border-top-color: #0F172A; border-radius: 50%; animation: spin .7s linear infinite; }
  .ai-cursor { display: inline-block; width: 2px; height: 15px; background: #E55B2D; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 2px; }
  
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) { 
    .ai-menu-btn { display: flex !important; } 
    .ai-bubble { max-width: 90% !important; } 
    .ai-messages { padding: 24px 16px; } 
    .ai-bottom { padding: 16px; }
  }
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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null); 
  
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null); 

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // NAYA FUNCTION: Chip click karne par text input me add hoga
  const handleChipClick = (text) => {
    setInput(prev => prev ? prev + " " + text : text);
    
    // Auto-focus input after clicking chip and adjust height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
      }
    }, 0);
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if ((!q && !selectedFile) || loading) return; 
    
    setInput("");
    
    const userMessageObj = { role: "user", content: q };
    if (selectedFile) {
      userMessageObj.fileName = selectedFile.name;
    }
    
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
        
        const { data } = await API.post("/ai/ask-with-file", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        responseData = data;
        
        setSelectedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        
      } else {
        const { data } = await API.post("/ai/ask", { question: q, history });
        responseData = data;
      }

      const reply = responseData.answer || responseData.response || responseData.message || "Samajh nahi aaya, dobara try karo.";
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
    } finally { 
      setLoading(false); 
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
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
    setSelectedFile(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="ai-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <div className="ai-main">
        <div className="ai-topbar">
          <button className="ai-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#FFF5F2", border: "1px solid #FFE4DB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={18} color="#E55B2D" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>YOURNOTES AI</span>
          <div style={{ marginLeft: "auto", display: "flex" }}>
            <button 
              onClick={clearChat} 
              style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#64748B", fontSize: 13, fontWeight: 600, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "0.2s" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#0F172A"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#FFF"; e.currentTarget.style.color = "#64748B"; }}
            >
              <RefreshCw size={14} /> Clear Chat
            </button>
          </div>
        </div>

        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-msg ${msg.role === "user" ? "user" : ""}`}>
              <div className={`ai-avatar ${msg.role === "user" ? "user" : "bot"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div>
                <div className={`ai-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                  {msg.fileName && (
                    <div className="file-attachment-msg">
                      <File size={14} color="#E55B2D" /> {msg.fileName}
                    </div>
                  )}

                  {msg.streaming ? (
                    <span><span className="ai-cursor" /></span>
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                  )}
                </div>
                {msg.role === "assistant" && !msg.streaming && msg.content && (
                  <button className="ai-copy-btn" onClick={() => copyMsg(msg.content, i)} title="Copy to clipboard">
                    {copiedIdx === i ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="ai-bottom">
          <div className="ai-bottom-inner">
            <div className="ai-prompt-chips">
              {PROMPTS.map((p, i) => (
                <button 
                  key={i} 
                  className="ai-chip" 
                  onClick={() => handleChipClick(p)} 
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            </div>

            {selectedFile && (
              <div className="file-preview-badge">
                <File size={14} color="#64748B" />
                <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedFile.name}
                </span>
                <button 
                  className="file-remove-btn" 
                  onClick={() => {
                    setSelectedFile(null);
                    if(fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="ai-input-wrapper">
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,image/*" 
              />
              
              <button 
                className="ai-attach-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>

              <textarea
                ref={textareaRef}
                className="ai-textarea"
                placeholder="Ask YourNotes AI anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                style={{ height: "auto" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px"; }}
                disabled={loading}
              />
              
              <button 
                className={`ai-send-btn ${(!input.trim() && !selectedFile || loading) ? 'disabled' : 'active'}`} 
                onClick={() => send()} 
                disabled={(!input.trim() && !selectedFile) || loading}
              >
                {loading ? <div className="ai-spinner" /> : <Send size={16} />}
              </button>
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#94A3B8", marginTop: 12, textAlign: "center" }}>
              AI can make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}