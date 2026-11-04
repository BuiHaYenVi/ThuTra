// ==============================================================================
// Đóng gói An toàn Thao tác Bộ nhớ Cục bộ (Safe Storage Utility)
// Hệ thống: ThuTra TNCN - Tầng 1: Network Layer
// ==============================================================================

import type { UserContextDto, AuthTokens } from '../types/api.types';

/**
 * Danh sách khóa định danh chuẩn hóa lưu trữ trong Storage
 */
export const StorageKeys = {
  ACCESS_TOKEN: 'thutra_access_token',
  REFRESH_TOKEN: 'thutra_refresh_token',
  USER_PROFILE: 'thutra_user_profile',
  ACTIVE_PROFILE_ID: 'thutra_active_profile_id',
  REMEMBER_LOGIN: 'thutra_remember_login',
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];

/**
 * Bộ nhớ tạm in-memory dự phòng trường hợp LocalStorage bị chặn (Private Browsing / Cookies Disabled)
 */
const inMemoryFallback = new Map<string, string>();

/**
 * Kiểm tra xem môi trường hiện tại có hỗ trợ localStorage hợp lệ không
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__thutra_test_storage__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

/**
 * Đọc dữ liệu dạng chuỗi an toàn từ Storage
 */
function getItem(key: string): string | null {
  try {
    if (hasLocalStorage) {
      return window.localStorage.getItem(key);
    }
    return inMemoryFallback.get(key) || null;
  } catch (err) {
    console.warn(`[StorageUtil] Không thể đọc khóa '${key}' từ LocalStorage:`, err);
    return inMemoryFallback.get(key) || null;
  }
}

/**
 * Ghi dữ liệu dạng chuỗi an toàn vào Storage
 */
function setItem(key: string, value: string): void {
  try {
    if (hasLocalStorage) {
      window.localStorage.setItem(key, value);
    }
    inMemoryFallback.set(key, value);
  } catch (err) {
    console.warn(`[StorageUtil] Không thể ghi khóa '${key}' vào LocalStorage:`, err);
    inMemoryFallback.set(key, value);
  }
}

/**
 * Xóa một mục dữ liệu an toàn khỏi Storage
 */
function removeItem(key: string): void {
  try {
    if (hasLocalStorage) {
      window.localStorage.removeItem(key);
    }
    inMemoryFallback.delete(key);
  } catch (err) {
    console.warn(`[StorageUtil] Không thể xóa khóa '${key}' khỏi LocalStorage:`, err);
    inMemoryFallback.delete(key);
  }
}

export const storageUtil = {
  // ----------------------------------------------------------------------------
  // QUẢN LÝ ACCESS TOKEN & REFRESH TOKEN
  // ----------------------------------------------------------------------------
  getAccessToken(): string | null {
    return getItem(StorageKeys.ACCESS_TOKEN);
  },

  setAccessToken(token: string): void {
    if (!token) return;
    setItem(StorageKeys.ACCESS_TOKEN, token.trim());
  },

  removeAccessToken(): void {
    removeItem(StorageKeys.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return getItem(StorageKeys.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    if (!token) return;
    setItem(StorageKeys.REFRESH_TOKEN, token.trim());
  },

  removeRefreshToken(): void {
    removeItem(StorageKeys.REFRESH_TOKEN);
  },

  setTokens(tokens: AuthTokens): void {
    if (tokens.accessToken) {
      this.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken) {
      this.setRefreshToken(tokens.refreshToken);
    }
  },

  // ----------------------------------------------------------------------------
  // QUẢN LÝ THÔNG TIN NGƯỜI DÙNG ĐĂNG NHẬP (USER PROFILE CACHE)
  // ----------------------------------------------------------------------------
  getUserProfile<T = UserContextDto>(): T | null {
    const raw = getItem(StorageKeys.USER_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.removeUserProfile();
      return null;
    }
  },

  setUserProfile<T = UserContextDto>(profile: T): void {
    if (!profile) return;
    try {
      setItem(StorageKeys.USER_PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('[StorageUtil] Lỗi tuần tự hóa UserProfile sang JSON:', err);
    }
  },

  removeUserProfile(): void {
    removeItem(StorageKeys.USER_PROFILE);
  },

  // ----------------------------------------------------------------------------
  // QUẢN LÝ HỒ SƠ QUYẾT TOÁN THUẾ ĐANG CHỌN (ACTIVE TAX PROFILE ID)
  // ----------------------------------------------------------------------------
  getActiveProfileId(): string | null {
    return getItem(StorageKeys.ACTIVE_PROFILE_ID);
  },

  setActiveProfileId(profileId: string): void {
    if (!profileId) return;
    setItem(StorageKeys.ACTIVE_PROFILE_ID, profileId.trim());
  },

  removeActiveProfileId(): void {
    removeItem(StorageKeys.ACTIVE_PROFILE_ID);
  },

  // ----------------------------------------------------------------------------
  // GHI NHỚ TRẠNG THÁI ĐĂNG NHẬP (REMEMBER ME)
  // ----------------------------------------------------------------------------
  isRememberLoginEnabled(): boolean {
    return getItem(StorageKeys.REMEMBER_LOGIN) === 'true';
  },

  setRememberLogin(enabled: boolean): void {
    setItem(StorageKeys.REMEMBER_LOGIN, enabled ? 'true' : 'false');
  },

  // ----------------------------------------------------------------------------
  // TIỆN ÍCH DỌN DẸP TOÀN BỘ PHIÊN LÀM VIỆC (LOGOUT / TOKEN REVOCATION)
  // ----------------------------------------------------------------------------
  clearAllAuthData(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUserProfile();
    this.removeActiveProfileId();
  },

  /**
   * Kiểm tra nhanh xem người dùng có Access Token hợp lệ trong Storage không
   */
  hasValidAuth(): boolean {
    const token = this.getAccessToken();
    return Boolean(token && token.length > 20);
  },
};

export default storageUtil;
