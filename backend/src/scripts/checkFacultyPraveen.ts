import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function checkPraveen() {
  const f = await prisma.faculty.findFirst({ where: { facultyId: '1348' } });
  console.log(`Faculty: ${f?.name} (ID: ${f?.facultyId}, UUID: ${f?.id})`);

  const allocs = await prisma.facultyAllocation.findMany({
    where: { facultyId: f?.id, isActive: true },
    include: { section: true, subject: true },
  });

  console.log(`Total active allocations for Praveen: ${allocs.length}`);
  for (const a of allocs) {
    console.log(`- [Allocation AY: ${a.academicYear}] [Sem: ${a.semesterNumber}] [Section: ${a.section.sectionName} (Section AY: ${a.section.academicYear}, ID: ${a.sectionId})] - ${a.subject.subjectCode}: ${a.subject.subjectName}`);
  }
}

checkPraveen()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
