// ==============================================================================
// Tầng Điều khiển Nguồn Thu nhập (Income Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { incomeService } from '../services/income.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError, ValidationError } from '../errors/app-error';

export class IncomeController {
  /**
   * Endpoint: GET /api/income-sources
   * Lấy danh sách nguồn thu nhập theo profileId
   * Trả về: HTTP 200 OK
   */
  public async getIncomeSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const profileId = req.query.profileId as string;
      if (!profileId) {
        throw new ValidationError('Mã hồ sơ thuế (profileId) là bắt buộc trong query parameters.');
      }

      const list = await incomeService.getIncomeSources(req.user, profileId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách nguồn thu nhập thành công.',
        data: list,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/income-sources
   * Thêm mới một nguồn thu nhập
   * Trả về: HTTP 201 Created
   */
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const result = await incomeService.createIncomeSource(req.user, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'Thêm mới nguồn thu nhập thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/income-sources/:id
   * Xem chi tiết một nguồn thu nhập
   * Trả về: HTTP 200 OK
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) throw new ValidationError('Mã nguồn thu nhập là bắt buộc.');

      const result = await incomeService.getIncomeSourceById(req.user, id, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy chi tiết nguồn thu nhập thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/income-sources/:id
   * Cập nhật số liệu nguồn thu nhập
   * Trả về: HTTP 200 OK
   */
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) throw new ValidationError('Mã nguồn thu nhập là bắt buộc.');

      const result = await incomeService.updateIncomeSource(req.user, id, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Cập nhật nguồn thu nhập thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: DELETE /api/income-sources/:id
   * Xóa nguồn thu nhập
   * Trả về: HTTP 200 OK
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) throw new ValidationError('Mã nguồn thu nhập là bắt buộc.');

      await incomeService.deleteIncomeSource(req.user, id, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Xóa nguồn thu nhập thành công.',
        data: null,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const incomeController = new IncomeController();
