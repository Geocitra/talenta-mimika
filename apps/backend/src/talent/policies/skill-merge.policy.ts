export interface SkillRecord {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  isLmsVerified?: boolean;
  certificateNumber?: string;
  verifiedAt?: string;
}

/**
 * Pure Fabrication & Information Expert Domain Policy
 * Menangani penggabungan deterministik keahlian mandiri dengan keahlian terverifikasi LMS.
 * 
 * Invarian Bisnis:
 * 1. Keahlian yang bertanda `isLmsVerified: true` (hasil kelulusan pelatihan resmi Disnakertrans)
 *    TIDAK BOLEH dihapus atau diturunkan validitasnya oleh form pembaruan mandiri warga.
 * 2. Keahlian mandiri (self-declared) bebas ditambah, diubah level kemahirannya, atau dihapus sewaktu-waktu.
 * 3. Jika warga menginput nama keahlian yang sama dengan keahlian terverifikasi LMS,
 *    identitas verifikasi LMS dan nomor sertifikat tetap dipertahankan.
 */
export class SkillMergePolicy {
  static mergeSkills(
    existingSkills: SkillRecord[],
    incomingSkills: SkillRecord[],
  ): SkillRecord[] {
    // 1. Ambil seluruh keahlian resmi LMS yang sudah ada di database
    const lmsVerifiedSkills = (Array.isArray(existingSkills) ? existingSkills : []).filter(
      (s) => s && s.isLmsVerified === true,
    );

    // Map untuk menampung hasil gabungan unik berbasis nama keahlian (case-insensitive)
    const mergedMap = new Map<string, SkillRecord>();

    // 2. Masukkan keahlian input baru talenta (default: self-declared / isLmsVerified: false)
    if (Array.isArray(incomingSkills)) {
      for (const skill of incomingSkills) {
        if (!skill || !skill.name || typeof skill.name !== 'string') continue;
        const normalizedKey = skill.name.trim().toLowerCase();
        if (!normalizedKey) continue;

        mergedMap.set(normalizedKey, {
          name: skill.name.trim(),
          level: skill.level || 'INTERMEDIATE',
          isLmsVerified: false,
        });
      }
    }

    // 3. Timpa/kunci dengan keahlian resmi LMS (Immutable Overwrite Protection)
    for (const lmsSkill of lmsVerifiedSkills) {
      if (!lmsSkill || !lmsSkill.name) continue;
      const key = lmsSkill.name.trim().toLowerCase();
      const userAttempt = mergedMap.get(key);

      mergedMap.set(key, {
        name: lmsSkill.name.trim(),
        // Jika talenta mengklaim EXPERT sementara LMS INTERMEDIATE, atau sebaliknya,
        // pertahankan level LMS resmi atau level tertinggi, dan kunci verifikasi LMS
        level: lmsSkill.level || userAttempt?.level || 'INTERMEDIATE',
        isLmsVerified: true,
        certificateNumber: lmsSkill.certificateNumber,
        verifiedAt: lmsSkill.verifiedAt,
      });
    }

    return Array.from(mergedMap.values());
  }
}
