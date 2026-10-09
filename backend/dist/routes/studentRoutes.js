"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// GET /api/student/dashboard
router.get('/dashboard', authMiddleware_1.requireAuth, (0, authMiddleware_1.requireRole)('STUDENT'), studentController_1.getStudentDashboard);
exports.default = router;
