// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Thẩm tra & Quyết toán Thuế (Audit Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { PoolClient } from 'pg';
import { auditRepository } from '../repositories/audit.repository';
import { TaxCalculatorEngine } from '../engines/tax-calculator.engine';
import { ruleEngine } from '../engines/rule-engine';
import { 
  AuditContext, 
  AuditRunResponseDto, 
  QuickCalculationRequestDto, 
  TaxCalculationBreakdown,
  AuditStatus 
} from '../types/audit.types';
import type { UserContext } from '../types/auth.types';
import { 
  NotFoundError, 
  ForbiddenError, 
  ValidationError 
} from '../errors/app-error';

export class AuditService {
  /**
   * Tính thử nhanh số thuế TNCN và bảng kê 7 bậc (không lưu database)
   */
  public calculateQuickTax(dto: QuickCalculationRequestDto): TaxCalculationBreakdown {
    if (dto.grossIncome === undefined || dto.grossIncome === null || isNaN(dto.grossIncome)) {
      throw new ValidationError('Tổng thu nhập chịu thuế (grossIncome) là bắt buộc và phải là số hợp lệ.');
    }

    if (dto.grossIncome < 0) {
      throw new ValidationError('Tổng thu nhập chịu thuế không được là số âm.');
    }

    const monthsInYear = dto.monthsInYear !== undefined ? dto.monthsInYear : 12;
    if (monthsInYear < 1 || monthsInYear > 12) {
      throw new ValidationError('Số tháng trong năm tính thuế phải từ 1 đến 12 tháng.');
    }

    let depMonths = dto.dependentMonthsTotal;
    if (depMonths === undefined && dto.dependentsCount !== undefined) {
      depMonths = dto.dependentsCount * 12;
    }

    return TaxCalculatorEngine.calculate({
      grossIncome: dto.grossIncome,
      personalDeductionMonths: monthsInYear,
      dependentsTotalMonths: Math.max(0, depMonths || 0),
      insuranceDeduction: Math.max(0, dto.insuranceAmount || 0),
      charityDeduction: Math.max(0, dto.charityAmount || 0),
      taxDeducted: Math.max(0, dto.taxWithheld || 0),
    });
  }

  /**
   * Chạy toàn bộ quy trình Thẩm tra 15 Quy tắc và Chiết tính Thuế trên Hồ sơ thuế
   * Tuân thủ bảo mật RLS và lưu vết vào audit_runs, audit_findings, tax_profiles
   */
  public async runAudit(
    user: UserContext,
    profileId: string,
    client: PoolClient
  ): Promise<AuditRunResponseDto> {
    // 1. Phân quyền: Cán bộ quản lý (admin_manager) chỉ được xem ở chế độ chỉ đọc
    if (user.role === 'admin_manager') {
      throw new ForbiddenError(
        'Cán bộ quản lý (admin_manager) chỉ có quyền xem báo cáo thẩm tra ở chế độ chỉ đọc, không thể kích hoạt chạy lại hoặc sửa đổi kết quả thẩm tra tự động.'
      );
    }

    // 2. Truy vấn dữ liệu đầy đủ của hồ sơ thuế (RLS kiểm soát trực tiếp)
    const profileData = await auditRepository.getTaxProfileFullData(client, profileId);
    if (!profileData || !profileData.profile) {
      // Chống lộ danh tính (Anti-ID Enumeration): Không tìm thấy hoặc không thuộc quyền sở hữu đều trả về 404
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    const { profile, incomeSources, documents, dependents } = profileData;

    // 3. Tổng hợp số liệu đầu vào từ các nguồn thu nhập, người phụ thuộc và chứng từ
    let totalGrossIncome = 0;
    let totalTaxDeducted = 0;
    let totalInsurance = Number(profile.insurance_deduction_amount || 0);

    if (incomeSources.length > 0) {
      for (const source of incomeSources) {
        totalGrossIncome += Number(source.total_taxable_income || source.total_income_gross || 0);
        totalTaxDeducted += Number(source.tax_withheld || 0);
        totalInsurance += Number(source.insurance_deduction || 0);
      }
    } else {
      // Nếu chưa kê khai income_sources riêng, lấy từ thông tin tổng hợp trong tax_profiles
      totalGrossIncome = Number(profile.total_taxable_income || 0);
      totalTaxDeducted = Number(profile.tax_withheld_total || 0);
    }

    // Tính tổng số tháng giảm trừ người phụ thuộc
    const dependentsTotalMonths = dependents.reduce(
      (sum, dep) => sum + Number(dep.months_applied || 0),
      0
    );

    const charityDeduction = Number(profile.charity_deduction_amount || 0);
    const voluntaryPensionDeduction = Number(profile.voluntary_pension_deduction || 0);

    // 4. Kích hoạt Động cơ tính thuế lũy tiến từng phần (Tax Calculator Engine)
    const calculation = TaxCalculatorEngine.calculate({
      grossIncome: totalGrossIncome,
      personalDeductionMonths: 12, // Mặc định 12 tháng đối với cá nhân cư trú
      dependentsTotalMonths,
      insuranceDeduction: totalInsurance,
      charityDeduction,
      voluntaryPensionDeduction,
      taxDeducted: totalTaxDeducted,
    });

    // 5. Chuẩn bị Ngữ cảnh Thẩm tra (AuditContext)
    const context: AuditContext = {
      userId: user.id,
      profile: {
        id: profile.id,
        userId: profile.user_id,
        taxYear: Number(profile.tax_year),
        periodTitle: profile.period_title || `Quyết toán thuế TNCN năm ${profile.tax_year}`,
        taxDepartmentCode: profile.tax_department_code || '',
        taxDepartmentName: profile.tax_department_name || '',
        isTaxResident: profile.is_tax_resident ?? true,
        stayDaysInYear: Number(profile.stay_days_in_year || 365),
        isAuthorizedFinalization: Boolean(profile.is_authorized_finalization),
      },
      incomeSources: incomeSources.map((s) => ({
        id: s.id,
        payerName: s.payer_name || '',
        payerMst: s.payer_mst || '',
        totalIncomeGross: Number(s.total_income_gross || 0),
        totalTaxableIncome: Number(s.total_taxable_income || 0),
        taxWithheld: Number(s.tax_withheld || 0),
        withholdingRate: Number(s.withholding_rate || 0),
        insuranceDeduction: Number(s.insurance_deduction || 0),
        applyPersonalDeduction: Boolean(s.apply_personal_deduction),
        eCertificateCode: s.e_certificate_code || null,
        isECertificateVerified: Boolean(s.is_e_certificate_verified),
      })),
      documents,
      dependents: dependents.map((d) => ({
        id: d.id,
        fullName: d.full_name,
        relationType: d.relation_type,
        cccd: d.cccd,
        mst: d.mst || null,
        hasMst: Boolean(d.has_mst),
        monthsApplied: Number(d.months_applied || 0),
        monthlyDeduction: Number(d.monthly_deduction || 4400000),
        totalDeduction: Number(d.total_deduction || 0),
        isValidCqt: Boolean(d.is_valid_cqt),
        proofDocumentId: d.proof_document_id || null,
      })),
      calculation,
    };

    // 6. Thực thi Bộ máy Thẩm tra 15 Quy tắc (Rule Engine R01 - R15)
    const findings = await ruleEngine.executeAll(context);
    const overallStatus = ruleEngine.evaluateOverallStatus(findings);
    const counts = ruleEngine.getCounts(findings);

    // 7. Mở Database Savepoint để ghi dữ liệu bảo đảm toàn vẹn giao dịch
    await client.query('SAVEPOINT audit_run_sp;');
    try {
      const auditRunId = await auditRepository.createAuditRun(client, {
        profileId,
        userId: profile.user_id,
        status: overallStatus,
        totalRulesScanned: counts.total,
        rulesPassedCount: counts.passed,
        rulesWarningCount: counts.warning,
        rulesFailedCount: counts.failed,
        calculation,
      });

      await auditRepository.createAuditFindings(
        client,
        auditRunId,
        profileId,
        profile.user_id,
        findings
      );

      await auditRepository.updateTaxProfileCalculation(
        client,
        profileId,
        calculation,
        overallStatus
      );

      await client.query('RELEASE SAVEPOINT audit_run_sp;');

      return {
        auditRunId,
        profileId,
        taxYear: Number(profile.tax_year),
        status: overallStatus,
        totalRulesScanned: counts.total,
        rulesPassedCount: counts.passed,
        rulesWarningCount: counts.warning,
        rulesFailedCount: counts.failed,
        calculation,
        findings,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      await client.query('ROLLBACK TO SAVEPOINT audit_run_sp;');
      throw error;
    }
  }

  /**
   * Lấy lịch sử các phiên thẩm tra của một hồ sơ thuế
   */
  public async getAuditHistory(
    user: UserContext,
    profileId: string,
    client: PoolClient
  ): Promise<any[]> {
    const profileData = await auditRepository.getTaxProfileFullData(client, profileId);
    if (!profileData || !profileData.profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ thuế hoặc bạn không có quyền truy cập vào hồ sơ này.');
    }

    return await auditRepository.getAuditRunsByProfileId(client, profileId);
  }

  /**
   * Lấy báo cáo chi tiết của một phiên thẩm tra cụ thể
   */
  public async getAuditReport(
    user: UserContext,
    auditRunId: string,
    client: PoolClient
  ): Promise<{ auditRun: any; findings: any[] }> {
    const report = await auditRepository.getAuditRunById(client, auditRunId);
    if (!report) {
      throw new NotFoundError('Không tìm thấy báo cáo thẩm tra hoặc bạn không có quyền truy cập vào báo cáo này.');
    }

    return report;
  }
}

export const auditService = new AuditService();
