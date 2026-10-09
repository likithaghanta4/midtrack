"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const rootDir = path.resolve(__dirname, '../../');
console.log('================================================================');
console.log('DETAILED DATASET INSPECTION & RECONCILIATION REPORT');
console.log('================================================================');
// 1. Staff List Inspection
const staffFilePath = path.join(rootDir, '2026-2027 staff list.xlsx');
if (fs.existsSync(staffFilePath)) {
    console.log(`\n>>> 1. FACULTY FILE: "2026-2027 staff list.xlsx"`);
    const wb = XLSX.readFile(staffFilePath);
    console.log(`Sheets found (${wb.SheetNames.length}):`, wb.SheetNames);
    for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        console.log(`\nSheet: "${sheetName}" | Total Raw Rows: ${rawData.length}`);
        // Find header row and records
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const rowStr = rawData[i].map((c) => String(c).trim().toLowerCase()).join('|');
            if (rowStr.includes('name') || rowStr.includes('sno') || rowStr.includes('staff') || rowStr.includes('faculty') || rowStr.includes('designation')) {
                headerRowIdx = i;
                break;
            }
        }
        console.log(`Detected Header Row Index: ${headerRowIdx >= 0 ? headerRowIdx + 1 : 'Not found (showing raw rows)'}`);
        if (headerRowIdx >= 0) {
            console.log(`Headers:`, rawData[headerRowIdx]);
            const validRows = rawData.slice(headerRowIdx + 1).filter(r => r.some((c) => String(c).trim() !== ''));
            console.log(`Valid Data Records Count: ${validRows.length}`);
            console.log(`First 3 records:`, validRows.slice(0, 3));
            console.log(`Last 2 records:`, validRows.slice(-2));
        }
        else {
            rawData.slice(0, 10).forEach((r, i) => console.log(`Row ${i + 1}:`, r));
        }
    }
}
// 2. Student Roll List Inspection
const rollListFilePath = path.join(rootDir, 'rolllist.xlsx');
if (fs.existsSync(rollListFilePath)) {
    console.log(`\n\n>>> 2. STUDENT ROLL LIST FILE: "rolllist.xlsx"`);
    const wb = XLSX.readFile(rollListFilePath);
    console.log(`Sheets found (${wb.SheetNames.length}):`, wb.SheetNames);
    let grandTotalStudents = 0;
    const sectionsSummary = [];
    for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        // Look for SNo / HallTicketNo / Student Name row
        let headerIdx = -1;
        let collegeHeader = rawData[0] ? String(rawData[0][0]).trim() : '';
        let batchHeader = rawData[1] ? String(rawData[1][0]).trim() : '';
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i].map(c => String(c).trim().toLowerCase());
            if (row.some(c => c.includes('hallticket') || c.includes('roll') || c.includes('reg') || (c === 'sno' && row.some(x => x.includes('name'))))) {
                headerIdx = i;
                break;
            }
        }
        const headers = headerIdx >= 0 ? rawData[headerIdx] : [];
        let studentsInSheet = 0;
        const sampleStudents = [];
        if (headerIdx >= 0) {
            const dataRows = rawData.slice(headerIdx + 1);
            for (const row of dataRows) {
                // A row is a student if it has a valid hall ticket / reg number
                const regNo = String(row[1] || '').trim();
                const studentName = String(row[2] || '').trim();
                if (regNo && regNo.length >= 8 && !regNo.toLowerCase().includes('hallticket')) {
                    studentsInSheet++;
                    grandTotalStudents++;
                    if (sampleStudents.length < 2) {
                        sampleStudents.push({ sNo: row[0], regNo, studentName });
                    }
                }
            }
        }
        sectionsSummary.push({
            sheetName,
            batchInfo: batchHeader.replace(/\r?\n/g, ' | '),
            headers: headers.filter(h => String(h).trim() !== ''),
            studentCount: studentsInSheet,
            samples: sampleStudents
        });
    }
    console.log(`\nStudent Sections Summary (${sectionsSummary.length} Sheets):`);
    sectionsSummary.forEach((s, idx) => {
        console.log(`\n[${idx + 1}] Sheet: "${s.sheetName}" -> Student Count: ${s.studentCount}`);
        console.log(`    Batch / Class Info: ${s.batchInfo}`);
        console.log(`    Headers:`, s.headers);
        console.log(`    Samples:`, s.samples);
    });
    console.log(`\n================================================================`);
    console.log(`GRAND TOTAL STUDENTS ACROSS ALL SHEETS: ${grandTotalStudents}`);
    console.log(`================================================================`);
}
