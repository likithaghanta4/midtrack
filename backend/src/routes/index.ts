import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import facultyRoutes from './facultyRoutes';
import studentRoutes from './studentRoutes';
import superAdminRoutes from './superAdminRoutes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);
router.use('/superadmin', superAdminRoutes);

export default router;
