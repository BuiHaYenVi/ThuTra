// ==============================================================================
// Kịch bản Kiểm thử Toàn diện Tầng 2: Dịch vụ API Phân hệ Nghiệp vụ
// Hệ thống: ThuTra TNCN - Tầng 2 Integration Tests
// ==============================================================================

import { authApi } from './auth.api';
import { profileApi } from './profile.api';
import { taxDeclarationApi } from './tax-declaration.api';
import { auditApi } from './audit.api';
import { adminApi } from './admin.api';
import { documentApi } from './document.api';
import { healthApi } from './health.api';
import { storageUtil } from '../utils/storage.util';
import { ApiClientError } from '../types/api.types';

declare const process: any;

async function runApiServicesIntegrationTests() {
  console.log('==============================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TÍCH HỢP TẦNG 2: DỊCH VỤ API PHÂN HỆ NGHIỆP VỤ');
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
  // NHÓM 1: KIỂM THỬ HEALTH & SETTINGS CÔNG KHAI (PUBLIC API)
  // --------------------------------------------------------------------------
  console.log('🔹 Nhóm 1: Kiểm thử Public Settings & Health Check API');
  
  // 1.1 Kiểm tra trạng thái máy chủ Backend
  const isServerAlive = await healthApi.pingServer();
  assert(isServerAlive === true, '1.1 pingServer() xác nhận máy chủ Backend đang hoạt động');

  // 1.2 Lấy tham số thuế công khai không cần Token xác thực
  const publicSettingsRes = await adminApi.getPublicSettings();
  assert(publicSettingsRes.success === true, '1.2 getPublicSettings() trả về success: true');
  assert(publicSettingsRes.data.personalDeductionMonthly === 11000000, '1.2 Giảm trừ bản thân chuẩn 11 triệu/tháng');
  assert(publicSettingsRes.data.dependentDeductionMonthly === 4400000, '1.2 Giảm trừ NPT chuẩn 4.4 triệu/tháng');
  assert(publicSettingsRes.data.baseSalary === 2340000, '1.2 Mức lương cơ sở hiện hành đúng 2.340.000 VNĐ');
  assert(publicSettingsRes.data.taxBrackets.length === 7, '1.2 Biểu thuế lũy tiến bao gồm đầy đủ 7 bậc');

  // --------------------------------------------------------------------------
  // NHÓM 2: KIỂM THỬ PHÂN HỆ XÁC THỰC (AUTH API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 2: Kiểm thử Phân hệ Xác thực & Quản lý Tài khoản (Auth API)');

  // 2.1 Đăng ký tài khoản người nộp thuế mới
  const uniqueSuffix = Date.now();
  const testEmail = `nguyenvana_${uniqueSuffix}@example.com`;
  const testCccd = `079${String(uniqueSuffix).slice(-9)}`;
  const registerRes = await authApi.register({
    fullName: 'Nguyễn Văn Kiểm Thử',
    email: testEmail,
    password: 'Password@123',
    phone: `09${String(uniqueSuffix).slice(-8)}`,
    cccd: testCccd,
  });
  assert(registerRes.success === true, '2.1 Đăng ký tài khoản mới thành công (HTTP 201)');
  assert(registerRes.data.user.role === 'user', '2.1 Tài khoản mới tạo có vai trò mặc định là user');

  // 2.2 Đăng nhập bằng tài khoản vừa tạo
  const loginRes = await authApi.login({
    email: testEmail,
    password: 'Password@123',
  });
  assert(loginRes.success === true, '2.2 Đăng nhập thành công và nhận Access Token');
  assert(typeof loginRes.data.accessToken === 'string', '2.2 Access Token tồn tại hợp lệ');
  assert(loginRes.data.user.email === testEmail.toLowerCase(), '2.2 Email phản hồi khớp tài khoản');

  // Lưu token vào storage để apiClient tự động gắn Authorization Header
  storageUtil.setAccessToken(loginRes.data.accessToken);

  // 2.3 Lấy thông tin tài khoản hiện tại qua GET /auth/me (với RLS context tự động)
  const meRes = await authApi.getCurrentUser();
  assert(meRes.success === true, '2.3 getCurrentUser() lấy hồ sơ cá nhân thành công');
  assert(meRes.data.email === testEmail.toLowerCase(), '2.3 Email người dùng từ phiên khớp chính xác');
  assert(meRes.data.role === 'user', '2.3 Vai trò người dùng đúng cấp user');

  // 2.4 Cập nhật thông tin hồ sơ cá nhân
  const updateProfileRes = await authApi.updateProfile({
    fullName: 'Nguyễn Văn Kiểm Thử (Đã Sửa)',
    phone: `09${String(Date.now()).slice(-8)}`,
    taxDepartmentCode: '105',
    taxDepartmentName: 'Cục Thuế TP Hồ Chí Minh',
  });
  assert(updateProfileRes.success === true, '2.4 Cập nhật hồ sơ cá nhân thành công');
  assert(updateProfileRes.data.fullName === 'Nguyễn Văn Kiểm Thử (Đã Sửa)', '2.4 Họ tên mới được lưu trữ chính xác');

  // --------------------------------------------------------------------------
  // NHÓM 3: KIỂM THỬ TÍNH THỬ THUẾ NHANH & ĐỘNG CƠ THẨM TRA (AUDIT API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 3: Kiểm thử Động cơ Tính toán Thuế & Thẩm tra (Audit API)');

  // 3.1 Tính thử nhanh nghĩa vụ thuế theo biểu 7 bậc lũy tiến
  const fastCalcRes = await auditApi.calculateTaxFast({
    grossIncome: 240000000, // 20tr/tháng
    dependentsCount: 1,
    dependentMonthsTotal: 12, // 1 NPT x 12 tháng = 52.8tr
    insuranceAmount: 21600000,
  });
  assert(fastCalcRes.success === true, '3.1 calculateTaxFast() phản hồi thành công');
  assert(fastCalcRes.data.grossIncome === 240000000, '3.1 Tổng thu nhập chịu thuế đúng 240.000.000 VNĐ');
  assert(fastCalcRes.data.personalDeduction === 132000000, '3.1 Giảm trừ bản thân đúng 132.000.000 VNĐ');
  assert(fastCalcRes.data.dependentDeduction === 52800000, '3.1 Giảm trừ NPT đúng 52.800.000 VNĐ');
  assert(fastCalcRes.data.taxableIncome === 33600000, '3.1 Thu nhập tính thuế chuẩn (240tr - 132tr - 52.8tr - 21.6tr = 33.6tr)');
  assert(fastCalcRes.data.appliedBracket === 1, '3.1 Chạm ngưỡng Bậc 1 (dưới 60tr/năm)');

  // --------------------------------------------------------------------------
  // NHÓM 4: KIỂM THỬ HỒ SƠ QUYẾT TOÁN & TỰ ĐỘNG ĐỒNG BỘ (PROFILE API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 4: Kiểm thử Hồ sơ Quyết toán Thuế (Profile API)');

  // 4.1 Khởi tạo kỳ quyết toán mới năm 2025
  const createProfileRes = await profileApi.createProfile({
    taxYear: 2025,
    periodTitle: 'Quyết toán thuế TNCN năm 2025',
    taxDepartmentCode: '105',
    taxDepartmentName: 'Cục Thuế TP Hồ Chí Minh',
    routingLegalBasis: 'Nơi cư trú và làm việc tháng 12/2025',
    isTaxResident: true,
  });
  assert(createProfileRes.success === true, '4.1 Khởi tạo kỳ quyết toán mới thành công (HTTP 201)');
  const profileId = createProfileRes.data.id;
  assert(Boolean(profileId), '4.1 Nhận ID kỳ quyết toán hợp lệ');
  assert(createProfileRes.data.taxYear === 2025, '4.1 Năm quyết toán thuế đúng 2025');

  // Lưu active profile id vào storage
  storageUtil.setActiveProfileId(profileId);

  // 4.2 Lấy danh sách hồ sơ quyết toán
  const profilesListRes = await profileApi.getProfiles();
  assert(profilesListRes.success === true, '4.2 Lấy danh sách hồ sơ quyết toán thành công');
  assert(profilesListRes.data.length >= 1, '4.2 Danh sách có ít nhất 1 hồ sơ');

  // 4.3 Xem chi tiết hồ sơ
  const profileDetailRes = await profileApi.getProfileById(profileId);
  assert(profileDetailRes.data.id === profileId, '4.3 ID hồ sơ lấy chi tiết trùng khớp');

  // --------------------------------------------------------------------------
  // NHÓM 5: KIỂM THỬ NGUỒN THU NHẬP & NGƯỜI PHỤ THUỘC (TAX DECLARATION API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 5: Kiểm thử Nguồn Thu nhập & Người Phụ thuộc (Tax Declaration API)');

  // 5.1 Khai báo nguồn thu nhập mới
  const createIncomeRes = await taxDeclarationApi.createIncomeSource({
    profileId,
    category: 'salary_contract',
    payerName: 'Công ty Cổ phần Công nghệ ABC',
    payerMst: '0312345678',
    totalIncomeGross: 240000000,
    totalTaxableIncome: 240000000,
    taxWithheld: 15000000,
    insuranceDeduction: 18000000,
    isActiveInDecember: true,
  });
  assert(createIncomeRes.success === true, '5.1 Khai báo nguồn thu nhập thành công');
  const incomeId = createIncomeRes.data.id;

  // 5.2 Kiểm tra hồ sơ được tự động đồng bộ thu nhập
  const syncedProfile = await profileApi.getProfileById(profileId);
  assert(syncedProfile.data.financialSummary.totalTaxableIncome === 240000000, '5.2 Hồ sơ tự động đồng bộ tổng thu nhập 240.000.000 VNĐ');

  // 5.3 Khai báo người phụ thuộc
  const createDepRes = await taxDeclarationApi.createDependent({
    profileId,
    fullName: 'Nguyễn Thị Con Gái',
    relationType: 'child_under_18',
    relationTitle: 'Con dưới 18 tuổi',
    cccd: `079${String(uniqueSuffix + 1).slice(-9)}`,
    startMonth: '2025-01',
    endMonth: '2025-12',
    monthsApplied: 12,
  });
  assert(createDepRes.success === true, '5.3 Đăng ký người phụ thuộc thành công');
  const depId = createDepRes.data.id;
  assert(createDepRes.data.totalDeduction === 52800000, '5.3 Tự động tính chuẩn giảm trừ NPT: 12 x 4.4tr = 52.800.000 VNĐ');

  // 5.4 Lấy danh sách NPT theo profileId
  const depList = await taxDeclarationApi.getDependents(profileId);
  assert(depList.data.length === 1, '5.4 Danh sách NPT trả về đúng 1 bản ghi');

  // --------------------------------------------------------------------------
  // NHÓM 6: KIỂM THỬ THẨM TRA 15 RULES VỚI DỮ LIỆU THẬT (AUDIT RUN API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 6: Kiểm thử Chạy Động cơ Thẩm tra 15 Rules (Audit Run)');

  const auditRunRes = await auditApi.runAudit(profileId);
  assert(auditRunRes.success === true, '6.1 Thực thi thẩm tra 15 rules trên hồ sơ thành công');
  assert(auditRunRes.data.totalRulesScanned === 15, '6.1 Quét đầy đủ chính xác 15 quy tắc thẩm tra');
  assert(Array.isArray(auditRunRes.data.findings), '6.1 Danh sách findings là một mảng kết quả');
  const auditRunId = auditRunRes.data.auditRunId;

  // 6.2 Lấy báo cáo chi tiết phiên thẩm tra
  const auditReportRes = await auditApi.getAuditReport(auditRunId);
  assert(auditReportRes.data.auditRun.id === auditRunId, '6.2 Lấy chi tiết báo cáo phiên thẩm tra thành công');
  assert(Array.isArray(auditReportRes.data.findings), '6.2 Báo cáo chứa danh sách findings');

  // --------------------------------------------------------------------------
  // NHÓM 7: KIỂM THỬ QUẢN TRỊ ADMIN VỚI TÀI KHOẢN SUPER ADMIN (ADMIN API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 7: Kiểm thử Quyền Quản trị với Super Admin (Admin API)');

  // Đăng nhập tài khoản Super Admin
  const adminLoginRes = await authApi.login({
    email: 'superadmin@thutra.vn',
    password: 'Admin@123456',
  });
  assert(adminLoginRes.success === true, '7.1 Đăng nhập tài khoản Super Admin thành công');
  storageUtil.setAccessToken(adminLoginRes.data.accessToken);

  // Lấy danh sách 15 rules quản trị
  const rulesRes = await adminApi.getAdminRules();
  assert(rulesRes.success === true, '7.2 Lấy danh mục 15 rules quản trị thành công');
  assert(rulesRes.data.length === 15, '7.2 Danh mục rules trả về đúng 15 quy tắc R01 - R15');

  // Xem chi tiết rule R01
  const ruleR01 = await adminApi.getAdminRuleById('R01');
  assert(ruleR01.data.code === 'R01', '7.3 Tra cứu chi tiết quy tắc theo mã Code R01 thành công');

  // Xem audit logs đã che mờ dữ liệu theo Nghị định 13
  const auditLogsRes = await adminApi.getAuditLogs({ page: 1, limit: 10 });
  assert(auditLogsRes.success === true, '7.4 Lấy danh sách audit-logs thành công');
  assert(Array.isArray(auditLogsRes.data.items), '7.4 Danh sách logs trả về mảng items');

  // 7.5 Kiểm thử truy vấn chứng từ
  const docsRes = await documentApi.getDocuments();
  assert(docsRes.success === true, '7.5 Lấy danh sách chứng từ thành công');
  assert(Array.isArray(docsRes.data.documents), '7.5 Dữ liệu chứng từ trả về danh sách mảng');

  // --------------------------------------------------------------------------
  // NHÓM 8: KIỂM THỬ XỬ LÝ LỖI TRONG SUỐT & DỌN DẸP DỮ LIỆU
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 8: Kiểm thử Xử lý Lỗi Trong suốt & Dọn dẹp Dữ liệu');

  // Chuyển lại token của User để dọn dẹp dữ liệu đã tạo
  storageUtil.setAccessToken(loginRes.data.accessToken);

  // Xóa người phụ thuộc và nguồn thu nhập đã test
  const delDepRes = await taxDeclarationApi.deleteDependent(depId);
  assert(delDepRes.success === true, '8.1 Xóa người phụ thuộc thử nghiệm thành công');

  const delIncomeRes = await taxDeclarationApi.deleteIncomeSource(incomeId);
  assert(delIncomeRes.success === true, '8.2 Xóa nguồn thu nhập thử nghiệm thành công');

  try {
    // Cố tình tra cứu ID hồ sơ không tồn tại
    await profileApi.getProfileById('00000000-0000-0000-0000-000000000000');
    assert(false, 'Phải ném ra lỗi ApiClientError');
  } catch (err: any) {
    assert(err instanceof ApiClientError, '8.3 Lỗi lan truyền tự nhiên là một thể hiện của ApiClientError');
    assert(err.statusCode === 404, '8.4 Mã trạng thái phản ánh đúng HTTP 404 Not Found');
  }

  // Dọn dẹp phiên thử nghiệm
  storageUtil.clearAllAuthData();

  console.log('\n==============================================================================');
  console.log(`🎉 HOÀN TẤT KIỂM THỬ TẦNG 2: ${passed}/${total} TESTS ĐẠT YÊU CẦU 100%!`);
  console.log('==============================================================================');
}

runApiServicesIntegrationTests().catch((err) => {
  console.error('Lỗi khi chạy kiểm thử Tầng 2:', err);
  process.exit(1);
});
