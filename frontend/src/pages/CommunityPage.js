import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Download, Search, Heart, Clock, TrendingUp, Globe,
  Menu, MessageCircle, Bookmark, X, Send, Upload, FileText,
  CheckSquare, Square, BookOpen, ExternalLink, UserCircle2, ChevronRight
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useTheme } from "../context/ThemeContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes spin    { to { transform: rotate(360deg) } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes pulse   { 0%,100% { transform: scale(1) } 50% { transform: scale(1.2) } }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .pg-wrap  { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); }
  .pg-main  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .pg-topbar {
    height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 28px;
    background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .pg-menu-btn { display: none; background: transparent; border: 1px solid #2a2727; border-radius: 9px; cursor: pointer; padding: 9px; color: var(--text-muted); align-items: center; justify-content: center; }
  .pg-content  { flex: 1; overflow-y: auto; padding: 32px 4vw 60px; scrollbar-width: none; }
  .pg-content::-webkit-scrollbar { display: none; }

  .cm-stats-bar { display: flex; gap: 20px; margin-bottom: 36px; flex-wrap: wrap; }
  .cm-stat-chip { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 20px; flex: 1; min-width: 140px; }
  .cm-stat-chip .sc-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cm-stat-chip .sc-val  { font-size: 22px; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--text); }
  .cm-stat-chip .sc-lbl  { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  .cm-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 14px; flex-wrap: wrap; }
  .cm-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 4px; }
  .cm-tab  { padding: 9px 16px; border: none; border-radius: 9px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.25s; display: flex; align-items: center; gap: 7px; color: var(--text-muted); background: transparent; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; }
  .cm-tab.active { background: #ff5734; color: #fff; }
  .cm-tab:not(.active):hover { color: var(--text); background: var(--bg); }

  .cm-search-wrap { position: relative; display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 0 16px; flex: 1; max-width: 340px; transition: 0.25s; }
  .cm-search-wrap:focus-within { border-color: #ff5734; }
  .cm-search { width: 100%; padding: 11px 10px; background: transparent; border: none; font-size: 13px; font-weight: 500; color: var(--text); outline: none; font-family: 'DM Sans', sans-serif; }
  .cm-search::placeholder { color: var(--text-light); }

  .cm-subject-bar { display: flex; gap: 8px; margin-bottom: 30px; flex-wrap: wrap; align-items: center; }
  .cm-subject-lbl  { font-size: 12px; color: var(--text-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .cm-subject-pill { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: 'Syne', sans-serif; white-space: nowrap; }
  .cm-subject-pill:hover { border-color: #ff5734; color: #ff5734; }
  .cm-subject-pill.active { background: #ff5734; border-color: #ff5734; color: #fff; }

  .btn-share { display: flex; align-items: center; gap: 8px; background: #ff5734; color: #fff; border: none; border-radius: 13px; padding: 10px 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.25s; font-family: 'Syne', sans-serif; white-space: nowrap; }
  .btn-share:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,87,52,0.3); }

  /* ── Card ── */
  .cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .cm-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 22px; animation: fadeUp 0.35s both; transition: 0.25s; display: flex; flex-direction: column; position: relative; cursor: pointer; }
  .cm-card:hover { border-color: #ff5734; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(255,87,52,0.12); }
  .cm-card-rank { position: absolute; top: 16px; right: 16px; font-size: 10px; font-weight: 800; font-family: 'Syne', sans-serif; color: #ff5734; background: rgba(255,87,52,0.1); padding: 3px 9px; border-radius: 6px; letter-spacing: 0.5px; }

  .cm-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

  /* Avatar — real image support */
  .cm-avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #ff5734, #ff8c74);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
    font-family: 'Syne', sans-serif; overflow: hidden; position: relative;
  }
  .cm-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }

  .cm-author-btn { background: none; border: none; padding: 0; cursor: pointer; text-align: left; }
  .cm-author-name { font-size: 14px; font-weight: 700; color: var(--text); transition: color 0.2s; }
  .cm-author-btn:hover .cm-author-name { color: #ff5734; }
  .cm-date { font-size: 11px; color: var(--text-light); font-weight: 500; margin-top: 2px; }

  .cm-card-subject { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,87,52,0.08); color: #ff5734; border: 1px solid rgba(255,87,52,0.15); border-radius: 7px; padding: 3px 10px; font-size: 11px; font-weight: 700; margin-bottom: 10px; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; width: fit-content; }
  .cm-card-title   { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; line-height: 1.35; font-family: 'Syne', sans-serif; }
  .cm-card-preview { font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.65; margin-bottom: 20px; flex: 1; }

  .cm-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border); }
  .cm-act-btn { display: flex; align-items: center; gap: 6px; border: none; border-radius: 9px; padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; background: var(--bg); color: var(--text-muted); font-family: 'DM Sans', sans-serif; }
  .cm-act-btn:hover:not(:disabled) { background: var(--border); color: var(--text); }
  .cm-act-btn.liked  { background: rgba(255,87,52,0.12); color: #ff5734; }
  .cm-act-btn.saved  { background: rgba(255,87,52,0.12); color: #ff5734; }
  .cm-act-btn.dl     { background: #ff5734; color: #fff; }
  .cm-act-btn.dl:hover:not(:disabled) { background: #e84826; color: #fff; }
  .cm-act-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cm-section-hd { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .cm-section-hd h3 { font-size: 14px; font-weight: 800; font-family: 'Syne', sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text); }
  .cm-section-line  { flex: 1; height: 1px; background: var(--bg); }
  .cm-section-count { font-size: 10px; font-weight: 800; font-family: 'Syne', sans-serif; color: #ff5734; background: rgba(255,87,52,0.1); padding: 3px 10px; border-radius: 6px; letter-spacing: 0.5px; }

  .pg-spinner { width: 28px; height: 28px; border: 3px solid #1e1c1c; border-top-color: #ff5734; border-radius: 50%; animation: spin .7s linear infinite; }

  /* ── Note Detail Modal ── */
  .nd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s both; backdrop-filter: blur(6px); padding: 20px; }
  .nd-sheet   { width: 100%; max-width: 640px; background: var(--surface); border-radius: 24px; display: flex; flex-direction: column; animation: slideUp 0.3s both; border: 1px solid var(--border); max-height: 88vh; overflow: hidden; }
  .nd-header  { padding: 24px 24px 0; flex-shrink: 0; }
  .nd-body    { flex: 1; overflow-y: auto; padding: 0 24px 20px; scrollbar-width: none; }
  .nd-body::-webkit-scrollbar { display: none; }
  .nd-footer  { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }

  /* Author row inside note detail */
  .nd-author-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; position: relative; }
  .nd-author-info { flex: 1; min-width: 0; }
  .nd-author-btn  {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; padding: 0; cursor: pointer;
    font-size: 14px; font-weight: 700; color: var(--text); transition: color 0.2s;
  }
  .nd-author-btn:hover { color: #ff5734; }
  .nd-author-date { font-size: 11px; color: var(--text-light); margin-top: 2px; }

  /* Profile popup on hover/click */
  .nd-profile-popup {
    position: absolute; top: 52px; left: 0; z-index: 10;
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    padding: 16px; min-width: 220px; box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    animation: fadeUp 0.2s both;
  }
  .nd-popup-avatar {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg,#ff5734,#ff8c74);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 800; color: #fff;
    font-family:'Syne',sans-serif; overflow: hidden; margin-bottom: 10px;
  }
  .nd-popup-avatar img { width:100%; height:100%; object-fit:cover; border-radius:14px; }
  .nd-popup-name   { font-size: 15px; font-weight: 800; color: var(--text); font-family:'Syne',sans-serif; }
  .nd-popup-sub    { font-size: 11px; color: var(--text-muted); margin-top: 2px; margin-bottom: 12px; }
  .nd-view-profile-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #ff5734; color: #fff; border: none; border-radius: 10px;
    padding: 9px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
    font-family:'Syne',sans-serif; transition: 0.2s;
  }
  .nd-view-profile-btn:hover { background: #e84826; }

  /* Comments modal (unchanged) */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.2s both; backdrop-filter: blur(4px); }
  .modal-sheet   { width: 100%; max-width: 600px; background: var(--surface); border-radius: 24px 24px 0 0; padding: 28px; max-height: 70vh; display: flex; flex-direction: column; animation: slideUp 0.3s both; border: 1px solid var(--border); border-bottom: none; }
  .modal-handle  { width: 40px; height: 4px; background: var(--border); border-radius: 4px; margin: 0 auto 20px; }
  .modal-close   { background: var(--bg); border: none; border-radius: 9px; padding: 8px; cursor: pointer; color: var(--text-muted); display: flex; }
  .modal-close:hover { background: var(--border); color: var(--text); }
  .comments-list { flex: 1; overflow-y: auto; scrollbar-width: none; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
  .comments-list::-webkit-scrollbar { display: none; }
  .comment-item   { background: var(--bg); border-radius: 12px; padding: 14px 16px; animation: fadeUp 0.2s both; }
  .comment-author { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .comment-text   { font-size: 13px; color: var(--text-muted); line-height: 1.55; }
  .comment-time   { font-size: 10px; color: var(--text-light); margin-top: 6px; font-weight: 500; }
  .comment-input-row { display: flex; gap: 10px; align-items: flex-end; }
  .comment-input { flex: 1; background: var(--bg); border: 1px solid #2a2727; border-radius: 12px; padding: 12px 16px; color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; resize: none; min-height: 44px; max-height: 100px; transition: 0.2s; }
  .comment-input:focus { border-color: #ff5734; }
  .comment-input::placeholder { color: var(--text-light); }
  .btn-send { background: #ff5734; color: #fff; border: none; border-radius: 12px; padding: 12px 18px; cursor: pointer; transition: 0.2s; flex-shrink: 0; display: flex; }
  .btn-send:hover { background: #e84826; }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Share modal */
  .share-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s both; backdrop-filter: blur(6px); padding: 20px; }
  .share-modal { width: 100%; max-width: 520px; background: var(--surface); border-radius: 24px; padding: 30px; display: flex; flex-direction: column; gap: 16px; animation: slideUp 0.3s both; border: 1px solid var(--border); max-height: 80vh; overflow-y: auto; scrollbar-width: none; }
  .share-modal::-webkit-scrollbar { display: none; }
  .share-modal-title { font-size: 18px; font-weight: 800; font-family: 'Syne', sans-serif; color: var(--text); }
  .notes-pick-list { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; scrollbar-width: none; }
  .notes-pick-list::-webkit-scrollbar { display: none; }
  .note-pick-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg); border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
  .note-pick-item:hover { border-color: #2a2727; }
  .note-pick-item.selected { background: rgba(255,87,52,0.08); border-color: rgba(255,87,52,0.25); }
  .note-pick-name { font-size: 14px; font-weight: 600; color: var(--text); flex: 1; }
  .note-pick-sub  { font-size: 11px; color: var(--text-muted); font-weight: 500; }
  .share-lbl      { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .share-submit-btn { width: 100%; padding: 13px; background: #ff5734; color: #fff; border: none; border-radius: 13px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Syne', sans-serif; transition: 0.2s; }
  .share-submit-btn:hover:not(:disabled) { background: #e84826; }
  .share-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cm-empty { text-align: center; padding: 80px 20px; color: var(--text-light); }
  .cm-empty h3 { font-size: 18px; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--text-muted); margin-bottom: 8px; }
  .cm-empty p  { font-size: 14px; line-height: 1.6; }

  @media (max-width: 768px) {
    .pg-menu-btn    { display: flex !important; }
    .pg-topbar      { padding: 0 16px !important; }
    .cm-header-bar  { flex-direction: column; align-items: stretch; }
    .cm-search-wrap { max-width: 100%; }
    .cm-grid        { grid-template-columns: 1fr !important; }
    .cm-stats-bar   { gap: 12px; }
    .nd-overlay     { padding: 0; align-items: flex-end; }
    .nd-sheet       { border-radius: 24px 24px 0 0; max-height: 92vh; }
  }
`;

const TABS = [
  { key: "popular", label: "Top Ranked", icon: TrendingUp },
  { key: "recent",  label: "Recent",     icon: Clock      },
  { key: "all",     label: "All Notes",  icon: Globe      },
];

function Avatar({ user, size = 40, radius = 12, fontSize = 16 }) {
  const [imgErr, setImgErr] = useState(false);
  const isDefault = !user?.avatar || user.avatar.includes("flaticon");
  const letter = (user?.name || "U")[0].toUpperCase();
  return (
    <div className="cm-avatar" style={{ width: size, height: size, borderRadius: radius, fontSize }}>
      {!isDefault && !imgErr
        ? <img src={user.avatar} alt={user?.name} onError={() => setImgErr(true)} />
        : letter}
    </div>
  );
}

export default function CommunityPage() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [notes,           setNotes]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchQ,         setSearchQ]         = useState("");
  const [activeTab,       setActiveTab]       = useState("popular");
  const [downloading,     setDownloading]     = useState(null);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [activeSubject,   setActiveSubject]   = useState("All");
  const [commentsNote,    setCommentsNote]    = useState(null);
  const [comments,        setComments]        = useState([]);
  const [commentText,     setCommentText]     = useState("");
  const [sendingComment,  setSendingComment]  = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [shareModalOpen,  setShareModalOpen]  = useState(false);
  const [myNotes,         setMyNotes]         = useState([]);
  const [selectedNotes,   setSelectedNotes]   = useState([]);
  const [loadingMyNotes,  setLoadingMyNotes]  = useState(false);
  const [sharing,         setSharing]         = useState(false);
  const [detailNote,      setDetailNote]      = useState(null); // note detail modal
  const commentInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const sort = activeTab === "all" ? "popular" : activeTab;
    API.get(`/community/feed?sort=${sort}`)
      .then(({ data }) => setNotes(data?.notes || []))
      .catch(() => toast.error("Failed to load community notes"))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const allSubjects = useMemo(() => {
    const s = new Set(notes.map(n => n.subject || "General").filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [notes]);

  const filtered = useMemo(() => {
    let r = [...notes];
    if (activeSubject !== "All") r = r.filter(n => (n.subject || "General") === activeSubject);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      r = r.filter(n =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.user?.name || "").toLowerCase().includes(q) ||
        (n.subject || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [notes, activeSubject, searchQ]);

  const grouped = useMemo(() => {
    if (activeSubject !== "All") return [{ subject: activeSubject, items: filtered }];
    const map = new Map();
    for (const n of filtered) {
      const key = n.subject || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([subject, items]) => ({ subject, items }));
  }, [filtered, activeSubject]);

  const totalLikes     = notes.reduce((s, n) => s + (n.likesCount  || 0), 0);
  const totalDownloads = notes.reduce((s, n) => s + (n.downloads   || 0), 0);

  const updateNote = (id, patch) =>
    setNotes(prev => prev.map(n => n._id === id ? { ...n, ...patch } : n));

  const toggleLike = async (id, e) => {
    e?.stopPropagation();
    try {
      const { data } = await API.post(`/community/${id}/like`);
      updateNote(id, { liked: data.liked, likesCount: data.likesCount });
      if (detailNote?._id === id) setDetailNote(prev => ({ ...prev, liked: data.liked, likesCount: data.likesCount }));
    } catch { toast.error("Action failed"); }
  };

  const toggleSave = async (id, e) => {
    e?.stopPropagation();
    try {
      const { data } = await API.post(`/community/${id}/save`);
      updateNote(id, { saved: data.saved, savesCount: data.savesCount });
      if (detailNote?._id === id) setDetailNote(prev => ({ ...prev, saved: data.saved, savesCount: data.savesCount }));
      toast.success(data.saved ? "Saved to your collection" : "Removed from saved");
    } catch { toast.error("Save failed"); }
  };

  const downloadNote = async (id, e) => {
    e?.stopPropagation();
    setDownloading(id);
    try {
      const { data } = await API.post(`/community/${id}/download`);
      updateNote(id, { downloads: (notes.find(n => n._id === id)?.downloads || 0) + 1 });
      if (data?.fileUrl) {
        const a = document.createElement("a");
        a.href = data.fileUrl;
        a.download = data.fileName || "note.txt";
        a.click();
      }
      toast.success("Download started!");
    } catch { toast.error("Download failed"); }
    finally { setDownloading(null); }
  };

  const openComments = async (note, e) => {
    e?.stopPropagation();
    setCommentsNote({ id: note._id, title: note.title });
    setComments([]); setLoadingComments(true);
    try {
      const { data } = await API.get(`/community/${note._id}`);
      setComments(data?.comments || []);
    } catch { toast.error("Failed to load comments"); }
    finally { setLoadingComments(false); }
    setTimeout(() => commentInputRef.current?.focus(), 300);
  };

  const closeComments = () => { setCommentsNote(null); setCommentText(""); setComments([]); };

  const submitComment = async () => {
    if (!commentText.trim() || !commentsNote) return;
    setSendingComment(true);
    try {
      const { data } = await API.post(`/community/${commentsNote.id}/comment`, { text: commentText.trim() });
      setComments(prev => [...prev, data]);
      setCommentText("");
      updateNote(commentsNote.id, { commentsCount: (notes.find(n => n._id === commentsNote.id)?.commentsCount || 0) + 1 });
    } catch { toast.error("Failed to post comment"); }
    finally { setSendingComment(false); }
  };

  const openShareModal = async () => {
    setShareModalOpen(true); setSelectedNotes([]); setLoadingMyNotes(true);
    try {
      const { data } = await API.get("/notes?trashed=false");
      setMyNotes((data?.notes || data || []).filter(n => !n.isPublic));
    } catch { toast.error("Failed to load your notes"); }
    finally { setLoadingMyNotes(false); }
  };

  const toggleSelectNote = (id) =>
    setSelectedNotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submitShareNotes = async () => {
    if (!selectedNotes.length) return;
    setSharing(true);
    try {
      await Promise.all(selectedNotes.map(id => API.put(`/notes/${id}`, { isPublic: true })));
      toast.success(`${selectedNotes.length} note${selectedNotes.length > 1 ? "s" : ""} shared!`);
      setShareModalOpen(false); setSelectedNotes([]);
      setLoading(true);
      const { data } = await API.get(`/community/feed?sort=${activeTab === "all" ? "popular" : activeTab}`);
      setNotes(data?.notes || []);
    } catch { toast.error("Failed to share notes"); }
    finally { setSharing(false); setLoading(false); }
  };

  const goToProfile = (userId, e) => {
    e?.stopPropagation();
    if (userId) navigate(`/community/user/${userId}`);
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div style={{ padding: 8, borderRadius: 10, background: "#ff5734", display: "flex" }}><Users size={16} color="#fff" /></div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "var(--text)", letterSpacing: "-0.3px" }}>Community Hub</span>
          <div style={{ flex: 1 }} />
          <button className="btn-share" onClick={openShareModal}><Upload size={15} /> Add Your Notes</button>
        </div>

        <div className="pg-content">
          {/* Stats */}
          <div className="cm-stats-bar">
            {[
              { icon: <FileText size={16} color="#ff5734" />, val: notes.length,         lbl: "Public Notes" },
              { icon: <Heart    size={16} color="#ff5734" />, val: totalLikes,            lbl: "Total Likes"  },
              { icon: <Download size={16} color="#ff5734" />, val: totalDownloads,        lbl: "Downloads"    },
              { icon: <BookOpen size={16} color="#ff5734" />, val: allSubjects.length - 1, lbl: "Subjects"   },
            ].map(({ icon, val, lbl }) => (
              <div className="cm-stat-chip" key={lbl}>
                <div className="sc-icon">{icon}</div>
                <div><div className="sc-val">{val.toLocaleString()}</div><div className="sc-lbl">{lbl}</div></div>
              </div>
            ))}
          </div>

          {/* Header bar */}
          <div className="cm-header-bar">
            <div className="cm-tabs">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} className={`cm-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            <div className="cm-search-wrap">
              <Search size={16} color="#3d3939" />
              <input className="cm-search" placeholder="Search notes, subjects, authors…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              {searchQ && <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6565", display: "flex" }}><X size={14} /></button>}
            </div>
          </div>

          {/* Subject pills */}
          {allSubjects.length > 1 && (
            <div className="cm-subject-bar">
              <span className="cm-subject-lbl">Filter:</span>
              {allSubjects.map(s => (
                <button key={s} className={`cm-subject-pill ${activeSubject === s ? "active" : ""}`} onClick={() => setActiveSubject(s)}>{s}</button>
              ))}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><div className="pg-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="cm-empty">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <h3>No notes found</h3>
              <p>Try a different filter or be the first to share your notes!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
              {grouped.map(({ subject, items }) => (
                <section key={subject}>
                  <div className="cm-section-hd">
                    <h3>{subject}</h3>
                    <div className="cm-section-line" />
                    <span className="cm-section-count">{items.length} {items.length === 1 ? "NOTE" : "NOTES"}</span>
                  </div>
                  <div className="cm-grid">
                    {items.map((note, i) => (
                      <NoteCard
                        key={note._id} note={note}
                        rank={activeTab === "popular" ? i + 1 : null}
                        animDelay={i * 0.04}
                        onCardClick={() => setDetailNote(note)}
                        onLike={(e)    => toggleLike(note._id, e)}
                        onSave={(e)    => toggleSave(note._id, e)}
                        onDownload={(e)=> downloadNote(note._id, e)}
                        onComment={(e) => openComments(note, e)}
                        onUserClick={(e) => goToProfile(note.user?._id, e)}
                        isDownloading={downloading === note._id}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav />

      {/* ── Note Detail Modal ── */}
      {detailNote && (
        <NoteDetailModal
          note={detailNote}
          onClose={() => setDetailNote(null)}
          onLike={(e)     => toggleLike(detailNote._id, e)}
          onSave={(e)     => toggleSave(detailNote._id, e)}
          onDownload={(e) => downloadNote(detailNote._id, e)}
          onComment={(e)  => { setDetailNote(null); openComments(detailNote, e); }}
          onViewProfile={(e) => { setDetailNote(null); goToProfile(detailNote.user?._id, e); }}
          isDownloading={downloading === detailNote._id}
        />
      )}

      {/* ── Comments Modal ── */}
      {commentsNote && (
        <CommentsModal
          note={commentsNote} comments={comments} loading={loadingComments}
          commentText={commentText} setCommentText={setCommentText}
          onSubmit={submitComment} sending={sendingComment}
          onClose={closeComments} inputRef={commentInputRef}
        />
      )}

      {/* ── Share Modal ── */}
      {shareModalOpen && (
        <ShareModal
          myNotes={myNotes} loading={loadingMyNotes}
          selected={selectedNotes} onToggle={toggleSelectNote}
          onSubmit={submitShareNotes} sharing={sharing}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}

/* ─────────────── NoteCard ─────────────── */
function NoteCard({ note, rank, animDelay, onCardClick, onLike, onSave, onDownload, onComment, onUserClick, isDownloading }) {
  return (
    <div className="cm-card" style={{ animationDelay: `${animDelay}s` }} onClick={onCardClick}>
      {rank && rank <= 3 && (
        <div className="cm-card-rank">{rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"}</div>
      )}
      <div className="cm-card-header">
        <Avatar user={note.user} />
        <div style={{ minWidth: 0 }}>
          {/* Clickable author name */}
          <button className="cm-author-btn" onClick={onUserClick} title={`View ${note.user?.name || "Scholar"}'s profile`}>
            <div className="cm-author-name">{note.user?.name || "Scholar"}</div>
          </button>
          <div className="cm-date">{formatDate(note.createdAt)}</div>
        </div>
      </div>
      {note.subject && (
        <div className="cm-card-subject"><BookOpen size={10} /> {note.subject}</div>
      )}
      <div className="cm-card-title">{note.title || "Untitled Note"}</div>
      <div className="cm-card-preview">{note.plainText || "Click to read this note…"}</div>
      <div className="cm-card-footer">
        <div style={{ display: "flex", gap: 6 }}>
          <button className={`cm-act-btn ${note.liked ? "liked" : ""}`} onClick={onLike} title="Like">
            <Heart size={14} fill={note.liked ? "#ff5734" : "none"} />
            {note.likesCount || 0}
          </button>
          <button className="cm-act-btn" onClick={onComment} title="Comments">
            <MessageCircle size={14} /> {note.commentsCount || 0}
          </button>
          <button className={`cm-act-btn ${note.saved ? "saved" : ""}`} onClick={onSave} title={note.saved ? "Unsave" : "Save"}>
            <Bookmark size={14} fill={note.saved ? "#ff5734" : "none"} />
          </button>
        </div>
        <button className="cm-act-btn dl" onClick={onDownload} disabled={isDownloading} title="Download">
          {isDownloading
            ? <div className="pg-spinner" style={{ width: 13, height: 13, borderWidth: 2, borderTopColor: "#fff" }} />
            : <><Download size={13} /> {note.downloads || 0}</>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Note Detail Modal ─────────────── */
function NoteDetailModal({ note, onClose, onLike, onSave, onDownload, onComment, onViewProfile, isDownloading }) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setShowPopup(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="nd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nd-sheet">
        {/* Header */}
        <div className="nd-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            {note.subject && (
              <div className="cm-card-subject"><BookOpen size={10} /> {note.subject}</div>
            )}
            <button className="modal-close" onClick={onClose} style={{ marginLeft: "auto" }}><X size={16} /></button>
          </div>

          {/* Author row with profile popup */}
          <div className="nd-author-row" ref={popupRef}>
            <Avatar user={note.user} size={44} radius={50} fontSize={18} />
            <div className="nd-author-info">
              <button
                className="nd-author-btn"
                onClick={() => setShowPopup(v => !v)}
                title="Click to see profile options"
              >
                {note.user?.name || "Scholar"}
                <ChevronRight size={13} style={{ opacity: 0.5, transform: showPopup ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <div className="nd-author-date">{formatDate(note.createdAt)}</div>
            </div>

            {/* Profile popup */}
            {showPopup && (
              <div className="nd-profile-popup">
                <div className="nd-popup-avatar">
                  <Avatar user={note.user} size={48} radius={14} fontSize={20} />
                </div>
                <div className="nd-popup-name">{note.user?.name || "Scholar"}</div>
                <div className="nd-popup-sub">Community Member</div>
                <button
                  className="nd-view-profile-btn"
                  onClick={(e) => { setShowPopup(false); onViewProfile(e); }}
                >
                  <UserCircle2 size={14} /> View Profile <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>

          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "var(--text)", lineHeight: 1.3, marginBottom: 16 }}>
            {note.title || "Untitled Note"}
          </div>
        </div>

        {/* Body — full content */}
        <div className="nd-body">
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {note.plainText || "No content available for this note."}
          </p>
        </div>

        {/* Footer actions */}
        <div className="nd-footer">
          <button className={`cm-act-btn ${note.liked ? "liked" : ""}`} onClick={onLike} style={{ flex: 1 }}>
            <Heart size={14} fill={note.liked ? "#ff5734" : "none"} /> {note.liked ? "Liked" : "Like"} · {note.likesCount || 0}
          </button>
          <button className="cm-act-btn" onClick={onComment} style={{ flex: 1 }}>
            <MessageCircle size={14} /> Comments · {note.commentsCount || 0}
          </button>
          <button className={`cm-act-btn ${note.saved ? "saved" : ""}`} onClick={onSave} style={{ flex: 1 }}>
            <Bookmark size={14} fill={note.saved ? "#ff5734" : "none"} /> {note.saved ? "Saved" : "Save"}
          </button>
          <button className="cm-act-btn dl" onClick={onDownload} disabled={isDownloading} style={{ flex: 1 }}>
            {isDownloading
              ? <div className="pg-spinner" style={{ width: 13, height: 13, borderWidth: 2, borderTopColor: "#fff" }} />
              : <><Download size={13} /> Download</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── CommentsModal (unchanged) ─────────────── */
function CommentsModal({ note, comments, loading, commentText, setCommentText, onSubmit, sending, onClose, inputRef }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "var(--text)" }}>Comments</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{note.title}</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="comments-list">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="pg-spinner" /></div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              <MessageCircle size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>No comments yet — be the first!</p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div className="comment-item" key={i} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="comment-author">{c.user?.name || "Anonymous"}</div>
                <div className="comment-text">{c.text}</div>
                <div className="comment-time">{formatDate(c.createdAt, true)}</div>
              </div>
            ))
          )}
        </div>
        <div className="comment-input-row">
          <textarea
            ref={inputRef} className="comment-input"
            placeholder="Write a comment…" value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            rows={1}
          />
          <button className="btn-send" onClick={onSubmit} disabled={sending || !commentText.trim()}>
            {sending ? <div className="pg-spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "#fff" }} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── ShareModal (unchanged) ─────────────── */
function ShareModal({ myNotes, loading, selected, onToggle, onSubmit, sharing, onClose }) {
  return (
    <div className="share-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="share-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="share-modal-title">Share to Community</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Select notes from your collection to make them public and visible in the community feed.
        </p>
        <div className="share-lbl">Your Private Notes {selected.length > 0 && `· ${selected.length} selected`}</div>
        <div className="notes-pick-list">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div className="pg-spinner" /></div>
          ) : myNotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: 13 }}>
              All your notes are already public, or you have no notes yet.
            </div>
          ) : (
            myNotes.map(n => (
              <div key={n._id} className={`note-pick-item ${selected.includes(n._id) ? "selected" : ""}`} onClick={() => onToggle(n._id)}>
                <div style={{ flex: 1 }}>
                  <div className="note-pick-name">{n.title || "Untitled Note"}</div>
                  {n.subject && <div className="note-pick-sub">{n.subject}</div>}
                </div>
                <div style={{ color: "#ff5734", flexShrink: 0 }}>
                  {selected.includes(n._id) ? <CheckSquare size={18} /> : <Square size={18} color="var(--text-muted)" />}
                </div>
              </div>
            ))
          )}
        </div>
        <button className="share-submit-btn" onClick={onSubmit} disabled={sharing || selected.length === 0}>
          {sharing ? "Sharing…" : selected.length === 0 ? "Select at least one note" : `Make ${selected.length} Note${selected.length > 1 ? "s" : ""} Public`}
        </button>
      </div>
    </div>
  );
}

function formatDate(d, withTime = false) {
  if (!d) return "";
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  if (withTime) Object.assign(opts, { hour: "2-digit", minute: "2-digit" });
  return new Date(d).toLocaleDateString("en-IN", opts);
}
