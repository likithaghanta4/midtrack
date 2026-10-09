"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.studentLogin = exports.facultyLogin = exports.getFacultyList = void 0;
const prisma_1 = require("../config/prisma");
const authValidators_1 = require("../validators/authValidators");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
/**
 * 1. GET /api/auth/faculty
 * Returns public/safe list of all 23 faculty members for the login dropdown
 */
const getFacultyList = async (_req, res) => {
    try {
        const faculty = await prisma_1.prisma.faculty.findMany({
            select: {
                facultyId: true,
                name: true,
                department: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json({
            success: true,
            count: faculty.length,
            faculty,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve faculty list.',
        });
    }
};
exports.getFacultyList = getFacultyList;
/**
 * 2. POST /api/auth/faculty/login
 * Authenticates faculty member using facultyId + password
 */
const facultyLogin = async (req, res) => {
    try {
        const parseResult = authValidators_1.facultyLoginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0]?.message || 'Invalid login request.',
            });
            return;
        }
        const { facultyId, password } = parseResult.data;
        // Find faculty record and linked user
        const faculty = await prisma_1.prisma.faculty.findUnique({
            where: { facultyId },
            include: { user: true },
        });
        if (!faculty || !faculty.user || faculty.user.role !== 'FACULTY') {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
            return;
        }
        // Verify bcrypt hash
        const isPasswordValid = (0, password_1.verifyPassword)(password, faculty.user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
            return;
        }
        // Sign JWT Token
        const token = (0, jwt_1.signToken)({
            userId: faculty.user.id,
            username: faculty.user.username,
            role: 'FACULTY',
        });
        // Return safe user payload (No hashes or secrets)
        res.status(200).json({
            success: true,
            message: 'Faculty authentication successful.',
            token,
            user: {
                id: faculty.user.id,
                username: faculty.user.username,
                role: 'FACULTY',
                name: faculty.name,
                facultyId: faculty.facultyId,
                department: faculty.department,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred during authentication.',
        });
    }
};
exports.facultyLogin = facultyLogin;
/**
 * 3. POST /api/auth/student/login
 * Authenticates student using registerNumber + password
 */
const studentLogin = async (req, res) => {
    try {
        const parseResult = authValidators_1.studentLoginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0]?.message || 'Invalid login request.',
            });
            return;
        }
        const { registerNumber, password } = parseResult.data;
        const cleanRegNo = registerNumber.trim().toUpperCase();
        // Find student record and linked user
        const student = await prisma_1.prisma.student.findFirst({
            where: {
                registerNumber: cleanRegNo,
            },
            include: { user: true },
        });
        if (!student || !student.user || student.user.role !== 'STUDENT') {
            res.status(401).json({
                success: false,
                message: 'Invalid registration number or password.',
            });
            return;
        }
        // Verify: accepts their own Registration Number (case-insensitive) OR existing password
        const isRegisterNumberMatch = password.trim().toUpperCase() === cleanRegNo;
        const isPasswordValid = isRegisterNumberMatch || (0, password_1.verifyPassword)(password, student.user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid registration number or password.',
            });
            return;
        }
        // Sign JWT Token
        const token = (0, jwt_1.signToken)({
            userId: student.user.id,
            username: student.user.username,
            role: 'STUDENT',
        });
        // Return safe user payload (No hashes or secrets)
        res.status(200).json({
            success: true,
            message: 'Student authentication successful.',
            token,
            user: {
                id: student.user.id,
                username: student.user.username,
                role: 'STUDENT',
                name: student.name,
                registerNumber: student.registerNumber,
                branch: student.branch,
                section: student.section,
                academicYear: student.academicYear,
                semester: student.semester,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred during authentication.',
        });
    }
};
exports.studentLogin = studentLogin;
/**
 * 4. GET /api/auth/me
 * Returns the currently authenticated user's profile
 */
const getMe = async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
        return;
    }
    res.status(200).json({
        success: true,
        user: req.user,
    });
};
exports.getMe = getMe;
/**
 * 5. POST /api/auth/logout
 * Stateless client-side token discard acknowledgement
 */
const logout = async (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
    });
};
exports.logout = logout;
