import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function checkAllocations() {
  const allocs = await prisma.facultyAllocation.findMany({
    include: {
      faculty: { select: { facultyId: true, name: true } },
      subject: { select: { subjectCode: true, subjectName: true } },
      section: { select: { sectionName: true, branch: true, semester: true } },
    },
    orderBy: [
      { semesterNumber: 'asc' },
      { branch: 'asc' },
    ],
  });

  console.log(`Total active allocations in DB: ${allocs.length}`);
  for (const a of allocs) {
    console.log(`[Sem ${a.semesterNumber}] [${a.section?.sectionName}] [${a.subject?.subjectCode} - ${a.subject?.subjectName}] -> Faculty: ${a.faculty?.name} (${a.faculty?.facultyId})`);
  }
}

checkAllocations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
