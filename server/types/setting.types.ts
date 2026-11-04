// ==============================================================================
// Định nghĩa Kiểu dữ liệu Tham số Hệ thống & Biểu thuế (Setting Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

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

export interface PublicSettingsResponseDto {
  personalDeductionMonthly: number; // 11,000,000 VNĐ
  personalDeductionYearly: number;  // 132,000,000 VNĐ
  dependentDeductionMonthly: number;// 4,400,000 VNĐ
  dependentDeductionYearly: number; // 52,800,000 VNĐ
  baseSalary: number;               // 2,340,000 VNĐ
  maxInsuranceBaseMultiplier: number;// 20 (lần mức lương cơ sở)
  insuranceRates: {
    social: number;       // 8.0%
    health: number;       // 1.5%
    unemployment: number; // 1.0%
  };
  withholdingFlatRate: number;      // 10.0%
  withholdingThreshold: number;     // 2,000,000 VNĐ/lần
  exemptionThreshold: number;       // 50,000 VNĐ (Nghị định 126/2020)
  maxVoluntaryPensionYearly: number;// 12,000,000 VNĐ
  taxBrackets: TaxBracketDto[];
}

export interface SystemSettingDbEntity {
  id: string;
  setting_key: string;
  category: string;
  description: string;
  legal_basis: string;
  numeric_value: number | string | null;
  text_value: string | null;
  json_value: any | null;
  unit: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
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
