import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Loader2, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  body { background: #f5f5f3; color: #1a1a1a; font-family: 'Plus Jakarta Sans', sans-serif; }

  .login-root { display: flex; min-height: 100vh; background: #f5f5f3; }

  /* LEFT */
  .login-left {
    flex: 1.1; background: #1a1a1a; display: flex; flex-direction: column;
    justify-content: space-between; padding: 56px; position: relative; overflow: hidden;
  }
  .left-deco {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%);
    top: -80px; right: -80px; pointer-events: none;
  }
  .left-deco2 {
    position: absolute; width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
    bottom: 120px; left: -60px; pointer-events: none;
  }

  .brand-logo {
    font-size: 22px; font-weight: 900; letter-spacing: -0.5px;
    position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px;
  }
  .brand-logo .logo-dot { 
    width: 28px; height: 28px; background: #f97316; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-txt { color: #ffffff; }
  .brand-accent { color: #f97316; }

  .left-content { position: relative; z-index: 1; }
  .left-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3);
    color: #f97316; border-radius: 100px; padding: 5px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    margin-bottom: 28px;
  }
  .left-title {
    font-size: clamp(36px, 4vw, 52px); font-weight: 900; color: #ffffff;
    line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px;
  }
  .left-title em { color: #f97316; font-style: normal; }
  .left-desc { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.65; max-width: 360px; }

  .feat-stack { display: flex; flex-direction: column; gap: 20px; margin-top: 48px; }
  .feat-item { display: flex; align-items: center; gap: 16px; }
  .feat-ico {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .feat-text h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .feat-text p { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

  .left-footer {
    position: relative; z-index: 1;
    border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;
    display: flex; align-items: center; gap: 16px;
  }
  .footer-dot { width: 8px; height: 8px; border-radius: 50%; background: #f97316; }
  .footer-label { font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 600; }

  /* RIGHT */
  .login-right {
    flex: 1; background: #f5f5f3; display: flex; align-items: center;
    justify-content: center; padding: 56px 6%;
  }

  .form-container {
    width: 100%; max-width: 400px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .form-header { margin-bottom: 36px; }
  .form-title { font-size: 30px; font-weight: 900; color: #1a1a1a; letter-spacing: -1px; margin-bottom: 8px; }
  .form-subtitle { font-size: 15px; color: #888580; }

  .input-group { margin-bottom: 18px; }
  .input-label {
    display: block; font-size: 12px; font-weight: 700; color: #888580;
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;
  }
  .input-wrap { position: relative; }
  .input-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #b0ada6; pointer-events: none; }
  .form-input {
    width: 100%; padding: 13px 14px 13px 42px;
    background: #ffffff; border: 1.5px solid #e8e6e1;
    border-radius: 10px; font-size: 15px; font-weight: 500;
    color: #1a1a1a; font-family: inherit; outline: none; transition: all 0.18s;
  }
  .form-input::placeholder { color: #c8c5be; }
  .form-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }

  .forgot-link {
    display: block; text-align: right; font-size: 13px; font-weight: 700;
    color: #f97316; text-decoration: none; margin-top: -8px; margin-bottom: 24px;
  }
  .forgot-link:hover { color: #ea6c0a; }

  .btn-submit {
    width: 100%; padding: 14px; background: #1a1a1a; color: #ffffff;
    border: none; border-radius: 10px; font-size: 15px; font-weight: 800;
    font-family: inherit; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 9px;
  }
  .btn-submit:hover:not(:disabled) {
    background: #f97316;
    box-shadow: 0 6px 20px rgba(249,115,22,0.25);
  }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .register-prompt { text-align: center; margin-top: 28px; font-size: 14px; color: #888580; }
  .register-link { color: #f97316; font-weight: 700; text-decoration: none; }
  .register-link:hover { text-decoration: underline; }

  .divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .divider-line { flex: 1; height: 1px; background: #e8e6e1; }
  .divider-txt { font-size: 12px; font-weight: 600; color: #b0ada6; }

  @media(max-width: 960px) {
    .login-left { display: none; }
    .login-right { padding: 40px 24px; background: #ffffff; min-height: 100vh; }
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="login-root">
      <style>{STYLES}</style>

      <div className="login-left">
        <div className="left-deco" />
        <div className="left-deco2" />

        <div className="brand-logo">
          <div className="logo-dot">
            <BookOpen size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="brand-txt">Your</span><span className="brand-accent">Notes</span>
        </div>

        <div className="left-content">
          <div className="left-tag"><Sparkles size={11} /> Smart note-taking</div>
          <h2 className="left-title">Think clearer.<br /><em>Study smarter.</em></h2>
          <p className="left-desc">Your notes, flashcards, and AI summaries — all in one minimal workspace.</p>

          <div className="feat-stack">
            <div className="feat-item">
              <div className="feat-ico"><Sparkles size={18} color="#f97316" /></div>
              <div className="feat-text">
                <h4>AI-Powered Summaries</h4>
                <p>Auto-generate study materials from any note.</p>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-ico"><ShieldCheck size={18} color="#8b5cf6" /></div>
              <div className="feat-text">
                <h4>Private & Secure</h4>
                <p>Your intellectual work stays yours, always.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <div className="footer-dot" />
          <span className="footer-label">S.V. Polytechnic College, Bhopal · 2026</span>
        </div>
      </div>

      <div className="login-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrap">
                <Mail size={16} className="input-ico" />
                <input type="email" placeholder="name@example.com" value={form.email} onChange={updateField('email')} className="form-input" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-ico" />
                <input type="password" placeholder="••••••••" value={form.password} onChange={updateField('password')} className="form-input" required />
              </div>
            </div>

            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</>
                : <>Sign in <ArrowRight size={17} strokeWidth={2.5} /></>}
            </button>
          </form>

          <p className="register-prompt">
            New here? <Link to="/register" className="register-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Star, Trash2, Menu, FilePlus, Globe, Lock, CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { useTheme } from "../context/ThemeContext";

// Hindi: CSS variables use karo taaki dark/light mode automatic kaam kare
const getStyles = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .db-wrap { display: flex; height: 100dvh; overflow: hidden; background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; }
  .db-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  .db-topbar {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; background: var(--surface); border-bottom: 1px solid var(--border); flex-shrink: 0; gap: 12px;
  }
  .db-topbar-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .db-menu-btn {
    display: none; background: transparent; border: 1px solid var(--border);
    border-radius: 7px; cursor: pointer; padding: 7px; color: var(--text-muted);
    align-items: center; justify-content: center; transition: 0.15s;
  }
  .db-menu-btn:hover { border-color: var(--accent); color: var(--accent); }

  .page-label { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }

  .search-box {
    display: flex; align-items: center; gap: 9px;
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 9px; padding: 8px 14px; width: 280px; transition: 0.2s;
  }
  .search-box:focus-within { border-color: var(--accent); background: var(--surface); box-shadow: 0 0 0 3px var(--accent-light); }
  .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; font-weight: 500; color: var(--text); font-family: inherit; }
  .search-box input::placeholder { color: var(--text-light); }

  .btn-new {
    background: var(--text); color: var(--surface); border: none; border-radius: 9px; padding: 9px 18px;
    font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit;
    display: flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .btn-new:hover { background: var(--accent); color: #fff; box-shadow: 0 4px 14px rgba(249,115,22,0.25); }

  .db-content { flex: 1; overflow-y: auto; padding: 28px 32px; scrollbar-width: none; background: var(--bg); }
  .db-content::-webkit-scrollbar { display: none; }

  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .section-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }
  .count-pill { background: var(--bg); border: 1px solid var(--border); color: var(--text-muted); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }

  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

  .note-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px;
    cursor: pointer; transition: all 0.2s; animation: fadeUp 0.35s both;
    display: flex; flex-direction: column;
  }
  .note-card:hover { border-color: var(--accent); box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .note-card.selected { border-color: var(--accent); background: var(--accent-light); border-width: 1.5px; }

  .note-title { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1.35; }
  .note-excerpt { font-size: 13px; color: var(--text-muted); line-height: 1.65; margin-bottom: 18px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  .note-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 14px; }
  .note-date { font-size: 11px; font-weight: 600; color: var(--text-light); }

  .ico-btn {
    width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border);
    background: transparent; color: var(--text-light); display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: 0.15s;
  }
  .ico-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .ico-btn.starred { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }

  .bulk-bar {
    position: sticky; top: 0; z-index: 50; margin-bottom: 16px; padding: 12px 20px;
    background: var(--surface); border-radius: 12px; border: 1.5px solid var(--accent);
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 4px 16px rgba(249,115,22,0.1); animation: fadeUp 0.2s ease;
  }

  .db-spinner { width: 24px; height: 24px; border: 2.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; }

  .db-empty {
    text-align: center; padding: 80px 20px; border: 1.5px dashed var(--border); border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }

  @media (max-width: 768px) {
    .db-topbar { padding: 0 14px; height: 52px; }
    .search-box { display: none; }
    .db-menu-btn { display: flex; }
    .db-content { padding: 14px; padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
    .db-grid { grid-template-columns: 1fr; gap: 10px; }
    .note-card { padding: 16px; }
    .btn-new span { display: none; }
  }
`;

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  // Hindi: isDark se current theme pata karo
  const { isDark } = useTheme();

  const activeFolderId = searchParams.get("folder");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeFolderId ? `/notes?folder=${activeFolderId}` : "/notes";
      const { data } = await API.get(endpoint);
      setNotes(data || []);
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", { title: "Untitled Note", content: "", folder: activeFolderId });
      setNotes(prev => [data, ...prev]);
      setSelectedNote(data);
    } catch { toast.error("Could not create note"); }
  };

  // Hindi: Star toggle karne ka function
  const toggleStar = async (e, noteId) => {
    e.stopPropagation();
    try {
      const { data } = await API.patch(`/notes/${noteId}/star`);
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isStarred: data.isStarred } : n));
    } catch { toast.error("Could not update star"); }
  };

  // Hindi: Note trash mein daalne ka function
  const trashNote = async (e, noteId) => {
    e.stopPropagation();
    try {
      await API.patch(`/notes/${noteId}/trash`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("Moved to trash");
    } catch { toast.error("Could not delete note"); }
  };

  // Hindi: Bulk delete — selected notes trash karo
  const bulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => API.patch(`/notes/${id}/trash`)));
      setNotes(prev => prev.filter(n => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} notes moved to trash`);
    } catch { toast.error("Bulk delete failed"); }
  };

  const filteredNotes = notes.filter(n =>
    !n.isTrashed &&
    (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     n.plainText?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedNote) {
    return <NoteEditor note={selectedNote} onClose={() => setSelectedNote(null)} onUpdate={(u) => setNotes(prev => prev.map(n => n._id === u._id ? u : n))} />;
  }

  return (
    <div className="db-wrap">
      <style>{getStyles(isDark)}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <span className="page-label">{activeFolderId ? "Folder" : "My Notes"}</span>
          </div>

          <div className="search-box">
            <Search size={15} color="var(--text-light)" />
            <input placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <button className="btn-new" onClick={createNote}>
            <Plus size={16} strokeWidth={2.5} /> <span>New Note</span>
          </button>
        </header>

        <div className="db-content">
          {selectedIds.length > 0 && (
            <div className="bulk-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{selectedIds.length} selected</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={bulkDelete} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'inherit' }}><X size={14} /></button>
              </div>
            </div>
          )}

          <div className="section-hd">
            <h2 className="section-title">{activeFolderId ? "Folder Notes" : "All Notes"}</h2>
            {!loading && <span className="count-pill">{filteredNotes.length}</span>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="db-spinner" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="db-empty">
              <FilePlus size={40} color="var(--border)" />
              <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: 16 }}>No notes yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Create your first note to get started.</p>
              <button className="btn-new" onClick={createNote} style={{ marginTop: 4 }}>
                <Plus size={16} /> Create Note
              </button>
            </div>
          ) : (
            <div className="db-grid">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`note-card${selectedIds.includes(note._id) ? ' selected' : ''}`}
                  onClick={() => selectedIds.length > 0
                    ? setSelectedIds(prev => prev.includes(note._id) ? prev.filter(x => x !== note._id) : [...prev, note._id])
                    : setSelectedNote(note)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <h3 className="note-title">{note.title || "Untitled Note"}</h3>
                    <button className={`ico-btn${note.isStarred ? ' starred' : ''}`} onClick={e => toggleStar(e, note._id)}>
                      <Star size={13} fill={note.isStarred ? "#f59e0b" : "none"} />
                    </button>
                  </div>

                  <p className="note-excerpt">{note.plainText || "Click to start writing..."}</p>

                  <div className="note-footer">
                    <span className="note-date">{new Date(note.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {note.isPublic ? <Globe size={12} color="var(--purple)" /> : <Lock size={12} color="var(--text-light)" />}
                      <button className="ico-btn" onClick={e => trashNote(e, note._id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Hindi: Mobile floating action button */}
      <button
        className="mobile-fab"
        onClick={createNote}
        aria-label="Create note"
        style={{
          position: 'fixed', bottom: 76, right: 16,
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--accent)', color: '#fff', border: 'none',
          cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(249,115,22,0.3)', zIndex: 199, transition: 'transform 0.18s',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
      <MobileNav />
    </div>
  );
}