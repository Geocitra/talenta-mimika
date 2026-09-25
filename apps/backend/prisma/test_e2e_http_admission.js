const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = "KunciRahasiaMimikaTalenta2026SangatAmanDanKuatMinimal32Karakter!";
const BASE_URL = 'http://localhost:3000/api/v1';

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function testE2E() {
  console.log('=== RUNNING E2E HTTP INTEGRATION TEST FOR SCHEME-BASED ADMISSION ===\n');

  // Find provider and talents
  const providerUser = await prisma.user.findFirst({
    where: { role: 'TRAINING_PROVIDER', trainingProvider: { verificationStatus: 'APPROVED' } },
    include: { trainingProvider: true }
  });

  const talent1User = await prisma.user.findFirst({
    where: { role: 'TALENT', talent: { fullName: { contains: 'Yulius' } } },
    include: { talent: true }
  });

  const talent2User = await prisma.user.findFirst({
    where: { role: 'TALENT', talent: { fullName: { contains: 'Markus' } } },
    include: { talent: true }
  });

  if (!providerUser || !talent1User || !talent2User) {
    throw new Error('Test users not found');
  }

  const providerToken = createToken(providerUser);
  const talent1Token = createToken(talent1User);
  const talent2Token = createToken(talent2User);

  // Find or create test program
  let program = await prisma.trainingProgram.findFirst({
    where: { providerId: providerUser.id }
  });

  // Prepare Free Batch (Quota 1)
  const freeBatch = await prisma.trainingBatch.create({
    data: {
      programId: program.id,
      batchName: `[E2E] APBD Mimika Free Batch ${Date.now()}`,
      batchNumber: 201,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      quota: 1,
      admissionPolicy: 'CURATED_SELECTION',
      registrationStart: new Date(),
      registrationEnd: new Date(Date.now() + 7 * 86400000),
      trainingStart: new Date(Date.now() + 14 * 86400000),
      trainingEnd: new Date(Date.now() + 30 * 86400000),
      isOpen: true
    }
  });

  // Prepare Paid Batch (Quota 2)
  const paidBatch = await prisma.trainingBatch.create({
    data: {
      programId: program.id,
      batchName: `[E2E] Mandiri Bank Papua Batch ${Date.now()}`,
      batchNumber: 202,
      fundingType: 'MANDIRI_BERBAYAR',
      priceAmount: 1850000,
      trainingMethod: 'BOARDING',
      quota: 2,
      admissionPolicy: 'CURATED_SELECTION',
      bankName: 'BANK PAPUA',
      bankAccountNumber: '900-111-222-33',
      bankAccountHolder: 'LPK LAS LOGAM PAPUA MANDIRI',
      paymentInstructions: 'Transfer dengan berita: NIK-NAMA_LENGKAP. Upload slip di dashboard.',
      registrationStart: new Date(),
      registrationEnd: new Date(Date.now() + 7 * 86400000),
      trainingStart: new Date(Date.now() + 14 * 86400000),
      trainingEnd: new Date(Date.now() + 30 * 86400000),
      isOpen: true
    }
  });

  console.log(`[1] Created Test Batches:`);
  console.log(`    - Free: ${freeBatch.id} (${freeBatch.batchName})`);
  console.log(`    - Paid: ${paidBatch.id} (${paidBatch.batchName})\n`);

  // Clean previous enrollment on program if any for fresh test
  await prisma.trainingEnrollment.deleteMany({
    where: {
      programId: program.id,
      talentId: { in: [talent1User.id, talent2User.id] }
    }
  });

  // 1. Talent 1 Enrolls in Free Batch via HTTP
  console.log(`[2] Testing HTTP POST /trainings/${program.id}/batches/${freeBatch.id}/enroll (Talent 1 - Free Scheme)...`);
  const enrollFreeRes = await fetch(`${BASE_URL}/trainings/${program.id}/batches/${freeBatch.id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${talent1Token}` }
  });
  const enrollFreeData = await enrollFreeRes.json();
  console.log('    Response status:', enrollFreeData.status);
  console.log('    Enrollment status:', enrollFreeData.data?.status);
  console.log('    WhatsApp draft preview:', enrollFreeData.data?.whatsAppOutreach?.draftMessage?.slice(0, 80) + '...');
  if (enrollFreeData.data?.status !== 'REGISTERED') {
    throw new Error(`Expected status REGISTERED for free scheme, got ${enrollFreeData.data?.status}`);
  }
  console.log('    ✓ PASS: Jalur Gratis kandidat berstatus REGISTERED (tidak ada instant teleport).');

  // 2. Talent 2 Enrolls in Paid Batch via HTTP
  console.log(`\n[3] Testing HTTP POST /trainings/${program.id}/batches/${paidBatch.id}/enroll (Talent 2 - Paid Scheme)...`);
  const enrollPaidRes = await fetch(`${BASE_URL}/trainings/${program.id}/batches/${paidBatch.id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${talent2Token}` }
  });
  const enrollPaidData = await enrollPaidRes.json();
  console.log('    Response status:', enrollPaidData.status);
  console.log('    Enrollment status:', enrollPaidData.data?.status);
  console.log('    Bank info received:', enrollPaidData.data?.bankDetails);
  if (enrollPaidData.data?.status !== 'PENDING_PAYMENT') {
    throw new Error(`Expected status PENDING_PAYMENT for paid scheme, got ${enrollPaidData.data?.status}`);
  }
  console.log('    ✓ PASS: Jalur Mandiri Berbayar berstatus PENDING_PAYMENT.');

  const paidEnrollmentId = enrollPaidData.data?.enrollmentId;

  // 3. Talent 2 Uploads Payment Proof via HTTP Multipart
  console.log(`\n[4] Testing HTTP POST /trainings/enrollments/${paidEnrollmentId}/payment-proof (Upload Slip Transfer)...`);
  // Create a dummy image file for test
  const tempFilePath = path.join(__dirname, 'temp_slip_test.png');
  fs.writeFileSync(tempFilePath, Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex'));

  const formData = new FormData();
  const blob = new Blob([fs.readFileSync(tempFilePath)], { type: 'image/png' });
  formData.append('file', blob, 'slip_transfer_bank_papua.png');

  const uploadRes = await fetch(`${BASE_URL}/trainings/enrollments/${paidEnrollmentId}/payment-proof`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${talent2Token}` },
    body: formData
  });
  const uploadData = await uploadRes.json();
  console.log('    Upload response:', uploadData.status);
  console.log('    Payment proof URL:', uploadData.data?.paymentProofUrl);
  fs.unlinkSync(tempFilePath);
  if (!uploadData.data?.paymentProofUrl) {
    throw new Error('Upload failed: paymentProofUrl not returned');
  }
  console.log('    ✓ PASS: Slip bukti bayar berhasil diunggah dan tersimpan.');

  // 4. Provider Admission Desk: View Candidates
  console.log(`\n[5] Testing HTTP GET /training-providers/batches/${paidBatch.id}/candidates (Provider Meja Seleksi)...`);
  const deskRes = await fetch(`${BASE_URL}/training-providers/batches/${paidBatch.id}/candidates`, {
    headers: { Authorization: `Bearer ${providerToken}` }
  });
  const deskData = await deskRes.json();
  console.log('    Summary:', deskData.data?.summary);
  console.log('    Candidates in queue:', deskData.data?.candidates?.length);
  const foundCandidate = deskData.data?.candidates?.find(c => c.enrollmentId === paidEnrollmentId);
  console.log('    Found candidate payment slip:', foundCandidate?.paymentProofUrl);
  if (!foundCandidate || !foundCandidate.paymentProofUrl) {
    throw new Error('Candidate or payment slip not found in admission desk');
  }
  console.log('    ✓ PASS: Meja Seleksi Balai menampilkan data pendaftar beserta slip transfer.');

  // 5. Provider Admits Talent 1 (Free Scheme - Lolos Seleksi)
  const freeEnrollmentId = enrollFreeData.data?.enrollmentId;
  console.log(`\n[6] Testing HTTP PATCH /training-providers/batches/${freeBatch.id}/enrollments/${freeEnrollmentId}/admit (Admit Talent 1)...`);
  const admitT1Res = await fetch(`${BASE_URL}/training-providers/batches/${freeBatch.id}/enrollments/${freeEnrollmentId}/admit`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${providerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes: 'Lolos seleksi KTP Mimika dan verifikasi fisik.' })
  });
  const admitT1Data = await admitT1Res.json();
  const admittedT1Enr = admitT1Data.data?.selectionStatus ? admitT1Data.data : admitT1Data.data?.enrollment;
  console.log('    Admit Talent 1 Status:', admittedT1Enr?.selectionStatus);
  const updatedFreeBatch = await prisma.trainingBatch.findUnique({ where: { id: freeBatch.id } });
  console.log('    Free Batch Auto-Closed:', !updatedFreeBatch.isOpen);
  if (admittedT1Enr?.selectionStatus !== 'ADMITTED') {
    throw new Error('Admit Talent 1 failed: status not ADMITTED');
  }
  if (updatedFreeBatch.isOpen !== false) {
    throw new Error('Free batch should auto-close when quota 1 is full');
  }
  console.log('    ✓ PASS: Talent 1 ADMITTED & Free Batch otomatis ditutup (kuota 1/1 penuh).');

  // 6. Provider Admits Talent 2 (Paid Scheme - Konfirmasi Lunas)
  console.log(`\n[7] Testing HTTP PATCH /training-providers/batches/${paidBatch.id}/enrollments/${paidEnrollmentId}/admit (Admit Talent 2)...`);
  const admitT2Res = await fetch(`${BASE_URL}/training-providers/batches/${paidBatch.id}/enrollments/${paidEnrollmentId}/admit`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${providerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes: 'Pelunasan Rp 1.850.000 valid via Bank Papua.' })
  });
  const admitT2Data = await admitT2Res.json();
  const admittedT2Enr = admitT2Data.data?.selectionStatus ? admitT2Data.data : admitT2Data.data?.enrollment;
  console.log('    Admit Talent 2 Status:', admittedT2Enr?.selectionStatus);
  console.log('    Payment Confirmed At:', admittedT2Enr?.paymentConfirmedAt);
  if (admittedT2Enr?.selectionStatus !== 'ADMITTED' || !admittedT2Enr?.paymentConfirmedAt) {
    throw new Error('Admit Talent 2 failed: status not ADMITTED or payment not confirmed');
  }
  console.log('    ✓ PASS: Talent 2 ADMITTED, pelunasan tervalidasi, kursi terkunci.');

  console.log('\n========================================================================');
  console.log('SELURUH ENDPOINT HTTP API & ALUR REAL-WORLD BEST PRACTICE 100% SUKSES!');
  console.log('========================================================================');
}

testE2E()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
