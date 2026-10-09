import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Configure CORS strictly using CLIENT_URL
  const configuredClients = config.clientUrl
    ? config.clientUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : [];

  const devOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const allowedOrigins = new Set([
    ...configuredClients,
    ...(config.nodeEnv !== 'production' ? devOrigins : []),
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (such as mobile apps, Postman, server-to-server health checks)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed list
        const isAllowed =
          allowedOrigins.has(origin) ||
          (config.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy rejection: Origin ${origin} is not allowed.`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root route
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'MID TRACK API Server – SRKR Engineering College (Autonomous)',
      environment: config.nodeEnv,
      endpoints: {
        health: '/api/health',
        faculty: '/api/faculty',
        student: '/api/student',
        auth: '/api/auth/login',
      },
    });
  });

  // API Routes
  app.use('/api', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

const app = createApp();
export default app;

