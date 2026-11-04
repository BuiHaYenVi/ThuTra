// ==============================================================================
// Tầng Truy cập Dữ liệu Hồ sơ Quyết toán Thuế (Profile Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  TaxProfileDbEntity, 
  CreateTaxProfileDto, 
  UpdateTaxProfileDto 
} from '../types/profile.types';

export class ProfileRepository {
  /**
   * Tìm hồ sơ theo User ID và Năm tính thuế (chống tạo trùng lặp cùng năm)
   */
  public async findByUserIdAndYear(
    client: PoolClient,
    userId: string,
    taxYear: number
  ): Promise<TaxProfileDbEntity | null> {
    const query = `
      SELECT *
      FROM tax_profiles
      WHERE tax_year = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const res = await client.query<TaxProfileDbEntity>(query, [taxYear]);
    return res.rows[0] || null;
  }

  /**
   * Lấy danh sách hồ sơ quyết toán của người dùng (hỗ trợ lọc theo taxYear)
   */
  public async findAllByUserId(
    client: PoolClient,
    userId: string,
    taxYear?: number
  ): Promise<TaxProfileDbEntity[]> {
    let query = `
      SELECT *
      FROM tax_profiles
      WHERE (user_id = current_app_user_id() OR is_super_admin())
    `;
    const params: any[] = [];

    if (taxYear) {
      params.push(taxYear);
      query += ` AND tax_year = $${params.length}`;
    }

    query += ` ORDER BY tax_year DESC, created_at DESC;`;

    const res = await client.query<TaxProfileDbEntity>(query, params);
    return res.rows;
  }

  /**
   * Lấy chi tiết một hồ sơ thuế theo ID
   */
  public async findById(
    client: PoolClient,
    profileId: string
  ): Promise<TaxProfileDbEntity | null> {
    const query = `
      SELECT *
      FROM tax_profiles
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const res = await client.query<TaxProfileDbEntity>(query, [profileId]);
    return res.rows[0] || null;
  }

  /**
   * Tạo mới một kỳ quyết toán thuế
   */
  public async create(
    client: PoolClient,
    userId: string,
    dto: CreateTaxProfileDto
  ): Promise<TaxProfileDbEntity> {
    const query = `
      INSERT INTO tax_profiles (
        user_id,
        tax_year,
        period_title,
        tax_department_code,
        tax_department_name,
        routing_legal_basis,
        is_tax_resident,
        stay_days_in_year,
        is_authorized_finalization,
        charity_deduction_amount,
        voluntary_pension_deduction,
        refund_bank_name,
        refund_bank_branch,
        refund_account_number,
        refund_account_holder,
        notes,
        filing_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'draft'
      )
      RETURNING *;
    `;

    const values = [
      userId,
      dto.taxYear,
      dto.periodTitle || `Kỳ quyết toán thuế TNCN năm ${dto.taxYear}`,
      dto.taxDepartmentCode,
      dto.taxDepartmentName,
      dto.routingLegalBasis || null,
      dto.isTaxResident !== undefined ? dto.isTaxResident : true,
      dto.stayDaysInYear || 365,
      dto.isAuthorizedFinalization || false,
      dto.charityDeductionAmount || 0,
      dto.voluntaryPensionDeduction || 0,
      dto.refundBankName || null,
      dto.refundBankBranch || null,
      dto.refundAccountNumber || null,
      dto.refundAccountHolder || null,
      dto.notes || null,
    ];

    const res = await client.query<TaxProfileDbEntity>(query, values);
    return res.rows[0];
  }

  /**
   * Cập nhật thông tin hồ sơ quyết toán thuế
   */
  public async update(
    client: PoolClient,
    profileId: string,
    dto: UpdateTaxProfileDto
  ): Promise<TaxProfileDbEntity | null> {
    const query = `
      UPDATE tax_profiles
      SET 
        period_title = COALESCE($2, period_title),
        tax_department_code = COALESCE($3, tax_department_code),
        tax_department_name = COALESCE($4, tax_department_name),
        routing_legal_basis = COALESCE($5, routing_legal_basis),
        is_tax_resident = COALESCE($6, is_tax_resident),
        stay_days_in_year = COALESCE($7, stay_days_in_year),
        is_authorized_finalization = COALESCE($8, is_authorized_finalization),
        charity_deduction_amount = COALESCE($9, charity_deduction_amount),
        voluntary_pension_deduction = COALESCE($10, voluntary_pension_deduction),
        refund_bank_name = COALESCE($11, refund_bank_name),
        refund_bank_branch = COALESCE($12, refund_bank_branch),
        refund_account_number = COALESCE($13, refund_account_number),
        refund_account_holder = COALESCE($14, refund_account_holder),
        notes = COALESCE($15, notes),
        filing_status = COALESCE($16, filing_status),
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING *;
    `;

    const values = [
      profileId,
      dto.periodTitle ?? null,
      dto.taxDepartmentCode ?? null,
      dto.taxDepartmentName ?? null,
      dto.routingLegalBasis ?? null,
      dto.isTaxResident ?? null,
      dto.stayDaysInYear ?? null,
      dto.isAuthorizedFinalization ?? null,
      dto.charityDeductionAmount ?? null,
      dto.voluntaryPensionDeduction ?? null,
      dto.refundBankName ?? null,
      dto.refundBankBranch ?? null,
      dto.refundAccountNumber ?? null,
      dto.refundAccountHolder ?? null,
      dto.notes ?? null,
      dto.filingStatus ?? null,
    ];

    const res = await client.query<TaxProfileDbEntity>(query, values);
    return res.rows[0] || null;
  }

  /**
   * Xóa hồ sơ thuế (RLS kiểm soát)
   */
  public async delete(client: PoolClient, profileId: string): Promise<boolean> {
    const query = `
      DELETE FROM tax_profiles
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING id;
    `;
    const res = await client.query(query, [profileId]);
    return (res.rowCount || 0) > 0;
  }

  /**
   * Tự động tính toán lại và đồng bộ các tổng tài chính vào tax_profiles
   * Sau khi thêm/sửa/xóa nguồn thu nhập hoặc người phụ thuộc
   */
  public async syncFinancialTotals(client: PoolClient, profileId: string): Promise<void> {
    // 1. Tính tổng từ income_sources
    const incomeQuery = `
      SELECT 
        COALESCE(SUM(total_taxable_income), 0) AS total_taxable,
        COALESCE(SUM(tax_withheld), 0) AS total_withheld,
        COALESCE(SUM(insurance_deduction), 0) AS total_insurance
      FROM income_sources
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;
    const incRes = await client.query(incomeQuery, [profileId]);
    const totalTaxable = Number(incRes.rows[0]?.total_taxable || 0);
    const totalWithheld = Number(incRes.rows[0]?.total_withheld || 0);
    const totalInsurance = Number(incRes.rows[0]?.total_insurance || 0);

    // 2. Tính tổng giảm trừ từ dependents
    const depQuery = `
      SELECT 
        COALESCE(SUM(total_deduction), 0) AS total_dep_deduction
      FROM dependents
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;
    const depRes = await client.query(depQuery, [profileId]);
    const totalDepDeduction = Number(depRes.rows[0]?.total_dep_deduction || 0);

    // 3. Cập nhật vào tax_profiles
    const updateQuery = `
      UPDATE tax_profiles
      SET 
        total_taxable_income = $2,
        tax_withheld_total = $3,
        insurance_deduction_amount = $4,
        dependent_deduction_amount = $5,
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;
    await client.query(updateQuery, [
      profileId,
      totalTaxable,
      totalWithheld,
      totalInsurance,
      totalDepDeduction,
    ]);
  }
}

export const profileRepository = new ProfileRepository();
