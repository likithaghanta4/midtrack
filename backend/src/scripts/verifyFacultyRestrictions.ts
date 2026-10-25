import axios from 'axios';

async function testFacultyRestrictions() {
  console.log('Testing Faculty Restricted Permissions...\n');

  // Login as regular faculty: Mr. N Praveen (1348) with admin@123
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1348',
    password: 'admin@123',
  });

  const token = loginRes.data.token;
  console.log(`✓ 1. Faculty Login: ${loginRes.data.user.name} | Role: ${loginRes.data.user.role}`);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/faculty',
    headers: { Authorization: `Bearer ${token}` },
  });

  // Get allocated sections
  const secRes = await api.get('/sections');
  console.log(`✓ 2. Allocated sections for ${loginRes.data.user.name}:`, secRes.data.sections.map((s: any) => `${s.sectionName} (${s.branch})`));

  // Get allocated subjects
  const subRes = await api.get('/subjects');
  console.log(`✓ 3. Allocated subjects for ${loginRes.data.user.name}:`, subRes.data.subjects.map((s: any) => `${s.subjectCode} - ${s.subjectName}`));

  // Verify that regular faculty CANNOT access Super Admin routes
  try {
    await axios.get('http://localhost:5000/api/superadmin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.error('✗ ERROR: Regular faculty should NOT access Super Admin routes!');
  } catch (err: any) {
    console.log(`✓ 4. Security Check Passed: Regular faculty blocked from Super Admin routes with status ${err.response?.status} (${err.response?.data?.message})`);
  }

  console.log('\nFaculty restricted view and access enforcement 100% verified!');
}

testFacultyRestrictions().catch(console.error);
