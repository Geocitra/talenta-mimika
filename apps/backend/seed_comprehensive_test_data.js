require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { PrismaClient, OpportunityType, WorkZone, WorkSchedule, CompanySize } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('  MIMIKA TALENTA: SEEDING COMPREHENSIVE AI MATCHING TEST DATA   ');
  console.log('================================================================');

  const defaultPassword = 'PasswordKuat123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // ============================================================================
  // 1. SIAPKAN PERUSAHAAN: PT CITRA GEOMETRIK INDONESIA
  // ============================================================================
  const empEmail = 'apikeybrida@gmail.com';
  console.log(`\n[STEP 1] Menyiapkan Akun Perusahaan: PT Citra Geometrik Indonesia (${empEmail})...`);

  const empUser = await prisma.user.upsert({
    where: { email: empEmail },
    update: {
      passwordHash,
      role: 'EMPLOYER',
      isVerified: true,
    },
    create: {
      email: empEmail,
      passwordHash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const employer = await prisma.employer.upsert({
    where: { id: empUser.id },
    update: {
      companyName: 'PT Citra Geometrik Indonesia',
      brandName: 'Citra Geometrik Mining & Survey Solution',
      nib: '9104028882026',
      industrySector: 'Jasa Survei Geospasial & Rekayasa Tambang',
      companySize: CompanySize.SCALE_51_200,
      employeeCount: 120,
      address: 'Kawasan Perkantoran Kuala Kencana Blok C No. 12, Kab. Mimika, Papua Tengah',
      locationLat: -4.431201,
      locationLng: 136.883492,
      companyBio: 'Perusahaan spesialis survei terestrial geodesi, pemetaan drone fotogrametri, dan penyedia operator alat berat pendukung tambang terbuka di Kabupaten Mimika.',
      picName: 'Ir. Danang Prasetyo, S.T.',
      picRole: 'Head of Human Capital & Operations',
      picPhone: '081248887700',
      picEmail: 'recruitment@citrageometrik.co.id',
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
    },
    create: {
      id: empUser.id,
      companyName: 'PT Citra Geometrik Indonesia',
      brandName: 'Citra Geometrik Mining & Survey Solution',
      nib: '9104028882026',
      industrySector: 'Jasa Survei Geospasial & Rekayasa Tambang',
      companySize: CompanySize.SCALE_51_200,
      employeeCount: 120,
      address: 'Kawasan Perkantoran Kuala Kencana Blok C No. 12, Kab. Mimika, Papua Tengah',
      locationLat: -4.431201,
      locationLng: 136.883492,
      companyBio: 'Perusahaan spesialis survei terestrial geodesi, pemetaan drone fotogrametri, dan penyedia operator alat berat pendukung tambang terbuka di Kabupaten Mimika.',
      picName: 'Ir. Danang Prasetyo, S.T.',
      picRole: 'Head of Human Capital & Operations',
      picPhone: '081248887700',
      picEmail: 'recruitment@citrageometrik.co.id',
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  console.log(`  -> Perusahaan Siap: ${employer.companyName} (ID: ${employer.id})`);

  // ============================================================================
  // 2. TERBITKAN 3 LOWONGAN SPESIFIK & BERVARIASI UNTUK PT CITRA GEOMETRIK INDONESIA
  // ============================================================================
  console.log(`\n[STEP 2] Menerbitkan 3 Lowongan Uji Bervariasi untuk PT Citra Geometrik Indonesia...`);

  // Hapus lowongan lama perusahaan ini jika ada agar data selalu bersih
  await prisma.jobVacancy.deleteMany({ where: { employerId: employer.id } });

  // Lowongan 1: Mine Surveyor & Pemetaan Topografi (Spesialis Geodesi)
  const vacSurveyor = await prisma.jobVacancy.create({
    data: {
      employerId: employer.id,
      title: 'Mine Surveyor & Operator Drone Pemetaan RTK',
      opportunityType: OpportunityType.JOB,
      quota: 2,
      salaryMin: 9500000,
      salaryMax: 13500000,
      isSalaryDisclosed: true,
      benefits: ['Mess Karyawan AC', 'Makan 3x Lapangan', 'Bus Jemputan Timika-Kuala Kencana', 'BPJS Naker & Kes', 'Tiket Roster Cuti PP'],
      workTools: ['Laptop Workstation GIS', 'Total Station Leica', 'Drone DJI Matrice RTK', 'Rompi Safety Surveyor'],
      isSameAsOfficeLocation: true,
      workZone: WorkZone.KUALA_KENCANA,
      workSchedule: WorkSchedule.ROSTER_FIELD,
      jobLocationLat: -4.431201,
      jobLocationLng: 136.883492,
      taskDescription: 'Melakukan staking out batas tambang, pemetaan kontur open pit harian dengan Total Station dan Drone RTK, kalkulasi volume batuan ore/waste pada software Surpac/ArcGIS.',
      projectDuration: '1 Tahun (Kontrak PKWT Proyek)',
      requiredSkills: ['Mine Surveyor', 'Total Station', 'Drone RTK', 'ArcGIS', 'K3 Pertambangan'],
      mandatoryCerts: ['Sertifikasi Juru Ukur Tambang (Mine Surveyor BNSP)'],
      preferredMajors: ['Teknik Geodesi & Geomatika', 'Teknik Geologi & Eksplorasi', 'Teknik Sipil'],
      minEducation: 'D3',
      minExperienceYears: 2,
      allowEquivalence: true,
      status: 'OPEN',
    },
  });

  // Lowongan 2: Operator Excavator PC-200 / PC-400 (Alat Berat Lapangan)
  // Lowongan ini pasang syarat S1, TAPI allowEquivalence: true (UJI FUZZY MATCHING!)
  const vacExcavator = await prisma.jobVacancy.create({
    data: {
      employerId: employer.id,
      title: 'Operator Excavator PC-200 / PC-400 (Site Grasberg Lowland)',
      opportunityType: OpportunityType.JOB,
      quota: 3,
      salaryMin: 8500000,
      salaryMax: 11500000,
      isSalaryDisclosed: true,
      benefits: ['Mess Pekerja Lapangan', 'Makan 3x Sehari', 'Bus Antar-Jemput Rute Timika', 'Jaminan BPJS Penuh', 'APD Standar K3 Minerba'],
      workTools: ['Unit Excavator Komatsu PC-200', 'Radio Komunikasi Rig'],
      isSameAsOfficeLocation: false,
      workZone: WorkZone.KUALA_KENCANA,
      workSchedule: WorkSchedule.SHIFT_24H,
      jobLocationLat: -4.435,
      jobLocationLng: 136.885,
      taskDescription: 'Mengoperasikan unit excavator PC200/400 untuk pemuatan material batuan tambang ke dump truck, perapihan bench tambang, dan inspeksi harian unit (P2H) sesuai SOP K3.',
      projectDuration: '1 Tahun Kontrak Proyek',
      requiredSkills: ['Excavator', 'Alat Berat', 'K3 Pertambangan', 'P2H Unit'],
      mandatoryCerts: ['SIO Operator Excavator Kemnaker Aktif'],
      preferredMajors: ['Teknik Alat Berat', 'Teknik Otomotif', 'Teknik Mesin'],
      minEducation: 'S1', // Sengaja dipasang S1 agar kita uji kemenangan SMK Berpengalaman!
      minExperienceYears: 2,
      allowEquivalence: true, // FUZZY ON!
      status: 'OPEN',
    },
  });

  // Lowongan 3: Program Pemagangan Vokasi Pemetaan & Data GIS (Magang 0 Pengalaman)
  const vacInternship = await prisma.jobVacancy.create({
    data: {
      employerId: employer.id,
      title: 'Pemagangan Vokasi: Junior GIS & Pemetaan Wilayah Tambang',
      opportunityType: OpportunityType.INTERNSHIP,
      quota: 4,
      stipendAmount: 3800000,
      isSalaryDisclosed: true,
      benefits: ['Uang Saku Bulanan', 'Makan Siang Workshop', 'Bus Jemputan', 'Perlindungan Asuransi BPJS JKK/JKM', 'Sertifikat Industri Resmi'],
      workTools: ['Komputer PC Lab GIS', 'Perangkat GPS Handheld', 'Alat Ukur Waterpass'],
      isSameAsOfficeLocation: true,
      workZone: WorkZone.KUALA_KENCANA,
      workSchedule: WorkSchedule.NORMAL_DAY,
      jobLocationLat: -4.431201,
      jobLocationLng: 136.883492,
      skillsGained: ['Pengoperasian Total Station Dasar', 'Digitasi Peta ArcGIS', 'Pengambilan Titik GCP GPS', 'Keselamatan Kerja Lapangan K3'],
      mentorName: 'Bima Satria, S.T.',
      mentorRole: 'Senior GIS Specialist',
      hasAbsorptionOpportunity: true,
      taskDescription: 'Program pemagangan industri transfer keterampilan pemetaan digital bagi angkatan muda vokasi Mimika. Peserta didampingi langsung oleh mentor ahli.',
      projectDuration: '6 Bulan Program Pemagangan Vokasi',
      requiredSkills: ['Pemetaan', 'Komputer Dasar', 'Geodesi Dasar'],
      preferredMajors: ['Teknik Geodesi & Geomatika', 'Teknik Komputer & Jaringan (TKJ)', 'Rekayasa Perangkat Lunak (RPL)', 'Teknik Sipil'],
      minEducation: 'SMK',
      minExperienceYears: 0,
      allowEquivalence: true,
      status: 'OPEN',
    },
  });

  console.log(`  -> Lowongan 1 (JOB): ${vacSurveyor.title} (ID: ${vacSurveyor.id})`);
  console.log(`  -> Lowongan 2 (JOB-FUZZY): ${vacExcavator.title} (ID: ${vacExcavator.id})`);
  console.log(`  -> Lowongan 3 (INTERNSHIP): ${vacInternship.title} (ID: ${vacInternship.id})`);

  // ============================================================================
  // 3. SEEDING 10 KANDIDAT TALENTA HIPER-REALISTIS & BERVARIASI EKSTREM
  // ============================================================================
  console.log(`\n[STEP 3] Menyiapkan 10 Profil Talenta dengan Variasi Latar Belakang Mendalam...`);

  const DIVERSE_TALENTS = [
    // --------------------------------------------------------------------------
    // TALENTA 1: Yulius Pigome (The Fuzzy Excavator Champion)
    // Sasaran: Ranking #1 di Lowongan 2 (Excavator), Kalahkan Sarjana S1
    // --------------------------------------------------------------------------
    {
      email: 'yulius.pigome.test@talenta.id',
      nik: '9104018801950001',
      fullName: 'Yulius Pigome',
      birthDate: new Date('1995-04-12'),
      phone: '081248001122',
      bio: 'Operator alat berat senior asli suku Amungme Mimika dengan pengalaman 7 tahun di pit tambang terbuka Kuala Kencana & Grasberg.',
      education: [{ institution: 'SMK Negeri 1 Mimika', degree: 'SMK', major: 'Teknik Alat Berat', graduationYear: 2013 }],
      workExperience: [
        {
          companyName: 'PT Redpath Subcon Freeport',
          position: 'Senior Excavator Operator',
          durationMonths: 48,
          description: 'Mengoperasikan unit PC200, PC400, dan Komatsu PC2000 untuk penggalian batuan ore dan overburden di medan lereng terjal.',
          employmentType: 'FULL_TIME',
        },
        {
          companyName: 'CV Papua Mandiri Alat Berat',
          position: 'Junior Heavy Equipment Operator',
          durationMonths: 36,
          description: 'Melakukan penggalian tanah timbunan proyek dan inspeksi P2H unit harian.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Excavator', level: 'EXPERT', isLmsVerified: true, certificateNumber: 'SIO-EXC-9921' },
        { name: 'Alat Berat', level: 'EXPERT' },
        { name: 'K3 Pertambangan', level: 'INTERMEDIATE', isLmsVerified: true },
        { name: 'P2H Unit', level: 'EXPERT' },
      ],
      certifications: [
        { id: 'cert-sio-1', name: 'SIO Operator Alat Berat Excavator Kelas II', issuer: 'Kemenaker RI', issueYear: '2021', fileUrl: '/uploads/certificates/demo-cert-sio.pdf' },
      ],
      socialDna: {
        workPreferences: ['Siap Shift Malam (24 Jam)', 'Siap Remote Area / Pit Tambang', 'Siap Roster Kerja (6-2 / 4-2)'],
        communityActivities: 'Ketua Paguyuban Pemuda Lingkar Tambang Kuala Kencana',
        organizations: 'Serikat Pekerja Kimia, Energi & Pertambangan Mimika',
        preferredLocation: 'KUALA_KENCANA',
      },
      locationLat: -4.4345,
      locationLng: 136.8845, // Sangat dekat Kuala Kencana
      isAvailable: true,
      profileCompletenessScore: 100,
    },

    // --------------------------------------------------------------------------
    // TALENTA 2: Maria Magdalena Rahawarin (The Geodesy & Drone Specialist)
    // Sasaran: Ranking #1 di Lowongan 1 (Mine Surveyor)
    // --------------------------------------------------------------------------
    {
      email: 'maria.rahawarin.test@talenta.id',
      nik: '9104018802970002',
      fullName: 'Maria Magdalena Rahawarin, A.Md.T.',
      birthDate: new Date('1997-08-20'),
      phone: '081248002233',
      bio: 'Surveyor geodesi tambang berpengalaman 4 tahun mengoperasikan Total Station Leica & pemetaan fotogrametri Drone RTK.',
      education: [{ institution: 'Politeknik Amamapare Timika', degree: 'D3', major: 'Teknik Geodesi & Geomatika', graduationYear: 2018 }],
      workExperience: [
        {
          companyName: 'PT Petrosea Tbk Site Mimika',
          position: 'Junior Mine Surveyor',
          durationMonths: 48,
          description: 'Pengukuran topografi berkala pit tambang, boundary stake out, dan pemrosesan point cloud LiDAR drone di Surpac.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Mine Surveyor', level: 'EXPERT', isLmsVerified: true, certificateNumber: 'BNSP-SURV-2023' },
        { name: 'Total Station', level: 'EXPERT' },
        { name: 'Drone RTK', level: 'EXPERT' },
        { name: 'ArcGIS', level: 'EXPERT' },
        { name: 'K3 Pertambangan', level: 'INTERMEDIATE' },
      ],
      certifications: [
        { id: 'cert-surv-1', name: 'Sertifikat Kompetensi Juru Ukur Tambang', issuer: 'BNSP LSP Minerba', issueYear: '2022', fileUrl: '/uploads/certificates/demo-cert-surveyor.pdf' },
      ],
      socialDna: {
        workPreferences: ['Siap Remote Area / Pit Tambang', 'Siap Roster Kerja (6-2 / 4-2)'],
        communityActivities: 'Anggota Ikatan Surveyor Geodesi Indonesia Korwil Papua',
        organizations: 'Ikatan Mahasiswa & Alumni Politeknik Amamapare',
        preferredLocation: 'KUALA_KENCANA',
      },
      locationLat: -4.432,
      locationLng: 136.8839,
      isAvailable: true,
      profileCompletenessScore: 100,
    },

    // --------------------------------------------------------------------------
    // TALENTA 3: Antonius Wakerkwa (The Fresh Graduate SMK - Ideal for Internship)
    // Sasaran: Ranking #1 di Lowongan 3 (Magang Vokasi Geomatika)
    // --------------------------------------------------------------------------
    {
      email: 'antonius.wakerkwa.test@talenta.id',
      nik: '9104018805060003',
      fullName: 'Antonius Wakerkwa',
      birthDate: new Date('2006-03-15'),
      phone: '081248003344',
      bio: 'Lulusan baru SMK Negeri 3 Mimika bidang survei dan geomatika. Memiliki pemahaman dasar alat ukur tanah dan siap mengikuti program pemagangan industri.',
      education: [{ institution: 'SMK Negeri 3 Mimika (Teknologi Informasi)', degree: 'SMK', major: 'Teknik Geodesi & Geomatika', graduationYear: 2026 }],
      workExperience: [], // 0 Bulan Pengalaman riil (Fresh Graduate!)
      skills: [
        { name: 'Pemetaan', level: 'BEGINNER' },
        { name: 'Komputer Dasar', level: 'INTERMEDIATE' },
        { name: 'Geodesi Dasar', level: 'BEGINNER' },
      ],
      certifications: [],
      socialDna: {
        workPreferences: ['Khusus Jam Kerja Normal (Day Shift)', 'Siap Kontrak Proyek (PKWT)'],
        communityActivities: 'Pengurus Karang Taruna Kelurahan Kuala Kencana',
        organizations: 'Pramuka Saka Bhayangkara Timika',
        preferredLocation: 'KUALA_KENCANA',
      },
      locationLat: -4.433,
      locationLng: 136.884,
      isAvailable: true,
      profileCompletenessScore: 85,
    },

    // --------------------------------------------------------------------------
    // TALENTA 4: Denny Hendrawan, S.E. (The Academic Mismatch)
    // Sasaran: Menguji apakah AI terhindar dari bias gelar S1 (Skor harus rendah di Excavator & Surveyor)
    // --------------------------------------------------------------------------
    {
      email: 'denny.hendrawan.test@talenta.id',
      nik: '9104018809980004',
      fullName: 'Denny Hendrawan, S.E.',
      birthDate: new Date('1998-11-22'),
      phone: '081248004455',
      bio: 'Sarjana Manajemen Keuangan dengan keahlian laporan kas dan perpajakan kantor.',
      education: [{ institution: 'Universitas Cenderawasih', degree: 'S1', major: 'Akuntansi & Keuangan Lembaga', graduationYear: 2021 }],
      workExperience: [
        {
          companyName: 'Koperasi Karyawan Timika',
          position: 'Staff Akuntansi',
          durationMonths: 36,
          description: 'Pencatatan pembukuan jurnal umum dan rekonsiliasi kas bank.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Akuntansi Keuangan & Perpajakan (Brevet A/B)', level: 'EXPERT' },
        { name: 'Microsoft Office', level: 'EXPERT' },
      ],
      certifications: [],
      socialDna: {
        workPreferences: ['Khusus Jam Kerja Normal (Day Shift)'],
        communityActivities: 'Pengurus Paguyuban Warga Jawa di Timika',
        organizations: '',
        preferredLocation: 'TIMIKA',
      },
      locationLat: -4.5468,
      locationLng: 136.8837,
      isAvailable: true,
      profileCompletenessScore: 85,
    },

    // --------------------------------------------------------------------------
    // TALENTA 5: Robertus Beanal (The Certified 6G Pipe Welder)
    // Sasaran: Keahlian tambang tinggi tapi bidang pengelasan, bukan surveyor/excavator
    // --------------------------------------------------------------------------
    {
      email: 'robertus.beanal.test@talenta.id',
      nik: '9104018806960005',
      fullName: 'Robertus Beanal',
      birthDate: new Date('1996-06-08'),
      phone: '081248005566',
      bio: 'Juru las kombinasi SMAW/GTAW 6G bersertifikat BNSP Disnakertrans Mimika dengan pengalaman fabrikasi baja proyek konsentrator.',
      education: [{ institution: 'SMK Negeri 1 Mimika', degree: 'SMK', major: 'Teknik Pengelasan (Welding)', graduationYear: 2015 }],
      workExperience: [
        {
          companyName: 'PT Puncak Jaya Power',
          position: 'Pipe Welder 6G',
          durationMonths: 60,
          description: 'Fabrikasi dan pengelasan pipa bertekanan tinggi di area konsentrator dan PLTD Portsite.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Juru Las GTAW (TIG / Argon) 6G Pipa Bertekanan', level: 'EXPERT', isLmsVerified: true, certificateNumber: 'CERT-BNSP-WELD-9104' },
        { name: 'K3 Pertambangan', level: 'INTERMEDIATE', isLmsVerified: true },
        { name: 'Fabrikasi Baja', level: 'EXPERT' },
      ],
      certifications: [
        { id: 'cert-weld-1', name: 'Sertifikat Juru Las 6G Pipa', issuer: 'BNSP RI', issueYear: '2023', fileUrl: '/uploads/certificates/demo-cert-welder.pdf' },
      ],
      socialDna: {
        workPreferences: ['Siap Shift Malam (24 Jam)', 'Siap Remote Area / Pit Tambang'],
        communityActivities: 'Pemuda Gereja Paroki Tiga Raja Timika',
        organizations: 'LEMASA (Lembaga Musyawarah Adat Suku Amungme)',
        preferredLocation: 'PORTSITE_POMAKO',
      },
      locationLat: -4.8967,
      locationLng: 136.8667, // Pomako
      isAvailable: true,
      profileCompletenessScore: 95,
    },

    // --------------------------------------------------------------------------
    // TALENTA 6: Budi Santoso (High Technical Skills but DNA / Location Conflict)
    // Sasaran: Menguji apakah Vektor Social DNA & GIS memotong skor kandidat yang tidak siap shift
    // --------------------------------------------------------------------------
    {
      email: 'budi.santoso.survey.test@talenta.id',
      nik: '9104018803930006',
      fullName: 'Budi Santoso, S.T.',
      birthDate: new Date('1993-03-01'),
      phone: '081248006677',
      bio: 'Surveyor geodesi berlisensi, memiliki pengalaman Total Station dan pemetaan kontur, namun hanya menerima jam kerja reguler kantor kota.',
      education: [{ institution: 'Institut Teknologi Sepuluh Nopember', degree: 'S1', major: 'Teknik Geodesi & Geomatika', graduationYear: 2016 }],
      workExperience: [
        {
          companyName: 'Konsultan Pemetaan Tata Ruang',
          position: 'Senior Surveyor',
          durationMonths: 72,
          description: 'Pengukuran kadaster perkotaan dan batas wilayah distrik.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Total Station', level: 'EXPERT' },
        { name: 'ArcGIS', level: 'EXPERT' },
        { name: 'Mine Surveyor', level: 'INTERMEDIATE' },
      ],
      certifications: [],
      socialDna: {
        workPreferences: ['Khusus Jam Kerja Normal (Day Shift)'], // Menolak Shift Malam & Remote!
        communityActivities: '',
        organizations: 'Ikatan Surveyor Indonesia',
        preferredLocation: 'TIMIKA',
      },
      locationLat: -4.55,
      locationLng: 136.88, // Timika Kota
      isAvailable: true,
      profileCompletenessScore: 85,
    },

    // --------------------------------------------------------------------------
    // TALENTA 7: Fransiska Alom (The Hospitality Talent - Negative Control)
    // Sasaran: Kontrol Negatif (Skor harus < 30% di semua lowongan tambang/geodesi)
    // --------------------------------------------------------------------------
    {
      email: 'fransiska.alom.test@talenta.id',
      nik: '9104018807990007',
      fullName: 'Fransiska Alom',
      birthDate: new Date('1999-07-14'),
      phone: '081248007788',
      bio: 'Front office receptionist dan customer relation dengan pengalaman perhotelan di Kota Timika.',
      education: [{ institution: 'SMK Negeri 2 Mimika (Pariwisata & Bisnis)', degree: 'SMK', major: 'Perhotelan & Pariwisata', graduationYear: 2017 }],
      workExperience: [
        {
          companyName: 'Hotel Horison Ultima Timika',
          position: 'Front Desk Agent',
          durationMonths: 48,
          description: 'Melayani check-in tamu korporat, reservasi kamar, dan operasional kasir front office.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Perhotelan & Pariwisata', level: 'EXPERT' },
        { name: 'Front Desk Operation', level: 'EXPERT' },
        { name: 'Administrasi', level: 'INTERMEDIATE' },
      ],
      certifications: [],
      socialDna: {
        workPreferences: ['Khusus Jam Kerja Normal (Day Shift)'],
        communityActivities: 'Relawan Literasi Komunitas Baca Anak Papua',
        organizations: '',
        preferredLocation: 'TIMIKA',
      },
      locationLat: -4.545,
      locationLng: 136.882,
      isAvailable: true,
      profileCompletenessScore: 85,
    },

    // --------------------------------------------------------------------------
    // TALENTA 8: Kevin Pratama (IT Fullstack Developer - Negative Control)
    // Sasaran: Menguji apakah kata kunci IT terisolasi dari alat berat/tambang
    // --------------------------------------------------------------------------
    {
      email: 'kevin.pratama.it.test@talenta.id',
      nik: '9104018810000008',
      fullName: 'Kevin Pratama',
      birthDate: new Date('2000-10-10'),
      phone: '081248008899',
      bio: 'Software engineer spesialis React, Next.js, Node.js, dan arsitektur database PostgreSQL.',
      education: [{ institution: 'Universitas Indonesia', degree: 'S1', major: 'Teknik Informatika / Ilmu Komputer', graduationYear: 2022 }],
      workExperience: [
        {
          companyName: 'Software House Timika Digital',
          position: 'Fullstack Developer',
          durationMonths: 24,
          description: 'Membangun aplikasi sistem informasi terpadu dan RESTful API mikroservis.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Fullstack Developer', level: 'EXPERT' },
        { name: 'Frontend Developer (React / Next.js)', level: 'EXPERT' },
        { name: 'Database Administrator (PostgreSQL / Redis)', level: 'INTERMEDIATE' },
      ],
      certifications: [],
      socialDna: {
        workPreferences: ['Khusus Jam Kerja Normal (Day Shift)', 'Siap Kontrak Proyek (PKWT)'],
        communityActivities: 'Inisiator Komunitas Mimika Tech Meetup',
        organizations: '',
        preferredLocation: 'TIMIKA',
      },
      locationLat: -4.54,
      locationLng: 136.885,
      isAvailable: true,
      profileCompletenessScore: 90,
    },

    // --------------------------------------------------------------------------
    // TALENTA 9: Marthen Basik-Basik (The Highland Heavy Truck Operator)
    // Sasaran: Kandidat pendukung Excavator, tapi kuat di Dump Truck & Lokasi Highland
    // --------------------------------------------------------------------------
    {
      email: 'marthen.basik.test@talenta.id',
      nik: '9104018804940009',
      fullName: 'Marthen Basik-Basik',
      birthDate: new Date('1994-04-05'),
      phone: '081248009900',
      bio: 'Pengemudi truk tambang CAT 777/785 di area tambang terbuka Grasberg Highland dengan jam terbang 8 tahun.',
      education: [{ institution: 'SMK Negeri 1 Mimika', degree: 'SMK', major: 'Teknik Alat Berat', graduationYear: 2012 }],
      workExperience: [
        {
          companyName: 'PT Freeport Subcontractor Mining',
          position: 'Off-Highway Dump Truck Driver',
          durationMonths: 96,
          description: 'Pengangkutan batuan overburden di rute haul road Grasberg dengan tanjakan ekstrem dan kondisi kabut tebal.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Operator Off-Highway Dump Truck (CAT 777 / 785)', level: 'EXPERT', isLmsVerified: true },
        { name: 'Alat Berat', level: 'EXPERT' },
        { name: 'K3 Pertambangan', level: 'EXPERT' },
      ],
      certifications: [
        { id: 'cert-dump-1', name: 'SIO Dump Truck Tambang Kelas II', issuer: 'Kemenaker RI', issueYear: '2020' },
      ],
      socialDna: {
        workPreferences: ['Siap Shift Malam (24 Jam)', 'Siap Remote Area / Pit Tambang', 'Siap Roster Kerja (6-2 / 4-2)'],
        communityActivities: 'Ketua Tim Tanggap Darurat Bencana Desa Banti',
        organizations: '',
        preferredLocation: 'HIGHLAND_TEMBAGAPURA',
      },
      locationLat: -4.1333,
      locationLng: 137.1167, // Tembagapura Highland
      isAvailable: true,
      profileCompletenessScore: 95,
    },

    // --------------------------------------------------------------------------
    // TALENTA 10: Yohanes Kogoya (Intermediate Junior Surveyor)
    // Sasaran: Runner-up di Lowongan Surveyor (Memenuhi kualifikasi menengah)
    // --------------------------------------------------------------------------
    {
      email: 'yohanes.kogoya.surv.test@talenta.id',
      nik: '9104018812990010',
      fullName: 'Yohanes Kogoya, S.T.',
      birthDate: new Date('1999-12-01'),
      phone: '081248011223',
      bio: 'Junior Geodetic Engineer lulusan Universitas Papua dengan pengalaman proyek pemetaan infrastruktur Kuala Kencana.',
      education: [{ institution: 'Universitas Papua', degree: 'S1', major: 'Teknik Geodesi & Geomatika', graduationYear: 2022 }],
      workExperience: [
        {
          companyName: 'PT Jaya Konstruksi Papua',
          position: 'Junior Surveyor',
          durationMonths: 20,
          description: 'Pengukuran as-built jalan dan drainase proyek Kuala Kencana menggunakan Total Station Topcon.',
          employmentType: 'FULL_TIME',
        },
      ],
      skills: [
        { name: 'Total Station', level: 'INTERMEDIATE' },
        { name: 'ArcGIS', level: 'INTERMEDIATE' },
        { name: 'Mine Surveyor', level: 'BEGINNER' },
        { name: 'K3 Pertambangan', level: 'BEGINNER' },
      ],
      certifications: [],
      socialDna: {
        workPreferences: ['Siap Remote Area / Pit Tambang', 'Siap Roster Kerja (6-2 / 4-2)'],
        communityActivities: 'Ikatan Mahasiswa Pegunungan Tengah Papua',
        organizations: '',
        preferredLocation: 'KUALA_KENCANA',
      },
      locationLat: -4.4325,
      locationLng: 136.8836,
      isAvailable: true,
      profileCompletenessScore: 90,
    },
  ];

  let insertedCount = 0;
  for (const t of DIVERSE_TALENTS) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        passwordHash,
        role: 'TALENT',
        isVerified: true,
      },
      create: {
        email: t.email,
        passwordHash,
        role: 'TALENT',
        isVerified: true,
      },
    });

    await prisma.talent.upsert({
      where: { id: user.id },
      update: {
        nik: t.nik,
        fullName: t.fullName,
        birthDate: t.birthDate,
        phone: t.phone,
        bio: t.bio,
        education: t.education,
        workExperience: t.workExperience,
        skills: t.skills,
        certifications: t.certifications,
        socialDna: t.socialDna,
        locationLat: t.locationLat,
        locationLng: t.locationLng,
        profileCompletenessScore: t.profileCompletenessScore,
        isAvailable: t.isAvailable,
      },
      create: {
        id: user.id,
        nik: t.nik,
        fullName: t.fullName,
        birthDate: t.birthDate,
        phone: t.phone,
        bio: t.bio,
        education: t.education,
        workExperience: t.workExperience,
        skills: t.skills,
        certifications: t.certifications,
        socialDna: t.socialDna,
        locationLat: t.locationLat,
        locationLng: t.locationLng,
        profileCompletenessScore: t.profileCompletenessScore,
        isAvailable: t.isAvailable,
      },
    });

    insertedCount++;
    console.log(`  [${insertedCount}/10] Tersimpan: ${t.fullName} (${t.email})`);
  }

  console.log('\n================================================================');
  console.log('STATUS INGESTION BERHASIL 100%! ');
  console.log('Perusahaan Uji : PT Citra Geometrik Indonesia (apikeybrida@gmail.com)');
  console.log('Password Akun  :', defaultPassword);
  console.log('Total Lowongan : 3 Lowongan Khusus');
  console.log('Total Talenta  : 10 Kandidat Hiper-Realistis Mimika');
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('Error saat seeding data uji:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
