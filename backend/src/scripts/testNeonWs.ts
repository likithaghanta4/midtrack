import dotenv from 'dotenv';
dotenv.config();
import { Pool, neonConfig } from '@neondatabase/serverless';

async function testWs() {
  // @ts-ignore
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT count(*) FROM faculty');
    console.log('Neon Pool WS query SUCCESS! Count:', res.rows[0]);
  } catch (err: any) {
    console.error('Neon Pool WS query ERROR:', err);
  } finally {
    await pool.end();
  }
}

testWs();
