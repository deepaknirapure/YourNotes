import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Icons (inline SVG — no extra dependencies) ──────────────────────────────
const Icon = ({ d, size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  notes:   'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  flag:    'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
  ai:      'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z',
  ban:     'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
  trash:   'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  check:   'M20 6L9 17l-5-5',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  search:  'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  logout:  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  eye:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  crown:   'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z M5 20h14',
};

// ─── Color palette (matches YourNotes existing CSS vars style) ───────────────
const C = {
  bg:       '#0f0e0e',
  surface:  '#1a1918',
  card:     '#201f1e',
  border:   '#2e2c2a',
  accent:   '#f97316',   // orange
  purple:   '#a855f7',
  green:    '#10b981',
  red:      '#ef4444',
  yellow:   '#f59e0b',
  blue:     '#3b82f6',
  text:     '#f0efef',
  muted:    '#8a8680',
  dimmed:   '#3a3836',
};

// ─── Tiny reusable components ────────────────────────────────────────────────

function StatCard({ label, value, icon, color = C.accent, sub }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 8,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ color, opacity: 0.8 }}><Icon d={icon} size={18} color={color} /></div>
      </div>
      <span style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-1px', lineHeight: 1 }}>{value ?? '—'}</span>
      {sub && <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>}
    </div>
  );
}

function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    }}>{children}</span>
  );
}

function Btn({ children, onClick, color = C.accent, variant = 'solid', disabled, small, icon }) {
  const isSolid = variant === 'solid';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isSolid ? color : 'transparent',
        color: isSolid ? '#fff' : color,
        border: `1.5px solid ${color}`,
        borderRadius: 8,
        padding: small ? '5px 12px' : '8px 18px',
        fontSize: small ? 12 : 13,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon d={ICONS[icon]} size={13} color={isSolid ? '#fff' : color} />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${C.border}`,
        borderTopColor: C.accent, borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }}>
        <Icon d={ICONS.search} size={15} />
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '9px 14px 9px 36px', color: C.text,
          fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
    }} onClick={onClose}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 28, minWidth: 340, maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 18 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',      icon: 'shield' },
  { id: 'users',     label: 'Users',         icon: 'users'  },
  { id: 'notes',     label: 'Community',     icon: 'notes'  },
  { id: 'reported',  label: 'Reported',      icon: 'flag'   },
  { id: 'ai',        label: 'AI Usage',      icon: 'ai'     },
];

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate         = useNavigate();

  const [activeTab,  setActiveTab]  = useState('overview');
  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [notes,      setNotes]      = useState([]);
  const [reported,   setReported]   = useState([]);
  const [aiData,     setAiData]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [noteFilter, setNoteFilter] = useState('all');
  const [userPage,   setUserPage]   = useState(1);
  const [notePage,   setNotePage]   = useState(1);
  const [userTotal,  setUserTotal]  = useState({ pages: 1, count: 0 });
  const [noteTotal,  setNoteTotal]  = useState({ pages: 1, count: 0 });
  const [banModal,   setBanModal]   = useState(null);
  const [banReason,  setBanReason]  = useState('');

  // Guard: sirf admin access kar sake
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/home'); toast.error('Admin access required'); }
  }, [user, navigate]);

  // ── Fetch Stats ──
  useEffect(() => {
    if (activeTab === 'overview') {
      setLoading(true);
      axios.get('/admin/stats')
        .then(r => setStats(r.data))
        .catch(() => toast.error('Stats load nahi hue'))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // ── Fetch Users ──
  useEffect(() => {
    if (activeTab !== 'users') return;
    setLoading(true);
    axios.get('/admin/users', { params: { page: userPage, search, filter: userFilter } })
      .then(r => { setUsers(r.data.users); setUserTotal({ pages: r.data.totalPages, count: r.data.total }); })
      .catch(() => toast.error('Users load nahi hue'))
      .finally(() => setLoading(false));
  }, [activeTab, userPage, search, userFilter]);

  // ── Fetch Notes ──
  useEffect(() => {
    if (activeTab !== 'notes') return;
    setLoading(true);
    axios.get('/admin/notes', { params: { page: notePage, search, filter: noteFilter } })
      .then(r => { setNotes(r.data.notes); setNoteTotal({ pages: r.data.totalPages, count: r.data.total }); })
      .catch(() => toast.error('Notes load nahi hue'))
      .finally(() => setLoading(false));
  }, [activeTab, notePage, search, noteFilter]);

  // ── Fetch Reported ──
  useEffect(() => {
    if (activeTab !== 'reported') return;
    setLoading(true);
    axios.get('/admin/notes/reported')
      .then(r => setReported(r.data.notes))
      .catch(() => toast.error('Reported notes load nahi hue'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // ── Fetch AI Usage ──
  useEffect(() => {
    if (activeTab !== 'ai') return;
    setLoading(true);
    axios.get('/admin/ai-usage')
      .then(r => setAiData(r.data))
      .catch(() => toast.error('AI stats load nahi hue'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // ── Actions ──
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
    if (!window.confirm(`"${name}" ko permanently delete karna chahte ho? Unke saare notes bhi delete honge.`)) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      toast.success('User delete ho gaya');
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
    if (!window.confirm('Is note ko community se remove karna chahte ho?')) return;
    try {
      await axios.patch(`/admin/notes/${noteId}/force-remove`);
      toast.success('Note remove ho gayi');
      setNotes(prev => prev.filter(n => n._id !== noteId));
      setReported(prev => prev.filter(n => n._id !== noteId));
    } catch { toast.error('Action failed'); }
  };

  const handleClearReports = async (noteId) => {
    try {
      await axios.patch(`/admin/notes/${noteId}/clear-reports`);
      toast.success('Reports clear ho gaye');
      setReported(prev => prev.filter(n => n._id !== noteId));
    } catch { toast.error('Action failed'); }
  };

  const switchTab = (id) => { setActiveTab(id); setSearch(''); };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${C.muted}; }
        input { color-scheme: dark; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.dimmed}; border-radius: 4px; }
        button:hover:not(:disabled) { opacity: 0.88; }
        select { color-scheme: dark; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon d={ICONS.shield} size={22} color={C.accent} />
          <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>
            YourNotes <span style={{ color: C.accent }}>Admin</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={user?.avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.accent, fontWeight: 600 }}>ADMIN</div>
            </div>
          </div>
          <button onClick={() => navigate('/home')} style={{
            background: 'transparent', border: 'none', color: C.muted,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Icon d={ICONS.logout} size={14} /> Back to App
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 200, background: C.surface, borderRight: `1px solid ${C.border}`,
          padding: '16px 0', flexShrink: 0,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                width: '100%', background: activeTab === tab.id ? C.accent + '18' : 'transparent',
                border: 'none', borderRight: activeTab === tab.id ? `3px solid ${C.accent}` : '3px solid transparent',
                color: activeTab === tab.id ? C.accent : C.muted,
                padding: '11px 20px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <Icon d={ICONS[tab.icon]} size={15} color={activeTab === tab.id ? C.accent : C.muted} />
              {tab.label}
              {tab.id === 'reported' && reported.length > 0 && (
                <span style={{
                  marginLeft: 'auto', background: C.red, color: '#fff',
                  borderRadius: '50%', width: 18, height: 18, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                }}>{reported.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

          {/* ═══════════════ OVERVIEW ═══════════════ */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 24, letterSpacing: '-0.5px' }}>
                Platform Overview
              </h2>
              {loading ? <Spinner /> : stats ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                    <StatCard label="Total Users"    value={stats.totalUsers}       icon={ICONS.users}  color={C.blue} />
                    <StatCard label="Banned Users"   value={stats.bannedUsers}      icon={ICONS.ban}    color={C.red} sub={`${stats.totalAdmins} admin(s)`} />
                    <StatCard label="Total Notes"    value={stats.totalNotes}       icon={ICONS.notes}  color={C.green} />
                    <StatCard label="Public Notes"   value={stats.publicNotes}      icon={ICONS.eye}    color={C.purple} />
                    <StatCard label="Reported Notes" value={stats.reportedNotes}    icon={ICONS.flag}   color={C.red} />
                    <StatCard label="New This Week"  value={stats.newUsersThisWeek} icon={ICONS.star}   color={C.yellow} sub="New users" />
                    <StatCard label="AI Calls Now"   value={stats.totalAiCallsNow}  icon={ICONS.ai}     color={C.accent} sub="Active this hour" />
                  </div>

                  {stats.reportedNotes > 0 && (
                    <div style={{
                      background: C.red + '18', border: `1px solid ${C.red}44`,
                      borderRadius: 14, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, color: C.red, fontSize: 14 }}>⚠ {stats.reportedNotes} Reported Note{stats.reportedNotes > 1 ? 's' : ''} pending review</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Users ne kuch notes report kiye hain, inhe review karo</div>
                      </div>
                      <Btn onClick={() => switchTab('reported')} color={C.red} icon="flag">Review Now</Btn>
                    </div>
                  )}
                </div>
              ) : <div style={{ color: C.muted }}>Stats load nahi hue</div>}
            </div>
          )}

          {/* ═══════════════ USERS ═══════════════ */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  Users <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>({userTotal.count})</span>
                </h2>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setUserPage(1); }} placeholder="Search by name or email..." />
                <select
                  value={userFilter}
                  onChange={e => { setUserFilter(e.target.value); setUserPage(1); }}
                  style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '8px 14px', color: C.text,
                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="banned">Banned</option>
                  <option value="admins">Admins</option>
                </select>
              </div>

              {loading ? <Spinner /> : (
                <>
                  {/* Table */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                          {['User', 'Role', 'AI Calls', 'Joined', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{u.name}</div>
                                  <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {u.role === 'admin'
                                ? <Badge color={C.accent}>ADMIN</Badge>
                                : <Badge color={C.muted}>USER</Badge>}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: u.aiCallsThisHour > 3 ? C.yellow : C.muted }}>
                              {u.aiCallsThisHour} / hr
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>
                              {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {u.isBanned
                                ? <Badge color={C.red}>BANNED</Badge>
                                : <Badge color={C.green}>ACTIVE</Badge>}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {u._id !== user?._id && u.role !== 'admin' && (
                                  <Btn small onClick={() => { setBanModal(u); setBanReason(u.banReason || ''); }}
                                    color={u.isBanned ? C.green : C.yellow} variant="outline" icon={u.isBanned ? 'check' : 'ban'}>
                                    {u.isBanned ? 'Unban' : 'Ban'}
                                  </Btn>
                                )}
                                {u._id !== user?._id && u.role !== 'admin' && (
                                  <Btn small onClick={() => handleRoleToggle(u._id)} color={C.purple} variant="outline" icon="crown">
                                    Make Admin
                                  </Btn>
                                )}
                                {u.role === 'admin' && u._id !== user?._id && (
                                  <Btn small onClick={() => handleRoleToggle(u._id)} color={C.muted} variant="outline">
                                    Remove Admin
                                  </Btn>
                                )}
                                {u._id !== user?._id && u.role !== 'admin' && (
                                  <Btn small onClick={() => handleDelete(u._id, u.name)} color={C.red} variant="outline" icon="trash">
                                    Delete
                                  </Btn>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>Koi user nahi mila</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {userTotal.pages > 1 && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                      <Btn small disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} color={C.muted} variant="outline">← Prev</Btn>
                      <span style={{ color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                        Page {userPage} / {userTotal.pages}
                      </span>
                      <Btn small disabled={userPage === userTotal.pages} onClick={() => setUserPage(p => p + 1)} color={C.muted} variant="outline">Next →</Btn>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════════════ COMMUNITY NOTES ═══════════════ */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  Community Notes <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>({noteTotal.count})</span>
                </h2>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setNotePage(1); }} placeholder="Search notes..." />
                <select
                  value={noteFilter}
                  onChange={e => { setNoteFilter(e.target.value); setNotePage(1); }}
                  style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '8px 14px', color: C.text,
                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                  }}
                >
                  <option value="all">All Public Notes</option>
                  <option value="reported">Reported Only</option>
                </select>
              </div>

              {loading ? <Spinner /> : (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                        {['Note', 'By', 'Subject', 'Likes', 'Reports', 'Action'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map((n, i) => (
                        <tr key={n._id} style={{ borderBottom: i < notes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px 16px', maxWidth: 240 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{n.user?.name}</td>
                          <td style={{ padding: '12px 16px' }}><Badge color={C.blue}>{n.subject || 'General'}</Badge></td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{n.likesCount}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {n.reportsCount > 0
                              ? <Badge color={C.red}>{n.reportsCount} reports</Badge>
                              : <span style={{ fontSize: 12, color: C.muted }}>0</span>}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Btn small onClick={() => handleForceRemove(n._id)} color={C.red} variant="outline" icon="ban">Remove</Btn>
                          </td>
                        </tr>
                      ))}
                      {notes.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>Koi note nahi mila</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {noteTotal.pages > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                  <Btn small disabled={notePage === 1} onClick={() => setNotePage(p => p - 1)} color={C.muted} variant="outline">← Prev</Btn>
                  <span style={{ color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', padding: '0 8px' }}>Page {notePage} / {noteTotal.pages}</span>
                  <Btn small disabled={notePage === noteTotal.pages} onClick={() => setNotePage(p => p + 1)} color={C.muted} variant="outline">Next →</Btn>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ REPORTED NOTES ═══════════════ */}
          {activeTab === 'reported' && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.5px' }}>
                Reported Notes
                {reported.length > 0 && <Badge color={C.red} style={{ marginLeft: 10 }}>{reported.length}</Badge>}
              </h2>
              {loading ? <Spinner /> : reported.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
                  <Icon d={ICONS.check} size={32} color={C.green} />
                  <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: C.green }}>Sab clear hai! Koi reported note nahi.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {reported.map(n => (
                    <div key={n._id} style={{
                      background: C.card, border: `1px solid ${C.red}44`,
                      borderRadius: 14, padding: '18px 20px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 6 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                            By: <strong style={{ color: C.text }}>{n.user?.name}</strong> ({n.user?.email}) • {n.subject}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: C.red, marginBottom: 8 }}>
                            {n.reportsCount} report{n.reportsCount > 1 ? 's' : ''}:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {n.reports?.slice(0, 5).map((r, i) => (
                              <div key={i} style={{
                                background: C.surface, borderRadius: 8, padding: '6px 12px',
                                fontSize: 12, color: C.muted,
                              }}>
                                <strong style={{ color: C.text }}>{r.user?.name}: </strong>{r.reason}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Btn small onClick={() => handleForceRemove(n._id)} color={C.red} icon="ban">Remove Note</Btn>
                          <Btn small onClick={() => handleClearReports(n._id)} color={C.green} variant="outline" icon="check">Clear Reports</Btn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ AI USAGE ═══════════════ */}
          {activeTab === 'ai' && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.5px' }}>AI Usage Stats</h2>
              {loading ? <Spinner /> : aiData ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                    <StatCard label="Total Calls Now"   value={aiData.totalCallsNow}        icon={ICONS.ai}      color={C.accent} sub="Active this hour" />
                    <StatCard label="Active AI Users"   value={aiData.totalUsersWithAiCalls} icon={ICONS.users}   color={C.purple} />
                    <StatCard label="Avg Calls/User"    value={aiData.avgCallsPerUser}       icon={ICONS.refresh} color={C.blue} />
                  </div>

                  <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 14 }}>Top AI Users (this hour)</div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                          {['#', 'User', 'Email', 'AI Calls This Hour', 'Reset At'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {aiData.topAiUsers.map((u, i) => (
                          <tr key={u._id} style={{ borderBottom: i < aiData.topAiUsers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{i + 1}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{u.name}</td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{u.email}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <Badge color={u.aiCallsThisHour >= 5 ? C.red : u.aiCallsThisHour >= 3 ? C.yellow : C.green}>
                                {u.aiCallsThisHour} calls
                              </Badge>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>
                              {u.aiCallsResetAt ? new Date(u.aiCallsResetAt).toLocaleTimeString('en-IN') : '—'}
                            </td>
                          </tr>
                        ))}
                        {aiData.topAiUsers.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>Abhi koi AI usage nahi</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : <div style={{ color: C.muted }}>Data load nahi hua</div>}
            </div>
          )}

        </div>
      </div>

      {/* ── BAN MODAL ── */}
      {banModal && (
        <Modal title={banModal.isBanned ? `Unban "${banModal.name}"?` : `Ban "${banModal.name}"?`} onClose={() => setBanModal(null)}>
          {!banModal.isBanned && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: 'block', marginBottom: 6 }}>BAN REASON (optional)</label>
              <input
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="e.g. Spam content, abusive behavior..."
                style={{
                  width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '10px 14px', color: C.text,
                  fontSize: 13, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setBanModal(null)} color={C.muted} variant="outline">Cancel</Btn>
            <Btn onClick={handleBan} color={banModal.isBanned ? C.green : C.red}>
              {banModal.isBanned ? 'Unban User' : 'Ban User'}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
