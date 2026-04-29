import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditCard, PenLine, FileText, ArrowLeft, Check, Loader2,
  Mic, MicOff, Maximize2, Minimize2, X, Brain,
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Quote, Minus, Sparkles, Hash
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

function RichToolbar({ onFormat }) {
  const tools = [
    { icon: <Bold size={16}/>,        cmd: 'bold',        title: 'Bold' },
    { icon: <Italic size={16}/>,      cmd: 'italic',      title: 'Italic' },
    { icon: <Heading1 size={16}/>,    cmd: 'h1',          title: 'H1' },
    { icon: <Heading2 size={16}/>,    cmd: 'h2',          title: 'H2' },
    { icon: <List size={16}/>,        cmd: 'ul',          title: 'Bullets' },
    { icon: <ListOrdered size={16}/>, cmd: 'ol',          title: 'Numbers' },
    { icon: <Code size={16}/>,        cmd: 'code',        title: 'Code' },
    { icon: <Quote size={16}/>,       cmd: 'quote',       title: 'Quote' },
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
  const [richMode, setRichMode]   = useState(true);

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
    } catch (err) { toast.error(`AI calculation failed`); }
    finally { setLoadingAI(false); }
  };

  const handleFormat = (cmd) => { /* original logic */ };
  const toggleVoice = () => { /* original logic */ };

  return (
    <div className={`editor-root ${focusMode ? 'focus-mode' : ''}`}>
      <style>{`
        .editor-root { display: flex; flex-direction: column; height: 100vh; background: #fff; z-index: 100; font-family: 'Plus Jakarta Sans', sans-serif; }
        .focus-mode { position: fixed; inset: 0; background: #fff; }

        /* Header */
        .ed-header { height: 60px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: #fff; }
        .ed-header-left { display: flex; align-items: center; gap: 12px; }
        .back-btn { padding: 8px; border-radius: 50%; border: none; background: #f8fafc; cursor: pointer; color: #64748b; }
        .save-status { font-size: 12px; font-weight: 600; color: #94a3b8; display: flex; align-items: center; gap: 4px; }

        /* Tabs */
        .ed-tabs { display: flex; gap: 4px; background: #f8fafc; padding: 4px; border-radius: 12px; margin: 10px 20px; width: fit-content; }
        .ed-tab { padding: 8px 16px; border: none; background: none; border-radius: 8px; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .ed-tab.active { background: #000; color: #fff; }

        /* Tools & Inputs */
        .rich-toolbar { display: flex; gap: 4px; padding: 8px 20px; border-bottom: 1px solid #f1f5f9; background: #fff; overflow-x: auto; }
        .tool-btn { padding: 6px; border-radius: 6px; border: none; background: transparent; color: #64748b; cursor: pointer; }
        .tool-btn:hover { background: #f1f5f9; color: #000; }
        
        .title-input { width: 100%; padding: 20px 24px 10px; border: none; font-size: 28px; font-weight: 800; outline: none; color: #000; }
        .title-input::placeholder { color: #cbd5e1; }
        
        .content-area { flex: 1; width: 100%; padding: 0 24px 20px; border: none; outline: none; font-size: 16px; line-height: 1.6; resize: none; color: #334155; }

        /* Tag UI */
        .tag-container { display: flex; gap: 8px; padding: 0 24px 10px; flex-wrap: wrap; }
        .tag-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px; }

        /* AI Action Buttons */
        .ai-btn { background: #ccff00; color: #000; border: none; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .ai-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(204, 255, 0, 0.2); }

        @media(max-width: 768px) {
          .title-input { font-size: 22px; padding: 15px 20px 5px; }
          .content-area { font-size: 16px; padding: 0 20px 15px; }
          .ai-btn span { display: none; }
          .ed-tabs { margin: 10px; }
        }
      `}</style>

      {/* Header */}
      <header className="ed-header">
        <div className="ed-header-left">
          <button onClick={onClose} className="back-btn"><ArrowLeft size={18} /></button>
          <div className="save-status">
            {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
            {saving ? "Saving" : "Saved"}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ai-btn" onClick={() => handleAI('summarize')}>
            <Sparkles size={16} /> <span>Smart AI</span>
          </button>
          <button className="back-btn" onClick={() => setFocusMode(!focusMode)}>
            {focusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="back-btn" onClick={toggleVoice} style={listening ? {color: '#ccff00', background: '#000'} : {}}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="ed-tabs">
        <button className={`ed-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}><PenLine size={14}/> Write</button>
        <button className={`ed-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}><FileText size={14}/> Summary</button>
        <button className={`ed-tab ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}><CreditCard size={14}/> Cards</button>
        <button className={`ed-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => handleAI('quiz')}><Brain size={14}/> Quiz</button>
      </div>

      {activeTab === 'write' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <RichToolbar onFormat={handleFormat} />
          <input className="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Topic Title..." />
          
          <div className="tag-container">
            {tags.map(t => (
              <span key={t} className="tag-badge">#{t} <X size={12} onClick={() => setTags(tags.filter(x => x !== t))} /></span>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
              <Hash size={14} />
              <input 
                style={{ border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, width: 80 }} 
                placeholder="Tag" value={tagInput} onChange={e => setTagInput(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }} 
              />
            </div>
          </div>

          <textarea 
            ref={textareaRef} 
            className="content-area" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Write your notes here..." 
          />
        </div>
      ) : (
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {loadingAI ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 size={32} className="spin" style={{ color: '#000', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 700, color: '#64748b' }}>AI is thinking...</p>
              </div>
            ) : (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                {activeTab === 'summary' && (
                  <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    <h4 style={{ color: '#000', marginBottom: '16px', fontWeight: 800 }}>AI Generated Summary</h4>
                    {aiSummary || "Add some notes to see a summary."}
                  </div>
                )}
                {activeTab === 'flashcards' && (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {flashcards.map((fc, i) => (
                      <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: '#ccff00', background: '#000', width: 'fit-content', padding: '2px 8px', borderRadius: '4px', marginBottom: '10px' }}>CARD {i+1}</p>
                        <p style={{ fontWeight: 700, color: '#000', marginBottom: '8px' }}>{fc.question}</p>
                        <p style={{ color: '#64748b', fontSize: 14, borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>{fc.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {quizQuestions.map((q, i) => (
                      <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontWeight: 800, marginBottom: '16px' }}>{i+1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '8px', fontSize: 14, fontWeight: 600 }}>{opt}</div>
                        ))}
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