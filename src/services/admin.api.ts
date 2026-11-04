// ==============================================================================
// Dịch vụ API Phân hệ Quản trị & Tham số Hệ thống (Admin & Settings API Service)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  PublicSettingsDto,
  UpdateSettingsRequestDto,
  TaxRuleDto,
  UpdateTaxRuleDto,
  AuditLogQueryDto,
  AuditLogsResponseDto,
} from '../types/business.types';

export const adminApi = {
  /**
   * Lấy danh mục tham số thuế công khai và biểu lũy tiến 7 bậc (Public, không cần Bearer token)
   * GET /settings/public
   */
  async getPublicSettings(): Promise<ApiResponse<PublicSettingsDto>> {
    return apiClient.get<PublicSettingsDto>('/settings/public');
  },

  /**
   * Cập nhật tham số hệ thống (chỉ Super Admin có quyền)
   * PUT /settings
   */
  async updateSettings(payload: UpdateSettingsRequestDto): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/settings', payload);
  },

  /**
   * Lấy danh mục toàn bộ 15 quy tắc thẩm tra kèm trạng thái và căn cứ pháp lý
   * GET /admin/rules (Dành cho admin_manager & super_admin)
   */
  async getAdminRules(): Promise<ApiResponse<TaxRuleDto[]>> {
    return apiClient.get<TaxRuleDto[]>('/admin/rules');
  },

  /**
   * Xem chi tiết cấu hình và ngưỡng kiểm tra của 1 quy tắc theo ID hoặc Code (ví dụ: R01, R10)
   * GET /admin/rules/:id
   */
  async getAdminRuleById(id: string): Promise<ApiResponse<TaxRuleDto>> {
    return apiClient.get<TaxRuleDto>(`/admin/rules/${id}`);
  },

  /**
   * Cập nhật quy tắc thẩm tra, tự động tăng version và ghi bản ghi vào tax_rule_history
   * PUT /admin/rules/:id (Chỉ Super Admin có quyền)
   */
  async updateAdminRule(id: string, payload: UpdateTaxRuleDto): Promise<ApiResponse<TaxRuleDto>> {
    return apiClient.put<TaxRuleDto>(`/admin/rules/${id}`, payload);
  },

  /**
   * Xem nhật ký kiểm toán hệ thống có phân trang và đã che mờ CCCD/MST/Email theo Nghị định 13/2023
   * GET /admin/audit-logs
   */
  async getAuditLogs(query?: AuditLogQueryDto): Promise<ApiResponse<AuditLogsResponseDto>> {
    return apiClient.get<AuditLogsResponseDto>('/admin/audit-logs', {
      params: query,
    });
  },
};

export default adminApi;
