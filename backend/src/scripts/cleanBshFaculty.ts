import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

async function cleanBshFaculty() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log('1. Checking BS&H faculty and linked allocations...');
  
  const bshFaculty = await sql`
    SELECT id, faculty_id, name, department, user_id 
    FROM faculty 
    WHERE department = 'BASIC_SCIENCES_AND_HUMANITIES' OR faculty_id LIKE 'FAC_%'
  `;

  console.log(`Found ${bshFaculty.length} BS&H faculty records:`);
  for (const f of bshFaculty) {
    console.log(`- ${f.faculty_id}: ${f.name} (user_id: ${f.user_id})`);
  }

  const bshFacultyIds = bshFaculty.map(f => f.id);
  const bshUserIds = bshFaculty.map(f => f.user_id).filter(Boolean);

  if (bshFacultyIds.length > 0) {
    // Delete any allocations linked to these BS&H faculty
    const deletedAllocations = await sql`
      DELETE FROM faculty_allocations 
      WHERE faculty_id = ANY(${bshFacultyIds})
      RETURNING id
    `;
    console.log(`Deleted ${deletedAllocations.length} allocations linked to BS&H faculty.`);

    // Delete faculty records
    const deletedFaculty = await sql`
      DELETE FROM faculty 
      WHERE id = ANY(${bshFacultyIds})
      RETURNING id
    `;
    console.log(`Deleted ${deletedFaculty.length} BS&H faculty members.`);

    // Delete user records if they were created for BS&H
    if (bshUserIds.length > 0) {
      const deletedUsers = await sql`
        DELETE FROM users 
        WHERE id = ANY(${bshUserIds})
        RETURNING id
      `;
      console.log(`Deleted ${deletedUsers.length} BS&H user accounts.`);
    }
  }

  // Verify remaining faculty
  const remainingFaculty = await sql`SELECT id, faculty_id, name, department FROM faculty ORDER BY name ASC`;
  console.log(`\nRemaining Faculty Count: ${remainingFaculty.length}`);
  const depts: Record<string, number> = {};
  for (const f of remainingFaculty) {
    depts[f.department] = (depts[f.department] || 0) + 1;
  }
  console.log('Department Breakdown:', depts);
}

cleanBshFaculty().catch(console.error);
