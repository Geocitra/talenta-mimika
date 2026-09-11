/**
 * PiiSanitizerUtil - UU PDP No. 27/2022 Protection Layer
 * Pattern: Protected Variations (GRASP)
 * 
 * Bertanggung jawab melakukan sanitasi dan masking identitas personal (PII)
 * sebelum data dikirim ke LLM API pihak ketiga (OpenAI).
 */

export class PiiSanitizerUtil {
  /**
   * Masking string teks dari NIK, nomor telepon, dan email
   */
  static sanitizeText(text: string): string {
    if (!text) return '';

    return text
      // Masking NIK (16 digit angka berurutan)
      .replace(/\b\d{16}\b/g, '[REDACTED_NIK]')
      // Masking Nomor Telepon Indonesia (+62 / 08xx xxxx xxxx)
      .replace(/(\+62|62|0)8[1-9][0-9]{6,11}\b/g, '[REDACTED_PHONE]')
      // Masking Email
      .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');
  }

  /**
   * Mengubah profil talenta menjadi profil kompetensi abstrak tanpa identitas pribadi
   */
  static sanitizeTalentProfile(talent: any): Record<string, any> {
    if (!talent) return {};

    const workExperience = Array.isArray(talent.workExperience)
      ? talent.workExperience.map((w: any) => ({
          position: w.position,
          durationMonths: w.durationMonths,
          description: this.sanitizeText(w.description || ''),
        }))
      : [];

    const education = Array.isArray(talent.education)
      ? talent.education.map((e: any) => ({
          degree: e.degree,
          major: e.major,
          graduationYear: e.graduationYear,
        }))
      : [];

    const skills = (Array.isArray(talent.skills) ? talent.skills : []).map((s: any) =>
      typeof s === 'string' ? s : s.name || '',
    );

    const certifications = (Array.isArray(talent.certifications) ? talent.certifications : []).map(
      (c: any) => (typeof c === 'string' ? c : c.name || ''),
    );

    const socialDna = talent.socialDna && typeof talent.socialDna === 'object'
      ? {
          workPreferences: talent.socialDna.workPreferences,
          communityActivities: this.sanitizeText(talent.socialDna.communityActivities || ''),
        }
      : {};

    return {
      skills,
      education,
      workExperience,
      certifications,
      socialDna,
      locationZone: talent.locationLat && talent.locationLng ? 'TIMIKA_KABUPATEN' : 'MIMIKA',
    };
  }
}
