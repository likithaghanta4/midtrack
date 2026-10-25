import { prisma } from '../config/prisma.js';

async function main() {
  console.log('Ensuring all exams exist for 2026-2027 for Semesters 1 to 8...');
  const examTypes = ['MID_1', 'MID_2', 'LAB_INTERNAL'] as const;
  const targetYear = '2026-2027';

  for (let sem = 1; sem <= 8; sem++) {
    for (const et of examTypes) {
      await prisma.exam.upsert({
        where: {
          exam_composite_unique: {
            examType: et,
            academicYear: targetYear,
            semester: sem,
          },
        },
        update: {},
        create: {
          examType: et,
          academicYear: targetYear,
          semester: sem,
        },
      });
    }
  }

  console.log('All exams for 2026-2027 created/verified.');

  // Now re-link any marks currently pointing to 2025-2026 exams to the corresponding 2026-2027 exam
  const marks = await prisma.mark.findMany({
    include: {
      exam: true,
    },
  });

  console.log(`Total marks in database: ${marks.length}`);
  let migratedCount = 0;

  for (const m of marks) {
    if (m.exam.academicYear !== targetYear) {
      // Find the equivalent exam in targetYear
      const targetExam = await prisma.exam.findUnique({
        where: {
          exam_composite_unique: {
            examType: m.exam.examType,
            academicYear: targetYear,
            semester: m.exam.semester,
          },
        },
      });

      if (targetExam) {
        await prisma.mark.update({
          where: { id: m.id },
          data: { examId: targetExam.id },
        });
        migratedCount++;
      }
    }
  }

  console.log(`Successfully migrated ${migratedCount} marks to ${targetYear} exams.`);

  // Verify
  const marksByExam = await prisma.mark.groupBy({
    by: ['examId'],
    _count: true,
  });

  for (const item of marksByExam) {
    const ex = await prisma.exam.findUnique({ where: { id: item.examId } });
    console.log(`Exam ${ex?.examType} (Sem ${ex?.semester}, Year ${ex?.academicYear}): ${item._count} marks`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
