import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

async function verify() {
  const url = process.env.DATABASE_URL || '';
  const sql = neon(url);

  console.log('=======================================================');
  console.log(' VERIFYING 2ND YEAR CSIT SECTIONS & STUDENTS');
  console.log('=======================================================\n');

  // Check sections
  const sections = await sql`
    SELECT s.id, s.branch, s.section_name, s.academic_year, s.semester,
           COUNT(st.id)::int as student_count
    FROM sections s
    LEFT JOIN students st 
      ON st.branch = s.branch 
     AND st.section = s.section_name 
     AND st.semester = s.semester 
     AND st.academic_year = s.academic_year
    GROUP BY s.id, s.branch, s.section_name, s.academic_year, s.semester
    ORDER BY s.academic_year DESC, s.semester DESC, s.section_name ASC
  `;

  console.log('ACTIVE CLASS SECTIONS IN DATABASE:');
  sections.forEach((sec, i) => {
    console.log(`  ${i + 1}. [${sec.branch} - ${sec.section_name}] Sem ${sec.semester} (${sec.academic_year}) -> ${sec.student_count} Students`);
  });

  // Verify sample students from Section A
  const sampleA = await sql`
    SELECT st.register_number, st.name, u.role
    FROM students st
    JOIN users u ON u.id = st.user_id
    WHERE st.branch = 'CSIT' AND st.section = 'CSIT-A' AND st.semester = 3
    ORDER BY st.register_number ASC
    LIMIT 3
  `;
  console.log('\nSAMPLE STUDENTS (CSIT-A):');
  sampleA.forEach((s) => console.log(`  - ${s.register_number}: ${s.name} (Role: ${s.role})`));

  // Verify sample students from Section B (including lateral entry)
  const sampleB = await sql`
    SELECT st.register_number, st.name, u.role
    FROM students st
    JOIN users u ON u.id = st.user_id
    WHERE st.branch = 'CSIT' AND st.section = 'CSIT-B' AND st.semester = 3
    ORDER BY st.register_number ASC
    LIMIT 3
  `;
  console.log('\nSAMPLE STUDENTS (CSIT-B):');
  sampleB.forEach((s) => console.log(`  - ${s.register_number}: ${s.name} (Role: ${s.role})`));

  // Check lateral entries
  const laterals = await sql`
    SELECT st.register_number, st.name, st.section
    FROM students st
    WHERE st.register_number IN ('24B91A0745', '24B91A0738')
  `;
  console.log('\nLATERAL / RE-ADMITTED STUDENTS IN CSIT-B:');
  laterals.forEach((s) => console.log(`  - ${s.register_number}: ${s.name} in Section ${s.section}`));

  // Check total counts
  const totalStudents = await sql`SELECT count(*)::int as count FROM students`;
  const totalUsers = await sql`SELECT count(*)::int as count FROM users`;
  const totalMarks = await sql`SELECT count(*)::int as count FROM marks`;

  console.log('\nOVERALL SUMMARY:');
  console.log(`  - Total Students: ${totalStudents[0].count}`);
  console.log(`  - Total Users:    ${totalUsers[0].count}`);
  console.log(`  - Total Marks:    ${totalMarks[0].count}`);
  console.log('=======================================================\n');
}

verify().catch(console.error);
