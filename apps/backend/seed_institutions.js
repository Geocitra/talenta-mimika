require('dotenv').config();
const { PrismaClient, InstitutionCategory } = require('@prisma/client');
const prisma = new PrismaClient();

const API_KEY = process.env.API_INDONESIA_KEY || 'aip_live_z88pfEJ0zAR8XbPpNCPPFbgGb82rnGwS';
const BASE_URL = process.env.API_INDONESIA_BASE_URL || 'https://use.apiindonesia.id/api/v1';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. DATASET PRIORITAS MIMIKA & PAPUA + KAMPUS UTAMA
const PRIORITY_INSTITUTIONS = [
  // Kampus Papua & Nasional Populer
  { externalId: 'ptn-uncen', name: 'Universitas Cenderawasih', shortName: 'UNCEN', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'PAPUA', regencyName: 'KOTA JAYAPURA' },
  { externalId: 'ptn-unipa', name: 'Universitas Papua', shortName: 'UNIPA', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'PAPUA BARAT', regencyName: 'KABUPATEN MANOKWARI' },
  { externalId: 'pts-poltek-mimika', name: 'Politeknik Amamapare Timika', shortName: 'POLTEK AMAMAPARE', category: InstitutionCategory.KAMPUS, status: 'PTS', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'pts-stie-jembatan-bulan', name: 'STIE Jembatan Bulan Timika', shortName: 'STIE JB', category: InstitutionCategory.KAMPUS, status: 'PTS', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'pts-stkiptimika', name: 'STKIP Surya Timika', shortName: 'STKIP SURYA', category: InstitutionCategory.KAMPUS, status: 'PTS', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'pts-stt-timika', name: 'Sekolah Tinggi Teologi Timika', shortName: 'STT TIMIKA', category: InstitutionCategory.KAMPUS, status: 'PTS', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'ptn-ui', name: 'Universitas Indonesia', shortName: 'UI', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA BARAT', regencyName: 'KOTA DEPOK' },
  { externalId: 'ptn-itb', name: 'Institut Teknologi Bandung', shortName: 'ITB', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA BARAT', regencyName: 'KOTA BANDUNG' },
  { externalId: 'ptn-ugm', name: 'Universitas Gadjah Mada', shortName: 'UGM', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'D.I. YOGYAKARTA', regencyName: 'KABUPATEN SLEMAN' },
  { externalId: 'ptn-its', name: 'Institut Teknologi Sepuluh Nopember', shortName: 'ITS', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA TIMUR', regencyName: 'KOTA SURABAYA' },
  { externalId: 'ptn-ipb', name: 'IPB University', shortName: 'IPB', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA BARAT', regencyName: 'KOTA BOGOR' },
  { externalId: 'ptn-unair', name: 'Universitas Airlangga', shortName: 'UNAIR', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA TIMUR', regencyName: 'KOTA SURABAYA' },
  { externalId: 'ptn-undip', name: 'Universitas Diponegoro', shortName: 'UNDIP', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA TENGAH', regencyName: 'KOTA SEMARANG' },
  { externalId: 'ptn-unhas', name: 'Universitas Hasanuddin', shortName: 'UNHAS', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'SULAWESI SELATAN', regencyName: 'KOTA MAKASSAR' },
  { externalId: 'ptn-unpad', name: 'Universitas Padjadjaran', shortName: 'UNPAD', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA BARAT', regencyName: 'KABUPATEN SUMEDANG' },
  { externalId: 'ptn-uny', name: 'Universitas Negeri Yogyakarta', shortName: 'UNY', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'D.I. YOGYAKARTA', regencyName: 'KOTA YOGYAKARTA' },
  { externalId: 'ptn-uns', name: 'Universitas Sebelas Maret', shortName: 'UNS', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA TENGAH', regencyName: 'KOTA SURAKARTA' },
  { externalId: 'ptn-ub', name: 'Universitas Brawijaya', shortName: 'UB', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'JAWA TIMUR', regencyName: 'KOTA MALANG' },
  { externalId: 'ptn-unsrat', name: 'Universitas Sam Ratulangi', shortName: 'UNSRAT', category: InstitutionCategory.KAMPUS, status: 'PTN', provinceName: 'SULAWESI UTARA', regencyName: 'KOTA MANADO' },

  // SMA Kabupaten Mimika & Papua Tengah
  { externalId: 'sma-mimika-001', name: 'SMA Negeri 1 Mimika', shortName: 'SMAN 1 MIMIKA', category: InstitutionCategory.SMA, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-002', name: 'SMA Negeri 2 Mimika', shortName: 'SMAN 2 MIMIKA', category: InstitutionCategory.SMA, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-003', name: 'SMA Negeri 3 Mimika', shortName: 'SMAN 3 MIMIKA', category: InstitutionCategory.SMA, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-taruna', name: 'SMA Taruna Papua Mimika', shortName: 'TARUNA PAPUA', category: InstitutionCategory.SMA, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-yppk', name: 'SMA YPPK Santo Thomas Aquino Timika', shortName: 'YPPK ST THOMAS', category: InstitutionCategory.SMA, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-yppgi', name: 'SMA YPPGI Timika', shortName: 'YPPGI TIMIKA', category: InstitutionCategory.SMA, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-al-falah', name: 'SMA Integral Hidayatullah Timika', shortName: 'SMA HIDAYATULLAH', category: InstitutionCategory.SMA, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-mimika-kuala-kencana', name: 'Sekolah Ciputra Kasih Timika', shortName: 'SCK TIMIKA', category: InstitutionCategory.SMA, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'sma-nabire-001', name: 'SMA Negeri 1 Nabire', shortName: 'SMAN 1 NABIRE', category: InstitutionCategory.SMA, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN NABIRE' },

  // SMK Kabupaten Mimika & Papua Tengah (Pusat Vokasi Ketenagakerjaan)
  { externalId: 'smk-mimika-001', name: 'SMK Negeri 1 Mimika (Teknologi & Rekayasa)', shortName: 'SMKN 1 MIMIKA', category: InstitutionCategory.SMK, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-mimika-002', name: 'SMK Negeri 2 Mimika (Pariwisata & Bisnis)', shortName: 'SMKN 2 MIMIKA', category: InstitutionCategory.SMK, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-mimika-003', name: 'SMK Negeri 3 Mimika (Teknologi Informasi)', shortName: 'SMKN 3 MIMIKA', category: InstitutionCategory.SMK, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-mimika-tunas-bangsa', name: 'SMK Tunas Bangsa Timika', shortName: 'SMK TUNAS BANGSA', category: InstitutionCategory.SMK, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-mimika-kesehatan', name: 'SMK Kesehatan Jayapura di Timika', shortName: 'SMK KESEHATAN TIMIKA', category: InstitutionCategory.SMK, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-mimika-filadelfia', name: 'SMK Filadelfia Timika', shortName: 'SMK FILADELFIA', category: InstitutionCategory.SMK, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-mimika-petra', name: 'SMK Petra Timika', shortName: 'SMK PETRA', category: InstitutionCategory.SMK, status: 'Swasta', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN MIMIKA' },
  { externalId: 'smk-nabire-001', name: 'SMK Negeri 1 Nabire', shortName: 'SMKN 1 NABIRE', category: InstitutionCategory.SMK, status: 'Negeri', provinceName: 'PAPUA TENGAH', regencyName: 'KABUPATEN NABIRE' },
];

async function seedPriorityDataset() {
  console.log(`\n[STEP 1] Menyimpan dataset prioritas lokal (${PRIORITY_INSTITUTIONS.length} institusi: Mimika, Papua & Kampus Top)...`);
  let count = 0;
  for (const inst of PRIORITY_INSTITUTIONS) {
    await prisma.masterInstitution.upsert({
      where: { externalId: inst.externalId },
      update: {
        name: inst.name,
        shortName: inst.shortName,
        category: inst.category,
        status: inst.status,
        provinceName: inst.provinceName,
        regencyName: inst.regencyName,
      },
      create: {
        externalId: inst.externalId,
        name: inst.name,
        shortName: inst.shortName,
        category: inst.category,
        status: inst.status,
        provinceName: inst.provinceName,
        regencyName: inst.regencyName,
      },
    });
    count++;
  }
  console.log(`  -> Berhasil menyimpan ${count} institusi prioritas langsung ke PostgreSQL!`);
}

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': API_KEY,
          'User-Agent': 'MimikaTalenta-Ingestion/1.0',
        },
      });

      if (res.status === 200) {
        return await res.json();
      }

      console.warn(`    [Attempt ${attempt}] API response status ${res.status}. Menunggu retry...`);
    } catch (err) {
      console.warn(`    [Attempt ${attempt}] Network error: ${err.message}. Retrying...`);
    }

    await sleep(attempt * 2500); // Exponential backoff: 2.5s, 5.0s, 7.5s
  }
  return null;
}

async function syncKampusFromApi() {
  console.log('\n[STEP 2] Memulai Ingestion Kampus dari API Indonesia (use.apiindonesia.id)...');
  let page = 1;
  let totalPages = 1;
  let synced = 0;

  // Lakukan request pertama untuk membaca total halaman
  const initialJson = await fetchWithRetry(`${BASE_URL}/kampus`);
  if (!initialJson || !initialJson.success) {
    console.warn('  -> API Indonesia sedang cooldown atau tidak merespons. Melewati sinkronisasi live.');
    return synced;
  }

  totalPages = initialJson.meta?.total_pages || 1;
  console.log(`  -> Terdeteksi total ${initialJson.meta?.total || 4622} kampus dalam ${totalPages} halaman.`);

  // Simpan data halaman 1
  for (const item of (initialJson.data || [])) {
    await prisma.masterInstitution.upsert({
      where: { externalId: String(item.id) },
      update: {
        name: item.name.trim(),
        shortName: item.short_name?.trim() || null,
        category: InstitutionCategory.KAMPUS,
        status: item.kelompok || null,
        provinceName: item.province_name || null,
        regencyName: item.regency_name || null,
      },
      create: {
        externalId: String(item.id),
        name: item.name.trim(),
        shortName: item.short_name?.trim() || null,
        category: InstitutionCategory.KAMPUS,
        status: item.kelompok || null,
        provinceName: item.province_name || null,
        regencyName: item.regency_name || null,
      },
    });
    synced++;
  }
  console.log(`  -> Halaman 1 tersimpan (${synced} kampus).`);

  // Iterasi halaman berikutnya dengan delay santun untuk menghormati rate limit
  for (page = 2; page <= totalPages; page++) {
    await sleep(1500); // 1.5s delay antar halaman
    const json = await fetchWithRetry(`${BASE_URL}/kampus?page=${page}`);
    if (!json || !json.data) {
      console.warn(`  -> Tidak dapat mengambil halaman ${page}. Berhenti di halaman ini.`);
      break;
    }

    for (const item of json.data) {
      await prisma.masterInstitution.upsert({
        where: { externalId: String(item.id) },
        update: {
          name: item.name.trim(),
          shortName: item.short_name?.trim() || null,
          category: InstitutionCategory.KAMPUS,
          status: item.kelompok || null,
          provinceName: item.province_name || null,
          regencyName: item.regency_name || null,
        },
        create: {
          externalId: String(item.id),
          name: item.name.trim(),
          shortName: item.short_name?.trim() || null,
          category: InstitutionCategory.KAMPUS,
          status: item.kelompok || null,
          provinceName: item.province_name || null,
          regencyName: item.regency_name || null,
        },
      });
      synced++;
    }

    if (page % 5 === 0 || page === totalPages) {
      console.log(`  -> Progress: Halaman ${page}/${totalPages} (${synced} total kampus tersinkronisasi)`);
    }
  }

  console.log(`  -> Selesai! Total ${synced} kampus tersimpan dari API Indonesia.`);
  return synced;
}

async function syncSekolahFromApi() {
  console.log('\n[STEP 3] Menarik Sekolah Resmi Mimika dari API Indonesia (/sekolah/search?q=mimika)...');
  await sleep(4000); // Hormati rate limit
  const json = await fetchWithRetry(`${BASE_URL}/sekolah/search?q=mimika`);
  if (!json || !json.data) {
    console.warn('  -> Tidak dapat mengambil data sekolah Mimika dari API Indonesia.');
    return 0;
  }

  let count = 0;
  for (const item of json.data) {
    if (item.jenis !== 'SMA' && item.jenis !== 'SMK') continue;

    const category = item.jenis === 'SMA' ? InstitutionCategory.SMA : InstitutionCategory.SMK;
    const externalId = item.npsn ? `npsn-${item.npsn}` : `sch-${item.name}`;

    await prisma.masterInstitution.upsert({
      where: { externalId },
      update: {
        name: item.name.trim(),
        category,
        status: item.status || null,
        provinceName: 'PAPUA TENGAH',
        regencyName: 'KABUPATEN MIMIKA',
      },
      create: {
        externalId,
        name: item.name.trim(),
        category,
        status: item.status || null,
        provinceName: 'PAPUA TENGAH',
        regencyName: 'KABUPATEN MIMIKA',
      },
    });
    count++;
  }
  console.log(`  -> Berhasil menyimpan/memperbarui ${count} SMA & SMK resmi ber-NPSN di Mimika!`);
  return count;
}

async function main() {
  console.log('================================================================');
  console.log('MIMIKA TALENTA - INSTITUTION REFERENCE DATA INGESTION ENGINE');
  console.log('================================================================');

  try {
    await seedPriorityDataset();
    await syncKampusFromApi();
    await syncSekolahFromApi();

    const totalInDb = await prisma.masterInstitution.count();
    const kampusCount = await prisma.masterInstitution.count({ where: { category: InstitutionCategory.KAMPUS } });
    const smaCount = await prisma.masterInstitution.count({ where: { category: InstitutionCategory.SMA } });
    const smkCount = await prisma.masterInstitution.count({ where: { category: InstitutionCategory.SMK } });

    console.log('\n================================================================');
    console.log('STATUS DATABASE MASTER INSTITUTION SETELAH INGESTION:');
    console.log(`Total Master Institusi: ${totalInDb}`);
    console.log(`- Kampus (Perguruan Tinggi): ${kampusCount}`);
    console.log(`- SMA (Sekolah Menengah Atas): ${smaCount}`);
    console.log(`- SMK (Sekolah Menengah Kejuruan): ${smkCount}`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Error selama proses seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
