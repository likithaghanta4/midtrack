import { prisma } from '../config/prisma.js';

async function main() {
  const currentAy = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  const activeAy = currentAy?.year || '2026-2027';
  console.log('Active AY:', activeAy);

  const faculty = await prisma.faculty.findFirst({
    where: { facultyId: '1259' },
  });
  console.log('Faculty ID:', faculty?.id);

  const allocations = await prisma.facultyAllocation.findMany({
    where: {
      facultyId: faculty?.id,
      academicYear: activeAy,
      isActive: true,
    },
    include: {
      section: true,
      subject: true,
    }
  });

  console.log('Allocations found for activeAy:', allocations.length);
  for (const a of allocations) {
    console.log(`- Subj: ${a.subject?.subjectCode}, Sec: ${a.section?.sectionName} (Sem ${a.section?.semester}, AY: ${a.section?.academicYear}), SecId: ${a.sectionId}`);
  }

  const allocatedIds = Array.from(new Set(allocations.map((a) => a.sectionId)));
  console.log('Allocated Section IDs:', allocatedIds);

  const sections = await prisma.section.findMany({
    where: {
      academicYear: activeAy,
      id: { in: allocatedIds },
    },
  });
  console.log('Sections returned from DB:', sections.length);
  for (const s of sections) {
    console.log(`Sec: ${s.sectionName}, Sem: ${s.semester}, AY: ${s.academicYear}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
