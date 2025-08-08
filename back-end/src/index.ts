import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/userRoutes';
import { fanRoutes } from './routes/fanRoutes';
import { followRoutes } from './routes/followRoutes';
import { mediaRoutes } from './routes/mediaRoutes';
import { notificationRoutes } from './routes/notificationRoutes';
import { messageRoutes } from './routes/messageRoutes';
import { feedbackRoutes } from './routes/feedbackRoutes';
import { initializeDatabase } from './database/init';
import {authRoutes} from "./routes/authRoutes";
import flaggedFanRoutes from './routes/flaggedFanRoutes';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http:///192.168.68.88:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database and start server
(async () => {
  try {
    // Initialize database with migrations
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/fans', fanRoutes);
    app.use('/api/follows', followRoutes);
    app.use('/api/media', mediaRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/flagged-fans', flaggedFanRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();

export default app;
