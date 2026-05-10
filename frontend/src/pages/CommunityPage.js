// CommunityPage.js — DM Sans, #f97316 accent (was using Syne + #ff5734)
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

const STYLES = `
  .cm-wrap  { display:flex; height:100dvh; overflow:hidden; background:var(--bg); font-family:var(--font,'DM Sans',sans-serif); }
  .cm-main  { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

  /* Stats bar */
  .cm-stats-bar { display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; }
  .cm-stat-chip {
    display:flex; align-items:center; gap:10px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--r-lg); padding:14px 18px; flex:1; min-width:130px;
  }
  .cm-stat-chip-icon { width:34px; height:34px; border-radius:9px; background:var(--bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cm-stat-chip-val  { font-size:20px; font-weight:800; color:var(--text); letter-spacing:-0.5px; }
  .cm-stat-chip-lbl  { font-size:11px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }

  /* Header bar */
  .cm-header-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; gap:12px; flex-wrap:wrap; }

  /* Subjects */
  .cm-subjects { display:flex; gap:6px; margin-bottom:24px; flex-wrap:wrap; align-items:center; }
  .cm-subj-lbl { font-size:11px; color:var(--text-4); font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }

  /* Grid */
  .cm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:14px; }

  /* Card */
  .cm-card {
    background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg);
    padding:20px; animation:fadeUp 0.3s both; transition:all 0.2s; display:flex;
    flex-direction:column; position:relative; cursor:pointer;
  }
  .cm-card:hover { border-color:var(--accent); transform:translateY(-2px); box-shadow:0 8px 24px var(--accent-ring); }

  .cm-card-header { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .cm-avatar {
    border-radius:50% !important; background:linear-gradient(135deg,#f97316,#fdba74);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#fff; flex-shrink:0; overflow:hidden;
  }
  .cm-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50% !important; }
  .cm-author-name { font-size:13px; font-weight:700; color:var(--text); }
  .cm-card-date   { font-size:11px; color:var(--text-4); font-weight:500; margin-top:1px; }

  .cm-subject-tag {
    display:inline-flex; align-items:center; gap:4px;
    background:var(--accent-light); color:var(--accent);
    border:1px solid var(--accent-ring); border-radius:var(--r-sm);
    padding:3px 9px; font-size:11px; font-weight:700; margin-bottom:9px; width:fit-content;
  }
  .cm-card-title   { font-size:15px; font-weight:800; color:var(--text); margin-bottom:7px; line-height:1.35; }
  .cm-card-preview { font-size:12px; color:var(--text-3); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.65; margin-bottom:18px; flex:1; }
  .cm-card-footer  { display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid var(--border); }

  .cm-act-btn {
    display:flex; align-items:center; gap:5px; border:none; border-radius:var(--r-sm);
    padding:6px 10px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s;
    background:var(--bg); color:var(--text-3); font-family:var(--font);
  }
  .cm-act-btn:hover:not(:disabled) { background:var(--bg-alt); color:var(--text); }
  .cm-act-btn.liked { background:var(--accent-light); color:var(--accent); }
  .cm-act-btn.saved { background:var(--accent-light); color:var(--accent); }
  .cm-act-btn.dl    { background:var(--accent); color:#fff; }
  .cm-act-btn.dl:hover:not(:disabled) { background:var(--accent-dark); color:#fff; }
  .cm-act-btn:disabled { opacity:0.5; cursor:not-allowed; }

  /* Section header */
  .cm-section-hd { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .cm-section-hd h3 { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--text); }
  .cm-section-line  { flex:1; height:1px; background:var(--border); }
  .cm-section-count { font-size:10px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:2px 9px; border-radius:var(--r-full); }

  /* Note Detail Modal */
  .nd-sheet   { width:100%; max-width:620px; background:var(--surface); border-radius:var(--r-xl); display:flex; flex-direction:column; animation:scaleIn 0.3s both; border:1px solid var(--border); max-height:88vh; overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,0.18); }
  .nd-header  { padding:22px 22px 0; flex-shrink:0; }
  .nd-body    { flex:1; overflow-y:auto; padding:0 22px 18px; scrollbar-width:none; }
  .nd-body::-webkit-scrollbar { display:none; }
  .nd-footer  { padding:14px 22px; border-top:1px solid var(--border); display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; }

  .nd-author-row { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
  .nd-close      { width:28px; height:28px; border:none; border-radius:var(--r-sm); background:var(--bg); cursor:pointer; color:var(--text-3); display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; margin-left:auto; }
  .nd-close:hover { background:var(--bg-alt); color:var(--text); }

  /* Share modal */
  .share-modal { width:100%; max-width:520px; background:var(--surface); border-radius:var(--r-xl); padding:28px; animation:scaleIn 0.22s ease; box-shadow:0 24px 64px rgba(0,0,0,0.18); }
  .share-title { font-size:16px; font-weight:800; color:var(--text); letter-spacing:-0.3px; margin-bottom:16px; }

  /* Note list item */
  .share-note-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:var(--r-md); border:1px solid var(--border); cursor:pointer; transition:all 0.15s; background:var(--bg); margin-bottom:6px; }
  .share-note-item:hover:not(.in-community) { border-color:var(--accent); }
  .share-note-item.selected { border-color:var(--accent); background:var(--accent-light); }
  .share-note-item.in-community { opacity:0.45; cursor:not-allowed; }
  .sni-check { width:18px; height:18px; border-radius:4px; border:1.5px solid var(--border-2); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.15s; }
  .share-note-item.selected .sni-check { background:var(--accent); border-color:var(--accent); }
`;

export default function CommunityPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('trending');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [stats, setStats] = useState({ total:0, authors:0, downloads:0 });
  const [selected, setSelected] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [myNotes, setMyNotes] = useState([]);
  const [shareSelected, setShareSelected] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SUBJECTS = ['All','Mathematics','Physics','Chemistry','Biology','History','Computer Science','English','Economics','Other'];

  useEffect(() => {
    API.get('/community').then(res => {
      setNotes(res.data?.notes || res.data || []);
      if (res.data?.stats) setStats(res.data.stats);
    }).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return notes.filter(n => {
      const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
      const matchSubject = subject === 'All' || n.subject === subject;
      return matchSearch && matchSubject;
    }).sort((a, b) => {
      if (tab === 'trending') return (b.likes?.length||0) - (a.likes?.length||0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notes, search, subject, tab]);

  const handleLike = async (e, noteId) => {
    e.stopPropagation();
    try {
      const { data } = await API.post(`/community/${noteId}/like`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, likes: data.likes } : n));
    } catch { toast.error('Failed to like'); }
  };

  const handleDownload = async (e, noteId) => {
    e.stopPropagation();
    try {
      await API.post(`/community/${noteId}/download`);
      toast.success('Note saved to your dashboard!');
    } catch { toast.error('Download failed'); }
  };

  const openShare = async () => {
    try {
      const { data } = await API.get('/notes');
      setMyNotes(data || []);
    } catch {}
    setShareOpen(true);
  };

  const doShare = async () => {
    if (!shareSelected.length) return;
    setSharing(true);
    try {
      await Promise.all(shareSelected.map(id => API.post(`/community/share/${id}`)));
      toast.success(`${shareSelected.length} note${shareSelected.length>1?'s':''} shared!`);
      setShareOpen(false);
      setShareSelected([]);
      const { data } = await API.get('/community');
      setNotes(data?.notes || data || []);
    } catch { toast.error('Share failed'); }
    finally { setSharing(false); }
  };

  const isLiked = (note) => {
    const uid = JSON.parse(localStorage.getItem('user') || '{}')._id;
    return note.likes?.includes(uid);
  };

  return (
    <div className="cm-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="cm-main">
        {/* Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
          <div className="page-title-wrap">
            <div className="page-title-icon"><Users size={15} /></div>
            <span className="page-title">Community</span>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <button className="btn-primary" onClick={openShare}><Upload size={13} /> Share Note</button>
          </div>
        </div>

        <div className="pg-content">
          {/* Stats */}
          <div className="cm-stats-bar">
            {[
              { icon:Globe,        color:'#f97316', bg:'rgba(249,115,22,0.09)', val:stats.total||filtered.length,   lbl:'Public Notes' },
              { icon:Users,        color:'#7c3aed', bg:'rgba(124,58,237,0.09)', val:stats.authors||0,              lbl:'Contributors'  },
              { icon:TrendingUp,   color:'#16a34a', bg:'rgba(22,163,74,0.09)',  val:stats.downloads||0,            lbl:'Downloads'     },
            ].map(({ icon:Icon, color, bg, val, lbl }) => (
              <div key={lbl} className="cm-stat-chip">
                <div className="cm-stat-chip-icon" style={{ background:bg }}><Icon size={16} color={color} /></div>
                <div><div className="cm-stat-chip-val">{val}</div><div className="cm-stat-chip-lbl">{lbl}</div></div>
              </div>
            ))}
          </div>

          {/* Header: tabs + search */}
          <div className="cm-header-bar">
            <div className="tab-bar">
              {[
                { key:'trending', icon:TrendingUp, label:'Trending' },
                { key:'latest',   icon:Clock,      label:'Latest'   },
              ].map(({ key, icon:Icon, label }) => (
                <button key={key} className={`tab-item${tab===key?' active':''}`} onClick={() => setTab(key)}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
            <div className="search-wrapper" style={{ maxWidth:300, flex:1 }}>
              <Search size={14} color="var(--text-4)" />
              <input placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Subject pills */}
          <div className="cm-subjects">
            <span className="cm-subj-lbl">Filter:</span>
            {SUBJECTS.map(s => (
              <button key={s} className={`filter-chip${subject===s?' active-accent':''}`} onClick={() => setSubject(s)}>{s}</button>
            ))}
          </div>

          {/* Notes grid */}
          {loading ? (
            <div className="empty-state"><div className="spinner spinner-lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><BookOpen size={24} color="var(--text-4)" /></div>
              <h4 style={{ fontSize:14, fontWeight:700, color:'var(--text-2)' }}>No notes found</h4>
              <p style={{ fontSize:13 }}>Try a different search or subject filter</p>
            </div>
          ) : (
            <>
              <div className="cm-section-hd">
                <h3>{tab === 'trending' ? 'Trending' : 'Latest'}</h3>
                <div className="cm-section-line" />
                <span className="cm-section-count">{filtered.length}</span>
              </div>
              <div className="cm-grid">
                {filtered.map((note, i) => (
                  <div key={note._id} className="cm-card" style={{ animationDelay:`${i*0.04}s` }} onClick={() => setSelected(note)}>
                    <div className="cm-card-header">
                      <div className="cm-avatar" style={{ width:34, height:34, fontSize:13 }}>
                        {note.author?.avatar
                          ? <img src={note.author.avatar} alt="" />
                          : (note.author?.name?.[0] || 'U')}
                      </div>
                      <div>
                        <div className="cm-author-name">{note.author?.name || 'Anonymous'}</div>
                        <div className="cm-card-date">{new Date(note.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
                      </div>
                    </div>
                    {note.subject && <div className="cm-subject-tag"><BookOpen size={10} /> {note.subject}</div>}
                    <div className="cm-card-title">{note.title}</div>
                    <div className="cm-card-preview">{note.content?.replace(/<[^>]+>/g,'').slice(0,120)}</div>
                    <div className="cm-card-footer" onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className={`cm-act-btn${isLiked(note)?' liked':''}`} onClick={e => handleLike(e, note._id)}>
                          <Heart size={12} /> {note.likes?.length||0}
                        </button>
                        <button className="cm-act-btn">
                          <MessageCircle size={12} /> {note.comments?.length||0}
                        </button>
                      </div>
                      <button className="cm-act-btn dl" onClick={e => handleDownload(e, note._id)}>
                        <Download size={12} /> Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Note Detail Modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="nd-sheet" onClick={e => e.stopPropagation()}>
            <div className="nd-header">
              <div className="nd-author-row">
                <div className="cm-avatar" style={{ width:36, height:36, fontSize:14 }}>
                  {selected.author?.avatar ? <img src={selected.author.avatar} alt="" /> : (selected.author?.name?.[0]||'U')}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{selected.author?.name||'Anonymous'}</div>
                  <div style={{ fontSize:11, color:'var(--text-4)' }}>{new Date(selected.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
                </div>
                <button className="nd-close" onClick={() => setSelected(null)}><X size={14} /></button>
              </div>
              {selected.subject && <div className="cm-subject-tag" style={{ marginBottom:12 }}><BookOpen size={10} /> {selected.subject}</div>}
              <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text)', letterSpacing:'-0.5px', marginBottom:18 }}>{selected.title}</h2>
            </div>
            <div className="nd-body">
              <div style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.8 }} dangerouslySetInnerHTML={{ __html: selected.content }} />
            </div>
            <div className="nd-footer">
              <button className={`cm-act-btn${isLiked(selected)?' liked':''}`} onClick={e => handleLike(e, selected._id)}>
                <Heart size={13} /> {selected.likes?.length||0} Likes
              </button>
              <button className="btn-primary" style={{ marginLeft:'auto' }} onClick={e => handleDownload(e, selected._id)}>
                <Download size={13} /> Save to Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareOpen && (
        <div className="overlay" onClick={() => setShareOpen(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 className="share-title">Share a Note</h3>
              <button className="modal-close" onClick={() => setShareOpen(false)}><X size={14} /></button>
            </div>
            <div className="search-wrapper" style={{ marginBottom:12 }}>
              <Search size={13} color="var(--text-4)" />
              <input placeholder="Search your notes…" />
            </div>
            <div style={{ maxHeight:320, overflowY:'auto', marginBottom:14 }}>
              {myNotes.length === 0 ? (
                <div className="empty-state" style={{ padding:'32px 16px' }}>
                  <div className="empty-icon"><FileText size={20} color="var(--text-4)" /></div>
                  <p style={{ fontSize:13 }}>No notes to share yet</p>
                </div>
              ) : myNotes.map(note => {
                const sel = shareSelected.includes(note._id);
                const inCommunity = note.isPublic;
                return (
                  <div key={note._id} className={`share-note-item${sel?' selected':''}${inCommunity?' in-community':''}`}
                    onClick={() => {
                      if (inCommunity) return;
                      setShareSelected(prev => sel ? prev.filter(i=>i!==note._id) : [...prev, note._id]);
                    }}>
                    <div className="sni-check">
                      {sel && <CheckSquare size={12} color="#fff" />}
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', flex:1 }}>{note.title||'Untitled'}</span>
                    {inCommunity && <span className="badge-accent" style={{ fontSize:10 }}>Shared</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-secondary" style={{ flex:1 }} onClick={() => setShareOpen(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex:2 }} disabled={!shareSelected.length||sharing} onClick={doShare}>
                {sharing ? <><span className="spinner" /> Sharing…</> : <><Upload size={13} /> Share {shareSelected.length||''} Note{shareSelected.length!==1?'s':''}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}