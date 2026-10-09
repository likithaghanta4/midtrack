import { Router, Request, Response } from 'express';

const router = Router();

const apiStatusHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'MID TRACK Backend API is healthy and operational 🚀',
    timestamp: new Date().toISOString(),
    system: {
      name: 'MID TRACK – S.R.K.R. Engineering College (Autonomous)',
      regulation: 'R23 Autonomous Academic Regulation',
      version: '1.0.0',
      clientUrl: 'http://localhost:5173',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth/login',
        faculty: '/api/faculty',
        student: '/api/student',
      },
    },
  });
};

router.get('/', apiStatusHandler);
router.get('/health', apiStatusHandler);

export default router;
