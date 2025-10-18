// import 'dotenv/config'; // loads .env immediately

// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import UserOperations from './controller/UserOperations.js';
// import PropertyOperations from './controller/PropertyOperations.js';
// import CertificateOperations from './controller/CertificateOperations.js';
// import ReviewOperations from './controller/ReviewOperations.js';
// import PropertySuggestOperation from './controller/PropertySuggestOperation.js';
// import { verifyTransport } from './utils/emailService.js';

// // ❌ remove this line:
// // dotenv.config();

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// app.use(cors({ origin: true, credentials: true }));
// app.use(express.json());

// app.get('/health', (_req, res) => res.json({ ok: true }));

// // verifies SMTP creds at startup; logs ready/error
// verifyTransport();

// app.use('/UserOperations', UserOperations);
// app.use('/ReviewOperations', ReviewOperations);
// app.use('/PropertyOperations', PropertyOperations);
// app.use('/CertificateOperations', CertificateOperations);
// app.use('/PropertySuggestOperation', PropertySuggestOperation);

// const PORT = process.env.PORT || 4000;
// (async () => {
//   await mongoose.connect(process.env.DB_URI);
//   console.log('MongoDB connected');
//   app.listen(PORT, '0.0.0.0', () =>
//     console.log(`API listening on http://0.0.0.0:${PORT}`)
//   );
// })();



import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import UserOperations from './controller/UserOperations.js';
import PropertyOperations from './controller/PropertyOperations.js';
import CertificateOperations from './controller/CertificateOperations.js';
import ReviewOperations from './controller/ReviewOperations.js';
import PropertySuggestOperation from './controller/PropertySuggestOperation.js';
import { verifyTransport } from './utils/emailService.js';
import 'dotenv/config';


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// verifies SMTP creds at startup; logs ready/error
//verifyTransport();

app.use('/UserOperations', UserOperations);
app.use('/ReviewOperations', ReviewOperations);
app.use('/PropertyOperations', PropertyOperations);
app.use('/CertificateOperations', CertificateOperations);
app.use('/PropertySuggestOperation', PropertySuggestOperation);

const PORT = process.env.PORT || 4000;
(async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log('MongoDB connected');
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`API listening on http://0.0.0.0:${PORT}`)
  );
})();