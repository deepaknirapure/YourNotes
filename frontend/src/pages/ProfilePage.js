import { useState, useEffect, useRef } from "react";
import {
  User, Mail, Lock, Save, Camera, LogOut, Menu,
  Check, FileText, Star, Folder, Eye, EyeOff, Settings,
  Trash2, ZoomIn, X, Upload
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, totalFolders: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // profilePic: confirmed server URL (or null). previewUrl: local blob for optimistic preview.
  const [profilePic, setProfilePic] = useState(
    user?.avatar && !user.avatar.includes("flaticon") ? user.avatar : null
  );
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    API.get("/dashboard").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  // Sync avatar when user object changes (e.g. after login refresh)
  useEffect(() => {
    const avatar = user?.avatar && !user.avatar.includes("flaticon") ? user.avatar : null;
    setProfilePic(avatar);
  }, [user?.avatar]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // reset so same file can re-trigger
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    handleImageUpload(file, localUrl);
  };

  const handleImageUpload = async (file, localUrl) => {
    setUploadingImage(true);
    setPreviewUrl(localUrl); // optimistic preview
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      // Content-Type header SET MAT KARO manually — browser khud boundary set karta hai
      // Agar manually set kiya toh multipart boundary missing hoti hai aur upload fail hota hai
      const { data } = await API.put("/auth/profile-picture", formData);
      const url = data.avatarUrl || data.avatar;
      updateUser?.({ ...user, avatar: url });
      setProfilePic(url);
      setPreviewUrl(null);
      URL.revokeObjectURL(localUrl);
      toast.success("Profile photo updated!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Upload failed. Please try again.";
      toast.error(msg);
      setPreviewUrl(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeletePhoto = async () => {
    setDeletingImage(true);
    try {
      await API.delete("/auth/profile-picture");
      updateUser?.({ ...user, avatar: null });
      setProfilePic(null);
      setPreviewUrl(null);
      setShowDeleteConfirm(false);
      setViewerOpen(false);
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Could not remove photo. Please try again.");
    } finally {
      setDeletingImage(false);
    }
  };

  // ── Profile / Password ────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!form.name.trim()) { toast.error("Name cannot be empty"); return; }
    setSavingProfile(true);
    try {
      const { data } = await API.put("/auth/profile", form);
      updateUser?.(data.user || { ...user, ...form });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error("Please fill all fields"); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords don't match"); return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    setSavingPw(true);
    try {
      await API.put("/auth/change-password", pwForm);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Current password incorrect");
    } finally {
      setSavingPw(false);
    }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const displayPic = previewUrl || profilePic;
  const hasPhoto = Boolean(displayPic);
  const c = isDark ? DARK : LIGHT;

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: c.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{BASE_STYLES + getInputFocusStyle(isDark)}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Photo Lightbox Viewer ────────────────────────────────────────── */}
      {viewerOpen && hasPhoto && (
        <div
          onClick={() => { setViewerOpen(false); setShowDeleteConfirm(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 20,
          }}
        >
          <button
            onClick={() => { setViewerOpen(false); setShowDeleteConfirm(false); }}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.12)", border: "none",
              borderRadius: 10, padding: 10, cursor: "pointer", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>

          <img
            src={displayPic}
            alt="Profile"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "min(480px, 90vw)", maxHeight: "70vh",
              borderRadius: 20, objectFit: "contain",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              border: "2px solid rgba(255,255,255,0.12)",
            }}
          />

          <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => { setViewerOpen(false); fileInputRef.current?.click(); }}
              style={viewerBtn("#f97316")}
            >
              <Upload size={14} /> Change Photo
            </button>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={viewerBtn("#ef4444")}>
                <Trash2 size={14} /> Remove Photo
              </button>
            ) : (
              <>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", alignSelf: "center" }}>Sure?</span>
                <button onClick={handleDeletePhoto} disabled={deletingImage} style={viewerBtn("#ef4444")}>
                  {deletingImage ? "…" : "Yes, Remove"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} style={viewerBtn("rgba(255,255,255,0.18)")}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", background: c.surface, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}
            style={{ background: "transparent", border: `1px solid ${c.border}`, color: c.textMuted, borderRadius: 6, padding: 7, cursor: "pointer" }}>
            <Menu size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Profile</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => navigate("/settings")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "transparent", border: `1px solid ${c.border}`, borderRadius: 8, cursor: "pointer", color: c.textMuted, fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" }}>
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", scrollbarWidth: "none" }}>
          <div className="pr-container">

            {/* ── Hero Card ── */}
            <div className="pr-card" style={cardStyle(c)}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingBottom: 24, borderBottom: `1px solid ${c.border}` }}>

                {/* Avatar */}
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 108, height: 108, borderRadius: 28,
                    background: hasPhoto ? "transparent" : "linear-gradient(135deg, #f97316, #f59e0b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34, fontWeight: 900, color: "#fff",
                    overflow: "hidden",
                    border: `3px solid ${c.border}`,
                    boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
                    position: "relative",
                  }}>
                    {hasPhoto
                      ? <img src={displayPic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials}

                    {/* Upload spinner */}
                    {uploadingImage && (
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        <div className="yn-spinner" />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>Uploading</span>
                      </div>
                    )}

                    {/* View hover overlay */}
                    {hasPhoto && !uploadingImage && (
                      <div
                        className="avatar-hover-overlay"
                        onClick={() => setViewerOpen(true)}
                        style={{
                          position: "absolute", inset: 0,
                          background: "rgba(0,0,0,0)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "background 0.2s",
                        }}
                      >
                        <ZoomIn size={22} color="#fff" style={{ opacity: 0, transition: "opacity 0.2s" }} className="avatar-zoom-icon" />
                      </div>
                    )}
                  </div>

                  {/* Camera badge */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Change photo"
                    disabled={uploadingImage}
                    style={{
                      position: "absolute", bottom: -4, right: -4,
                      width: 32, height: 32, borderRadius: 10,
                      background: "var(--accent)", border: `2.5px solid ${c.surface}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: uploadingImage ? "not-allowed" : "pointer",
                      transition: "transform 0.2s", opacity: uploadingImage ? 0.5 : 1,
                    }}
                    onMouseOver={e => !uploadingImage && (e.currentTarget.style.transform = "scale(1.14)")}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <Camera size={14} color="#fff" />
                  </button>

                  <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileSelect} />
                </div>

                {/* Name / email / action buttons */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 21, fontWeight: 900, color: c.text }}>{user?.name || "Your Name"}</div>
                  <div style={{ fontSize: 13, color: c.textMuted, marginTop: 3 }}>{user?.email}</div>

                  <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
                    {/* Upload / Change */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 15px", background: "var(--accent)", color: "#fff",
                        border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700,
                        cursor: uploadingImage ? "not-allowed" : "pointer", fontFamily: "inherit",
                        opacity: uploadingImage ? 0.7 : 1, transition: "all 0.2s",
                      }}
                    >
                      <Upload size={12} />
                      {uploadingImage ? "Uploading…" : hasPhoto ? "Change Photo" : "Upload Photo"}
                    </button>

                    {/* View */}
                    {hasPhoto && !uploadingImage && (
                      <button
                        onClick={() => setViewerOpen(true)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 15px", background: "transparent",
                          color: c.text, border: `1.5px solid ${c.border}`,
                          borderRadius: 9, fontSize: 12, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.text; }}
                      >
                        <Eye size={12} /> View Photo
                      </button>
                    )}

                    {/* Remove */}
                    {hasPhoto && !uploadingImage && !showDeleteConfirm && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 15px", background: "transparent",
                          color: "#ef4444", border: "1.5px solid #fca5a5",
                          borderRadius: 9, fontSize: 12, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                      >
                        <Trash2 size={12} /> Remove Photo
                      </button>
                    )}

                    {/* Inline delete confirm */}
                    {showDeleteConfirm && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: c.textMuted }}>Remove photo?</span>
                        <button
                          onClick={handleDeletePhoto}
                          disabled={deletingImage}
                          style={{ padding: "6px 13px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {deletingImage ? "…" : "Yes, Remove"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          style={{ padding: "6px 13px", background: "transparent", color: c.textMuted, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, paddingTop: 20 }} className="pr-stats-grid">
                {[
                  { val: stats.totalNotes, lbl: "Notes", icon: FileText, color: "var(--accent)" },
                  { val: stats.starredNotes, lbl: "Starred", icon: Star, color: "#f59e0b" },
                  { val: stats.totalFolders, lbl: "Folders", icon: Folder, color: "#8b5cf6" },
                ].map(({ val, lbl: label, icon: Icon, color }) => (
                  <div key={label} className="pr-stat" style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    padding: "14px 8px", background: c.statBg, borderRadius: 12, border: `1px solid ${c.border}`,
                    cursor: "default", transition: "all 0.2s",
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "none"; }}>
                    <Icon size={16} color={color} />
                    <span style={{ fontSize: 22, fontWeight: 900, color: c.text, lineHeight: 1 }}>{val}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Personal Info ── */}
            <div className="pr-card" style={cardStyle(c)}>
              <div style={sectionTitle(c)}><User size={15} style={{ color: "var(--accent)" }} /> Personal Information</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name", key: "name", type: "text", icon: User, ph: "Your full name" },
                  { label: "Email Address", key: "email", type: "email", icon: Mail, ph: "your@email.com" },
                ].map(({ label, key, type, icon: Icon, ph }) => (
                  <div key={key}>
                    <label style={lbl(c)}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <Icon size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: c.textLight, pointerEvents: "none" }} />
                      <input className="yn-input" style={inp(c)} type={type}
                        value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={saveProfile} disabled={savingProfile} style={primBtn}>
                {savingProfile ? <><div className="yn-spinner-sm" /> Saving…</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>

            {/* ── Password ── */}
            <div className="pr-card" style={cardStyle(c)}>
              <div style={sectionTitle(c)}><Lock size={15} style={{ color: "var(--accent)" }} /> Change Password</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Current Password", key: "currentPassword", vis: "current" },
                  { label: "New Password", key: "newPassword", vis: "new" },
                  { label: "Confirm New Password", key: "confirmPassword", vis: "confirm" },
                ].map(({ label, key, vis }) => (
                  <div key={key}>
                    <label style={lbl(c)}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: c.textLight, pointerEvents: "none" }} />
                      <input className="yn-input" style={{ ...inp(c), paddingRight: 42 }}
                        type={showPw[vis] ? "text" : "password"}
                        value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                        placeholder={label} />
                      <button onClick={() => setShowPw(p => ({ ...p, [vis]: !p[vis] }))}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: c.textMuted, padding: 2, display: "flex" }}>
                        {showPw[vis] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={changePassword} disabled={savingPw} style={primBtn}>
                {savingPw ? <><div className="yn-spinner-sm" /> Updating…</> : <><Check size={14} /> Update Password</>}
              </button>
            </div>

            {/* ── Sign Out ── */}
            <div className="pr-card" style={{ ...cardStyle(c), borderColor: isDark ? "#3a1010" : "#fecaca", background: isDark ? "#1a0808" : "#fff9f9" }}>
              <div style={{ ...sectionTitle(c), color: "#ef4444" }}><LogOut size={15} style={{ color: "#ef4444" }} /> Sign Out</div>
              <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
                Sign out from your account. Your notes and data will remain safe and accessible on your next login.
              </p>
              <button onClick={() => { logout(); navigate("/login"); }}
                className="pr-danger-btn"
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "transparent", border: "1.5px solid #fca5a5", color: "#ef4444", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>

          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const viewerBtn = (bg) => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 18px", background: bg, color: "#fff",
  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: "opacity 0.2s",
});

const cardStyle = (c) => ({
  background: c.surface, border: `1px solid ${c.border}`,
  borderRadius: 18, padding: "24px",
  transition: "all 0.2s",
});
const sectionTitle = (c) => ({
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, fontWeight: 800, color: c.text,
  marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${c.border}`,
  textTransform: "uppercase", letterSpacing: "0.3px",
});
const lbl = (c) => ({
  display: "block", fontSize: 11, fontWeight: 700,
  color: c.textMuted, textTransform: "uppercase",
  letterSpacing: "0.4px", marginBottom: 7,
});
const inp = (c) => ({
  width: "100%", padding: "10px 14px 10px 38px",
  background: c.inputBg, border: `1.5px solid ${c.border}`,
  borderRadius: 9, fontSize: 14, fontWeight: 500,
  color: c.text, outline: "none", fontFamily: "inherit",
  transition: "all 0.15s",
});
const primBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "10px 20px", background: "var(--accent)", color: "#fff",
  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
  cursor: "pointer", marginTop: 18, fontFamily: "inherit",
  transition: "all 0.2s",
};

const DARK = {
  bg: "#111010", surface: "#1a1919", border: "#2a2828",
  text: "#f5f5f4", textMuted: "#888580", textLight: "#555",
  inputBg: "#111", statBg: "#111",
};
const LIGHT = {
  bg: "#f5f5f3", surface: "#ffffff", border: "#e8e6e1",
  text: "#1a1a1a", textMuted: "#888580", textLight: "#b0ada6",
  inputBg: "#f9f9f8", statBg: "#f9f9f8",
};

const getInputFocusStyle = (isDark) => `
  .yn-input:focus {
    border-color: var(--accent) !important;
    background: ${isDark ? "#1a1a1a" : "#fff"} !important;
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important;
  }
  .pr-danger-btn:hover {
    background: #ef4444 !important;
    color: #fff !important;
  }
  .avatar-hover-overlay:hover {
    background: rgba(0,0,0,0.45) !important;
  }
  .avatar-hover-overlay:hover .avatar-zoom-icon {
    opacity: 1 !important;
  }
`;

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
  .pg-menu-btn { display: none !important; }
  .yn-spinner { width: 26px; height: 26px; border: 3px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  .yn-spinner-sm { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  .pr-card { animation: fadeUp 0.35s both; }
  .pr-container { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
  @media (max-width: 768px) {
    .pg-menu-btn { display: flex !important; }
    .pr-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (max-width: 420px) {
    .pr-stats-grid { grid-template-columns: 1fr !important; }
  }
`;