// ==============================================================================
// Định nghĩa Kiểu dữ liệu Nguồn Thu nhập (Income Source Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

export type IncomeCategory =
  | 'salary_contract'
  | 'freelance_10pct'
  | 'foreign_income'
  | 'severance'
  | 'other';

export interface IncomeSourceDbEntity {
  id: string;
  profile_id: string;
  user_id: string;
  category: IncomeCategory;
  payer_name: string;
  payer_mst: string;
  payer_branch?: string | null;
  tax_authority_name?: string | null;
  contract_title?: string | null;
  is_active_in_december: boolean;
  working_months_count: number;
  period_start_date?: string | null;
  period_end_date?: string | null;
  total_income_gross: number | string;
  total_taxable_income: number | string;
  tax_withheld: number | string;
  withholding_rate: number | string;
  insurance_deduction: number | string;
  apply_personal_deduction: boolean;
  personal_deduction_months: number;
  e_certificate_code?: string | null;
  is_e_certificate_verified: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface IncomeSourceResponseDto {
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
