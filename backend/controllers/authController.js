const User = require('../models/User');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const sgMail = require('@sendgrid/mail');

// SendGrid API Key setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// JWT Helper: User ID se token generate karta hai
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. REGISTER — Naya account banana + Default Folders setup
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Password Hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User creation
    const user = await User.create({ name, email, password: hashedPassword });

    // Hindi: Naye user ke liye default folders create karna (Project Requirement)
    const defaultFolders = [
      { name: 'General', icon: '📚', color: '#6366f1', user: user._id },
      { name: 'Mathematics', icon: '📐', color: '#ec4899', user: user._id },
      { name: 'Coding', icon: '💻', color: '#10b981', user: user._id },
    ];
    await Folder.insertMany(defaultFolders);

    res.status(201).json({
      message: 'Welcome! Account created successfully.',
      token: generateToken(user._id),
      user: { id: user._id, name, email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. LOGIN — User login + Streak update logic
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Hindi: Daily streak update karne ka logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastStudied = user.streak.lastStudied ? new Date(user.streak.lastStudied) : null;

    if (lastStudied) {
      lastStudied.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) user.streak.count += 1; // Consecutive day
      else if (diffDays > 1) user.streak.count = 1; // Gap aa gaya
    } else {
      user.streak.count = 1;
    }
    user.streak.lastStudied = new Date();
    await user.save();

    res.status(200).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, streak: user.streak, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. FORGOT PASSWORD — Token generate karke email bhejna
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });

    // Secure random token generate karna
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Hindi: SendGrid se email bhej rahe hain
    const mailContent = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Password Reset - YourNotes',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2>Password Reset Request</h2>
          <p>Aapne password reset ke liye request ki hai. Niche diye gaye button par click karein:</p>
          <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Ye link 15 minute mein expire ho jayega.</p>
        </div>`
    };

    await sgMail.send(mailContent);
    res.status(200).json({ message: 'Reset email sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Email service error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. RESET PASSWORD — Token verify karke password update karna
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Reset failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. UPLOAD AVATAR — Profile pic update (Cloudinary integration)
// ─────────────────────────────────────────────────────────────────────────────
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'yournotes/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const user = await User.findByIdAndUpdate(req.user.id, { avatar: result.secure_url }, { new: true });
    res.json({ message: 'Avatar updated', avatar: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  uploadProfilePicture
};