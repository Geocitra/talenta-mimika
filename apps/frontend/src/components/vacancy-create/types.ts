import {
  ShieldCheck,
  Car,
  Coffee,
  TrendingUp,
  Phone,
  HeartHandshake,
  CalendarCheck,
  Bus,
  Home,
  FileCheck,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

export interface BenefitOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const JOB_BENEFIT_OPTIONS: BenefitOption[] = [
  { key: 'BPJS_LENGKAP', label: 'BPJS Naker & Kesehatan Penuh', icon: ShieldCheck },
  { key: 'TUNJANGAN_TRANSPORT', label: 'Tunjangan Transport / Bensin', icon: Car },
  { key: 'TUNJANGAN_MAKAN', label: 'Uang Makan / Konsumsi Kerja', icon: Coffee },
  { key: 'BONUS_INSENTIF', label: 'Bonus Kinerja, Insentif & Komisi', icon: TrendingUp },
  { key: 'TUNJANGAN_KOMUNIKASI', label: 'Tunjangan Pulsa / Komunikasi', icon: Phone },
  { key: 'ASURANSI_KESEHATAN', label: 'Asuransi Kesehatan Tambahan', icon: HeartHandshake },
  { key: 'CUTI_TAHUNAN', label: 'Cuti Tahunan & Libur Resmi', icon: CalendarCheck },
  { key: 'BUS_JEMPUTAN', label: 'Bus / Kendaraan Antar-Jemput', icon: Bus },
  { key: 'MESS_AKOMODASI', label: 'Mess / Tempat Tinggal Karyawan', icon: Home },
];

export const INTERNSHIP_BENEFIT_OPTIONS: BenefitOption[] = [
  { key: 'BPJS_MAGANG', label: 'Perlindungan Asuransi BPJS (JKK & JKM)', icon: ShieldCheck },
  { key: 'SERTIFIKAT_INDUSTRI', label: 'Sertifikat Resmi Pemagangan Industri', icon: FileCheck },
  { key: 'MENTOR_DEDIKASI', label: 'Bimbingan Mentor Profesional', icon: HeartHandshake },
  { key: 'MAKAN_SIANG', label: 'Uang Makan / Konsumsi Harian', icon: Coffee },
  { key: 'TUNJANGAN_TRANSPORT', label: 'Bantuan Transportasi / Uang Jalan', icon: Bus },
  { key: 'FAST_TRACK_HIRING', label: 'Prioritas Rekrutmen Karyawan Tetap', icon: Sparkles },
];

export function formatNumberWithDots(val: number | string): string {
  if (!val && val !== 0) return '';
  const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseDotsToNumber(str: string): number {
  const cleaned = str.replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function parseDotsToNumberOrUndefined(str?: string): number | undefined {
  if (!str) return undefined;
  const cleaned = str.replace(/\D/g, '');
  if (!cleaned) return undefined;
  const num = parseInt(cleaned, 10);
  return num > 0 ? num : undefined;
}

export const LOCAL_STORAGE_DRAFT_KEY = 'mimika_talenta_vacancy_draft_v1';

export interface VacancyStepItem {
  id: number;
  title: string;
  shortTitle: string;
  caption: string;
  description: string;
  isComplete: () => boolean;
}
