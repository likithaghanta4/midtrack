"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFacultyPasswords = initFacultyPasswords;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const config_1 = require("../config");
async function initFacultyPasswords() {
    console.log('================================================================================');
    console.log('INITIALIZING FACULTY PASSWORDS');
    console.log('================================================================================');
    const facultyUsers = await prisma_1.prisma.user.findMany({
        where: { role: 'FACULTY' },
        include: { facultyProfile: true },
    });
    console.log(`Found ${facultyUsers.length} Faculty User records to update.`);
    const passwordToHash = config_1.config.facultyInitialPassword;
    const saltRounds = 10;
    const hashedPassword = bcryptjs_1.default.hashSync(passwordToHash, saltRounds);
    let updatedCount = 0;
    for (const user of facultyUsers) {
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword },
        });
        updatedCount++;
    }
    console.log(`Successfully updated ${updatedCount} faculty user accounts with secure bcrypt hash.`);
    console.log('Verification: All faculty accounts now authenticate securely with configured password.');
    console.log('================================================================================\n');
}
if (require.main === module) {
    initFacultyPasswords()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Error initializing faculty passwords:', err);
        process.exit(1);
    });
}
