// ==============================================================================
// Dịch vụ API Phân hệ Hồ sơ Quyết toán Thuế (Tax Profile API Service)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  TaxProfileDto,
  CreateProfileDto,
  UpdateProfileDto,
} from '../types/business.types';

export const profileApi = {
  /**
   * Lấy danh sách toàn bộ các kỳ quyết toán thuế của người dùng hiện tại
   * GET /profiles
   */
  async getProfiles(): Promise<ApiResponse<TaxProfileDto[]>> {
    return apiClient.get<TaxProfileDto[]>('/profiles');
  },

  /**
   * Xem chi tiết một hồ sơ quyết toán thuế theo ID
   * GET /profiles/:id
   */
  async getProfileById(id: string): Promise<ApiResponse<TaxProfileDto>> {
    return apiClient.get<TaxProfileDto>(`/profiles/${id}`);
  },

  /**
   * Khởi tạo kỳ quyết toán thuế mới (chống trùng lặp cùng năm tính thuế)
   * POST /profiles
   */
  async createProfile(payload: CreateProfileDto): Promise<ApiResponse<TaxProfileDto>> {
    return apiClient.post<TaxProfileDto>('/profiles', payload);
  },

  /**
   * Cập nhật thông tin hồ sơ quyết toán thuế
   * PUT /profiles/:id
   */
  async updateProfile(id: string, payload: UpdateProfileDto): Promise<ApiResponse<TaxProfileDto>> {
    return apiClient.put<TaxProfileDto>(`/profiles/${id}`, payload);
  },

  /**
   * Xóa hồ sơ quyết toán thuế (chỉ cho phép khi ở trạng thái draft)
   * DELETE /profiles/:id
   */
  async deleteProfile(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/profiles/${id}`);
  },
};

export default profileApi;
