// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Nguồn Thu nhập (Income Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { PoolClient } from 'pg';
import { incomeRepository } from '../repositories/income.repository';
import { profileRepository } from '../repositories/profile.repository';
import { 
  IncomeSourceDbEntity, 
  CreateIncomeSourceDto, 
  UpdateIncomeSourceDto, 
  IncomeSourceResponseDto 
} from '../types/income.types';
import type { UserContext } from '../types/auth.types';
import { 
  NotFoundError, 
  ValidationError 
} from '../errors/app-error';

export class IncomeService {
  /**
   * Chuyển đổi Entity cơ sở dữ liệu sang Response DTO
   */
  private mapToResponseDto(entity: IncomeSourceDbEntity): IncomeSourceResponseDto {
    return {
      id: entity.id,
      profileId: entity.profile_id,
      userId: entity.user_id,
      category: entity.category,
      payerName: entity.payer_name,
      payerMst: entity.payer_mst,
      payerBranch: entity.payer_branch,
      taxAuthorityName: entity.tax_authority_name,
      contractTitle: entity.contract_title,
      isActiveInDecember: entity.is_active_in_december,
      workingMonthsCount: Number(entity.working_months_count),
      periodStartDate: entity.period_start_date,
      periodEndDate: entity.period_end_date,
      totalIncomeGross: Number(entity.total_income_gross || 0),
      totalTaxableIncome: Number(entity.total_taxable_income || 0),
      taxWithheld: Number(entity.tax_withheld || 0),
      withholdingRate: Number(entity.withholding_rate || 0),
      insuranceDeduction: Number(entity.insurance_deduction || 0),
      applyPersonalDeduction: entity.apply_personal_deduction,
      personalDeductionMonths: Number(entity.personal_deduction_months || 0),
      eCertificateCode: entity.e_certificate_code,
      isECertificateVerified: entity.is_e_certificate_verified,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  /**
   * Lấy danh sách nguồn thu nhập thuộc hồ sơ thuế
   */
  public async getIncomeSources(
    user: UserContext,
    profileId: string,
    client: PoolClient
  ): Promise<IncomeSourceResponseDto[]> {
    const profile = await profileRepository.findById(client, profileId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    const list = await incomeRepository.findAllByProfileId(client, profileId);
    return list.map((item) => this.mapToResponseDto(item));
  }

  /**
   * Thêm mới nguồn thu nhập và tự động đồng bộ vào hồ sơ thuế
   */
  public async createIncomeSource(
    user: UserContext,
    dto: CreateIncomeSourceDto,
    client: PoolClient
  ): Promise<IncomeSourceResponseDto> {
    if (!dto.profileId) {
      throw new ValidationError('Mã hồ sơ thuế (profileId) là bắt buộc.');
    }
    if (!dto.payerName || !dto.payerMst) {
      throw new ValidationError('Tên đơn vị chi trả và Mã số thuế đơn vị là bắt buộc.');
    }
    if (dto.totalIncomeGross < 0) {
      throw new ValidationError('Tổng thu nhập chịu thuế không được là số âm.');
    }
    if (dto.taxWithheld < 0) {
      throw new ValidationError('Số thuế khấu trừ không được là số âm.');
    }
    // Ràng buộc số học tài chính: Thuế khấu trừ không được lớn hơn tổng thu nhập
    if (dto.totalIncomeGross > 0 && dto.taxWithheld > dto.totalIncomeGross) {
      throw new ValidationError('Số thuế TNCN đã khấu trừ không thể lớn hơn tổng thu nhập chịu thuế.');
    }

    // Kiểm tra quyền sở hữu profile qua RLS
    const profile = await profileRepository.findById(client, dto.profileId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    const created = await incomeRepository.create(client, user.id, dto);

    // Kích hoạt đồng bộ số liệu tự động vào tax_profiles
    await profileRepository.syncFinancialTotals(client, dto.profileId);

    return this.mapToResponseDto(created);
  }

  /**
   * Lấy chi tiết một nguồn thu nhập
   */
  public async getIncomeSourceById(
    user: UserContext,
    id: string,
    client: PoolClient
  ): Promise<IncomeSourceResponseDto> {
    const item = await incomeRepository.findById(client, id);
    if (!item) {
      throw new NotFoundError('Không tìm thấy nguồn thu nhập hoặc bạn không có quyền truy cập.');
    }
    return this.mapToResponseDto(item);
  }

  /**
   * Cập nhật nguồn thu nhập và tự động cập nhật tổng tài chính hồ sơ
   */
  public async updateIncomeSource(
    user: UserContext,
    id: string,
    dto: UpdateIncomeSourceDto,
    client: PoolClient
  ): Promise<IncomeSourceResponseDto> {
    const existing = await incomeRepository.findById(client, id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy nguồn thu nhập hoặc bạn không có quyền truy cập.');
    }

    const gross = dto.totalIncomeGross !== undefined ? dto.totalIncomeGross : Number(existing.total_income_gross);
    const tax = dto.taxWithheld !== undefined ? dto.taxWithheld : Number(existing.tax_withheld);

    if (gross < 0 || tax < 0) {
      throw new ValidationError('Thu nhập và thuế khấu trừ không được là số âm.');
    }
    if (gross > 0 && tax > gross) {
      throw new ValidationError('Số thuế TNCN đã khấu trừ không thể lớn hơn tổng thu nhập chịu thuế.');
    }

    const updated = await incomeRepository.update(client, id, dto);
    if (!updated) {
      throw new NotFoundError('Không tìm thấy nguồn thu nhập để cập nhật.');
    }

    // Đồng bộ lại tổng thu nhập và thuế vào tax_profiles
    await profileRepository.syncFinancialTotals(client, existing.profile_id);

    return this.mapToResponseDto(updated);
  }

  /**
   * Xóa nguồn thu nhập và đồng bộ lại tổng tài chính
   */
  public async deleteIncomeSource(
    user: UserContext,
    id: string,
    client: PoolClient
  ): Promise<void> {
    const deleted = await incomeRepository.delete(client, id);
    if (!deleted) {
      throw new NotFoundError('Không tìm thấy nguồn thu nhập hoặc bạn không có quyền truy cập.');
    }

    // Đồng bộ lại tổng tài chính sau khi xóa
    await profileRepository.syncFinancialTotals(client, deleted.profile_id);
  }
}

export const incomeService = new IncomeService();
