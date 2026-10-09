"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../config/prisma");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                facultyProfile: true,
                studentProfile: true,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        const name = user.role === 'FACULTY'
            ? (user.facultyProfile?.name || user.username)
            : (user.studentProfile?.name || user.username);
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            name,
            facultyProfile: user.facultyProfile,
            studentProfile: user.studentProfile,
        };
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.',
        });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (allowedRole) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        if (req.user.role !== allowedRole) {
            res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
