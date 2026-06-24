import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  Shield, Users, FileText, AlertTriangle, Bot,
  BarChart3, ArrowLeft, Sun, Moon, RefreshCw,
  Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight,
  Search, Crown, UserCheck, TrendingUp, Globe,
  Download, Heart, Flag, RotateCcw, X, Activity,
  AlertCircle, Zap, Eye, EyeOff,
} from 'lucide-react';

/* ─────────────────────────── helpers ─────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString();
const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const initials = (name = '?') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ─────────────────────────── CSS injection ──────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

  .admin-row:hover { background: var(--row-hover) !important; }
  .tab-btn:hover:not(.active) { color: var(--text2) !important; background: var(--surface2) !important; }
  .action-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
  .stat-card:hover { border-color: var(--accent) !important; transform: translateY(-2px); }
  .quick-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -8px rgba(0,0,0,0.3) !important; }
  .icon-btn:hover { background: var(--surface2) !important; }
  .report-card:hover { border-left-color: var(--red) !important; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

  input::placeholder { color: var(--text4); }
  input:focus { outline: none; }

  .bar-fill { transition: width 0.5s cubic-bezier(.4,0,.2,1); }

  .fade-in { animation: fadeUp 0.3s ease both; }
  .scale-in { animation: scaleIn 0.2s ease both; }
`;

export default function AdminPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Inject global CSS once
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/home', { replace: true });
  }, [user, navigate]);

  /* ── Design tokens ─────────────────────────────────────────────── */
  const c = {
    bg:        isDark ? '#0a0a0c' : '#f4f3f0',
    bgAlt:     isDark ? '#111115' : '#eceae5',
    surface:   isDark ? '#16161a' : '#ffffff',
    surface2:  isDark ? '#1e1e24' : '#f7f6f3',
    border:    isDark ? '#252530' : '#e2dfd8',
    border2:   isDark ? '#32323f' : '#ccc9c0',
    text:      isDark ? '#f0eff6' : '#141417',
    text2:     isDark ? '#a8a6b4' : '#4a4855',
    text3:     isDark ? '#64626e' : '#8c8898',
    text4:     isDark ? '#3d3b47' : '#b8b4c0',
    accent:    '#f97316',
    accentD:   '#ea580c',
    accentL:   isDark ? 'rgba(249,115,22,0.10)' : 'rgba(249,115,22,0.08)',
    red:       isDark ? '#f87171' : '#dc2626',
    redL:      isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.08)',
    green:     isDark ? '#4ade80' : '#16a34a',
    greenL:    isDark ? 'rgba(74,222,128,0.10)' : 'rgba(22,163,74,0.08)',
    purple:    isDark ? '#c084fc' : '#7c3aed',
    purpleL:   isDark ? 'rgba(192,132,252,0.10)' : 'rgba(124,58,237,0.08)',
    blue:      isDark ? '#60a5fa' : '#2563eb',
    blueL:     isDark ? 'rgba(96,165,250,0.10)' : 'rgba(37,99,235,0.08)',
    yellow:    isDark ? '#fbbf24' : '#d97706',
    yellowL:   isDark ? 'rgba(251,191,36,0.10)' : 'rgba(217,119,6,0.08)',
    rowHover:  isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  };

  /* Inject CSS vars */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--red', c.red);
    root.style.setProperty('--text2', c.text2);
    root.style.setProperty('--surface2', c.surface2);
    root.style.setProperty('--border2', c.border2);
    root.style.setProperty('--text4', c.text4);
    root.style.setProperty('--row-hover', c.rowHover);
  }, [isDark]);

  /* ── State ─────────────────────────────────────────────────────── */
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try { const { data } = await API.get('/admin/stats'); setStats(data); }
    catch { toast.error('Stats load nahi hue'); }
    finally { setStatsLoading(false); }
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Users
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userPages, setUserPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [usersLoading, setUsersLoading] = useState(false);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await API.get('/admin/users', { params: { page: userPage, search: userSearch, filter: userFilter } });
      setUsers(data.users); setUserTotal(data.total); setUserPages(data.totalPages);
    } catch { toast.error('Users load nahi hue'); }
    finally { setUsersLoading(false); }
  }, [userPage, userSearch, userFilter]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  const handleBan = async () => {
    if (!banModal) return;
    try {
      const { data } = await API.patch(`/admin/users/${banModal.userId}/ban`, { reason: banReason });
      toast.success(data.message); setBanModal(null); setBanReason(''); loadUsers(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || 'Ban failed'); }
  };
  const handleUnban = async (userId) => {
    try {
      const { data } = await API.patch(`/admin/users/${userId}/ban`, { reason: '' });
      toast.success(data.message); loadUsers(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const handleDelete = async (userId, name) => {
    if (!window.confirm(`"${name}" ko permanently delete karna chahte ho?`)) return;
    try {
      const { data } = await API.delete(`/admin/users/${userId}`);
      toast.success(data.message); loadUsers(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };
  const handleRoleToggle = async (userId, currentRole, name) => {
    const to = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`"${name}" ko ${to} banana chahte ho?`)) return;
    try {
      const { data } = await API.patch(`/admin/users/${userId}/role`);
      toast.success(data.message); loadUsers();
    } catch (e) { toast.error(e.response?.data?.message || 'Role change failed'); }
  };

  // Notes
  const [notes, setNotes] = useState([]);
  const [notePage, setNotePage] = useState(1);
  const [noteTotal, setNoteTotal] = useState(0);
  const [notePages, setNotePages] = useState(1);
  const [noteSearch, setNoteSearch] = useState('');
  const [noteFilter, setNoteFilter] = useState('all');
  const [notesLoading, setNotesLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const { data } = await API.get('/admin/notes', { params: { page: notePage, search: noteSearch, filter: noteFilter } });
      setNotes(data.notes); setNoteTotal(data.total); setNotePages(data.totalPages);
    } catch { toast.error('Notes load nahi hue'); }
    finally { setNotesLoading(false); }
  }, [notePage, noteSearch, noteFilter]);
  useEffect(() => { if (tab === 'notes') loadNotes(); }, [tab, loadNotes]);

  const handleForceRemove = async (noteId) => {
    try { const { data } = await API.patch(`/admin/notes/${noteId}/force-remove`); toast.success(data.message); loadNotes(); }
    catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };
  const handleRestore = async (noteId) => {
    try { const { data } = await API.patch(`/admin/notes/${noteId}/restore`); toast.success(data.message); loadNotes(); }
    catch (e) { toast.error(e.response?.data?.message || 'Restore failed'); }
  };
  const handleClearReports = async (noteId) => {
    try { const { data } = await API.patch(`/admin/notes/${noteId}/clear-reports`); toast.success(data.message); loadNotes(); }
    catch (e) { toast.error(e.response?.data?.message || 'Clear failed'); }
  };

  // Reported
  const [reported, setReported] = useState([]);
  const [reportedLoading, setReportedLoading] = useState(false);
  const loadReported = useCallback(async () => {
    setReportedLoading(true);
    try { const { data } = await API.get('/admin/notes/reported'); setReported(data.notes); }
    catch { toast.error('Reported notes load nahi hue'); }
    finally { setReportedLoading(false); }
  }, []);
  useEffect(() => { if (tab === 'reported') loadReported(); }, [tab, loadReported]);

  // AI
  const [aiStats, setAiStats] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const loadAi = useCallback(async () => {
    setAiLoading(true);
    try { const { data } = await API.get('/admin/ai-usage'); setAiStats(data); }
    catch { toast.error('AI stats load nahi hue'); }
    finally { setAiLoading(false); }
  }, []);
  useEffect(() => { if (tab === 'ai') loadAi(); }, [tab, loadAi]);

  if (!user || user.role !== 'admin') return null;

  /* ── Micro components ──────────────────────────────────────────── */

  const Badge = ({ label, color, bg, icon: Icon, size = 'sm' }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color,
      borderRadius: 6, padding: size === 'sm' ? '3px 9px' : '5px 12px',
      fontSize: size === 'sm' ? 11 : 12, fontWeight: 700,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
      fontFamily: 'var(--font)',
    }}>
      {Icon && <Icon size={10} strokeWidth={2.5} />}{label}
    </span>
  );

  const ActionBtn = ({ label, onClick, color, disabled, icon: Icon, variant = 'ghost' }) => (
    <button
      className="action-btn"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: variant === 'solid' ? color : `${color}18`,
        color: variant === 'solid' ? '#fff' : color,
        border: `1px solid ${color}${variant === 'solid' ? '' : '30'}`,
        borderRadius: 8, padding: '6px 12px',
        fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
        whiteSpace: 'nowrap', fontFamily: 'var(--font)',
        letterSpacing: '0.01em',
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} />}{label}
    </button>
  );

  const Spinner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 0', gap: 14, color: c.text3 }}>
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: `2px solid ${c.border2}`,
          borderTopColor: c.accent,
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }} />
        <Activity size={14} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: c.accent }} />
      </div>
      <span style={{ fontSize: 13, fontFamily: 'var(--font)', letterSpacing: '0.02em' }}>Loading data…</span>
    </div>
  );

  const EmptyState = ({ icon: Icon, title, sub }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 0', gap: 10 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: c.surface2, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: c.text4, marginBottom: 4,
      }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: c.text2, fontFamily: 'var(--font)' }}>{title}</div>
      <div style={{ fontSize: 13, color: c.text3, fontFamily: 'var(--font)' }}>{sub}</div>
    </div>
  );

  const Pagination = ({ page, pages, onChange, total }) => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 18, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: c.text3, fontFamily: 'var(--font)' }}>
        {total ? `${fmt(total)} total` : `Page ${page} of ${pages}`}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={() => onChange(page - 1)} disabled={page <= 1}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: c.surface, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            opacity: page <= 1 ? 0.35 : 1, color: c.text2,
            transition: 'all 0.15s',
          }}
        ><ChevronLeft size={15} /></button>
        <span style={{
          fontFamily: 'var(--font)', fontSize: 12, color: c.text3,
          padding: '0 10px', minWidth: 80, textAlign: 'center',
        }}>
          {page} / {pages}
        </span>
        <button
          onClick={() => onChange(page + 1)} disabled={page >= pages}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: c.surface, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: page >= pages ? 'not-allowed' : 'pointer',
            opacity: page >= pages ? 0.35 : 1, color: c.text2,
            transition: 'all 0.15s',
          }}
        ><ChevronRight size={15} /></button>
      </div>
    </div>
  );

  const inputStyle = {
    background: c.surface2, border: `1px solid ${c.border}`,
    borderRadius: 10, padding: '9px 13px 9px 38px',
    fontSize: 13, color: c.text,
    fontFamily: 'var(--font)', transition: 'border-color 0.15s',
    width: '100%',
  };

  const FilterBtn = ({ k, label, active, setActive }) => (
    <button
      onClick={() => setActive(k)}
      style={{
        background: active === k ? c.accent : c.surface2,
        color: active === k ? '#fff' : c.text3,
        border: `1px solid ${active === k ? c.accent : c.border}`,
        borderRadius: 8, padding: '7px 14px',
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        fontFamily: 'var(--font)', letterSpacing: '0.02em',
      }}
    >{label}</button>
  );

  const StatCard = ({ label, value, icon: Icon, valueColor, sub, accent }) => (
    <div
      className="stat-card"
      style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderRadius: 14, padding: '22px 22px 18px',
        display: 'flex', flexDirection: 'column', gap: 6,
        cursor: 'default', transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* subtle accent bar on top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent || (valueColor || c.accent),
        opacity: 0.6, borderRadius: '14px 14px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: c.text3,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          fontFamily: 'var(--font)',
        }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: (valueColor || c.accent) + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: valueColor || c.accent, flexShrink: 0,
        }}>
          <Icon size={15} strokeWidth={2} />
        </div>
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800, color: valueColor || c.text,
        letterSpacing: '-1.5px', lineHeight: 1,
        fontFamily: 'var(--font)',
      }}>{fmt(value)}</div>
      {sub && <div style={{ fontSize: 11, color: c.text3, fontFamily: 'var(--font)' }}>{sub}</div>}
    </div>
  );

  const AvatarCell = ({ name, email, avatar }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: c.accentL, border: `1.5px solid ${c.accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 12, color: c.accent,
        overflow: 'hidden', fontFamily: 'var(--font)',
      }}>
        {avatar ? <img src={avatar} alt="" style={{ width: 36, height: 36, objectFit: 'cover' }} /> : initials(name)}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: c.text, fontFamily: 'var(--font)' }}>{name}</div>
        <div style={{ fontSize: 11, color: c.text3, marginTop: 1, fontFamily: 'var(--font)' }}>{email}</div>
      </div>
    </div>
  );

  const th = {
    textAlign: 'left', fontSize: 10, fontWeight: 700, color: c.text3,
    textTransform: 'uppercase', letterSpacing: '0.10em',
    padding: '11px 18px', borderBottom: `1px solid ${c.border}`,
    background: c.surface2, fontFamily: 'var(--font)',
  };
  const td = {
    padding: '14px 18px', fontSize: 13, color: c.text2,
    borderBottom: `1px solid ${c.border}`, verticalAlign: 'middle',
    fontFamily: 'var(--font)',
  };

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: c.surface, border: `1px solid ${c.border}`,
      borderRadius: 14, overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  );

  const SectionHeader = ({ title, sub, action }) => (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: 22, flexWrap: 'wrap', gap: 12,
    }}>
      <div>
        <h2 style={{
          fontWeight: 800, fontSize: 22, color: c.text, margin: 0,
          fontFamily: 'var(--font)', letterSpacing: '-0.5px',
        }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: c.text3, marginTop: 4, fontFamily: 'var(--font)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );

  /* ── Tabs ───────────────────────────────────────────────────────── */
  const tabs = [
    { key: 'overview', label: 'Overview',  Icon: BarChart3, count: null },
    { key: 'users',    label: 'Users',     Icon: Users,     count: stats?.totalUsers },
    { key: 'notes',    label: 'Notes',     Icon: FileText,  count: stats?.publicNotes },
    { key: 'reported', label: 'Reported',  Icon: Flag,      count: stats?.reportedNotes, alert: stats?.reportedNotes > 0 },
    { key: 'ai',       label: 'AI Usage',  Icon: Bot,       count: null },
  ];

  /* ══════════════════════ RENDER ════════════════════════════════ */
  return (
    <div style={{
      minHeight: '100dvh', background: c.bg,
      fontFamily: 'var(--font)', color: c.text,
    }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark ? 'rgba(10,10,12,0.85)' : 'rgba(244,243,240,0.85)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        borderBottom: `1px solid ${c.border}`,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(249,115,22,0.4)',
          }}>
            <Shield size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: c.text, fontFamily: 'var(--font)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              Admin Panel
            </div>
            <div style={{ fontSize: 10, color: c.text3, fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
              YOURNOTES — CONTROL CENTER
            </div>
          </div>
          <div style={{
            background: c.accentL, color: c.accent,
            border: `1px solid ${c.accent}30`,
            borderRadius: 6, padding: '2px 9px',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
            fontFamily: 'var(--font)',
          }}>ADMIN</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: c.text3, fontFamily: 'var(--font)', marginRight: 4 }}>
            {user?.email}
          </span>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: c.surface2, border: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: c.text2, transition: 'all 0.15s',
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: c.surface2, border: `1px solid ${c.border}`,
              borderRadius: 9, padding: '7px 14px',
              fontSize: 13, fontWeight: 600, color: c.text2, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s', fontFamily: 'var(--font)',
            }}
          >
            <ArrowLeft size={14} />Back
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────── */}
      <div style={{
        background: isDark ? 'rgba(22,22,26,0.6)' : 'rgba(255,255,255,0.6)',
        borderBottom: `1px solid ${c.border}`,
        padding: '0 32px', display: 'flex', gap: 0,
        backdropFilter: 'blur(12px)',
      }}>
        {tabs.map(({ key, label, Icon, count, alert }) => (
          <button
            key={key}
            className={`tab-btn${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 18px', fontSize: 13, fontWeight: 600,
              color: tab === key ? c.accent : c.text3,
              borderBottom: tab === key ? `2px solid ${c.accent}` : '2px solid transparent',
              transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font)',
              letterSpacing: '0.01em',
            }}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
            {count > 0 && (
              <span style={{
                background: alert ? c.red : c.accentL,
                color: alert ? '#fff' : c.accent,
                borderRadius: 999, padding: '1px 7px',
                fontSize: 10, fontWeight: 800,
                fontFamily: 'var(--font)',
              }}>{fmt(count)}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ════ OVERVIEW ════ */}
        {tab === 'overview' && (
          statsLoading ? <Spinner /> : stats ? (
            <div className="fade-in">
              {/* Stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
                <StatCard label="Total Users"    value={stats.totalUsers}       icon={Users}       sub={`+${fmt(stats.newUsersThisWeek)} this week`} />
                <StatCard label="Banned"         value={stats.bannedUsers}      icon={Ban}         valueColor={c.red} />
                <StatCard label="Admins"         value={stats.totalAdmins}      icon={Crown}       valueColor={c.purple} />
                <StatCard label="New This Week"  value={stats.newUsersThisWeek} icon={TrendingUp}  valueColor={c.green} />
                <StatCard label="Total Notes"    value={stats.totalNotes}       icon={FileText} />
                <StatCard label="Public Notes"   value={stats.publicNotes}      icon={Globe}       valueColor={c.blue} />
                <StatCard label="Reported"       value={stats.reportedNotes}    icon={AlertTriangle} valueColor={stats.reportedNotes > 0 ? c.red : c.text3} />
                <StatCard label="AI Calls / hr"  value={stats.totalAiCallsNow}  icon={Bot}         valueColor={c.purple} />
              </div>

              {/* Quick nav cards */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: c.text4, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 12, fontFamily: 'var(--font)' }}>
                  Quick Actions
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
                  {[
                    { icon: Users,         label: 'Manage Users',    sub: `${fmt(stats.totalUsers)} total users`,     key: 'users',    color: c.accent },
                    { icon: FileText,      label: 'Manage Notes',    sub: `${fmt(stats.publicNotes)} public notes`,   key: 'notes',    color: c.blue },
                    { icon: AlertTriangle, label: 'Reported Notes',  sub: `${fmt(stats.reportedNotes)} need review`,  key: 'reported', color: c.red },
                    { icon: Bot,           label: 'AI Usage',        sub: 'Monitor usage patterns',                  key: 'ai',       color: c.purple },
                  ].map(({ icon: Icon, label, sub, key, color }) => (
                    <button
                      key={key}
                      className="quick-card"
                      onClick={() => setTab(key)}
                      style={{
                        background: c.surface, border: `1px solid ${c.border}`,
                        borderRadius: 14, padding: '18px 20px',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}
                    >
                      <div style={{
                        width: 42, height: 42, borderRadius: 11,
                        background: `${color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color, flexShrink: 0,
                      }}>
                        <Icon size={20} strokeWidth={1.75} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: c.text, fontFamily: 'var(--font)', letterSpacing: '-0.2px' }}>{label}</div>
                        <div style={{ fontSize: 12, color: c.text3, marginTop: 3, fontFamily: 'var(--font)' }}>{sub}</div>
                      </div>
                      <ChevronRight size={16} style={{ color: c.text4, flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionBtn label="Refresh Stats" onClick={loadStats} color={c.green} icon={RefreshCw} />
              </div>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Stats load nahi hue" sub="Refresh karke try karo" />
          )
        )}

        {/* ════ USERS ════ */}
        {tab === 'users' && (
          <div className="fade-in">
            <SectionHeader
              title="User Management"
              sub={`${fmt(userTotal)} registered users`}
              action={
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.text3 }} />
                    <input
                      style={{ ...inputStyle, width: 230 }}
                      placeholder="Search name or email…"
                      value={userSearch}
                      onFocus={e => e.target.style.borderColor = c.accent}
                      onBlur={e => e.target.style.borderColor = c.border}
                      onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                    />
                  </div>
                  {[['all', 'All'], ['banned', 'Banned'], ['admins', 'Admins']].map(([k, l]) => (
                    <FilterBtn key={k} k={k} label={l} active={userFilter} setActive={(v) => { setUserFilter(v); setUserPage(1); }} />
                  ))}
                </div>
              }
            />

            {usersLoading ? <Spinner /> : (
              <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>User</th>
                      <th style={th}>Role</th>
                      <th style={th}>Status</th>
                      <th style={th}>Joined</th>
                      <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon={Users} title="No users found" sub="Try a different search or filter" /></td></tr>
                    ) : users.map(u => (
                      <tr key={u._id} className="admin-row" style={{ transition: 'background 0.1s' }}>
                        <td style={td}><AvatarCell name={u.name} email={u.email} avatar={u.avatar} /></td>
                        <td style={td}>
                          <Badge
                            label={u.role === 'admin' ? 'Admin' : 'User'}
                            color={u.role === 'admin' ? c.purple : c.text3}
                            bg={u.role === 'admin' ? c.purpleL : c.surface2}
                            icon={u.role === 'admin' ? Crown : UserCheck}
                          />
                        </td>
                        <td style={td}>
                          {u.isBanned ? (
                            <div>
                              <Badge label="Banned" color={c.red} bg={c.redL} icon={Ban} />
                              {u.banReason && (
                                <div style={{ fontSize: 11, color: c.text3, marginTop: 5, maxWidth: 160, fontFamily: 'var(--font)' }}>
                                  {u.banReason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge label="Active" color={c.green} bg={c.greenL} icon={CheckCircle} />
                          )}
                        </td>
                        <td style={{ ...td, fontSize: 12, color: c.text3, fontFamily: 'var(--font)' }}>
                          {ago(u.createdAt)}
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {u.isBanned
                              ? <ActionBtn label="Unban" onClick={() => handleUnban(u._id)} color={c.green} icon={CheckCircle} />
                              : <ActionBtn label="Ban" onClick={() => setBanModal({ userId: u._id, name: u.name })} color={c.red} icon={Ban} />}
                            <ActionBtn
                              label={u.role === 'admin' ? 'Demote' : 'Promote'}
                              onClick={() => handleRoleToggle(u._id, u.role, u.name)}
                              color={c.purple} icon={Crown}
                            />
                            <ActionBtn label="Delete" onClick={() => handleDelete(u._id, u.name)} color={c.red} icon={Trash2} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            <Pagination page={userPage} pages={userPages} onChange={setUserPage} total={userTotal} />
          </div>
        )}

        {/* ════ NOTES ════ */}
        {tab === 'notes' && (
          <div className="fade-in">
            <SectionHeader
              title="Community Notes"
              sub={`${fmt(noteTotal)} total notes`}
              action={
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.text3 }} />
                    <input
                      style={{ ...inputStyle, width: 230 }}
                      placeholder="Search title or content…"
                      value={noteSearch}
                      onFocus={e => e.target.style.borderColor = c.accent}
                      onBlur={e => e.target.style.borderColor = c.border}
                      onChange={e => { setNoteSearch(e.target.value); setNotePage(1); }}
                    />
                  </div>
                  {[['all', 'All'], ['reported', 'Reported'], ['removed', 'Removed']].map(([k, l]) => (
                    <FilterBtn key={k} k={k} label={l} active={noteFilter} setActive={(v) => { setNoteFilter(v); setNotePage(1); }} />
                  ))}
                </div>
              }
            />

            {notesLoading ? <Spinner /> : (
              <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: '34%' }}>Note</th>
                      <th style={{ ...th, width: '20%' }}>Author</th>
                      <th style={{ ...th, width: '14%' }}>Stats</th>
                      <th style={{ ...th, width: '12%' }}>Status</th>
                      <th style={{ ...th, width: '20%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon={FileText} title="No notes found" sub="Try a different filter" /></td></tr>
                    ) : notes.map(n => (
                      <tr key={n._id} className="admin-row" style={{ transition: 'background 0.1s' }}>
                        <td style={td}>
                          <div style={{
                            fontWeight: 600, fontSize: 13, color: c.text,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={n.title}>
                            {n.title || 'Untitled'}
                          </div>
                          {n.subject && (
                            <div style={{ fontSize: 11, color: c.accent, marginTop: 3, fontWeight: 600 }}>{n.subject}</div>
                          )}
                          <div style={{ fontSize: 11, color: c.text4, marginTop: 3, fontFamily: 'var(--font)' }}>
                            {ago(n.createdAt)}
                          </div>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: c.text }}>{n.user?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: c.text3, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font)' }}>
                            {n.user?.email || ''}
                          </div>
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: c.text2 }}>
                              <Heart size={11} style={{ color: c.red }} />
                              <b style={{ fontFamily: 'var(--font)' }}>{fmt(n.likesCount)}</b>
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: c.text2 }}>
                              <Download size={11} style={{ color: c.blue }} />
                              <b style={{ fontFamily: 'var(--font)' }}>{fmt(n.downloads)}</b>
                            </span>
                            {n.reportsCount > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: c.red, fontWeight: 700 }}>
                                <Flag size={11} />
                                <b style={{ fontFamily: 'var(--font)' }}>{fmt(n.reportsCount)}</b>
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={td}>
                          {n.isRemovedByAdmin
                            ? <Badge label="Removed" color={c.red} bg={c.redL} icon={EyeOff} />
                            : n.reportsCount > 0
                              ? <Badge label="Reported" color={c.yellow} bg={c.yellowL} icon={Flag} />
                              : <Badge label="Live" color={c.green} bg={c.greenL} icon={Eye} />}
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {n.isRemovedByAdmin
                              ? <ActionBtn label="Restore" onClick={() => handleRestore(n._id)} color={c.green} icon={RotateCcw} />
                              : <ActionBtn label="Remove" onClick={() => handleForceRemove(n._id)} color={c.red} icon={Trash2} />}
                            {n.reportsCount > 0 && (
                              <ActionBtn label="Dismiss" onClick={() => handleClearReports(n._id)} color={c.blue} icon={CheckCircle} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            <Pagination page={notePage} pages={notePages} onChange={setNotePage} total={noteTotal} />
          </div>
        )}

        {/* ════ REPORTED ════ */}
        {tab === 'reported' && (
          <div className="fade-in">
            <SectionHeader
              title="Reported Notes"
              sub={`${fmt(reported.length)} notes awaiting review`}
            />

            {reportedLoading ? <Spinner /> : reported.length === 0 ? (
              <Card style={{ padding: 60 }}>
                <EmptyState icon={CheckCircle} title="All clear!" sub="No reported notes — community is healthy." />
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reported.map(n => (
                  <div
                    key={n._id}
                    className="report-card"
                    style={{
                      background: c.surface, borderRadius: 14,
                      border: `1px solid ${c.border}`,
                      borderLeft: `3px solid ${c.redL}`,
                      padding: '20px 24px',
                      transition: 'border-left-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: c.text, fontFamily: 'var(--font)' }}>
                            {n.title || 'Untitled'}
                          </span>
                          <Badge label={`${fmt(n.reportsCount)} reports`} color={c.red} bg={c.redL} icon={Flag} />
                        </div>
                        <div style={{ fontSize: 12, color: c.text3, marginBottom: 12, fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span>By <strong style={{ color: c.text2 }}>{n.user?.name}</strong></span>
                          <span style={{ color: c.border2 }}>·</span>
                          <span>{ago(n.createdAt)}</span>
                          <span style={{ color: c.border2 }}>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Heart size={11} style={{ color: c.red }} /> {fmt(n.likesCount)}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Download size={11} style={{ color: c.blue }} /> {fmt(n.downloads)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {n.reports?.slice(0, 4).map((r, i) => (
                            <span key={i} style={{
                              background: c.redL, color: c.red,
                              borderRadius: 6, padding: '3px 10px',
                              fontSize: 11, fontWeight: 600,
                              fontFamily: 'var(--font)',
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                            }}>
                              <AlertCircle size={10} />
                              {r.reason || 'No reason specified'}
                              {r.user?.name && <span style={{ opacity: 0.6 }}>— {r.user.name}</span>}
                            </span>
                          ))}
                          {n.reports?.length > 4 && (
                            <span style={{ fontSize: 11, color: c.text3, padding: '3px 6px', fontFamily: 'var(--font)' }}>
                              +{n.reports.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', gap: 8, marginTop: 16, paddingTop: 14,
                      borderTop: `1px solid ${c.border}`,
                    }}>
                      <ActionBtn label="Force Remove" onClick={() => handleForceRemove(n._id)} color={c.red} icon={Trash2} />
                      <ActionBtn label="Dismiss Reports" onClick={() => handleClearReports(n._id)} color={c.blue} icon={CheckCircle} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ AI USAGE ════ */}
        {tab === 'ai' && (
          <div className="fade-in">
            <SectionHeader
              title="AI Usage"
              sub="Current hour — resets automatically"
            />

            {aiLoading ? <Spinner /> : aiStats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                  <StatCard label="Total Calls / hr" value={aiStats.totalCallsNow}         icon={Zap}      valueColor={c.purple} />
                  <StatCard label="Users w/ AI"      value={aiStats.totalUsersWithAiCalls} icon={Users} />
                  <StatCard label="Avg Calls / User" value={aiStats.avgCallsPerUser}        icon={BarChart3} />
                </div>

                <Card>
                  <div style={{
                    padding: '16px 20px', borderBottom: `1px solid ${c.border}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Bot size={15} style={{ color: c.purple }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: c.text, fontFamily: 'var(--font)' }}>Top AI Users</span>
                    <span style={{ fontSize: 12, color: c.text3, fontFamily: 'var(--font)' }}>— this hour</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...th, width: 50 }}>#</th>
                        <th style={th}>User</th>
                        <th style={th}>Calls</th>
                        <th style={th}>Last Reset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiStats.topAiUsers.length === 0 ? (
                        <tr><td colSpan={4}><EmptyState icon={Bot} title="No active AI users" sub="No calls made this hour" /></td></tr>
                      ) : aiStats.topAiUsers.map((u, i) => {
                        const max = aiStats.topAiUsers[0]?.aiCallsThisHour || 1;
                        const pct = (u.aiCallsThisHour / max) * 100;
                        return (
                          <tr key={u._id} className="admin-row" style={{ transition: 'background 0.1s' }}>
                            <td style={{ ...td, fontFamily: 'var(--font)', fontSize: 13, color: c.text3, fontWeight: 700 }}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </td>
                            <td style={td}><AvatarCell name={u.name} email={u.email} /></td>
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, height: 5, background: c.surface2, borderRadius: 3, overflow: 'hidden', maxWidth: 130 }}>
                                  <div
                                    className="bar-fill"
                                    style={{ width: `${pct}%`, height: '100%', background: c.purple, borderRadius: 3 }}
                                  />
                                </div>
                                <span style={{
                                  fontWeight: 800, color: c.purple,
                                  fontSize: 14, minWidth: 28,
                                  fontFamily: 'var(--font)',
                                }}>{u.aiCallsThisHour}</span>
                              </div>
                            </td>
                            <td style={{ ...td, fontSize: 12, color: c.text3, fontFamily: 'var(--font)' }}>
                              {u.aiCallsResetAt ? ago(u.aiCallsResetAt) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </>
            ) : (
              <EmptyState icon={Bot} title="AI stats load nahi hue" sub="Refresh karke try karo" />
            )}
          </div>
        )}

      </div>

      {/* ── Ban Modal ──────────────────────────────────────────────── */}
      {banModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => { setBanModal(null); setBanReason(''); }}
        >
          <div
            className="scale-in"
            style={{
              background: c.surface, borderRadius: 20, padding: '32px',
              maxWidth: 420, width: '100%',
              border: `1px solid ${c.border}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: c.redL, border: `1px solid ${c.red}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.red,
                }}>
                  <Ban size={20} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: c.text, fontFamily: 'var(--font)' }}>Ban User</div>
                  <div style={{ fontSize: 12, color: c.text3, marginTop: 2, fontFamily: 'var(--font)' }}>{banModal.name}</div>
                </div>
              </div>
              <button
                onClick={() => { setBanModal(null); setBanReason(''); }}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: c.surface2, border: `1px solid ${c.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: c.text3,
                }}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: c.text2, marginBottom: 20, lineHeight: 1.65, fontFamily: 'var(--font)' }}>
              Is user ka account suspend ho jayega. Woh login nahi kar payega jab tak unban na karo.
            </p>

            <label style={{ fontSize: 11, fontWeight: 700, color: c.text3, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font)' }}>
              Ban Reason (optional)
            </label>
            <input
              style={{
                ...inputStyle, paddingLeft: 13,
                width: '100%', marginBottom: 24,
              }}
              placeholder="e.g. Spam, abuse, policy violation…"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBan()}
              onFocus={e => e.target.style.borderColor = c.red}
              onBlur={e => e.target.style.borderColor = c.border}
              autoFocus
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setBanModal(null); setBanReason(''); }}
                style={{
                  background: c.surface2, border: `1px solid ${c.border}`,
                  borderRadius: 10, padding: '10px 20px',
                  fontSize: 13, fontWeight: 600, color: c.text2,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >Cancel</button>
              <ActionBtn label="Confirm Ban" onClick={handleBan} color={c.red} icon={Ban} variant="solid" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}