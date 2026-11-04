// ==============================================================================
// Context & Provider Quản lý Xác thực & Phiên làm việc (AuthContext)
// Hệ thống: ThuTra TNCN - Tầng 3: State Management Layer
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../services/auth.api';
import { storageUtil } from '../utils/storage.util';
import { ApiClientError } from '../types/api.types';
import type {
  UserProfileDto,
  LoginRequestDto,
  RegisterRequestDto,
  UpdateUserProfileDto,
} from '../types/business.types';

export interface AuthContextType {
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequestDto) => Promise<void>;
  register: (payload: RegisterRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (payload: UpdateUserProfileDto) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDto | null>(() => storageUtil.getUserProfile());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageUtil.hasValidAuth());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Khởi tạo và khôi phục phiên làm việc (Bootstrap Effect)
   */
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      // Nếu không có token hợp lệ trong Storage, lập tức kết thúc quá trình khởi tạo
      if (!storageUtil.hasValidAuth()) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (isMounted) {
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            storageUtil.setUserProfile(response.data);
          } else {
            storageUtil.clearAllAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (_err: unknown) {
        if (isMounted) {
          // Token không còn hợp lệ trên máy chủ, dọn sạch Storage
          storageUtil.clearAllAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapAuth();

    /**
     * Lắng nghe sự kiện toàn cục 'thutra:unauthorized' từ Axios Response Interceptor (mã 401)
     */
    const handleUnauthorizedEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      storageUtil.clearAllAuthData();
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        setError(customEvent.detail?.message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      }
    };

    window.addEventListener('thutra:unauthorized', handleUnauthorizedEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('thutra:unauthorized', handleUnauthorizedEvent);
    };
  }, []);

  /**
   * Đăng nhập tài khoản và cập nhật phiên làm việc
   */
  const login = useCallback(async (credentials: LoginRequestDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginRes = await authApi.login(credentials);
      if (loginRes.success && loginRes.data) {
        storageUtil.setAccessToken(loginRes.data.accessToken);
        if (loginRes.data.refreshToken) {
          storageUtil.setRefreshToken(loginRes.data.refreshToken);
        }

        // Tải đầy đủ thông tin chi tiết người dùng
        const profileRes = await authApi.getCurrentUser();
        const fullProfile = profileRes.data;

        setUser(fullProfile);
        setIsAuthenticated(true);
        storageUtil.setUserProfile(fullProfile);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setError(clientErr.message);
      throw clientErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đăng ký tài khoản người nộp thuế mới
   */
  const register = useCallback(async (payload: RegisterRequestDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const registerRes = await authApi.register(payload);
      if (registerRes.success && registerRes.data) {
        storageUtil.setAccessToken(registerRes.data.accessToken);
        if (registerRes.data.refreshToken) {
          storageUtil.setRefreshToken(registerRes.data.refreshToken);
        }

        // Lấy thông tin hồ sơ đầy đủ
        const profileRes = await authApi.getCurrentUser();
        const fullProfile = profileRes.data;

        setUser(fullProfile);
        setIsAuthenticated(true);
        storageUtil.setUserProfile(fullProfile);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setError(clientErr.message);
      throw clientErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đăng xuất người dùng và dọn dẹp sạch toàn bộ phiên
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout().catch(() => {
        // Nuốt lỗi mạng phía máy chủ khi đăng xuất để luôn bảo đảm xóa sạch Client
      });
    } finally {
      storageUtil.clearAllAuthData();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Tải lại thông tin cá nhân mới nhất từ máy chủ
   */
  const refreshProfile = useCallback(async () => {
    if (!storageUtil.hasValidAuth()) return;
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
        storageUtil.setUserProfile(res.data);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      if (clientErr.isAuthError) {
        storageUtil.clearAllAuthData();
        setUser(null);
        setIsAuthenticated(false);
      }
      throw clientErr;
    }
  }, []);

  /**
   * Cập nhật thông tin hồ sơ cá nhân
   */
  const updateUserProfile = useCallback(async (payload: UpdateUserProfileDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.updateProfile(payload);
      if (res.success && res.data) {
        setUser(res.data);
        storageUtil.setUserProfile(res.data);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setError(clientErr.message);
      throw clientErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Xóa thông báo lỗi hiện hành
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    updateUserProfile,
    clearError,
  }), [
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    updateUserProfile,
    clearError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook truy xuất trạng thái xác thực và phiên làm việc
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() phải được sử dụng bên trong một <AuthProvider>');
  }
  return context;
}

export default AuthContext;
