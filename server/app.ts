// ==============================================================================
// Thiết lập Ứng dụng Express (Express Application Setup)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { mainApiRouter } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { NotFoundError } from './errors/app-error';

export const app = express();

// 1. Cấu hình bảo mật CORS linh hoạt cho các môi trường phát triển Vite
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

if (env.CORS_ORIGIN && env.CORS_ORIGIN !== '*') {
  env.CORS_ORIGIN.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((origin) => allowedOrigins.add(origin));
}

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Cho phép các request không có header origin (ví dụ: curl, mobile app, Postman)
      if (!requestOrigin) return callback(null, true);

      if (
        env.CORS_ORIGIN === '*' ||
        allowedOrigins.has(requestOrigin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
  })
);

// 2. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Logger ghi nhận request đơn giản
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (env.NODE_ENV !== 'test') {
    const timestamp = new Date().toISOString();
    console.log(`[HTTP Request] ${timestamp} | ${req.method} ${req.originalUrl}`);
  }
  next();
});

// 4. Gắn toàn bộ router chính của API
app.use('/api', mainApiRouter);

// 5. Xử lý Route không tồn tại (404 Handler)
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên máy chủ.`));
});

// 6. Global Exception Middleware (phải đặt ở vị trí cuối cùng)
app.use(errorMiddleware);
