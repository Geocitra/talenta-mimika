require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SEED_MAJORS = [
  // RUMPUN TEKNIK ALAT BERAT & PERTAMBANGAN (PRIORITAS MIMIKA)
  { name: 'Teknik Alat Berat', category: 'TEKNIK_ALAT_BERAT' },
  { name: 'Teknik Mesin', category: 'TEKNIK_MANUFAKTUR' },
  { name: 'Teknik Pengelasan (Welding)', category: 'TEKNIK_MANUFAKTUR' },
  { name: 'Teknik Otomotif Kendaraan Ringan', category: 'TEKNIK_OTOMOTIF' },
  { name: 'Teknik Pertambangan', category: 'TEKNIK_TAMBANG' },
  { name: 'Teknik Geologi & Eksplorasi', category: 'TEKNIK_GEOLOGI' },
  { name: 'Teknik Elektro / Ketenagalistrikan', category: 'TEKNIK_ELEKTRO' },
  { name: 'Teknik Sipil & Bangunan Konstruksi', category: 'TEKNIK_SIPIL' },
  { name: 'Teknik Lingkungan & K3 Tambang', category: 'K3_PERTAMBANGAN' },
  { name: 'Teknik Pendingin & Tata Udara', category: 'TEKNIK_MESIN' },
  { name: 'Teknik Pemeliharaan Mesin Industri', category: 'TEKNIK_MANUFAKTUR' },

  // RUMPUN TEKNOLOGI INFORMASI & KOMUNIKASI
  { name: 'Teknik Informatika / Ilmu Komputer', category: 'TEKNOLOGI_INFORMASI' },
  { name: 'Sistem Informasi', category: 'TEKNOLOGI_INFORMASI' },
  { name: 'Rekayasa Perangkat Lunak (RPL)', category: 'TEKNOLOGI_INFORMASI' },
  { name: 'Teknik Komputer & Jaringan (TKJ)', category: 'TEKNOLOGI_INFORMASI' },
  { name: 'Multimedia & Desain Komunikasi Visual', category: 'KREATIF_DIGITAL' },

  // RUMPUN LOGISTIK, BISNIS & KEUANGAN
  { name: 'Akuntansi & Keuangan Lembaga', category: 'AKUNTANSI_BISNIS' },
  { name: 'Manajemen Operasional & Rantai Pasok', category: 'LOGISTIK_SUPPLY_CHAIN' },
  { name: 'Manajemen Bisnis', category: 'MANAJEMEN' },
  { name: 'Logistik & Pergudangan Site', category: 'LOGISTIK_SUPPLY_CHAIN' },
  { name: 'Administrasi Perkantoran', category: 'ADMINISTRASI' },
  { name: 'Pemasaran & Bisnis Digital', category: 'BISNIS_PEMASARAN' },

  // RUMPUN KESEHATAN & PELAYANAN
  { name: 'Kesehatan Masyarakat & Keselamatan Kerja (K3)', category: 'KESEHATAN_K3' },
  { name: 'Keperawatan', category: 'KESEHATAN' },
  { name: 'Farmasi', category: 'KESEHATAN' },
  { name: 'Perhotelan & Pariwisata', category: 'HOSPITALITY' },
  { name: 'Tata Boga & Kuliner Industri', category: 'HOSPITALITY' },

  // RUMPUN UMUM SMA / MA
  { name: 'MIPA (Matematika & Ilmu Pengetahuan Alam)', category: 'PENDIDIKAN_MENENGAH' },
  { name: 'IPS (Ilmu Pengetahuan Sosial)', category: 'PENDIDIKAN_MENENGAH' },
  { name: 'Bahasa & Budaya', category: 'PENDIDIKAN_MENENGAH' },
  { name: 'Kurikulum Merdeka (Umum)', category: 'PENDIDIKAN_MENENGAH' },

  // RUMPUN KHUSUS / TEKNIK LANJUTAN
  { name: 'Teknik Nuklir', category: 'TEKNIK_ENERGI' },
  { name: 'Teknik Kelautan & Perkapalan', category: 'TEKNIK_MARITIM' },
  { name: 'Teknik Geodesi & Geomatika', category: 'TEKNIK_GEOLOGI' },
  { name: 'Ilmu Hukum', category: 'HUKUM' },
];

async function seedMajors() {
  console.log('=== MEMULAI SEEDING 35+ RUMPUN JURUSAN MASTER MIMIKA ===');
  let count = 0;
  for (const m of SEED_MAJORS) {
    await prisma.masterMajor.upsert({
      where: { name: m.name },
      update: { category: m.category },
      create: { name: m.name, category: m.category },
    });
    count++;
  }
  console.log(`SUKSES! Berhasil mengunci ${count} Taksonomi Jurusan Master ke PostgreSQL!`);
}

seedMajors()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
