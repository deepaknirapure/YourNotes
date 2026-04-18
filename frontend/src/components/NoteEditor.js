import { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api/axios';

export default function NoteEditor({ note, onUpdate, onClose }) {
  const [title, setTitle]       = useState(note?.title || '');
  const [content, setContent]   = useState(
    // imported notes may have HTML content — strip tags for plain editing
    (note?.plainText || note?.content?.replace(/<[^>]+>/g, '') || '')
  );
  const [saving, setSaving]     = useState(false);
  const [aiSummary, setAiSummary] = useState(note?.aiSummary || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab]   = useState('write');

  // Refs so debounce closures never go stale
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
      } catch (e) { console.error('Auto-save failed:', e); }
      setSaving(false);
    }, 1500);
  }, [note?._id, onUpdate]);

  // trigger save whenever title or content changes
  useEffect(() => { scheduleSave(); }, [title, content, scheduleSave]);

  // cleanup on unmount
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // ── AI Summary ──────────────────────────────────────────────────────────
  const handleSummarize = async () => {
    // save latest content first so backend has fresh text
    clearTimeout(saveTimer.current);
    try {
      await API.put(`/notes/${note._id}`, {
        title:     titleRef.current,
        content:   contentRef.current,
        plainText: contentRef.current,
      });
    } catch (_) {}

    setLoadingAI(true);
    setActiveTab('summary');
    try {
      const res = await API.post(`/ai/summarize/${note._id}`, {});
      setAiSummary(res.data.summary);
    } catch (e) {
      setAiSummary('❌ Error: Note mein kam se kam 50 characters hone chahiye!');
    }
    setLoadingAI(false);
  };

  // ── Flashcards ──────────────────────────────────────────────────────────
  const handleFlashcards = async () => {
    clearTimeout(saveTimer.current);
    try {
      await API.put(`/notes/${note._id}`, {
        title:     titleRef.current,
        content:   contentRef.current,
        plainText: contentRef.current,
      });
    } catch (_) {}

    setLoadingAI(true);
    setActiveTab('flashcards');
    try {
      const res = await API.post(`/ai/flashcards/${note._id}`, {});
      setFlashcards(res.data.flashcards);
    } catch (e) {
      console.error('Flashcards generation failed:', e);
    }
    setLoadingAI(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff', flex: 1 }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', color: '#6b7280', lineHeight: 1,
          }}>←</button>
          <span style={{ fontSize: 13, color: saving ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
            {saving ? '⏳ Saving...' : '✅ Saved'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSummarize} style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            🤖 AI Summary
          </button>
          <button onClick={handleFlashcards} style={{
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            🃏 Flashcards
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 24px', background: '#fff' }}>
        {[
          { key: 'write',      label: '✏️ Write'      },
          { key: 'summary',    label: '📝 Summary'    },
          { key: 'flashcards', label: '🃏 Flashcards' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: '10px 20px', border: 'none', background: 'none',
            cursor: 'pointer', fontWeight: activeTab === key ? 700 : 400,
            color:  activeTab === key ? '#4F46E5' : '#6b7280',
            borderBottom: activeTab === key ? '2px solid #4F46E5' : '2px solid transparent',
            fontSize: 14,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: 860, width: '100%', margin: '0 auto' }}>

        {/* WRITE TAB */}
        {activeTab === 'write' && (
          <>
            {/* Title */}
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

            {/* Toolbar */}
            <Toolbar
              onBold={() => wrapSelection('**')}
              onItalic={() => wrapSelection('_')}
            />

            {/* Content Textarea */}
            <textarea
              id="note-content-area"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Yahan apne notes likho...

Kuch tips:
• **bold text** ke liye double asterisk use karo
• Bullet points ke liye - ya • use karo
• Headings ke liye # use karo"
              style={{
                width: '100%',
                minHeight: '60vh',
                border: 'none',
                outline: 'none',
                fontSize: 16,
                lineHeight: 1.9,
                color: '#374151',
                background: 'transparent',
                resize: 'none',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />

            {/* Word count */}
            <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
              {content.trim().split(/\s+/).filter(Boolean).length} words · {content.length} characters
            </div>
          </>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div>
            <h3 style={{ color: '#4F46E5', marginBottom: 20, fontSize: 20, fontWeight: 700 }}>
              🤖 AI Generated Summary
            </h3>
            {loadingAI ? (
              <LoadingCard emoji="🤖" text="AI summary generate kar raha hai..." />
            ) : aiSummary ? (
              <div style={{
                background: '#f5f3ff', borderRadius: 16, padding: 28,
                lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-wrap',
                fontSize: 15, border: '1px solid #e0d9ff',
              }}>
                {aiSummary}
              </div>
            ) : (
              <EmptyState emoji="🤖" text='Upar "AI Summary" button dabao!' />
            )}
          </div>
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'flashcards' && (
          <div>
            <h3 style={{ color: '#4F46E5', marginBottom: 20, fontSize: 20, fontWeight: 700 }}>
              🃏 Flashcards
            </h3>
            {loadingAI ? (
              <LoadingCard emoji="🃏" text="Flashcards generate ho rahe hain..." />
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
              <EmptyState emoji="🃏" text='Upar "Flashcards" button dabao!' />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toolbar (bold/italic helpers) ────────────────────────────────────────────
function Toolbar({ onBold, onItalic }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {[
        { label: 'B', title: 'Bold (**text**)',   style: { fontWeight: 700 }, onClick: () => insertAtCursor('**', '**') },
        { label: 'I', title: 'Italic (_text_)',   style: { fontStyle: 'italic' }, onClick: () => insertAtCursor('_', '_') },
        { label: 'H', title: 'Heading (# text)',  style: { fontWeight: 700 }, onClick: () => insertAtCursor('# ', '') },
        { label: '—', title: 'Divider',           style: {}, onClick: () => insertAtCursor('\n---\n', '') },
        { label: '•', title: 'Bullet point',      style: {}, onClick: () => insertAtCursor('\n• ', '') },
      ].map(btn => (
        <button key={btn.label} title={btn.title} onClick={btn.onClick} style={{
          background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6,
          padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: '#374151',
          ...btn.style,
        }}>
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
  // trigger React onChange
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
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, opacity: 0.7, letterSpacing: 1 }}>
        {flipped ? '✅ ANSWER' : `❓ QUESTION ${index + 1}`}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.7 }}>
        {flipped ? answer : question}
      </div>
      <div style={{ fontSize: 11, marginTop: 14, opacity: 0.55 }}>
        {flipped ? '↩ Click to see question' : '👆 Click to reveal answer'}
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function LoadingCard({ emoji, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
      <p style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 0', color: '#6b7280',
      background: '#f9fafb', borderRadius: 16, border: '1px dashed #e5e7eb',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
      <p style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}