"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facultyController_1 = require("../controllers/facultyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public / Authenticated endpoints for academic metadata
router.get('/dashboard-stats', authMiddleware_1.requireAuth, facultyController_1.facultyController.getDashboardStats);
router.get('/sections', authMiddleware_1.requireAuth, facultyController_1.facultyController.getSections);
router.get('/subjects', authMiddleware_1.requireAuth, facultyController_1.facultyController.getSubjects);
router.get('/exams', authMiddleware_1.requireAuth, facultyController_1.facultyController.getExams);
router.get('/marks', authMiddleware_1.requireAuth, facultyController_1.facultyController.getSectionMarks);
router.post('/marks/bulk', authMiddleware_1.requireAuth, (0, authMiddleware_1.requireRole)('FACULTY'), facultyController_1.facultyController.saveSectionMarks);
router.get('/marks/sessionals', authMiddleware_1.requireAuth, facultyController_1.facultyController.getSessionalMarks);
router.get('/marks/class-matrix', authMiddleware_1.requireAuth, facultyController_1.facultyController.getClassMatrix);
exports.default = router;
