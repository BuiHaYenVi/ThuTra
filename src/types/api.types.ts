// ==============================================================================
// Định nghĩa Kiểu Dữ liệu Giao tiếp Mạng & Mã Lỗi Chuẩn hóa (Network Types)
// Hệ thống: ThuTra TNCN - Tầng 1: Network Layer
// ==============================================================================

/**
 * Khung phản hồi thành công chuẩn hóa khớp 100% với Backend Express ApiResponse<T>
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Chi tiết từng lỗi trường dữ liệu trong mảng errors phản hồi từ validation middleware
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Khung phản hồi lỗi chuẩn hóa từ Backend Express ApiErrorResponse
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorCode?: string;
  errors?: ApiErrorDetail[];
  timestamp?: string;
}

/**
 * Bảng mã lỗi chuẩn hóa đồng bộ giữa Client và Server
 */
export const ApiErrorCode = {
  // Lỗi mạng và kết nối
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',

  // Lỗi xác thực và ủy quyền (Auth & RBAC)
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Lỗi trạng thái tài khoản
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_PENDING_VERIFICATION: 'ACCOUNT_PENDING_VERIFICATION',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',

  // Lỗi dữ liệu & tài nguyên
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_SIZE_LIMIT: 'FILE_SIZE_LIMIT',

  // Lỗi hệ thống máy chủ
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ApiErrorCode = typeof ApiErrorCode[keyof typeof ApiErrorCode];

/**
 * Lớp lỗi chuẩn hóa phía Client kế thừa từ Error chuẩn của JavaScript.
 * Tuân thủ nghiêm ngặt cờ erasableSyntaxOnly (khai báo tường minh thuộc tính trước constructor).
 */
export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errors?: ApiErrorDetail[];
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = ApiErrorCode.UNKNOWN_ERROR,
    errors?: ApiErrorDetail[],
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.originalError = originalError;
    this.isNetworkError = statusCode === 0 || errorCode === ApiErrorCode.NETWORK_ERROR || errorCode === ApiErrorCode.TIMEOUT_ERROR;
    this.isAuthError = statusCode === 401;

    // Đảm bảo prototype chain chính xác khi kế thừa Error
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Kiểm tra xem lỗi có phải do hết hạn phiên hoặc chưa đăng nhập (401)
   */
  public static isUnauthorized(error: unknown): boolean {
    return error instanceof ApiClientError && error.statusCode === 401;
  }

  /**
   * Kiểm tra xem lỗi có phải do thiếu quyền hạn truy cập (403)
   */
  public static isForbidden(error: unknown): boolean {
    return error instanceof ApiClientError && error.statusCode === 403;
  }

  /**
   * Kiểm tra xem lỗi có phải do dữ liệu đầu vào không hợp lệ (400)
   */
  public static isValidationError(error: unknown): boolean {
    return error instanceof ApiClientError && error.statusCode === 400;
  }

  /**
   * Kiểm tra xem lỗi có phải do mất kết nối mạng hoặc máy chủ không phản hồi (0)
   */
  public static isNetworkError(error: unknown): boolean {
    return error instanceof ApiClientError && error.isNetworkError;
  }

  /**
   * Chuyển đổi an toàn từ một error bất kỳ sang ApiClientError
   */
  public static fromError(error: unknown): ApiClientError {
    if (error instanceof ApiClientError) {
      return error;
    }
    if (error instanceof Error) {
      return new ApiClientError(error.message, 500, ApiErrorCode.UNKNOWN_ERROR, undefined, error);
    }
    return new ApiClientError(
      typeof error === 'string' ? error : 'Đã xảy ra lỗi không xác định.',
      500,
      ApiErrorCode.UNKNOWN_ERROR,
      undefined,
      error
    );
  }
}

/**
 * Định dạng phản hồi kiểm tra sức khỏe hệ thống từ /api/health
 */
export interface HealthCheckData {
  uptimeSeconds: number;
  timestamp: string;
  service: string;
}

/**
 * Cấu trúc Token xác thực trả về từ /api/auth/login và /api/auth/register
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Định nghĩa vai trò phân quyền 3 cấp (RBAC)
 */
export type UserRole = 'super_admin' | 'admin_manager' | 'user';

/**
 * Định dạng DTO thông tin người dùng phiên làm việc
 */
export interface UserContextDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  cccd?: string;
  mst?: string;
  taxDepartmentCode?: string;
  taxDepartmentName?: string;
  isVneidVerified?: boolean;
}
