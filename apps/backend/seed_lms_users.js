require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.argv[2];
  const talentEmail = process.argv[3];
  const nik = process.argv[4];

  if (!adminEmail || !talentEmail || !nik) {
    console.error('Usage: node seed_lms_users.js <adminEmail> <talentEmail> <nik>');
    process.exit(1);
  }

  const hash = await bcrypt.hash('Password123!', 10);

  // Admin Disnaker
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hash,
      role: 'DISNAKER_ADMIN',
      isVerified: true,
    },
  });

  // Talenta tanpa keahlian Welding
  const tUser = await prisma.user.create({
    data: {
      email: talentEmail,
      passwordHash: hash,
      role: 'TALENT',
      isVerified: true,
    },
  });

  await prisma.talent.create({
    data: {
      id: tUser.id,
      nik: nik,
      fullName: 'Yohanes Kogoya',
      birthDate: new Date('1998-10-10'),
      skills: [{ name: 'Microsoft Word', level: 'BEGINNER' }], // Belum punya Welding
      isAvailable: true,
      profileCompletenessScore: 80,
    },
  });

  console.log('SEED_USERS_SUCCESS');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
