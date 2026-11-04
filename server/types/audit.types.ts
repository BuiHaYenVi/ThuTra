// ==============================================================================
// Định nghĩa Kiểu dữ liệu Thẩm tra Thuế & Biểu lũy tiến (Audit Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import type { TaxDocumentDbEntity } from './document.types';

export enum AuditSeverity {
  CRITICAL = 'CRITICAL', // Lỗi nghiêm trọng: Chặn nộp tờ khai / Sai phạm pháp lý
  WARNING = 'WARNING',   // Cảnh báo: Cần bổ sung tài liệu / Giải trình
  INFO = 'INFO',         // Gợi ý tối ưu quyền lợi hoàn thuế
}

export enum AuditStatus {
  PASSED = 'PASSED',
  WARNING = 'WARNING',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export type RuleCode =
  | 'R01' | 'R02' | 'R03' | 'R04'
  | 'R05' | 'R06' | 'R07' | 'R08'
  | 'R09' | 'R10' | 'R11' | 'R12'
  | 'R13' | 'R14' | 'R15';

/**
 * Chi tiết từng bậc trong Biểu thuế lũy tiến từng phần 7 bậc (Điều 22 Luật Thuế TNCN)
 */
export interface TaxBracketDetail {
  bracket: number; // 1 đến 7
  monthlyRange: string;
  yearlyRange: string;
  taxableAmountInBracket: number; // Số tiền tính thuế trong bậc này (VNĐ)
  rate: number; // Thuế suất (5%, 10%, 15%, 20%, 25%, 30%, 35%)
  taxAmount: number; // Thuế phát sinh riêng của bậc này (VNĐ)
  quickCalcFormula: string;
}

/**
 * Bảng kê chiết tính toàn diện nghĩa vụ thuế TNCN
 */
export interface TaxCalculationBreakdown {
  grossIncome: number;          // Tổng thu nhập chịu thuế trong năm (VNĐ)
  personalDeduction: number;    // Giảm trừ bản thân (11tr/tháng x 12 tháng = 132tr)
  dependentDeduction: number;   // Giảm trừ NPT (4.4tr/tháng/người x số tháng)
  insuranceDeduction: number;   // Giảm trừ bảo hiểm bắt buộc (BHXH, BHYT, BHTN)
  charityDeduction: number;     // Giảm trừ đóng góp từ thiện, nhân đạo hợp pháp
  voluntaryPensionDeduction: number; // Giảm trừ quỹ hưu trí tự nguyện (tối đa 12tr/năm)
  totalDeductions: number;      // Tổng tất cả các khoản giảm trừ hợp lệ
  taxableIncome: number;        // Thu nhập tính thuế (TNTT = grossIncome - totalDeductions)
  taxLiability: number;         // Tổng thuế TNCN phát sinh theo biểu lũy tiến
  taxDeducted: number;          // Tổng số thuế đã bị các đơn vị khấu trừ tại nguồn
  taxRefund: number;            // Số tiền được hoàn lại từ Kho Bạc (nếu taxDeducted > taxLiability)
  taxPayable: number;           // Số tiền phải nộp thêm vào NSNN (nếu taxLiability > taxDeducted)
  appliedBracket: number;       // Bậc thuế cao nhất mà người nộp thuế chạm tới (1 - 7)
  isExemptUnder50k: boolean;    // Miễn nộp nếu số thuế phát sinh thêm <= 50.000 VNĐ (NĐ 126/2020)
  bracketDetails: TaxBracketDetail[]; // Bảng kê chi tiết 7 bậc
}

/**
 * Kết quả thực thi của từng Rule kiểm tra
 */
export interface RuleExecutionResult {
  ruleCode: string;             // R01 - R15
  ruleName: string;
  severity: AuditSeverity;      // CRITICAL, WARNING, INFO
  status: AuditStatus;          // PASSED, FAILED, WARNING
  message: string;              // Thông điệp kết quả
  details?: Record<string, any>;// Dữ liệu chi tiết thực tế vs kỳ vọng
  suggestedFix?: string;        // Hướng dẫn khắc phục nghiệp vụ
}

/**
 * Ngữ cảnh dữ liệu cung cấp cho Bộ máy Thẩm tra 15 Rules
 */
export interface AuditContext {
  userId: string;
  profile: {
    id: string;
    userId: string;
    taxYear: number;
    periodTitle: string;
    taxDepartmentCode: string;
    taxDepartmentName: string;
    isTaxResident: boolean;
    stayDaysInYear: number;
    isAuthorizedFinalization: boolean;
  };
  incomeSources: Array<{
    id: string;
    payerName: string;
    payerMst: string;
    totalIncomeGross: number;
    totalTaxableIncome: number;
    taxWithheld: number;
    withholdingRate: number;
    insuranceDeduction: number;
    applyPersonalDeduction: boolean;
    eCertificateCode: string | null;
    isECertificateVerified: boolean;
  }>;
  documents: TaxDocumentDbEntity[];
  dependents: Array<{
    id: string;
    fullName: string;
    relationType: string;
    cccd: string;
    mst: string | null;
    hasMst: boolean;
    monthsApplied: number;
    monthlyDeduction: number;
    totalDeduction: number;
    isValidCqt: boolean;
    proofDocumentId: string | null;
  }>;
  calculation: TaxCalculationBreakdown;
}

/**
 * DTO phản hồi kết quả phiên thẩm tra đầy đủ
 */
export interface AuditRunResponseDto {
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

/**
 * DTO yêu cầu tính thử nhanh (không lưu DB)
 */
export interface QuickCalculationRequestDto {
  grossIncome: number;
  dependentsCount?: number;
  dependentMonthsTotal?: number;
  insuranceAmount?: number;
  charityAmount?: number;
  taxWithheld?: number;
  monthsInYear?: number;
}
