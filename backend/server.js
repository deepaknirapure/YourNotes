// यह main server file hai — sabse pehle yahi run hota hai
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// .env file se environment variables load karo
dotenv.config();

// MongoDB se connect karo
connectDB();

const app = express();

// ── Security middleware 
// Helmet HTTP headers ko secure karta hai
app.use(helmet());

// ── Compression middleware 
// Response size compress karna — bandwidth bachata hai
try {
  const compression = require('compression');
  app.use(compression());
} catch (_) {
  // Agar compression package nahi hai toh silently ignore karo
}

// ── CORS setup
// Sirf allowed origins se requests accept karo
const allowedOrigins = [
  'https://your-notes-webapp.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean); // null/undefined values hata do

app.use(cors({
  origin: (origin, callback) => {
    // Agar origin nahi hai (Postman etc.) ya allowed list mein hai — allow karo
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Logging 
// Production mein logs nahi dikhate — sirf development mein
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Body parser
// JSON body parse karo — max 10MB tak
app.use(express.json({ limit: '10mb' }));

// ── Routes 
// Har feature ke liye alag route file hai
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/notes',     require('./routes/noteRoutes'));
app.use('/api/folders',   require('./routes/folderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/tags',      require('./routes/tagRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));

// ── Health check 
// Server chal raha hai ya nahi check karne ke liye
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'YourNotes API is running!' });
});

// ── 404 handler
// Agar koi route nahi mila toh yeh chalega
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler 
// Kisi bhi unexpected error ko yahan pakda jayega
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  // Production mein error details nahi bhejte — security ke liye
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');
  res.status(err.status || 500).json({ message });
});

// ── Server start karo 
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`✅ YourNotes API running on port ${PORT}`);
});

// ── Auto-cleanup: purani trashed notes delete karo 
const { cleanupTrashedNotes } = require('./controllers/noteController');
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Startup pe ek baar aur phir har 24 ghante mein chalao
cleanupTrashedNotes();
setInterval(cleanupTrashedNotes, TWENTY_FOUR_HOURS);

module.exports = server;
