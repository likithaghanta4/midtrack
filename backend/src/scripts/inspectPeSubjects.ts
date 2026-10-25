import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function inspectPeSubjects() {
  console.log('Inspecting PE (Professional Elective) Subjects in database...\n');

  // Find all subjects that have "PE-" or "PE " or "Professional Elective" in name or code
  const allSubjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: {
          marks: true,
          allocations: true,
        },
      },
    },
    orderBy: [{ semester: 'asc' }, { branch: 'asc' }, { subjectCode: 'asc' }],
  });

  const peSubjects = allSubjects.filter(
    (s) =>
      s.subjectName.includes('PE-') ||
      s.subjectName.includes('PE ') ||
      s.subjectName.includes('PE:') ||
      s.subjectCode.startsWith('B23CD410') ||
      s.subjectCode.startsWith('B23CT410') ||
      s.subjectName.toLowerCase().includes('elective')
  );

  console.log(`Found ${peSubjects.length} PE / Elective candidates in DB:\n`);
  for (const s of peSubjects) {
    console.log(
      `- [ID: ${s.id}] [Sem ${s.semester}] [${s.branch}] ${s.subjectCode} - ${s.subjectName} | Marks: ${s._count.marks} | Allocations: ${s._count.allocations}`
    );
  }
}

inspectPeSubjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
