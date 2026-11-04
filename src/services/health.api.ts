// ==============================================================================
// Dịch vụ Kiểm chứng Kết nối & Sức khỏe Máy chủ (Health Check API Service)
// Hệ thống: ThuTra TNCN - Tầng 1: Network Layer
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse, HealthCheckData } from '../types/api.types';

export const healthApi = {
  /**
   * Gọi trực tiếp endpoint kiểm tra tình trạng sức khỏe máy chủ Backend (/api/health)
   */
  async checkHealth(): Promise<ApiResponse<HealthCheckData>> {
    return apiClient.get<HealthCheckData>('/health');
  },

  /**
   * Kiểm tra nhanh trạng thái máy chủ Backend còn sống và phản hồi không (Ping)
   * Trả về true nếu thành công 200 OK, false nếu mất kết nối hoặc lỗi mạng
   */
  async pingServer(): Promise<boolean> {
    try {
      const response = await this.checkHealth();
      return Boolean(response && response.success && response.statusCode === 200);
    } catch {
      return false;
    }
  },

  /**
   * Lấy số giây máy chủ Backend đã hoạt động liên tục (Uptime)
   */
  async getServerUptime(): Promise<number | null> {
    try {
      const response = await this.checkHealth();
      return response.data?.uptimeSeconds ?? null;
    } catch {
      return null;
    }
  },
};

export default healthApi;
