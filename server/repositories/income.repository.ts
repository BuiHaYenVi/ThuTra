// ==============================================================================
// Tầng Truy cập Dữ liệu Nguồn Thu nhập (Income Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  IncomeSourceDbEntity, 
  CreateIncomeSourceDto, 
  UpdateIncomeSourceDto 
} from '../types/income.types';

export class IncomeRepository {
  /**
   * Lấy danh sách nguồn thu nhập thuộc một hồ sơ thuế (RLS kiểm soát)
   */
  public async findAllByProfileId(
    client: PoolClient,
    profileId: string
  ): Promise<IncomeSourceDbEntity[]> {
    const query = `
      SELECT *
      FROM income_sources
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      ORDER BY created_at ASC;
    `;
    const res = await client.query<IncomeSourceDbEntity>(query, [profileId]);
    return res.rows;
  }

  /**
   * Xem chi tiết một nguồn thu nhập theo ID
   */
  public async findById(
    client: PoolClient,
    id: string
  ): Promise<IncomeSourceDbEntity | null> {
    const query = `
      SELECT *
      FROM income_sources
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const res = await client.query<IncomeSourceDbEntity>(query, [id]);
    return res.rows[0] || null;
  }

  /**
   * Thêm mới nguồn thu nhập
   */
  public async create(
    client: PoolClient,
    userId: string,
    dto: CreateIncomeSourceDto
  ): Promise<IncomeSourceDbEntity> {
    const query = `
      INSERT INTO income_sources (
        profile_id,
        user_id,
        category,
        payer_name,
        payer_mst,
        payer_branch,
        tax_authority_name,
        contract_title,
        is_active_in_december,
        working_months_count,
        period_start_date,
        period_end_date,
        total_income_gross,
        total_taxable_income,
        tax_withheld,
        withholding_rate,
        insurance_deduction,
        apply_personal_deduction,
        personal_deduction_months,
        e_certificate_code,
        is_e_certificate_verified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      RETURNING *;
    `;

    const taxable = dto.totalTaxableIncome !== undefined ? dto.totalTaxableIncome : dto.totalIncomeGross;

    const values = [
      dto.profileId,
      userId,
      dto.category || 'salary_contract',
      dto.payerName,
      dto.payerMst,
      dto.payerBranch || null,
      dto.taxAuthorityName || null,
      dto.contractTitle || null,
      dto.isActiveInDecember || false,
      dto.workingMonthsCount || 12,
      dto.periodStartDate || null,
      dto.periodEndDate || null,
      dto.totalIncomeGross,
      taxable,
      dto.taxWithheld,
      dto.withholdingRate || 0,
      dto.insuranceDeduction || 0,
      dto.applyPersonalDeduction || false,
      dto.personalDeductionMonths || 0,
      dto.eCertificateCode || null,
      dto.isECertificateVerified || false,
    ];

    const res = await client.query<IncomeSourceDbEntity>(query, values);
    return res.rows[0];
  }

  /**
   * Cập nhật số liệu nguồn thu nhập
   */
  public async update(
    client: PoolClient,
    id: string,
    dto: UpdateIncomeSourceDto
  ): Promise<IncomeSourceDbEntity | null> {
    const query = `
      UPDATE income_sources
      SET 
        category = COALESCE($2, category),
        payer_name = COALESCE($3, payer_name),
        payer_mst = COALESCE($4, payer_mst),
        payer_branch = COALESCE($5, payer_branch),
        tax_authority_name = COALESCE($6, tax_authority_name),
        contract_title = COALESCE($7, contract_title),
        is_active_in_december = COALESCE($8, is_active_in_december),
        working_months_count = COALESCE($9, working_months_count),
        period_start_date = COALESCE($10, period_start_date),
        period_end_date = COALESCE($11, period_end_date),
        total_income_gross = COALESCE($12, total_income_gross),
        total_taxable_income = COALESCE($13, total_taxable_income),
        tax_withheld = COALESCE($14, tax_withheld),
        withholding_rate = COALESCE($15, withholding_rate),
        insurance_deduction = COALESCE($16, insurance_deduction),
        apply_personal_deduction = COALESCE($17, apply_personal_deduction),
        personal_deduction_months = COALESCE($18, personal_deduction_months),
        e_certificate_code = COALESCE($19, e_certificate_code),
        is_e_certificate_verified = COALESCE($20, is_e_certificate_verified),
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING *;
    `;

    const values = [
      id,
      dto.category ?? null,
      dto.payerName ?? null,
      dto.payerMst ?? null,
      dto.payerBranch ?? null,
      dto.taxAuthorityName ?? null,
      dto.contractTitle ?? null,
      dto.isActiveInDecember ?? null,
      dto.workingMonthsCount ?? null,
      dto.periodStartDate ?? null,
      dto.periodEndDate ?? null,
      dto.totalIncomeGross ?? null,
      dto.totalTaxableIncome ?? null,
      dto.taxWithheld ?? null,
      dto.withholdingRate ?? null,
      dto.insuranceDeduction ?? null,
      dto.applyPersonalDeduction ?? null,
      dto.personalDeductionMonths ?? null,
      dto.eCertificateCode ?? null,
      dto.isECertificateVerified ?? null,
    ];

    const res = await client.query<IncomeSourceDbEntity>(query, values);
    return res.rows[0] || null;
  }

  /**
   * Xóa nguồn thu nhập (trả về bản ghi bị xóa để biết profile_id phục vụ đồng bộ)
   */
  public async delete(
    client: PoolClient,
    id: string
  ): Promise<IncomeSourceDbEntity | null> {
    const query = `
      DELETE FROM income_sources
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING *;
    `;
    const res = await client.query<IncomeSourceDbEntity>(query, [id]);
    return res.rows[0] || null;
  }
}

export const incomeRepository = new IncomeRepository();
