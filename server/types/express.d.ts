// ==============================================================================
// Mở rộng kiểu dữ liệu Express Request để đính kèm Ngữ cảnh RLS & DB Client
// ==============================================================================

import type { PoolClient } from 'pg';
import type { UserContext } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      /**
       * Ngữ cảnh người dùng đã được giải mã từ JWT qua Auth Middleware
       */
      user?: UserContext;

      /**
       * Dedicated Client kết nối PostgreSQL đã thiết lập session RLS
       * (SET LOCAL app.current_user_id & SET LOCAL app.current_user_role)
       */
      dbClient?: PoolClient;

      /**
       * Cờ đánh dấu transaction đang hoạt động trong scope của request
       */
      hasActiveTransaction?: boolean;
    }
  }
}

export {};
