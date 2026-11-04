// ==============================================================================
// Tầng Điều khiển Thẩm tra & Quyết toán Thuế (Audit Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError, ValidationError } from '../errors/app-error';

export class AuditController {
  /**
   * Endpoint: POST /api/audit/calculate
   * Tính thử nhanh số thuế TNCN và bảng kê 7 bậc (không lưu database)
   * Trả về: HTTP 200 OK
   */
  public calculate(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = auditService.calculateQuickTax(req.body);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Tính toán chiết tính thuế TNCN lũy tiến thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/audit/run/:profileId
   * Kích hoạt toàn bộ bộ máy thẩm tra 15 rules và tính toán nghĩa vụ thuế
   * Trả về: HTTP 200 OK
   */
  public async runAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const rawProfileId = req.params.profileId;
      const profileId = Array.isArray(rawProfileId) ? rawProfileId[0] : rawProfileId;

      if (!profileId) {
        throw new ValidationError('Mã hồ sơ thuế (profileId) là bắt buộc.');
      }

      const result = await auditService.runAudit(req.user, profileId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: `Thẩm tra hồ sơ thuế hoàn tất với trạng thái: ${result.status}.`,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/audit/history/:profileId
   * Lấy lịch sử các lần thẩm tra của hồ sơ thuế
   * Trả về: HTTP 200 OK
   */
  public async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const rawProfileId = req.params.profileId;
      const profileId = Array.isArray(rawProfileId) ? rawProfileId[0] : rawProfileId;

      if (!profileId) {
        throw new ValidationError('Mã hồ sơ thuế (profileId) là bắt buộc.');
      }

      const runs = await auditService.getAuditHistory(req.user, profileId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy lịch sử các phiên thẩm tra thành công.',
        data: runs,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/audit/report/:auditRunId
   * Xem báo cáo chi tiết một phiên thẩm tra (15 rules, bảng kê 7 bậc, hướng dẫn khắc phục)
   * Trả về: HTTP 200 OK
   */
  public async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const rawRunId = req.params.auditRunId;
      const auditRunId = Array.isArray(rawRunId) ? rawRunId[0] : rawRunId;

      if (!auditRunId) {
        throw new ValidationError('Mã phiên thẩm tra (auditRunId) là bắt buộc.');
      }

      const report = await auditService.getAuditReport(req.user, auditRunId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy chi tiết báo cáo thẩm tra thành công.',
        data: report,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
