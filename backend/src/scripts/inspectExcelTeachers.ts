import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  console.log(`\n=== Sheet: ${name} ===`);
  
  let inCourseTable = false;
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    const rowStr = JSON.stringify(row || []);
    if (rowStr.includes('Course') && (rowStr.includes('Teacher') || rowStr.includes('Credits'))) {
      inCourseTable = true;
      continue;
    }
    if (inCourseTable) {
      if (!row || !row[0] || String(row[0]).startsWith('Program') || String(row[0]).startsWith('1st Period')) {
        inCourseTable = false;
        continue;
      }
      console.log(`[${row[0]}] ${row[1]} ---> Teacher: "${row[2]}"`);
    }
  }
}
