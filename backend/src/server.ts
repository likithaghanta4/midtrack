import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` MID TRACK - SRKR Mid Marks Management System Backend`);
  console.log(` Running on: http://localhost:${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Health check: http://localhost:${config.port}/api/health`);
  console.log(`=======================================================`);
});

export default server;
