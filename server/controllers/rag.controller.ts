// ==============================================================================
// Tầng Điều khiển API Kho Tri thức Pháp lý RAG (RAG Document Controller)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { ragService } from '../services/rag.service';
import { ApiResponse } from '../types/api.types';
import { UnauthorizedError } from '../errors/app-error';

export class RagController {
  public async getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const data = await ragService.getDocuments(req.dbClient!, search);
      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy danh mục văn bản quy phạm pháp luật thành công.',
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await ragService.getDocumentById(req.dbClient!, id);
      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Lấy chi tiết văn bản thành công.',
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async createDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await ragService.createDocument(req.dbClient!, req.user, req.body);
      const response: ApiResponse = {
        success: true,
        statusCode: 201,
        message: 'Thêm mới văn bản quy phạm pháp luật vào kho RAG thành công.',
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await ragService.updateDocument(req.dbClient!, id, req.body);
      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Cập nhật văn bản pháp lý thành công.',
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await ragService.deleteDocument(req.dbClient!, id);
      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Đã xóa văn bản khỏi kho tri thức pháp lý.',
        data: null,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async syncVector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await ragService.syncVector(req.dbClient!, id);
      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: data.message,
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const ragController = new RagController();
