// ==============================================================================
// Nhóm 3: Người phụ thuộc & Giảm trừ gia cảnh (R09 - R11)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { BaseRule } from '../rule.interface';
import { AuditContext, RuleExecutionResult, AuditSeverity, AuditStatus } from '../../../types/audit.types';

/**
 * R09: Trùng lặp người phụ thuộc giữa các cá nhân/hồ sơ thuế (theo CCCD/Mã định danh)
 */
export class RuleR09DuplicateDependents implements BaseRule {
  public readonly code = 'R09';
  public readonly name = 'Phát hiện trùng lặp Người phụ thuộc';
  public readonly defaultSeverity = AuditSeverity.CRITICAL;
  public readonly category = 'DEPENDENTS';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const cccdMap = new Map<string, number>();
    const duplicateCccds: string[] = [];

    for (const dep of context.dependents) {
      const cleanCccd = (dep.cccd || '').trim().replace(/\s/g, '');
      if (cleanCccd) {
        const count = (cccdMap.get(cleanCccd) || 0) + 1;
        cccdMap.set(cleanCccd, count);
        if (count === 2) {
          duplicateCccds.push(cleanCccd);
        }
      }
    }

    if (duplicateCccds.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.FAILED,
        message: `Phát hiện ${duplicateCccds.length} người phụ thuộc bị trùng lặp số định danh/CCCD trong cùng hồ sơ: [${duplicateCccds.join(', ')}].`,
        details: { duplicateCccds },
        suggestedFix: 'Theo Điều 9 Thông tư 111/2013/TT-BTC, mỗi người phụ thuộc chỉ được tính giảm trừ một lần vào một người nộp thuế trong cùng năm tính thuế. Vui lòng xóa bớt bản ghi trùng.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Không phát hiện trùng lặp mã định danh/CCCD của người phụ thuộc trong hồ sơ.',
    };
  }
}

/**
 * R10: Người phụ thuộc thiếu thông tin định danh hợp lệ (CCCD/Giấy khai sinh / MST NPT)
 */
export class RuleR10DependentIdValidity implements BaseRule {
  public readonly code = 'R10';
  public readonly name = 'Kiểm tra tính đầy đủ thông tin định danh Người phụ thuộc';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'DEPENDENTS';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const invalidDeps: Array<{ name: string; reason: string }> = [];

    for (const dep of context.dependents) {
      const cleanCccd = (dep.cccd || '').trim().replace(/\s/g, '');

      // Kiểm tra định dạng CCCD chuẩn 12 số (hoặc CMND cũ 9 số)
      if (!/^[0-9]{9}([0-9]{3})?$/.test(cleanCccd)) {
        invalidDeps.push({
          name: dep.fullName,
          reason: `Số CCCD/Định danh '${dep.cccd}' không đúng định dạng 12 số hoặc 9 số.`,
        });
      } else if (!dep.hasMst && !dep.mst) {
        // Chưa đăng ký MST người phụ thuộc
        invalidDeps.push({
          name: dep.fullName,
          reason: 'Chưa có Mã số thuế người phụ thuộc được cấp bởi Cục Thuế.',
        });
      }
    }

    if (invalidDeps.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Có ${invalidDeps.length} người phụ thuộc chưa hoàn thiện đủ thông tin định danh hoặc chưa có MST cá nhân NPT.`,
        details: { invalidDeps },
        suggestedFix: 'Bổ sung ngay MST cá nhân hoặc bản chụp CCCD gắn chip của NPT để hồ sơ quyết toán không bị Cơ quan Thuế từ chối tiếp nhận.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Toàn bộ người phụ thuộc đăng ký giảm trừ đều có thông tin định danh và MST hợp lệ.',
    };
  }
}

/**
 * R11: Số tháng tính giảm trừ người phụ thuộc vượt quá 12 tháng trong năm tính thuế
 */
export class RuleR11DependentMonthsLimit implements BaseRule {
  public readonly code = 'R11';
  public readonly name = 'Kiểm tra giới hạn số tháng giảm trừ Người phụ thuộc';
  public readonly defaultSeverity = AuditSeverity.CRITICAL;
  public readonly category = 'DEPENDENTS';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const invalidMonths: Array<{ name: string; months: number }> = [];

    for (const dep of context.dependents) {
      const months = Number(dep.monthsApplied || 0);
      if (months > 12 || months < 1) {
        invalidMonths.push({ name: dep.fullName, months });
      }
    }

    if (invalidMonths.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.FAILED,
        message: `Phát hiện ${invalidMonths.length} người phụ thuộc có số tháng đăng ký giảm trừ không hợp lệ (vượt quá 12 tháng hoặc nhỏ hơn 1 tháng trong năm tính thuế).`,
        details: { invalidMonths },
        suggestedFix: 'Điều chỉnh lại khoảng thời gian tính giảm trừ (Từ tháng - Đến tháng) trong năm tính thuế tối đa không quá 12 tháng/năm.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Số tháng đăng ký giảm trừ gia cảnh của người phụ thuộc đều tuân thủ giới hạn tối đa 12 tháng/năm.',
    };
  }
}
