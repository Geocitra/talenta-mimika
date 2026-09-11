/**
 * Guided Matching & Affirmative Reasoning Prompts (Agent 2: Qualitative Matcher & Affirmative Reasoning Agent)
 * Pattern: Indirection (GRASP)
 */

export const GUIDED_MATCHING_SYSTEM_PROMPT = `
Anda adalah Agen Evaluator Afirmasi Ketenagakerjaan Daerah Kabupaten Mimika (MIMIKA TALENTA).
Tugas Anda: Mengevaluasi kecocokan profil kandidat lokal terhadap kebutuhan lowongan kerja industri/pertambangan/operasional.

Pedoman Rubrik Afirmasi Daerah (The Guided Affirmative Rubric):
1. Prioritas Jam Terbang Lapangan: Jam terbang riil warga lokal di area proyek/tambang Mimika (Kuala Kencana, Grasberg, Portsite Pomako) bernilai lebih tinggi daripada gelar sarjana teoretis semata.
2. Afirmasi Vokasi: Lulusan SMK/D3 dengan pengalaman kerja langsung pada unit/alat serupa wajib diapresiasi setara kualifikasi formal.
3. Kepatuhan K3 & Pola Kerja: Perhatikan catatan kepatuhan K3, kesiapan kerja shift 24 jam, atau roster lapangan.

Instruksi Output:
Kembalikan respons HANYA dalam format JSON valid (tanpa markdown backtick code blocks) dengan struktur:
{
  "qualitativeScore": 88, // Angka 0-100 hasil pertimbangan kualitatif
  "reasoningSummary": "1-2 kalimat ringkasan tajam untuk HRD (contoh: 'Kandidat sangat direkomendasikan. Memiliki 6 tahun jam terbang pada unit excavator serupa di area tambang basah dan siap shift malam.')",
  "strengths": ["Poin keunggulan teknis utama kandidat"],
  "affirmationNote": "Catatan afirmasi lokal / pengakuan pengalaman lapangan"
}
`;

export function buildGuidedMatchingUserPrompt(payload: {
  vacancyTitle: string;
  opportunityType: string;
  taskDescription: string;
  requiredSkills: string[];
  workZone: string;
  workSchedule: string;
  talentProfile: {
    skills: string[];
    education: any[];
    workExperience: any[];
    certifications: string[];
    socialDna: any;
  };
}): string {
  const eduStr = payload.talentProfile.education
    .map((e) => `${e.degree} ${e.major} (${e.graduationYear})`)
    .join(', ') || 'Pendidikan SMA/SMK Sederajat';

  const expStr = payload.talentProfile.workExperience
    .map((w) => `${w.position} (${w.durationMonths} bln) - ${w.description}`)
    .join('; ') || 'Belum ada pengalaman formal / Fresh Graduate';

  return `
Kebutuhan Lowongan:
- Posisi: ${payload.vacancyTitle} [${payload.opportunityType}]
- Zona & Jadwal: ${payload.workZone} (${payload.workSchedule})
- Syarat Keahlian: ${payload.requiredSkills.join(', ')}
- Deskripsi Tugas: ${payload.taskDescription}

Profil Kompetensi Kandidat (PII Anonymized):
- Keahlian: ${payload.talentProfile.skills.join(', ') || '-'}
- Sertifikasi: ${payload.talentProfile.certifications.join(', ') || '-'}
- Pendidikan: ${eduStr}
- Rekam Jejak Pengalaman: ${expStr}
- Preferensi Kerja / Social DNA: ${(payload.talentProfile.socialDna?.workPreferences || []).join(', ') || '-'}

Instruksi:
Evaluasi kandidat ini dengan Rubrik Afirmasi Daerah Mimika dan kembalikan JSON sesuai format sistem.
`;
}
