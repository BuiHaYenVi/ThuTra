// ==============================================================================
// Định nghĩa Kiểu dữ liệu Hồ sơ Quyết toán Thuế (Tax Profile Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

export type TaxFilingStatus =
  | 'draft'
  | 'validating'
  | 'ready_to_file'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'refund_processed';

export interface TaxProfileDbEntity {
  id: string;
  user_id: string;
  tax_year: number;
  period_title: string;
  filing_status: TaxFilingStatus;
  tax_department_code: string;
  tax_department_name: string;
  routing_legal_basis?: string | null;
  is_tax_resident: boolean;
  stay_days_in_year: number;
  is_authorized_finalization: boolean;
  total_taxable_income: number | string;
  personal_deduction_amount: number | string;
  dependent_deduction_amount: number | string;
  insurance_deduction_amount: number | string;
  charity_deduction_amount: number | string;
  voluntary_pension_deduction: number | string;
  assessable_income: number | string;
  tax_payable: number | string;
  tax_withheld_total: number | string;
  tax_balance: number | string;
  is_exempt_under_50k: boolean;
  refund_bank_name?: string | null;
  refund_bank_branch?: string | null;
  refund_account_number?: string | null;
  refund_account_holder?: string | null;
  submission_date?: string | null;
  submission_ack_code?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxProfileDto {
  taxYear: number;
  periodTitle?: string;
  taxDepartmentCode: string;
  taxDepartmentName: string;
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

export interface UpdateTaxProfileDto {
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

export interface TaxProfileResponseDto {
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
