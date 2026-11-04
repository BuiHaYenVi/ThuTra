// ==============================================================================
// Tầng Điều khiển Chứng từ Thuế (Document Controller)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import type { ApiResponse } from '../types/api.types';
import { UnauthorizedError } from '../errors/app-error';

export class DocumentController {
  /**
   * Endpoint: POST /api/documents/upload
   * Tải lên chứng từ thuế (multipart/form-data), bóc tách OCR AI và lưu nháp
   * Trả về: HTTP 201 Created
   */
  public async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const file = req.file!;
      const dto = {
        docType: req.body.docType,
        taxYear: req.body.taxYear ? parseInt(req.body.taxYear, 10) : undefined,
      };

      const result = await documentService.uploadDocument(req.user, file, dto, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'Tải lên và bóc tách chứng từ OCR thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/documents
   * Lấy danh sách chứng từ của người dùng (tự động phân trang & lọc qua RLS)
   * Trả về: HTTP 200 OK
   */
  public async getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const queryParams = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        docType: req.query.docType as any,
        status: req.query.status as any,
        taxYear: req.query.taxYear ? parseInt(req.query.taxYear as string, 10) : undefined,
      };

      const result = await documentService.getDocuments(req.user, queryParams, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách chứng từ thuế thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: GET /api/documents/:id
   * Lấy chi tiết một chứng từ kèm dữ liệu bóc tách OCR thô
   * Trả về: HTTP 200 OK
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const documentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await documentService.getDocumentById(req.user, documentId, req.dbClient);

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy thông tin chi tiết chứng từ thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: PUT /api/documents/:id/confirm
   * Xác nhận số liệu sau khi đối soát (chuyển trạng thái sang verified_manual)
   * Trả về: HTTP 200 OK
   */
  public async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const documentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await documentService.confirmDocument(
        req.user,
        documentId,
        req.body,
        req.dbClient
      );

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Xác nhận số liệu chứng từ thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint: DELETE /api/documents/:id
   * Xóa chứng từ khỏi cơ sở dữ liệu và xóa tệp vật lý trên đĩa
   * Trả về: HTTP 200 OK
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Phiên xác thực không tồn tại.');
      }
      if (!req.dbClient) {
        throw new Error('Database Session Client không được khởi tạo.');
      }

      const documentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await documentService.deleteDocument(
        req.user,
        documentId,
        req.dbClient
      );

      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: result.message,
        data: { deletedId: result.deletedId },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
