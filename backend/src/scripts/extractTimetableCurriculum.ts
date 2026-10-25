import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

const classSheets = [
  { sheet: '2-1 CSD', year: 2, sem: 3, branch: 'CSD', section: 'CSD' },
  { sheet: '2-1 CSIT-A', year: 2, sem: 3, branch: 'CSIT', section: 'CSIT-A' },
  { sheet: '2-1 CSIT-B', year: 2, sem: 3, branch: 'CSIT', section: 'CSIT-B' },
  { sheet: '3-1 CSD', year: 3, sem: 5, branch: 'CSD', section: 'CSD' },
  { sheet: '3-1 CSIT -A', year: 3, sem: 5, branch: 'CSIT', section: 'CSIT-A' },
  { sheet: '3-1 CSIT-B', year: 3, sem: 5, branch: 'CSIT', section: 'CSIT-B' },
  { sheet: '4-1 CSD', year: 4, sem: 7, branch: 'CSD', section: 'CSD' },
  { sheet: '4-1 CSIT', year: 4, sem: 7, branch: 'CSIT', section: 'CSIT' },
];

interface SubjectEntry {
  classSheet: string;
  year: number;
  sem: number;
  branch: string;
  section: string;
  abbr: string;
  code: string;
  title: string;
  credits: number;
  teacherRaw: string;
  isLab: boolean;
  isOE: boolean;
  isAudit: boolean;
}

const extracted: SubjectEntry[] = [];

for (const cls of classSheets) {
  const sheet = workbook.Sheets[cls.sheet];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  // Find where course table starts (usually has "[Code] Course" or "Course (Credits)")
  let startRow = -1;
  for (let r = 0; r < data.length; r++) {
    const rowStr = JSON.stringify(data[r] || []);
    if (rowStr.includes('Course') && (rowStr.includes('Credits') || rowStr.includes('Teacher'))) {
      startRow = r + 1;
      break;
    }
  }

  if (startRow === -1) {
    console.log(`Could not find course table in ${cls.sheet}`);
    continue;
  }

  for (let r = startRow; r < data.length; r++) {
    const row = data[r];
    if (!row || !row[0]) continue;
    const col0 = String(row[0]).trim();
    if (col0.startsWith('1st Period') || col0.startsWith('Program Co-ordinator') || col0.includes('Period -')) {
      break;
    }

    const abbr = col0;
    const courseDetails = String(row[1] || '').trim();
    const teacher = String(row[2] || '').trim();

    // Extract code and title
    // Example: "[B23BS2101 ]Discrete Mathematics and Graph Theory(3)"
    const codeMatch = courseDetails.match(/\[(.*?)\]/);
    const code = codeMatch ? codeMatch[1].trim() : abbr;
    let title = courseDetails.replace(/\[.*?\]/, '').trim();
    
    // Extract credits if available, e.g. (3)
    const credMatch = title.match(/\((\d+(?:\.\d+)?)\)$/);
    const credits = credMatch ? parseFloat(credMatch[1]) : 3;
    title = title.replace(/\(\d+(?:\.\d+)?\)$/, '').trim();

    const isLab = abbr.includes('LAB') || title.toLowerCase().includes('lab');
    const isOE = abbr.startsWith('OE') || title.toUpperCase().includes('OPEN ELECTIVE') || title.toUpperCase().startsWith('OE');
    const isAudit = abbr === 'EP' || abbr === 'ES' || abbr === 'COI' || title.toLowerCase().includes('audit') || credits === 0;

    extracted.push({
      classSheet: cls.sheet,
      year: cls.year,
      sem: cls.sem,
      branch: cls.branch,
      section: cls.section,
      abbr,
      code,
      title: title || abbr,
      credits,
      teacherRaw: teacher,
      isLab,
      isOE,
      isAudit,
    });
  }
}

console.log(`Extracted ${extracted.length} course mappings across all 8 classes:\n`);
for (const e of extracted) {
  console.log(`[${e.classSheet}] [${e.code}] ${e.title} | Credits: ${e.credits} | Teacher: ${e.teacherRaw} | Lab: ${e.isLab} | OE: ${e.isOE}`);
}
