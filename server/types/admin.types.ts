// ==============================================================================
// Định nghĩa Kiểu dữ liệu Quản trị Quy tắc & Nhật ký Kiểm toán (Admin Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
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

export interface TaxRuleDbEntity {
  id: string;
  code: string;
  title: string;
  description: string;
  legal_reference: string;
  risk_level: RuleRiskLevel;
  risk_level_label: string;
  category: RuleCategory;
  execution_frequency: string;
  condition_snippet: string;
  is_active: boolean;
  version: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface TaxRuleResponseDto {
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

export interface AuditLogDbEntity {
  id: string;
  profile_id: string | null;
  user_id: string | null;
  operator: string;
  purpose: string;
  action_type: string;
  masked_cccd: string;
  masked_mst: string;
  triggered_rules: string[];
  violation_details: any;
  minimization_status: string;
  retention_expires_at: string;
  client_ip: string | null;
  created_at: string;
  user_email?: string | null;
  user_full_name?: string | null;
}

export interface AuditLogResponseDto {
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
