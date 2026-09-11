const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const [provEmail, talentAEmail, talentBEmail, rand] = process.argv.slice(2);
  const hash = await bcrypt.hash('PasswordKuat123!', 10);

  // 1. Provider User & Profile
  const pUser = await prisma.user.create({
    data: { email: provEmail, passwordHash: hash, role: 'TRAINING_PROVIDER', isVerified: true },
  });
  const provider = await prisma.trainingProvider.create({
    data: {
      id: pUser.id,
      institutionName: 'Pusat Vokasi Pengelasan Timika',
      institutionType: 'LPK_SWASTA',
      vinNumber: `VIN-WELD-${rand}`,
      verificationStatus: 'APPROVED',
      picName: 'Bpk. Markus Maturbongs',
      picPhone: '081299887711',
    },
  });

  // 2. Program & Batch
  const program = await prisma.trainingProgram.create({
    data: {
      providerId: provider.id,
      createdBy: pUser.id,
      title: 'Pelatihan Juru Las 6G Pipa Bertekanan',
      category: 'WELDING',
      certificateType: 'KOMBINASI_LENGKAP',
      deliveryMode: 'OFFLINE',
      description: 'Pelatihan intensif juru las 6G.',
      targetSkills: [
        { name: 'Welding 6G GTAW Pipa', level: 'EXPERT' },
        { name: 'K3 Pengelasan Tambang', level: 'INTERMEDIATE' },
      ],
      approvalStatus: 'APPROVED',
      status: 'PUBLISHED',
    },
  });

  const batch = await prisma.trainingBatch.create({
    data: {
      programId: program.id,
      batchName: 'Batch 1 Tahun 2026',
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'BOARDING',
      quota: 10,
      welfareBenefits: ['ASRAMA_MESS', 'MAKAN_3X', 'UANG_SAKU'],
      registrationStart: new Date('2026-10-01'),
      registrationEnd: new Date('2026-10-15'),
      trainingStart: new Date('2026-10-20'),
      trainingEnd: new Date('2026-11-20'),
      isOpen: true,
    },
  });

  // 3. Talenta A & Talenta B
  const uA = await prisma.user.create({
    data: { email: talentAEmail, passwordHash: hash, role: 'TALENT', isVerified: true },
  });
  const tA = await prisma.talent.create({
    data: {
      id: uA.id,
      nik: `91040188${rand}`,
      fullName: 'Yulius Pigome',
      birthDate: new Date('1998-04-12'),
      skills: [],
    },
  });

  const uB = await prisma.user.create({
    data: { email: talentBEmail, passwordHash: hash, role: 'TALENT', isVerified: true },
  });
  const tB = await prisma.talent.create({
    data: {
      id: uB.id,
      nik: `91040177${rand}`,
      fullName: 'Markus Murib',
      birthDate: new Date('1999-07-20'),
      skills: [],
    },
  });

  console.log(
    JSON.stringify({
      programId: program.id,
      batchId: batch.id,
      talentAId: tA.id,
      talentBId: tB.id,
    }),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
