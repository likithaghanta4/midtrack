import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

interface AllocationPlan {
  academicYear: string;
  sem: number;
  branch: string;
  sectionName: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  facultyId?: string; // EMPID
}

const allocationsPlan: AllocationPlan[] = [
  // =========================================================================
  // SEMESTER 3 (2nd Year Sem 1)
  // =========================================================================
  // 2-1 CSD
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23HS2101', subjectName: 'Universal Human Values -II', credits: 3, facultyId: '1339' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', credits: 3, facultyId: '1520' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CS2102', subjectName: 'Database Management Systems', credits: 3, facultyId: '1517' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CS2103', subjectName: 'Object-oriented programming through java', credits: 3, facultyId: '1472' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CS2104', subjectName: 'Database management systems lab', credits: 1.5, facultyId: '1517' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', credits: 1.5, facultyId: '1472' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CS2106', subjectName: 'Python programming', credits: 2, facultyId: '1503' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23MC2102', subjectName: 'Environmental science', credits: 0, facultyId: '1507' },

  // 2-1 CSIT-A
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23HS2101', subjectName: 'Universal Human Values -II', credits: 3, facultyId: '1339' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', credits: 3, facultyId: '1503' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CS2102', subjectName: 'Database Management Systems', credits: 3, facultyId: '1479' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CS2103', subjectName: 'Object-oriented programming through java', credits: 3, facultyId: '1472' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CS2104', subjectName: 'Database management systems lab', credits: 1.5, facultyId: '1520' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', credits: 1.5, facultyId: '1472' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CS2106', subjectName: 'Python programming', credits: 2, facultyId: '1498' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23MC2101', subjectName: 'English Proficiency', credits: 0, facultyId: '781' },

  // 2-1 CSIT-B
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23HS2101', subjectName: 'Universal Human Values -II', credits: 3, facultyId: '1339' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', credits: 3, facultyId: '1503' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CS2102', subjectName: 'Database Management Systems', credits: 3, facultyId: '1479' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CS2103', subjectName: 'Object-oriented programming through java', credits: 3, facultyId: '1480' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CS2104', subjectName: 'Database management systems lab', credits: 1.5, facultyId: '1479' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', credits: 1.5, facultyId: '1480' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CS2106', subjectName: 'Python programming', credits: 2, facultyId: '1498' },
  { academicYear: '2026-2027', sem: 3, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23MC2101', subjectName: 'English Proficiency', credits: 0, facultyId: '781' },

  // =========================================================================
  // SEMESTER 5 (3rd Year Sem 1)
  // =========================================================================
  // 3-1 CSD
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3101', subjectName: 'Visual Design and Communication', credits: 3, facultyId: '1259' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3102', subjectName: 'Computer Networks', credits: 3, facultyId: '1372' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', credits: 3, facultyId: '1348' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3104', subjectName: 'Software Engineering', credits: 3, facultyId: '1399' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23OE3101', subjectName: 'Open Elective-I', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3109', subjectName: 'Full Stack development-2 Lab', credits: 1.5, facultyId: '1376' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3110', subjectName: 'Data Mining and Data Warehousing Lab', credits: 1.5, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD3111', subjectName: 'SEC: Tinkering Lab', credits: 1, facultyId: '1398' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23BS3101', subjectName: 'Soft Skills', credits: 2, facultyId: '780' },

  // 3-1 CSIT-A
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CT3101', subjectName: 'Internet of Things', credits: 3, facultyId: '1382' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CD3102', subjectName: 'Computer Networks', credits: 3, facultyId: '1398' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CT3102', subjectName: 'Visual Design and Communication', credits: 3, facultyId: '1498' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', credits: 3, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23OE3101', subjectName: 'Open Elective-I', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CT3106', subjectName: 'Full Stack development-2 Lab', credits: 1.5, facultyId: '1372' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CT3107', subjectName: 'Data Mining and Data Warehousing Lab', credits: 1.5, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23CT3108', subjectName: 'SEC: Tinkering Lab', credits: 1, facultyId: '1259' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-A', subjectCode: 'B23BS3101', subjectName: 'Soft Skills', credits: 2, facultyId: '781' },

  // 3-1 CSIT-B
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CT3101', subjectName: 'Internet of Things', credits: 3, facultyId: '1382' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CD3102', subjectName: 'Computer Networks', credits: 3, facultyId: '1398' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CT3102', subjectName: 'Visual Design and Communication', credits: 3, facultyId: '1259' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', credits: 3, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23OE3101', subjectName: 'Open Elective-I', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CT3106', subjectName: 'Full Stack development-2 Lab', credits: 1.5, facultyId: '1376' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CT3107', subjectName: 'Data Mining and Data Warehousing Lab', credits: 1.5, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23CT3108', subjectName: 'SEC: Tinkering Lab', credits: 1, facultyId: '1382' },
  { academicYear: '2026-2027', sem: 5, branch: 'CSIT', sectionName: 'CSIT-B', subjectCode: 'B23BS3101', subjectName: 'Soft Skills', credits: 2, facultyId: '781' },

  // =========================================================================
  // SEMESTER 7 (4th Year Sem 1)
  // =========================================================================
  // 4-1 CSD
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CT4101', subjectName: 'Deep Learning', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23HS4101', subjectName: 'Human Resource and Project Management', credits: 2, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CT4103', subjectName: 'PE-IV: Data Science Using Python', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD4107', subjectName: 'PE-V: Big Data Analysis', credits: 3, facultyId: '1376' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23OE4101', subjectName: 'Open Elective-III', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23OE4102', subjectName: 'Open Elective-IV', credits: 3, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23CD4109', subjectName: 'Prompt Engineering', credits: 2, facultyId: '1348' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSD', sectionName: 'CSD', subjectCode: 'B23MC4101', subjectName: 'Constitution of India', credits: 0, facultyId: '1505' },

  // 4-1 CSIT
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23CT4101', subjectName: 'Deep Learning', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23HS4101', subjectName: 'Human Resource and Project Management', credits: 2, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23CT4103', subjectName: 'PE-IV: Data Science Using Python', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23CD4107', subjectName: 'PE-V: Big Data Analysis', credits: 3, facultyId: '1376' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23OE4101', subjectName: 'Open Elective-III', credits: 3, facultyId: '1507' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23OE4102', subjectName: 'Open Elective-IV', credits: 3, facultyId: '1474' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23CT4112', subjectName: 'Prompt Engineering', credits: 2, facultyId: '1348' },
  { academicYear: '2026-2027', sem: 7, branch: 'CSIT', sectionName: 'CSIT', subjectCode: 'B23MC4101', subjectName: 'Constitution of India', credits: 0, facultyId: '1505' },
];

async function syncAll() {
  console.log('=== SYNCING 2026-2027 SEMESTER 1 CURRICULUM & ALLOCATIONS ===\n');

  // 1. Ensure current academic year is 2026-2027
  let ay = await prisma.academicYear.findUnique({ where: { year: '2026-2027' } });
  if (!ay) {
    ay = await prisma.academicYear.create({
      data: { year: '2026-2027', isCurrent: true },
    });
  } else {
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    await prisma.academicYear.update({ where: { id: ay.id }, data: { isCurrent: true } });
  }
  console.log(`✓ Academic Year set to current: 2026-2027 (ID: ${ay.id})`);

  // 2. Ensure Semesters 3, 5, 7 are active; 4, 6, 8 are inactive
  for (let s = 1; s <= 8; s++) {
    const isActive = [3, 5, 7].includes(s);
    await prisma.semester.upsert({
      where: {
        academic_year_semester_unique: {
          academicYearId: ay.id,
          semesterNumber: s,
        },
      },
      update: { isActive },
      create: {
        academicYearId: ay.id,
        semesterNumber: s,
        name: `Semester ${s}`,
        isActive,
      },
    });
  }
  console.log('✓ Semesters 3, 5, 7 marked active (Odd Semester Scheme).');

  // 3. Ensure the 8 exact sections exist for 2026-2027
  const sectionDefs = [
    { name: 'CSD', branch: 'CSD', sem: 3 },
    { name: 'CSIT-A', branch: 'CSIT', sem: 3 },
    { name: 'CSIT-B', branch: 'CSIT', sem: 3 },
    { name: 'CSD', branch: 'CSD', sem: 5 },
    { name: 'CSIT-A', branch: 'CSIT', sem: 5 },
    { name: 'CSIT-B', branch: 'CSIT', sem: 5 },
    { name: 'CSD', branch: 'CSD', sem: 7 },
    { name: 'CSIT', branch: 'CSIT', sem: 7 },
  ];

  const sectionMap = new Map<string, string>(); // "sem-branch-name" -> section.id

  for (const s of sectionDefs) {
    let sec = await prisma.section.findFirst({
      where: {
        academicYear: '2026-2027',
        semester: s.sem,
        branch: s.branch,
        sectionName: s.name,
      },
    });

    if (!sec) {
      sec = await prisma.section.create({
        data: {
          academicYear: '2026-2027',
          semester: s.sem,
          branch: s.branch,
          sectionName: s.name,
        },
      });
    }
    const key = `${s.sem}-${s.branch}-${s.name}`;
    sectionMap.set(key, sec.id);
  }
  console.log(`✓ 8 Sections confirmed and mapped:`, Array.from(sectionMap.keys()));

  // 4. Ensure Subjects exist in database
  const subjectMap = new Map<string, string>(); // "sem-branch-code" -> subject.id

  for (const p of allocationsPlan) {
    const key = `${p.sem}-${p.branch}-${p.subjectCode}`;
    if (subjectMap.has(key)) continue;

    let sub = await prisma.subject.findFirst({
      where: {
        semester: p.sem,
        branch: p.branch,
        subjectCode: p.subjectCode,
      },
    });

    if (!sub) {
      sub = await prisma.subject.create({
        data: {
          subjectCode: p.subjectCode,
          subjectName: p.subjectName,
          semester: p.sem,
          branch: p.branch,
        },
      });
    } else if (sub.subjectName !== p.subjectName) {
      sub = await prisma.subject.update({
        where: { id: sub.id },
        data: { subjectName: p.subjectName },
      });
    }
    subjectMap.set(key, sub.id);
  }
  console.log(`✓ Subjects confirmed and mapped (${subjectMap.size} unique combinations).`);

  // 5. Faculty map
  const allFaculty = await prisma.faculty.findMany({ select: { id: true, facultyId: true, name: true } });
  const facultyMap = new Map<string, string>();
  for (const f of allFaculty) {
    facultyMap.set(f.facultyId, f.id);
  }

  // Deactivate any existing allocations for 2026-2027 to ensure ONLY the timetable allocations are active
  await prisma.facultyAllocation.updateMany({
    where: { academicYear: '2026-2027' },
    data: { isActive: false },
  });
  console.log('✓ Reset old 2026-2027 allocations to inactive.');

  // 6. Upsert Faculty Allocations
  let allocationCount = 0;
  for (const p of allocationsPlan) {
    const secKey = `${p.sem}-${p.branch}-${p.sectionName}`;
    const subKey = `${p.sem}-${p.branch}-${p.subjectCode}`;
    const sectionId = sectionMap.get(secKey);
    const subjectId = subjectMap.get(subKey);
    const facultyDbId = p.facultyId ? facultyMap.get(p.facultyId) : null;

    if (!sectionId || !subjectId || !facultyDbId) {
      console.warn(`Skipping allocation missing IDs: ${p.sem} ${p.branch} ${p.sectionName} ${p.subjectCode} faculty: ${p.facultyId}`);
      continue;
    }

    // Check if allocation already exists
    const existing = await prisma.facultyAllocation.findFirst({
      where: {
        academicYear: '2026-2027',
        semesterNumber: p.sem,
        sectionId,
        subjectId,
      },
    });

    if (existing) {
      await prisma.facultyAllocation.update({
        where: { id: existing.id },
        data: {
          facultyId: facultyDbId,
          branch: p.branch,
          isActive: true,
        },
      });
    } else {
      await prisma.facultyAllocation.create({
        data: {
          academicYear: '2026-2027',
          semesterNumber: p.sem,
          branch: p.branch,
          sectionId,
          subjectId,
          facultyId: facultyDbId,
          isActive: true,
          isPrimary: true,
        },
      });
    }
    allocationCount++;
  }

  console.log(`✓ Successfully synced ${allocationCount} faculty allocations for 2026-2027 Sem 1!`);
}

syncAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
