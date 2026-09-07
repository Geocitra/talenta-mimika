/**
 * Text Sanitizer & Similarity Utility (Pure Fabrication)
 * Membersihkan noise input pelamar: awalan jenjang (S1/D3), akhiran institusi/kota,
 * simbol liar, serta menghitung kesamaan semantik (Trigram & Levenshtein).
 */

export class TextSanitizer {
  // Awalan gelar / jenjang / istilah administrasi yang sering diketik warga
  private static readonly PREFIX_REGEX =
    /\b(s-?1|s-?2|s-?3|d-?1|d-?2|d-?3|d-?4|sarjana|magister|doktor|diploma\s*[1-4]?|strata\s*[1-3]?|jurusan|prodi|program\s*studi|bidang|keahlian)\b/gi;

  // Akhiran nama kampus / kota yang sering ditempelkan pelamar di kolom jurusan
  private static readonly SUFFIX_REGEX =
    /\b(ugm|ui|itb|its|ipb|uncen|unipa|unhas|unair|undip|unpad|uns|uny|ub|usu|unsrat|poltek|politeknik|stie|stkip|stt|timika|mimika|jayapura|papua|jakarta|bandung|surabaya|yogyakarta|jogja|semarang|makassar)\b/gi;

  /**
   * Membersihkan teks liar dari awalan gelar, akhiran kampus, dan karakter non-alfanumerik
   */
  static sanitizeMajorInput(rawInput: string): string {
    if (!rawInput) return '';

    let cleaned = rawInput.trim();

    // 1. Hapus awalan gelar/jenjang (misal: "s1 teknik mesin" -> "teknik mesin")
    cleaned = cleaned.replace(this.PREFIX_REGEX, ' ');

    // 2. Hapus akhiran nama kampus/kota (misal: "teknik nuklir ugm" -> "teknik nuklir")
    cleaned = cleaned.replace(this.SUFFIX_REGEX, ' ');

    // 3. Hapus karakter liar kecuali huruf, angka, spasi, tanda kurung, garis miring, dan ampersand
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s/&()-]/g, ' ');

    // 4. Bersihkan spasi berlebih
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // 5. Ubah ke Title Case yang rapi (misal: "TEKNIK ALAT BERAT" -> "Teknik Alat Berat")
    return this.toTitleCase(cleaned);
  }

  /**
   * Konversi string ke Title Case
   */
  static toTitleCase(str: string): string {
    if (!str) return '';
    const smallWords = new Set(['dan', 'di', 'ke', 'dari', '&', 'of', 'in']);

    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index > 0 && smallWords.has(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Menghitung Levenshtein Distance antara dua string
   */
  static levenshteinDistance(a: string, b: string): number {
    const s1 = a.toLowerCase();
    const s2 = b.toLowerCase();
    const m = s1.length;
    const n = s2.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0),
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Ekstraksi Trigram dari string
   */
  private static getTrigrams(str: string): Set<string> {
    const s = `  ${str.toLowerCase()}  `;
    const trigrams = new Set<string>();
    for (let i = 0; i < s.length - 2; i++) {
      trigrams.add(s.substring(i, i + 3));
    }
    return trigrams;
  }

  /**
   * Menghitung Trigram Similarity (Sørensen–Dice Coefficient on Trigrams)
   * Rentang nilai: 0.0 (tidak ada kesamaan) hingga 1.0 (identik sempurna)
   */
  static trigramSimilarity(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a.toLowerCase() === b.toLowerCase()) return 1.0;

    const triA = this.getTrigrams(a);
    const triB = this.getTrigrams(b);

    let intersection = 0;
    for (const t of triA) {
      if (triB.has(t)) intersection++;
    }

    const total = triA.size + triB.size;
    if (total === 0) return 0;
    return (2.0 * intersection) / total;
  }

  /**
   * Menghitung skor kemiripan gabungan (Composite Similarity Score)
   * Menggabungkan Normalized Levenshtein (bobot 40%), Trigram (bobot 60%),
   * serta memeriksa kesamaan pada level segmen / sub-frasa (split by &, /, dan).
   */
  static computeSimilarity(strA: string, strB: string): number {
    if (!strA || !strB) return 0;
    const a = strA.trim().toLowerCase();
    const b = strB.trim().toLowerCase();

    if (a === b) return 1.0;

    // Evaluator helper
    const evalPair = (s1: string, s2: string): number => {
      const maxLen = Math.max(s1.length, s2.length);
      const levDist = this.levenshteinDistance(s1, s2);
      const levScore = maxLen > 0 ? 1.0 - levDist / maxLen : 0;
      const triScore = this.trigramSimilarity(s1, s2);

      let bonus = 0;
      if (s1.includes(s2) || s2.includes(s1)) {
        bonus = 0.15;
      }

      return 0.4 * levScore + 0.6 * triScore + bonus;
    };

    // 1. Skor perbandingan string penuh
    let bestScore = evalPair(a, b);

    // 2. Jika b adalah nama gabungan (misal: "Akuntansi & Keuangan Lembaga"),
    // pecah ke segmen-segmen utamanya dan bandingkan dengan a
    const segments = b.split(/[/&]|(\bdan\b)/).map((s) => (s ? s.trim() : '')).filter((s) => s.length >= 3);
    for (const seg of segments) {
      const segScore = evalPair(a, seg);
      if (segScore > bestScore) {
        bestScore = segScore;
      }
    }

    return Math.min(1.0, Math.max(0, bestScore));
  }
}
