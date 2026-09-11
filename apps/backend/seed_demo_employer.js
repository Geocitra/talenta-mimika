const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const password = 'PasswordKuat123!';
  const hash = await bcrypt.hash(password, 10);

  // 1. Akun Demo Utama: hrd@freeport.co.id
  const user1 = await prisma.user.upsert({
    where: { email: 'hrd@freeport.co.id' },
    update: {
      passwordHash: hash,
      isVerified: true,
      role: 'EMPLOYER',
    },
    create: {
      email: 'hrd@freeport.co.id',
      passwordHash: hash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const emp1 = await prisma.employer.upsert({
    where: { id: user1.id },
    update: {
      companyName: 'PT Freeport Indonesia',
      nib: '9104000123456',
      verificationStatus: 'APPROVED',
      industrySector: 'Pertambangan & Mineral',
      address: 'Kuala Kencana, Kabupaten Mimika, Papua Tengah',
      employeeCount: 15000,
      companyBio: 'Perusahaan pertambangan terkemuka penghasil tembaga dan emas di Kabupaten Mimika.',
    },
    create: {
      id: user1.id,
      companyName: 'PT Freeport Indonesia',
      nib: '9104000123456',
      verificationStatus: 'APPROVED',
      industrySector: 'Pertambangan & Mineral',
      address: 'Kuala Kencana, Kabupaten Mimika, Papua Tengah',
      employeeCount: 15000,
      companyBio: 'Perusahaan pertambangan terkemuka penghasil tembaga dan emas di Kabupaten Mimika.',
    },
  });

  // 2. Akun Freeport Eksisting: hrd@ptfreeporindonesia.co.id
  const user2 = await prisma.user.updateMany({
    where: { email: 'hrd@ptfreeporindonesia.co.id' },
    data: {
      passwordHash: hash,
      isVerified: true,
      role: 'EMPLOYER',
    },
  });

  await prisma.employer.updateMany({
    where: { nib: '0123456789012' },
    data: {
      verificationStatus: 'APPROVED',
    },
  });

  console.log('=== AKUN PERUSAHAAN (EMPLOYER) SIAP DIGUNAKAN ===');
  console.log('Email        : hrd@freeport.co.id');
  console.log('Password     :', password);
  console.log('Perusahaan   : PT Freeport Indonesia');
  console.log('Status Akun  : APPROVED (Terverifikasi)');
  console.log('Role         : EMPLOYER');
  console.log('Dashboard URL: http://localhost:3001/employer');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
