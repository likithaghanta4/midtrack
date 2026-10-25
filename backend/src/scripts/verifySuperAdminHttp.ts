import axios from 'axios';

async function testSuperAdminEndpoints() {
  console.log('Testing Super Admin API over HTTP...');

  // 1. Login as Super Admin (Dr. Sudhakar)
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1507',
    password: 'superadmin@123',
  });

  const token = loginRes.data.token;
  console.log('✓ Login successful as:', loginRes.data.user.name, '| Role:', loginRes.data.user.role);

  const client = axios.create({
    baseURL: 'http://localhost:5000/api/superadmin',
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. Stats
  const statsRes = await client.get('/dashboard-stats');
  console.log('✓ Dashboard Stats:', statsRes.data.stats);

  // 3. Academic Years
  const yearsRes = await client.get('/academic-years');
  console.log(`✓ Academic Years (${yearsRes.data.academicYears.length}):`, yearsRes.data.academicYears.map((y: any) => y.year));

  // 4. Semesters
  const semsRes = await client.get('/semesters');
  console.log(`✓ Active Semesters:`, semsRes.data.semesters.filter((s: any) => s.isActive).map((s: any) => s.semesterNumber));

  // 5. Sections
  const secRes = await client.get('/sections');
  console.log(`✓ Sections count: ${secRes.data.sections.length}`);

  // 6. Subjects
  const subRes = await client.get('/subjects');
  console.log(`✓ Subjects count: ${subRes.data.subjects.length}`);

  // 7. Allocations
  const allocRes = await client.get('/allocations');
  console.log(`✓ Allocations count: ${allocRes.data.allocations.length}`);

  // 8. Workload
  const workRes = await client.get('/faculty-workload');
  console.log(`✓ Faculty Workload count: ${workRes.data.workload.length}`);

  console.log('\nAll Super Admin endpoints verified successfully!');
}

testSuperAdminEndpoints().catch((err) => {
  console.error('Test Failed:', err.response?.data || err.message);
});
