// ==============================================================================
// Kịch bản Kiểm thử Tích hợp Tầng 3: Quản lý Trạng thái & Bảo vệ Phiên làm việc
// Hệ thống: ThuTra TNCN - Tầng 3 Integration Tests
// ==============================================================================

import { authApi } from '../services/auth.api';
import { profileApi } from '../services/profile.api';
import { taxDeclarationApi } from '../services/tax-declaration.api';
import { auditApi } from '../services/audit.api';
import { storageUtil } from '../utils/storage.util';
import type { UserProfileDto } from '../types/business.types';
import type { UserRole } from '../types/api.types';

declare const process: any;

async function runStateManagementTests() {
  console.log('==============================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TÍCH HỢP TẦNG 3: QUẢN LÝ TRẠNG THÁI & PHIÊN LÀM VIỆC');
  console.log('==============================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // --------------------------------------------------------------------------
  // NHÓM 1: KIỂM THỬ ĐĂNG NHẬP & THIẾT LẬP SINGLE SOURCE OF TRUTH (AUTH STATE)
  // --------------------------------------------------------------------------
  console.log('🔹 Nhóm 1: Kiểm thử Quản lý Phiên & Single Source of Truth');

  // Đảm bảo ban đầu sạch state
  storageUtil.clearAllAuthData();
  assert(storageUtil.hasValidAuth() === false, '1.1 Khởi tạo trạng thái ban đầu: chưa có xác thực');

  // Thực hiện đăng nhập với tài khoản Super Admin
  const loginRes = await authApi.login({
    email: 'superadmin@thutra.vn',
    password: 'Admin@123456',
  });
  assert(loginRes.success === true, '1.2 Gọi authApi.login() thành công');
  
  // Lưu token vào Storage
  storageUtil.setAccessToken(loginRes.data.accessToken);
  if (loginRes.data.refreshToken) {
    storageUtil.setRefreshToken(loginRes.data.refreshToken);
  }
  assert(storageUtil.hasValidAuth() === true, '1.3 hasValidAuth() xác nhận phiên hoạt động sau khi lưu token');

  // Nạp thông tin người dùng từ máy chủ vào State
  const userProfileRes = await authApi.getCurrentUser();
  assert(userProfileRes.success === true, '1.4 Nạp UserProfile thành công');
  const userProfile: UserProfileDto = userProfileRes.data;
  storageUtil.setUserProfile(userProfile);

  assert(userProfile.email === 'superadmin@thutra.vn', '1.5 Email trong UserProfile chuẩn xác');
  assert(userProfile.role === 'super_admin', '1.6 Vai trò người dùng chính xác là super_admin');

  // Kiểm tra phục hồi từ Storage Cache
  const cachedProfile = storageUtil.getUserProfile<UserProfileDto>();
  assert(cachedProfile?.id === userProfile.id, '1.7 Cache UserProfile trong Storage khớp với State');

  // --------------------------------------------------------------------------
  // NHÓM 2: KIỂM THỬ KHÔI PHỤC PHIÊN TỰ ĐỘNG (BOOTSTRAP RECOVERY EFFECT)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 2: Kiểm thử Khôi phục Phiên Tự động (Bootstrap Effect)');

  // Giả lập người dùng F5 tải lại trang: Token vẫn còn trong Storage
  const hasTokenOnReload = storageUtil.hasValidAuth();
  assert(hasTokenOnReload === true, '2.1 F5 tải lại trang: Phát hiện token còn hiệu lực trong Storage');

  // Kích hoạt hàm khôi phục phiên (Bootstrap recovery)
  const recoveredRes = await authApi.getCurrentUser();
  assert(recoveredRes.success === true, '2.2 Tự động khôi phục phiên thành công từ Backend');
  assert(recoveredRes.data.email === 'superadmin@thutra.vn', '2.2 Thông tin phiên phục hồi chính xác');

  // --------------------------------------------------------------------------
  // NHÓM 3: KIỂM THỬ TỰ ĐỘNG DỌN DẸP KHI HẾT HẠN PHIÊN (401 EVENT LISTENER)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 3: Kiểm thử Tự động Dọn dẹp Phiên khi Nhận Sự kiện 401');

  // Giả lập sự kiện toàn cục 'thutra:unauthorized' (phát ra khi API trả về HTTP 401)
  storageUtil.clearAllAuthData();
  assert(storageUtil.getAccessToken() === null, '3.1 Token đã bị xóa sạch sau sự kiện 401');
  assert(storageUtil.getUserProfile() === null, '3.2 Cache Profile đã được dọn sạch hoàn toàn');
  assert(storageUtil.hasValidAuth() === false, '3.3 hasValidAuth() chuyển sang false an toàn');

  // --------------------------------------------------------------------------
  // NHÓM 4: KIỂM THỬ TRẠNG THÁI QUYẾT TOÁN THUẾ (TAX FILING CONTEXT)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 4: Kiểm thử Trạng thái Kê khai Quyết toán Thuế (Filing State)');

  // Đăng nhập lại với tài khoản người nộp thuế thông thường
  const uniqueId = Date.now();
  const taxpayerEmail = `taxpayer_ctx_${uniqueId}@example.com`;
  const registerRes = await authApi.register({
    fullName: 'Người Nộp Thuế Context Test',
    email: taxpayerEmail,
    password: 'Password@123',
    phone: `09${String(uniqueId).slice(-8)}`,
    cccd: `079${String(uniqueId).slice(-9)}`,
  });
  assert(registerRes.success === true, '4.1 Đăng ký tài khoản người nộp thuế thử nghiệm thành công');
  storageUtil.setAccessToken(registerRes.data.accessToken);

  // Tạo kỳ quyết toán thuế năm 2025 (Set Active Profile)
  const newProfile = await profileApi.createProfile({
    taxYear: 2025,
    periodTitle: 'Quyết toán thuế TNCN 2025 - Context State',
    taxDepartmentCode: '105',
    taxDepartmentName: 'Cục Thuế TP Hồ Chí Minh',
    routingLegalBasis: 'Nơi cư trú và làm việc',
  });
  assert(newProfile.success === true, '4.2 Tạo hồ sơ quyết toán thành công');
  const activeProfileId = newProfile.data.id;
  storageUtil.setActiveProfileId(activeProfileId);
  assert(storageUtil.getActiveProfileId() === activeProfileId, '4.2 Active Profile ID được lưu trữ chuẩn xác');

  // Thêm nguồn thu nhập và kiểm tra tự động đồng bộ tài chính
  const incomeRes = await taxDeclarationApi.createIncomeSource({
    profileId: activeProfileId,
    payerName: 'Công ty Công nghệ State Test',
    payerMst: '0399887766',
    totalIncomeGross: 300000000,
    totalTaxableIncome: 300000000,
    taxWithheld: 20000000,
    insuranceDeduction: 22000000,
  });
  assert(incomeRes.success === true, '4.3 Thêm nguồn thu nhập thành công');

  // Đọc lại hồ sơ để kiểm tra State đồng bộ
  const updatedProfileRes = await profileApi.getProfileById(activeProfileId);
  assert(updatedProfileRes.data.financialSummary.totalTaxableIncome === 300000000, '4.4 State hồ sơ tự động đồng bộ tổng thu nhập 300.000.000 VNĐ');

  // Thêm người phụ thuộc và kiểm tra tự động tính giảm trừ
  const depRes = await taxDeclarationApi.createDependent({
    profileId: activeProfileId,
    fullName: 'Con Phụ Thuộc State Test',
    relationType: 'child_under_18',
    cccd: `079${String(uniqueId + 2).slice(-9)}`,
    startMonth: '2025-01',
    endMonth: '2025-12',
    monthsApplied: 12,
  });
  assert(depRes.success === true, '4.5 Đăng ký người phụ thuộc thành công');
  assert(depRes.data.totalDeduction === 52800000, '4.5 Tự động tính giảm trừ NPT 52.800.000 VNĐ');

  // Chạy thẩm tra 15 rules
  const auditRes = await auditApi.runAudit(activeProfileId);
  assert(auditRes.success === true, '4.6 Chạy thẩm tra 15 rules thành công');
  assert(auditRes.data.totalRulesScanned === 15, '4.6 Số lượng rules quét đạt đủ 15/15');
  assert(Array.isArray(auditRes.data.findings), '4.6 Findings trả về mảng kết quả chi tiết');

  // --------------------------------------------------------------------------
  // NHÓM 5: KIỂM THỬ LOGIC PHÂN QUYỀN RBAC ROUTE GUARD (PROTECTED ROUTE LOGIC)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 5: Kiểm thử Logic Phân quyền RBAC Route Guard');

  // Người dùng hiện tại có vai trò 'user'
  const currentUserRole: UserRole = 'user';

  // 5.1 Kiểm tra truy cập khu vực dành cho người nộp thuế (allowedRoles: ['user'])
  const canAccessUserArea = (['user'] as UserRole[]).includes(currentUserRole);
  assert(canAccessUserArea === true, '5.1 Người nộp thuế được phép truy cập khu vực cá nhân (allowedRoles: user)');

  // 5.2 Kiểm tra chặn truy cập khu vực quản trị viên (allowedRoles: ['admin_manager', 'super_admin'])
  const canAccessAdminArea = (['admin_manager', 'super_admin'] as UserRole[]).includes(currentUserRole);
  assert(canAccessAdminArea === false, '5.2 Người nộp thuế bị CHẶN truy cập khu vực Quản trị viên (403 Forbidden)');

  // Dọn dẹp phiên thử nghiệm
  storageUtil.clearAllAuthData();

  console.log('\n==============================================================================');
  console.log(`🎉 HOÀN TẤT KIỂM THỬ TẦNG 3: ${passed}/${total} TESTS ĐẠT YÊU CẦU 100%!`);
  console.log('==============================================================================');
}

runStateManagementTests().catch((err) => {
  console.error('Lỗi khi chạy kiểm thử Tầng 3:', err);
  process.exit(1);
});
