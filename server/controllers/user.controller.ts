// ==============================================================================
// Tầng Điều khiển Người dùng & Cài đặt Tài khoản (User Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError } from '../errors/app-error';

export class UserController {
  /**
   * Endpoint: PUT /api/users/profile
   * Cập nhật thông tin cá nhân (họ tên, địa chỉ, cơ quan thuế, SĐT)
   * Trả về: HTTP 200 OK
   */
  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const updatedUser = await authService.updateProfile(req.user, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Cập nhật thông tin cá nhân thành công.',
        data: updatedUser,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/users/change-password
   * Đổi mật khẩu tài khoản
   * Trả về: HTTP 200 OK
   */
  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      await authService.changePassword(req.user, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Đổi mật khẩu thành công. Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo.',
        data: null,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
