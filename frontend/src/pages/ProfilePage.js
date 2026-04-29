import { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Save, Camera, LogOut, Menu, Check, FileText, Star, Folder, ShieldCheck } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(15px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #000; color: #FFF; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .pg-wrap { display: flex; height: 100dvh; overflow: hidden; background: #000; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  
  /* Sleek Topbar */
  .pg-topbar { 
    height: 70px; display: flex; align-items: center; gap: 16px; padding: 0 32px; 
    background: #0A0A0A; border-bottom: 1px solid #1A1A1A; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: #1A1A1A; border: 1px solid #333; color: #FFF; cursor: pointer; padding: 8px; border-radius: 10px; }
  
  .pg-content { flex: 1; overflow-y: auto; padding: 40px 24px; scrollbar-width: none; }
  
  .pr-container { max-width: 650px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
  
  /* Dark Cards */
  .pr-card { 
    background: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 24px; 
    padding: 32px; animation: fadeUp 0.4s ease-out both; transition: 0.3s; 
  }
  .pr-card:hover { border-color: #333; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
  
  .pr-card-title { 
    font-size: 15px; font-weight: 800; color: #ccff00; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; 
  }
  
  /* Avatar Redesign */
  .pr-avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 10px; }
  .pr-avatar-container { position: relative; display: inline-block; padding: 5px; border-radius: 30px; background: linear-gradient(45deg, #ccff00, transparent); }
  
  .pr-avatar { 
    width: 100px; height: 100px; border-radius: 25px; background: #111; 
    border: 3px solid #000; display: flex; align-items: center; justify-content: center; 
    font-size: 36px; font-weight: 900; color: #ccff00; overflow: hidden;
  }
  .pr-avatar img { width: 100%; height: 100%; object-fit: cover; }
  
  .pr-avatar-edit { 
    position: absolute; bottom: 0px; right: 0px; width: 32px; height: 32px; 
    border-radius: 10px; background: #ccff00; display: flex; align-items: center; 
    justify-content: center; cursor: pointer; border: 3px solid #000; transition: 0.2s;
  }
  .pr-avatar-edit:hover { transform: scale(1.1) rotate(10deg); }
  
  /* Input Styling */
  .pr-field { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .pr-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  
  .pr-input-wrap { position: relative; display: flex; align-items: center; }
  .pr-input-wrap svg { position: absolute; left: 16px; color: #444; transition: 0.3s; }
  
  .pr-input { 
    width: 100%; padding: 14px 16px 14px 48px; background: #050505; 
    border: 1px solid #222; border-radius: 12px; font-size: 14px; 
    font-weight: 600; color: #FFF; outline: none; transition: 0.3s; 
  }
  .pr-input:focus { border-color: #ccff00; box-shadow: 0 0 20px rgba(204,255,0,0.05); }
  .pr-input:focus + svg { color: #ccff00; }
  
  /* Buttons */
  .pr-save-btn { 
    display: flex; align-items: center; gap: 8px; background: #ccff00; color: #000; 
    border: none; border-radius: 12px; padding: 14px 28px; font-size: 14px; 
    font-weight: 800; cursor: pointer; transition: 0.3s; width: fit-content;
  }
  .pr-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(204,255,0,0.3); }
  
  .pr-danger-btn { 
    display: flex; align-items: center; gap: 8px; background: transparent; color: #FF4444; 
    border: 1px solid #331111; border-radius: 12px; padding: 14px 28px; font-size: 14px; 
    font-weight: 800; cursor: pointer; transition: 0.2s;
  }
  .pr-danger-btn:hover { background: #220000; border-color: #FF4444; }
  
  /* Stats Grid */
  .pr-stats-row { 
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 30px; 
  }
  .pr-stat { 
    display: flex; flex-direction: column; align-items: center; gap: 8px; 
    padding: 20px; background: #050505; border-radius: 16px; border: 1px solid #111; transition: 0.3s;
  }
  .pr-stat:hover { border-color: #ccff00; transform: translateY(-3px); }
  .pr-stat-val { font-size: 28px; font-weight: 900; color: #FFF; line-height: 1; }
  .pr-stat-lbl { font-size: 10px; color: #555; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
  
  .pr-spinner { width: 16px; height: 16px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }

  @media(max-width:768px) {
    .pg-menu-btn { display: flex; }
    .pg-topbar { padding: 0 16px; }
    .pr-stats-row { grid-template-columns: 1fr; }
  }
`;

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, totalFolders: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.avatar || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    API.get("/dashboard").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const { data } = await API.put("/auth/profile-picture", formData, { headers: { "Content-Type": "multipart/form-data" } });
      updateUser?.(data.user || { ...user, avatar: data.avatarUrl });
      setProfilePic(data.avatarUrl);
      toast.success("Identity visual updated! 📸");
    } catch { toast.error("Upload failed"); } 
    finally { setUploadingImage(false); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await API.put("/auth/profile", form);
      updateUser?.(data.user || { ...user, ...form });
      toast.success("Profile synced to cloud! ⚡");
    } catch { toast.error("Update failed"); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    setSavingPw(true);
    try {
      await API.put("/auth/change-password", pwForm);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Security keys rotated! 🔐");
    } catch { toast.error("Verification failed"); }
    finally { setSavingPw(false); }
  };

  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase();

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pg-main">
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ padding: "8px", borderRadius: "10px", background: "#ccff00" }}>
            <User size={18} color="#000" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#FFF" }}>Security <span style={{color: "#ccff00"}}>& Hub</span></span>
        </div>

        <div className="pg-content">
          <div className="pr-container">

            {/* Profile Overview Card */}
            <div className="pr-card">
              <div className="pr-avatar-wrap">
                <div className="pr-avatar-container">
                  <div className="pr-avatar">
                    {profilePic ? <img src={profilePic} alt="Profile" /> : initials}
                  </div>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
                  <div className="pr-avatar-edit" onClick={() => fileInputRef.current?.click()}>
                    {uploadingImage ? <div className="pr-spinner" /> : <Camera size={16} color="#000" />}
                  </div>
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#FFF" }}>{user?.name || "User"}</div>
                  <div style={{ fontSize: 14, color: "#555", fontWeight: 700, marginTop: 4 }}>{user?.email}</div>
                </div>
              </div>

              <div className="pr-stats-row">
                {[
                  { val: stats.totalNotes, lbl: "Knowledge Nodes", icn: FileText },
                  { val: stats.starredNotes, lbl: "Priority Items", icn: Star },
                  { val: stats.totalFolders, lbl: "Data Clusters", icn: Folder }
                ].map((s, i) => (
                  <div key={i} className="pr-stat">
                    <div className="pr-stat-val">{s.val}</div>
                    <div className="pr-stat-lbl"><s.icn size={12} color="#ccff00" /> {s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="pr-card">
              <div className="pr-card-title"><User size={18} /> Identity Core</div>
              <div className="pr-field">
                <label className="pr-label">Full Alias</label>
                <div className="pr-input-wrap">
                  <input className="pr-input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <User size={18} />
                </div>
              </div>
              <div className="pr-field">
                <label className="pr-label">Communication Channel</label>
                <div className="pr-input-wrap">
                  <input className="pr-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <Mail size={18} />
                </div>
              </div>
              <button className="pr-save-btn" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <div className="pr-spinner" /> : <><Save size={18} /> Sync Changes</>}
              </button>
            </div>

            {/* Security Card */}
            <div className="pr-card">
              <div className="pr-card-title"><ShieldCheck size={18} /> Authentication Keys</div>
              {[
                { label: "Master Key", key: "currentPassword", placeholder: "Current Security Key" },
                { label: "New Sequence", key: "newPassword", placeholder: "New Security Key" },
                { label: "Verify Sequence", key: "confirmPassword", placeholder: "Repeat New Key" },
              ].map(f => (
                <div key={f.key} className="pr-field">
                  <label className="pr-label">{f.label}</label>
                  <div className="pr-input-wrap">
                    <input className="pr-input" type="password" placeholder={f.placeholder}
                      value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} />
                    <Lock size={18} />
                  </div>
                </div>
              ))}
              <button className="pr-save-btn" onClick={changePassword} disabled={savingPw} style={{ marginTop: 10 }}>
                {savingPw ? <div className="pr-spinner" /> : <><Check size={18} /> Rotate Keys</>}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pr-card" style={{ borderColor: "#331111", background: "linear-gradient(to bottom, #0A0A0A, #110000)" }}>
              <div className="pr-card-title" style={{ color: "#FF4444" }}><LogOut size={18} /> Terminal Actions</div>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
                Terminating the session will wipe local temporary data. You will need to re-authenticate to access the hub.
              </p>
              <button className="pr-danger-btn" onClick={logout}>
                <LogOut size={18} /> Kill Session
              </button>
            </div>

          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
