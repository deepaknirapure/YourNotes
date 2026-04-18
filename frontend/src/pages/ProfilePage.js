import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, LogOut, ArrowLeft, Save, Eye, EyeOff, CheckCircle2, Flame, BookOpen, CreditCard, Folder } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, flashcardsDue: 0, totalFolders: 0 });
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    API.get("/dashboard").then(r => setStats(r.data)).catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    setLoading(true);
    try {
      await API.put("/auth/me", { name: form.name });
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

  const statCards = [
    { icon: <BookOpen size={18} />, label: "Total Notes", value: stats.totalNotes, color: "#4F46E5" },
    { icon: <CreditCard size={18} />, label: "Cards Due", value: stats.flashcardsDue, color: "#E55B2D" },
    { icon: <Folder size={18} />, label: "Folders", value: stats.totalFolders, color: "#059669" },
    { icon: <Flame size={18} />, label: "Study Streak", value: `${user?.streak?.count || 0}d`, color: "#F59E0B" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input:focus{outline:none}
        @keyframes ynFadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynSpin{to{transform:rotate(360deg)}}
        .yn-prof-input{width:100%;padding:12px 16px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;font-size:14px;color:#fff;font-family:'DM Sans',sans-serif;transition:border-color .2s}
        .yn-prof-input:focus{border-color:#E55B2D;background:rgba(229,91,45,.04)}
        .yn-prof-input::placeholder{color:rgba(255,255,255,.25)}
        .yn-prof-btn{padding:11px 24px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px;border:none}
        .yn-prof-btn-primary{background:#E55B2D;color:#fff}
        .yn-prof-btn-primary:hover:not(:disabled){background:#c94d23;transform:translateY(-1px);box-shadow:0 8px 24px rgba(229,91,45,.3)}
        .yn-prof-btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .yn-prof-tab{padding:10px 20px;border:none;background:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;border-bottom:2px solid transparent;transition:all .2s;color:rgba(255,255,255,.4)}
        .yn-prof-tab.active{color:#E55B2D;border-bottom-color:#E55B2D}
        .yn-prof-tab:hover:not(.active){color:rgba(255,255,255,.7)}
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
        <button onClick={() => { logout(); navigate("/"); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,.1)"; }}>
          <LogOut size={14} /> Logout
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px", animation: "ynFadeIn .6s cubic-bezier(.16,1,.3,1) both" }}>
        {/* Avatar header */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #E55B2D, #c94d23)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#fff", flexShrink: 0 }}>
            {(user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-.8px", marginBottom: 4 }}>{user?.name}</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>{user?.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 32, display: "flex", gap: 0 }}>
          {[["profile", "Profile Settings"], ["security", "Password & Security"]].map(([key, label]) => (
            <button key={key} className={`yn-prof-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {/* Profile tab */}
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

        {/* Security tab */}
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
      </div>
    </div>
  );
}
