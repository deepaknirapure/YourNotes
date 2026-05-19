import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

// ─── Tiny helpers ──────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();
const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const avatar = (name = '?') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'var(--accent)', sub }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '22px 24px',
      display: 'flex', flexDirection: 'column', gap: 6,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: '-1px' }}>{fmt(value)}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────
function Badge({ label, color = 'var(--text-3)', bg = 'var(--bg-alt)' }) {
  return (
    <span style={{
      background: bg, color, borderRadius: 5,
      padding: '2px 9px', fontSize: 11, fontWeight: 700,
    }}>{label}</span>
  );
}

// ─── Section Heading ───────────────────────────────────────────────────────
function SectionHead({ title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <h2 style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', margin: 0 }}>{title}</h2>
      {count !== undefined && (
        <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 999, padding: '1px 10px', fontSize: 12, fontWeight: 700 }}>{fmt(count)}</span>
      )}
    </div>
  );
}

// ─── Tab Bar ───────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '10px 16px', fontSize: 13, fontWeight: 700,
            color: active === t.key ? 'var(--accent)' : 'var(--text-3)',
            borderBottom: active === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all .15s',
          }}
        >{t.label}{t.count !== undefined ? ` (${fmt(t.count)})` : ''}</button>
      ))}
    </div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────
function Btn({ label, onClick, color = 'var(--accent)', disabled, small }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: color, color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 7, padding: small ? '5px 12px' : '7px 14px',
        fontSize: small ? 12 : 13, fontWeight: 700, opacity: disabled ? .5 : 1,
        transition: 'opacity .15s',
      }}
    >{label}</button>
  );
}

// ─── Main AdminPage ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admins immediately
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const [tab, setTab] = useState('overview');

  // ── Stats ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch {
      toast.error('Stats load nahi hue');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Users ────────────────────────────────────────────────────────────────
  const [users, setUsers]           = useState([]);
  const [userPage, setUserPage]     = useState(1);
  const [userTotal, setUserTotal]   = useState(0);
  const [userPages, setUserPages]   = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [usersLoading, setUsersLoading] = useState(false);
  const [banModal, setBanModal]     = useState(null);
  const [banReason, setBanReason]   = useState('');

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await API.get('/admin/users', {
        params: { page: userPage, search: userSearch, filter: userFilter },
      });
      setUsers(data.users);
      setUserTotal(data.total);
      setUserPages(data.totalPages);
    } catch {
      toast.error('Users load nahi hue');
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userSearch, userFilter]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
  }, [tab, loadUsers]);

  const handleBan = async () => {
    if (!banModal) return;
    try {
      const { data } = await API.patch(`/admin/users/${banModal.userId}/ban`, { reason: banReason });
      toast.success(data.message);
      setBanModal(null);
      setBanReason('');
      loadUsers();
      loadStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ban failed');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`"${name}" ko permanently delete karna chahte ho?`)) return;
    try {
      const { data } = await API.delete(`/admin/users/${userId}`);
      toast.success(data.message);
      loadUsers();
      loadStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleRoleToggle = async (userId, currentRole, name) => {
    const to = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`"${name}" ko ${to} banana chahte ho?`)) return;
    try {
      const { data } = await API.patch(`/admin/users/${userId}/role`);
      toast.success(data.message);
      loadUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Role change failed');
    }
  };

  // ── Community Notes ───────────────────────────────────────────────────────
  const [notes, setNotes]           = useState([]);
  const [notePage, setNotePage]     = useState(1);
  const [noteTotal, setNoteTotal]   = useState(0);
  const [notePages, setNotePages]   = useState(1);
  const [noteSearch, setNoteSearch] = useState('');
  const [noteFilter, setNoteFilter] = useState('all');
  const [notesLoading, setNotesLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const { data } = await API.get('/admin/notes', {
        params: { page: notePage, search: noteSearch, filter: noteFilter },
      });
      setNotes(data.notes);
      setNoteTotal(data.total);
      setNotePages(data.totalPages);
    } catch {
      toast.error('Notes load nahi hue');
    } finally {
      setNotesLoading(false);
    }
  }, [notePage, noteSearch, noteFilter]);

  useEffect(() => {
    if (tab === 'notes') loadNotes();
  }, [tab, loadNotes]);

  const handleForceRemove = async (noteId) => {
    try {
      const { data } = await API.patch(`/admin/notes/${noteId}/force-remove`);
      toast.success(data.message);
      loadNotes();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  const handleRestore = async (noteId) => {
    try {
      const { data } = await API.patch(`/admin/notes/${noteId}/restore`);
      toast.success(data.message);
      loadNotes();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Restore failed');
    }
  };

  const handleClearReports = async (noteId) => {
    try {
      const { data } = await API.patch(`/admin/notes/${noteId}/clear-reports`);
      toast.success(data.message);
      loadNotes();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Clear failed');
    }
  };

  // ── Reported Notes ────────────────────────────────────────────────────────
  const [reported, setReported]           = useState([]);
  const [reportedLoading, setReportedLoading] = useState(false);

  const loadReported = useCallback(async () => {
    setReportedLoading(true);
    try {
      const { data } = await API.get('/admin/notes/reported');
      setReported(data.notes);
    } catch {
      toast.error('Reported notes load nahi hue');
    } finally {
      setReportedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'reported') loadReported();
  }, [tab, loadReported]);

  // ── AI Stats ──────────────────────────────────────────────────────────────
  const [aiStats, setAiStats]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadAi = useCallback(async () => {
    setAiLoading(true);
    try {
      const { data } = await API.get('/admin/ai-usage');
      setAiStats(data);
    } catch {
      toast.error('AI stats load nahi hue');
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'ai') loadAi();
  }, [tab, loadAi]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!user || user.role !== 'admin') return null;

  // ── Shared styles ──────────────────────────────────────────────────────────
  const input = {
    background: 'var(--bg-alt)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)',
  };
  const table = { width: '100%', borderCollapse: 'collapse' };
  const th = {
    textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '.06em',
    padding: '8px 12px', borderBottom: '1px solid var(--border)',
  };
  const td = {
    padding: '12px 12px', fontSize: 13, color: 'var(--text-2)',
    borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
  };

  const Pagination = ({ page, pages, onChange }) => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, alignItems: 'center' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        style={{ ...input, cursor: page <= 1 ? 'not-allowed' : 'pointer', padding: '6px 12px' }}>←</button>
      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Page {page} / {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        style={{ ...input, cursor: page >= pages ? 'not-allowed' : 'pointer', padding: '6px 12px' }}>→</button>
    </div>
  );

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      fontFamily: 'var(--font)', color: 'var(--text)',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 'var(--topbar-h)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>Admin Panel</span>
          <Badge label="ADMIN" color="var(--accent)" bg="var(--accent-light)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{user.email}</span>
          <button onClick={() => navigate('/home')}
            style={{ ...input, cursor: 'pointer', padding: '7px 14px', fontWeight: 600 }}>
            ← Back to App
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        <TabBar
          tabs={[
            { key: 'overview', label: '📊 Overview' },
            { key: 'users',    label: '👥 Users',    count: userTotal || stats?.totalUsers },
            { key: 'notes',    label: '📝 Notes',    count: noteTotal || stats?.publicNotes },
            { key: 'reported', label: '🚨 Reported', count: stats?.reportedNotes },
            { key: 'ai',       label: '🤖 AI Usage' },
          ]}
          active={tab}
          onChange={(k) => setTab(k)}
        />

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Loading stats…</div>
            ) : stats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
                  <StatCard label="Total Users"    value={stats.totalUsers}       icon="👥" />
                  <StatCard label="Banned Users"   value={stats.bannedUsers}      icon="🚫" color="var(--red)" />
                  <StatCard label="Total Admins"   value={stats.totalAdmins}      icon="🛡️" color="var(--purple)" />
                  <StatCard label="New This Week"  value={stats.newUsersThisWeek} icon="🆕" color="var(--green)" />
                  <StatCard label="Total Notes"    value={stats.totalNotes}       icon="📝" />
                  <StatCard label="Public Notes"   value={stats.publicNotes}      icon="🌐" color="var(--blue)" />
                  <StatCard label="Reported Notes" value={stats.reportedNotes}    icon="🚨" color="var(--yellow)" />
                  <StatCard label="AI Calls Now"   value={stats.totalAiCallsNow}  icon="🤖" color="var(--purple)" />
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                  <SectionHead title="Quick Actions" />
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Btn label="👥 Manage Users"   onClick={() => setTab('users')} />
                    <Btn label="📝 Manage Notes"   onClick={() => setTab('notes')} color="var(--blue)" />
                    <Btn label="🚨 Reported Notes" onClick={() => setTab('reported')} color="var(--red)" />
                    <Btn label="🤖 AI Usage"       onClick={() => setTab('ai')} color="var(--purple)" />
                    <Btn label="🔄 Refresh Stats"  onClick={loadStats} color="var(--green)" />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Stats load nahi hue.</div>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <SectionHead title="Users" count={userTotal} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                style={{ ...input, flex: 1, minWidth: 180 }}
                placeholder="Search by name or email…"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
              />
              {['all', 'banned', 'admins'].map((f) => (
                <button key={f} onClick={() => { setUserFilter(f); setUserPage(1); }}
                  style={{
                    ...input, cursor: 'pointer', fontWeight: 700,
                    background: userFilter === f ? 'var(--accent)' : 'var(--bg-alt)',
                    color: userFilter === f ? '#fff' : 'var(--text-2)',
                    border: userFilter === f ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {usersLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading users…</div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>User</th>
                      <th style={th}>Role</th>
                      <th style={th}>Status</th>
                      <th style={th}>Joined</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...td, textAlign: 'center', padding: 32 }}>No users found</td></tr>
                    ) : users.map((u) => (
                      <tr key={u._id}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: 'var(--accent-light)', color: 'var(--accent)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: 12, flexShrink: 0,
                            }}>
                              {u.avatar
                                ? <img src={u.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                                : avatar(u.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={td}>
                          <Badge
                            label={u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                            color={u.role === 'admin' ? 'var(--purple)' : 'var(--text-3)'}
                            bg={u.role === 'admin' ? 'var(--purple-light)' : 'var(--bg-alt)'}
                          />
                        </td>
                        <td style={td}>
                          {u.isBanned
                            ? <Badge label="🚫 Banned" color="var(--red)" bg="var(--red-light)" />
                            : <Badge label="✅ Active" color="var(--green)" bg="var(--green-light)" />}
                        </td>
                        <td style={td}><span style={{ fontSize: 12 }}>{ago(u.createdAt)}</span></td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <Btn
                              small
                              label={u.isBanned ? 'Unban' : 'Ban'}
                              color={u.isBanned ? 'var(--green)' : 'var(--red)'}
                              onClick={() => {
                                if (u.isBanned) {
                                  API.patch(`/admin/users/${u._id}/ban`, { reason: '' })
                                    .then(({ data }) => { toast.success(data.message); loadUsers(); loadStats(); })
                                    .catch(e => toast.error(e.response?.data?.message || 'Failed'));
                                } else {
                                  setBanModal({ userId: u._id, name: u.name });
                                }
                              }}
                            />
                            <Btn small label={u.role === 'admin' ? 'Demote' : 'Promote'} color="var(--purple)"
                              onClick={() => handleRoleToggle(u._id, u.role, u.name)} />
                            <Btn small label="Delete" color="var(--red)"
                              onClick={() => handleDelete(u._id, u.name)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={userPage} pages={userPages} onChange={setUserPage} />
          </div>
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          <div>
            <SectionHead title="Community Notes" count={noteTotal} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                style={{ ...input, flex: 1, minWidth: 180 }}
                placeholder="Search by title or content…"
                value={noteSearch}
                onChange={(e) => { setNoteSearch(e.target.value); setNotePage(1); }}
              />
              {['all', 'reported', 'removed'].map((f) => (
                <button key={f} onClick={() => { setNoteFilter(f); setNotePage(1); }}
                  style={{
                    ...input, cursor: 'pointer', fontWeight: 700,
                    background: noteFilter === f ? 'var(--accent)' : 'var(--bg-alt)',
                    color: noteFilter === f ? '#fff' : 'var(--text-2)',
                    border: noteFilter === f ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {notesLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading notes…</div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Note</th>
                      <th style={th}>Author</th>
                      <th style={th}>Stats</th>
                      <th style={th}>Status</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...td, textAlign: 'center', padding: 32 }}>No notes found</td></tr>
                    ) : notes.map((n) => (
                      <tr key={n._id}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={td}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', maxWidth: 240 }} title={n.title}>
                            {n.title || 'Untitled'}
                          </div>
                          {n.subject && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{n.subject}</div>}
                          <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{ago(n.createdAt)}</div>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{n.user?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{n.user?.email || ''}</div>
                        </td>
                        <td style={td}>
                          <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span>❤️ {fmt(n.likesCount)}</span>
                            <span>📥 {fmt(n.downloads)}</span>
                            {n.reportsCount > 0 && <span style={{ color: 'var(--red)' }}>🚨 {fmt(n.reportsCount)} reports</span>}
                          </div>
                        </td>
                        <td style={td}>
                          {n.isRemovedByAdmin
                            ? <Badge label="Removed" color="var(--red)" bg="var(--red-light)" />
                            : n.reportsCount > 0
                              ? <Badge label="Reported" color="var(--yellow)" bg="var(--yellow-light)" />
                              : <Badge label="Live" color="var(--green)" bg="var(--green-light)" />}
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {n.isRemovedByAdmin
                              ? <Btn small label="Restore" color="var(--green)" onClick={() => handleRestore(n._id)} />
                              : <Btn small label="Remove" color="var(--red)" onClick={() => handleForceRemove(n._id)} />}
                            {n.reportsCount > 0 && (
                              <Btn small label="Clear Reports" color="var(--blue)" onClick={() => handleClearReports(n._id)} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={notePage} pages={notePages} onChange={setNotePage} />
          </div>
        )}

        {/* REPORTED */}
        {tab === 'reported' && (
          <div>
            <SectionHead title="Reported Notes" count={reported.length} />
            {reportedLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading…</div>
            ) : reported.length === 0 ? (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
                padding: 48, textAlign: 'center', color: 'var(--text-3)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700 }}>No reported notes!</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Community sab theek hai.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reported.map((n) => (
                  <div key={n._id} style={{
                    background: 'var(--surface)', border: '1px solid var(--red-light)',
                    borderLeft: '3px solid var(--red)', borderRadius: 12, padding: '18px 20px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{n.title || 'Untitled'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
                          By <strong>{n.user?.name}</strong> · {ago(n.createdAt)} · ❤️ {fmt(n.likesCount)}
                        </div>
                        {n.reports?.slice(0, 3).map((r, i) => (
                          <div key={i} style={{
                            fontSize: 11, color: 'var(--text-3)',
                            background: 'var(--red-light)', borderRadius: 5,
                            padding: '3px 8px', display: 'inline-block', marginRight: 6, marginBottom: 4,
                          }}>
                            🚨 {r.reason || 'No reason'}
                            {r.user?.name && <span style={{ color: 'var(--text-4)' }}> — {r.user.name}</span>}
                          </div>
                        ))}
                        {n.reports?.length > 3 && (
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>+{n.reports.length - 3} more reports</div>
                        )}
                      </div>
                      <Badge label={`🚨 ${fmt(n.reportsCount)} reports`} color="var(--red)" bg="var(--red-light)" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <Btn small label="Force Remove" color="var(--red)" onClick={() => handleForceRemove(n._id)} />
                      <Btn small label="Clear Reports (Dismiss)" color="var(--blue)" onClick={() => handleClearReports(n._id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI USAGE */}
        {tab === 'ai' && (
          <div>
            <SectionHead title="AI Usage Stats" />
            {aiLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading AI stats…</div>
            ) : aiStats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16, marginBottom: 28 }}>
                  <StatCard label="Total Calls Now"     value={aiStats.totalCallsNow}         icon="🤖" color="var(--purple)" />
                  <StatCard label="Users with AI Calls" value={aiStats.totalUsersWithAiCalls} icon="👤" />
                  <StatCard label="Avg Calls / User"    value={aiStats.avgCallsPerUser}        icon="📊" />
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Top AI Users (current hour)</span>
                  </div>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>#</th>
                        <th style={th}>User</th>
                        <th style={th}>AI Calls (this hour)</th>
                        <th style={th}>Reset At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiStats.topAiUsers.length === 0 ? (
                        <tr><td colSpan={4} style={{ ...td, textAlign: 'center', padding: 32 }}>No active AI users</td></tr>
                      ) : aiStats.topAiUsers.map((u, i) => (
                        <tr key={u._id}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ ...td, width: 40, fontWeight: 800, color: 'var(--text-3)' }}>#{i + 1}</td>
                          <td style={td}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                          </td>
                          <td style={td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                height: 6,
                                width: Math.min(120, (u.aiCallsThisHour / (aiStats.topAiUsers[0]?.aiCallsThisHour || 1)) * 120),
                                background: 'var(--purple)', borderRadius: 3,
                              }} />
                              <span style={{ fontWeight: 700, color: 'var(--purple)' }}>{u.aiCallsThisHour}</span>
                            </div>
                          </td>
                          <td style={td}><span style={{ fontSize: 12 }}>{u.aiCallsResetAt ? ago(u.aiCallsResetAt) : '—'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>AI stats load nahi hue.</div>
            )}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setBanModal(null)}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 32,
            maxWidth: 420, width: '100%', boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>Ban User</h3>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
              <strong>{banModal.name}</strong> ko ban karna chahte ho? Reason do (optional):
            </p>
            <input
              style={{ ...input, width: '100%', marginBottom: 20, boxSizing: 'border-box' }}
              placeholder="Ban reason (e.g. spam, abuse)…"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBan()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn label="Cancel" onClick={() => { setBanModal(null); setBanReason(''); }} color="var(--text-3)" />
              <Btn label="Ban User" onClick={handleBan} color="var(--red)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}