// ==============================================================================
// Tầng Điều khiển Hồ sơ Quyết toán Thuế (Profile Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError, ValidationError } from '../errors/app-error';

export class ProfileController {
  /**
   * Endpoint: GET /api/profiles
   * Lấy danh sách hồ sơ quyết toán của người dùng (tự động lọc theo tax_year nếu có)
   * Trả về: HTTP 200 OK
   */
  public async getProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const taxYear = req.query.tax_year ? parseInt(req.query.tax_year as string, 10) : undefined;
      const list = await profileService.getUserProfiles(req.user, taxYear, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách hồ sơ quyết toán thuế thành công.',
        data: list,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/profiles
   * Tạo mới một kỳ quyết toán thuế
   * Trả về: HTTP 201 Created
   */
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const result = await profileService.createProfile(req.user, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 201,
        message: `Khởi tạo kỳ quyết toán thuế năm ${result.taxYear} thành công.`,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/profiles/:id
   * Lấy chi tiết hồ sơ thuế theo ID
   * Trả về: HTTP 200 OK
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const profileId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!profileId) throw new ValidationError('Mã hồ sơ thuế là bắt buộc.');

      const result = await profileService.getProfileById(req.user, profileId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy chi tiết hồ sơ quyết toán thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/profiles/:id
   * Cập nhật thông tin hồ sơ quyết toán thuế
   * Trả về: HTTP 200 OK
   */
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const profileId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!profileId) throw new ValidationError('Mã hồ sơ thuế là bắt buộc.');

      const result = await profileService.updateProfile(req.user, profileId, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Cập nhật hồ sơ quyết toán thuế thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: DELETE /api/profiles/:id
   * Xóa hồ sơ quyết toán thuế (chỉ cho phép khi ở trạng thái draft)
   * Trả về: HTTP 200 OK
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const profileId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!profileId) throw new ValidationError('Mã hồ sơ thuế là bắt buộc.');

      await profileService.deleteProfile(req.user, profileId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Xóa hồ sơ quyết toán thuế thành công.',
        data: null,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
