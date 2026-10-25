import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

const classSheets = [
  '4-1 CSD',
  '4-1 CSIT',
  '3-1 CSD',
  '3-1 CSIT -A',
  '3-1 CSIT-B',
  '2-1 CSIT-A',
  '2-1 CSIT-B',
  '2-1 CSD',
];

for (const name of classSheets) {
  console.log(`\n======================================================================`);
  console.log(`CLASS SHEET: ${name}`);
  console.log(`======================================================================`);
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    const rowStr = row.map(c => (c !== undefined && c !== null ? String(c).trim() : '')).filter(Boolean).join(' | ');
    if (rowStr.length > 0) {
      console.log(`R${r + 1}: ${rowStr}`);
    }
  }
}
