import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Save, Camera, LogOut, Shield, Menu, Check, FileText, Star, Folder } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  
  body { background: #FAFAFA; color: #0F172A; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
  
  .pg-wrap { display: flex; height: 100vh; overflow: hidden; background: #FAFAFA; }
  .pg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  
  /* Sleek Topbar */
  .pg-topbar { 
    height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; 
    background: #FFF; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; 
  }
  .pg-menu-btn { display: none; background: none; border: none; color: #64748B; cursor: pointer; padding: 4px; flex-shrink: 0; }
  
  .pg-content { flex: 1; overflow-y: auto; padding: 32px 24px; scrollbar-width: none; }
  
  /* Container Constraints */
  .pr-container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
  
  /* Clean Cards */
  .pr-card { 
    background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; 
    padding: 32px; animation: fadeUp 0.35s both; transition: 0.2s; 
  }
  .pr-card:hover { border-color: #CBD5E1; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
  
  .pr-card-title { 
    font-size: 14px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px; 
    margin-bottom: 24px; display: flex; align-items: center; gap: 8px; 
  }
  
  /* Avatar Section */
  .pr-avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 32px; }
  
  .pr-avatar-container { position: relative; display: inline-block; }
  
  .pr-avatar { 
    width: 80px; height: 80px; border-radius: 20px; background: #FFF5F2; 
    border: 2px solid #FFE4DB; display: flex; align-items: center; justify-content: center; 
    font-size: 28px; font-weight: 800; color: #E55B2D; overflow: hidden;
  }
  
  .pr-avatar img { width: 100%; height: 100%; object-fit: cover; }
  
  .pr-avatar-edit { 
    position: absolute; bottom: -6px; right: -6px; width: 28px; height: 28px; 
    border-radius: 8px; background: #E55B2D; display: flex; align-items: center; 
    justify-content: center; cursor: pointer; border: 2px solid #FFF; transition: 0.2s;
  }
  .pr-avatar-edit:hover { background: #0F172A; transform: scale(1.05); }
  
  /* Form Fields */
  .pr-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .pr-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; }
  
  .pr-input-wrap { position: relative; display: flex; align-items: center; }
  .pr-input-wrap svg { position: absolute; left: 14px; color: #94A3B8; pointer-events: none; }
  
  .pr-input { 
    width: 100%; padding: 12px 16px 12px 40px; background: #FFF; 
    border: 1px solid #E2E8F0; border-radius: 10px; font-size: 14px; 
    font-weight: 500; font-family: inherit; color: #0F172A; outline: none; transition: 0.2s; 
  }
  .pr-input:focus { border-color: #E55B2D; box-shadow: 0 0 0 3px rgba(229,91,45,0.1); }
  .pr-input::placeholder { color: #94A3B8; font-weight: 400; }
  .pr-input:disabled { opacity: 0.5; background: #F8FAFC; cursor: not-allowed; }
  
  /* Action Buttons */
  .pr-save-btn { 
    display: flex; align-items: center; gap: 8px; background: #0F172A; color: #FFF; 
    border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; 
    font-weight: 600; font-family: inherit; cursor: pointer; transition: 0.2s; width: fit-content;
  }
  .pr-save-btn:hover:not(:disabled) { background: #E55B2D; transform: translateY(-1px); }
  .pr-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  
  .pr-danger-btn { 
    display: flex; align-items: center; gap: 8px; background: #FFF; color: #EF4444; 
    border: 1px solid #FCA5A5; border-radius: 10px; padding: 12px 24px; font-size: 14px; 
    font-weight: 600; font-family: inherit; cursor: pointer; transition: 0.2s; width: fit-content;
  }
  .pr-danger-btn:hover { background: #FEF2F2; }
  
  /* Analytics Row */
  .pr-stats-row { 
    display: flex; border-top: 1px solid #E2E8F0; padding-top: 24px; margin-top: 24px; gap: 16px; 
  }
  .pr-stat { 
    display: flex; flex-direction: column; align-items: center; gap: 6px; 
    flex: 1; padding: 16px; background: #F8FAFC; border-radius: 12px; border: 1px solid #F1F5F9;
  }
  .pr-stat-val { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; }
  .pr-stat-lbl { font-size: 12px; color: #64748B; font-weight: 600; display: flex; alignItems: center; gap: 4px; }
  
  .pr-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #FFF; border-radius: 50%; animation: spin .7s linear infinite; }
  .pg-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 40; }
  
  @media(max-width:768px) { 
    .pg-menu-btn { display: flex !important; } 
    .pg-content { padding: 24px 16px; } 
    .pr-stats-row { flex-direction: column; }
  }
`;

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [stats, setStats] = useState({ totalNotes: 0, starredNotes: 0, totalFolders: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Profile Picture State & Ref
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    API.get("/dashboard").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  // Sync profile pic if context updates
  useEffect(() => {
    if (user?.profilePic) setProfilePic(user.profilePic);
  }, [user]);

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional validation
    if (!file.type.startsWith('image/')) {
      return toast.error("Please upload a valid image file");
    }

    // Instant Preview (Optimistic UI)
    const previewUrl = URL.createObjectURL(file);
    setProfilePic(previewUrl);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      // Make sure this endpoint exists in your backend to handle Multer upload
      const { data } = await API.put("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Update global context
      updateUser?.(data.user || { ...user, profilePic: data.profilePicUrl });
      toast.success("Profile picture updated! 📸");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
      // Revert to old pic on failure
      setProfilePic(user?.profilePic || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    if (!form.name.trim()) return toast.error("Name required hai");
    setSavingProfile(true);
    try {
      const { data } = await API.put("/auth/profile", { name: form.name.trim(), email: form.email.trim() });
      updateUser?.(data.user || { ...user, name: form.name.trim() });
      toast.success("Profile information saved! ✅");
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
      toast.success("Security credentials updated! 🔐");
    } catch (err) { toast.error(err.response?.data?.message || "Password change failed"); }
    finally { setSavingPw(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="pg-wrap">
      <style>{STYLES}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="pg-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <div className="pg-main">
        {/* Sleek Topbar */}
        <div className="pg-topbar">
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={14} color="#64748B" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px" }}>Account Settings</span>
        </div>

        <div className="pg-content">
          <div className="pr-container">

            {/* Avatar + Stats Card */}
            <div className="pr-card">
              <div className="pr-avatar-wrap">
                <div className="pr-avatar-container">
                  <div className="pr-avatar">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" />
                    ) : (
                      initials
                    )}
                  </div>
                  
                  {/* Hidden Input File */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                  />
                  
                  {/* Edit Button */}
                  <div 
                    className="pr-avatar-edit" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Profile Picture"
                  >
                    {uploadingImage ? <div className="pr-spinner" style={{width: 12, height: 12, borderWidth: '1px'}} /> : <Camera size={14} color="#FFF" />}
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{user?.name || "Developer"}</div>
                  <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>{user?.email || "email@example.com"}</div>
                </div>
              </div>

              <div className="pr-stats-row">
                {[{ val: stats.totalNotes, lbl: "Notes", icn: FileText }, { val: stats.starredNotes, lbl: "Starred", icn: Star }, { val: stats.totalFolders, lbl: "Folders", icn: Folder }].map((s, i) => (
                  <div key={i} className="pr-stat">
                    <div className="pr-stat-val">{s.val}</div>
                    <div className="pr-stat-lbl"><s.icn size={12} /> {s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="pr-card" style={{ animationDelay: ".08s" }}>
              <div className="pr-card-title"><User size={16} color="#64748B" /> Personal Information</div>
              <div className="pr-field">
                <label className="pr-label">Full Name</label>
                <div className="pr-input-wrap">
                  <User size={16} />
                  <input className="pr-input" type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                </div>
              </div>
              <div className="pr-field" style={{ marginBottom: 24 }}>
                <label className="pr-label">Email Address</label>
                <div className="pr-input-wrap">
                  <Mail size={16} />
                  <input className="pr-input" type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
              </div>
              <button className="pr-save-btn" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <><div className="pr-spinner" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>

            {/* Security / Password Card */}
            <div className="pr-card" style={{ animationDelay: ".14s" }}>
              <div className="pr-card-title"><Shield size={16} color="#64748B" /> Security & Password</div>
              {[
                { label: "Current Password", key: "currentPassword", placeholder: "Enter current password" },
                { label: "New Password",     key: "newPassword",     placeholder: "Minimum 6 characters" },
                { label: "Confirm Password", key: "confirmPassword",  placeholder: "Re-type new password" },
              ].map(f => (
                <div key={f.key} className="pr-field">
                  <label className="pr-label">{f.label}</label>
                  <div className="pr-input-wrap">
                    <Lock size={16} />
                    <input className="pr-input" type="password" placeholder={f.placeholder}
                      value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <button className="pr-save-btn" onClick={changePassword} disabled={savingPw}>
                  {savingPw ? <><div className="pr-spinner" /> Updating...</> : <><Check size={16} /> Update Password</>}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pr-card" style={{ animationDelay: ".2s", border: "1px solid #FEE2E2", background: "#FEF2F2" }}>
              <div className="pr-card-title" style={{ color: "#EF4444" }}><LogOut size={16} /> Account Actions</div>
              <p style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 16, lineHeight: 1.5 }}>
                Logging out will clear your current session. You will need to log back in to access your knowledge base.
              </p>
              <button className="pr-danger-btn" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out Securely
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}