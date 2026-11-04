// ==============================================================================
// Dịch vụ API Phân hệ Xác thực & Người dùng (Authentication & User API Service)
// Hệ thống: ThuTra TNCN - Tầng 2: Typed API Services
// ==============================================================================

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  UserProfileDto,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '../types/business.types';

export const authApi = {
  /**
   * Đăng nhập tài khoản người dùng, nhận Access Token & Refresh Token
   * POST /auth/login
   */
  async login(payload: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>> {
    return apiClient.post<LoginResponseDto>('/auth/login', payload);
  },

  /**
   * Đăng ký tài khoản người nộp thuế mới (tự động cấp phát JWT token)
   * POST /auth/register
   */
  async register(payload: RegisterRequestDto): Promise<ApiResponse<LoginResponseDto>> {
    return apiClient.post<LoginResponseDto>('/auth/register', payload);
  },

  /**
   * Lấy thông tin cá nhân và quyền hạn người dùng hiện tại qua RLS Session
   * GET /auth/me
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfileDto>> {
    return apiClient.get<UserProfileDto>('/auth/me');
  },

  /**
   * Đăng xuất và thu hồi phiên làm việc trên máy chủ
   * POST /auth/logout
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/logout');
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân (họ tên, SĐT, địa chỉ, cơ quan thuế)
   * PUT /users/profile
   */
  async updateProfile(payload: UpdateUserProfileDto): Promise<ApiResponse<UserProfileDto>> {
    return apiClient.put<UserProfileDto>('/users/profile', payload);
  },

  /**
   * Đổi mật khẩu tài khoản
   * PUT /users/change-password
   */
  async changePassword(payload: ChangePasswordDto): Promise<ApiResponse<null>> {
    return apiClient.put<null>('/users/change-password', payload);
  },
};

export default authApi;
