import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  CalendarRange,
  Layers,
  BookOpen,
  UserCheck,
  Users,
  GraduationCap,
  Printer,
  LogOut,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Download,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Filter,
  Calculator,
} from 'lucide-react';
import {
  superAdminApi,
  authApi,
  SuperAdminDashboardStats,
  AcademicYearItem,
  SemesterItem,
  SectionItem,
  SubjectItem,
  FacultyAllocationItem,
  FacultyListItem,
  MarksOverviewRecord,
  ExamItem,
  facultyApi,
} from '../services/api';
import { User as AuthUserType } from '../types';
import { isLabCourse } from '../utils/r23Curriculum';

interface SuperAdminDashboardProps {
  user: AuthUserType;
  onLogout: () => void;
}

type TabType =
  | 'OVERVIEW'
  | 'ACADEMIC'
  | 'SECTIONS'
  | 'SUBJECTS'
  | 'ALLOCATIONS'
  | 'WORKLOAD'
  | 'MARKS_OVERVIEW'
  | 'REPORTS';

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [loading, setLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<SuperAdminDashboardStats | null>(null);

  // Notification message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Master Data
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [allocations, setAllocations] = useState<FacultyAllocationItem[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyListItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);

  // 1. Form States
  // Allocation Form State
  const [allocYear, setAllocYear] = useState<string>('2026-2027');
  const [allocSem, setAllocSem] = useState<number>(3);
  const [allocBranch, setAllocBranch] = useState<string>('CSIT');
  const [allocSectionId, setAllocSectionId] = useState<string>('');
  const [allocSubjectId, setAllocSubjectId] = useState<string>('');
  const [allocFacultyId, setAllocFacultyId] = useState<string>('');
  const [allocSaving, setAllocSaving] = useState<boolean>(false);

  // New Academic Year Form
  const [newYearInput, setNewYearInput] = useState<string>('');
  const [newYearIsCurrent, setNewYearIsCurrent] = useState<boolean>(false);

  // New Section Form
  const [newSecName, setNewSecName] = useState<string>('');
  const [newSecBranch, setNewSecBranch] = useState<string>('CSIT');
  const [newSecYear, setNewSecYear] = useState<string>('2026-2027');
  const [newSecSem, setNewSecSem] = useState<number>(3);

  // New Subject Form
  const [newSubCode, setNewSubCode] = useState<string>('');
  const [newSubName, setNewSubName] = useState<string>('');
  const [newSubBranch, setNewSubBranch] = useState<string>('CSIT');
  const [newSubSem, setNewSubSem] = useState<number>(3);

  // Subject Filter States
  const [subjectSemFilter, setSubjectSemFilter] = useState<number | 'ALL'>('ALL');
  const [subjectBranchFilter, setSubjectBranchFilter] = useState<string>('ALL');
  const [subjectSearch, setSubjectSearch] = useState<string>('');

  // Marks Overview State
  const [overviewYear, setOverviewYear] = useState<string>('2026-2027');
  const [overviewSem, setOverviewSem] = useState<number>(3);
  const [overviewBranch, setOverviewBranch] = useState<string>('CSIT');
  const [overviewSectionId, setOverviewSectionId] = useState<string>('');
  const [overviewSubjectId, setOverviewSubjectId] = useState<string>('');
  const [overviewExamId, setOverviewExamId] = useState<string>('');
  const [overviewSearch, setOverviewSearch] = useState<string>('');
  const [overviewData, setOverviewData] = useState<MarksOverviewRecord[]>([]);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);
  const [overviewMode, setOverviewMode] = useState<'DETAILS' | 'SESSIONAL'>('DETAILS');

  // Workload Search Filter
  const [workloadSearch, setWorkloadSearch] = useState<string>('');

  // Initial Data Load
  const refreshAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, yearsRes, semsRes, secsRes, subsRes, allocsRes, facRes] = await Promise.all([
        superAdminApi.getDashboardStats(),
        superAdminApi.getAcademicYears(),
        superAdminApi.getSemesters(),
        superAdminApi.getSections(),
        superAdminApi.getSubjects(),
        superAdminApi.getAllocations(),
        authApi.getFacultyList(),
      ]);

      setStatsData(statsRes.data);
      setAcademicYears(yearsRes.academicYears);
      setSemesters(semsRes.semesters);
      setSections(secsRes.sections);
      setSubjects(subsRes.subjects);
      setAllocations(allocsRes.allocations);
      setFacultyList(facRes.faculty);

      if (yearsRes.academicYears.length > 0) {
        const currentYear = yearsRes.academicYears.find((y) => y.isCurrent)?.year || yearsRes.academicYears[0].year;
        setAllocYear(currentYear);
        setNewSecYear(currentYear);
        setOverviewYear(currentYear);
      }
    } catch (err: any) {
      console.error('Failed to load Super Admin data:', err);
      setStatusMsg({ type: 'error', text: 'Failed to load system data from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Reset overviewSubjectId when branch or sem changes
  useEffect(() => {
    setOverviewSubjectId('');
  }, [overviewBranch, overviewSem]);

  // Update exams when overview section/sem changes
  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await facultyApi.getExams(overviewYear, overviewSem);
        setExams(res.exams);
        // Do not force overviewExamId to the first exam unless invalid
        setOverviewExamId((prev) => {
          if (!prev || prev === 'SESSIONAL') return prev;
          const stillValid = res.exams.some((e) => e.id === prev);
          return stillValid ? prev : '';
        });
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    };
    loadExams();
  }, [overviewYear, overviewSem]);

  // Load Marks Overview
  const loadMarksOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await superAdminApi.getMarksOverview({
        academicYear: overviewYear,
        semester: overviewSem,
        branch: overviewBranch,
        sectionId: overviewSectionId || undefined,
        subjectId: overviewSubjectId || undefined,
        examId: overviewExamId || undefined,
        search: overviewSearch || undefined,
      });
      setOverviewData(res.records);
    } catch (err) {
      console.error('Failed to load marks overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'MARKS_OVERVIEW') {
      loadMarksOverview();
    }
  }, [activeTab, overviewYear, overviewSem, overviewBranch, overviewSectionId, overviewSubjectId, overviewExamId]);

  // Helper for Marks Overview Selected Subject
  const selectedOverviewSubject = subjects.find((s) => s.id === overviewSubjectId);
  const isOverviewSubjectLab = selectedOverviewSubject
    ? Boolean(selectedOverviewSubject.isLab || isLabCourse(selectedOverviewSubject.subjectCode, selectedOverviewSubject.subjectName))
    : false;

  // Helper filtered lists for Allocation Form
  const eligibleSectionsForAlloc = sections.filter(
    (s) => s.branch === allocBranch && s.semester === allocSem
  );
  const eligibleSubjectsForAlloc = subjects.filter(
    (s) => s.branch === allocBranch && s.semester === allocSem
  );

  // Set default section & subject when branch/sem changes
  useEffect(() => {
    if (eligibleSectionsForAlloc.length > 0) {
      setAllocSectionId(eligibleSectionsForAlloc[0].id);
    } else {
      setAllocSectionId('');
    }
    if (eligibleSubjectsForAlloc.length > 0) {
      setAllocSubjectId(eligibleSubjectsForAlloc[0].id);
    } else {
      setAllocSubjectId('');
    }
  }, [allocBranch, allocSem, sections, subjects]);

  // Set default faculty for allocation when facultyList loads
  useEffect(() => {
    if (facultyList.length > 0 && !allocFacultyId) {
      setAllocFacultyId(facultyList[0].id || facultyList[0].facultyId);
    }
  }, [facultyList, allocFacultyId]);

  // Handle Save Allocation
  const handleSaveAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocSectionId || !allocSubjectId || !allocFacultyId) {
      setStatusMsg({ type: 'error', text: 'Please select a Section, Subject, and Faculty member.' });
      return;
    }

    try {
      setAllocSaving(true);
      const res = await superAdminApi.createAllocation({
        academicYear: allocYear,
        semesterNumber: allocSem,
        branch: allocBranch,
        sectionId: allocSectionId,
        subjectId: allocSubjectId,
        facultyId: allocFacultyId,
        isPrimary: true,
      });
      setStatusMsg({ type: 'success', text: res.message });
      const allocsRes = await superAdminApi.getAllocations();
      setAllocations(allocsRes.allocations);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save allocation.' });
    } finally {
      setAllocSaving(false);
    }
  };

  // Handle Toggle Allocation
  const handleToggleAllocation = async (id: string) => {
    try {
      const res = await superAdminApi.toggleAllocationStatus(id);
      setStatusMsg({ type: 'success', text: res.message });
      const allocsRes = await superAdminApi.getAllocations();
      setAllocations(allocsRes.allocations);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update allocation status.' });
    }
  };

  // Handle Delete Allocation
  const handleDeleteAllocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this faculty allocation?')) return;
    try {
      const res = await superAdminApi.deleteAllocation(id);
      setStatusMsg({ type: 'success', text: res.message });
      const allocsRes = await superAdminApi.getAllocations();
      setAllocations(allocsRes.allocations);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to remove allocation.' });
    }
  };

  // Handle Create Academic Year
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    try {
      const res = await superAdminApi.createAcademicYear(newYearInput, newYearIsCurrent);
      setStatusMsg({ type: 'success', text: res.message });
      setNewYearInput('');
      refreshAllData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create academic year.' });
    }
  };

  // Handle Set Active Year
  const handleSetActiveYear = async (id: string) => {
    try {
      const res = await superAdminApi.setCurrentAcademicYear(id);
      setStatusMsg({ type: 'success', text: res.message });
      refreshAllData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to set active year.' });
    }
  };

  // Handle Toggle Semester
  const handleToggleSemester = async (id: string) => {
    try {
      const res = await superAdminApi.toggleSemesterActive(id);
      setStatusMsg({ type: 'success', text: res.message });
      const semsRes = await superAdminApi.getSemesters();
      setSemesters(semsRes.semesters);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update semester status.' });
    }
  };

  // Handle Create Section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName.trim()) return;
    try {
      const res = await superAdminApi.createSection({
        sectionName: newSecName,
        branch: newSecBranch,
        academicYear: newSecYear,
        semester: Number(newSecSem),
      });
      setStatusMsg({ type: 'success', text: res.message });
      setNewSecName('');
      const secsRes = await superAdminApi.getSections();
      setSections(secsRes.sections);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create section.' });
    }
  };

  // Handle Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !newSubName.trim()) return;
    try {
      const res = await superAdminApi.createSubject({
        subjectCode: newSubCode,
        subjectName: newSubName,
        branch: newSubBranch,
        semester: Number(newSubSem),
      });
      setStatusMsg({ type: 'success', text: res.message });
      setNewSubCode('');
      setNewSubName('');
      const subsRes = await superAdminApi.getSubjects();
      setSubjects(subsRes.subjects);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create subject.' });
    }
  };

  // Handle Delete Subject
  const handleDeleteSubject = async (id: string, code: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete curriculum subject "${code} - ${name}"?`)) {
      return;
    }
    try {
      const res = await superAdminApi.deleteSubject(id);
      setStatusMsg({ type: 'success', text: res.message || `Subject ${code} deleted successfully.` });
      const subsRes = await superAdminApi.getSubjects();
      setSubjects(subsRes.subjects);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete subject.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  // CSV Export (Supports both Detailed Component Marks and Sessional 80:20 Statements)
  const exportMarksToCSV = () => {
    if (overviewData.length === 0) return;

    const isSessional = overviewMode === 'SESSIONAL' || overviewExamId === 'SESSIONAL';

    if (isSessional) {
      const headers = [
        'S.No',
        'Register Number',
        'Student Name',
        'Branch',
        'Section',
        'Semester',
        'Academic Year',
        'Subject Code',
        'Subject Name',
        'Course Type',
        'Mid-1 (30)',
        'Mid-2 (30)',
        '80% Best Mid',
        '20% Other Mid',
        'Sessional Total (30)',
        'Status',
      ];
      const rows: string[][] = [];
      let count = 1;

      overviewData.forEach((student) => {
        const sessionals = (student.sessionals || []).filter(
          (s) => !overviewSubjectId || s.subjectId === overviewSubjectId
        );
        if (sessionals.length === 0) {
          rows.push([
            String(count++),
            student.registerNumber,
            `"${student.name}"`,
            student.branch,
            student.section,
            String(student.semester),
            student.academicYear,
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
            'PENDING',
          ]);
        } else {
          sessionals.forEach((s) => {
            rows.push([
              String(count++),
              student.registerNumber,
              `"${student.name}"`,
              student.branch,
              student.section,
              String(student.semester),
              student.academicYear,
              s.subjectCode || '-',
              `"${s.subjectName || '-'}"`,
              s.isLab ? 'Lab' : 'Theory',
              s.isLab ? '-' : String(s.mid1Total ?? '-'),
              s.isLab ? '-' : String(s.mid2Total ?? '-'),
              s.isLab ? '-' : String(s.bestWeighted ?? '-'),
              s.isLab ? '-' : String(s.otherWeighted ?? '-'),
              String(s.sessionalTotal ?? '-'),
              s.status || 'PENDING',
            ]);
          });
        }
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SRKR_Sessional_Marks_${overviewBranch}_Sem${overviewSem}_${overviewYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const headers = ['S.No', 'Register Number', 'Student Name', 'Branch', 'Section', 'Semester', 'Academic Year', 'Subject Code', 'Subject Name', 'Exam', 'Descriptive', 'Objective', 'Assignment', 'Mid Total'];
    const rows: string[][] = [];

    let count = 1;
    overviewData.forEach((student) => {
      const marksToShow = student.marks.filter(
        (m) => !overviewSubjectId || m.subjectId === overviewSubjectId
      );
      if (marksToShow.length === 0) {
        rows.push([
          String(count++),
          student.registerNumber,
          `"${student.name}"`,
          student.branch,
          student.section,
          String(student.semester),
          student.academicYear,
          '-',
          '-',
          '-',
          '0',
          '0',
          '0',
          '0',
        ]);
      } else {
        marksToShow.forEach((m) => {
          const isLab = m.exam?.examType === 'LAB_INTERNAL' || m.subject?.isLab || isLabCourse(m.subject?.subjectCode, m.subject?.subjectName);
          rows.push([
            String(count++),
            student.registerNumber,
            `"${student.name}"`,
            student.branch,
            student.section,
            String(student.semester),
            student.academicYear,
            m.subject?.subjectCode || '-',
            `"${m.subject?.subjectName || '-'}"`,
            isLab ? 'LAB_INTERNAL (Single Exam)' : (m.exam?.examType || '-'),
            isLab ? '-' : String(m.descriptiveTotal || 0),
            isLab ? '-' : String(m.objectiveTotal || 0),
            isLab ? '-' : String(m.assignmentMarks || 0),
            String(m.total || 0),
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MID_TRACK_Marks_${overviewBranch}_Sem${overviewSem}_${overviewYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F0F6FD] text-slate-800 flex flex-col font-sans">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* College Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0A2566] to-[#146EF5] flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-md shadow-blue-500/20">
                ST
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#0A2566] tracking-tight">
                    MID TRACK
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                    <Shield className="w-3 h-3 text-amber-500 fill-amber-500" />
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 hidden sm:block">
                  S.R.K.R. Engineering College (Autonomous) &bull; China-Amiram, Bhimavaram
                </p>
              </div>
            </div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs sm:text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-[11px] font-medium text-slate-500">Academic Administrator &bull; {user.department || 'CSD / CSIT'}</p>
              </div>
              <button
                id="btn-superadmin-logout"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 text-xs sm:text-sm font-bold transition cursor-pointer"
                title="Logout from Super Admin Session"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2 -mb-px no-scrollbar border-t border-slate-100">
            <button
              id="tab-superadmin-overview"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[2]" />
              Overview
            </button>
            <button
              id="tab-superadmin-academic"
              onClick={() => setActiveTab('ACADEMIC')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'ACADEMIC'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <CalendarRange className="w-4 h-4 stroke-[2]" />
              Academic Years & Semesters
            </button>
            <button
              id="tab-superadmin-sections"
              onClick={() => setActiveTab('BRANCH_SECTION' as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === ('BRANCH_SECTION' as any) || activeTab === 'SECTIONS'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Layers className="w-4 h-4 stroke-[2]" />
              Sections
            </button>
            <button
              id="tab-superadmin-subjects"
              onClick={() => setActiveTab('SUBJECTS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'SUBJECTS'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <BookOpen className="w-4 h-4 stroke-[2]" />
              Subjects
            </button>
            <button
              id="tab-superadmin-allocations"
              onClick={() => setActiveTab('ALLOCATIONS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'ALLOCATIONS'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <UserCheck className="w-4 h-4 stroke-[2]" />
              Faculty Allocations
            </button>
            <button
              id="tab-superadmin-workload"
              onClick={() => setActiveTab('WORKLOAD')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'WORKLOAD'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Users className="w-4 h-4 stroke-[2]" />
              Faculty Workload
            </button>
            <button
              id="tab-superadmin-marks-overview"
              onClick={() => setActiveTab('MARKS_OVERVIEW')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'MARKS_OVERVIEW'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <GraduationCap className="w-4 h-4 stroke-[2]" />
              Marks Overview
            </button>
            <button
              id="tab-superadmin-reports"
              onClick={() => setActiveTab('REPORTS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'REPORTS'
                  ? 'bg-[#146EF5] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Printer className="w-4 h-4 stroke-[2]" />
              Print Reports
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Global Feedback Banner */}
      {statusMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs font-bold underline ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#146EF5]" />
            <p className="text-sm font-bold text-[#0A2566]">Loading Super Admin Control Center...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* MODULE 1: DASHBOARD OVERVIEW */}
            {/* ========================================================================= */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* Active Term Notification */}
                <div className="bg-gradient-to-r from-[#0A2566] via-[#103E99] to-[#146EF5] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md mb-2">
                        CURRENT ACTIVE CYCLE
                      </span>
                      <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                        Academic Year {statsData?.activeYear || '2026-2027'}
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-100 mt-1">
                        Active Running Semesters:{' '}
                        <span className="font-bold text-white">
                          Semesters {statsData?.activeSemesters.join(', ') || '3, 5, 7'} (Odd Semester Period)
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('ALLOCATIONS')}
                        className="px-4 py-2.5 rounded-xl bg-white text-[#0A2566] font-bold text-xs sm:text-sm hover:bg-blue-50 transition shadow-sm cursor-pointer"
                      >
                        Allocate Faculty
                      </button>
                      <button
                        onClick={() => setActiveTab('MARKS_OVERVIEW')}
                        className="px-4 py-2.5 rounded-xl bg-blue-500/30 text-white border border-white/30 font-bold text-xs sm:text-sm hover:bg-blue-500/40 transition cursor-pointer"
                      >
                        View All Marks
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6 Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
                    <p className="text-2xl font-black text-[#0A2566] mt-1">{statsData?.stats.totalStudents || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Enrolled</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Faculty</p>
                    <p className="text-2xl font-black text-[#0A2566] mt-1">{statsData?.stats.totalFaculty || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Active Members</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class Sections</p>
                    <p className="text-2xl font-black text-[#0A2566] mt-1">{statsData?.stats.totalSections || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">CSD & CSIT</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subjects</p>
                    <p className="text-2xl font-black text-[#0A2566] mt-1">{statsData?.stats.totalSubjects || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">R23 Curriculum</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allocations</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{statsData?.stats.totalAllocations || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Assigned Courses</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marks Entries</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{statsData?.stats.totalMarks || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Question-wise Records</p>
                  </div>
                </div>

                {/* Department Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statsData?.branchStats.map((b) => (
                    <div key={b.branch} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#146EF5]" />
                          <h3 className="font-extrabold text-slate-800 text-base">
                            Department of {b.branch === 'CSIT' ? 'Computer Science & Information Tech (CSIT)' : 'Computer Science & Design (CSD)'}
                          </h3>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-[#146EF5]">
                          {b.branch}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                        <div className="p-3 rounded-2xl bg-slate-50">
                          <p className="text-xs font-medium text-slate-500">Students</p>
                          <p className="text-lg font-bold text-slate-800">{b.studentCount}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50">
                          <p className="text-xs font-medium text-slate-500">Sections</p>
                          <p className="text-lg font-bold text-slate-800">{b.sectionCount}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50">
                          <p className="text-xs font-medium text-slate-500">Allocated</p>
                          <p className="text-lg font-bold text-emerald-600">{b.allocationCount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 2: ACADEMIC YEARS & SEMESTERS */}
            {/* ========================================================================= */}
            {activeTab === 'ACADEMIC' && (
              <div className="space-y-6">
                {/* Create Academic Year Form */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                  <h3 className="text-base font-extrabold text-[#0A2566] mb-3 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#146EF5]" /> Create New Academic Year
                  </h3>
                  <form onSubmit={handleCreateYear} className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="e.g. 2026-2027"
                      value={newYearInput}
                      onChange={(e) => setNewYearInput(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-[#146EF5]"
                    />
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newYearIsCurrent}
                        onChange={(e) => setNewYearIsCurrent(e.target.checked)}
                        className="rounded text-[#146EF5]"
                      />
                      Set as Currently Active Year
                    </label>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-sm transition cursor-pointer"
                    >
                      Save Academic Year
                    </button>
                  </form>
                </div>

                {/* Academic Years List */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 text-base">Academic Years</h3>
                    <span className="text-xs font-bold text-slate-500">{academicYears.length} Configured</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {academicYears.map((ay) => (
                      <div key={ay.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/70 transition">
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${ay.isCurrent ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`} />
                          <div>
                            <p className="font-bold text-slate-800 text-base">{ay.year}</p>
                            <p className="text-xs text-slate-500">{ay.semesters?.length || 8} Semesters Configured</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ay.isCurrent ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active Academic Year
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetActiveYear(ay.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              Set as Active
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semesters Toggle Control */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Semester Lifecycle & Activation</h3>
                      <p className="text-xs text-slate-500">Toggle active semesters to switch between Odd and Even college cycles without deleting historical marks.</p>
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {semesters.map((sem) => (
                      <div
                        key={sem.id}
                        className={`p-4 rounded-2xl border transition ${
                          sem.isActive
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-[#0A2566]">Sem {sem.semesterNumber}</span>
                          <button
                            onClick={() => handleToggleSemester(sem.id)}
                            className="cursor-pointer text-slate-700 hover:text-[#146EF5]"
                          >
                            {sem.isActive ? (
                              <ToggleRight className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-snug">{sem.name}</p>
                        <span
                          className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sem.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {sem.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 3: SECTIONS MANAGEMENT */}
            {/* ========================================================================= */}
            {(activeTab === 'SECTIONS' || (activeTab as any) === 'BRANCH_SECTION') && (
              <div className="space-y-6">
                {/* Create Section Form */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                  <h3 className="text-base font-extrabold text-[#0A2566] mb-3 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#146EF5]" /> Add New Section
                  </h3>
                  <form onSubmit={handleCreateSection} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <input
                      type="text"
                      placeholder="Section Name (e.g. CSIT-A, CSD)"
                      value={newSecName}
                      onChange={(e) => setNewSecName(e.target.value)}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5]"
                    />
                    <select
                      value={newSecBranch}
                      onChange={(e) => setNewSecBranch(e.target.value)}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5] cursor-pointer"
                    >
                      <option value="CSIT">CSIT</option>
                      <option value="CSD">CSD</option>
                    </select>
                    <select
                      value={newSecSem}
                      onChange={(e) => setNewSecSem(Number(e.target.value))}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5] cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Academic Year (2026-2027)"
                      value={newSecYear}
                      onChange={(e) => setNewSecYear(e.target.value)}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-2xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                    >
                      Create Section
                    </button>
                  </form>
                </div>

                {/* Sections List */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 text-base">Class Sections in Database</h3>
                    <span className="text-xs font-bold text-slate-500">{sections.length} Sections</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {sections.map((sec) => (
                      <div key={sec.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#146EF5] font-black flex items-center justify-center text-sm">
                            {sec.branch}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm sm:text-base">
                              Section {sec.sectionName} &bull; Sem {sec.semester} ({sec.branch})
                            </p>
                            <p className="text-xs text-slate-500">
                              Academic Year: {sec.academicYear} &bull; Students: <span className="font-bold text-slate-700">{sec.studentCount ?? 0}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                          Sem {sec.semester}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 4: SUBJECTS MANAGEMENT */}
            {/* ========================================================================= */}
            {activeTab === 'SUBJECTS' && (
              <div className="space-y-6">
                {/* Create Subject Form */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                  <h3 className="text-base font-extrabold text-[#0A2566] mb-3 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#146EF5]" /> Add Curriculum Subject
                  </h3>
                  <form onSubmit={handleCreateSubject} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <input
                      type="text"
                      placeholder="Subject Code (e.g. B23CS3101)"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5]"
                    />
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5]"
                    />
                    <select
                      value={newSubBranch}
                      onChange={(e) => setNewSubBranch(e.target.value)}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5] cursor-pointer"
                    >
                      <option value="CSIT">CSIT</option>
                      <option value="CSD">CSD</option>
                    </select>
                    <select
                      value={newSubSem}
                      onChange={(e) => setNewSubSem(Number(e.target.value))}
                      className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#146EF5] cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-2xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                    >
                      Add Subject
                    </button>
                  </form>
                </div>

                {/* Subjects Table */}
                {(() => {
                  const filteredSubjects = subjects.filter((s) => {
                    if (subjectSemFilter !== 'ALL' && s.semester !== subjectSemFilter) return false;
                    if (subjectBranchFilter !== 'ALL' && s.branch !== subjectBranchFilter) return false;
                    if (subjectSearch.trim()) {
                      const q = subjectSearch.toLowerCase().trim();
                      return s.subjectCode.toLowerCase().includes(q) || s.subjectName.toLowerCase().includes(q);
                    }
                    return true;
                  });

                  return (
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base">Curriculum Subjects</h3>
                          <p className="text-xs text-slate-500">Manage courses, enter upcoming semester subjects, and allocate teaching faculty.</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 self-start md:self-auto bg-slate-100 px-3 py-1 rounded-full">
                          Showing {filteredSubjects.length} of {subjects.length} Subjects
                        </span>
                      </div>

                      {/* Filter Toolbar */}
                      <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Filter by Semester</label>
                          <select
                            value={subjectSemFilter}
                            onChange={(e) => setSubjectSemFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold cursor-pointer"
                          >
                            <option value="ALL">All Semesters (1 to 8)</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <option key={s} value={s}>
                                Semester {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Filter by Branch</label>
                          <select
                            value={subjectBranchFilter}
                            onChange={(e) => setSubjectBranchFilter(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold cursor-pointer"
                          >
                            <option value="ALL">All Branches (CSD & CSIT)</option>
                            <option value="CSIT">CSIT</option>
                            <option value="CSD">CSD</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Subject</label>
                          <input
                            type="text"
                            placeholder="Search code or subject title..."
                            value={subjectSearch}
                            onChange={(e) => setSubjectSearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#146EF5]"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <tr>
                              <th className="py-3 px-4">Subject Code</th>
                              <th className="py-3 px-4">Subject Name</th>
                              <th className="py-3 px-4">Branch</th>
                              <th className="py-3 px-4">Semester</th>
                              <th className="py-3 px-4">Course Type</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredSubjects.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                                  No curriculum subjects match the selected filters.
                                </td>
                              </tr>
                            ) : (
                              filteredSubjects.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                                  <td className="py-3 px-4 font-bold text-[#0A2566]">{sub.subjectCode}</td>
                                  <td className="py-3 px-4 text-slate-800">{sub.subjectName}</td>
                                  <td className="py-3 px-4">{sub.branch}</td>
                                  <td className="py-3 px-4">Semester {sub.semester}</td>
                                  <td className="py-3 px-4">
                                    {sub.isLab ? (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Lab Course
                                      </span>
                                    ) : sub.isOpenElective ? (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        Open Elective
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                        Theory
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      onClick={() => handleDeleteSubject(sub.id, sub.subjectCode, sub.subjectName)}
                                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                                      title={`Delete ${sub.subjectCode}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 5: FACULTY ALLOCATIONS (The 7-Step Workflow) */}
            {/* ========================================================================= */}
            {activeTab === 'ALLOCATIONS' && (
              <div className="space-y-6">
                {/* 7-Step Allocation Card */}
                <div className="bg-gradient-to-br from-white to-blue-50/40 p-6 rounded-3xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="w-5 h-5 text-[#146EF5]" />
                    <h3 className="text-base font-extrabold text-[#0A2566]">
                      Semester-Wise Faculty Course Allocation Wizard
                    </h3>
                  </div>

                  <form onSubmit={handleSaveAllocation} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {/* Step 1: Academic Year */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          1. Academic Year
                        </label>
                        <select
                          value={allocYear}
                          onChange={(e) => setAllocYear(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                        >
                          {academicYears.map((ay) => (
                            <option key={ay.id} value={ay.year}>
                              {ay.year} {ay.isCurrent ? '(Active)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: Semester */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          2. Semester
                        </label>
                        <select
                          value={allocSem}
                          onChange={(e) => setAllocSem(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 3: Branch */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          3. Branch
                        </label>
                        <select
                          value={allocBranch}
                          onChange={(e) => setAllocBranch(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                        >
                          <option value="CSIT">CSIT</option>
                          <option value="CSD">CSD</option>
                        </select>
                      </div>

                      {/* Step 4: Section */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          4. Section
                        </label>
                        <select
                          value={allocSectionId}
                          onChange={(e) => setAllocSectionId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                        >
                          {eligibleSectionsForAlloc.length === 0 ? (
                            <option value="">No sections found</option>
                          ) : (
                            eligibleSectionsForAlloc.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                Section {sec.sectionName}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Step 5: Subject */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          5. Subject Offered
                        </label>
                        <select
                          value={allocSubjectId}
                          onChange={(e) => setAllocSubjectId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                        >
                          {eligibleSubjectsForAlloc.length === 0 ? (
                            <option value="">No subjects found</option>
                          ) : (
                            eligibleSubjectsForAlloc.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                [{sub.subjectCode}] {sub.subjectName}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Step 6: Faculty */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                          6. Faculty Member
                        </label>
                        <select
                          value={allocFacultyId}
                          onChange={(e) => setAllocFacultyId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                        >
                          <option value="">Select Faculty...</option>
                          {facultyList.map((fac) => (
                            <option key={fac.id || fac.facultyId} value={fac.id || fac.facultyId}>
                              {fac.name} {fac.department ? `(${fac.department})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={allocSaving}
                        className="px-6 py-2.5 rounded-2xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60"
                      >
                        {allocSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Validating & Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Assign Faculty Allocation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Current Allocations Table */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Active Faculty Allocations</h3>
                      <p className="text-xs text-slate-500">Live teaching assignments enforced in faculty portals and marks entry.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {allocations.length} Active Assignments
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-3 px-4">Branch & Section</th>
                          <th className="py-3 px-4">Semester</th>
                          <th className="py-3 px-4">Course Details</th>
                          <th className="py-3 px-4">Assigned Faculty</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {allocations.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-bold text-[#0A2566]">
                              {a.branch} - {a.section?.sectionName}
                            </td>
                            <td className="py-3 px-4">Semester {a.semesterNumber}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{a.subject?.subjectName}</p>
                              <span className="text-[11px] text-slate-500">{a.subject?.subjectCode}</span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{a.faculty?.name}</p>
                              <span className="text-[11px] text-slate-500">EMPID: {a.faculty?.facultyId}</span>
                            </td>
                            <td className="py-3 px-4">
                              {a.isActive ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                  INACTIVE
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleAllocation(a.id)}
                                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                                  title="Toggle active status"
                                >
                                  {a.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteAllocation(a.id)}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 transition cursor-pointer"
                                  title="Remove allocation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 6: FACULTY WORKLOAD */}
            {/* ========================================================================= */}
            {activeTab === 'WORKLOAD' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Faculty Workload Summary</h3>
                    <p className="text-xs text-slate-500">Official course load derived from the 2026-2027 timetable.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search faculty name..."
                      value={workloadSearch}
                      onChange={(e) => setWorkloadSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#146EF5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facultyList
                    .filter((f) => f.name.toLowerCase().includes(workloadSearch.toLowerCase()))
                    .map((fac) => {
                      const facAllocs = allocations.filter(
                        (a) => a.faculty?.facultyId === fac.facultyId || a.faculty?.name === fac.name
                      );
                      return (
                        <div key={fac.facultyId} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#146EF5]">
                                EMPID: {fac.facultyId}
                              </span>
                              <span className="text-xs font-bold text-slate-500">{facAllocs.length} Courses</span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm mb-1">{fac.name}</h4>
                            <p className="text-xs text-slate-500">{fac.department || 'Department Staff'}</p>

                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                              {facAllocs.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">No teaching allocations recorded.</p>
                              ) : (
                                facAllocs.map((al) => (
                                  <div key={al.id} className="text-[11px] flex items-center justify-between">
                                    <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                                      {al.subject?.subjectName}
                                    </span>
                                    <span className="text-slate-500 font-bold">
                                      {al.branch}-{al.section?.sectionName} (Sem {al.semesterNumber})
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 7: ALL-SECTION MARKS OVERVIEW */}
            {/* ========================================================================= */}
            {activeTab === 'MARKS_OVERVIEW' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-[#146EF5]" />
                      <h3 className="font-extrabold text-slate-800 text-base">Institution-Wide Marks Overview</h3>
                    </div>
                    <button
                      onClick={exportMarksToCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Academic Year</label>
                      <select
                        value={overviewYear}
                        onChange={(e) => setOverviewYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      >
                        {academicYears.map((y) => (
                          <option key={y.id} value={y.year}>
                            {y.year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Semester</label>
                      <select
                        value={overviewSem}
                        onChange={(e) => setOverviewSem(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Branch</label>
                      <select
                        value={overviewBranch}
                        onChange={(e) => setOverviewBranch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      >
                        <option value="CSIT">CSIT</option>
                        <option value="CSD">CSD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Section</label>
                      <select
                        value={overviewSectionId}
                        onChange={(e) => setOverviewSectionId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      >
                        <option value="">All Sections</option>
                        {Array.from(
                          new Map(
                            sections
                              .filter((s) => s.branch === overviewBranch && s.semester === overviewSem && (s.academicYear === overviewYear || !s.academicYear))
                              .map((sec) => [sec.sectionName, sec])
                          ).values()
                        ).map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            Section {sec.sectionName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                      <select
                        value={overviewSubjectId}
                        onChange={(e) => setOverviewSubjectId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      >
                        <option value="">All Subjects</option>
                        {subjects
                          .filter((s) => s.branch === overviewBranch && s.semester === overviewSem)
                          .map((sub) => {
                            const isLab = sub.isLab || isLabCourse(sub.subjectCode, sub.subjectName);
                            return (
                              <option key={sub.id} value={sub.id}>
                                {isLab ? `[LAB] ${sub.subjectCode} - ${sub.subjectName}` : `${sub.subjectCode} - ${sub.subjectName}`}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Examination Period</label>
                      <select
                        value={overviewExamId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOverviewExamId(val);
                          if (val === 'SESSIONAL') {
                            setOverviewMode('SESSIONAL');
                          } else {
                            setOverviewMode('DETAILS');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      >
                        {isOverviewSubjectLab ? (
                          <>
                            <option value="">Single Internal Exam (Max 30M)</option>
                            <option value="SESSIONAL">★ Lab Internal Sessional Statement (30M)</option>
                          </>
                        ) : (
                          <>
                            <option value="">All Exams (Detail)</option>
                            <option value="SESSIONAL">★ Sessional Marks (80:20 Weighted)</option>
                            {exams.map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.examType === 'LAB_INTERNAL' ? 'Lab Internal Exam (Single Internal - Max 30M)' : `${ex.examType} (Sem ${ex.semester})`}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student by Reg No or Name..."
                        value={overviewSearch}
                        onChange={(e) => setOverviewSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#146EF5]"
                      />
                    </div>
                    {overviewSubjectId && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                            isOverviewSubjectLab
                              ? 'text-amber-800 bg-amber-50 border-amber-300'
                              : 'text-blue-700 bg-blue-50 border-blue-200'
                          }`}
                        >
                          {isOverviewSubjectLab ? '🧪 Lab Course:' : 'Subject:'}{' '}
                          {selectedOverviewSubject?.subjectName} ({selectedOverviewSubject?.subjectCode})
                        </span>
                        {isOverviewSubjectLab && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                            Single Internal (Max 30M) • No 80:20 Split
                          </span>
                        )}
                        <button
                          onClick={() => setOverviewSubjectId('')}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                        >
                          Clear Subject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marks Overview Table */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setOverviewMode('DETAILS');
                          if (overviewExamId === 'SESSIONAL') setOverviewExamId('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          overviewMode === 'DETAILS' && overviewExamId !== 'SESSIONAL'
                            ? 'bg-[#146EF5] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Detailed Exam Components
                      </button>
                      <button
                        onClick={() => {
                          setOverviewMode('SESSIONAL');
                          setOverviewExamId('SESSIONAL');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          overviewMode === 'SESSIONAL' || overviewExamId === 'SESSIONAL'
                            ? 'bg-gradient-to-r from-[#0A2566] to-[#146EF5] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        Sessional Statement (80:20)
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      Showing {overviewData.length} Students with Recorded Marks
                    </span>
                  </div>

                  {loadingOverview ? (
                    <div className="p-12 flex justify-center items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#146EF5]" />
                      <span className="text-xs font-bold text-slate-600">Loading Section Marks...</span>
                    </div>
                  ) : overviewData.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs">
                      No student records found matching the current filters.
                    </div>
                  ) : overviewMode === 'SESSIONAL' || overviewExamId === 'SESSIONAL' ? (
                    <div className="overflow-x-auto">
                      {isOverviewSubjectLab && (
                        <div className="p-3 bg-amber-50/70 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            <strong>Laboratory Course Assessment:</strong> In accordance with SRKR R23 Autonomous regulations, Laboratory courses feature a <strong>Single Internal Examination (Max 30 Marks)</strong> based on continuous lab evaluation. No Mid-1/Mid-2 or 80:20 averaging applies.
                          </span>
                        </div>
                      )}
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          {isOverviewSubjectLab ? (
                            <tr>
                              <th className="py-2.5 px-3">Reg No</th>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Section</th>
                              <th className="py-2.5 px-3">Subject</th>
                              <th className="py-2.5 px-3 text-center">Course Type</th>
                              <th className="py-2.5 px-3 text-center">Evaluation Mode</th>
                              <th className="py-2.5 px-3 text-center font-extrabold text-amber-700">Lab Internal Sessional Total (30M)</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          ) : (
                            <tr>
                              <th className="py-2.5 px-3">Reg No</th>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Section</th>
                              <th className="py-2.5 px-3">Subject</th>
                              <th className="py-2.5 px-3 text-center">Type</th>
                              <th className="py-2.5 px-3 text-center">Mid-1 (30)</th>
                              <th className="py-2.5 px-3 text-center">Mid-2 (30)</th>
                              <th className="py-2.5 px-3 text-center">80% Best</th>
                              <th className="py-2.5 px-3 text-center">20% Other</th>
                              <th className="py-2.5 px-3 text-center font-extrabold text-[#0A2566]">Sessional (30)</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          )}
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {overviewData.flatMap((stu) => {
                            const sessList = (stu.sessionals || []).filter(
                              (s) => !overviewSubjectId || s.subjectId === overviewSubjectId
                            );
                            if (sessList.length === 0) {
                              return (
                                <tr key={stu.id} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                  <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                  <td className="py-2.5 px-3">{stu.section}</td>
                                  <td colSpan={isOverviewSubjectLab ? 5 : 8} className="py-2.5 px-3 text-slate-400 italic">No sessional marks computed yet</td>
                                </tr>
                              );
                            }
                            return sessList.map((sess) => {
                              if (isOverviewSubjectLab) {
                                return (
                                  <tr key={`${stu.id}-${sess.subjectId}`} className="hover:bg-amber-50/30">
                                    <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                    <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                    <td className="py-2.5 px-3 font-semibold">{stu.section}</td>
                                    <td className="py-2.5 px-3 font-semibold">
                                      {sess.subjectCode} - {sess.subjectName}
                                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">LAB</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Lab Course
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-xs font-semibold text-slate-500">
                                      Single Internal Examination (100% Direct — No 80:20 Split)
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-black text-amber-800 text-sm">
                                      {sess.sessionalTotal ?? '-'} <span className="text-[11px] font-normal text-slate-400">/ 30</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      {sess.status === 'PASSED' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          PASSED
                                        </span>
                                      ) : sess.status === 'FAILED' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                          FAILED
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                                          PENDING
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              }

                              if (sess.isLab) {
                                return (
                                  <tr key={`${stu.id}-${sess.subjectId}`} className="hover:bg-amber-50/20">
                                    <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                    <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                    <td className="py-2.5 px-3 font-semibold">{stu.section}</td>
                                    <td className="py-2.5 px-3 font-semibold">
                                      {sess.subjectCode} - {sess.subjectName}
                                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">LAB</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Lab
                                      </span>
                                    </td>
                                    <td colSpan={4} className="py-2.5 px-3 text-center text-xs text-amber-800 bg-amber-50/50 font-semibold">
                                      Single Internal Lab Examination (100% Direct — No 80:20 Split)
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-black text-amber-800">
                                      {sess.sessionalTotal ?? '-'}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      {sess.status === 'PASSED' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          PASSED
                                        </span>
                                      ) : sess.status === 'FAILED' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                          FAILED
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                                          PENDING
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={`${stu.id}-${sess.subjectId}`} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                  <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                  <td className="py-2.5 px-3 font-semibold">{stu.section}</td>
                                  <td className="py-2.5 px-3 font-semibold">
                                    {sess.subjectCode} - {sess.subjectName}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">Theory</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono">
                                    {sess.mid1Total ?? '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono">
                                    {sess.mid2Total ?? '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-semibold">
                                    {sess.bestWeighted ? `${sess.bestWeighted}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                                    {sess.otherWeighted ? `${sess.otherWeighted}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono font-black text-[#146EF5]">
                                    {sess.sessionalTotal ?? '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {sess.status === 'PASSED' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        PASSED
                                      </span>
                                    ) : sess.status === 'FAILED' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                        FAILED
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                                        PENDING
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {isOverviewSubjectLab && (
                        <div className="p-3 bg-amber-50/70 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            <strong>Laboratory Course Assessment:</strong> Laboratory courses have a <strong>Single Internal Examination (Max 30 Marks)</strong>. There are no separate Descriptive, Objective, or Assignment components.
                          </span>
                        </div>
                      )}
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          {isOverviewSubjectLab ? (
                            <tr>
                              <th className="py-2.5 px-3">Reg No</th>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Section</th>
                              <th className="py-2.5 px-3">Subject</th>
                              <th className="py-2.5 px-3 text-center">Examination</th>
                              <th className="py-2.5 px-3 text-center">Evaluation Mode</th>
                              <th className="py-2.5 px-3 text-center font-extrabold text-amber-700">Lab Internal Marks (Max 30M)</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          ) : (
                            <tr>
                              <th className="py-2.5 px-3">Reg No</th>
                              <th className="py-2.5 px-3">Student Name</th>
                              <th className="py-2.5 px-3">Section</th>
                              <th className="py-2.5 px-3">Subject</th>
                              <th className="py-2.5 px-3">Exam</th>
                              <th className="py-2.5 px-3">Desc (15)</th>
                              <th className="py-2.5 px-3">Obj (10)</th>
                              <th className="py-2.5 px-3">Assign (5)</th>
                              <th className="py-2.5 px-3 font-extrabold text-[#0A2566]">Total (30)</th>
                            </tr>
                          )}
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {overviewData.flatMap((stu) => {
                            const marksToShow = stu.marks.filter(
                              (m) => !overviewSubjectId || m.subjectId === overviewSubjectId
                            );
                            if (marksToShow.length === 0) {
                              return (
                                <tr key={stu.id} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                  <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                  <td className="py-2.5 px-3">{stu.section}</td>
                                  <td colSpan={isOverviewSubjectLab ? 5 : 6} className="py-2.5 px-3 text-slate-400 italic">No marks recorded yet</td>
                                </tr>
                              );
                            }
                            return marksToShow.map((m) => {
                              const isLab = m.exam?.examType === 'LAB_INTERNAL' || m.subject?.isLab || isLabCourse(m.subject?.subjectCode, m.subject?.subjectName);

                              if (isOverviewSubjectLab) {
                                return (
                                  <tr key={m.id} className="hover:bg-amber-50/30">
                                    <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                    <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                    <td className="py-2.5 px-3">{stu.section}</td>
                                    <td className="py-2.5 px-3 font-semibold">
                                      {m.subject?.subjectCode} - {m.subject?.subjectName}
                                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">LAB</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        Single Internal Exam
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-xs text-slate-500 font-medium">
                                      Continuous Evaluation & Lab Internal Viva
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-black text-amber-800 text-sm">
                                      {m.total} <span className="text-[11px] font-normal text-slate-400">/ 30</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      {m.total >= 12 ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          PASSED
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                          FAILED
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              }

                              if (isLab) {
                                return (
                                  <tr key={m.id} className="hover:bg-amber-50/20">
                                    <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                    <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                    <td className="py-2.5 px-3">{stu.section}</td>
                                    <td className="py-2.5 px-3 font-semibold">
                                      {m.subject?.subjectCode}
                                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">LAB</span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        Single Internal
                                      </span>
                                    </td>
                                    <td colSpan={3} className="py-2.5 px-3 text-center font-semibold text-amber-800 bg-amber-50/60 rounded">
                                      Single Internal Continuous Evaluation (Direct 30M Score)
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-black text-amber-800">{m.total} / 30</td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={m.id} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-bold text-[#0A2566]">{stu.registerNumber}</td>
                                  <td className="py-2.5 px-3 text-slate-800">{stu.name}</td>
                                  <td className="py-2.5 px-3">{stu.section}</td>
                                  <td className="py-2.5 px-3 font-semibold">{m.subject?.subjectCode}</td>
                                  <td className="py-2.5 px-3">{m.exam?.examType}</td>
                                  <td className="py-2.5 px-3 font-mono">{m.descriptiveTotal}</td>
                                  <td className="py-2.5 px-3 font-mono">{m.objectiveTotal}</td>
                                  <td className="py-2.5 px-3 font-mono">{m.assignmentMarks}</td>
                                  <td className="py-2.5 px-3 font-mono font-extrabold text-[#146EF5]">{m.total}</td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 8: PRINT REPORTS */}
            {/* ========================================================================= */}
            {activeTab === 'REPORTS' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-[#0A2566] text-lg">Official Academic Reports & Print Out</h3>
                    <p className="text-xs text-slate-500">Official format prescribed by SRKR Engineering College Examination Cell.</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/25 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Current Report
                  </button>
                </div>

                {/* Printable Institutional Header */}
                <div className="text-center py-4 border-b border-slate-100">
                  <h2 className="text-lg sm:text-xl font-black text-[#0A2566] tracking-tight uppercase">
                    S.R.K.R. Engineering College (Autonomous)
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    (Affiliated to JNTUK, Kakinada &bull; Accredited by NBA & NAAC with &apos;A+&apos; Grade)
                  </p>
                  <p className="text-xs text-slate-500">China-Amiram, Bhimavaram - 534204, W.G. Dist., A.P.</p>
                  <div className="inline-block px-4 py-1 rounded-full bg-slate-100 font-extrabold text-xs text-slate-800 mt-2">
                    SUPER ADMIN CONSOLIDATED ACADEMIC ALLOCATION & ASSESSMENT ROSTER
                  </div>
                </div>

                {/* Report Content Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase">Academic Year</p>
                    <p className="text-base font-extrabold text-[#0A2566] mt-1">{statsData?.activeYear || '2026-2027'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase">Allocated Courses</p>
                    <p className="text-base font-extrabold text-emerald-600 mt-1">{allocations.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase">Class Sections</p>
                    <p className="text-base font-extrabold text-[#0A2566] mt-1">{sections.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase">Super Admin In-Charge</p>
                    <p className="text-base font-extrabold text-[#146EF5] mt-1">{user.name}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
