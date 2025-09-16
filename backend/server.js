import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv"; 
import UserOperations from "./controller/UserOperations.js";


dotenv.config();

const app = express();


app.use(cors({
  origin: [
    'http://localhost:4000',
    'http://localhost:19006',
    'exp://172.28.18.69:8081',
    'exp://172.28.20.31:8081',
    'https://auth.expo.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json()); 


app.use("/UserOperations", UserOperations);



app.listen(4000, '0.0.0.0', () => console.log('API on :4000'));


const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB with URI:', process.env.DB_URI);
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});


















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