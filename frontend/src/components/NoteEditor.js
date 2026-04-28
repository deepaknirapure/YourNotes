import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot, CreditCard, PenLine, FileText, ArrowLeft, Save, Check, Loader2,
  Tag, Mic, MicOff, Maximize2, Minimize2, X, Brain,
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Quote, Minus, Sparkles
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

/* ─── Rich Text Toolbar ─── */
function RichToolbar({ onFormat }) {
  const tools = [
    { icon: <Bold size={14}/>,        cmd: 'bold',        title: 'Bold' },
    { icon: <Italic size={14}/>,      cmd: 'italic',      title: 'Italic' },
    { icon: <Heading1 size={14}/>,    cmd: 'h1',          title: 'Heading 1' },
    { icon: <Heading2 size={14}/>,    cmd: 'h2',          title: 'Heading 2' },
    { icon: <List size={14}/>,        cmd: 'ul',          title: 'Bullet List' },
    { icon: <ListOrdered size={14}/>, cmd: 'ol',          title: 'Numbered List' },
    { icon: <Code size={14}/>,        cmd: 'code',        title: 'Code' },
    { icon: <Quote size={14}/>,       cmd: 'quote',       title: 'Blockquote' },
    { icon: <Minus size={14}/>,       cmd: 'hr',          title: 'Divider' },
  ];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 24px', borderBottom:'1px solid #E2E8F0', flexWrap:'wrap', background: '#FFF' }}>
      {tools.map(t => (
        <button key={t.cmd} title={t.title} onClick={() => onFormat(t.cmd)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'6px', borderRadius:6, color:'#64748B', transition:'0.2s', display:'flex', alignItems:'center' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#F1F5F9';e.currentTarget.style.color='#0F172A'}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#64748B'}}>
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
  const [saved, setSaved]         = useState(false);
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

  // Latest data ko auto-save ke liye ref mein rakhna zaroori hai
  const latestData = useRef({ title, content, tags });
  useEffect(() => { latestData.current = { title, content, tags }; }, [title, content, tags]);

  /* ── Auto-save logic ── */
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [note?._id, onUpdate]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(performSave, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [title, content, tags, performSave]);

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

  const toggleVoice = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return toast.error('Chrome browser use karein');
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new Speech();
    rec.continuous = true; rec.lang = 'hi-IN';
    recognitionRef.current = rec;
    rec.onresult = (e) => {
      let result = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) result += e.results[i][0].transcript + ' ';
      }
      setContent(prev => prev + result);
    };
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  };

  const handleAI = async (type) => {
    setLoadingAI(true);
    setActiveTab(type);
    try {
      const { data } = await API.post(`/ai/${type}/${note._id}`);
      if (type === 'summarize') setAiSummary(data.summary);
      if (type === 'flashcards') setFlashcards(data.flashcards || []);
      if (type === 'quiz') setQuizQuestions(data.questions || []);
    } catch (err) { toast.error(`AI ${type} failed`); }
    setLoadingAI(false);
  };

  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100vh', background:'#fff', flex:1, 
      fontFamily:"'Plus Jakarta Sans', sans-serif", overflow:'hidden',
      ...(focusMode ? { position:'fixed', inset:0, zIndex:1000 } : {})
    }}>
      <style>{`
        .editor-tab{padding:12px 20px; border:none; background:none; cursor:pointer; font-size:14px; font-weight:600; color:#64748B; border-bottom:2px solid transparent; transition:0.2s;}
        .editor-tab.active{color:#E55B2D; border-bottom-color:#E55B2D;}
        .action-btn{background:#FFF; border:1px solid #E2E8F0; border-radius:8px; padding:6px 12px; display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#475569; cursor:pointer; transition:0.2s;}
        .action-btn.ai{background:#0F172A; color:#FFF; border:none;}
        .tag-pill{background:#F1F5F9; color:#475569; padding:4px 10px; border-radius:100px; font-size:12px; font-weight:600; display:flex; gap:4px; align-items:center; cursor:pointer;}
        .note-title-in{padding:24px 32px 8px; font-size:28px; font-weight:800; border:none; outline:none; color:#0F172A; width:100%;}
        .note-text-in{flex:1; padding:16px 32px; font-size:16px; line-height:1.8; border:none; outline:none; resize:none; color:#334155; width:100%;}
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .note-title-in { padding: 16px 16px 8px !important; font-size: 20px !important; }
          .note-text-in { padding: 8px 16px 16px !important; font-size: 15px !important; line-height: 1.7 !important; }
          .editor-tab { padding: 10px 14px !important; font-size: 13px !important; }
          .action-btn span { display: none; }
          .action-btn { padding: 8px !important; }
          .note-editor-header { padding: 0 12px !important; height: 52px !important; }
          .note-editor-toolbar { padding: 6px 12px !important; }
          .note-editor-toolbar button { padding: 8px !important; min-width: 34px; min-height: 34px; }
        }
      `}</style>

      {/* Top Header */}
      <div style={{ height: 64, borderBottom: '1px solid #E2E8F0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onClose} className="action-btn" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: saving ? '#F59E0B' : '#10B981', fontSize: 13, fontWeight: 600 }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
            {saving ? 'Saving...' : 'Changes saved'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn" onClick={toggleVoice} style={listening ? { borderColor: '#E55B2D', color: '#E55B2D' } : {}}>
            {listening ? <MicOff size={14} /> : <Mic size={14} />} {listening ? 'Stop' : 'Voice'}
          </button>
          <button className="action-btn" onClick={() => setFocusMode(!focusMode)}>
            {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {focusMode ? 'Exit' : 'Focus'}
          </button>
          <div style={{ width: 1, height: 24, background: '#E2E8F0' }} />
          <button className="action-btn ai" onClick={() => handleAI('summarize')}><Sparkles size={14} /> Summarize</button>
          <button className="action-btn ai" onClick={() => handleAI('flashcards')}><CreditCard size={14} /> Cards</button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 12px', background: '#FAFAFA' }}>
        <button className={`editor-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}><PenLine size={14} style={{ marginRight: 8 }} /> Writing</button>
        <button className={`editor-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}><FileText size={14} style={{ marginRight: 8 }} /> Summary</button>
        <button className={`editor-tab ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}><CreditCard size={14} style={{ marginRight: 8 }} /> Flashcards</button>
        <button className={`editor-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => handleAI('quiz')}><Brain size={14} style={{ marginRight: 8 }} /> Practice Quiz</button>
      </div>

      {activeTab === 'write' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          {richMode && <RichToolbar onFormat={handleFormat} />}
          <input className="note-title-in" value={title} onChange={e => setTitle(e.target.value)} placeholder="Document Title..." />
          <div style={{ padding: '0 32px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map(t => (
                <span key={t} className="tag-pill" onClick={() => setTags(tags.filter(x => x !== t))}>
                    #{t} <X size={10} />
                </span>
            ))}
            <input 
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#64748B', background: 'transparent' }} 
              placeholder="+ Add tag (Enter)" value={tagInput} onChange={e => setTagInput(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }} 
            />
          </div>
          <textarea ref={textareaRef} className="note-text-in" value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing..." />
        </div>
      )}

      {activeTab !== 'write' && (
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#FAFAFA' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {loadingAI ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: 16 }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#E55B2D' }} />
                <p style={{ fontWeight: 600, color: '#64748B' }}>Generating with AI...</p>
              </div>
            ) : (
              <>
                {activeTab === 'summary' && (
                   <div style={{ background: '#FFF', padding: 40, borderRadius: 24, border: '1px solid #E2E8F0', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                     <div style={{ fontSize: 12, fontWeight: 800, color: '#E55B2D', marginBottom: 16, textTransform: 'uppercase' }}>AI Summary</div>
                     {aiSummary || "Write something first to summarize."}
                   </div>
                )}
                {activeTab === 'flashcards' && (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {flashcards.length > 0 ? flashcards.map((fc, i) => (
                      <div key={i} style={{ background: '#FFF', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#E55B2D', marginBottom: 8 }}>Q {i+1}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>{fc.question}</div>
                        <div style={{ fontSize: 14, color: '#64748B', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>{fc.answer}</div>
                      </div>
                    )) : <p style={{textAlign:'center', color:'#64748B'}}>No flashcards generated yet.</p>}
                  </div>
                )}
                {activeTab === 'quiz' && (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {quizQuestions.length > 0 ? quizQuestions.map((q, i) => (
                      <div key={i} style={{ background: '#FFF', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                        <p style={{ fontWeight: 700, marginBottom: 16 }}>{i+1}. {q.question}</p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 8, fontSize: 14 }}>
                            {opt}
                          </div>
                        ))}
                        <details style={{ marginTop: 12, fontSize: 13, color: '#10B981', cursor: 'pointer' }}>
                          <summary>Show Correct Answer</summary>
                          <p style={{ marginTop: 8, fontWeight: 600 }}>{q.options[q.correct]}</p>
                          <p style={{ color: '#64748B', fontStyle: 'italic' }}>{q.explanation}</p>
                        </details>
                      </div>
                    )) : <p style={{textAlign:'center', color:'#64748B'}}>No quiz available.</p>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}