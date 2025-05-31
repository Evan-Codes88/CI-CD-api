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
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/healthcheck', (req, res) => res.status(200).send('OK'));

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/ratings', ratingRoutes);

if (process.env.NODE_ENV !== 'test') {
  connectDB().catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

export default app;