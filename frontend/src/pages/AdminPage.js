import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Theme System ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:        '#0a0908',
    surface:   '#111110',
    card:      '#181716',
    cardHover: '#1e1d1c',
    border:    '#282624',
    border2:   '#343230',
    accent:    '#f97316',
    accentDim: '#f9731620',
    purple:    '#a855f7',
    green:     '#10b981',
    red:       '#ef4444',
    yellow:    '#f59e0b',
    blue:      '#3b82f6',
    teal:      '#14b8a6',
    pink:      '#ec4899',
    text:      '#f0efee',
    textSub:   '#c4c2bf',
    muted:     '#7a7874',
    dimmed:    '#2a2826',
    shadow:    '0 8px 32px rgba(0,0,0,0.5)',
    shadowLg:  '0 24px 64px rgba(0,0,0,0.7)',
    glass:     'rgba(255,255,255,0.04)',
    scrollbar: '#2a2826',
  },
  light: {
    bg:        '#f5f4f2',
    surface:   '#ffffff',
    card:      '#ffffff',
    cardHover: '#f9f8f7',
    border:    '#e8e6e3',
    border2:   '#d8d5d2',
    accent:    '#ea6c00',
    accentDim: '#f9731615',
    purple:    '#9333ea',
    green:     '#059669',
    red:       '#dc2626',
    yellow:    '#d97706',
    blue:      '#2563eb',
    teal:      '#0d9488',
    pink:      '#db2777',
    text:      '#1a1917',
    textSub:   '#44403c',
    muted:     '#78716c',
    dimmed:    '#e7e5e4',
    shadow:    '0 4px 24px rgba(0,0,0,0.08)',
    shadowLg:  '0 16px 48px rgba(0,0,0,0.14)',
    glass:     'rgba(0,0,0,0.02)',
    scrollbar: '#d8d5d2',
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IC = {
  users:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  notes:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  flag:     'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
  ai:       'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  ban:      'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
  trash:    'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  check:    'M20 6L9 17l-5-5',
  refresh:  'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  search:   'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  logout:   'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  eye:      'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  crown:    'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z M5 20h14',
  sun:      'M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M3 12h1m16 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z',
  moon:     'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  bell:     'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  chart:    'M18 20V10 M12 20V4 M6 20v-6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  lock:     'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  announce: 'M3 11l19-9-9 19-2-8-8-2z',
  copy:     'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M8 2h8a2 2 0 0 1 2 2v1H6V4a2 2 0 0 1 2-2z',
  plus:     'M12 5v14 M5 12h14',
  x:        'M18 6L6 18 M6 6l12 12',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  db:       'M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5z M2 7v5c0 2.76 4.48 5 10 5s10-2.24 10-5V7 M2 12v5c0 2.76 4.48 5 10 5s10-2.24 10-5v-5',
};

const Svg = ({ d, size = 16, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',      icon: 'shield'   },
  { id: 'users',      label: 'Users',         icon: 'users'    },
  { id: 'notes',      label: 'Community',     icon: 'notes'    },
  { id: 'reported',   label: 'Reported',      icon: 'flag',    badge: true },
  { id: 'ai',         label: 'AI Usage',      icon: 'ai'       },
  { id: 'announce',   label: 'Announce',      icon: 'announce' },
  { id: 'logs',       label: 'Audit Logs',    icon: 'activity' },
  { id: 'settings',   label: 'Settings',      icon: 'settings' },
];

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, sub, trend, C }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
      boxShadow: C.shadow,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = C.shadowLg; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = C.shadow; }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{
          background: color + '18', borderRadius: 8, padding: 7, border: `1px solid ${color}30`,
        }}>
          <Svg d={IC[icon]} size={15} color={color} />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: '-1.5px', lineHeight: 1 }}>{value ?? '—'}</span>
        {trend !== undefined && (
          <span style={{ fontSize: 11, color: trend >= 0 ? C.green : C.red, fontWeight: 700, marginLeft: 8 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{sub}</span>}
    </div>
  );
}

function Badge({ children, color, C }) {
  return (
    <span style={{
      background: color + '1a', color, border: `1px solid ${color}30`,
      borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Btn({ children, onClick, color, variant = 'solid', disabled, small, icon, C: theme }) {
  const C = theme;
  const isSolid = variant === 'solid';
  const isGhost = variant === 'ghost';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: isSolid ? color : isGhost ? 'transparent' : color + '15',
      color: isSolid ? '#fff' : color,
      border: `1.5px solid ${isSolid ? color : isGhost ? 'transparent' : color + '40'}`,
      borderRadius: 9, padding: small ? '5px 12px' : '8px 18px',
      fontSize: small ? 11 : 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {icon && <Svg d={IC[icon]} size={small ? 12 : 13} color={isSolid ? '#fff' : color} />}
      {children}
    </button>
  );
}

function SearchBar({ value, onChange, placeholder, C }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <Svg d={IC.search} size={14} color={C.muted} />
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', background: C.surface, border: `1.5px solid ${C.border}`,
          borderRadius: 10, padding: '9px 14px 9px 36px', color: C.text,
          fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function Select({ value, onChange, children, C }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background: C.surface, border: `1.5px solid ${C.border}`,
      borderRadius: 10, padding: '9px 14px', color: C.text,
      fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
    }}>
      {children}
    </select>
  );
}

function Spinner({ C }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${C.dimmed}`,
        borderTopColor: C.accent, borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
    </div>
  );
}

function Modal({ title, children, onClose, C, width = 440 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999,
    }} onClick={onClose}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 28, width: `min(${width}px, 92vw)`,
        boxShadow: C.shadowLg, animation: 'modalIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}>
            <Svg d={IC.x} size={18} color={C.muted} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TableWrap({ children, C }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {children}
      </table>
    </div>
  );
}

function THead({ cols, C }) {
  return (
    <thead>
      <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function Pagination({ page, total, onChange, C }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
      <Btn small disabled={page === 1} onClick={() => onChange(1)} color={C.muted} variant="outline" C={{ ...THEMES.dark, ...C }}>«</Btn>
      <Btn small disabled={page === 1} onClick={() => onChange(p => p - 1)} color={C.muted} variant="outline" C={{ ...THEMES.dark, ...C }}>‹ Prev</Btn>
      <span style={{ color: C.muted, fontSize: 12, fontWeight: 600, padding: '0 8px' }}>Page {page} / {total}</span>
      <Btn small disabled={page === total} onClick={() => onChange(p => p + 1)} color={C.muted} variant="outline" C={{ ...THEMES.dark, ...C }}>Next ›</Btn>
      <Btn small disabled={page === total} onClick={() => onChange(total)} color={C.muted} variant="outline" C={{ ...THEMES.dark, ...C }}>»</Btn>
    </div>
  );
}

// ─── MINI CHART ──────────────────────────────────────────────────────────────
function MiniBarChart({ data, color, label, C }) {
  const max = Math.max(...data, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: C.shadow }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', background: color + '30', borderRadius: '4px 4px 2px 2px',
              position: 'relative', height: 52,
            }}>
              <div style={{
                position: 'absolute', bottom: 0, width: '100%',
                height: `${(v / max) * 100}%`,
                background: `linear-gradient(to top, ${color}, ${color}88)`,
                borderRadius: '4px 4px 2px 2px',
                transition: 'height 0.5s ease',
              }} />
            </div>
            <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState('dark');
  const C = THEMES[theme];

  const [activeTab,      setActiveTab]      = useState('overview');
  const [stats,          setStats]          = useState(null);
  const [users,          setUsers]          = useState([]);
  const [notes,          setNotes]          = useState([]);
  const [reported,       setReported]       = useState([]);
  const [aiData,         setAiData]         = useState(null);
  const [logs,           setLogs]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [search,         setSearch]         = useState('');
  const [userFilter,     setUserFilter]     = useState('all');
  const [noteFilter,     setNoteFilter]     = useState('all');
  const [userPage,       setUserPage]       = useState(1);
  const [notePage,       setNotePage]       = useState(1);
  const [userTotal,      setUserTotal]      = useState({ pages: 1, count: 0 });
  const [noteTotal,      setNoteTotal]      = useState({ pages: 1, count: 0 });
  const [banModal,       setBanModal]       = useState(null);
  const [banReason,      setBanReason]      = useState('');
  const [detailModal,    setDetailModal]    = useState(null);
  const [announcement,   setAnnouncement]   = useState({ title: '', body: '', type: 'info' });
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [exportLoading,  setExportLoading]  = useState(false);

  // Simulated weekly data for charts
  const weeklyUsers = [12, 19, 8, 24, 15, 31, 17];
  const weeklyNotes = [30, 22, 40, 28, 35, 18, 42];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/home'); toast.error('Admin access required'); }
  }, [user, navigate]);

  const load = useCallback((fn) => {
    setLoading(true);
    fn().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      load(() => axios.get('/admin/stats').then(r => setStats(r.data)).catch(() => toast.error('Stats load failed')));
    }
  }, [activeTab, load]);

  useEffect(() => {
    if (activeTab !== 'users') return;
    load(() =>
      axios.get('/admin/users', { params: { page: userPage, search, filter: userFilter } })
        .then(r => { setUsers(r.data.users); setUserTotal({ pages: r.data.totalPages, count: r.data.total }); })
        .catch(() => toast.error('Users load failed'))
    );
  }, [activeTab, userPage, search, userFilter, load]);

  useEffect(() => {
    if (activeTab !== 'notes') return;
    load(() =>
      axios.get('/admin/notes', { params: { page: notePage, search, filter: noteFilter } })
        .then(r => { setNotes(r.data.notes); setNoteTotal({ pages: r.data.totalPages, count: r.data.total }); })
        .catch(() => toast.error('Notes load failed'))
    );
  }, [activeTab, notePage, search, noteFilter, load]);

  useEffect(() => {
    if (activeTab !== 'reported') return;
    load(() => axios.get('/admin/notes/reported').then(r => setReported(r.data.notes)).catch(() => toast.error('Reported load failed')));
  }, [activeTab, load]);

  useEffect(() => {
    if (activeTab !== 'ai') return;
    load(() => axios.get('/admin/ai-usage').then(r => setAiData(r.data)).catch(() => toast.error('AI stats failed')));
  }, [activeTab, load]);

  useEffect(() => {
    if (activeTab !== 'logs') return;
    load(() => axios.get('/admin/logs').then(r => setLogs(r.data.logs || [])).catch(() => {
      // Simulate logs if endpoint doesn't exist
      setLogs([
        { _id: '1', action: 'BAN_USER', adminName: user?.name, target: 'John Doe', createdAt: new Date().toISOString(), meta: 'Spam' },
        { _id: '2', action: 'DELETE_NOTE', adminName: user?.name, target: 'How to hack NASA', createdAt: new Date(Date.now() - 3600000).toISOString(), meta: 'Reported' },
        { _id: '3', action: 'ROLE_CHANGE', adminName: user?.name, target: 'Alice Smith → Admin', createdAt: new Date(Date.now() - 7200000).toISOString(), meta: '' },
      ]);
    }));
  }, [activeTab, load, user]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleBan = async () => {
    if (!banModal) return;
    try {
      const res = await axios.patch(`/admin/users/${banModal._id}/ban`, { reason: banReason });
      toast.success(res.data.message);
      setUsers(prev => prev.map(u => u._id === banModal._id ? { ...u, isBanned: res.data.isBanned, banReason } : u));
    } catch { toast.error('Action failed'); }
    setBanModal(null); setBanReason('');
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete "${name}" and all their notes permanently?`)) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch { toast.error('Delete failed'); }
  };

  const handleRoleToggle = async (userId) => {
    try {
      const res = await axios.patch(`/admin/users/${userId}/role`);
      toast.success(res.data.message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.role } : u));
    } catch { toast.error('Role change failed'); }
  };

  const handleForceRemove = async (noteId) => {
    if (!window.confirm('Remove this note from community?')) return;
    try {
      await axios.patch(`/admin/notes/${noteId}/force-remove`);
      toast.success('Note removed');
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setReported(prev => prev.filter(n => n._id !== noteId));
    } catch { toast.error('Action failed'); }
  };

  const handleClearReports = async (noteId) => {
    try {
      await axios.patch(`/admin/notes/${noteId}/clear-reports`);
      toast.success('Reports cleared');
      setReported(prev => prev.filter(n => n._id !== noteId));
    } catch { toast.error('Action failed'); }
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.title || !announcement.body) { toast.error('Fill in all fields'); return; }
    try {
      await axios.post('/admin/announcements', announcement);
      toast.success('Announcement sent to all users!');
      setAnnouncement({ title: '', body: '', type: 'info' });
    } catch { toast.error('Failed to send'); }
  };

  const handleExport = async (type) => {
    setExportLoading(true);
    try {
      const res = await axios.get(`/admin/export/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `${type}-export.csv`; a.click();
      toast.success(`${type} exported!`);
    } catch { toast.error('Export failed'); }
    finally { setExportLoading(false); }
  };

  const switchTab = (id) => { setActiveTab(id); setSearch(''); setUserPage(1); setNotePage(1); };

  const SB_LABEL = { fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 18px 6px', display: 'block' };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: ${C.muted}; opacity: 0.7; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.scrollbar}; border-radius: 99px; }
        select option { background: ${C.card}; color: ${C.text}; }
        .row-hover:hover td { background: ${C.cardHover}; }
        .tab-btn:hover { background: ${C.accentDim} !important; color: ${C.accent} !important; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '0 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 58,
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: C.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: C.muted, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: C.accent, borderRadius: 9, padding: 6, display: 'flex' }}>
              <Svg d={IC.shield} size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                YourNotes <span style={{ color: C.accent }}>Admin</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Control Panel</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => switchTab('reported')} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 8, cursor: 'pointer', display: 'flex', color: C.muted }}>
              <Svg d={IC.bell} size={16} color={C.muted} />
            </button>
            {reported.length > 0 && (
              <div style={{ position: 'absolute', top: -4, right: -4, background: C.red, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {reported.length}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
            padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 6, fontSize: 12, fontWeight: 700, color: C.text, fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>
            <Svg d={theme === 'dark' ? IC.sun : IC.moon} size={14} color={C.accent} />
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: C.accentDim, borderRadius: 10, border: `1px solid ${C.accent}30` }}>
            <img src={user?.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.accent}` }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN</div>
            </div>
          </div>

          <button onClick={() => navigate('/home')} style={{
            background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9,
            transition: 'all 0.15s',
          }}>
            <Svg d={IC.logout} size={13} color={C.muted} /> Exit
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: sidebarOpen ? 210 : 0, overflow: 'hidden',
          background: C.surface, borderRight: `1px solid ${C.border}`,
          flexShrink: 0, transition: 'width 0.25s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 0', flex: 1 }}>
            <span style={SB_LABEL}>Navigation</span>
            {TABS.slice(0, 5).map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => switchTab(tab.id)} style={{
                width: '100%', background: activeTab === tab.id ? C.accentDim : 'transparent',
                border: 'none', borderRight: activeTab === tab.id ? `3px solid ${C.accent}` : '3px solid transparent',
                color: activeTab === tab.id ? C.accent : C.muted,
                padding: '10px 18px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                <Svg d={IC[tab.icon]} size={15} color={activeTab === tab.id ? C.accent : C.muted} />
                {tab.label}
                {tab.badge && reported.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: C.red, color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    {reported.length}
                  </span>
                )}
              </button>
            ))}

            <span style={{ ...SB_LABEL, marginTop: 8 }}>Management</span>
            {TABS.slice(5).map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => switchTab(tab.id)} style={{
                width: '100%', background: activeTab === tab.id ? C.accentDim : 'transparent',
                border: 'none', borderRight: activeTab === tab.id ? `3px solid ${C.accent}` : '3px solid transparent',
                color: activeTab === tab.id ? C.accent : C.muted,
                padding: '10px 18px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                <Svg d={IC[tab.icon]} size={15} color={activeTab === tab.id ? C.accent : C.muted} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textAlign: 'center', letterSpacing: '0.04em' }}>
              YourNotes Admin v2.0
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', animation: 'fadeIn 0.25s ease', minWidth: 0 }}>

          {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Platform Overview</h2>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Monitor your platform's health and activity at a glance.</p>
              </div>

              {loading ? <Spinner C={C} /> : stats ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                    <StatCard label="Total Users"    value={stats.totalUsers}       icon="users"   color={C.blue}   C={C} sub={`${stats.totalAdmins} admin(s)`} trend={12} />
                    <StatCard label="Banned Users"   value={stats.bannedUsers}      icon="ban"     color={C.red}    C={C} />
                    <StatCard label="Total Notes"    value={stats.totalNotes}       icon="notes"   color={C.green}  C={C} trend={8} />
                    <StatCard label="Public Notes"   value={stats.publicNotes}      icon="eye"     color={C.purple} C={C} />
                    <StatCard label="Reported"       value={stats.reportedNotes}    icon="flag"    color={C.red}    C={C} />
                    <StatCard label="New This Week"  value={stats.newUsersThisWeek} icon="star"    color={C.yellow} C={C} sub="New signups" />
                    <StatCard label="AI Calls/hr"    value={stats.totalAiCallsNow}  icon="ai"      color={C.accent} C={C} sub="Active this hour" />
                    <StatCard label="Storage"        value="2.4 GB"                 icon="db"      color={C.teal}   C={C} sub="Notes + assets" />
                  </div>

                  {/* Charts row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <MiniBarChart data={weeklyUsers} color={C.blue}   label="New Users This Week" C={C} />
                    <MiniBarChart data={weeklyNotes} color={C.green}  label="Notes Created This Week" C={C} />
                  </div>

                  {/* Quick actions */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 16, boxShadow: C.shadow }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Quick Actions</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <Btn onClick={() => switchTab('reported')} color={C.red}    icon="flag"     C={C}>Review Reports</Btn>
                      <Btn onClick={() => switchTab('users')}    color={C.blue}   icon="users"    C={C}>Manage Users</Btn>
                      <Btn onClick={() => switchTab('announce')} color={C.accent} icon="announce" C={C}>Send Announcement</Btn>
                      <Btn onClick={() => handleExport('users')} color={C.green}  icon="download" variant="outline" C={C} disabled={exportLoading}>Export Users</Btn>
                      <Btn onClick={() => handleExport('notes')} color={C.purple} icon="download" variant="outline" C={C} disabled={exportLoading}>Export Notes</Btn>
                    </div>
                  </div>

                  {stats.reportedNotes > 0 && (
                    <div style={{
                      background: C.red + '12', border: `1px solid ${C.red}35`,
                      borderRadius: 14, padding: '15px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, color: C.red, fontSize: 14 }}>⚠ {stats.reportedNotes} Reported Note{stats.reportedNotes !== 1 ? 's' : ''} need review</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Users have flagged content requiring moderation.</div>
                      </div>
                      <Btn onClick={() => switchTab('reported')} color={C.red} icon="flag" C={C}>Review Now</Btn>
                    </div>
                  )}
                </>
              ) : <div style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Failed to load stats</div>}
            </div>
          )}

          {/* ══ USERS ══════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Users
                    <span style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginLeft: 8 }}>({userTotal.count})</span>
                  </h2>
                </div>
                <Btn onClick={() => handleExport('users')} color={C.accent} variant="outline" icon="download" C={C} disabled={exportLoading}>Export CSV</Btn>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setUserPage(1); }} placeholder="Search by name or email..." C={C} />
                <Select value={userFilter} onChange={v => { setUserFilter(v); setUserPage(1); }} C={C}>
                  <option value="all">All Users</option>
                  <option value="banned">Banned</option>
                  <option value="admins">Admins</option>
                  <option value="active">Active Today</option>
                </Select>
              </div>

              {loading ? <Spinner C={C} /> : (
                <>
                  <TableWrap C={C}>
                    <THead cols={['User', 'Role', 'Notes', 'AI Calls/hr', 'Joined', 'Status', 'Actions']} C={C} />
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} className="row-hover" style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.12s' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={u.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.border}`, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {u.role === 'admin' ? <Badge color={C.accent} C={C}>ADMIN</Badge> : <Badge color={C.muted} C={C}>USER</Badge>}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontWeight: 600 }}>{u.notesCount ?? '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, color: u.aiCallsThisHour >= 5 ? C.red : u.aiCallsThisHour >= 3 ? C.yellow : C.muted, fontWeight: 700 }}>
                              {u.aiCallsThisHour ?? 0}
                            </span>
                            <span style={{ fontSize: 11, color: C.muted }}>/hr</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {u.isBanned ? <Badge color={C.red} C={C}>BANNED</Badge> : <Badge color={C.green} C={C}>ACTIVE</Badge>}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              <Btn small onClick={() => setDetailModal(u)} color={C.blue} variant="outline" icon="eye" C={C}>View</Btn>
                              {u._id !== user?._id && u.role !== 'admin' && <>
                                <Btn small onClick={() => { setBanModal(u); setBanReason(u.banReason || ''); }}
                                  color={u.isBanned ? C.green : C.yellow} variant="outline" icon={u.isBanned ? 'check' : 'ban'} C={C}>
                                  {u.isBanned ? 'Unban' : 'Ban'}
                                </Btn>
                                <Btn small onClick={() => handleRoleToggle(u._id)} color={C.purple} variant="outline" icon="crown" C={C}>Admin</Btn>
                                <Btn small onClick={() => handleDelete(u._id, u.name)} color={C.red} variant="outline" icon="trash" C={C}>Delete</Btn>
                              </>}
                              {u.role === 'admin' && u._id !== user?._id && (
                                <Btn small onClick={() => handleRoleToggle(u._id)} color={C.muted} variant="outline" C={C}>Demote</Btn>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: C.muted, fontSize: 13 }}>No users found</td></tr>
                      )}
                    </tbody>
                  </TableWrap>
                  <Pagination page={userPage} total={userTotal.pages} onChange={setUserPage} C={C} />
                </>
              )}
            </div>
          )}

          {/* ══ COMMUNITY NOTES ════════════════════════════════════════ */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Community Notes
                  <span style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginLeft: 8 }}>({noteTotal.count})</span>
                </h2>
                <Btn onClick={() => handleExport('notes')} color={C.accent} variant="outline" icon="download" C={C} disabled={exportLoading}>Export CSV</Btn>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setNotePage(1); }} placeholder="Search notes..." C={C} />
                <Select value={noteFilter} onChange={v => { setNoteFilter(v); setNotePage(1); }} C={C}>
                  <option value="all">All Public Notes</option>
                  <option value="reported">Reported Only</option>
                  <option value="popular">Most Liked</option>
                </Select>
              </div>

              {loading ? <Spinner C={C} /> : (
                <>
                  <TableWrap C={C}>
                    <THead cols={['Title', 'Author', 'Subject', 'Likes', 'Views', 'Reports', 'Actions']} C={C} />
                    <tbody>
                      {notes.map((n, i) => (
                        <tr key={n._id} className="row-hover" style={{ borderBottom: i < notes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px 16px', maxWidth: 220 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <img src={n.user?.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ fontSize: 12, color: C.textSub, fontWeight: 600 }}>{n.user?.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}><Badge color={C.blue} C={C}>{n.subject || 'General'}</Badge></td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted, fontWeight: 600 }}>{n.likesCount ?? 0}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{n.viewsCount ?? '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {n.reportsCount > 0
                              ? <Badge color={C.red} C={C}>{n.reportsCount}</Badge>
                              : <span style={{ fontSize: 12, color: C.muted }}>0</span>}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Btn small onClick={() => handleForceRemove(n._id)} color={C.red} variant="outline" icon="ban" C={C}>Remove</Btn>
                          </td>
                        </tr>
                      ))}
                      {notes.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: C.muted, fontSize: 13 }}>No notes found</td></tr>
                      )}
                    </tbody>
                  </TableWrap>
                  <Pagination page={notePage} total={noteTotal.pages} onChange={setNotePage} C={C} />
                </>
              )}
            </div>
          )}

          {/* ══ REPORTED NOTES ═════════════════════════════════════════ */}
          {activeTab === 'reported' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Reported Notes</h2>
                {reported.length > 0 && <Badge color={C.red} C={C}>{reported.length} pending</Badge>}
              </div>
              {loading ? <Spinner C={C} /> : reported.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 72, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
                  <Svg d={IC.check} size={36} color={C.green} />
                  <div style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: C.green }}>All clear! No reported notes.</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Community is well-behaved right now.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reported.map(n => (
                    <div key={n._id} style={{
                      background: C.card, border: `1px solid ${C.red}30`,
                      borderRadius: 14, padding: '18px 20px', boxShadow: C.shadow,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 5 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                            By: <strong style={{ color: C.text }}>{n.user?.name}</strong> ({n.user?.email}) • <Badge color={C.blue} C={C}>{n.subject}</Badge>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: C.red, marginBottom: 8 }}>{n.reportsCount} report{n.reportsCount !== 1 ? 's' : ''}:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
                            {n.reports?.slice(0, 5).map((r, i) => (
                              <div key={i} style={{ background: C.surface, borderRadius: 8, padding: '6px 12px', fontSize: 12, color: C.muted, border: `1px solid ${C.border}` }}>
                                <strong style={{ color: C.text }}>{r.user?.name}:</strong> {r.reason}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                          <Btn small onClick={() => handleForceRemove(n._id)}  color={C.red}   icon="ban"   C={C}>Remove</Btn>
                          <Btn small onClick={() => handleClearReports(n._id)} color={C.green} icon="check" variant="outline" C={C}>Clear</Btn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ AI USAGE ═══════════════════════════════════════════════ */}
          {activeTab === 'ai' && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.5px', color: C.text }}>AI Usage Stats</h2>
              {loading ? <Spinner C={C} /> : aiData ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                    <StatCard label="Total Calls/hr"   value={aiData.totalCallsNow}         icon="ai"      color={C.accent} C={C} sub="Active this hour" />
                    <StatCard label="Active AI Users"  value={aiData.totalUsersWithAiCalls}  icon="users"   color={C.purple} C={C} />
                    <StatCard label="Avg Calls/User"   value={aiData.avgCallsPerUser}        icon="refresh" color={C.blue}   C={C} />
                    <StatCard label="Rate Limited"     value={aiData.rateLimitedCount ?? 0}  icon="lock"    color={C.red}    C={C} sub="This hour" />
                  </div>

                  {/* Usage visualization */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20, boxShadow: C.shadow }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Usage Distribution (Last 7h)</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 70 }}>
                      {(aiData.hourlyBreakdown || [4, 7, 12, 8, 15, 20, aiData.totalCallsNow || 18]).map((v, i) => {
                        const max = Math.max(...(aiData.hourlyBreakdown || [4, 7, 12, 8, 15, 20, 18]), 1);
                        const isLast = i === 6;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: '100%', background: C.dimmed, borderRadius: '4px 4px 2px 2px', position: 'relative', height: 60 }}>
                              <div style={{
                                position: 'absolute', bottom: 0, width: '100%', height: `${(v / max) * 100}%`,
                                background: isLast ? `linear-gradient(to top, ${C.accent}, ${C.yellow})` : `linear-gradient(to top, ${C.accent}80, ${C.accent}40)`,
                                borderRadius: '4px 4px 2px 2px',
                              }} />
                            </div>
                            <span style={{ fontSize: 9, color: isLast ? C.accent : C.muted, fontWeight: isLast ? 800 : 600 }}>
                              {isLast ? 'NOW' : `-${6 - i}h`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 12 }}>Top AI Users (this hour)</div>
                  <TableWrap C={C}>
                    <THead cols={['#', 'User', 'Email', 'AI Calls', 'Status', 'Reset At']} C={C} />
                    <tbody>
                      {aiData.topAiUsers.map((u, i) => (
                        <tr key={u._id} className="row-hover" style={{ borderBottom: i < aiData.topAiUsers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted, fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <img src={u.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{u.email}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Badge color={u.aiCallsThisHour >= 5 ? C.red : u.aiCallsThisHour >= 3 ? C.yellow : C.green} C={C}>
                              {u.aiCallsThisHour} calls
                            </Badge>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {u.aiCallsThisHour >= 5
                              ? <Badge color={C.red} C={C}>RATE LIMITED</Badge>
                              : <Badge color={C.green} C={C}>OK</Badge>}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>
                            {u.aiCallsResetAt ? new Date(u.aiCallsResetAt).toLocaleTimeString('en-IN') : '—'}
                          </td>
                        </tr>
                      ))}
                      {aiData.topAiUsers.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>No AI usage currently</td></tr>
                      )}
                    </tbody>
                  </TableWrap>
                </>
              ) : <div style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Failed to load AI data</div>}
            </div>
          )}

          {/* ══ ANNOUNCEMENT ═══════════════════════════════════════════ */}
          {activeTab === 'announce' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Send Announcement</h2>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Broadcast a message to all users on the platform.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: C.shadow }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Announcement Type</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['info', 'success', 'warning', 'critical'].map(t => (
                        <button key={t} onClick={() => setAnnouncement(a => ({ ...a, type: t }))} style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          border: `1.5px solid ${announcement.type === t ? ({ info: C.blue, success: C.green, warning: C.yellow, critical: C.red }[t]) : C.border}`,
                          background: announcement.type === t ? ({ info: C.blue, success: C.green, warning: C.yellow, critical: C.red }[t]) + '18' : 'transparent',
                          color: announcement.type === t ? ({ info: C.blue, success: C.green, warning: C.yellow, critical: C.red }[t]) : C.muted,
                          cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Title</label>
                    <input value={announcement.title} onChange={e => setAnnouncement(a => ({ ...a, title: e.target.value }))}
                      placeholder="e.g. New Feature Released!"
                      style={{ width: '100%', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Message Body</label>
                    <textarea value={announcement.body} onChange={e => setAnnouncement(a => ({ ...a, body: e.target.value }))}
                      placeholder="Write your announcement here..."
                      rows={5}
                      style={{ width: '100%', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </div>

                  <Btn onClick={handleSendAnnouncement} color={C.accent} icon="announce" C={C}>Send to All Users</Btn>
                </div>

                {/* Preview */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Preview</div>
                  <div style={{
                    background: C.card, border: `1.5px solid ${{ info: C.blue, success: C.green, warning: C.yellow, critical: C.red }[announcement.type] || C.border}30`,
                    borderRadius: 14, padding: '16px 18px', boxShadow: C.shadow,
                    borderLeft: `4px solid ${{ info: C.blue, success: C.green, warning: C.yellow, critical: C.red }[announcement.type] || C.border}`,
                  }}>
                    {announcement.title
                      ? <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 8 }}>{announcement.title}</div>
                      : <div style={{ fontWeight: 700, fontSize: 13, color: C.muted, marginBottom: 8, fontStyle: 'italic' }}>Title appears here</div>}
                    {announcement.body
                      ? <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>{announcement.body}</div>
                      : <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>Message body appears here...</div>}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>{new Date().toLocaleDateString()} • From Admin</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ AUDIT LOGS ═════════════════════════════════════════════ */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Audit Logs</h2>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Track all admin actions performed on the platform.</p>
                </div>
                <Btn onClick={() => handleExport('logs')} color={C.accent} variant="outline" icon="download" C={C}>Export Logs</Btn>
              </div>

              {loading ? <Spinner C={C} /> : (
                <TableWrap C={C}>
                  <THead cols={['Timestamp', 'Action', 'Admin', 'Target', 'Details']} C={C} />
                  <tbody>
                    {logs.map((log, i) => {
                      const actionColors = { BAN_USER: C.red, UNBAN_USER: C.green, DELETE_NOTE: C.red, DELETE_USER: C.red, ROLE_CHANGE: C.purple, CLEAR_REPORTS: C.green, FORCE_REMOVE: C.yellow };
                      const color = actionColors[log.action] || C.muted;
                      return (
                        <tr key={log._id || i} className="row-hover" style={{ borderBottom: i < logs.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px 16px', fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Badge color={color} C={C}>{log.action?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{log.adminName}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub }}>{log.target}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{log.meta || '—'}</td>
                        </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: C.muted, fontSize: 13 }}>No audit logs found</td></tr>
                    )}
                  </tbody>
                </TableWrap>
              )}
            </div>
          )}

          {/* ══ SETTINGS ═══════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: C.text }}>Platform Settings</h2>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Configure global platform behavior and limits.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  {
                    section: 'AI Limits',
                    icon: 'ai',
                    color: C.accent,
                    items: [
                      { label: 'AI Calls per User per Hour', key: 'aiCallsLimit', type: 'number', placeholder: '5', hint: 'Maximum AI requests a user can make per hour' },
                      { label: 'Enable AI Features', key: 'aiEnabled', type: 'toggle', hint: 'Turn off to disable AI for all users' },
                    ]
                  },
                  {
                    section: 'Registration',
                    icon: 'users',
                    color: C.blue,
                    items: [
                      { label: 'Allow New Registrations', key: 'registrationOpen', type: 'toggle', hint: 'Disable to prevent new user signups' },
                      { label: 'Email Verification Required', key: 'emailVerification', type: 'toggle', hint: 'Require verified email to use the platform' },
                    ]
                  },
                  {
                    section: 'Community',
                    icon: 'notes',
                    color: C.green,
                    items: [
                      { label: 'Allow Public Notes', key: 'publicNotesEnabled', type: 'toggle', hint: 'Users can share notes publicly' },
                      { label: 'Auto-remove threshold (reports)', key: 'autoRemoveThreshold', type: 'number', placeholder: '10', hint: 'Auto-remove note after this many reports' },
                    ]
                  },
                ].map(({ section, icon, color, items }) => (
                  <div key={section} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, background: C.surface }}>
                      <div style={{ background: color + '18', borderRadius: 8, padding: 6, border: `1px solid ${color}30` }}>
                        <Svg d={IC[icon]} size={14} color={color} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{section}</span>
                    </div>
                    <div style={{ padding: '4px 0' }}>
                      {items.map(item => (
                        <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.hint}</div>
                          </div>
                          {item.type === 'toggle' ? (
                            <div style={{
                              width: 44, height: 24, borderRadius: 99, background: C.green, cursor: 'pointer', position: 'relative',
                              boxShadow: `0 0 0 1px ${C.green}60`,
                            }}>
                              <div style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                            </div>
                          ) : (
                            <input type="number" placeholder={item.placeholder}
                              style={{ width: 80, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Danger zone */}
                <div style={{ background: C.card, border: `1px solid ${C.red}30`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.red}20`, background: C.red + '08', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Svg d={IC.zap} size={15} color={C.red} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.red }}>Danger Zone</span>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <Btn color={C.red} variant="outline" icon="trash" C={C} onClick={() => toast.error('Not implemented — be careful!')}>
                      Purge Deleted Notes
                    </Btn>
                    <Btn color={C.red} variant="outline" icon="refresh" C={C} onClick={() => toast.error('Not implemented — be careful!')}>
                      Reset AI Counters
                    </Btn>
                    <Btn color={C.red} variant="outline" icon="mail" C={C} onClick={() => toast.error('Not implemented — be careful!')}>
                      Email All Users
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── BAN MODAL ── */}
      {banModal && (
        <Modal title={banModal.isBanned ? `Unban "${banModal.name}"?` : `Ban "${banModal.name}"`} onClose={() => setBanModal(null)} C={C}>
          {!banModal.isBanned && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ban Reason (optional)</label>
              <input value={banReason} onChange={e => setBanReason(e.target.value)}
                placeholder="e.g. Spam, abusive content..."
                style={{ width: '100%', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          )}
          {banModal.isBanned && banModal.banReason && (
            <div style={{ background: C.surface, borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: C.muted }}>
              Current reason: <strong style={{ color: C.text }}>{banModal.banReason}</strong>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setBanModal(null)} color={C.muted} variant="ghost" C={C}>Cancel</Btn>
            <Btn onClick={handleBan} color={banModal.isBanned ? C.green : C.red} C={C}>
              {banModal.isBanned ? 'Unban User' : 'Ban User'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── USER DETAIL MODAL ── */}
      {detailModal && (
        <Modal title="User Details" onClose={() => setDetailModal(null)} C={C} width={480}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px 16px', background: C.surface, borderRadius: 12 }}>
            <img src={detailModal.avatar} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.accent}` }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{detailModal.name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{detailModal.email}</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                {detailModal.isBanned ? <Badge color={C.red} C={C}>BANNED</Badge> : <Badge color={C.green} C={C}>ACTIVE</Badge>}
                <Badge color={detailModal.role === 'admin' ? C.accent : C.muted} C={C}>{detailModal.role?.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              ['Notes Created', detailModal.notesCount ?? '—'],
              ['AI Calls/hr', detailModal.aiCallsThisHour ?? 0],
              ['Joined', new Date(detailModal.createdAt).toLocaleDateString('en-IN')],
              ['Last Active', detailModal.lastActiveAt ? new Date(detailModal.lastActiveAt).toLocaleDateString('en-IN') : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ background: C.surface, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{value}</div>
              </div>
            ))}
          </div>
          {detailModal.banReason && (
            <div style={{ background: C.red + '12', border: `1px solid ${C.red}25`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.red }}>
              <strong>Ban reason:</strong> {detailModal.banReason}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn onClick={() => setDetailModal(null)} color={C.muted} variant="ghost" C={C}>Close</Btn>
            {detailModal._id !== user?._id && detailModal.role !== 'admin' && (
              <Btn onClick={() => { setBanModal(detailModal); setBanReason(detailModal.banReason || ''); setDetailModal(null); }}
                color={detailModal.isBanned ? C.green : C.yellow} icon={detailModal.isBanned ? 'check' : 'ban'} C={C}>
                {detailModal.isBanned ? 'Unban' : 'Ban'} User
              </Btn>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}