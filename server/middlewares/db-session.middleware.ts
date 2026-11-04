// ==============================================================================
// Middleware Quản lý Phiên Cơ sở dữ liệu & Ngữ cảnh RLS (DB Session Middleware)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { pool, applyRlsSessionContext, cleanResetClientSession } from '../config/database';

/**
 * Database Session Middleware:
 * 1. Mượn một kết nối chuyên dụng (dedicated client) từ PostgreSQL Connection Pool.
 * 2. Mở một Transaction: `BEGIN`.
 * 3. Thiết lập biến cấu hình cục bộ RLS tương ứng với danh tính người dùng:
 *      SET LOCAL app.current_user_id = '<userId>';
 *      SET LOCAL app.current_user_role = '<role>';
 * 4. Đính kèm `client` vào `req.dbClient` để Repository/Service thực hiện truy vấn.
 * 5. Tự động lắng nghe vòng đời kết thúc của HTTP response:
 *    - Thành công (Status < 400): Tự động `COMMIT`.
 *    - Lỗi (Status >= 400 hoặc Abort): Tự động `ROLLBACK`.
 *    - Cuối cùng: Chạy `cleanResetClientSession` và giải phóng (`release`) client về Pool.
 */
export async function dbSessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  let client: PoolClient | undefined;
  let isReleased = false;

  const safeRelease = async (commit: boolean) => {
    if (isReleased || !client) return;
    isReleased = true;

    try {
      if (req.hasActiveTransaction) {
        if (commit) {
          await client.query('COMMIT');
        } else {
          await client.query('ROLLBACK');
        }
      }
    } catch (err: any) {
      console.error('[DB Session Middleware Error khi kết thúc transaction]:', err.message);
    } finally {
      try {
        await cleanResetClientSession(client);
      } catch (cleanErr: any) {
        console.error('[DB Session Reset Warning]:', cleanErr.message);
      }
      client.release();
      req.dbClient = undefined;
      req.hasActiveTransaction = false;
    }
  };

  try {
    // 1. Lấy kết nối từ pool
    const activeClient = await pool.connect();
    client = activeClient;
    req.dbClient = activeClient;

    // 2. Bắt đầu transaction và thiết lập biến RLS cục bộ
    await activeClient.query('BEGIN');
    req.hasActiveTransaction = true;

    await applyRlsSessionContext(activeClient, req.user);

    // 3. Đăng ký hooks lắng nghe sự kiện kết thúc HTTP response
    res.on('finish', async () => {
      const isSuccess = res.statusCode < 400;
      await safeRelease(isSuccess);
    });

    res.on('close', async () => {
      // Kết nối bị ngắt đột ngột trước khi hoàn tất phản hồi
      if (!isReleased) {
        await safeRelease(false);
      }
    });

    next();
  } catch (error) {
    if (client && !isReleased) {
      await safeRelease(false);
    }
    next(error);
  }
}
