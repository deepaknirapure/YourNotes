import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, RotateCcw, X, ArrowLeft, AlertTriangle, FileText, RefreshCw } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  @keyframes shake { 0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)} }
  .tr-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:18px 20px; animation:fadeUp .4s both; transition:border-color .2s,box-shadow .2s; }
  .tr-card:hover { border-color:rgba(229,91,45,.2); box-shadow:0 8px 24px rgba(0,0,0,.3); }
  .tr-btn { border:none; border-radius:9px; padding:8px 14px; font-family:inherit; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .2s; }
  .tr-btn:hover { transform:translateY(-1px); }
  .tr-restore { background:rgba(16,185,129,.12); color:#10b981; }
  .tr-restore:hover { background:rgba(16,185,129,.2); }
  .tr-delete { background:rgba(239,68,68,.1); color:#ef4444; }
  .tr-delete:hover { background:rgba(239,68,68,.18); }
  .tr-empty-all { background:rgba(239,68,68,.1); color:#ef4444; border:1px solid rgba(239,68,68,.25); border-radius:10px; padding:10px 20px; font-family:inherit; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all .2s; }
  .tr-empty-all:hover { background:rgba(239,68,68,.18); }
`;

export default function TrashPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/notes");
      setNotes((data || []).filter(n => n.isTrashed));
    } catch {
      toast.error("Trash load nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  const restoreNote = async (noteId) => {
    setActionLoading(noteId + "_restore");
    try {
      await API.patch(`/notes/${noteId}/restore`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success("Note restore ho gaya! ✅");
    } catch {
      toast.error("Restore nahi ho saka");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNote = async (noteId) => {
    setActionLoading(noteId + "_delete");
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setConfirmId(null);
      toast.success("Note permanently delete ho gaya");
    } catch {
      toast.error("Delete nahi ho saka");
    } finally {
      setActionLoading(null);
    }
  };

  const emptyTrash = async () => {
    setActionLoading("all");
    try {
      await Promise.all(notes.map(n => API.delete(`/notes/${n._id}`)));
      setNotes([]);
      setConfirmAll(false);
      toast.success("Trash empty ho gaya 🗑️");
    } catch {
      toast.error("Kuch notes delete nahi ho sake");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "32px 24px" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <button onClick={() => navigate("/home")} style={{
          background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 28, padding: 0,
          fontFamily: "inherit", transition: "color .2s"
        }}
          onMouseOver={e => e.currentTarget.style.color = "#fff"}
          onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,.4)"}>
          <ArrowLeft size={16} /> Home
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ background: "rgba(239,68,68,.12)", borderRadius: 12, padding: 10, color: "#ef4444" }}>
                <Trash2 size={24} />
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800 }}>Trash</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
              {notes.length} note{notes.length !== 1 ? "s" : ""} trash mein {notes.length > 0 ? "— restore karo ya permanently delete karo" : ""}
            </p>
          </div>

          {notes.length > 0 && !confirmAll && (
            <button className="tr-empty-all" onClick={() => setConfirmAll(true)}>
              <Trash2 size={15} /> Trash Empty Karo
            </button>
          )}

          {confirmAll && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 12, padding: "14px 18px", maxWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
                <AlertTriangle size={16} /> Pakka sure ho?
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 12 }}>Saare {notes.length} notes permanently delete ho jayenge. Wapas nahi aayenge.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tr-delete" onClick={emptyTrash} style={{ flex: 1, justifyContent: "center" }}
                  disabled={actionLoading === "all"}>
                  {actionLoading === "all" ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
                  Haan, Delete Karo
                </button>
                <button className="tr-btn" onClick={() => setConfirmAll(false)}
                  style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)" }}>
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 20px", animation: "pulse 1.2s infinite" }}>
                <div style={{ width: "60%", height: 16, background: "#1a1a1a", borderRadius: 6, marginBottom: 10 }} />
                <div style={{ width: "30%", height: 12, background: "#1a1a1a", borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.04)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Trash2 size={36} color="rgba(255,255,255,.15)" />
            </div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Trash Khali Hai</h3>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Koi bhi deleted note yahan dikhega</p>
            <button onClick={() => navigate("/dashboard")} style={{
              marginTop: 24, background: "#E55B2D", border: "none", borderRadius: 10,
              padding: "10px 20px", color: "#fff", cursor: "pointer", fontSize: 14,
              fontFamily: "inherit", fontWeight: 600
            }}>
              Dashboard Par Jao
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notes.map((note, i) => (
              <div key={note._id} className="tr-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <FileText size={16} color="rgba(255,255,255,.3)" />
                      <span style={{ fontWeight: 700, fontSize: 15, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {note.title || "Untitled Note"}
                      </span>
                    </div>
                    {note.content && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", marginBottom: 8, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {note.content.replace(/<[^>]*>/g, "").slice(0, 120)}
                      </p>
                    )}
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>
                      {formatDate(note.updatedAt)} ko delete kiya
                    </div>
                  </div>

                  {confirmId !== note._id ? (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="tr-btn tr-restore" onClick={() => restoreNote(note._id)}
                        disabled={actionLoading === note._id + "_restore"}>
                        {actionLoading === note._id + "_restore"
                          ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
                          : <RotateCcw size={13} />}
                        Restore
                      </button>
                      <button className="tr-btn tr-delete" onClick={() => setConfirmId(note._id)}>
                        <X size={13} /> Delete
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px", animation: "shake .3s", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>Permanently delete karo?</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="tr-btn tr-delete" style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => deleteNote(note._id)}
                          disabled={actionLoading === note._id + "_delete"}>
                          Haan
                        </button>
                        <button className="tr-btn" style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)", padding: "6px 12px", fontSize: 12 }}
                          onClick={() => setConfirmId(null)}>
                          Nahi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {notes.length > 0 && (
          <div style={{ marginTop: 24, background: "rgba(229,91,45,.05)", border: "1px solid rgba(229,91,45,.1)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertTriangle size={16} color="#E55B2D" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>
              Trashed notes permanently delete karo ya restore karo. Ek baar permanently delete hone ke baad wapas nahi aate.
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}