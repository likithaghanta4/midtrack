import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== MIGRATING DATABASE TO OFFICIAL B.TECH SEMESTER NUMBERS ===');
  console.log('2nd Year -> Sem 3 (II-I) & Sem 4 (II-II)');
  console.log('3rd Year -> Sem 5 (III-I) & Sem 6 (III-II)');
  console.log('4th Year -> Sem 7 (IV-I) & Sem 8 (IV-II)');

  // 1. Update Sections
  console.log('\n1. Updating Sections...');
  // 4th Year (was 6 -> 7)
  await prisma.section.updateMany({
    where: { semester: 6 },
    data: { semester: 7 },
  });
  // 3rd Year (was 4 -> 5)
  await prisma.section.updateMany({
    where: { semester: 4 },
    data: { semester: 5 },
  });
  // 2nd Year (was 2 -> 3)
  await prisma.section.updateMany({
    where: { semester: 2 },
    data: { semester: 3 },
  });

  // 2. Update Students
  console.log('2. Updating Students...');
  // 4th Year (was 6 -> 7)
  const st7 = await prisma.student.updateMany({
    where: { semester: 6 },
    data: { semester: 7 },
  });
  console.log(`   Updated ${st7.count} 4th Year students to semester 7.`);

  // 3rd Year (was 4 -> 5)
  const st5 = await prisma.student.updateMany({
    where: { semester: 4 },
    data: { semester: 5 },
  });
  console.log(`   Updated ${st5.count} 3rd Year students to semester 5.`);

  // 2nd Year (was 2 -> 3)
  const st3 = await prisma.student.updateMany({
    where: { semester: 2 },
    data: { semester: 3 },
  });
  console.log(`   Updated ${st3.count} 2nd Year students to semester 3.`);

  // 3. Clean and reseed subjects & exams
  console.log('\n3. Cleaning unlinked obsolete subjects and exams...');
  try {
    const unlinkedSubjects = await prisma.subject.findMany({
      where: { marks: { none: {} } },
      select: { id: true },
    });
    if (unlinkedSubjects.length > 0) {
      await prisma.subject.deleteMany({
        where: { id: { in: unlinkedSubjects.map((s) => s.id) } },
      });
      console.log(`   Cleaned ${unlinkedSubjects.length} unlinked old subjects.`);
    }
  } catch (err) {
    console.warn('Subject cleanup warning:', err);
  }

  console.log('\nMigration complete.');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
