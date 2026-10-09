"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkExams() {
    const exams = await prisma.exam.findMany({
        orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }, { examType: 'asc' }]
    });
    console.log(`Found ${exams.length} exams in database:`);
    exams.forEach(e => {
        console.log(`ID: ${e.id} | Year: ${e.academicYear} | Sem: ${e.semester} | Type: ${e.examType}`);
    });
}
checkExams().finally(() => prisma.$disconnect());
