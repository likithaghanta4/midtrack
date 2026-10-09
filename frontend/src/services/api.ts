import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to requests if available in storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('midtrack_jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('midtrack_jwt_token');
      localStorage.removeItem('midtrack_user');
    }
    return Promise.reject(error);
  }
);

export interface FacultyListItem {
  facultyId: string;
  name: string;
  department: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface SectionItem {
  id: string;
  sectionName: string;
  branch: string;
  academicYear: string;
  semester: number;
  studentCount?: number;
}

export interface SubjectItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  isLab?: boolean;
}

export interface ExamItem {
  id: string;
  examType: string;
  academicYear: string;
  semester: number;
}

export interface StudentMarkRow {
  sNo: number;
  studentId: string;
  registerNumber: string;
  name: string;
  markId: string | null;
  isLab?: boolean;
  descriptiveQ1OrQ2: number | string;
  descriptiveQ3OrQ4: number | string;
  descriptiveQ5OrQ6: number | string;
  descriptiveTotal: number;
  objectiveQ1: number | string;
  objectiveQ2: number | string;
  objectiveQ3: number | string;
  objectiveQ4: number | string;
  objectiveQ5: number | string;
  objectiveTotal: number;
  assignmentMarks: number | string;
  total: number;
  isSaved?: boolean;
}

export interface SessionalRecord {
  sNo: number;
  studentId: string;
  registerNumber: string;
  name: string;
  isLab?: boolean;
  labMark?: number | null;
  mid1: number | null;
  mid2: number | null;
  higherMid: number | null;
  lowerMid: number | null;
  sessionalTotal: number | null;
  status: 'PASSED' | 'FAILED' | 'NEEDS_IMPROVEMENT' | 'INCOMPLETE';
}

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    faculty: {
      name: string;
      department: string | null;
      facultyId: string;
    };
    academicYear: string;
    stats: {
      totalStudents: number;
      totalSections: number;
      totalSubjects: number;
      totalMarksEntered: number;
    };
    sections: SectionItem[];
  };
}

export interface QuestionBreakdown {
  total: number;
  descriptiveQ1OrQ2: number | null;
  descriptiveQ3OrQ4: number | null;
  descriptiveQ5OrQ6: number | null;
  descriptiveTotal: number;
  objectiveQ1: number | null;
  objectiveQ2: number | null;
  objectiveQ3: number | null;
  objectiveQ4: number | null;
  objectiveQ5: number | null;
  objectiveTotal: number;
  assignmentMarks: number;
}

export interface StudentSubjectReport {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  isLab?: boolean;
  labTotal?: number | null;
  mid1: QuestionBreakdown | null;
  mid2: QuestionBreakdown | null;
  higherMid: number | null;
  lowerMid: number | null;
  sessionalTotal: number | null;
  status: 'PASSED' | 'FAILED' | 'INCOMPLETE';
}

export interface StudentDashboardResponse {
  success: boolean;
  student: {
    id: string;
    name: string;
    registerNumber: string;
    branch: string;
    section: string;
    academicYear: string;
    semester: number;
  };
  stats: {
    totalSubjects: number;
    evaluatedSubjects: number;
    averageSessional: number;
    passedCount: number;
    bestSubject: {
      code: string;
      name: string;
      marks: number | null;
    } | null;
    mid1Conducted: boolean;
    mid2Conducted: boolean;
  };
  subjects: StudentSubjectReport[];
}

export const authApi = {
  getFacultyList: async (): Promise<{ success: boolean; count: number; faculty: FacultyListItem[] }> => {
    const res = await api.get('/auth/faculty');
    return res.data;
  },

  facultyLogin: async (facultyId: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/faculty/login', { facultyId, password });
    if (res.data.token && res.data.user) {
      localStorage.setItem('midtrack_jwt_token', res.data.token);
      localStorage.setItem('midtrack_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  studentLogin: async (registerNumber: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/student/login', { registerNumber, password });
    if (res.data.token && res.data.user) {
      localStorage.setItem('midtrack_jwt_token', res.data.token);
      localStorage.setItem('midtrack_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Stateless token removal
    } finally {
      localStorage.removeItem('midtrack_jwt_token');
      localStorage.removeItem('midtrack_user');
    }
  },
};

export interface SubjectScoreItem {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  isLab: boolean;
  mid1: number | null;
  mid2: number | null;
  score: number | null;
  isPassed: boolean;
}

export interface StudentClassMatrixRow {
  sNo: number;
  studentId: string;
  registerNumber: string;
  name: string;
  subjectScores: Record<string, SubjectScoreItem>;
  totalScore: number;
  maxMarks: number;
  avgPercentage: number;
  evaluatedCount: number;
  passCount: number;
  failCount: number;
  totalSubjects: number;
  statusText: string;
  statusBadge: string;
}

export interface SubjectClassStat {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  isLab: boolean;
  evaluatedStudents: number;
  average: number;
  highest: number;
  lowest: number;
  passCount: number;
  passPercentage: number;
}

export interface ClassMatrixResponse {
  success: boolean;
  section: SectionItem;
  semester: number;
  examMode: 'MID_1' | 'MID_2' | 'SESSIONAL';
  subjects: SubjectItem[];
  exams: {
    mid1: ExamItem | null;
    mid2: ExamItem | null;
    labInternal: ExamItem | null;
  };
  students: StudentClassMatrixRow[];
  subjectStats: SubjectClassStat[];
  overview: {
    totalStudents: number;
    evaluatedStudents: number;
    allClearCount: number;
    allClearPercentage: number;
    classAvgPercentage: number;
    topStudent: {
      name: string;
      registerNumber: string;
      totalScore: number;
      avgPercentage: number;
    };
  };
}

export const facultyApi = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const res = await api.get<DashboardStatsResponse>('/faculty/dashboard-stats');
    return res.data;
  },

  getSections: async (): Promise<{ success: boolean; sections: SectionItem[] }> => {
    const res = await api.get('/faculty/sections');
    return res.data;
  },

  getSubjects: async (branch?: string, semester?: number): Promise<{ success: boolean; subjects: SubjectItem[] }> => {
    const params: any = {};
    if (branch) params.branch = branch;
    if (semester) params.semester = semester;
    const res = await api.get('/faculty/subjects', { params });
    return res.data;
  },

  getExams: async (academicYear?: string, semester?: number): Promise<{ success: boolean; exams: ExamItem[] }> => {
    const params: any = {};
    if (academicYear) params.academicYear = academicYear;
    if (semester) params.semester = semester;
    const res = await api.get('/faculty/exams', { params });
    return res.data;
  },

  getSectionMarks: async (
    sectionId: string,
    subjectId: string,
    examId: string
  ): Promise<{
    success: boolean;
    section: SectionItem;
    subject: SubjectItem;
    exam: ExamItem;
    students: StudentMarkRow[];
  }> => {
    const res = await api.get('/faculty/marks', {
      params: { sectionId, subjectId, examId },
    });
    return res.data;
  },

  saveSectionMarks: async (
    payloadOrSectionId: { sectionId: string; subjectId: string; examId: string; marks: any[] } | string,
    subjectId?: string,
    examId?: string,
    marks?: any[]
  ): Promise<{ success: boolean; message: string; count: number }> => {
    const body = typeof payloadOrSectionId === 'object'
      ? payloadOrSectionId
      : { sectionId: payloadOrSectionId, subjectId, examId, marks };
    const res = await api.post('/faculty/marks/bulk', body);
    return res.data;
  },

  getSessionalMarks: async (
    sectionId: string,
    subjectId: string
  ): Promise<{
    success: boolean;
    section: SectionItem;
    subject: SubjectItem;
    sessionals: SessionalRecord[];
  }> => {
    const res = await api.get('/faculty/marks/sessionals', {
      params: { sectionId, subjectId },
    });
    return res.data;
  },

  getClassMatrix: async (
    sectionId: string,
    semester?: number,
    examMode?: 'MID_1' | 'MID_2' | 'SESSIONAL'
  ): Promise<ClassMatrixResponse> => {
    const params: any = { sectionId };
    if (semester) params.semester = semester;
    if (examMode) params.examMode = examMode;
    const res = await api.get<ClassMatrixResponse>('/faculty/marks/class-matrix', { params });
    return res.data;
  },
};

export const studentApi = {
  getDashboard: async (): Promise<StudentDashboardResponse> => {
    const res = await api.get<StudentDashboardResponse>('/student/dashboard');
    return res.data;
  },
};
