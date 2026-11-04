// ==============================================================================
// Tầng Điều khiển Tham số Hệ thống (Setting Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { settingService } from '../services/setting.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError } from '../errors/app-error';

export class SettingController {
  /**
   * Endpoint: GET /api/settings/public
   * Lấy danh mục tham số thuế công khai và biểu 7 bậc lũy tiến (Không yêu cầu token)
   * Trả về: HTTP 200 OK
   */
  public async getPublicSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const result = await settingService.getPublicSettings(req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy cấu hình tham số thuế công khai thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/settings
   * Cập nhật tham số hệ thống (Yêu cầu quyền super_admin)
   * Trả về: HTTP 200 OK
   */
  public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      if (!req.dbClient) throw new Error('Database Session Client không được khởi tạo.');

      const result = await settingService.updateSettings(req.user, req.body, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const settingController = new SettingController();
