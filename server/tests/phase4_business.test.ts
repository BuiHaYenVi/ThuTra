// ==============================================================================
// Bộ Kiểm thử Tự động Giai đoạn 4.1: Nghiệp vụ Kê khai Thuế & Tài khoản
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import http from 'http';
import { app } from '../app';
import { pool } from '../config/database';
import { tokenService } from '../services/token.service';
import type { UserContext } from '../types/auth.types';

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
  console.log('🧪 BẮT ĐẦU KIỂM THỬ GIAI ĐOẠN 4.1: KÊ KHAI THUẾ & TÀI KHOẢN');
  console.log('============================================================\n');

  // Khởi động server HTTP kiểm thử trên cổng 5004
  const server = http.createServer(app);
  const TEST_PORT = 5004;
  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => resolve());
  });

  // User B (Người dùng khác có sẵn để kiểm thử RLS Security Isolation)
  const userB: UserContext = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin.manager@thutra.vn',
    role: 'admin_manager',
    fullName: 'Quản trị viên Nghiệp vụ',
  };
  const tokenB = tokenService.generateAccessToken(userB).token;

  // Dữ liệu tài khoản test mới
  const testEmail = `taxpayer.test.${Date.now()}@example.com`;
  const testCccd = '079099' + Math.floor(100000 + Math.random() * 900000).toString();
  const initialPassword = 'Password@123456';
  const newPassword = 'NewSecretPassword@2026';

  let tokenA = '';
  let userAId = '';
  let createdProfileId = '';
  let createdIncomeId = '';
  let createdDependentId = '';

  try {
    // --------------------------------------------------------------------------
    // NHÓM 1: ĐĂNG KÝ TÀI KHOẢN & XÁC THỰC RÀNG BUỘC (POST /api/auth/register)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 1: Đăng ký Tài khoản Người nộp thuế & Ràng buộc chống trùng lặp');

    // 1.1. Đăng ký tài khoản hợp lệ
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Trần Văn Quyết Toán',
        email: testEmail,
        password: initialPassword,
        phone: '0988776655',
        cccd: testCccd,
      }),
    });
    const registerData: any = await registerRes.json();
    assert(registerRes.status === 201, '1.1 Đăng ký tài khoản mới thành công (HTTP 201 Created)');
    assert(registerData.success === true, '1.1 Phản hồi success: true');
    assert(Boolean(registerData.data.accessToken), '1.1 Cấp phát Access Token ngay sau khi đăng ký');
    assert(registerData.data.user.email === testEmail.toLowerCase(), '1.1 Email người dùng chuẩn xác');
    assert(registerData.data.user.role === 'user', '1.1 Vai trò mặc định là user');
    tokenA = registerData.data.accessToken;
    userAId = registerData.data.user.id;

    // 1.2. Chống trùng lặp email (HTTP 409 Conflict)
    const dupEmailRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Trần Văn Trùng Email',
        email: testEmail,
        password: 'Password@999',
        phone: '0911223344',
      }),
    });
    assert(dupEmailRes.status === 409, '1.2 Chặn đăng ký trùng lặp email (HTTP 409 Conflict)');

    // 1.3. Chống trùng lặp CCCD (HTTP 409 Conflict)
    const dupCccdRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Người Khác Trùng CCCD',
        email: `another.${Date.now()}@example.com`,
        password: 'Password@999',
        cccd: testCccd,
      }),
    });
    assert(dupCccdRes.status === 409, '1.3 Chặn đăng ký trùng lặp số CCCD (HTTP 409 Conflict)');

    // 1.4. Mật khẩu ngắn dưới 6 ký tự bị từ chối
    const shortPassRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'User Pass Ngắn',
        email: `shortpass.${Date.now()}@example.com`,
        password: '123',
      }),
    });
    assert(shortPassRes.status === 400, '1.4 Từ chối mật khẩu dưới 6 ký tự (HTTP 400 Bad Request)');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 2: QUẢN LÝ HỒ SƠ QUYẾT TOÁN THUẾ (POST, GET, PUT /api/profiles)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 2: Quản lý Hồ sơ Quyết toán Thuế (Module Tax Profiles)');

    // 2.1. Tạo mới kỳ quyết toán thuế năm 2025
    const createProfileRes = await fetch(`${BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        taxYear: 2025,
        periodTitle: 'Kỳ quyết toán thuế TNCN năm 2025',
        taxDepartmentCode: 'CT_HCM',
        taxDepartmentName: 'Cục Thuế TP Hồ Chí Minh',
        routingLegalBasis: 'Nơi đăng ký hộ khẩu thường trú',
        isTaxResident: true,
        refundBankName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
        refundAccountNumber: '0071001234567',
        refundAccountHolder: 'TRAN VAN QUYET TOAN',
      }),
    });
    const createProfileData: any = await createProfileRes.json();
    assert(createProfileRes.status === 201, '2.1 Tạo mới kỳ quyết toán thuế thành công (HTTP 201 Created)');
    assert(createProfileData.data.taxYear === 2025, '2.1 Năm tính thuế đúng 2025');
    assert(createProfileData.data.filingStatus === 'draft', '2.1 Trạng thái khởi tạo là draft');
    createdProfileId = createProfileData.data.id;

    // 2.2. Chống tạo trùng lặp 2 hồ sơ cho cùng 1 năm tính thuế
    const dupProfileRes = await fetch(`${BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        taxYear: 2025,
        taxDepartmentCode: 'CT_HN',
        taxDepartmentName: 'Cục Thuế TP Hà Nội',
      }),
    });
    assert(dupProfileRes.status === 409, '2.2 Chặn tạo trùng lặp 2 hồ sơ cho cùng một năm tính thuế (HTTP 409 Conflict)');

    // 2.3. Lấy danh sách hồ sơ của người dùng (GET /profiles)
    const listProfilesRes = await fetch(`${BASE_URL}/profiles`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listProfilesData: any = await listProfilesRes.json();
    assert(listProfilesRes.status === 200, '2.3 Lấy danh sách hồ sơ quyết toán thành công (HTTP 200)');
    assert(Array.isArray(listProfilesData.data) && listProfilesData.data.length >= 1, '2.3 Danh sách có ít nhất 1 hồ sơ');

    // 2.4. Lấy chi tiết hồ sơ thuế theo ID (GET /profiles/:id)
    const getProfileRes = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const getProfileData: any = await getProfileRes.json();
    assert(getProfileRes.status === 200, '2.4 Lấy chi tiết hồ sơ thuế thành công (HTTP 200)');
    assert(getProfileData.data.id === createdProfileId, '2.4 ID hồ sơ trùng khớp');

    // 2.5. Cập nhật thông tin hồ sơ (PUT /profiles/:id)
    const updateProfileRes = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        periodTitle: 'Kỳ quyết toán thuế TNCN năm 2025 (Chính thức)',
        isAuthorizedFinalization: false,
      }),
    });
    const updateProfileData: any = await updateProfileRes.json();
    assert(updateProfileRes.status === 200, '2.5 Cập nhật hồ sơ thuế thành công (HTTP 200)');
    assert(updateProfileData.data.periodTitle.includes('Chính thức'), '2.5 Tiêu đề kỳ tính thuế đã được cập nhật');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 3: QUẢN LÝ NGUỒN THU NHẬP & TỰ ĐỘNG ĐỒNG BỘ SỐ LIỆU TÀI CHÍNH
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 3: Nguồn Thu nhập & Đồng bộ số liệu tự động vào Hồ sơ thuế');

    // 3.1. Ràng buộc toán học: Thuế khấu trừ > Thu nhập bị chặn
    const invalidIncomeRes = await fetch(`${BASE_URL}/income-sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        profileId: createdProfileId,
        payerName: 'Công ty Test Lỗi',
        payerMst: '0101234567',
        totalIncomeGross: 10000000,
        taxWithheld: 20000000, // 20tr > 10tr -> Phi lý
      }),
    });
    assert(invalidIncomeRes.status === 400, '3.1 Chặn số thuế khấu trừ vượt quá tổng thu nhập (HTTP 400 Bad Request)');

    // 3.2. Thêm nguồn thu nhập hợp lệ (240tr thu nhập, 15tr thuế, 18tr BHXH)
    const createIncomeRes = await fetch(`${BASE_URL}/income-sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        profileId: createdProfileId,
        category: 'salary_contract',
        payerName: 'Công ty Cổ phần Công nghệ TechVN',
        payerMst: '0315889900',
        totalIncomeGross: 240000000,
        totalTaxableIncome: 240000000,
        taxWithheld: 15000000,
        insuranceDeduction: 18000000,
        workingMonthsCount: 12,
        isActiveInDecember: true,
      }),
    });
    const createIncomeData: any = await createIncomeRes.json();
    assert(createIncomeRes.status === 201, '3.2 Thêm mới nguồn thu nhập thành công (HTTP 201 Created)');
    createdIncomeId = createIncomeData.data.id;

    // 3.3. Kiểm tra tính năng ĐỒNG BỘ TỰ ĐỘNG vào tax_profiles
    const checkSyncProfile1 = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const syncData1: any = await checkSyncProfile1.json();
    assert(
      syncData1.data.financialSummary.totalTaxableIncome === 240000000,
      '3.3 Tự động đồng bộ tổng thu nhập chịu thuế sang hồ sơ (240.000.000 VNĐ)'
    );
    assert(
      syncData1.data.financialSummary.taxWithheldTotal === 15000000,
      '3.3 Tự động đồng bộ tổng thuế đã khấu trừ sang hồ sơ (15.000.000 VNĐ)'
    );
    assert(
      syncData1.data.financialSummary.insuranceDeductionAmount === 18000000,
      '3.3 Tự động đồng bộ tiền đóng bảo hiểm sang hồ sơ (18.000.000 VNĐ)'
    );

    // 3.4. Lấy danh sách nguồn thu nhập
    const listIncomeRes = await fetch(`${BASE_URL}/income-sources?profileId=${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listIncomeData: any = await listIncomeRes.json();
    assert(listIncomeRes.status === 200, '3.4 Lấy danh sách nguồn thu nhập theo profileId thành công (HTTP 200)');
    assert(listIncomeData.data.length === 1, '3.4 Danh sách có 1 nguồn thu nhập');

    // 3.5. Cập nhật nguồn thu nhập (tăng lên 300tr thu nhập, 20tr thuế)
    const updateIncomeRes = await fetch(`${BASE_URL}/income-sources/${createdIncomeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        totalIncomeGross: 300000000,
        totalTaxableIncome: 300000000,
        taxWithheld: 20000000,
      }),
    });
    assert(updateIncomeRes.status === 200, '3.5 Cập nhật nguồn thu nhập thành công (HTTP 200)');

    // 3.6. Kiểm tra lại việc cập nhật đồng bộ sang profile
    const checkSyncProfile2 = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const syncData2: any = await checkSyncProfile2.json();
    assert(
      syncData2.data.financialSummary.totalTaxableIncome === 300000000,
      '3.6 Hồ sơ thuế cập nhật lại tổng thu nhập sau khi sửa (300.000.000 VNĐ)'
    );

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 4: QUẢN LÝ NGƯỜI PHỤ THUỘC & TỰ ĐỘNG ĐỒNG BỘ MỨC GIẢM TRỪ GIA CẢNH
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 4: Người phụ thuộc & Tính toán tự động mức giảm trừ gia cảnh');

    // 4.1. Ràng buộc số tháng giảm trừ > 12 bị từ chối
    const invalidDepMonths = await fetch(`${BASE_URL}/dependents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        profileId: createdProfileId,
        fullName: 'Trần Văn Con Sai Tháng',
        relationType: 'child_under_18',
        cccd: '001205001234',
        startMonth: '2025-01',
        endMonth: '2025-12',
        monthsApplied: 14, // > 12 tháng -> Lỗi
      }),
    });
    assert(invalidDepMonths.status === 400, '4.1 Chặn số tháng đăng ký giảm trừ vượt quá 12 tháng (HTTP 400)');

    // 4.2. Ràng buộc CCCD sai định dạng 12 số
    const invalidDepCccd = await fetch(`${BASE_URL}/dependents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        profileId: createdProfileId,
        fullName: 'Trần Văn Con Sai CCCD',
        relationType: 'child_under_18',
        cccd: '12345', // < 12 chữ số
        startMonth: '2025-01',
        endMonth: '2025-12',
        monthsApplied: 12,
      }),
    });
    assert(invalidDepCccd.status === 400, '4.2 Chặn số CCCD người phụ thuộc không đúng 12 chữ số (HTTP 400)');

    // 4.3. Đăng ký người phụ thuộc hợp lệ (12 tháng x 4.4tr = 52.8tr)
    const validDepCccd = '079205' + Math.floor(100000 + Math.random() * 900000).toString();
    const createDepRes = await fetch(`${BASE_URL}/dependents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        profileId: createdProfileId,
        fullName: 'Trần Hoàng Bé',
        relationType: 'child_under_18',
        cccd: validDepCccd,
        startMonth: '2025-01',
        endMonth: '2025-12',
        monthsApplied: 12,
      }),
    });
    const createDepData: any = await createDepRes.json();
    assert(createDepRes.status === 201, '4.3 Đăng ký người phụ thuộc thành công (HTTP 201 Created)');
    assert(createDepData.data.totalDeduction === 52800000, '4.3 Tính chuẩn mức giảm trừ: 12 tháng x 4.4tr = 52.800.000 VNĐ');
    createdDependentId = createDepData.data.id;

    // 4.4. Kiểm tra chống trùng lặp CCCD người phụ thuộc trong cùng hồ sơ
    const dupDepRes = await fetch(`${BASE_URL}/dependents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        profileId: createdProfileId,
        fullName: 'Trần Hoàng Bé Khai Trùng',
        relationType: 'child_under_18',
        cccd: validDepCccd,
        startMonth: '2025-01',
        endMonth: '2025-12',
        monthsApplied: 6,
      }),
    });
    assert(dupDepRes.status === 409, '4.4 Chặn khai trùng lặp CCCD người phụ thuộc trong cùng hồ sơ (HTTP 409 Conflict)');

    // 4.5. Kiểm tra tính năng ĐỒNG BỘ mức giảm trừ NPT sang tax_profiles
    const checkSyncProfile3 = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const syncData3: any = await checkSyncProfile3.json();
    assert(
      syncData3.data.financialSummary.dependentDeductionAmount === 52800000,
      '4.5 Tự động đồng bộ tổng giảm trừ người phụ thuộc sang hồ sơ (52.800.000 VNĐ)'
    );

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 5: BẢO MẬT ROW-LEVEL SECURITY (RLS CÔ LẬP TOÀN DIỆN)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 5: Kiểm thử Bảo mật RLS Cô lập Dữ liệu (Chống ID Enumeration)');

    // 5.1. User B cố tình đọc hồ sơ của User A -> HTTP 404 Not Found
    const rlsProfileRes = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(rlsProfileRes.status === 404, '5.1 User B bị RLS chặn khi cố đọc hồ sơ của User A (HTTP 404 Not Found)');

    // 5.2. User B cố tình xem nguồn thu nhập của User A -> HTTP 404 Not Found
    const rlsIncomeRes = await fetch(`${BASE_URL}/income-sources?profileId=${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(rlsIncomeRes.status === 404, '5.2 User B bị chặn khi cố xem nguồn thu nhập của User A (HTTP 404 Not Found)');

    // 5.3. User B cố tình sửa nguồn thu nhập của User A -> HTTP 404 Not Found
    const rlsUpdateIncomeRes = await fetch(`${BASE_URL}/income-sources/${createdIncomeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ totalIncomeGross: 999999999 }),
    });
    assert(rlsUpdateIncomeRes.status === 404, '5.3 User B bị chặn khi cố sửa nguồn thu nhập của User A (HTTP 404 Not Found)');

    // 5.4. User B cố tình xem người phụ thuộc của User A -> HTTP 404 Not Found
    const rlsDepRes = await fetch(`${BASE_URL}/dependents?profileId=${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(rlsDepRes.status === 404, '5.4 User B bị chặn khi cố xem người phụ thuộc của User A (HTTP 404 Not Found)');

    // 5.5. User B cố tình xóa người phụ thuộc của User A -> HTTP 404 Not Found
    const rlsDeleteDepRes = await fetch(`${BASE_URL}/dependents/${createdDependentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(rlsDeleteDepRes.status === 404, '5.5 User B bị chặn khi cố xóa người phụ thuộc của User A (HTTP 404 Not Found)');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 6: CẬP NHẬT PROFILE CÁ NHÂN & ĐỔI MẬT KHẨU
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 6: Cập nhật Thông tin Cá nhân & Đổi Mật khẩu');

    // 6.1. Cập nhật thông tin cá nhân (PUT /api/users/profile)
    const updatePersonalRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        fullName: 'Trần Văn Quyết Toán (Đã cập nhật)',
        phone: '0977889900',
        address: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        taxDepartmentCode: 'CT_HCM',
        taxDepartmentName: 'Cục Thuế TP Hồ Chí Minh',
      }),
    });
    const updatePersonalData: any = await updatePersonalRes.json();
    assert(updatePersonalRes.status === 200, '6.1 Cập nhật thông tin cá nhân thành công (HTTP 200)');
    assert(updatePersonalData.data.fullName.includes('Đã cập nhật'), '6.1 Họ tên mới được lưu thành công');

    // 6.2. Đổi mật khẩu với mật khẩu cũ sai -> Bị từ chối
    const wrongOldPassRes = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        oldPassword: 'WrongPassword@123',
        newPassword: newPassword,
      }),
    });
    assert(wrongOldPassRes.status === 400, '6.2 Chặn đổi mật khẩu khi nhập sai mật khẩu cũ (HTTP 400 Bad Request)');

    // 6.3. Đổi mật khẩu thành công với mật khẩu cũ đúng
    const changePassRes = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        oldPassword: initialPassword,
        newPassword: newPassword,
      }),
    });
    assert(changePassRes.status === 200, '6.3 Đổi mật khẩu thành công (HTTP 200 OK)');

    // 6.4. Đăng nhập lại với mật khẩu cũ -> Bị từ chối
    const loginOldPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: initialPassword,
      }),
    });
    assert(loginOldPassRes.status === 401, '6.4 Mật khẩu cũ không còn hiệu lực (HTTP 401 Unauthorized)');

    // 6.5. Đăng nhập lại với mật khẩu mới -> Thành công
    const loginNewPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword,
      }),
    });
    assert(loginNewPassRes.status === 200, '6.5 Đăng nhập thành công với mật khẩu mới (HTTP 200 OK)');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 7: XÓA DỮ LIỆU & RÀNG BUỘC TOÀN VẸN
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 7: Xóa dữ liệu và Ràng buộc Toàn vẹn');

    // 7.1. Xóa người phụ thuộc -> Kiểm tra đồng bộ giảm trừ về 0
    const deleteDepRes = await fetch(`${BASE_URL}/dependents/${createdDependentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(deleteDepRes.status === 200, '7.1 Xóa người phụ thuộc thành công (HTTP 200)');
    const checkSyncProfile4 = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const syncData4: any = await checkSyncProfile4.json();
    assert(
      syncData4.data.financialSummary.dependentDeductionAmount === 0,
      '7.1 Tự động đồng bộ giảm trừ NPT về 0 VNĐ sau khi xóa'
    );

    // 7.2. Xóa nguồn thu nhập -> Kiểm tra đồng bộ thu nhập về 0
    const deleteIncRes = await fetch(`${BASE_URL}/income-sources/${createdIncomeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(deleteIncRes.status === 200, '7.2 Xóa nguồn thu nhập thành công (HTTP 200)');
    const checkSyncProfile5 = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const syncData5: any = await checkSyncProfile5.json();
    assert(
      syncData5.data.financialSummary.totalTaxableIncome === 0,
      '7.2 Tự động đồng bộ tổng thu nhập về 0 VNĐ sau khi xóa'
    );

    // 7.3. Xóa hồ sơ thuế khi ở trạng thái draft -> Thành công
    const deleteProfileRes = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(deleteProfileRes.status === 200, '7.3 Xóa hồ sơ thuế nháp thành công (HTTP 200)');

    // 7.4. Kiểm tra hồ sơ không còn tồn tại -> 404
    const verifyDeletedProfile = await fetch(`${BASE_URL}/profiles/${createdProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(verifyDeletedProfile.status === 404, '7.4 Hồ sơ đã bị xóa hoàn toàn khỏi hệ thống (HTTP 404)');

    console.log('\n============================================================');
    console.log(`🎉 HOÀN TẤT KIỂM THỬ GIAI ĐOẠN 4.1: ${passedTests}/${totalTests} TESTS PASS (100%)!`);
    console.log('============================================================\n');
  } finally {
    // Dọn dẹp tài khoản test đã tạo
    if (userAId) {
      try {
        await pool.query('DELETE FROM users WHERE id = $1', [userAId]);
      } catch {}
    }
    server.close();
    await pool.end();
  }
}

runTestSuite().catch((err) => {
  console.error('Lỗi khi chạy bộ kiểm thử Giai đoạn 4.1:', err);
  process.exit(1);
});
