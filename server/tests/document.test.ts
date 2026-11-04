// ==============================================================================
// Bộ Kiểm thử Tự động Quản lý Chứng từ & OCR (Document & OCR Test Suite)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import fs from 'fs';
import path from 'path';
import http from 'http';
import { app } from '../app';
import { tokenService } from '../services/token.service';
import { ocrService } from '../services/ocr.service';
import { DocumentType } from '../types/document.types';
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
  console.log('🧪 BẮT ĐẦU KIỂM THỬ GIAI ĐOẠN 2: CHỨNG TỪ THUẾ & OCR');
  console.log('============================================================\n');

  // Khởi động server HTTP kiểm thử trên cổng 5002
  const server = http.createServer(app);
  const TEST_PORT = 5002;
  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => resolve());
  });

  // Chuẩn bị User A (Người nộp thuế hợp lệ - Nguyễn Hoàng Nam)
  const userA: UserContext = {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'nam.nguyen@example.com',
    role: 'user',
    fullName: 'Nguyễn Hoàng Nam',
  };
  const tokenA = tokenService.generateAccessToken(userA).token;

  // Chuẩn bị User B (Người dùng khác trong hệ thống để test cô lập RLS)
  const userB: UserContext = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin.manager@thutra.vn',
    role: 'admin_manager',
    fullName: 'Quản trị viên Nghiệp vụ',
  };
  const tokenB = tokenService.generateAccessToken(userB).token;

  // Thư mục lưu tệp tạm để upload
  const tempDir = path.resolve(process.cwd(), 'storage/temp_test');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const samplePdfPath = path.join(tempDir, 'Chung_tu_thue_ABC_2024.pdf');
  fs.writeFileSync(
    samplePdfPath,
    '%PDF-1.4 Mock PDF Chứng từ khấu trừ thuế TNCN Công ty Cổ phần Công nghệ ABC 2024'
  );

  const sampleJpgPath = path.join(tempDir, 'CCCD_Nguoi_Phu_Thuoc.jpg');
  fs.writeFileSync(sampleJpgPath, 'Mock Image CCCD Người phụ thuộc');

  const sampleInvalidTxtPath = path.join(tempDir, 'virus_script.txt');
  fs.writeFileSync(sampleInvalidTxtPath, 'Plain text file not allowed');

  let uploadedDocAId = '';
  let uploadedDocAPhysicalPath = '';

  try {
    // --------------------------------------------------------------------------
    // NHÓM 1: KIỂM THỬ OCR SERVICE & MOCK ENGINE (ADAPTER PATTERN)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 1: Kiểm thử OCR Service (Adapter Pattern & Logic bóc tách)');

    // 1.1. Bóc tách chứng từ ABC
    const ocrAbc = await ocrService.extract(
      samplePdfPath,
      'Chung_tu_thue_ABC_2024.pdf',
      'application/pdf',
      DocumentType.WITHHOLDING_TAX
    );
    assert(ocrAbc.tax_code_issuer === '0312345678', 'Bóc tách chính xác MST đơn vị chi trả ABC');
    assert(ocrAbc.gross_income === 180000000, 'Bóc tách chính xác Tổng thu nhập 180.000.000đ');
    assert(ocrAbc.tax_deducted === 14200000, 'Bóc tách chính xác Số thuế khấu trừ 14.200.000đ');
    assert(ocrAbc.confidence_score >= 0.9, 'Điểm tin cậy cao >= 0.90');
    assert(ocrAbc.needs_manual_review === false, 'Không cần rà soát thủ công khi tin cậy cao');

    // 1.2. Bóc tách chứng từ mờ nhòe / low quality
    const ocrBlur = await ocrService.extract(
      samplePdfPath,
      'Chung_tu_mo_scan_xau.pdf',
      'application/pdf',
      DocumentType.WITHHOLDING_TAX
    );
    assert(ocrBlur.confidence_score < 0.85, 'Đánh giá điểm tin cậy thấp (< 0.85) khi tệp mờ');
    assert(ocrBlur.needs_manual_review === true, 'Tự động bật cờ needs_manual_review = true');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 2: KIỂM THỬ UPLOAD TỆP TIN & MULTIPART/FORM-DATA (201 CREATED)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 2: Kiểm thử Upload tệp tin hợp lệ qua HTTP (201 Created)');

    // Helper tạo FormData multipart/form-data bằng Node native fetch
    const fileBuffer = fs.readFileSync(samplePdfPath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, 'Chung_tu_thue_ABC_2024.pdf');
    formData.append('docType', DocumentType.WITHHOLDING_TAX);
    formData.append('taxYear', '2024');

    const uploadRes = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
      body: formData,
    });

    const uploadData: any = await uploadRes.json();
    assert(uploadRes.status === 201, 'Endpoint POST /upload trả về mã HTTP 201 Created');
    assert(uploadData.success === true, 'Phản hồi thành công (success: true)');
    assert(uploadData.data?.id !== undefined, 'Trả về ID chứng từ sau khi lưu');
    assert(uploadData.data?.extractedData?.tax_code_issuer === '0312345678', 'Dữ liệu bóc tách được gắn kèm vào DTO');
    assert(uploadData.data?.verificationStatus === 'unverified', 'Trạng thái ban đầu là unverified');

    uploadedDocAId = uploadData.data.id;
    const relPath = uploadData.data.fileUrl.replace(/^\/storage\//, 'storage/');
    uploadedDocAPhysicalPath = path.resolve(process.cwd(), relPath);

    assert(fs.existsSync(uploadedDocAPhysicalPath), 'Tệp vật lý đã được lưu an toàn trên đĩa cứng');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 3: BẪY LỖI FILEFILTER (CHẶN ĐỊNH DẠNG KHÔNG HỢP LỆ & THIẾU FILE)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 3: Kiểm thử Bộ lọc tệp tin (FileFilter & Error Handling)');

    // 3.1. Upload tệp .txt không được phép
    const txtBuffer = fs.readFileSync(sampleInvalidTxtPath);
    const badBlob = new Blob([txtBuffer], { type: 'text/plain' });
    const badFormData = new FormData();
    badFormData.append('file', badBlob, 'virus_script.txt');

    const badUploadRes = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
      body: badFormData,
    });

    const badUploadData: any = await badUploadRes.json();
    assert(badUploadRes.status === 400, 'Tệp định dạng text/plain bị từ chối với HTTP 400 Bad Request');
    assert(badUploadData.errors?.[0]?.code === 'INVALID_FILE_TYPE', 'Mã lỗi INVALID_FILE_TYPE');

    // 3.2. Request không đính kèm file
    const emptyFormData = new FormData();
    emptyFormData.append('docType', DocumentType.WITHHOLDING_TAX);

    const emptyRes = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
      body: emptyFormData,
    });
    assert(emptyRes.status === 400, 'Không đính kèm file bị từ chối với HTTP 400');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 4: KIỂM THỬ XÁC NHẬN SỐ LIỆU (PUT /confirm) & RÀNG BUỘC TIỀN TỆ
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 4: Kiểm thử Xác nhận số liệu chứng từ (PUT /confirm)');

    // 4.1. Xác nhận số liệu hợp lệ
    const confirmRes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}/confirm`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issuerName: 'Công ty Cổ phần Công nghệ ABC (Đã kiểm tra)',
        taxCodeIssuer: '0312345678',
        documentNumber: 'CT01/2024/ABC89',
        grossIncome: 180000000,
        taxDeducted: 14200000,
        taxYear: 2024,
      }),
    });

    const confirmData: any = await confirmRes.json();
    assert(confirmRes.status === 200, 'PUT /confirm trả về HTTP 200 OK');
    assert(confirmData.data?.verificationStatus === 'verified_manual', 'Trạng thái chuyển sang verified_manual');
    assert(confirmData.data?.verifiedAt !== null, 'Thời điểm verified_at được ghi nhận');

    // 4.2. Bẫy lỗi tiền tệ: taxDeducted > grossIncome
    const invalidMoneyRes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}/confirm`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issuerName: 'Công ty ABC',
        taxCodeIssuer: '0312345678',
        grossIncome: 10000000,
        taxDeducted: 20000000, // Lỗi: Thuế khấu trừ lớn hơn thu nhập
        taxYear: 2024,
      }),
    });
    assert(invalidMoneyRes.status === 400, 'Số thuế khấu trừ > thu nhập chịu thuế bị chặn với HTTP 400');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 5: KIỂM THỬ BẢO MẬT ROW-LEVEL SECURITY (RLS) & CÔ LẬP NGƯỜI DÙNG
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 5: Kiểm thử Bảo mật Row-Level Security (RLS Cô lập Dữ liệu)');

    // 5.1. User A đọc tài liệu của chính mình -> Thành công
    const getDocUserARes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(getDocUserARes.status === 200, 'User A truy cập được chứng từ của chính mình');

    // 5.2. User B cố tình dùng ID của User A để đọc -> RLS chặn trả về 404 (Không làm lộ ID)
    const getDocUserBRes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(getDocUserBRes.status === 404, 'User B bị RLS chặn khi cố đọc chứng từ của User A (HTTP 404 Not Found)');

    // 5.3. User B cố tình xóa chứng từ của User A -> RLS chặn trả về 404
    const deleteDocUserBRes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(deleteDocUserBRes.status === 404, 'User B bị RLS chặn khi cố xóa chứng từ của User A (HTTP 404 Not Found)');

    console.log('');

    // --------------------------------------------------------------------------
    // NHÓM 6: KIỂM THỬ XÓA TOÀN VẸN 2 CHIỀU (DATABASE + TỆP VẬT LÝ)
    // --------------------------------------------------------------------------
    console.log('🔹 Nhóm 6: Kiểm thử Xóa toàn vẹn hai chiều (DELETE /documents/:id)');

    assert(fs.existsSync(uploadedDocAPhysicalPath), 'Tệp vật lý vẫn đang tồn tại trước khi xóa');

    const deleteRes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const deleteData: any = await deleteRes.json();
    assert(deleteRes.status === 200, 'DELETE /documents/:id trả về HTTP 200 OK');
    assert(deleteData.success === true, 'Phản hồi xóa thành công');
    assert(!fs.existsSync(uploadedDocAPhysicalPath), 'Tệp tin vật lý trên đĩa cứng đã bị xóa sạch hoàn toàn');

    // Truy vấn lại tài liệu sau khi xóa -> 404
    const verifyDeletedRes = await fetch(`${BASE_URL}/documents/${uploadedDocAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(verifyDeletedRes.status === 404, 'Tài liệu không còn tồn tại trong database (HTTP 404)');

    console.log('\n============================================================');
    console.log(`🎉 HOÀN TẤT KIỂM THỬ: ${passedTests}/${totalTests} TESTS ĐẠT YÊU CẦU 100%!`);
    console.log('============================================================\n');
  } finally {
    // Dọn dẹp thư mục tạm
    try {
      if (fs.existsSync(samplePdfPath)) fs.unlinkSync(samplePdfPath);
      if (fs.existsSync(sampleJpgPath)) fs.unlinkSync(sampleJpgPath);
      if (fs.existsSync(sampleInvalidTxtPath)) fs.unlinkSync(sampleInvalidTxtPath);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    } catch {}

    server.close();
    await pool.end();
  }
}

runTestSuite().catch((err) => {
  console.error('Lỗi khi chạy bộ kiểm thử Phase 2:', err);
  process.exit(1);
});
