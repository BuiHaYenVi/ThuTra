// ==============================================================================
// Bộ Kiểm thử Tự động Động cơ Tính thuế & 15 Quy tắc Thẩm tra (Audit Test Suite)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import http from 'http';
import { app } from '../app';
import { tokenService } from '../services/token.service';
import { TaxCalculatorEngine } from '../engines/tax-calculator.engine';
import { ruleEngine } from '../engines/rule-engine';
import { 
  AuditContext, 
  AuditSeverity, 
  AuditStatus 
} from '../types/audit.types';
import type { UserContext } from '../types/auth.types';
import { pool } from '../config/database';

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
  console.log('🧪 BẮT ĐẦU KIỂM THỬ GIAI ĐOẠN 3: TÍNH THUẾ LŨY TIẾN & 15 RULES');
  console.log('============================================================\n');

  // Khởi động HTTP server kiểm thử trên cổng 5003
  const server = http.createServer(app);
  const TEST_PORT = 5003;
  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => resolve());
  });

  // User A: Người nộp thuế hợp lệ (Nguyễn Hoàng Nam - sở hữu profile đã seed)
  const userA: UserContext = {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'nam.nguyen@example.com',
    role: 'user',
    fullName: 'Nguyễn Hoàng Nam',
  };
  const tokenA = tokenService.generateAccessToken(userA).token;

  // User B: Cán bộ quản lý (admin_manager)
  const userB: UserContext = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin.manager@thutra.vn',
    role: 'admin_manager',
    fullName: 'Quản trị viên Nghiệp vụ',
  };
  const tokenB = tokenService.generateAccessToken(userB).token;

  // User C: Người nộp thuế khác (để kiểm thử triệt để RLS Isolation & Chống ID Enumeration)
  const userC: UserContext = {
    id: '00000000-0000-0000-0000-000000000099',
    email: 'other.taxpayer@example.com',
    role: 'user',
    fullName: 'Người Dùng Khác',
  };
  const tokenC = tokenService.generateAccessToken(userC).token;

  const validProfileId = '4e43e9e0-2bbf-49be-8a65-6dcb1c73cb6d';
  let createdAuditRunId = '';

  try {
    // --------------------------------------------------------------------------
    // PHẦN 1: KIỂM THỬ THUẬT TOÁN BIỂU THUẾ LŨY TIẾN 7 BẬC (TAX CALCULATOR ENGINE)
    // --------------------------------------------------------------------------
    console.log('🔹 Phần 1: Kiểm thử Thuật toán Biểu thuế Lũy tiến 7 bậc');

    // 1.1. Thu nhập chịu thuế 11.000.000đ/tháng (132tr/năm), không người phụ thuộc -> Thuế = 0
    const calcCase1 = TaxCalculatorEngine.calculate({
      grossIncome: 132000000,
      personalDeductionMonths: 12,
      dependentsTotalMonths: 0,
    });
    assert(calcCase1.taxableIncome === 0, '1.1 Thu nhập tính thuế bằng 0 khi thu nhập <= mức giảm trừ bản thân');
    assert(calcCase1.taxLiability === 0, '1.1 Thuế phát sinh = 0 VNĐ cho thu nhập 11tr/tháng');
    assert(calcCase1.appliedBracket === 0, '1.1 Bậc thuế chạm tới là 0');

    // 1.2. Thu nhập 30.000.000đ/tháng (360tr/năm), 1 người phụ thuộc (12 tháng)
    // Giảm trừ: Bản thân 132tr + NPT 52.8tr = 184.8tr -> TNTT = 175.2tr
    // Bậc 1: 60tr x 5% = 3tr
    // Bậc 2: 60tr x 10% = 6tr
    // Bậc 3: (175.2tr - 120tr) = 55.2tr x 15% = 8.28tr
    // Tổng thuế: 3tr + 6tr + 8.28tr = 17.28tr. Chạm bậc 3.
    const calcCase2 = TaxCalculatorEngine.calculate({
      grossIncome: 360000000,
      personalDeductionMonths: 12,
      dependentsTotalMonths: 12,
      taxDeducted: 20000000, // Đã bị khấu trừ 20tr tại nguồn
    });
    assert(calcCase2.taxableIncome === 175200000, '1.2 Thu nhập tính thuế chuẩn xác: 175.200.000 VNĐ');
    assert(calcCase2.taxLiability === 17280000, '1.2 Tổng thuế phát sinh chuẩn xác: 17.280.000 VNĐ');
    assert(calcCase2.appliedBracket === 3, '1.2 Bậc thuế cao nhất chạm tới là Bậc 3');
    assert(calcCase2.bracketDetails[0].taxAmount === 3000000, '1.2 Thuế Bậc 1 (5%): 3.000.000 VNĐ');
    assert(calcCase2.bracketDetails[1].taxAmount === 6000000, '1.2 Thuế Bậc 2 (10%): 6.000.000 VNĐ');
    assert(calcCase2.bracketDetails[2].taxAmount === 8280000, '1.2 Thuế Bậc 3 (15%): 8.280.000 VNĐ');
    assert(calcCase2.bracketDetails[3].taxAmount === 0, '1.2 Thuế Bậc 4: 0 VNĐ');
    assert(calcCase2.taxRefund === 2720000, '1.2 Số tiền hoàn thuế chính xác (20tr - 17.28tr = 2.720.000 VNĐ)');
    assert(calcCase2.taxPayable === 0, '1.2 Số tiền phải nộp thêm = 0 VNĐ');

    // 1.3. Thu nhập cao (> 100.000.000đ/tháng, ví dụ 120tr/tháng = 1.440.000.000đ/năm)
    // TNTT = 1.440tr - 132tr = 1.308.000.000 VNĐ. Chạm đến Bậc 7 (> 960tr).
    // Bậc 7: (1.308tr - 960tr) = 348tr x 35% = 121.800.000 VNĐ.
    // Tổng thuế: TNTT x 35% - 118.2tr = 1.308.000.000 x 0.35 - 118.200.000 = 339.600.000 VNĐ.
    const calcCase3 = TaxCalculatorEngine.calculate({
      grossIncome: 1440000000,
      personalDeductionMonths: 12,
      dependentsTotalMonths: 0,
      taxDeducted: 300000000,
    });
    assert(calcCase3.appliedBracket === 7, '1.3 Thu nhập cao chạm đến Bậc 7');
    assert(calcCase3.taxLiability === 339600000, '1.3 Tổng thuế phát sinh Bậc 7 chuẩn xác: 339.600.000 VNĐ');
    assert(calcCase3.bracketDetails[6].taxAmount === 121800000, '1.3 Thuế riêng phần Bậc 7: 121.800.000 VNĐ');
    assert(calcCase3.taxPayable === 39600000, '1.3 Số thuế phải nộp thêm: 39.600.000 VNĐ');

    // 1.4. Quy tắc miễn nộp thuế <= 50.000đ theo Nghị định 126/2020
    const calcCase4 = TaxCalculatorEngine.calculate({
      grossIncome: 132500000,
      personalDeductionMonths: 12,
      taxDeducted: 0,
    });
    // TNTT = 500.000đ x 5% = 25.000đ <= 50.000đ
    assert(calcCase4.taxPayable === 25000, '1.4 Số thuế phát sinh thêm = 25.000 VNĐ');
    assert(calcCase4.isExemptUnder50k === true, '1.4 Đạt điều kiện miễn nộp thuế phát sinh <= 50.000 VNĐ');

    console.log('');

    // --------------------------------------------------------------------------
    // PHẦN 2: KIỂM THỬ BỘ MÁY 15 RULES (RULE ENGINE R01 - R15)
    // --------------------------------------------------------------------------
    console.log('🔹 Phần 2: Kiểm thử Bộ máy 15 Rules (Rule Engine Strategy Pattern)');

    // 2.1. Kịch bản hồ sơ chuẩn, tất cả 15 rules đều PASSED
    const cleanContext: AuditContext = {
      userId: userA.id,
      profile: {
        id: validProfileId,
        userId: userA.id,
        taxYear: 2024,
        periodTitle: 'Kỳ quyết toán thuế TNCN 2024',
        taxDepartmentCode: 'CT_HN',
        taxDepartmentName: 'Cục Thuế TP Hà Nội',
        isTaxResident: true,
        stayDaysInYear: 365,
        isAuthorizedFinalization: false,
      },
      incomeSources: [
        {
          id: 'src-1',
          payerName: 'Công ty Cổ phần Công nghệ ABC',
          payerMst: '0101234567',
          totalIncomeGross: 360000000,
          totalTaxableIncome: 360000000,
          taxWithheld: 20000000,
          withholdingRate: 10,
          insuranceDeduction: 20000000,
          applyPersonalDeduction: true,
          eCertificateCode: 'C24TAG',
          isECertificateVerified: true,
        },
      ],
      documents: [
        {
          id: 'doc-1',
          user_id: userA.id,
          profile_id: validProfileId,
          income_source_id: 'src-1',
          doc_type: 'tax_withholding_cert',
          file_name: 'Chung_tu_ABC_2024.pdf',
          file_url: '/storage/docs/doc-1.pdf',
          file_size_bytes: 1024,
          mime_type: 'application/pdf',
          file_hash_sha256: 'hash-abc',
          ocr_status: 'completed',
          ocr_confidence: 95.5,
          ocr_extracted_payload: {
            document_number: 'CT-2024-001',
            tax_code_issuer: '0101234567',
            gross_income: 360000000,
            tax_deducted: 20000000,
          },
          verification_status: 'verified_auto',
          is_digital_signature_valid: true,
          certificate_serial: 'SERIAL-1234',
          signer_organization: 'Công ty Cổ phần Công nghệ ABC',
          verified_at: new Date().toISOString(),
          retention_expires_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      dependents: [
        {
          id: 'dep-1',
          fullName: 'Nguyễn Văn Con',
          relationType: 'con',
          cccd: '001200012345',
          mst: '8000123456',
          hasMst: true,
          monthsApplied: 12,
          monthlyDeduction: 4400000,
          totalDeduction: 52800000,
          isValidCqt: true,
          proofDocumentId: 'doc-proof-1',
        },
      ],
      calculation: calcCase2,
    };

    const cleanFindings = await ruleEngine.executeAll(cleanContext);
    assert(cleanFindings.length === 15, '2.1 Đã quét đủ 15 quy tắc thẩm tra');
    const cleanStatus = ruleEngine.evaluateOverallStatus(cleanFindings);
    assert(cleanStatus === AuditStatus.PASSED, '2.1 Hồ sơ hợp lệ đạt trạng thái PASSED');

    // 2.2. Kịch bản Chứng từ chưa đối soát (unverified) -> Kích hoạt R03 (WARNING)
    const unverifiedContext: AuditContext = {
      ...cleanContext,
      documents: [
        {
          ...cleanContext.documents[0],
          verification_status: 'unverified' as any,
        },
      ],
    };
    const unverifiedFindings = await ruleEngine.executeAll(unverifiedContext);
    const r03 = unverifiedFindings.find((f) => f.ruleCode === 'R03');
    assert(r03 !== undefined && r03.status === AuditStatus.WARNING, '2.2 Kích hoạt cảnh báo R03 cho chứng từ unverified');
    assert(ruleEngine.evaluateOverallStatus(unverifiedFindings) === AuditStatus.WARNING, '2.2 Trạng thái tổng thể là WARNING khi có R03');

    // 2.3. Kịch bản Thuế khấu trừ lớn hơn thu nhập -> Kích hoạt R06 (CRITICAL FAILED)
    const excessiveWithholdingCalc = {
      ...calcCase2,
      grossIncome: 10000000,
      taxDeducted: 50000000, // 50tr > 10tr thu nhập
    };
    const excessiveContext: AuditContext = {
      ...cleanContext,
      calculation: excessiveWithholdingCalc,
    };
    const excessiveFindings = await ruleEngine.executeAll(excessiveContext);
    const r06 = excessiveFindings.find((f) => f.ruleCode === 'R06');
    assert(r06 !== undefined && r06.status === AuditStatus.FAILED, '2.3 Kích hoạt lỗi nghiêm trọng R06 khi thuế khấu trừ > thu nhập');
    assert(r06?.severity === AuditSeverity.CRITICAL, '2.3 Mức độ nghiêm trọng của R06 là CRITICAL');
    assert(ruleEngine.evaluateOverallStatus(excessiveFindings) === AuditStatus.FAILED, '2.3 Trạng thái tổng thể bị FAILED do lỗi CRITICAL R06');

    // 2.4. Kịch bản Giảm trừ người phụ thuộc trên 12 tháng -> Kích hoạt R11 (CRITICAL FAILED)
    const invalidDepMonthsContext: AuditContext = {
      ...cleanContext,
      dependents: [
        {
          ...cleanContext.dependents[0],
          monthsApplied: 14, // > 12 tháng
        },
      ],
    };
    const invalidDepMonthsFindings = await ruleEngine.executeAll(invalidDepMonthsContext);
    const r11 = invalidDepMonthsFindings.find((f) => f.ruleCode === 'R11');
    assert(r11 !== undefined && r11.status === AuditStatus.FAILED, '2.4 Kích hoạt vi phạm R11 khi số tháng NPT vượt quá 12 tháng');
    assert(r11?.severity === AuditSeverity.CRITICAL, '2.4 Mức độ nghiêm trọng của R11 là CRITICAL');

    // 2.5. Kịch bản Người phụ thuộc trùng lặp số định danh/CCCD -> Kích hoạt R09 (CRITICAL FAILED)
    const duplicateDepContext: AuditContext = {
      ...cleanContext,
      dependents: [
        cleanContext.dependents[0],
        {
          id: 'dep-2',
          fullName: 'Nguyễn Văn Con Trùng',
          relationType: 'con',
          cccd: '001200012345', // Trùng CCCD với dep-1
          mst: null,
          hasMst: false,
          monthsApplied: 6,
          monthlyDeduction: 4400000,
          totalDeduction: 26400000,
          isValidCqt: true,
          proofDocumentId: null,
        },
      ],
    };
    const duplicateDepFindings = await ruleEngine.executeAll(duplicateDepContext);
    const r09 = duplicateDepFindings.find((f) => f.ruleCode === 'R09');
    assert(r09 !== undefined && r09.status === AuditStatus.FAILED, '2.5 Kích hoạt vi phạm R09 khi trùng lặp CCCD người phụ thuộc');
    assert(r09?.severity === AuditSeverity.CRITICAL, '2.5 Mức độ nghiêm trọng của R09 là CRITICAL');

    console.log('');

    // --------------------------------------------------------------------------
    // PHẦN 3: KIỂM THỬ TÍCH HỢP RESTFUL API & BẢO MẬT RLS
    // --------------------------------------------------------------------------
    console.log('🔹 Phần 3: Kiểm thử Tích hợp API Endpoint & Bảo mật RLS Context');

    // 3.1. POST /api/audit/calculate: Tính thử nhanh (Public / Direct)
    const quickCalcRes = await fetch(`${BASE_URL}/audit/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grossIncome: 360000000,
        dependentsCount: 1,
        taxWithheld: 20000000,
      }),
    });
    const quickCalcData: any = await quickCalcRes.json();
    assert(quickCalcRes.status === 200, '3.1 POST /api/audit/calculate trả về HTTP 200 OK');
    assert(quickCalcData.data.taxLiability === 17280000, '3.1 Số thuế phát sinh chiết tính nhanh đúng 17.280.000 VNĐ');
    assert(quickCalcData.data.taxRefund === 2720000, '3.1 Tiền hoàn thuế đúng 2.720.000 VNĐ');

    // 3.2. POST /api/audit/run/:profileId: User A chạy thẩm tra trên hồ sơ của chính mình
    const runAuditRes = await fetch(`${BASE_URL}/audit/run/${validProfileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const runAuditData: any = await runAuditRes.json();
    assert(runAuditRes.status === 200, '3.2 User A chạy thẩm tra hồ sơ cá nhân thành công (HTTP 200)');
    assert(runAuditData.success === true, '3.2 Kết quả phản hồi thành công');
    assert(Boolean(runAuditData.data.auditRunId), '3.2 Sinh ra auditRunId hợp lệ');
    assert(runAuditData.data.findings.length === 15, '3.2 Trả về đầy đủ kết quả thẩm tra 15 rules');
    createdAuditRunId = runAuditData.data.auditRunId;

    // 3.3. GET /api/audit/history/:profileId: User A lấy lịch sử thẩm tra
    const historyRes = await fetch(`${BASE_URL}/audit/history/${validProfileId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const historyData: any = await historyRes.json();
    assert(historyRes.status === 200, '3.3 GET /api/audit/history/:profileId trả về HTTP 200');
    assert(Array.isArray(historyData.data) && historyData.data.length >= 1, '3.3 Danh sách lịch sử chứa ít nhất 1 phiên thẩm tra');

    // 3.4. GET /api/audit/report/:auditRunId: User A xem báo cáo chi tiết
    const reportRes = await fetch(`${BASE_URL}/audit/report/${createdAuditRunId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const reportData: any = await reportRes.json();
    assert(reportRes.status === 200, '3.4 GET /api/audit/report/:auditRunId trả về HTTP 200');
    assert(reportData.data.auditRun.id === createdAuditRunId, '3.4 ID phiên thẩm tra trong báo cáo trùng khớp');
    assert(Array.isArray(reportData.data.findings), '3.4 Báo cáo chứa danh sách các findings');

    // 3.5. BẢO MẬT RLS & CHỐNG ID ENUMERATION:
    // User C (Người nộp thuế khác) cố tình gọi API chạy thẩm tra trên hồ sơ của User A -> Bị chặn với HTTP 404
    const rlsRunRes = await fetch(`${BASE_URL}/audit/run/${validProfileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    assert(rlsRunRes.status === 404, '3.5 User C bị RLS chặn khi cố chạy audit trên hồ sơ của User A (HTTP 404 Not Found)');

    // User C cố tình xem lịch sử của User A -> HTTP 404 Not Found
    const rlsHistoryRes = await fetch(`${BASE_URL}/audit/history/${validProfileId}`, {
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    assert(rlsHistoryRes.status === 404, '3.5 User C bị RLS chặn khi cố xem lịch sử hồ sơ của User A (HTTP 404 Not Found)');

    // User C cố tình xem chi tiết báo cáo thẩm tra của User A -> HTTP 404 Not Found
    const rlsReportRes = await fetch(`${BASE_URL}/audit/report/${createdAuditRunId}`, {
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    assert(rlsReportRes.status === 404, '3.5 User C bị RLS chặn khi cố đọc báo cáo audit của User A (HTTP 404 Not Found)');

    // 3.6. Cán bộ quản lý (admin_manager) cố tình gọi POST run audit -> Bị chặn với HTTP 403 Forbidden
    const adminRunRes = await fetch(`${BASE_URL}/audit/run/${validProfileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(adminRunRes.status === 403, '3.6 Admin Manager bị chặn HTTP 403 Forbidden khi cố tình can thiệp chạy tính toán');

    console.log('\n============================================================');
    console.log(`🎉 HOÀN TẤT KIỂM THỬ GIAI ĐOẠN 3: ${passedTests}/${totalTests} TESTS PASS (100%)!`);
    console.log('============================================================\n');
  } finally {
    server.close();
    await pool.end();
  }
}

runTestSuite().catch((err) => {
  console.error('Lỗi khi chạy bộ kiểm thử Phase 3:', err);
  process.exit(1);
});
