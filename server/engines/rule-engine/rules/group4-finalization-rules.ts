// ==============================================================================
// Nhóm 4: Quyết toán, Ủy quyền & Ngưỡng Rủi ro (R12 - R15)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { BaseRule } from '../rule.interface';
import { AuditContext, RuleExecutionResult, AuditSeverity, AuditStatus } from '../../../types/audit.types';

/**
 * R12: Đánh giá điều kiện ủy quyền quyết toán thay tại tổ chức chi trả
 */
export class RuleR12AuthorizationEligibility implements BaseRule {
  public readonly code = 'R12';
  public readonly name = 'Kiểm tra điều kiện ủy quyền quyết toán thay';
  public readonly defaultSeverity = AuditSeverity.CRITICAL;
  public readonly category = 'FINALIZATION_POLICY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const isMultiSource = context.incomeSources.length >= 2;
    const isAuthorized = context.profile.isAuthorizedFinalization;

    if (isMultiSource && isAuthorized) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.FAILED,
        message: 'Vi phạm điều kiện ủy quyền: Cá nhân có thu nhập từ 2 nơi trở lên trong năm không thuộc diện được ủy quyền quyết toán thay.',
        details: {
          incomeSourcesCount: context.incomeSources.length,
          isAuthorizedFinalization: isAuthorized,
        },
        suggestedFix: 'Theo Điểm d Khoản 6 Điều 8 Nghị định 126/2020/NĐ-CP, bạn phải trực tiếp kê khai quyết toán thuế với Cơ quan Thuế (sử dụng Mẫu 02/QTT-TNCN), không được ủy quyền cho cơ quan chi trả.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Hình thức kê khai quyết toán (trực tiếp hoặc ủy quyền) phù hợp với quy định hiện hành.',
    };
  }
}

/**
 * R13: Số tiền đề nghị hoàn thuế vượt ngưỡng kiểm toán tự động
 */
export class RuleR13HighRefundThreshold implements BaseRule {
  public readonly code = 'R13';
  public readonly name = 'Kiểm tra ngưỡng tiền hoàn thuế tự động';
  public readonly defaultSeverity = AuditSeverity.INFO;
  public readonly category = 'FINALIZATION_POLICY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const refund = context.calculation.taxRefund;

    // Ngưỡng hoàn thuế lớn (> 50 triệu VNĐ) cần lưu ý hồ sơ chứng từ gốc chặt chẽ
    if (refund >= 50000000) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Số tiền đề nghị hoàn thuế lớn (${refund.toLocaleString('vi-VN')} VNĐ). Cần chuẩn bị đầy đủ chứng từ gốc đối chiếu với Kho Bạc Nhà nước.`,
        details: { refundAmount: refund },
        suggestedFix: 'Đảm bảo thông tin số tài khoản ngân hàng chính chủ khớp 100% với CCCD để Cục Thuế duyệt lệnh hoàn tiền nhanh chóng qua Napas.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Số tiền hoàn thuế nằm trong ngưỡng thẩm tra tự động thông thường.',
    };
  }
}

/**
 * R14: Rủi ro nộp hồ sơ quyết toán trễ hạn đối với trường hợp phát sinh thuế phải nộp thêm
 */
export class RuleR14LateFilingRisk implements BaseRule {
  public readonly code = 'R14';
  public readonly name = 'Cảnh báo rủi ro nộp hồ sơ quyết toán trễ hạn';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'FINALIZATION_POLICY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const taxPayable = context.calculation.taxPayable;
    const taxYear = context.profile.taxYear;
    const currentYear = new Date().getFullYear();

    // Hạn chót quyết toán cá nhân trực tiếp thường là ngày cuối cùng của tháng thứ 4 (02/05)
    // Nếu có thuế phải nộp thêm và quyết toán kỳ quá khứ
    if (taxPayable > 0 && taxYear < currentYear) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Hồ sơ có số thuế phải nộp thêm ${taxPayable.toLocaleString('vi-VN')} VNĐ cho kỳ thuế ${taxYear}. Nguy cơ phát sinh tiền phạt chậm nộp 0.03%/ngày theo Luật Quản lý Thuế.`,
        details: { taxPayable, taxYear },
        suggestedFix: 'Nộp ngay số tiền thuế phát sinh vào Kho Bạc Nhà nước thông qua ứng dụng eTax Mobile để dừng tính tiền chậm nộp.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Không phát sinh rủi ro tiền phạt chậm nộp hồ sơ quyết toán thuế.',
    };
  }
}

/**
 * R15: Đánh giá tổng hợp mức độ rủi ro giải trình thanh tra thuế
 */
export class RuleR15ComprehensiveRiskScore implements BaseRule {
  public readonly code = 'R15';
  public readonly name = 'Đánh giá mức độ rủi ro giải trình tổng hợp';
  public readonly defaultSeverity = AuditSeverity.INFO;
  public readonly category = 'FINALIZATION_POLICY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const multiSources = context.incomeSources.length >= 2;
    const hasUnverifiedDocs = context.documents.some((d) => d.verification_status === 'unverified');
    const largeRefund = context.calculation.taxRefund > 30000000;

    let riskFactorsCount = 0;
    if (multiSources) riskFactorsCount++;
    if (hasUnverifiedDocs) riskFactorsCount++;
    if (largeRefund) riskFactorsCount++;

    if (riskFactorsCount >= 2) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: 'Hồ sơ có nhiều yếu tố cần giải trình (đa nguồn thu, tiền hoàn lớn hoặc chứng từ chưa chuẩn hóa).',
        details: { riskFactorsCount, multiSources, hasUnverifiedDocs, largeRefund },
        suggestedFix: 'Khuyến nghị rà soát kỹ bảng kê Form 02/QTT-TNCN và tải đủ các chứng từ khấu trừ điện tử trước khi nộp.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Mức độ rủi ro hồ sơ thấp, đủ điều kiện thông quan quyết toán tự động.',
    };
  }
}
