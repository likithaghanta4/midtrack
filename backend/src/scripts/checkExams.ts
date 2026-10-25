import { prisma } from '../config/prisma.js';

async function main() {
  const exams = await prisma.exam.findMany();
  console.log('Total exams:', exams.length);
  console.log(JSON.stringify(exams, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
