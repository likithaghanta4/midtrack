import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../config/prisma';

interface DumpData {
  users: any[];
  faculty: any[];
  students: any[];
  sections: any[];
  subjects: any[];
  exams: any[];
  marks: any[];
}

function parseDate(val: any): Date {
  if (!val) return new Date();
  if (typeof val === 'number') return new Date(val);
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function importDumpToPostgres() {
  console.log('=======================================================');
  console.log(' STARTING NEON POSTGRESQL LOSSLESS DATA IMPORT');
  console.log('=======================================================\n');

  const dumpFilePath = path.resolve(__dirname, '../../data/sqlite_dump.json');
  if (!fs.existsSync(dumpFilePath)) {
    throw new Error(`Dump file not found at ${dumpFilePath}. Please run 'npm run data:export-sqlite' first.`);
  }

  const raw = fs.readFileSync(dumpFilePath, 'utf-8');
  const data: DumpData = JSON.parse(raw);

  console.log(`Loaded dataset from ${dumpFilePath}:`);
  console.log(` - Users:    ${data.users?.length || 0}`);
  console.log(` - Faculty:  ${data.faculty?.length || 0}`);
  console.log(` - Students: ${data.students?.length || 0}`);
  console.log(` - Sections: ${data.sections?.length || 0}`);
  console.log(` - Subjects: ${data.subjects?.length || 0}`);
  console.log(` - Exams:    ${data.exams?.length || 0}`);
  console.log(` - Marks:    ${data.marks?.length || 0}\n`);

  // 1. IMPORT USERS
  console.log('>>> [1/7] Importing Users...');
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        username: u.username,
        passwordHash: u.password_hash || u.passwordHash,
        role: u.role || 'STUDENT',
        updatedAt: parseDate(u.updated_at || u.updatedAt),
      },
      create: {
        id: u.id,
        username: u.username,
        passwordHash: u.password_hash || u.passwordHash,
        role: u.role || 'STUDENT',
        createdAt: parseDate(u.created_at || u.createdAt),
        updatedAt: parseDate(u.updated_at || u.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.users.length} Users imported.`);

  // 2. IMPORT SECTIONS
  console.log('>>> [2/7] Importing Sections...');
  for (const s of data.sections) {
    await prisma.section.upsert({
      where: { id: s.id },
      update: {
        sectionName: s.section_name || s.sectionName,
        branch: s.branch,
        academicYear: s.academic_year || s.academicYear,
        semester: Number(s.semester),
        updatedAt: parseDate(s.updated_at || s.updatedAt),
      },
      create: {
        id: s.id,
        sectionName: s.section_name || s.sectionName,
        branch: s.branch,
        academicYear: s.academic_year || s.academicYear,
        semester: Number(s.semester),
        createdAt: parseDate(s.created_at || s.createdAt),
        updatedAt: parseDate(s.updated_at || s.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.sections.length} Sections imported.`);

  // 3. IMPORT SUBJECTS
  console.log('>>> [3/7] Importing Subjects...');
  for (const sub of data.subjects) {
    await prisma.subject.upsert({
      where: { id: sub.id },
      update: {
        subjectCode: sub.subject_code || sub.subjectCode,
        subjectName: sub.subject_name || sub.subjectName,
        branch: sub.branch,
        semester: Number(sub.semester),
        updatedAt: parseDate(sub.updated_at || sub.updatedAt),
      },
      create: {
        id: sub.id,
        subjectCode: sub.subject_code || sub.subjectCode,
        subjectName: sub.subject_name || sub.subjectName,
        branch: sub.branch,
        semester: Number(sub.semester),
        createdAt: parseDate(sub.created_at || sub.createdAt),
        updatedAt: parseDate(sub.updated_at || sub.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.subjects.length} Subjects imported.`);

  // 4. IMPORT EXAMS
  console.log('>>> [4/7] Importing Exams...');
  for (const ex of data.exams) {
    await prisma.exam.upsert({
      where: { id: ex.id },
      update: {
        examType: ex.exam_name || ex.examType,
        academicYear: ex.academic_year || ex.academicYear,
        semester: Number(ex.semester),
        updatedAt: parseDate(ex.updated_at || ex.updatedAt),
      },
      create: {
        id: ex.id,
        examType: ex.exam_name || ex.examType,
        academicYear: ex.academic_year || ex.academicYear,
        semester: Number(ex.semester),
        createdAt: parseDate(ex.created_at || ex.createdAt),
        updatedAt: parseDate(ex.updated_at || ex.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.exams.length} Exams imported.`);

  // 5. IMPORT FACULTY
  console.log('>>> [5/7] Importing Faculty...');
  for (const f of data.faculty) {
    await prisma.faculty.upsert({
      where: { id: f.id },
      update: {
        userId: f.user_id || f.userId,
        facultyId: f.faculty_id || f.facultyId,
        name: f.name,
        department: f.department || null,
        updatedAt: parseDate(f.updated_at || f.updatedAt),
      },
      create: {
        id: f.id,
        userId: f.user_id || f.userId,
        facultyId: f.faculty_id || f.facultyId,
        name: f.name,
        department: f.department || null,
        createdAt: parseDate(f.created_at || f.createdAt),
        updatedAt: parseDate(f.updated_at || f.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.faculty.length} Faculty members imported.`);

  // 6. IMPORT STUDENTS
  console.log('>>> [6/7] Importing Students...');
  for (const st of data.students) {
    await prisma.student.upsert({
      where: { id: st.id },
      update: {
        userId: st.user_id || st.userId,
        registerNumber: st.register_number || st.registerNumber,
        name: st.name,
        branch: st.branch,
        section: st.section,
        academicYear: st.academic_year || st.academicYear,
        semester: Number(st.semester),
        updatedAt: parseDate(st.updated_at || st.updatedAt),
      },
      create: {
        id: st.id,
        userId: st.user_id || st.userId,
        registerNumber: st.register_number || st.registerNumber,
        name: st.name,
        branch: st.branch,
        section: st.section,
        academicYear: st.academic_year || st.academicYear,
        semester: Number(st.semester),
        createdAt: parseDate(st.created_at || st.createdAt),
        updatedAt: parseDate(st.updated_at || st.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.students.length} Students imported.`);

  // 7. IMPORT MARKS
  console.log('>>> [7/7] Importing Marks Records...');
  for (const m of data.marks) {
    await prisma.mark.upsert({
      where: { id: m.id },
      update: {
        studentId: m.student_id || m.studentId,
        facultyId: m.faculty_id || m.facultyId || null,
        subjectId: m.subject_id || m.subjectId,
        sectionId: m.section_id || m.sectionId,
        examId: m.exam_id || m.examId,
        descriptiveQ1OrQ2: m.descriptive_q1_or_q2 ?? m.descriptiveQ1OrQ2 ?? 0,
        descriptiveQ3OrQ4: m.descriptive_q3_or_q4 ?? m.descriptiveQ3OrQ4 ?? 0,
        descriptiveQ5OrQ6: m.descriptive_q5_or_q6 ?? m.descriptiveQ5OrQ6 ?? 0,
        descriptiveTotal: m.descriptive_total ?? m.descriptiveTotal ?? 0,
        objectiveQ1: m.objective_q1 ?? m.objectiveQ1 ?? 0,
        objectiveQ2: m.objective_q2 ?? m.objectiveQ2 ?? 0,
        objectiveQ3: m.objective_q3 ?? m.objectiveQ3 ?? 0,
        objectiveQ4: m.objective_q4 ?? m.objectiveQ4 ?? 0,
        objectiveQ5: m.objective_q5 ?? m.objectiveQ5 ?? 0,
        objectiveTotal: m.objective_total ?? m.objectiveTotal ?? 0,
        assignmentMarks: m.assignment_marks ?? m.assignmentMarks ?? 0,
        total: m.total ?? 0,
        updatedAt: parseDate(m.updated_at || m.updatedAt),
      },
      create: {
        id: m.id,
        studentId: m.student_id || m.studentId,
        facultyId: m.faculty_id || m.facultyId || null,
        subjectId: m.subject_id || m.subjectId,
        sectionId: m.section_id || m.sectionId,
        examId: m.exam_id || m.examId,
        descriptiveQ1OrQ2: m.descriptive_q1_or_q2 ?? m.descriptiveQ1OrQ2 ?? 0,
        descriptiveQ3OrQ4: m.descriptive_q3_or_q4 ?? m.descriptiveQ3OrQ4 ?? 0,
        descriptiveQ5OrQ6: m.descriptive_q5_or_q6 ?? m.descriptiveQ5OrQ6 ?? 0,
        descriptiveTotal: m.descriptive_total ?? m.descriptiveTotal ?? 0,
        objectiveQ1: m.objective_q1 ?? m.objectiveQ1 ?? 0,
        objectiveQ2: m.objective_q2 ?? m.objectiveQ2 ?? 0,
        objectiveQ3: m.objective_q3 ?? m.objectiveQ3 ?? 0,
        objectiveQ4: m.objective_q4 ?? m.objectiveQ4 ?? 0,
        objectiveQ5: m.objective_q5 ?? m.objectiveQ5 ?? 0,
        objectiveTotal: m.objective_total ?? m.objectiveTotal ?? 0,
        assignmentMarks: m.assignment_marks ?? m.assignmentMarks ?? 0,
        total: m.total ?? 0,
        createdAt: parseDate(m.created_at || m.createdAt),
        updatedAt: parseDate(m.updated_at || m.updatedAt),
      },
    });
  }
  console.log(`    ✓ ${data.marks.length} Marks records imported.`);

  console.log('\n=======================================================');
  console.log(' NEON POSTGRESQL IMPORT COMPLETED SUCCESSFULLY');
  console.log('=======================================================\n');
}

if (require.main === module) {
  importDumpToPostgres()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('Import Failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
