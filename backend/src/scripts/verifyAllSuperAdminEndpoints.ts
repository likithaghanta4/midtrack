import axios from 'axios';

async function testAllSuperAdminEndpoints() {
  console.log('Testing all frontend superAdminApi endpoints...\n');

  // Login as Dr. Sudhakar with superadmin@123
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1507',
    password: 'superadmin@123',
  });
  const token = loginRes.data.token;
  console.log(`✓ 1. Login: ${loginRes.data.user.name} | Role: ${loginRes.data.user.role}`);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/superadmin',
    headers: { Authorization: `Bearer ${token}` },
  });

  // 1. Dashboard stats
  const statsRes = await api.get('/dashboard-stats');
  console.log('✓ 2. Dashboard Stats:', statsRes.data.data.stats);

  // 2. Academic years
  const yearsRes = await api.get('/academic-years');
  console.log(`✓ 3. Academic Years: ${yearsRes.data.academicYears.map((y: any) => y.year).join(', ')}`);

  // 3. Semesters
  const semsRes = await api.get('/semesters');
  console.log(`✓ 4. Semesters count: ${semsRes.data.semesters.length}`);

  // 4. Sections
  const secsRes = await api.get('/sections');
  console.log(`✓ 5. Sections count: ${secsRes.data.sections.length}`);

  // 5. Subjects
  const subsRes = await api.get('/subjects');
  console.log(`✓ 6. Subjects count: ${subsRes.data.subjects.length}`);

  // 6. Allocations
  const allocRes = await api.get('/allocations');
  console.log(`✓ 7. Allocations count: ${allocRes.data.allocations.length}`);

  // 7. Marks Overview
  const marksRes = await api.get('/marks-overview', { params: { academicYear: '2025-2026', semester: 3 } });
  console.log(`✓ 8. Marks Overview records: ${marksRes.data.records.length} students, ${marksRes.data.totalMarksFound} marks`);

  console.log('\n🎉 ALL 8 Super Admin API endpoints are 100% operational!');
}

testAllSuperAdminEndpoints().catch(err => {
  console.error('Test Failed:', err.response?.data || err.message);
});
