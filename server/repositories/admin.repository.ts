// ==============================================================================
// Tầng Truy cập Dữ liệu Quản trị & Quy tắc (Admin Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  TaxRuleDbEntity, 
  UpdateTaxRuleDto, 
  AuditLogDbEntity 
} from '../types/admin.types';

export class AdminRepository {
  /**
   * Truy vấn danh sách toàn bộ 15 quy tắc thẩm tra (tax_rules)
   */
  public async getAllRules(client: PoolClient): Promise<TaxRuleDbEntity[]> {
    const query = `
      SELECT 
        id,
        code,
        title,
        description,
        legal_reference,
        risk_level,
        risk_level_label,
        category,
        execution_frequency,
        condition_snippet,
        is_active,
        version,
        updated_by_name,
        created_at,
        updated_at
      FROM tax_rules
      ORDER BY code ASC;
    `;
    const res = await client.query<TaxRuleDbEntity>(query);
    return res.rows;
  }

  /**
   * Truy vấn chi tiết một quy tắc theo ID (hoặc code)
   */
  public async getRuleById(client: PoolClient, id: string): Promise<TaxRuleDbEntity | null> {
    const query = `
      SELECT *
      FROM tax_rules
      WHERE id::text = $1 OR code = $1
      LIMIT 1;
    `;
    const res = await client.query<TaxRuleDbEntity>(query, [id]);
    return res.rows[0] || null;
  }

  /**
   * Cập nhật quy tắc thẩm tra (version được tự động tăng)
   */
  public async updateRule(
    client: PoolClient,
    id: string,
    newVersion: string,
    updaterName: string,
    dto: UpdateTaxRuleDto
  ): Promise<TaxRuleDbEntity | null> {
    const query = `
      UPDATE tax_rules
      SET 
        is_active = COALESCE($2, is_active),
        condition_snippet = COALESCE($3, condition_snippet),
        description = COALESCE($4, description),
        title = COALESCE($5, title),
        risk_level = COALESCE($6::rule_risk_level, risk_level),
        risk_level_label = COALESCE($7, risk_level_label),
        version = $8,
        updated_by_name = $9,
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1
      RETURNING *;
    `;

    const res = await client.query<TaxRuleDbEntity>(query, [
      id,
      dto.isActive ?? null,
      dto.conditionSnippet ?? null,
      dto.description ?? null,
      dto.title ?? null,
      dto.riskLevel ?? null,
      dto.riskLevelLabel ?? null,
      newVersion,
      updaterName,
    ]);

    return res.rows[0] || null;
  }

  /**
   * Ghi nhận một bản ghi lịch sử cập nhật quy tắc vào bảng tax_rule_history
   */
  public async insertRuleHistory(
    client: PoolClient,
    data: {
      ruleId: string;
      version: string;
      editorName: string;
      note: string;
    }
  ): Promise<void> {
    const query = `
      INSERT INTO tax_rule_history (
        rule_id,
        version,
        editor_name,
        note
      ) VALUES (
        $1, $2, $3, $4
      );
    `;

    await client.query(query, [
      data.ruleId,
      data.version,
      data.editorName,
      data.note,
    ]);
  }

  /**
   * Lấy danh sách nhật ký kiểm toán hệ thống (có phân trang và lọc action)
   */
  public async getAuditLogs(
    client: PoolClient,
    options: {
      page: number;
      limit: number;
      actionType?: string;
    }
  ): Promise<{ rows: AuditLogDbEntity[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const params: any[] = [];

    let whereClause = '';
    if (options.actionType) {
      params.push(options.actionType);
      whereClause = `WHERE al.action_type = $${params.length}`;
    }

    params.push(options.limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const query = `
      SELECT 
        al.id,
        al.profile_id,
        al.user_id,
        al.operator,
        al.purpose,
        al.action_type,
        al.masked_cccd,
        al.masked_mst,
        al.triggered_rules,
        al.violation_details,
        al.minimization_status,
        al.retention_expires_at,
        al.client_ip,
        al.created_at,
        u.email AS user_email,
        u.full_name AS user_full_name,
        COUNT(*) OVER() AS total_count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const res = await client.query<any>(query, params);
    const total = res.rows.length > 0 ? Number(res.rows[0].total_count) : 0;

    return {
      rows: res.rows,
      total,
    };
  }
}

export const adminRepository = new AdminRepository();
