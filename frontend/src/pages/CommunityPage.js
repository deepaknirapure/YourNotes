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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes spin    { to { transform: rotate(360deg) } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes pulse   { 0%,100% { transform: scale(1) } 50% { transform: scale(1.2) } }

  body { 
    background: var(--bg); 
    color: var(--text); 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    -webkit-font-smoothing: antialiased;
  }

  .pg-wrap  { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); }
  .pg-main  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .pg-topbar {
    height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 28px;
    background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .pg-menu-btn { display: none; background: transparent; border: 1px solid var(--border); border-radius: 9px; cursor: pointer; padding: 9px; color: var(--text-muted); align-items: center; justify-content: center; }
  .pg-content  { flex: 1; overflow-y: auto; padding: 32px 4vw 60px; scrollbar-width: none; }
  .pg-content::-webkit-scrollbar { display: none; }

  .cm-stats-bar { display: flex; gap: 20px; margin-bottom: 36px; flex-wrap: wrap; }
  .cm-stat-chip { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 20px; flex: 1; min-width: 140px; }
  .cm-stat-chip .sc-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cm-stat-chip .sc-val  { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
  .cm-stat-chip .sc-lbl  { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }

  .cm-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 14px; flex-wrap: wrap; }
  .cm-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 4px; }
  .cm-tab  { padding: 9px 16px; border: none; border-radius: 9px; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.25s; display: flex; align-items: center; gap: 7px; color: var(--text-muted); background: transparent; font-family: 'Plus Jakarta Sans', sans-serif; }
  .cm-tab.active { background: #f97316; color: #fff; }
  .cm-tab:not(.active):hover { color: var(--text); background: var(--bg); }

  .cm-search-wrap { position: relative; display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 0 16px; flex: 1; max-width: 340px; transition: 0.25s; }
  .cm-search-wrap:focus-within { border-color: #f97316; }
  .cm-search { width: 100%; padding: 11px 10px; background: transparent; border: none; font-size: 13px; font-weight: 600; color: var(--text); outline: none; font-family: 'Plus Jakarta Sans', sans-serif; }

  .cm-subject-pill { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .cm-subject-pill.active { background: #f97316; border-color: #f97316; color: #fff; }

  .btn-share { display: flex; align-items: center; gap: 8px; background: #f97316; color: #fff; border: none; border-radius: 13px; padding: 10px 20px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.25s; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .cm-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 22px; animation: fadeUp 0.35s both; transition: 0.25s; display: flex; flex-direction: column; position: relative; cursor: pointer; }
  .cm-card:hover { border-color: #f97316; transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
  .cm-card-rank { position: absolute; top: 16px; right: 16px; font-size: 10px; font-weight: 900; color: #f97316; background: rgba(249,115,22,0.1); padding: 3px 9px; border-radius: 6px; }

  .cm-avatar { border-radius: 50% !important; background: linear-gradient(135deg, #f97316, #fb923c); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; flex-shrink: 0; overflow: hidden; }
  .cm-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50% !important; }

  .cm-card-title   { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 8px; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.2px; }
  .cm-act-btn { display: flex; align-items: center; gap: 6px; border: none; border-radius: 9px; padding: 7px 12px; font-size: 12px; font-weight: 800; cursor: pointer; background: var(--bg); color: var(--text-muted); font-family: 'Plus Jakarta Sans', sans-serif; }

  .nd-sheet { width: 100%; max-width: 640px; background: var(--surface); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; animation: slideUp 0.3s both; }
  .modal-sheet { width: 100%; max-width: 600px; background: var(--surface); border-radius: 24px 24px 0 0; padding: 28px; border: 1px solid var(--border); }
  
  .pg-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: #f97316; border-radius: 50%; animation: spin .7s linear infinite; }

  @media (max-width: 768px) {
    .pg-menu-btn { display: flex !important; border-color: var(--border) !important; }
    .cm-grid { grid-template-columns: 1fr !important; }
  }
`;

const TABS = [
  { key: "popular", label: "Top Ranked", icon: TrendingUp },
  { key: "recent",  label: "Recent",     icon: Clock      },
  { key: "all",     label: "All Notes",  icon: Globe      },
];

function Avatar({ user, size = 40, fontSize = 16 }) {
  const [imgErr, setImgErr] = useState(false);
  const isDefault = !user?.avatar || user.avatar.includes("flaticon");
  const letter = (user?.name || "U")[0].toUpperCase();
  return (
    <div className="cm-avatar" style={{ width: size, height: size, fontSize }}>
      {!isDefault && !imgErr
        ? <img src={user.avatar} alt={user?.name} onError={() => setImgErr(true)} />
        : letter}
    </div>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [activeTab, setActiveTab] = useState("popular");
  const [downloading, setDownloading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState("All");
  const [commentsNote, setCommentsNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [myNotes, setMyNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [loadingMyNotes, setLoadingMyNotes] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [detailNote, setDetailNote] = useState(null);
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

  const totalLikes = notes.reduce((s, n) => s + (n.likesCount || 0), 0);
  const totalDownloads = notes.reduce((s, n) => s + (n.downloads || 0), 0);

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
      toast.success(data.saved ? "Saved to collection" : "Removed");
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
    } catch { toast.error("Failed to load notes"); }
    finally { setLoadingMyNotes(false); }
  };

  const submitShareNotes = async () => {
    if (!selectedNotes.length) return;
    setSharing(true);
    try {
      await Promise.all(selectedNotes.map(id => API.put(`/notes/${id}`, { isPublic: true })));
      toast.success(`${selectedNotes.length} notes shared!`);
      setShareModalOpen(false);
      const { data } = await API.get(`/community/feed?sort=${activeTab}`);
      setNotes(data?.notes || []);
    } catch { toast.error("Failed to share"); }
    finally { setSharing(false); }
  };

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div style={{ padding: 8, borderRadius: 10, background: "#f97316", display: "flex" }}><Users size={16} color="#fff" /></div>
          <span style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.3px" }}>Community Hub</span>
          <div style={{ flex: 1 }} />
          <button className="btn-share" onClick={openShareModal}><Upload size={15} /> Add Your Notes</button>
        </div>

        <div className="pg-content">
          <div className="cm-stats-bar">
            {[
              { icon: <FileText size={16} color="#f97316" />, val: notes.length, lbl: "Public Notes" },
              { icon: <Heart size={16} color="#f97316" />, val: totalLikes, lbl: "Total Likes" },
              { icon: <Download size={16} color="#f97316" />, val: totalDownloads, lbl: "Downloads" },
              { icon: <BookOpen size={16} color="#f97316" />, val: allSubjects.length - 1, lbl: "Subjects" },
            ].map(({ icon, val, lbl }) => (
              <div className="cm-stat-chip" key={lbl}>
                <div className="sc-icon">{icon}</div>
                <div><div className="sc-val">{val.toLocaleString()}</div><div className="sc-lbl">{lbl}</div></div>
              </div>
            ))}
          </div>

          <div className="cm-header-bar">
            <div className="cm-tabs">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} className={`cm-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            <div className="cm-search-wrap">
              <Search size={16} color="#888" />
              <input className="cm-search" placeholder="Search notes, authors..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
          </div>

          <div className="cm-subject-bar">
            {allSubjects.map(s => (
              <button key={s} className={`cm-subject-pill ${activeSubject === s ? "active" : ""}`} onClick={() => setActiveSubject(s)}>{s}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><div className="pg-spinner" /></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
              {grouped.map(({ subject, items }) => (
                <section key={subject}>
                  <div className="cm-section-hd">
                    <h3>{subject}</h3>
                  </div>
                  <div className="cm-grid">
                    {items.map((note, i) => (
                      <NoteCard
                        key={note._id} note={note}
                        rank={activeTab === "popular" ? i + 1 : null}
                        onCardClick={() => setDetailNote(note)}
                        onLike={(e) => toggleLike(note._id, e)}
                        onSave={(e) => toggleSave(note._id, e)}
                        onDownload={(e) => downloadNote(note._id, e)}
                        onComment={(e) => openComments(note, e)}
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

      {/* Note Detail Modal */}
      {detailNote && (
        <NoteDetailModal
          note={detailNote}
          onClose={() => setDetailNote(null)}
          onLike={(e) => toggleLike(detailNote._id, e)}
          onSave={(e) => toggleSave(detailNote._id, e)}
          onDownload={(e) => downloadNote(detailNote._id, e)}
          onComment={(e) => { setDetailNote(null); openComments(detailNote, e); }}
          onViewProfile={() => { setDetailNote(null); navigate(`/community/user/${detailNote.user?._id}`); }}
          isDownloading={downloading === detailNote._id}
        />
      )}

      {/* Comments Modal */}
      {commentsNote && (
        <CommentsModal
          note={commentsNote} comments={comments} loading={loadingComments}
          commentText={commentText} setCommentText={setCommentText}
          onSubmit={submitComment} sending={sendingComment}
          onClose={() => setCommentsNote(null)} inputRef={commentInputRef}
        />
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareModal
          myNotes={myNotes} loading={loadingMyNotes}
          selected={selectedNotes} onToggle={(id) => setSelectedNotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          onSubmit={submitShareNotes} sharing={sharing}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}

/* Sub-Components Restored with All Logic */

function NoteCard({ note, rank, onCardClick, onLike, onSave, onDownload, onComment, isDownloading }) {
  return (
    <div className="cm-card" onClick={onCardClick}>
      {rank && rank <= 3 && <div className="cm-card-rank">#{rank}</div>}
      <div className="cm-card-header" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Avatar user={note.user} />
        <div>
          <div className="cm-author-name">{note.user?.name || "Scholar"}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{new Date(note.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      {note.subject && <div className="cm-card-subject"><BookOpen size={10} /> {note.subject}</div>}
      <div className="cm-card-title">{note.title}</div>
      <div className="cm-card-preview">{note.plainText}</div>
      <div className="cm-card-footer" style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`cm-act-btn ${note.liked ? "liked" : ""}`} onClick={onLike}><Heart size={14} fill={note.liked ? "#f97316" : "none"} /> {note.likesCount}</button>
          <button className="cm-act-btn" onClick={onComment}><MessageCircle size={14} /> {note.commentsCount}</button>
          <button className={`cm-act-btn ${note.saved ? "saved" : ""}`} onClick={onSave}><Bookmark size={14} fill={note.saved ? "#f97316" : "none"} /></button>
        </div>
        <button className="cm-act-btn dl" onClick={onDownload} disabled={isDownloading}>
          {isDownloading ? <div className="pg-spinner" style={{ width: 14, height: 14 }} /> : <Download size={14} />}
        </button>
      </div>
    </div>
  );
}

function NoteDetailModal({ note, onClose, onLike, onSave, onDownload, onComment, onViewProfile, isDownloading }) {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div className="nd-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="nd-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
             <Avatar user={note.user} size={48} />
             <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X /></button>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>{note.title}</h2>
          <div style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.8, maxHeight: "400px", overflowY: "auto" }}>{note.plainText}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
             <button className="cm-act-btn" onClick={onLike} style={{ flex: 1 }}>Like</button>
             <button className="cm-act-btn" onClick={onComment} style={{ flex: 1 }}>Comment</button>
             <button className="cm-act-btn dl" onClick={onDownload} disabled={isDownloading} style={{ flex: 1 }}>Download</button>
          </div>
          <button className="nd-view-profile-btn" onClick={onViewProfile} style={{ width: "100%", marginTop: 12, padding: 12, color: "#fff", border: "none", cursor: "pointer" }}>View Author Profile</button>
        </div>
      </div>
    </div>
  );
}

function CommentsModal({ note, comments, loading, commentText, setCommentText, onSubmit, sending, onClose, inputRef }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 900 }}>Comments</h3>
            <X onClick={onClose} style={{ cursor: "pointer" }} />
         </div>
         <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: 20 }}>
            {loading ? <div className="pg-spinner" /> : comments.map((c, i) => (
              <div key={i} style={{ padding: "12px", background: "var(--bg)", borderRadius: "10px", marginBottom: "8px" }}>
                <div style={{ fontWeight: 800, fontSize: "13px" }}>{c.user?.name}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{c.text}</div>
              </div>
            ))}
         </div>
         <div style={{ display: "flex", gap: 10 }}>
            <textarea ref={inputRef} value={commentText} onChange={e => setCommentText(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} placeholder="Write a comment..." />
            <button className="btn-send" onClick={onSubmit} disabled={sending} style={{ padding: "0 20px", background: "#f97316", color: "#fff", border: "none", borderRadius: 12 }}><Send size={18} /></button>
         </div>
      </div>
    </div>
  );
}

function ShareModal({ myNotes, loading, selected, onToggle, onSubmit, sharing, onClose }) {
  return (
    <div className="share-modal-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="nd-sheet" onClick={e => e.stopPropagation()} style={{ padding: 24 }}>
         <h3 style={{ fontWeight: 900, marginBottom: 16 }}>Share Your Notes</h3>
         <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {loading ? <div className="pg-spinner" /> : myNotes.map(n => (
              <div key={n._id} onClick={() => onToggle(n._id)} style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "var(--bg)", borderRadius: 12, marginBottom: 8, cursor: "pointer", border: selected.includes(n._id) ? "1px solid #f97316" : "1px solid transparent" }}>
                <span>{n.title}</span>
                {selected.includes(n._id) ? <CheckSquare color="#f97316" /> : <Square />}
              </div>
            ))}
         </div>
         <button onClick={onSubmit} disabled={sharing} style={{ width: "100%", marginTop: 20, padding: 14, background: "#f97316", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800 }}>{sharing ? "Sharing..." : "Make Public"}</button>
      </div>
    </div>
  );
}