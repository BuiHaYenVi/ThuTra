// ==============================================================================
// Cấu hình Database PostgreSQL & Quản lý Ngữ cảnh RLS Session
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env.config';
import type { UserContext } from '../types/auth.types';

// Khởi tạo Connection Pool
export const pool = new Pool(
  env.DB.connectionString
    ? {
        connectionString: env.DB.connectionString,
        max: env.DB.maxPool,
        idleTimeoutMillis: env.DB.idleTimeoutMillis,
        connectionTimeoutMillis: env.DB.connectionTimeoutMillis,
        ssl: env.DB.ssl,
      }
    : {
        host: env.DB.host,
        port: env.DB.port,
        user: env.DB.user,
        password: env.DB.password,
        database: env.DB.database,
        max: env.DB.maxPool,
        idleTimeoutMillis: env.DB.idleTimeoutMillis,
        connectionTimeoutMillis: env.DB.connectionTimeoutMillis,
        ssl: env.DB.ssl,
      }
);

// Lắng nghe các sự kiện vòng đời kết nối
pool.on('connect', () => {
  // Client mới vừa được tạo và nối vào pool
});

pool.on('error', (err: Error) => {
  console.error('[PostgreSQL Pool Error]: Sự cố kết nối ngoài dự kiến', err.message);
});

/**
 * Thiết lập cấu hình cục bộ RLS cho phiên làm việc PostgreSQL
 * Sử dụng hàm chuẩn PostgreSQL `set_config(..., ..., is_local = true)`
 * tương đương với cú pháp:
 *   SET LOCAL app.current_user_id = '<userId>';
 *   SET LOCAL app.current_user_role = '<role>';
 *
 * Lưu ý quan trọng: `is_local = true` đảm bảo biến chỉ tồn tại trong TRANSACTION hiện tại,
 * tự động biến mất khi COMMIT hoặc ROLLBACK, ngăn chặn 100% rò rỉ sang request khác.
 */
export async function applyRlsSessionContext(
  client: PoolClient,
  userContext: UserContext | null | undefined
): Promise<void> {
  const userId = userContext?.id || '';
  const userRole = userContext?.role || '';

  await client.query(
    `SELECT set_config('app.current_user_id', $1, true),
            set_config('app.current_user_role', $2, true);`,
    [userId, userRole]
  );
}

/**
 * Khôi phục trạng thái kết nối sạch sẽ (Clean/Reset Session)
 * Biện pháp phòng vệ chuyên sâu trước khi trả kết nối về Pool
 */
export async function cleanResetClientSession(client: PoolClient): Promise<void> {
  try {
    // Xóa bỏ tất cả biến cấu hình cục bộ session nếu transaction chưa hoàn tất
    await client.query(`
      SELECT set_config('app.current_user_id', '', false),
             set_config('app.current_user_role', '', false);
    `);
  } catch (err) {
    // Nếu kết nối đã bị đóng hoặc lỗi, bỏ qua
  }
}

/**
 * Transaction Wrapper tích hợp sẵn RLS Context
 * Tự động quản lý: BEGIN -> SET LOCAL RLS -> Chạy Logic -> COMMIT / ROLLBACK -> Clean Release
 */
export async function withUserContext<T>(
  userContext: UserContext | null | undefined,
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await applyRlsSessionContext(client, userContext);

    const result = await operation(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[Database Rollback Error]:', rollbackError);
    }
    throw error;
  } finally {
    await cleanResetClientSession(client);
    client.release();
  }
}

/**
 * Truy vấn nhanh có áp dụng RLS context
 */
export async function queryWithRls<R extends QueryResultRow = any>(
  userContext: UserContext | null | undefined,
  text: string,
  params: any[] = []
): Promise<QueryResult<R>> {
  return withUserContext(userContext, async (client) => {
    return client.query<R>(text, params);
  });
}

/**
 * Kiểm tra kết nối tới cơ sở dữ liệu khi khởi động ứng dụng
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT current_database() as db_name, version();');
    console.log(`[Database Connected]: Kết nối thành công tới database '${res.rows[0].db_name}'`);
    return true;
  } catch (error: any) {
    console.warn(`[Database Warning]: Chưa kết nối được tới PostgreSQL: ${error.message}`);
    return false;
  } finally {
    if (client) client.release();
  }
}
