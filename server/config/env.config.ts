// ==============================================================================
// Quản lý Cấu hình Biến môi trường (Environment Configuration)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import dotenv from 'dotenv';
import path from 'path';

// Nạp file .env từ thư mục gốc
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Database PostgreSQL
  DB: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '2026',
    database: process.env.PGDATABASE || 'thutra_tncn',
    maxPool: parseInt(process.env.PGMAX_POOL || '20', 10),
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT || '5000', 10),
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  },

  // JWT Tokens
  JWT: {
    secret: process.env.JWT_SECRET || 'thutra_tncn_jwt_secure_access_secret_key_2026_!@#$',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s', // 1 giờ
    expiresInSeconds: 3600,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'thutra_tncn_jwt_secure_refresh_secret_key_2026_!@#$',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d', // 7 ngày
    refreshExpiresInSeconds: 7 * 24 * 3600,
  },

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
