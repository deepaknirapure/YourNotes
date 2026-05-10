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



const TABS = [
  { key: "popular", label: "Top Ranked", icon: TrendingUp },
  { key: "recent",  label: "Recent",     icon: Clock      },
  { key: "all",     label: "All Notes",  icon: Globe      },
];

/* Avatar — always circular */
function Avatar({ user, size = 40, fontSize = 16 }) {
  const [imgErr, setImgErr] = useState(false);
  const isDefault = !user?.avatar || user.avatar.includes("flaticon");
  const letter = (user?.name || "U")[0].toUpperCase();
  return (
    <div
      className="cm-avatar"
      style={{ width: size, height: size, fontSize }}
    >
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
  const [detailNote,      setDetailNote]      = useState(null);
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
              { icon: <FileText size={16} color="#ff5734" />, val: notes.length,          lbl: "Public Notes" },
              { icon: <Heart    size={16} color="#ff5734" />, val: totalLikes,             lbl: "Total Likes"  },
              { icon: <Download size={16} color="#ff5734" />, val: totalDownloads,         lbl: "Downloads"    },
              { icon: <BookOpen size={16} color="#ff5734" />, val: allSubjects.length - 1, lbl: "Subjects"     },
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
                        onLike={(e)     => toggleLike(note._id, e)}
                        onSave={(e)     => toggleSave(note._id, e)}
                        onDownload={(e) => downloadNote(note._id, e)}
                        onComment={(e)  => openComments(note, e)}
                        onUserClick={(e)=> goToProfile(note.user?._id, e)}
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

      {detailNote && (
        <NoteDetailModal
          note={detailNote}
          onClose={() => setDetailNote(null)}
          onLike={(e)        => toggleLike(detailNote._id, e)}
          onSave={(e)        => toggleSave(detailNote._id, e)}
          onDownload={(e)    => downloadNote(detailNote._id, e)}
          onComment={(e)     => { setDetailNote(null); openComments(detailNote, e); }}
          onViewProfile={(e) => { setDetailNote(null); goToProfile(detailNote.user?._id, e); }}
          isDownloading={downloading === detailNote._id}
        />
      )}

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

/* ─────────────── NoteCard ─────────────── */
function NoteCard({ note, rank, animDelay, onCardClick, onLike, onSave, onDownload, onComment, onUserClick, isDownloading }) {
  return (
    <div className="cm-card" style={{ animationDelay: `${animDelay}s` }} onClick={onCardClick}>
      {rank && rank <= 3 && (
        <div className="cm-card-rank">{rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"}</div>
      )}
      <div className="cm-card-header">
        <Avatar user={note.user} size={40} fontSize={16} />
        <div style={{ minWidth: 0 }}>
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
        <div className="nd-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            {note.subject && (
              <div className="cm-card-subject"><BookOpen size={10} /> {note.subject}</div>
            )}
            <button className="modal-close" onClick={onClose} style={{ marginLeft: "auto" }}><X size={16} /></button>
          </div>

          <div className="nd-author-row" ref={popupRef}>
            <Avatar user={note.user} size={44} fontSize={18} />
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

            {showPopup && (
              <div className="nd-profile-popup">
                {/* Popup avatar — round via CSS */}
                <div className="nd-popup-avatar">
                  {(() => {
                    const isDefault = !note.user?.avatar || note.user.avatar.includes("flaticon");
                    const letter = (note.user?.name || "U")[0].toUpperCase();
                    return isDefault
                      ? letter
                      : <img src={note.user.avatar} alt={note.user?.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />;
                  })()}
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

        <div className="nd-body">
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {note.plainText || "No content available for this note."}
          </p>
        </div>

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

/* ─────────────── CommentsModal ─────────────── */
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

/* ─────────────── ShareModal ─────────────── */
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