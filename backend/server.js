// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv"; 
// import UserOperations from "./controller/UserOperations.js";
// import PropertyOperations from "./controller/PropertyOperations.js";


// dotenv.config();

// const app = express();


// app.use(cors({
//   origin: [
//     'http://localhost:4000',
//     'http://localhost:19006',
//     'exp://172.28.18.69:8081',
//     'exp://172.28.20.31:8081',
//     'https://auth.expo.dev'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// app.use(express.json()); 


// app.use("/UserOperations", UserOperations);
// app.use("/PropertyOperations", PropertyOperations);



// app.listen(4000, '0.0.0.0', () => console.log('API on :4000'));


// const connectDB = async () => {
//   try {
//     console.log('Connecting to MongoDB with URI:', process.env.DB_URI);
//     await mongoose.connect(process.env.DB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected successfully");
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//     process.exit(1);
//   }
// };

// connectDB().then(() => {
//   const PORT = process.env.PORT || 4000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });


















// import 'dotenv/config';
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import userRoutes from './controller/UserOperations.js';

// const app = express();

// app.use(cors());
// app.use(express.json()); // <-- must be before routes

// await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenrent', {
//   dbName: 'greenrent',
// });
// console.log('Mongo connected');

// app.get('/health', (_req, res) => res.json({ ok: true }));
// app.use('/UserOperations', userRoutes);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, '0.0.0.0', () => console.log(`API on :${PORT}`));








// server.js
// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import UserOperations from "./controller/UserOperations.js";
// import PropertyOperations from "./controller/PropertyOperations.js";
// import CertificateOperations from "./controller/CertificateOperations.js";


// import { ImageAnnotatorClient } from '@google-cloud/vision';

// const visionClient = new ImageAnnotatorClient(); 


// import path from "path";
// import { fileURLToPath } from "url";


// dotenv.config();



// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();



// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));




// // ---- CORS ----
// // React Native fetch usually doesn’t send an Origin header, but allow all for simplicity.
// // If you prefer strict origins, add them to the array.
// app.use(cors({ origin: true, credentials: true }));

// // ---- Body parsing ----
// app.use(express.json());

// // ---- Health check ----
// app.get("/health", (_req, res) => {
//   res.json({ ok: true });
// });

// // ---- Routes ----
// app.use("/UserOperations", UserOperations);
// app.use("/PropertyOperations", PropertyOperations);
// app.use("/CertificateOperations", CertificateOperations);

// // ---- DB + start server (listen ONCE) ----
// const PORT = process.env.PORT || 4000;

// async function start() {
//   try {
//     const uri = process.env.DB_URI;
//     if (!uri) {
//       console.error("Missing DB_URI in environment");
//       process.exit(1);
//     }

//     console.log("Connecting to MongoDB:", uri);
//     await mongoose.connect(uri, {
//       // Mongoose v6+ doesn’t need useNewUrlParser/useUnifiedTopology flags
//     });
//     console.log("MongoDB connected");

//     // Bind to all interfaces so Android emulator (10.0.2.2) can reach it
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`API listening on http://0.0.0.0:${PORT}`);
//     });
//   } catch (err) {
//     console.error("Startup failed:", err);
//     process.exit(1);
//   }
// }

// start();



// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import UserOperations from './controller/UserOperations.js';
import PropertyOperations from './controller/PropertyOperations.js';
import CertificateOperations from './controller/CertificateOperations.js';
import ReviewOperations from './controller/ReviewOperations.js'
import PropertySuggestOperation from './controller/PropertySuggestOperation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// app.use('/Auth', Auth);
app.use('/UserOperations', UserOperations);
app.use('/ReviewOperations', ReviewOperations);
app.use('/PropertyOperations', PropertyOperations);
app.use('/CertificateOperations', CertificateOperations);
app.use('/PropertySuggestOperation', PropertySuggestOperation);


const PORT = process.env.PORT || 4000;
(async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log('MongoDB connected');
  app.listen(PORT, '0.0.0.0', () => console.log(`API listening on http://0.0.0.0:${PORT}`));
})();