import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  Star,
  Trash2,
  FolderOpen,
  Plus,
  Search,
  LogOut,
  Pin,
  Sparkles,
  BookOpen,
  Share2,
  Zap,
  RotateCcw,
  X,
  Upload,
  ChevronRight,
  ChevronDown,
  Home,
  Hash,
  MoreHorizontal,
  Edit3,
  AlignLeft,
  Clock,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import API from "../api/axios";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F7F5",
  sidebar: "#FBFBF9",
  sidebarBorder: "#EBEBEA",
  white: "#FFFFFF",
  text: "#1A1A19",
  textMid: "#555553",
  textMuted: "#9B9B99",
  textFaint: "#C5C5C3",
  accent: "#2F7D52",
  accentLight: "#EBF5EE",
  accentMid: "#5BA87B",
  accentBorder: "#B8DEC9",
  border: "#EBEBEA",
  borderMid: "#D8D8D6",
  hover: "#F0F0EE",
  selected: "#EBF5EE",
  danger: "#C0392B",
  dangerLight: "#FDECEA",
  amber: "#B7791F",
  amberLight: "#FEF3C7",
  purple: "#6D4C8F",
  purpleLight: "#F3EEF8",
  blue: "#1E6DB5",
  blueLight: "#EBF3FC",
};

const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Merriweather:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ds-root {
    font-family: 'Lato', sans-serif;
    background: ${C.bg};
    color: ${C.text};
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.borderMid}; border-radius: 4px; }

  /* ── Sidebar ── */
  .ds-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: ${C.sidebar};
    border-right: 1px solid ${C.sidebarBorder};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.22s ease;
  }
  .ds-sidebar.collapsed { width: 0; border: none; }

  .ds-sidebar-top {
    padding: 16px 14px 12px;
    border-bottom: 1px solid ${C.sidebarBorder};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ds-logo {
    font-family: 'Merriweather', serif;
    font-size: 15px;
    font-weight: 700;
    color: ${C.accent};
    letter-spacing: -0.3px;
  }

  .ds-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${C.textMuted};
    transition: background 0.12s, color 0.12s;
  }
  .ds-icon-btn:hover { background: ${C.hover}; color: ${C.text}; }
  .ds-icon-btn.danger:hover { background: ${C.dangerLight}; color: ${C.danger}; }

  .ds-user-row {
    padding: 10px 14px;
    border-bottom: 1px solid ${C.sidebarBorder};
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .ds-avatar {
    width: 26px; height: 26px;
    border-radius: 6px;
    background: ${C.accentLight};
    border: 1.5px solid ${C.accentBorder};
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: ${C.accent};
    flex-shrink: 0;
  }
  .ds-user-name { font-size: 13px; font-weight: 700; color: ${C.text}; }
  .ds-user-sub  { font-size: 11px; color: ${C.textMuted}; }

  /* ── Sidebar nav ── */
  .ds-sidebar-scroll { flex: 1; overflow-y: auto; padding: 10px 8px; }

  .ds-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
    color: ${C.textFaint}; text-transform: uppercase;
    padding: 6px 8px 4px;
    margin-top: 4px;
  }

  .ds-nav-btn {
    width: 100%;
    background: none; border: none; cursor: pointer;
    padding: 6px 8px;
    border-radius: 6px;
    display: flex; align-items: center; gap: 7px;
    font-family: 'Lato', sans-serif;
    font-size: 13.5px;
    color: ${C.textMid};
    text-align: left;
    transition: background 0.12s, color 0.12s;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ds-nav-btn:hover  { background: ${C.hover}; color: ${C.text}; }
  .ds-nav-btn.active { background: ${C.selected}; color: ${C.accent}; font-weight: 700; }
  .ds-nav-btn .count {
    margin-left: auto;
    font-size: 11px; color: ${C.textFaint};
    background: ${C.hover};
    padding: 1px 6px; border-radius: 99px;
    flex-shrink: 0;
  }
  .ds-nav-btn.active .count { background: ${C.accentBorder}; color: ${C.accent}; }

  .ds-folder-row {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 8px; border-radius: 6px; cursor: pointer;
    font-size: 13px; color: ${C.textMid};
    transition: background 0.12s;
  }
  .ds-folder-row:hover { background: ${C.hover}; color: ${C.text}; }
  .ds-folder-row.active { background: ${C.selected}; color: ${C.accent}; }

  .ds-new-note-btn {
    margin: 10px 8px 8px;
    padding: 8px 12px;
    border-radius: 8px;
    background: ${C.accent};
    color: #fff;
    border: none; cursor: pointer;
    font-family: 'Lato', sans-serif;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; gap: 7px;
    transition: background 0.15s;
    width: calc(100% - 16px);
  }
  .ds-new-note-btn:hover { background: #25673E; }

  .ds-sidebar-footer {
    padding: 10px 8px;
    border-top: 1px solid ${C.sidebarBorder};
    display: flex; flex-direction: column; gap: 2px;
  }

  /* ── Notes list panel ── */
  .ds-list-panel {
    width: 280px; flex-shrink: 0;
    background: ${C.white};
    border-right: 1px solid ${C.border};
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .ds-list-header {
    padding: 14px 16px 10px;
    border-bottom: 1px solid ${C.border};
  }
  .ds-list-title {
    font-family: 'Merriweather', serif;
    font-size: 16px; font-weight: 700;
    color: ${C.text}; margin-bottom: 10px;
  }

  .ds-search-wrap {
    position: relative;
  }
  .ds-search-wrap svg {
    position: absolute; left: 10px; top: 50%;
    transform: translateY(-50%);
    color: ${C.textFaint};
  }
  .ds-search {
    width: 100%;
    padding: 7px 10px 7px 32px;
    border-radius: 7px;
    border: 1px solid ${C.border};
    background: ${C.bg};
    font-family: 'Lato', sans-serif;
    font-size: 13px; color: ${C.text};
    transition: border-color 0.15s;
  }
  .ds-search:focus { outline: none; border-color: ${C.accentMid}; }
  .ds-search::placeholder { color: ${C.textFaint}; }

  .ds-notes-scroll {
    flex: 1; overflow-y: auto;
    padding: 8px;
    display: flex; flex-direction: column; gap: 1px;
  }

  .ds-note-item {
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s;
    border: 1px solid transparent;
  }
  .ds-note-item:hover { background: ${C.hover}; }
  .ds-note-item.selected { background: ${C.selected}; border-color: ${C.accentBorder}; }
  .ds-note-item:hover .ds-note-actions { opacity: 1; }

  .ds-note-item-title {
    font-size: 13.5px; font-weight: 700;
    color: ${C.text};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .ds-note-item.selected .ds-note-item-title { color: ${C.accent}; }

  .ds-note-item-preview {
    font-size: 12px; color: ${C.textMuted};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.5; margin-bottom: 6px;
  }

  .ds-note-meta {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  }
  .ds-note-time {
    font-size: 11px; color: ${C.textFaint};
  }
  .ds-tag {
    font-size: 10px; padding: 1px 7px;
    border-radius: 99px; font-weight: 700;
  }
  .ds-tag.folder { background: ${C.purpleLight}; color: ${C.purple}; }
  .ds-tag.note   { background: ${C.blueLight};   color: ${C.blue};   }

  .ds-note-actions {
    opacity: 0; display: flex; gap: 2px;
    margin-left: auto; flex-shrink: 0;
  }

  /* ── Main area ── */
  .ds-main {
    flex: 1; overflow: hidden;
    display: flex; flex-direction: column;
  }

  .ds-topbar {
    height: 48px;
    border-bottom: 1px solid ${C.border};
    display: flex; align-items: center;
    padding: 0 16px; gap: 10px;
    background: ${C.white};
    flex-shrink: 0;
  }
  .ds-topbar-title {
    font-size: 14px; font-weight: 700; color: ${C.text};
    flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ds-topbar-actions { display: flex; align-items: center; gap: 6px; }

  .ds-action-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 6px;
    font-family: 'Lato', sans-serif;
    font-size: 12px; font-weight: 700; cursor: pointer;
    border: 1px solid ${C.border};
    background: ${C.white}; color: ${C.textMid};
    transition: all 0.12s;
    white-space: nowrap;
  }
  .ds-action-btn:hover { background: ${C.hover}; color: ${C.text}; border-color: ${C.borderMid}; }
  .ds-action-btn.accent { background: ${C.accent}; color: #fff; border-color: ${C.accent}; }
  .ds-action-btn.accent:hover { background: #25673E; }
  .ds-action-btn.ai    { background: ${C.purpleLight}; color: ${C.purple}; border-color: #D8C8EC; }
  .ds-action-btn.ai:hover { background: #EAE0F5; }
  .ds-action-btn.flash { background: ${C.amberLight}; color: ${C.amber}; border-color: #F6D87A; }
  .ds-action-btn.flash:hover { background: #FDE68A; }
  .ds-action-btn.del   { background: ${C.dangerLight}; color: ${C.danger}; border-color: #F5BDB8; }
  .ds-action-btn.del:hover { background: #FBDAD8; }

  /* ── Editor ── */
  .ds-editor-wrap { flex: 1; overflow-y: auto; padding: 40px 56px; }
  @media (max-width: 900px) { .ds-editor-wrap { padding: 28px 24px; } }

  .ds-editor-title {
    font-family: 'Merriweather', serif;
    font-size: 28px; font-weight: 700;
    color: ${C.text}; border: none; background: transparent;
    width: 100%; margin-bottom: 6px; line-height: 1.3;
    resize: none;
  }
  .ds-editor-title:focus { outline: none; }
  .ds-editor-title::placeholder { color: ${C.textFaint}; }

  .ds-editor-divider {
    height: 1px; background: ${C.border};
    margin: 14px 0 22px;
  }

  .ds-editor-body {
    font-family: 'Lato', sans-serif;
    font-size: 15.5px; line-height: 1.85;
    color: ${C.textMid};
    border: none; background: transparent;
    width: 100%; resize: none; min-height: 55vh;
    display: block;
  }
  .ds-editor-body:focus { outline: none; }
  .ds-editor-body::placeholder { color: ${C.textFaint}; }

  .ds-statusbar {
    height: 32px; border-top: 1px solid ${C.border};
    display: flex; align-items: center; padding: 0 20px; gap: 20px;
    background: ${C.white}; flex-shrink: 0;
  }
  .ds-statusbar span {
    font-size: 11px; color: ${C.textFaint};
    display: flex; align-items: center; gap: 4px;
  }
  .ds-status-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: ${C.accentMid};
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* ── Dashboard home ── */
  .ds-home-wrap { flex: 1; overflow-y: auto; padding: 36px 48px; }
  @media (max-width: 900px) { .ds-home-wrap { padding: 24px 20px; } }

  .ds-home-greeting {
    font-family: 'Merriweather', serif;
    font-size: 22px; font-weight: 700;
    color: ${C.text}; margin-bottom: 4px;
  }
  .ds-home-sub { font-size: 14px; color: ${C.textMuted}; margin-bottom: 28px; }

  .ds-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px; margin-bottom: 32px;
  }
  .ds-stat-card {
    background: ${C.white};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 16px 18px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .ds-stat-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 6px;
  }
  .ds-stat-val {
    font-family: 'Merriweather', serif;
    font-size: 22px; font-weight: 700; line-height: 1;
  }
  .ds-stat-label { font-size: 11px; color: ${C.textMuted}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

  .ds-section-title {
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px;
    color: ${C.textFaint}; margin-bottom: 10px;
  }

  .ds-quick-actions {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-bottom: 32px;
  }

  .ds-recent-list { display: flex; flex-direction: column; gap: 2px; }
  .ds-recent-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-radius: 8px; cursor: pointer;
    transition: background 0.12s;
    border: 1px solid transparent;
  }
  .ds-recent-item:hover { background: ${C.white}; border-color: ${C.border}; }
  .ds-recent-icon {
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ds-recent-title { font-size: 13.5px; font-weight: 700; color: ${C.text}; }
  .ds-recent-meta  { font-size: 11px; color: ${C.textMuted}; margin-top: 1px; }

  /* ── Empty state ── */
  .ds-empty {
    text-align: center; padding: 56px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .ds-empty-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: ${C.accentLight};
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
  }
  .ds-empty-title { font-size: 14px; font-weight: 700; color: ${C.text}; }
  .ds-empty-sub   { font-size: 13px; color: ${C.textMuted}; }

  /* ── Folder new form ── */
  .ds-inline-input {
    width: 100%; padding: 5px 8px;
    border: 1px solid ${C.accentBorder};
    border-radius: 6px;
    font-family: 'Lato', sans-serif; font-size: 13px;
    color: ${C.text}; background: ${C.white};
    margin: 4px 0 6px;
  }
  .ds-inline-input:focus { outline: none; border-color: ${C.accent}; }

  /* ── Spinner ── */
  .ds-spinner {
    width: 28px; height: 28px;
    border: 2px solid ${C.accentLight};
    border-top-color: ${C.accent};
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Mobile top bar ── */
  .ds-mobile-bar {
    display: none; height: 48px;
    align-items: center; padding: 0 14px; gap: 10px;
    border-bottom: 1px solid ${C.border};
    background: ${C.white};
  }
  @media (max-width: 768px) {
    .ds-sidebar { position: absolute; z-index: 100; height: 100vh; box-shadow: 4px 0 20px rgba(0,0,0,.08); }
    .ds-sidebar.collapsed { width: 0; }
    .ds-mobile-bar { display: flex; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000),
    h = Math.floor(diff / 3600000),
    d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

const wordCount = (text) =>
  text ? text.split(/\s+/).filter(Boolean).length : 0;

// ─── Note list item ───────────────────────────────────────────────────────────
function NoteItem({ note, isSelected, onClick, onStar, onTrash, onRestore }) {
  return (
    <div
      className={`ds-note-item${isSelected ? " selected" : ""}`}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ds-note-item-title">
            {note.isPinned && (
              <Pin
                size={10}
                style={{ display: "inline", marginRight: 4, color: C.amber }}
              />
            )}
            {note.isStarred && (
              <Star
                size={10}
                style={{ display: "inline", marginRight: 4, color: C.amber }}
                fill={C.amber}
              />
            )}
            {note.title || "Untitled"}
          </div>
          <div className="ds-note-item-preview">
            {note.plainText || note.content || "No content"}
          </div>
          <div className="ds-note-meta">
            <span className="ds-note-time">
              <Clock size={10} style={{ display: "inline", marginRight: 2 }} />
              {timeAgo(note.updatedAt)}
            </span>
            {note.folder?.name && (
              <span className="ds-tag folder">{note.folder.name}</span>
            )}
            {note.tags?.slice(0, 1).map((t) => (
              <span key={t} className="ds-tag note">
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="ds-note-actions">
          {!note.isTrashed ? (
            <>
              <button
                className="ds-icon-btn"
                onClick={onStar}
                title="Star"
                style={{ padding: 3 }}
              >
                <Star
                  size={12}
                  fill={note.isStarred ? C.amber : "none"}
                  color={note.isStarred ? C.amber : C.textMuted}
                />
              </button>
              <button
                className="ds-icon-btn danger"
                onClick={onTrash}
                title="Delete"
                style={{ padding: 3 }}
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : (
            <button
              className="ds-icon-btn"
              onClick={onRestore}
              title="Restore"
              style={{ padding: 3 }}
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, bg, color }) {
  return (
    <div className="ds-stat-card">
      <div className="ds-stat-icon" style={{ background: bg }}>
        <Icon size={16} color={color} />
      </div>
      <div className="ds-stat-val" style={{ color }}>
        {value ?? "—"}
      </div>
      <div className="ds-stat-label">{label}</div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeFolder, setActiveFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [stats, setStats] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saveTimer, setSaveTimer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);

  const textareaRef = useRef(null);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editContent]);

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [userRes, notesRes, foldersRes, dashRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/notes"),
        API.get("/folders"),
        API.get("/dashboard/stats"),
      ]);
      setUser(userRes.data);
      setNotes(notesRes.data);
      setFolders(foldersRes.data);
      setStats(dashRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedNote || !showEditor) return;
    if (saveTimer) clearTimeout(saveTimer);
    const t = setTimeout(async () => {
      try {
        await API.patch(`/notes/${selectedNote._id}`, {
          title: editTitle,
          content: editContent,
        });
        setNotes((p) =>
          p.map((n) =>
            n._id === selectedNote._id
              ? {
                  ...n,
                  title: editTitle,
                  content: editContent,
                  plainText: editContent,
                  updatedAt: new Date(),
                }
              : n,
          ),
        );
      } catch {
        /* silent */
      }
    }, 1200);
    setSaveTimer(t);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, editContent]);

  const openNote = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title || "");
    setEditContent(note.plainText || note.content || "");
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedNote(null);
  };

  // ── Note actions ──────────────────────────────────────────────────────────
  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", {
        title: "Untitled",
        content: "",
      });
      setNotes((p) => [data, ...p]);
      openNote(data);
      toast.success("Note created");
    } catch {
      toast.error("Failed to create note");
    }
  };

  const handleTrash = async (id, e) => {
    e?.stopPropagation();
    try {
      await API.patch(`/notes/${id}/trash`);
      setNotes((p) =>
        p.map((n) => (n._id === id ? { ...n, isTrashed: !n.isTrashed } : n)),
      );
      if (selectedNote?._id === id) closeEditor();
      toast.success("Moved to trash");
    } catch {
      toast.error("Failed");
    }
  };

  const handleRestore = async (id, e) => {
    e?.stopPropagation();
    try {
      await API.patch(`/notes/${id}/restore`);
      setNotes((p) =>
        p.map((n) => (n._id === id ? { ...n, isTrashed: false } : n)),
      );
      toast.success("Restored");
    } catch {
      toast.error("Failed");
    }
  };

  const handleStar = async (id, e) => {
    e?.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${id}/star`);
      setNotes((p) =>
        p.map((n) => (n._id === id ? { ...n, isStarred: data.isStarred } : n)),
      );
    } catch {
      toast.error("Failed");
    }
  };

  const handleShare = async (id, e) => {
    e?.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${id}/share`);
      await navigator.clipboard.writeText(
        `${window.location.origin}/shared/${data.shareToken}`,
      );
      toast.success("Share link copied!");
    } catch {
      toast.error("Failed");
    }
  };

  const handleAISummary = async () => {
    if (!selectedNote) return;
    setAiLoading(true);
    try {
      const { data } = await API.post(`/ai/summarize/${selectedNote._id}`);
      setEditContent((prev) => prev + "\n\n---\nAI Summary\n" + data.summary);
      toast.success("Summary added!");
    } catch {
      toast.error("AI summary failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFlashcards = async () => {
    if (!selectedNote) return;
    setAiLoading(true);
    try {
      await API.post(`/ai/flashcards/${selectedNote._id}`);
      toast.success("Flashcards generated!");
    } catch {
      toast.error("Failed");
    } finally {
      setAiLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const { data } = await API.post("/folders", { name: newFolderName });
      setFolders((p) => [...p, data]);
      setNewFolderName("");
      setShowNewFolder(false);
      toast.success("Folder created");
    } catch {
      toast.error("Failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredNotes = notes.filter((note) => {
    if (note.isTrashed && activeFilter !== "trash") return false;
    if (!note.isTrashed && activeFilter === "trash") return false;
    if (activeFilter === "starred" && !note.isStarred) return false;
    if (activeFilter === "pinned" && !note.isPinned) return false;
    if (
      activeFolder &&
      note.folder?._id !== activeFolder &&
      note.folder !== activeFolder
    )
      return false;
    if (searchQuery)
      return (
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return true;
  });

  const activeFolderName = activeFolder
    ? folders.find((f) => f._id === activeFolder)?.name
    : null;
  const listTitle =
    activeFilter === "trash"
      ? "Trash"
      : activeFilter === "starred"
        ? "Starred"
        : activeFilter === "pinned"
          ? "Pinned"
          : activeFolderName
            ? activeFolderName
            : "All notes";

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading)
    return (
      <>
        <style>{DASH_CSS}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            flexDirection: "column",
            gap: 14,
            background: C.bg,
          }}
        >
          <div className="ds-spinner" />
          <span
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Loading your notes…
          </span>
        </div>
      </>
    );

  const navItems = [
    {
      key: "all",
      icon: AlignLeft,
      label: "All notes",
      count: notes.filter((n) => !n.isTrashed).length,
    },
    {
      key: "starred",
      icon: Star,
      label: "Starred",
      count: notes.filter((n) => n.isStarred && !n.isTrashed).length,
    },
    {
      key: "pinned",
      icon: Pin,
      label: "Pinned",
      count: notes.filter((n) => n.isPinned && !n.isTrashed).length,
    },
    {
      key: "trash",
      icon: Trash2,
      label: "Trash",
      count: notes.filter((n) => n.isTrashed).length,
    },
  ];

  return (
    <>
      <style>{DASH_CSS}</style>
      <div className="ds-root">
        {/* ── SIDEBAR ── */}
        <aside className={`ds-sidebar${sidebarOpen ? "" : " collapsed"}`}>
          {/* Logo + toggle */}
          <div className="ds-sidebar-top">
            <span className="ds-logo">YourNotes</span>
            <button
              className="ds-icon-btn"
              onClick={() => setSidebarOpen(false)}
              title="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>

          {/* User */}
          {user && (
            <div className="ds-user-row">
              <div className="ds-avatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="ds-user-name">{user.name}</div>
                <div className="ds-user-sub">{stats.totalNotes || 0} notes</div>
              </div>
            </div>
          )}

          {/* New note button */}
          <button className="ds-new-note-btn" onClick={createNote}>
            <Plus size={14} /> New note
          </button>

          {/* Nav */}
          <div className="ds-sidebar-scroll">
            <div className="ds-section-label">Navigation</div>
            {navItems.map(({ key, icon: Icon, label, count }) => (
              <button
                key={key}
                className={`ds-nav-btn${activeFilter === key && !activeFolder ? " active" : ""}`}
                onClick={() => {
                  setActiveFilter(key);
                  setActiveFolder(null);
                }}
              >
                <Icon size={14} />
                {label}
                {count > 0 && <span className="count">{count}</span>}
              </button>
            ))}

            {/* Folders */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
                onClick={() => setFoldersOpen((v) => !v)}
              >
                <div className="ds-section-label" style={{ margin: 0 }}>
                  Folders
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button
                    className="ds-icon-btn"
                    style={{ padding: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewFolder((v) => !v);
                    }}
                    title="Add folder"
                  >
                    <Plus size={12} />
                  </button>
                  {foldersOpen ? (
                    <ChevronDown size={12} color={C.textFaint} />
                  ) : (
                    <ChevronRight size={12} color={C.textFaint} />
                  )}
                </div>
              </div>

              {showNewFolder && (
                <div style={{ padding: "0 8px" }}>
                  <input
                    className="ds-inline-input"
                    placeholder="Folder name…"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createFolder();
                      if (e.key === "Escape") setShowNewFolder(false);
                    }}
                    autoFocus
                  />
                </div>
              )}

              {foldersOpen &&
                folders.map((f) => (
                  <div
                    key={f._id}
                    className={`ds-folder-row${activeFolder === f._id ? " active" : ""}`}
                    onClick={() => {
                      setActiveFolder(f._id);
                      setActiveFilter("all");
                    }}
                  >
                    <FolderOpen size={13} />
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 13,
                      }}
                    >
                      {f.name}
                    </span>
                    <span style={{ fontSize: 11, color: C.textFaint }}>
                      {
                        notes.filter(
                          (n) =>
                            !n.isTrashed &&
                            (n.folder?._id === f._id || n.folder === f._id),
                        ).length
                      }
                    </span>
                  </div>
                ))}

              {foldersOpen && folders.length === 0 && !showNewFolder && (
                <div
                  style={{
                    padding: "6px 8px",
                    fontSize: 12,
                    color: C.textFaint,
                  }}
                >
                  No folders yet
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="ds-sidebar-footer">
            <button
              className="ds-nav-btn"
              onClick={() => navigate("/flashcards")}
            >
              <Zap size={14} color={C.amber} /> Review flashcards
            </button>
            <button
              className="ds-nav-btn"
              onClick={handleLogout}
              style={{ color: C.danger }}
            >
              <LogOut size={14} color={C.danger} /> Log out
            </button>
          </div>
        </aside>

        {/* ── NOTES LIST PANEL ── */}
        <div className="ds-list-panel">
          <div className="ds-list-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {!sidebarOpen && (
                <button
                  className="ds-icon-btn"
                  onClick={() => setSidebarOpen(true)}
                  title="Open sidebar"
                >
                  <PanelLeft size={15} />
                </button>
              )}
              <div className="ds-list-title">{listTitle}</div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: C.textFaint,
                  background: C.hover,
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontWeight: 700,
                }}
              >
                {filteredNotes.length}
              </span>
            </div>
            <div className="ds-search-wrap">
              <Search size={13} />
              <input
                className="ds-search"
                placeholder="Search notes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="ds-notes-scroll">
            {filteredNotes.length === 0 ? (
              <div className="ds-empty">
                <div className="ds-empty-icon">
                  <Edit3 size={22} color={C.accent} />
                </div>
                <div className="ds-empty-title">Nothing here</div>
                <div className="ds-empty-sub">
                  {activeFilter === "all"
                    ? "Create your first note →"
                    : "No notes in this view"}
                </div>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteItem
                  key={note._id}
                  note={note}
                  isSelected={selectedNote?._id === note._id}
                  onClick={() => openNote(note)}
                  onStar={(e) => handleStar(note._id, e)}
                  onTrash={(e) => handleTrash(note._id, e)}
                  onRestore={(e) => handleRestore(note._id, e)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── MAIN AREA ── */}
        <div className="ds-main">
          {showEditor && selectedNote ? (
            <>
              {/* Editor topbar */}
              <div className="ds-topbar">
                <FileText
                  size={14}
                  color={C.textMuted}
                  style={{ flexShrink: 0 }}
                />
                <span className="ds-topbar-title">
                  {editTitle || "Untitled"}
                </span>
                <div className="ds-topbar-actions">
                  <button
                    className="ds-action-btn ai"
                    onClick={handleAISummary}
                    disabled={aiLoading}
                  >
                    <Sparkles size={12} />{" "}
                    {aiLoading ? "Working…" : "AI Summary"}
                  </button>
                  <button
                    className="ds-action-btn flash"
                    onClick={handleFlashcards}
                    disabled={aiLoading}
                  >
                    <BookOpen size={12} /> Flashcards
                  </button>
                  <button
                    className="ds-action-btn"
                    onClick={(e) => handleShare(selectedNote._id, e)}
                  >
                    <Share2 size={12} /> Share
                  </button>
                  <button
                    className="ds-action-btn"
                    onClick={(e) => handleStar(selectedNote._id, e)}
                  >
                    <Star
                      size={12}
                      fill={selectedNote.isStarred ? C.amber : "none"}
                      color={C.amber}
                    />
                  </button>
                  <button
                    className="ds-action-btn del"
                    onClick={(e) => handleTrash(selectedNote._id, e)}
                  >
                    <Trash2 size={12} />
                  </button>
                  <button className="ds-icon-btn" onClick={closeEditor}>
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Editor body */}
              <div className="ds-editor-wrap">
                <input
                  className="ds-editor-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title…"
                />
                <div className="ds-editor-divider" />
                <textarea
                  ref={textareaRef}
                  className="ds-editor-body"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start writing your note here…"
                />
              </div>

              {/* Status bar */}
              <div className="ds-statusbar">
                <span>
                  <div className="ds-status-dot" /> Saved
                </span>
                <span>{wordCount(editContent)} words</span>
                <span>{editContent.length} characters</span>
              </div>
            </>
          ) : (
            /* ── Dashboard home ── */
            <>
              <div className="ds-topbar">
                {!sidebarOpen && (
                  <button
                    className="ds-icon-btn"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <PanelLeft size={15} />
                  </button>
                )}
                <span className="ds-topbar-title">Dashboard</span>
                <button className="ds-action-btn accent" onClick={createNote}>
                  <Plus size={13} /> New note
                </button>
              </div>

              <div className="ds-home-wrap">
                <div className="ds-home-greeting">
                  Hello, {user?.name?.split(" ")[0] || "there"} 👋
                </div>
                <div className="ds-home-sub">
                  Here's a quick look at your notes today.
                </div>

                {/* Stats */}
                <div className="ds-stats-grid">
                  <StatCard
                    icon={FileText}
                    label="Total notes"
                    value={stats.totalNotes}
                    bg={C.accentLight}
                    color={C.accent}
                  />
                  <StatCard
                    icon={FolderOpen}
                    label="Folders"
                    value={stats.totalFolders}
                    bg={C.purpleLight}
                    color={C.purple}
                  />
                  <StatCard
                    icon={Sparkles}
                    label="AI summaries"
                    value={stats.aiSummaries}
                    bg={C.amberLight}
                    color={C.amber}
                  />
                  <StatCard
                    icon={BookOpen}
                    label="Cards due"
                    value={stats.flashcardsDue}
                    bg={C.blueLight}
                    color={C.blue}
                  />
                </div>

                {/* Quick actions */}
                <div className="ds-section-title">Quick actions</div>
                <div className="ds-quick-actions">
                  <button className="ds-action-btn accent" onClick={createNote}>
                    <Plus size={13} /> New note
                  </button>
                  <button
                    className="ds-action-btn flash"
                    onClick={() => navigate("/flashcards")}
                  >
                    <Zap size={13} /> Review flashcards
                  </button>
                  <button
                    className="ds-action-btn"
                    onClick={() => {
                      setActiveFilter("starred");
                      setActiveFolder(null);
                    }}
                  >
                    <Star size={13} /> Starred notes
                  </button>
                </div>

                {/* Recent notes */}
                <div className="ds-section-title">Recent notes</div>
                <div className="ds-recent-list">
                  {notes
                    .filter((n) => !n.isTrashed)
                    .slice(0, 6)
                    .map((note) => (
                      <div
                        key={note._id}
                        className="ds-recent-item"
                        onClick={() => openNote(note)}
                      >
                        <div
                          className="ds-recent-icon"
                          style={{ background: C.accentLight }}
                        >
                          <FileText size={16} color={C.accent} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="ds-recent-title"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {note.title || "Untitled"}
                          </div>
                          <div className="ds-recent-meta">
                            {timeAgo(note.updatedAt)}
                            {note.folder?.name && ` · ${note.folder.name}`}
                          </div>
                        </div>
                        {note.isStarred && (
                          <Star size={13} color={C.amber} fill={C.amber} />
                        )}
                        <ChevronRight size={14} color={C.textFaint} />
                      </div>
                    ))}
                  {notes.filter((n) => !n.isTrashed).length === 0 && (
                    <div className="ds-empty">
                      <div className="ds-empty-icon">
                        <Edit3 size={22} color={C.accent} />
                      </div>
                      <div className="ds-empty-title">No notes yet</div>
                      <div className="ds-empty-sub">
                        Click "New note" to get started
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
