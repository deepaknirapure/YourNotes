
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

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

export default function AdminPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/home', { replace: true });
  }, [user, navigate]);

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

  // Users state
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

  // Notes state
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

  // Reported notes
  const [reported, setReported] = useState([]);
  const [reportedLoading, setReportedLoading] = useState(false);

  const loadReported = useCallback(async () => {
    setReportedLoading(true);
    try { const { data } = await API.get('/admin/notes/reported'); setReported(data.notes); }
    catch { toast.error('Reported notes load nahi hue'); }
    finally { setReportedLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'reported') loadReported(); }, [tab, loadReported]);

  // AI stats
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

  // ── Design tokens (match project's global.css) ───────────────────────────
  const c = {
    bg:       isDark ? '#111113' : '#f7f6f3',
    bgAlt:    isDark ? '#18181b' : '#efede8',
    surface:  isDark ? '#1c1c1f' : '#ffffff',
    surface2: isDark ? '#212124' : '#faf9f7',
    border:   isDark ? '#2e2e33' : '#e9e6e0',
    border2:  isDark ? '#3d3d44' : '#d8d4cc',
    text:     isDark ? '#f2f1f5' : '#18181a',
    text2:    isDark ? '#b8b6c0' : '#4a4a54',
    text3:    isDark ? '#7a7884' : '#8a8794',
    text4:    isDark ? '#4a4856' : '#b8b5be',
    accent:   '#f97316',
    accentL:  isDark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.10)',
    red:      isDark ? '#f87171' : '#dc2626',
    redL:     isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.10)',
    green:    isDark ? '#22c55e' : '#16a34a',
    greenL:   isDark ? 'rgba(34,197,94,0.12)' : 'rgba(22,163,74,0.10)',
    purple:   isDark ? '#a78bfa' : '#7c3aed',
    purpleL:  isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.10)',
    blue:     isDark ? '#60a5fa' : '#2563eb',
    blueL:    isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.10)',
    yellow:   isDark ? '#fbbf24' : '#d97706',
    yellowL:  isDark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.10)',
  };

  // ── Reusable micro-components ────────────────────────────────────────────
  const Badge = ({ label, color, bg }) => (
    <span style={{ background: bg, color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );

  const ActionBtn = ({ label, onClick, color, disabled, icon }) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: color + (isDark ? '22' : '18'),
      color, border: `1px solid ${color}44`,
      borderRadius: 7, padding: '5px 11px',
      fontSize: 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 5,
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = color + '33'; e.currentTarget.style.borderColor = color + '88'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = color + (isDark ? '22' : '18'); e.currentTarget.style.borderColor = color + '44'; } }}
    >
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}{label}
    </button>
  );

  const Spinner = () => (
    <div style={{ textAlign: 'center', padding: '60px 0', color: c.text3 }}>
      <div style={{
        width: 28, height: 28, border: `2px solid ${c.border2}`, borderTopColor: c.accent,
        borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13 }}>Loading…</span>
    </div>
  );

  const EmptyState = ({ icon, title, sub }) => (
    <div style={{ textAlign: 'center', padding: '60px 0', color: c.text3 }}>
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: c.text2, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
    </div>
  );

  const Pagination = ({ page, pages, onChange }) => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, alignItems: 'center' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} style={{
        background: 'none', border: `1px solid ${c.border}`, borderRadius: 8,
        padding: '6px 14px', fontSize: 13, color: c.text2,
        cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1,
      }}>← Prev</button>
      <span style={{ fontSize: 12, color: c.text3, padding: '0 4px' }}>Page {page} of {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} style={{
        background: 'none', border: `1px solid ${c.border}`, borderRadius: 8,
        padding: '6px 14px', fontSize: 13, color: c.text2,
        cursor: page >= pages ? 'not-allowed' : 'pointer', opacity: page >= pages ? 0.4 : 1,
      }}>Next →</button>
    </div>
  );

  const inputStyle = {
    background: c.bgAlt, border: `1px solid ${c.border}`,
    borderRadius: 9, padding: '9px 13px', fontSize: 13,
    color: c.text, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
  };

  const filterBtn = (key, label, active, setActive) => (
    <button key={key} onClick={() => setActive(key)} style={{
      background: active === key ? c.accent : 'none',
      color: active === key ? '#fff' : c.text3,
      border: `1px solid ${active === key ? c.accent : c.border}`,
      borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.15s',
    }}>{label}</button>
  );

  const StatCard = ({ label, value, icon, valueColor, trend }) => (
    <div style={{
      background: c.surface, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: (valueColor || c.accent) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: valueColor || c.text, letterSpacing: '-1px', lineHeight: 1 }}>{fmt(value)}</div>
      {trend && <div style={{ fontSize: 11, color: c.text3, marginTop: 4 }}>{trend}</div>}
    </div>
  );

  // ── Avatar cell ──────────────────────────────────────────────────────────
  const AvatarCell = ({ name, email, avatar }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: c.accentL, border: `1.5px solid ${c.accent}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 12, color: c.accent, overflow: 'hidden',
      }}>
        {avatar ? <img src={avatar} alt="" style={{ width: 36, height: 36, objectFit: 'cover' }} /> : initials(name)}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: c.text }}>{name}</div>
        <div style={{ fontSize: 11, color: c.text3, marginTop: 1 }}>{email}</div>
      </div>
    </div>
  );

  // ── Table styles ──────────────────────────────────────────────────────────
  const th = { textAlign: 'left', fontSize: 11, fontWeight: 700, color: c.text3, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: `1px solid ${c.border}`, background: c.bgAlt };
  const td = { padding: '13px 16px', fontSize: 13, color: c.text2, borderBottom: `1px solid ${c.border}`, verticalAlign: 'middle' };

  // ── Card wrapper ──────────────────────────────────────────────────────────
  const Card = ({ children, style = {} }) => (
    <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );

  const tabs = [
    { key: 'overview', label: 'Overview',  icon: '📊' },
    { key: 'users',    label: 'Users',     icon: '👥', count: stats?.totalUsers },
    { key: 'notes',    label: 'Notes',     icon: '📝', count: stats?.publicNotes },
    { key: 'reported', label: 'Reported',  icon: '🚨', count: stats?.reportedNotes, alert: stats?.reportedNotes > 0 },
    { key: 'ai',       label: 'AI Usage',  icon: '🤖' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: c.bg, fontFamily: "'DM Sans', sans-serif", color: c.text }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: c.surface + 'f0', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.border}`,
        padding: '0 28px', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #f97316 60%, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: c.text, lineHeight: 1.2 }}>Admin Panel</div>
            <div style={{ fontSize: 11, color: c.text3 }}>YourNotes — Control Center</div>
          </div>
          <span style={{
            background: c.accentL, color: c.accent,
            borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 800,
            border: `1px solid ${c.accent}30`, marginLeft: 4,
          }}>ADMIN</span>
        </div>

        {/* Right: theme toggle + back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: c.text3, marginRight: 4 }}>{user?.email}</div>
          <button onClick={toggleTheme} title="Toggle theme" style={{
            width: 36, height: 36, borderRadius: 9,
            background: c.bgAlt, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, transition: 'background 0.15s',
          }}>{isDark ? '☀️' : '🌙'}</button>
          <button onClick={() => navigate('/home')} style={{
            background: 'none', border: `1px solid ${c.border}`,
            borderRadius: 9, padding: '7px 14px',
            fontSize: 13, fontWeight: 600, color: c.text2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
          }}>← Back</button>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div style={{
        background: c.surface, borderBottom: `1px solid ${c.border}`,
        padding: '0 28px', display: 'flex', gap: 2,
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '14px 16px', fontSize: 13, fontWeight: 700,
            color: tab === t.key ? c.accent : c.text3,
            borderBottom: tab === t.key ? `2px solid ${c.accent}` : '2px solid transparent',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
            position: 'relative',
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: t.alert ? c.red : c.accentL,
                color: t.alert ? '#fff' : c.accent,
                borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 800,
              }}>{fmt(t.count)}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* ════════ OVERVIEW ════════ */}
        {tab === 'overview' && (
          statsLoading ? <Spinner /> : stats ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
                <StatCard label="Total Users"    value={stats.totalUsers}       icon="👥" trend={`+${fmt(stats.newUsersThisWeek)} this week`} />
                <StatCard label="Banned Users"   value={stats.bannedUsers}      icon="🚫" valueColor={c.red} />
                <StatCard label="Admin Accounts" value={stats.totalAdmins}      icon="🛡️" valueColor={c.purple} />
                <StatCard label="New This Week"  value={stats.newUsersThisWeek} icon="📈" valueColor={c.green} />
                <StatCard label="Total Notes"    value={stats.totalNotes}       icon="📝" />
                <StatCard label="Public Notes"   value={stats.publicNotes}      icon="🌐" valueColor={c.blue} />
                <StatCard label="Reported Notes" value={stats.reportedNotes}    icon="🚨" valueColor={stats.reportedNotes > 0 ? c.red : c.text3} />
                <StatCard label="AI Calls (Now)" value={stats.totalAiCallsNow}  icon="🤖" valueColor={c.purple} />
              </div>

              {/* Quick action cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {[
                  { icon: '👥', label: 'Manage Users', sub: `${fmt(stats.totalUsers)} total users`, key: 'users', color: c.accent },
                  { icon: '📝', label: 'Manage Notes', sub: `${fmt(stats.publicNotes)} public notes`, key: 'notes', color: c.blue },
                  { icon: '🚨', label: 'Reported Notes', sub: `${fmt(stats.reportedNotes)} need review`, key: 'reported', color: c.red },
                  { icon: '🤖', label: 'AI Usage', sub: 'Monitor usage patterns', key: 'ai', color: c.purple },
                ].map(item => (
                  <button key={item.key} onClick={() => setTab(item.key)} style={{
                    background: c.surface, border: `1px solid ${c.border}`,
                    borderRadius: 14, padding: '18px 20px',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '60'; e.currentTarget.style.background = item.color + '08'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = c.surface; }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: c.text, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: c.text3 }}>{item.sub}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: c.text4, fontSize: 18 }}>→</span>
                  </button>
                ))}
              </div>

              {/* refresh */}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <ActionBtn label="Refresh Stats" onClick={loadStats} color={c.green} icon="🔄" />
              </div>
            </div>
          ) : <EmptyState icon="📊" title="Stats load nahi hue" sub="Refresh karke try karo" />
        )}

        {/* ════════ USERS ════════ */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 18, color: c.text, margin: 0 }}>User Management</h2>
                <div style={{ fontSize: 13, color: c.text3, marginTop: 3 }}>{fmt(userTotal)} total users</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, width: 220 }}
                  placeholder="Search name or email…"
                  value={userSearch}
                  onFocus={e => e.target.style.borderColor = c.accent}
                  onBlur={e => e.target.style.borderColor = c.border}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                />
                {[['all', 'All'], ['banned', 'Banned'], ['admins', 'Admins']].map(([k, l]) =>
                  filterBtn(k, l, userFilter, (v) => { setUserFilter(v); setUserPage(1); })
                )}
              </div>
            </div>

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
                      <tr><td colSpan={5}><EmptyState icon="👥" title="No users found" sub="Try a different search or filter" /></td></tr>
                    ) : users.map(u => (
                      <tr key={u._id}
                        onMouseEnter={e => e.currentTarget.style.background = c.bgAlt + '88'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={td}><AvatarCell name={u.name} email={u.email} avatar={u.avatar} /></td>
                        <td style={td}>
                          <Badge
                            label={u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                            color={u.role === 'admin' ? c.purple : c.text3}
                            bg={u.role === 'admin' ? c.purpleL : c.bgAlt}
                          />
                        </td>
                        <td style={td}>
                          {u.isBanned
                            ? <div>
                                <Badge label="🚫 Banned" color={c.red} bg={c.redL} />
                                {u.banReason && <div style={{ fontSize: 11, color: c.text3, marginTop: 4, maxWidth: 160 }}>{u.banReason}</div>}
                              </div>
                            : <Badge label="✅ Active" color={c.green} bg={c.greenL} />}
                        </td>
                        <td style={{ ...td, fontSize: 12, color: c.text3 }}>{ago(u.createdAt)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {u.isBanned
                              ? <ActionBtn label="Unban" onClick={() => handleUnban(u._id)} color={c.green} icon="✅" />
                              : <ActionBtn label="Ban" onClick={() => setBanModal({ userId: u._id, name: u.name })} color={c.red} icon="🚫" />}
                            <ActionBtn
                              label={u.role === 'admin' ? 'Demote' : 'Promote'}
                              onClick={() => handleRoleToggle(u._id, u.role, u.name)}
                              color={c.purple} icon="🛡️"
                            />
                            <ActionBtn label="Delete" onClick={() => handleDelete(u._id, u.name)} color={c.red} icon="🗑️" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            <Pagination page={userPage} pages={userPages} onChange={setUserPage} />
          </div>
        )}

        {/* ════════ NOTES ════════ */}
        {tab === 'notes' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 18, color: c.text, margin: 0 }}>Community Notes</h2>
                <div style={{ fontSize: 13, color: c.text3, marginTop: 3 }}>{fmt(noteTotal)} notes</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, width: 220 }}
                  placeholder="Search title or content…"
                  value={noteSearch}
                  onFocus={e => e.target.style.borderColor = c.accent}
                  onBlur={e => e.target.style.borderColor = c.border}
                  onChange={e => { setNoteSearch(e.target.value); setNotePage(1); }}
                />
                {[['all', 'All'], ['reported', 'Reported'], ['removed', 'Removed']].map(([k, l]) =>
                  filterBtn(k, l, noteFilter, (v) => { setNoteFilter(v); setNotePage(1); })
                )}
              </div>
            </div>

            {notesLoading ? <Spinner /> : (
              <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: '35%' }}>Note</th>
                      <th style={{ ...th, width: '20%' }}>Author</th>
                      <th style={{ ...th, width: '15%' }}>Stats</th>
                      <th style={{ ...th, width: '12%' }}>Status</th>
                      <th style={{ ...th, width: '18%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon="📝" title="No notes found" sub="Try a different filter" /></td></tr>
                    ) : notes.map(n => (
                      <tr key={n._id}
                        onMouseEnter={e => e.currentTarget.style.background = c.bgAlt + '88'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={td}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={n.title}>
                            {n.title || 'Untitled'}
                          </div>
                          {n.subject && <div style={{ fontSize: 11, color: c.accent, marginTop: 2 }}>{n.subject}</div>}
                          <div style={{ fontSize: 11, color: c.text4, marginTop: 2 }}>{ago(n.createdAt)}</div>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: c.text }}>{n.user?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: c.text3, overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.user?.email || ''}</div>
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                            <span>❤️ <b>{fmt(n.likesCount)}</b></span>
                            <span>📥 <b>{fmt(n.downloads)}</b></span>
                            {n.reportsCount > 0 && <span style={{ color: c.red, fontWeight: 700 }}>🚨 {fmt(n.reportsCount)}</span>}
                          </div>
                        </td>
                        <td style={td}>
                          {n.isRemovedByAdmin
                            ? <Badge label="Removed" color={c.red} bg={c.redL} />
                            : n.reportsCount > 0
                              ? <Badge label="Reported" color={c.yellow} bg={c.yellowL} />
                              : <Badge label="Live" color={c.green} bg={c.greenL} />}
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {n.isRemovedByAdmin
                              ? <ActionBtn label="Restore" onClick={() => handleRestore(n._id)} color={c.green} icon="♻️" />
                              : <ActionBtn label="Remove" onClick={() => handleForceRemove(n._id)} color={c.red} icon="🗑️" />}
                            {n.reportsCount > 0 && <ActionBtn label="Clear" onClick={() => handleClearReports(n._id)} color={c.blue} icon="✓" />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            <Pagination page={notePage} pages={notePages} onChange={setNotePage} />
          </div>
        )}

        {/* ════════ REPORTED ════════ */}
        {tab === 'reported' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: c.text, margin: '0 0 4px' }}>Reported Notes</h2>
              <div style={{ fontSize: 13, color: c.text3 }}>{fmt(reported.length)} notes need review</div>
            </div>

            {reportedLoading ? <Spinner /> : reported.length === 0 ? (
              <Card style={{ padding: 60 }}>
                <EmptyState icon="✅" title="No reported notes!" sub="Community sab theek hai — koi issue nahi." />
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reported.map(n => (
                  <div key={n._id} style={{
                    background: c.surface, borderRadius: 14,
                    border: `1px solid ${c.border}`,
                    borderLeft: `3px solid ${c.red}`,
                    padding: '20px 22px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: c.text }}>{n.title || 'Untitled'}</span>
                          <Badge label={`${fmt(n.reportsCount)} reports`} color={c.red} bg={c.redL} />
                        </div>
                        <div style={{ fontSize: 12, color: c.text3, marginBottom: 10 }}>
                          By <strong style={{ color: c.text2 }}>{n.user?.name}</strong> · {ago(n.createdAt)} · ❤️ {fmt(n.likesCount)} · 📥 {fmt(n.downloads)}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {n.reports?.slice(0, 4).map((r, i) => (
                            <span key={i} style={{
                              background: c.redL, color: c.red,
                              borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                            }}>
                              {r.reason || 'No reason specified'}
                              {r.user?.name && <span style={{ opacity: 0.6, marginLeft: 4 }}>— {r.user.name}</span>}
                            </span>
                          ))}
                          {n.reports?.length > 4 && (
                            <span style={{ fontSize: 11, color: c.text3, padding: '3px 6px' }}>+{n.reports.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
                      <ActionBtn label="Force Remove" onClick={() => handleForceRemove(n._id)} color={c.red} icon="🗑️" />
                      <ActionBtn label="Dismiss Reports" onClick={() => handleClearReports(n._id)} color={c.blue} icon="✓" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ AI USAGE ════════ */}
        {tab === 'ai' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: c.text, margin: '0 0 4px' }}>AI Usage</h2>
              <div style={{ fontSize: 13, color: c.text3 }}>Current hour — resets automatically</div>
            </div>

            {aiLoading ? <Spinner /> : aiStats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <StatCard label="Total Calls (Now)"    value={aiStats.totalCallsNow}         icon="🤖" valueColor={c.purple} />
                  <StatCard label="Users with AI"        value={aiStats.totalUsersWithAiCalls} icon="👤" />
                  <StatCard label="Avg Calls / User"     value={aiStats.avgCallsPerUser}        icon="📊" />
                </div>

                <Card>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: c.text }}>Top AI Users</span>
                    <span style={{ fontSize: 12, color: c.text3 }}>— current hour</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...th, width: 40 }}>#</th>
                        <th style={th}>User</th>
                        <th style={th}>Calls</th>
                        <th style={th}>Reset At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiStats.topAiUsers.length === 0 ? (
                        <tr><td colSpan={4}><EmptyState icon="🤖" title="No active AI users" sub="No one has made AI calls this hour" /></td></tr>
                      ) : aiStats.topAiUsers.map((u, i) => {
                        const max = aiStats.topAiUsers[0]?.aiCallsThisHour || 1;
                        const pct = (u.aiCallsThisHour / max) * 100;
                        return (
                          <tr key={u._id}
                            onMouseEnter={e => e.currentTarget.style.background = c.bgAlt + '88'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ ...td, fontWeight: 800, color: c.text3, fontSize: 13 }}>#{i + 1}</td>
                            <td style={td}><AvatarCell name={u.name} email={u.email} /></td>
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, height: 6, background: c.bgAlt, borderRadius: 3, overflow: 'hidden', maxWidth: 120 }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: c.purple, borderRadius: 3, transition: 'width 0.3s' }} />
                                </div>
                                <span style={{ fontWeight: 800, color: c.purple, fontSize: 14, minWidth: 28 }}>{u.aiCallsThisHour}</span>
                              </div>
                            </td>
                            <td style={{ ...td, fontSize: 12, color: c.text3 }}>
                              {u.aiCallsResetAt ? ago(u.aiCallsResetAt) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </>
            ) : <EmptyState icon="🤖" title="AI stats load nahi hue" sub="Refresh karke try karo" />}
          </div>
        )}
      </div>

      {/* ── Ban Modal ────────────────────────────────────────────────────── */}
      {banModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => { setBanModal(null); setBanReason(''); }}>
          <div style={{
            background: c.surface, borderRadius: 18, padding: '32px 30px',
            maxWidth: 420, width: '100%',
            border: `1px solid ${c.border}`,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.redL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚫</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: c.text }}>Ban User</div>
                <div style={{ fontSize: 12, color: c.text3, marginTop: 2 }}>{banModal.name}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: c.text2, marginBottom: 18, lineHeight: 1.6 }}>
              Is user ka account suspend ho jayega. Woh login nahi kar payega.
            </p>
            <label style={{ fontSize: 12, fontWeight: 700, color: c.text3, display: 'block', marginBottom: 8 }}>
              Ban Reason (optional)
            </label>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: 22 }}
              placeholder="e.g. Spam, abuse, policy violation…"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBan()}
              onFocus={e => e.target.style.borderColor = c.red}
              onBlur={e => e.target.style.borderColor = c.border}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setBanModal(null); setBanReason(''); }} style={{
                background: 'none', border: `1px solid ${c.border}`,
                borderRadius: 9, padding: '9px 18px', fontSize: 13,
                fontWeight: 700, color: c.text2, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleBan} style={{
                background: c.red, color: '#fff', border: 'none',
                borderRadius: 9, padding: '9px 20px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Ban User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}