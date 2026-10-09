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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRealData = importRealData;
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const rootDir = path.resolve(__dirname, '../../../');
const facultyFilePath = path.join(rootDir, 'data/faculty/2026-2027 staff list.xlsx');
const studentFilePath = path.join(rootDir, 'data/students/rolllist.xlsx');
async function importRealData() {
    console.log('================================================================================');
    console.log('STARTING MODULE 3: REAL DATA IMPORT');
    console.log('S.R.K.R. Engineering College Mid Marks Management System');
    console.log('================================================================================\n');
    if (!fs.existsSync(facultyFilePath)) {
        throw new Error(`Faculty dataset file not found at: ${facultyFilePath}`);
    }
    if (!fs.existsSync(studentFilePath)) {
        throw new Error(`Student dataset file not found at: ${studentFilePath}`);
    }
    // ---------------------------------------------------------------------------
    // 1. IMPORT SECTIONS
    // ---------------------------------------------------------------------------
    console.log('>>> [1/3] Creating Academic Sections...');
    const sectionDefinitions = [
        { sectionName: 'CSD', branch: 'CSD', academicYear: '2025-2026', semester: 7 },
        { sectionName: 'CSIT', branch: 'CSIT', academicYear: '2025-2026', semester: 7 },
        { sectionName: 'CSD', branch: 'CSD', academicYear: '2025-2026', semester: 5 },
        { sectionName: 'CSIT-A', branch: 'CSIT', academicYear: '2025-2026', semester: 5 },
        { sectionName: 'CSIT-B', branch: 'CSIT', academicYear: '2025-2026', semester: 5 },
        { sectionName: 'CSD', branch: 'CSD', academicYear: '2025-2026', semester: 3 },
    ];
    for (const sec of sectionDefinitions) {
        await prisma_1.prisma.section.upsert({
            where: {
                section_composite_unique: {
                    sectionName: sec.sectionName,
                    branch: sec.branch,
                    academicYear: sec.academicYear,
                    semester: sec.semester,
                },
            },
            update: {},
            create: {
                sectionName: sec.sectionName,
                branch: sec.branch,
                academicYear: sec.academicYear,
                semester: sec.semester,
            },
        });
    }
    const totalSectionsCount = await prisma_1.prisma.section.count();
    console.log(`    Successfully upserted ${totalSectionsCount} Sections.\n`);
    // ---------------------------------------------------------------------------
    // 2. IMPORT FACULTY (23 Real Staff Records)
    // ---------------------------------------------------------------------------
    console.log('>>> [2/3] Importing Faculty Members from "2026-2027 staff list.xlsx"...');
    const facultyWb = XLSX.readFile(facultyFilePath);
    const facultyDeptBreakdown = {};
    let importedFacultyCount = 0;
    for (const sheetName of facultyWb.SheetNames) {
        const ws = facultyWb.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        let headerIdx = -1;
        for (let i = 0; i < Math.min(10, rawRows.length); i++) {
            const rowStr = rawRows[i].map((c) => String(c).trim().toLowerCase()).join('|');
            if (rowStr.includes('name') || rowStr.includes('sno') || rowStr.includes('staff') || rowStr.includes('faculty')) {
                headerIdx = i;
                break;
            }
        }
        if (headerIdx < 0) {
            console.warn(`    [Warning] Could not find header row in faculty sheet "${sheetName}". Skipping.`);
            continue;
        }
        let sheetCount = 0;
        for (let i = headerIdx + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            const rawEmpId = String(row[1] || '').trim();
            const rawName = String(row[2] || '').trim().replace(/\s+/g, ' ');
            const rawDepartment = sheetName.trim();
            if (!rawEmpId || !rawName)
                continue;
            // Secure cryptographic initialization placeholder for faculty user password hash
            // Password workflow will be configured in Module 4: Authentication.
            const secureInitHash = bcryptjs_1.default.hashSync(crypto_1.default.randomBytes(32).toString('hex'), 10);
            await prisma_1.prisma.$transaction(async (tx) => {
                const user = await tx.user.upsert({
                    where: { username: rawEmpId },
                    update: {
                        role: 'FACULTY',
                    },
                    create: {
                        username: rawEmpId,
                        passwordHash: secureInitHash,
                        role: 'FACULTY',
                    },
                });
                await tx.faculty.upsert({
                    where: { facultyId: rawEmpId },
                    update: {
                        name: rawName,
                        department: rawDepartment,
                        userId: user.id,
                    },
                    create: {
                        userId: user.id,
                        facultyId: rawEmpId,
                        name: rawName,
                        department: rawDepartment,
                    },
                });
            });
            sheetCount++;
            importedFacultyCount++;
        }
        facultyDeptBreakdown[sheetName] = sheetCount;
        console.log(`    Sheet "${sheetName}": ${sheetCount} faculty members imported.`);
    }
    console.log(`    Total Faculty Processed: ${importedFacultyCount}\n`);
    // ---------------------------------------------------------------------------
    // 3. IMPORT STUDENTS (421 Real Students across 6 Primary Sheets)
    // ---------------------------------------------------------------------------
    console.log('>>> [3/3] Importing Students from "rolllist.xlsx"...');
    const studentWb = XLSX.readFile(studentFilePath);
    const primarySheetConfigs = {
        '23 CSD': { branch: 'CSD', section: 'CSD', academicYear: '2025-2026', semester: 7 },
        '23 CSIT': { branch: 'CSIT', section: 'CSIT', academicYear: '2025-2026', semester: 7 },
        '24 CSD': { branch: 'CSD', section: 'CSD', academicYear: '2025-2026', semester: 5 },
        '24 CSIT-A': { branch: 'CSIT', section: 'CSIT-A', academicYear: '2025-2026', semester: 5 },
        '24 CSIT-B': { branch: 'CSIT', section: 'CSIT-B', academicYear: '2025-2026', semester: 5 },
        '25 CSD': { branch: 'CSD', section: 'CSD', academicYear: '2025-2026', semester: 3 },
    };
    const skippedSheets = ['24 CSD (2)', '25 CSD (2)'];
    console.log(`    Intentionally skipping verified duplicate lab sheets: ${skippedSheets.join(', ')}`);
    const sectionStudentCounts = {};
    let importedStudentCount = 0;
    for (const sheetName of Object.keys(primarySheetConfigs)) {
        const config = primarySheetConfigs[sheetName];
        const ws = studentWb.Sheets[sheetName];
        if (!ws) {
            console.warn(`    [Warning] Sheet "${sheetName}" not found in workbook.`);
            continue;
        }
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        let headerIdx = -1;
        for (let i = 0; i < Math.min(10, rawRows.length); i++) {
            const row = rawRows[i].map((c) => String(c).trim().toLowerCase());
            if (row.some(c => c.includes('hallticket') || c.includes('roll') || c.includes('reg') || (c === 'sno' && row.some(x => x.includes('name'))))) {
                headerIdx = i;
                break;
            }
        }
        if (headerIdx < 0) {
            console.warn(`    [Warning] Could not find header row in sheet "${sheetName}". Skipping.`);
            continue;
        }
        let sheetStudents = 0;
        for (let i = headerIdx + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            const rawRegNo = String(row[1] || '').trim();
            const rawName = String(row[2] || '').trim().replace(/\s+/g, ' ');
            if (!rawRegNo || rawRegNo.length < 8 || rawRegNo.toLowerCase().includes('hallticket')) {
                continue;
            }
            // Security requirement: Initial password = Register Number, stored ONLY as bcrypt hash
            const hashedPassword = bcryptjs_1.default.hashSync(rawRegNo, 10);
            await prisma_1.prisma.$transaction(async (tx) => {
                const user = await tx.user.upsert({
                    where: { username: rawRegNo },
                    update: {
                        role: 'STUDENT',
                    },
                    create: {
                        username: rawRegNo,
                        passwordHash: hashedPassword,
                        role: 'STUDENT',
                    },
                });
                await tx.student.upsert({
                    where: { registerNumber: rawRegNo },
                    update: {
                        name: rawName,
                        branch: config.branch,
                        section: config.section,
                        academicYear: config.academicYear,
                        semester: config.semester,
                        userId: user.id,
                    },
                    create: {
                        userId: user.id,
                        registerNumber: rawRegNo,
                        name: rawName,
                        branch: config.branch,
                        section: config.section,
                        academicYear: config.academicYear,
                        semester: config.semester,
                    },
                });
            });
            sheetStudents++;
            importedStudentCount++;
        }
        sectionStudentCounts[sheetName] = sheetStudents;
        console.log(`    Sheet "${sheetName}": ${sheetStudents} students imported (${config.branch} - ${config.section}, Sem ${config.semester}).`);
    }
    // ---------------------------------------------------------------------------
    // 4. DATABASE INTEGRITY TOTALS
    // ---------------------------------------------------------------------------
    const totalUsers = await prisma_1.prisma.user.count();
    const totalStudents = await prisma_1.prisma.student.count();
    const totalFaculty = await prisma_1.prisma.faculty.count();
    const totalSections = await prisma_1.prisma.section.count();
    const studentUsers = await prisma_1.prisma.user.count({ where: { role: 'STUDENT' } });
    const facultyUsers = await prisma_1.prisma.user.count({ where: { role: 'FACULTY' } });
    console.log('\n================================================================================');
    console.log('MODULE 3 IMPORT COMPLETED SUCCESSFULLY');
    console.log('================================================================================');
    console.log(`Total Users Created/Verified:    ${totalUsers} (Expected: 444)`);
    console.log(`  - Student Users (role=STUDENT): ${studentUsers} (Expected: 421)`);
    console.log(`  - Faculty Users (role=FACULTY): ${facultyUsers} (Expected: 23)`);
    console.log(`Total Student Records:           ${totalStudents} (Expected: 421)`);
    console.log(`Total Faculty Records:           ${totalFaculty} (Expected: 23)`);
    console.log(`Total Academic Sections:         ${totalSections} (Expected: 6)`);
    console.log('================================================================================\n');
    return {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalSections,
        studentUsers,
        facultyUsers,
        sectionBreakdown: sectionStudentCounts,
        facultyBreakdown: facultyDeptBreakdown,
        skippedSheets,
        failedRecords: 0,
    };
}
// Auto-run when executed directly via CLI
if (require.main === module) {
    importRealData()
        .then(() => {
        console.log('Import execution finished with code 0.');
        process.exit(0);
    })
        .catch((err) => {
        console.error('Fatal Import Error:', err);
        process.exit(1);
    });
}
