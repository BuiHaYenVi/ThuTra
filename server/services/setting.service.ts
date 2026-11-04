// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Tham số Hệ thống (Setting Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { PoolClient } from 'pg';
import { settingRepository } from '../repositories/setting.repository';
import { 
  PublicSettingsResponseDto, 
  UpdateSettingsRequestDto, 
  UpdateSettingItemDto 
} from '../types/setting.types';
import type { UserContext } from '../types/auth.types';
import { 
  ForbiddenError, 
  ValidationError 
} from '../errors/app-error';

export class SettingService {
  /**
   * Lấy cấu hình tham số thuế công khai và bảng kê 7 bậc lũy tiến (Public Route)
   */
  public async getPublicSettings(client: PoolClient): Promise<PublicSettingsResponseDto> {
    const [settingsList, taxBrackets] = await Promise.all([
      settingRepository.getActiveSettings(client),
      settingRepository.getActiveTaxBrackets(client),
    ]);

    // Tạo Map để tra cứu nhanh theo setting_key
    const settingsMap = new Map<string, number>();
    for (const s of settingsList) {
      if (s.numeric_value !== null && s.numeric_value !== undefined) {
        settingsMap.set(s.setting_key, Number(s.numeric_value));
      }
    }

    return {
      personalDeductionMonthly: settingsMap.get('personal_deduction_monthly') ?? 11000000,
      personalDeductionYearly: settingsMap.get('personal_deduction_yearly') ?? 132000000,
      dependentDeductionMonthly: settingsMap.get('dependent_deduction_monthly') ?? 4400000,
      dependentDeductionYearly: settingsMap.get('dependent_deduction_yearly') ?? 52800000,
      baseSalary: settingsMap.get('base_salary') ?? 2340000,
      maxInsuranceBaseMultiplier: settingsMap.get('max_insurance_base_multiplier') ?? 20,
      insuranceRates: {
        social: settingsMap.get('social_insurance_rate') ?? 8.0,
        health: settingsMap.get('health_insurance_rate') ?? 1.5,
        unemployment: settingsMap.get('unemployment_insurance_rate') ?? 1.0,
      },
      withholdingFlatRate: settingsMap.get('withholding_flat_rate') ?? 10.0,
      withholdingThreshold: settingsMap.get('withholding_threshold') ?? 2000000,
      exemptionThreshold: settingsMap.get('exemption_threshold') ?? 50000,
      maxVoluntaryPensionYearly: settingsMap.get('max_voluntary_pension_yearly') ?? 12000000,
      taxBrackets,
    };
  }

  /**
   * Cập nhật tham số hệ thống (Yêu cầu quyền super_admin)
   */
  public async updateSettings(
    user: UserContext,
    dto: UpdateSettingsRequestDto,
    client: PoolClient
  ): Promise<{ updatedCount: number; message: string }> {
    if (user.role !== 'super_admin') {
      throw new ForbiddenError(
        'Chỉ Quản trị viên tối cao (super_admin) mới có quyền cập nhật tham số hệ thống.',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    const itemsToUpdate: UpdateSettingItemDto[] = [];

    if (dto.settings && Array.isArray(dto.settings) && dto.settings.length > 0) {
      itemsToUpdate.push(...dto.settings);
    } else if (dto.settingKey) {
      itemsToUpdate.push({
        key: dto.settingKey,
        numericValue: dto.numericValue,
        textValue: dto.textValue,
        isActive: dto.isActive,
      });
    } else {
      throw new ValidationError('Dữ liệu cập nhật tham số không hợp lệ. Cần cung cấp settingKey hoặc danh sách settings.');
    }

    let updatedCount = 0;
    for (const item of itemsToUpdate) {
      if (!item.key) continue;
      const res = await settingRepository.updateSettingByKey(client, user.id, item.key, {
        numericValue: item.numericValue,
        textValue: item.textValue,
        isActive: item.isActive,
      });
      if (res) {
        updatedCount++;
      }
    }

    return {
      updatedCount,
      message: `Cập nhật thành công ${updatedCount} tham số hệ thống.`,
    };
  }
}

export const settingService = new SettingService();
