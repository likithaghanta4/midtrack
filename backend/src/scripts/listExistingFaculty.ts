import { prisma } from '../config/prisma.js';

async function main() {
  const facs = await prisma.faculty.findMany({
    orderBy: { facultyId: 'asc' },
    include: { user: true },
  });
  console.log(`Total existing faculty in DB: ${facs.length}`);
  for (const f of facs) {
    console.log(`ID: ${f.facultyId} | Name: ${f.name} | Dept: ${f.department} | UserRole: ${f.user?.role}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
