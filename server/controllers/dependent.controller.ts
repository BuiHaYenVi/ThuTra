// ==============================================================================
// Tầng Điều khiển Người phụ thuộc (Dependent Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { dependentService } from '../services/dependent.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError, ValidationError } from '../errors/app-error';

export class DependentController {
  /**
   * Endpoint: GET /api/dependents
   * Lấy danh sách người phụ thuộc theo profileId
   * Trả về: HTTP 200 OK
   */
  public async getDependents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const profileId = req.query.profileId as string;
      if (!profileId) {
        throw new ValidationError('Mã hồ sơ thuế (profileId) là bắt buộc trong query parameters.');
      }

      const list = await dependentService.getDependents(req.user, profileId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách người phụ thuộc thành công.',
        data: list,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/dependents
   * Đăng ký người phụ thuộc mới
   * Trả về: HTTP 201 Created
   */
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const result = await dependentService.createDependent(req.user, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'Đăng ký người phụ thuộc thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/dependents/:id
   * Xem chi tiết người phụ thuộc
   * Trả về: HTTP 200 OK
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) throw new ValidationError('Mã người phụ thuộc là bắt buộc.');

      const result = await dependentService.getDependentById(req.user, id, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy chi tiết người phụ thuộc thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/dependents/:id
   * Cập nhật thông tin hoặc số tháng giảm trừ
   * Trả về: HTTP 200 OK
   */
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) throw new ValidationError('Mã người phụ thuộc là bắt buộc.');

      const result = await dependentService.updateDependent(req.user, id, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Cập nhật thông tin người phụ thuộc thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: DELETE /api/dependents/:id
   * Xóa người phụ thuộc
   * Trả về: HTTP 200 OK
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) throw new ValidationError('Mã người phụ thuộc là bắt buộc.');

      await dependentService.deleteDependent(req.user, id, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Xóa người phụ thuộc thành công.',
        data: null,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const dependentController = new DependentController();
