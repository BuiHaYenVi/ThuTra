// ==============================================================================
// Cấu hình Khách hàng Mạng HTTP Axios Tập trung (Axios API Client)
// Hệ thống: ThuTra TNCN - Tầng 1: Network Layer
// ==============================================================================

import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse, 
  type InternalAxiosRequestConfig,
  type AxiosProgressEvent
} from 'axios';
import { 
  type ApiResponse, 
  type ApiErrorResponse, 
  ApiClientError, 
  ApiErrorCode 
} from '../types/api.types';
import { storageUtil } from '../utils/storage.util';

/**
 * Địa chỉ gốc của Backend API (ưu tiên biến môi trường VITE_API_BASE_URL, mặc định localhost:5000/api)
 */
const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
export const API_BASE_URL: string = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? String(import.meta.env.VITE_API_BASE_URL)
    : DEFAULT_API_BASE_URL;

/**
 * Khởi tạo cá thể Axios chuẩn hóa toàn hệ thống
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 giây thời gian chờ tối đa
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// ==============================================================================
// 1. REQUEST INTERCEPTOR: TỰ ĐỘNG GẮN BEARER TOKEN & XỬ LÝ FORMDATA
// ==============================================================================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 1.1. Tự động lấy Access Token từ Storage và gắn vào Header
    const token = storageUtil.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 1.2. Nhận diện truyền tải tệp tin Multipart FormData
    // Khi gửi FormData, phải xóa Content-Type mặc định để trình duyệt tự tính toán boundary multipart
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(ApiClientError.fromError(error));
  }
);

// ==============================================================================
// 2. RESPONSE INTERCEPTOR: BÓC TÁCH DTO, BẮT MÃ LỖI 401 & CHUYỂN ĐỔI APICLIENTERROR
// ==============================================================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Trả về response nguyên bản chứa response.data chuẩn ApiResponse<T>
    return response;
  },
  (error: any) => {
    // 2.1. Trường hợp Máy chủ có phản hồi (HTTP Status Codes 4xx, 5xx)
    if (error && error.response) {
      const statusCode = Number(error.response.status) || 500;
      const errorPayload = error.response.data as ApiErrorResponse | undefined;

      // Xử lý biến cố 401 Unauthorized: Phiên làm việc hết hạn hoặc token không hợp lệ
      if (statusCode === 401) {
        storageUtil.clearAllAuthData();

        if (typeof window !== 'undefined') {
          // Phát sự kiện toàn cục để giao diện người dùng chuyển về màn hình Login mượt mà
          window.dispatchEvent(
            new CustomEvent('thutra:unauthorized', {
              detail: {
                message: errorPayload?.message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
                timestamp: new Date().toISOString(),
              },
            })
          );
        }
      }

      // Xử lý biến cố 403 Forbidden: Không đủ thẩm quyền RBAC
      if (statusCode === 403) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('thutra:forbidden', {
              detail: {
                message: errorPayload?.message || 'Bạn không có quyền thực hiện thao tác này.',
                timestamp: new Date().toISOString(),
              },
            })
          );
        }
      }

      // Trích xuất mã lỗi và chi tiết validation từ backend
      const message = errorPayload?.message || error.message || 'Lỗi xử lý yêu cầu từ máy chủ.';
      const errorCode = errorPayload?.errorCode || (
        statusCode === 401 ? ApiErrorCode.UNAUTHORIZED :
        statusCode === 403 ? ApiErrorCode.FORBIDDEN :
        statusCode === 404 ? ApiErrorCode.NOT_FOUND :
        statusCode === 409 ? ApiErrorCode.CONFLICT :
        statusCode === 400 ? ApiErrorCode.VALIDATION_ERROR :
        ApiErrorCode.INTERNAL_SERVER_ERROR
      );
      const errors = errorPayload?.errors;

      return Promise.reject(
        new ApiClientError(message, statusCode, errorCode, errors, error)
      );
    }

    // 2.2. Trường hợp Quá thời gian chờ (Timeout)
    if (error && (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout')))) {
      return Promise.reject(
        new ApiClientError(
          'Yêu cầu mạng bị quá thời gian chờ (Timeout 30s). Vui lòng thử lại sau.',
          0,
          ApiErrorCode.TIMEOUT_ERROR,
          undefined,
          error
        )
      );
    }

    // 2.3. Trường hợp Mất kết nối mạng / Máy chủ không phản hồi (Network Error)
    return Promise.reject(
      new ApiClientError(
        'Không thể kết nối đến máy chủ Backend ThuTra TNCN (Cổng 5000). Vui lòng kiểm tra dịch vụ máy chủ hoặc kết nối Internet.',
        0,
        ApiErrorCode.NETWORK_ERROR,
        undefined,
        error
      )
    );
  }
);

// ==============================================================================
// 3. TIỆN ÍCH GIAO TIẾP MẠNG ĐỊNH KIỂU CHẶT CHẼ (TYPED CLIENT WRAPPERS)
// ==============================================================================
export const apiClient = {
  /**
   * Gửi HTTP GET request
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.get<ApiResponse<T>>(url, config);
    return res.data;
  },

  /**
   * Gửi HTTP POST request
   */
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  /**
   * Gửi HTTP PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  /**
   * Gửi HTTP PATCH request
   */
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  /**
   * Gửi HTTP DELETE request
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return res.data;
  },

  /**
   * Tải lên tệp tin (Multipart FormData) kèm theo lắng nghe tiến độ upload
   */
  async upload<T = unknown>(
    url: string, 
    formData: FormData, 
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res = await axiosInstance.post<ApiResponse<T>>(url, formData, {
      ...config,
      onUploadProgress,
    });
    return res.data;
  },
};

export default apiClient;
