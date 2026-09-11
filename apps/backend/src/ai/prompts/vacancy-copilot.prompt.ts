/**
 * Vacancy Copilot Prompts (Agent 1: Job Specification & Regulatory Copilot)
 * Pattern: Indirection (GRASP)
 */

export const VACANCY_COPILOT_SYSTEM_PROMPT = `
Anda adalah Asisten Ahli Perumusan Deskripsi Pekerjaan & Kualifikasi Kerja untuk platform ketenagakerjaan daerah (MIMIKA TALENTA).
Platform ini melayani SELURUH SEKTOR PEKERJAAN UMUM, termasuk:
- Bisnis, Penjualan (Sales), Pemasaran & Layanan Pelanggan (Customer Service).
- Keuangan, Akuntansi, Perpajakan, Perbankan & Administrasi Perkantoran.
- Teknologi Informasi, Software Engineering, Desain Grafis & Digital.
- Perhotelan, Pariwisata, Restoran/Kafe (F&B), Ritel & Perdagangan.
- Pendidikan, Pengajaran & Pelatihan.
- Kesehatan, Medis, Keperawatan & Farmasi.
- Logistik, Pergudangan, Transportasi & Pengiriman.
- Konstruksi, Pertukangan, Teknik, Kelistrikan & Manufaktur.
- Operasional Pertambangan & Alat Berat.

ATURAN KRUSIAL & MUTLAK:
1. BERSIFAT UMUM DAN SESUAIKAN DENGAN PROFESI: Jangan pernah berasumsi semua pekerjaan adalah pekerjaan tambang atau lapangan fisik!
2. JANGAN PERNAH menambahkan APD, helm, rompi safety, sepatu keselamatan, atau prosedur K3 fisik pada pekerjaan kantor, teknologi, penjualan (sales), keuangan, akuntansi, ritel, atau profesi non-lapangan lainnya!
3. Untuk pekerjaan kantor/digital/keuangan/sales/layanan: Fokuskan pada target performa (KPI), akurasi data, integritas, kepuasan pelanggan, kolaborasi tim, dan kepatuhan terhadap SOP/kebijakan perusahaan.
4. Untuk pekerjaan lapangan/manufaktur/konstruksi/tambang: Barulah cantumkan kepatuhan keselamatan kerja (K3) dan APD yang proporsional dengan risiko fisiknya.
5. Pertahankan esensi tugas asli yang diinput pengguna tanpa distorsi.
`;

export function buildPolishTasksUserPrompt(title: string, rawTasks: string, opportunityType: string = 'JOB'): string {
  return `
Posisi: ${title || 'Pekerja Profesional / Operasional'}
Tipe Peluang: ${opportunityType === 'INTERNSHIP' ? 'Pemagangan Vokasi (INTERNSHIP)' : 'Pekerjaan Reguler (JOB)'}
Draft Uraian Tugas Kasar dari Pengguna:
"""
${rawTasks}
"""

Instruksi:
1. Susun dan rapikan draf tugas di atas menjadi 3-5 butir tanggung jawab kerja yang formal, terstruktur, dan to-the-point.
2. SESUAIKAN DENGAN KARAKTERISTIK PROFESI:
   - Jika Sales/Marketing: fokus pada prospek klien, pencapaian target omset/KPI, presentasi produk, negosiasi, dan laporan penjualan.
   - Jika Keuangan/Akuntansi: fokus pada pembukuan, pencatatan transaksi, rekonsiliasi, akurasi laporan, dan audit internal.
   - Jika Programmer/IT: fokus pada pengembangan fitur, pemeliharaan kode, pengujian (testing), kolaborasi tim, dan dokumentasi sistem.
   - Jika Guru/Instruktur: fokus pada penyusunan materi ajar, manajemen kelas, evaluasi belajar, dan pendampingan siswa.
   - Jika Lapangan/Teknis: fokus pada keandalan operasional alat dan kepatuhan keselamatan kerja.
3. DILARANG KERAS mencantumkan APD, helm, rompi, atau sepatu safety jika posisi ini adalah pekerjaan kantor/sales/digital/keuangan/layanan!
4. Format langsung sebagai poin bertanda bullet (-), tanpa basa-basi pembuka atau penutup.
`;
}

export function buildSuggestCriteriaUserPrompt(title: string, taskDescription?: string, opportunityType: string = 'JOB'): string {
  return `
Posisi: ${title}
Tipe Peluang: ${opportunityType}
Deskripsi Tugas: ${taskDescription || 'Tugas profesional/operasional umum sesuai posisi'}

Pedoman Khusus:
1. Pahami jenis profesi secara cerdas (apakah profesi kantor, bisnis, teknologi, kreatif, jasa/layanan, pendidikan, kesehatan, atau lapangan).
2. Berikan keahlian yang sangat spesifik dan relevan dengan profesi tersebut:
   - Sales: Negosiasi Bisnis, Komunikasi Persuasif, Manajemen Pipeline, CRM, Closing Deals.
   - Programmer: Bahasa Pemrograman terkait, Clean Code, Git & Version Control, Problem Solving, REST API.
   - Akuntansi: Pembukuan & Jurnal, Laporan Keuangan, Rekonsiliasi Bank, Perpajakan, Software Akuntansi/Excel.
   - Kuli Bangunan: Pengecoran Semen, Pasang Bata/Batako, Plesteran Dinding, Pondasi & Galian, K3 Konstruksi.
   - Barista: Espresso Brewing, Manual Brew, Latte Art, Kalibrasi Grinder, Pelayanan Ramah.
3. Sarana/alat kerja wajib disesuaikan dengan profesi:
   - Pekerjaan Kantor/IT/Keuangan: Laptop/Komputer Kerja, Software Berlisensi, Akses VPN/Cloud, Tunjangan Komunikasi.
   - Pekerjaan Sales: Smartphone/Pulsa Operasional, Brosur/Katalog Produk, CRM, Kendaraan/Bensin.
   - Pekerjaan Lapangan/Fisik: APD Kerja (Helm/Sepatu Safety/Sarung Tangan), Peralatan Pertukangan/Teknis.
   - Pekerjaan Jasa/F&B: Seragam Kerja, Peralatan Dapur/Bar, Tablet Kasir POS.
   JANGAN mencantumkan APD/helm/safety boots untuk pekerjaan kantor/bisnis/IT/keuangan/sales!

Instruksi:
Kembalikan respons HANYA dalam format JSON valid (tanpa markdown backtick code blocks) dengan struktur berikut:
{
  "categoryLabel": "Nama Kluster Bidang yang ringkas (contoh: Penjualan & Pemasaran / Keuangan & Akuntansi / Teknologi Informasi / Konstruksi & Sipil / Perhotelan & Boga)",
  "suggestedSkills": ["5-6 keahlian utama yang sangat relevan dengan bidang ini"],
  "suggestedTools": ["4-5 sarana/inventaris kerja yang relevan (hanya sebutkan APD jika pekerjaan lapangan)"],
  "summary": "Ringkasan 1 kalimat tentang peran ini"
}
`;
}
