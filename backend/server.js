require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

connectDB();

const app = express();

// ─── Raw body capture for Cashfree webhook HMAC verification ─────────────────
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => { req.rawBody = raw; next(); });
  } else {
    next();
  }
});

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(helmet());

// CORS — supports multiple allowed origins via comma-separated env var
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://decorlix-2.vercel.app',
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.LOG_LEVEL === 'silent' ? 'tiny' : (process.env.NODE_ENV === 'production' ? 'combined' : 'dev')));

// ─── Global rate limiter ──────────────────────────────────────────────────────
const RATE_WINDOW_MS  = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000;
const RATE_MAX        = Number(process.env.RATE_LIMIT_MAX            || 500);

app.use('/api/', rateLimit({
  windowMs: RATE_WINDOW_MS,
  max:      RATE_MAX,
  message:  { ok: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// ─── Maintenance mode ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      ok:      false,
      message: process.env.MAINTENANCE_MESSAGE || 'We are under maintenance. Back soon!',
    });
  }
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({
    ok:          true,
    service:     'ecommerce-api',
    env:         process.env.NODE_ENV,
    version:     process.env.APP_VERSION || '1.0.0',
    maintenance: process.env.MAINTENANCE_MODE === 'true',
    ts:          new Date(),
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/kyc',        require('./routes/kyc'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/payment',    require('./routes/payment'));
app.use('/api/banners',    require('./routes/banners'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/admin',      require('./routes/admin'));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ ok: false, message: `Route ${req.originalUrl} not found.` })
);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    ok:      false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`👑 Owner:  ${process.env.OWNER_EMAIL}`);
  console.log(`🌐 CORS:   ${allowedOrigins.join(', ')}`);
  if (process.env.MAINTENANCE_MODE === 'true')
    console.log('⚠️  MAINTENANCE MODE ACTIVE');
});

module.exports = app;
