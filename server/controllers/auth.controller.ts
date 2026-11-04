// ==============================================================================
// Tầng Điều khiển Xác thực (Authentication Controller)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError } from '../errors/app-error';

export class AuthController {
  /**
   * Endpoint: POST /api/auth/register
   * Đăng ký tài khoản người nộp thuế mới
   * Trả về: HTTP 201 Created
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'Đăng ký tài khoản thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/auth/login
   * Đăng nhập tài khoản, xác thực mật khẩu và cấp phát JWT token
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Đăng nhập thành công vào hệ thống ThuTra TNCN.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/auth/me
   * Lấy thông tin tài khoản người dùng hiện tại (chạy qua RLS Session Context)
   */
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }

      const userProfile = await authService.getMe(req.user.id, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy thông tin tài khoản người dùng thành công.',
        data: userProfile,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/auth/logout
   * Đăng xuất và thu hồi phiên làm việc
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      await authService.logout(token);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Đăng xuất thành công. Phiên làm việc đã được thu hồi an toàn.',
        data: null,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
