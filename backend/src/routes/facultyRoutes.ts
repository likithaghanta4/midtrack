import { Router } from 'express';
import { facultyController } from '../controllers/facultyController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public / Authenticated endpoints for academic metadata
router.get('/dashboard-stats', requireAuth, facultyController.getDashboardStats);
router.get('/sections', requireAuth, facultyController.getSections);
router.get('/subjects', requireAuth, facultyController.getSubjects);
router.get('/exams', requireAuth, facultyController.getExams);
router.get('/marks', requireAuth, facultyController.getSectionMarks);
router.post('/marks/bulk', requireAuth, requireRole(['FACULTY', 'SUPERADMIN']), facultyController.saveSectionMarks);
router.get('/marks/sessionals', requireAuth, facultyController.getSessionalMarks);
router.get('/marks/class-matrix', requireAuth, facultyController.getClassMatrix);

export default router;
