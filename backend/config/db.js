const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 5,            // Free tier: keep pool small
      serverSelectionTimeoutMS: 10000, // 10s — fail fast on cold start
      socketTimeoutMS: 45000,    // Socket timeout
      bufferCommands: false,     // Disable buffering — fail immediately if disconnected
    });
    console.log('MongoDB Connected!');
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
