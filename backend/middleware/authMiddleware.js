// Yeh middleware check karta hai ki user logged in hai ya nahi
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Authorization header mein Bearer token dhundho
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer <token>" se sirf token part nikalo
      token = req.headers.authorization.split(' ')[1];

      // Token verify karo — agar galat hai toh error aayega
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token se user ID nikal ke DB se user fetch karo (password chhod ke)
     const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      // Add this check: if user was deleted, reject the request
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, please login again' });
      }

      next();
3

      // Agle middleware/controller pe jao
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  // Agar token bilkul nahi diya
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
