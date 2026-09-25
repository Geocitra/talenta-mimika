const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_BENEFITS = ['ASRAMA_MESS', 'MAKAN_3X', 'UANG_SAKU', 'APD_LENGKAP', 'BPJS_MAGANG', 'MODUL_KIT'];

const PROGRAMS_DATA = [
  {
    category: 'WELDING',
    title: 'Pelatihan Juru Las 6G Pipa Bertekanan (SMAW & GTAW)',
    programCode: 'WLD-6G-2026',
    subCategory: 'SMAW & GTAW Pipe Welding ASME Sec IX',
    providerName: 'Balai Latihan Kerja Mimika & LSP Las Logam',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 25,
    durationDays: 40,
    totalLessonHours: 160,
    totalSessions: 12,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/welding_flyer.jpg',
    description: `Program kejuruan unggulan pengelasan posisi 6G (pipa miring 45 derajat tetap) menggunakan kombinasi proses las busur listrik terbungkus (SMAW) dan las gas tungsten (GTAW/TIG). 

Dirancang khusus untuk memenuhi kualifikasi ketat standar ASME Boiler and Pressure Vessel Code Section IX serta AWS D1.1 yang menjadi standar wajib operasional kontraktor migas, konsentrator, dan perpipaan pertambangan di kawasan industri Kabupaten Mimika.`,
    syllabus: `• Modul 01: Keselamatan dan Kesehatan Kerja (K3) Bengkel Las & Ruang Terbatas
• Modul 02: Membaca Gambar Teknik, Simbol Las & WPS (Welding Procedure Specification)
• Modul 03: Penyetelan Mesin GTAW / TIG & Pemilihan Gas Pelindung Argon Murni
• Modul 04: Pengelasan Root Pass GTAW Pipa Karbon Karakteristik Schedule 80
• Modul 05: Pengelasan Hot Pass, Fill Pass & Cap Pass Menggunakan Elektroda Khusus SMAW
• Modul 06: Posisi Las Miring 45 Derajat Tetap (6G Non-Rotated)
• Modul 07: Non-Destructive Testing (NDT): Visual, Radiography & Ultrasonic Testing
• Modul 08: Uji Destruktif Root & Face Bend Test
• Modul 09: Bimbingan Portofolio & Pra-Asesmen Uji Kompetensi BNSP`,
    requirements: [
      'Warga Negara Indonesia berdomisili di Kabupaten Mimika (KTP/Surat Domisili Mimika).',
      'Pria/Wanita usia minimal 18 tahun dan maksimal 35 tahun.',
      'Pendidikan minimal SMK Jurusan Pengelasan/Permesinan atau memiliki sertifikat las 3G/dasar.',
      'Sehat jasmani dan rohani, tidak buta warna, dan memiliki ketajaman visual prima.',
      'Lulus seleksi tes wawancara dan tes kemampuan dasar pengelasan di balai.'
    ],
    targetSkills: [
      { name: 'Pengelasan GTAW Pipa Schedule 80 Posisi 6G', level: 'Level 3 KKNI' },
      { name: 'Pengelasan SMAW Pipa Baja Karbon', level: 'Level 3 KKNI' },
      { name: 'Interpretasi WPS & Simbol Pengelasan Standar ASME', level: 'Industri Terapan' },
      { name: 'K3 Pengelasan Ruang Terbatas & Ketinggian', level: 'Lisensi Keselamatan' }
    ],
    batch: {
      batchName: 'Gelombang I - Las 6G Angkatan 2026 (APBD Mimika)',
      batchNumber: 1,
      quota: 25,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-15'),
      trainingStart: new Date('2026-10-25'),
      trainingEnd: new Date('2026-12-05'),
      isOpen: true,
      venueAddress: 'Workshop Pengelasan Logam BLK Mimika, Jl. Cenderawasih Km 4, Timika'
    }
  },
  {
    category: 'ALAT_BERAT',
    title: 'Pelatihan Operator Excavator & Haul Truck Pertambangan',
    programCode: 'HEO-EXC-2026',
    subCategory: 'Operasional Tambang Terbuka Kelas Berat',
    providerName: 'Pusat Pelatihan Operator Alat Berat Timika',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMBINASI_LENGKAP',
    quota: 30,
    durationDays: 45,
    totalLessonHours: 180,
    totalSessions: 14,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/alat_berat_flyer.jpg',
    description: `Pelatihan terpadu operasional alat berat kelas tambang terbuka (surface mining) berfokus pada unit Hydraulic Excavator kelas 30-50 ton dan Off-Highway Haul Truck kelas 70 ton. 

Siswa dilatih secara intensif mulai dari simulator hidrolik modern, Pre-Start Inspection (P2H), maneuver lapangan tambang, prosedur dumping, hingga penanganan kondisi darurat sesuai regulasi Kepmen ESDM 1827 K/30/MEM/2018.`,
    syllabus: `• Modul 01: Regulasi Keselamatan Pertambangan & Golden Rules Area Tambang Aktif
• Modul 02: Pengenalan Komponen, Sistem Hidrolik & Powertrain Alat Berat
• Modul 03: Prosedur P2H (Pemeriksaan & Perawatan Harian) Mesin & Undercarriage
• Modul 04: Pengenalan Cockpit & Instrumen Kontrol Simulator Caterpillar / Komatsu
• Modul 05: Teknik Penggalian (Digging), Parit (Trenching), & Loading Material ke Hauler
• Modul 06: Operasional Truk Tambang (Haul Truck) di Lereng & Jalan Angkut Basah
• Modul 07: Radio Communication Protocol & Isyarat Tangan Lapangan Tambang
• Modul 08: Praktik Langsung di Sirkuit Tambang Training Ground Mimika
• Modul 09: Ujian Teori & Praktik Sertifikasi SIO Kemnaker & BNSP`,
    requirements: [
      'Warga Negara Indonesia, berdomisili resmi di Kabupaten Mimika.',
      'Usia minimal 20 tahun dan maksimal 38 tahun.',
      'Pendidikan minimal SMA/SMK sederajat.',
      'Memiliki SIM A atau SIM B1 yang masih aktif.',
      'Bebas dari pengaruh narkoba dan alkohol (wajib lolos MCU berkala).'
    ],
    targetSkills: [
      { name: 'Operasional Hydraulic Excavator 30T-50T', level: 'Operator Madya' },
      { name: 'Operasional Off-Highway Haul Truck 70T', level: 'Operator Madya' },
      { name: 'Inspeksi & Maintenance P2H Alat Berat', level: 'Standar Industri Tambang' },
      { name: 'Surat Izin Operator (SIO) Kelas II Kemnaker', level: 'Lisensi Negara' }
    ],
    batch: {
      batchName: 'Gelombang I - Operator Alat Berat Tambang (APBD Mimika)',
      batchNumber: 1,
      quota: 30,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-20'),
      trainingStart: new Date('2026-11-01'),
      trainingEnd: new Date('2026-12-15'),
      isOpen: true,
      venueAddress: 'Mining Training Ground SP3 & Simulator Center BLK Timika'
    }
  },
  {
    category: 'K3_PERTAMBANGAN',
    title: 'Sertifikasi Pengawas Operasional Pertama (POP) & K3 Tambang',
    programCode: 'K3-POP-2026',
    subCategory: 'Pengawasan K3 & Keselamatan Operasi Tambang',
    providerName: 'LSP Tambang Indonesia & Balai Diklat Mimika',
    deliveryMode: 'HYBRID',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 35,
    durationDays: 25,
    totalLessonHours: 120,
    totalSessions: 10,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/k3_tambang_flyer.jpg',
    description: `Program sertifikasi resmi skema Pengawas Operasional Pertama (POP) Pertambangan yang diakui Ditjen Minerba Kementerian ESDM dan BNSP RI.

Mempersiapkan tenaga kerja lokal Mimika untuk menduduki posisi pengawas lini depan (frontline supervisor), foreman lapangan, atau Safety Inspector yang memiliki legalitas dan wewenang menghentikan pekerjaan berisiko tinggi.`,
    syllabus: `• Modul 01: Landasan Hukum K3 & Keselamatan Operasi Pertambangan (Kepmen ESDM 1827)
• Modul 02: Tugas dan Tanggung Jawab Hukum Pengawas Operasional Pertama (POP)
• Modul 03: Hazard Identification, Risk Assessment and Risk Control (HIRARC / IBPR)
• Modul 04: Melaksanakan Inspeksi K3 Lapangan Terencana & Tindak Lanjut Temuan
• Modul 05: Teknik Investigasi Kecelakaan Kerja & Analisis Akar Masalah (RCA)
• Modul 06: Job Safety Analysis (JSA) & Standar Prosedur Operasional (SOP)
• Modul 07: Manajemen Lingkungan Tambang, Penanganan Limbah B3 & Reklamasi
• Modul 08: Komunikasi K3, Safety Talk & Peningkatan Budaya Selamat
• Modul 09: Pra-Asesmen Wawancara Asesor Kompetensi LSP Minerba`,
    requirements: [
      'KTP Kabupaten Mimika, usia minimal 21 tahun.',
      'Pendidikan minimal D3 Teknik / S1 Teknik (pengalaman kerja 1 tahun di tambang) atau SMA/SMK (pengalaman 5 tahun di area pertambangan).',
      'Surat Keterangan Pengalaman Kerja dari perusahaan kontraktor / subkon pertambangan.',
      'Sehat jasmani & rohani, tidak sedang menjalani sanksi disiplin keselamatan kerja.'
    ],
    targetSkills: [
      { name: 'Sertifikasi Pengawas Operasional Pertama (POP)', level: 'BNSP / ESDM RI' },
      { name: 'Investigasi Kecelakaan Kerja & Analisis RCA', level: 'Tingkat Lanjut' },
      { name: 'Penyusunan HIRARC & Job Safety Analysis (JSA)', level: 'Kualifikasi Supervisor' }
    ],
    batch: {
      batchName: 'Gelombang I - POP K3 Pertambangan Nasional 2026',
      batchNumber: 1,
      quota: 35,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-18'),
      trainingStart: new Date('2026-10-28'),
      trainingEnd: new Date('2026-11-22'),
      isOpen: true,
      venueAddress: 'Auditorium Diklat Disnakertrans Mimika & Hybrid Zoom LMS'
    }
  },
  {
    category: 'MEKANIK',
    title: 'Pelatihan Teknisi Bubut Frais & Pompa Hidrolik Industri',
    programCode: 'MEK-IND-2026',
    subCategory: 'Machining & Industrial Hydraulic Maintenance',
    providerName: 'Pusat Vokasi Permesinan & Manufaktur Mimika',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 25,
    durationDays: 35,
    totalLessonHours: 140,
    totalSessions: 11,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/mekanik_flyer.jpg',
    description: `Mencetak tenaga mekanik manufaktur presisi yang menguasai pengoperasian mesin perkakas (Bubut Konvensional & Mesin Frais) serta troubleshooting sistem pompa sentrifugal dan hidrolik industri berat.

Siswa diajarkan membuat spare part komponen mesin tambang dengan toleransi presisi micrometer serta melakukan overhaul pompa dan silinder hidrolik.`,
    syllabus: `• Modul 01: K3 Bengkel Mesin Perkakas & APD Keselamatan Kerja Mekanikal
• Modul 02: Pengukuran Presisi Tinggi: Vernier Caliper, Micrometer & Dial Indicator
• Modul 03: Pengoperasian Mesin Bubut: Pembubutan Muka, Bertingkat, Alur & Ulir Metris/Inchi
• Modul 04: Pengoperasian Mesin Frais (Milling): Perataan Permukaan, Pembuatan Roda Gigi
• Modul 05: Dasar Mekanika Fluida & Komponen Sistem Hidrolik Industri
• Modul 06: Overhaul Pompa Sentrifugal, Gasket Cutting & Penggantian Mechanical Seal
• Modul 07: Troubleshooting Silinder Hidrolik, Valve Directional & Filter Kontaminasi
• Modul 08: Uji Kompetensi Pembuatan Benda Kerja Standar Industri BNSP`,
    requirements: [
      'Talent Kabupaten Mimika berpendidikan minimal SMK Teknik Mesin / Otomotif atau SMA sederajat.',
      'Usia minimal 18 tahun dan maksimal 30 tahun.',
      'Mampu membaca alat ukur dan tidak buta warna.',
      'Bersedia mengikuti jam bengkel intensif Senin s/d Sabtu.'
    ],
    targetSkills: [
      { name: 'Pengoperasian Mesin Bubut Presisi', level: 'Level 2 KKNI' },
      { name: 'Pengoperasian Mesin Frais / Milling', level: 'Level 2 KKNI' },
      { name: 'Troubleshooting Sistem Hidrolik & Pompa', level: 'Standar Industri' }
    ],
    batch: {
      batchName: 'Gelombang I - Mekanik Permesinan Industri (APBD Mimika)',
      batchNumber: 1,
      quota: 25,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-25'),
      trainingStart: new Date('2026-11-05'),
      trainingEnd: new Date('2026-12-10'),
      isOpen: true,
      venueAddress: 'Workshop Permesinan Presisi BLK Timika'
    }
  },
  {
    category: 'ELEKTRIKAL',
    title: 'Pelatihan Teknisi Listrik Industri Daya Tinggi & PLC Otomasi',
    programCode: 'ELK-PLC-2026',
    subCategory: 'Electrical Power Distribution & PLC SCADA Automation',
    providerName: 'Balai Latihan Kerja Mimika (Jurusan Listrik Industri)',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 25,
    durationDays: 35,
    totalLessonHours: 140,
    totalSessions: 12,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/elektrikal_flyer.jpg',
    description: `Kurikulum komprehensif standardisasi instalasi tenaga listrik 3 fasa, panel distribusi (Switchgear), proteksi kelistrikan industri, dan pemrograman Programmable Logic Controller (PLC Siemens/Schneider) untuk otomasi pabrik dan pengolahan konsentrat.`,
    syllabus: `• Modul 01: Keselamatan Kerja Listrik Tegangan Tinggi, LOTO (Lock Out Tag Out) & APD Arc Flash
• Modul 02: Membaca Gambar Rangkaian Kontrol Listrik, Single Line Diagram & Wire Tagging
• Modul 03: Perakitan Panel Starter Motor: Direct On Line (DOL), Star-Delta & Inverter VFD
• Modul 04: Pengujian Tahanan Isolasi Megger & Pembumian (Grounding System)
• Modul 05: Pemrograman Dasar PLC Ladder Diagram (Digital Input/Output & Timer)
• Modul 06: Integrasi Sensor Industri: Proximity, Pressure Transmitter & Flow Meter
• Modul 07: Troubleshooting Kerusakan Rangkaian Tenaga & Kontrol Otomasi
• Modul 08: Asesmen Sertifikasi BNSP Teknisi Madya Instalasi Listrik Industri`,
    requirements: [
      'KTP Mimika, usia 18 - 32 tahun.',
      'Pendidikan minimal SMK Jurusan Listrik / Elektro / Mekatronika atau D3 Teknik Listrik.',
      'Bebas buta warna (mutlak untuk identifikasi warna kabel industri).',
      'Memahami dasar rangkaian listrik DC dan AC.'
    ],
    targetSkills: [
      { name: 'Instalasi & Perakitan Panel Kontrol Listrik 3 Fasa', level: 'Level 3 KKNI' },
      { name: 'Pemrograman PLC & Sensor Industri Otomasi', level: 'Teknisi Madya' },
      { name: 'Prosedur Keselamatan Listrik & LOTO', level: 'Standar K3 Kemnaker' }
    ],
    batch: {
      batchName: 'Gelombang I - Listrik Industri & Otomasi PLC 2026',
      batchNumber: 1,
      quota: 25,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-22'),
      trainingStart: new Date('2026-11-03'),
      trainingEnd: new Date('2026-12-08'),
      isOpen: true,
      venueAddress: 'Laboratorium Listrik & Otomasi Gedung Vokasi Mimika'
    }
  },
  {
    category: 'DIGITAL_IT',
    title: 'Bootcamp Fullstack Web Developer & Digital Talent Papua',
    programCode: 'DIG-DEV-2026',
    subCategory: 'Software Engineering & Enterprise Web Applications',
    providerName: 'Papua Digital Tech Academy (Mitra Disnakertrans)',
    deliveryMode: 'HYBRID',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 40,
    durationDays: 60,
    totalLessonHours: 240,
    totalSessions: 16,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/digital_it_flyer.jpg',
    description: `Bootcamp coding intensif untuk generasi muda Mimika menjadi software engineer siap kerja. Mempelajari arsitektur fullstack web enterprise modern (React, Next.js, TypeScript, Node.js, PostgreSQL) serta integrasi AI APIs dan deployment cloud computing.`,
    syllabus: `• Modul 01: Dasar Algoritma Pemrograman, Git Version Control & GitHub Collaboration
• Modul 02: Modern Frontend: HTML5 Semantik, CSS3 Flexbox/Grid, TypeScript & TailwindCSS
• Modul 03: Component Driven Development Menggunakan React & Next.js App Router
• Modul 04: Backend Development: RESTful API Express.js, TypeScript & Prisma ORM
• Modul 05: Relational Database Modeling Menggunakan PostgreSQL & Migrasi Data
• Modul 06: Authentication & Security: JWT,方便密码哈希 & CORS
• Modul 07: Integrasi LLM & AI Assistant ke Dalam Solusi Web Bisnis
• Modul 08: Cloud Deployment Menggunakan Docker, CI/CD Pipeline & Monitoring
• Modul 09: Final Capstone Project: Membangun Aplikasi Nyata untuk UMKM / Pemda Mimika
• Modul 10: Portofolio Review & Uji Sertifikasi BNSP Skema Rekayasa Perangkat Lunak`,
    requirements: [
      'Warga Negara Indonesia, berdomisili di Kabupaten Mimika.',
      'Pria/Wanita usia 18 s/d 30 tahun.',
      'Pendidikan minimal SMA/SMK/D3/S1 semua jurusan (memiliki minat tinggi di bidang teknologi).',
      'Memiliki laptop sendiri untuk pengerjaan proyek (disubsidi lab komputer di balai).',
      'Lolos tes logika algoritma dasar secara online.'
    ],
    targetSkills: [
      { name: 'Fullstack Web Development (Next.js & Node.js)', level: 'Junior Software Engineer' },
      { name: 'Relational Database Engineering (PostgreSQL)', level: 'Level 3 KKNI' },
      { name: 'API Security & RESTful Architecture', level: 'Industri Terapan' }
    ],
    batch: {
      batchName: 'Gelombang I - Digital Talent Incubator Mimika 2026',
      batchNumber: 1,
      quota: 40,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-30'),
      trainingStart: new Date('2026-11-10'),
      trainingEnd: new Date('2027-01-10'),
      isOpen: true,
      venueAddress: 'Digital Innovation Hub Timika & Online Remote LMS'
    }
  },
  {
    category: 'LOGISTIK',
    title: 'Pelatihan Operator Forklift & Manajemen Gudang Modern',
    programCode: 'LOG-FRK-2026',
    subCategory: 'Supply Chain, Warehouse Inventory & Forklift Operation',
    providerName: 'Pusat Logistik & Pergudangan Terpadu Mimika',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMBINASI_LENGKAP',
    quota: 30,
    durationDays: 25,
    totalLessonHours: 100,
    totalSessions: 8,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/logistik_flyer.jpg',
    description: `Mencetak tenaga profesional pergudangan yang andal dalam mengoperasikan unit Counterbalance Forklift (Diesel & Elektrik) bersertifikat SIO Kemnaker RI, serta menguasai manajemen inventori pergudangan modern berbasis WMS (Warehouse Management System).`,
    syllabus: `• Modul 01: K3 Operasional Pergudangan & Keselamatan Jalur Forklift
• Modul 02: Pengenalan Bagian, Kapasitas Beban (Load Chart) & Kestabilan Unit Forklift
• Modul 03: Prosedur P2H Forklift, Pengecekan Mast, Garpu (Fork) & Sistem Hidrolik
• Modul 04: Praktik Bermanuver, Mengangkat Beban Pallet & Stacking di Rak Tingkat Tinggi
• Modul 05: Alur Penerimaan Barang (Inbound), Put-Away & Storage Allocation
• Modul 06: Stock Opname, Siklus Penghitungan Inventori & Barcode Scanning WMS
• Modul 07: Picking, Packing & Prosedur Pengiriman Barang (Outbound)
• Modul 08: Ujian Praktik Lisensi SIO Operator Forklift Kemnaker RI & BNSP`,
    requirements: [
      'KTP Kabupaten Mimika, usia minimal 19 tahun dan maksimal 35 tahun.',
      'Pendidikan minimal SMA/SMK sederajat.',
      'Memiliki SIM A / C yang masih berlaku.',
      'Sehat jasmani, tidak tremor, dan memiliki reflek motorik yang baik.'
    ],
    targetSkills: [
      { name: 'Lisensi SIO Operator Forklift Kemnaker RI', level: 'Lisensi Negara' },
      { name: 'Pengelolaan Inventori Gudang (WMS & Barcoding)', level: 'Level 2 KKNI' },
      { name: 'K3 Penanganan Material & Beban Berat', level: 'Standar Industri' }
    ],
    batch: {
      batchName: 'Gelombang I - Operator Forklift & Gudang 2026 (APBD Mimika)',
      batchNumber: 1,
      quota: 30,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-15'),
      trainingStart: new Date('2026-10-26'),
      trainingEnd: new Date('2026-11-20'),
      isOpen: true,
      venueAddress: 'Gudang Pelatihan Logistik Pelabuhan Pomako & BLK Mimika'
    }
  },
  {
    category: 'KONSTRUKSI',
    title: 'Pelatihan Juru Ukur Surveyor & Scaffolding Konstruksi Sipil',
    programCode: 'KON-SRV-2026',
    subCategory: 'Topographic Surveying & Civil Scaffolding Installation',
    providerName: 'Balai Jasa Konstruksi Wilayah Mimika (Mitra PUPR)',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 25,
    durationDays: 30,
    totalLessonHours: 120,
    totalSessions: 10,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/konstruksi_flyer.jpg',
    description: `Mempersiapkan tenaga juru ukur tanah (surveyor) yang mahir menggunakan Total Station, Waterpass, dan GPS Geodetik untuk pemetaan proyek infrastruktur, serta teknisi pemasangan perancah (scaffolding) bersertifikasi keselamatan kerja di ketinggian.`,
    syllabus: `• Modul 01: Keselamatan Konstruksi (K3 Konstruksi) & Bekerja di Ketinggian (Working at Height)
• Modul 02: Dasar Ilmu Ukur Tanah, Pemetaan Topografi & Koordinat UTM
• Modul 03: Pengenalan & Setting Alat Waterpass (Automatic Level) untuk Penentuan Ketinggian
• Modul 04: Pengoperasian Alat Total Station Digital (Pengukuran Sudut, Jarak & Koordinat)
• Modul 05: Pengolahan Data Lapangan Menggunakan Software AutoCAD Civil 3D
• Modul 06: Komponen Perancah (Scaffolding): Standar Pipa, Clamp, Base Plate & Bracing
• Modul 07: Pemasangan, Pembongkaran & Inspeksi Keamanan Struktur Perancah (Scaffolding Tag)
• Modul 08: Uji Kompetensi Lapangan Juru Ukur Surveyor Lisensi BNSP`,
    requirements: [
      'Talent Kabupaten Mimika berpendidikan minimal SMK Teknik Bangunan / Geomatika atau SMA sederajat.',
      'Pria/Wanita usia 18 s/d 35 tahun.',
      'Mampu bekerja di luar ruangan (outdoor) dan tidak takut ketinggian.',
      'Kondisi fisik prima dan bebas buta warna.'
    ],
    targetSkills: [
      { name: 'Pengoperasian Total Station & Waterpass', level: 'Juru Ukur Madya' },
      { name: 'Pengolahan Peta Topografi AutoCAD Civil 3D', level: 'Level 2 KKNI' },
      { name: 'Instalasi & Inspeksi Scaffolding Aman', level: 'Standar K3 Ketinggian' }
    ],
    batch: {
      batchName: 'Gelombang I - Surveyor & Konstruksi Sipil 2026 (APBD)',
      batchNumber: 1,
      quota: 25,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-24'),
      trainingStart: new Date('2026-11-04'),
      trainingEnd: new Date('2026-12-04'),
      isOpen: true,
      venueAddress: 'Area Praktik Lapangan Sipil BLK & Workshop PUPR Mimika'
    }
  },
  {
    category: 'HOSPITALITY',
    title: 'Pelatihan Tata Boga & Industrial Catering Fasilitas Tambang',
    programCode: 'HOS-CAT-2026',
    subCategory: 'Commercial Kitchen, Food Hygiene & Camp Catering',
    providerName: 'Lembaga Pelatihan Perhotelan & Boga Timika',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 30,
    durationDays: 30,
    totalLessonHours: 120,
    totalSessions: 10,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/hospitality_flyer.jpg',
    description: `Program pelatihan tata boga komersial berstandar Hazard Analysis Critical Control Point (HACCP) untuk melatih koki dan staf boga andal di fasilitas catering pertambangan (camp facilities), hotel, dan restoran berkapasitas ribuan porsi harian.`,
    syllabus: `• Modul 01: Higiene Sanitasi Makanan & Regulasi K3 Dapur Komersial (HACCP)
• Modul 02: Pengenalan Pisau Dapur, Teknik Memotong Presisi & Penanganan Daging/Ikan/Sayur
• Modul 03: Penyusunan Menu Seimbang Gizi Tinggi untuk Tenaga Kerja Industri Berat
• Modul 04: Pengolahan Masakan Nusantara Populer Skala Besar (Large Scale Cooking)
• Modul 05: Pengolahan Hidangan Kontinental & Western Buffet
• Modul 06: Bakery, Pastry & Pengolahan Roti Sarapan Pagi Camp
• Modul 07: Manajemen Penyimpanan Bahan Dingin (Cold Storage & Chiller Management)
• Modul 08: Standard Food Costing, Portion Control & Penataan Buffet Display
• Modul 09: Uji Asesmen Praktik Memasak Standar Sertifikasi BNSP Commis Chef`,
    requirements: [
      'Talent Kabupaten Mimika, usia 18 s/d 35 tahun.',
      'Pria/Wanita berpendidikan minimal SMA/SMK sederajat.',
      'Memiliki minat besar dalam bidang kuliner dan pelayanan makanan.',
      'Sehat jasmani dan bebas dari penyakit menular (lulus swab/tes kesehatan dapur).'
    ],
    targetSkills: [
      { name: 'Pengolahan Makanan Skala Besar (Industrial Catering)', level: 'Commis Chef' },
      { name: 'Higiene Sanitasi Makanan & Standar HACCP', level: 'Sertifikat Higiene' },
      { name: 'Penyusunan Menu Gizi Seimbang Industri', level: 'Level 2 KKNI' }
    ],
    batch: {
      batchName: 'Gelombang I - Tata Boga & Catering Camp Tambang 2026',
      batchNumber: 1,
      quota: 30,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-16'),
      trainingStart: new Date('2026-10-27'),
      trainingEnd: new Date('2026-11-26'),
      isOpen: true,
      venueAddress: 'Commercial Kitchen Lab BLK Mimika, Timika'
    }
  },
  {
    category: 'OTOMOTIF',
    title: 'Pelatihan Mekanik Kendaraan Ringan (LV) 4x4 & Mesin Diesel',
    programCode: 'OTO-LV4-2026',
    subCategory: 'Light Vehicle 4WD & Common Rail Diesel Maintenance',
    providerName: 'Pusat Vokasi Otomotif & Mesin Transportasi Mimika',
    deliveryMode: 'OFFLINE',
    certificateType: 'KOMPETENSI_BNSP',
    quota: 25,
    durationDays: 35,
    totalLessonHours: 140,
    totalSessions: 11,
    passingGrade: 80,
    coverImageUrl: '/images/flyers/otomotif_flyer.jpg',
    description: `Mencetak mekanik otomotif spesialis kendaraan tambang 4WD (Light Vehicle / Hilux / Land Cruiser) dan armada truk diesel. Siswa dilatih mendiagnosis kelistrikan mobil dengan scanner OBD-II, perbaikan mesin diesel Common Rail, transmisi 4x4, serta sistem suspensi medan berat.`,
    syllabus: `• Modul 01: K3 Bengkel Otomotif, Penggunaan Car Lift & Penanganan Bahan Mudah Terbakar
• Modul 02: Prinsip Kerja Mesin Bensin & Mesin Diesel Direct Injection Common Rail
• Modul 03: Prosedur Tune-Up, Penggantian Oli, Filter Bahan Bakar & Pengecekan Kompresi
• Modul 04: Sistem Pemindah Tenaga: Kopling, Transmisi Manual/Otomatis & Transfercase 4WD
• Modul 05: Overhaul Gardan (Differential), As Roda & Sistem Penggerak Empat Roda
• Modul 06: Sistem Rem Hidrolik, ABS, & Perawatan Suspensi Heavy Duty Offroad
• Modul 07: Kelistrikan Bodi, Starter, Alternator & Diagnosa Scanner Sensor Injeksi
• Modul 08: Ujian Praktik Troubleshooting Mobil Tambang Standar BNSP Teknisi Otomotif`,
    requirements: [
      'Talent Kabupaten Mimika berpendidikan minimal SMK Otomotif / Mesin atau SMA sederajat.',
      'Pria/Wanita usia 18 s/d 32 tahun.',
      'Memiliki SIM C atau SIM A.',
      'Sehat jasmani dan memiliki ketertarikan mendalam pada bidang mekanik kendaraan.'
    ],
    targetSkills: [
      { name: 'Perawatan & Troubleshooting Mesin Diesel Common Rail', level: 'Level 2 KKNI' },
      { name: 'Servis Sistem Penggerak 4WD (Four-Wheel Drive)', level: 'Mekanik LV Tambang' },
      { name: 'Diagnosis Kelistrikan Mobil dengan Scanner OBD-II', level: 'Standar Industri' }
    ],
    batch: {
      batchName: 'Gelombang I - Mekanik Mobil Tambang 4x4 2026 (APBD)',
      batchNumber: 1,
      quota: 25,
      fundingType: 'GRATIS_APBD_MIMIKA',
      trainingMethod: 'NON_BOARDING',
      welfareBenefits: DEFAULT_BENEFITS,
      registrationStart: new Date('2026-09-01'),
      registrationEnd: new Date('2026-10-23'),
      trainingStart: new Date('2026-11-02'),
      trainingEnd: new Date('2026-12-07'),
      isOpen: true,
      venueAddress: 'Workshop Otomotif Mobil BLK Mimika, SP2 Timika'
    }
  }
];

async function main() {
  console.log('--- SEEDING 10 KATEGORI / SEKTOR LENGKAP DENGAN FLYER RESMI ---');

  const adminUser = await prisma.user.findFirst({
    where: { role: 'DISNAKER_ADMIN' }
  });

  if (!adminUser) {
    throw new Error('User DISNAKER_ADMIN tidak ditemukan di database.');
  }

  let provider = await prisma.trainingProvider.findFirst({
    where: { accreditation: 'TERAKREDITASI_A' }
  });

  if (!provider) {
    provider = await prisma.trainingProvider.findFirst();
  }

  console.log(`Menggunakan Author: ${adminUser.email} & Provider: ${provider ? provider.institutionName : 'Disnaker Mimika'}`);

  for (const prog of PROGRAMS_DATA) {
    const { batch, ...programData } = prog;

    let existingProg = await prisma.trainingProgram.findFirst({
      where: { programCode: programData.programCode }
    });

    if (existingProg) {
      console.log(`[UPDATE] Program ${programData.category}: ${programData.title}`);
      existingProg = await prisma.trainingProgram.update({
        where: { id: existingProg.id },
        data: {
          ...programData,
          status: 'PUBLISHED',
          approvalStatus: 'APPROVED',
          providerId: provider ? provider.id : null,
          createdBy: adminUser.id
        }
      });
    } else {
      console.log(`[CREATE] Program ${programData.category}: ${programData.title}`);
      existingProg = await prisma.trainingProgram.create({
        data: {
          ...programData,
          status: 'PUBLISHED',
          approvalStatus: 'APPROVED',
          providerId: provider ? provider.id : null,
          createdBy: adminUser.id
        }
      });
    }

    // Buat atau update Batch untuk program ini
    const existingBatch = await prisma.trainingBatch.findFirst({
      where: {
        programId: existingProg.id,
        batchName: batch.batchName
      }
    });

    if (existingBatch) {
      console.log(`  -> [UPDATE BATCH] ${batch.batchName}`);
      await prisma.trainingBatch.update({
        where: { id: existingBatch.id },
        data: {
          ...batch,
          isOpen: true
        }
      });
    } else {
      console.log(`  -> [CREATE BATCH] ${batch.batchName}`);
      await prisma.trainingBatch.create({
        data: {
          ...batch,
          programId: existingProg.id
        }
      });
    }
  }

  console.log('--- SEEDING SELESAI: 10 SEKTOR TELAH TERSEDIA LENGKAP DENGAN POSTER FLYER RESMI! ---');
}

main()
  .catch((e) => {
    console.error('Error saat seeding 10 sektor:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
