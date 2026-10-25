import { Router } from 'express';
import { superAdminController } from '../controllers/superAdminController';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Enforce authentication & Super Admin role across all routes
router.use(requireAuth);
router.use(requireSuperAdmin);

// 1. Dashboard Overview
router.get('/dashboard-stats', superAdminController.getDashboardStats);

// 2. Academic Years
router.get('/academic-years', superAdminController.getAcademicYears);
router.post('/academic-years', superAdminController.createAcademicYear);
router.put('/academic-years/:id/set-current', superAdminController.setCurrentAcademicYear);

// 3. Semesters
router.get('/semesters', superAdminController.getSemesters);
router.put('/semesters/:id/toggle-active', superAdminController.toggleSemesterActive);

// 4. Sections
router.get('/sections', superAdminController.getSections);
router.post('/sections', superAdminController.createSection);

// 5. Subjects
router.get('/subjects', superAdminController.getSubjects);
router.post('/subjects', superAdminController.createSubject);
router.put('/subjects/:id', superAdminController.updateSubject);
router.delete('/subjects/:id', superAdminController.deleteSubject);

// 6. Faculty Allocations
router.get('/allocations', superAdminController.getAllocations);
router.post('/allocations', superAdminController.createAllocation);
router.put('/allocations/:id/toggle', superAdminController.toggleAllocationStatus);
router.delete('/allocations/:id', superAdminController.deleteAllocation);

// 7. All-Section Marks Overview
router.get('/marks-overview', superAdminController.getAllSectionMarksOverview);

export default router;
