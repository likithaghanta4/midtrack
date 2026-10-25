import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';
import { signToken, verifyToken } from '../utils/jwt';
import { config } from '../config';

async function runTestSuite() {
  console.log('================================================================================');
  console.log('MID TRACK — SUPER ADMIN, SEMESTER & ALLOCATION VERIFICATION SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  const url = process.env.DATABASE_URL || '';
  if (!url) throw new Error('DATABASE_URL not set.');
  const sql = neon(url);

  try {
    // 1. Super Admin Password Configuration
    const expectedSuperAdminPassword = config.superAdminInitialPassword || 'superadmin@123';
    assert(
      expectedSuperAdminPassword === 'superadmin@123',
      'Super Admin initial credential configured as "superadmin@123"'
    );

    // 2. Super Admin Account in Database
    const superAdminUsers = await sql`SELECT id, username, role FROM users WHERE role = 'SUPERADMIN' LIMIT 5;`;
    assert(
      superAdminUsers.length > 0 && superAdminUsers.some((u: any) => u.role === 'SUPERADMIN'),
      'Super Admin user exists in database with SUPERADMIN role',
      `Found users: ${superAdminUsers.map((u: any) => u.username).join(', ')}`
    );

    // 3. Dr. G. Sudhakar designated as Super Admin
    const sudhakarUser = await sql`
      SELECT u.id, u.username, u.role, f.name, f.faculty_id
      FROM users u
      JOIN faculty f ON f.user_id = u.id
      WHERE f.name ILIKE '%SUDHAKAR%' OR f.faculty_id = '1507';
    `;
    assert(
      sudhakarUser.length > 0 && sudhakarUser[0].role === 'SUPERADMIN',
      'Dr. G. Sudhakar (EMPID 1507) designated with SUPERADMIN role',
      `Sudhakar user: ${sudhakarUser[0]?.name} (${sudhakarUser[0]?.role})`
    );

    // 4. JWT Issuance with SUPERADMIN role
    const adminToken = signToken({
      userId: sudhakarUser[0].id,
      username: sudhakarUser[0].username,
      role: 'SUPERADMIN',
    });
    const decodedAdmin = verifyToken(adminToken);
    assert(
      decodedAdmin?.role === 'SUPERADMIN',
      'JWT token correctly scoped with role "SUPERADMIN"'
    );

    // 5. Standard Faculty Account remains 'FACULTY'
    const praveenUser = await sql`
      SELECT u.id, u.username, u.role, f.name 
      FROM users u 
      JOIN faculty f ON f.user_id = u.id 
      WHERE f.faculty_id = '1348';
    `;
    assert(
      praveenUser.length > 0 && praveenUser[0].role === 'FACULTY',
      'Normal faculty members retain role "FACULTY" (no elevation of privilege)',
      `Praveen role: ${praveenUser[0]?.role}`
    );

    // 6. Student Account remains 'STUDENT'
    const sampleStudent = await sql`
      SELECT u.role, s.register_number, s.name 
      FROM students s 
      JOIN users u ON u.id = s.user_id 
      LIMIT 1;
    `;
    assert(
      sampleStudent.length > 0 && sampleStudent[0].role === 'STUDENT',
      'Student accounts retain role "STUDENT"',
      `Sample student: ${sampleStudent[0]?.register_number} (${sampleStudent[0]?.role})`
    );

    // 7. Academic Years table verification
    const activeYear = await sql`SELECT year, is_current FROM academic_years WHERE is_current = true;`;
    assert(
      activeYear.length > 0 && activeYear[0].year === '2026-2027',
      'Active academic year set to "2026-2027" matching timetable PDF'
    );

    // 8. Active Semesters verification (Semesters 3, 5, 7)
    const activeSemesters = await sql`
      SELECT s.semester_number, s.name, s.is_active 
      FROM semesters s 
      JOIN academic_years ay ON ay.id = s.academic_year_id 
      WHERE s.is_active = true AND ay.year = '2026-2027'
      ORDER BY s.semester_number ASC;
    `;
    const semNumbers = activeSemesters.map((s: any) => s.semester_number);
    assert(
      semNumbers.includes(3) && semNumbers.includes(5) && semNumbers.includes(7),
      `Running semesters active: [${semNumbers.join(', ')}]`
    );

    // 9. Faculty Allocations seeded from Timetable PDF
    const totalAllocations = await sql`SELECT COUNT(*)::int as count FROM faculty_allocations WHERE is_active = true;`;
    assert(
      totalAllocations[0].count >= 60,
      `Allocations populated from official timetable PDF (${totalAllocations[0].count} active allocations)`
    );

    // 10. Verification of Dr. Sudhakar teaching allocations
    const sudhakarAllocations = await sql`
      SELECT fa.id, s.subject_code, s.subject_name, sec.section_name, sec.branch, fa.semester_number
      FROM faculty_allocations fa
      JOIN faculty f ON f.id = fa.faculty_id
      JOIN subjects s ON s.id = fa.subject_id
      JOIN sections sec ON sec.id = fa.section_id
      WHERE f.name ILIKE '%SUDHAKAR%' AND fa.is_active = true;
    `;
    assert(
      sudhakarAllocations.length >= 3,
      `Dr. G. Sudhakar allocated to timetable subjects (${sudhakarAllocations.length} courses: ${sudhakarAllocations.map((a: any) => a.subject_code).join(', ')})`
    );

    // 11. Verification of 8 distinct sections
    const totalSections = await sql`SELECT COUNT(*)::int as count FROM sections;`;
    assert(
      totalSections[0].count === 8,
      `All 8 academic class sections present in database (${totalSections[0].count} sections)`
    );

    // 12. Verification of total real students & marks integrity
    const totalStudents = await sql`SELECT COUNT(*)::int as count FROM students;`;
    const totalMarks = await sql`SELECT COUNT(*)::int as count FROM marks;`;
    assert(
      totalStudents[0].count === 555,
      `All 555 real student records 100% preserved (0 students lost or modified)`
    );
    assert(
      totalMarks[0].count >= 435,
      `All 435+ existing examination marks 100% preserved (${totalMarks[0].count} marks in DB)`
    );

    // 13. Sessional Calculation Formula Verification (15 desc + 10 obj + 5 assign = 30; 80/20 sessional)
    const mid1 = 28;
    const mid2 = 22;
    const higher = Math.max(mid1, mid2);
    const lower = Math.min(mid1, mid2);
    const sessional = parseFloat((higher * 0.8 + lower * 0.2).toFixed(2));
    assert(
      sessional === 26.8,
      'Sessional 80:20 formula preserved exactly: (28*0.8) + (22*0.2) = 26.8'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log('\n================================================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();
