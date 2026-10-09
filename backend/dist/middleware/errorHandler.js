"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[Error] ${statusCode} - ${message}`, err.stack || err);
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || undefined,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
};
exports.errorHandler = errorHandler;
