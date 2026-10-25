import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

const classSheets = [
  '2-1 CSD',
  '2-1 CSIT-A',
  '2-1 CSIT-B',
  '3-1 CSD',
  '3-1 CSIT -A',
  '3-1 CSIT-B',
  '4-1 CSD',
  '4-1 CSIT',
];

const allRows: any[] = [];

for (const name of classSheets) {
  const sheet = workbook.Sheets[name];
  if (!sheet) continue;
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  // Find header row with [Code] Course
  let headerRow = -1;
  for (let r = 0; r < data.length; r++) {
    const s = JSON.stringify(data[r] || []);
    if (s.includes('Course') && (s.includes('Teacher') || s.includes('Credits'))) {
      headerRow = r;
      break;
    }
  }

  if (headerRow === -1) continue;

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    if (!row || !row[0] || String(row[0]).startsWith('Program') || String(row[0]).startsWith('1st Period')) break;
    const abbr = String(row[0]).trim();
    const course = String(row[1] || '').trim();
    // Teacher is usually in col 2, 3, or 4
    let teacher = '';
    for (let c = 2; c < row.length; c++) {
      const val = String(row[c] || '').trim();
      if (val && !['3', '2', '1.5', '0', '-', '1'].includes(val) && (val.includes('Dr.') || val.includes('Mr.') || val.includes('Sri') || val.includes('Mrs.') || val.includes('Smt') || val.includes('('))) {
        teacher = val;
        break;
      }
    }
    allRows.push({ class: name, abbr, course, teacher });
  }
}

console.log('Total extracted courses:', allRows.length);
console.log(JSON.stringify(allRows, null, 2));
