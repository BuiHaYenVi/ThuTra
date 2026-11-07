// ==============================================================================
// Dịch vụ API Phân hệ Thẩm tra Thuế & Động cơ 15 Rules (Tax Audit API Service)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  AuditCalculationDto,
  AuditRunResultDto,
  AuditReportDto,
  TaxCalculationBreakdown,
} from '../types/business.types';

export const auditApi = {
  /**
   * Tính thử nhanh số thuế TNCN theo biểu lũy tiến 7 bậc (không lưu vào cơ sở dữ liệu)
   * POST /audit/calculate
   */
  async calculateTaxFast(payload: AuditCalculationDto): Promise<ApiResponse<TaxCalculationBreakdown>> {
    return apiClient.post<TaxCalculationBreakdown>('/audit/calculate', payload);
  },

  /**
   * Chạy toàn bộ 15 quy tắc thẩm tra (R01 - R15), tính toán nghĩa vụ thuế và lưu phiên kiểm toán
   * POST /audit/run/:profileId
   */
  async runAudit(profileId: string): Promise<ApiResponse<AuditRunResultDto>> {
    return apiClient.post<AuditRunResultDto>(`/audit/run/${profileId}`);
  },

  /**
   * Lấy danh sách lịch sử các lần chạy thẩm tra của một hồ sơ quyết toán thuế
   * GET /audit/history/:profileId
   */
  async getAuditHistory(profileId: string): Promise<ApiResponse<AuditRunResultDto[]>> {
    return apiClient.get<AuditRunResultDto[]>(`/audit/history/${profileId}`);
  },

  /**
   * Xem báo cáo chi tiết kết quả thẩm tra (findings 15 rules, bảng 7 bậc, hướng dẫn giải trình)
   * GET /audit/report/:auditRunId
   */
  async getAuditReport(auditRunId: string): Promise<ApiResponse<AuditReportDto>> {
    return apiClient.get<AuditReportDto>(`/audit/report/${auditRunId}`);
  },

  /**
   * Kết xuất tờ khai XML 02/QTT-TNCN chuẩn XSD có chữ ký số server-side
   * GET /audit/export-xml/:profileId
   */
  async exportXml02Qtt(profileId: string): Promise<ApiResponse<{
    profileId: string;
    fileName: string;
    declarationCode: string;
    xmlContent: string;
    checksum: string;
    digitalSignature: any;
  }>> {
    return apiClient.get<any>(`/audit/export-xml/${profileId}`);
  },

  /**
   * Lấy bản tóm tắt quyết toán thuế, các mốc timeline và số thuế hoàn/nộp thêm
   * GET /audit/summary/:profileId
   */
  async getSettlementSummary(profileId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/audit/summary/${profileId}`);
  },
};

export default auditApi;
