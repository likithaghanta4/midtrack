import { Router } from 'express';
import {
  getFacultyList,
  facultyLogin,
  studentLogin,
  getMe,
  logout,
} from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public Authentication Routes
router.get('/faculty', getFacultyList);
router.post('/faculty/login', facultyLogin);
router.post('/student/login', studentLogin);
router.post('/logout', logout);

// Protected Authentication Route
router.get('/me', requireAuth, getMe);

export default router;
