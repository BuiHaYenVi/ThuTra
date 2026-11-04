// ==============================================================================
// Tầng Truy cập Dữ liệu Người dùng (User Repository / DAO)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { PoolClient } from 'pg';
import { pool } from '../config/database';
import type { UserDbEntity, AuthUserDto } from '../types/auth.types';

export class UserRepository {
  /**
   * Tìm người dùng bằng địa chỉ email (phục vụ đối soát mật khẩu khi đăng nhập)
   */
  public async findByEmail(email: string, client?: PoolClient): Promise<UserDbEntity | null> {
    const runner = client || pool;
    const queryText = `
      SELECT 
        id, email, phone, password_hash, full_name, cccd, mst,
        date_of_birth, address, tax_department_code, tax_department_name,
        role, status, is_vneid_verified, vneid_level, two_factor_enabled,
        avatar_url, created_at, updated_at, last_login_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;

    const result = await runner.query<UserDbEntity>(queryText, [email]);
    return result.rows[0] || null;
  }

  /**
   * Truy vấn thông tin người dùng theo ID (đã bảo mật, KHÔNG chứa password_hash)
   * Chạy dưới ngữ cảnh RLS session để đảm bảo tính an toàn dữ liệu
   */
  public async findById(id: string, client?: PoolClient): Promise<AuthUserDto | null> {
    const runner = client || pool;
    const queryText = `
      SELECT 
        id,
        email,
        phone,
        full_name AS "fullName",
        cccd,
        mst,
        role,
        status,
        is_vneid_verified AS "isVneidVerified",
        vneid_level AS "vneidLevel",
        two_factor_enabled AS "twoFactorEnabled",
        avatar_url AS "avatarUrl",
        tax_department_code AS "taxDepartmentCode",
        tax_department_name AS "taxDepartmentName",
        created_at AS "createdAt",
        last_login_at AS "lastLoginAt"
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await runner.query<AuthUserDto>(queryText, [id]);
    return result.rows[0] || null;
  }

  /**
   * Tìm người dùng bằng số CCCD (chống trùng lặp định danh)
   */
  public async findByCccd(cccd: string, client?: PoolClient): Promise<UserDbEntity | null> {
    const runner = client || pool;
    const queryText = `
      SELECT 
        id, email, phone, password_hash, full_name, cccd, mst,
        date_of_birth, address, tax_department_code, tax_department_name,
        role, status, is_vneid_verified, vneid_level, two_factor_enabled,
        avatar_url, created_at, updated_at, last_login_at
      FROM users
      WHERE cccd = $1
      LIMIT 1;
    `;

    const result = await runner.query<UserDbEntity>(queryText, [cccd]);
    return result.rows[0] || null;
  }

  /**
   * Tạo tài khoản người nộp thuế mới
   */
  public async create(
    data: {
      email: string;
      passwordHash: string;
      fullName: string;
      phone?: string;
      cccd?: string;
    },
    client?: PoolClient
  ): Promise<AuthUserDto> {
    const runner = client || pool;
    const queryText = `
      INSERT INTO users (
        email, password_hash, full_name, phone, cccd, role, status
      ) VALUES (
        LOWER($1), $2, $3, $4, $5, 'user', 'active'
      )
      RETURNING 
        id,
        email,
        phone,
        full_name AS "fullName",
        cccd,
        mst,
        role,
        status,
        is_vneid_verified AS "isVneidVerified",
        vneid_level AS "vneidLevel",
        two_factor_enabled AS "twoFactorEnabled",
        avatar_url AS "avatarUrl",
        tax_department_code AS "taxDepartmentCode",
        tax_department_name AS "taxDepartmentName",
        created_at AS "createdAt",
        last_login_at AS "lastLoginAt";
    `;

    const result = await runner.query<AuthUserDto>(queryText, [
      data.email,
      data.passwordHash,
      data.fullName,
      data.phone || null,
      data.cccd || null,
    ]);

    return result.rows[0];
  }

  /**
   * Cập nhật thông tin cá nhân của người dùng
   */
  public async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      phone?: string;
      address?: string;
      taxDepartmentCode?: string;
      taxDepartmentName?: string;
    },
    client?: PoolClient
  ): Promise<AuthUserDto | null> {
    const runner = client || pool;
    const queryText = `
      UPDATE users
      SET 
        full_name = COALESCE($2, full_name),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        tax_department_code = COALESCE($5, tax_department_code),
        tax_department_name = COALESCE($6, tax_department_name),
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1
      RETURNING 
        id,
        email,
        phone,
        full_name AS "fullName",
        cccd,
        mst,
        role,
        status,
        is_vneid_verified AS "isVneidVerified",
        vneid_level AS "vneidLevel",
        two_factor_enabled AS "twoFactorEnabled",
        avatar_url AS "avatarUrl",
        tax_department_code AS "taxDepartmentCode",
        tax_department_name AS "taxDepartmentName",
        created_at AS "createdAt",
        last_login_at AS "lastLoginAt";
    `;

    const result = await runner.query<AuthUserDto>(queryText, [
      userId,
      data.fullName || null,
      data.phone || null,
      data.address || null,
      data.taxDepartmentCode || null,
      data.taxDepartmentName || null,
    ]);

    return result.rows[0] || null;
  }

  /**
   * Lấy entity User đầy đủ (bao gồm password_hash) theo ID để kiểm tra mật khẩu cũ
   */
  public async findUserWithPasswordById(id: string, client?: PoolClient): Promise<UserDbEntity | null> {
    const runner = client || pool;
    const queryText = `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await runner.query<UserDbEntity>(queryText, [id]);
    return result.rows[0] || null;
  }

  /**
   * Cập nhật mật khẩu mới cho người dùng
   */
  public async updatePassword(userId: string, newPasswordHash: string, client?: PoolClient): Promise<void> {
    const runner = client || pool;
    const queryText = `
      UPDATE users
      SET 
        password_hash = $2,
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1;
    `;

    await runner.query(queryText, [userId, newPasswordHash]);
  }

  /**
   * Cập nhật thời điểm đăng nhập gần nhất (last_login_at)
   */
  public async updateLastLogin(id: string, client?: PoolClient): Promise<void> {
    const runner = client || pool;
    const queryText = `
      UPDATE users
      SET last_login_at = CLOCK_TIMESTAMP()
      WHERE id = $1;
    `;

    await runner.query(queryText, [id]);
  }
}

export const userRepository = new UserRepository();
