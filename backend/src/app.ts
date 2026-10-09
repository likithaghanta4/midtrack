import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root route
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'MID TRACK API Server – SRKR Engineering College (Autonomous)',
      apiDocs: 'http://localhost:5000/api',
      frontendApp: 'http://localhost:5173',
    });
  });

  // API Routes
  app.use('/api', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
