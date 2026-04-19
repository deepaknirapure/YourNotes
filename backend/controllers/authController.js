const User = require('../models/User');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });

    const defaultFolders = [
      { name: 'Mathematics', icon: '📐', color: '#4F46E5', user: user._id },
      { name: 'Science', icon: '🔬', color: '#059669', user: user._id },
      { name: 'General', icon: '📚', color: '#D97706', user: user._id }
    ];
    await Folder.insertMany(defaultFolders);

    res.status(201).json({
      message: 'Account created successfully!',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lastStudied = user.streak.lastStudied ? new Date(user.streak.lastStudied) : null;
    if (lastStudied) {
      lastStudied.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) user.streak.count += 1;
      else if (diffDays > 1) user.streak.count = 1;
    } else {
      user.streak.count = 1;
    }
    user.streak.lastStudied = new Date();
    await user.save();

    res.status(200).json({
      message: 'Login successful!',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'YourNotes — Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f8; border-radius: 12px;">
          <h2 style="color: #1a1a1a; margin-bottom: 8px;">Reset Your Password</h2>
          <p style="color: #6b6b6b; margin-bottom: 24px;">Click below to reset your YourNotes password. Link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #cc785c; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
          <p style="color: #9b9b9b; font-size: 12px; margin-top: 24px;">If you did not request this, ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Password reset email sent!' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful! Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name required' });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, select: '-password' }
    );
    res.status(200).json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ FIX: module.exports AFTER all functions are defined
module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile, changePassword };
