// ==============================================================================
// Middleware Xác thực Người dùng qua JWT (Auth Middleware)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import type { UserRole } from '../types/auth.types';

/**
 * Middleware bắt buộc xác thực:
 * - Kiểm tra header Authorization (Bearer <token>)
 * - Giải mã và xác minh tính hợp lệ của token
 * - Gán thông tin người dùng vào `req.user`
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError(
        'Không tìm thấy thông tin xác thực. Vui lòng cung cấp Authorization header theo định dạng Bearer <token>.',
        'MISSING_AUTH_HEADER'
      );
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError(
        'Định dạng Authorization header không hợp lệ. Phải có tiền tố Bearer kèm khoảng trắng.',
        'MALFORMED_AUTH_HEADER'
      );
    }

    const token = parts[1];
    const payload = tokenService.verifyAccessToken(token);

    // Gán ngữ cảnh người dùng vào request để các tầng xử lý tiếp theo sử dụng
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware kiểm tra quyền hạn (Role-Based Access Control Guard)
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Yêu cầu xác thực tài khoản trước khi kiểm tra quyền.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Bạn không có quyền thực hiện hành động này. Vai trò yêu cầu: [${allowedRoles.join(', ')}], vai trò hiện tại: [${req.user.role}].`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
}
