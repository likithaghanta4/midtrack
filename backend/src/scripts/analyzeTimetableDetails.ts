import * as XLSX from 'xlsx';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/prisma';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

const classSheets = [
  { sheet: '2-1 CSD', sem: 3, branch: 'CSD', section: 'CSD' },
  { sheet: '2-1 CSIT-A', sem: 3, branch: 'CSIT', section: 'CSIT-A' },
  { sheet: '2-1 CSIT-B', sem: 3, branch: 'CSIT', section: 'CSIT-B' },
  { sheet: '3-1 CSD', sem: 5, branch: 'CSD', section: 'CSD' },
  { sheet: '3-1 CSIT -A', sem: 5, branch: 'CSIT', section: 'CSIT-A' },
  { sheet: '3-1 CSIT-B', sem: 5, branch: 'CSIT', section: 'CSIT-B' },
  { sheet: '4-1 CSD', sem: 7, branch: 'CSD', section: 'CSD' },
  { sheet: '4-1 CSIT', sem: 7, branch: 'CSIT', section: 'CSIT' },
];

async function analyzeAllCoursesAndFaculty() {
  const allFaculty = await prisma.faculty.findMany({ select: { id: true, facultyId: true, name: true, department: true } });
  console.log(`Available authentic faculty in DB: ${allFaculty.length}`);

  const courseList: any[] = [];

  for (const cls of classSheets) {
    const sheet = workbook.Sheets[cls.sheet];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let startRow = -1;
    for (let r = 0; r < data.length; r++) {
      const rowStr = JSON.stringify(data[r] || []);
      if (rowStr.includes('Course') && (rowStr.includes('Credits') || rowStr.includes('Teacher'))) {
        startRow = r + 1;
        break;
      }
    }

    if (startRow === -1) continue;

    for (let r = startRow; r < data.length; r++) {
      const row = data[r];
      if (!row || !row[0]) continue;
      const col0 = String(row[0]).trim();
      if (col0.startsWith('1st Period') || col0.startsWith('Program Co-ordinator') || col0.includes('Period -')) break;

      const abbr = col0;
      const courseDetails = String(row[1] || '').trim();
      
      // Teacher can be in row[2], row[3], row[4]
      let teacherStr = '';
      for (let c = 2; c <= 5; c++) {
        if (row[c] && typeof row[c] === 'string' && row[c].trim().length > 1 && !row[c].includes('-')) {
          teacherStr = row[c].trim();
          break;
        }
      }

      const codeMatch = courseDetails.match(/\[(.*?)\]/);
      let code = codeMatch ? codeMatch[1].trim() : abbr;
      let title = courseDetails.replace(/\[.*?\]/, '').trim();
      const credMatch = title.match(/\((\d+(?:\.\d+)?)\)$/);
      const credits = credMatch ? parseFloat(credMatch[1]) : 3;
      title = title.replace(/\(\d+(?:\.\d+)?\)$/, '').trim();

      courseList.push({
        sheet: cls.sheet,
        sem: cls.sem,
        branch: cls.branch,
        section: cls.section,
        abbr,
        code,
        title: title || abbr,
        credits,
        teacherStr,
      });
    }
  }

  console.log(`\nTotal parsed courses: ${courseList.length}`);
  for (const c of courseList) {
    console.log(`[Sem ${c.sem}] [${c.branch} - ${c.section}] [${c.code}] ${c.title} (Credits: ${c.credits}) -> Teacher: "${c.teacherStr}"`);
  }
}

analyzeAllCoursesAndFaculty()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
