// ==============================================================================
// Middleware Kiểm tra Tính Hợp lệ Dữ liệu Đầu vào (Validation Middleware)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/app-error';

// Regex kiểm tra định dạng email tiêu chuẩn RFC 5322
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate thông tin đăng nhập (email và password)
 */
export function validateLoginRequest(req: Request, _res: Response, next: NextFunction): void {
  const { email, password } = req.body;
  const errors: Array<{ field: string; message: string; code: string }> = [];

  // Kiểm tra email
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({
      field: 'email',
      message: 'Địa chỉ email là bắt buộc và không được để trống.',
      code: 'EMAIL_REQUIRED',
    });
  } else {
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.push({
        field: 'email',
        message: 'Định dạng email không hợp lệ (ví dụ: user@example.com).',
        code: 'EMAIL_INVALID_FORMAT',
      });
    }
  }

  // Kiểm tra password
  if (!password || typeof password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Mật khẩu là bắt buộc và không được để trống.',
      code: 'PASSWORD_REQUIRED',
    });
  } else if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.',
      code: 'PASSWORD_TOO_SHORT',
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Dữ liệu yêu cầu đăng nhập không hợp lệ.', errors);
  }

  // Chuẩn hóa email về chữ thường
  req.body.email = email.trim().toLowerCase();
  next();
}
