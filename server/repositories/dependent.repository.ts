// ==============================================================================
// Tầng Truy cập Dữ liệu Người phụ thuộc (Dependent Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  DependentDbEntity, 
  CreateDependentDto, 
  UpdateDependentDto 
} from '../types/dependent.types';

export class DependentRepository {
  /**
   * Lấy danh sách người phụ thuộc thuộc hồ sơ thuế (RLS kiểm soát)
   */
  public async findAllByProfileId(
    client: PoolClient,
    profileId: string
  ): Promise<DependentDbEntity[]> {
    const query = `
      SELECT *
      FROM dependents
      WHERE profile_id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      ORDER BY created_at ASC;
    `;
    const res = await client.query<DependentDbEntity>(query, [profileId]);
    return res.rows;
  }

  /**
   * Xem chi tiết người phụ thuộc theo ID
   */
  public async findById(
    client: PoolClient,
    id: string
  ): Promise<DependentDbEntity | null> {
    const query = `
      SELECT *
      FROM dependents
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const res = await client.query<DependentDbEntity>(query, [id]);
    return res.rows[0] || null;
  }

  /**
   * Tìm người phụ thuộc theo số CCCD trong cùng một hồ sơ thuế (chống khai trùng)
   */
  public async findByProfileAndCccd(
    client: PoolClient,
    profileId: string,
    cccd: string
  ): Promise<DependentDbEntity | null> {
    const query = `
      SELECT *
      FROM dependents
      WHERE profile_id = $1 AND cccd = $2 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;
    const res = await client.query<DependentDbEntity>(query, [profileId, cccd]);
    return res.rows[0] || null;
  }

  /**
   * Đăng ký người phụ thuộc mới
   */
  public async create(
    client: PoolClient,
    userId: string,
    dto: CreateDependentDto
  ): Promise<DependentDbEntity> {
    const monthlyDeduction = 4400000;
    const totalDeduction = dto.monthsApplied * monthlyDeduction;

    const query = `
      INSERT INTO dependents (
        profile_id,
        user_id,
        full_name,
        relation_type,
        relation_title,
        cccd,
        mst,
        has_mst,
        date_of_birth,
        is_valid_cqt,
        start_month,
        end_month,
        months_applied,
        monthly_deduction,
        total_deduction,
        commitment_checked,
        proof_document_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING *;
    `;

    const values = [
      dto.profileId,
      userId,
      dto.fullName,
      dto.relationType,
      dto.relationTitle || null,
      dto.cccd,
      dto.mst || null,
      dto.hasMst || false,
      dto.dateOfBirth || null,
      dto.isValidCqt !== undefined ? dto.isValidCqt : true,
      dto.startMonth,
      dto.endMonth,
      dto.monthsApplied,
      monthlyDeduction,
      totalDeduction,
      dto.commitmentChecked !== undefined ? dto.commitmentChecked : true,
      dto.proofDocumentId || null,
    ];

    const res = await client.query<DependentDbEntity>(query, values);
    return res.rows[0];
  }

  /**
   * Cập nhật thông tin người phụ thuộc
   */
  public async update(
    client: PoolClient,
    id: string,
    dto: UpdateDependentDto
  ): Promise<DependentDbEntity | null> {
    let deductionUpdateClause = '';
    const monthlyDeduction = 4400000;

    // Nếu có cập nhật monthsApplied thì tính lại total_deduction
    let totalDeduction: number | null = null;
    if (dto.monthsApplied !== undefined) {
      totalDeduction = dto.monthsApplied * monthlyDeduction;
      deductionUpdateClause = `, total_deduction = ${totalDeduction}`;
    }

    const query = `
      UPDATE dependents
      SET 
        full_name = COALESCE($2, full_name),
        relation_type = COALESCE($3, relation_type),
        relation_title = COALESCE($4, relation_title),
        cccd = COALESCE($5, cccd),
        mst = COALESCE($6, mst),
        has_mst = COALESCE($7, has_mst),
        date_of_birth = COALESCE($8, date_of_birth),
        is_valid_cqt = COALESCE($9, is_valid_cqt),
        start_month = COALESCE($10, start_month),
        end_month = COALESCE($11, end_month),
        months_applied = COALESCE($12, months_applied),
        commitment_checked = COALESCE($13, commitment_checked),
        proof_document_id = COALESCE($14, proof_document_id)
        ${deductionUpdateClause},
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING *;
    `;

    const values = [
      id,
      dto.fullName ?? null,
      dto.relationType ?? null,
      dto.relationTitle ?? null,
      dto.cccd ?? null,
      dto.mst ?? null,
      dto.hasMst ?? null,
      dto.dateOfBirth ?? null,
      dto.isValidCqt ?? null,
      dto.startMonth ?? null,
      dto.endMonth ?? null,
      dto.monthsApplied ?? null,
      dto.commitmentChecked ?? null,
      dto.proofDocumentId ?? null,
    ];

    const res = await client.query<DependentDbEntity>(query, values);
    return res.rows[0] || null;
  }

  /**
   * Xóa người phụ thuộc (trả về bản ghi bị xóa để biết profile_id phục vụ đồng bộ)
   */
  public async delete(
    client: PoolClient,
    id: string
  ): Promise<DependentDbEntity | null> {
    const query = `
      DELETE FROM dependents
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING *;
    `;
    const res = await client.query<DependentDbEntity>(query, [id]);
    return res.rows[0] || null;
  }
}

export const dependentRepository = new DependentRepository();
