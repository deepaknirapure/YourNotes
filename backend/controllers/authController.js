// Auth controller — register, login, password reset sab yahan handle hota hai
const User = require('../models/User');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT token generate karne ka helper function
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — naya account banao
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Pehle check karo ki email already registered toh nahi
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Password hash karo (plain text kabhi save mat karo)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User create karo
    const user = await User.create({ name, email, password: hashedPassword });

    // Naye user ke liye default folders banao
    const defaultFolders = [
      { name: 'Mathematics', icon: '📐', color: '#4F46E5', user: user._id },
      { name: 'Science',     icon: '🔬', color: '#059669', user: user._id },
      { name: 'General',     icon: '📚', color: '#D97706', user: user._id },
    ];
    await Folder.insertMany(defaultFolders);

    // Token ke saath response bhejo
    res.status(201).json({
      message: 'Account created successfully!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — existing account mein login karo
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email se user dhundho
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Password match karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Streak update karo — aaj login kiya toh count badhao
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudied = user.streak.lastStudied
      ? new Date(user.streak.lastStudied)
      : null;

    if (lastStudied) {
      lastStudied.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak.count += 1; // Consecutive day — streak badhao
      } else if (diffDays > 1) {
        user.streak.count = 1; // Gap aaya — streak reset
      }
      // diffDays === 0 mane aaj phir login kiya — kuch change nahi
    } else {
      user.streak.count = 1; // Pehli baar login
    }

    user.streak.lastStudied = new Date();
    await user.save();

    res.status(200).json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ME — logged-in user ki info fetch karo
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user authMiddleware ne set kiya hai
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — password reset email bhejo
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    // Email se user dhundho
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Random reset token banao
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Token ko hash kar ke DB mein store karo (plain text nahi)
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minute validity
    await user.save();

    // Email bhejo (SendGrid use karo)
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
          <p style="color: #6b6b6b; margin-bottom: 24px;">
            Click below to reset your YourNotes password. 
            Link expires in <strong>15 minutes</strong>.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #cc785c; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
          <p style="color: #9b9b9b; font-size: 12px; margin-top: 24px;">
            If you did not request this, ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset email sent!' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD — token verify karke password badlo
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    // URL se aaya token hash karo aur DB se match karo
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Token valid aur expire nahi hua hona chahiye
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Naya password hash kar ke save karo
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Reset token hata do
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful! Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE — name update karo
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true } // Updated document return karo
    ).select('-password');

    res.status(200).json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD — current password verify karke naya set karo
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Current password verify karo
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Naya password hash karke save karo
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
};
