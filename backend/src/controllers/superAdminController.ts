import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import crypto from 'crypto';
import { isLabCourse, isOpenElectiveCourse } from './facultyController';

export const superAdminController = {
  // 1. Dashboard Overview Stats
  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const [
        totalStudents,
        totalFaculty,
        totalSections,
        totalSubjects,
        totalAllocations,
        totalMarks,
        activeYear,
        activeSemesters,
      ] = await Promise.all([
        prisma.student.count(),
        prisma.faculty.count(),
        prisma.section.count(),
        prisma.subject.count(),
        prisma.facultyAllocation.count({ where: { isActive: true } }),
        prisma.mark.count(),
        prisma.academicYear.findFirst({ where: { isCurrent: true } }),
        prisma.semester.findMany({ where: { isActive: true } }),
      ]);

      const branches = ['CSIT', 'CSD'];
      const branchStats = await Promise.all(
        branches.map(async (branch) => {
          const studentCount = await prisma.student.count({ where: { branch } });
          const sectionCount = await prisma.section.count({ where: { branch } });
          const allocationCount = await prisma.facultyAllocation.count({
            where: { branch, isActive: true },
          });
          return { branch, studentCount, sectionCount, allocationCount };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalStudents,
            totalFaculty,
            totalSections,
            totalSubjects,
            totalAllocations,
            totalMarks,
          },
          activeYear: activeYear?.year || '2026-2027',
          activeSemesters: activeSemesters.map((s) => s.semesterNumber),
          branchStats,
        },
      });
    } catch (error) {
      console.error('getDashboardStats error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch Super Admin dashboard stats.' });
    }
  },

  // 2. Academic Year Management
  async getAcademicYears(_req: Request, res: Response): Promise<void> {
    try {
      const years = await prisma.academicYear.findMany({
        include: {
          semesters: {
            orderBy: { semesterNumber: 'asc' },
          },
        },
        orderBy: { year: 'desc' },
      });
      res.status(200).json({ success: true, academicYears: years });
    } catch (error) {
      console.error('getAcademicYears error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch academic years.' });
    }
  },

  async createAcademicYear(req: Request, res: Response): Promise<void> {
    try {
      const { year, isCurrent } = req.body;
      if (!year || !/^\d{4}-\d{4}$/.test(year.trim())) {
        res.status(400).json({
          success: false,
          message: 'Invalid academic year format. Expected YYYY-YYYY (e.g. 2026-2027).',
        });
        return;
      }

      const cleanYear = year.trim();

      // If isCurrent is true, unset other current years
      if (isCurrent) {
        await prisma.academicYear.updateMany({
          data: { isCurrent: false },
        });
      }

      const newYear = await prisma.academicYear.create({
        data: {
          year: cleanYear,
          isCurrent: Boolean(isCurrent),
        },
      });

      // Automatically create default semesters 1 through 8
      const semesterNames = [
        'I B.Tech I Semester (Sem 1)',
        'I B.Tech II Semester (Sem 2)',
        'II B.Tech I Semester (Sem 3)',
        'II B.Tech II Semester (Sem 4)',
        'III B.Tech I Semester (Sem 5)',
        'III B.Tech II Semester (Sem 6)',
        'IV B.Tech I Semester (Sem 7)',
        'IV B.Tech II Semester (Sem 8)',
      ];

      for (let i = 1; i <= 8; i++) {
        await prisma.semester.create({
          data: {
            academicYearId: newYear.id,
            semesterNumber: i,
            name: semesterNames[i - 1],
            isActive: i === 3 || i === 5 || i === 7, // Default odd semesters active
          },
        });
      }

      res.status(201).json({
        success: true,
        message: `Academic year ${cleanYear} created with default semesters 1-8.`,
        academicYear: newYear,
      });
    } catch (error: any) {
      console.error('createAcademicYear error:', error);
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Academic year already exists.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create academic year.' });
    }
  },

  async setCurrentAcademicYear(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.academicYear.updateMany({
        data: { isCurrent: false },
      });

      const updated = await prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      });

      res.status(200).json({
        success: true,
        message: `Academic year ${updated.year} is now set as the active academic year.`,
        academicYear: updated,
      });
    } catch (error) {
      console.error('setCurrentAcademicYear error:', error);
      res.status(500).json({ success: false, message: 'Failed to update active academic year.' });
    }
  },

  // 3. Semester Management
  async getSemesters(req: Request, res: Response): Promise<void> {
    try {
      const { academicYearId } = req.query;
      const where: any = {};
      if (academicYearId) {
        where.academicYearId = String(academicYearId);
      }

      const semesters = await prisma.semester.findMany({
        where,
        include: {
          academicYear: true,
          _count: {
            select: { allocations: true },
          },
        },
        orderBy: [{ academicYear: { year: 'desc' } }, { semesterNumber: 'asc' }],
      });

      res.status(200).json({ success: true, semesters });
    } catch (error) {
      console.error('getSemesters error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch semesters.' });
    }
  },

  async toggleSemesterActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sem = await prisma.semester.findUnique({ where: { id } });
      if (!sem) {
        res.status(404).json({ success: false, message: 'Semester not found.' });
        return;
      }

      const updated = await prisma.semester.update({
        where: { id },
        data: { isActive: !sem.isActive },
      });

      res.status(200).json({
        success: true,
        message: `${updated.name} is now ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
        semester: updated,
      });
    } catch (error) {
      console.error('toggleSemesterActive error:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle semester status.' });
    }
  },

  // 4. Section Management
  async getSections(req: Request, res: Response): Promise<void> {
    try {
      const { branch, semester, academicYear } = req.query;
      const where: any = {};
      if (branch) where.branch = String(branch);
      if (semester) where.semester = Number(semester);
      if (academicYear) where.academicYear = String(academicYear);

      const sections = await prisma.section.findMany({
        where,
        include: {
          allocations: {
            where: { isActive: true },
            include: {
              faculty: { select: { id: true, name: true, facultyId: true } },
              subject: { select: { id: true, subjectCode: true, subjectName: true } },
            },
          },
        },
        orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }, { sectionName: 'asc' }],
      });

      const sectionsWithCounts = await Promise.all(
        sections.map(async (sec) => {
          const studentCount = await prisma.student.count({
            where: {
              branch: sec.branch,
              section: sec.sectionName,
              semester: sec.semester,
              academicYear: sec.academicYear,
            },
          });
          return {
            ...sec,
            studentCount,
          };
        })
      );

      res.status(200).json({ success: true, sections: sectionsWithCounts });
    } catch (error) {
      console.error('getSections error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch sections.' });
    }
  },

  async createSection(req: Request, res: Response): Promise<void> {
    try {
      const { sectionName, branch, academicYear, semester } = req.body;
      if (!sectionName || !branch || !academicYear || !semester) {
        res.status(400).json({
          success: false,
          message: 'sectionName, branch, academicYear, and semester are required.',
        });
        return;
      }

      const section = await prisma.section.create({
        data: {
          sectionName: sectionName.trim(),
          branch: branch.trim().toUpperCase(),
          academicYear: academicYear.trim(),
          semester: Number(semester),
        },
      });

      res.status(201).json({
        success: true,
        message: `Section ${section.sectionName} created successfully.`,
        section,
      });
    } catch (error: any) {
      console.error('createSection error:', error);
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Section already exists for this branch, year, and semester.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create section.' });
    }
  },

  // 5. Subject Management
  async getSubjects(req: Request, res: Response): Promise<void> {
    try {
      const { branch, semester } = req.query;
      const where: any = {};
      if (branch) where.branch = String(branch);
      if (semester) where.semester = Number(semester);

      const subjects = await prisma.subject.findMany({
        where,
        orderBy: [{ semester: 'asc' }, { subjectCode: 'asc' }],
      });

      const enriched = subjects.map((sub) => ({
        ...sub,
        isLab: isLabCourse(sub.subjectCode, sub.subjectName),
        isOpenElective: isOpenElectiveCourse(sub.subjectCode, sub.subjectName),
      }));

      res.status(200).json({ success: true, subjects: enriched });
    } catch (error) {
      console.error('getSubjects error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
    }
  },

  async createSubject(req: Request, res: Response): Promise<void> {
    try {
      const { subjectCode, subjectName, branch, semester } = req.body;
      if (!subjectCode || !subjectName || !branch || !semester) {
        res.status(400).json({
          success: false,
          message: 'subjectCode, subjectName, branch, and semester are required.',
        });
        return;
      }

      const subject = await prisma.subject.create({
        data: {
          subjectCode: subjectCode.trim().toUpperCase(),
          subjectName: subjectName.trim(),
          branch: branch.trim().toUpperCase(),
          semester: Number(semester),
        },
      });

      res.status(201).json({
        success: true,
        message: `Subject ${subject.subjectCode} created successfully.`,
        subject: {
          ...subject,
          isLab: isLabCourse(subject.subjectCode, subject.subjectName),
          isOpenElective: isOpenElectiveCourse(subject.subjectCode, subject.subjectName),
        },
      });
    } catch (error: any) {
      console.error('createSubject error:', error);
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Subject with this code already exists for this branch and semester.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create subject.' });
    }
  },

  async updateSubject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { subjectName, subjectCode } = req.body;

      const data: any = {};
      if (subjectName) data.subjectName = subjectName.trim();
      if (subjectCode) data.subjectCode = subjectCode.trim().toUpperCase();

      const updated = await prisma.subject.update({
        where: { id },
        data,
      });

      res.status(200).json({
        success: true,
        message: 'Subject updated successfully.',
        subject: updated,
      });
    } catch (error) {
      console.error('updateSubject error:', error);
      res.status(500).json({ success: false, message: 'Failed to update subject.' });
    }
  },

  async deleteSubject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
          _count: {
            select: { marks: true, allocations: true },
          },
        },
      });

      if (!subject) {
        res.status(404).json({ success: false, message: 'Subject not found.' });
        return;
      }

      // Safeguard: Protect real college marks from accidental deletion
      if (subject._count.marks > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot delete subject "${subject.subjectCode} - ${subject.subjectName}" because it already has ${subject._count.marks} examination marks entered. To protect student academic records, subjects with existing marks cannot be deleted.`,
        });
        return;
      }

      // Delete any allocations first
      if (subject._count.allocations > 0) {
        await prisma.facultyAllocation.deleteMany({
          where: { subjectId: id },
        });
      }

      // Delete the subject
      await prisma.subject.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: `Subject ${subject.subjectCode} (${subject.subjectName}) deleted successfully.`,
      });
    } catch (error) {
      console.error('deleteSubject error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete subject.' });
    }
  },

  // 6. Faculty Allocations Management
  async getAllocations(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear, semesterNumber, branch, sectionId, facultyId, subjectId } = req.query;
      const where: any = {};

      if (academicYear) where.academicYear = String(academicYear);
      if (semesterNumber) where.semesterNumber = Number(semesterNumber);
      if (branch) where.branch = String(branch);
      if (sectionId) where.sectionId = String(sectionId);
      if (facultyId) where.facultyId = String(facultyId);
      if (subjectId) where.subjectId = String(subjectId);

      const allocations = await prisma.facultyAllocation.findMany({
        where,
        include: {
          section: true,
          subject: true,
          faculty: {
            select: {
              id: true,
              facultyId: true,
              name: true,
              department: true,
            },
          },
        },
        orderBy: [
          { semesterNumber: 'asc' },
          { branch: 'asc' },
          { section: { sectionName: 'asc' } },
          { subject: { subjectName: 'asc' } },
        ],
      });

      res.status(200).json({
        success: true,
        count: allocations.length,
        allocations,
      });
    } catch (error) {
      console.error('getAllocations error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch faculty allocations.' });
    }
  },

  async createAllocation(req: Request, res: Response): Promise<void> {
    try {
      const {
        academicYear,
        semesterNumber,
        branch,
        sectionId,
        subjectId,
        facultyId,
        isPrimary,
      } = req.body;

      if (!academicYear || !semesterNumber || !branch || !sectionId || !subjectId || !facultyId) {
        res.status(400).json({
          success: false,
          message: 'academicYear, semesterNumber, branch, sectionId, subjectId, and facultyId are required.',
        });
        return;
      }

      // Check section exists
      const section = await prisma.section.findUnique({ where: { id: sectionId } });
      if (!section) {
        res.status(404).json({ success: false, message: 'Section not found.' });
        return;
      }

      // Check subject exists (by id or subjectCode)
      let subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) {
        subject = await prisma.subject.findFirst({
          where: {
            subjectCode: subjectId,
            branch: String(branch),
            semester: Number(semesterNumber),
          },
        });
      }
      if (!subject) {
        res.status(404).json({ success: false, message: 'Subject not found.' });
        return;
      }

      // Check faculty exists by either UUID id or employee facultyId
      let faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
      if (!faculty) {
        faculty = await prisma.faculty.findUnique({ where: { facultyId: facultyId } });
      }
      if (!faculty) {
        res.status(404).json({ success: false, message: 'Faculty member not found.' });
        return;
      }

      // Upsert allocation
      const allocation = await prisma.facultyAllocation.upsert({
        where: {
          section_subject_faculty_unique: {
            sectionId: section.id,
            subjectId: subject.id,
            facultyId: faculty.id,
          },
        },
        update: {
          isActive: true,
          isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : true,
          academicYear: String(academicYear),
          semesterNumber: Number(semesterNumber),
          branch: String(branch),
        },
        create: {
          academicYear: String(academicYear),
          semesterNumber: Number(semesterNumber),
          branch: String(branch),
          sectionId: section.id,
          subjectId: subject.id,
          facultyId: faculty.id,
          isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : true,
          isActive: true,
        },
        include: {
          section: true,
          subject: true,
          faculty: true,
        },
      });

      res.status(201).json({
        success: true,
        message: `Successfully allocated ${allocation.faculty.name} to teach ${allocation.subject.subjectName} in Section ${allocation.section.sectionName}.`,
        allocation,
      });
    } catch (error) {
      console.error('createAllocation error:', error);
      res.status(500).json({ success: false, message: 'Failed to create faculty allocation.' });
    }
  },

  async toggleAllocationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alloc = await prisma.facultyAllocation.findUnique({ where: { id } });
      if (!alloc) {
        res.status(404).json({ success: false, message: 'Allocation not found.' });
        return;
      }

      const updated = await prisma.facultyAllocation.update({
        where: { id },
        data: { isActive: !alloc.isActive },
      });

      res.status(200).json({
        success: true,
        message: `Allocation is now ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
        allocation: updated,
      });
    } catch (error) {
      console.error('toggleAllocationStatus error:', error);
      res.status(500).json({ success: false, message: 'Failed to update allocation status.' });
    }
  },

  async deleteAllocation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.facultyAllocation.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Allocation removed successfully.' });
    } catch (error) {
      console.error('deleteAllocation error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete allocation.' });
    }
  },

  // 7. All-Section Marks Overview (Super Admin Institution View)
  async getAllSectionMarksOverview(req: Request, res: Response): Promise<void> {
    try {
      const {
        academicYear,
        semester,
        branch,
        sectionId,
        subjectId,
        examId,
        search,
      } = req.query;

      const whereStudent: any = {};
      if (branch) whereStudent.branch = String(branch);
      if (semester) whereStudent.semester = Number(semester);
      if (academicYear) whereStudent.academicYear = String(academicYear);
      if (search) {
        const query = String(search).trim();
        whereStudent.OR = [
          { registerNumber: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (sectionId) {
        const sec = await prisma.section.findUnique({ where: { id: String(sectionId) } });
        if (sec) {
          whereStudent.section = sec.sectionName;
          whereStudent.branch = sec.branch;
          whereStudent.semester = sec.semester;
        }
      }

      const students = await prisma.student.findMany({
        where: whereStudent,
        orderBy: [{ branch: 'asc' }, { section: 'asc' }, { registerNumber: 'asc' }],
        take: 200, // Safe page limit for overview
      });

      const isSessionalQuery = examId === 'SESSIONAL';
      const markWhere: any = {};
      if (subjectId) markWhere.subjectId = String(subjectId);
      if (examId && !isSessionalQuery) markWhere.examId = String(examId);
      if (sectionId) markWhere.sectionId = String(sectionId);

      const studentIds = students.map((s) => s.id);
      markWhere.studentId = { in: studentIds };

      const marks = await prisma.mark.findMany({
        where: markWhere,
        include: {
          subject: true,
          exam: true,
          faculty: { select: { id: true, name: true, facultyId: true } },
          section: true,
        },
      });

      const marksByStudent = new Map<string, any[]>();
      marks.forEach((m) => {
        if (!marksByStudent.has(m.studentId)) {
          marksByStudent.set(m.studentId, []);
        }
        marksByStudent.get(m.studentId)!.push(m);
      });

      const reportData = students.map((stu) => {
        const studentMarks = marksByStudent.get(stu.id) || [];

        // Group student's marks by subject to compute Sessional (80:20)
        const bySubject = new Map<string, any[]>();
        studentMarks.forEach((m) => {
          if (!bySubject.has(m.subjectId)) {
            bySubject.set(m.subjectId, []);
          }
          bySubject.get(m.subjectId)!.push(m);
        });

        const sessionals: any[] = [];
        bySubject.forEach((subMarks, subId) => {
          const sampleSubject = subMarks[0]?.subject;
          const isLab = sampleSubject ? isLabCourse(sampleSubject.subjectCode, sampleSubject.subjectName) : false;

          const mid1 = subMarks.find((m) => m.exam?.examType === 'MID_1');
          const mid2 = subMarks.find((m) => m.exam?.examType === 'MID_2');
          const labInternal = subMarks.find((m) => m.exam?.examType === 'LAB_INTERNAL');

          const mid1Total = mid1 ? mid1.total : null;
          const mid2Total = mid2 ? mid2.total : null;
          const labTotal = labInternal ? labInternal.total : null;

          let sessionalTotal: number | null = null;
          let bestWeighted = 0;
          let otherWeighted = 0;

          if (isLab) {
            sessionalTotal = labTotal !== null ? labTotal : (mid1Total !== null ? mid1Total : null);
          } else {
            if (mid1Total !== null && mid2Total !== null) {
              const higher = Math.max(mid1Total, mid2Total);
              const lower = Math.min(mid1Total, mid2Total);
              bestWeighted = parseFloat((higher * 0.8).toFixed(2));
              otherWeighted = parseFloat((lower * 0.2).toFixed(2));
              sessionalTotal = parseFloat((bestWeighted + otherWeighted).toFixed(2));
            } else if (mid1Total !== null) {
              bestWeighted = parseFloat((mid1Total * 0.8).toFixed(2));
              sessionalTotal = bestWeighted;
            } else if (mid2Total !== null) {
              bestWeighted = parseFloat((mid2Total * 0.8).toFixed(2));
              sessionalTotal = bestWeighted;
            }
          }

          sessionals.push({
            subjectId: subId,
            subjectCode: sampleSubject?.subjectCode,
            subjectName: sampleSubject?.subjectName,
            isLab,
            mid1Total,
            mid2Total,
            bestWeighted,
            otherWeighted,
            sessionalTotal,
            status: sessionalTotal !== null ? (sessionalTotal >= 12 ? 'PASSED' : 'FAILED') : 'PENDING',
          });
        });

        return {
          id: stu.id,
          registerNumber: stu.registerNumber,
          name: stu.name,
          branch: stu.branch,
          section: stu.section,
          semester: stu.semester,
          academicYear: stu.academicYear,
          marks: studentMarks,
          sessionals,
        };
      });

      res.status(200).json({
        success: true,
        totalStudents: students.length,
        totalMarksFound: marks.length,
        records: reportData,
      });
    } catch (error) {
      console.error('getAllSectionMarksOverview error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate marks overview.' });
    }
  },
};
