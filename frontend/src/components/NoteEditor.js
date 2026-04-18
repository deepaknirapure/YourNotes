import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, CreditCard, PenLine, FileText, ArrowLeft, Save, Check, Loader2, Tag, Download } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function NoteEditor({ note, onUpdate, onClose }) {
  const [title, setTitle]       = useState(note?.title || '');
  const [content, setContent]   = useState(
    note?.plainText || note?.content?.replace(/<[^>]+>/g, '') || ''
  );
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [aiSummary, setAiSummary] = useState(note?.aiSummary || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab]   = useState('write');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(note?.tags || []);

  const titleRef   = useRef(title);
  const contentRef = useRef(content);
  const tagsRef    = useRef(tags);
  useEffect(() => { titleRef.current   = title;   }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { tagsRef.current    = tags;    }, [tags]);

  // ── Auto-save (debounced 1.5s) ──────────────────────────────────────────
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
        setTimeout(() => setSaved(false), 2000);
      } catch (_) {}
      setSaving(false);
    }, 1500);
  }, [note?._id, onUpdate]);

  useEffect(() => { scheduleSave(); }, [title, content, tags, scheduleSave]);
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // ── AI Summary ──────────────────────────────────────────────────────────
  const handleSummarize = async () => {
    clearTimeout(saveTimer.current);
    try { await API.put(`/notes/${note._id}`, { title: titleRef.current, content: contentRef.current, plainText: contentRef.current }); } catch (_) {}
    setLoadingAI(true); setActiveTab('summary');
    try {
      const res = await API.post(`/ai/summarize/${note._id}`, {});
      setAiSummary(res.data.summary);
    } catch (_) { setAiSummary('Error: Note mein kam se kam 50 characters hone chahiye.'); }
    setLoadingAI(false);
  };

  // ── Flashcards ──────────────────────────────────────────────────────────
  const handleFlashcards = async () => {
    clearTimeout(saveTimer.current);
    try { await API.put(`/notes/${note._id}`, { title: titleRef.current, content: contentRef.current, plainText: contentRef.current }); } catch (_) {}
    setLoadingAI(true); setActiveTab('flashcards');
    try {
      const res = await API.post(`/ai/flashcards/${note._id}`, {});
      setFlashcards(res.data.flashcards);
    } catch (_) { toast.error('Flashcard generation failed'); }
    setLoadingAI(false);
  };

  // ── PDF Export ──────────────────────────────────────────────────────────
  const handlePDFExport = () => {
    const content_html = `
      <!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${titleRef.current || 'Note'}</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.7}
        h1{font-size:28px;font-weight:800;margin-bottom:8px;color:#1a1a1a}
        .meta{font-size:12px;color:#666;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #E55B2D}
        .tags span{display:inline-block;padding:2px 10px;background:#fff3f0;border:1px solid #E55B2D;border-radius:4px;font-size:11px;color:#E55B2D;font-weight:700;margin-right:6px}
        pre{white-space:pre-wrap;font-family:'Segoe UI',sans-serif;font-size:15px;color:#333}
      </style></head><body>
      <h1>${titleRef.current || 'Untitled Note'}</h1>
      <div class="meta">
        <span>YourNotes Export · ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</span>
        ${tagsRef.current?.length ? `<div class="tags" style="margin-top:6px">${tagsRef.current.map(t=>`<span>${t}</span>`).join('')}</div>` : ''}
      </div>
      <pre>${contentRef.current}</pre>
      </body></html>
    `;
    const blob = new Blob([content_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${titleRef.current || 'note'}.html`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Note exported! Browser se Print > Save as PDF karo');
  };

  // ── Tags ──────────────────────────────────────────────────────────────
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const t = tagInput.trim().replace(/^#/, '');
      if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); }
      setTagInput('');
    }
  };
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const tabs = [
    { key: 'write',      label: 'Write',      Icon: PenLine   },
    { key: 'summary',    label: 'AI Summary', Icon: FileText  },
    { key: 'flashcards', label: 'Flashcards', Icon: CreditCard },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', flex: 1, fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      <style>{`
        
        .yn-tab-btn{padding:10px 18px;border:none;background:none;cursor:pointer;display:flex;align-items:center;gap:7px;font-size:13px;font-family:'DM Sans',sans-serif;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
        .yn-tab-btn.active{color:#E55B2D;border-bottom-color:#E55B2D;font-weight:700}
        .yn-tab-btn:not(.active){color:#6b7280}
        .yn-tab-btn:hover:not(.active){color:#374151}
        .yn-ai-btn{color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;transition:all .2s}
        .yn-ai-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .yn-ai-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .yn-tag-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;background:#fff3f0;border:1px solid rgba(229,91,45,.3);border-radius:20px;font-size:11px;color:#E55B2D;font-weight:700;cursor:pointer;transition:background .15s}
        .yn-tag-pill:hover{background:rgba(229,91,45,.1)}
        .yn-tag-input{border:none;outline:none;font-size:12px;font-family:'DM Sans',sans-serif;color:#374151;background:transparent;min-width:80px}
        .yn-note-textarea{flex:1;padding:28px 32px;font-size:16px;font-family:'DM Sans',sans-serif;line-height:1.85;color:#1a1a1a;border:none;outline:none;resize:none;width:100%;background:#fff}
        .yn-note-textarea::placeholder{color:#d1d5db}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        @keyframes ynFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .yn-fc-card{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:12px;transition:border-color .2s;animation:ynFadeIn .3s ease both}
        .yn-fc-card:hover{border-color:rgba(229,91,45,.3)}
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '6px', borderRadius: 6, display: 'flex', transition: 'color .15s', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#374151'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div style={{ fontSize: 12, fontWeight: 600, color: saving ? '#f59e0b' : saved ? '#10b981' : '#d1d5db', display: 'flex', alignItems: 'center', gap: 5, transition: 'color .3s', flexShrink: 0 }}>
            {saving ? <><span style={{ width: 12, height: 12, border: '1.5px solid rgba(245,158,11,.3)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'ynSpin 1s linear infinite', display: 'inline-block' }} />Saving...</>
              : saved ? <><Check size={13} />Saved</> : <><Save size={13} />Auto-save</>}
          </div>
        </div>

        {/* AI Buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="yn-ai-btn" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }} onClick={handleSummarize} disabled={loadingAI}>
            <Bot size={13} /> AI Summary
          </button>
          <button className="yn-ai-btn" style={{ background: 'linear-gradient(135deg,#E55B2D,#c94d23)' }} onClick={handleFlashcards} disabled={loadingAI}>
            <CreditCard size={13} /> Flashcards
          </button>
          <button className="yn-ai-btn" style={{ background: '#374151' }} onClick={handlePDFExport} title="Export as HTML (print to PDF)">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ borderBottom: '1px solid #f0f0f0', paddingLeft: 20, display: 'flex', gap: 0, flexShrink: 0 }}>
        {tabs.map(({ key, label, Icon }) => (
          <button key={key} className={`yn-tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Title ── */}
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Note ka title likhein..."
        style={{ padding: '20px 32px 10px', fontSize: 22, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", border: 'none', outline: 'none', color: '#111', background: '#fff', flexShrink: 0 }}
      />

      {/* ── Tags row ── */}
      <div style={{ padding: '0 32px 10px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        <Tag size={13} color="#d1d5db" />
        {tags.map(t => (
          <span key={t} className="yn-tag-pill" onClick={() => removeTag(t)} title="Click to remove">
            #{t} ×
          </span>
        ))}
        <input className="yn-tag-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder={tags.length === 0 ? "Tag add karein (Enter)" : ""} />
      </div>

      {/* ── Write Tab ── */}
      {activeTab === 'write' && (
        <textarea
          className="yn-note-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Yahan apna note likhein..."
        />
      )}

      {/* ── Summary Tab ── */}
      {activeTab === 'summary' && (
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', animation: 'ynFadeIn .3s ease' }}>
          {loadingAI ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 16 }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(79,70,229,.2)', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'ynSpin 1s linear infinite' }} />
              <p style={{ color: '#6b7280', fontSize: 14 }}>Groq AI se summary le raha hoon...</p>
            </div>
          ) : aiSummary ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 16px', background: 'rgba(79,70,229,.06)', borderRadius: 8, border: '1px solid rgba(79,70,229,.15)' }}>
                <Bot size={16} color="#4F46E5" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5' }}>AI SUMMARY</span>
              </div>
              <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{aiSummary}</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Bot size={40} color="#d1d5db" style={{ marginBottom: 16 }} />
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>AI Summary abhi generate nahi hui</p>
              <button className="yn-ai-btn" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', margin: '0 auto' }} onClick={handleSummarize}>
                <Bot size={14} /> Generate Summary
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Flashcards Tab ── */}
      {activeTab === 'flashcards' && (
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', animation: 'ynFadeIn .3s ease' }}>
          {loadingAI ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 16 }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(229,91,45,.2)', borderTopColor: '#E55B2D', borderRadius: '50%', animation: 'ynSpin 1s linear infinite' }} />
              <p style={{ color: '#6b7280', fontSize: 14 }}>Flashcards generate kar raha hoon...</p>
            </div>
          ) : flashcards.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', background: 'rgba(229,91,45,.06)', borderRadius: 8, border: '1px solid rgba(229,91,45,.15)' }}>
                <CreditCard size={16} color="#E55B2D" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#E55B2D' }}>{flashcards.length} FLASHCARDS GENERATED</span>
              </div>
              {flashcards.map((fc, i) => (
                <div key={fc._id || i} className="yn-fc-card">
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E55B2D', letterSpacing: '.06em', marginBottom: 6 }}>Q {i + 1}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>{fc.question}</div>
                  <div style={{ height: 1, background: '#e5e7eb', margin: '10px 0' }} />
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: '.06em', marginBottom: 6 }}>ANSWER</div>
                  <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{fc.answer}</div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <CreditCard size={40} color="#d1d5db" style={{ marginBottom: 16 }} />
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>Flashcards abhi generate nahi hue</p>
              <button className="yn-ai-btn" style={{ background: 'linear-gradient(135deg,#E55B2D,#c94d23)', margin: '0 auto' }} onClick={handleFlashcards}>
                <CreditCard size={14} /> Generate Flashcards
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
