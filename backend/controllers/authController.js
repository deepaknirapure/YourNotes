const User = require('../models/User');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Hindi: Cloudinary ko .env se credentials de rahe hain — bina iske upload fail hoga
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_H9vUNzAR_4uv31TtTiLYbsvLBoZFwDWum');

// JWT Helper: User ID se token generate karta hai
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. REGISTER — Naya account banana + Default Folders setup
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, phoneVerified } = req.body;

    // Phone verification mandatory hai
    if (!phone || !phoneVerified) {
      return res.status(400).json({ message: 'Mobile number verify karna zaroori hai' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Check karo phone already registered toh nahi
    const phoneExists = await User.findOne({ phone, password: { $exists: true, $ne: null } });
    if (phoneExists) return res.status(400).json({ message: 'Mobile number pehle se registered hai' });

    // Password Hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User creation with phone
    const user = await User.create({ name, email, password: hashedPassword, phone });

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
      user: { id: user._id, name, email, role: user.role, isBanned: false }
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

    // Ban check before login
    if (user.isBanned) {
      return res.status(403).json({ 
        message: `Your account has been suspended. Reason: ${user.banReason || 'Violation of terms'}` 
      });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, streak: user.streak, avatar: user.avatar, role: user.role, isBanned: user.isBanned }
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

    // Resend SDK se email bhej rahe hain
    await resend.emails.send({
      from: 'YourNotes <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset - YourNotes',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2>Password Reset Request</h2>
          <p>Aapne password reset ke liye request ki hai. Niche diye gaye button par click karein:</p>
          <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Ye link 15 minute mein expire ho jayega.</p>
        </div>`
    });
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
    if (!req.file) return res.status(400).json({ message: 'Please select an image to upload' });

    // Hindi: Sirf image files allowed hain
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    // Hindi: Purani image ka public_id nikalne ke liye pehle user fetch karo
    const existingUser = await User.findById(req.user.id);

    // Hindi: Cloudinary pe naya image upload karo — buffer se stream ke through
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'yournotes/avatars',
          transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
          resource_type: 'image',
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // Hindi: Agar purani custom image thi to Cloudinary se delete karo (storage bachane ke liye)
    if (existingUser?.avatar && existingUser.avatar.includes('cloudinary.com')) {
      try {
        const urlParts = existingUser.avatar.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const folder   = urlParts[urlParts.length - 2];
        await cloudinary.uploader.destroy(`${folder}/${filename}`);
      } catch (_) {
        // Hindi: Old image delete fail ho to bhi new upload success hona chahiye
      }
    }

    // Hindi: DB mein naya avatar URL save karo
    await User.findByIdAndUpdate(req.user.id, { avatar: result.secure_url });

    res.json({
      message: 'Profile photo updated successfully',
      avatar: result.secure_url,
      avatarUrl: result.secure_url, // Hindi: dono keys bhejo — frontend dono check karta hai
    });
  } catch (error) {
    console.error('Avatar upload error:', error?.message || error);
    if (error?.message?.includes('Must supply api_key') || error?.message?.includes('cloud_name')) {
      return res.status(500).json({ message: 'Image service not configured. Set Cloudinary credentials in .env' });
    }
    res.status(500).json({ message: 'Upload failed. Please try again.' });
  }
};

// 6. GET PROFILE — Logged in user details
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// 7. UPDATE PROFILE — Name/email update
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;

    await user.save();
    res.status(200).json({
      message: 'Profile updated',
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, streak: user.streak },
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed' });
  }
};

// 8. CHANGE PASSWORD — Old password verify karke change
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password change failed' });
  }
};

// 9. WEEKLY RESET JOB — Monday ko notesCreatedThisWeek reset
const resetWeeklyGoals = async () => {
  try {
    await User.updateMany({}, { $set: { notesCreatedThisWeek: 0 } });
    console.log('Weekly goals reset complete');
  } catch (error) {
    console.error('Weekly reset failed:', error.message);
  }
};

// 10. DELETE AVATAR — Profile picture hatana aur Cloudinary se bhi remove karna
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hindi: Agar Cloudinary pe image thi to wahan se bhi delete karo
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        // Extract public_id from URL (format: .../folder/filename.ext)
        const urlParts = user.avatar.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        const filename = filenameWithExt.split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        await cloudinary.uploader.destroy(`${folder}/${filename}`);
      } catch (_) {
        // Hindi: Cloudinary delete fail ho bhi jaye to user ka avatar DB se hata do
      }
    }

    // Hindi: Avatar null set karo — frontend initials dikhayega
    await User.findByIdAndUpdate(req.user.id, { avatar: null });
    res.json({ message: 'Profile picture removed', avatar: null });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
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
  uploadProfilePicture,
  deleteProfilePicture,
  resetWeeklyGoals,
};