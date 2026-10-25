import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { isLabCourse } from './facultyController';

/**
 * Helper to compute sessional mark using official SRKR autonomous formula for theory:
 * S = (Higher Mid * 0.8) + (Lower Mid * 0.2)
 */
const computeSessional = (mid1: number | null, mid2: number | null): number | null => {
  if (mid1 === null && mid2 === null) return null;
  if (mid1 !== null && mid2 === null) return parseFloat((mid1 * 0.8).toFixed(2));
  if (mid1 === null && mid2 !== null) return parseFloat((mid2 * 0.8).toFixed(2));
  if (mid1 !== null && mid2 !== null) {
    const higher = Math.max(mid1, mid2);
    const lower = Math.min(mid1, mid2);
    const sessional = higher * 0.8 + lower * 0.2;
    return parseFloat(sessional.toFixed(2));
  }
  return null;
};

/**
 * 1. GET /api/student/dashboard
 * Retrieves comprehensive student academic performance, enrolled subjects,
 * question-level breakdowns for Mid-1 & Mid-2, and computed sessionals.
 */
export const getStudentDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentProfile = req.user?.studentProfile;
    if (!studentProfile) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    // 1. Fetch student record
    const student = await prisma.student.findUnique({
      where: { id: studentProfile.id },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found.' });
      return;
    }

    const activeSemester = req.query.semester ? Number(req.query.semester) : student.semester;

    // 1. Fetch current active academic year
    const currentAy = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const activeAy = currentAy?.year || '2026-2027';

    // 2. Fetch subjects for student's exact section based on active faculty allocations
    const section = await prisma.section.findFirst({
      where: {
        academicYear: activeAy,
        semester: activeSemester,
        branch: student.branch,
        sectionName: student.section,
      },
    });

    let subjects: any[] = [];
    if (section) {
      const allocations = await prisma.facultyAllocation.findMany({
        where: {
          sectionId: section.id,
          semesterNumber: activeSemester,
          academicYear: activeAy,
          isActive: true,
        },
        include: { subject: true },
      });

      const uniqueSubjectMap = new Map<string, any>();
      for (const a of allocations) {
        if (a.subject && !uniqueSubjectMap.has(a.subject.id)) {
          uniqueSubjectMap.set(a.subject.id, a.subject);
        }
      }
      subjects = Array.from(uniqueSubjectMap.values()).sort((a, b) =>
        a.subjectCode.localeCompare(b.subjectCode)
      );
    }

    // Fallback if no specific section allocations exist
    if (subjects.length === 0) {
      subjects = await prisma.subject.findMany({
        where: {
          branch: student.branch,
          semester: activeSemester,
        },
        orderBy: { subjectCode: 'asc' },
      });
    }

    // 3. Fetch all marks entered for this student
    const studentMarks = await prisma.mark.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        subject: true,
        exam: true,
      },
    });

    // 4. Structure subject cards and grade rows
    const subjectReports = subjects.map((subject) => {
      const isLab = isLabCourse(subject.subjectCode, subject.subjectName);

      if (isLab) {
        // Lab course: Single internal mark (no 80:20 formula)
        const labMark = studentMarks.find(
          (m) =>
            m.subjectId === subject.id &&
            (m.exam?.examType === 'LAB_INTERNAL' || m.exam?.examType === 'MID_1')
        );

        const labTotal = labMark ? labMark.total : null;
        let status: 'PASSED' | 'FAILED' | 'INCOMPLETE' = 'INCOMPLETE';
        if (labTotal !== null) {
          status = labTotal >= 12 ? 'PASSED' : 'FAILED';
        }

        return {
          subjectId: subject.id,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          branch: subject.branch,
          semester: subject.semester,
          isLab: true,
          labTotal,
          mid1: null,
          mid2: null,
          higherMid: null,
          lowerMid: null,
          sessionalTotal: labTotal,
          status,
        };
      }

      // Theory course
      const mid1Mark = studentMarks.find(
        (m) => m.subjectId === subject.id && m.exam?.examType === 'MID_1'
      );
      const mid2Mark = studentMarks.find(
        (m) => m.subjectId === subject.id && m.exam?.examType === 'MID_2'
      );

      const mid1Total = mid1Mark ? mid1Mark.total : null;
      const mid2Total = mid2Mark ? mid2Mark.total : null;
      const sessionalTotal = computeSessional(mid1Total, mid2Total);

      const higherMid =
        mid1Total !== null && mid2Total !== null
          ? Math.max(mid1Total, mid2Total)
          : mid1Total !== null
          ? mid1Total
          : mid2Total !== null
          ? mid2Total
          : null;

      const lowerMid =
        mid1Total !== null && mid2Total !== null
          ? Math.min(mid1Total, mid2Total)
          : null;

      let status: 'PASSED' | 'FAILED' | 'INCOMPLETE' = 'INCOMPLETE';
      if (sessionalTotal !== null) {
        status = sessionalTotal >= 12 ? 'PASSED' : 'FAILED';
      }

      return {
        subjectId: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        branch: subject.branch,
        semester: subject.semester,
        isLab: false,
        labTotal: null,
        mid1: mid1Mark
          ? {
              total: mid1Mark.total,
              descriptiveQ1OrQ2: mid1Mark.descriptiveQ1OrQ2,
              descriptiveQ3OrQ4: mid1Mark.descriptiveQ3OrQ4,
              descriptiveQ5OrQ6: mid1Mark.descriptiveQ5OrQ6,
              descriptiveTotal: mid1Mark.descriptiveTotal,
              objectiveQ1: mid1Mark.objectiveQ1,
              objectiveQ2: mid1Mark.objectiveQ2,
              objectiveQ3: mid1Mark.objectiveQ3,
              objectiveQ4: mid1Mark.objectiveQ4,
              objectiveQ5: mid1Mark.objectiveQ5,
              objectiveTotal: mid1Mark.objectiveTotal,
              assignmentMarks: mid1Mark.assignmentMarks,
            }
          : null,
        mid2: mid2Mark
          ? {
              total: mid2Mark.total,
              descriptiveQ1OrQ2: mid2Mark.descriptiveQ1OrQ2,
              descriptiveQ3OrQ4: mid2Mark.descriptiveQ3OrQ4,
              descriptiveQ5OrQ6: mid2Mark.descriptiveQ5OrQ6,
              descriptiveTotal: mid2Mark.descriptiveTotal,
              objectiveQ1: mid2Mark.objectiveQ1,
              objectiveQ2: mid2Mark.objectiveQ2,
              objectiveQ3: mid2Mark.objectiveQ3,
              objectiveQ4: mid2Mark.objectiveQ4,
              objectiveQ5: mid2Mark.objectiveQ5,
              objectiveTotal: mid2Mark.objectiveTotal,
              assignmentMarks: mid2Mark.assignmentMarks,
            }
          : null,
        higherMid,
        lowerMid,
        sessionalTotal,
        status,
      };
    });

    // 5. Summary metrics
    const evaluatedSubjects = subjectReports.filter((s) => s.sessionalTotal !== null);
    const averageSessional =
      evaluatedSubjects.length > 0
        ? parseFloat(
            (
              evaluatedSubjects.reduce((sum, s) => sum + (s.sessionalTotal || 0), 0) /
              evaluatedSubjects.length
            ).toFixed(2)
          )
        : null;

    const totalPassed = subjectReports.filter((s) => s.status === 'PASSED').length;
    const totalFailed = subjectReports.filter((s) => s.status === 'FAILED').length;
    const totalIncomplete = subjectReports.filter((s) => s.status === 'INCOMPLETE').length;

    res.status(200).json({
      success: true,
      student: {
        id: student.id,
        registerNumber: student.registerNumber,
        name: student.name,
        branch: student.branch,
        section: student.section,
        academicYear: student.academicYear,
        semester: activeSemester,
      },
      stats: {
        totalSubjects: subjects.length,
        evaluatedSubjects: evaluatedSubjects.length,
        averageSessional,
        totalPassed,
        totalFailed,
        totalIncomplete,
      },
      subjects: subjectReports,
    });
  } catch (error: any) {
    console.error('getStudentDashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load student dashboard' });
  }
};
