export interface StepItem {
  id: number;
  title: string;
  shortTitle: string;
  caption: string;
  description: string;
  isComplete: () => boolean;
}

export const INDUSTRY_SECTORS = [
  'Pertambangan & Pengolahan Energi',
  'Jasa Konstruksi, Alat Berat & Sipil',
  'Transportasi, Logistik & Pergudangan',
  'Perdagangan Besar, Eceran & Ritel',
  'Jasa Keuangan, Asuransi & Perbankan',
  'Perhotelan, Restoran & Pariwisata',
  'Kesehatan, Farmasi & Laboratorium',
  'Agribisnis, Perkebunan & Perikanan',
  'Pendidikan, Pelatihan & Riset',
  'Teknologi Informasi & Komunikasi',
  'Jasa Keamanan & Pengamanan',
  'Manufaktur & Fabrikasi',
  'Lainnya',
];

export const COMPANY_SIZES = [
  { value: 'SCALE_1_10', label: '1 - 10 Karyawan (Usaha Mikro)', median: 5 },
  { value: 'SCALE_11_50', label: '11 - 50 Karyawan (Usaha Kecil)', median: 30 },
  { value: 'SCALE_51_200', label: '51 - 200 Karyawan (Usaha Menengah)', median: 125 },
  { value: 'SCALE_201_500', label: '201 - 500 Karyawan (Usaha Menengah-Besar)', median: 350 },
  { value: 'SCALE_501_1000', label: '501 - 1.000 Karyawan (Usaha Skala Besar)', median: 750 },
  { value: 'SCALE_OVER_1000', label: '> 1.000 Karyawan (Korporasi)', median: 2500 },
];

export const MIMIKA_PRESETS = [
  { label: 'Timika Kota', lat: -4.5445, lng: 136.8872 },
  { label: 'Kuala Kencana', lat: -4.4312, lng: 136.8835 },
  { label: 'Portsite Pomako', lat: -4.7921, lng: 136.9015 },
  { label: 'Highland Tembagapura', lat: -4.1374, lng: 137.1128 },
];
