import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function groupStudents() {
  const g = await prisma.student.groupBy({
    by: ['semester', 'branch', 'section'],
    _count: { id: true },
    orderBy: [{ semester: 'asc' }, { branch: 'asc' }, { section: 'asc' }],
  });
  console.log('Student breakdown by Semester, Branch, and Section:');
  for (const item of g) {
    console.log(`- Sem ${item.semester} | Branch: ${item.branch} | Section: "${item.section}" -> Count: ${item._count.id}`);
  }
}

groupStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
