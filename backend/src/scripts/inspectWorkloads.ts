import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
const workbook = XLSX.readFile(filePath);

for (const name of ['NEW WORKLOAD', 'WORKLOADS', 'INDIVIDUAL TIME  TABLE', 'LAB PERSONS']) {
  const sheet = workbook.Sheets[name];
  if (!sheet) continue;
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  console.log(`\n=== Sheet: ${name} (Rows: ${data.length}) ===`);
  for (let r = 0; r < Math.min(30, data.length); r++) {
    const row = (data[r] || []).filter(x => x !== undefined && x !== '');
    if (row.length > 0) {
      console.log(`Row ${r}:`, JSON.stringify(row));
    }
  }
}
