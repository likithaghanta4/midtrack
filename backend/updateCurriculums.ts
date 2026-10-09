import fs from 'fs';
import path from 'path';
import { R23_CURRICULUM } from './src/config/r23Curriculum';

const updatedBackendCurriculum = R23_CURRICULUM.map((course) => {
  let newSem = course.semester;
  if (course.year === 2) {
    newSem = course.semester === 1 ? 3 : 4;
  } else if (course.year === 3) {
    newSem = course.semester === 1 ? 5 : 6;
  }
  return {
    ...course,
    semester: newSem,
  };
});

const backendTsContent = `/**
 * SRKR Engineering College (Autonomous) - R23 Regulation Course Structures
 * With effect from 2023-24 admitted batch onwards
 * B.Tech Academic Semesters Scheme:
 * - 2nd Year (II B.Tech):  Sem 3 (II-I) & Sem 4 (II-II)
 * - 3rd Year (III B.Tech): Sem 5 (III-I) & Sem 6 (III-II)
 */

export interface R23Course {
  courseCode: string;
  courseName: string;
  category: 'BS' | 'HS' | 'PC' | 'SEC' | 'ES' | 'MC' | 'PE' | 'OE' | 'PR' | 'AC';
  l: number;
  t: number;
  p: number;
  credits: number | null; // null for non-credit mandatory/audit courses (MC / AC)
  cie: number;            // Continuous Internal Evaluation (Max 30)
  see: number | null;     // Semester End Examination (Max 70, null for MC/AC, 50 for PR)
  totalMarks: number;
  branch: 'CSIT' | 'CSD';
  year: number;           // 2 or 3
  semester: number;       // 3/4 for 2nd Year, 5/6 for 3rd Year
  isElectiveChoice?: boolean;
  electiveGroup?: 'PE-I' | 'PE-II' | 'PE-III' | 'OE-I' | 'OE-II';
}

export const R23_CURRICULUM: R23Course[] = ${JSON.stringify(updatedBackendCurriculum, null, 2)};
`;

const frontendTsContent = `/**
 * SRKR Engineering College (Autonomous) - Official R23 Regulation Course Structures
 * With effect from 2023-24 admitted batch onwards
 * B.Tech Academic Semesters Scheme:
 * - 2nd Year (II B.Tech):  Sem 3 (II-I) & Sem 4 (II-II)
 * - 3rd Year (III B.Tech): Sem 5 (III-I) & Sem 6 (III-II)
 */

export interface R23CourseStructure {
  courseCode: string;
  courseName: string;
  category: 'BS' | 'HS' | 'PC' | 'SEC' | 'ES' | 'MC' | 'PE' | 'OE' | 'PR' | 'AC';
  l: number;
  t: number;
  p: number;
  credits: number | null;
  cie: number; // Continuous Internal Evaluation (30)
  see: number | null; // Semester End Examination (70 or 50)
  totalMarks: number;
  branch: 'CSIT' | 'CSD';
  year: number; // 2 or 3
  semester: number; // 3/4 for 2nd Year, 5/6 for 3rd Year
  isLab?: boolean;
  isMandatoryNonCredit?: boolean;
  isElectiveChoice?: boolean;
  electiveGroup?: 'PE-I' | 'PE-II' | 'PE-III' | 'OE-I' | 'OE-II';
}

export const R23_CURRICULUM_DATA: R23CourseStructure[] = ${JSON.stringify(updatedBackendCurriculum, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'src/config/r23Curriculum.ts'), backendTsContent);
console.log('✓ Updated backend/src/config/r23Curriculum.ts');

fs.writeFileSync(path.join(__dirname, '../frontend/src/utils/r23Curriculum.ts'), frontendTsContent);
console.log('✓ Updated frontend/src/utils/r23Curriculum.ts');
