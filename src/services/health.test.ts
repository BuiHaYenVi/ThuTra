// ==============================================================================
// Kiểm thử Hạ tầng HTTP Client & Kết nối Mạng Backend (Tầng 1 Integration Test)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { healthApi } from './health.api';
import { storageUtil } from '../utils/storage.util';
import { apiClient } from './apiClient';
import { ApiClientError, ApiErrorCode } from '../types/api.types';

declare const process: any;

async function runNetworkLayerTests() {
  console.log('============================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ HẠ TẦNG HTTP CLIENT & INTERCEPTORS (TẦNG 1)');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${desc}`);
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      throw new Error(`Test failed: ${desc}`);
    }
  }

  // --------------------------------------------------------------------------
  // NHÓM 1: KIỂM THỬ STORAGE UTILITY (LOCALSTORAGE & IN-MEMORY FALLBACK)
  // --------------------------------------------------------------------------
  console.log('🔹 Nhóm 1: Kiểm thử Storage Utility (An toàn & Dự phòng)');
  
  // 1.1 Lưu và đọc Access Token
  storageUtil.setAccessToken('mock_access_token_1234567890_abcdef');
  assert(storageUtil.getAccessToken() === 'mock_access_token_1234567890_abcdef', '1.1 Lưu và lấy chính xác Access Token');
  assert(storageUtil.hasValidAuth() === true, '1.2 hasValidAuth() xác nhận token hợp lệ');

  // 1.3 Lưu và đọc Refresh Token
  storageUtil.setRefreshToken('mock_refresh_token_9876543210');
  assert(storageUtil.getRefreshToken() === 'mock_refresh_token_9876543210', '1.3 Lưu và lấy chính xác Refresh Token');

  // 1.4 Lưu và đọc User Profile
  const mockUser = {
    id: 'user-uuid-001',
    email: 'test@thutra.vn',
    fullName: 'Nguyễn Văn Kiểm Thử',
    role: 'user' as const,
  };
  storageUtil.setUserProfile(mockUser);
  const retrievedUser = storageUtil.getUserProfile();
  assert(retrievedUser?.email === 'test@thutra.vn', '1.4 Lưu và lấy cache UserProfile chính xác');

  // 1.5 Active Profile Id
  storageUtil.setActiveProfileId('profile-2025-uuid');
  assert(storageUtil.getActiveProfileId() === 'profile-2025-uuid', '1.5 Lưu và lấy Active Profile ID');

  // 1.6 Dọn dẹp phiên (clearAllAuthData)
  storageUtil.clearAllAuthData();
  assert(storageUtil.getAccessToken() === null, '1.6 Xóa sạch Access Token sau khi clear');
  assert(storageUtil.getRefreshToken() === null, '1.7 Xóa sạch Refresh Token sau khi clear');
  assert(storageUtil.getUserProfile() === null, '1.8 Xóa sạch User Profile sau khi clear');
  assert(storageUtil.getActiveProfileId() === null, '1.9 Xóa sạch Active Profile ID sau khi clear');
  assert(storageUtil.hasValidAuth() === false, '1.10 hasValidAuth() trả về false sau khi clear');

  // --------------------------------------------------------------------------
  // NHÓM 2: KIỂM THỬ APICLIENT ERROR HANDLING & RESPONSE ENVELOPE
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 2: Kiểm thử ApiClientError & Phân loại Mã lỗi');

  const customErr = new ApiClientError('Dữ liệu không hợp lệ', 400, ApiErrorCode.VALIDATION_ERROR, [
    { field: 'email', message: 'Email sai định dạng' },
  ]);
  assert(ApiClientError.isValidationError(customErr), '2.1 isValidationError() nhận diện mã 400');
  assert(customErr.errors?.[0].field === 'email', '2.2 ApiClientError lưu trữ chi tiết validation');

  const authErr = new ApiClientError('Chưa đăng nhập', 401, ApiErrorCode.UNAUTHORIZED);
  assert(ApiClientError.isUnauthorized(authErr), '2.3 isUnauthorized() nhận diện mã 401');

  const networkErr = new ApiClientError('Mất kết nối', 0, ApiErrorCode.NETWORK_ERROR);
  assert(ApiClientError.isNetworkError(networkErr), '2.4 isNetworkError() nhận diện mã 0 / NETWORK_ERROR');

  // --------------------------------------------------------------------------
  // NHÓM 3: KIỂM THỬ KẾT NỐI MẠNG THỰC TẾ VỚI BACKEND (HEALTH API)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 3: Kiểm thử Kết nối Thực tế với Backend (GET /api/health)');

  const isAlive = await healthApi.pingServer();
  assert(isAlive === true, '3.1 pingServer() kiểm tra Backend đang hoạt động 200 OK');

  const healthRes = await healthApi.checkHealth();
  assert(healthRes.success === true, '3.2 checkHealth() trả về success: true');
  assert(healthRes.statusCode === 200, '3.3 statusCode phản hồi là 200');
  assert(typeof healthRes.data.uptimeSeconds === 'number', '3.4 Backend trả về uptimeSeconds hợp lệ');
  assert(typeof healthRes.data.service === 'string', '3.5 Backend trả về tên service định danh');

  const uptime = await healthApi.getServerUptime();
  assert(uptime !== null && uptime >= 0, '3.6 getServerUptime() lấy số giây hoạt động chính xác');

  // --------------------------------------------------------------------------
  // NHÓM 4: KIỂM THỬ BEG VÀ BẮT LỖI TẬP TRUNG (404 NOT FOUND QUA APICLIENT)
  // --------------------------------------------------------------------------
  console.log('\n🔹 Nhóm 4: Bắt lỗi Tập trung qua ApiClient (404 Handling)');

  try {
    await apiClient.get('/non-existent-endpoint-test-404');
    assert(false, 'Phải ném ra ngoại lệ ApiClientError');
  } catch (err: any) {
    assert(err instanceof ApiClientError, '4.1 Lỗi được bao đóng chuẩn hóa trong ApiClientError');
    assert(err.statusCode === 404, '4.2 Bắt đúng HTTP Status Code 404');
    assert(err.errorCode === ApiErrorCode.NOT_FOUND, '4.3 Tự động ánh xạ errorCode NOT_FOUND');
  }

  console.log('\n============================================================');
  console.log(`🎉 HOÀN TẤT KIỂM THỬ TẦNG 1: ${passed}/${total} TESTS ĐẠT YÊU CẦU 100%!`);
  console.log('============================================================');
}

runNetworkLayerTests().catch((e) => {
  console.error('Lỗi khi chạy kiểm thử Tầng 1:', e);
  process.exit(1);
});
