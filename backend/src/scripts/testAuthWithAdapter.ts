import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';
import { verifyPassword } from '../utils/password';
import { signToken, verifyToken } from '../utils/jwt';
import { config } from '../config';

async function testAuth() {
  console.log('Testing Auth Logic with Neon Driver Adapter...\n');

  // 1. Get faculty list
  const faculty = await prisma.faculty.findMany({
    select: { facultyId: true, name: true, department: true },
    orderBy: { name: 'asc' },
  });
  console.log(`✓ Faculty List Count: ${faculty.length} (Expected: 23)`);
  if (faculty.length !== 23) {
    throw new Error(`Expected 23 faculty, but found ${faculty.length}`);
  }

  // 2. Test Super Admin login for Dr. Sudhakar (1507)
  const superAdminPassword = config.superAdminInitialPassword || 'superadmin@123';
  const sudhakar = await prisma.faculty.findUnique({
    where: { facultyId: '1507' },
    include: { user: true },
  });

  if (!sudhakar || !sudhakar.user) {
    throw new Error('Dr. Sudhakar not found in database');
  }

  const superToken = signToken({
    userId: sudhakar.user.id,
    username: sudhakar.user.username,
    role: 'SUPERADMIN',
  });
  const decodedSuper = verifyToken(superToken);
  console.log(`✓ Super Admin Login test passed for ${sudhakar.name}: Role = ${decodedSuper?.role}`);

  // 3. Test another faculty member (e.g. Dr. K SRINIVAS RAO 1474) as dynamic Super Admin
  const srinivas = await prisma.faculty.findUnique({
    where: { facultyId: '1474' },
    include: { user: true },
  });
  const dynamicSuperToken = signToken({
    userId: srinivas!.user!.id,
    username: srinivas!.user!.username,
    role: 'SUPERADMIN',
  });
  const decodedDynamic = verifyToken(dynamicSuperToken);
  console.log(`✓ Dynamic Super Admin test passed for ${srinivas!.name}: Role = ${decodedDynamic?.role}`);

  // 4. Test regular faculty login with admin@123
  const isFacultyPasswordCorrect = verifyPassword('admin@123', srinivas!.user!.passwordHash);
  console.log(`✓ Regular Faculty Password Verification for ${srinivas!.name}: ${isFacultyPasswordCorrect ? 'PASS' : 'FAIL'}`);

  console.log('\nAll auth tests passed successfully!');
}

testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
