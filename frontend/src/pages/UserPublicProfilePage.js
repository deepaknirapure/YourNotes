import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, Download, MessageCircle, BookOpen,
  Flame, Calendar, FileText, Globe, Bookmark, Menu
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { ; (16px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes fadeIn  { from { } to { opacity: 1 } }
  @keyframes spin    { to { transform: rotate(360deg) } }
  @keyframes shimmer { 0% { background-0 } 100% { background-position: 600px 0 } }
  @keyframes pulse   { 0%,100% { (1) } 50% { transform: scale(1.15) } }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .up-wrap  { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); }
  .up-main  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* Topbar */
  .up-topbar {
    height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 28px;
    background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0; z-index: 10;
  }
  .up-back-btn {
    display: flex; align-items: center; gap: 8px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px;
    color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer;
    transition: 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .up-back-btn:hover { border-color: #ff5734; color: #ff5734; }
  .up-menu-btn {
    display: none; background: transparent; border: 1px solid var(--border);
    border-radius: 9px; cursor: pointer; padding: 9px; color: var(--text-muted);
    align-items: center; justify-content: center;
  }

  .up-content { flex: 1; overflow-y: auto; scrollbar-width: none; }
  .up-content::-webkit-scrollbar { display: none; }

  /* Hero Banner */
  .up-hero {
    background: linear-gradient(135deg, #ff5734 0%, #ff8c74 50%, #ffb39b 100%);
    padding: 48px 5vw 80px; position: relative; overflow: hidden;
  }
  .up-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);
  }
  .up-hero::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 40px;
    background: var(--bg); border-radius: 40px 40px 0 0;
  }

  /* Avatar */
  .up-avatar-wrap { position: relative; display: inline-block; margin-bottom: 16px; }
  .up-avatar {
    width: 88px; height: 88px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; font-weight: 800; color: #fff;
    font-family: 'Syne', sans-serif; object-fit: cover; overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  }
  .up-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .up-streak-badge {
    position: absolute; bottom: -8px; right: -8px;
    background: #fff; border-radius: 10px; padding: 4px 8px;
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; font-weight: 800; color: #ff5734;
    font-family: 'Syne', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .up-name { font-size: 28px; font-weight: 800; color: #fff; font-family: 'Syne', sans-serif; letter-spacing: -0.5px; margin-bottom: 6px; }
  .up-joined { font-size: 12px; color: rgba(255,255,255,0.75); font-weight: 500; display: flex; align-items: center; gap: 6px; }

  /* Stats row */
  .up-stats { padding: 0 5vw; margin-top: -24px; margin-bottom: 36px; position: relative; z-index: 2; }
  .up-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .up-stat-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
    padding: 18px 14px; text-align: center; animation: fadeUp 0.4s both;
    transition: 0.25s;
  }
  .up-stat-card:hover { border-color: #ff5734; transform: translateY(-3px); }
  .up-stat-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,87,52,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
  .up-stat-val { font-size: 24px; font-weight: 800; font-family: 'Syne', sans-serif; color: var(--text); }
  .up-stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-muted); margin-top: 2px; }

  /* Notes section */
  .up-notes-section { padding: 0 5vw 80px; }
  .up-section-hd { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .up-section-hd h3 { font-size: 13px; font-weight: 800; font-family: 'Syne', sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text); }
  .up-section-line { flex: 1; height: 1px; background: var(--border); }
  .up-section-count { font-size: 10px; font-weight: 800; font-family: 'Syne', sans-serif; color: #ff5734; background: rgba(255,87,52,0.1); padding: 3px 10px; border-radius: 6px; }

  .up-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 18px; }

  .up-note-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
    padding: 20px; display: flex; flex-direction: column;
    animation: fadeUp 0.4s both; transition: 0.25s; position: relative;
  }
  .up-note-card:hover { border-color: rgba(255,87,52,0.4); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }

  .up-note-subject {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,87,52,0.08); color: #ff5734;
    border: 1px solid rgba(255,87,52,0.15); border-radius: 7px;
    padding: 3px 10px; font-size: 11px; font-weight: 700; margin-bottom: 10px;
    font-family: 'Syne', sans-serif; letter-spacing: 0.3px; width: fit-content;
  }
  .up-note-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; line-height: 1.35; font-family: 'Syne', sans-serif; }
  .up-note-preview { font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.65; margin-bottom: 16px; flex: 1; }

  .up-note-footer { display: flex; align-items: center; justify-content: space-between; padding-; border-top: 1px solid var(--border); }
  .up-note-actions { display: flex; gap: 6px; }
  .up-act-btn {
    display: flex; align-items: center; gap: 5px; border: none; border-radius: 8px;
    padding: 6px 10px; font-size: 12px; font-weight: 700; cursor: pointer;
    transition: 0.2s; background: var(--bg); color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
  }
  .up-act-btn:hover { background: var(--border); color: var(--text); }
  .up-act-btn.liked { background: rgba(255,87,52,0.12); color: #ff5734; }
  .up-act-btn.saved { background: rgba(255,87,52,0.12); color: #ff5734; }
  .up-act-btn.dl { background: #ff5734; color: #fff; }
  .up-act-btn.dl:hover { background: #e84826; color: #fff; }
  .up-act-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .up-date { font-size: 11px; color: var(--text-light); font-weight: 500; }

  /* Skeleton loader */
  .skeleton {
    background: linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%);
    background-size: 600px 100%; animation: shimmer 1.4s infinite linear;
    border-radius: 12px;
  }

  /* Empty state */
  .up-empty { text-align: center; padding: 60px 20px; }
  .up-empty h3 { font-size: 16px; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--text-muted); margin-bottom: 8px; }
  .up-empty p  { font-size: 13px; color: var(--text-light); line-height: 1.6; }

  .up-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: #ff5734; border-radius: 50%; animation: spin .7s linear infinite; }

  @media (max-width: 768px) {
    .up-menu-btn   { display: flex !important; }
    .up-topbar     { padding: 0 16px; }
    .up-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .up-grid       { grid-template-columns: 1fr; }
    .up-stats      { padding: 0 16px; }
    .up-notes-section { padding: 0 16px 100px; }
    .up-hero       { padding: 36px 16px 70px; }
    .up-name       { font-size: 22px; }
  }
`;

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UserPublicProfilePage() {
  const { userId }    = useParams();
  const navigate      = useNavigate();
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [downloading,  setDownloading]  = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    API.get(`/community/user/${userId}/profile`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleLike = async (noteId) => {
    try {
      const { data: res } = await API.post(`/community/${noteId}/like`);
      setData(prev => ({
        ...prev,
        notes: prev.notes.map(n =>
          n._id === noteId ? { ...n, liked: res.liked, likesCount: res.likesCount } : n
        ),
      }));
    } catch { toast.error("Action failed"); }
  };

  const toggleSave = async (noteId) => {
    try {
      const { data: res } = await API.post(`/community/${noteId}/save`);
      setData(prev => ({
        ...prev,
        notes: prev.notes.map(n =>
          n._id === noteId ? { ...n, saved: res.saved, savesCount: res.savesCount } : n
        ),
      }));
      toast.success(res.saved ? "Saved!" : "Removed from saved");
    } catch { toast.error("Save failed"); }
  };

  const downloadNote = async (noteId) => {
    setDownloading(noteId);
    try {
      const { data: res } = await API.post(`/community/${noteId}/download`);
      if (res?.fileUrl) {
        const a = document.createElement("a");
        a.href = res.fileUrl;
        a.download = res.fileName || "note.txt";
        a.click();
      }
      setData(prev => ({
        ...prev,
        notes: prev.notes.map(n =>
          n._id === noteId ? { ...n, downloads: (n.downloads || 0) + 1 } : n
        ),
      }));
      toast.success("Download started!");
    } catch { toast.error("Download failed"); }
    finally { setDownloading(null); }
  };

  const user  = data?.user;
  const stats = data?.stats;
  const notes = data?.notes || [];

  const avatarChar = (user?.name || "U")[0].toUpperCase();
  const isDefaultAvatar = !user?.avatar || user.avatar.includes("flaticon");

  return (
    <div className="up-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="up-main">
        {/* Topbar */}
        <div className="up-topbar">
          <button className="up-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <button className="up-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back to Community
          </button>
          {user && (
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", marginLeft: 4, fontFamily: "'Syne', sans-serif" }}>
              {user.name}'s Profile
            </span>
          )}
        </div>

        <div className="up-content">
          {loading ? (
            /* Skeleton */
            <div>
              <div style={{ background: "linear-gradient(135deg, #ff5734, #ff8c74)", height: 180 }} />
              <div style={{ padding: "0 5vw", marginTop: -24, marginBottom: 36 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 90, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 5vw", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 18 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 180, animationDelay: `${i * 0.07}s` }} />
                ))}
              </div>
            </div>
          ) : !user ? (
            <div className="up-empty" style={{ paddingTop: 120 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>👤</div>
              <h3>User not found</h3>
              <p>This profile doesn't exist or has been removed.</p>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="up-hero">
                <div className="up-avatar-wrap">
                  <div className="up-avatar">
                    {isDefaultAvatar
                      ? avatarChar
                      : <img src={user.avatar} alt={user.name} onError={e => { e.target.style.display = "none"; }} />
                    }
                  </div>
                  {user.streak?.count > 0 && (
                    <div className="up-streak-badge">
                      <Flame size={11} /> {user.streak.count}
                    </div>
                  )}
                </div>
                <div className="up-name">{user.name}</div>
                <div className="up-joined">
                  <Calendar size={12} />
                  Joined {formatDate(user.joinedAt)}
                </div>
              </div>

              {/* Stats */}
              <div className="up-stats">
                <div className="up-stats-grid">
                  {[
                    { icon: <FileText size={17} color="#ff5734" />, val: stats.totalNotes,    lbl: "Public Notes",  delay: 0    },
                    { icon: <Heart    size={17} color="#ff5734" />, val: stats.totalLikes,    lbl: "Total Likes",   delay: 0.07 },
                    { icon: <Download size={17} color="#ff5734" />, val: stats.totalDownloads, lbl: "Downloads",    delay: 0.14 },
                    { icon: <BookOpen size={17} color="#ff5734" />, val: stats.subjects,       lbl: "Subjects",     delay: 0.21 },
                  ].map(({ icon, val, lbl, delay }) => (
                    <div className="up-stat-card" key={lbl} style={{ animationDelay: `${delay}s` }}>
                      <div className="up-stat-icon">{icon}</div>
                      <div className="up-stat-val">{(val || 0).toLocaleString()}</div>
                      <div className="up-stat-lbl">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="up-notes-section">
                <div className="up-section-hd">
                  <Globe size={15} color="#ff5734" />
                  <h3>Public Notes</h3>
                  <div className="up-section-line" />
                  <span className="up-section-count">{notes.length} {notes.length === 1 ? "NOTE" : "NOTES"}</span>
                </div>

                {notes.length === 0 ? (
                  <div className="up-empty">
                    <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
                    <h3>No public notes yet</h3>
                    <p>{user.name} hasn't shared any notes with the community.</p>
                  </div>
                ) : (
                  <div className="up-grid">
                    {notes.map((note, i) => (
                      <div className="up-note-card" key={note._id} style={{ animationDelay: `${i * 0.05}s` }}>
                        {note.subject && (
                          <div className="up-note-subject"><BookOpen size={10} /> {note.subject}</div>
                        )}
                        <div className="up-note-title">{note.title || "Untitled Note"}</div>
                        <div className="up-note-preview">{note.plainText || "Open this note to see the full content…"}</div>
                        <div className="up-note-footer">
                          <div className="up-note-actions">
                            <button
                              className={`up-act-btn ${note.liked ? "liked" : ""}`}
                              onClick={() => toggleLike(note._id)}
                              title="Like"
                            >
                              <Heart size={13} fill={note.liked ? "#ff5734" : "none"} style={note.liked ? { animation: "pulse 0.3s ease" } : {}} />
                              {note.likesCount || 0}
                            </button>
                            <button
                              className={`up-act-btn ${note.saved ? "saved" : ""}`}
                              onClick={() => toggleSave(note._id)}
                              title={note.saved ? "Unsave" : "Save"}
                            >
                              <Bookmark size={13} fill={note.saved ? "#ff5734" : "none"} />
                            </button>
                            <button className="up-act-btn" title="Comments">
                              <MessageCircle size={13} /> {note.commentsCount || 0}
                            </button>
                          </div>
                          <button
                            className="up-act-btn dl"
                            onClick={() => downloadNote(note._id)}
                            disabled={downloading === note._id}
                            title="Download"
                          >
                            {downloading === note._id
                              ? <div className="up-spinner" style={{ width: 13, height: 13, borderWidth: 2, borderTopColor: "#fff" }} />
                              : <><Download size={13} /> {note.downloads || 0}</>
                            }
                          </button>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <span className="up-date">{formatDate(note.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}