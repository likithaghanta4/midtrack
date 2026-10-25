export type UserRole = 'SUPERADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  facultyId?: string;
  department?: string | null;
  registerNumber?: string;
  branch?: string;
  section?: string;
  semester?: number;
  academicYear?: string;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  system: {
    name: string;
    version: string;
    college: string;
    environment: string;
  };
}
