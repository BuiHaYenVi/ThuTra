// ==============================================================================
// Nhóm 2: Thu nhập & Khấu trừ tại nguồn (R05 - R08)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { BaseRule } from '../rule.interface';
import { AuditContext, RuleExecutionResult, AuditSeverity, AuditStatus } from '../../../types/audit.types';
import { TaxCalculatorEngine } from '../../tax-calculator.engine';

/**
 * R05: Sai lệch tổng thu nhập giữa chứng từ khấu trừ và dữ liệu nguồn thu khai báo
 */
export class RuleR05IncomeDiscrepancy implements BaseRule {
  public readonly code = 'R05';
  public readonly name = 'Đối soát sai lệch thu nhập kê khai và chứng từ';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'INCOME_WITHHOLDING';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const totalIncomeFromSources = context.incomeSources.reduce(
      (sum, s) => sum + Number(s.totalTaxableIncome || s.totalIncomeGross || 0),
      0
    );

    const totalIncomeFromDocs = context.documents.reduce((sum, d) => {
      const payload = typeof d.ocr_extracted_payload === 'string'
        ? JSON.parse(d.ocr_extracted_payload)
        : d.ocr_extracted_payload || {};
      return sum + Number(payload.gross_income || 0);
    }, 0);

    const diff = Math.abs(totalIncomeFromSources - totalIncomeFromDocs);

    if (context.documents.length > 0 && context.incomeSources.length > 0 && diff > 1000) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Chênh lệch ${TaxCalculatorEngine.roundCurrency(diff).toLocaleString('vi-VN')} VNĐ giữa tổng thu nhập kê khai (${totalIncomeFromSources.toLocaleString('vi-VN')} VNĐ) và tổng số tiền trên chứng từ điện tử (${totalIncomeFromDocs.toLocaleString('vi-VN')} VNĐ).`,
        details: {
          totalIncomeFromSources,
          totalIncomeFromDocs,
          difference: diff,
        },
        suggestedFix: 'Đối chiếu lại bảng kê thu nhập với các chứng từ khấu trừ để đảm bảo số liệu trên tờ khai 02/QTT khớp 100% với chứng từ lưu trữ.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Số liệu tổng thu nhập giữa chứng từ khấu trừ và nguồn thu khai báo hoàn toàn trùng khớp.',
    };
  }
}

/**
 * R06: Số thuế TNCN đã khấu trừ vượt quá tổng thu nhập chịu thuế (Lỗi nghiêm trọng)
 */
export class RuleR06ExcessiveWithholding implements BaseRule {
  public readonly code = 'R06';
  public readonly name = 'Kiểm tra trần khấu trừ thuế so với tổng thu nhập';
  public readonly defaultSeverity = AuditSeverity.CRITICAL;
  public readonly category = 'INCOME_WITHHOLDING';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    // 1. Kiểm tra trên từng chứng từ
    const invalidDocs: Array<{ fileName: string; gross: number; deducted: number }> = [];

    for (const doc of context.documents) {
      const payload = typeof doc.ocr_extracted_payload === 'string'
        ? JSON.parse(doc.ocr_extracted_payload)
        : doc.ocr_extracted_payload || {};

      const gross = Number(payload.gross_income || 0);
      const deducted = Number(payload.tax_deducted || 0);

      if (gross > 0 && deducted > gross) {
        invalidDocs.push({ fileName: doc.file_name, gross, deducted });
      }
    }

    // 2. Kiểm tra trên tổng thể bảng tính
    const isOverallInvalid =
      context.calculation.grossIncome > 0 &&
      context.calculation.taxDeducted > context.calculation.grossIncome;

    if (invalidDocs.length > 0 || isOverallInvalid) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.FAILED,
        message: 'Lỗi phi logic kế toán: Số thuế TNCN đã khấu trừ lớn hơn tổng thu nhập chịu thuế phát sinh.',
        details: {
          invalidDocs,
          totalGrossIncome: context.calculation.grossIncome,
          totalTaxDeducted: context.calculation.taxDeducted,
        },
        suggestedFix: 'Kiểm tra lại số tiền bóc tách trên chứng từ. Số thuế khấu trừ tại nguồn không thể vượt quá 100% tổng thu nhập đã chi trả.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Số thuế TNCN đã khấu trừ nằm trong phạm vi hợp lý so với tổng thu nhập.',
    };
  }
}

/**
 * R07: Kiểm tra tỷ lệ khấu trừ thuế tại nguồn bất thường (so với các mức chuẩn 10%, 20%)
 */
export class RuleR07AbnormalTaxRate implements BaseRule {
  public readonly code = 'R07';
  public readonly name = 'Kiểm tra tỷ lệ khấu trừ thuế tại nguồn bất thường';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'INCOME_WITHHOLDING';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const abnormalSources: Array<{ name: string; rate: number; gross: number; deducted: number }> = [];

    for (const src of context.incomeSources) {
      const gross = Number(src.totalIncomeGross || 0);
      const deducted = Number(src.taxWithheld || 0);

      if (gross >= 2000000 && deducted > 0) {
        const actualRate = (deducted / gross) * 100;
        // Tỷ lệ khấu trừ vãng lai thông thường là 10% hoặc 20% (người không cư trú)
        // Nếu tỷ lệ bất thường (> 35% hoặc nằm ngoài biên độ thông thường)
        if (actualRate > 35) {
          abnormalSources.push({
            name: src.payerName,
            rate: Math.round(actualRate * 10) / 10,
            gross,
            deducted,
          });
        }
      }
    }

    if (abnormalSources.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Phát hiện ${abnormalSources.length} nguồn thu có tỷ lệ khấu trừ thuế tại nguồn cao bất thường (> 35%).`,
        details: { abnormalSources },
        suggestedFix: 'Xác minh lại với kế toán đơn vị chi trả xem khoản thu nhập có bị tính trùng thuế hoặc sai thuế suất quy định.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Tỷ lệ khấu trừ tại nguồn của các tổ chức chi trả đều tuân thủ các ngưỡng chuẩn mực.',
    };
  }
}

/**
 * R08: Cảnh báo phát sinh thu nhập từ nhiều nguồn nhưng chưa kê khai đủ chứng từ
 */
export class RuleR08MultipleSourcesUnmatched implements BaseRule {
  public readonly code = 'R08';
  public readonly name = 'Cảnh báo thiếu chứng từ khấu trừ từ nhiều nguồn thu';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'INCOME_WITHHOLDING';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const sourcesCount = context.incomeSources.length;
    const docsCount = context.documents.length;

    if (sourcesCount >= 2 && docsCount < sourcesCount) {
      const missingCount = sourcesCount - docsCount;
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Hồ sơ có ${sourcesCount} nguồn thu nhập nhưng mới chỉ tải lên ${docsCount} chứng từ thuế (còn thiếu khoảng ${missingCount} chứng từ).`,
        details: { sourcesCount, docsCount, missingCount },
        suggestedFix: 'Vui lòng liên hệ các tổ chức chi trả còn lại để lấy chứng từ khấu trừ thuế điện tử (mẫu 02/QTT) trước khi nộp quyết toán.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Số lượng chứng từ thuế tải lên tương xứng với các nguồn thu nhập kê khai.',
    };
  }
}
