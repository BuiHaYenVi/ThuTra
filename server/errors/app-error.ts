// ==============================================================================
// Hệ thống Lỗi Tùy chỉnh Chuẩn hóa (Standardized Application Exceptions)
// Hệ thống: ThuTra TNCN
// ==============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field?: string; message: string; code?: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_SERVER_ERROR',
    errors?: Array<{ field?: string; message: string; code?: string }>,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Yêu cầu xác thực không hợp lệ hoặc token đã hết hạn.', errorCode: string = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Bạn không có quyền truy cập vào tài nguyên này.', errorCode: string = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy tài nguyên yêu cầu.', errorCode: string = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Dữ liệu đầu vào không hợp lệ.',
    errors?: Array<{ field?: string; message: string; code?: string }>
  ) {
    super(message, 400, 'VALIDATION_ERROR', errors);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Tài nguyên đã tồn tại hoặc xảy ra xung đột dữ liệu.', errorCode: string = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

export class AccountStatusError extends AppError {
  constructor(
    message: string,
    errorCode: 'ACCOUNT_LOCKED' | 'ACCOUNT_PENDING_VERIFICATION' | 'ACCOUNT_INACTIVE'
  ) {
    super(message, 403, errorCode);
  }
}
