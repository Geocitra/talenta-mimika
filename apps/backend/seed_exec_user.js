require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const execEmail = process.argv[2];
  const talentEmail = process.argv[3];
  const nik = process.argv[4];

  if (!execEmail || !talentEmail || !nik) {
    console.error('Usage: node seed_exec_user.js <execEmail> <talentEmail> <nik>');
    process.exit(1);
  }

  const hash = await bcrypt.hash('BupatiMimika2026!', 10);

  // Akun Executive Pimpinan Daerah
  await prisma.user.create({
    data: {
      email: execEmail,
      passwordHash: hash,
      role: 'EXECUTIVE',
      isVerified: true,
    },
  });

  // Akun Talenta Biasa
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
      fullName: 'Warga Mimika',
      birthDate: new Date('1999-01-01'),
      isAvailable: true,
    },
  });

  console.log('SEED_EXEC_SUCCESS');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
