// Kontrak Data Talenta (Pencari Kerja) - Wajib dipatuhi oleh BE dan FE!
export interface TalentProfileDto {
    id: string;
    fullName: string;
    birthDate: string; // Format: YYYY-MM-DD
    profileCompletenessScore: number;
    isActivelySeeking: boolean;
    skills: string[]; // Daftar keahlian
}

export type UserRole = 'TALENT' | 'EMPLOYER' | 'DISNAKER_ADMIN' | 'EXECUTIVE' | 'SUPERADMIN';

// 1. Kontrak data kiriman saat registrasi dasar (User Akun)
export interface RegisterUserDto {
    email: string;
    password_hash: string;
    role: 'TALENT' | 'EMPLOYER';
}

// 2. Kontrak data profil minimal saat pertama kali Talenta mendaftar
export interface CreateTalentProfileDto {
    fullName: string;
    birthDate: string; // Format: YYYY-MM-DD
}

// 3. Kontrak data profil minimal saat Perusahaan mendaftar
export interface CreateEmployerProfileDto {
    nib: string; // Nomor Induk Berusaha wajib dari OSS
    companyName: string;
}

// ============================================================
// MICRO 1.2: TALENT DETAILED PROFILE CONTRACTS
// ============================================================
export interface EducationItem {
    institution: string;
    degree: string; // misal: SMK, D3, S1, SMA
    major: string;             // Nama jurusan resmi/bersih yang tampil di profil
    rawMajorInput?: string;    // Teks asli yang diketik warga (jejak audit)
    isAiNormalized?: boolean;  // Penanda bahwa teks hasil koreksi cerdas
    aiConfidence?: number;     // Skor keyakinan normalisasi AI (0 - 1.0)
    graduationYear: number;
}

export interface WorkExperienceItem {
    companyName: string;
    position: string;
    employmentType?: 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'PART_TIME' | 'FREELANCE';
    durationValue?: number;
    durationUnit?: 'BULAN' | 'TAHUN';
    durationMonths: number;
    description: string;
}

export interface SkillItem {
    name: string; // misal: "Operator Excavator", "Welding 3G", "K3 Pertambangan"
    level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export interface CertificationItem {
    id: string;
    name: string; // misal: "Ahli K3 Umum Kemnaker", "Welder 6G ASME", "SIO Excavator"
    issuer: string; // misal: "Kemnaker RI", "BNSP", "Kementerian ESDM"
    issueYear?: string;
    expiryYear?: string;
    credentialId?: string;
    fileName?: string;
    originalName?: string;
    fileUrl?: string;
    fileSize?: number;
}

export interface SocialDnaDto {
    organizations?: string; // Keterlibatan Organisasi / Komunitas di Mimika
    portfolioUrl?: string; // Tautan Portofolio / LinkedIn / GitHub / Profil Publik
    workPreferences?: string[]; // misal: ["Siap Shift Malam", "Siap Remote Area"]
    preferredLocation?: string; // misal: "Kabupaten Mimika (Highland/Lowland)"
    communityActivities?: string; // Aktivitas sosial / organisasi di Mimika
    workHabitsNotes?: string;
}

export interface UpdateTalentProfileDto {
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    education?: EducationItem[];
    workExperience?: WorkExperienceItem[];
    skills?: SkillItem[];
    certifications?: CertificationItem[];
    socialDna?: SocialDnaDto;
    isAvailable?: boolean;
}

// ============================================================
// MICRO 1.3: EMPLOYER CORPORATE PROFILE & VERIFICATION
// ============================================================
export interface UpdateEmployerProfileDto {
    companyName?: string;
    industrySector?: string;
    employeeCount?: number;
    address?: string;
    locationLat?: number;
    locationLng?: number;
    companyBio?: string;
}

export interface VerifyEmployerDto {
    status: 'APPROVED' | 'REJECTED';
    notes?: string;
}

export interface EmployerProfileResponseDto {
    id: string;
    nib: string;
    companyName: string;
    industrySector?: string;
    employeeCount?: number;
    address?: string;
    locationLat?: number;
    locationLng?: number;
    companyBio?: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    verifiedBy?: string;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// MICRO 1.4: JOB VACANCY PUBLISHING CONTRACTS
// ============================================================
export type VacancyStatus = 'OPEN' | 'CLOSED';

export interface CreateJobVacancyDto {
    title: string;
    taskDescription: string;
    projectDuration: string;
    requiredSkills: string[];
    minEducation: string;
    minExperienceYears: number;
    allowEquivalence?: boolean;
    jobLocationLat?: number;
    jobLocationLng?: number;
}

export interface UpdateJobVacancyDto {
    title?: string;
    taskDescription?: string;
    projectDuration?: string;
    requiredSkills?: string[];
    minEducation?: string;
    minExperienceYears?: number;
    allowEquivalence?: boolean;
    jobLocationLat?: number;
    jobLocationLng?: number;
    status?: VacancyStatus;
}

export interface JobVacancyResponseDto {
    id: string;
    employerId: string;
    title: string;
    taskDescription: string;
    projectDuration: string;
    requiredSkills: string[];
    minEducation: string;
    minExperienceYears: number;
    allowEquivalence: boolean;
    jobLocationLat?: number;
    jobLocationLng?: number;
    status: VacancyStatus;
    createdAt: string;
    updatedAt: string;
    employer?: {
        companyName: string;
        industrySector?: string;
        address?: string;
    };
}

// ============================================================
// MICRO 2.1: CANDIDATE MATCHING & AI SCORING CONTRACTS
// ============================================================
export interface CandidateMatchingBreakdown {
  skillMatchScore: number;       // Bobot 40%
  experienceMatchScore: number;  // Bobot 30%
  socialDnaMatchScore: number;   // Bobot 20%
  distanceMatchScore: number;    // Bobot 10%
  distanceKm?: number;
  isFuzzyEquivalenceApplied: boolean;
}

export interface CandidateRecommendationDto {
  talentId: string;
  fullName: string;
  nik: string;
  phone?: string;
  overallScore: number;          // 0 - 100%
  breakdown: CandidateMatchingBreakdown;
  aiReasoning: string;           // Penjelasan transparan dari AI
  topSkills: string[];
  totalExperienceMonths: number;
  lastEducationDegree: string;
  isApproached: boolean;
}

export interface RankedCandidatesResponseDto {
  status: string;
  vacancyId: string;
  vacancyTitle: string;
  totalEvaluated: number;
  candidates: CandidateRecommendationDto[];
}

// ==========================================
// KONTRAK DATA: SKILL & TRAINING LMS (MODUL 1.3)
// ==========================================
export type TrainingDeliveryMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type TrainingCategory = 
  | 'K3_PERTAMBANGAN' 
  | 'ALAT_BERAT' 
  | 'WELDING' 
  | 'MEKANIK' 
  | 'DIGITAL_IT' 
  | 'LOGISTIK' 
  | 'HOSPITALITY';

export type TrainingProgramStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type TrainingEnrollmentStatus = 'ENROLLED' | 'ONGOING' | 'COMPLETED' | 'FAILED';
export type QuizType = 'CHECKPOINT' | 'FINAL_EXAM';
export type SessionContentType = 'VIDEO' | 'TEXT_ARTICLE' | 'DOCUMENT_PDF';

export interface TargetSkillDto {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export interface CreateTrainingProgramDto {
  title: string;
  providerName?: string;
  deliveryMode: TrainingDeliveryMode;
  category: TrainingCategory;
  description: string;
  syllabus?: string;
  quota?: number;
  passingGrade?: number;
  targetSkills: TargetSkillDto[];
  startDate?: string;
  endDate?: string;
}

export interface CreateTrainingSessionDto {
  sessionOrder: number;
  title: string;
  contentType: SessionContentType;
  contentBody: string;
  hasCheckpointQuiz?: boolean;
}

export interface QuizQuestionDto {
  questionOrder: number;
  questionText: string;
  options: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]
  correctAnswer: string; // "A"
  explanation?: string;
}

export interface SubmitQuizAnswerDto {
  answers: Record<string, string>; // { "questionId": "A", ... }
}

export interface TrainingProgramResponseDto {
  id: string;
  title: string;
  providerName: string;
  deliveryMode: TrainingDeliveryMode;
  category: TrainingCategory;
  description: string;
  totalSessions: number;
  passingGrade: number;
  targetSkills: TargetSkillDto[];
  status: TrainingProgramStatus;
  quota?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// ==========================================
// KONTRAK DATA: EXECUTIVE COMMAND CENTER (MODUL 1.4)
// ==========================================
export interface CommandCenterKpiDto {
  totalTalents: number;              // Total Angkatan Kerja Terdata
  activeSeekingTalents: number;      // Pencari Kerja Aktif Siap Kerja
  totalEmployers: number;            // Perusahaan Terakreditasi Resmi (APPROVED)
  openVacancies: number;             // Lowongan Aktif
  totalApproaches: number;           // Total Aksi Pendekatan Industri
  totalTrainingParticipants: number; // Peserta Pelatihan Aktif
  totalCertifiedGraduates: number;   // Lulusan Tersertifikasi
  localAbsorptionRate: number;       // Rasio Serapan / Pendekatan (%)
}

export interface FunnelStepDto {
  stage: string;   // 'Angkatan Kerja Terdata', 'Peserta Pelatihan', 'Lulusan Tersertifikasi', 'Didekati Industri'
  count: number;
}

export interface SkillGapItemDto {
  skillName: string;
  demandCount: number;  // Jumlah dicari industri (lowongan)
  supplyCount: number;  // Jumlah dimiliki warga (talenta)
  gap: number;          // Selisih kekurangan (Demand - Supply)
  status: 'SURPLUS' | 'BALANCE' | 'CRITICAL_GAP';
}

export interface IndustryDistributionDto {
  sector: string;       // Sektor Usaha (e.g. 'Pertambangan', 'Logistik')
  companyCount: number;
  percentage: number;
}

export interface ActivityFeedItemDto {
  id: string;
  type: 'APPROACH' | 'VACANCY' | 'GRADUATION' | 'COMPANY_VERIFIED';
  title: string;
  description: string;
  timestamp: string;
}

export interface CommandCenterResponseDto {
  kpis: CommandCenterKpiDto;
  funnel: FunnelStepDto[];
  skillGaps: SkillGapItemDto[];
  industryDistribution: IndustryDistributionDto[];
  recentActivities: ActivityFeedItemDto[];
}

// ==========================================
// KONTRAK DATA: TAKSONOMI JURUSAN & KARANTINA
// ==========================================
export interface MasterMajorDto {
  id: string;
  name: string;
  category: string;
}

export interface MajorSuggestionDto {
  id: string;
  suggestedName: string;
  aiNormalizedName?: string;
  inferredCategory?: string;
  inputCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sampleInputs: string[];
  createdAt: string;
}

export interface NormalizeMajorResultDto {
  originalInput: string;
  sanitizedInput: string;
  suggestedCanonical?: string;
  category?: string;
  hasCorrection: boolean;
  confidence: number;
}

// ==========================================
// KONTRAK DATA: MASTER KEAHLIAN (SKILLS TAXONOMY)
// ==========================================
export interface MasterSkillDto {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt?: string;
}

export interface UserManagementItemDto {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  displayName?: string;
}