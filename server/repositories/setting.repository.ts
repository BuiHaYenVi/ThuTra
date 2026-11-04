// ==============================================================================
// Tầng Truy cập Dữ liệu Tham số Hệ thống (Setting Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  SystemSettingDbEntity, 
  TaxBracketDto 
} from '../types/setting.types';

export class SettingRepository {
  /**
   * Truy vấn toàn bộ các tham số hệ thống đang kích hoạt
   */
  public async getActiveSettings(client: PoolClient): Promise<SystemSettingDbEntity[]> {
    const query = `
      SELECT 
        id,
        setting_key,
        category,
        description,
        legal_basis,
        numeric_value,
        text_value,
        json_value,
        unit,
        is_active,
        effective_from,
        effective_to,
        updated_by,
        created_at,
        updated_at
      FROM system_settings
      WHERE is_active = true
      ORDER BY category ASC, setting_key ASC;
    `;
    const res = await client.query<SystemSettingDbEntity>(query);
    return res.rows;
  }

  /**
   * Truy vấn danh mục biểu thuế lũy tiến 7 bậc đang kích hoạt
   */
  public async getActiveTaxBrackets(client: PoolClient): Promise<TaxBracketDto[]> {
    const query = `
      SELECT 
        bracket_level AS "bracketLevel",
        monthly_min::numeric AS "monthlyMin",
        monthly_max::numeric AS "monthlyMax",
        yearly_min::numeric AS "yearlyMin",
        yearly_max::numeric AS "yearlyMax",
        tax_rate::numeric AS "taxRate",
        subtraction_amount::numeric AS "subtractionAmount",
        quick_calc_formula AS "quickCalcFormula",
        is_active AS "isActive"
      FROM progressive_tax_brackets
      WHERE is_active = true
      ORDER BY bracket_level ASC;
    `;
    const res = await client.query<TaxBracketDto>(query);
    return res.rows.map((row) => ({
      ...row,
      monthlyMin: Number(row.monthlyMin),
      monthlyMax: row.monthlyMax !== null ? Number(row.monthlyMax) : null,
      yearlyMin: Number(row.yearlyMin),
      yearlyMax: row.yearlyMax !== null ? Number(row.yearlyMax) : null,
      taxRate: Number(row.taxRate),
      subtractionAmount: Number(row.subtractionAmount),
    }));
  }

  /**
   * Truy vấn danh sách toàn bộ cài đặt (bao gồm cả trạng thái vô hiệu hóa)
   */
  public async getAllSettings(client: PoolClient): Promise<SystemSettingDbEntity[]> {
    const query = `
      SELECT *
      FROM system_settings
      ORDER BY category ASC, setting_key ASC;
    `;
    const res = await client.query<SystemSettingDbEntity>(query);
    return res.rows;
  }

  /**
   * Cập nhật giá trị một tham số hệ thống theo setting_key
   */
  public async updateSettingByKey(
    client: PoolClient,
    userId: string,
    key: string,
    data: {
      numericValue?: number;
      textValue?: string;
      isActive?: boolean;
    }
  ): Promise<SystemSettingDbEntity | null> {
    const query = `
      UPDATE system_settings
      SET 
        numeric_value = COALESCE($2, numeric_value),
        text_value = COALESCE($3, text_value),
        is_active = COALESCE($4, is_active),
        updated_by = $5,
        updated_at = CLOCK_TIMESTAMP()
      WHERE setting_key = $1
      RETURNING *;
    `;

    const res = await client.query<SystemSettingDbEntity>(query, [
      key,
      data.numericValue ?? null,
      data.textValue ?? null,
      data.isActive ?? null,
      userId,
    ]);

    return res.rows[0] || null;
  }
}

export const settingRepository = new SettingRepository();
