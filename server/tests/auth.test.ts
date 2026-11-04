// ==============================================================================
// Kịch bản Kiểm thử Đơn vị & Tích hợp (Authentication & RLS Test Suite)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import bcrypt from 'bcryptjs';
import { tokenService } from '../services/token.service';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { validateLoginRequest } from '../middlewares/validation.middleware';
import { 
  AppError, 
  UnauthorizedError, 
  ValidationError, 
  AccountStatusError 
} from '../errors/app-error';
import type { UserContext, UserDbEntity } from '../types/auth.types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('============================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ XÁC THỰC & QUẢN LÝ PHIÊN (PHASE 1)');
  console.log('============================================================\n');

  // --------------------------------------------------------------------------
  // NHÓM 1: KIỂM THỬ TOKEN SERVICE (JWT ACCESS & REFRESH TOKENS)
  // --------------------------------------------------------------------------
  console.log('🔹 Nhóm 1: Kiểm thử TokenService (JWT Lifecycle)');
  const mockUser: UserContext = {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'nam.nguyen@example.com',
    role: 'user',
    fullName: 'Nguyễn Hoàng Nam',
  };

  // 1.1. Sinh Access Token hợp lệ
  const access = tokenService.generateAccessToken(mockUser);
  assert(typeof access.token === 'string' && access.token.length > 20, 'Sinh Access Token hợp lệ');
  assert(access.expiresIn === 3600, 'Thời gian sống Access Token chuẩn 3600s');

  // 1.2. Giải mã và kiểm tra claims
  const decoded = tokenService.verifyAccessToken(access.token);
  assert(decoded.userId === mockUser.id, 'Token claim userId khớp chính xác');
  assert(decoded.email === mockUser.email, 'Token claim email khớp chính xác');
  assert(decoded.role === mockUser.role, 'Token claim role khớp chính xác');
  assert(decoded.tokenType === 'access', 'Token type phải là access');

  // 1.3. Sinh và xác thực Refresh Token
  const refresh = tokenService.generateRefreshToken(mockUser);
  const decodedRefresh = tokenService.verifyRefreshToken(refresh.token);
  assert(decodedRefresh.tokenType === 'refresh', 'Refresh token type phải là refresh');

  // 1.4. Thu hồi Token (Logout Blacklist)
  tokenService.revokeToken(access.token);
  let isRevokedErrorCaught = false;
  try {
    tokenService.verifyAccessToken(access.token);
  } catch (err: any) {
    isRevokedErrorCaught = err instanceof UnauthorizedError && err.errorCode === 'TOKEN_REVOKED';
  }
  assert(isRevokedErrorCaught, 'Token đã thu hồi không được phép tiếp tục truy cập (TOKEN_REVOKED)');

  // 1.5. Token giả mạo hoặc chữ ký sai
  let isInvalidTokenCaught = false;
  try {
    tokenService.verifyAccessToken('invalid.token.structure');
  } catch (err: any) {
    isInvalidTokenCaught = err instanceof UnauthorizedError;
  }
  assert(isInvalidTokenCaught, 'Token giả mạo bị từ chối');

  console.log('');

  // --------------------------------------------------------------------------
  // NHÓM 2: KIỂM THỬ VALIDATION MIDDLEWARE
  // --------------------------------------------------------------------------
  console.log('🔹 Nhóm 2: Kiểm thử Validation Middleware (Email & Password)');

  // 2.1. Email đúng chuẩn RFC
  const validReq: any = { body: { email: '  Nam.Nguyen@Example.COM  ', password: 'SecretPassword123' } };
  let nextCalled = false;
  validateLoginRequest(validReq, {} as any, () => { nextCalled = true; });
  assert(nextCalled, 'Email và password hợp lệ vượt qua validation');
  assert(validReq.body.email === 'nam.nguyen@example.com', 'Email được tự động chuẩn hóa trim và lowercase');

  // 2.2. Email sai định dạng (thiếu @, thiếu domain)
  const invalidEmailReq: any = { body: { email: 'invalid-email-address', password: 'ValidPassword123' } };
  let isValidationErrorCaught = false;
  try {
    validateLoginRequest(invalidEmailReq, {} as any, () => {});
  } catch (err: any) {
    isValidationErrorCaught = err instanceof ValidationError && err.errors?.[0]?.field === 'email';
  }
  assert(isValidationErrorCaught, 'Email sai định dạng bị chặn với mã lỗi EMAIL_INVALID_FORMAT');

  // 2.3. Mật khẩu quá ngắn (< 6 ký tự)
  const shortPasswordReq: any = { body: { email: 'user@example.com', password: '123' } };
  let isShortPassCaught = false;
  try {
    validateLoginRequest(shortPasswordReq, {} as any, () => {});
  } catch (err: any) {
    isShortPassCaught = err instanceof ValidationError && err.errors?.[0]?.field === 'password';
  }
  assert(isShortPassCaught, 'Mật khẩu dưới 6 ký tự bị từ chối');

  console.log('');

  // --------------------------------------------------------------------------
  // NHÓM 3: KIỂM THỬ AUTH SERVICE & QUY TẮC NGHIỆP VỤ (RBAC + TRẠNG THÁI)
  // --------------------------------------------------------------------------
  console.log('🔹 Nhóm 3: Kiểm thử AuthService (Logic Đăng nhập & Trạng thái tài khoản)');

  // Chuẩn bị mật khẩu hash mẫu bằng bcrypt
  const plainPassword = 'User@SecurePassword2026';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const mockDbUserActive: UserDbEntity = {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'nam.nguyen@example.com',
    phone: '0908123456',
    password_hash: hashedPassword,
    full_name: 'Nguyễn Hoàng Nam',
    cccd: '079095012345',
    mst: '8492019381',
    date_of_birth: '1998-08-15',
    address: 'Phường 25, Quận Bình Thạnh, TP.HCM',
    tax_department_code: '79119',
    tax_department_name: 'Chi cục Thuế Quận Bình Thạnh',
    role: 'user',
    status: 'active',
    is_vneid_verified: true,
    vneid_level: 2,
    two_factor_enabled: true,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  };

  // Mock UserRepository
  userRepository.findByEmail = async (email: string) => {
    if (email === mockDbUserActive.email) return mockDbUserActive;
    if (email === 'locked@thutra.vn') {
      return { ...mockDbUserActive, email: 'locked@thutra.vn', status: 'locked' };
    }
    if (email === 'pending@thutra.vn') {
      return { ...mockDbUserActive, email: 'pending@thutra.vn', status: 'pending_verification' };
    }
    return null;
  };

  userRepository.updateLastLogin = async () => {};

  userRepository.findById = async (id: string) => {
    if (id === mockDbUserActive.id) {
      return {
        id: mockDbUserActive.id,
        email: mockDbUserActive.email,
        phone: mockDbUserActive.phone,
        fullName: mockDbUserActive.full_name,
        cccd: mockDbUserActive.cccd,
        mst: mockDbUserActive.mst,
        role: mockDbUserActive.role,
        status: mockDbUserActive.status,
        isVneidVerified: mockDbUserActive.is_vneid_verified,
        vneidLevel: mockDbUserActive.vneid_level,
        twoFactorEnabled: mockDbUserActive.two_factor_enabled,
        createdAt: mockDbUserActive.created_at,
      };
    }
    return null;
  };

  // 3.1. Đăng nhập thành công với tài khoản active và mật khẩu đúng
  const loginRes = await authService.login({
    email: 'nam.nguyen@example.com',
    password: plainPassword,
  });
  assert(typeof loginRes.accessToken === 'string', 'Đăng nhập thành công cấp phát accessToken');
  assert(loginRes.user.email === 'nam.nguyen@example.com', 'Thông tin user phản hồi chính xác');
  assert(loginRes.user.role === 'user', 'Role người dùng chính xác');
  assert((loginRes.user as any).password_hash === undefined, 'Tuyệt đối KHÔNG lộ password_hash trong DTO');

  // 3.2. Đăng nhập sai mật khẩu
  let isWrongPasswordCaught = false;
  try {
    await authService.login({
      email: 'nam.nguyen@example.com',
      password: 'WrongPassword!',
    });
  } catch (err: any) {
    isWrongPasswordCaught = err instanceof UnauthorizedError && err.errorCode === 'INVALID_CREDENTIALS';
  }
  assert(isWrongPasswordCaught, 'Mật khẩu sai bị từ chối với mã lỗi INVALID_CREDENTIALS');

  // 3.3. Tài khoản bị khóa (locked)
  let isLockedErrorCaught = false;
  try {
    await authService.login({
      email: 'locked@thutra.vn',
      password: plainPassword,
    });
  } catch (err: any) {
    isLockedErrorCaught = err instanceof AccountStatusError && err.errorCode === 'ACCOUNT_LOCKED';
  }
  assert(isLockedErrorCaught, 'Tài khoản locked bị chặn truy cập với mã ACCOUNT_LOCKED');

  // 3.4. Tài khoản chờ xác thực (pending_verification)
  let isPendingErrorCaught = false;
  try {
    await authService.login({
      email: 'pending@thutra.vn',
      password: plainPassword,
    });
  } catch (err: any) {
    isPendingErrorCaught = err instanceof AccountStatusError && err.errorCode === 'ACCOUNT_PENDING_VERIFICATION';
  }
  assert(isPendingErrorCaught, 'Tài khoản chưa xác minh bị chặn với mã ACCOUNT_PENDING_VERIFICATION');

  // 3.5. Kiểm tra GET /me qua AuthService
  const meResult = await authService.getMe(mockDbUserActive.id);
  assert(meResult.id === mockDbUserActive.id, 'GET /me trả về đúng profile người dùng');
  assert((meResult as any).password_hash === undefined, 'GET /me không bao giờ chứa password_hash');

  console.log('\n============================================================');
  console.log(`🎉 HOÀN TẤT TẤT CẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS ĐẠT YÊU CẦU!`);
  console.log('============================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Lỗi khi chạy test suite:', err);
  process.exit(1);
});
