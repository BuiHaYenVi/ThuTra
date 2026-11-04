// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Người phụ thuộc (Dependent Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { PoolClient } from 'pg';
import { dependentRepository } from '../repositories/dependent.repository';
import { profileRepository } from '../repositories/profile.repository';
import { 
  DependentDbEntity, 
  CreateDependentDto, 
  UpdateDependentDto, 
  DependentResponseDto 
} from '../types/dependent.types';
import type { UserContext } from '../types/auth.types';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError 
} from '../errors/app-error';

export class DependentService {
  /**
   * Chuẩn hóa mối quan hệ người phụ thuộc sang enum hợp lệ
   */
  private normalizeRelationType(input: any): any {
    if (!input) return 'child_under_18';
    const val = String(input).toLowerCase().trim();
    if (['mother', 'father', 'child_under_18', 'child_over_18_student', 'spouse', 'disabled_relative', 'other'].includes(val)) {
      return val;
    }
    if (val.includes('mẹ') || val.includes('me')) return 'mother';
    if (val.includes('cha') || val.includes('bố') || val.includes('ba')) return 'father';
    if (val.includes('đh') || val.includes('dh') || (val.includes('con') && (val.includes('18') || val.includes('đang học')) && !val.includes('dưới'))) {
      return 'child_over_18_student';
    }
    if (val.includes('con')) return 'child_under_18';
    if (val.includes('vợ') || val.includes('chồng')) return 'spouse';
    if (val.includes('tàn tật') || val.includes('khuyết tật')) return 'disabled_relative';
    return 'other';
  }

  /**
   * Chuẩn hóa định dạng tháng (MM/YYYY hoặc YYYY-MM sang YYYY-MM)
   */
  private normalizeMonthYear(val: string | undefined, defaultVal: string): string {
    if (!val) return defaultVal;
    const trimmed = String(val).trim();
    const mmYyyy = /^(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (mmYyyy) {
      const mm = mmYyyy[1].padStart(2, '0');
      return `${mmYyyy[2]}-${mm}`;
    }
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    return defaultVal;
  }

  /**
   * Chuyển đổi Entity cơ sở dữ liệu sang Response DTO
   */
  private mapToResponseDto(entity: DependentDbEntity): DependentResponseDto {
    return {
      id: entity.id,
      profileId: entity.profile_id,
      userId: entity.user_id,
      fullName: entity.full_name,
      relationType: entity.relation_type,
      relationTitle: entity.relation_title,
      cccd: entity.cccd,
      mst: entity.mst,
      hasMst: entity.has_mst,
      dateOfBirth: entity.date_of_birth,
      isValidCqt: entity.is_valid_cqt,
      startMonth: entity.start_month,
      endMonth: entity.end_month,
      monthsApplied: Number(entity.months_applied),
      monthlyDeduction: Number(entity.monthly_deduction || 4400000),
      totalDeduction: Number(entity.total_deduction || 0),
      commitmentChecked: entity.commitment_checked,
      proofDocumentId: entity.proof_document_id,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }


  /**
   * Lấy danh sách người phụ thuộc thuộc một hồ sơ thuế
   */
  public async getDependents(
    user: UserContext,
    profileId: string,
    client: PoolClient
  ): Promise<DependentResponseDto[]> {
    const profile = await profileRepository.findById(client, profileId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    const list = await dependentRepository.findAllByProfileId(client, profileId);
    return list.map((item) => this.mapToResponseDto(item));
  }

  /**
   * Đăng ký người phụ thuộc mới và tự động tính mức giảm trừ gia cảnh
   */
  public async createDependent(
    user: UserContext,
    dto: CreateDependentDto,
    client: PoolClient
  ): Promise<DependentResponseDto> {
    // Chuẩn hóa và tiếp nhận linh hoạt cả camelCase và snake_case
    const profileId = dto.profileId || (dto as any).tax_profile_id || (dto as any).taxProfileId;
    const fullName = (dto.fullName || (dto as any).full_name || (dto as any).name || '').trim();
    const rawRelation = dto.relationType || (dto as any).relation_type || (dto as any).relationship || (dto as any).relation;
    const relationTitle = dto.relationTitle || (dto as any).relation_title || (dto as any).relation || null;
    const rawCccd = dto.cccd || (dto as any).id_number || (dto as any).idNumber || (dto as any).citizen_id || '';
    const monthsApplied = Number(dto.monthsApplied || (dto as any).deduction_months || (dto as any).months_applied || (dto as any).months || 12);
    const rawStartMonth = dto.startMonth || (dto as any).from_month || (dto as any).start_month;
    const rawEndMonth = dto.endMonth || (dto as any).to_month || (dto as any).end_month;
    const mst = dto.mst || (dto as any).tax_code || (dto as any).taxCode || null;
    const dateOfBirth = dto.dateOfBirth || (dto as any).date_of_birth || (dto as any).birth_date || (dto as any).birthDate || null;

    if (!profileId) {
      throw new ValidationError('Mã hồ sơ thuế (profileId / tax_profile_id) là bắt buộc.');
    }
    if (!fullName) {
      throw new ValidationError('Họ và tên người phụ thuộc là bắt buộc.');
    }

    // Chuẩn hóa quan hệ người phụ thuộc sang Enum
    const relationType = this.normalizeRelationType(rawRelation);

    // Ràng buộc số tháng giảm trừ trong năm [1, 12]
    if (!monthsApplied || isNaN(monthsApplied) || monthsApplied < 1 || monthsApplied > 12) {
      throw new ValidationError('Số tháng đăng ký giảm trừ người phụ thuộc phải từ 1 đến 12 tháng.');
    }

    // Ràng buộc định dạng CCCD 12 chữ số
    const cleanCccd = String(rawCccd).trim().replace(/\D/g, '');
    if (!/^\d{12}$/.test(cleanCccd)) {
      throw new ValidationError('Số CCCD/Mã định danh cá nhân người phụ thuộc phải đúng 12 chữ số chuẩn Đề án 06.');
    }

    // Kiểm tra quyền sở hữu profile qua RLS
    const profile = await profileRepository.findById(client, profileId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    // Chuẩn hóa định dạng startMonth & endMonth (YYYY-MM)
    const taxYear = profile.tax_year || 2025;
    const startMonth = this.normalizeMonthYear(rawStartMonth, `${taxYear}-01`);
    const endMonth = this.normalizeMonthYear(rawEndMonth, `${taxYear}-12`);

    // Kiểm tra chống trùng lặp CCCD trong cùng hồ sơ
    const existing = await dependentRepository.findByProfileAndCccd(client, profileId, cleanCccd);
    if (existing) {
      throw new ConflictError(
        `Người phụ thuộc có số CCCD ${cleanCccd} đã được đăng ký giảm trừ trong hồ sơ này. Không được kê khai trùng lặp.`
      );
    }

    const created = await dependentRepository.create(client, user.id, {
      profileId,
      fullName,
      relationType,
      relationTitle,
      cccd: cleanCccd,
      mst: mst ? String(mst).trim() : undefined,
      hasMst: Boolean(mst && String(mst).trim()),
      dateOfBirth: dateOfBirth || undefined,
      isValidCqt: dto.isValidCqt !== undefined ? dto.isValidCqt : true,
      startMonth,
      endMonth,
      monthsApplied,
      commitmentChecked: dto.commitmentChecked !== undefined ? dto.commitmentChecked : true,
      proofDocumentId: dto.proofDocumentId || undefined,
    });

    // Kích hoạt đồng bộ tổng tiền giảm trừ gia cảnh vào tax_profiles
    await profileRepository.syncFinancialTotals(client, profileId);

    return this.mapToResponseDto(created);
  }

  /**
   * Lấy chi tiết một người phụ thuộc
   */
  public async getDependentById(
    user: UserContext,
    id: string,
    client: PoolClient
  ): Promise<DependentResponseDto> {
    const item = await dependentRepository.findById(client, id);
    if (!item) {
      throw new NotFoundError('Không tìm thấy người phụ thuộc hoặc bạn không có quyền truy cập.');
    }
    return this.mapToResponseDto(item);
  }

  /**
   * Cập nhật thông tin hoặc số tháng giảm trừ của người phụ thuộc
   */
  public async updateDependent(
    user: UserContext,
    id: string,
    dto: UpdateDependentDto,
    client: PoolClient
  ): Promise<DependentResponseDto> {
    const existing = await dependentRepository.findById(client, id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy người phụ thuộc hoặc bạn không có quyền truy cập.');
    }

    const monthsApplied = dto.monthsApplied !== undefined
      ? Number(dto.monthsApplied)
      : (dto as any).deduction_months !== undefined
      ? Number((dto as any).deduction_months)
      : undefined;

    if (monthsApplied !== undefined && (isNaN(monthsApplied) || monthsApplied < 1 || monthsApplied > 12)) {
      throw new ValidationError('Số tháng đăng ký giảm trừ người phụ thuộc phải từ 1 đến 12 tháng.');
    }

    const rawCccd = dto.cccd !== undefined ? dto.cccd : (dto as any).id_number || (dto as any).idNumber;
    let cleanCccd: string | undefined = undefined;
    if (rawCccd !== undefined) {
      cleanCccd = String(rawCccd).trim().replace(/\D/g, '');
      if (!/^\d{12}$/.test(cleanCccd)) {
        throw new ValidationError('Số CCCD/Mã định danh cá nhân người phụ thuộc phải đúng 12 chữ số.');
      }
    }

    const rawRelation = dto.relationType || (dto as any).relation_type || (dto as any).relationship || (dto as any).relation;
    const relationType = rawRelation ? this.normalizeRelationType(rawRelation) : undefined;
    const relationTitle = dto.relationTitle || (dto as any).relation_title || (dto as any).relation || undefined;
    const fullName = (dto.fullName || (dto as any).full_name || (dto as any).name || undefined)?.trim();
    const startMonth = dto.startMonth ? this.normalizeMonthYear(dto.startMonth, existing.start_month) : undefined;
    const endMonth = dto.endMonth ? this.normalizeMonthYear(dto.endMonth, existing.end_month) : undefined;

    const updated = await dependentRepository.update(client, id, {
      ...dto,
      fullName: fullName || dto.fullName,
      relationType: relationType || dto.relationType,
      relationTitle: relationTitle || dto.relationTitle,
      cccd: cleanCccd,
      startMonth: startMonth || dto.startMonth,
      endMonth: endMonth || dto.endMonth,
      monthsApplied,
    });

    if (!updated) {
      throw new NotFoundError('Không tìm thấy người phụ thuộc để cập nhật.');
    }

    // Đồng bộ lại tổng giảm trừ vào tax_profiles
    await profileRepository.syncFinancialTotals(client, existing.profile_id);

    return this.mapToResponseDto(updated);
  }

  /**
   * Xóa người phụ thuộc và đồng bộ lại tổng giảm trừ gia cảnh
   */
  public async deleteDependent(
    user: UserContext,
    id: string,
    client: PoolClient
  ): Promise<void> {
    const deleted = await dependentRepository.delete(client, id);
    if (!deleted) {
      throw new NotFoundError('Không tìm thấy người phụ thuộc hoặc bạn không có quyền truy cập.');
    }

    // Đồng bộ lại sau khi xóa
    await profileRepository.syncFinancialTotals(client, deleted.profile_id);
  }
}

export const dependentService = new DependentService();
