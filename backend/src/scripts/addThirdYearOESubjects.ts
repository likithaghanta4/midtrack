import dotenv from 'dotenv';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const url = process.env.DATABASE_URL || '';
if (!url) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sql = neon(url);

interface SubjectInsert {
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
}

const OE_SUBJECTS_TO_ENSURE: SubjectInsert[] = [
  // 3rd Year Sem 1 (Semester 5)
  { subjectCode: 'B23OE3101', subjectName: 'Open Elective-I', branch: 'CSIT', semester: 5 },
  { subjectCode: 'B23OE3101', subjectName: 'Open Elective-I', branch: 'CSD', semester: 5 },

  // 3rd Year Sem 2 (Semester 6)
  { subjectCode: 'B23OE3201', subjectName: 'Open Elective-II', branch: 'CSIT', semester: 6 },
  { subjectCode: 'B23OE3201', subjectName: 'Open Elective-II', branch: 'CSD', semester: 6 },
];

async function main() {
  console.log('>>> Ensuring 3rd Year Open Elective (OE) subjects in Neon PostgreSQL...');
  
  for (const s of OE_SUBJECTS_TO_ENSURE) {
    const existing = await sql`
      SELECT id, subject_code, subject_name, branch, semester
      FROM subjects
      WHERE subject_code = ${s.subjectCode}
        AND branch = ${s.branch}
        AND semester = ${s.semester}
    `;

    if (existing.length === 0) {
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO subjects (id, subject_code, subject_name, branch, semester, created_at, updated_at)
        VALUES (${newId}, ${s.subjectCode}, ${s.subjectName}, ${s.branch}, ${s.semester}, NOW(), NOW())
      `;
      console.log(`+ Added: [Sem ${s.semester}] ${s.branch} -> ${s.subjectCode} - ${s.subjectName}`);
    } else {
      console.log(`= Already exists: [Sem ${s.semester}] ${s.branch} -> ${s.subjectCode} - ${s.subjectName}`);
    }
  }

  console.log('\n>>> Current Open Elective subjects in Neon database:');
  const allOE = await sql`
    SELECT id, subject_code, subject_name, branch, semester
    FROM subjects
    WHERE subject_code LIKE '%OE%' OR subject_name LIKE '%Open Elective%'
    ORDER BY semester, branch, subject_code
  `;
  console.table(allOE);
}

main().catch((err) => {
  console.error('Failed to add OE subjects:', err);
  process.exit(1);
});
