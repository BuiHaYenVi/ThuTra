// ==============================================================================
// Dịch vụ API Chatbot AI Hỏi đáp Pháp luật Thuế (Tax Chat API Service)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';

export interface ChatMessageItem {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

export interface ChatRequestDto {
  question: string;
  history?: ChatMessageItem[];
  profileId?: string;
}

export interface LegalReferenceDto {
  code: string;
  title: string;
  category?: string;
  relevantArticle?: string;
}

export interface TaxActionSuggestionDto {
  actionType: 'NAVIGATE_WIZARD_STEP1' | 'NAVIGATE_WIZARD_STEP2' | 'NAVIGATE_WIZARD_STEP3' | 'ADD_DEPENDENT' | 'UPLOAD_DOC' | 'NONE';
  label: string;
  description: string;
}

export interface ChatResponseDto {
  id: string;
  sender: 'bot';
  timestamp: string;
  answer: string;
  confidenceScore: number;
  legalReferences: LegalReferenceDto[];
  keyTakeaways: string[];
  suggestedAction?: TaxActionSuggestionDto;
  suggestedFollowUpQuestions: string[];
}

export interface ChatTopicSuggestionDto {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'deduction' | 'income' | 'audit' | 'deadline' | 'freelance';
}

export const chatApi = {
  /**
   * Lấy danh sách các chủ đề câu hỏi tư vấn thuế được gợi ý
   * GET /chat/suggestions
   */
  async getSuggestions(): Promise<ApiResponse<ChatTopicSuggestionDto[]>> {
    return apiClient.get<ChatTopicSuggestionDto[]>('/chat/suggestions');
  },

  /**
   * Gửi câu hỏi và nhận câu trả lời phân tích pháp lý AI
   * POST /chat/ask
   */
  async askQuestion(payload: ChatRequestDto): Promise<ApiResponse<ChatResponseDto>> {
    return apiClient.post<ChatResponseDto>('/chat/ask', payload);
  },
};

export default chatApi;
