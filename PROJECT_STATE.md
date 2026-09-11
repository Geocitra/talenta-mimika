# MIMIKA TALENTA: PROJECT STATE & SSOT LOCK
**Dokumen Single Source of Truth (SSOT) Arsitektur & Pelacakan Status Proyek**  
**Tanggal Update:** 7 September 2026  
**Status:** Unified Master Architecture Locked 🔒  

---

## 1. Dokumen Arsitektur Aktif (Single Source of Truth)
Seluruh diagram usang telah dipindahkan ke folder `/archive/`. Arsitektur resmi proyek ini hanya merujuk pada dua file master berikut:
1. **[MASTER_ERD.mmd](file:///C:/Users/PC/Documents/Dev/talenta/Dokumen%20Rancangan%20Pengembangan/MASTER_ERD.mmd)**:
   * Diagram Relasi Entitas Terpadu (Unified ERD) yang menggabungkan Master Data Akun, Reverse Recruitment Sourcing, dan Subsistem Pelatihan Bertingkat (LMS).
   * Telah mengadopsi mitigasi Gap Arsitektural: kolom `target_skills` (JSONB) pada `TRAINING_PROGRAMS` dan metadata sertifikasi digital (`certificate_number`, `certificate_url`, `qr_code_hash`) pada `TRAINING_ENROLLMENTS`.
2. **[MASTER_FLOWCHART.mmd](file:///C:/Users/PC/Documents/Dev/talenta/Dokumen%20Rancangan%20Pengembangan/MASTER_FLOWCHART.mmd)**:
   * Alur Kerja Sistem Terpadu (Unified Flowchart) yang mendefinisikan interaksi 3 aktor: Talenta Pasif, Pemberi Kerja Aktif, dan Disnaker sebagai Fasilitator/Auditor.
   * Menegaskan siklus tertutup (*The Closed-Loop Synergy*): Kelulusan pelatihan secara otomatis menginjeksi keahlian ke profil talenta dan mendongkrak skor AI Matching di radar industri.

---

## 2. Status Implementasi Proyek Saat Ini

```
[MODUL 1: NAKER DATA HUB] ──────────────────────────> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 1.1: Core Auth, OTP & Cookie Session    ──> LULUS (test_harness.ps1)
  ├── Micro 1.2: Talent Profile & Completeness      ──> LULUS (test_talent_detailed_profile.ps1)
  ├── Micro 1.3: Employer Legal Profile (NIB OSS)   ──> LULUS (test_employer_profile.ps1)
  └── Micro 1.4: Job Vacancy Publishing & Fuzzy     ──> LULUS (test_job_vacancy.ps1)

[MODUL 2: TALENT MATCHING & SOURCING ENGINE] ────────> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 2.1: Two-Sided AI Matchmaker Engine     ──> LULUS (test_matching_engine.ps1 & test_matchmaker_flow.ps1)
  │              • Formula 4-Vektor: Skill 35%, Exp 30%, Edu 20%, DNA 15%
  │              • Afirmasi Fuzzy Vokasi (SMK Jam Terbang Tinggi = 90% Edukasi)
  │              • Talent Availability Sovereignty (Anti-Locking: isAvailable Tetap Aktif)
  │              • Kompensasi Fleksibel/Opsional (Kompetitif / Negosiasi)
  ├── Micro 2.2: Employer Candidate Discovery UI    ──> LULUS (Next.js 16 Routes, 4-Vector Breakdown Grid)
  ├── Micro 2.3: Approach Action & Hand-off         ──> LULUS (test_approach_action.ps1 & Browser E2E)
  ├── Micro 2.4: Vacancy Lifecycle & TTL Engine     ──> LULUS (test_matchmaker_lifecycle.ps1 8/8)
  │              • Masa Tayang Terbatas 14/30 Hari (Default TTL) & Auto-Expiration
  │              • Permenaker 18/2024 Outcome Gatekeeper (1-Klik Resolusi Hasil Rekrutmen)
  │              • 4 Outcome Action: HIRED_INTERNAL, HIRED_EXTERNAL, CANCELLED, EXTEND_TTL
  └── Micro 2.5: Swiss-Style Architectural Top Nav  ──> LULUS (Zero-Sidebar, Fluid Full-Width max-w-7xl)

[MODUL 3: SKILL & TRAINING UPSKILLING ENGINE] ───────> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 3.1 (1.3.1): Skema Prisma & Migrasi DB LMS ──> LULUS (Migration 20260907043843)
  ├── Micro 3.2 (1.3.2): Backend LMS Progression,      ──> LULUS (test_lms_progressive.ps1 10/10)
  │                      Quiz Engine & Auto-Inject Skill
  └── Micro 3.3 (1.3.3): Frontend Next.js (Ruang Kelas ──> LULUS (Next.js 10 Routes & Browser E2E)
                         Interaktif, Pemutar Materi, & Ujian)

[MODUL 4: EXECUTIVE COMMAND CENTER & REGIONAL ANALYTICS] ──> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 4.1 (1.4.1): Backend Analytics Engine & API  ──> LULUS (test_command_center.ps1 3/3)
  └── Micro 4.2 (1.4.2): Frontend Visual Command Center   ──> LULUS (Next.js 11 Routes & Browser E2E)
[MODUL 1.4: SKILLHUB MIMIKA (LMS RECONSTRUCTION & VOCATIONAL MARKETPLACE)] ──> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 1.4.1: Pondasi Database & Onboarding Provider (Tier-1 Audit) ──> LULUS (test_provider_onboarding.ps1)
  │                • Gerbang Registrasi 3 Pintu & Profil Legalitas VIN/BNSP
  │                • Verifikasi Disnakertrans Tier-1 (PENDING -> APPROVED / REJECTED)
  ├── Micro 1.4.2: Studio Program & Kurasi Kurikulum Tier-2 Disnaker    ──> LULUS (test_program_studio_curation.ps1)
  │                • Pembuatan Kurikulum & Pokok Bahasan Silabus
  │                • Pembukaan Gelombang Batch Cohort (Boarding/MTU, Uang Saku, Kuota Kursi)
  │                • Meja Kurasi Tier-2 Disnaker (APPROVED -> PUBLISHED)
  ├── Micro 1.4.3: Mesin Pendaftaran, WA Hand-Off & Bulk Auto-Skill      ──> LULUS (test_bulk_graduation_injection.ps1)
  │                • Pendaftaran Batch Cohort & Validasi Kuota Transaksional
  │                • WhatsApp Outreach Engine (Strict Hand-off Paradigm)
  │                • Meja Kelulusan Massal & Auto-Numbering Sertifikat Resmi
  │                • The Closed-Loop Synergy: Atomic Auto-Skill Injection ke Profil & Radar AI
  └── Micro 1.4.4: Antarmuka Visual Skillhub Marketplace (Next.js 16)    ──> LULUS (Turbopack Build 20/20 Routes)
                   • Header Ikon 10 Rumpun Kejuruan (Gaya Kemnaker RI)
                   • Sidebar Filter Multi-Kriteria (Delivery, Metode, Biaya, Sertifikat)
                   • Swiss-Style Card Grid Program Transparan
                   • Modal Detail Program 4 Tab (Tentang, Penyelenggara, Batch, Dampak AI)
                   • Modal Pendaftaran & Direct Hand-Off WhatsApp

========================================================================================
GRAND STATUS: SELURUH FASE 1 (CONNECT & DATA SERVICES) 100% SELESAI & TERVERIFIKASI! 🏆🔒
========================================================================================
```

---

## 3. Invarian Domain & Aturan Desain Wajib
1. **Paradigma Reverse Recruitment:**
   * Talenta berstatus pasif setelah pengisian data portofolio satu kali (*One-Stop Profiling*).
   * Tidak ada tombol "Lamar Lowongan", penumpukan berkas, atau chatting di dalam aplikasi.
   * Batas sistem (*Strict Hand-off*): Selesai saat kontak dibuka dan pendekatan dicatat. Wawancara dilakukan di dunia nyata.
2. **Aturan Antarmuka (Swiss-Style Architectural UI):**
   * **Zero-Rounded (`rounded-none`):** Tidak ada elemen membulat (`* { border-radius: 0px !important; }`).
   * **No Nested Boxes:** Tampilan datar (*flat*), pembatas tipis (*hairline dividers*), kontras ruang putih (*whitespace*).
   * **Tipografi:** Google Font Roboto dengan hierarki tegas.
   * **Ikonografi:** Pustaka ikon murni SVG dari `lucide-react` (Zero keyboard emojis).
3. **Keamanan & Transaksi:**
   * JWT sesi HttpOnly Cookie (`credentials: 'include'`).
   * Integritas data transaksional ACID di PostgreSQL melalui Prisma ORM.
   * Compound unique constraint pada pendekatan (`@@unique([vacancyId, talentId])`) untuk menjamin sifat idempoten.
