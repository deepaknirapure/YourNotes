import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditCard, PenLine, FileText, ArrowLeft, Check, Loader2,
  X, Brain, Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Code, Quote, Sparkles, Hash
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

function RichToolbar({ onFormat }) {
  const tools = [
    { icon: <Bold size={16}/>,        cmd: 'bold',    title: 'Bold' },
    { icon: <Italic size={16}/>,      cmd: 'italic',  title: 'Italic' },
    { icon: <Heading1 size={16}/>,    cmd: 'h1',      title: 'H1' },
    { icon: <Heading2 size={16}/>,    cmd: 'h2',      title: 'H2' },
    { icon: <List size={16}/>,        cmd: 'ul',      title: 'Bullets' },
    { icon: <ListOrdered size={16}/>, cmd: 'ol',      title: 'Numbers' },
    { icon: <Code size={16}/>,        cmd: 'code',    title: 'Code' },
    { icon: <Quote size={16}/>,       cmd: 'quote',   title: 'Quote' },
  ];
  return (
    <div className="rich-toolbar">
      {tools.map(t => (
        <button key={t.cmd} title={t.title} onClick={() => onFormat(t.cmd)} className="tool-btn">
          {t.icon}
        </button>
      ))}
    </div>
  );
}

export default function NoteEditor({ note, onUpdate, onClose }) {
  const [title, setTitle]         = useState(note?.title || '');
  const [content, setContent]     = useState(note?.plainText || note?.content || '');
  const [saving, setSaving]       = useState(false);
  const [aiSummary, setAiSummary] = useState(note?.aiSummary || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [tagInput, setTagInput]   = useState('');
  const [tags, setTags]           = useState(note?.tags || []);

  const textareaRef = useRef(null);
  const saveTimer = useRef(null);
  const latestData = useRef({ title, content, tags });

  useEffect(() => { latestData.current = { title, content, tags }; }, [title, content, tags]);

  const performSave = useCallback(async () => {
    if (!note?._id) return;
    setSaving(true);
    try {
      const { data } = await API.put(`/notes/${note._id}`, {
        title: latestData.current.title,
        content: latestData.current.content,
        plainText: latestData.current.content,
        tags: latestData.current.tags
      });
      if (onUpdate) onUpdate(data);
    } catch (err) { console.error("Auto-save failed"); }
    finally { setSaving(false); }
  }, [note?._id, onUpdate]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(performSave, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [title, content, tags, performSave]);

  const handleAI = async (type) => {
    setLoadingAI(true);
    setActiveTab(type === 'summarize' ? 'summary' : type);
    try {
      const { data } = await API.post(`/ai/${type}/${note._id}`);
      if (type === 'summarize') setAiSummary(data.summary);
      if (type === 'flashcards') setFlashcards(data.flashcards || []);
      if (type === 'quiz') setQuizQuestions(data.questions || []);
    } catch (err) { toast.error('AI Analysis failed'); }
    finally { setLoadingAI(false); }
  };

  const handleFormat = (cmd) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);
    let insert = '';
    switch(cmd) {
      case 'bold':   insert = `**${sel || 'text'}**`; break;
      case 'italic': insert = `_${sel || 'text'}_`; break;
      case 'h1':     insert = `\n# ${sel || 'Heading'}\n`; break;
      case 'ul':     insert = `\n- ${sel || 'item'}\n`; break;
      default: return;
    }
    setContent(before + insert + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(before.length + insert.length, before.length + insert.length);
    }, 0);
  };

  return (
    <div className="editor-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .editor-root {
          display: flex; flex-direction: column;
          height: 100vh; height: 100dvh;
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden; color: var(--text);
        }

        /* ── Header ── */
        .ed-header {
          height: 60px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 18px; background: var(--surface); flex-shrink: 0;
          gap: 12px;
        }
        .ed-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }

        .back-btn {
          padding: 7px 9px; border-radius: 9px;
          border: 1px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0;
        }
        .back-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

        .save-status {
          font-size: 11px; font-weight: 700; color: var(--text-muted);
          display: flex; align-items: center; gap: 5px;
        }

        /* ── Tabs ── */
        .ed-tabs-container {
          overflow-x: auto; scrollbar-width: none;
          background: var(--surface);
          padding: 10px 18px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .ed-tabs-container::-webkit-scrollbar { display: none; }
        .ed-tabs {
          display: flex; gap: 3px;
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 3px; border-radius: 9px;
          width: max-content;
        }
        .ed-tab {
          padding: 7px 13px; border: 1px solid transparent;
          background: none; border-radius: 7px;
          font-size: 12px; font-weight: 700; color: var(--text-muted);
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          transition: all 0.15s; white-space: nowrap; font-family: inherit;
        }
        .ed-tab:hover { color: var(--text); background: var(--surface); }
        .ed-tab.active {
          background: var(--surface); color: var(--accent);
          border-color: var(--border);
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }

        /* ── Toolbar ── */
        .rich-toolbar {
          display: flex; gap: 2px; padding: 8px 18px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
        }
        .rich-toolbar::-webkit-scrollbar { display: none; }
        .tool-btn {
          padding: 7px 8px; border-radius: 7px; border: none;
          background: transparent; color: var(--text-muted);
          cursor: pointer; flex-shrink: 0; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .tool-btn:hover { background: var(--bg); color: var(--accent); }

        /* ── Write area ── */
        .title-input {
          width: 100%; padding: 20px 20px 8px;
          border: none; font-size: 24px; font-weight: 900;
          outline: none; color: var(--text); letter-spacing: -0.8px;
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .title-input::placeholder { color: var(--text-light); }

        .content-area {
          flex: 1; width: 100%; padding: 0 20px 20px;
          border: none; outline: none; font-size: 15px;
          line-height: 1.8; resize: none; color: var(--text);
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        .content-area::placeholder { color: var(--text-light); }

        /* ── Tags ── */
        .tag-container {
          display: flex; gap: 7px; padding: 0 20px 14px;
          flex-wrap: wrap; background: var(--bg); align-items: center;
        }
        .tag-badge {
          background: var(--accent-light); color: var(--accent);
          border: 1px solid rgba(249,115,22,0.2);
          padding: 3px 10px; border-radius: 100px;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; gap: 5px;
        }
        .tag-badge svg { cursor: pointer; opacity: 0.7; }
        .tag-badge svg:hover { opacity: 1; }
        .tag-input-wrap { display: flex; align-items: center; gap: 5px; color: var(--text-muted); }
        .tag-input {
          border: none; outline: none; font-size: 12px; font-weight: 700;
          width: 70px; background: transparent; color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .tag-input::placeholder { color: var(--text-light); }

        /* ── AI Buttons ── */
        .ai-btn-group { display: flex; gap: 7px; flex-shrink: 0; }
        .ai-btn {
          border: none; padding: 8px 13px; border-radius: 9px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.18s; white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ai-btn.primary { background: var(--accent); color: #fff; }
        .ai-btn.primary:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 14px rgba(249,115,22,0.3);
        }
        .ai-btn.secondary {
          background: var(--bg); color: var(--accent);
          border: 1px solid rgba(249,115,22,0.3);
        }
        .ai-btn.secondary:hover { background: var(--accent-light); border-color: var(--accent); }

        /* ── AI panels ── */
        .ai-panel {
          flex: 1; overflow-y: auto; padding: 24px 20px;
          background: var(--bg); scrollbar-width: none;
        }
        .ai-panel::-webkit-scrollbar { display: none; }
        .ai-panel-inner { max-width: 800px; margin: 0 auto; }

        .ai-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 0; gap: 14px;
        }

        .summary-card {
          background: var(--surface); padding: 26px;
          border-radius: 14px; border: 1px solid var(--border);
          color: var(--text); line-height: 1.8; white-space: pre-wrap; font-size: 15px;
        }
        .summary-label {
          font-size: 11px; font-weight: 800; color: var(--text-muted);
          margin-bottom: 14px; letter-spacing: 0.8px; text-transform: uppercase;
        }
        .flashcard {
          background: var(--surface); padding: 20px 22px;
          border-radius: 12px; border: 1px solid var(--border);
          border-left: 3px solid var(--accent); margin-bottom: 10px;
        }
        .flashcard-q { font-weight: 800; color: var(--text); font-size: 14px; margin-bottom: 9px; }
        .flashcard-a {
          color: var(--text-muted); font-size: 13px; line-height: 1.6;
          border-top: 1px solid var(--border); padding-top: 10px;
        }
        .quiz-card {
          background: var(--surface); padding: 20px 22px;
          border-radius: 14px; border: 1px solid var(--border); margin-bottom: 12px;
        }
        .quiz-q { font-weight: 800; font-size: 14px; color: var(--text); margin-bottom: 12px; }
        .quiz-option {
          padding: 10px 13px; background: var(--bg);
          border: 1px solid var(--border); border-radius: 8px;
          margin-bottom: 6px; font-size: 13px; font-weight: 600;
          color: var(--text); cursor: pointer; transition: all 0.15s;
        }
        .quiz-option:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
        .empty-ai {
          text-align: center; color: var(--text-muted);
          padding: 60px 20px; font-size: 14px; font-weight: 600;
        }

        /* ── Desktop ── */
        @media(min-width: 1024px) {
          .ed-header { padding: 0 36px; height: 64px; }
          .ed-tabs-container { padding: 10px 36px; }
          .rich-toolbar { padding: 8px 36px; gap: 4px; }
          .title-input { font-size: 30px; padding: 26px 36px 10px; }
          .content-area { padding: 0 36px 36px; font-size: 16px; }
          .tag-container { padding: 0 36px 18px; }
          .ai-btn { padding: 9px 16px; font-size: 13px; }
          .ai-panel { padding: 28px 36px; }
        }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header className="ed-header">
        <div className="ed-header-left">
          <button onClick={onClose} className="back-btn">
            <ArrowLeft size={18} />
          </button>
          <div className="save-status">
            {saving
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> <span>Saving…</span></>
              : <><Check size={13} color="var(--green)" /> <span>Saved</span></>
            }
          </div>
        </div>

        <div className="ai-btn-group">
          <button className="ai-btn secondary" onClick={() => handleAI('flashcards')}>
            <CreditCard size={15} /> <span>Cards</span>
          </button>
          <button className="ai-btn primary" onClick={() => handleAI('summarize')}>
            <Sparkles size={15} /> <span>Summarize</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="ed-tabs-container">
        <div className="ed-tabs">
          <button className={`ed-tab${activeTab === 'write' ? ' active' : ''}`} onClick={() => setActiveTab('write')}>
            <PenLine size={13}/> Write
          </button>
          <button className={`ed-tab${activeTab === 'summary' ? ' active' : ''}`} onClick={() => setActiveTab('summary')}>
            <FileText size={13}/> Summary
          </button>
          <button className={`ed-tab${activeTab === 'flashcards' ? ' active' : ''}`} onClick={() => setActiveTab('flashcards')}>
            <CreditCard size={13}/> Flashcards
          </button>
          <button className={`ed-tab${activeTab === 'quiz' ? ' active' : ''}`} onClick={() => handleAI('quiz')}>
            <Brain size={13}/> Quiz
          </button>
        </div>
      </div>

      {/* Write Tab */}
      {activeTab === 'write' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'var(--bg)' }}>
          <RichToolbar onFormat={handleFormat} />
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none' }}>
            <input
              className="title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note title…"
            />
            <div className="tag-container">
              {tags.map(t => (
                <span key={t} className="tag-badge">
                  {t.startsWith('#') ? t : `#${t}`}
                  <X size={11} onClick={() => setTags(tags.filter(x => x !== t))} />
                </span>
              ))}
              <div className="tag-input-wrap">
                <Hash size={13} />
                <input
                  className="tag-input"
                  placeholder="tag likhko Enter dabao…"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value.replace(/\s/g, ''))}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                      e.preventDefault();
                      // # remove karo agar user ne type kiya ho
                      const newTag = tagInput.trim().toLowerCase().replace(/^#+/, '');
                      if (newTag && !tags.includes(newTag)) {
                        setTags([...tags, newTag]);
                      }
                      setTagInput('');
                    }
                    // Backspace se last tag delete karo agar input empty hai
                    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                      setTags(tags.slice(0, -1));
                    }
                  }}
                />
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className="content-area"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start writing here…"
            />
            {/* Word Count & Read Time */}
            {(() => {
              const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
              const chars = content.length;
              const readMin = Math.max(1, Math.ceil(words / 200));
              return (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '8px 24px', borderTop: '1px solid var(--border)',
                  background: 'var(--surface)', flexShrink: 0,
                  fontSize: 11, fontWeight: 600, color: 'var(--text-light)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  <span>📝 {words} words</span>
                  <span>🔤 {chars} chars</span>
                  <span>⏱️ ~{readMin} min read</span>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* AI Tabs */
        <div className="ai-panel">
          <div className="ai-panel-inner">
            {loadingAI ? (
              <div className="ai-loading">
                <Loader2 size={34} color="var(--accent)" style={{ animation: 'spin 1.2s linear infinite' }} />
                <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 14 }}>AI is thinking…</p>
              </div>
            ) : (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {activeTab === 'summary' && (
                  <div className="summary-card">
                    <div className="summary-label">✦ AI Summary</div>
                    {aiSummary || <span style={{ color: 'var(--text-light)' }}>Click "Summarize" in the header to generate a summary.</span>}
                  </div>
                )}
                {activeTab === 'flashcards' && (
                  <div>
                    {flashcards.length > 0 ? flashcards.map((fc, i) => (
                      <div key={i} className="flashcard">
                        <p className="flashcard-q">{fc.question}</p>
                        <p className="flashcard-a">{fc.answer}</p>
                      </div>
                    )) : (
                      <div className="empty-ai">Click "Cards" in the header to generate flashcards from this note.</div>
                    )}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div>
                    {quizQuestions.length > 0 ? quizQuestions.map((q, i) => (
                      <div key={i} className="quiz-card">
                        <p className="quiz-q">{i + 1}. {q.question}</p>
                        {(q.options || []).map((opt, oi) => (
                          <div key={oi} className="quiz-option">{opt}</div>
                        ))}
                      </div>
                    )) : (
                      <div className="empty-ai">Click the Quiz tab again to generate questions.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
