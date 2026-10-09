"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'MID TRACK Backend API is healthy and operational',
        timestamp: new Date().toISOString(),
        system: {
            name: 'MID TRACK - SRKR Engineering College Mid Marks Management System',
            version: '1.0.0',
            college: 'S.R.K.R. Engineering College, Bhimavaram',
            environment: process.env.NODE_ENV || 'development'
        }
    });
});
exports.default = router;
