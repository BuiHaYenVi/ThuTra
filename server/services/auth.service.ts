// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Xác thực (Authentication Service)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import bcrypt from 'bcryptjs';
import { PoolClient } from 'pg';
import { userRepository } from '../repositories/user.repository';
import { tokenService } from './token.service';
import { 
  UnauthorizedError, 
  NotFoundError, 
  AccountStatusError,
  ValidationError,
  ConflictError 
} from '../errors/app-error';
import type { 
  LoginRequestDto, 
  LoginResponseDto, 
  AuthUserDto, 
  UserContext,
  RegisterRequestDto,
  UpdateProfileDto,
  ChangePasswordDto 
} from '../types/auth.types';

export class AuthService {
  /**
   * Đăng ký tài khoản người nộp thuế mới
   */
  public async register(dto: RegisterRequestDto, client?: PoolClient): Promise<LoginResponseDto> {
    if (!dto.fullName || !dto.fullName.trim()) {
      throw new ValidationError('Họ và tên là bắt buộc.');
    }
    if (!dto.email || !dto.email.trim()) {
      throw new ValidationError('Email là bắt buộc.');
    }
    if (!dto.password || dto.password.length < 6) {
      throw new ValidationError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
    }

    const trimmedEmail = dto.email.trim().toLowerCase();

    // 1. Kiểm tra chống trùng lặp email
    const existingEmail = await userRepository.findByEmail(trimmedEmail, client);
    if (existingEmail) {
      throw new ConflictError('Địa chỉ email này đã được sử dụng trong hệ thống.');
    }

    // 2. Kiểm tra chống trùng lặp CCCD nếu có cung cấp
    let cleanCccd: string | undefined = undefined;
    if (dto.cccd) {
      cleanCccd = dto.cccd.trim().replace(/\s/g, '');
      if (!/^\d{12}$/.test(cleanCccd)) {
        throw new ValidationError('Số CCCD phải có đúng 12 chữ số chuẩn định danh Đề án 06.');
      }
      const existingCccd = await userRepository.findByCccd(cleanCccd, client);
      if (existingCccd) {
        throw new ConflictError('Số Căn cước công dân này đã được liên kết với một tài khoản khác.');
      }
    }

    // 3. Mã hóa mật khẩu an toàn với bcrypt (10 rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // 4. Lưu tài khoản mới vào cơ sở dữ liệu
    const newUser = await userRepository.create(
      {
        email: trimmedEmail,
        passwordHash,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        cccd: cleanCccd,
      },
      client
    );

    // 5. Cấp phát JWT token ngay sau khi đăng ký thành công
    const userContext: UserContext = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    };

    const accessTokenData = tokenService.generateAccessToken(userContext);
    const refreshTokenData = tokenService.generateRefreshToken(userContext);

    return {
      accessToken: accessTokenData.token,
      refreshToken: refreshTokenData.token,
      tokenType: 'Bearer',
      expiresIn: accessTokenData.expiresIn,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
        mst: newUser.mst,
        cccd: newUser.cccd,
      },
    };
  }

  /**
   * Cập nhật thông tin hồ sơ cá nhân
   */
  public async updateProfile(
    user: UserContext,
    dto: UpdateProfileDto,
    client?: PoolClient
  ): Promise<AuthUserDto> {
    const updated = await userRepository.updateProfile(user.id, dto, client);
    if (!updated) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng để cập nhật.');
    }
    return updated;
  }

  /**
   * Đổi mật khẩu tài khoản (yêu cầu mật khẩu cũ chính xác)
   */
  public async changePassword(
    user: UserContext,
    dto: ChangePasswordDto,
    client?: PoolClient
  ): Promise<void> {
    if (!dto.oldPassword || !dto.newPassword) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ mật khẩu cũ và mật khẩu mới.');
    }
    if (dto.newPassword.length < 6) {
      throw new ValidationError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }

    const dbUser = await userRepository.findUserWithPasswordById(user.id, client);
    if (!dbUser) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng.');
    }

    // Đối soát mật khẩu cũ
    const isOldValid = await bcrypt.compare(dto.oldPassword, dbUser.password_hash);
    if (!isOldValid) {
      throw new ValidationError('Mật khẩu hiện tại không chính xác.');
    }

    // Mã hóa mật khẩu mới và lưu
    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await userRepository.updatePassword(user.id, newHash, client);
  }

  /**
   * Xử lý đăng nhập tài khoản người dùng
   */
  public async login(dto: LoginRequestDto, client?: PoolClient): Promise<LoginResponseDto> {
    const trimmedEmail = dto.email.trim().toLowerCase();

    // 1. Tìm người dùng theo email trong cơ sở dữ liệu
    const user = await userRepository.findByEmail(trimmedEmail, client);

    // Bảo mật: Nếu không tìm thấy, trả về thông báo chung để chống User Enumeration Attack
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác.', 'INVALID_CREDENTIALS');
    }

    // 2. Kiểm tra trạng thái tài khoản
    switch (user.status) {
      case 'locked':
        throw new AccountStatusError(
          'Tài khoản của bạn đã bị tạm khóa do vi phạm chính sách hoặc nghi vấn bảo mật. Vui lòng liên hệ quản trị viên.',
          'ACCOUNT_LOCKED'
        );

      case 'pending_verification':
        throw new AccountStatusError(
          'Tài khoản chưa hoàn tất xác thực thông tin (Email hoặc Định danh VNeID).',
          'ACCOUNT_PENDING_VERIFICATION'
        );

      case 'inactive':
        throw new AccountStatusError(
          'Tài khoản đã bị ngừng kích hoạt trong hệ thống.',
          'ACCOUNT_INACTIVE'
        );

      case 'active':
        break;

      default:
        throw new AccountStatusError('Trạng thái tài khoản không hợp lệ.', 'ACCOUNT_INACTIVE');
    }

    // 3. Đối soát mật khẩu qua bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác.', 'INVALID_CREDENTIALS');
    }

    // 4. Cập nhật thời điểm đăng nhập gần nhất
    await userRepository.updateLastLogin(user.id, client);

    // 5. Khởi tạo ngữ cảnh người dùng & phát hành cặp JWT Tokens
    const userContext: UserContext = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    const accessTokenData = tokenService.generateAccessToken(userContext);
    const refreshTokenData = tokenService.generateRefreshToken(userContext);

    // 6. Trả về DTO phản hồi chuẩn
    return {
      accessToken: accessTokenData.token,
      refreshToken: refreshTokenData.token,
      tokenType: 'Bearer',
      expiresIn: accessTokenData.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        mst: user.mst,
        cccd: user.cccd,
      },
    };
  }

  /**
   * Truy vấn thông tin người dùng hiện tại (Current User Profile)
   * Chạy qua DB Session Middleware có RLS để đảm bảo an toàn tuyệt đối
   */
  public async getMe(userId: string, client?: PoolClient): Promise<AuthUserDto> {
    const user = await userRepository.findById(userId, client);

    if (!user) {
      throw new NotFoundError('Không tìm thấy thông tin tài khoản người dùng.');
    }

    if (user.status === 'locked') {
      throw new AccountStatusError('Tài khoản hiện đang bị khóa.', 'ACCOUNT_LOCKED');
    }

    return user;
  }

  /**
   * Đăng xuất và thu hồi phiên làm việc
   */
  public async logout(token?: string): Promise<void> {
    if (token) {
      tokenService.revokeToken(token);
    }
  }
}

export const authService = new AuthService();
