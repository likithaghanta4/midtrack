import { prisma } from '../config/prisma.js';

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: '1259' },
    include: { facultyProfile: true },
  });
  console.log('User:', JSON.stringify(user, null, 2));

  const fac = await prisma.faculty.findFirst({
    where: { facultyId: '1259' },
  });
  console.log('Faculty row:', JSON.stringify(fac, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
