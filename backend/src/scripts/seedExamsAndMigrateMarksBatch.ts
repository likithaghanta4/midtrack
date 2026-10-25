import { prisma } from '../config/prisma.js';

async function main() {
  console.log('Ensuring all exams exist for 2026-2027 for Semesters 1 to 8...');
  const examTypes = ['MID_1', 'MID_2', 'LAB_INTERNAL'] as const;
  const targetYear = '2026-2027';

  // Fetch all existing exams first
  const allExams = await prisma.exam.findMany();
  console.log(`Currently ${allExams.length} exams in DB.`);

  // Create missing 2026-2027 exams
  for (let sem = 1; sem <= 8; sem++) {
    for (const et of examTypes) {
      const exists = allExams.find(
        (e) => e.academicYear === targetYear && e.semester === sem && e.examType === et
      );
      if (!exists) {
        await prisma.exam.create({
          data: {
            academicYear: targetYear,
            semester: sem,
            examType: et,
          },
        });
      }
    }
  }

  // Refresh exam list
  const refreshedExams = await prisma.exam.findMany();
  console.log(`Now ${refreshedExams.length} exams in DB.`);

  // Find distinct examIds used in marks
  const usedExamIds = await prisma.mark.groupBy({
    by: ['examId'],
  });

  console.log(`Found ${usedExamIds.length} distinct exam IDs used in marks.`);

  for (const item of usedExamIds) {
    const currentExam = refreshedExams.find((e) => e.id === item.examId);
    if (currentExam && currentExam.academicYear !== targetYear) {
      const matchInTarget = refreshedExams.find(
        (e) =>
          e.academicYear === targetYear &&
          e.semester === currentExam.semester &&
          e.examType === currentExam.examType
      );

      if (matchInTarget) {
        const updateResult = await prisma.mark.updateMany({
          where: { examId: currentExam.id },
          data: { examId: matchInTarget.id },
        });
        console.log(
          `Updated ${updateResult.count} marks from ${currentExam.examType} (Sem ${currentExam.semester}, ${currentExam.academicYear}) to ${matchInTarget.academicYear}`
        );
      }
    }
  }

  // Final verification
  const marksSummary = await prisma.mark.groupBy({
    by: ['examId'],
    _count: true,
  });

  console.log('--- Final Marks Distribution ---');
  for (const it of marksSummary) {
    const ex = refreshedExams.find((e) => e.id === it.examId);
    console.log(
      `Exam: ${ex?.examType} (Sem ${ex?.semester}, Year ${ex?.academicYear}) => ${it._count} marks`
    );
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
