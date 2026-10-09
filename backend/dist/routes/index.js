"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthRoutes_1 = __importDefault(require("./healthRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const facultyRoutes_1 = __importDefault(require("./facultyRoutes"));
const studentRoutes_1 = __importDefault(require("./studentRoutes"));
const router = (0, express_1.Router)();
router.use('/', healthRoutes_1.default);
router.use('/auth', authRoutes_1.default);
router.use('/faculty', facultyRoutes_1.default);
router.use('/student', studentRoutes_1.default);
exports.default = router;
