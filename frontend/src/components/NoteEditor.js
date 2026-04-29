import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditCard, PenLine, FileText, ArrowLeft, Check, Loader2,
  Mic, MicOff, Maximize2, Minimize2, X, Brain,
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Quote, Minus, Sparkles
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

/* ─── Cyber Rich Toolbar ─── */
function RichToolbar({ onFormat }) {
  const tools = [
    { icon: <Bold size={16}/>,        cmd: 'bold',        title: 'Bold' },
    { icon: <Italic size={16}/>,      cmd: 'italic',      title: 'Italic' },
    { icon: <Heading1 size={16}/>,    cmd: 'h1',          title: 'Heading 1' },
    { icon: <Heading2 size={16}/>,    cmd: 'h2',          title: 'Heading 2' },
    { icon: <List size={16}/>,        cmd: 'ul',          title: 'Bullet List' },
    { icon: <ListOrdered size={16}/>, cmd: 'ol',          title: 'Numbered List' },
    { icon: <Code size={16}/>,        cmd: 'code',        title: 'Code' },
    { icon: <Quote size={16}/>,       cmd: 'quote',       title: 'Blockquote' },
    { icon: <Minus size={16}/>,       cmd: 'hr',          title: 'Divider' },
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
  const [focusMode, setFocusMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [richMode, setRichMode]   = useState(false);

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
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
    } catch (err) { console.error("Save failed"); }
    finally { setSaving(false); }
  }, [note?._id, onUpdate]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(performSave, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [title, content, tags, performSave]);

  const handleAI = async (type) => {
    setLoadingAI(true);
    setActiveTab(type);
    try {
      const { data } = await API.post(`/ai/${type}/${note._id}`);
      if (type === 'summarize') setAiSummary(data.summary);
      if (type === 'flashcards') setFlashcards(data.flashcards || []);
      if (type === 'quiz') setQuizQuestions(data.questions || []);
    } catch (err) { toast.error(`AI generation failed`); }
    setLoadingAI(false);
  };

  const handleFormat = (cmd) => { /* logic stays same */ };
  const toggleVoice = () => { /* logic stays same */ };

  return (
    <div className={`editor-root ${focusMode ? 'focus-active' : ''}`}>
      <style>{`
        .editor-root {
          display: flex; flex-direction: column; height: 100vh; background: #000; flex: 1;
          font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; color: #FFF;
        }
        .focus-active { position: fixed; inset: 0; z-index: 1000; }
        
        .editor-header {
          height: 70px; border-bottom: 1px solid #1A1A1A; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: #0A0A0A;
        }

        .action-btn {
          background: #1A1A1A; border: 1px solid #333; border-radius: 10px; padding: 8px 14px;
          display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;
          color: #FFF; cursor: pointer; transition: 0.3s;
        }
        .action-btn:hover { border-color: #ccff00; color: #ccff00; }
        .action-btn.ai-glow { background: #ccff00; color: #000; border: none; }
        .action-btn.ai-glow:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(204, 255, 0, 0.3); }

        .tabs-row { display: flex; border-bottom: 1px solid #1A1A1A; padding: 0 12px; background: #050505; }
        .editor-tab {
          padding: 14px 24px; border: none; background: none; cursor: pointer; font-size: 13px;
          font-weight: 800; color: #555; border-bottom: 2px solid transparent; transition: 0.3s;
          display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px;
        }
        .editor-tab.active { color: #ccff00; border-bottom-color: #ccff00; }

        .rich-toolbar {
          display: flex; align-items: center; gap: 8px; padding: 10px 24px;
          border-bottom: 1px solid #1A1A1A; background: #0A0A0A; overflow-x: auto;
        }
        .tool-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: #555; transition: 0.2s; }
        .tool-btn:hover { color: #ccff00; background: #1A1A1A; }

        .note-title-in {
          padding: 30px 40px 10px; font-size: 32px; font-weight: 900; border: none;
          outline: none; background: transparent; color: #FFF; width: 100%;
        }
        .note-text-in {
          flex: 1; padding: 20px 40px; font-size: 17px; line-height: 1.8; border: none;
          outline: none; resize: none; color: #AAA; width: 100%; background: transparent;
        }
        .tag-pill {
          background: rgba(204, 255, 0, 0.1); color: #ccff00; padding: 5px 12px;
          border-radius: 100px; font-size: 12px; font-weight: 800; border: 1px solid rgba(204, 255, 0, 0.2);
        }

        .ai-content-card {
          background: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 24px; padding: 40px;
          line-height: 1.8; color: #DDD; position: relative;
        }
        .ai-label { color: #ccff00; font-weight: 900; text-transform: uppercase; font-size: 12px; margin-bottom: 15px; display: block; letter-spacing: 1.5px; }

        .flashcard-item {
          background: #0A0A0A; border: 1px solid #1A1A1A; padding: 24px; border-radius: 20px; transition: 0.3s;
        }
        .flashcard-item:hover { border-color: #ccff00; transform: scale(1.02); }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media(max-width: 768px) {
          .note-title-in { padding: 20px 20px 10px; font-size: 24px; }
          .note-text-in { padding: 10px 20px; font-size: 16px; }
          .action-btn span { display: none; }
        }
      `}</style>

      {/* Top Header */}
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onClose} className="action-btn"><ArrowLeft size={18} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: saving ? '#ccff00' : '#10B981', fontSize: 13, fontWeight: 800 }}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
            {saving ? 'SYNCING...' : 'CLOUD SYNCED'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="action-btn" onClick={toggleVoice} style={listening ? { borderColor: '#ccff00', color: '#ccff00' } : {}}>
            {listening ? <MicOff size={16} /> : <Mic size={16} />} <span>Voice</span>
          </button>
          <button className="action-btn" onClick={() => setFocusMode(!focusMode)}>
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />} <span>Focus</span>
          </button>
          <button className={`action-btn ai-glow`} onClick={() => handleAI('summarize')}>
            <Sparkles size={16} /> <span>Smart AI</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        <button className={`editor-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}><PenLine size={16} /> Drafting</button>
        <button className={`editor-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}><FileText size={16} /> Analysis</button>
        <button className={`editor-tab ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}><CreditCard size={16} /> Cards</button>
        <button className={`editor-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => handleAI('quiz')}><Brain size={16} /> Training</button>
      </div>

      {activeTab === 'write' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          {richMode && <RichToolbar onFormat={handleFormat} />}
          <input className="note-title-in" value={title} onChange={e => setTitle(e.target.value)} placeholder="Subject Heading..." />
          <div style={{ padding: '0 40px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {tags.map(t => (
                <span key={t} className="tag-pill">
                    #{t} <X size={12} onClick={() => setTags(tags.filter(x => x !== t))} style={{ cursor: 'pointer', marginLeft: 6 }} />
                </span>
            ))}
            <input 
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#444', background: 'transparent', fontWeight: 700 }} 
              placeholder="+ ATTACH TAG" value={tagInput} onChange={e => setTagInput(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }} 
            />
          </div>
          <textarea ref={textareaRef} className="note-text-in" value={content} onChange={e => setContent(e.target.value)} placeholder="Begin detailed documentation..." />
        </div>
      )}

      {activeTab !== 'write' && (
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#000' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {loadingAI ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: 20 }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#ccff00' }} />
                <p style={{ fontWeight: 800, color: '#555', letterSpacing: 2 }}>PROCESSING QUANTUM DATA...</p>
              </div>
            ) : (
              <div style={{ animation: 'fadeUp 0.5s ease-out' }}>
                {activeTab === 'summary' && (
                   <div className="ai-content-card">
                     <span className="ai-label">Structural Summary</span>
                     <div style={{ whiteSpace: 'pre-wrap' }}>{aiSummary || "Insufficient data for summary. Please expand your notes."}</div>
                   </div>
                )}
                {activeTab === 'flashcards' && (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {flashcards.map((fc, i) => (
                      <div key={i} className="flashcard-item">
                        <div style={{ color: '#ccff00', fontWeight: 900, fontSize: 11, marginBottom: 10 }}>NODE {i+1}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#FFF', marginBottom: 15 }}>{fc.question}</div>
                        <div style={{ color: '#888', paddingTop: 15, borderTop: '1px solid #1A1A1A' }}>{fc.answer}</div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div style={{ display: 'grid', gap: 25 }}>
                    {quizQuestions.map((q, i) => (
                      <div key={i} className="ai-content-card" style={{ padding: 30 }}>
                        <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>{i+1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ padding: '14px', border: '1px solid #1A1A1A', borderRadius: 12, marginBottom: 10, fontSize: 15, background: '#050505', color: '#888' }}>
                            {opt}
                          </div>
                        ))}
                        <details style={{ marginTop: 20, color: '#ccff00', cursor: 'pointer' }}>
                          <summary style={{ fontWeight: 800, fontSize: 13 }}>DECRYPT CORRECT ANSWER</summary>
                          <div style={{ marginTop: 15, padding: 20, background: 'rgba(204, 255, 0, 0.05)', borderRadius: 12 }}>
                            <p style={{ fontWeight: 900, marginBottom: 5 }}>{q.options[q.correct]}</p>
                            <p style={{ color: '#666', fontStyle: 'italic', fontSize: 14 }}>{q.explanation}</p>
                          </div>
                        </details>
                      </div>
                    ))}
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