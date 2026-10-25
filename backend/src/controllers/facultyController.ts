import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const isLabCourse = (subjectCode?: string, subjectName?: string): boolean => {
  const code = (subjectCode || '').toUpperCase().trim();
  const name = (subjectName || '').toLowerCase().trim();

  // "Human Resource & Project Management" is a theory subject
  if (name.includes('project management')) {
    return false;
  }

  if (
    name.includes('lab') ||
    name.includes('practical') ||
    name.includes('tinkering') ||
    name.includes('internship') ||
    name.includes('mini project') ||
    name.includes('project work')
  ) {
    return true;
  }

  const labCodes = [
    'B23CS2104', 'B23CS2105', 'B23CS2106',
    'B23CD2202', 'B23CS2205', 'B23CT2201', 'B23CT2202', 'B23CD2203', 'B23CD2204',
    'B23CT3106', 'B23CT3107', 'B23BS3101', 'B23CT3108', 'B23CT3109',
    'B23CD3109', 'B23CD3110', 'B23CD3111', 'B23CD3112',
    'B23CT3211', 'B23CT3212', 'B23CT3213', 'B23CD3213', 'B23CD3214', 'B23CD3215',
    'B23CT4112', 'B23CT4113', 'B23CD4109', 'B23CD4110'
  ];
  return labCodes.includes(code);
};

export const isOpenElectiveCourse = (subjectCode?: string, subjectName?: string): boolean => {
  const code = (subjectCode || '').toUpperCase().trim();
  const name = (subjectName || '').toLowerCase().trim();

  if (code.includes('OE') || code.startsWith('B23OE')) {
    return true;
  }

  if (
    name.includes('open elective') ||
    name.startsWith('oe-') ||
    name.startsWith('oe ') ||
    name.includes('(oe')
  ) {
    return true;
  }

  return false;
};

export const facultyController = {
  // 1. Faculty Dashboard Overview Stats
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const faculty = user?.facultyProfile || {
        name: user?.name || user?.username || 'Faculty Member',
        department: 'CSD / CSIT',
        facultyId: user?.username || 'FAC101',
      };

      const currentAy = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      const activeAy = currentAy?.year || '2026-2027';

      const totalStudents = await prisma.student.count({ where: { academicYear: activeAy } });
      const totalSections = await prisma.section.count({ where: { academicYear: activeAy } });
      const totalSubjects = await prisma.subject.count();
      const totalMarksEntered = await prisma.mark.count();

      const sections = await prisma.section.findMany({
        where: { academicYear: activeAy },
        orderBy: [{ semester: 'asc' }, { sectionName: 'asc' }],
      });

      // Count students per section
      const sectionsWithCounts = await Promise.all(
        sections.map(async (sec) => {
          const count = await prisma.student.count({
            where: {
              branch: sec.branch,
              section: sec.sectionName,
              semester: sec.semester,
              academicYear: sec.academicYear,
            },
          });
          return {
            ...sec,
            studentCount: count,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          faculty,
          academicYear: activeAy,
          stats: {
            totalStudents,
            totalSections,
            totalSubjects,
            totalMarksEntered,
          },
          sections: sectionsWithCounts,
        },
      });
    } catch (error: any) {
      console.error('getDashboardStats error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
  },

  // 2. Get All Sections with Student Counts (Filtered by Faculty Allocation for FACULTY)
  async getSections(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const currentAy = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      const activeAy = currentAy?.year || '2026-2027';
      let sectionWhere: any = { academicYear: activeAy };

      if (user?.role === 'FACULTY') {
        const facultyProfile = user.facultyProfile || await prisma.faculty.findUnique({
          where: { userId: user.id },
        });

        if (facultyProfile) {
          const allocations = await prisma.facultyAllocation.findMany({
            where: {
              facultyId: facultyProfile.id,
              academicYear: activeAy,
              isActive: true,
            },
            select: { sectionId: true },
          });

          const allocatedIds = Array.from(new Set(allocations.map((a) => a.sectionId)));
          sectionWhere.id = { in: allocatedIds };
        }
      }

      const sections = await prisma.section.findMany({
        where: sectionWhere,
        orderBy: [{ semester: 'asc' }, { sectionName: 'asc' }],
      });

      const sectionsWithCounts = await Promise.all(
        sections.map(async (sec) => {
          const count = await prisma.student.count({
            where: {
              branch: sec.branch,
              section: sec.sectionName,
              semester: sec.semester,
              academicYear: sec.academicYear,
            },
          });
          return {
            ...sec,
            studentCount: count,
          };
        })
      );

      res.status(200).json({ success: true, sections: sectionsWithCounts });
    } catch (error: any) {
      console.error('getSections error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch sections' });
    }
  },

  // 3. Get Subjects (Filter by branch, semester, sectionId & Faculty Allocation)
  async getSubjects(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { branch, semester, sectionId } = req.query;
      const whereClause: any = {};

      if (branch) whereClause.branch = String(branch);
      if (semester) whereClause.semester = Number(semester);

      if (user?.role === 'FACULTY') {
        const facultyProfile = user.facultyProfile || await prisma.faculty.findUnique({
          where: { userId: user.id },
        });

        if (facultyProfile) {
          const allocWhere: any = {
            facultyId: facultyProfile.id,
            isActive: true,
          };
          if (sectionId) allocWhere.sectionId = String(sectionId);

          const allocations = await prisma.facultyAllocation.findMany({
            where: allocWhere,
            select: { subjectId: true },
          });

          const allocatedSubjectIds = Array.from(new Set(allocations.map((a) => a.subjectId)));
          whereClause.id = { in: allocatedSubjectIds };
        }
      }

      const subjects = await prisma.subject.findMany({
        where: whereClause,
        orderBy: [{ semester: 'asc' }, { subjectCode: 'asc' }],
      });

      const enrichedSubjects = subjects.map((sub) => ({
        ...sub,
        isLab: isLabCourse(sub.subjectCode, sub.subjectName),
        isOpenElective: isOpenElectiveCourse(sub.subjectCode, sub.subjectName),
      }));

      res.status(200).json({ success: true, subjects: enrichedSubjects });
    } catch (error: any) {
      console.error('getSubjects error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
    }
  },

  // 4. Get Exams (Filter by academicYear & semester)
  async getExams(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear, semester } = req.query;
      const whereClause: any = {};

      if (academicYear) whereClause.academicYear = String(academicYear);
      if (semester) whereClause.semester = Number(semester);

      let exams = await prisma.exam.findMany({
        where: whereClause,
        orderBy: [{ semester: 'asc' }, { examType: 'asc' }],
      });

      // Self-healing: auto-seed standard exams if none exist for requested academicYear & semester
      if (exams.length === 0 && academicYear && semester) {
        const standardTypes = ['MID_1', 'MID_2', 'LAB_INTERNAL'] as const;
        for (const et of standardTypes) {
          try {
            await prisma.exam.upsert({
              where: {
                exam_composite_unique: {
                  examType: et,
                  academicYear: String(academicYear),
                  semester: Number(semester),
                },
              },
              update: {},
              create: {
                examType: et,
                academicYear: String(academicYear),
                semester: Number(semester),
              },
            });
          } catch (e) {
            // Ignore duplicate key race condition
          }
        }
        exams = await prisma.exam.findMany({
          where: whereClause,
          orderBy: [{ semester: 'asc' }, { examType: 'asc' }],
        });
      }

      res.status(200).json({ success: true, exams });
    } catch (error: any) {
      console.error('getExams error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch exams' });
    }
  },

  // 5. Get Students and Marks for a specific Section, Subject, and Exam
  async getSectionMarks(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId, subjectId, examId } = req.query;

      if (!sectionId || !subjectId || !examId) {
        res.status(400).json({
          success: false,
          message: 'sectionId, subjectId, and examId are required.',
        });
        return;
      }

      const section = await prisma.section.findUnique({
        where: { id: String(sectionId) },
      });

      if (!section) {
        res.status(404).json({ success: false, message: 'Section not found' });
        return;
      }

      const subject = await prisma.subject.findUnique({
        where: { id: String(subjectId) },
      });

      const exam = await prisma.exam.findUnique({
        where: { id: String(examId) },
      });

      // Strict allocation check for FACULTY role
      const user = (req as any).user;
      if (user?.role === 'FACULTY') {
        const facultyProfile = user.facultyProfile || await prisma.faculty.findUnique({
          where: { userId: user.id },
        });

        if (facultyProfile) {
          const isAllocated = await prisma.facultyAllocation.findFirst({
            where: {
              facultyId: facultyProfile.id,
              sectionId: String(sectionId),
              subjectId: String(subjectId),
              isActive: true,
            },
          });

          if (!isAllocated) {
            res.status(403).json({
              success: false,
              message: 'Access denied. You are not allocated to teach this subject in this section.',
            });
            return;
          }
        }
      }

      const isLab = subject ? isLabCourse(subject.subjectCode, subject.subjectName) : false;
      const isOE = subject ? isOpenElectiveCourse(subject.subjectCode, subject.subjectName) : false;

      // Fetch all students enrolled in this section
      const students = await prisma.student.findMany({
        where: {
          branch: section.branch,
          section: section.sectionName,
          semester: section.semester,
          academicYear: section.academicYear,
        },
        orderBy: { registerNumber: 'asc' },
      });

      // Fetch existing marks
      const existingMarks = await prisma.mark.findMany({
        where: {
          sectionId: String(sectionId),
          subjectId: String(subjectId),
          examId: String(examId),
        },
      });

      const marksMap = new Map<string, any>();
      existingMarks.forEach((m) => {
        marksMap.set(m.studentId, m);
      });

      // Merge students with their marks
      const studentMarks = students.map((stu, index) => {
        const mark = marksMap.get(stu.id);
        return {
          sNo: index + 1,
          studentId: stu.id,
          registerNumber: stu.registerNumber,
          name: stu.name,
          markId: mark ? mark.id : null,
          isLab,
          isOpenElective: isOE,
          descriptiveQ1OrQ2: mark ? mark.descriptiveQ1OrQ2 : '',
          descriptiveQ3OrQ4: mark ? mark.descriptiveQ3OrQ4 : '',
          descriptiveQ5OrQ6: mark ? mark.descriptiveQ5OrQ6 : '',
          descriptiveTotal: mark ? mark.descriptiveTotal : 0,
          objectiveQ1: mark ? mark.objectiveQ1 : '',
          objectiveQ2: mark ? mark.objectiveQ2 : '',
          objectiveQ3: mark ? mark.objectiveQ3 : '',
          objectiveQ4: mark ? mark.objectiveQ4 : '',
          objectiveQ5: mark ? mark.objectiveQ5 : '',
          objectiveTotal: mark ? mark.objectiveTotal : 0,
          assignmentMarks: mark ? mark.assignmentMarks : '',
          total: mark ? mark.total : 0,
          isSaved: !!mark,
        };
      });

      res.status(200).json({
        success: true,
        isLab,
        isOpenElective: isOE,
        section,
        subject,
        exam,
        students: studentMarks,
      });
    } catch (error: any) {
      console.error('getSectionMarks error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch section marks' });
    }
  },

  // 6. Bulk Save or Update Marks for a Section
  async saveSectionMarks(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId, subjectId, examId, marks, oeMode } = req.body;
      const user = (req as any).user;
      const facultyId = user?.facultyProfile?.id || null;

      if (!sectionId || !subjectId || !examId || !Array.isArray(marks)) {
        res.status(400).json({
          success: false,
          message: 'sectionId, subjectId, examId, and marks array are required.',
        });
        return;
      }

      const section = await prisma.section.findUnique({
        where: { id: String(sectionId) },
      });

      const subject = await prisma.subject.findUnique({
        where: { id: String(subjectId) },
      });

      // Strict allocation check for FACULTY role
      if (user?.role === 'FACULTY') {
        const facultyProfile = user.facultyProfile || await prisma.faculty.findUnique({
          where: { userId: user.id },
        });

        if (facultyProfile) {
          const isAllocated = await prisma.facultyAllocation.findFirst({
            where: {
              facultyId: facultyProfile.id,
              sectionId: String(sectionId),
              subjectId: String(subjectId),
              isActive: true,
            },
          });

          if (!isAllocated) {
            res.status(403).json({
              success: false,
              message: 'Access denied. You are not allocated to enter marks for this subject and section.',
            });
            return;
          }
        }
      }

      const isLab = subject ? isLabCourse(subject.subjectCode, subject.subjectName) : false;
      const isOE = subject ? isOpenElectiveCourse(subject.subjectCode, subject.subjectName) : false;

      // Special handling: If Direct Total Sessional is selected for an Open Elective,
      // save to both MID_1 and MID_2 so the 80:20 formula directly calculates the exact sessional mark.
      if (isOE && oeMode === 'SESSIONAL' && section) {
        const mid1Exam = await prisma.exam.findFirst({
          where: { examType: 'MID_1', semester: section.semester, academicYear: section.academicYear },
        });
        const mid2Exam = await prisma.exam.findFirst({
          where: { examType: 'MID_2', semester: section.semester, academicYear: section.academicYear },
        });

        const results = [];
        for (const item of marks) {
          const rawTotal = item.total !== undefined && item.total !== '' 
            ? parseFloat(item.total) 
            : (parseFloat(item.assignmentMarks) || 0);
          const grandTotal = Math.min(30, Math.max(0, isNaN(rawTotal) ? 0 : rawTotal));

          if (mid1Exam) {
            await prisma.mark.upsert({
              where: {
                student_subject_exam_unique: {
                  studentId: item.studentId,
                  subjectId: String(subjectId),
                  examId: mid1Exam.id,
                },
              },
              update: {
                facultyId,
                sectionId: String(sectionId),
                total: grandTotal,
                assignmentMarks: grandTotal,
              },
              create: {
                studentId: item.studentId,
                facultyId,
                subjectId: String(subjectId),
                sectionId: String(sectionId),
                examId: mid1Exam.id,
                total: grandTotal,
                assignmentMarks: grandTotal,
              },
            });
          }

          if (mid2Exam) {
            const savedMid2 = await prisma.mark.upsert({
              where: {
                student_subject_exam_unique: {
                  studentId: item.studentId,
                  subjectId: String(subjectId),
                  examId: mid2Exam.id,
                },
              },
              update: {
                facultyId,
                sectionId: String(sectionId),
                total: grandTotal,
                assignmentMarks: grandTotal,
              },
              create: {
                studentId: item.studentId,
                facultyId,
                subjectId: String(subjectId),
                sectionId: String(sectionId),
                examId: mid2Exam.id,
                total: grandTotal,
                assignmentMarks: grandTotal,
              },
            });
            results.push(savedMid2);
          }
        }

        res.status(200).json({
          success: true,
          message: `Successfully saved direct total sessional marks for ${results.length} students.`,
          count: results.length,
        });
        return;
      }

      const results = [];

      for (const item of marks) {
        let q1OrQ2 = 0;
        let q3OrQ4 = 0;
        let q5OrQ6 = 0;
        let descTotal = 0;
        let objQ1 = 0;
        let objQ2 = 0;
        let objQ3 = 0;
        let objQ4 = 0;
        let objQ5 = 0;
        let objTotal = 0;
        let assign = 0;
        let grandTotal = 0;

        if (isLab || isOE || oeMode === 'MID_1' || oeMode === 'MID_2') {
          // Direct score (Max 30) for Lab or Open Elective direct modes
          const rawTotal = item.total !== undefined && item.total !== '' 
            ? parseFloat(item.total) 
            : (parseFloat(item.assignmentMarks) || 0);
          grandTotal = Math.min(30, Math.max(0, isNaN(rawTotal) ? 0 : rawTotal));
          assign = grandTotal;
        } else {
          // For Theory: Descriptive (15) + Objective (10) + Assignment (5) = Max 30
          q1OrQ2 = Math.min(5, Math.max(0, parseFloat(item.descriptiveQ1OrQ2) || 0));
          q3OrQ4 = Math.min(5, Math.max(0, parseFloat(item.descriptiveQ3OrQ4) || 0));
          q5OrQ6 = Math.min(5, Math.max(0, parseFloat(item.descriptiveQ5OrQ6) || 0));
          descTotal = parseFloat((q1OrQ2 + q3OrQ4 + q5OrQ6).toFixed(2)); // Max 15

          objQ1 = Math.min(2, Math.max(0, parseFloat(item.objectiveQ1) || 0));
          objQ2 = Math.min(2, Math.max(0, parseFloat(item.objectiveQ2) || 0));
          objQ3 = Math.min(2, Math.max(0, parseFloat(item.objectiveQ3) || 0));
          objQ4 = Math.min(2, Math.max(0, parseFloat(item.objectiveQ4) || 0));
          objQ5 = Math.min(2, Math.max(0, parseFloat(item.objectiveQ5) || 0));
          objTotal = parseFloat((objQ1 + objQ2 + objQ3 + objQ4 + objQ5).toFixed(2)); // Max 10

          assign = Math.min(5, Math.max(0, parseFloat(item.assignmentMarks) || 0)); // Max 5
          grandTotal = parseFloat((descTotal + objTotal + assign).toFixed(2)); // Max 30
        }

        const saved = await prisma.mark.upsert({
          where: {
            student_subject_exam_unique: {
              studentId: item.studentId,
              subjectId: String(subjectId),
              examId: String(examId),
            },
          },
          update: {
            facultyId: facultyId,
            sectionId: String(sectionId),
            descriptiveQ1OrQ2: q1OrQ2,
            descriptiveQ3OrQ4: q3OrQ4,
            descriptiveQ5OrQ6: q5OrQ6,
            descriptiveTotal: descTotal,
            objectiveQ1: objQ1,
            objectiveQ2: objQ2,
            objectiveQ3: objQ3,
            objectiveQ4: objQ4,
            objectiveQ5: objQ5,
            objectiveTotal: objTotal,
            assignmentMarks: assign,
            total: grandTotal,
          },
          create: {
            studentId: item.studentId,
            facultyId: facultyId,
            subjectId: String(subjectId),
            sectionId: String(sectionId),
            examId: String(examId),
            descriptiveQ1OrQ2: q1OrQ2,
            descriptiveQ3OrQ4: q3OrQ4,
            descriptiveQ5OrQ6: q5OrQ6,
            descriptiveTotal: descTotal,
            objectiveQ1: objQ1,
            objectiveQ2: objQ2,
            objectiveQ3: objQ3,
            objectiveQ4: objQ4,
            objectiveQ5: objQ5,
            objectiveTotal: objTotal,
            assignmentMarks: assign,
            total: grandTotal,
          },
        });

        results.push(saved);
      }

      res.status(200).json({
        success: true,
        message: `Successfully saved marks for ${results.length} students.`,
        count: results.length,
      });
    } catch (error: any) {
      console.error('saveSectionMarks error:', error);
      res.status(500).json({ success: false, message: 'Failed to save marks' });
    }
  },

  // 7. Get Sessional Calculation Marks (Theory = 80:20 weighted, Lab = Single Internal Score)
  async getSessionalMarks(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId, subjectId } = req.query;

      if (!sectionId || !subjectId) {
        res.status(400).json({
          success: false,
          message: 'sectionId and subjectId are required.',
        });
        return;
      }

      const section = await prisma.section.findUnique({
        where: { id: String(sectionId) },
      });

      if (!section) {
        res.status(404).json({ success: false, message: 'Section not found' });
        return;
      }

      const subject = await prisma.subject.findUnique({
        where: { id: String(subjectId) },
      });

      const isLab = subject ? isLabCourse(subject.subjectCode, subject.subjectName) : false;
      const isOE = subject ? isOpenElectiveCourse(subject.subjectCode, subject.subjectName) : false;

      // Find exams for this semester & academic year
      const mid1Exam = await prisma.exam.findFirst({
        where: {
          examType: 'MID_1',
          semester: section.semester,
          academicYear: section.academicYear,
        },
      });

      const mid2Exam = await prisma.exam.findFirst({
        where: {
          examType: 'MID_2',
          semester: section.semester,
          academicYear: section.academicYear,
        },
      });

      const labExam = await prisma.exam.findFirst({
        where: {
          examType: 'LAB_INTERNAL',
          semester: section.semester,
          academicYear: section.academicYear,
        },
      });

      // Fetch all students in this section
      const students = await prisma.student.findMany({
        where: {
          branch: section.branch,
          section: section.sectionName,
          semester: section.semester,
          academicYear: section.academicYear,
        },
        orderBy: { registerNumber: 'asc' },
      });

      // Fetch marks
      const mid1Marks = mid1Exam
        ? await prisma.mark.findMany({
            where: {
              sectionId: String(sectionId),
              subjectId: String(subjectId),
              examId: mid1Exam.id,
            },
          })
        : [];

      const mid2Marks = mid2Exam
        ? await prisma.mark.findMany({
            where: {
              sectionId: String(sectionId),
              subjectId: String(subjectId),
              examId: mid2Exam.id,
            },
          })
        : [];

      const labMarks = labExam
        ? await prisma.mark.findMany({
            where: {
              sectionId: String(sectionId),
              subjectId: String(subjectId),
              examId: labExam.id,
            },
          })
        : [];

      const mid1Map = new Map<string, number>();
      mid1Marks.forEach((m) => mid1Map.set(m.studentId, m.total));

      const mid2Map = new Map<string, number>();
      mid2Marks.forEach((m) => mid2Map.set(m.studentId, m.total));

      const labMap = new Map<string, number>();
      labMarks.forEach((m) => labMap.set(m.studentId, m.total));

      const sessionals = students.map((stu, index) => {
        if (isLab) {
          // For Lab Courses: Single internal exam score (NO 80:20 formula)
          const labMark = labMap.has(stu.id) 
            ? labMap.get(stu.id)! 
            : (mid1Map.has(stu.id) ? mid1Map.get(stu.id)! : null);
          const sessionalTotal = labMark !== null ? parseFloat(labMark.toFixed(2)) : null;

          return {
            sNo: index + 1,
            studentId: stu.id,
            registerNumber: stu.registerNumber,
            name: stu.name,
            isLab: true,
            labMark,
            mid1: null,
            mid2: null,
            higherMid: null,
            lowerMid: null,
            sessionalTotal,
            status:
              sessionalTotal !== null
                ? sessionalTotal >= 12
                  ? 'PASSED'
                  : 'NEEDS_IMPROVEMENT'
                : 'INCOMPLETE',
          };
        }

        // For Theory Courses: Standard 80:20 weighted average
        const hasMid1 = mid1Map.has(stu.id);
        const hasMid2 = mid2Map.has(stu.id);

        const m1 = hasMid1 ? mid1Map.get(stu.id)! : null;
        const m2 = hasMid2 ? mid2Map.get(stu.id)! : null;

        let higherMid: number | null = null;
        let lowerMid: number | null = null;
        let sessionalTotal: number | null = null;

        if (m1 !== null && m2 !== null) {
          higherMid = Math.max(m1, m2);
          lowerMid = Math.min(m1, m2);
          sessionalTotal = parseFloat((higherMid * 0.8 + lowerMid * 0.2).toFixed(2));
        } else if (m1 !== null) {
          higherMid = m1;
          sessionalTotal = parseFloat((m1 * 0.8).toFixed(2));
        } else if (m2 !== null) {
          higherMid = m2;
          sessionalTotal = parseFloat((m2 * 0.8).toFixed(2));
        }

        return {
          sNo: index + 1,
          studentId: stu.id,
          registerNumber: stu.registerNumber,
          name: stu.name,
          isLab: false,
          labMark: null,
          mid1: m1,
          mid2: m2,
          higherMid,
          lowerMid,
          sessionalTotal,
          status:
            sessionalTotal !== null
              ? sessionalTotal >= 12
                ? 'PASSED'
                : 'NEEDS_IMPROVEMENT'
              : 'INCOMPLETE',
        };
      });

      res.status(200).json({
        success: true,
        isLab,
        isOpenElective: isOE,
        section,
        subject,
        sessionals,
      });
    } catch (error: any) {
      console.error('getSessionalMarks error:', error);
      res.status(500).json({ success: false, message: 'Failed to calculate sessionals' });
    }
  },

  // 8. Multi-Subject Class Master Analytics Matrix
  async getClassMatrix(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId, semester, examMode } = req.query;

      if (!sectionId) {
        res.status(400).json({
          success: false,
          message: 'sectionId is required.',
        });
        return;
      }

      // 1. Fetch Section
      const section = await prisma.section.findUnique({
        where: { id: String(sectionId) },
      });

      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Section not found.',
        });
        return;
      }

      const effectiveSemester = semester ? Number(semester) : section.semester;
      const effectiveExamMode = (examMode as string) || 'SESSIONAL'; // 'MID_1' | 'MID_2' | 'SESSIONAL'

      // 2. Fetch all Students in this section
      const students = await prisma.student.findMany({
        where: {
          branch: section.branch,
          section: section.sectionName,
          semester: section.semester,
          academicYear: section.academicYear,
        },
        orderBy: { registerNumber: 'asc' },
      });

      // 3. Fetch all Subjects for this branch & semester
      const subjects = await prisma.subject.findMany({
        where: {
          branch: section.branch,
          semester: effectiveSemester,
        },
        orderBy: [{ subjectCode: 'asc' }],
      });

      const enrichedSubjects = subjects.map((sub) => ({
        ...sub,
        isLab: isLabCourse(sub.subjectCode, sub.subjectName),
        isOpenElective: isOpenElectiveCourse(sub.subjectCode, sub.subjectName),
      }));

      const subjectIds = enrichedSubjects.map((s) => s.id);

      // 4. Fetch all Exams for this academic year & semester
      const exams = await prisma.exam.findMany({
        where: {
          academicYear: section.academicYear,
          semester: effectiveSemester,
        },
      });

      const mid1Exam = exams.find((e) => e.examType === 'MID_1');
      const mid2Exam = exams.find((e) => e.examType === 'MID_2');
      const labInternalExam = exams.find((e) => e.examType === 'LAB_INTERNAL');

      // 5. Fetch all Marks for this section across all subjects
      const marks = await prisma.mark.findMany({
        where: {
          sectionId: section.id,
          subjectId: { in: subjectIds },
        },
      });

      // Fast Lookup Map: `studentId:subjectId:examId` -> Mark
      const marksMap = new Map<string, any>();
      marks.forEach((m) => {
        marksMap.set(`${m.studentId}:${m.subjectId}:${m.examId}`, m);
      });

      // Also Map by `studentId:subjectId:examType`
      const marksByTypeMap = new Map<string, number>();
      marks.forEach((m) => {
        const exam = exams.find((e) => e.id === m.examId);
        if (exam) {
          marksByTypeMap.set(`${m.studentId}:${m.subjectId}:${exam.examType}`, m.total);
        }
      });

      // 6. Build Multi-Subject Performance Row for Each Student
      const studentRows = students.map((stu, index) => {
        const subjectScores: Record<string, any> = {};
        let totalScoreSum = 0;
        let evaluatedCount = 0;
        let passCount = 0;
        let failCount = 0;

        enrichedSubjects.forEach((sub) => {
          const m1 = marksByTypeMap.get(`${stu.id}:${sub.id}:MID_1`) ?? null;
          const m2 = marksByTypeMap.get(`${stu.id}:${sub.id}:MID_2`) ?? null;
          const lab = marksByTypeMap.get(`${stu.id}:${sub.id}:LAB_INTERNAL`) ?? null;

          let finalScore: number | null = null;

          if (sub.isLab) {
            // Lab Course: 100% direct score (Max 30M)
            finalScore = lab !== null ? lab : (m1 !== null ? m1 : (m2 !== null ? m2 : null));
          } else {
            // Theory Course
            if (effectiveExamMode === 'MID_1') {
              finalScore = m1;
            } else if (effectiveExamMode === 'MID_2') {
              finalScore = m2;
            } else {
              // SESSIONAL 80:20 Calculation
              if (m1 !== null && m2 !== null) {
                const higher = Math.max(m1, m2);
                const lower = Math.min(m1, m2);
                finalScore = parseFloat((higher * 0.8 + lower * 0.2).toFixed(1));
              } else if (m1 !== null) {
                finalScore = parseFloat((m1 * 0.8).toFixed(1));
              } else if (m2 !== null) {
                finalScore = parseFloat((m2 * 0.8).toFixed(1));
              } else {
                finalScore = null;
              }
            }
          }

          const hasScore = finalScore !== null;
          const isPassed = finalScore !== null && finalScore >= 12;

          if (finalScore !== null) {
            totalScoreSum += finalScore;
            evaluatedCount++;
            if (isPassed) passCount++;
            else failCount++;
          }

          subjectScores[sub.id] = {
            subjectId: sub.id,
            subjectCode: sub.subjectCode,
            subjectName: sub.subjectName,
            isLab: sub.isLab,
            mid1: m1,
            mid2: m2,
            score: finalScore,
            isPassed,
          };
        });

        const maxMarks = enrichedSubjects.length * 30;
        const avgPercentage =
          evaluatedCount > 0
            ? parseFloat(((totalScoreSum / (evaluatedCount * 30)) * 100).toFixed(1))
            : 0;

        let statusText = 'Pending';
        let statusBadge = 'bg-slate-100 text-slate-600';

        if (evaluatedCount === 0) {
          statusText = 'No Marks';
          statusBadge = 'bg-slate-100 text-slate-500';
        } else if (failCount > 0) {
          statusText = `${failCount} Backlog${failCount > 1 ? 's' : ''}`;
          statusBadge = 'bg-red-50 text-red-700 border border-red-200';
        } else if (avgPercentage >= 80 && evaluatedCount === enrichedSubjects.length) {
          statusText = 'Distinction';
          statusBadge = 'bg-purple-50 text-purple-700 border border-purple-200';
        } else if (avgPercentage >= 60) {
          statusText = 'First Class';
          statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        } else if (avgPercentage >= 40) {
          statusText = 'Second Class';
          statusBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
        } else {
          statusText = 'Needs Improvement';
          statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
        }

        return {
          sNo: index + 1,
          studentId: stu.id,
          registerNumber: stu.registerNumber,
          name: stu.name,
          subjectScores,
          totalScore: parseFloat(totalScoreSum.toFixed(1)),
          maxMarks,
          avgPercentage,
          evaluatedCount,
          passCount,
          failCount,
          totalSubjects: enrichedSubjects.length,
          statusText,
          statusBadge,
        };
      });

      // 7. Calculate Subject-Wise Class Performance
      const subjectStats = enrichedSubjects.map((sub) => {
        let sum = 0;
        let count = 0;
        let highest = 0;
        let lowest = 999;
        let passCount = 0;

        studentRows.forEach((row) => {
          const sObj = row.subjectScores[sub.id];
          if (sObj && sObj.score !== null) {
            const sc = sObj.score;
            sum += sc;
            count++;
            if (sc > highest) highest = sc;
            if (sc < lowest) lowest = sc;
            if (sc >= 12) passCount++;
          }
        });

        const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
        const passPct = count > 0 ? parseFloat(((passCount / count) * 100).toFixed(1)) : 0;

        return {
          subjectId: sub.id,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          isLab: sub.isLab,
          evaluatedStudents: count,
          average: avg,
          highest: count > 0 ? highest : 0,
          lowest: count > 0 ? lowest : 0,
          passCount,
          passPercentage: passPct,
        };
      });

      // 8. Overall Class KPIs
      let classTotalSum = 0;
      let evaluatedStudentsTotal = 0;
      let allClearCount = 0;
      let topStudent: any = null;
      let highestTotal = -1;

      studentRows.forEach((row) => {
        if (row.evaluatedCount > 0) {
          classTotalSum += row.avgPercentage;
          evaluatedStudentsTotal++;
        }
        if (row.evaluatedCount === enrichedSubjects.length && row.failCount === 0) {
          allClearCount++;
        }
        if (row.totalScore > highestTotal) {
          highestTotal = row.totalScore;
          topStudent = {
            name: row.name,
            registerNumber: row.registerNumber,
            totalScore: row.totalScore,
            avgPercentage: row.avgPercentage,
          };
        }
      });

      const classAvgPercentage =
        evaluatedStudentsTotal > 0
          ? parseFloat((classTotalSum / evaluatedStudentsTotal).toFixed(1))
          : 0;

      const allClearPercentage =
        students.length > 0
          ? parseFloat(((allClearCount / students.length) * 100).toFixed(1))
          : 0;

      res.status(200).json({
        success: true,
        section,
        semester: effectiveSemester,
        examMode: effectiveExamMode,
        subjects: enrichedSubjects,
        exams: {
          mid1: mid1Exam || null,
          mid2: mid2Exam || null,
          labInternal: labInternalExam || null,
        },
        students: studentRows,
        subjectStats,
        overview: {
          totalStudents: students.length,
          evaluatedStudents: evaluatedStudentsTotal,
          allClearCount,
          allClearPercentage,
          classAvgPercentage,
          topStudent: topStudent || { name: '—', registerNumber: '—', totalScore: 0, avgPercentage: 0 },
        },
      });
    } catch (error: any) {
      console.error('getClassMatrix error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate class matrix analytics' });
    }
  },
};
