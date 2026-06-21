import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { rateLimiter } from './middleware/rate-limit.middleware';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './config/logger';

// Route Imports
import authRoutes from './routes/auth.routes';
import datasetRoutes from './routes/dataset.routes';
import databaseRoutes from './routes/database.routes';
import queryRoutes from './routes/query.routes';
import historyRoutes from './routes/history.routes';
import exportRoutes from './routes/export.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Security & Core Middlewares
app.use(helmet());
const allowedOrigins = [env.CLIENT_URL];
if (env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS')); 
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan Integration with Winston Logger
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan('combined', { stream: morganStream }));

// Apply rate limiting (100 requests per 15 minutes)
app.use(rateLimiter);

// Serve uploads/exports as static assets (optional fallback to direct downloads)
app.use('/uploads/exports', express.static(path.join(__dirname, 'uploads/exports')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dataset', datasetRoutes);
app.use('/api/v1/database', databaseRoutes);
app.use('/api/v1/query', queryRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/user', userRoutes);

// Root Health Route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI-Powered Natural Language to SQL Query Generator API is running',
  });
});

// Global Error Handler
app.use(errorHandler as any);

export default app;
