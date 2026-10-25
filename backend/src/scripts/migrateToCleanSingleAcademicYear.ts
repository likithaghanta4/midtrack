import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function migrate() {
  console.log('=== HARMONIZING TO SINGLE ACTIVE ACADEMIC YEAR (2026-2027) ===\n');

  // 1. Identify 2026-2027 sections
  const sec2026 = await prisma.section.findMany({
    where: { academicYear: '2026-2027' },
  });
  console.log(`Found ${sec2026.length} sections for 2026-2027.`);

  // Map "sem-branch-sectionName" -> 2026-2027 Section
  const secMap2026 = new Map<string, typeof sec2026[0]>();
  for (const s of sec2026) {
    const key = `${s.semester}-${s.branch}-${s.sectionName}`;
    secMap2026.set(key, s);
  }

  // 2. Identify 2025-2026 sections
  const sec2025 = await prisma.section.findMany({
    where: { academicYear: '2025-2026' },
  });
  console.log(`Found ${sec2025.length} old duplicate sections for 2025-2026.`);

  // 3. Move marks from 2025-2026 sections to 2026-2027 sections
  let movedMarksCount = 0;
  for (const oldSec of sec2025) {
    const key = `${oldSec.semester}-${oldSec.branch}-${oldSec.sectionName}`;
    const targetSec = secMap2026.get(key);

    if (targetSec) {
      const updateResult = await prisma.mark.updateMany({
        where: { sectionId: oldSec.id },
        data: { sectionId: targetSec.id },
      });
      console.log(`Moved ${updateResult.count} marks from [2025 ${oldSec.branch} ${oldSec.sectionName} Sem ${oldSec.semester}] to [2026 ${targetSec.branch} ${targetSec.sectionName} Sem ${targetSec.semester}]`);
      movedMarksCount += updateResult.count;
    } else {
      console.warn(`Could not find target 2026-2027 section for key: ${key}`);
    }
  }
  console.log(`✓ Total marks migrated to 2026-2027 sections: ${movedMarksCount}`);

  // 4. Delete old 2025-2026 allocations
  const delAllocs = await prisma.facultyAllocation.deleteMany({
    where: { academicYear: '2025-2026' },
  });
  console.log(`✓ Deleted ${delAllocs.count} old 2025-2026 allocations.`);

  // 5. Delete old 2025-2026 duplicate sections
  const delSecs = await prisma.section.deleteMany({
    where: { academicYear: '2025-2026' },
  });
  console.log(`✓ Deleted ${delSecs.count} old duplicate 2025-2026 sections.`);

  // 6. Update all 555 students to active academicYear: '2026-2027'
  const studentUpdate = await prisma.student.updateMany({
    where: { academicYear: '2025-2026' },
    data: { academicYear: '2026-2027' },
  });
  console.log(`✓ Updated ${studentUpdate.count} students to academicYear '2026-2027'.`);

  // 7. Verify all remaining sections and student counts
  const remainingSections = await prisma.section.findMany({
    orderBy: [{ semester: 'asc' }, { branch: 'asc' }, { sectionName: 'asc' }],
    include: {
      _count: {
        select: {
          marks: true,
          allocations: true,
        },
      },
    },
  });

  console.log(`\nRemaining sections in database: ${remainingSections.length} (Expected: 8)`);
  for (const s of remainingSections) {
    const studentCount = await prisma.student.count({
      where: {
        branch: s.branch,
        section: s.sectionName,
        semester: s.semester,
        academicYear: s.academicYear,
      },
    });
    console.log(`- [${s.academicYear}] Sem ${s.semester} [${s.branch} - ${s.sectionName}]: ${studentCount} Students, ${s._count.marks} Marks, ${s._count.allocations} Allocations`);
  }

  // 8. Total counts
  const totalStudents = await prisma.student.count();
  const totalMarks = await prisma.mark.count();
  console.log(`\nTotal Students in DB: ${totalStudents} (Expected: 555)`);
  console.log(`Total Marks in DB: ${totalMarks} (Expected: 576)`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
