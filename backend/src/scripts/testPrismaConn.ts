import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

async function testConn() {
  console.log('Testing Prisma with Neon Driver Adapter...');
  try {
    const count = await prisma.faculty.count();
    console.log('✓ Success! Faculty count via Prisma Client:', count);

    const sudhakar = await prisma.faculty.findUnique({
      where: { facultyId: '1507' },
      include: { user: true },
    });
    console.log('✓ Success! Dr. Sudhakar found:', sudhakar?.name, '| User Role:', sudhakar?.user?.role);
  } catch (err: any) {
    console.error('✗ Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testConn();
