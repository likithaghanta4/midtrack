import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';
import axios from 'axios';

async function testSecs() {
  // Login as Superadmin Dr Sudhakar
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1507',
    password: 'superadmin@123',
  });
  const token = loginRes.data.token;

  // Call /api/superadmin/sections
  const res = await axios.get('http://localhost:5000/api/superadmin/sections', {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`Super Admin Sections API returned ${res.data.sections.length} sections:`);
  for (const s of res.data.sections) {
    console.log(`- [${s.academicYear}] Sem ${s.semester} [${s.branch} - ${s.sectionName}]: ${s.studentCount} Students`);
  }
}

testSecs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
