import { useState } from "react";
import {
  Settings, Sun, Moon, Monitor, Menu, User, ChevronRight,
  Bell, Shield, Palette, Info, ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setLight, setDark, isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const c = isDark ? DARK : LIGHT;
  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: c.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{STYLES + getThemeVars(isDark)}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", background: c.surface, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
          <button className="pg-menu-btn" onClick={() => setSidebarOpen(true)}
            style={{ background: "transparent", border: `1px solid ${c.border}`, color: c.textMuted, borderRadius: 6, padding: 7, cursor: "pointer" }}>
            <Menu size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Settings size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Settings</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", scrollbarWidth: "none" }}>
          <div className="st-container">

            {/* Account Summary */}
            <div className="st-card" style={card(c)}>
              <button onClick={() => navigate("/profile")} style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%",
                background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", borderRadius: 12,
                padding: "4px 4px", transition: "all 0.15s",
              }}
                onMouseOver={e => e.currentTarget.style.background = c.hover}
                onMouseOut={e => e.currentTarget.style.background = "none"}>
                <div style={{
                  width: 52, height: 52, borderRadius: 50,
                  background: user?.avatar ? "#000" : "linear-gradient(135deg, #f97316, #f59e0b)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 900, color: "#fff", overflow: "hidden", flexShrink: 0,
                  border: `2px solid ${c.border}`,
                }}>
                  {user?.avatar ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 2 }}>{user?.name || "Your Name"}</div>
                  <div style={{ fontSize: 13, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  <span>Edit Profile</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            </div>

            {/* Appearance */}
            <div className="st-card" style={card(c)}>
              <div style={sectionHead(c)}><Palette size={15} style={{ color: "var(--accent)" }} /> Appearance</div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 6 }}>Theme</div>
                <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
                  Choose how YourNotes looks. Your preference is saved automatically.
                </div>

                {/* Theme Toggle Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="theme-grid">
                  {/* Light */}
                  <button onClick={setLight} style={{
                    padding: "16px 14px", borderRadius: 14,
                    border: `2px solid ${theme === "light" ? "var(--accent)" : c.border}`,
                    background: theme === "light" ? "rgba(249,115,22,0.05)" : c.themeBtnBg,
                    cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: 10, fontFamily: "inherit",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: "#f5f5f3",
                        border: "1.5px solid #e8e6e1", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Sun size={18} color="#f97316" />
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", border: `2px solid ${theme === "light" ? "var(--accent)" : c.border}`,
                        background: theme === "light" ? "var(--accent)" : "transparent",
                        transition: "all 0.2s", flexShrink: 0,
                      }} />
                    </div>
                    {/* Preview */}
                    <div style={{ borderRadius: 8, background: "#f5f5f3", padding: "8px 10px", border: "1px solid #e8e6e1" }}>
                      <div style={{ width: "60%", height: 6, background: "#1a1a1a", borderRadius: 3, marginBottom: 5, opacity: 0.8 }} />
                      <div style={{ width: "40%", height: 4, background: "#888", borderRadius: 3, marginBottom: 4, opacity: 0.5 }} />
                      <div style={{ width: "80%", height: 4, background: "#888", borderRadius: 3, opacity: 0.3 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 1 }}>Light</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>Clean, bright interface</div>
                    </div>
                  </button>

                  {/* Dark */}
                  <button onClick={setDark} style={{
                    padding: "16px 14px", borderRadius: 14,
                    border: `2px solid ${theme === "dark" ? "var(--accent)" : c.border}`,
                    background: theme === "dark" ? "rgba(249,115,22,0.05)" : c.themeBtnBg,
                    cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: 10, fontFamily: "inherit",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: "#1a1919",
                        border: "1.5px solid #2a2828", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Moon size={18} color="#f97316" />
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", border: `2px solid ${theme === "dark" ? "var(--accent)" : c.border}`,
                        background: theme === "dark" ? "var(--accent)" : "transparent",
                        transition: "all 0.2s", flexShrink: 0,
                      }} />
                    </div>
                    {/* Preview */}
                    <div style={{ borderRadius: 8, background: "#1a1919", padding: "8px 10px", border: "1px solid #2a2828" }}>
                      <div style={{ width: "60%", height: 6, background: "#f5f5f4", borderRadius: 3, marginBottom: 5, opacity: 0.8 }} />
                      <div style={{ width: "40%", height: 4, background: "#888", borderRadius: 3, marginBottom: 4, opacity: 0.5 }} />
                      <div style={{ width: "80%", height: 4, background: "#555", borderRadius: 3, opacity: 0.5 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 1 }}>Dark</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>Easy on the eyes</div>
                    </div>
                  </button>
                </div>

                {/* Current theme indicator */}
                <div style={{
                  marginTop: 14, padding: "10px 14px", background: c.pillBg, borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 8, border: `1px solid ${c.border}`,
                }}>
                  {isDark ? <Moon size={14} color="var(--accent)" /> : <Sun size={14} color="var(--accent)" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>
                    {isDark ? "Dark mode is active" : "Light mode is active"} — preference saved automatically
                  </span>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="st-card" style={card(c)}>
              <div style={sectionHead(c)}><User size={15} style={{ color: "var(--accent)" }} /> Account</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "Edit Profile", sub: "Name, email, profile photo", icon: User, action: () => navigate("/profile") },
                  { label: "Change Password", sub: "Update your account password", icon: Shield, action: () => navigate("/profile") },
                ].map(({ label, sub, icon: Icon, action }) => (
                  <button key={label} onClick={action} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "13px 10px",
                    background: "none", border: "none", borderRadius: 12, cursor: "pointer", width: "100%",
                    textAlign: "left", fontFamily: "inherit", transition: "all 0.15s",
                  }}
                    onMouseOver={e => e.currentTarget.style.background = c.hover}
                    onMouseOut={e => e.currentTarget.style.background = "none"}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: c.iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={16} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{label}</div>
                      <div style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>{sub}</div>
                    </div>
                    <ChevronRight size={16} color={c.textMuted} />
                  </button>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="st-card" style={card(c)}>
              <div style={sectionHead(c)}><Info size={15} style={{ color: "var(--accent)" }} /> About</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "Version", value: "1.0.0" },
                  { label: "App", value: "YourNotes" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 10px", borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 14, color: c.textMuted, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 14, color: c.text, fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

const card = (c) => ({
  background: c.surface, border: `1px solid ${c.border}`,
  borderRadius: 18, padding: "22px",
});
const sectionHead = (c) => ({
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 12, fontWeight: 800, color: c.text,
  marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${c.border}`,
  textTransform: "uppercase", letterSpacing: "0.4px",
});

const DARK = {
  bg: "#111010", surface: "#1a1919", border: "#2a2828",
  text: "#f5f5f4", textMuted: "#888580", textLight: "#555",
  hover: "rgba(255,255,255,0.03)", iconBg: "rgba(249,115,22,0.1)",
  themeBtnBg: "#111010", pillBg: "#111", statBg: "#111",
};
const LIGHT = {
  bg: "#f5f5f3", surface: "#ffffff", border: "#e8e6e1",
  text: "#1a1a1a", textMuted: "#888580", textLight: "#b0ada6",
  hover: "#f5f5f3", iconBg: "rgba(249,115,22,0.08)",
  themeBtnBg: "#f9f9f8", pillBg: "#f5f5f3", statBg: "#f9f9f8",
};

const getThemeVars = (isDark) => `
  :root {
    --accent: #f97316;
    --accent-light: rgba(249,115,22,0.1);
  }
`;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
  .pg-menu-btn { display: none !important; }
  .st-container { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
  .st-card { animation: fadeUp 0.35s both; }
  .st-card:nth-child(2) { animation-delay: 0.05s; }
  .st-card:nth-child(3) { animation-delay: 0.1s; }
  .st-card:nth-child(4) { animation-delay: 0.15s; }
  @media (max-width: 768px) {
    .pg-menu-btn { display: flex !important; }
  }
  @media (max-width: 440px) {
    .theme-grid { grid-template-columns: 1fr !important; }
  }
`;

