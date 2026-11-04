// ==============================================================================
// Định nghĩa Kiểu dữ liệu Xác thực & Ngữ cảnh Người dùng (Authentication Types)
// Hệ thống: ThuTra TNCN
// ==============================================================================

export type UserRole = 'super_admin' | 'admin_manager' | 'user';

export type UserStatus = 'active' | 'pending_verification' | 'locked' | 'inactive';

/**
 * Ngữ cảnh người dùng trong phiên làm việc (User Context)
 * Dùng để truyền vào PostgreSQL RLS Session (SET LOCAL app.current_user_id & app.current_user_role)
 */
export interface UserContext {
  id: string; // UUID
  email: string;
  role: UserRole;
  fullName?: string;
}

/**
 * Cấu trúc Payload chuẩn được mã hóa bên trong JWT Token
 */
export interface JwtCustomPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType: 'access' | 'refresh';
}

/**
 * DTO dữ liệu đăng nhập từ Client
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * DTO thông tin người dùng an toàn (không chứa password_hash)
 */
export interface AuthUserDto {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  cccd?: string | null;
  mst?: string | null;
  role: UserRole;
  status: UserStatus;
  isVneidVerified: boolean;
  vneidLevel: number;
  twoFactorEnabled: boolean;
  avatarUrl?: string | null;
  taxDepartmentCode?: string | null;
  taxDepartmentName?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

/**
 * DTO trả về sau khi đăng nhập thành công
 */
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // Thời gian hết hạn tính bằng giây
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    mst?: string | null;
    cccd?: string | null;
  };
}

/**
 * Dữ liệu entity User trong cơ sở dữ liệu (chứa password_hash để đối soát)
 */
export interface UserDbEntity {
  id: string;
  email: string;
  phone: string | null;
  password_hash: string;
  full_name: string;
  cccd: string | null;
  mst: string | null;
  date_of_birth: string | null;
  address: string | null;
  tax_department_code: string | null;
  tax_department_name: string | null;
  role: UserRole;
  status: UserStatus;
  is_vneid_verified: boolean;
  vneid_level: number;
  two_factor_enabled: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/**
 * DTO đăng ký tài khoản người nộp thuế mới
 */
export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  cccd?: string;
}

/**
 * DTO cập nhật hồ sơ cá nhân
 */
export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  address?: string;
  taxDepartmentCode?: string;
  taxDepartmentName?: string;
}

/**
 * DTO đổi mật khẩu
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
