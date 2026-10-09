"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SUBJECTS_DATA = [
    // =========================================================================
    // 1. 2ND YEAR (II B.TECH — R23 REGULATION) — STRICTLY SEMESTERS 3 & 4
    // =========================================================================
    // --- 2nd Year Sem 1 / II-I (CSIT) -> SEMESTER 3 ---
    { subjectCode: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23HS2101', subjectName: 'Universal Human Values -II : Understanding Harmony and Ethical Human Conduct', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23CS2102', subjectName: 'Database Management Systems', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23CS2103', subjectName: 'Object-oriented programming through java', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23CS2104', subjectName: 'Database management systems lab', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23CS2106', subjectName: 'Python programming', branch: 'CSIT', semester: 3 },
    { subjectCode: 'B23MC2101', subjectName: 'English Proficiency', branch: 'CSIT', semester: 3 },
    // --- 2nd Year Sem 1 / II-I (CSD) -> SEMESTER 3 ---
    { subjectCode: 'B23BS2101', subjectName: 'Discrete Mathematics and Graph Theory', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23HS2101', subjectName: 'Universal Human Values -II : Understanding Harmony and Ethical Human Conduct', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23CS2101', subjectName: 'Digital Logic & Computer Organization', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23CS2102', subjectName: 'Database Management Systems', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23CS2103', subjectName: 'Object-oriented programming through java', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23CS2104', subjectName: 'Database management systems lab', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23CS2105', subjectName: 'Object Oriented Programing through Java Lab', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23CS2106', subjectName: 'Python programming', branch: 'CSD', semester: 3 },
    { subjectCode: 'B23MC2102', subjectName: 'Environmental science', branch: 'CSD', semester: 3 },
    // --- 2nd Year Sem 2 / II-II (CSIT) -> SEMESTER 4 ---
    { subjectCode: 'B23HS2201', subjectName: 'Managerial Economics and Financial Analysis', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23BS2201', subjectName: 'Probability & Statistics', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CS2201', subjectName: 'Operating Systems', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CS2202', subjectName: 'Advanced Data Structures & Algorithm Analysis', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CD2201', subjectName: 'Human Computer Interaction', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CD2202', subjectName: 'Human Computer Interaction Lab', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CS2205', subjectName: 'Advanced Data Structures & Algorithm Analysis Lab', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CT2201', subjectName: 'Full Stack development-I', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23CT2202', subjectName: 'Design Thinking & Innovation', branch: 'CSIT', semester: 4 },
    { subjectCode: 'B23MC2202', subjectName: 'Environmental Science', branch: 'CSIT', semester: 4 },
    // --- 2nd Year Sem 2 / II-II (CSD) -> SEMESTER 4 ---
    { subjectCode: 'B23HS2201', subjectName: 'Managerial Economics and Financial Analysis', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23BS2204', subjectName: 'Mathematical Modelling and Simulation', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CS2201', subjectName: 'Operating Systems', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CS2202', subjectName: 'Advanced Data Structures & Algorithm Analysis', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CD2201', subjectName: 'Human Computer Interaction', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CD2202', subjectName: 'Human Computer Interaction Lab', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CS2205', subjectName: 'Advanced Data Structures & Algorithm Analysis Lab', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CD2203', subjectName: 'Full Stack development - I', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23CD2204', subjectName: 'Design Thinking & Innovation', branch: 'CSD', semester: 4 },
    { subjectCode: 'B23MC2201', subjectName: 'English Proficiency', branch: 'CSD', semester: 4 },
    // =========================================================================
    // 2. 3RD YEAR (III B.TECH — R23 REGULATION) — STRICTLY SEMESTERS 5 & 6
    // =========================================================================
    // --- 3rd Year Sem 1 / III-I (CSIT) -> SEMESTER 5 ---
    { subjectCode: 'B23CT3101', subjectName: 'Internet of Things', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CD3102', subjectName: 'Computer Networks', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3106', subjectName: 'Full Stack Development-2 Lab', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3107', subjectName: 'Data Mining and Data Warehousing Lab', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23BS3101', subjectName: 'Soft Skills', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3108', subjectName: 'Tinkering Lab', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3109', subjectName: 'Evaluation of Community Service Internship', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3102', subjectName: 'PE-I: Visual Design and Communication', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3103', subjectName: 'PE-I: Mobile Computing', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3104', subjectName: 'PE-I: No SQL', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CD3107', subjectName: 'PE-I: Artificial Intelligence', branch: 'CSIT', semester: 5 },
    { subjectCode: 'B23CT3105', subjectName: 'PE-I: MOOCS-I', branch: 'CSIT', semester: 5 },
    // --- 3rd Year Sem 1 / III-I (CSD) -> SEMESTER 5 ---
    { subjectCode: 'B23CD3101', subjectName: 'Visual Design and Communication', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3102', subjectName: 'Computer Networks', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3103', subjectName: 'Data Mining and Data Warehousing', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3109', subjectName: 'Full Stack Development-2 Lab', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3110', subjectName: 'Data Mining and Data Warehousing Lab', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23BS3101', subjectName: 'Soft Skills', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3111', subjectName: 'Tinkering Lab', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3112', subjectName: 'Evaluation Of Community Service Internship', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3104', subjectName: 'PE-I: Software Engineering', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3105', subjectName: 'PE-I: Cyber Security', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3106', subjectName: 'PE-I: Internet of Things', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3107', subjectName: 'PE-I: Artificial Intelligence', branch: 'CSD', semester: 5 },
    { subjectCode: 'B23CD3108', subjectName: 'PE-I: MOOCS-I', branch: 'CSD', semester: 5 },
    // --- 3rd Year Sem 2 / III-II (CSIT) -> SEMESTER 6 ---
    { subjectCode: 'B23CT3201', subjectName: 'Cryptography & Network Security', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CD3202', subjectName: 'Machine Learning', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3202', subjectName: 'Software Engineering', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3211', subjectName: 'Cryptography & Network Security Lab', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3212', subjectName: 'Machine Learning using Python Lab', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3213', subjectName: 'Internet of Things Lab', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23AC3201', subjectName: 'Technical Paper Writing & IPR', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23MC3201', subjectName: 'Employability Skills', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3203', subjectName: 'PE-II: Automata Theory and Compiler Design', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3204', subjectName: 'PE-II: Reinforcement Learning', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CD3206', subjectName: 'PE-II: Cloud Computing', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3205', subjectName: 'PE-II: Network Programming', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3206', subjectName: 'PE-II: MOOCS-II', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CD3209', subjectName: 'PE-III: Object Oriented Analysis and Design', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3207', subjectName: 'PE-III: Data Visualization', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3208', subjectName: 'PE-III: Distributed Systems', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3209', subjectName: 'PE-III: Information Retrieval System', branch: 'CSIT', semester: 6 },
    { subjectCode: 'B23CT3210', subjectName: 'PE-III: MOOCS-III', branch: 'CSIT', semester: 6 },
    // --- 3rd Year Sem 2 / III-II (CSD) -> SEMESTER 6 ---
    { subjectCode: 'B23CD3201', subjectName: 'Automata Theory and Compiler Design', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3202', subjectName: 'Machine Learning', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3203', subjectName: 'Design of Interactive Systems', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3213', subjectName: 'Multimedia Applications & Development Lab', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3214', subjectName: 'Machine Learning using Python Lab.', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3215', subjectName: 'Internet of Things Lab', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23AC3201', subjectName: 'Technical Paper Writing & IPR', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23MC3201', subjectName: 'Employability Skills', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3204', subjectName: 'PE-II: Software Testing Methodologies', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3205', subjectName: 'PE-II: Cryptography & Network Security', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3206', subjectName: 'PE-II: Cloud Computing', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3207', subjectName: 'PE-II: Principles of Video Editing and 3D Animation', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3208', subjectName: 'PE-II: MOOCS-II', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3209', subjectName: 'PE-III: Object Oriented Analysis and Design', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3210', subjectName: 'PE-III: Mobile Adhoc Networks', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3211', subjectName: 'PE-III: Augmented Reality and Virtual Reality', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3212', subjectName: 'PE-III: Computer Graphics & Animation', branch: 'CSD', semester: 6 },
    { subjectCode: 'B23CD3213', subjectName: 'PE-III: MOOCS-III', branch: 'CSD', semester: 6 },
    // =========================================================================
    // 3. 4TH YEAR (IV B.TECH — R23 REGULATION) — STRICTLY SEMESTERS 7 & 8
    // =========================================================================
    // --- 4th Year Sem 1 / IV-I (CSIT) -> SEMESTER 7 ---
    { subjectCode: 'B23CT4101', subjectName: 'Fundamentals of Deep Learning', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23HS4101', subjectName: 'Human Resources & Project Management', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4112', subjectName: 'Prompt Engineering', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23MC4101', subjectName: 'Constitution of India', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4113', subjectName: 'Evaluation of Industry Internship /Mini Project', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23OE4101', subjectName: 'Open Elective-III', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23OE4102', subjectName: 'Open Elective-IV', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4102', subjectName: 'PE-IV: Information Security', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23AD4102', subjectName: 'PE-IV: Devops', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4103', subjectName: 'PE-IV: Data Science using Python', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4104', subjectName: 'PE-IV: Mobile Computing', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4105', subjectName: 'PE-IV: Cyber Security', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4106', subjectName: 'PE-IV: MOOCS-IV (12 week MOOC Swayam/NPTEL)', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4107', subjectName: 'PE-V: Data Engineering', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4108', subjectName: 'PE-V: AI & NN', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4109', subjectName: 'PE-V: Snow Flake Cloud Analysis', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4110', subjectName: 'PE-V: Advance Computing', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CD4107', subjectName: 'PE-V: Big Data Analysis', branch: 'CSIT', semester: 7 },
    { subjectCode: 'B23CT4111', subjectName: 'PE-V: MOOCS-V (12 week MOOC Swayam/NPTEL)', branch: 'CSIT', semester: 7 },
    // --- 4th Year Sem 1 / IV-I (CSD) -> SEMESTER 7 ---
    { subjectCode: 'B23CT4101', subjectName: 'Fundamentals of Deep Learning', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23HS4101', subjectName: 'Human Resource & Project Management', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4109', subjectName: 'Prompt Engineering', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23MC4101', subjectName: 'Constitution of India', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4110', subjectName: 'Evaluation of Industry Internship /Mini Project.', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23OE4101', subjectName: 'Open Elective-III', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23OE4102', subjectName: 'Open Elective-IV', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CS4102', subjectName: 'PE-IV: Software Architecture & Design Patterns', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4101', subjectName: 'PE-IV: Introduction to Block chain Technology', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CT4103', subjectName: 'PE-IV: Data Science using Python', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23IT4103', subjectName: 'PE-IV: Computer Vision', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4102', subjectName: 'PE-IV: Animation Principles and Design', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4103', subjectName: 'PE-IV: MOOCS-IV (12 week MOOC Swayam/NPTEL)', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4104', subjectName: 'PE-V: Introduction to Agile methodologies', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4105', subjectName: 'PE-V: Game Design & Development', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23IT4108', subjectName: 'PE-V: Cyber Physical Systems', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4106', subjectName: 'PE-V: Digital Audio Design & Synthesis', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4107', subjectName: 'PE-V: Big Data Analysis', branch: 'CSD', semester: 7 },
    { subjectCode: 'B23CD4108', subjectName: 'PE-V: MOOCS-V (12 week MOOC Swayam/NPTEL)', branch: 'CSD', semester: 7 },
];
const EXAMS_DATA = [
    // 4th Year Exams (Semesters 7 & 8)
    { examType: 'MID_1', academicYear: '2025-2026', semester: 7 },
    { examType: 'MID_2', academicYear: '2025-2026', semester: 7 },
    { examType: 'LAB_INTERNAL', academicYear: '2025-2026', semester: 7 },
    { examType: 'MID_1', academicYear: '2025-2026', semester: 8 },
    { examType: 'MID_2', academicYear: '2025-2026', semester: 8 },
    { examType: 'LAB_INTERNAL', academicYear: '2025-2026', semester: 8 },
    // 3rd Year Exams (Semesters 5 & 6)
    { examType: 'MID_1', academicYear: '2025-2026', semester: 5 },
    { examType: 'MID_2', academicYear: '2025-2026', semester: 5 },
    { examType: 'LAB_INTERNAL', academicYear: '2025-2026', semester: 5 },
    { examType: 'MID_1', academicYear: '2025-2026', semester: 6 },
    { examType: 'MID_2', academicYear: '2025-2026', semester: 6 },
    { examType: 'LAB_INTERNAL', academicYear: '2025-2026', semester: 6 },
    // 2nd Year Exams (Semesters 3 & 4)
    { examType: 'MID_1', academicYear: '2025-2026', semester: 3 },
    { examType: 'MID_2', academicYear: '2025-2026', semester: 3 },
    { examType: 'LAB_INTERNAL', academicYear: '2025-2026', semester: 3 },
    { examType: 'MID_1', academicYear: '2025-2026', semester: 4 },
    { examType: 'MID_2', academicYear: '2025-2026', semester: 4 },
    { examType: 'LAB_INTERNAL', academicYear: '2025-2026', semester: 4 },
];
async function seed() {
    console.log('--- SEEDING OFFICIAL R23 ACADEMIC DATA (2ND, 3RD, 4TH YEARS) ---');
    // 1. Clean existing subjects without active marks
    console.log('Cleaning unlinked subject duplicates...');
    try {
        const unlinkedSubjects = await prisma.subject.findMany({
            where: { marks: { none: {} } },
            select: { id: true },
        });
        if (unlinkedSubjects.length > 0) {
            await prisma.subject.deleteMany({
                where: { id: { in: unlinkedSubjects.map((s) => s.id) } },
            });
            console.log(`✓ Cleaned ${unlinkedSubjects.length} unlinked old subjects.`);
        }
    }
    catch (err) {
        console.warn('Subject cleanup warning:', err);
    }
    // 2. Upsert Strictly Segregated Subjects
    let subInserted = 0;
    for (const s of SUBJECTS_DATA) {
        await prisma.subject.upsert({
            where: {
                subject_composite_unique: {
                    subjectCode: s.subjectCode,
                    branch: s.branch,
                    semester: s.semester,
                },
            },
            update: { subjectName: s.subjectName },
            create: s,
        });
        subInserted++;
    }
    console.log(`✓ Seeded ${subInserted} strictly isolated official curriculum subjects.`);
    // 3. Upsert Exams
    let examInserted = 0;
    for (const e of EXAMS_DATA) {
        await prisma.exam.upsert({
            where: {
                exam_composite_unique: {
                    examType: e.examType,
                    academicYear: e.academicYear,
                    semester: e.semester,
                },
            },
            update: {},
            create: e,
        });
        examInserted++;
    }
    console.log(`✓ Seeded ${examInserted} examination periods.`);
}
seed()
    .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
