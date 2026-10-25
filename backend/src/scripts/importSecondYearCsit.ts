import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

export interface StudentInput {
  rollNo: number;
  registerNumber: string;
  name: string;
  section: 'CSIT-A' | 'CSIT-B';
}

export const CSIT_A_STUDENTS: StudentInput[] = [
  { rollNo: 1, registerNumber: '25B91A0703', name: 'VENKATA SURYA SAI VISHAL ADINA', section: 'CSIT-A' },
  { rollNo: 2, registerNumber: '25B91A0704', name: 'BALA BHAGYA SRI AKULA', section: 'CSIT-A' },
  { rollNo: 3, registerNumber: '25B91A0705', name: 'ANASUYADEVI ALAPATI', section: 'CSIT-A' },
  { rollNo: 4, registerNumber: '25B91A0707', name: 'NAVYA NAGA RAMYA SRI BARAMA', section: 'CSIT-A' },
  { rollNo: 5, registerNumber: '25B91A0709', name: 'YASMIN BEERA', section: 'CSIT-A' },
  { rollNo: 6, registerNumber: '25B91A0715', name: 'RISHITHA BONIGALA', section: 'CSIT-A' },
  { rollNo: 7, registerNumber: '25B91A0718', name: 'NAGA VAISHNAVI BUDIDA', section: 'CSIT-A' },
  { rollNo: 8, registerNumber: '25B91A0721', name: 'HARSHINI CHEGONDI', section: 'CSIT-A' },
  { rollNo: 9, registerNumber: '25B91A0723', name: 'BHAVANA CHETTU', section: 'CSIT-A' },
  { rollNo: 10, registerNumber: '25B91A0725', name: 'VISWA TEJA CHUNDRU', section: 'CSIT-A' },
  { rollNo: 11, registerNumber: '25B91A0726', name: 'KARTHIKEYA DASARI', section: 'CSIT-A' },
  { rollNo: 12, registerNumber: '25B91A0730', name: 'SITA SRI VYSHNAVI DURVASULA', section: 'CSIT-A' },
  { rollNo: 13, registerNumber: '25B91A0732', name: 'RAM GANESH GANDREDDY', section: 'CSIT-A' },
  { rollNo: 14, registerNumber: '25B91A0735', name: 'GNAANA PRASANNA GUBBALA', section: 'CSIT-A' },
  { rollNo: 15, registerNumber: '25B91A0736', name: 'VEENA SRUTHI GUDAPALLI', section: 'CSIT-A' },
  { rollNo: 16, registerNumber: '25B91A0737', name: 'LALITHA DEVI SRI GUDAPATI', section: 'CSIT-A' },
  { rollNo: 17, registerNumber: '25B91A0739', name: 'DURGA NAGA LAKSHMI SHIVA SARANYA GUDDATI', section: 'CSIT-A' },
  { rollNo: 18, registerNumber: '25B91A0740', name: 'KARTHIK SRI NAGA SAI GUDURI', section: 'CSIT-A' },
  { rollNo: 19, registerNumber: '25B91A0742', name: 'ABHIRAM CHARAN JALDANI', section: 'CSIT-A' },
  { rollNo: 20, registerNumber: '25B91A0743', name: 'SURENDRA VARMA JALLI', section: 'CSIT-A' },
  { rollNo: 21, registerNumber: '25B91A0749', name: 'PURNASRI KANDANALA', section: 'CSIT-A' },
  { rollNo: 22, registerNumber: '25B91A0751', name: 'LAKSHMI SRAVANTHI KARRI', section: 'CSIT-A' },
  { rollNo: 23, registerNumber: '25B91A0753', name: 'RAJANI KATIKI', section: 'CSIT-A' },
  { rollNo: 24, registerNumber: '25B91A0755', name: 'BHAVYASRI SAILAKSHMI KETHA', section: 'CSIT-A' },
  { rollNo: 25, registerNumber: '25B91A0757', name: 'GEETHIKA RATNAM KORLAPATI', section: 'CSIT-A' },
  { rollNo: 26, registerNumber: '25B91A0758', name: 'DEEPIKA KOTA', section: 'CSIT-A' },
  { rollNo: 27, registerNumber: '25B91A0759', name: 'MADHU VENKATESH KOTA', section: 'CSIT-A' },
  { rollNo: 28, registerNumber: '25B91A0760', name: 'MAHENDRA REDDY KOTAPATI', section: 'CSIT-A' },
  { rollNo: 29, registerNumber: '25B91A0761', name: 'POORNA SRI CHANDRA SEKHAR KUKUNOORI', section: 'CSIT-A' },
  { rollNo: 30, registerNumber: '25B91A0762', name: 'NOMU NARASIMHA SAI PAVAN LAKKU', section: 'CSIT-A' },
  { rollNo: 31, registerNumber: '25B91A0763', name: 'KAVYA LAKSHMISETTI', section: 'CSIT-A' },
  { rollNo: 32, registerNumber: '25B91A0768', name: 'JAYA RAM MEESALA', section: 'CSIT-A' },
  { rollNo: 33, registerNumber: '25B91A0770', name: 'MEENA PHANI SRI MOTUPALLI', section: 'CSIT-A' },
  { rollNo: 34, registerNumber: '25B91A0773', name: 'ADILAKSHMI MULE', section: 'CSIT-A' },
  { rollNo: 35, registerNumber: '25B91A0774', name: 'YASASWI MUTCHARLA', section: 'CSIT-A' },
  { rollNo: 36, registerNumber: '25B91A0775', name: 'SUPRIYA MYLABATHULA', section: 'CSIT-A' },
  { rollNo: 37, registerNumber: '25B91A0776', name: 'MANOGNYA DEVI NALLAM', section: 'CSIT-A' },
  { rollNo: 38, registerNumber: '25B91A0777', name: 'TANISHA NARKEDAMILLI', section: 'CSIT-A' },
  { rollNo: 39, registerNumber: '25B91A0781', name: 'THANUJA PALA', section: 'CSIT-A' },
  { rollNo: 40, registerNumber: '25B91A0783', name: 'MEGHANA CHOUDHARY PANDAVA', section: 'CSIT-A' },
  { rollNo: 41, registerNumber: '25B91A0786', name: 'HARSHA VARDHAN RAJU PENTAPATI', section: 'CSIT-A' },
  { rollNo: 42, registerNumber: '25B91A0788', name: 'SIVANI PINNINTI', section: 'CSIT-A' },
  { rollNo: 43, registerNumber: '25B91A0789', name: 'MADHURI VENKATA NAGA DIVYA PIPPALLA', section: 'CSIT-A' },
  { rollNo: 44, registerNumber: '25B91A0790', name: 'PRASANTH PODAGATLA', section: 'CSIT-A' },
  { rollNo: 45, registerNumber: '25B91A0791', name: 'BHANU PRASAD POGIRI', section: 'CSIT-A' },
  { rollNo: 46, registerNumber: '25B91A0797', name: 'VENKATA SAKETH REDDY', section: 'CSIT-A' },
  { rollNo: 47, registerNumber: '25B91A0798', name: 'RUTHIKA AKSHAYA SAI SRI REKHAPALLI', section: 'CSIT-A' },
  { rollNo: 48, registerNumber: '25B91A0799', name: 'JYOTHSNA SRI RELANGI', section: 'CSIT-A' },
  { rollNo: 49, registerNumber: '25B91A07A1', name: 'SRIVYSHNAVI ISWARYA LAKSHMI SAMAYAMANTHULA', section: 'CSIT-A' },
  { rollNo: 50, registerNumber: '25B91A07A2', name: 'NIHITHA SATTINENI', section: 'CSIT-A' },
  { rollNo: 51, registerNumber: '25B91A07A3', name: 'VENKATA SATYA NAGA DURGA SUBHASH SAVARAM', section: 'CSIT-A' },
  { rollNo: 52, registerNumber: '25B91A07A4', name: 'DADA KHALANDER SHAIK', section: 'CSIT-A' },
  { rollNo: 53, registerNumber: '25B91A07A5', name: 'SAMEERA SHAIK', section: 'CSIT-A' },
  { rollNo: 54, registerNumber: '25B91A07A8', name: 'SNEHA SISTU', section: 'CSIT-A' },
  { rollNo: 55, registerNumber: '25B91A07A9', name: 'SANTHI PRIYA SRIKAKULAPU', section: 'CSIT-A' },
  { rollNo: 56, registerNumber: '25B91A07B0', name: 'LOKESH VIJAY SAI SUNKARA', section: 'CSIT-A' },
  { rollNo: 57, registerNumber: '25B91A07B1', name: 'SUSMITHA TADELA', section: 'CSIT-A' },
  { rollNo: 58, registerNumber: '25B91A07B2', name: 'SRUTHI TAMARANA', section: 'CSIT-A' },
  { rollNo: 59, registerNumber: '25B91A07B3', name: 'GANESH REDDY TAPPETA', section: 'CSIT-A' },
  { rollNo: 60, registerNumber: '25B91A07B4', name: 'DURGA SRINIVAS TEKU', section: 'CSIT-A' },
  { rollNo: 61, registerNumber: '25B91A07B7', name: 'VENKATA JASWANTH UPPULURI', section: 'CSIT-A' },
  { rollNo: 62, registerNumber: '25B91A07B9', name: 'SAI BHARADWAJA REDDY VANUKURI', section: 'CSIT-A' },
  { rollNo: 63, registerNumber: '25B91A07C0', name: 'NAGA SURYA LAKSHMI VARADA', section: 'CSIT-A' },
  { rollNo: 64, registerNumber: '25B91A07C1', name: 'ANJALI VARIKUTI', section: 'CSIT-A' },
  { rollNo: 65, registerNumber: '25B91A07C2', name: 'GEETHA NAGA VALLI VARRE', section: 'CSIT-A' },
  { rollNo: 66, registerNumber: '25B91A07C3', name: 'NAGAVALLI GANGOTHRI VEERAMALLA', section: 'CSIT-A' },
  { rollNo: 67, registerNumber: '25B91A07C4', name: 'KUNDANA SAI SANTHI VEERAVALLI', section: 'CSIT-A' },
  { rollNo: 68, registerNumber: '25B91A07C5', name: 'HARSHINI VEERLAPATI', section: 'CSIT-A' },
  { rollNo: 69, registerNumber: '25B91A07C6', name: 'HASINI VEERLAPATI', section: 'CSIT-A' },
  { rollNo: 70, registerNumber: '25B91A07C7', name: 'MADHU SARIKA VEMAVARAPU', section: 'CSIT-A' },
  { rollNo: 71, registerNumber: '25B91A07C9', name: 'RAMA PRANEETH VISSAPRAGADA', section: 'CSIT-A' },
  { rollNo: 72, registerNumber: '25B91A07D0', name: 'HEMANTH VOONNA', section: 'CSIT-A' },
];

export const CSIT_B_STUDENTS: StudentInput[] = [
  { rollNo: 1, registerNumber: '25B91A0701', name: 'ROHITH VEERA VENKATA DURGESH ADABALA', section: 'CSIT-B' },
  { rollNo: 2, registerNumber: '25B91A0702', name: 'SAI NAGA SURYANARAYANA ADABALA', section: 'CSIT-B' },
  { rollNo: 3, registerNumber: '25B91A0706', name: 'JAYA CHARAN KRISHNA ARETI', section: 'CSIT-B' },
  { rollNo: 4, registerNumber: '25B91A0708', name: 'VAMSI BAREPU', section: 'CSIT-B' },
  { rollNo: 5, registerNumber: '25B91A0710', name: 'V S S N RAMA GANESH BEJAVADA', section: 'CSIT-B' },
  { rollNo: 6, registerNumber: '25B91A0711', name: 'J S VENKATA DURGA NAGA ASRITHA BELLAPU', section: 'CSIT-B' },
  { rollNo: 7, registerNumber: '25B91A0712', name: 'HARSHA VARDHAN SRINIVASU BILLAKURTHI', section: 'CSIT-B' },
  { rollNo: 8, registerNumber: '25B91A0713', name: 'SATYA VARA PRASAD BIRUDUKOTA', section: 'CSIT-B' },
  { rollNo: 9, registerNumber: '25B91A0714', name: 'YOGESH BONDA', section: 'CSIT-B' },
  { rollNo: 10, registerNumber: '25B91A0716', name: 'AVINASH BOTCHA', section: 'CSIT-B' },
  { rollNo: 11, registerNumber: '25B91A0717', name: 'PRASANNA VARUN BOYAPATI', section: 'CSIT-B' },
  { rollNo: 12, registerNumber: '25B91A0719', name: 'SHAKEENA CHADALAVADA', section: 'CSIT-B' },
  { rollNo: 13, registerNumber: '25B91A0720', name: 'TEJASWINI CHATRAGADDA', section: 'CSIT-B' },
  { rollNo: 14, registerNumber: '25B91A0722', name: 'LOHITH CHELAMKURI', section: 'CSIT-B' },
  { rollNo: 15, registerNumber: '25B91A0724', name: 'SHYAM KISHORE CHIKKALA', section: 'CSIT-B' },
  { rollNo: 16, registerNumber: '25B91A0727', name: 'MOHAN CHANDRA DASARI', section: 'CSIT-B' },
  { rollNo: 17, registerNumber: '25B91A0728', name: 'YUVA RAM DASARI', section: 'CSIT-B' },
  { rollNo: 18, registerNumber: '25B91A0729', name: 'INDHU PRIYA DIRSIPOM', section: 'CSIT-B' },
  { rollNo: 19, registerNumber: '25B91A0731', name: 'PURNA NAGA GOWTHAM REDDY DWARAMPUDI', section: 'CSIT-B' },
  { rollNo: 20, registerNumber: '25B91A0733', name: 'HARI SAI GEDA', section: 'CSIT-B' },
  { rollNo: 21, registerNumber: '25B91A0734', name: 'ROHAN SAMIT GOLLAPALLI', section: 'CSIT-B' },
  { rollNo: 22, registerNumber: '25B91A0738', name: 'SAI CHARAN GUDDALA', section: 'CSIT-B' },
  { rollNo: 23, registerNumber: '25B91A0741', name: 'SNEHITH GUNDEPALLI', section: 'CSIT-B' },
  { rollNo: 24, registerNumber: '25B91A0744', name: 'NEHA JAVVADI', section: 'CSIT-B' },
  { rollNo: 25, registerNumber: '25B91A0745', name: 'JITHENDRA VENKATA KANAKA SRI SURYA AYITHAM', section: 'CSIT-B' },
  { rollNo: 26, registerNumber: '25B91A0746', name: 'SRI SURYA SATYA SAI KADALI', section: 'CSIT-B' },
  { rollNo: 27, registerNumber: '25B91A0747', name: 'SAI VARMA KALIDINDI', section: 'CSIT-B' },
  { rollNo: 28, registerNumber: '25B91A0748', name: 'SRI RAMA CHARAN SARESH KUMAR KAMIREDDY', section: 'CSIT-B' },
  { rollNo: 29, registerNumber: '25B91A0750', name: 'TEJASWI KANNIPAMULA', section: 'CSIT-B' },
  { rollNo: 30, registerNumber: '25B91A0752', name: 'HASWANTH SIVA BHASKAR KATARI', section: 'CSIT-B' },
  { rollNo: 31, registerNumber: '25B91A0754', name: 'DILEEP KATTA', section: 'CSIT-B' },
  { rollNo: 32, registerNumber: '25B91A0756', name: 'RAMA SAI KOLLA', section: 'CSIT-B' },
  { rollNo: 33, registerNumber: '25B91A0764', name: 'MANI NAGA SAI NARASIMHA TRINADH MADDALA', section: 'CSIT-B' },
  { rollNo: 34, registerNumber: '25B91A0765', name: 'PRABHAS MAMUDURI', section: 'CSIT-B' },
  { rollNo: 35, registerNumber: '25B91A0766', name: 'RAJA PRASANNA KUMAR MANDA', section: 'CSIT-B' },
  { rollNo: 36, registerNumber: '25B91A0767', name: 'IKRAAM HUSSAIN MEER', section: 'CSIT-B' },
  { rollNo: 37, registerNumber: '25B91A0769', name: 'NUMAAN RAZA MOHAMMAD', section: 'CSIT-B' },
  { rollNo: 38, registerNumber: '25B91A0771', name: 'MANI VENKATA SATYANARAYANA MUCHARLA', section: 'CSIT-B' },
  { rollNo: 39, registerNumber: '25B91A0772', name: 'DURGA PRASAD MUGADA', section: 'CSIT-B' },
  { rollNo: 40, registerNumber: '25B91A0778', name: 'PRASANTH SEKHAR NELAPUDI', section: 'CSIT-B' },
  { rollNo: 41, registerNumber: '25B91A0779', name: 'BESWANTH NEPALA', section: 'CSIT-B' },
  { rollNo: 42, registerNumber: '25B91A0780', name: 'NANDA GOPAL SWAMY NODAGALA', section: 'CSIT-B' },
  { rollNo: 43, registerNumber: '25B91A0782', name: 'AMRUTHA PAMU', section: 'CSIT-B' },
  { rollNo: 44, registerNumber: '25B91A0784', name: 'SAI KRISHNA PAVULURI', section: 'CSIT-B' },
  { rollNo: 45, registerNumber: '25B91A0785', name: 'SAI SATHWIKA PENMATSA', section: 'CSIT-B' },
  { rollNo: 46, registerNumber: '25B91A0787', name: 'EMMANUYEL PENUGONDA', section: 'CSIT-B' },
  { rollNo: 47, registerNumber: '25B91A0792', name: 'JANARDHAN SAI PUPPALA', section: 'CSIT-B' },
  { rollNo: 48, registerNumber: '25B91A0793', name: 'AKASH RAJA', section: 'CSIT-B' },
  { rollNo: 49, registerNumber: '25B91A0794', name: 'HEMA SAHASRA RANGISETTI', section: 'CSIT-B' },
  { rollNo: 50, registerNumber: '25B91A0795', name: 'GEETHIKA REDDI', section: 'CSIT-B' },
  { rollNo: 51, registerNumber: '25B91A0796', name: 'SRIJA REDDY', section: 'CSIT-B' },
  { rollNo: 52, registerNumber: '25B91A07A0', name: 'HARI SATYA PRIYA DEVI SAKHIMSETTI', section: 'CSIT-B' },
  { rollNo: 53, registerNumber: '25B91A07A6', name: 'SUHANA SHAIK', section: 'CSIT-B' },
  { rollNo: 54, registerNumber: '25B91A07A7', name: 'PARDHA SARADHI SIRIPURAPU', section: 'CSIT-B' },
  { rollNo: 55, registerNumber: '25B91A07B5', name: 'YUVA PRIYA MOULIKA TELU', section: 'CSIT-B' },
  { rollNo: 56, registerNumber: '25B91A07B6', name: 'RADHIKA AISHWARYA UNGARALA', section: 'CSIT-B' },
  { rollNo: 57, registerNumber: '25B91A07B8', name: 'HARSHA VARDHAN UTTARILLI', section: 'CSIT-B' },
  { rollNo: 58, registerNumber: '25B91A07C8', name: 'MANISHA VENNAPUSA', section: 'CSIT-B' },
  { rollNo: 59, registerNumber: '25B91A07D1', name: 'PRADEEP KUMAR YALLA', section: 'CSIT-B' },
  { rollNo: 60, registerNumber: '25B91A07D2', name: 'JOHN ELISHA YERICHERLA', section: 'CSIT-B' },
  { rollNo: 61, registerNumber: '24B91A0745', name: 'KATRAGADDA ARJUN NAIDU', section: 'CSIT-B' },
  { rollNo: 62, registerNumber: '24B91A0738', name: 'GUNDU TARUN SAI', section: 'CSIT-B' },
];

export async function importSecondYearCsit() {
  console.log('=======================================================');
  console.log(' IMPORTING 2ND YEAR CSIT STUDENTS (SEMESTER 3)');
  console.log(' S.R.K.R. Engineering College (Autonomous)');
  console.log('=======================================================\n');

  const url = process.env.DATABASE_URL || '';
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  const sql = neon(url);

  // 1. Create or ensure sections exist
  console.log('>>> [1/4] Ensuring Academic Sections exist...');
  const sectionsToEnsure = [
    { sectionName: 'CSIT-A', branch: 'CSIT', academicYear: '2026-2027', semester: 3 },
    { sectionName: 'CSIT-B', branch: 'CSIT', academicYear: '2026-2027', semester: 3 },
  ];

  for (const s of sectionsToEnsure) {
    const existing = await sql`
      SELECT id FROM sections 
      WHERE section_name = ${s.sectionName} 
        AND branch = ${s.branch} 
        AND academic_year = ${s.academicYear} 
        AND semester = ${s.semester}
    `;
    if (existing.length === 0) {
      await sql`
        INSERT INTO sections (id, section_name, branch, academic_year, semester, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${s.sectionName}, ${s.branch}, ${s.academicYear}, ${s.semester}, NOW(), NOW())
      `;
    }
    console.log(`    ✓ Section "${s.branch} - ${s.sectionName}" (AY ${s.academicYear}, Sem ${s.semester}) ready.`);
  }

  // 2. Ensure Exams exist for AY 2026-2027 Semester 3 & 4
  console.log('\n>>> [2/4] Ensuring Examination Periods exist for AY 2026-2027...');
  const examsToEnsure = [
    { examName: 'MID_1', academicYear: '2026-2027', semester: 3 },
    { examName: 'MID_2', academicYear: '2026-2027', semester: 3 },
    { examName: 'LAB_INTERNAL', academicYear: '2026-2027', semester: 3 },
    { examName: 'MID_1', academicYear: '2026-2027', semester: 4 },
    { examName: 'MID_2', academicYear: '2026-2027', semester: 4 },
    { examName: 'LAB_INTERNAL', academicYear: '2026-2027', semester: 4 },
  ];

  for (const e of examsToEnsure) {
    const existing = await sql`
      SELECT id FROM exams 
      WHERE exam_name = ${e.examName} 
        AND academic_year = ${e.academicYear} 
        AND semester = ${e.semester}
    `;
    if (existing.length === 0) {
      await sql`
        INSERT INTO exams (id, exam_name, academic_year, semester, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${e.examName}, ${e.academicYear}, ${e.semester}, NOW(), NOW())
      `;
    }
  }
  console.log('    ✓ Exam periods (MID_1, MID_2, LAB_INTERNAL) verified.');

  // 3. Import Students for CSIT-A
  console.log(`\n>>> [3/4] Importing ${CSIT_A_STUDENTS.length} students for CSIT-A...`);
  let countA = 0;
  for (const stu of CSIT_A_STUDENTS) {
    const passwordHash = bcrypt.hashSync(stu.registerNumber, 10);
    const userId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    const userRows = await sql`
      INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
      VALUES (${userId}, ${stu.registerNumber}, ${passwordHash}, 'STUDENT', NOW(), NOW())
      ON CONFLICT (username) DO UPDATE 
        SET role = 'STUDENT', updated_at = NOW()
      RETURNING id
    `;
    const actualUserId = userRows[0].id;

    await sql`
      INSERT INTO students (id, user_id, register_number, name, branch, section, academic_year, semester, created_at, updated_at)
      VALUES (${studentId}, ${actualUserId}, ${stu.registerNumber}, ${stu.name}, 'CSIT', 'CSIT-A', '2026-2027', 3, NOW(), NOW())
      ON CONFLICT (register_number) DO UPDATE
        SET name = EXCLUDED.name,
            branch = EXCLUDED.branch,
            section = EXCLUDED.section,
            academic_year = EXCLUDED.academic_year,
            semester = EXCLUDED.semester,
            user_id = EXCLUDED.user_id,
            updated_at = NOW()
    `;
    countA++;
  }
  console.log(`    ✓ Successfully upserted ${countA} students in Section CSIT-A.`);

  // 4. Import Students for CSIT-B
  console.log(`\n>>> [4/4] Importing ${CSIT_B_STUDENTS.length} students for CSIT-B...`);
  let countB = 0;
  for (const stu of CSIT_B_STUDENTS) {
    const passwordHash = bcrypt.hashSync(stu.registerNumber, 10);
    const userId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    const userRows = await sql`
      INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
      VALUES (${userId}, ${stu.registerNumber}, ${passwordHash}, 'STUDENT', NOW(), NOW())
      ON CONFLICT (username) DO UPDATE 
        SET role = 'STUDENT', updated_at = NOW()
      RETURNING id
    `;
    const actualUserId = userRows[0].id;

    await sql`
      INSERT INTO students (id, user_id, register_number, name, branch, section, academic_year, semester, created_at, updated_at)
      VALUES (${studentId}, ${actualUserId}, ${stu.registerNumber}, ${stu.name}, 'CSIT', 'CSIT-B', '2026-2027', 3, NOW(), NOW())
      ON CONFLICT (register_number) DO UPDATE
        SET name = EXCLUDED.name,
            branch = EXCLUDED.branch,
            section = EXCLUDED.section,
            academic_year = EXCLUDED.academic_year,
            semester = EXCLUDED.semester,
            user_id = EXCLUDED.user_id,
            updated_at = NOW()
    `;
    countB++;
  }
  console.log(`    ✓ Successfully upserted ${countB} students in Section CSIT-B.`);

  // Summary Verification
  const totalStudentsRes = await sql`SELECT count(*)::int as count FROM students`;
  const totalUsersRes = await sql`SELECT count(*)::int as count FROM users`;
  const totalSectionsRes = await sql`SELECT count(*)::int as count FROM sections`;
  const totalMarksRes = await sql`SELECT count(*)::int as count FROM marks`;
  const csitACountRes = await sql`
    SELECT count(*)::int as count 
    FROM students 
    WHERE branch = 'CSIT' AND section = 'CSIT-A' AND semester = 3 AND academic_year = '2026-2027'
  `;
  const csitBCountRes = await sql`
    SELECT count(*)::int as count 
    FROM students 
    WHERE branch = 'CSIT' AND section = 'CSIT-B' AND semester = 3 AND academic_year = '2026-2027'
  `;

  console.log('\n=======================================================');
  console.log(' DATABASE INTEGRITY REPORT POST-IMPORT');
  console.log('=======================================================');
  console.log(`Total Students in DB:       ${totalStudentsRes[0].count} (Expected: 555)`);
  console.log(`Total User Accounts:        ${totalUsersRes[0].count} (Expected: 578)`);
  console.log(`Total Academic Sections:    ${totalSectionsRes[0].count} (Expected: 8)`);
  console.log(`Total Existing Marks:       ${totalMarksRes[0].count} (Expected: 435 preserved)`);
  console.log(`CSIT-A (2nd Year Sem 3):    ${csitACountRes[0].count} students (Expected: 72)`);
  console.log(`CSIT-B (2nd Year Sem 3):    ${csitBCountRes[0].count} students (Expected: 62)`);
  console.log('=======================================================\n');
}

if (require.main === module) {
  importSecondYearCsit()
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.error('Import Failed:', e);
      process.exit(1);
    });
}
