// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Hồ sơ Quyết toán Thuế (Profile Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { PoolClient } from 'pg';
import { profileRepository } from '../repositories/profile.repository';
import { 
  TaxProfileDbEntity, 
  CreateTaxProfileDto, 
  UpdateTaxProfileDto, 
  TaxProfileResponseDto 
} from '../types/profile.types';
import type { UserContext } from '../types/auth.types';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError 
} from '../errors/app-error';

export class ProfileService {
  /**
   * Chuyển đổi Entity cơ sở dữ liệu sang Response DTO chuẩn
   */
  private mapToResponseDto(entity: TaxProfileDbEntity): TaxProfileResponseDto {
    return {
      id: entity.id,
      userId: entity.user_id,
      taxYear: Number(entity.tax_year),
      periodTitle: entity.period_title,
      filingStatus: entity.filing_status,
      taxDepartmentCode: entity.tax_department_code,
      taxDepartmentName: entity.tax_department_name,
      routingLegalBasis: entity.routing_legal_basis,
      isTaxResident: entity.is_tax_resident,
      stayDaysInYear: Number(entity.stay_days_in_year),
      isAuthorizedFinalization: entity.is_authorized_finalization,
      financialSummary: {
        totalTaxableIncome: Number(entity.total_taxable_income || 0),
        personalDeductionAmount: Number(entity.personal_deduction_amount || 0),
        dependentDeductionAmount: Number(entity.dependent_deduction_amount || 0),
        insuranceDeductionAmount: Number(entity.insurance_deduction_amount || 0),
        charityDeductionAmount: Number(entity.charity_deduction_amount || 0),
        voluntaryPensionDeduction: Number(entity.voluntary_pension_deduction || 0),
        assessableIncome: Number(entity.assessable_income || 0),
        taxPayable: Number(entity.tax_payable || 0),
        taxWithheldTotal: Number(entity.tax_withheld_total || 0),
        taxBalance: Number(entity.tax_balance || 0),
        isExemptUnder50k: Boolean(entity.is_exempt_under_50k),
      },
      refundBank: {
        bankName: entity.refund_bank_name,
        bankBranch: entity.refund_bank_branch,
        accountNumber: entity.refund_account_number,
        accountHolder: entity.refund_account_holder,
      },
      submissionDate: entity.submission_date,
      submissionAckCode: entity.submission_ack_code,
      notes: entity.notes,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  /**
   * Lấy danh sách hồ sơ quyết toán của người dùng (tự động phân quyền RLS)
   */
  public async getUserProfiles(
    user: UserContext,
    taxYear: number | undefined,
    client: PoolClient
  ): Promise<TaxProfileResponseDto[]> {
    const list = await profileRepository.findAllByUserId(client, user.id, taxYear);
    return list.map((item) => this.mapToResponseDto(item));
  }

  /**
   * Tạo mới một kỳ quyết toán thuế
   */
  public async createProfile(
    user: UserContext,
    dto: CreateTaxProfileDto,
    client: PoolClient
  ): Promise<TaxProfileResponseDto> {
    if (!dto.taxYear || isNaN(dto.taxYear) || dto.taxYear < 2000 || dto.taxYear > 2100) {
      throw new ValidationError('Năm tính thuế (taxYear) không hợp lệ (phải từ 2000 đến 2100).');
    }
    if (!dto.taxDepartmentCode || !dto.taxDepartmentName) {
      throw new ValidationError('Mã và Tên Cơ quan thuế tiếp nhận quyết toán là bắt buộc.');
    }

    // Kiểm tra chống tạo trùng lặp cùng năm tính thuế
    const existing = await profileRepository.findByUserIdAndYear(client, user.id, dto.taxYear);
    if (existing) {
      throw new ConflictError(
        `Hồ sơ quyết toán thuế cho năm ${dto.taxYear} đã tồn tại. Mỗi người nộp thuế chỉ được tạo một hồ sơ cho mỗi năm tính thuế.`
      );
    }

    const created = await profileRepository.create(client, user.id, dto);
    return this.mapToResponseDto(created);
  }

  /**
   * Lấy chi tiết hồ sơ thuế theo ID
   */
  public async getProfileById(
    user: UserContext,
    profileId: string,
    client: PoolClient
  ): Promise<TaxProfileResponseDto> {
    const profile = await profileRepository.findById(client, profileId);
    if (!profile) {
      // Chống dò đoán ID (Anti-ID Enumeration)
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }
    return this.mapToResponseDto(profile);
  }

  /**
   * Cập nhật thông tin hồ sơ quyết toán
   */
  public async updateProfile(
    user: UserContext,
    profileId: string,
    dto: UpdateTaxProfileDto,
    client: PoolClient
  ): Promise<TaxProfileResponseDto> {
    const existing = await profileRepository.findById(client, profileId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    const updated = await profileRepository.update(client, profileId, dto);
    if (!updated) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế để cập nhật.');
    }

    return this.mapToResponseDto(updated);
  }

  /**
   * Xóa hồ sơ thuế (Chỉ cho phép xóa khi hồ sơ đang ở trạng thái draft)
   */
  public async deleteProfile(
    user: UserContext,
    profileId: string,
    client: PoolClient
  ): Promise<void> {
    const existing = await profileRepository.findById(client, profileId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    if (existing.filing_status !== 'draft') {
      throw new ValidationError(
        `Không thể xóa hồ sơ thuế đang ở trạng thái '${existing.filing_status}'. Chỉ cho phép xóa khi hồ sơ ở trạng thái nháp (draft).`
      );
    }

    await profileRepository.delete(client, profileId);
  }
}

export const profileService = new ProfileService();
