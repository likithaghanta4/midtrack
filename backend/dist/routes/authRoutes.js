"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public Authentication Routes
router.get('/faculty', authController_1.getFacultyList);
router.post('/faculty/login', authController_1.facultyLogin);
router.post('/student/login', authController_1.studentLogin);
router.post('/logout', authController_1.logout);
// Protected Authentication Route
router.get('/me', authMiddleware_1.requireAuth, authController_1.getMe);
exports.default = router;
