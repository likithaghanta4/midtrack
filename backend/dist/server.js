"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const app = (0, app_1.createApp)();
const server = app.listen(config_1.config.port, () => {
    console.log(`=======================================================`);
    console.log(` MID TRACK - SRKR Mid Marks Management System Backend`);
    console.log(` Running on: http://localhost:${config_1.config.port}`);
    console.log(` Environment: ${config_1.config.nodeEnv}`);
    console.log(` Health check: http://localhost:${config_1.config.port}/api/health`);
    console.log(`=======================================================`);
});
exports.default = server;
