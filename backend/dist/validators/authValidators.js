"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentLoginSchema = exports.facultyLoginSchema = void 0;
const zod_1 = require("zod");
exports.facultyLoginSchema = zod_1.z.object({
    facultyId: zod_1.z.string({
        required_error: 'Faculty ID is required',
    }).trim().min(1, 'Faculty ID cannot be empty'),
    password: zod_1.z.string({
        required_error: 'Password is required',
    }).min(1, 'Password cannot be empty'),
});
exports.studentLoginSchema = zod_1.z.object({
    registerNumber: zod_1.z.string({
        required_error: 'Register number is required',
    }).trim().min(1, 'Register number cannot be empty'),
    password: zod_1.z.string({
        required_error: 'Password is required',
    }).min(1, 'Password cannot be empty'),
});
