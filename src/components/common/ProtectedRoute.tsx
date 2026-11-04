// ==============================================================================
// Thành phần Bảo vệ Tuyến đường & Phân quyền RBAC (Protected Route Guard)
// Hệ thống: ThuTra TNCN - Tầng 3: State Management Layer
// ==============================================================================

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/api.types';
import { ShieldAlert, Lock, Loader2, ArrowRight, Home } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onRedirectToLogin?: () => void;
  onRedirectToHome?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onRedirectToLogin,
  onRedirectToHome,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. Màn hình chờ khi đang nạp token và kiểm tra phiên làm việc (Loading State)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm max-w-md w-full flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-[#046a4e]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-1">Hệ thống ThuTra TNCN</h2>
          <p className="text-xs text-slate-500 mb-4">Đang xác thực phiên làm việc và kiểm tra phân quyền bảo mật...</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#046a4e] h-full w-2/3 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Màn hình yêu cầu đăng nhập khi chưa xác thực (401 Unauthorized)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm max-w-md w-full flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-1">Yêu cầu Đăng nhập</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Phiên làm việc của bạn chưa được khởi tạo hoặc đã hết hạn an toàn. Vui lòng đăng nhập lại để tiếp tục quản lý hồ sơ thuế.
          </p>
          <button
            type="button"
            onClick={onRedirectToLogin}
            className="w-full py-2.5 px-4 bg-[#046a4e] hover:bg-[#03533d] text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Màn hình chặn truy cập khi không đủ quyền hạn RBAC (403 Forbidden)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-sm max-w-lg w-full flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 mb-2">
            Lỗi 403 - Quyền Truy Cập Bị Từ Chối
          </span>
          <h2 className="text-base font-bold text-slate-800 mb-2">
            Không đủ thẩm quyền truy cập phân hệ này
          </h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Tài khoản của bạn hiện có vai trò: <strong className="text-slate-900 uppercase font-bold">[{user.role}]</strong>. Khu vực này được bảo vệ nghiêm ngặt và chỉ dành riêng cho các vai trò: <span className="font-semibold text-emerald-800">{allowedRoles.join(', ')}</span>.
          </p>
          <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 mb-6 text-left">
            🛡️ Cơ chế kiểm soát phân cấp 3 tầng (RBAC) & Row-Level Security (RLS) đang kích hoạt để bảo vệ tính toàn vẹn của dữ liệu thuế.
          </div>
          <button
            type="button"
            onClick={onRedirectToHome}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Quay về Bảng điều khiển người dùng</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Cho phép hiển thị nội dung được bảo vệ khi đã vượt qua kiểm tra bảo mật
  return <>{children}</>;
};

export default ProtectedRoute;
