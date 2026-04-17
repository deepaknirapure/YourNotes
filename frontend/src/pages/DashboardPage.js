import React, { useState } from "react";
import {
  Plus,
  Search,
  Star,
  Folder,
  Trash2,
  Home,
  Clock,
  MoreHorizontal,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Share2,
  FileDown,
  Trash,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = {
    primary: "#10B981",
    primarySoft: "#ECFDF5",
    dark: "#111827",
    textSub: "#6B7280",
    border: "#F3F4F6",
    sidebar: "#F9FAFB",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* --- COLUMN 1: LEFT SIDEBAR NAVIGATION --- */}
      <aside
        style={{
          width: "280px",
          backgroundColor: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "48px",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          <span
            style={{ fontSize: "22px", fontWeight: "800", color: theme.dark }}
          >
            Your
          </span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: theme.primary,
            }}
          >
            Notes.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div className="nav-group">
            <p style={navLabel}>Library</p>
            <SidebarItem icon={<Home size={18} />} label="All Notes" active />
            <SidebarItem icon={<Star size={18} />} label="Starred" />
            <SidebarItem icon={<Trash2 size={18} />} label="Trash" />
          </div>

          <div className="nav-group">
            <p style={navLabel}>Subjects</p>
            <SidebarItem
              icon={<Folder size={18} />}
              label="Electrical Engineering"
            />
            <SidebarItem icon={<Folder size={18} />} label="Internship Tasks" />
            <button
              style={{
                background: "none",
                border: "none",
                color: theme.primary,
                fontWeight: "700",
                fontSize: "13px",
                paddingLeft: "12px",
                cursor: "pointer",
              }}
            >
              + New Folder
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            backgroundColor: theme.dark,
            padding: "20px",
            borderRadius: "16px",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", opacity: 0.6, marginBottom: "4px" }}>
            Nandkishor Barkhade
          </p>
          <strong
            style={{
              color: theme.primary,
              fontSize: "11px",
              letterSpacing: "1px",
            }}
          >
            ✓ FULL FREE ACCESS
          </strong>
        </div>
      </aside>

      {/* --- COLUMN 2: MAIN WORKSPACE --- */}
      <main style={{ flex: 1, padding: "60px 5%", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "42px",
              fontWeight: "800",
              letterSpacing: "-2.5px",
            }}
          >
            My Library.
          </h1>
          <button style={btnNew}>
            <Plus size={18} /> Create New Note
          </button>
        </div>

        {/* 2-Column Grid for Notes (1 Row = 2 Notes) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Note Card Example 1 */}
          <div style={noteCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span style={tagStyle}>⚡ AI SUMMARY READY</span>
              <button style={iconBtn}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            <h3 style={noteTitle}>PLC & SCADA Internship Recap</h3>
            <p style={noteDesc}>
              Deep dive into Siemens Simatic Manager and ladder logic
              programming from the 5-week CRISP Bhopal training.
            </p>
            <div style={cardFooter}>
              <div style={{ display: "flex", gap: "10px" }}>
                <Sparkles size={14} color={theme.primary} />
                <CreditCard size={14} color={theme.textSub} />
              </div>
              <span>Updated 2h ago</span>
            </div>
          </div>

          {/* Note Card Example 2 */}
          <div style={noteCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span style={tagStyle}>📂 ACADEMIC</span>
              <button style={iconBtn}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            <h3 style={noteTitle}>Snowflake Schema Design</h3>
            <p style={noteDesc}>
              Key differences between Star and Snowflake schemas for data
              warehousing modules in Electrical Eng.
            </p>
            <div style={cardFooter}>
              <div style={{ display: "flex", gap: "10px" }}>
                <Share2 size={14} color={theme.textSub} />
                <FileDown size={14} color={theme.textSub} />
              </div>
              <span>Updated Yesterday</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Internal Styled Components ---
const navLabel = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  marginBottom: "16px",
  paddingLeft: "12px",
};

function SidebarItem({ icon, label, active }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: active ? "700" : "500",
        color: active ? "#10B981" : "#6B7280",
        backgroundColor: active ? "#ECFDF5" : "transparent",
        cursor: "pointer",
        transition: "0.2s",
        marginBottom: "4px",
      }}
    >
      {icon} {label}
    </div>
  );
}

const btnNew = {
  backgroundColor: "#10B981",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "12px",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
};

const noteCard = {
  border: "1px solid #F3F4F6",
  borderRadius: "20px",
  padding: "28px",
  backgroundColor: "#fff",
  cursor: "pointer",
  transition: "0.3s",
  display: "flex",
  flexDirection: "column",
  minHeight: "220px",
};

const tagStyle = {
  color: "#10B981",
  fontWeight: "800",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const noteTitle = {
  fontSize: "20px",
  fontWeight: "700",
  marginBottom: "10px",
  color: "#111827",
};

const noteDesc = {
  fontSize: "14px",
  color: "#6B7280",
  lineHeight: "1.6",
  flex: 1,
};

const cardFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "20px",
  borderTop: "1px solid #F3F4F6",
  marginTop: "20px",
  fontSize: "12px",
  color: "#6B7280",
};

const iconBtn = {
  background: "none",
  border: "none",
  color: "#6B7280",
  cursor: "pointer",
};
