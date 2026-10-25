import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function checkSem7Sections() {
  const sections = await prisma.section.findMany({
    where: { semester: 7 },
  });
  console.log('Sem 7 Sections in DB:');
  for (const s of sections) {
    console.log(`- ID: ${s.id} | Year: ${s.academicYear} | Branch: ${s.branch} | Name: ${s.sectionName}`);
    const allocs = await prisma.facultyAllocation.findMany({
      where: { sectionId: s.id, isActive: true },
      include: { subject: true, faculty: true },
    });
    console.log(`  Allocations count (${allocs.length}):`);
    for (const a of allocs) {
      console.log(`    * [${a.academicYear}] [${a.subject?.subjectCode}] ${a.subject?.subjectName} -> ${a.faculty?.name}`);
    }
  }
}

checkSem7Sections()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
