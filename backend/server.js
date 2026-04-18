const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── Compression (gzip responses) ─────────────────────────────────────────────
try {
  const compression = require('compression');
  app.use(compression());
} catch (_) { /* compression not installed — skip silently */ }

// ── CORS ──────────────────────────────────────────────────────────────────────
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

// ── Logging + body parsing ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/notes',     require('./routes/noteRoutes'));
app.use('/api/folders',   require('./routes/folderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/tags',      require('./routes/tagRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));

// ── Health check (frontend warmup ping for Render free tier) ──────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));
app.get('/', (_req, res) => res.json({ message: 'YourNotes API is running!' }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ YourNotes API running on port ${PORT}`));
