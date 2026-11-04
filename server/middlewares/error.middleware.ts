// ==============================================================================
// Middleware Xử lý Lỗi Toàn cục (Global Exception Handler)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import type { ApiErrorResponse } from '../types/api.types';
import { env } from '../config/env.config';

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Đã xảy ra lỗi nội bộ máy chủ. Vui lòng thử lại sau.';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errors: Array<{ field?: string; message: string; code?: string }> | undefined = undefined;

  // 1. Trường hợp lỗi nghiệp vụ được định nghĩa sẵn (AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    errors = err.errors;
  }
  // 2. Lỗi cơ sở dữ liệu PostgreSQL (Mã lỗi chuẩn PG)
  else if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Dữ liệu đã tồn tại trong hệ thống (vi phạm ràng buộc duy nhất).';
        errorCode = 'DUPLICATE_RESOURCE';
        break;

      case '42501': // insufficient_privilege (RLS Policy từ chối truy cập)
        statusCode = 403;
        message = 'Bạn bị từ chối truy cập bởi chính sách bảo mật phân quyền dữ liệu (RLS Violation).';
        errorCode = 'RLS_ACCESS_DENIED';
        break;

      case '22P02': // invalid_text_representation (ví dụ: UUID không hợp lệ)
        statusCode = 400;
        message = 'Định dạng dữ liệu định danh (UUID) không hợp lệ.';
        errorCode = 'INVALID_IDENTIFIER';
        break;

      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Thao tác vi phạm ràng buộc liên kết dữ liệu cha-con.';
        errorCode = 'FOREIGN_KEY_VIOLATION';
        break;

      default:
        console.error('[Unhandled PostgreSQL Error]:', err);
        message = 'Lỗi truy vấn cơ sở dữ liệu.';
        errorCode = `DB_ERROR_${err.code}`;
        break;
    }
  }
  // 3. Lỗi JSON cú pháp request body
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Cú pháp JSON trong request body không hợp lệ.';
    errorCode = 'INVALID_JSON_BODY';
  } else {
    console.error('[Unhandled Server Exception]:', err);
  }

  const responseBody: ApiErrorResponse = {
    success: false,
    statusCode,
    message,
    errorCode,
    errors,
    timestamp: new Date().toISOString(),
  };

  // Trong môi trường development, bổ sung stack trace để debug nhanh
  if (env.NODE_ENV === 'development' && !(err instanceof AppError)) {
    (responseBody as any).debugStack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}
