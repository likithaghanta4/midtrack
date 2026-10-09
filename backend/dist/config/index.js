"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'srkr_midtrack_super_secure_jwt_secret_key_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    facultyInitialPassword: process.env.FACULTY_INITIAL_PASSWORD || 'admin@123',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db'
};
