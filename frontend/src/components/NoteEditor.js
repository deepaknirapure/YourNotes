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
    setActiveTab(type);
    try {
      const { data } = await API.post(`/ai/${type}/${note._id}`);
      if (type === 'summarize') setAiSummary(data.summary);
      if (type === 'flashcards') setFlashcards(data.flashcards || []);
      if (type === 'quiz') setQuizQuestions(data.questions || []);
    } catch (err) { toast.error(`AI Analysis failed`); }
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
        .editor-root { display: flex; flex-direction: column; height: 100vh; background: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        /* Header & Top Bar */
        .ed-header { height: 64px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: #FFFFFF; }
        .ed-header-left { display: flex; align-items: center; gap: 14px; }
        .back-btn { padding: 10px; border-radius: 12px; border: none; background: #F8FAFC; cursor: pointer; color: #000; transition: 0.2s; }
        .back-btn:hover { background: #000; color: #ccff00; }
        .save-status { font-size: 12px; font-weight: 700; color: #94A3B8; display: flex; align-items: center; gap: 6px; }

        /* Feature Tabs */
        .ed-tabs { display: flex; gap: 4px; background: #F1F5F9; padding: 4px; border-radius: 14px; margin: 12px 24px; width: fit-content; }
        .ed-tab { padding: 10px 20px; border: none; background: none; border-radius: 10px; font-size: 13px; font-weight: 700; color: #64748B; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .ed-tab.active { background: #000000; color: #FFFFFF; }

        /* Rich Toolbar */
        .rich-toolbar { display: flex; gap: 6px; padding: 12px 24px; border-bottom: 1px solid #F1F5F9; background: #FFFFFF; overflow-x: auto; scrollbar-width: none; }
        .tool-btn { padding: 8px; border-radius: 8px; border: none; background: transparent; color: #000; cursor: pointer; transition: 0.15s; }
        .tool-btn:hover { background: #ccff00; }
        
        /* Input Areas */
        .title-input { width: 100%; padding: 24px 24px 8px; border: none; font-size: 32px; font-weight: 900; outline: none; color: #000; letter-spacing: -1px; background: #FFFFFF; }
        .content-area { flex: 1; width: 100%; padding: 0 24px 20px; border: none; outline: none; font-size: 17px; line-height: 1.8; resize: none; color: #1E293B; background: #FFFFFF; }

        /* Tags Area */
        .tag-container { display: flex; gap: 8px; padding: 0 24px 16px; flex-wrap: wrap; background: #FFFFFF; }
        .tag-badge { background: #000; color: #ccff00; padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px; border: 1px solid #000; }

        /* AI Feature Buttons */
        .ai-btn-group { display: flex; gap: 10px; }
        .ai-btn { border: none; padding: 10px 20px; border-radius: 14px; font-size: 13px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px; }
        .ai-btn.primary { background: #ccff00; color: #000; }
        .ai-btn.secondary { background: #000; color: #ccff00; }
        .ai-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.1); }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media(max-width: 768px) {
          .title-input { font-size: 24px; padding: 20px 24px 4px; }
          .ed-tabs { margin: 12px; }
          .ai-btn span { display: none; }
          .ai-btn { padding: 12px; border-radius: 50%; }
        }
      `}</style>

      {/* Header Bar */}
      <header className="ed-header">
        <div className="ed-header-left">
          <button onClick={onClose} className="back-btn"><ArrowLeft size={22} /></button>
          <div className="save-status">
            {saving ? <Loader2 size={16} style={{animation: 'spin 1.5s linear infinite'}} /> : <Check size={16} />}
            {saving ? "SYNCING..." : "SECURELY SAVED"}
          </div>
        </div>

        <div className="ai-btn-group">
          <button className="ai-btn secondary" onClick={() => handleAI('flashcards')}>
            <CreditCard size={18} /> <span>Cards</span>
          </button>
          <button className="ai-btn primary" onClick={() => handleAI('summarize')}>
            <Sparkles size={18} /> <span>Smart AI</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="ed-tabs">
        <button className={`ed-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}><PenLine size={16}/> WRITE</button>
        <button className={`ed-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}><FileText size={16}/> SUMMARY</button>
        <button className={`ed-tab ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}><CreditCard size={16}/> FLASHCARDS</button>
        <button className={`ed-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => handleAI('quiz')}><Brain size={16}/> QUIZ</button>
      </div>

      {activeTab === 'write' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <RichToolbar onFormat={handleFormat} />
          <input className="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled Workspace..." />
          
          <div className="tag-container">
            {tags.map(t => (
              <span key={t} className="tag-badge">#{t} <X size={14} onClick={() => setTags(tags.filter(x => x !== t))} style={{cursor:'pointer'}}/></span>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', paddingLeft: 8 }}>
              <Hash size={16} />
              <input 
                style={{ border: 'none', outline: 'none', fontSize: 13, fontWeight: 800, width: 120, background: 'transparent' }} 
                placeholder="ADD TAG..." value={tagInput} onChange={e => setTagInput(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }} 
              />
            </div>
          </div>

          <textarea 
            ref={textareaRef} 
            className="content-area" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Type your knowledge here..." 
          />
        </div>
      ) : (
        /* AI Feature Display Area */
        <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto', background: '#F8FAFC' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            {loadingAI ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', color: '#000', margin: '0 auto 24px' }} />
                <p style={{ fontWeight: 900, color: '#000', letterSpacing: '2px' }}>AI IS ANALYZING CONTENT...</p>
              </div>
            ) : (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                {activeTab === 'summary' && (
                  <div style={{ background: '#fff', padding: '48px', borderRadius: '24px', border: '1px solid #E2E8F0', color: '#1E293B', lineHeight: 1.8, whiteSpace: 'pre-wrap', boxShadow: '0 4px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', marginBottom: '20px', letterSpacing: '2px' }}>EXECUTIVE SUMMARY</div>
                    {aiSummary || "Insufficient data for summary. Please add more detail to your notes."}
                  </div>
                )}
                {activeTab === 'flashcards' && (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {flashcards.length > 0 ? flashcards.map((fc, i) => (
                      <div key={i} style={{ background: '#fff', padding: '28px', borderRadius: '18px', border: '1px solid #E2E8F0', borderLeft: '6px solid #ccff00' }}>
                        <p style={{ fontWeight: 900, color: '#000', fontSize: 18, marginBottom: 14 }}>{fc.question}</p>
                        <p style={{ color: '#64748B', fontSize: 16, borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>{fc.answer}</p>
                      </div>
                    )) : <p style={{textAlign:'center', color:'#94A3B8', padding: '40px'}}>No flashcards available. Click the black 'Cards' button above.</p>}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {quizQuestions.map((q, i) => (
                      <div key={i} style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        <p style={{ fontWeight: 900, fontSize: 19, marginBottom: 24, color: '#000' }}>{i+1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', marginBottom: 12, fontSize: 15, fontWeight: 700, color: '#334155' }}>{opt}</div>
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