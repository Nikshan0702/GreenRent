import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

import UserOperations from './controller/UserOperations.js';
import PropertyOperations from './controller/PropertyOperations.js';
import CertificateOperations from './controller/CertificateOperations.js';
import ReviewOperations from './controller/ReviewOperations.js';
import PropertySuggestOperation from './controller/PropertySuggestOperation.js';
import { verifyTransport } from './utils/emailService.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(morgan('dev'));

// CORS: RN (native) doesn’t need CORS, but no harm keeping it.
app.use(cors({ origin: true, credentials: true }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Email transport self-test (won’t crash app if it fails)
try {
  verifyTransport();
} catch (e) {
  console.warn('[email] transport verify failed:', e?.message);
}

// Routes
app.use('/UserOperations', UserOperations);
app.use('/ReviewOperations', ReviewOperations);
app.use('/PropertyOperations', PropertyOperations);
app.use('/CertificateOperations', CertificateOperations);
app.use('/PropertySuggestOperation', PropertySuggestOperation);

// 404 helper (so you see 404 vs “network error”)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Centralized error handler (avoid silent crashes)
app.use((err, _req, res, _next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Server error', message: err?.message });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    if (!process.env.DB_URI) {
      console.warn('[startup] DB_URI missing – server will run but DB calls will fail');
    } else {
      await mongoose.connect(process.env.DB_URI);
      console.log('MongoDB connected');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on http://0.0.0.0:${PORT}`);
    });
  } catch (e) {
    console.error('[startup] failed:', e);
    process.exit(1);
  }
})();