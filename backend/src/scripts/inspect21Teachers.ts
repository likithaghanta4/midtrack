import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

for (const name of ['2-1 CSIT-B', '2-1 CSD']) {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  console.log(`\n=== Sheet: ${name} ===`);
  for (let r = 10; r < 25; r++) {
    const row = data[r];
    if (row && (row[0] || row[1])) {
      console.log(`[${row[0]}] ${row[1]} ---> Teacher: "${row[4]}"`);
    }
  }
}
