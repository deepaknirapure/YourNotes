import { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, CreditCard, PenLine, FileText, ArrowLeft, Save, Check, Loader2, ChevronRight } from 'lucide-react';
import API from '../api/axios';

export default function NoteEditor({ note, onUpdate, onClose }) {
  const [title, setTitle]       = useState(note?.title || '');
  const [content, setContent]   = useState(
    (note?.plainText || note?.content?.replace(/<[^>]+>/g, '') || '')
  );
  const [saving, setSaving]     = useState(false);
  const [aiSummary, setAiSummary] = useState(note?.aiSummary || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab]   = useState('write');

  const titleRef   = useRef(title);
  const contentRef = useRef(content);
  useEffect(() => { titleRef.current   = title;   }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);

  // ── Auto-save (debounced 1.5s) ──────────────────────────────────────────
  const saveTimer = useRef(null);

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!note?._id) return;
      setSaving(true);
      try {
        const res = await API.put(`/notes/${note._id}`, {
          title:     titleRef.current,
          content:   contentRef.current,
          plainText: contentRef.current,
        });
        onUpdate && onUpdate(res.data);
      } catch (_) {}
      setSaving(false);
    }, 1500);
  }, [note?._id, onUpdate]);

  useEffect(() => { scheduleSave(); }, [title, content, scheduleSave]);
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // ── AI Summary ──────────────────────────────────────────────────────────
  const handleSummarize = async () => {
    clearTimeout(saveTimer.current);
    try {
      await API.put(`/notes/${note._id}`, {
        title: titleRef.current, content: contentRef.current, plainText: contentRef.current,
      });
    } catch (_) {}
    setLoadingAI(true);
    setActiveTab('summary');
    try {
      const res = await API.post(`/ai/summarize/${note._id}`, {});
      setAiSummary(res.data.summary);
    } catch (_) {
      setAiSummary('Error: Note mein kam se kam 50 characters hone chahiye.');
    }
    setLoadingAI(false);
  };

  // ── Flashcards ──────────────────────────────────────────────────────────
  const handleFlashcards = async () => {
    clearTimeout(saveTimer.current);
    try {
      await API.put(`/notes/${note._id}`, {
        title: titleRef.current, content: contentRef.current, plainText: contentRef.current,
      });
    } catch (_) {}
    setLoadingAI(true);
    setActiveTab('flashcards');
    try {
      const res = await API.post(`/ai/flashcards/${note._id}`, {});
      setFlashcards(res.data.flashcards);
    } catch (_) {}
    setLoadingAI(false);
  };

  const tabs = [
    { key: 'write',      label: 'Write',      Icon: PenLine   },
    { key: 'summary',    label: 'Summary',    Icon: FileText  },
    { key: 'flashcards', label: 'Flashcards', Icon: CreditCard },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff', flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        .yn-tab-btn { padding: 10px 18px; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 7px; font-size: 14px; font-family: 'DM Sans', sans-serif; border-bottom: 2px solid transparent; transition: all .2s; }
        .yn-tab-btn.active { color: #4F46E5; border-bottom-color: #4F46E5; font-weight: 700; }
        .yn-tab-btn:not(.active) { color: #6b7280; }
        .yn-tab-btn:hover:not(.active) { color: #374151; }
        .yn-ai-btn { color: #fff; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 7px; font-family: 'DM Sans', sans-serif; transition: opacity .2s; }
        .yn-ai-btn:hover { opacity: 0.87; }
        .yn-toolbar-btn { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 14px; color: #374151; font-family: 'DM Sans', sans-serif; transition: background .15s; }
        .yn-toolbar-btn:hover { background: #f3f4f6; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, padding: '4px 8px',
            borderRadius: 6, transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: saving ? '#f59e0b' : '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            {saving
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <><Check size={13} /> Saved</>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSummarize} className="yn-ai-btn"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <Bot size={14} /> AI Summary
          </button>
          <button onClick={handleFlashcards} className="yn-ai-btn"
            style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
            <CreditCard size={14} /> Flashcards
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 24px', background: '#fff' }}>
        {tabs.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`yn-tab-btn${activeTab === key ? ' active' : ''}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: 860, width: '100%', margin: '0 auto' }}>

        {/* WRITE TAB */}
        {activeTab === 'write' && (
          <>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note ka title..."
              style={{
                width: '100%', fontSize: 30, fontWeight: 700,
                border: 'none', outline: 'none', marginBottom: 8,
                color: '#1f2937', background: 'transparent',
                fontFamily: "'Syne', sans-serif",
              }}
            />
            <div style={{ height: 1, background: '#e5e7eb', marginBottom: 24 }} />
            <Toolbar />
            <textarea
              id="note-content-area"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"Yahan apne notes likho...\n\nKuch tips:\n• **bold text** ke liye double asterisk use karo\n• Bullet points ke liye - ya • use karo\n• Headings ke liye # use karo"}
              style={{
                width: '100%', minHeight: '60vh', border: 'none', outline: 'none',
                fontSize: 16, lineHeight: 1.9, color: '#374151', background: 'transparent',
                resize: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
              }}
            />
            <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
              {content.trim().split(/\s+/).filter(Boolean).length} words · {content.length} characters
            </div>
          </>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div>
            <h3 style={{ color: '#4F46E5', marginBottom: 20, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bot size={20} /> AI Generated Summary
            </h3>
            {loadingAI ? (
              <LoadingCard icon={<Bot size={32} />} text="AI summary generate kar raha hai..." />
            ) : aiSummary ? (
              <div style={{
                background: '#f5f3ff', borderRadius: 16, padding: 28,
                lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-wrap',
                fontSize: 15, border: '1px solid #e0d9ff',
              }}>
                {aiSummary}
              </div>
            ) : (
              <EmptyState icon={<Bot size={36} />} text='Upar "AI Summary" button dabao!' />
            )}
          </div>
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'flashcards' && (
          <div>
            <h3 style={{ color: '#4F46E5', marginBottom: 20, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={20} /> Flashcards
            </h3>
            {loadingAI ? (
              <LoadingCard icon={<CreditCard size={32} />} text="Flashcards generate ho rahe hain..." />
            ) : flashcards.length > 0 ? (
              <>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  {flashcards.length} flashcards · Click karo flip karne ke liye
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {flashcards.map((fc, i) => (
                    <FlashCard key={i} question={fc.question} answer={fc.answer} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon={<CreditCard size={36} />} text='Upar "Flashcards" button dabao!' />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar() {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
      {[
        { label: 'B', title: 'Bold (**text**)',  style: { fontWeight: 700 }, before: '**', after: '**' },
        { label: 'I', title: 'Italic (_text_)',  style: { fontStyle: 'italic' }, before: '_', after: '_' },
        { label: 'H', title: 'Heading (# text)', style: { fontWeight: 700 }, before: '# ', after: '' },
        { label: '—', title: 'Divider',          style: {}, before: '\n---\n', after: '' },
        { label: '•', title: 'Bullet point',     style: {}, before: '\n• ', after: '' },
      ].map(btn => (
        <button key={btn.label} title={btn.title} className="yn-toolbar-btn"
          onClick={() => insertAtCursor(btn.before, btn.after)} style={btn.style}>
          {btn.label}
        </button>
      ))}
    </div>
  );
}

function insertAtCursor(before, after) {
  const ta = document.getElementById('note-content-area');
  if (!ta) return;
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  const newVal = ta.value.substring(0, start) + before + selected + after + ta.value.substring(end);
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  nativeInputValueSetter.call(ta, newVal);
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  setTimeout(() => ta.setSelectionRange(start + before.length, start + before.length + selected.length), 0);
}

// ── FlashCard ─────────────────────────────────────────────────────────────────
function FlashCard({ question, answer, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(!flipped)} style={{
      background: flipped ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f9fafb',
      borderRadius: 14, padding: '24px 28px', cursor: 'pointer',
      border: '1px solid #e5e7eb', transition: 'all 0.25s',
      color: flipped ? '#fff' : '#1f2937',
      boxShadow: flipped ? '0 4px 20px rgba(99,102,241,0.25)' : 'none',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, opacity: 0.7, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
        {flipped
          ? <><Check size={11} /> ANSWER</>
          : <>Q {index + 1}</>}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.7 }}>
        {flipped ? answer : question}
      </div>
      <div style={{ fontSize: 11, marginTop: 14, opacity: 0.55 }}>
        {flipped ? 'Click to see question' : 'Click to reveal answer'}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function LoadingCard({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      <p style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 0', color: '#6b7280',
      background: '#f9fafb', borderRadius: 16, border: '1px dashed #e5e7eb',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.35 }}>{icon}</div>
      <p style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}
