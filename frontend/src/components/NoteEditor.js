// यह Note Editor component hai - notes likhne, edit karne aur AI features use karne ke liye
// Features: Auto-save, Rich text, AI summary, Flashcards, Quiz, Voice input, Tags
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot, CreditCard, PenLine, FileText, ArrowLeft, Save, Check, Loader2,
  Tag, Download, Mic, MicOff, Maximize2, Minimize2, X, Brain,
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Quote, Minus
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

/* ─── Minimal Rich Text Toolbar ─────────────────────────────────────────── */
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
    <div style={{ display:'flex', alignItems:'center', gap:2, padding:'6px 16px', borderBottom:'1px solid #f0f0f0', flexWrap:'wrap', flexShrink:0 }}>
      {tools.map(t => (
        <button key={t.cmd} title={t.title} onClick={() => onFormat(t.cmd)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'5px 7px', borderRadius:5, color:'#6b7280', transition:'all .15s', display:'flex', alignItems:'center' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#f3f4f6';e.currentTarget.style.color='#111'}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#6b7280'}}>
          {t.icon}
        </button>
      ))}
    </div>
  );
}

export default function NoteEditor({ note, onUpdate, onClose }) {
  const [title, setTitle]         = useState(note?.title || '');
  const [content, setContent]     = useState(note?.plainText || note?.content?.replace(/<[^>]+>/g,'') || '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [aiSummary, setAiSummary] = useState(note?.aiSummary || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers]     = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [tagInput, setTagInput]   = useState('');
  const [tags, setTags]           = useState(note?.tags || []);
  const [focusMode, setFocusMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [richMode, setRichMode]   = useState(false);

  const textareaRef = useRef(null);
  const titleRef    = useRef(title);
  const contentRef  = useRef(content);
  const tagsRef     = useRef(tags);
  const recognitionRef = useRef(null);

  useEffect(() => { titleRef.current   = title;   }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { tagsRef.current    = tags;    }, [tags]);

  /* ── Auto-save 1.5s debounce ── */
  const saveTimer = useRef(null);
  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!note?._id) return;
      setSaving(true); setSaved(false);
      try {
        const res = await API.put(`/notes/${note._id}`, {
          title:     titleRef.current,
          content:   contentRef.current,
          plainText: contentRef.current,
          tags:      tagsRef.current,
        });
        onUpdate && onUpdate(res.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (_) {}
      setSaving(false);
    }, 1500);
  }, [note?._id, onUpdate]);

  useEffect(() => { scheduleSave(); }, [title, content, tags, scheduleSave]);
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  /* ── Rich Text Formatting ── */
  const handleFormat = (cmd) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = content.slice(start, end);
    const before = content.slice(0, start);
    const after  = content.slice(end);
    let insert = '';
    switch(cmd) {
      case 'bold':   insert = `**${sel || 'bold text'}**`; break;
      case 'italic': insert = `_${sel || 'italic text'}_`; break;
      case 'h1':     insert = `\n# ${sel || 'Heading 1'}\n`; break;
      case 'h2':     insert = `\n## ${sel || 'Heading 2'}\n`; break;
      case 'ul':     insert = `\n- ${sel || 'List item'}\n- \n`; break;
      case 'ol':     insert = `\n1. ${sel || 'First item'}\n2. \n`; break;
      case 'code':   insert = sel ? `\`${sel}\`` : '```\ncode here\n```'; break;
      case 'quote':  insert = `\n> ${sel || 'Blockquote'}\n`; break;
      case 'hr':     insert = '\n---\n'; break;
      default: return;
    }
    const newContent = before + insert + after;
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      const pos = before.length + insert.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  /* ── Voice to Notes (Web Speech API) ── */
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition aapke browser mein support nahi hai. Chrome use karein.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous   = true;
    recognition.interimResults = true;
    recognition.lang          = 'hi-IN';
    recognitionRef.current = recognition;
    let interim = '';
    recognition.onresult = (e) => {
      interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      if (final) setContent(prev => prev + final);
    };
    recognition.onerror = () => { setListening(false); toast.error('Voice recognition error'); };
    recognition.onend   = () => setListening(false);
    recognition.start();
    setListening(true);
    toast.success('Bol rahe ho... (Hindi + English dono supported)');
  };

  /* ── AI Summary ── */
  const handleSummarize = async () => {
    clearTimeout(saveTimer.current);
    try { await API.put(`/notes/${note._id}`, { title: titleRef.current, plainText: contentRef.current, content: contentRef.current }); } catch (_) {}
    setLoadingAI(true); setActiveTab('summary');
    try {
      const res = await API.post(`/ai/summarize/${note._id}`, {});
      setAiSummary(res.data.summary);
    } catch (err) {
      setAiSummary(err.response?.data?.message || 'Error generating summary.');
    }
    setLoadingAI(false);
  };

  /* ── AI Flashcards ── */
  const handleFlashcards = async () => {
    clearTimeout(saveTimer.current);
    try { await API.put(`/notes/${note._id}`, { title: titleRef.current, plainText: contentRef.current, content: contentRef.current }); } catch (_) {}
    setLoadingAI(true); setActiveTab('flashcards');
    try {
      const res = await API.post(`/ai/flashcards/${note._id}`, {});
      setFlashcards(res.data.flashcards);
    } catch (_) { toast.error('Flashcard generation failed'); }
    setLoadingAI(false);
  };

  /* ── AI Quiz ── */
  const handleQuiz = async () => {
    clearTimeout(saveTimer.current);
    try { await API.put(`/notes/${note._id}`, { title: titleRef.current, plainText: contentRef.current, content: contentRef.current }); } catch (_) {}
    setLoadingAI(true); setActiveTab('quiz');
    setQuizQuestions([]); setQuizAnswers({}); setQuizSubmitted(false);
    try {
      const res = await API.post(`/ai/quiz/${note._id}`, {});
      setQuizQuestions(res.data.questions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quiz generation failed');
    }
    setLoadingAI(false);
  };

  /* ── PDF Export (HTML print) ── */
  const handlePDFExport = () => {
    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${titleRef.current || 'Note'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body{font-family:'Inter',Arial,sans-serif;max-width:820px;margin:48px auto;padding:24px;color:#1a1a1a;line-height:1.75}
        h1{font-size:30px;font-weight:800;margin-bottom:6px}
        .meta{font-size:12px;color:#666;margin-bottom:28px;padding-bottom:14px;border-bottom:2px solid #E55B2D}
        .tags span{display:inline-block;padding:2px 10px;background:#fff3f0;border:1px solid #E55B2D;border-radius:4px;font-size:11px;color:#E55B2D;font-weight:700;margin-right:5px}
        pre{white-space:pre-wrap;font-family:'Inter',sans-serif;font-size:15px;color:#333}
        h2{font-size:20px;font-weight:700;margin:20px 0 8px} h3{font-size:17px;font-weight:600}
        blockquote{border-left:3px solid #E55B2D;padding-left:16px;color:#555;margin:16px 0}
        code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px}
        hr{border:none;border-top:1px solid #e5e7eb;margin:20px 0}
        ul,ol{padding-left:24px} li{margin-bottom:4px}
      </style></head><body>
      <h1>${titleRef.current || 'Untitled Note'}</h1>
      <div class="meta">
        <span>YourNotes Export · ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</span>
        ${tagsRef.current?.length ? `<div class="tags" style="margin-top:6px">${tagsRef.current.map(t=>`<span>#${t}</span>`).join('')}</div>` : ''}
      </div>
      <pre>${contentRef.current}</pre>
      </body></html>`;
    const blob = new Blob([html], { type:'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${titleRef.current||'note'}.html`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Exported! Browser se Print → Save as PDF karo');
  };

  /* ── Tags ── */
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const t = tagInput.trim().replace(/^#/,'');
      if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  /* ── Quiz score ── */
  const quizScore = quizSubmitted
    ? quizQuestions.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correct ? 1 : 0), 0)
    : 0;

  const tabs = [
    { key:'write',      label:'Write',      Icon:PenLine    },
    { key:'summary',    label:'AI Summary', Icon:FileText   },
    { key:'flashcards', label:'Flashcards', Icon:CreditCard },
    { key:'quiz',       label:'AI Quiz',    Icon:Brain      },
  ];

  const wrapStyle = focusMode
    ? { position:'fixed', inset:0, zIndex:999, background:'#fff', display:'flex', flexDirection:'column', fontFamily:"'Inter', 'DM Sans', sans-serif" }
    : { display:'flex', flexDirection:'column', height:'100%', background:'#fff', flex:1, fontFamily:"'Inter', 'DM Sans', sans-serif", overflow:'hidden' };

  return (
    <div style={wrapStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .yn-tab-btn{padding:9px 16px;border:none;background:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-family:'Inter',sans-serif;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;font-weight:500}
        .yn-tab-btn.active{color:#E55B2D;border-bottom-color:#E55B2D;font-weight:700}
        .yn-tab-btn:not(.active){color:#6b7280}
        .yn-tab-btn:hover:not(.active){color:#374151;background:rgba(0,0,0,.03)}
        .yn-ai-btn{color:#fff;border:none;border-radius:8px;padding:7px 13px;cursor:pointer;font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px;font-family:'Inter',sans-serif;transition:all .2s}
        .yn-ai-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .yn-ai-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .yn-tag-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;background:#fff3f0;border:1px solid rgba(229,91,45,.3);border-radius:20px;font-size:11px;color:#E55B2D;font-weight:700;cursor:pointer;transition:background .15s}
        .yn-tag-pill:hover{background:rgba(229,91,45,.12)}
        .yn-tag-input{border:none;outline:none;font-size:12px;font-family:'Inter',sans-serif;color:#374151;background:transparent;min-width:80px}
        .yn-note-textarea{flex:1;padding:24px 32px;font-size:16px;font-family:'Inter',sans-serif;line-height:1.9;color:#1a1a1a;border:none;outline:none;resize:none;width:100%;background:#fff}
        .yn-note-textarea::placeholder{color:#d1d5db}
        .yn-title-input{padding:18px 32px 8px;font-size:22px;font-weight:800;font-family:'Inter',sans-serif;border:none;outline:none;color:#111;background:#fff;width:100%;flex-shrink:0}
        .yn-title-input::placeholder{color:#e5e7eb}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        @keyframes ynFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .yn-fc-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:10px;transition:border-color .2s;animation:ynFadeIn .3s ease both}
        .yn-fc-card:hover{border-color:rgba(229,91,45,.3)}
        .yn-quiz-opt{display:block;width:100%;text-align:left;padding:10px 14px;margin-bottom:6px;border:1.5px solid #e5e7eb;border-radius:9px;background:#fff;cursor:pointer;font-size:14px;font-family:'Inter',sans-serif;transition:all .2s;color:#374151}
        .yn-quiz-opt:hover:not(:disabled){border-color:#E55B2D;background:#fff3f0;color:#E55B2D}
        .yn-quiz-opt.selected{border-color:#E55B2D;background:#fff3f0;color:#E55B2D;font-weight:600}
        .yn-quiz-opt.correct{border-color:#10b981;background:rgba(16,185,129,.08);color:#059669;font-weight:600}
        .yn-quiz-opt.wrong{border-color:#ef4444;background:rgba(239,68,68,.08);color:#dc2626}
        .yn-icon-btn{background:none;border:1px solid rgba(0,0,0,.08);border-radius:7px;padding:6px 9px;cursor:pointer;display:flex;align-items:center;gap:5px;font-size:12px;font-family:'Inter',sans-serif;color:#6b7280;transition:all .2s;white-space:nowrap}
        .yn-icon-btn:hover{background:#f3f4f6;color:#111;border-color:rgba(0,0,0,.15)}
        .yn-icon-btn.active{background:rgba(229,91,45,.08);color:#E55B2D;border-color:rgba(229,91,45,.3)}
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ borderBottom:'1px solid #f0f0f0', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:52, gap:8, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
          {onClose && (
            <button onClick={onClose} className="yn-icon-btn" style={{ border:'none', padding:'4px 6px' }}>
              <ArrowLeft size={16} />
            </button>
          )}
          <span style={{ fontSize:12, fontWeight:600, color: saving ? '#f59e0b' : saved ? '#10b981' : '#d1d5db', display:'flex', alignItems:'center', gap:4, transition:'color .3s', flexShrink:0 }}>
            {saving ? <><span style={{ width:11,height:11,border:'1.5px solid rgba(245,158,11,.3)',borderTopColor:'#f59e0b',borderRadius:'50%',animation:'ynSpin 1s linear infinite',display:'inline-block'}}/>Saving...</>
              : saved ? <><Check size={12}/>Saved</> : <><Save size={12}/>Auto-save</>}
          </span>
        </div>
        {/* Right side actions */}
        <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
          <button className={`yn-icon-btn ${richMode ? 'active' : ''}`} onClick={() => setRichMode(r => !r)} title="Rich text formatting toolbar">
            <Bold size={13}/> {richMode ? 'Plain' : 'Rich'}
          </button>
          <button className={`yn-icon-btn ${listening ? 'active' : ''}`} onClick={toggleVoice} title="Voice to notes">
            {listening ? <MicOff size={13} color="#E55B2D"/> : <Mic size={13}/>}
            {listening ? 'Stop' : 'Voice'}
          </button>
          <button className={`yn-icon-btn ${focusMode ? 'active' : ''}`} onClick={() => setFocusMode(f => !f)} title="Focus mode">
            {focusMode ? <Minimize2 size={13}/> : <Maximize2 size={13}/>}
            {focusMode ? 'Exit Focus' : 'Focus'}
          </button>
          <div style={{ width:1, height:20, background:'#e5e7eb' }}/>
          <button className="yn-ai-btn" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }} onClick={handleSummarize} disabled={loadingAI}>
            <Bot size={12}/> Summary
          </button>
          <button className="yn-ai-btn" style={{ background:'linear-gradient(135deg,#E55B2D,#c94d23)' }} onClick={handleFlashcards} disabled={loadingAI}>
            <CreditCard size={12}/> Cards
          </button>
          <button className="yn-ai-btn" style={{ background:'linear-gradient(135deg,#059669,#047857)' }} onClick={handleQuiz} disabled={loadingAI}>
            <Brain size={12}/> Quiz
          </button>
          <button className="yn-ai-btn" style={{ background:'#374151' }} onClick={handlePDFExport} title="Export as HTML → Print → PDF">
            <Download size={12}/> Export
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ borderBottom:'1px solid #f0f0f0', paddingLeft:16, display:'flex', gap:0, flexShrink:0, overflowX:'auto' }}>
        {tabs.map(({ key, label, Icon }) => (
          <button key={key} className={`yn-tab-btn ${activeTab === key ? 'active':''}`} onClick={() => setActiveTab(key)}>
            <Icon size={13}/> {label}
          </button>
        ))}
      </div>

      {/* ── Rich Toolbar (conditional) ── */}
      {activeTab === 'write' && richMode && <RichToolbar onFormat={handleFormat} />}

      {/* ── Title ── */}
      {activeTab === 'write' && (
        <input className="yn-title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note ka title..." />
      )}

      {/* ── Tags row ── */}
      {activeTab === 'write' && (
        <div style={{ padding:'0 32px 10px', display:'flex', alignItems:'center', gap:5, flexWrap:'wrap', flexShrink:0 }}>
          <Tag size={12} color="#d1d5db"/>
          {tags.map(t => (
            <span key={t} className="yn-tag-pill" onClick={() => removeTag(t)} title="Click to remove">#{t} ×</span>
          ))}
          <input className="yn-tag-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
            placeholder={tags.length === 0 ? 'Tag add karein (Enter press karo)' : ''}/>
        </div>
      )}

      {/* ── Voice listening banner ── */}
      {listening && (
        <div style={{ margin:'0 32px 8px', padding:'8px 14px', background:'rgba(229,91,45,.08)', border:'1px solid rgba(229,91,45,.25)', borderRadius:8, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <span style={{ width:8,height:8,borderRadius:'50%',background:'#E55B2D',animation:'ynSpin .8s linear infinite',display:'inline-block'}}/>
          <span style={{ fontSize:12,fontWeight:600,color:'#E55B2D' }}>Listening... bolo (Hindi/English)</span>
          <button onClick={toggleVoice} style={{ marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#E55B2D' }}><X size={14}/></button>
        </div>
      )}

      {/* ═══ WRITE TAB ═══ */}
      {activeTab === 'write' && (
        <textarea ref={textareaRef} className="yn-note-textarea" value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={richMode
            ? "Likhna shuru karo... Use toolbar for formatting (markdown supported)\n**bold**, _italic_, # Heading, - list, > quote"
            : "Yahan apna note likhein..."}
        />
      )}

      {/* ═══ SUMMARY TAB ═══ */}
      {activeTab === 'summary' && (
        <div style={{ flex:1, padding:'24px 32px', overflowY:'auto', animation:'ynFadeIn .3s ease' }}>
          {loadingAI ? (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:200,gap:14 }}>
              <div style={{ width:34,height:34,border:'3px solid rgba(79,70,229,.2)',borderTopColor:'#4F46E5',borderRadius:'50%',animation:'ynSpin 1s linear infinite'}}/>
              <p style={{ color:'#6b7280',fontSize:14,fontFamily:'Inter,sans-serif' }}>Groq AI se summary generate ho rahi hai...</p>
            </div>
          ) : aiSummary ? (
            <>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16,padding:'9px 14px',background:'rgba(79,70,229,.06)',borderRadius:8,border:'1px solid rgba(79,70,229,.15)' }}>
                <Bot size={15} color="#4F46E5"/>
                <span style={{ fontSize:11,fontWeight:800,color:'#4F46E5',letterSpacing:'.05em' }}>AI SUMMARY — GROQ LLAMA 3.3</span>
              </div>
              <div style={{ fontSize:15,color:'#374151',lineHeight:1.85,whiteSpace:'pre-wrap',fontFamily:'Inter,sans-serif' }}>{aiSummary}</div>
            </>
          ) : (
            <div style={{ textAlign:'center',padding:'60px 0' }}>
              <Bot size={36} color="#e5e7eb" style={{ marginBottom:14 }}/>
              <p style={{ color:'#9ca3af',fontSize:14,marginBottom:16,fontFamily:'Inter,sans-serif' }}>Pehle note likhein, phir AI Summary generate karein</p>
              <button className="yn-ai-btn" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)',margin:'0 auto' }} onClick={handleSummarize}>
                <Bot size={13}/> Generate Summary
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ FLASHCARDS TAB ═══ */}
      {activeTab === 'flashcards' && (
        <div style={{ flex:1,padding:'24px 32px',overflowY:'auto',animation:'ynFadeIn .3s ease' }}>
          {loadingAI ? (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:200,gap:14 }}>
              <div style={{ width:34,height:34,border:'3px solid rgba(229,91,45,.2)',borderTopColor:'#E55B2D',borderRadius:'50%',animation:'ynSpin 1s linear infinite'}}/>
              <p style={{ color:'#6b7280',fontSize:14,fontFamily:'Inter,sans-serif' }}>Flashcards generate ho rahe hain...</p>
            </div>
          ) : flashcards.length > 0 ? (
            <>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:18,padding:'9px 14px',background:'rgba(229,91,45,.06)',borderRadius:8,border:'1px solid rgba(229,91,45,.15)' }}>
                <CreditCard size={15} color="#E55B2D"/>
                <span style={{ fontSize:11,fontWeight:800,color:'#E55B2D' }}>{flashcards.length} FLASHCARDS GENERATED</span>
              </div>
              {flashcards.map((fc, i) => (
                <div key={fc._id || i} className="yn-fc-card">
                  <div style={{ fontSize:10,fontWeight:800,color:'#E55B2D',letterSpacing:'.07em',marginBottom:5 }}>Q {i+1}</div>
                  <div style={{ fontSize:14,fontWeight:700,color:'#111',marginBottom:10,fontFamily:'Inter,sans-serif' }}>{fc.question}</div>
                  <div style={{ height:1,background:'#e5e7eb',margin:'8px 0' }}/>
                  <div style={{ fontSize:10,fontWeight:800,color:'#10b981',letterSpacing:'.07em',marginBottom:5 }}>ANSWER</div>
                  <div style={{ fontSize:14,color:'#374151',lineHeight:1.6,fontFamily:'Inter,sans-serif' }}>{fc.answer}</div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign:'center',padding:'60px 0' }}>
              <CreditCard size={36} color="#e5e7eb" style={{ marginBottom:14 }}/>
              <p style={{ color:'#9ca3af',fontSize:14,marginBottom:16,fontFamily:'Inter,sans-serif' }}>Note likhein, phir flashcards generate karein</p>
              <button className="yn-ai-btn" style={{ background:'linear-gradient(135deg,#E55B2D,#c94d23)',margin:'0 auto' }} onClick={handleFlashcards}>
                <CreditCard size={13}/> Generate Flashcards
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ QUIZ TAB ═══ */}
      {activeTab === 'quiz' && (
        <div style={{ flex:1,padding:'24px 32px',overflowY:'auto',animation:'ynFadeIn .3s ease' }}>
          {loadingAI ? (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:200,gap:14 }}>
              <div style={{ width:34,height:34,border:'3px solid rgba(5,150,105,.2)',borderTopColor:'#059669',borderRadius:'50%',animation:'ynSpin 1s linear infinite'}}/>
              <p style={{ color:'#6b7280',fontSize:14,fontFamily:'Inter,sans-serif' }}>MCQ Quiz generate ho raha hai...</p>
            </div>
          ) : quizQuestions.length > 0 ? (
            <>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',background:'rgba(5,150,105,.06)',borderRadius:8,border:'1px solid rgba(5,150,105,.15)' }}>
                  <Brain size={15} color="#059669"/>
                  <span style={{ fontSize:11,fontWeight:800,color:'#059669' }}>{quizQuestions.length} MCQ QUESTIONS</span>
                </div>
                {quizSubmitted && (
                  <div style={{ padding:'8px 16px',background: quizScore >= quizQuestions.length*0.7 ? 'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',borderRadius:8,border:`1px solid ${quizScore >= quizQuestions.length*0.7 ? 'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'}` }}>
                    <span style={{ fontSize:14,fontWeight:800,color: quizScore >= quizQuestions.length*0.7 ? '#059669':'#dc2626' }}>
                      Score: {quizScore}/{quizQuestions.length}
                    </span>
                  </div>
                )}
              </div>
              {quizQuestions.map((q, qi) => (
                <div key={qi} className="yn-fc-card" style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,fontWeight:800,color:'#059669',letterSpacing:'.06em',marginBottom:6 }}>Q {qi+1}</div>
                  <div style={{ fontSize:15,fontWeight:700,color:'#111',marginBottom:12,fontFamily:'Inter,sans-serif',lineHeight:1.5 }}>{q.question}</div>
                  {q.options.map((opt, oi) => {
                    let cls = 'yn-quiz-opt';
                    if (quizSubmitted) {
                      if (oi === q.correct) cls += ' correct';
                      else if (quizAnswers[qi] === oi && oi !== q.correct) cls += ' wrong';
                    } else if (quizAnswers[qi] === oi) cls += ' selected';
                    return (
                      <button key={oi} className={cls} disabled={quizSubmitted}
                        onClick={() => !quizSubmitted && setQuizAnswers(a => ({...a, [qi]: oi}))}>
                        <span style={{ fontWeight:600,marginRight:8 }}>{String.fromCharCode(65+oi)}.</span> {opt}
                      </button>
                    );
                  })}
                  {quizSubmitted && q.explanation && (
                    <div style={{ marginTop:8,padding:'8px 12px',background:'rgba(79,70,229,.05)',borderRadius:8,fontSize:13,color:'#4F46E5',fontFamily:'Inter,sans-serif' }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
              {!quizSubmitted ? (
                <button onClick={() => setQuizSubmitted(true)}
                  style={{ width:'100%',padding:'12px',background:'#059669',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'Inter,sans-serif',marginTop:8 }}>
                  Submit Quiz →
                </button>
              ) : (
                <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); handleQuiz(); }}
                  style={{ width:'100%',padding:'12px',background:'linear-gradient(135deg,#059669,#047857)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'Inter,sans-serif',marginTop:8 }}>
                  New Quiz Generate Karo
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center',padding:'60px 0' }}>
              <Brain size={36} color="#e5e7eb" style={{ marginBottom:14 }}/>
              <p style={{ color:'#9ca3af',fontSize:14,marginBottom:8,fontFamily:'Inter,sans-serif' }}>Note se MCQ quiz automatically generate hoga</p>
              <p style={{ color:'#d1d5db',fontSize:12,marginBottom:20,fontFamily:'Inter,sans-serif' }}>4 options, correct answer + explanation ke saath</p>
              <button className="yn-ai-btn" style={{ background:'linear-gradient(135deg,#059669,#047857)',margin:'0 auto' }} onClick={handleQuiz}>
                <Brain size={13}/> Generate Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
