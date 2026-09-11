const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'lpk.test@mimika.go.id';
  const pass = process.argv[3] || 'ProviderMimika2026!';

  const hash = await bcrypt.hash(pass, 10);

  // Activate provider user
  await prisma.user.update({
    where: { email },
    data: { isVerified: true, passwordHash: hash },
  });

  console.log(`Akun ${email} berhasil diaktifkan dengan sandi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
