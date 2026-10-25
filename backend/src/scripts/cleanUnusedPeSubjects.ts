import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

// Subjects present in the timetable PDF/Excel for 2026-2027 Sem 1:
// In Sem 5:
// - CSD: B23CD3104 (Software Engineering - PE-I for CSD)
// - CSIT: B23CT3102 (Visual Design and Communication - PE-I for CSIT)
// In Sem 7:
// - CSD & CSIT: B23CT4103 (PE-IV: Data Science Using Python)
// - CSD & CSIT: B23CD4107 (PE-V: Big Data Analysis)

// We want to KEEP all standard timetable subjects:
// And REMOVE all other PE subjects (e.g. PE-I: Cyber Security, PE-I: AI, PE-IV: DevOps, PE-V: Game Design, etc.)
// that are NOT in the provided timetable and have 0 marks.

async function cleanPeSubjects() {
  console.log('=== CLEANING UNUSED PE SUBJECTS ===\n');

  // Find all subjects in DB
  const allSubjects = await prisma.subject.findMany({
    include: {
      marks: true,
      allocations: true,
    },
  });

  console.log(`Total subjects in database: ${allSubjects.length}`);

  // Retained PE codes according to timetable:
  const allowedPeCodes = [
    'B23CD3104', // Software Engineering (PE-I CSD)
    'B23CT3102', // Visual Design and Communication (PE-I CSIT)
    'B23CT4103', // PE-IV: Data Science Using Python
    'B23CD4107', // PE-V: Big Data Analysis
  ];

  // Identify unused PE subjects
  const toDelete: typeof allSubjects = [];

  for (const s of allSubjects) {
    const isPe =
      s.subjectName.toLowerCase().startsWith('pe-') ||
      s.subjectName.toLowerCase().includes('professional elective') ||
      s.subjectCode.startsWith('B23CD3105') ||
      s.subjectCode.startsWith('B23CD3106') ||
      s.subjectCode.startsWith('B23CD3107') ||
      s.subjectCode.startsWith('B23CD3108') ||
      s.subjectCode.startsWith('B23CT3103') ||
      s.subjectCode.startsWith('B23CT3104') ||
      s.subjectCode.startsWith('B23CT3105');

    if (isPe) {
      if (allowedPeCodes.includes(s.subjectCode)) {
        console.log(`[KEEP - In Timetable] [Sem ${s.semester}] [${s.branch}] ${s.subjectCode} - ${s.subjectName} (Marks: ${s.marks.length}, Allocations: ${s.allocations.length})`);
      } else {
        if (s.marks.length > 0) {
          console.warn(`[WARN - HAS MARKS! CANNOT DELETE] [Sem ${s.semester}] [${s.branch}] ${s.subjectCode} - ${s.subjectName}`);
        } else {
          toDelete.push(s);
          console.log(`[DELETE CANDIDATE] [Sem ${s.semester}] [${s.branch}] ${s.subjectCode} - ${s.subjectName} (Marks: ${s.marks.length}, Allocations: ${s.allocations.length})`);
        }
      }
    }
  }

  console.log(`\nFound ${toDelete.length} unused PE subjects to delete.`);

  if (toDelete.length === 0) {
    console.log('No subjects to delete.');
    return;
  }

  // First delete any inactive allocations for these subjects
  const subjectIdsToDelete = toDelete.map(s => s.id);
  const deletedAllocations = await prisma.facultyAllocation.deleteMany({
    where: {
      subjectId: { in: subjectIdsToDelete },
    },
  });
  console.log(`Deleted ${deletedAllocations.count} dangling allocations for unused PE subjects.`);

  // Now delete the subjects themselves
  const deletedSubjects = await prisma.subject.deleteMany({
    where: {
      id: { in: subjectIdsToDelete },
    },
  });
  console.log(`Deleted ${deletedSubjects.count} unused PE subjects from the database.`);

  // Verify remaining subjects
  const remainingSubjects = await prisma.subject.findMany({
    where: {
      semester: { in: [3, 5, 7] },
    },
    orderBy: [{ semester: 'asc' }, { branch: 'asc' }, { subjectCode: 'asc' }],
  });

  console.log(`\nRemaining subjects for Semesters 3, 5, 7: ${remainingSubjects.length}`);
  for (const s of remainingSubjects) {
    console.log(`- [Sem ${s.semester}] [${s.branch}] ${s.subjectCode} - ${s.subjectName}`);
  }
}

cleanPeSubjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
