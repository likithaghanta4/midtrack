import axios from 'axios';

async function main() {
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1507',
    password: 'superadmin@123',
  });

  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Get subjects for Sem 3 CSIT
  const subsRes = await axios.get('http://localhost:5000/api/superadmin/subjects?branch=CSIT&semester=3', { headers });
  console.log(`Sem 3 CSIT subjects count: ${subsRes.data.subjects.length}`);
  const firstSub = subsRes.data.subjects[0];
  console.log(`First subject: ${firstSub.subjectCode} - ${firstSub.subjectName} (${firstSub.id})`);

  // 2. Query marks overview with that subjectId
  const overviewWithSubject = await axios.get('http://localhost:5000/api/superadmin/marks-overview', {
    params: {
      academicYear: '2026-2027',
      semester: 3,
      branch: 'CSIT',
      subjectId: firstSub.id,
    },
    headers,
  });

  console.log('Marks overview with subject: totalStudents =', overviewWithSubject.data.totalStudents, 'totalMarksFound =', overviewWithSubject.data.totalMarksFound);

  // 3. Query marks overview with SESSIONAL for that subject
  const sessionalWithSub = await axios.get('http://localhost:5000/api/superadmin/marks-overview', {
    params: {
      academicYear: '2026-2027',
      semester: 3,
      branch: 'CSIT',
      subjectId: firstSub.id,
      examId: 'SESSIONAL',
    },
    headers,
  });

  console.log('Sessional with subject: totalStudents =', sessionalWithSub.data.totalStudents, 'records with sessionals =', sessionalWithSub.data.records.filter((r: any) => r.sessionals?.length > 0).length);

  // 4. Query Sem 5 CSIT
  const sem5SubRes = await axios.get('http://localhost:5000/api/superadmin/subjects?branch=CSIT&semester=5', { headers });
  console.log(`Sem 5 CSIT subjects count: ${sem5SubRes.data.subjects.length}`);
  const sem5FirstSub = sem5SubRes.data.subjects[0];

  const sem5Overview = await axios.get('http://localhost:5000/api/superadmin/marks-overview', {
    params: {
      academicYear: '2026-2027',
      semester: 5,
      branch: 'CSIT',
      subjectId: sem5FirstSub.id,
    },
    headers,
  });

  console.log('Sem 5 CSIT overview with subject:', sem5FirstSub.subjectCode, 'totalMarksFound =', sem5Overview.data.totalMarksFound);
}

main().catch((err) => console.error('Error:', err.response?.data || err.message));
