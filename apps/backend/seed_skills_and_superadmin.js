const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SKILLS_CATALOG = [
  // 1. DIGITAL & TEKNOLOGI INFORMASI (IT & SOFTWARE)
  { name: 'Fullstack Developer', category: 'DIGITAL_IT', description: 'Pengembangan web end-to-end (Frontend & Backend)' },
  { name: 'Frontend Developer (React / Next.js)', category: 'DIGITAL_IT', description: 'Spesialis antarmuka pengguna interaktif dan responsif' },
  { name: 'Backend Developer (Node.js / NestJS / Go)', category: 'DIGITAL_IT', description: 'Perancangan API mikroarsitektur dan integrasi basis data' },
  { name: 'Mobile Application Developer (Flutter / React Native)', category: 'DIGITAL_IT', description: 'Pengembangan aplikasi mobile Android & iOS' },
  { name: 'DevOps & Cloud Engineer (AWS / Docker / Kubernetes)', category: 'DIGITAL_IT', description: 'Automasi CI/CD, deployment kontainer, dan infrastruktur cloud' },
  { name: 'Database Administrator (PostgreSQL / Redis)', category: 'DIGITAL_IT', description: 'Manajemen kueri, indexing, replikasi, dan keamanan data' },
  { name: 'UI/UX Designer (Figma / Design Systems)', category: 'DIGITAL_IT', description: 'Riset pengguna, pembuatan prototipe, dan arsitektur visual' },
  { name: 'Data Analyst (SQL / Python / PowerBI)', category: 'DIGITAL_IT', description: 'Analisis data analitik bisnis dan visualisasi metrik' },
  { name: 'Data Engineer (ETL / Apache Spark)', category: 'DIGITAL_IT', description: 'Rekayasa pipa transmisi data skala besar' },
  { name: 'Cybersecurity & Network Engineer (Cisco / MikroTik)', category: 'DIGITAL_IT', description: 'Pengamanan jaringan, firewall, routing, dan audit kerentanan' },
  { name: 'Artificial Intelligence & Machine Learning Specialist', category: 'DIGITAL_IT', description: 'Implementasi model deep learning, NLP, dan sistem pakar' },
  { name: 'QA Automation Engineer', category: 'DIGITAL_IT', description: 'Pengujian perangkat lunak terotomasi (Jest, Cypress, Playwright)' },
  { name: 'IT Technical Support & Hardware Specialist', category: 'DIGITAL_IT', description: 'Pemeliharaan perangkat keras, jaringan LAN, dan troubleshoot IT' },

  // 2. PERTAMBANGAN, ALAT BERAT & GEOLOGI (MINING & HEAVY EQUIPMENT)
  { name: 'Operator Excavator (PC200 / PC400 / PC2000)', category: 'TAMBANG_ALAT_BERAT', description: 'Pengoperasian excavator untuk pemindahan tanah dan batuan tambang' },
  { name: 'Operator Off-Highway Dump Truck (CAT 777 / 785)', category: 'TAMBANG_ALAT_BERAT', description: 'Pengemudi truk tambang pengangkut bijih dan overburden' },
  { name: 'Operator Bulldozer (CAT D85 / D375)', category: 'TAMBANG_ALAT_BERAT', description: 'Perataan lahan, ripping, dan pembuatan jalan tambang' },
  { name: 'Operator Motor Grader (CAT 14M / 16M)', category: 'TAMBANG_ALAT_BERAT', description: 'Perawatan permukaan haul road tambang' },
  { name: 'Operator Wheel Loader (CAT 980 / 992)', category: 'TAMBANG_ALAT_BERAT', description: 'Pemuatan material ore ke dump truck atau hopper crusher' },
  { name: 'Mekanik Alat Berat (Heavy Equipment Mechanic)', category: 'TAMBANG_ALAT_BERAT', description: 'Perawatan preventif dan perbaikan mesin diesel alat berat' },
  { name: 'Auto Electrician Alat Berat', category: 'TAMBANG_ALAT_BERAT', description: 'Troubleshooting kelistrikan dan wiring diagram unit alat berat' },
  { name: 'Juru Ukur Tambang (Mine Surveyor)', category: 'TAMBANG_ALAT_BERAT', description: 'Pemetaan topografi tambang menggunakan Total Station & Drone RTK' },
  { name: 'Juru Ledak Tambang Berlisensi (Blaster Kelas II/I)', category: 'TAMBANG_ALAT_BERAT', description: 'Pengeboran, pengisian bahan peledak (ANFO), dan blasting tambang' },
  { name: 'Pengawas Operasional Pertama (POP ESDM)', category: 'TAMBANG_ALAT_BERAT', description: 'Sertifikasi pengawasan teknis dan keselamatan operasional tambang' },
  { name: 'Ahli Geologi Tambang (Mine Geologist)', category: 'TAMBANG_ALAT_BERAT', description: 'Eksplorasi, log geologi inti bor, dan permodelan kadar bijih' },
  { name: 'Teknisi Pengolahan Mineral & Metalurgi (Ore Processing)', category: 'TAMBANG_ALAT_BERAT', description: 'Operasional flotation, SAG mill, ball mill pengolahan konsentrat' },
  { name: 'Operator Crusher Plant & Conveyor Belt', category: 'TAMBANG_ALAT_BERAT', description: 'Pengendalian mesin penghancur batu dan sistem conveyor' },
  { name: 'Rigger & Slinger Berlisensi Migas / Minerba', category: 'TAMBANG_ALAT_BERAT', description: 'Pemasangan ikatan tali kawat baja untuk pengangkatan beban berat' },

  // 3. PENGELASAN, PABRIKASI & MEKANIKAL (WELDING & FABRICATION)
  { name: 'Juru Las SMAW (Stick Welding) 3G / 4G Pelat', category: 'WELDING_FABRIKASI', description: 'Pengelasan posisi tegak dan di atas kepala standar struktural' },
  { name: 'Juru Las GTAW (TIG / Argon) 6G Pipa Bertekanan', category: 'WELDING_FABRIKASI', description: 'Kualifikasi pengelasan presisi pipa migas dan pembangkit' },
  { name: 'Juru Las GMAW / FCAW (MIG / CO2)', category: 'WELDING_FABRIKASI', description: 'Pengelasan pabrikasi baja konstruksi kecepatan tinggi' },
  { name: 'Pipe Fitter & Pemotong Oksi-Asetilen (Oxy-Cutting)', category: 'WELDING_FABRIKASI', description: 'Fabrikasi, perakitan sambungan pipa, dan beveling' },
  { name: 'Steel Fabricator & Asembling Konstruksi Baja', category: 'WELDING_FABRIKASI', description: 'Pemotongan, pembentukan, dan perakitan struktur baja portal' },
  { name: 'Scaffolder Bersertifikat Kemnaker / BNSP', category: 'WELDING_FABRIKASI', description: 'Pemasangan dan pembongkaran perancah pipa scaffolding aman' },
  { name: 'Inspektur Pengelasan (Welding Inspector CSWIP / BNSP)', category: 'WELDING_FABRIKASI', description: 'Pemeriksaan visual (VT), penetrant test (PT), dan radiografi las' },
  { name: 'Operator Bubut & Milling Mesin Perkakas Konvensional/CNC', category: 'WELDING_FABRIKASI', description: 'Pembuatan suku cadang logam presisi sesuai gambar teknik' },

  // 4. KELISTRIKAN, INSTRUMENTASI & ENERGI (ELECTRICAL & POWER)
  { name: 'Teknisi Listrik Industri (Industrial Electrician)', category: 'ELEKTRIKAL', description: 'Instalasi panel daya 3-fase, transformator, dan genset kapasitas MW' },
  { name: 'Teknisi Instrumentasi & Kontrol Otomasi PLC (Siemens / Allen-Bradley)', category: 'ELEKTRIKAL', description: 'Kalibrasi transmitter, sensor pneumatik, dan pemrograman PLC/SCADA' },
  { name: 'Teknisi Pendingin & Tata Udara Industri (HVAC / Chiller)', category: 'ELEKTRIKAL', description: 'Perawatan sistem pendingin udara ruang kontrol dan warehouse' },
  { name: 'Drafter AutoCAD / BIM Arsitektur & Elektrikal', category: 'ELEKTRIKAL', description: 'Penyusunan gambar kerja 2D/3D as-built drawing teknis' },
  { name: 'Operator Pembangkit Listrik (Power Plant Operator)', category: 'ELEKTRIKAL', description: 'Pengawasan genset diesel PLTD dan distribusi gardu induk' },

  // 5. KESELAMATAN KERJA, LINGKUNGAN & KESEHATAN (K3 SAFETY & HEALTH)
  { name: 'Ahli K3 Umum (AK3U Kemnaker)', category: 'K3_SAFETY', description: 'Audit kepatuhan SMK3, investigasi kecelakaan, dan izin kerja aman (JSA)' },
  { name: 'Ahli K3 Pertambangan & Pengendalian Resiko Lapangan', category: 'K3_SAFETY', description: 'Identifikasi bahaya tambang (HIRADC) dan inspeksi kelayakan K3' },
  { name: 'Paramedis Lapangan & Petugas Pertolongan Pertama (First Aider)', category: 'K3_SAFETY', description: 'Tanggap darurat medis, evakuasi korban, dan CPR bersertifikat' },
  { name: 'Petugas Pemadam Kebakaran Industri (Industrial Firefighter)', category: 'K3_SAFETY', description: 'Penanganan insiden kebakaran dan pengoperasian armada fire truck' },
  { name: 'Pengawas Pengelolaan Limbah Bahan Berbahaya & Beracun (B3)', category: 'K3_SAFETY', description: 'Manifest limbah B3, penanganan spill, dan baku mutu lingkungan' },
  { name: 'Pengendali Lingkungan Hidup & Reklamasi Tambang', category: 'K3_SAFETY', description: 'Penataan lahan bekas tambang, pembibitan (nursery), dan revegetasi' },

  // 6. LOGISTIK, SUPPLY CHAIN, BISNIS & ADMINISTRASI
  { name: 'Operator Forklift Berlisensi SIO Kemnaker', category: 'LOGISTIK_ADMIN', description: 'Pengangkutan palet material di gudang logistik dan staging area' },
  { name: 'Manajemen Pergudangan & Kontrol Inventori (Warehouse Specialist)', category: 'LOGISTIK_ADMIN', description: 'Pencatatan stok FIFO, stock opname, dan manajemen sistem WMS' },
  { name: 'Staf Pengadaan Barang & Jasa (Procurement & Purchasing)', category: 'LOGISTIK_ADMIN', description: 'Negosiasi vendor, pembuatan PO, dan manajemen rantai pasok lokal' },
  { name: 'Akuntansi Keuangan & Perpajakan (Brevet A/B)', category: 'LOGISTIK_ADMIN', description: 'Penyusunan jurnal umum, laporan laba rugi, neraca, dan faktur pajak' },
  { name: 'Administrasi Sumber Daya Manusia & Penggajian (HR & Payroll)', category: 'LOGISTIK_ADMIN', description: 'Pengelolaan absensi, klaim BPJS Ketenagakerjaan, dan rekrutmen staf' },
  { name: 'Sekretaris Eksekutif & Manajemen Arsip Digital', category: 'LOGISTIK_ADMIN', description: 'Korespondensi kedinasan, notulensi rapat, dan pengelolaan dokumen' },
  { name: 'Petugas Keamanan Lapangan Berlisensi (Gada Pratama)', category: 'LOGISTIK_ADMIN', description: 'Pengamanan pos jaga aset vital, pemeriksaan pengunjung, dan patroli' },

  // 7. KONSTRUKSI, BANGUNAN & PEKERJAAN SIPIL
  { name: 'Pekerjaan Adukan Semen & Pengecoran', category: 'KONSTRUKSI_SIPIL', description: 'Pencampuran agregat beton, slump test, dan pengecoran struktur bangunan' },
  { name: 'Pemasangan Batu Bata, Batako & Hebel', category: 'KONSTRUKSI_SIPIL', description: 'Pemasangan dinding bata presisi, leveling benang, dan spesi adukan' },
  { name: 'Pekerjaan Pondasi & Galian Tanah', category: 'KONSTRUKSI_SIPIL', description: 'Penggalian parit, pemasangan batu kali, dan pemadatan tanah pondasi' },
  { name: 'Plesteran Dinding & Acian Halus', category: 'KONSTRUKSI_SIPIL', description: 'Perataan permukaan dinding, pembuatan kepalaan plester, dan acian halus' },
  { name: 'K3 Konstruksi & Pekerjaan Sipil', category: 'KONSTRUKSI_SIPIL', description: 'Penerapan keselamatan kerja konstruksi, APD proyek, dan pencegahan bahaya jatuh' },
  { name: 'Pemasangan Bekisting & Pembesian', category: 'KONSTRUKSI_SIPIL', description: 'Pemotongan, pembengkokan besi tulangan, dan perakitan bekisting kayu/besi' },
  { name: 'Tukang Kayu Konstruksi & Plafon', category: 'KONSTRUKSI_SIPIL', description: 'Pemasangan rangka kayu/hollow, kusen pintu/jendela, dan plafon gypsum' },
  { name: 'Pengecatan Bangunan & Finishing Arsitektur', category: 'KONSTRUKSI_SIPIL', description: 'Aplikasi cat dinding interior/eksterior, waterproofing, dan finishing permukaan' },

  // 8. KEAMANAN, PENGAMANAN & SATPAM (SECURITY)
  { name: 'Gada Pratama / Gada Madya Bersertifikat', category: 'KEAMANAN_SECURITY', description: 'Kualifikasi kepolisian dasar/madya untuk petugas pengamanan profesional' },
  { name: 'Patroli Area & Pengawasan Akses Masuk', category: 'KEAMANAN_SECURITY', description: 'Pemeriksaan ID card, buku mutasi jaga, dan ronda pos perimeter fasilitas' },
  { name: 'Pengendalian Situasi Darurat & K3', category: 'KEAMANAN_SECURITY', description: 'Prosedur evakuasi tanggap darurat bencana, huru-hara, dan first response K3' },
  { name: 'Pengoperasian CCTV & Pemantauan Monitor', category: 'KEAMANAN_SECURITY', description: 'Monitoring surveillance multi-layar, playback rekaman, dan deteksi anomali' },
  { name: 'Pemeriksaan Kendaraan & Manajemen Tamu', category: 'KEAMANAN_SECURITY', description: 'Inspeksi bagasi, cermin kolong (under-vehicle search), dan registrasi tamu' },
  { name: 'Pengamanan Aset Vital & Pengawalan', category: 'KEAMANAN_SECURITY', description: 'Protokol perlindungan aset strategis industri dan pengawalan pengangkutan barang berharga' },
];

async function main() {
  console.log('--- 1. MENYIAPKAN TAKSONOMI MASTER KEAHLIAN (SKILLS) ---');
  let insertedSkills = 0;
  for (const skill of SKILLS_CATALOG) {
    await prisma.masterSkill.upsert({
      where: { name: skill.name },
      update: {
        category: skill.category,
        description: skill.description,
      },
      create: {
        name: skill.name,
        category: skill.category,
        description: skill.description,
      },
    });
    insertedSkills++;
  }
  console.log(`Berhasil menyematkan ${insertedSkills} master keahlian industri ke tabel master_skills.`);

  console.log('\n--- 2. MENYIAPKAN AKUN DEFAULT SUPERADMIN ---');
  const superadminEmail = 'superadmin@mimika.go.id';
  const superadminPass = 'SuperAdminMimika2026!';
  const passwordHash = await bcrypt.hash(superadminPass, 10);

  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      role: 'SUPERADMIN',
      passwordHash: passwordHash,
      isVerified: true,
    },
    create: {
      email: superadminEmail,
      passwordHash: passwordHash,
      role: 'SUPERADMIN',
      isVerified: true,
    },
  });

  console.log(`Akun Superadmin siap:`);
  console.log(`- Email    : ${superadmin.email}`);
  console.log(`- Role     : ${superadmin.role}`);
  console.log(`- Password : ${superadminPass}`);

  const totalSkills = await prisma.masterSkill.count();
  console.log(`\nTotal Keahlian di Database: ${totalSkills}`);
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
