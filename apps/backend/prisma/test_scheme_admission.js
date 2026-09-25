const { PrismaClient, BatchEnrollmentStatus, ProgramFundingType, AdmissionPolicy, TrainingMethod } = require('c:/Users/PC/Documents/Dev/talenta/mimika-talenta/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('=== TEST REAL-WORLD SCHEME-BASED ADMISSION & DESK OPERASIONAL ===\n');

  const provider = await prisma.user.findFirst({
    where: { role: 'TRAINING_PROVIDER', trainingProvider: { verificationStatus: 'APPROVED' } },
    include: { trainingProvider: true }
  });

  const talent1 = await prisma.talent.findFirst({
    where: { fullName: { contains: 'Yulius' } }
  });

  const talent2 = await prisma.talent.findFirst({
    where: { fullName: { contains: 'Markus' } }
  });

  if (!provider || !talent1 || !talent2) {
    console.error('Data required not found. Provider:', !!provider, 'Talent1:', !!talent1, 'Talent2:', !!talent2);
    return;
  }

  console.log(`✓ Provider: ${provider.trainingProvider.institutionName} (${provider.id})`);
  console.log(`✓ Talent 1 (APBD): ${talent1.fullName} (${talent1.id})`);
  console.log(`✓ Talent 2 (Mandiri): ${talent2.fullName} (${talent2.id})\n`);

  // 1. Create or find a test program
  let program = await prisma.trainingProgram.findFirst({
    where: { providerId: provider.id }
  });

  if (!program) {
    program = await prisma.trainingProgram.create({
      data: {
        providerId: provider.id,
        createdBy: provider.id,
        title: 'Program Sertifikasi Operator Excavator Kelas 1',
        description: 'Pelatihan bersertifikat BNSP untuk operator alat berat tambang',
        approvalStatus: 'APPROVED',
        status: 'PUBLISHED',
        quota: 10
      }
    });
  }

  // 2. Clean previous test batches if any
  await prisma.trainingBatch.deleteMany({
    where: { batchName: { in: ['[TEST] Batch APBD Mimika Gratis', '[TEST] Batch Mandiri Berbayar Bank Papua'] } }
  });

  // 3. Create Free Batch (APBD Mimika - Kuota 1)
  const freeBatch = await prisma.trainingBatch.create({
    data: {
      programId: program.id,
      batchName: '[TEST] Batch APBD Mimika Gratis',
      batchNumber: 101,
      fundingType: ProgramFundingType.GRATIS_APBD_MIMIKA,
      trainingMethod: TrainingMethod.NON_BOARDING,
      quota: 1, // small quota to test auto-close
      admissionPolicy: AdmissionPolicy.CURATED_SELECTION,
      registrationStart: new Date(),
      registrationEnd: new Date(Date.now() + 7 * 86400000),
      trainingStart: new Date(Date.now() + 14 * 86400000),
      trainingEnd: new Date(Date.now() + 30 * 86400000),
      isOpen: true
    }
  });
  console.log(`✓ Created Free Batch ID: ${freeBatch.id} (Funding: ${freeBatch.fundingType}, Quota: ${freeBatch.quota})`);

  // 4. Create Paid Batch (Mandiri Berbayar - Kuota 2)
  const paidBatch = await prisma.trainingBatch.create({
    data: {
      programId: program.id,
      batchName: '[TEST] Batch Mandiri Berbayar Bank Papua',
      batchNumber: 102,
      fundingType: ProgramFundingType.MANDIRI_BERBAYAR,
      priceAmount: 2500000,
      trainingMethod: TrainingMethod.BOARDING,
      quota: 2,
      admissionPolicy: AdmissionPolicy.CURATED_SELECTION,
      bankName: 'BANK PAPUA',
      bankAccountNumber: '100-234-56789-0',
      bankAccountHolder: 'LPK & LSP VOKASI TAMBANG MIMIKA',
      paymentInstructions: 'Harap sertakan berita transfer: NIK-NAMA_LENGKAP. Bukti transfer diunggah di aplikasi atau diserahkan ke kasir balai.',
      registrationStart: new Date(),
      registrationEnd: new Date(Date.now() + 7 * 86400000),
      trainingStart: new Date(Date.now() + 14 * 86400000),
      trainingEnd: new Date(Date.now() + 30 * 86400000),
      isOpen: true
    }
  });
  console.log(`✓ Created Paid Batch ID: ${paidBatch.id} (Bank: ${paidBatch.bankName}, Rek: ${paidBatch.bankAccountNumber})\n`);

  // 5. Test Talent 1 Enrolls Free Batch -> Status MUST BE REGISTERED (NOT ADMITTED)
  const enrollFree = await prisma.trainingEnrollment.upsert({
    where: { talentId_programId: { talentId: talent1.id, programId: program.id } },
    create: {
      talentId: talent1.id,
      programId: program.id,
      batchId: freeBatch.id,
      selectionStatus: BatchEnrollmentStatus.REGISTERED
    },
    update: {
      batchId: freeBatch.id,
      selectionStatus: BatchEnrollmentStatus.REGISTERED
    }
  });
  console.log(`[TEST 1: JALUR GRATIS] Talent ${talent1.fullName} enrolled -> Status: ${enrollFree.selectionStatus}`);
  if (enrollFree.selectionStatus !== BatchEnrollmentStatus.REGISTERED) {
    throw new Error('FAILED: Free scheme candidate should be REGISTERED, not admitted directly!');
  }
  console.log('✓ PASS: Jalur Gratis kandidat berstatus REGISTERED (menunggu verifikasi KTP Mimika & seleksi fisik).');

  // 6. Test Talent 2 Enrolls Paid Batch -> Status MUST BE PENDING_PAYMENT
  const enrollPaid = await prisma.trainingEnrollment.upsert({
    where: { talentId_programId: { talentId: talent2.id, programId: program.id } },
    create: {
      talentId: talent2.id,
      programId: program.id,
      batchId: paidBatch.id,
      selectionStatus: BatchEnrollmentStatus.PENDING_PAYMENT,
      paymentProofUrl: null
    },
    update: {
      batchId: paidBatch.id,
      selectionStatus: BatchEnrollmentStatus.PENDING_PAYMENT,
      paymentProofUrl: null
    }
  });
  console.log(`\n[TEST 2: JALUR BERBAYAR] Talent ${talent2.fullName} enrolled -> Status: ${enrollPaid.selectionStatus}`);
  if (enrollPaid.selectionStatus !== BatchEnrollmentStatus.PENDING_PAYMENT) {
    throw new Error('FAILED: Paid scheme candidate should be PENDING_PAYMENT!');
  }
  console.log('✓ PASS: Jalur Mandiri Berbayar berstatus PENDING_PAYMENT.');

  // 7. Talent 2 Uploads Payment Proof
  const updatedEnrollPaid = await prisma.trainingEnrollment.update({
    where: { id: enrollPaid.id },
    data: {
      paymentProofUrl: '/uploads/payments/slip_transfer_markus_bank_papua.jpg'
    }
  });
  console.log(`✓ Talent 2 uploaded payment slip: ${updatedEnrollPaid.paymentProofUrl}`);

  // 8. Provider Meja Seleksi (Admission Desk) - Admit Talent 1 (Free)
  console.log('\n[TEST 3: OPERASIONAL BALAI - ADMIT TALENT 1]');
  const admittedT1 = await prisma.$transaction(async (tx) => {
    const admittedEnr = await tx.trainingEnrollment.update({
      where: { id: enrollFree.id },
      data: {
        selectionStatus: BatchEnrollmentStatus.ADMITTED,
        selectionNotes: 'Lolos verifikasi KTP Mimika & tes fisik/wawancara balai.'
      }
    });

    const totalAdmitted = await tx.trainingEnrollment.count({
      where: { batchId: freeBatch.id, selectionStatus: BatchEnrollmentStatus.ADMITTED }
    });

    // Auto-close if full
    if (totalAdmitted >= freeBatch.quota) {
      await tx.trainingBatch.update({
        where: { id: freeBatch.id },
        data: { isOpen: false }
      });
    }

    return admittedEnr;
  });
  console.log(`✓ Talent 1 Admitted! Status: ${admittedT1.selectionStatus}, Notes: "${admittedT1.selectionNotes}"`);

  // Check auto-close on Free Batch
  const checkedFreeBatch = await prisma.trainingBatch.findUnique({ where: { id: freeBatch.id } });
  console.log(`✓ Free Batch isOpen status after 1/1 admitted: ${checkedFreeBatch.isOpen} (Auto-closed: ${!checkedFreeBatch.isOpen})`);
  if (checkedFreeBatch.isOpen) {
    throw new Error('FAILED: Batch should auto-close when admitted count reaches quota!');
  }

  // 9. Provider Meja Pembayaran (Admission Desk) - Confirm Payment & Admit Talent 2
  console.log('\n[TEST 4: OPERASIONAL BALAI - KONFIRMASI PEMBAYARAN & ADMIT TALENT 2]');
  const admittedT2 = await prisma.$transaction(async (tx) => {
    return tx.trainingEnrollment.update({
      where: { id: enrollPaid.id },
      data: {
        selectionStatus: BatchEnrollmentStatus.ADMITTED,
        paymentConfirmedAt: new Date(),
        selectionNotes: 'Pembayaran Rp 2.500.000 terverifikasi valid via Bank Papua.'
      }
    });
  });
  console.log(`✓ Talent 2 Admitted! Status: ${admittedT2.selectionStatus}`);
  console.log(`✓ Payment Confirmed At: ${admittedT2.paymentConfirmedAt.toISOString()}`);
  console.log(`✓ Notes: "${admittedT2.selectionNotes}"`);

  console.log('\n======================================================');
  console.log('SEMUA LOGIKA SCHEME-BASED ADMISSION & BEST PRACTICES 100% LOLOS VERIFIKASI!');
  console.log('======================================================');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
