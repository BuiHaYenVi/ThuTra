// ==============================================================================
// Dịch vụ API Phân hệ Chứng từ Thuế & OCR AI (Document & OCR API Service)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  TaxDocumentDto,
  DocumentListResponseDto,
  ConfirmDocumentDto,
  DocumentListQueryDto,
} from '../types/business.types';
import type { AxiosProgressEvent } from 'axios';

export const documentApi = {
  /**
   * Tải lên tệp chứng từ thuế (PDF, JPG, PNG) và kích hoạt bóc tách OCR AI
   * POST /documents/upload
   */
  async uploadDocument(
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<ApiResponse<TaxDocumentDto>> {
    return apiClient.upload<TaxDocumentDto>('/documents/upload', formData, onUploadProgress);
  },

  /**
   * Lấy danh sách chứng từ cá nhân của người nộp thuế (có hỗ trợ phân trang & bộ lọc)
   * GET /documents
   */
  async getDocuments(query?: DocumentListQueryDto): Promise<ApiResponse<DocumentListResponseDto>> {
    return apiClient.get<DocumentListResponseDto>('/documents', {
      params: query,
    });
  },

  /**
   * Xem chi tiết chứng từ kèm kết quả bóc tách OCR thô và chữ ký điện tử
   * GET /documents/:id
   */
  async getDocumentById(id: string): Promise<ApiResponse<TaxDocumentDto>> {
    return apiClient.get<TaxDocumentDto>(`/documents/${id}`);
  },

  /**
   * Xác nhận số liệu đối soát chính thức (chuyển sang trạng thái verified_manual)
   * và tùy chọn tự động đồng bộ sang nguồn thu nhập
   * PUT /documents/:id/confirm
   */
  async confirmDocument(id: string, payload: ConfirmDocumentDto): Promise<ApiResponse<TaxDocumentDto>> {
    return apiClient.put<TaxDocumentDto>(`/documents/${id}/confirm`, payload);
  },

  /**
   * Xóa chứng từ trong cơ sở dữ liệu và xóa tệp tin vật lý trên đĩa cứng
   * DELETE /documents/:id
   */
  async deleteDocument(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/documents/${id}`);
  },
};

export default documentApi;
