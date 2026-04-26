-e // ye Profile page hai - user ki personal information update karne ke liye
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Save, Camera, LogOut, Shield, Menu, Check } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  body{background:#0a0a0a;color:#fff;font-family:'Geist',-apple-system,sans-serif;}
  .pg-wrap{display:flex;height:100vh;overflow:hidden;}
  .pg-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .pg-topbar{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
  .pg-menu-btn{display:none;background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;padding:4px;flex-shrink:0;}
  .pg-content{flex:1;overflow-y:auto;padding:24px;}
  .pr-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:24px;margin-bottom:16px;animation:fadeUp .35s both;}
  .pr-card-title{font-size:13px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.04em;text-transform:uppercase;margin-bottom:18px;display:flex;align-items:center;gap:8px;}
  .pr-avatar-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:20px;}
  .pr-avatar{width:64px;height:64px;border-radius:50%;background:rgba(229,91,45,.15);border:2px solid rgba(229,91,45,.4);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#E55B2D;position:relative;}
  .pr-avatar-edit{position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;border-radius:50%;background:#E55B2D;display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .pr-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
  .pr-label{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.3);}
  .pr-input-wrap{position:relative;display:flex;align-items:center;}
  .pr-input-wrap svg{position:absolute;left:11px;color:rgba(255,255,255,.25);pointer-events:none;}
  .pr-input{width:100%;padding:9px 12px 9px 35px;background:#1a1a1a;border:1px solid rgba(255,255,255,.08);border-radius:7px;font-size:13px;font-family:inherit;color:#fff;outline:none;transition:border-color .15s;}
  .pr-input:focus{border-color:#E55B2D;background:rgba(229,91,45,.03);}
  .pr-input::placeholder{color:rgba(255,255,255,.2);}
  .pr-input:disabled{opacity:.4;cursor:not-allowed;}
  .pr-save-btn{display:flex;align-items:center;gap:7px;background:#E55B2D;color:#fff;border:none;border-radius:7px;padding:9px 18px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;}
  .pr-save-btn:hover:not(:disabled){background:#d14e24;box-shadow:0 4px 14px rgba(229,91,45,.3);}
  .pr-save-btn:disabled{opacity:.5;cursor:not-allowed;}
  .pr-danger-btn{display:flex;align-items:center;gap:7px;background:rgba(239,68,68,.08);color:#ef4444;border:1px solid rgba(239,68,68,.2);border-radius:7px;padding:9px 18px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;}
  .pr-danger-btn:hover{background:rgba(239,68,68,.15);}
  .pr-stat{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;}
  .pr-stat-val{font-size:22px;font-weight:800;color:#fff;line-height:1;}
  .pr-stat-lbl{font-size:11px;color:rgba(255,255,255,.35);font-weight:500;}
  .pr-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.15);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  .pg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
  @media(max-width:768px){.pg-menu-btn{display:flex!important}.pg-content{padding:16px;}}
`;

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [stats, setStats]       = useState({ totalNotes: 0, starredNotes: 0, totalFolders: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    API.get("/dashboard").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!form.name.trim()) return toast.error("Name required hai");
    setSavingProfile(true);
    try {
      const { data } = await API.put("/auth/profile", { name: form.name.trim(), email: form.email.trim() });
      // BUG FIX: update AuthContext so UI reflects new name immediately
      updateUser?.(data.user || { ...user, name: form.name.trim() });
      toast.success("Profile update ho gaya! ✅");
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error("Sab fields fill karein");
    if (pwForm.newPassword.length < 6) return toast.error("Password kam se kam 6 characters ka hona chahiye");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords match nahi kar rahe");
    setSavingPw(true);
    try {
      await API.put("/auth/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password change ho gaya! 🔐");
    } catch (err) { toast.error(err.response?.data?.message || "Password change failed"); }
    finally { setSavingPw(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="pg-wrap">
      <style>{S}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
          <User size={15} color="rgba(255,255,255,.5)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Profile</span>
        </div>

        <div className="pg-content">
          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Avatar + Stats */}
            <div className="pr-card">
              <div className="pr-avatar-wrap">
                <div className="pr-avatar">
                  {initials}
                  <div className="pr-avatar-edit"><Camera size={10} color="#fff" /></div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", textAlign: "center" }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textAlign: "center" }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 16, gap: 16 }}>
                {[{ val: stats.totalNotes, lbl: "Notes" }, { val: stats.starredNotes, lbl: "Starred" }, { val: stats.totalFolders, lbl: "Folders" }].map((s, i) => (
                  <div key={i} className="pr-stat">
                    <div className="pr-stat-val">{s.val}</div>
                    <div className="pr-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Profile */}
            <div className="pr-card" style={{ animationDelay: ".08s" }}>
              <div className="pr-card-title"><User size={13} />Profile Info</div>
              <div className="pr-field">
                <label className="pr-label">Full Name</label>
                <div className="pr-input-wrap">
                  <User size={14} />
                  <input className="pr-input" type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Aapka naam" />
                </div>
              </div>
              <div className="pr-field">
                <label className="pr-label">Email Address</label>
                <div className="pr-input-wrap">
                  <Mail size={14} />
                  <input className="pr-input" type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
              </div>
              <button className="pr-save-btn" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <><div className="pr-spinner" />Saving...</> : <><Save size={13} />Save Changes</>}
              </button>
            </div>

            {/* Change Password */}
            <div className="pr-card" style={{ animationDelay: ".14s" }}>
              <div className="pr-card-title"><Shield size={13} />Change Password</div>
              {[
                { label: "Current Password", key: "currentPassword", placeholder: "Current password" },
                { label: "New Password",     key: "newPassword",     placeholder: "Min. 6 characters" },
                { label: "Confirm Password", key: "confirmPassword",  placeholder: "Dobara type karein" },
              ].map(f => (
                <div key={f.key} className="pr-field">
                  <label className="pr-label">{f.label}</label>
                  <div className="pr-input-wrap">
                    <Lock size={14} />
                    <input className="pr-input" type="password" placeholder={f.placeholder}
                      value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} />
                  </div>
                </div>
              ))}
              <button className="pr-save-btn" onClick={changePassword} disabled={savingPw}>
                {savingPw ? <><div className="pr-spinner" />Updating...</> : <><Check size={13} />Update Password</>}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pr-card" style={{ animationDelay: ".2s" }}>
              <div className="pr-card-title" style={{ color: "rgba(239,68,68,.6)" }}><LogOut size={13} />Account</div>
              <button className="pr-danger-btn" onClick={handleLogout}>
                <LogOut size={13} />Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
