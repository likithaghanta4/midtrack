import { prisma } from '../config/prisma.js';

async function main() {
  const marks = await prisma.mark.findMany({
    take: 10,
    include: {
      exam: true,
      subject: true,
      student: true
    }
  });
  console.log('Sample marks count:', marks.length);
  for (const m of marks) {
    console.log(`Student: ${m.student.regNo}, Subj: ${m.subject.subjectCode}, Exam: ${m.exam.examType} (Sem ${m.exam.semester}, Year: ${m.exam.academicYear})`);
  }

  // Count marks by exam academicYear
  const marksByExamYear = await prisma.mark.groupBy({
    by: ['examId'],
    _count: true,
  });
  console.log('Exam IDs used in marks:', marksByExamYear);
  for (const item of marksByExamYear) {
    const ex = await prisma.exam.findUnique({ where: { id: item.examId } });
    console.log(`Exam ${item.examId}: type=${ex?.examType}, sem=${ex?.semester}, year=${ex?.academicYear}, count=${item._count}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
