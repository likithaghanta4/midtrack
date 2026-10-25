import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('..', '2026-27 Sem1 UPDATED ON 15-07-2026.xlsx');
console.log('Loading workbook from:', filePath);

const workbook = XLSX.readFile(filePath);
console.log('Sheet Names:', workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  console.log(`\n========================================================`);
  console.log(`SHEET: "${sheetName}" (Rows: ${data.length})`);
  console.log(`========================================================`);
  
  // Show first 15 rows
  for (let r = 0; r < Math.min(15, data.length); r++) {
    if (data[r] && data[r].length > 0 && data[r].some(cell => cell !== undefined && cell !== '')) {
      console.log(`Row ${r + 1}:`, JSON.stringify(data[r]));
    }
  }
}
