// ==============================================================================
// Tầng Truy cập Dữ liệu Thẩm tra & Quyết toán (Audit Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  TaxCalculationBreakdown, 
  RuleExecutionResult, 
  AuditStatus 
} from '../types/audit.types';
import type { TaxDocumentDbEntity } from '../types/document.types';

export class AuditRepository {
  /**
   * Lấy toàn bộ dữ liệu hồ sơ thuế (Profile, Income Sources, Documents, Dependents)
   * Tuân thủ triệt để RLS Context của PostgreSQL
   */
  public async getTaxProfileFullData(
    client: PoolClient,
    profileId: string
  ): Promise<{
    profile: any | null;
    incomeSources: any[];
    documents: TaxDocumentDbEntity[];
    dependents: any[];
  } | null> {
    // 1. Lấy thông tin Tax Profile (RLS bảo đảm chỉ lấy được hồ sơ của mình)
    const profileQuery = `
      SELECT 
        id,
        user_id,
        tax_year,
        period_title,
        filing_status,
        tax_department_code,
        tax_department_name,
        is_tax_resident,
        stay_days_in_year,
        is_authorized_finalization,
        total_taxable_income,
        personal_deduction_amount,
        dependent_deduction_amount,
        insurance_deduction_amount,
        charity_deduction_amount,
        voluntary_pension_deduction,
        assessable_income,
        tax_payable,
        tax_withheld_total,
        tax_balance,
        is_exempt_under_50k
      FROM tax_profiles
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const profileRes = await client.query(profileQuery, [profileId]);
    const profile = profileRes.rows[0];

    if (!profile) {
      return null;
    }

    // 2. Lấy danh sách Nguồn thu nhập (income_sources)
    const incomeQuery = `
      SELECT 
        id,
        category,
        payer_name,
        payer_mst,
        total_income_gross,
        total_taxable_income,
        tax_withheld,
        withholding_rate,
        insurance_deduction,
        apply_personal_deduction,
        personal_deduction_months,
        e_certificate_code,
        is_e_certificate_verified
      FROM income_sources
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;
    const incomeRes = await client.query(incomeQuery, [profileId]);

    // 3. Lấy danh sách Chứng từ thuế đính kèm (tax_documents)
    const docsQuery = `
      SELECT *
      FROM tax_documents
      WHERE (profile_id = $1 OR user_id = $2) AND (user_id = current_app_user_id() OR is_super_admin());
    `;
    const docsRes = await client.query<TaxDocumentDbEntity>(docsQuery, [profileId, profile.user_id]);

    // 4. Lấy danh sách Người phụ thuộc (dependents)
    const depQuery = `
      SELECT 
        id,
        full_name,
        relation_type,
        relation_title,
        cccd,
        mst,
        has_mst,
        months_applied,
        monthly_deduction,
        total_deduction,
        is_valid_cqt,
        proof_document_id
      FROM dependents
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;
    const depRes = await client.query(depQuery, [profileId]);

    return {
      profile,
      incomeSources: incomeRes.rows,
      documents: docsRes.rows,
      dependents: depRes.rows,
    };
  }

  /**
   * Ghi nhận một phiên chạy thẩm tra vào bảng audit_runs
   */
  public async createAuditRun(
    client: PoolClient,
    data: {
      profileId: string;
      userId: string;
      status: AuditStatus;
      totalRulesScanned: number;
      rulesPassedCount: number;
      rulesWarningCount: number;
      rulesFailedCount: number;
      calculation: TaxCalculationBreakdown;
    }
  ): Promise<string> {
    const query = `
      INSERT INTO audit_runs (
        profile_id,
        user_id,
        status,
        total_rules_scanned,
        rules_passed_count,
        rules_warning_count,
        rules_failed_count,
        gross_income,
        total_deductions,
        taxable_income,
        tax_liability,
        tax_deducted,
        tax_refund,
        tax_payable,
        calculation_breakdown
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING id;
    `;

    const values = [
      data.profileId,
      data.userId,
      data.status,
      data.totalRulesScanned,
      data.rulesPassedCount,
      data.rulesWarningCount,
      data.rulesFailedCount,
      data.calculation.grossIncome,
      data.calculation.totalDeductions,
      data.calculation.taxableIncome,
      data.calculation.taxLiability,
      data.calculation.taxDeducted,
      data.calculation.taxRefund,
      data.calculation.taxPayable,
      JSON.stringify(data.calculation),
    ];

    const result = await client.query<{ id: string }>(query, values);
    return result.rows[0].id;
  }

  /**
   * Lưu danh sách các phát hiện vi phạm/cảnh báo vào bảng audit_findings
   */
  public async createAuditFindings(
    client: PoolClient,
    auditRunId: string,
    profileId: string,
    userId: string,
    findings: RuleExecutionResult[]
  ): Promise<void> {
    if (findings.length === 0) return;

    for (const f of findings) {
      const query = `
        INSERT INTO audit_findings (
          audit_run_id,
          profile_id,
          user_id,
          rule_code,
          rule_name,
          severity,
          status,
          message,
          details,
          suggested_fix
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        );
      `;

      await client.query(query, [
        auditRunId,
        profileId,
        userId,
        f.ruleCode,
        f.ruleName,
        f.severity,
        f.status,
        f.message,
        JSON.stringify(f.details || {}),
        f.suggestedFix || null,
      ]);
    }
  }

  /**
   * Cập nhật kết quả chiết tính nghĩa vụ thuế và trạng thái vào tax_profiles
   */
  public async updateTaxProfileCalculation(
    client: PoolClient,
    profileId: string,
    calc: TaxCalculationBreakdown,
    auditStatus: AuditStatus
  ): Promise<void> {
    // Trạng thái hồ sơ tương ứng: PASSED -> ready_to_file, WARNING -> validating, FAILED -> draft
    let filingStatus = 'draft';
    if (auditStatus === AuditStatus.PASSED) filingStatus = 'ready_to_file';
    else if (auditStatus === AuditStatus.WARNING) filingStatus = 'validating';

    // tax_balance: Dương nếu nộp thêm, Âm nếu hoàn tiền
    const taxBalance = calc.taxPayable > 0 ? calc.taxPayable : -calc.taxRefund;

    const query = `
      UPDATE tax_profiles
      SET 
        total_taxable_income = $2,
        personal_deduction_amount = $3,
        dependent_deduction_amount = $4,
        insurance_deduction_amount = $5,
        charity_deduction_amount = $6,
        voluntary_pension_deduction = $7,
        assessable_income = $8,
        tax_payable = $9,
        tax_withheld_total = $10,
        tax_balance = $11,
        is_exempt_under_50k = $12,
        filing_status = $13,
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;

    await client.query(query, [
      profileId,
      calc.grossIncome,
      calc.personalDeduction,
      calc.dependentDeduction,
      calc.insuranceDeduction,
      calc.charityDeduction,
      calc.voluntaryPensionDeduction,
      calc.taxableIncome,
      calc.taxLiability,
      calc.taxDeducted,
      taxBalance,
      calc.isExemptUnder50k,
      filingStatus,
    ]);
  }

  /**
   * Lấy lịch sử các phiên thẩm tra của hồ sơ thuế
   */
  public async getAuditRunsByProfileId(client: PoolClient, profileId: string): Promise<any[]> {
    const query = `
      SELECT 
        id,
        profile_id,
        status,
        total_rules_scanned,
        rules_passed_count,
        rules_warning_count,
        rules_failed_count,
        gross_income,
        total_deductions,
        taxable_income,
        tax_liability,
        tax_deducted,
        tax_refund,
        tax_payable,
        calculation_breakdown,
        created_at
      FROM audit_runs
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      ORDER BY created_at DESC;
    `;

    const result = await client.query(query, [profileId]);
    return result.rows;
  }

  /**
   * Lấy chi tiết báo cáo của một phiên thẩm tra (audit_run + findings)
   */
  public async getAuditRunById(
    client: PoolClient,
    auditRunId: string
  ): Promise<{ auditRun: any; findings: any[] } | null> {
    const runQuery = `
      SELECT 
        ar.*,
        tp.tax_year,
        tp.period_title,
        tp.tax_department_name
      FROM audit_runs ar
      JOIN tax_profiles tp ON ar.profile_id = tp.id
      WHERE ar.id = $1 AND (ar.user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const runResult = await client.query(runQuery, [auditRunId]);
    const auditRun = runResult.rows[0];

    if (!auditRun) {
      return null;
    }

    const findingsQuery = `
      SELECT 
        rule_code AS "ruleCode",
        rule_name AS "ruleName",
        severity,
        status,
        message,
        details,
        suggested_fix AS "suggestedFix",
        is_resolved AS "isResolved",
        created_at AS "createdAt"
      FROM audit_findings
      WHERE audit_run_id = $1
      ORDER BY 
        CASE severity 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'WARNING' THEN 2 
          ELSE 3 
        END, rule_code ASC;
    `;
    const findingsResult = await client.query(findingsQuery, [auditRunId]);

    return {
      auditRun,
      findings: findingsResult.rows,
    };
  }
}

export const auditRepository = new AuditRepository();
