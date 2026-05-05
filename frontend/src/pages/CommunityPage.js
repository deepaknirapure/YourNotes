import { useState, useEffect, useMemo, useRef } from "react";
import {
  Users, Download, Search, Heart, Clock, TrendingUp, Globe,
  Menu, MessageCircle, Bookmark, X, Send, Upload, FileText,
  CheckSquare, Square, BookOpen
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes spin    { to { transform: rotate(360deg) } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes pulse   { 0%,100% { transform: scale(1) } 50% { transform: scale(1.2) } }

  body { background: #0f0e0e; color: #f0ece4; font-family: 'DM Sans', sans-serif; }

  .pg-wrap  { display: flex; height: 100dvh; overflow: hidden; background: #0f0e0e; }
  .pg-main  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .pg-topbar {
    height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 28px;
    background: #0f0e0e; border-bottom: 1px solid #1e1c1c; flex-shrink: 0;
  }
  .pg-menu-btn { display: none; background: transparent; border: 1px solid #2a2727; border-radius: 9px; cursor: pointer; padding: 9px; color: #a09898; align-items: center; justify-content: center; }
  .pg-content  { flex: 1; overflow-y: auto; padding: 32px 4vw 60px; scrollbar-width: none; }
  .pg-content::-webkit-scrollbar { display: none; }

  .cm-stats-bar { display: flex; gap: 20px; margin-bottom: 36px; flex-wrap: wrap; }
  .cm-stat-chip { display: flex; align-items: center; gap: 10px; background: #161414; border: 1px solid #1e1c1c; border-radius: 14px; padding: 14px 20px; flex: 1; min-width: 140px; }
  .cm-stat-chip .sc-icon { width: 36px; height: 36px; border-radius: 10px; background: #1e1c1c; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cm-stat-chip .sc-val  { font-size: 22px; font-weight: 700; font-family: 'Syne', sans-serif; color: #f0ece4; }
  .cm-stat-chip .sc-lbl  { font-size: 11px; color: #6b6565; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  .cm-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 14px; flex-wrap: wrap; }
  .cm-tabs { display: flex; gap: 4px; background: #161414; border: 1px solid #1e1c1c; border-radius: 13px; padding: 4px; }
  .cm-tab  { padding: 9px 16px; border: none; border-radius: 9px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.25s; display: flex; align-items: center; gap: 7px; color: #6b6565; background: transparent; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; }
  .cm-tab.active { background: #ff5734; color: #fff; }
  .cm-tab:not(.active):hover { color: #f0ece4; background: #1e1c1c; }

  .cm-search-wrap { position: relative; display: flex; align-items: center; background: #161414; border: 1px solid #1e1c1c; border-radius: 13px; padding: 0 16px; flex: 1; max-width: 340px; transition: 0.25s; }
  .cm-search-wrap:focus-within { border-color: #ff5734; }
  .cm-search { width: 100%; padding: 11px 10px; background: transparent; border: none; font-size: 13px; font-weight: 500; color: #f0ece4; outline: none; font-family: 'DM Sans', sans-serif; }
  .cm-search::placeholder { color: #3d3939; }

  .cm-subject-bar { display: flex; gap: 8px; margin-bottom: 30px; flex-wrap: wrap; align-items: center; }
  .cm-subject-lbl  { font-size: 12px; color: #3d3939; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .cm-subject-pill { padding: 6px 16px; border-radius: 20px; border: 1px solid #1e1c1c; background: #161414; color: #6b6565; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: 'Syne', sans-serif; white-space: nowrap; }
  .cm-subject-pill:hover { border-color: #ff5734; color: #ff5734; }
  .cm-subject-pill.active { background: #ff5734; border-color: #ff5734; color: #fff; }

  .btn-share { display: flex; align-items: center; gap: 8px; background: #ff5734; color: #fff; border: none; border-radius: 13px; padding: 10px 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.25s; font-family: 'Syne', sans-serif; white-space: nowrap; }
  .btn-share:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,87,52,0.3); }

  .cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .cm-card { background: #161414; border: 1px solid #1e1c1c; border-radius: 20px; padding: 22px; animation: fadeUp 0.35s both; transition: 0.25s; display: flex; flex-direction: column; position: relative; }
  .cm-card:hover { border-color: #2a2727; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
  .cm-card-rank { position: absolute; top: 16px; right: 16px; font-size: 10px; font-weight: 800; font-family: 'Syne', sans-serif; color: #ff5734; background: rgba(255,87,52,0.1); padding: 3px 9px; border-radius: 6px; letter-spacing: 0.5px; }

  .cm-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .cm-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #ff5734, #ff8c74); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0; font-family: 'Syne', sans-serif; }
  .cm-author-name { font-size: 14px; font-weight: 700; color: #f0ece4; }
  .cm-date { font-size: 11px; color: #3d3939; font-weight: 500; margin-top: 2px; }

  .cm-card-subject { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,87,52,0.08); color: #ff5734; border: 1px solid rgba(255,87,52,0.15); border-radius: 7px; padding: 3px 10px; font-size: 11px; font-weight: 700; margin-bottom: 10px; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; width: fit-content; }
  .cm-card-title   { font-size: 16px; font-weight: 700; color: #f0ece4; margin-bottom: 8px; line-height: 1.35; font-family: 'Syne', sans-serif; }
  .cm-card-preview { font-size: 13px; color: #6b6565; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.65; margin-bottom: 20px; flex: 1; }

  .cm-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid #1e1c1c; }
  .cm-act-btn { display: flex; align-items: center; gap: 6px; border: none; border-radius: 9px; padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; background: #1e1c1c; color: #a09898; font-family: 'DM Sans', sans-serif; }
  .cm-act-btn:hover:not(:disabled) { background: #2a2727; color: #f0ece4; }
  .cm-act-btn.liked  { background: rgba(255,87,52,0.12); color: #ff5734; }
  .cm-act-btn.saved  { background: rgba(255,87,52,0.12); color: #ff5734; }
  .cm-act-btn.dl     { background: #ff5734; color: #fff; }
  .cm-act-btn.dl:hover:not(:disabled) { background: #e84826; color: #fff; }
  .cm-act-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cm-section-hd { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .cm-section-hd h3 { font-size: 14px; font-weight: 800; font-family: 'Syne', sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #f0ece4; }
  .cm-section-line  { flex: 1; height: 1px; background: #1e1c1c; }
  .cm-section-count { font-size: 10px; font-weight: 800; font-family: 'Syne', sans-serif; color: #ff5734; background: rgba(255,87,52,0.1); padding: 3px 10px; border-radius: 6px; letter-spacing: 0.5px; }

  .pg-spinner { width: 28px; height: 28px; border: 3px solid #1e1c1c; border-top-color: #ff5734; border-radius: 50%; animation: spin .7s linear infinite; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.2s both; backdrop-filter: blur(4px); }
  .modal-sheet   { width: 100%; max-width: 600px; background: #161414; border-radius: 24px 24px 0 0; padding: 28px; max-height: 70vh; display: flex; flex-direction: column; animation: slideUp 0.3s both; border: 1px solid #1e1c1c; border-bottom: none; }
  .modal-handle  { width: 40px; height: 4px; background: #2a2727; border-radius: 4px; margin: 0 auto 20px; }
  .modal-close   { background: #1e1c1c; border: none; border-radius: 9px; padding: 8px; cursor: pointer; color: #a09898; display: flex; }
  .modal-close:hover { background: #2a2727; color: #f0ece4; }

  .comments-list { flex: 1; overflow-y: auto; scrollbar-width: none; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
  .comments-list::-webkit-scrollbar { display: none; }
  .comment-item   { background: #1e1c1c; border-radius: 12px; padding: 14px 16px; animation: fadeUp 0.2s both; }
  .comment-author { font-size: 13px; font-weight: 700; color: #f0ece4; margin-bottom: 4px; }
  .comment-text   { font-size: 13px; color: #a09898; line-height: 1.55; }
  .comment-time   { font-size: 10px; color: #3d3939; margin-top: 6px; font-weight: 500; }
  .comment-input-row { display: flex; gap: 10px; align-items: flex-end; }
  .comment-input { flex: 1; background: #1e1c1c; border: 1px solid #2a2727; border-radius: 12px; padding: 12px 16px; color: #f0ece4; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; resize: none; min-height: 44px; max-height: 100px; transition: 0.2s; }
  .comment-input:focus { border-color: #ff5734; }
  .comment-input::placeholder { color: #3d3939; }
  .btn-send { background: #ff5734; color: #fff; border: none; border-radius: 12px; padding: 12px 18px; cursor: pointer; transition: 0.2s; flex-shrink: 0; display: flex; }
  .btn-send:hover { background: #e84826; }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

  .share-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s both; backdrop-filter: blur(6px); padding: 20px; }
  .share-modal { width: 100%; max-width: 520px; background: #161414; border-radius: 24px; padding: 30px; display: flex; flex-direction: column; gap: 16px; animation: slideUp 0.3s both; border: 1px solid #1e1c1c; max-height: 80vh; overflow-y: auto; scrollbar-width: none; }
  .share-modal::-webkit-scrollbar { display: none; }
  .share-modal-title { font-size: 18px; font-weight: 800; font-family: 'Syne', sans-serif; color: #f0ece4; }
  .notes-pick-list { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; scrollbar-width: none; }
  .notes-pick-list::-webkit-scrollbar { display: none; }
  .note-pick-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #1e1c1c; border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
  .note-pick-item:hover { border-color: #2a2727; }
  .note-pick-item.selected { background: rgba(255,87,52,0.08); border-color: rgba(255,87,52,0.25); }
  .note-pick-name { font-size: 14px; font-weight: 600; color: #f0ece4; flex: 1; }
  .note-pick-sub  { font-size: 11px; color: #6b6565; font-weight: 500; }
  .share-lbl      { font-size: 12px; color: #6b6565; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .share-submit-btn { width: 100%; padding: 13px; background: #ff5734; color: #fff; border: none; border-radius: 13px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Syne', sans-serif; transition: 0.2s; }
  .share-submit-btn:hover:not(:disabled) { background: #e84826; }
  .share-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cm-empty { text-align: center; padding: 80px 20px; color: #3d3939; }
  .cm-empty h3 { font-size: 18px; font-weight: 700; font-family: 'Syne', sans-serif; color: #6b6565; margin-bottom: 8px; }
  .cm-empty p  { font-size: 14px; line-height: 1.6; }

  @media (max-width: 768px) {
    .pg-menu-btn    { display: flex !important; }
    .pg-topbar      { padding: 0 16px !important; }
    .cm-header-bar  { flex-direction: column; align-items: stretch; }
    .cm-search-wrap { max-width: 100%; }
    .cm-grid        { grid-template-columns: 1fr !important; }
    .cm-stats-bar   { gap: 12px; }
  }
`;

const TABS = [
  { key: "popular", label: "Top Ranked", icon: TrendingUp },
  { key: "recent",  label: "Recent",     icon: Clock      },
  { key: "all",     label: "All Notes",  icon: Globe      },
];

export default function CommunityPage() {
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
  const commentInputRef = useRef(null);

  // Fetch feed
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

  const toggleLike = async (id) => {
    try {
      const { data } = await API.post(`/community/${id}/like`);
      setNotes(prev => prev.map(n => n._id === id ? { ...n, liked: data.liked, likesCount: data.likesCount } : n));
    } catch { toast.error("Action failed"); }
  };

  const toggleSave = async (id) => {
    try {
      const { data } = await API.post(`/community/${id}/save`);
      setNotes(prev => prev.map(n => n._id === id ? { ...n, saved: data.saved, savesCount: data.savesCount } : n));
      toast.success(data.saved ? "Saved to your collection" : "Removed from saved");
    } catch { toast.error("Save failed"); }
  };

  const downloadNote = async (id) => {
    setDownloading(id);
    try {
      const { data } = await API.post(`/community/${id}/download`);
      setNotes(prev => prev.map(n => n._id === id ? { ...n, downloads: (n.downloads || 0) + 1 } : n));
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

  const openComments = async (note) => {
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
      setNotes(prev => prev.map(n => n._id === commentsNote.id ? { ...n, commentsCount: (n.commentsCount || 0) + 1 } : n));
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

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div style={{ padding: 8, borderRadius: 10, background: "#ff5734", display: "flex" }}><Users size={16} color="#fff" /></div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#f0ece4", letterSpacing: "-0.3px" }}>Community Hub</span>
          <div style={{ flex: 1 }} />
          <button className="btn-share" onClick={openShareModal}><Upload size={15} /> Add Your Notes</button>
        </div>

        <div className="pg-content">
          {/* Stats */}
          <div className="cm-stats-bar">
            {[
              { icon: <FileText size={16} color="#ff5734" />, val: notes.length,    lbl: "Public Notes"  },
              { icon: <Heart    size={16} color="#ff5734" />, val: totalLikes,       lbl: "Total Likes"   },
              { icon: <Download size={16} color="#ff5734" />, val: totalDownloads,   lbl: "Downloads"     },
              { icon: <BookOpen size={16} color="#ff5734" />, val: allSubjects.length - 1, lbl: "Subjects" },
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
                        onLike={() => toggleLike(note._id)}
                        onSave={() => toggleSave(note._id)}
                        onDownload={() => downloadNote(note._id)}
                        onComment={() => openComments(note)}
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

      {commentsNote && (
        <CommentsModal
          note={commentsNote} comments={comments} loading={loadingComments}
          commentText={commentText} setCommentText={setCommentText}
          onSubmit={submitComment} sending={sendingComment}
          onClose={closeComments} inputRef={commentInputRef}
        />
      )}

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

function NoteCard({ note, rank, animDelay, onLike, onSave, onDownload, onComment, isDownloading }) {
  return (
    <div className="cm-card" style={{ animationDelay: `${animDelay}s` }}>
      {rank && rank <= 3 && (
        <div className="cm-card-rank">{rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"}</div>
      )}
      <div className="cm-card-header">
        <div className="cm-avatar">{(note.user?.name || "U")[0].toUpperCase()}</div>
        <div>
          <div className="cm-author-name">{note.user?.name || "Scholar"}</div>
          <div className="cm-date">{formatDate(note.createdAt)}</div>
        </div>
      </div>
      {note.subject && (
        <div className="cm-card-subject"><BookOpen size={10} /> {note.subject}</div>
      )}
      <div className="cm-card-title">{note.title || "Untitled Note"}</div>
      <div className="cm-card-preview">{note.plainText || "Open this note to explore the full content…"}</div>
      <div className="cm-card-footer">
        <div style={{ display: "flex", gap: 6 }}>
          <button className={`cm-act-btn ${note.liked ? "liked" : ""}`} onClick={onLike} title="Like">
            <Heart size={14} fill={note.liked ? "#ff5734" : "none"} style={note.liked ? { animation: "pulse 0.3s ease" } : {}} />
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

function CommentsModal({ note, comments, loading, commentText, setCommentText, onSubmit, sending, onClose, inputRef }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#f0ece4" }}>Comments</div>
            <div style={{ fontSize: 12, color: "#6b6565", marginTop: 2 }}>{note.title}</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="comments-list">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="pg-spinner" /></div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#3d3939" }}>
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

function ShareModal({ myNotes, loading, selected, onToggle, onSubmit, sharing, onClose }) {
  return (
    <div className="share-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="share-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="share-modal-title">Share to Community</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: "#6b6565", lineHeight: 1.6 }}>
          Select notes from your collection to make them public and visible in the community feed.
        </p>
        <div className="share-lbl">Your Private Notes {selected.length > 0 && `· ${selected.length} selected`}</div>
        <div className="notes-pick-list">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div className="pg-spinner" /></div>
          ) : myNotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#3d3939", fontSize: 13 }}>
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
                  {selected.includes(n._id) ? <CheckSquare size={18} /> : <Square size={18} color="#3d3939" />}
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