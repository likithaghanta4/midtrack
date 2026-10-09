import { Router } from 'express';
import { getStudentDashboard } from '../controllers/studentController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// GET /api/student/dashboard
router.get('/dashboard', requireAuth, requireRole('STUDENT'), getStudentDashboard);

export default router;
