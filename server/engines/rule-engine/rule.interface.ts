// ==============================================================================
// Giao diện Chuẩn Quy tắc Thẩm tra Thuế (Rule Interface - Strategy Pattern)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { AuditContext, RuleExecutionResult, AuditSeverity } from '../../types/audit.types';

export interface BaseRule {
  readonly code: string;
  readonly name: string;
  readonly defaultSeverity: AuditSeverity;
  readonly category: string;

  /**
   * Thực thi thẩm tra quy tắc dựa trên ngữ cảnh toàn diện của hồ sơ thuế
   */
  execute(context: AuditContext): Promise<RuleExecutionResult>;
}
