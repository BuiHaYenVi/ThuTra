// ==============================================================================
// Bộ Kiểm thử Tự động Giai đoạn 4.2: Quản trị Hệ thống, Cấu hình Quy tắc & Tham số Thuế
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
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
  console.log('==============================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ GIAI ĐOẠN 4.2: QUẢN TRỊ HỆ THỐNG & CẤU HÌNH QUY TẮC THẨM TRA');
  console.log('==============================================================================\n');

  // Khởi động server HTTP kiểm thử trên cổng 5005
  const server = http.createServer(app);
  const TEST_PORT = 5005;
  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => resolve());
  });

  // 1. Super Admin User
  const superAdminUser: UserContext = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'superadmin@thutra.vn',
    role: 'super_admin',
    fullName: 'Quản trị viên Hệ thống Tối cao',
  };
  const tokenSuperAdmin = tokenService.generateAccessToken(superAdminUser).token;

  // 2. Admin Manager User
  const adminManagerUser: UserContext = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin.manager@thutra.vn',
    role: 'admin_manager',
    fullName: 'Cán bộ Quản lý Nghiệp vụ',
  };
  const tokenAdminManager = tokenService.generateAccessToken(adminManagerUser).token;

  // 3. Taxpayer Regular User
  const regularUser: UserContext = {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'nam.nguyen@example.com',
    role: 'user',
    fullName: 'Nguyễn Văn Nam',
  };
  const tokenUser = tokenService.generateAccessToken(regularUser).token;

  try {
    // --------------------------------------------------------------------------
    // NHÓM 1: PUBLIC TAX SETTINGS & PROGRESSIVE BRACKETS (GET /api/settings/public)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 1: Cấu hình Tham số Thuế Công khai & Biểu lũy tiến 7 bậc (Public API)');

    // 1.1. Truy cập không cần token thành công (HTTP 200 OK)
    const pubRes = await fetch(`${BASE_URL}/settings/public`);
    const pubJson: any = await pubRes.json();
    assert(pubRes.status === 200, '1.1 Truy cập API Public không cần Token xác thực (HTTP 200 OK)');
    assert(pubJson.success === true, '1.1 Phản hồi success: true');
    assert(Boolean(pubJson.data), '1.1 Dữ liệu cấu hình data tồn tại');

    // 1.2. Mức giảm trừ gia cảnh & Lương cơ sở
    const settings = pubJson.data;
    assert(settings.personalDeductionMonthly === 11000000, '1.2 Mức giảm trừ bản thân hàng tháng đúng 11.000.000 VNĐ');
    assert(settings.personalDeductionYearly === 132000000, '1.2 Mức giảm trừ bản thân hàng năm đúng 132.000.000 VNĐ');
    assert(settings.dependentDeductionMonthly === 4400000, '1.2 Mức giảm trừ người phụ thuộc hàng tháng đúng 4.400.000 VNĐ');
    assert(settings.dependentDeductionYearly === 52800000, '1.2 Mức giảm trừ người phụ thuộc hàng năm đúng 52.800.000 VNĐ');
    assert(settings.baseSalary === 2340000, '1.2 Mức lương cơ sở hiện hành đúng 2.340.000 VNĐ');
    assert(settings.maxInsuranceBaseMultiplier === 20, '1.2 Hệ số trần đóng BHXH/BHYT đúng 20 lần lương cơ sở');

    // 1.3. Tỷ lệ trích đóng bảo hiểm
    assert(settings.insuranceRates.social === 8, '1.3 Tỷ lệ đóng BHXH người lao động đúng 8%');
    assert(settings.insuranceRates.health === 1.5, '1.3 Tỷ lệ đóng BHYT người lao động đúng 1.5%');
    assert(settings.insuranceRates.unemployment === 1, '1.3 Tỷ lệ đóng BHTN người lao động đúng 1%');

    // 1.4. Biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế TNCN
    const brackets = pubJson.data.taxBrackets;
    assert(Array.isArray(brackets) && brackets.length === 7, '1.4 Biểu thuế lũy tiến bao gồm chính xác 7 bậc');
    assert(brackets[0].bracketLevel === 1 && brackets[0].taxRate === 5 && brackets[0].monthlyMax === 5000000, '1.4 Bậc 1: Đến 5 triệu, thuế suất 5%');
    assert(brackets[1].bracketLevel === 2 && brackets[1].taxRate === 10 && brackets[1].monthlyMax === 10000000, '1.4 Bậc 2: Trên 5 đến 10 triệu, thuế suất 10%');
    assert(brackets[2].bracketLevel === 3 && brackets[2].taxRate === 15 && brackets[2].monthlyMax === 18000000, '1.4 Bậc 3: Trên 10 đến 18 triệu, thuế suất 15%');
    assert(brackets[3].bracketLevel === 4 && brackets[3].taxRate === 20 && brackets[3].monthlyMax === 32000000, '1.4 Bậc 4: Trên 18 đến 32 triệu, thuế suất 20%');
    assert(brackets[4].bracketLevel === 5 && brackets[4].taxRate === 25 && brackets[4].monthlyMax === 52000000, '1.4 Bậc 5: Trên 32 đến 52 triệu, thuế suất 25%');
    assert(brackets[5].bracketLevel === 6 && brackets[5].taxRate === 30 && brackets[5].monthlyMax === 80000000, '1.4 Bậc 6: Trên 52 đến 80 triệu, thuế suất 30%');
    assert(brackets[6].bracketLevel === 7 && brackets[6].taxRate === 35 && brackets[6].monthlyMax === null, '1.4 Bậc 7: Trên 80 triệu, thuế suất 35%');

    // --------------------------------------------------------------------------
    // NHÓM 2: PHÂN QUYỀN 3 TẦNG NGHIÊM NGẶT (HIERARCHICAL RBAC MATRIX)
    // --------------------------------------------------------------------------
    console.log('\n🔹 Nhóm 2: Phân quyền Phân cấp 3 Tầng Nghiêm ngặt (super_admin, admin_manager, user)');

    // 2.1. Chưa đăng nhập (Không có token) -> Chặn HTTP 401
    const noTokenRulesRes = await fetch(`${BASE_URL}/admin/rules`);
    assert(noTokenRulesRes.status === 401, '2.1 Chặn truy cập GET /api/admin/rules khi không có token (HTTP 401)');

    const noTokenLogsRes = await fetch(`${BASE_URL}/admin/audit-logs`);
    assert(noTokenLogsRes.status === 401, '2.1 Chặn truy cập GET /api/admin/audit-logs khi không có token (HTTP 401)');

    const noTokenSettingsRes = await fetch(`${BASE_URL}/settings`, { method: 'PUT' });
    assert(noTokenSettingsRes.status === 401, '2.1 Chặn truy cập PUT /api/settings khi không có token (HTTP 401)');

    // 2.2. Người nộp thuế (role: 'user') -> Chặn hoàn toàn HTTP 403 Forbidden
    const userRulesRes = await fetch(`${BASE_URL}/admin/rules`, {
      headers: { Authorization: `Bearer ${tokenUser}` },
    });
    assert(userRulesRes.status === 403, '2.2 Người dùng thường (user) bị chặn GET /api/admin/rules (HTTP 403 Forbidden)');

    const userLogsRes = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${tokenUser}` },
    });
    assert(userLogsRes.status === 403, '2.2 Người dùng thường (user) bị chặn GET /api/admin/audit-logs (HTTP 403 Forbidden)');

    const userPutSettingRes = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenUser}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settingKey: 'base_salary', numericValue: 2500000 }),
    });
    assert(userPutSettingRes.status === 403, '2.2 Người dùng thường (user) bị chặn PUT /api/settings (HTTP 403 Forbidden)');

    // 2.3. Cán bộ quản lý (role: 'admin_manager') -> Có quyền ĐỌC, nhưng BỊ CHẶN SỬA (Read-only)
    const mgrRulesRes = await fetch(`${BASE_URL}/admin/rules`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    assert(mgrRulesRes.status === 200, '2.3 admin_manager được phép xem danh sách quy tắc GET /api/admin/rules (HTTP 200 OK)');

    const mgrLogsRes = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    assert(mgrLogsRes.status === 200, '2.3 admin_manager được phép xem nhật ký kiểm toán GET /api/admin/audit-logs (HTTP 200 OK)');

    const mgrPutRuleRes = await fetch(`${BASE_URL}/admin/rules/R01`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdminManager}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false, changeReason: 'Cố tình chỉnh sửa' }),
    });
    assert(mgrPutRuleRes.status === 403, '2.3 admin_manager bị chặn chỉnh sửa quy tắc PUT /api/admin/rules/:id (HTTP 403 Forbidden)');

    const mgrPutSettingRes = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdminManager}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settingKey: 'base_salary', numericValue: 2500000 }),
    });
    assert(mgrPutSettingRes.status === 403, '2.3 admin_manager bị chặn cập nhật tham số PUT /api/settings (HTTP 403 Forbidden)');

    // --------------------------------------------------------------------------
    // NHÓM 3: QUẢN TRỊ QUY TẮC THẨM TRA, VERSIONING & AUDIT TRAIL
    // --------------------------------------------------------------------------
    console.log('\n🔹 Nhóm 3: Quản trị Quy tắc Thẩm tra, Tự động tăng Version & Lịch sử thay đổi');

    // 3.1. Danh sách 15 rules đầy đủ
    const allRulesJson: any = await mgrRulesRes.json();
    assert(allRulesJson.success === true, '3.1 API rules trả về success: true');
    assert(Array.isArray(allRulesJson.data) && allRulesJson.data.length === 15, '3.1 Trả về đầy đủ chính xác 15 quy tắc thẩm tra (R01 - R15)');

    const ruleR10 = allRulesJson.data.find((r: any) => r.code === 'R10');
    assert(Boolean(ruleR10), '3.1 Quy tắc R10 (Trùng người phụ thuộc) tồn tại');
    assert(Boolean(ruleR10.legalReference), '3.1 Quy tắc chứa căn cứ pháp lý minh bạch');
    assert(Boolean(ruleR10.version), `3.1 Phiên bản hiện tại của R10: ${ruleR10.version}`);

    // 3.2. Xem chi tiết 1 quy tắc theo Mã code (R10) và theo UUID
    const getR10ByCodeRes = await fetch(`${BASE_URL}/admin/rules/R10`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    const getR10ByCodeJson: any = await getR10ByCodeRes.json();
    assert(getR10ByCodeRes.status === 200, '3.2 Tra cứu chi tiết quy tắc theo Code R10 thành công (HTTP 200 OK)');
    assert(getR10ByCodeJson.data.code === 'R10', '3.2 Mã quy tắc trả về đúng R10');

    const getR10ByIdRes = await fetch(`${BASE_URL}/admin/rules/${ruleR10.id}`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    const getR10ByIdJson: any = await getR10ByIdRes.json();
    assert(getR10ByIdRes.status === 200, '3.2 Tra cứu chi tiết quy tắc theo UUID thành công (HTTP 200 OK)');
    assert(getR10ByIdJson.data.id === ruleR10.id, '3.2 ID quy tắc trùng khớp');

    // 3.3. Xử lý lỗi khi tìm mã quy tắc không tồn tại
    const notFoundRuleRes = await fetch(`${BASE_URL}/admin/rules/R99_UNKNOWN`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    assert(notFoundRuleRes.status === 404, '3.3 Tra cứu quy tắc không tồn tại trả về HTTP 404 Not Found');

    // 3.4. Super Admin cập nhật quy tắc: Tự động tăng version và ghi tax_rule_history
    const oldVersion = ruleR10.version;
    const updateRuleRes = await fetch(`${BASE_URL}/admin/rules/${ruleR10.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conditionSnippet: 'count_dependent_overlap(dep_id, tax_year) > 0',
        changeReason: 'Kiểm thử tự động nâng cấp logic thẩm tra theo NĐ 13/2023',
        description: 'Phát hiện giảm trừ trùng lặp người phụ thuộc trên nhiều tờ khai cùng kỳ quyết toán',
      }),
    });
    const updateRuleJson: any = await updateRuleRes.json();
    assert(updateRuleRes.status === 200, '3.4 Super Admin cập nhật quy tắc thành công (HTTP 200 OK)');
    assert(updateRuleJson.data.version !== oldVersion, `3.4 Số hiệu version tự động tăng từ ${oldVersion} lên ${updateRuleJson.data.version}`);

    // 3.5. Kiểm tra trực tiếp bảng tax_rule_history đã lưu vết kiểm toán đầy đủ
    const historyCheck = await pool.query(
      `SELECT * FROM tax_rule_history WHERE rule_id = $1 ORDER BY created_at DESC LIMIT 1;`,
      [ruleR10.id]
    );
    assert(historyCheck.rows.length === 1, '3.5 Bảng tax_rule_history có bản ghi lịch sử tương ứng');
    const historyRow = historyCheck.rows[0];
    assert(historyRow.version === updateRuleJson.data.version, '3.5 Bản ghi lịch sử lưu đúng version mới');
    assert(historyRow.editor_name === 'Quản trị viên Hệ thống Tối cao', '3.5 Bản ghi lịch sử ghi nhận đúng người chỉnh sửa');
    const parsedNote = JSON.parse(historyRow.note);
    assert(parsedNote.versionOld === oldVersion, '3.5 Snapshot lịch sử lưu version cũ chính xác');
    assert(parsedNote.changeReason.includes('Kiểm thử tự động'), '3.5 Snapshot lịch sử lưu lý do thay đổi minh bạch');

    // 3.6. Vô hiệu hóa quy tắc (Chính sách Soft Disable - không hỗ trợ Hard Delete)
    const disableRuleRes = await fetch(`${BASE_URL}/admin/rules/${ruleR10.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: false,
        changeReason: 'Tạm dừng quy tắc để bảo trì hệ thống',
      }),
    });
    const disableRuleJson: any = await disableRuleRes.json();
    assert(disableRuleRes.status === 200, '3.6 Vô hiệu hóa quy tắc (isActive: false) thành công (HTTP 200 OK)');
    assert(disableRuleJson.data.isActive === false, '3.6 Trạng thái isActive đã chuyển thành false');

    // 3.7. Kích hoạt lại quy tắc để trả lại trạng thái nguyên bản
    const reEnableRuleRes = await fetch(`${BASE_URL}/admin/rules/${ruleR10.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: true,
        changeReason: 'Kích hoạt lại quy tắc sau bảo trì hoàn tất',
      }),
    });
    const reEnableRuleJson: any = await reEnableRuleRes.json();
    assert(reEnableRuleRes.status === 200, '3.7 Tái kích hoạt quy tắc (isActive: true) thành công');
    assert(reEnableRuleJson.data.isActive === true, '3.7 Trạng thái quy tắc đã khôi phục isActive: true');

    // --------------------------------------------------------------------------
    // NHÓM 4: BẢO MẬT DỮ LIỆU CÁ NHÂN THEO NGHỊ ĐỊNH 13/2023/NĐ-CP (AUDIT LOGS)
    // --------------------------------------------------------------------------
    console.log('\n🔹 Nhóm 4: Bảo mật & Che mờ Dữ liệu Cá nhân theo Nghị định 13/2023/NĐ-CP');

    // 4.1. Lấy danh sách audit-logs có phân trang
    const logsRes = await fetch(`${BASE_URL}/admin/audit-logs?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    const logsJson: any = await logsRes.json();
    assert(logsRes.status === 200, '4.1 Lấy danh sách audit-logs thành công (HTTP 200 OK)');
    assert(logsJson.success === true, '4.1 Phản hồi success: true');
    assert(Array.isArray(logsJson.data.items), '4.1 Danh sách logs trả về mảng items');
    assert(Boolean(logsJson.data.pagination), '4.1 Thông tin phân trang tồn tại');
    assert(logsJson.data.items.length > 0, '4.1 Có ít nhất 1 bản ghi log mẫu');

    // 4.2. Kiểm tra che mờ CCCD (12 chữ số: 3 số đầu, 6 hoa thị, 3 số cuối)
    const firstLog = logsJson.data.items[0];
    const cccdRegex = /^\d{3}\*{6}\d{3}$/;
    assert(cccdRegex.test(firstLog.maskedCccd), `4.2 CCCD được che mờ chuẩn Nghị định 13: '${firstLog.maskedCccd}' (khớp định dạng 3 đầu, 6 sao, 3 cuối)`);

    // 4.3. Kiểm tra che mờ MST (Mã số thuế: 3 số đầu, 5 hoa thị, 2 số cuối)
    const mstRegex = /^\d{3}\*{5}\d{2}$/;
    assert(mstRegex.test(firstLog.maskedMst), `4.3 MST được che mờ chuẩn Nghị định 13: '${firstLog.maskedMst}' (khớp định dạng 3 đầu, 5 sao, 2 cuối)`);

    // 4.4. Kiểm tra che mờ Email (Ký tự đầu và cuối username)
    if (firstLog.maskedEmail) {
      assert(firstLog.maskedEmail.includes('***') && firstLog.maskedEmail.includes('@'), `4.4 Email được che mờ an toàn: '${firstLog.maskedEmail}'`);
    }

    // 4.5. Trạng thái giảm thiểu thu thập dữ liệu
    assert(firstLog.minimizationStatus === 'Tuân thủ 100%', '4.5 Trạng thái thu thập dữ liệu đạt chuẩn: "Tuân thủ 100%"');

    // 4.6. Lọc nhật ký theo actionType
    const filteredLogsRes = await fetch(`${BASE_URL}/admin/audit-logs?action=RULE_EVALUATION`, {
      headers: { Authorization: `Bearer ${tokenAdminManager}` },
    });
    const filteredLogsJson: any = await filteredLogsRes.json();
    assert(filteredLogsRes.status === 200, '4.6 Lọc audit-logs theo actionType=RULE_EVALUATION thành công');
    for (const item of filteredLogsJson.data.items) {
      assert(item.actionType === 'RULE_EVALUATION', '4.6 Bản ghi lọc đúng actionType yêu cầu');
    }

    // --------------------------------------------------------------------------
    // NHÓM 5: CẬP NHẬT THAM SỐ HỆ THỐNG BỞI SUPER ADMIN (PUT /api/settings)
    // --------------------------------------------------------------------------
    console.log('\n🔹 Nhóm 5: Cập nhật Tham số Hệ thống bởi Super Admin (PUT /api/settings)');

    // 5.1. Cập nhật 1 tham số hệ thống
    const updateSingleSettingRes = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settingKey: 'late_payment_penalty_rate_per_day',
        numericValue: 0.03,
      }),
    });
    const updateSingleSettingJson: any = await updateSingleSettingRes.json();
    assert(updateSingleSettingRes.status === 200, '5.1 Super Admin cập nhật đơn lẻ tham số hệ thống thành công (HTTP 200 OK)');
    assert(updateSingleSettingJson.data.updatedCount >= 1, '5.1 Số lượng tham số được cập nhật ít nhất là 1');

    // 5.2. Cập nhật hàng loạt danh sách tham số hệ thống
    const updateBatchSettingsRes = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: [
          { key: 'withholding_threshold', numericValue: 2000000 },
          { key: 'exemption_threshold', numericValue: 50000 },
        ],
      }),
    });
    const updateBatchSettingsJson: any = await updateBatchSettingsRes.json();
    assert(updateBatchSettingsRes.status === 200, '5.2 Super Admin cập nhật hàng loạt tham số hệ thống thành công');
    assert(updateBatchSettingsJson.data.updatedCount === 2, '5.2 Cập nhật chính xác 2 tham số trong batch');

    // 5.3. Bắt lỗi khi payload cập nhật rỗng
    const emptyPayloadRes = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    assert(emptyPayloadRes.status === 400, '5.3 Bắt lỗi validation khi gửi payload tham số rỗng (HTTP 400 Bad Request)');

    console.log('\n==============================================================================');
    console.log(`🎉 TẤT CẢ TEST CASES GIAI ĐOẠN 4.2 ĐÃ HOÀN TẤT THÀNH CÔNG!`);
    console.log(`📊 Tổng số kiểm thử: ${totalTests} | Đạt: ${passedTests}/${totalTests} (100% PASS)`);
    console.log('==============================================================================\n');
  } finally {
    server.close();
    await pool.end();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ BỘ KIỂM THỬ GIAI ĐOẠN 4.2 GẶP LỖI:', err);
  process.exit(1);
});
