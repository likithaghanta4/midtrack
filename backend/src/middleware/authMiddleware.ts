import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

export interface AuthUser {
  id: string;
  username: string;
  role: 'SUPERADMIN' | 'FACULTY' | 'STUDENT';
  name: string;
  facultyProfile?: {
    id: string;
    facultyId: string;
    name: string;
    department: string | null;
  } | null;
  studentProfile?: {
    id: string;
    registerNumber: string;
    name: string;
    branch: string;
    section: string;
    academicYear: string;
    semester: number;
  } | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
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

    const effectiveRole = payload.role || (user.role as 'SUPERADMIN' | 'FACULTY' | 'STUDENT');

    let name = user.username;
    if (effectiveRole === 'SUPERADMIN') {
      name = user.facultyProfile?.name ? `${user.facultyProfile.name} (Super Admin)` : 'Super Administrator';
    } else if (effectiveRole === 'FACULTY') {
      name = user.facultyProfile?.name || user.username;
    } else if (effectiveRole === 'STUDENT') {
      name = user.studentProfile?.name || user.username;
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: effectiveRole,
      name,
      facultyProfile: user.facultyProfile,
      studentProfile: user.studentProfile,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

export const requireRole = (allowedRole: 'SUPERADMIN' | 'FACULTY' | 'STUDENT' | ('SUPERADMIN' | 'FACULTY' | 'STUDENT')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!allowed.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
      return;
    }

    next();
  };
};

export const requireSuperAdmin = requireRole('SUPERADMIN');

