import { prisma } from '../config/prisma.js';

async function main() {
  const studentsSummary = await prisma.student.groupBy({
    by: ['branch', 'section', 'semester', 'academicYear'],
    _count: true,
  });
  console.log('Students by branch/sec/sem/year:', JSON.stringify(studentsSummary, null, 2));

  const sections = await prisma.section.findMany({
    select: { id: true, sectionName: true, branch: true, semester: true, academicYear: true }
  });
  console.log('Sections:', JSON.stringify(sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
