import { prisma } from '../config/prisma.js';

async function main() {
  const ays = await prisma.academicYear.findMany();
  console.log('Academic Years:', JSON.stringify(ays, null, 2));

  // Also check faculty allocations for Navya (ID: 1259)
  const fac = await prisma.faculty.findFirst({
    where: { facultyId: '1259' },
    include: { allocations: true },
  });
  console.log('Navya allocations:', JSON.stringify(fac?.allocations, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
