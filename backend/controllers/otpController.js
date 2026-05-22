// OTP Controller — Fast2SMS se free SMS OTP bhejo (India only)
const User = require('../models/User');
const crypto = require('crypto');

// ─── Helper: 6-digit OTP ────────────────────────────────────────────────────
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ─── Fast2SMS se SMS bhejo ──────────────────────────────────────────────────
// Docs: https://docs.fast2sms.com
// API key: fast2sms.com → Dashboard → Dev API
const sendSMS = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // Dev mode: console mein print karo
    console.log(`\n[DEV MODE] OTP for ${phone}: ${otp}\n`);
    return;
  }

  // Phone number se +91 ya 91 prefix hata do — Fast2SMS sirf 10 digit chahta hai
  const digits = phone.replace(/^\+?91/, '').replace(/\D/g, '');

  const url = 'https://www.fast2sms.com/dev/bulkV2';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',          // OTP route — fastest delivery
      variables_values: otp, // Ye OTP message mein inject hoga
      numbers: digits,       // 10-digit number
    }),
  });

  const result = await response.json();

  // Fast2SMS error check
  if (!result.return) {
    console.error('Fast2SMS error:', result);
    throw new Error(result.message?.[0] || 'SMS send failed');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEND OTP — POST /auth/send-otp
//    Body: { phone: "+919876543210" }
// ─────────────────────────────────────────────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ message: 'Mobile number required hai' });

    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Valid phone number daalo (format: +91XXXXXXXXXX)' });
    }

    // Check: ye number already registered toh nahi?
    const existingUser = await User.findOne({ phone, password: { $exists: true, $ne: null } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ye mobile number pehle se registered hai' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // OTP DB mein temporarily save karo
    await User.findOneAndUpdate(
      { phone },
      { otpCode: otp, otpExpire, phone },
      { upsert: true, new: true, setDefaultsOnInsert: false }
    );

    // SMS bhejo
    await sendSMS(phone, otp);

    res.status(200).json({
      message: 'OTP bhej diya gaya! 10 minutes mein verify karo.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });

  } catch (error) {
    console.error('OTP send error:', error.message);
    res.status(500).json({ message: 'OTP bhejne mein problem aayi. Dobara try karo.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERIFY OTP — POST /auth/verify-otp
//    Body: { phone: "+919876543210", otp: "123456" }
// ─────────────────────────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone aur OTP dono required hain' });
    }

    const record = await User.findOne({
      phone,
      otpCode: otp,
      otpExpire: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ message: 'OTP galat hai ya expire ho gaya. Dobara try karo.' });
    }

    // OTP sahi — cleanup
    await User.findOneAndUpdate({ phone }, { $unset: { otpCode: 1, otpExpire: 1 } });

    res.status(200).json({ message: 'Phone number verify ho gaya!', verified: true });

  } catch (error) {
    console.error('OTP verify error:', error.message);
    res.status(500).json({ message: 'Verification mein error aaya. Dobara try karo.' });
  }
};

module.exports = { sendOTP, verifyOTP };
