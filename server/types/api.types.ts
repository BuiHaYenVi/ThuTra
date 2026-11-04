// ==============================================================================
// Chuẩn hóa định dạng Phản hồi API (API Response Types)
// Hệ thống: ThuTra TNCN
// ==============================================================================

export interface ApiResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorCode?: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  timestamp: string;
}
