// DashboardPage.jsx - Main notes workspace
// सभी notes यहाँ दिखते हैं, create/edit/delete/star/trash सब कुछ यहाँ होता है

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Star, Trash2, Menu, LayoutGrid,
  FilePlus, Upload, Globe, Lock, CheckCircle2,
  X
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

/* ─── CSS Styles ─────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Animations */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin     { to   { transform:rotate(360deg) } }
  @keyframes glow     { 0%,100%{box-shadow:0 0 10px rgba(204,255,0,0.2)} 50%{box-shadow:0 0 25px rgba(204,255,0,0.45)} }
  @keyframes slideIn  { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }

  /* ── Layout ── */
  .db-wrap  { display:flex; height:100dvh; overflow:hidden; background:#000; font-family:'Space Grotesk',sans-serif; color:#fff; }
  .db-main  { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; position:relative; }

  /* ── Topbar ── */
  .db-topbar {
    height:64px; display:flex; align-items:center; justify-content:space-between;
    padding:0 28px; background:#0a0a0a; border-bottom:1px solid #1c1c1c;
    flex-shrink:0; gap:12px;
  }
  .db-topbar-left  { display:flex; align-items:center; gap:14px; min-width:0; }
  .db-topbar-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

  /* Logo badge */
  .db-logo-badge {
    width:34px; height:34px; border-radius:10px; background:#ccff00;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }

  /* Search bar */
  .db-search {
    display:flex; align-items:center; gap:10px; background:#111;
    border:1px solid #222; border-radius:10px; padding:9px 14px; width:300px; transition:.25s;
  }
  .db-search:focus-within { border-color:#ccff00; box-shadow:0 0 0 3px rgba(204,255,0,.1); }
  .db-search input { border:none; outline:none; background:transparent; width:100%; font-size:14px; color:#fff; font-family:inherit; }
  .db-search input::placeholder { color:#555; }

  /* Menu button (mobile) */
  .db-menu-btn {
    display:none; background:#111; border:1px solid #222; border-radius:10px;
    cursor:pointer; padding:8px; color:#fff; align-items:center; justify-content:center;
    min-width:36px; height:36px; flex-shrink:0; transition:.2s;
  }
  .db-menu-btn:hover { border-color:#ccff00; }

  /* Primary CTA button */
  .btn-neon {
    display:flex; align-items:center; gap:7px; background:#ccff00; color:#000;
    border:none; border-radius:10px; padding:9px 18px; font-size:13px;
    font-weight:700; cursor:pointer; transition:.25s; white-space:nowrap;
    font-family:inherit; letter-spacing:.2px;
  }
  .btn-neon:hover { transform:translateY(-1px); box-shadow:0 4px 20px rgba(204,255,0,.35); }
  .btn-neon:active { transform:translateY(0); }

  /* Secondary button */
  .btn-dim {
    display:flex; align-items:center; gap:7px; background:#111; color:#aaa;
    border:1px solid #222; border-radius:10px; padding:9px 16px; font-size:13px;
    font-weight:600; cursor:pointer; transition:.2s; white-space:nowrap; font-family:inherit;
  }
  .btn-dim:hover { color:#fff; border-color:#444; background:#181818; }

  /* ── Content ── */
  .db-content { flex:1; overflow-y:auto; padding:32px 28px; scrollbar-width:none; }
  .db-content::-webkit-scrollbar { display:none; }

  /* Section header */
  .db-section-hd {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:24px; flex-wrap:wrap; gap:12px;
  }
  .db-section-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:800; color:#fff; letter-spacing:-.3px; }
  .db-count-badge {
    font-size:11px; font-weight:700; color:#ccff00; background:rgba(204,255,0,.1);
    padding:4px 10px; border-radius:20px; border:1px solid rgba(204,255,0,.2);
  }

  /* Filter bar */
  .db-filter-bar {
    display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap;
  }
  .db-filter-chip {
    padding:6px 14px; border-radius:20px; border:1px solid #222; background:#111;
    color:#888; font-size:12px; font-weight:600; cursor:pointer; transition:.2s;
    font-family:inherit;
  }
  .db-filter-chip:hover  { border-color:#ccff00; color:#ccff00; }
  .db-filter-chip.active { border-color:#ccff00; color:#000; background:#ccff00; }

  /* ── Note Cards Grid ── */
  .db-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:20px; }

  .db-card {
    background:#0d0d0d; border:1px solid #1c1c1c; border-radius:18px;
    padding:22px; display:flex; flex-direction:column; cursor:pointer;
    transition:.25s ease; animation:fadeUp .35s both; position:relative;
    overflow:hidden;
  }
  .db-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:transparent; transition:.25s;
  }
  .db-card:hover { border-color:#333; transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.6); }
  .db-card:hover::before { background:#ccff00; }
  .db-card.selected { border-color:#ccff00; background:#0f0f0a; }
  .db-card.selected::before { background:#ccff00; }

  /* Card top row */
  .db-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; gap:10px; }
  .db-card-title-wrap { display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1; }

  /* Checkbox */
  .db-check {
    width:18px; height:18px; border-radius:5px; border:1.5px solid #333;
    background:transparent; cursor:pointer; flex-shrink:0; appearance:none;
    -webkit-appearance:none; transition:.2s; margin-top:2px;
  }
  .db-check:checked { background:#ccff00; border-color:#ccff00; }
  .db-check:checked::after {
    content:''; display:block; width:5px; height:9px; border:2px solid #000;
    border-top:none; border-left:none; transform:rotate(45deg);
    margin:1px 0 0 5px;
  }

  .db-card-title { font-size:15px; font-weight:700; color:#f0f0f0; line-height:1.4; word-break:break-word; }
  .db-card-excerpt { font-size:13px; color:#666; line-height:1.65; margin-bottom:18px; flex:1; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

  /* Action buttons on card */
  .db-card-actions { display:flex; gap:6px; flex-shrink:0; }
  .db-icon-btn {
    width:30px; height:30px; border-radius:8px; border:1px solid #222; background:#111;
    color:#666; transition:.2s; cursor:pointer; display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .db-icon-btn:hover                { border-color:#ccff00; color:#ccff00; background:rgba(204,255,0,.07); }
  .db-icon-btn.starred              { border-color:rgba(204,255,0,.4); color:#ccff00; background:rgba(204,255,0,.1); }
  .db-icon-btn.trash:hover          { border-color:#ff4444; color:#ff4444; background:rgba(255,68,68,.07); }

  /* Card footer */
  .db-card-footer {
    display:flex; justify-content:space-between; align-items:center;
    border-top:1px solid #1c1c1c; padding-top:14px; margin-top:auto;
  }
  .db-card-date { font-size:11px; font-weight:600; color:#444; text-transform:uppercase; letter-spacing:.5px; }
  .db-card-meta { display:flex; align-items:center; gap:8px; }

  /* Privacy toggle pill */
  .db-privacy-toggle {
    display:flex; align-items:center; gap:5px; background:#111; border:1px solid #222;
    border-radius:20px; padding:3px 10px; cursor:pointer; transition:.2s;
    font-size:11px; font-weight:700; color:#888;
  }
  .db-privacy-toggle:hover     { border-color:#ccff00; color:#ccff00; }
  .db-privacy-toggle.public    { border-color:rgba(204,255,0,.4); color:#ccff00; background:rgba(204,255,0,.08); }

  /* ── Bulk Action Toolbar ── */
  .db-bulk-bar {
    position:sticky; top:0; z-index:20; margin-bottom:20px; padding:14px 20px;
    border-radius:14px; border:1px solid #ccff00; background:#0a0a0a;
    box-shadow:0 0 30px rgba(204,255,0,.15); animation:slideIn .25s ease;
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  }
  .db-bulk-bar-left  { display:flex; align-items:center; gap:10px; }
  .db-bulk-bar-right { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

  .db-bulk-select { background:#111; border:1px solid #333; border-radius:8px; padding:8px 10px; color:#fff; font-family:inherit; font-weight:600; font-size:13px; cursor:pointer; }

  /* ── Spinner & States ── */
  .db-spinner {
    width:28px; height:28px; border:2.5px solid #1c1c1c; border-top-color:#ccff00;
    border-radius:50%; animation:spin .75s linear infinite;
  }
  .db-empty {
    text-align:center; padding:80px 24px; background:#0a0a0a;
    border-radius:24px; border:1px dashed #1c1c1c;
  }

  /* ── Mobile FAB ── */
  .db-fab {
    position:fixed; bottom:90px; right:20px; width:54px; height:54px;
    background:#ccff00; color:#000; border-radius:50%; display:none;
    align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(204,255,0,.5); z-index:50; border:none;
    cursor:pointer; transition:.2s;
  }
  .db-fab:hover { transform:scale(1.08); }

  /* ── Responsive ── */
  @media(max-width:768px) {
    .db-menu-btn    { display:flex !important; }
    .db-search      { display:none; }
    .db-topbar      { padding:0 14px; height:56px; }
    .db-topbar-right .btn-dim { display:none; }
    .db-content     { padding:20px 14px; }
    .db-fab         { display:flex; }
    .db-grid        { grid-template-columns:1fr; gap:14px; }
    .db-section-hd  { margin-bottom:16px; }
    .btn-neon span  { display:none; }
    .btn-neon       { padding:9px 12px; }
  }
`;

/* ─── Helper: Privacy Toggle ─────────────────────────────────────────────── */
function PrivacyToggle({ isPublic, onClick }) {
  return (
    <button
      className={`db-privacy-toggle ${isPublic ? "public" : ""}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={isPublic ? "Public - click to make Private" : "Private - click to make Public"}
    >
      {isPublic ? <Globe size={11} /> : <Lock size={11} />}
      {isPublic ? "Public" : "Private"}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const importInputRef = useRef(null);

  // State
  const [notes,        setNotes]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [folders,      setFolders]      = useState([]);
  const [filter,       setFilter]       = useState("all"); // all | starred | public | private

  // URL params
  const activeFolderId      = searchParams.get("folder");
  const shareToCommunityMode = searchParams.get("shareToCommunity") === "1";
  const bulkMode            = shareToCommunityMode || searchParams.get("bulk") === "1";

  /* ── Data Loading ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeFolderId ? `/notes?folder=${activeFolderId}` : "/notes";
      const [notesRes, foldersRes] = await Promise.all([
        API.get(endpoint),
        API.get("/folders"),
      ]);
      setNotes(notesRes.data || []);
      setFolders(foldersRes.data || []);
    } catch {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  }, [activeFolderId]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Create Note ── */
  const createNote = async () => {
    try {
      const { data } = await API.post("/notes", {
        title: "New Note",
        content: "",
        folder: activeFolderId || null,
      });
      setNotes((prev) => [data, ...prev]);
      setSelectedNote(data);
    } catch {
      toast.error("Could not create note");
    }
  };

  /* ── Star Toggle ── */
  const toggleStar = async (note) => {
    try {
      const { data } = await API.patch(`/notes/${note._id}`, { isStarred: !note.isStarred });
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
      toast.success(data.isStarred ? "⭐ Starred!" : "Unstarred");
    } catch {
      toast.error("Could not update");
    }
  };

  /* ── Privacy Toggle ── */
  const togglePrivacy = async (note) => {
    try {
      const { data } = await API.patch(`/notes/${note._id}`, { isPublic: !note.isPublic });
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
      toast.success(data.isPublic ? "🌐 Now Public" : "🔒 Set to Private");
    } catch {
      toast.error("Could not update");
    }
  };

  /* ── Trash Note ── */
  const trashNote = async (noteId) => {
    try {
      await API.patch(`/notes/${noteId}`, { isTrashed: true });
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success("Moved to Trash 🗑️");
    } catch {
      toast.error("Could not trash note");
    }
  };

  /* ── Bulk: Move to Folder ── */
  const bulkMoveToFolder = async (folderId) => {
    if (!folderId || !selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => API.patch(`/notes/${id}`, { folder: folderId })));
      await loadData();
      setSelectedIds([]);
      toast.success(`Moved ${selectedIds.length} notes to folder`);
    } catch {
      toast.error("Move failed");
    }
  };

  /* ── Bulk: Delete ── */
  const bulkTrash = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => API.patch(`/notes/${id}`, { isTrashed: true })));
      setNotes((prev) => prev.filter((n) => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} notes moved to Trash`);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── Bulk: Publish to Community ── */
  const bulkPublish = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => API.patch(`/notes/${id}`, { isPublic: true })));
      setNotes((prev) =>
        prev.map((n) => (selectedIds.includes(n._id) ? { ...n, isPublic: true } : n))
      );
      setSelectedIds([]);
      toast.success("Published to Community! 🌐");
    } catch {
      toast.error("Publish failed");
    }
  };

  /* ── Toggle selection ── */
  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ── Filtered Notes ── */
  const filteredNotes = notes.filter((n) => {
    if (n.isTrashed) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.plainText?.toLowerCase().includes(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "starred" && n.isStarred) ||
      (filter === "public"  && n.isPublic) ||
      (filter === "private" && !n.isPublic);
    return matchesSearch && matchesFilter;
  });

  /* ── If note selected → open editor ── */
  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onUpdate={(updated) =>
          setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)))
        }
      />
    );
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="db-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="db-main">
        {/* ── Topbar ── */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="db-logo-badge">
              <LayoutGrid size={17} color="#000" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.3px" }}>
              Workspace
            </span>
          </div>

          <div className="db-search">
            <Search size={15} color="#555" />
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="db-topbar-right">
            <button className="btn-dim" onClick={() => importInputRef.current?.click()}>
              <Upload size={14} /> Import
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={() => {}}
            />
            <button className="btn-neon" onClick={createNote}>
              <Plus size={16} strokeWidth={3} />
              <span>New Note</span>
            </button>
          </div>
        </header>

        <div className="db-content">
          {/* ── Bulk Action Toolbar ── */}
          {(bulkMode || selectedIds.length > 0) && selectedIds.length > 0 && (
            <div className="db-bulk-bar">
              <div className="db-bulk-bar-left">
                <CheckCircle2 size={18} color="#ccff00" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {selectedIds.length} Selected
                </span>
              </div>
              <div className="db-bulk-bar-right">
                {/* Community publish */}
                {shareToCommunityMode && (
                  <button className="btn-neon" onClick={bulkPublish}>
                    <Globe size={14} /> Publish to Community
                  </button>
                )}
                {/* Move to folder */}
                <select
                  className="db-bulk-select"
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) bulkMoveToFolder(e.target.value); }}
                >
                  <option value="" disabled>Move to folder…</option>
                  {folders.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
                {/* Bulk delete */}
                <button
                  className="btn-dim"
                  style={{ color: "#ff5555", borderColor: "#331111" }}
                  onClick={bulkTrash}
                >
                  <Trash2 size={14} /> Delete
                </button>
                {/* Deselect all */}
                <button
                  className="btn-dim"
                  onClick={() => setSelectedIds([])}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Section Header ── */}
          <div className="db-section-hd">
            <h2 className="db-section-title">
              {activeFolderId ? "Folder Notes" : "All Notes"}
            </h2>
            {!loading && (
              <span className="db-count-badge">{filteredNotes.length} Files</span>
            )}
          </div>

          {/* ── Filter Chips ── */}
          <div className="db-filter-bar">
            {["all", "starred", "public", "private"].map((f) => (
              <button
                key={f}
                className={`db-filter-chip ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Content Area ── */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <div className="db-spinner" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="db-empty">
              <FilePlus
                size={44}
                color="#222"
                style={{ margin: "0 auto 16px", display: "block" }}
              />
              <h3 style={{ color: "#444", fontWeight: 700, marginBottom: 8 }}>
                {searchQuery ? "No matches found" : "Your workspace is empty"}
              </h3>
              <p style={{ color: "#333", fontSize: 13, marginBottom: 20 }}>
                {searchQuery ? "Try a different keyword" : "Create your first note to get started"}
              </p>
              {!searchQuery && (
                <button className="btn-neon" onClick={createNote} style={{ margin: "0 auto" }}>
                  <Plus size={16} strokeWidth={3} /> Create First Note
                </button>
              )}
            </div>
          ) : (
            <div className="db-grid">
              {filteredNotes.map((note, i) => (
                <div
                  key={note._id}
                  className={`db-card ${selectedIds.includes(note._id) ? "selected" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => {
                    // Bulk mode mein click = select; otherwise open editor
                    if (bulkMode || selectedIds.length > 0) {
                      setSelectedIds((prev) =>
                        prev.includes(note._id)
                          ? prev.filter((x) => x !== note._id)
                          : [...prev, note._id]
                      );
                    } else {
                      setSelectedNote(note);
                    }
                  }}
                >
                  {/* Card Top */}
                  <div className="db-card-top">
                    <div className="db-card-title-wrap">
                      {/* Multi-select checkbox - always visible on hover or in bulk mode */}
                      <input
                        type="checkbox"
                        className="db-check"
                        checked={selectedIds.includes(note._id)}
                        onChange={(e) => toggleSelect(note._id, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: bulkMode || selectedIds.length > 0 ? "block" : "" }}
                      />
                      <h3 className="db-card-title">{note.title || "Untitled"}</h3>
                    </div>

                    {/* Star button */}
                    <div className="db-card-actions">
                      <button
                        className={`db-icon-btn ${note.isStarred ? "starred" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleStar(note); }}
                        title="Star note"
                      >
                        <Star size={14} fill={note.isStarred ? "#ccff00" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <p className="db-card-excerpt">
                    {note.plainText || "Start writing something amazing…"}
                  </p>

                  {/* Card Footer */}
                  <div className="db-card-footer">
                    <span className="db-card-date">
                      {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="db-card-meta">
                      {/* Privacy toggle - Public/Private */}
                      <PrivacyToggle
                        isPublic={note.isPublic}
                        onClick={() => togglePrivacy(note)}
                      />
                      {/* Trash button */}
                      <button
                        className="db-icon-btn trash"
                        onClick={(e) => { e.stopPropagation(); trashNote(note._id); }}
                        title="Move to Trash"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <button className="db-fab" onClick={createNote}>
        <Plus size={26} strokeWidth={3} />
      </button>

      <MobileNav />
    </div>
  );
}
