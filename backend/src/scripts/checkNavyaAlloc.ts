import { prisma } from '../config/prisma.js';

async function main() {
  const fac = await prisma.faculty.findFirst({
    where: { facultyId: '1259' },
    include: {
      allocations: {
        include: {
          section: true,
          subject: true,
        }
      }
    }
  });

  console.log('Faculty:', fac?.name, fac?.facultyId);
  console.log('Allocations count:', fac?.allocations.length);
  for (const a of fac?.allocations || []) {
    console.log(`- Subj: ${a.subject?.subjectCode} (${a.subject?.subjectName}), Sec: ${a.section?.sectionName} (Sem ${a.section?.semester}), Active: ${a.isActive}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
