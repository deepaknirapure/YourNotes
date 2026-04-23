import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, LogOut, ArrowLeft, Save, CheckCircle2,
  Flame, BookOpen, CreditCard, Folder, Upload, Download,
  Heart, FileText, Image, ExternalLink, Loader, Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [myUploads, setMyUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadCount, setUploadCount] = useState(user?.totalPublicUploads || 0);

  useEffect(() => {
    API.get("/dashboard").then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === "uploads" && user?._id) {
      setUploadsLoading(true);
      API.get(`/community/user/${user._id}`)
        .then(r => {
          setMyUploads(r.data.notes || []);
          setUploadCount(r.data.total || 0);
        })
        .catch(() => toast.error("Uploads load nahi ho sake"))
        .finally(() => setUploadsLoading(false));
    }
  }, [activeTab, user?._id]);

  const saveProfile = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    setLoading(true);
    try {
      const { data: updatedUser } = await API.put("/auth/update-profile", { name: form.name });
      updateUser(updatedUser);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (pwForm.newPassword.length < 6) return toast.error("New password kam se kam 6 characters ka hona chahiye");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords match nahi kar rahe");
    setPwLoading(true);
    try {
      await API.put("/auth/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally { setPwLoading(false); }
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm("Yeh note delete karna chahte ho?")) return;
    try {
      await API.delete(`/community/${id}`);
      toast.success("Note delete ho gaya");
      setMyUploads(u => u.filter(n => n._id !== id));
      setUploadCount(c => Math.max(0, c - 1));
    } catch { toast.error("Delete failed"); }
  };

  const statCards = [
    { icon: <BookOpen size={18} />, label: "Total Notes", value: stats.totalNotes, color: "#4F46E5" },
    { icon: <CreditCard size={18} />, label: "Cards Due", value: stats.flashcardsDue, color: "#E55B2D" },
    { icon: <Folder size={18} />, label: "Folders", value: stats.totalFolders, color: "#059669" },
    { icon: <Flame size={18} />, label: "Study Streak", value: `${user?.streak?.count || 0}d`, color: "#F59E0B" },
    { icon: <Upload size={18} />, label: "Community Uploads", value: uploadCount, color: "#8b5cf6" },
  ];

  const TABS = [
    ["profile", "Profile Settings"],
    ["security", "Password & Security"],
    ["uploads", `My Uploads (${uploadCount})`],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', 'DM Sans', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input:focus{outline:none}
        @keyframes ynFadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        .yn-prof-input{width:100%;padding:12px 16px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;font-size:14px;color:#fff;font-family:'Inter','DM Sans',sans-serif;transition:border-color .2s}
        .yn-prof-input:focus{border-color:#E55B2D;background:rgba(229,91,45,.04)}
        .yn-prof-input::placeholder{color:rgba(255,255,255,.25)}
        .yn-prof-btn{padding:11px 24px;border-radius:9px;font-family:'Inter','DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px;border:none}
        .yn-prof-btn-primary{background:#E55B2D;color:#fff}
        .yn-prof-btn-primary:hover:not(:disabled){background:#c94d23;transform:translateY(-1px);box-shadow:0 8px 24px rgba(229,91,45,.3)}
        .yn-prof-btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .yn-prof-tab{padding:10px 20px;border:none;background:none;cursor:pointer;font-family:'Inter','DM Sans',sans-serif;font-size:14px;font-weight:600;border-bottom:2px solid transparent;transition:all .2s;color:rgba(255,255,255,.4);white-space:nowrap}
        .yn-prof-tab.active{color:#E55B2D;border-bottom-color:#E55B2D}
        .yn-prof-tab:hover:not(.active){color:rgba(255,255,255,.7)}
        .yn-upload-card:hover{border-color:rgba(229,91,45,.35)!important;transform:translateY(-2px)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
      `}</style>

      {/* Top nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 5%", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, transition: "color .2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,.15)" }}>|</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>Your<span style={{ color: "#E55B2D" }}>Notes</span></span>
        </div>
        <button onClick={() => { logout(); navigate("/"); }}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,.1)"; }}>
          <LogOut size={14} /> Logout
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px", animation: "ynFadeIn .6s cubic-bezier(.16,1,.3,1) both" }}>

        {/* Avatar header */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #E55B2D, #c94d23)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#fff", flexShrink: 0 }}>
            {(user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-.8px", marginBottom: 4 }}>{user?.name}</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>{user?.email}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 12, padding: "3px 10px", background: "rgba(139,92,246,.15)", borderRadius: 20, color: "#a78bfa", fontWeight: 600 }}>
                {uploadCount} community {uploadCount === 1 ? "upload" : "uploads"}
              </span>
              <span style={{ fontSize: 12, padding: "3px 10px", background: "rgba(255,255,255,.06)", borderRadius: 20, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>
                Free
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 36 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
              <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 600, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 32, display: "flex", gap: 0, overflowX: "auto" }}>
          {TABS.map(([key, label]) => (
            <button key={key} className={`yn-prof-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "32px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Edit Profile</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)" }}><User size={15} /></div>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="yn-prof-input" style={{ paddingLeft: 42 }} placeholder="Your name" />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)" }}><Mail size={15} /></div>
                  <input type="email" value={form.email} disabled className="yn-prof-input" style={{ paddingLeft: 42, opacity: 0.5, cursor: "not-allowed" }} />
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 6 }}>Email change nahi ho sakta</p>
              </div>
              <div style={{ paddingTop: 8 }}>
                <button className="yn-prof-btn yn-prof-btn-primary" onClick={saveProfile} disabled={loading}>
                  {loading ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ynSpin 1s linear infinite", display: "inline-block" }} /> : <Save size={14} />}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === "security" && (
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "32px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Change Password</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { label: "Current Password", key: "currentPassword", ph: "Your current password" },
                { label: "New Password", key: "newPassword", ph: "Minimum 6 characters" },
                { label: "Confirm New Password", key: "confirmPassword", ph: "Repeat new password" },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)" }}><Lock size={15} /></div>
                    <input type={showPw ? "text" : "password"} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} className="yn-prof-input" style={{ paddingLeft: 42 }} placeholder={ph} />
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="showpw" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor: "#E55B2D" }} />
                <label htmlFor="showpw" style={{ fontSize: 13, color: "rgba(255,255,255,.4)", cursor: "pointer" }}>Show passwords</label>
              </div>
              <div style={{ paddingTop: 8 }}>
                <button className="yn-prof-btn yn-prof-btn-primary" onClick={changePassword} disabled={pwLoading}>
                  {pwLoading ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ynSpin 1s linear infinite", display: "inline-block" }} /> : <CheckCircle2 size={14} />}
                  {pwLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── My Uploads Tab ── */}
        {activeTab === "uploads" && (
          <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Meri Uploaded Notes</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
                  {uploadCount} note{uploadCount !== 1 ? "s" : ""} community ke liye upload ki hain
                </p>
              </div>
              <button onClick={() => navigate("/community")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#E55B2D", border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
                <Upload size={14} /> Note Upload Karo
              </button>
            </div>

            {uploadsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Loader size={28} color="#E55B2D" style={{ animation: "ynSpin 1s linear infinite" }} />
              </div>
            ) : myUploads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14 }}>
                <Upload size={40} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>Abhi tak koi note upload nahi ki</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.25)", marginBottom: 20 }}>Apni notes upload karo aur poori community ki help karo!</p>
                <button onClick={() => navigate("/community")}
                  style={{ padding: "10px 22px", background: "#E55B2D", border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
                  Community Feed Dekho
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myUploads.map(note => (
                  <div key={note._id} className="yn-upload-card"
                    style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, transition: "all .2s" }}>

                    {/* File icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: note.fileType === "pdf" ? "rgba(229,91,45,.12)" : "rgba(139,92,246,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {note.fileType === "pdf"
                        ? <FileText size={20} color="#E55B2D" />
                        : <Image size={20} color="#8b5cf6" />}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {note.title}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{note.subject}</span>
                        {note.exam && note.exam !== "Other" && (
                          <span style={{ fontSize: 11, padding: "2px 8px", background: "rgba(16,185,129,.1)", borderRadius: 20, color: "#10b981", fontWeight: 600 }}>{note.exam}</span>
                        )}
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>
                          {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,.35)" }}>
                        <Heart size={13} /> {note.likes?.length || 0}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,.35)" }}>
                        <Download size={13} /> {note.downloads || 0}
                      </div>
                      <a href={note.fileUrl} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "rgba(255,255,255,.6)", fontSize: 12, textDecoration: "none", transition: "all .2s" }}>
                        <ExternalLink size={12} /> View
                      </a>
                      <button onClick={() => handleDeleteUpload(note._id)}
                        style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 8, color: "rgba(239,68,68,.7)", cursor: "pointer", transition: "all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.2)"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,.08)"; e.currentTarget.style.color = "rgba(239,68,68,.7)"; }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
