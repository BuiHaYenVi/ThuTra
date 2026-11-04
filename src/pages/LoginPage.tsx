import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Calculator,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClientError } from '../types/api.types';
import { storageUtil } from '../utils/storage.util';

export interface LoginPageProps {
  onLoginSuccess?: (role?: string) => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: () => void;
  onOpenGuide?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onForgotPassword,
  onOpenGuide
}) => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI interactive states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const { login } = useAuth();

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Tên đăng nhập');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập Mật khẩu của bạn');
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
      showToast('Đăng nhập thành công! Đang chuyển hướng...');
      const role = storageUtil.getUserProfile()?.role;
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      if (clientErr.errorCode === 'INVALID_CREDENTIALS') {
        setErrorMessage('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      } else {
        setErrorMessage(clientErr.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại kết nối mạng.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Autofill tài khoản mẫu demo nhanh
  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  // Google sign in handler
  const handleGoogleSignIn = async () => {
    // Tự động liên kết qua tài khoản demo
    handleQuickLogin('superadmin@thutra.vn', 'Admin@123456');
    showToast('Đã nạp tài khoản Quản trị viên Super Admin!');
  };

  // Forgot password submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
      setForgotEmail('');
      showToast('Đã gửi liên kết khôi phục mật khẩu vào email của bạn!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans text-slate-800">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg transition-all animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* A. TOP HEADER BAR                                         */}
      {/* ========================================================= */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        {/* Bên trái: Logo + Tên + Badge SaaS */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Calculator className="w-5 h-5 text-emerald-50" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 text-[17px] tracking-tight">
              ThuTra TNCN
            </span>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200 select-none">
              SaaS v2.4
            </span>
          </div>
        </div>

        {/* Bên phải: Nút Hướng dẫn + Vách ngăn + Badge Phiên bản độc lập */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <button
            type="button"
            onClick={() => {
              setShowGuideModal(true);
              if (onOpenGuide) onOpenGuide();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-slate-100"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Hướng dẫn</span>
          </button>

          {/* Vách ngăn dọc mỏng */}
          <div className="h-4 w-px bg-slate-200" />

          {/* Badge viền mỏng: Phiên bản độc lập */}
          <button
            type="button"
            onClick={() => setShowDisclaimerModal(true)}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-1 shadow-2xs transition-colors cursor-pointer"
          >
            Phiên bản độc lập
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center py-10 px-4 bg-slate-50">
        {/* B. THẺ THÔNG TIN NỔI PHÍA TRÊN FORM (Top Status Pill) */}
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-2xs mb-4 text-xs text-slate-600 font-normal">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse shrink-0" />
          <span className="text-[11.5px] sm:text-xs">
            Công cụ Hỗ trợ Độc lập v2.4 <span className="text-slate-300 mx-1">•</span> Không cần chữ ký số HSM
          </span>
        </div>

        {/* C. KHUNG ĐĂNG NHẬP CHÍNH (Centered Login Card) */}
        <div className="w-full max-w-[450px] bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Icon nhận diện thương hiệu nhỏ đồ họa đường ziczac / mầm cây */}
          <div className="w-10 h-10 rounded-xl bg-[#e7f5f0] border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-[#046a4e]">
            <svg 
              className="w-5 h-5 text-emerald-700" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>

          {/* Tiêu đề chính */}
          <h1 className="text-2xl font-bold text-slate-900 text-center tracking-tight">
            Đăng nhập ThuTra
          </h1>

          {/* Phụ đề */}
          <p className="text-xs text-slate-500 text-center mt-1.5 mb-6 max-w-xs mx-auto leading-relaxed">
            Lưu trữ hồ sơ tính toán và tra cứu lỗi quyết toán thuế TNCN của bạn
          </p>

          {/* Nút đăng nhập nhanh Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50/90 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-700 transition duration-150 shadow-2xs cursor-pointer active:scale-[0.99] disabled:opacity-60"
          >
            {/* Google Multi-Color SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Đăng nhập nhanh với Google</span>
          </button>

          {/* Đường phân cách (Divider) */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/90" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-slate-400 font-normal select-none">
                Hoặc đăng nhập bằng Email / Tên tài khoản
              </span>
            </div>
          </div>

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Trường 1: Email hoặc Tên tài khoản */}
            <div>
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="vidu@gmail.com hoặc username"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Trường 2: Mật khẩu */}
            <div>
              <label 
                htmlFor="login-password" 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Dòng tùy chọn phụ bên dưới input: Checkbox + Quên mật khẩu */}
            <div className="flex items-center justify-between pt-0.5 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <span className="text-xs text-slate-600">
                  Ghi nhớ đăng nhập trên thiết bị này
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  if (onForgotPassword) onForgotPassword();
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Nút bấm Hành động Chính (CTA Button) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer text-xs sm:text-sm group disabled:opacity-75 disabled:cursor-wait"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                    />
                  </svg>
                  <span>Đang kết nối không gian làm việc...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập vào không gian làm việc</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Tài khoản thử nghiệm 1-click:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@thutra.vn', 'Admin@123456')}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-700 hover:text-emerald-800 font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>🛡️</span>
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@thutra.vn', 'Admin@123456')}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-700 hover:text-emerald-800 font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚙️</span>
                <span>Admin Manager</span>
              </button>
            </div>
          </div>

          {/* Chuyển hướng Đăng ký */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToRegister) {
                  onNavigateToRegister();
                } else {
                  showToast('Chuyển hướng đến màn hình Đăng ký dùng thử miễn phí!');
                }
              }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
            >
              Đăng ký dùng thử miễn phí
            </button>
          </div>
        </div>

        {/* D. HỘP TUYÊN BỐ TÍNH ĐỘC LẬP PHÁP LÝ (Legal Disclaimer Box) */}
        <div className="w-full max-w-[450px] mt-4 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xs font-semibold text-emerald-950 mb-0.5">
              Tuyên bố tính độc lập của dịch vụ
            </h2>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Lưu ý: ThuTra là công cụ hỗ trợ tính toán và kiểm tra lỗi độc lập. Dữ liệu thuế do người dùng tự nhập và tự chịu trách nhiệm khi nộp lên cơ quan thuế. ThuTra không phải là cơ quan nhà nước hay cổng dịch vụ công.
            </p>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* E. FOOTER TRANG                                           */}
      {/* ========================================================= */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        {/* Bên trái: Bản quyền & giới thiệu ngắn */}
        <div className="text-slate-500 text-center sm:text-left">
          © 2024 ThuTra TNCN. Hệ thống tối ưu & rà soát hồ sơ thuế cá nhân.
        </div>

        {/* Bên phải: Danh sách links ngang phân tách bằng dấu chấm */}
        <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
          <button 
            type="button" 
            onClick={() => showToast('Chính sách bảo mật: Dữ liệu được mã hoá và bảo vệ tuyệt đối.')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Chính sách bảo mật
          </button>
          <span className="text-slate-300">•</span>
          <button 
            type="button" 
            onClick={() => showToast('Điều khoản dịch vụ: ThuTra cung cấp giải pháp hỗ trợ thuế độc lập.')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Điều khoản dịch vụ
          </button>
          <span className="text-slate-300">•</span>
          <button 
            type="button" 
            onClick={() => showToast('Hỗ trợ kỹ thuật: support@thutra.vn')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Hỗ trợ kỹ thuật
          </button>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* MODAL: Hướng dẫn nhanh                                    */}
      {/* ========================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3 text-[#046a4e]">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Hướng dẫn sử dụng ThuTra TNCN</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-1">1. Đăng nhập hoặc Dùng thử</p>
                <p>Nhập email / tên đăng nhập và mật khẩu hoặc nhấn nút <strong>Đăng nhập vào không gian làm việc</strong> để vào giao diện quản trị.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-1">2. Rà soát & Bổ sung chứng từ</p>
                <p>Tự động phân loại chứng từ khấu trừ thuế điện tử XML và tính mức giảm trừ gia cảnh 2024 - 2026.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-1">3. Kiểm tra lỗi & Xuất XML nộp eTax</p>
                <p>Kiểm tra chéo quy tắc nghiệp vụ theo Thông tư 111 & Nghị định 126 trước khi nộp lên cổng thuế.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="bg-[#046a4e] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#03543e] cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Tuyên bố độc lập                                    */}
      {/* ========================================================= */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowDisclaimerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3 text-[#046a4e]">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Tính độc lập của ThuTra TNCN</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              ThuTra là giải pháp SaaS độc lập được phát triển nhằm mục đích hỗ trợ cá nhân tự quyết toán thuế TNCN, kiểm tra sai sót trong chứng từ khấu trừ điện tử và tối ưu quyền lợi hoàn thuế hợp pháp.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
              <li>Không yêu cầu mã PIN chữ ký số HSM hoặc mật khẩu cấp cao eTax.</li>
              <li>Mã nguồn xử lý dữ liệu hoàn toàn tuân thủ chuẩn XML TCT của Tổng cục Thuế.</li>
              <li>Người nộp thuế chịu trách nhiệm tính chính xác đối với số liệu kê khai.</li>
            </ul>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDisclaimerModal(false)}
                className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Quên mật khẩu                                      */}
      {/* ========================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Khôi phục mật khẩu</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu trong ít phút.
            </p>
            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Yêu cầu đã được gửi thành công! Đang đóng...</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Nhập email của bạn (vd: abc@gmail.com)"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#046a4e] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#03543e] cursor-pointer transition-colors"
                >
                  Gửi liên kết khôi phục
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
