// ==============================================================================
// Định nghĩa Toàn diện Kiểu Dữ liệu Nghiệp vụ (Business DTO Types)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// Khớp 100% với Backend Express Data Transfer Objects
// ==============================================================================

import type { UserRole } from './api.types';

// ==============================================================================
// 1. PHÂN HỆ XÁC THỰC & NGƯỜI DÙNG (AUTH & USERS)
// ==============================================================================

export type UserStatus = 'active' | 'pending_verification' | 'locked' | 'inactive';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    mst?: string | null;
    cccd?: string | null;
  };
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  cccd?: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  cccd?: string | null;
  mst?: string | null;
  role: UserRole;
  status: UserStatus;
  isVneidVerified: boolean;
  vneidLevel: number;
  twoFactorEnabled: boolean;
  avatarUrl?: string | null;
  taxDepartmentCode?: string | null;
  taxDepartmentName?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  phone?: string;
  address?: string;
  taxDepartmentCode?: string;
  taxDepartmentName?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// ==============================================================================
// 2. PHÂN HỆ HỒ SƠ QUYẾT TOÁN THUẾ (TAX PROFILES)
// ==============================================================================

export type TaxFilingStatus =
  | 'draft'
  | 'validating'
  | 'ready_to_file'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'refund_processed';

export interface CreateProfileDto {
  taxYear: number;
  periodTitle?: string;
  taxDepartmentCode?: string;
  taxDepartmentName?: string;
  taxOfficeCode?: string;
  taxOfficeName?: string;
  routingLegalBasis?: string;
  isTaxResident?: boolean;
  stayDaysInYear?: number;
  isAuthorizedFinalization?: boolean;
  charityDeductionAmount?: number;
  voluntaryPensionDeduction?: number;
  refundBankName?: string;
  refundBankBranch?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  notes?: string;
}

export interface UpdateProfileDto {
  periodTitle?: string;
  taxDepartmentCode?: string;
  taxDepartmentName?: string;
  routingLegalBasis?: string;
  isTaxResident?: boolean;
  stayDaysInYear?: number;
  isAuthorizedFinalization?: boolean;
  charityDeductionAmount?: number;
  voluntaryPensionDeduction?: number;
  refundBankName?: string;
  refundBankBranch?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  notes?: string;
  filingStatus?: TaxFilingStatus;
}

export interface TaxProfileDto {
  id: string;
  userId: string;
  taxYear: number;
  periodTitle: string;
  filingStatus: TaxFilingStatus;
  taxDepartmentCode: string;
  taxDepartmentName: string;
  routingLegalBasis?: string | null;
  isTaxResident: boolean;
  stayDaysInYear: number;
  isAuthorizedFinalization: boolean;
  financialSummary: {
    totalTaxableIncome: number;
    personalDeductionAmount: number;
    dependentDeductionAmount: number;
    insuranceDeductionAmount: number;
    charityDeductionAmount: number;
    voluntaryPensionDeduction: number;
    assessableIncome: number;
    taxPayable: number;
    taxWithheldTotal: number;
    taxBalance: number;
    isExemptUnder50k: boolean;
  };
  refundBank?: {
    bankName?: string | null;
    bankBranch?: string | null;
    accountNumber?: string | null;
    accountHolder?: string | null;
  };
  submissionDate?: string | null;
  submissionAckCode?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 3. PHÂN HỆ NGUỒN THU NHẬP (INCOME SOURCES)
// ==============================================================================

export type IncomeCategory =
  | 'salary_contract'
  | 'freelance_10pct'
  | 'foreign_income'
  | 'severance'
  | 'other';

export interface CreateIncomeSourceDto {
  profileId: string;
  category?: IncomeCategory;
  payerName: string;
  payerMst: string;
  payerBranch?: string;
  taxAuthorityName?: string;
  contractTitle?: string;
  isActiveInDecember?: boolean;
  workingMonthsCount?: number;
  periodStartDate?: string;
  periodEndDate?: string;
  totalIncomeGross: number;
  totalTaxableIncome?: number;
  taxWithheld: number;
  withholdingRate?: number;
  insuranceDeduction?: number;
  applyPersonalDeduction?: boolean;
  personalDeductionMonths?: number;
  eCertificateCode?: string;
  isECertificateVerified?: boolean;
}

export interface UpdateIncomeSourceDto {
  category?: IncomeCategory;
  payerName?: string;
  payerMst?: string;
  payerBranch?: string;
  taxAuthorityName?: string;
  contractTitle?: string;
  isActiveInDecember?: boolean;
  workingMonthsCount?: number;
  periodStartDate?: string;
  periodEndDate?: string;
  totalIncomeGross?: number;
  totalTaxableIncome?: number;
  taxWithheld?: number;
  withholdingRate?: number;
  insuranceDeduction?: number;
  applyPersonalDeduction?: boolean;
  personalDeductionMonths?: number;
  eCertificateCode?: string;
  isECertificateVerified?: boolean;
}

export interface IncomeSourceDto {
  id: string;
  profileId: string;
  userId: string;
  category: IncomeCategory;
  payerName: string;
  payerMst: string;
  payerBranch?: string | null;
  taxAuthorityName?: string | null;
  contractTitle?: string | null;
  isActiveInDecember: boolean;
  workingMonthsCount: number;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  totalIncomeGross: number;
  totalTaxableIncome: number;
  taxWithheld: number;
  withholdingRate: number;
  insuranceDeduction: number;
  applyPersonalDeduction: boolean;
  personalDeductionMonths: number;
  eCertificateCode?: string | null;
  isECertificateVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 4. PHÂN HỆ NGƯỜI PHỤ THUỘC (DEPENDENTS)
// ==============================================================================

export type DependentRelationType =
  | 'mother'
  | 'father'
  | 'child_under_18'
  | 'child_over_18_student'
  | 'spouse'
  | 'disabled_relative'
  | 'other';

export interface CreateDependentDto {
  profileId: string;
  fullName: string;
  relationType: DependentRelationType;
  relationTitle?: string;
  cccd: string;
  mst?: string;
  hasMst?: boolean;
  dateOfBirth?: string;
  isValidCqt?: boolean;
  startMonth: string; // Định dạng YYYY-MM
  endMonth: string;   // Định dạng YYYY-MM
  monthsApplied: number; // 1 -> 12
  commitmentChecked?: boolean;
  proofDocumentId?: string;
}

export interface UpdateDependentDto {
  fullName?: string;
  relationType?: DependentRelationType;
  relationTitle?: string;
  cccd?: string;
  mst?: string;
  hasMst?: boolean;
  dateOfBirth?: string;
  isValidCqt?: boolean;
  startMonth?: string;
  endMonth?: string;
  monthsApplied?: number;
  commitmentChecked?: boolean;
  proofDocumentId?: string;
}

export interface DependentDto {
  id: string;
  profileId: string;
  userId: string;
  fullName: string;
  relationType: DependentRelationType;
  relationTitle?: string | null;
  cccd: string;
  mst?: string | null;
  hasMst: boolean;
  dateOfBirth?: string | null;
  isValidCqt: boolean;
  startMonth: string;
  endMonth: string;
  monthsApplied: number;
  monthlyDeduction: number;
  totalDeduction: number;
  commitmentChecked: boolean;
  proofDocumentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 5. PHÂN HỆ CHỨNG TỪ & OCR (DOCUMENTS & OCR)
// ==============================================================================

export const DocumentType = {
  WITHHOLDING_TAX: 'withholding_cert_form02',
  SALARY_CONFIRMATION: 'salary_confirmation',
  LABOR_CONTRACT: 'labor_contract',
  DEPENDENT_PROOF: 'dependent_id_proof',
  CHARITY_RECEIPT: 'charity_receipt',
  PENSION_RECEIPT: 'pension_receipt',
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export const VerificationStatus = {
  PENDING: 'unverified',
  AUTO_VERIFIED: 'verified_auto',
  VERIFIED: 'verified_manual',
  REJECTED: 'flagged_discrepancy',
} as const;

export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

export const OcrStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type OcrStatus = typeof OcrStatus[keyof typeof OcrStatus];

export interface ExtractedOcrData {
  tax_code_issuer: string;
  issuer_name: string;
  document_number: string;
  serial_number?: string;
  gross_income: number;
  tax_deducted: number;
  tax_year: number;
  confidence_score: number;
  needs_manual_review: boolean;
  raw_text?: string;
  signer_info?: {
    organization?: string;
    serial?: string;
    is_valid?: boolean;
  };
}

export interface ConfirmDocumentDto {
  issuerName: string;
  taxCodeIssuer: string;
  documentNumber?: string;
  grossIncome: number;
  taxDeducted: number;
  taxYear: number;
  createIncomeSource?: boolean;
}

export interface DocumentListQueryDto {
  page?: number;
  limit?: number;
  docType?: DocumentType;
  status?: VerificationStatus;
  taxYear?: number;
}

export interface TaxDocumentDto {
  id: string;
  userId: string;
  profileId: string | null;
  incomeSourceId: string | null;
  docType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  ocrStatus: OcrStatus;
  ocrConfidence: number;
  verificationStatus: VerificationStatus;
  extractedData: ExtractedOcrData;
  isDigitalSignatureValid: boolean;
  verifiedAt: string | null;
  createdAt: string;
  retentionExpiresAt: string;
}

export interface DocumentListResponseDto {
  documents: TaxDocumentDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==============================================================================
// 6. PHÂN HỆ THẨM TRA THUẾ & 15 RULES (TAX AUDIT ENGINE)
// ==============================================================================

export const AuditSeverity = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO',
} as const;

export type AuditSeverity = typeof AuditSeverity[keyof typeof AuditSeverity];

export const AuditStatus = {
  PASSED: 'PASSED',
  WARNING: 'WARNING',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
} as const;

export type AuditStatus = typeof AuditStatus[keyof typeof AuditStatus];

export type RuleCode =
  | 'R01' | 'R02' | 'R03' | 'R04'
  | 'R05' | 'R06' | 'R07' | 'R08'
  | 'R09' | 'R10' | 'R11' | 'R12'
  | 'R13' | 'R14' | 'R15';

export interface TaxBracketDetail {
  bracket: number;
  monthlyRange: string;
  yearlyRange: string;
  taxableAmountInBracket: number;
  rate: number;
  taxAmount: number;
  quickCalcFormula: string;
}

export interface TaxCalculationBreakdown {
  grossIncome: number;
  personalDeduction: number;
  dependentDeduction: number;
  insuranceDeduction: number;
  charityDeduction: number;
  voluntaryPensionDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  taxLiability: number;
  taxDeducted: number;
  taxRefund: number;
  taxPayable: number;
  appliedBracket: number;
  isExemptUnder50k: boolean;
  bracketDetails: TaxBracketDetail[];
}

export interface RuleExecutionResult {
  ruleCode: string;
  ruleName: string;
  severity: AuditSeverity;
  status: AuditStatus;
  message: string;
  details?: Record<string, any>;
  suggestedFix?: string;
}

export type AuditFindingDto = RuleExecutionResult;

export interface AuditCalculationDto {
  grossIncome: number;
  dependentsCount?: number;
  dependentMonthsTotal?: number;
  insuranceAmount?: number;
  charityAmount?: number;
  taxWithheld?: number;
  monthsInYear?: number;
}

export interface AuditRunResultDto {
  auditRunId: string;
  profileId: string;
  taxYear: number;
  status: AuditStatus;
  totalRulesScanned: number;
  rulesPassedCount: number;
  rulesWarningCount: number;
  rulesFailedCount: number;
  calculation: TaxCalculationBreakdown;
  findings: RuleExecutionResult[];
  createdAt: string;
}

export interface AuditReportDto {
  auditRun: {
    id: string;
    profile_id: string;
    user_id: string;
    status: AuditStatus;
    total_rules_scanned: number;
    rules_passed_count: number;
    rules_warning_count: number;
    rules_failed_count: number;
    gross_income: number | string;
    total_deductions: number | string;
    taxable_income: number | string;
    tax_liability: number | string;
    tax_deducted: number | string;
    tax_refund: number | string;
    tax_payable: number | string;
    calculation_breakdown: TaxCalculationBreakdown;
    tax_year?: number;
    period_title?: string;
    tax_department_name?: string;
    created_at: string;
  };
  findings: RuleExecutionResult[];
}

// ==============================================================================
// 7. PHÂN HỆ QUẢN TRỊ & THAM SỐ THUẾ (ADMIN & SYSTEM SETTINGS)
// ==============================================================================

export type RuleRiskLevel = 'error' | 'warning' | 'suggestion';

export type RuleCategory =
  | 'deductions'
  | 'dependents'
  | 'routing'
  | 'incomes'
  | 'insurance'
  | 'authorization'
  | 'deadline'
  | 'reconciliation'
  | 'residence';

export interface TaxRuleDto {
  id: string;
  code: string;
  title: string;
  description: string;
  legalReference: string;
  riskLevel: RuleRiskLevel;
  riskLevelLabel: string;
  category: RuleCategory;
  executionFrequency: string;
  conditionSnippet: string;
  isActive: boolean;
  version: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTaxRuleDto {
  isActive?: boolean;
  title?: string;
  description?: string;
  conditionSnippet?: string;
  riskLevel?: RuleRiskLevel;
  riskLevelLabel?: string;
  changeReason?: string;
}

export interface AuditLogItemDto {
  id: string;
  profileId: string | null;
  userId: string | null;
  operator: string;
  purpose: string;
  actionType: string;
  maskedCccd: string;
  maskedMst: string;
  maskedEmail: string;
  userFullName?: string | null;
  triggeredRules: string[];
  violationDetails: any;
  minimizationStatus: string;
  clientIp?: string | null;
  createdAt: string;
}

export interface AuditLogQueryDto {
  page?: number;
  limit?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogsResponseDto {
  items: AuditLogItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaxBracketDto {
  bracketLevel: number;
  monthlyMin: number;
  monthlyMax: number | null;
  yearlyMin: number;
  yearlyMax: number | null;
  taxRate: number;
  subtractionAmount: number;
  quickCalcFormula: string;
  isActive: boolean;
}

export interface PublicSettingsDto {
  personalDeductionMonthly: number;
  personalDeductionYearly: number;
  dependentDeductionMonthly: number;
  dependentDeductionYearly: number;
  baseSalary: number;
  maxInsuranceBaseMultiplier: number;
  insuranceRates: {
    social: number;
    health: number;
    unemployment: number;
  };
  withholdingFlatRate: number;
  withholdingThreshold: number;
  exemptionThreshold: number;
  maxVoluntaryPensionYearly: number;
  taxBrackets: TaxBracketDto[];
}

export interface SystemSettingDto {
  id: string;
  settingKey: string;
  category: string;
  description: string;
  legalBasis: string;
  numericValue: number | null;
  textValue: string | null;
  unit: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  updatedAt: string;
}

export interface UpdateSettingItemDto {
  key: string;
  numericValue?: number;
  textValue?: string;
  isActive?: boolean;
}

export interface UpdateSettingsRequestDto {
  settings?: UpdateSettingItemDto[];
  settingKey?: string;
  numericValue?: number;
  textValue?: string;
  isActive?: boolean;
}
