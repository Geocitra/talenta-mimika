// Kontrak Data Talenta (Pencari Kerja) - Wajib dipatuhi oleh BE dan FE!
export interface TalentProfileDto {
    id: string;
    fullName: string;
    birthDate: string; // Format: YYYY-MM-DD
    profileCompletenessScore: number;
    isActivelySeeking: boolean;
    skills: string[]; // Daftar keahlian
}

export type UserRole = 'TALENT' | 'EMPLOYER' | 'TRAINING_PROVIDER' | 'DISNAKER_ADMIN' | 'EXECUTIVE' | 'SUPERADMIN';

// 1. Kontrak data kiriman saat registrasi dasar (User Akun)
export interface RegisterUserDto {
    email: string;
    password_hash: string;
    role: 'TALENT' | 'EMPLOYER' | 'TRAINING_PROVIDER';
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
    isLmsVerified?: boolean; // Terverifikasi resmi oleh program pelatihan daerah (LMS)
    certificateNumber?: string; // Nomor sertifikat resmi
    verifiedAt?: string; // Waktu verifikasi ISO string
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
    lastUpdatedAt?: string; // OCC Guard: Timestamp versi profil saat dimuat di form client
}

// ============================================================
// MICRO 1.3: EMPLOYER CORPORATE PROFILE & VERIFICATION
// ============================================================
export type CompanySize =
  | 'SCALE_1_10'
  | 'SCALE_11_50'
  | 'SCALE_51_200'
  | 'SCALE_201_500'
  | 'SCALE_501_1000'
  | 'SCALE_OVER_1000';

export interface UpdateEmployerProfileDto {
  companyName?: string;
  brandName?: string;
  industrySector?: string;
  companySize?: CompanySize;
  employeeCount?: number;
  address?: string;
  locationLat?: number;
  locationLng?: number;
  companyBio?: string;
  websiteUrl?: string;
  npwpNumber?: string;
  logoUrl?: string;
  nibDocUrl?: string;
  picName?: string;
  picRole?: string;
  picPhone?: string;
  picEmail?: string;
}

export interface VerifyEmployerDto {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface EmployerProfileResponseDto {
  id: string;
  nib: string;
  companyName: string;
  brandName?: string;
  logoUrl?: string;
  nibDocUrl?: string;
  npwpNumber?: string;
  picName?: string;
  picRole?: string;
  picPhone?: string;
  picEmail?: string;
  industrySector?: string;
  companySize: CompanySize;
  employeeCount?: number;
  address?: string;
  locationLat?: number;
  locationLng?: number;
  companyBio?: string;
  websiteUrl?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// MICRO 1.4: JOB VACANCY & INTERNSHIP PUBLISHING CONTRACTS
// ============================================================
export type VacancyStatus = 'OPEN' | 'CLOSED' | 'EXPIRED';
export type OpportunityType = 'JOB' | 'INTERNSHIP';
export type WorkZone = 'TIMIKA_KOTA' | 'KUALA_KENCANA' | 'PORTSITE_POMAKO' | 'HIGHLAND_TEMBAGAPURA';
export type WorkSchedule = 'NORMAL_DAY' | 'SHIFT_24H' | 'ROSTER_FIELD';
export type EmploymentContractType = 'PKWT' | 'PKWTT' | 'HARIAN_LEPAS' | 'PEMAGANGAN';

export interface CreateJobVacancyDto {
    title: string;
    taskDescription: string;
    projectDuration?: string;
    contractType?: EmploymentContractType;
    contractDurationMonths?: number;
    requiredSkills: string[];
    minEducation: string;
    minExperienceYears?: number;
    allowEquivalence?: boolean;
    jobLocationLat?: number;
    jobLocationLng?: number;
    opportunityType?: OpportunityType;
    quota?: number;
    salaryMin?: number;
    salaryMax?: number;
    isSalaryDisclosed?: boolean;
    stipendAmount?: number;
    benefits?: string[];
    workTools?: string[];
    isSameAsOfficeLocation?: boolean;
    workZone?: WorkZone;
    workSchedule?: WorkSchedule;
    skillsGained?: string[];
    mentorName?: string;
    mentorRole?: string;
    hasAbsorptionOpportunity?: boolean;
    mandatoryCerts?: string[];
    preferredMajors?: string[];
    activeDaysDuration?: number;
}

export interface UpdateJobVacancyDto {
    title?: string;
    taskDescription?: string;
    projectDuration?: string;
    contractType?: EmploymentContractType;
    contractDurationMonths?: number;
    requiredSkills?: string[];
    minEducation?: string;
    minExperienceYears?: number;
    allowEquivalence?: boolean;
    jobLocationLat?: number;
    jobLocationLng?: number;
    status?: VacancyStatus;
    opportunityType?: OpportunityType;
    quota?: number;
    salaryMin?: number;
    salaryMax?: number;
    isSalaryDisclosed?: boolean;
    stipendAmount?: number;
    benefits?: string[];
    workTools?: string[];
    isSameAsOfficeLocation?: boolean;
    workZone?: WorkZone;
    workSchedule?: WorkSchedule;
    skillsGained?: string[];
    mentorName?: string;
    mentorRole?: string;
    hasAbsorptionOpportunity?: boolean;
    mandatoryCerts?: string[];
    preferredMajors?: string[];
    activeDaysDuration?: number;
    expiresAt?: string;
    closureReason?: string;
}

export interface JobVacancyResponseDto {
    id: string;
    employerId: string;
    title: string;
    taskDescription: string;
    projectDuration: string;
    contractType: EmploymentContractType;
    contractDurationMonths?: number | null;
    requiredSkills: string[];
    minEducation: string;
    minExperienceYears: number;
    allowEquivalence: boolean;
    jobLocationLat?: number;
    jobLocationLng?: number;
    status: VacancyStatus;
    opportunityType: OpportunityType;
    quota: number;
    salaryMin?: number;
    salaryMax?: number;
    isSalaryDisclosed: boolean;
    stipendAmount?: number;
    benefits: string[];
    workTools?: string[];
    isSameAsOfficeLocation: boolean;
    workZone: WorkZone;
    workSchedule: WorkSchedule;
    skillsGained?: string[];
    mentorName?: string;
    mentorRole?: string;
    hasAbsorptionOpportunity?: boolean;
    mandatoryCerts?: string[];
    preferredMajors?: string[];
    activeDaysDuration?: number;
    expiresAt?: string;
    closureReason?: string;
    createdAt: string;
    updatedAt: string;
    employer?: {
        companyName: string;
        logoUrl?: string;
        nib?: string;
        industrySector?: string;
        address?: string;
        picName?: string;
        picPhone?: string;
        verificationStatus?: string;
    };
}

export type VacancyOutcomeAction = 'HIRED_CANDIDATE' | 'EXTERNAL_HIRED' | 'CANCELLED' | 'EXTEND_TTL';

export interface ResolveVacancyOutcomeDto {
    outcome: VacancyOutcomeAction;
    selectedTalentIds?: string[];
    notes?: string;
}

export interface VacancySuggestionDto {
    inferredCategory: string;
    categoryLabel: string;
    recommendedSkills: string[];
    recommendedTools: string[];
    suggestedEducation?: string;
}

export type AiVacancyAssistAction = 'POLISH_TASKS' | 'SUGGEST_CRITERIA';

export interface AiVacancyAssistRequestDto {
    action: AiVacancyAssistAction;
    title?: string;
    rawTasks?: string;
    opportunityType?: OpportunityType;
}

export interface AiVacancyAssistResponseDto {
    status: 'success' | 'error';
    action: AiVacancyAssistAction;
    polishedTasks?: string;
    suggestedSkills?: string[];
    suggestedTools?: string[];
    categoryLabel?: string;
    summary?: string;
    providerUsed: 'OPENAI' | 'LOCAL_FALLBACK';
}

// ============================================================
// MICRO 2.1: CANDIDATE MATCHING & AI SCORING CONTRACTS
// ============================================================
export interface CandidateMatchingBreakdown {
  skillMatchScore: number;       // Bobot 35%
  experienceMatchScore: number;  // Bobot 30%
  educationMatchScore: number;   // Bobot 20%
  socialDnaMatchScore: number;   // Bobot 15%
  distanceMatchScore?: number;   // Metadata informatif GIS
  distanceKm?: number;           // Jarak fisik jika ada koordinat
  isFuzzyEquivalenceApplied: boolean;
}

export type ApproachStatus = 'APPROACHED' | 'SELECTED' | 'HIRED' | 'REJECTED';

export interface CandidateRecommendationDto {
  talentId: string;
  fullName: string;
  nik: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  bio?: string;
  socialDna?: any;
  overallScore: number;          // 0 - 100%
  breakdown: CandidateMatchingBreakdown;
  aiReasoning: string;           // Penjelasan transparan dari AI
  aiStrengths?: string[];        // Poin keunggulan yang dideteksi oleh AI
  affirmationNote?: string;      // Catatan afirmasi vokasi / kearifan lokal
  qualitativeScore?: number;     // Skor kualitatif AI
  aiProvider?: string;           // Indikator provider di backend
  isAiEvaluated?: boolean;       // Indikator evaluasi AI
  topSkills: string[];
  totalExperienceMonths: number;
  lastEducationDegree: string;
  isApproached: boolean;
  approachStatus?: ApproachStatus;
  isSelected?: boolean;
  isHired?: boolean;
  isRejected?: boolean;
}

export interface TalentInboundApproachDto {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  opportunityType: 'JOB' | 'INTERNSHIP';
  companyName: string;
  brandName?: string;
  companyLogo?: string;
  compensationText: string;
  benefits: string[];
  workZone: string;
  workSchedule: string;
  picName: string;
  picRole?: string;
  picPhone: string;
  status: ApproachStatus;
  aiMatchScore: number;
  aiReasoningSummary?: string;
  officialLetterDraft?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RankedCandidatesResponseDto {
  status: string;
  vacancyId: string;
  vacancyTitle: string;
  quota: number;
  selectedCount: number;
  hiredCount: number;
  remainingQuota: number;
  isQuotaFulfilled: boolean;
  isFinalized: boolean;
  vacancy?: any;
  totalEvaluated: number;
  totalQualified: number;
  selectedCandidates: CandidateRecommendationDto[];
  hiredCandidates: CandidateRecommendationDto[];
  candidates: CandidateRecommendationDto[];
  rejectedCandidates?: CandidateRecommendationDto[];
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

export type InstitutionType =
  | 'BLK_PEMERINTAH'
  | 'LPK_SWASTA'
  | 'LSP_BNSP'
  | 'PUSAT_PELATIHAN_INDUSTRI';

export type ProgramFundingType =
  | 'GRATIS_APBD_MIMIKA'
  | 'BEASISWA_CSR'
  | 'MANDIRI_BERBAYAR';

export type TrainingMethod = 'BOARDING' | 'NON_BOARDING' | 'MTU';

export type CertificateType =
  | 'PELATIHAN_STTP'
  | 'KOMPETENSI_BNSP'
  | 'LISENSI_K3_KEMNAKER'
  | 'KOMBINASI_LENGKAP';

export type ProgramApprovalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type BatchEnrollmentStatus =
  | 'REGISTERED'
  | 'ADMITTED'
  | 'REJECTED_SELECTION'
  | 'COMPLETED'
  | 'DROPPED_OUT';

export interface RegisterTrainingProviderDto {
  email: string;
  password?: string;
  institutionName: string;
  institutionType?: InstitutionType;
  vinNumber?: string;
  bnspLicenseNumber?: string;
  picName: string;
  picRole?: string;
  picPhone: string;
  address?: string;
  locationLat?: number;
  locationLng?: number;
}

export interface TrainingProviderProfileDto {
  id: string;
  institutionName: string;
  institutionType: InstitutionType;
  vinNumber?: string;
  bnspLicenseNumber?: string;
  legalDocUrl?: string;
  logoUrl?: string;
  accreditation: string;
  picName?: string;
  picRole?: string;
  picPhone?: string;
  picEmail?: string;
  address?: string;
  locationLat?: number;
  locationLng?: number;
  institutionBio?: string;
  websiteUrl?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyTrainingProviderDto {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface TrainingBatchDto {
  id: string;
  programId: string;
  batchName: string;
  batchNumber: number;
  fundingType: ProgramFundingType;
  priceAmount?: number;
  trainingMethod: TrainingMethod;
  quota: number;
  welfareBenefits: string[];
  registrationStart: string;
  registrationEnd: string;
  trainingStart: string;
  trainingEnd: string;
  venueAddress?: string;
  venueLat?: number;
  venueLng?: number;
  isOpen: boolean;
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TargetSkillDto {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export interface CreateProgramStudioDto {
  title: string;
  category: TrainingCategory;
  subCategory?: string;
  certificateType: CertificateType;
  deliveryMode: TrainingDeliveryMode;
  description: string;
  syllabus?: string;
  requirements?: string[];
  targetSkills: TargetSkillDto[];
  durationDays?: number;
  totalLessonHours?: number;
  coverImageUrl?: string;
  submitForApproval?: boolean;
}

export interface CreateBatchDto {
  batchName: string;
  fundingType: ProgramFundingType;
  priceAmount?: number;
  trainingMethod: TrainingMethod;
  quota: number;
  welfareBenefits?: string[];
  registrationStart: string;
  registrationEnd: string;
  trainingStart: string;
  trainingEnd: string;
  venueAddress?: string;
  venueLat?: number;
  venueLng?: number;
}

export interface UpdateBatchDto {
  batchName?: string;
  fundingType?: ProgramFundingType;
  priceAmount?: number;
  trainingMethod?: TrainingMethod;
  quota?: number;
  welfareBenefits?: string[];
  registrationStart?: string;
  registrationEnd?: string;
  trainingStart?: string;
  trainingEnd?: string;
  venueAddress?: string;
  venueLat?: number;
  venueLng?: number;
  isOpen?: boolean;
}

export interface CurateProgramDto {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface SkillhubProgramDto {
  id: string;
  providerId?: string;
  title: string;
  programCode?: string;
  category: TrainingCategory;
  subCategory?: string;
  certificateType: CertificateType;
  deliveryMode: TrainingDeliveryMode;
  description: string;
  syllabus?: string;
  requirements: string[];
  targetSkills: TargetSkillDto[];
  durationDays: number;
  totalLessonHours?: number;
  approvalStatus: ProgramApprovalStatus;
  approvalNotes?: string;
  status: TrainingProgramStatus;
  coverImageUrl?: string;
  ratingScore: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    institutionName: string;
    institutionType: InstitutionType;
    vinNumber?: string;
    bnspLicenseNumber?: string;
    logoUrl?: string;
    accreditation?: string;
    picName?: string;
    picPhone?: string;
    address?: string;
    locationLat?: number;
    locationLng?: number;
    verificationStatus: string;
  };
  batches: TrainingBatchDto[];
}

// ==========================================
// DTO PENDAFTARAN BATCH & KELULUSAN MASSAL
// ==========================================
export interface EnrollBatchDto {
  notes?: string;
}

export interface BatchGraduationParticipantDto {
  talentId: string;
  isPassed: boolean;
  finalScore?: number;
  certificateNumber?: string;
  bnspCertificateNumber?: string;
  notes?: string;
}

export interface BulkGraduationDto {
  batchId: string;
  certificatePrefix?: string; // e.g. "CERT-BLK-WELD-2026"
  autoNumbering?: boolean;    // Generate berurut jika true
  participants: BatchGraduationParticipantDto[];
}

export interface BatchParticipantItemDto {
  enrollmentId: string;
  talentId: string;
  fullName: string;
  nik: string;
  phone?: string;
  email: string;
  avatarUrl?: string;
  selectionStatus: BatchEnrollmentStatus;
  isPassed?: boolean;
  finalScore?: number;
  certificateNumber?: string;
  bnspCertificateNumber?: string;
  enrolledAt: string;
  completedAt?: string;
}

export interface BatchParticipantsResponseDto {
  batchId: string;
  batchName: string;
  programTitle: string;
  quota: number;
  totalEnrolled: number;
  totalCompleted: number;
  participants: BatchParticipantItemDto[];
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
  createdAt?: string;
}

export interface CreateMasterMajorDto {
  name: string;
  category: string;
}

export interface UpdateMasterMajorDto {
  name?: string;
  category?: string;
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