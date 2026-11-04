// ==============================================================================
// Định nghĩa Kiểu dữ liệu Người phụ thuộc (Dependent Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

export type DependentRelationType =
  | 'mother'
  | 'father'
  | 'child_under_18'
  | 'child_over_18_student'
  | 'spouse'
  | 'disabled_relative'
  | 'other';

export interface DependentDbEntity {
  id: string;
  user_id: string;
  profile_id: string;
  full_name: string;
  relation_type: DependentRelationType;
  relation_title?: string | null;
  cccd: string;
  mst?: string | null;
  has_mst: boolean;
  date_of_birth?: string | null;
  is_valid_cqt: boolean;
  start_month: string;
  end_month: string;
  months_applied: number;
  monthly_deduction: number | string;
  total_deduction: number | string;
  commitment_checked: boolean;
  proof_document_id?: string | null;
  created_at: string;
  updated_at: string;
}

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
  startMonth: string; // YYYY-MM
  endMonth: string;   // YYYY-MM
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

export interface DependentResponseDto {
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
