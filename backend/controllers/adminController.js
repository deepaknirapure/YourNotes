const User = require('../models/User');
const Note = require('../models/Note');

/**
 * Admin Controller — YourNotes
 * Sabhi admin actions yahan handle hote hain:
 * - Stats overview
 * - User list, ban/unban, delete
 * - Community notes force-remove
 * - Reported notes list
 * - AI usage overview
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD STATS
//    Overall platform ka bird's-eye view
// ─────────────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      bannedUsers,
      totalNotes,
      publicNotes,
      reportedNotes,
      totalAdmins,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Note.countDocuments({ isTrashed: false }),
      Note.countDocuments({ isPublic: true, isTrashed: false }),
      Note.countDocuments({ 'reports.0': { $exists: true }, isPublic: true, isTrashed: false }),
      User.countDocuments({ role: 'admin' }),
    ]);

    // Last 7 days new users
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Total AI calls across all users
    const aiStats = await User.aggregate([
      { $group: { _id: null, totalAiCalls: { $sum: '$aiCallsThisHour' } } }
    ]);
    const totalAiCallsNow = aiStats[0]?.totalAiCalls || 0;

    res.json({
      totalUsers,
      bannedUsers,
      totalNotes,
      publicNotes,
      reportedNotes,
      totalAdmins,
      newUsersThisWeek,
      totalAiCallsNow,
    });
  } catch (err) {
    console.error('Admin getStats error:', err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET ALL USERS (paginated, searchable)
// ─────────────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, search = '', filter = 'all' } = req.query;
    const limit = 20;
    const skip  = (Number(page) - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name:  new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    if (filter === 'banned')  query.isBanned = true;
    if (filter === 'admins')  query.role = 'admin';

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({ users, totalPages: Math.ceil(total / limit), currentPage: Number(page), total });
  } catch (err) {
    console.error('Admin getUsers error:', err);
    res.status(500).json({ message: 'Failed to load users' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. BAN / UNBAN USER
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleBanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = '' } = req.body;

    // Admin apne aap ko ban nahi kar sakta
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'Aap khud ko ban nahi kar sakte' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Doosre admins ko ban nahi kar sakte (super-admin protection)
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin ko ban nahi kar sakte' });
    }

    user.isBanned   = !user.isBanned;
    user.banReason  = user.isBanned ? reason : '';
    await user.save();

    res.json({
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      isBanned: user.isBanned,
    });
  } catch (err) {
    console.error('Admin toggleBanUser error:', err);
    res.status(500).json({ message: 'Action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. DELETE USER (permanent)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'Aap khud ko delete nahi kar sakte' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin account delete nahi ho sakta' });
    }

    // User ke saare notes bhi delete karo (soft delete — isTrashed = true)
    await Note.updateMany({ user: userId }, { isTrashed: true, trashedAt: new Date() });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User aur unke notes successfully delete ho gaye' });
  } catch (err) {
    console.error('Admin deleteUser error:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROMOTE / DEMOTE USER (admin role toggle)
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'Aap apna role change nahi kar sakte' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({
      message: user.role === 'admin' ? 'User ko admin bana diya' : 'Admin ko user bana diya',
      role: user.role,
    });
  } catch (err) {
    console.error('Admin toggleAdminRole error:', err);
    res.status(500).json({ message: 'Role change failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET ALL PUBLIC NOTES (admin view — paginated)
// ─────────────────────────────────────────────────────────────────────────────
exports.getCommunityNotes = async (req, res) => {
  try {
    const { page = 1, search = '', filter = 'all' } = req.query;
    const limit = 20;
    const skip  = (Number(page) - 1) * limit;

    const query = { isPublic: true, isTrashed: false };
    if (filter === 'reported') query['reports.0'] = { $exists: true };
    if (filter === 'removed')  { delete query.isPublic; query.isRemovedByAdmin = true; }
    if (search) {
      query.$or = [
        { title:     new RegExp(search, 'i') },
        { plainText: new RegExp(search, 'i') },
      ];
    }

    const [notes, total] = await Promise.all([
      Note.find(query)
        .select('title user isPublic isRemovedByAdmin reports likes downloads createdAt subject')
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments(query),
    ]);

    const notesWithCounts = notes.map(n => ({
      ...n,
      likesCount:   n.likes?.length   || 0,
      reportsCount: n.reports?.length || 0,
    }));

    res.json({ notes: notesWithCounts, totalPages: Math.ceil(total / limit), currentPage: Number(page), total });
  } catch (err) {
    console.error('Admin getCommunityNotes error:', err);
    res.status(500).json({ message: 'Failed to load notes' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. FORCE REMOVE / RESTORE COMMUNITY NOTE
// ─────────────────────────────────────────────────────────────────────────────
exports.forceRemoveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isPublic          = false;
    note.isRemovedByAdmin  = true;
    await note.save();

    res.json({ message: 'Note community se remove kar diya gaya' });
  } catch (err) {
    console.error('Admin forceRemoveNote error:', err);
    res.status(500).json({ message: 'Action failed' });
  }
};

exports.restoreNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isPublic         = true;
    note.isRemovedByAdmin = false;
    await note.save();

    res.json({ message: 'Note restore ho gayi' });
  } catch (err) {
    console.error('Admin restoreNote error:', err);
    res.status(500).json({ message: 'Restore failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET REPORTED NOTES
// ─────────────────────────────────────────────────────────────────────────────
exports.getReportedNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      'reports.0': { $exists: true },
      isPublic: true,
      isTrashed: false,
      isRemovedByAdmin: false,
    })
      .select('title user reports likes downloads createdAt subject')
      .populate('user', 'name email avatar')
      .populate('reports.user', 'name email')
      .sort({ 'reports.length': -1, createdAt: -1 })
      .lean();

    const withCounts = notes.map(n => ({
      ...n,
      reportsCount: n.reports?.length || 0,
      likesCount:   n.likes?.length   || 0,
    }));

    res.json({ notes: withCounts });
  } catch (err) {
    console.error('Admin getReportedNotes error:', err);
    res.status(500).json({ message: 'Failed to load reported notes' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. CLEAR REPORTS for a note (admin reviewed it, no action needed)
// ─────────────────────────────────────────────────────────────────────────────
exports.clearReports = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.reports = [];
    await note.save();

    res.json({ message: 'Reports clear kar diye gaye' });
  } catch (err) {
    console.error('Admin clearReports error:', err);
    res.status(500).json({ message: 'Action failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. AI USAGE STATS (top AI users)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAiUsageStats = async (req, res) => {
  try {
    const topAiUsers = await User.find({ aiCallsThisHour: { $gt: 0 } })
      .select('name email aiCallsThisHour aiCallsResetAt')
      .sort({ aiCallsThisHour: -1 })
      .limit(20)
      .lean();

    const totalUsersWithAiCalls = await User.countDocuments({ aiCallsThisHour: { $gt: 0 } });

    const aggregate = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$aiCallsThisHour' }, avg: { $avg: '$aiCallsThisHour' } } }
    ]);

    res.json({
      topAiUsers,
      totalUsersWithAiCalls,
      totalCallsNow: aggregate[0]?.total || 0,
      avgCallsPerUser: Math.round(aggregate[0]?.avg || 0),
    });
  } catch (err) {
    console.error('Admin getAiUsageStats error:', err);
    res.status(500).json({ message: 'Failed to load AI stats' });
  }
};
