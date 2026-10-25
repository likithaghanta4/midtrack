import axios from 'axios';

async function main() {
  const loginRes = await axios.post('http://localhost:5000/api/auth/faculty/login', {
    facultyId: '1259',
    password: 'admin@123',
  });

  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const secRes = await axios.get('http://localhost:5000/api/faculty/sections', { headers });
  const csitA = secRes.data.sections.find((s: any) => s.sectionName === 'CSIT-A');
  console.log('CSIT-A section:', csitA);

  const subRes = await axios.get(`http://localhost:5000/api/faculty/subjects?branch=CSIT&semester=5&sectionId=${csitA.id}`, { headers });
  console.log('CSIT-A allocated subjects count:', subRes.data.subjects?.length);
  for (const s of subRes.data.subjects) {
    console.log(`- Subject: ${s.subjectCode} - ${s.subjectName}`);
  }

  const examRes = await axios.get(`http://localhost:5000/api/faculty/exams?academicYear=2026-2027&semester=5`, { headers });
  console.log('Exams for Sem 5 count:', examRes.data.exams?.length);
  for (const e of examRes.data.exams) {
    console.log(`- Exam: ${e.examType} (Sem ${e.semester}, ${e.academicYear}) ID: ${e.id}`);
  }

  const labExam = examRes.data.exams.find((e: any) => e.examType === 'LAB_INTERNAL');
  const tinkeringSub = subRes.data.subjects.find((s: any) => s.subjectCode === 'B23CT3108');

  const marksRes = await axios.get(`http://localhost:5000/api/faculty/marks?sectionId=${csitA.id}&subjectId=${tinkeringSub.id}&examId=${labExam.id}`, { headers });
  console.log('Marks response status:', marksRes.status);
  console.log('Total students loaded in Enter Mid Marks:', marksRes.data.students?.length);
  console.log('First 3 students:', JSON.stringify(marksRes.data.students?.slice(0, 3), null, 2));
}

main().catch((err) => console.error('Error:', err.response?.data || err.message));
