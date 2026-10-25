import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function checkMarksSubjects() {
  const marks = await prisma.mark.findMany({
    select: {
      subjectId: true,
      subject: {
        select: {
          subjectCode: true,
          subjectName: true,
          semester: true,
          branch: true,
        },
      },
    },
    distinct: ['subjectId'],
  });

  console.log(`There are marks entered for ${marks.length} distinct subjects:`);
  for (const m of marks) {
    console.log(`- [Sem ${m.subject.semester}] [${m.subject.branch}] ${m.subject.subjectCode} - ${m.subject.subjectName}`);
  }
}

checkMarksSubjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
