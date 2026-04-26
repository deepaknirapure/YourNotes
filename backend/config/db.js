// MongoDB se connection establish karne ki file
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 5,               // Free tier ke liye pool size chhoti rakhte hain
      serverSelectionTimeoutMS: 10000, // 10 second mein connect nahi hua toh fail
      socketTimeoutMS: 45000,       // Socket timeout
      bufferCommands: false,        // Disconnect hone par immediately fail karo (buffer mat karo)
    });
    console.log('✅ MongoDB Connected!');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Connection fail hua toh server band kar do
  }
};

module.exports = connectDB;
