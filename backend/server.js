// Main server file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// ── Required env var check — startup pe hi fail karo agar missing ho
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in all values.');
  process.exit(1);
}

connectDB();

const app = express();

app.use(helmet());

try {
  const compression = require('compression');
  app.use(compression());
} catch (_) {}

// CORS
const allowedOrigins = [
  'https://your-notes-webapp.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/notes',     require('./routes/noteRoutes'));
app.use('/api/folders',   require('./routes/folderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/tags',      require('./routes/tagRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'YourNotes API is running!' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');
  res.status(err.status || 500).json({ message });
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`✅ YourNotes API running on port ${PORT}`);
});

// ── Auto-cleanup: trash mein 30+ din se padi notes delete karo
const { cleanupTrashedNotes } = require('./controllers/noteController');
const { resetWeeklyGoals } = require('./controllers/authController');

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Startup pe ek baar chalao
cleanupTrashedNotes();

// Har 24 ghante mein trash cleanup
setInterval(cleanupTrashedNotes, TWENTY_FOUR_HOURS);

// ── Weekly goal reset: har Monday 00:00 UTC pe reset karo
const scheduleWeeklyReset = () => {
  const now = new Date();
  // Agla Monday 00:00 UTC calculate karo
  const nextMonday = new Date(now);
  const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7; // 0=Sun,1=Mon...
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);

  const msUntilMonday = nextMonday - now;
  console.log(`📅 Weekly goal reset scheduled in ${Math.round(msUntilMonday / 3600000)}h`);

  setTimeout(() => {
    resetWeeklyGoals();
    setInterval(resetWeeklyGoals, ONE_WEEK_MS); // Phir har 7 din
  }, msUntilMonday);
};

scheduleWeeklyReset();

module.exports = server;
