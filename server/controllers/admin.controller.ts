// ==============================================================================
// Tầng Điều khiển Quản trị Hệ thống & Kiểm toán (Admin Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError } from '../errors/app-error';

export class AdminController {
  /**
   * Endpoint: GET /api/admin/rules
   * Lấy danh sách toàn bộ quy tắc thẩm tra (15 rules)
   * Quyền: admin_manager hoặc super_admin
   * Trả về: HTTP 200 OK
   */
  public async getRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rules = await adminService.getAllRules(req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách quy tắc thẩm tra thành công.',
        data: rules,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/admin/rules/:id
   * Lấy chi tiết 1 quy tắc theo ID hoặc Code (ví dụ: R01, R02...)
   * Quyền: admin_manager hoặc super_admin
   * Trả về: HTTP 200 OK
   */
  public async getRuleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      const rule = await adminService.getRuleById(id, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy thông tin chi tiết quy tắc thẩm tra thành công.',
        data: rule,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/admin/rules/:id
   * Cập nhật quy tắc thẩm tra, tự động tăng version & lưu lịch sử audit trail
   * Quyền: super_admin
   * Trả về: HTTP 200 OK
   */
  public async updateRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      const updatedRule = await adminService.updateRule(
        req.user,
        id,
        req.body,
        req.dbClient
      );

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Cập nhật cấu hình quy tắc thẩm tra thành công.',
        data: updatedRule,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/admin/audit-logs
   * Lấy danh sách nhật ký kiểm toán hệ thống có phân trang & che mờ dữ liệu Nghị định 13
   * Quyền: admin_manager hoặc super_admin
   * Trả về: HTTP 200 OK
   */
  public async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const result = await adminService.getAuditLogs(req.query, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách nhật ký kiểm toán hệ thống thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
