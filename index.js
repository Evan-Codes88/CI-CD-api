import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './utils/connectDB.js';

import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Only connect to MongoDB if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/ratings', ratingRoutes);

// Only start server if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

console.log("Deploy test")

// Export app for tests
export default app;
