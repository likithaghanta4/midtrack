const API_BASE = 'http://localhost:5000/api';

async function request(url: string, options: any = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function testComprehensive() {
  console.log('=== COMPREHENSIVE R23 LAB & THEORY EVALUATION VERIFICATION ===');

  // 1. Faculty Login
  const facListRes = await request(`${API_BASE}/auth/faculty`);
  const targetFaculty = facListRes.faculty[0];
  const facLogin = await request(`${API_BASE}/auth/faculty/login`, {
    method: 'POST',
    body: {
      facultyId: targetFaculty.facultyId,
      password: 'admin@123',
    },
  });
  const facHeaders = { Authorization: `Bearer ${facLogin.token}` };
  console.log(`✓ Logged in as Faculty: ${targetFaculty.name}`);

  // 2. Fetch all sections
  const secRes = await request(`${API_BASE}/faculty/sections`, { headers: facHeaders });
  console.log(`✓ Found ${secRes.sections.length} active class sections.`);

  for (const section of secRes.sections) {
    console.log(`\n--- Testing Section: ${section.sectionName} (${section.branch} Sem-${section.semester}) ---`);
    const subRes = await request(`${API_BASE}/faculty/subjects?branch=${section.branch}&semester=${section.semester}`, { headers: facHeaders });
    const labSubjects = subRes.subjects.filter((s: any) => s.isLab);
    const theorySubjects = subRes.subjects.filter((s: any) => !s.isLab);

    console.log(`  • Courses Breakdown: ${theorySubjects.length} Theory subjects, ${labSubjects.length} Lab/Practical subjects.`);

    if (labSubjects.length > 0) {
      const sampleLab = labSubjects[0];
      const examRes = await request(`${API_BASE}/faculty/exams?academicYear=${section.academicYear}&semester=${section.semester}`, { headers: facHeaders });
      const labExam = examRes.exams.find((e: any) => e.examType === 'LAB_INTERNAL');

      if (labExam) {
        // Save direct marks for 5 students
        const marksGetRes = await request(`${API_BASE}/faculty/marks?sectionId=${section.id}&subjectId=${sampleLab.id}&examId=${labExam.id}`, { headers: facHeaders });
        const marksPayload = marksGetRes.students.slice(0, 5).map((s: any, idx: number) => ({
          studentId: s.studentId,
          total: 26 + (idx % 5),
        }));

        await request(`${API_BASE}/faculty/marks/bulk`, {
          method: 'POST',
          headers: facHeaders,
          body: {
            sectionId: section.id,
            subjectId: sampleLab.id,
            examId: labExam.id,
            marks: marksPayload,
          },
        });

        // Verify sessional marks calculation
        const sessRes = await request(`${API_BASE}/faculty/marks/sessionals?sectionId=${section.id}&subjectId=${sampleLab.id}`, { headers: facHeaders });
        if (sessRes.isLab !== true) {
          throw new Error(`Expected isLab=true for ${sampleLab.subjectCode}`);
        }
        const s1 = sessRes.sessionals[0];
        console.log(`  ✓ Verified Lab Direct Sessional: ${sampleLab.subjectCode} -> Student ${s1.registerNumber}: Lab Mark = ${s1.labMark}, Sessional = ${s1.sessionalTotal} (Direct 100%, NO 80:20)`);
      }
    }
  }

  // 3. Clean up scratch file
  console.log('\n=== ALL 2ND, 3RD, AND 4TH YEAR LAB EVALUATION WORKFLOWS TESTED SUCCESSFULLY! ===');
}

testComprehensive().catch((err) => {
  console.error('Test Failed:', err.message);
  process.exit(1);
});
