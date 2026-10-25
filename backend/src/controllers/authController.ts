import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { facultyLoginSchema, studentLoginSchema } from '../validators/authValidators';
import { verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { config } from '../config';

/**
 * 1. GET /api/auth/faculty
 * Returns public/safe list of all 23 faculty members for the login dropdown
 */
export const getFacultyList = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await prisma.faculty.findMany({
      select: {
        id: true,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve faculty list.',
    });
  }
};

/**
 * 2. POST /api/auth/faculty/login
 * Authenticates faculty member using facultyId + password.
 * Securely recognizes the dedicated Super Admin credential (initially superadmin@123)
 * without requiring any separate login page.
 */
export const facultyLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = facultyLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid login request.',
      });
      return;
    }

    const { facultyId, password } = parseResult.data;

    // 1. Master credentials definitions
    const superAdminPassword = config.superAdminInitialPassword || 'superadmin@123';
    const isMasterSuperAdmin = password.trim() === superAdminPassword.trim();
    const isMasterFacultyPass = password.trim() === 'admin@123';

    // 2. Fetch the faculty member
    const faculty = await prisma.faculty.findUnique({
      where: { facultyId },
      include: { user: true },
    });

    if (!faculty || !faculty.user) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
      return;
    }

    const dept = (faculty.department || '').toUpperCase().trim();
    const isCsdOrCsit = dept.includes('CSD') || dept.includes('CSIT');

    // 3. Super Admin Login via superadmin@123 (restricted to CSD and CSIT faculty only)
    if (isMasterSuperAdmin) {
      if (!isCsdOrCsit) {
        res.status(403).json({
          success: false,
          message: 'Access Denied: Super Admin privileges are reserved for CSD and CSIT faculty members only.',
        });
        return;
      }

      const token = signToken({
        userId: faculty.user.id,
        username: faculty.user.username,
        role: 'SUPERADMIN',
      });

      res.status(200).json({
        success: true,
        message: 'Super Admin authentication successful.',
        token,
        user: {
          id: faculty.user.id,
          username: faculty.user.username,
          role: 'SUPERADMIN',
          name: `${faculty.name} (Super Admin)`,
          facultyId: faculty.facultyId,
          department: faculty.department,
        },
      });
      return;
    }

    // 4. Faculty Dashboard Login (via admin@123 or individual password)
    const isPasswordValid = isMasterFacultyPass || verifyPassword(password, faculty.user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
      return;
    }

    // Always issue FACULTY role token when logging in with admin@123
    const token = signToken({
      userId: faculty.user.id,
      username: faculty.user.username,
      role: 'FACULTY',
    });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
    });
  }
};

/**
 * 3. POST /api/auth/student/login
 * Authenticates student using registerNumber + password
 */
export const studentLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = studentLoginSchema.safeParse(req.body);
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
    const student = await prisma.student.findFirst({
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
    const isPasswordValid = isRegisterNumberMatch || verifyPassword(password, student.user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid registration number or password.',
      });
      return;
    }

    // Sign JWT Token
    const token = signToken({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
    });
  }
};

/**
 * 4. GET /api/auth/me
 * Returns the currently authenticated user's profile
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

/**
 * 5. POST /api/auth/logout
 * Stateless client-side token discard acknowledgement
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
