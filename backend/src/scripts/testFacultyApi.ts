import axios from 'axios';

async function main() {
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1259',
    password: 'admin@123',
  });

  console.log('Login Response:', loginRes.data.user);
  const token = loginRes.data.token;

  const secRes = await axios.get('http://localhost:5000/api/faculty/sections', {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('Sections Response status:', secRes.status);
  console.log('Sections count:', secRes.data.sections?.length);
  console.log('Sections:', JSON.stringify(secRes.data.sections, null, 2));

  const statsRes = await axios.get('http://localhost:5000/api/faculty/dashboard-stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Dashboard stats sections:', statsRes.data.data?.sections?.length);
}

main().catch((err) => console.error('Error:', err.response?.data || err.message));
