import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function inspectSections() {
  const sections = await prisma.section.findMany({
    orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }, { branch: 'asc' }, { sectionName: 'asc' }],
    include: {
      _count: {
        select: {
          marks: true,
          allocations: true,
        },
      },
    },
  });

  console.log(`Total sections in DB: ${sections.length}`);
  for (const s of sections) {
    const studentCount = await prisma.student.count({
      where: {
        branch: s.branch,
        section: s.sectionName,
        semester: s.semester,
        academicYear: s.academicYear,
      },
    });
    const anyStudentCount = await prisma.student.count({
      where: {
        branch: s.branch,
        section: s.sectionName,
        semester: s.semester,
      },
    });
    console.log(`- [ID: ${s.id}] [AY: ${s.academicYear}] [Sem: ${s.semester}] [${s.branch} - ${s.sectionName}] -> Strict Students: ${studentCount}, Any AY Students: ${anyStudentCount}, Marks: ${s._count.marks}, Allocations: ${s._count.allocations}`);
  }

  // Also check students distinct academicYears
  const studentsAy = await prisma.student.groupBy({
    by: ['academicYear', 'semester'],
    _count: true,
  });
  console.log('\nStudents by academicYear & semester:');
  console.log(studentsAy);
}

inspectSections()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
