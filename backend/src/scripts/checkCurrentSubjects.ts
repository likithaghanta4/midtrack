import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function checkCurrentSubjects() {
  const subjects = await prisma.subject.findMany({
    where: {
      semester: { in: [3, 5, 7] },
    },
    orderBy: [{ semester: 'asc' }, { branch: 'asc' }, { subjectCode: 'asc' }],
  });

  console.log(`Total subjects in DB for Semesters 3, 5, 7: ${subjects.length}`);
  for (const s of subjects) {
    console.log(`[Sem ${s.semester}] [${s.branch}] ${s.subjectCode} - ${s.subjectName}`);
  }
}

checkCurrentSubjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
