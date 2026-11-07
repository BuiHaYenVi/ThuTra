// ==============================================================================
// Tầng Điều khiển API Chatbot AI Thuế TNCN (Tax Chat Controller)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { ApiResponse } from '../types/api.types';
import { ValidationError } from '../errors/app-error';

export class ChatController {
  /**
   * Lấy danh sách câu hỏi gợi ý phổ biến
   */
  public getSuggestions(_req: Request, res: Response, _next: NextFunction): void {
    const data = chatService.getTopicSuggestions();
    const response: ApiResponse = {
      success: true,
      statusCode: 200,
      message: 'Lấy danh mục câu hỏi tư vấn thuế thành công.',
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  }

  /**
   * Gửi câu hỏi và nhận phân tích pháp lý AI
   */
  public async askQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string' || !question.trim()) {
        throw new ValidationError('Nội dung câu hỏi (question) là bắt buộc và không được để trống.');
      }

      const data = await chatService.answerQuestion(req.dbClient, req.body);
      const response: ApiResponse = {
        success: true,
        statusCode: 200,
        message: 'Trích xuất căn cứ pháp lý và trả lời câu hỏi thành công.',
        data,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
