/**
 * Offer & Outreach Drafter Prompts (Agent 3: Personalized Offer & Outreach Drafter)
 * Pattern: Indirection (GRASP)
 */

export const OFFER_DRAFTER_SYSTEM_PROMPT = `
Anda adalah Perancang Surat Penawaran Resmi (Employment Proposal Drafter) resmi terintegrasi dengan platform ketenagakerjaan daerah MIMIKA TALENTA.
Dalam paradigma Reverse Recruitment Mimika Talenta, perusahaan yang secara aktif mendatangi dan menyodorkan penawaran kerja resmi kepada talenta terpilih.

Prinsip Komunikasi:
1. Menghargai martabat talenta: Tulis dengan nada profesional, hangat, transparan, dan meyakinkan.
2. Anti-Penipuan Loker: Tegaskan identitas resmi perusahaan (NIB), nama PIC HRD, rincian kompensasi riil, dan jaminan fasilitas kesejahteraan (mess, makan, transport, dll).
3. Call to Action: Mengundang talenta untuk memverifikasi dan menyetujui jadwal sesi tatap muka/verifikasi berkas di Mimika.
`;

export function buildOfferDraftUserPrompt(payload: {
  talentName: string;
  companyName: string;
  nib?: string;
  positionTitle: string;
  opportunityType: string;
  compensationText: string;
  benefits: string[];
  workTools: string[];
  workZone: string;
  picName?: string;
  picPhone?: string;
}): string {
  return `
Data Penawaran Kerja:
- Nama Talenta: ${payload.talentName}
- Nama Perusahaan: ${payload.companyName} (NIB: ${payload.nib || 'Terverifikasi Disnaker'})
- PIC HRD: ${payload.picName || 'Tim HR Rekrutmen'} (No. Kontak: ${payload.picPhone || '-'})
- Posisi: ${payload.positionTitle} [${payload.opportunityType}]
- Kompensasi: ${payload.compensationText}
- Fasilitas: ${payload.benefits.join(', ') || 'Standar Operasional'}
- Sarana Alat Kerja Disediakan: ${payload.workTools.join(', ') || 'Standar Perusahaan'}
- Zona Penempatan: ${payload.workZone}

Instruksi:
Kembalikan respons HANYA dalam format JSON valid (tanpa markdown backtick code blocks) dengan struktur:
{
  "officialLetterDraft": "Teks lengkap Surat Penawaran Resmi (3-4 paragraf) yang rapi, transparan, dan siap dicetak/dilihat di dasbor talenta.",
  "whatsAppOutreachDraft": "Teks pesan WhatsApp singkat (150-250 kata) dari PIC HRD ke talenta, menyebutkan posisi, gaji, fasilitas, dan tautan verifikasi, dengan nada sopan dan resmi."
}
`;
}
