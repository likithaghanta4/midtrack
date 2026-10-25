import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

async function checkFaculty() {
  const sql = neon(process.env.DATABASE_URL!);
  const faculty = await sql`SELECT * FROM faculty ORDER BY name ASC`;
  console.log(`Total faculty in database: ${faculty.length}`);
  const depts: Record<string, number> = {};
  for (const f of faculty) {
    depts[f.department] = (depts[f.department] || 0) + 1;
  }
  console.log('Departments:', depts);
  console.log('\nAll Faculty:');
  for (const f of faculty) {
    console.log(`- ${f.faculty_id}: ${f.name} (${f.department})`);
  }
}

checkFaculty().catch(console.error);
