import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets['2-1 CSIT-A'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

for (let r = 0; r < data.length; r++) {
  const row = data[r];
  if (row && row.some(x => x !== undefined && x !== '')) {
    console.log(`Row ${r}:`, JSON.stringify(row));
  }
}
