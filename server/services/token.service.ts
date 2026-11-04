// ==============================================================================
// Dịch vụ Quản lý & Xử lý JSON Web Token (Token Service)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { UnauthorizedError } from '../errors/app-error';
import type { JwtCustomPayload, UserContext } from '../types/auth.types';

// Danh sách token đã bị thu hồi trong bộ nhớ tạm (Hỗ trợ logout / blacklist)
// Trong môi trường production quy mô lớn, có thể lưu trữ trong Redis với TTL
const revokedTokens = new Set<string>();

export class TokenService {
  /**
   * Tạo Access Token (JWT) chứa thông tin tối thiểu: userId, email, role
   */
  public generateAccessToken(user: UserContext): { token: string; expiresIn: number } {
    const payload: JwtCustomPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };

    const signOptions: SignOptions = {
      expiresIn: env.JWT.expiresIn as any,
      algorithm: 'HS256',
    };

    const token = jwt.sign(payload, env.JWT.secret, signOptions);

    return {
      token,
      expiresIn: env.JWT.expiresInSeconds,
    };
  }

  /**
   * Tạo Refresh Token để cấp mới phiên làm việc
   */
  public generateRefreshToken(user: UserContext): { token: string; expiresIn: number } {
    const payload: JwtCustomPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'refresh',
    };

    const signOptions: SignOptions = {
      expiresIn: env.JWT.refreshExpiresIn as any,
      algorithm: 'HS256',
    };

    const token = jwt.sign(payload, env.JWT.refreshSecret, signOptions);

    return {
      token,
      expiresIn: env.JWT.refreshExpiresInSeconds,
    };
  }

  /**
   * Giải mã và xác thực Access Token
   */
  public verifyAccessToken(token: string): JwtCustomPayload {
    if (revokedTokens.has(token)) {
      throw new UnauthorizedError('Phiên đăng nhập đã bị thu hồi hoặc đã đăng xuất.', 'TOKEN_REVOKED');
    }

    try {
      const decoded = jwt.verify(token, env.JWT.secret) as JwtCustomPayload;

      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedError('Loại token không hợp lệ để truy cập tài nguyên.', 'INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', 'TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Chữ ký token không hợp lệ hoặc dữ liệu bị chỉnh sửa.', 'INVALID_TOKEN');
      }
      throw new UnauthorizedError('Không thể xác thực token.', 'AUTH_FAILED');
    }
  }

  /**
   * Giải mã và xác thực Refresh Token
   */
  public verifyRefreshToken(token: string): JwtCustomPayload {
    if (revokedTokens.has(token)) {
      throw new UnauthorizedError('Refresh token đã bị vô hiệu hóa.', 'TOKEN_REVOKED');
    }

    try {
      const decoded = jwt.verify(token, env.JWT.refreshSecret) as JwtCustomPayload;

      if (decoded.tokenType !== 'refresh') {
        throw new UnauthorizedError('Loại token không hợp lệ để làm mới phiên.', 'INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Phiên làm việc dài hạn đã hết hạn. Vui lòng đăng nhập lại.', 'REFRESH_TOKEN_EXPIRED');
      }
      throw new UnauthorizedError('Refresh token không hợp lệ.', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Thu hồi token (đăng xuất)
   */
  public revokeToken(token: string): void {
    if (token) {
      revokedTokens.add(token);
    }
  }
}

export const tokenService = new TokenService();
