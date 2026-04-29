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
      case 'bold': insert = `**${sel || 'text'}**`; break;
      case 'italic': insert = `_${sel || 'text'}_`; break;
      case 'h1': insert = `\n# ${sel || 'Heading'}\n`; break;
      case 'ul': insert = `\n- ${sel || 'item'}\n`; break;
      default: return;
    }
    setContent(before + insert + after);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(before.length + insert.length, before.length + insert.length); }, 0);
  };

  return (
    <div className="editor-root">
      <style>{`
        .editor-root { display: flex; flex-direction: column; height: 100vh; background: #fff; z-index: 100; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .ed-header { height: 64px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: #fff; }
        .ed-header-left { display: flex; align-items: center; gap: 12px; }
        .back-btn { padding: 8px; border-radius: 10px; border: none; background: #f8fafc; cursor: pointer; color: #64748b; transition: 0.2s; }
        .back-btn:hover { background: #f1f5f9; color: #000; }
        .save-status { font-size: 12px; font-weight: 700; color: #94a3b8; display: flex; align-items: center; gap: 6px; }

        .ed-tabs { display: flex; gap: 4px; background: #f8fafc; padding: 4px; border-radius: 12px; margin: 12px 20px; width: fit-content; }
        .ed-tab { padding: 8px 18px; border: none; background: none; border-radius: 8px; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .ed-tab.active { background: #000; color: #fff; }

        .rich-toolbar { display: flex; gap: 6px; padding: 10px 20px; border-bottom: 1px solid #f1f5f9; background: #fff; overflow-x: auto; scrollbar-width: none; }
        .tool-btn { padding: 8px; border-radius: 8px; border: none; background: transparent; color: #64748b; cursor: pointer; transition: 0.2s; }
        .tool-btn:hover { background: #f1f5f9; color: #000; }
        
        .title-input { width: 100%; padding: 24px 24px 10px; border: none; font-size: 30px; font-weight: 800; outline: none; color: #000; letter-spacing: -0.5px; }
        .content-area { flex: 1; width: 100%; padding: 0 24px 20px; border: none; outline: none; font-size: 16px; line-height: 1.7; resize: none; color: #334155; }

        .tag-container { display: flex; gap: 8px; padding: 0 24px 12px; flex-wrap: wrap; }
        .tag-badge { background: #f1f5f9; padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px; }

        .ai-btn-group { display: flex; gap: 8px; }
        .ai-btn { border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .ai-btn.primary { background: #ccff00; color: #000; }
        .ai-btn.secondary { background: #000; color: #ccff00; }
        .ai-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        @media(max-width: 768px) {
          .title-input { font-size: 24px; padding: 20px 20px 5px; }
          .content-area { font-size: 16px; padding: 0 20px 15px; }
          .ai-btn span { display: none; }
          .ai-btn { padding: 10px; }
        }
      `}</style>

      {/* Header */}
      <header className="ed-header">
        <div className="ed-header-left">
          <button onClick={onClose} className="back-btn"><ArrowLeft size={20} /></button>
          <div className="save-status">
            {saving ? <Loader2 size={14} style={{animation: 'spin 1s linear infinite'}} /> : <Check size={14} />}
            {saving ? "Syncing..." : "Saved to Cloud"}
          </div>
        </div>

        <div className="ai-btn-group">
          <button className="ai-btn secondary" onClick={() => handleAI('flashcards')}>
            <CreditCard size={16} /> <span>Cards</span>
          </button>
          <button className="ai-btn primary" onClick={() => handleAI('summarize')}>
            <Sparkles size={16} /> <span>Smart AI</span>
          </button>
        </div>
      </header>

      {/* View Tabs */}
      <div className="ed-tabs">
        <button className={`ed-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}><PenLine size={16}/> Write</button>
        <button className={`ed-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}><FileText size={16}/> Summary</button>
        <button className={`ed-tab ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}><CreditCard size={16}/> Flashcards</button>
        <button className={`ed-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => handleAI('quiz')}><Brain size={16}/> Quiz</button>
      </div>

      {activeTab === 'write' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <RichToolbar onFormat={handleFormat} />
          <input className="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter document title..." />
          
          <div className="tag-container">
            {tags.map(t => (
              <span key={t} className="tag-badge">#{t} <X size={14} onClick={() => setTags(tags.filter(x => x !== t))} style={{cursor:'pointer'}}/></span>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', paddingLeft: 4 }}>
              <Hash size={14} />
              <input 
                style={{ border: 'none', outline: 'none', fontSize: 13, fontWeight: 700, width: 100, background: 'transparent' }} 
                placeholder="Add Tag" value={tagInput} onChange={e => setTagInput(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }} 
              />
            </div>
          </div>

          <textarea 
            ref={textareaRef} 
            className="content-area" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Start typing your knowledge here..." 
          />
        </div>
      ) : (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {loadingAI ? (
              <div style={{ textAlign: 'center', padding: '120px 0' }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#000', margin: '0 auto 20px' }} />
                <p style={{ fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>AI IS ANALYZING...</p>
              </div>
            ) : (
              <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
                {activeTab === 'summary' && (
                  <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ color: '#000', marginBottom: '20px', fontWeight: 900, textTransform: 'uppercase', fontSize: 16, letterSpacing: '1px' }}>Deep Summary</h3>
                    {aiSummary || "Add more content to generate an AI summary."}
                  </div>
                )}
                {activeTab === 'flashcards' && (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {flashcards.length > 0 ? flashcards.map((fc, i) => (
                      <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12 }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: '#ccff00', background: '#000', padding: '3px 10px', borderRadius: '6px' }}>UNIT {i+1}</span>
                        </div>
                        <p style={{ fontWeight: 800, color: '#000', fontSize: 17, marginBottom: 12 }}>{fc.question}</p>
                        <p style={{ color: '#64748b', fontSize: 15, borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>{fc.answer}</p>
                      </div>
                    )) : <p style={{textAlign:'center', color:'#94a3b8', padding: '40px'}}>No flashcards generated. Click 'Cards' to start.</p>}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {quizQuestions.map((q, i) => (
                      <div key={i} style={{ background: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>{i+1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: 10, fontSize: 15, fontWeight: 600 }}>{opt}</div>
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