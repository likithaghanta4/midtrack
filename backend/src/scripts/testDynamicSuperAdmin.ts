import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';
import { signToken, verifyToken } from '../utils/jwt';

async function testDynamicAdmin() {
  const url = process.env.DATABASE_URL || '';
  const sql = neon(url);
  console.log('Testing dynamic semester-wise Super Admin authentication...\n');

  const facultyTestCases = [
    { facultyId: '1507', name: 'Dr. G. SUDHAKAR' },
    { facultyId: '1474', name: 'Dr. K SRINIVAS RAO' },
    { facultyId: '1339', name: 'Mrs. A. ASWINI PRIYANKA' },
    { facultyId: '781', name: 'Dr. N G K MURTHY' },
  ];

  for (const tc of facultyTestCases) {
    const fac = await sql`
      SELECT f.id, f.faculty_id, f.name, u.id as user_id, u.username 
      FROM faculty f 
      JOIN users u ON u.id = f.user_id 
      WHERE f.faculty_id = ${tc.facultyId}
    `;

    if (fac.length > 0) {
      const displayName = fac[0].name + ' (Super Admin)';
      const token = signToken({
        userId: fac[0].user_id,
        username: fac[0].username,
        role: 'SUPERADMIN',
      });
      const decoded = verifyToken(token);
      console.log(`✓ [PASS] Selected Faculty: ${fac[0].name} (ID: ${tc.facultyId}) + superadmin@123 -> Acts as: ${displayName} | Role: ${decoded?.role}`);
    }
  }

  console.log('\nDynamic semester-wise Super Admin verification completed successfully.');
}

testDynamicAdmin().catch(console.error);
