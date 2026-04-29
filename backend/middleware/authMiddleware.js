const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Hindi Comment:
 * Ye middleware har secure route (Private Routes) ki raksha karta hai.
 * Bina valid JWT token ke koi bhi user notes access nahi kar payega.
 */

const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token nikalo
      token = req.headers.authorization.split(' ')[1];

      // 2. Token Verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. User ko DB mein find karo (Exclude password)
      // Hindi: req.user mein user ka saara data save ho jata hai jo controllers mein kaam aata hai
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User account not found' });
      }

      /**
       * Optional: Account Verification Check
       * Agar tumne email verification rakha hai, toh ye check enable kar sakte ho.
       */
      // if (!req.user.isVerified) {
      //   return res.status(403).json({ message: 'Please verify your email first' });
      // }

      next(); // Success: Agle controller par jao
    } catch (error) {
      console.error('Auth Error:', error.message);
      
      // Hindi: Specific error messages dena professional hota hai
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired, please login again' });
      }
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  // 4. Agar token hi nahi mila
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
};

module.exports = { protect };