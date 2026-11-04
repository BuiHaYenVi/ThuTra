// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Quản trị Hệ thống & Kiểm toán (Admin Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { PoolClient } from 'pg';
import { adminRepository } from '../repositories/admin.repository';
import { 
  TaxRuleDbEntity, 
  TaxRuleResponseDto, 
  UpdateTaxRuleDto, 
  AuditLogResponseDto, 
  AuditLogQueryDto 
} from '../types/admin.types';
import type { UserContext } from '../types/auth.types';
import { 
  NotFoundError, 
  ForbiddenError 
} from '../errors/app-error';
import { maskCccd, maskMst, maskEmail } from '../utils/data-masking.util';

export class AdminService {
  /**
   * Chuyển đổi Entity TaxRule từ DB sang Response DTO (camelCase)
   */
  private mapRuleToDto(entity: TaxRuleDbEntity): TaxRuleResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      title: entity.title,
      description: entity.description,
      legalReference: entity.legal_reference,
      riskLevel: entity.risk_level,
      riskLevelLabel: entity.risk_level_label,
      category: entity.category,
      executionFrequency: entity.execution_frequency,
      conditionSnippet: entity.condition_snippet,
      isActive: entity.is_active,
      version: entity.version,
      updatedByName: entity.updated_by_name,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  /**
   * Tự động tăng version của rule (Ví dụ: v2.4 -> v2.5, v1.0 -> v1.1)
   */
  private bumpVersion(currentVersion: string): string {
    const match = currentVersion.match(/^v?(\d+)(?:\.(\d+))?$/);
    if (match) {
      const major = match[1];
      const minor = match[2] ? parseInt(match[2], 10) + 1 : 1;
      return `v${major}.${minor}`;
    }
    return `${currentVersion}.1`;
  }

  /**
   * Lấy danh sách toàn bộ 15 quy tắc thẩm tra (tax_rules)
   */
  public async getAllRules(client: PoolClient): Promise<TaxRuleResponseDto[]> {
    const rules = await adminRepository.getAllRules(client);
    return rules.map((r) => this.mapRuleToDto(r));
  }

  /**
   * Lấy chi tiết cấu hình của 1 quy tắc theo ID hoặc Code
   */
  public async getRuleById(id: string, client: PoolClient): Promise<TaxRuleResponseDto> {
    const rule = await adminRepository.getRuleById(client, id);
    if (!rule) {
      throw new NotFoundError(`Không tìm thấy quy tắc thẩm tra với mã/ID '${id}'.`);
    }
    return this.mapRuleToDto(rule);
  }

  /**
   * Cập nhật quy tắc thẩm tra (Chỉ Super Admin có quyền)
   * Tự động tăng version và ghi bản ghi vào tax_rule_history
   */
  public async updateRule(
    user: UserContext,
    id: string,
    dto: UpdateTaxRuleDto,
    client: PoolClient
  ): Promise<TaxRuleResponseDto> {
    if (user.role !== 'super_admin') {
      throw new ForbiddenError(
        'Cán bộ quản lý (admin_manager) chỉ có quyền đọc (Read-only), không có quyền chỉnh sửa quy tắc thẩm tra.',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    const currentRule = await adminRepository.getRuleById(client, id);
    if (!currentRule) {
      throw new NotFoundError(`Không tìm thấy quy tắc thẩm tra với mã/ID '${id}'.`);
    }

    // 1. Tự động tăng số hiệu phiên bản (version)
    const newVersion = this.bumpVersion(currentRule.version);
    let updaterName = user.fullName || user.email;
    const userRes = await client.query<{ full_name: string }>(
      'SELECT full_name FROM users WHERE id = $1 LIMIT 1;',
      [user.id]
    );
    if (userRes.rows.length > 0 && userRes.rows[0].full_name) {
      updaterName = userRes.rows[0].full_name;
    }

    // 2. Chuẩn bị snapshot lịch sử thay đổi dạng JSON
    const historyNote = JSON.stringify({
      versionOld: currentRule.version,
      versionNew: newVersion,
      changedBy: user.id,
      changeReason: dto.changeReason || 'Cập nhật cấu hình quy tắc thẩm tra định kỳ',
      snapshotOld: {
        isActive: currentRule.is_active,
        conditionSnippet: currentRule.condition_snippet,
        description: currentRule.description,
        riskLevel: currentRule.risk_level,
      },
      snapshotNew: {
        isActive: dto.isActive !== undefined ? dto.isActive : currentRule.is_active,
        conditionSnippet: dto.conditionSnippet !== undefined ? dto.conditionSnippet : currentRule.condition_snippet,
        description: dto.description !== undefined ? dto.description : currentRule.description,
        riskLevel: dto.riskLevel !== undefined ? dto.riskLevel : currentRule.risk_level,
      },
    });

    // 3. Mở Savepoint để bảo đảm tính toàn vẹn 2 bảng tax_rules & tax_rule_history
    await client.query('SAVEPOINT update_rule_sp;');
    try {
      // Ghi lịch sử
      await adminRepository.insertRuleHistory(client, {
        ruleId: currentRule.id,
        version: newVersion,
        editorName: updaterName,
        note: historyNote,
      });

      // Cập nhật quy tắc
      const updated = await adminRepository.updateRule(
        client,
        currentRule.id,
        newVersion,
        updaterName,
        dto
      );

      await client.query('RELEASE SAVEPOINT update_rule_sp;');

      return this.mapRuleToDto(updated!);
    } catch (error) {
      await client.query('ROLLBACK TO SAVEPOINT update_rule_sp;');
      throw error;
    }
  }

  /**
   * Lấy danh sách nhật ký kiểm toán hệ thống (Audit Logs)
   * Áp dụng bắt buộc Data Masking theo Nghị định 13/2023/NĐ-CP
   */
  public async getAuditLogs(
    query: AuditLogQueryDto,
    client: PoolClient
  ): Promise<{
    items: AuditLogResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));

    const { rows, total } = await adminRepository.getAuditLogs(client, {
      page,
      limit,
      actionType: query.action,
    });

    const items: AuditLogResponseDto[] = rows.map((r) => ({
      id: r.id,
      profileId: r.profile_id,
      userId: r.user_id,
      operator: r.operator,
      purpose: r.purpose,
      actionType: r.action_type,
      // Che mờ 100% dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP
      maskedCccd: maskCccd(r.masked_cccd),
      maskedMst: maskMst(r.masked_mst),
      maskedEmail: maskEmail(r.user_email),
      userFullName: r.user_full_name,
      triggeredRules: Array.isArray(r.triggered_rules) ? r.triggered_rules : [],
      violationDetails: typeof r.violation_details === 'string' ? JSON.parse(r.violation_details) : r.violation_details || {},
      minimizationStatus: r.minimization_status || 'Tuân thủ 100%',
      clientIp: r.client_ip,
      createdAt: r.created_at,
    }));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const adminService = new AdminService();
