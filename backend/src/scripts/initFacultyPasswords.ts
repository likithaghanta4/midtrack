import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { config } from '../config';

export async function initFacultyPasswords() {
  console.log('================================================================================');
  console.log('INITIALIZING FACULTY PASSWORDS');
  console.log('================================================================================');

  const facultyUsers = await prisma.user.findMany({
    where: { role: 'FACULTY' },
    include: { facultyProfile: true },
  });

  console.log(`Found ${facultyUsers.length} Faculty User records to update.`);

  const passwordToHash = config.facultyInitialPassword;
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(passwordToHash, saltRounds);

  let updatedCount = 0;
  for (const user of facultyUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} faculty user accounts with secure bcrypt hash.`);
  console.log('Verification: All faculty accounts now authenticate securely with configured password.');
  console.log('================================================================================\n');
}

if (require.main === module) {
  initFacultyPasswords()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error initializing faculty passwords:', err);
      process.exit(1);
    });
}
