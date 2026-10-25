import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function runSafeSuperAdminMigration() {
  const url = process.env.DATABASE_URL || '';
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  const sql = neon(url);
  console.log('================================================================================');
  console.log('PHASE 4: NON-DESTRUCTIVE DATABASE MIGRATION FOR SUPER ADMIN & ALLOCATIONS');
  console.log('================================================================================\n');

  // 1. Create academic_years table
  console.log('>>> [1/5] Creating table "academic_years"...');
  await sql`
    CREATE TABLE IF NOT EXISTS academic_years (
      id VARCHAR(36) PRIMARY KEY,
      year VARCHAR(20) UNIQUE NOT NULL,
      is_current BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('    ✓ Table "academic_years" ready.');

  // 2. Create semesters table
  console.log('>>> [2/5] Creating table "semesters"...');
  await sql`
    CREATE TABLE IF NOT EXISTS semesters (
      id VARCHAR(36) PRIMARY KEY,
      academic_year_id VARCHAR(36) NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
      semester_number INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT false,
      start_date TIMESTAMP WITH TIME ZONE,
      end_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT academic_year_semester_unique UNIQUE (academic_year_id, semester_number)
    );
  `;
  console.log('    ✓ Table "semesters" ready.');

  // 3. Create faculty_allocations table
  console.log('>>> [3/5] Creating table "faculty_allocations"...');
  await sql`
    CREATE TABLE IF NOT EXISTS faculty_allocations (
      id VARCHAR(36) PRIMARY KEY,
      academic_year VARCHAR(20) NOT NULL,
      semester_number INTEGER NOT NULL,
      branch VARCHAR(20) NOT NULL,
      section_id VARCHAR(36) NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      subject_id VARCHAR(36) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      faculty_id VARCHAR(36) NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
      semester_id VARCHAR(36) REFERENCES semesters(id) ON DELETE SET NULL,
      is_primary BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT section_subject_faculty_unique UNIQUE (section_id, subject_id, faculty_id)
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_faculty_allocations_academic ON faculty_allocations(academic_year, semester_number, branch);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_faculty_allocations_faculty ON faculty_allocations(faculty_id, is_active);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_faculty_allocations_section ON faculty_allocations(section_id, is_active);`;
  console.log('    ✓ Table "faculty_allocations" ready with indexes.');

  // 4. Seed Academic Year 2026-2027 and Semesters 1 to 8 (Matching the timetable PDF w.e.f. 15/06/2026)
  console.log('>>> [4/5] Seeding Academic Year & Active Semesters...');
  
  // Also seed 2025-2026 for existing sections
  const ay2025Id = crypto.randomUUID();
  await sql`
    INSERT INTO academic_years (id, year, is_current)
    VALUES (${ay2025Id}, '2025-2026', false)
    ON CONFLICT (year) DO NOTHING;
  `;

  const ay2026Id = crypto.randomUUID();
  await sql`
    INSERT INTO academic_years (id, year, is_current)
    VALUES (${ay2026Id}, '2026-2027', true)
    ON CONFLICT (year) DO UPDATE SET is_current = true;
  `;

  // Get active 2026-2027 id
  const currYearRes = await sql`SELECT id FROM academic_years WHERE year = '2026-2027' LIMIT 1;`;
  const currYearId = currYearRes[0].id;

  const semesterDefs = [
    { sem: 1, name: 'I B.Tech I Semester (Sem 1)', isActive: false },
    { sem: 2, name: 'I B.Tech II Semester (Sem 2)', isActive: false },
    { sem: 3, name: 'II B.Tech I Semester (Sem 3)', isActive: true },
    { sem: 4, name: 'II B.Tech II Semester (Sem 4)', isActive: false },
    { sem: 5, name: 'III B.Tech I Semester (Sem 5)', isActive: true },
    { sem: 6, name: 'III B.Tech II Semester (Sem 6)', isActive: false },
    { sem: 7, name: 'IV B.Tech I Semester (Sem 7)', isActive: true },
    { sem: 8, name: 'IV B.Tech II Semester (Sem 8)', isActive: false },
  ];

  for (const s of semesterDefs) {
    const sId = crypto.randomUUID();
    await sql`
      INSERT INTO semesters (id, academic_year_id, semester_number, name, is_active)
      VALUES (${sId}, ${currYearId}, ${s.sem}, ${s.name}, ${s.isActive})
      ON CONFLICT (academic_year_id, semester_number) DO UPDATE
      SET name = ${s.name}, is_active = ${s.isActive};
    `;
  }
  console.log('    ✓ Academic Year 2026-2027 and Semesters 1-8 seeded (Semesters 3, 5, 7 Active).');

  // 5. Ensure Super Admin user account & Sudhakar Sir Superadmin setup
  console.log('>>> [5/5] Ensuring Super Admin accounts...');
  const salt = bcrypt.genSaltSync(10);
  const superAdminPassword = process.env.SUPERADMIN_INITIAL_PASSWORD || 'superadmin@123';
  const superAdminHash = bcrypt.hashSync(superAdminPassword, salt);

  // Dedicated Superadmin User
  const superAdminId = crypto.randomUUID();
  await sql`
    INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
    VALUES (${superAdminId}, 'superadmin', ${superAdminHash}, 'SUPERADMIN', NOW(), NOW())
    ON CONFLICT (username) DO UPDATE
    SET role = 'SUPERADMIN', password_hash = ${superAdminHash}, updated_at = NOW();
  `;

  // Set Dr. G. Sudhakar's User record as SUPERADMIN as specified
  const sudhakarUser = await sql`
    SELECT u.id, u.username, f.name 
    FROM users u 
    JOIN faculty f ON f.user_id = u.id 
    WHERE f.name ILIKE '%SUDHAKAR%' OR f.faculty_id = '1507'
    LIMIT 1;
  `;

  if (sudhakarUser.length > 0) {
    await sql`
      UPDATE users 
      SET role = 'SUPERADMIN' 
      WHERE id = ${sudhakarUser[0].id};
    `;
    console.log(`    ✓ Dr. G. Sudhakar (User: ${sudhakarUser[0].username}) designated as SUPERADMIN.`);
  }

  console.log('    ✓ Dedicated "superadmin" account synchronized with secure bcrypt hash.');
  console.log('\n================================================================================');
  console.log('MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('================================================================================\n');
}

if (require.main === module) {
  runSafeSuperAdminMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}
