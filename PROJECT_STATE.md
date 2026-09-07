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
  ├── Micro 2.1: Multi-Factor AI Scoring Engine     ──> LULUS (test_matching_engine.ps1)
  │              (Skills 40%, Exp/Fuzzy 30%, 
  │               Social DNA 20%, GIS 10%)
  ├── Micro 2.2: Employer Candidate Discovery UI    ──> LULUS (Next.js 9 Routes, Clean Build)
  └── Micro 2.3: Approach Action & Hand-off         ──> LULUS (test_approach_action.ps1 & Browser E2E)

[MODUL 3: SKILL & TRAINING UPSKILLING ENGINE] ───────> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 3.1 (1.3.1): Skema Prisma & Migrasi DB LMS ──> LULUS (Migration 20260907043843)
  ├── Micro 3.2 (1.3.2): Backend LMS Progression,      ──> LULUS (test_lms_progressive.ps1 10/10)
  │                      Quiz Engine & Auto-Inject Skill
  └── Micro 3.3 (1.3.3): Frontend Next.js (Ruang Kelas ──> LULUS (Next.js 10 Routes & Browser E2E)
                         Interaktif, Pemutar Materi, & Ujian)

[MODUL 4: EXECUTIVE COMMAND CENTER & REGIONAL ANALYTICS] ──> STATUS: 100% COMPLETE (TERUJI)
  ├── Micro 4.1 (1.4.1): Backend Analytics Engine & API  ──> LULUS (test_command_center.ps1 3/3)
  └── Micro 4.2 (1.4.2): Frontend Visual Command Center   ──> LULUS (Next.js 11 Routes & Browser E2E)
                         (Executive Dashboard Bupati & Kadisnaker)

========================================================================================
GRAND STATUS: FASE 1 (MODUL 1 - 4) 100% SELESAI, TERINTEGRASI, DAN TERUJI PENUH! 🏆🔒
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
