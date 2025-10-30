import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import notesRouter from './routes/notes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load env variables from .env if present
dotenv.config();

const app = express();

// Env configuration with defaults
const PORT = parseInt(process.env.PORT || '4000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// Initialize DB early to fail-fast if path invalid
try {
  getDb(); // ensures DB is ready
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Failed to initialize database:', err);
  process.exit(1);
}

// Health endpoint
// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /** Health check endpoint to verify server is running. */
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/notes', notesRouter);

// Error handler should be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Notes backend listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
