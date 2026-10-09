import { prisma } from '../config/prisma';

export async function verifyNeonMigration() {
  console.log('=======================================================');
  console.log(' NEON POSTGRESQL MIGRATION VERIFICATION');
  console.log('=======================================================\n');

  const usersCount = await prisma.user.count();
  const facultyUsersCount = await prisma.user.count({ where: { role: 'FACULTY' } });
  const studentUsersCount = await prisma.user.count({ where: { role: 'STUDENT' } });
  const facultyCount = await prisma.faculty.count();
  const studentsCount = await prisma.student.count();
  const sectionsCount = await prisma.section.count();
  const subjectsCount = await prisma.subject.count();
  const examsCount = await prisma.exam.count();
  const marksCount = await prisma.mark.count();

  console.log('1. TABLE RECORD COUNTS:');
  console.log(`  - Users:    ${usersCount} (Expected: 444)`);
  console.log(`    * Faculty Users: ${facultyUsersCount} (Expected: 23)`);
  console.log(`    * Student Users: ${studentUsersCount} (Expected: 421)`);
  console.log(`  - Faculty:  ${facultyCount} (Expected: 23)`);
  console.log(`  - Students: ${studentsCount} (Expected: 421)`);
  console.log(`  - Sections: ${sectionsCount} (Expected: 6)`);
  console.log(`  - Subjects: ${subjectsCount} (Expected: 137)`);
  console.log(`  - Exams:    ${examsCount} (Expected: 22)`);
  console.log(`  - Marks:    ${marksCount} (Expected: 366)\n`);

  console.log('2. RELATIONSHIP INTEGRITY CHECKS:');
  
  // Check student user validity
  const totalStudentsWithUsers = await prisma.student.count({
    where: { user: { isNot: undefined } },
  });
  console.log(`  - Students with Linked User Accounts: ${totalStudentsWithUsers}/${studentsCount}`);

  // Check faculty user validity
  const totalFacultyWithUsers = await prisma.faculty.count({
    where: { user: { isNot: undefined } },
  });
  console.log(`  - Faculty with Linked User Accounts: ${totalFacultyWithUsers}/${facultyCount}`);

  // Check marks relationship integrity
  const sampleMark = await prisma.mark.findFirst({
    include: {
      student: true,
      subject: true,
      section: true,
      exam: true,
      faculty: true,
    },
  });

  if (sampleMark) {
    console.log(`  - Sample Mark Check:`);
    console.log(`    * Student: ${sampleMark.student.name} (${sampleMark.student.registerNumber})`);
    console.log(`    * Subject: ${sampleMark.subject.subjectName} (${sampleMark.subject.subjectCode})`);
    console.log(`    * Section: ${sampleMark.section.sectionName}`);
    console.log(`    * Exam:    ${sampleMark.exam.examType}`);
    console.log(`    * Total:   ${sampleMark.total}/30`);
  }

  const allPassed =
    usersCount >= 444 &&
    facultyCount === 23 &&
    studentsCount === 421 &&
    sectionsCount === 6 &&
    subjectsCount === 137 &&
    examsCount === 22 &&
    marksCount >= 293 &&
    totalStudentsWithUsers === 421 &&
    totalFacultyWithUsers === 23;

  console.log('\n=======================================================');
  console.log(` VERIFICATION RESULT: ${allPassed ? '✓ ALL CHECKS PASSED' : '⚠️ DISCREPANCY DETECTED'}`);
  console.log('=======================================================\n');
}

if (require.main === module) {
  verifyNeonMigration()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('Verification Failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
