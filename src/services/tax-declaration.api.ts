// ==============================================================================
// Dịch vụ API Phân hệ Nguồn Thu nhập & Người Phụ thuộc (Tax Declaration API)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  IncomeSourceDto,
  CreateIncomeSourceDto,
  UpdateIncomeSourceDto,
  DependentDto,
  CreateDependentDto,
  UpdateDependentDto,
} from '../types/business.types';

export const taxDeclarationApi = {
  // ============================================================================
  // 1. CÁC HÀM XỬ LÝ NGUỒN THU NHẬP (INCOME SOURCES)
  // ============================================================================

  /**
   * Lấy danh sách nguồn thu nhập theo mã hồ sơ quyết toán profileId
   * GET /income-sources?profileId=:profileId
   */
  async getIncomeSources(profileId: string): Promise<ApiResponse<IncomeSourceDto[]>> {
    return apiClient.get<IncomeSourceDto[]>('/income-sources', {
      params: { profileId },
    });
  },

  /**
   * Xem chi tiết một nguồn thu nhập theo ID
   * GET /income-sources/:id
   */
  async getIncomeSourceById(id: string): Promise<ApiResponse<IncomeSourceDto>> {
    return apiClient.get<IncomeSourceDto>(`/income-sources/${id}`);
  },

  /**
   * Khai báo thêm nguồn thu nhập mới (tự động đồng bộ số liệu sang hồ sơ quyết toán)
   * POST /income-sources
   */
  async createIncomeSource(payload: CreateIncomeSourceDto): Promise<ApiResponse<IncomeSourceDto>> {
    return apiClient.post<IncomeSourceDto>('/income-sources', payload);
  },

  /**
   * Cập nhật thông tin nguồn thu nhập (tự động tính toán lại hồ sơ)
   * PUT /income-sources/:id
   */
  async updateIncomeSource(id: string, payload: UpdateIncomeSourceDto): Promise<ApiResponse<IncomeSourceDto>> {
    return apiClient.put<IncomeSourceDto>(`/income-sources/${id}`, payload);
  },

  /**
   * Xóa nguồn thu nhập (tự động khấu trừ số liệu trong hồ sơ)
   * DELETE /income-sources/:id
   */
  async deleteIncomeSource(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/income-sources/${id}`);
  },

  // ============================================================================
  // 2. CÁC HÀM XỬ LÝ NGƯỜI PHỤ THUỘC (DEPENDENTS)
  // ============================================================================

  /**
   * Lấy danh sách người phụ thuộc theo mã hồ sơ quyết toán profileId
   * GET /dependents?profileId=:profileId
   */
  async getDependents(profileId: string): Promise<ApiResponse<DependentDto[]>> {
    return apiClient.get<DependentDto[]>('/dependents', {
      params: { profileId },
    });
  },

  /**
   * Xem chi tiết một người phụ thuộc theo ID
   * GET /dependents/:id
   */
  async getDependentById(id: string): Promise<ApiResponse<DependentDto>> {
    return apiClient.get<DependentDto>(`/dependents/${id}`);
  },

  /**
   * Đăng ký người phụ thuộc mới (tự động tính mức giảm trừ 4.4tr/tháng và sync vào hồ sơ)
   * POST /dependents
   */
  async createDependent(payload: CreateDependentDto): Promise<ApiResponse<DependentDto>> {
    return apiClient.post<DependentDto>('/dependents', payload);
  },

  /**
   * Cập nhật thông tin hoặc số tháng giảm trừ của người phụ thuộc
   * PUT /dependents/:id
   */
  async updateDependent(id: string, payload: UpdateDependentDto): Promise<ApiResponse<DependentDto>> {
    return apiClient.put<DependentDto>(`/dependents/${id}`, payload);
  },

  /**
   * Xóa người phụ thuộc (tự động cập nhật giảm trừ gia cảnh về 0 hoặc mức tương ứng)
   * DELETE /dependents/:id
   */
  async deleteDependent(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/dependents/${id}`);
  },
};

export default taxDeclarationApi;
