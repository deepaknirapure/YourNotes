import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect, useCallback, useRef } from 'react';
// FIX: was using direct axios with hardcoded localhost:8000 URL
// Now using the shared API instance which reads REACT_APP_API_URL env variable
import API from '../api/axios';

export default function NoteEditor({ note, onUpdate, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState(note?.aiSummary || '');
  const [loadingAI, setLoadingAI] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab] = useState('write');

  // FIX: Use ref to store latest title so debounce closure doesn't go stale
  const titleRef = useRef(title);
  useEffect(() => { titleRef.current = title; }, [title]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Apne notes yahan likho...' })
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML(), editor.getText());
    }
  });

  // FIX: Stable debounced save using ref for title (avoids stale closure bug)
  const debouncedSave = useCallback(
    debounce(async (content, plainText) => {
      if (!note?._id) return;
      setSaving(true);
      try {
        const res = await API.put(`/notes/${note._id}`, {
          title: titleRef.current,
          content,
          plainText,
        });
        onUpdate && onUpdate(res.data);
      } catch (e) { console.error('Auto-save failed:', e); }
      setSaving(false);
    }, 1500),
    [note?._id] // only recreate if note changes
  );

  // FIX: Added note._id to dependency array (was missing — could skip save on note switch)
  useEffect(() => {
    if (!note?._id || !title) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await API.put(`/notes/${note._id}`, { title });
      } catch (e) { console.error('Title save failed:', e); }
      setSaving(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, note?._id]);

  const handleSummarize = async () => {
    setLoadingAI(true);
    setActiveTab('summary');
    try {
      const res = await API.post(`/ai/summarize/${note._id}`, {});
      setAiSummary(res.data.summary);
    } catch (e) {
      setAiSummary('Error: Note mein kam se kam 50 characters hone chahiye!');
    }
    setLoadingAI(false);
  };

  const handleFlashcards = async () => {
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

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#fff', flex: 1
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            cursor: 'pointer', color: '#6b7280'
          }}>←</button>
          <span style={{ fontSize: 13, color: saving ? '#f59e0b' : '#10b981' }}>
            {saving ? '⏳ Saving...' : '✅ Saved'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSummarize} style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            🤖 AI Summary
          </button>
          <button onClick={handleFlashcards} style={{
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            🃏 Flashcards
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        {['write', 'summary', 'flashcards'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', background: 'none',
            cursor: 'pointer', fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? '#4F46E5' : '#6b7280',
            borderBottom: activeTab === tab ? '2px solid #4F46E5' : '2px solid transparent',
            textTransform: 'capitalize', fontSize: 14
          }}>
            {tab === 'write' ? '✏️ Write' : tab === 'summary' ? '📝 Summary' : '🃏 Flashcards'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {activeTab === 'write' && (
          <>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note ka title..."
              style={{
                width: '100%', fontSize: 28, fontWeight: 700,
                border: 'none', outline: 'none', marginBottom: 16,
                color: '#1f2937', background: 'transparent'
              }}
            />
            <EditorContent editor={editor} style={{ minHeight: 400, fontSize: 16, lineHeight: 1.8 }} />
          </>
        )}

        {activeTab === 'summary' && (
          <div>
            <h3 style={{ color: '#4F46E5', marginBottom: 16 }}>🤖 AI Generated Summary</h3>
            {loadingAI ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                <div style={{ fontSize: 40 }}>🤖</div>
                <p>AI summary generate kar raha hai...</p>
              </div>
            ) : aiSummary ? (
              <div style={{
                background: '#f5f3ff', borderRadius: 12, padding: 20,
                lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap'
              }}>
                {aiSummary}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                <p>Pehle "AI Summary" button dabao!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div>
            <h3 style={{ color: '#4F46E5', marginBottom: 16 }}>🃏 Flashcards</h3>
            {loadingAI ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                <div style={{ fontSize: 40 }}>🃏</div>
                <p>Flashcards generate ho rahe hain...</p>
              </div>
            ) : flashcards.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {flashcards.map((fc, i) => (
                  <FlashCard key={i} question={fc.question} answer={fc.answer} index={i} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                <p>Pehle "Flashcards" button dabao!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FlashCard({ question, answer, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(!flipped)} style={{
      background: flipped ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f9fafb',
      borderRadius: 12, padding: 24, cursor: 'pointer',
      border: '1px solid #e5e7eb', transition: 'all 0.3s',
      color: flipped ? '#fff' : '#1f2937'
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>
        {flipped ? '✅ ANSWER' : `❓ Q${index + 1}`}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.6 }}>
        {flipped ? answer : question}
      </div>
      <div style={{ fontSize: 12, marginTop: 12, opacity: 0.6 }}>
        {flipped ? '(Click to see question)' : '(Click to reveal answer)'}
      </div>
    </div>
  );
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}