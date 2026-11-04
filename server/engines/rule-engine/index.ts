// ==============================================================================
// Động cơ Thẩm tra Thuế 15 Quy tắc (Tax Audit Rule Engine R01 - R15)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { BaseRule } from './rule.interface';
import { 
  AuditContext, 
  RuleExecutionResult, 
  AuditSeverity, 
  AuditStatus 
} from '../../types/audit.types';

// Import Nhóm 1: Tính hợp lệ của Chứng từ & Pháp lý (R01 - R04)
import {
  RuleR01DuplicateDocument,
  RuleR02TaxCodeConsistency,
  RuleR03UnverifiedDocuments,
  RuleR04DigitalSignature,
} from './rules/group1-document-rules';

// Import Nhóm 2: Thu nhập & Khấu trừ tại nguồn (R05 - R08)
import {
  RuleR05IncomeDiscrepancy,
  RuleR06ExcessiveWithholding,
  RuleR07AbnormalTaxRate,
  RuleR08MultipleSourcesUnmatched,
} from './rules/group2-income-rules';

// Import Nhóm 3: Người phụ thuộc & Giảm trừ gia cảnh (R09 - R11)
import {
  RuleR09DuplicateDependents,
  RuleR10DependentIdValidity,
  RuleR11DependentMonthsLimit,
} from './rules/group3-dependent-rules';

// Import Nhóm 4: Quyết toán, Ủy quyền & Ngưỡng Rủi ro (R12 - R15)
import {
  RuleR12AuthorizationEligibility,
  RuleR13HighRefundThreshold,
  RuleR14LateFilingRisk,
  RuleR15ComprehensiveRiskScore,
} from './rules/group4-finalization-rules';

export class RuleEngine {
  private rules: BaseRule[] = [];

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * Đăng ký danh mục toàn bộ 15 quy tắc thẩm tra chuẩn
   */
  private registerDefaultRules(): void {
    this.rules = [
      // Nhóm 1 (R01 - R04)
      new RuleR01DuplicateDocument(),
      new RuleR02TaxCodeConsistency(),
      new RuleR03UnverifiedDocuments(),
      new RuleR04DigitalSignature(),

      // Nhóm 2 (R05 - R08)
      new RuleR05IncomeDiscrepancy(),
      new RuleR06ExcessiveWithholding(),
      new RuleR07AbnormalTaxRate(),
      new RuleR08MultipleSourcesUnmatched(),

      // Nhóm 3 (R09 - R11)
      new RuleR09DuplicateDependents(),
      new RuleR10DependentIdValidity(),
      new RuleR11DependentMonthsLimit(),

      // Nhóm 4 (R12 - R15)
      new RuleR12AuthorizationEligibility(),
      new RuleR13HighRefundThreshold(),
      new RuleR14LateFilingRisk(),
      new RuleR15ComprehensiveRiskScore(),
    ];
  }

  /**
   * Chạy tuần tự toàn bộ 15 quy tắc thẩm tra trên ngữ cảnh hồ sơ
   */
  public async executeAll(context: AuditContext): Promise<RuleExecutionResult[]> {
    const results: RuleExecutionResult[] = [];

    for (const rule of this.rules) {
      try {
        const res = await rule.execute(context);
        results.push(res);
      } catch (err: any) {
        results.push({
          ruleCode: rule.code,
          ruleName: rule.name,
          severity: rule.defaultSeverity,
          status: AuditStatus.FAILED,
          message: `Lỗi bất thường khi thực thi thẩm tra quy tắc: ${err.message}`,
        });
      }
    }

    return results;
  }

  /**
   * Đánh giá trạng thái tổng thể của hồ sơ thuế dựa trên kết quả 15 rules:
   * - Có ít nhất 1 lỗi CRITICAL thất bại -> FAILED (chặn nộp tờ khai).
   * - Có cảnh báo WARNING (và không có Critical thất bại) -> WARNING.
   * - Toàn bộ 15 rules PASSED -> PASSED.
   */
  public evaluateOverallStatus(findings: RuleExecutionResult[]): AuditStatus {
    const hasCriticalFailed = findings.some(
      (f) => f.severity === AuditSeverity.CRITICAL && f.status === AuditStatus.FAILED
    );
    if (hasCriticalFailed) {
      return AuditStatus.FAILED;
    }

    const hasWarnings = findings.some(
      (f) => f.status === AuditStatus.WARNING || f.status === AuditStatus.FAILED
    );
    if (hasWarnings) {
      return AuditStatus.WARNING;
    }

    return AuditStatus.PASSED;
  }

  /**
   * Thống kê số lượng theo từng trạng thái
   */
  public getCounts(findings: RuleExecutionResult[]) {
    let passed = 0;
    let warning = 0;
    let failed = 0;

    for (const f of findings) {
      if (f.status === AuditStatus.PASSED) passed++;
      else if (f.status === AuditStatus.WARNING) warning++;
      else if (f.status === AuditStatus.FAILED) failed++;
    }

    return {
      total: findings.length,
      passed,
      warning,
      failed,
    };
  }
}

export const ruleEngine = new RuleEngine();
