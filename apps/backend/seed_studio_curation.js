const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const [adminEmail, provPendingEmail, provApprovedEmail, vinPending, vinApproved] = process.argv.slice(2);
  const hash = await bcrypt.hash('PasswordKuat123!', 10);

  // 1. Admin Disnaker
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash, role: 'DISNAKER_ADMIN', isVerified: true },
    create: {
      email: adminEmail,
      passwordHash: hash,
      role: 'DISNAKER_ADMIN',
      isVerified: true,
    },
  });

  // 2. Training Provider PENDING
  const userPending = await prisma.user.upsert({
    where: { email: provPendingEmail },
    update: { passwordHash: hash, role: 'TRAINING_PROVIDER', isVerified: true },
    create: {
      email: provPendingEmail,
      passwordHash: hash,
      role: 'TRAINING_PROVIDER',
      isVerified: true,
    },
  });

  await prisma.trainingProvider.upsert({
    where: { id: userPending.id },
    update: { verificationStatus: 'PENDING' },
    create: {
      id: userPending.id,
      institutionName: 'LPK Baru Daftar Mimika',
      institutionType: 'LPK_SWASTA',
      vinNumber: vinPending,
      verificationStatus: 'PENDING',
      address: 'Jl. Cenderawasih No. 10, Timika',
    },
  });

  // 3. Training Provider APPROVED
  const userApproved = await prisma.user.upsert({
    where: { email: provApprovedEmail },
    update: { passwordHash: hash, role: 'TRAINING_PROVIDER', isVerified: true },
    create: {
      email: provApprovedEmail,
      passwordHash: hash,
      role: 'TRAINING_PROVIDER',
      isVerified: true,
    },
  });

  await prisma.trainingProvider.upsert({
    where: { id: userApproved.id },
    update: { verificationStatus: 'APPROVED' },
    create: {
      id: userApproved.id,
      institutionName: 'LPK Teknik Pengelasan Kuala Kencana',
      institutionType: 'LPK_SWASTA',
      vinNumber: vinApproved,
      verificationStatus: 'APPROVED',
      address: 'Kuala Kencana Blok B No. 45, Kab. Mimika',
    },
  });

  console.log('Seed berhasil.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
