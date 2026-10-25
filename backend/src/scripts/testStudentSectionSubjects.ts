import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';
import axios from 'axios';

async function testStudents() {
  console.log('Testing Student Dashboard Subject Visibility by Section & Timetable...\n');

  // Pick one student from each section
  const testRegNos = [
    { label: '2-1 CSD', branch: 'CSD', sem: 3, sec: 'CSD' },
    { label: '2-1 CSIT-A', branch: 'CSIT', sem: 3, sec: 'CSIT-A' },
    { label: '2-1 CSIT-B', branch: 'CSIT', sem: 3, sec: 'CSIT-B' },
    { label: '3-1 CSD', branch: 'CSD', sem: 5, sec: 'CSD' },
    { label: '3-1 CSIT-A', branch: 'CSIT', sem: 5, sec: 'CSIT-A' },
    { label: '3-1 CSIT-B', branch: 'CSIT', sem: 5, sec: 'CSIT-B' },
    { label: '4-1 CSD', branch: 'CSD', sem: 7, sec: 'CSD' },
    { label: '4-1 CSIT', branch: 'CSIT', sem: 7, sec: 'CSIT' },
  ];

  for (const t of testRegNos) {
    const student = await prisma.student.findFirst({
      where: {
        semester: t.sem,
        branch: t.branch,
        section: t.sec,
      },
      include: { user: true },
    });

    if (!student) {
      console.log(`✗ No student found for ${t.label}`);
      continue;
    }

    // Login as this student
    const loginRes = await axios.post('http://localhost:5000/api/auth/student/login', {
      registerNumber: student.registerNumber,
      password: student.registerNumber,
    });

    const token = loginRes.data.token;
    const dashRes = await axios.get('http://localhost:5000/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const subjects = dashRes.data.subjects;
    console.log(`✓ [${t.label}] Student: ${student.name} (${student.registerNumber})`);
    console.log(`   Sees ${subjects.length} subjects:`);
    for (const s of subjects) {
      console.log(`     - [${s.subjectCode}] ${s.subjectName} (Lab: ${s.isLab})`);
    }
    console.log('');
  }
}

testStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
