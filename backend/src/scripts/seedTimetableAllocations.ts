import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface TimetableEntry {
  branch: string;
  sectionName: string;
  semester: number;
  subjectCodeOrPrefix: string;
  subjectName: string;
  teacherName: string;
  teacherEmpId?: string;
  isPrimary?: boolean;
}

export async function seedTimetableAllocations() {
  const url = process.env.DATABASE_URL || '';
  if (!url) throw new Error('DATABASE_URL is not set.');
  const sql = neon(url);

  console.log('================================================================================');
  console.log('SEEDING OFFICIAL SRKR TIMETABLE ALLOCATIONS (2ND, 3RD, 4TH YEARS)');
  console.log('================================================================================\n');

  // 1. Fetch current sections, faculty, and subjects
  const sections = await sql`SELECT id, branch, section_name, semester, academic_year FROM sections;`;
  const faculty = await sql`SELECT id, faculty_id, name FROM faculty;`;
  const subjects = await sql`SELECT id, subject_code, subject_name, branch, semester FROM subjects;`;

  console.log(`Found ${sections.length} sections, ${faculty.length} faculty, ${subjects.length} subjects in DB.\n`);

  // Helper to find faculty or create if guest/external faculty
  const defaultPasswordHash = bcrypt.hashSync(process.env.FACULTY_INITIAL_PASSWORD || 'admin@123', 10);
  
  async function getOrCreateFaculty(name: string, empId?: string): Promise<string> {
    const cleanName = name.trim().toUpperCase();
    
    // Check by name or empId in existing list
    const found = faculty.find((f: any) => {
      const dbName = f.name.trim().toUpperCase();
      if (empId && f.faculty_id === empId) return true;
      if (dbName === cleanName) return true;
      // Partial matching for known variations
      if (cleanName.includes('SUDHAKAR') && dbName.includes('SUDHAKAR')) return true;
      if (cleanName.includes('GIRIDHAR') && dbName.includes('GIRIDHAR')) return true;
      if (cleanName.includes('PRAVEEN') && dbName.includes('PRAVEEN')) return true;
      if (cleanName.includes('SRINIVAS RAO') && dbName.includes('SRINIVAS RAO')) return true;
      if (cleanName.includes('ASWINI PRIYANKA') && dbName.includes('ASWINI PRIYANKA')) return true;
      if (cleanName.includes('MOHAN KRISHNA') && dbName.includes('MOHAN KRISHNA')) return true;
      if (cleanName.includes('SURYA KUMAR') && dbName.includes('SURYA KUMAR')) return true;
      if (cleanName.includes('SATYAM') && dbName.includes('SATYAM')) return true;
      if (cleanName.includes('TRINADH NAIDU') && dbName.includes('TRINADH NAIDU')) return true;
      if (cleanName.includes('RAJESH NAIDU') && dbName.includes('RAJESH NAIDU')) return true;
      if (cleanName.includes('KRISHNA VENI') && dbName.includes('KRISHNA VENI')) return true;
      if (cleanName.includes('NAVYA') && dbName.includes('NAVYA')) return true;
      if (cleanName.includes('SUNIL VARMA') && dbName.includes('SUNIL VARMA')) return true;
      if (cleanName.includes('MOUNA') && dbName.includes('MOUNA')) return true;
      if (cleanName.includes('MANOJ') && dbName.includes('MANOJ')) return true;
      if (cleanName.includes('ANEELA') && dbName.includes('ANEELA')) return true;
      if (cleanName.includes('SRINU') && dbName.includes('SRINU')) return true;
      if (cleanName.includes('PARVATHI') && (dbName.includes('PARVATHI') || dbName.includes('PARAVATHI'))) return true;
      if (cleanName.includes('SURESH BABU') && dbName.includes('SURESH BABU')) return true;
      if (cleanName.includes('MURTHY') && dbName.includes('MURTHY')) return true;
      if (cleanName.includes('MOHAN SURENDRA') && dbName.includes('MOHAN SURENDRA')) return true;
      if (cleanName.includes('VIGNYA') && dbName.includes('VIGNYA')) return true;
      if (cleanName.includes('MADURIYA') && (dbName.includes('MADURIYA') || dbName.includes('MADHURYA'))) return true;
      return false;
    });

    if (found) {
      return found.id;
    }

    // Auto-create new faculty (e.g. guest faculty like Dr. T R K D V Prasad, Dr. P Bhuvaneswari, etc.)
    const generatedEmpId = empId || 'FAC_' + cleanName.replace(/[^A-Z0-9]/g, '').slice(0, 10);
    const userId = crypto.randomUUID();
    const facId = crypto.randomUUID();

    await sql`
      INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
      VALUES (${userId}, ${generatedEmpId}, ${defaultPasswordHash}, 'FACULTY', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING;
    `;

    const userRecord = await sql`SELECT id FROM users WHERE username = ${generatedEmpId} LIMIT 1;`;
    const finalUserId = userRecord[0]?.id || userId;

    await sql`
      INSERT INTO faculty (id, user_id, faculty_id, name, department, created_at, updated_at)
      VALUES (${facId}, ${finalUserId}, ${generatedEmpId}, ${name.trim()}, 'BASIC_SCIENCES_AND_HUMANITIES', NOW(), NOW())
      ON CONFLICT (faculty_id) DO UPDATE SET name = ${name.trim()};
    `;

    const facRecord = await sql`SELECT id, faculty_id, name FROM faculty WHERE faculty_id = ${generatedEmpId} LIMIT 1;`;
    faculty.push(facRecord[0]);
    return facRecord[0].id;
  }

  // Helper to find subject by code, prefix, or name
  function findSubject(codeOrPrefix: string, namePart: string, branch: string, sem: number): any {
    const cleanPrefix = codeOrPrefix.trim().toUpperCase();
    const cleanName = namePart.trim().toLowerCase();

    // 1. Exact match on subjectCode
    let match = subjects.find(
      (s: any) => s.branch === branch && s.semester === sem && s.subject_code.toUpperCase() === cleanPrefix
    );
    if (match) return match;

    // 2. Prefix match
    match = subjects.find(
      (s: any) => s.branch === branch && s.semester === sem && s.subject_code.toUpperCase().includes(cleanPrefix)
    );
    if (match) return match;

    // 3. Name match
    match = subjects.find(
      (s: any) => s.branch === branch && s.semester === sem && s.subject_name.toLowerCase().includes(cleanName)
    );
    if (match) return match;

    // 4. Cross-branch fallback if standard course
    match = subjects.find(
      (s: any) => s.semester === sem && (s.subject_code.toUpperCase() === cleanPrefix || s.subject_name.toLowerCase().includes(cleanName))
    );
    return match;
  }

  // Timetable allocations mapping from the PDF
  const ALLOCATIONS_TO_SEED: TimetableEntry[] = [
    // =========================================================================
    // 1. IV B.TECH CSD (Semester 7)
    // =========================================================================
    { branch: 'CSD', sectionName: 'CSD', semester: 7, subjectCodeOrPrefix: 'B23CD4101', subjectName: 'Deep Learning', teacherName: 'Sri M. S. Suseela' },
    { branch: 'CSD', sectionName: 'CSD', semester: 7, subjectCodeOrPrefix: 'B23HS4101', subjectName: 'Human Resource and Project Management', teacherName: 'Mr. N. Krishna Mohan Raju' },
    { branch: 'CSD', sectionName: 'CSD', semester: 7, subjectCodeOrPrefix: 'B23CD4102', subjectName: 'PE-IV Data Science Using Python', teacherName: 'Dr. G. Sudhakar' },
    { branch: 'CSD', sectionName: 'CSD', semester: 7, subjectCodeOrPrefix: 'B23CD4103', subjectName: 'PE-V Big Data Analysis', teacherName: 'Mr. S. Mohan Krishna' },
    { branch: 'CSD', sectionName: 'CSD', semester: 7, subjectCodeOrPrefix: 'B23CD4109', subjectName: 'SEC-Prompt Engineering Lab', teacherName: 'Mr. N. Praveen' },
    { branch: 'CSD', sectionName: 'CSD', semester: 7, subjectCodeOrPrefix: 'B23MC4101', subjectName: 'Audit Course: COI', teacherName: 'Mr. J. Mohan Surendra' },

    // =========================================================================
    // 2. IV B.TECH CSIT (Semester 7)
    // =========================================================================
    { branch: 'CSIT', sectionName: 'CSIT', semester: 7, subjectCodeOrPrefix: 'B23CT4101', subjectName: 'Deep Learning', teacherName: 'Sri M. S. Suseela' },
    { branch: 'CSIT', sectionName: 'CSIT', semester: 7, subjectCodeOrPrefix: 'B23HS4101', subjectName: 'Human Resource and Project Management', teacherName: 'Sri R. Sirisha' },
    { branch: 'CSIT', sectionName: 'CSIT', semester: 7, subjectCodeOrPrefix: 'B23CT4102', subjectName: 'PE-IV Data Science Using Python', teacherName: 'Dr. G. Sudhakar' },
    { branch: 'CSIT', sectionName: 'CSIT', semester: 7, subjectCodeOrPrefix: 'B23CT4103', subjectName: 'PE-V Big Data Analysis', teacherName: 'Mr. S. Mohan Krishna' },
    { branch: 'CSIT', sectionName: 'CSIT', semester: 7, subjectCodeOrPrefix: 'B23CT4112', subjectName: 'SEC-Prompt Engineering Lab', teacherName: 'Mr. N. Praveen' },
    { branch: 'CSIT', sectionName: 'CSIT', semester: 7, subjectCodeOrPrefix: 'B23MC4101', subjectName: 'Audit Course: COI', teacherName: 'Mr. J. Mohan Surendra' },

    // =========================================================================
    // 3. III B.TECH CSD-A (Semester 5)
    // =========================================================================
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3101', subjectName: 'Visual Design and Communication', teacherName: 'Mrs. N. Navya' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3102', subjectName: 'Computer Networks', teacherName: 'Mr. K .V Sunil Varma' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', teacherName: 'Mr. N Praveen' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3109', subjectName: 'Full Stack Development-2 Lab', teacherName: 'Mr. S. Mohan Krishna' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3110', subjectName: 'Data Mining and Data Warehousing Lab', teacherName: 'Dr. G. Sudhakar' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3111', subjectName: 'Tinkering Lab', teacherName: 'Mrs. P Mouna' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23CD3104', subjectName: 'Software Engineering', teacherName: 'Mr. P Manoj' },
    { branch: 'CSD', sectionName: 'CSD', semester: 5, subjectCodeOrPrefix: 'B23BS3101', subjectName: 'Softskills', teacherName: 'Dr. K. Neelima' },

    // =========================================================================
    // 4. III B.TECH CSIT-A (Semester 5)
    // =========================================================================
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CT3101', subjectName: 'Internet of Things', teacherName: 'Mr. P S V Surya Kumar' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CD3102', subjectName: 'Computer Networks', teacherName: 'Mrs. P Mouna' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CT3102', subjectName: 'Visual Design and Communication', teacherName: 'Mrs. N. Aneela' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', teacherName: 'Dr. K Srinivas Rao' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CT3106', subjectName: 'Full Stack Development-2 Lab', teacherName: 'Mr. K .V Sunil Varma' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CT3107', subjectName: 'Data Mining and Data Warehousing Lab', teacherName: 'Dr. K Srinivas Rao' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23CT3108', subjectName: 'Tinkering Lab', teacherName: 'Mrs. N. Navya' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 5, subjectCodeOrPrefix: 'B23BS3101', subjectName: 'Softskills', teacherName: 'Dr. P. Bhuvaneswari' },

    // =========================================================================
    // 5. III B.TECH CSIT-B (Semester 5)
    // =========================================================================
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CT3101', subjectName: 'Internet of Things', teacherName: 'Mr. P S V Surya Kumar' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CD3102', subjectName: 'Computer Networks', teacherName: 'Mrs. P Mouna' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CT3102', subjectName: 'Visual Design and Communication', teacherName: 'Mrs. N. Navya' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', teacherName: 'Dr. K Srinivas Rao' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CT3106', subjectName: 'Full Stack Development-2 Lab', teacherName: 'Mr. S. Mohan Krishna' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CT3107', subjectName: 'Data Mining and Data Warehousing Lab', teacherName: 'Dr. K Srinivas Rao' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23CT3108', subjectName: 'Tinkering Lab', teacherName: 'Mr. P S V Surya Kumar' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 5, subjectCodeOrPrefix: 'B23BS3101', subjectName: 'Softskills', teacherName: 'Dr. P. Bhuvaneswari' },

    // =========================================================================
    // 6. II B.TECH CSIT-A (Semester 3)
    // =========================================================================
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', teacherName: 'Dr. T R K D V Prasad' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23HS2101', subjectName: 'Universal Human Values -II', teacherName: 'Mrs. A. ASWINI PRIYANKA' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', teacherName: 'Mrs. D. PARAVATHI' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23CS2102', subjectName: 'Database Management Systems', teacherName: 'Mr. K. BHANU RAJESH NAIDU' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23CS2103', subjectName: 'Object-oriented programming through java', teacherName: 'Mr. A. SATYAM' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23CS2104', subjectName: 'Database management systems lab', teacherName: 'Mr. M. SRINU' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', teacherName: 'Mr. A. SATYAM' },
    { branch: 'CSIT', sectionName: 'CSIT-A', semester: 3, subjectCodeOrPrefix: 'B23CS2106', subjectName: 'Python programming', teacherName: 'Mrs. N. ANEELA' },

    // =========================================================================
    // 7. II B.TECH CSIT-B (Semester 3)
    // =========================================================================
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', teacherName: 'Dr. Y. Sobhanbabu' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23HS2101', subjectName: 'Universal Human Values -II', teacherName: 'Mrs. A. ASWINI PRIYANKA' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', teacherName: 'Mrs. D. PARAVATHI' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23CS2102', subjectName: 'Database Management Systems', teacherName: 'Mr. K. BHANU RAJESH NAIDU' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23CS2103', subjectName: 'Object-oriented programming through java', teacherName: 'Mr.  K .TRINADH NAIDU' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23CS2104', subjectName: 'Database management systems lab', teacherName: 'Mr. K. BHANU RAJESH NAIDU' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', teacherName: 'Mr.  K .TRINADH NAIDU' },
    { branch: 'CSIT', sectionName: 'CSIT-B', semester: 3, subjectCodeOrPrefix: 'B23CS2106', subjectName: 'Python programming', teacherName: 'Mrs. N. ANEELA' },

    // =========================================================================
    // 8. II B.TECH CSD (Semester 3)
    // =========================================================================
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', teacherName: 'Dr. N U B Varma' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23HS2101', subjectName: 'Universal Human Values -II', teacherName: 'Mrs. A. ASWINI PRIYANKA' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', teacherName: 'Mr. M. SRINU' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23CS2102', subjectName: 'Database Management Systems', teacherName: 'Dr. K. GIRIDHAR' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23CS2103', subjectName: 'Object-oriented programming through java', teacherName: 'Mr. A. SATYAM' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23CS2104', subjectName: 'Database management systems lab', teacherName: 'Dr. K. GIRIDHAR' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', teacherName: 'Mr. A. SATYAM' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23CS2106', subjectName: 'Python programming', teacherName: 'Mrs. D. PARAVATHI' },
    { branch: 'CSD', sectionName: 'CSD', semester: 3, subjectCodeOrPrefix: 'B23MC2102', subjectName: 'Environmental science', teacherName: 'Dr. G. Sudhakar' },
  ];

  let allocatedCount = 0;
  let skippedCount = 0;

  for (const item of ALLOCATIONS_TO_SEED) {
    // 1. Find section (match branch, sectionName, semester)
    const sec = sections.find(
      (s: any) => s.branch === item.branch && s.section_name === item.sectionName && s.semester === item.semester
    );
    if (!sec) {
      console.warn(`[Skip] Section not found for ${item.branch} ${item.sectionName} Sem ${item.semester}`);
      skippedCount++;
      continue;
    }

    // 2. Find subject
    let sub = findSubject(item.subjectCodeOrPrefix, item.subjectName, item.branch, item.semester);
    if (!sub) {
      // Auto-create subject if not present (e.g. 4th year subjects)
      const newSubId = crypto.randomUUID();
      await sql`
        INSERT INTO subjects (id, subject_code, subject_name, branch, semester, created_at, updated_at)
        VALUES (${newSubId}, ${item.subjectCodeOrPrefix}, ${item.subjectName}, ${item.branch}, ${item.semester}, NOW(), NOW())
        ON CONFLICT (subject_code, branch, semester) DO UPDATE SET subject_name = ${item.subjectName};
      `;
      const createdSub = await sql`SELECT id, subject_code, subject_name, branch, semester FROM subjects WHERE id = ${newSubId} LIMIT 1;`;
      sub = createdSub[0];
      subjects.push(sub);
      console.log(`    + Created missing subject [${item.subjectCodeOrPrefix}] ${item.subjectName}`);
    }

    // 3. Find or create faculty
    const facId = await getOrCreateFaculty(item.teacherName, item.teacherEmpId);

    // 4. Upsert Faculty Allocation
    const allocId = crypto.randomUUID();
    await sql`
      INSERT INTO faculty_allocations (
        id, academic_year, semester_number, branch, section_id, subject_id, faculty_id, is_primary, is_active, created_at, updated_at
      )
      VALUES (
        ${allocId}, ${sec.academic_year}, ${sec.semester}, ${sec.branch}, ${sec.id}, ${sub.id}, ${facId}, true, true, NOW(), NOW()
      )
      ON CONFLICT (section_id, subject_id, faculty_id) DO UPDATE
      SET is_active = true, updated_at = NOW();
    `;

    allocatedCount++;
    console.log(`  ✓ Allocated [${item.branch} - ${item.sectionName} Sem ${item.semester}] ${item.subjectName} -> ${item.teacherName}`);
  }

  console.log('\n================================================================================');
  console.log(`ALLOCATION SEEDING COMPLETED: ${allocatedCount} Allocated, ${skippedCount} Skipped.`);
  console.log('================================================================================\n');
}

if (require.main === module) {
  seedTimetableAllocations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding allocations failed:', err);
      process.exit(1);
    });
}
