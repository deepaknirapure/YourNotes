import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Heart, Bookmark, Download, MessageCircle,
  Search, Filter, X, Plus, FileText, Image, ChevronLeft, ChevronRight,
  Loader, Send, ExternalLink, Trash2, Users
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const EXAMS = ["All", "JEE", "NEET", "GATE", "UPSC", "CA", "Class 10", "Class 12", "Other"];
const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most Downloaded" },
];

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "", description: "", subject: "", exam: "Other", tags: "",
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) return toast.error("Sirf PDF aur images allowed hain");
    if (f.size > 10 * 1024 * 1024) return toast.error("File 10MB se chhoti honi chahiye");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Title required hai");
    if (!form.subject.trim()) return toast.error("Subject required hai");
    if (!file) return toast.error("File select karo");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", file);
      await API.post("/community/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Note upload ho gaya! 🎉");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>
            Note Upload Karo
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* File Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("yn-file-input").click()}
            style={{
              border: `2px dashed ${dragging ? "#E55B2D" : file ? "rgba(16,185,129,.5)" : "rgba(255,255,255,.15)"}`,
              borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer",
              background: dragging ? "rgba(229,91,45,.05)" : file ? "rgba(16,185,129,.05)" : "transparent",
              transition: "all .2s",
            }}
          >
            <input id="yn-file-input" type="file" accept=".pdf,image/*" style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{file.type === "application/pdf" ? "📄" : "🖼️"}</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>{file.name}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <Upload size={28} style={{ color: "rgba(255,255,255,.3)", marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>
                  PDF ya image drag karo ya click karo
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>Max 10MB • PDF, JPG, PNG, WEBP</p>
              </div>
            )}
          </div>

          {[
            { label: "Title *", key: "title", ph: "e.g. Physics Chapter 5 — Waves" },
            { label: "Subject *", key: "subject", ph: "e.g. Physics, Chemistry, Maths" },
            { label: "Description", key: "description", ph: "Yeh notes kiske baare mein hain? (optional)", type: "textarea" },
            { label: "Tags", key: "tags", ph: "#jee, #waves, #physics (comma separated)" },
          ].map(({ label, key, ph, type }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 7 }}>
                {label}
              </label>
              {type === "textarea" ? (
                <textarea value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph} rows={3}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
              ) : (
                <input type="text" value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif" }} />
              )}
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 7 }}>
              Exam Category
            </label>
            <select value={form.exam} onChange={(e) => setForm(f => ({ ...f, exam: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
              {EXAMS.filter(e => e !== "All").map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <button onClick={submit} disabled={loading}
            style={{ padding: "13px 24px", background: loading ? "rgba(229,91,45,.5)" : "#E55B2D", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            {loading ? <><Loader size={16} style={{ animation: "ynSpin 1s linear infinite" }} /> Uploading...</> : <><Upload size={16} /> Upload Note</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, currentUserId, onLike, onSave, onDownload, onDelete, onClick }) {
  return (
    <div onClick={() => onClick(note)} style={{
      background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14,
      padding: "20px", cursor: "pointer", transition: "all .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(229,91,45,.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* File type badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: note.fileType === "pdf" ? "rgba(229,91,45,.15)" : "rgba(139,92,246,.15)", borderRadius: 20 }}>
          {note.fileType === "pdf" ? <FileText size={12} color="#E55B2D" /> : <Image size={12} color="#8b5cf6" />}
          <span style={{ fontSize: 11, fontWeight: 700, color: note.fileType === "pdf" ? "#E55B2D" : "#8b5cf6", textTransform: "uppercase" }}>
            {note.fileType}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>
          {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {note.title}
      </h3>

      {note.description && (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>
          {note.description}
        </p>
      )}

      {/* Subject + Exam */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontSize: 11, padding: "3px 9px", background: "rgba(255,255,255,.06)", borderRadius: 20, color: "rgba(255,255,255,.55)", fontWeight: 600 }}>
          {note.subject}
        </span>
        {note.exam && note.exam !== "Other" && (
          <span style={{ fontSize: 11, padding: "3px 9px", background: "rgba(16,185,129,.1)", borderRadius: 20, color: "#10b981", fontWeight: 600 }}>
            {note.exam}
          </span>
        )}
      </div>

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
          {note.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{ fontSize: 10, padding: "2px 7px", background: "rgba(99,102,241,.12)", borderRadius: 20, color: "rgba(129,140,248,.8)" }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Uploader */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#E55B2D,#c94d23)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {(note.uploadedBy?.name?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.7)", marginBottom: 1 }}>
            {note.uploadedBy?.name || "Anonymous"}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>
            {note.uploadedBy?.totalPublicUploads || 0} uploads
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <ActionBtn icon={<Heart size={13} fill={note.likedByMe ? "#ef4444" : "none"} />}
          label={note.likesCount || 0} active={note.likedByMe} activeColor="#ef4444"
          onClick={(e) => { e.stopPropagation(); onLike(note._id); }} />
        <ActionBtn icon={<Bookmark size={13} fill={note.savedByMe ? "#f59e0b" : "none"} />}
          label={note.savesCount || 0} active={note.savedByMe} activeColor="#f59e0b"
          onClick={(e) => { e.stopPropagation(); onSave(note._id); }} />
        <ActionBtn icon={<Download size={13} />} label={note.downloads || 0}
          onClick={(e) => { e.stopPropagation(); onDownload(note); }} />
        <ActionBtn icon={<MessageCircle size={13} />} label={note.comments?.length || 0}
          onClick={(e) => { e.stopPropagation(); onClick(note); }} />
        {note.uploadedBy?._id === currentUserId && (
          <div style={{ marginLeft: "auto" }}>
            <ActionBtn icon={<Trash2 size={13} />} label="" activeColor="#ef4444"
              onClick={(e) => { e.stopPropagation(); onDelete(note._id); }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, active, activeColor = "#E55B2D", onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
      background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: 8,
      cursor: "pointer", color: active ? activeColor : "rgba(255,255,255,.35)",
      fontSize: 12, fontWeight: 600, transition: "all .15s", fontFamily: "'DM Sans', sans-serif",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = activeColor; e.currentTarget.style.color = activeColor; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.color = active ? activeColor : "rgba(255,255,255,.35)"; }}
    >
      {icon}{label !== "" && label}
    </button>
  );
}

// ── Note Detail Modal ─────────────────────────────────────────────────────────
function NoteDetailModal({ note: initialNote, currentUserId, onClose, onLike, onSave, onDownload }) {
  const [note, setNote] = useState(initialNote);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    API.get(`/community/${initialNote._id}`)
      .then(r => { setNote(r.data); setComments(r.data.comments || []); })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [initialNote._id]);

  const submitComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/community/${note._id}/comment`, { text: comment });
      setComments(c => [...c, data.comment]);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Comment failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{note.title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              {note.subject} {note.exam !== "Other" && `• ${note.exam}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)" }}><X size={20} /></button>
        </div>

        {/* Uploader */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,.03)", borderRadius: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#E55B2D,#c94d23)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
            {(note.uploadedBy?.name?.[0] || "U").toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{note.uploadedBy?.name}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
              {note.uploadedBy?.totalPublicUploads || 0} notes uploaded
            </p>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Description */}
        {note.description && (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.7, marginBottom: 20, padding: "12px 16px", background: "rgba(255,255,255,.03)", borderRadius: 10 }}>
            {note.description}
          </p>
        )}

        {/* Preview */}
        <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
          {note.fileType === "image" ? (
            <img src={note.fileUrl} alt={note.title} style={{ width: "100%", maxHeight: 340, objectFit: "contain", background: "#000" }} />
          ) : (
            <div style={{ background: "rgba(229,91,45,.05)", padding: "28px", textAlign: "center", borderRadius: 12 }}>
              <FileText size={40} color="#E55B2D" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginBottom: 16 }}>{note.fileName || "PDF Document"}</p>
              <a href={note.fileUrl} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "rgba(229,91,45,.15)", border: "1px solid rgba(229,91,45,.3)", borderRadius: 8, color: "#E55B2D", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                <ExternalLink size={13} /> Preview PDF
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button onClick={() => { onLike(note._id); setNote(n => ({ ...n, likedByMe: !n.likedByMe, likesCount: n.likedByMe ? n.likesCount - 1 : n.likesCount + 1 })); }}
            style={{ flex: 1, padding: "10px", background: note.likedByMe ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.05)", border: `1px solid ${note.likedByMe ? "rgba(239,68,68,.3)" : "rgba(255,255,255,.08)"}`, borderRadius: 10, color: note.likedByMe ? "#ef4444" : "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}>
            <Heart size={14} fill={note.likedByMe ? "#ef4444" : "none"} /> {note.likesCount || 0} Likes
          </button>
          <button onClick={() => { onSave(note._id); setNote(n => ({ ...n, savedByMe: !n.savedByMe })); }}
            style={{ flex: 1, padding: "10px", background: note.savedByMe ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.05)", border: `1px solid ${note.savedByMe ? "rgba(245,158,11,.3)" : "rgba(255,255,255,.08)"}`, borderRadius: 10, color: note.savedByMe ? "#f59e0b" : "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}>
            <Bookmark size={14} fill={note.savedByMe ? "#f59e0b" : "none"} /> Save
          </button>
          <button onClick={() => onDownload(note)}
            style={{ flex: 1, padding: "10px", background: "#E55B2D", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}>
            <Download size={14} /> Download
          </button>
        </div>

        {/* Comments */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
            Comments ({comments.length})
          </h4>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitComment()}
              placeholder="Comment likho..."
              style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 14, color: "#fff", fontFamily: "'DM Sans',sans-serif" }} />
            <button onClick={submitComment} disabled={submitting || !comment.trim()}
              style={{ padding: "0 16px", background: "#E55B2D", border: "none", borderRadius: 10, color: "#fff", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? <Loader size={14} style={{ animation: "ynSpin 1s linear infinite" }} /> : <Send size={14} />}
            </button>
          </div>
          {loadingComments ? (
            <div style={{ textAlign: "center", padding: 20 }}><Loader size={18} color="rgba(255,255,255,.3)" style={{ animation: "ynSpin 1s linear infinite" }} /></div>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.25)", textAlign: "center", padding: "16px 0" }}>Koi comment nahi abhi tak</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {comments.map((c, i) => (
                <div key={i} style={{ padding: "10px 14px", background: "rgba(255,255,255,.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#E55B2D,#c94d23)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
                      {(c.user?.name?.[0] || "U").toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.6)" }}>{c.user?.name}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginLeft: "auto" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Community Page ───────────────────────────────────────────────────────
export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [exam, setExam] = useState("All");
  const [sort, setSort] = useState("latest");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, sort });
      if (exam !== "All") params.set("exam", exam);
      if (search) params.set("search", search);
      const { data } = await API.get(`/community/feed?${params}`);
      setNotes(data.notes);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error("Feed load nahi ho saka");
    } finally { setLoading(false); }
  }, [page, exam, search, sort]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleLike = async (id) => {
    try {
      const { data } = await API.post(`/community/${id}/like`);
      setNotes(ns => ns.map(n => n._id === id
        ? { ...n, likedByMe: data.liked, likesCount: data.likesCount } : n));
    } catch { toast.error("Like failed"); }
  };

  const handleSave = async (id) => {
    try {
      const { data } = await API.post(`/community/${id}/save`);
      setNotes(ns => ns.map(n => n._id === id
        ? { ...n, savedByMe: data.saved } : n));
      toast.success(data.saved ? "Saved!" : "Unsaved");
    } catch { toast.error("Save failed"); }
  };

  const handleDownload = async (note) => {
    try {
      const { data } = await API.post(`/community/${note._id}/download`);
      window.open(data.fileUrl, "_blank");
      setNotes(ns => ns.map(n => n._id === note._id ? { ...n, downloads: data.downloads } : n));
    } catch { toast.error("Download failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yeh note delete karna chahte ho?")) return;
    try {
      await API.delete(`/community/${id}`);
      toast.success("Note delete ho gaya");
      fetchNotes();
    } catch { toast.error("Delete failed"); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes ynFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        input,select,textarea{outline:none;color:#fff}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.25)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
      `}</style>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchNotes} />}
      {selectedNote && (
        <NoteDetailModal note={selectedNote} currentUserId={user?._id}
          onClose={() => setSelectedNote(null)}
          onLike={handleLike} onSave={handleSave} onDownload={handleDownload} />
      )}

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 5%", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,.15)" }}>|</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
            Your<span style={{ color: "#E55B2D" }}>Notes</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(255,255,255,.05)", borderRadius: 20 }}>
            <Users size={13} color="rgba(255,255,255,.4)" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{total} notes</span>
          </div>
          <button onClick={() => setShowUpload(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#E55B2D", border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            <Plus size={15} /> Upload Note
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36, animation: "ynFadeIn .5s cubic-bezier(.16,1,.3,1) both" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: "-1px", color: "#fff", marginBottom: 8 }}>
            Community <span style={{ color: "#E55B2D" }}>Notes</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.4)" }}>
            Students ke notes — sabke liye, sabke dwara
          </p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", animation: "ynFadeIn .5s .1s cubic-bezier(.16,1,.3,1) both", opacity: 0, animationFillMode: "forwards" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", flex: 1, minWidth: 240, gap: 0 }}>
            <div style={{ display: "flex", flex: 1, background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: "10px 0 0 10px", alignItems: "center", paddingLeft: 14 }}>
              <Search size={15} color="rgba(255,255,255,.3)" />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Notes dhundo..."
                style={{ flex: 1, padding: "10px 12px", background: "none", border: "none", fontSize: 14 }} />
            </div>
            <button type="submit" style={{ padding: "0 16px", background: "#E55B2D", border: "none", borderRadius: "0 10px 10px 0", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              Search
            </button>
          </form>

          <select value={exam} onChange={e => { setExam(e.target.value); setPage(1); }}
            style={{ padding: "10px 14px", background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 14, minWidth: 120 }}>
            {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            style={{ padding: "10px 14px", background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 14, minWidth: 150 }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {(search || exam !== "All") && (
            <button onClick={() => { setSearch(""); setSearchInput(""); setExam("All"); setPage(1); }}
              style={{ padding: "10px 14px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <Loader size={32} color="#E55B2D" style={{ animation: "ynSpin 1s linear infinite" }} />
          </div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Koi note nahi mila</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.35)", marginBottom: 24 }}>
              {search ? `"${search}" ke liye koi result nahi` : "Pehle note upload karo!"}
            </p>
            <button onClick={() => setShowUpload(true)}
              style={{ padding: "11px 24px", background: "#E55B2D", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
              Pehla Note Upload Karo
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, animation: "ynFadeIn .5s .15s cubic-bezier(.16,1,.3,1) both", opacity: 0, animationFillMode: "forwards" }}>
            {notes.map(note => (
              <NoteCard key={note._id} note={note} currentUserId={user?._id}
                onLike={handleLike} onSave={handleSave}
                onDownload={handleDownload} onDelete={handleDelete}
                onClick={setSelectedNote} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 40 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "9px 16px", background: page === 1 ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: page === 1 ? "rgba(255,255,255,.2)" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              <ChevronLeft size={15} /> Prev
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "9px 16px", background: page === totalPages ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: page === totalPages ? "rgba(255,255,255,.2)" : "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
