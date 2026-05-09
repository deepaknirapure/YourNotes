import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2, Menu, FilePlus, Globe, Lock,
  CheckCircle2, X, ArrowLeft, FolderOpen, Pin, PinOff,
  Tag, Upload, Palette, Heart, ChevronDown, StickyNote,
  Hash, Layers, FileText, Clock, NotebookPen, MoreVertical,
  Filter, LayoutGrid, List
} from "lucide-react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useTheme } from "../context/ThemeContext";

// --- Design System ---
const THEME_CONSTANTS = {
  radius: '10px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

const getGlobalStyles = (isDark) => `
  :root {
    --brand-primary: #6366f1;
    --brand-secondary: #4f46e5;
    --surface-higher: ${isDark ? '#1e293b' : '#ffffff'};
    --surface-lower: ${isDark ? '#0f172a' : '#f8fafc'};
    --border-subtle: ${isDark ? '#334155' : '#e2e8f0'};
    --text-main: ${isDark ? '#f1f5f9' : '#0f172a'};
    --text-subtle: ${isDark ? '#94a3b8' : '#64748b'};
  }

  .app-container {
    display: flex;
    height: 100vh;
    background: var(--surface-lower);
    color: var(--text-main);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* Professional Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 10px; }

  /* Header Design */
  .main-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    background: var(--surface-higher);
    border-bottom: 1px solid var(--border-subtle);
    backdrop-filter: blur(8px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .search-wrapper {
    position: relative;
    width: 100%;
    max-width: 400px;
  }
  .search-input {
    width: 100%;
    background: var(--surface-lower);
    border: 1px solid var(--border-subtle);
    padding: 8px 16px 8px 40px;
    border-radius: 8px;
    color: var(--text-main);
    transition: ${THEME_CONSTANTS.transition};
  }
  .search-input:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  /* Grid Layout */
  .notes-view-container {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 24px;
  }

  /* Minimal Card Design */
  .pro-card {
    background: var(--surface-higher);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: ${THEME_CONSTANTS.transition};
    position: relative;
    cursor: pointer;
  }
  .pro-card:hover {
    border-color: var(--brand-primary);
    transform: translateY(-4px);
    box-shadow: ${THEME_CONSTANTS.shadow};
  }
  .pro-card.selected {
    border-color: var(--brand-primary);
    background: ${isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)'};
  }

  .card-category {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: var(--brand-primary);
  }

  .card-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--text-main);
  }

  .card-body {
    font-size: 13px;
    color: var(--text-subtle);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Buttons */
  .btn-primary {
    background: var(--brand-primary);
    color: white;
    padding: 8px 18px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    transition: ${THEME_CONSTANTS.transition};
  }
  .btn-primary:hover {
    background: var(--brand-secondary);
  }

  /* Chip Navigation */
  .filter-nav {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .nav-chip {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    background: var(--surface-higher);
    border: 1px solid var(--border-subtle);
    color: var(--text-subtle);
    cursor: pointer;
    white-space: nowrap;
    transition: ${THEME_CONSTANTS.transition};
  }
  .nav-chip.active {
    background: var(--text-main);
    color: var(--surface-higher);
    border-color: var(--text-main);
  }

  @media (max-width: 768px) {
    .main-header { padding: 0 16px; }
    .notes-view-container { padding: 16px; }
    .search-wrapper { display: none; }
  }
`;

// --- Main Component ---
export default function DashboardPage() {
  const { isDark } = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const navigate = useNavigate();

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/notes');
      setNotes(data || []);
    } catch (e) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtering Logic
  const filteredNotes = notes.filter(n => {
    if (n.isTrashed) return false;
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'starred') return matchesSearch && n.isStarred;
    if (activeFilter === 'pinned') return matchesSearch && n.isPinned;
    return matchesSearch;
  });

  if (selectedNote) {
    return <NoteEditor note={selectedNote} onClose={() => setSelectedNote(null)} />;
  }

  return (
    <div className="app-container">
      <style>{getGlobalStyles(isDark)}</style>
      <Sidebar />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Workspace</h1>
            <div className="search-wrapper">
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                className="search-input" 
                placeholder="Find anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => setSelectedNote({title: '', content: ''})}>
              <Plus size={18} />
              <span>Create Note</span>
            </button>
          </div>
        </header>

        <div className="notes-view-container">
          {/* Section Navigation */}
          <nav className="filter-nav">
            {['all', 'starred', 'pinned', 'archives'].map(f => (
              <button 
                key={f}
                className={`nav-chip ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-subtle)' }}>
              Recent Documents ({filteredNotes.length})
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <LayoutGrid size={18} color="var(--brand-primary)" style={{ cursor: 'pointer' }} />
              <List size={18} color="var(--text-subtle)" style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading your workspace...</div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <CompactNoteCard 
                  key={note._id} 
                  note={note} 
                  onClick={() => setSelectedNote(note)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

// --- Card Component ---
function CompactNoteCard({ note, onClick }) {
  return (
    <div className="pro-card" onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="card-category">{note.tags?.[0] || 'Uncategorized'}</span>
        {note.isPinned && <Pin size={14} color="var(--brand-primary)" fill="var(--brand-primary)" />}
      </div>
      
      <h3 className="card-title">{note.title || 'Untitled'}</h3>
      <p className="card-body">{note.plainText || 'No content provided yet...'}</p>
      
      <div className="card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-subtle)', fontSize: '11px' }}>
          <Clock size={12} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Star size={14} color={note.isStarred ? "#f59e0b" : "var(--text-subtle)"} />
          <MoreVertical size={14} color="var(--text-subtle)" />
        </div>
      </div>
    </div>
  );
}