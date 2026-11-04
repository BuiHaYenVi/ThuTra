import React, { useState, useId } from 'react';
import { 
  User, 
  Mail, 
  Hash, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Calculator,
  CheckCircle2,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClientError } from '../types/api.types';

export interface RegisterPageProps {
  onRegisterSuccess?: (userData: { fullName: string; email: string; taxCode?: string }) => void;
  onNavigateToLogin?: () => void;
  onOpenGuide?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onOpenGuide
}) => {
  const nameInputId = useId();
  const emailInputId = useId();
  const taxCodeInputId = useId();
  const passwordInputId = useId();
  const confirmPasswordInputId = useId();
  const agreeTermsInputId = useId();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI Interactive states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Tính toán độ an toàn mật khẩu (Password Strength Bar: Yếu / Trung bình / Mạnh)
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'Chưa nhập', color: 'text-slate-400', barColor: 'bg-slate-200' };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd) || (pwd.length >= 10 && /[A-Z]/.test(pwd))) score += 1;

    if (score === 1) {
      return { score: 1, text: 'Yếu', color: 'text-amber-500', barColor: 'bg-amber-400' };
    }
    if (score === 2) {
      return { score: 2, text: 'Trung bình', color: 'text-yellow-500', barColor: 'bg-yellow-400' };
    }
    return { score: 3, text: 'Mạnh', color: 'text-emerald-600', barColor: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const { register } = useAuth();

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Mật khẩu cần tối thiểu 8 ký tự, bao gồm cả số & chữ.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu đã tạo.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      showToast('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      if (onRegisterSuccess) {
        onRegisterSuccess({
          fullName: fullName.trim(),
          email: email.trim(),
          taxCode: taxCode.trim()
        });
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      if (clientErr.errorCode === 'DUPLICATE_RESOURCE' || clientErr.statusCode === 409) {
        setErrorMessage('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
      } else {
        setErrorMessage(clientErr.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng ký nhanh với tài khoản Google
  const handleGoogleSignUp = async () => {
    // Tự sinh tài khoản demo ngẫu nhiên
    const demoTimestamp = Date.now();
    const demoEmail = `taxpayer_${demoTimestamp}@thutra.vn`;
    setIsLoading(true);
    try {
      await register({
        fullName: 'Người nộp thuế Demo',
        email: demoEmail,
        password: 'Password@123',
      });
      showToast('Đã tạo phiên làm việc thành công!');
      if (onRegisterSuccess) {
        onRegisterSuccess({
          fullName: 'Người nộp thuế Demo',
          email: demoEmail,
          taxCode: '8492019482',
        });
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setErrorMessage(clientErr.message || 'Lỗi khi kích hoạt tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg animate-bounce">
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

        {/* Bên phải: Hướng dẫn eTax + Link Đăng nhập */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              setShowGuideModal(true);
              if (onOpenGuide) onOpenGuide();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-slate-100"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Hướng dẫn eTax</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Đăng nhập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER: Canh giữa toàn màn hình trang nhã           */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center py-10 px-4 bg-slate-50">
        {/* B. KHUNG ĐĂNG KÝ CHÍNH (Centered Register Card) */}
        <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Top Badge: Thẻ Badge tiêu chuẩn bg-emerald-50 text-emerald-700 border border-emerald-200 */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3.5 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tiện ích rà soát độc lập • Chuẩn biểu mẫu 2024</span>
            </div>
          </div>

          {/* Tiêu đề & Phụ đề */}
          <h1 className="text-2xl font-bold text-slate-900 text-left tracking-tight">
            Tạo tài khoản ThuTra
          </h1>
          <p className="text-xs text-slate-500 text-left mt-1 mb-6 leading-relaxed">
            Bắt đầu rà soát và tối ưu nghĩa vụ quyết toán thuế TNCN của bạn
          </p>

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Trường 1: Họ và tên */}
            <div>
              <label 
                htmlFor={nameInputId} 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id={nameInputId}
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ví dụ: Nguyễn Hoàng Nam"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Trường 2: Email làm việc hoặc cá nhân */}
            <div>
              <label 
                htmlFor={emailInputId} 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email làm việc hoặc cá nhân <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id={emailInputId}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Trường 3: Mã số thuế cá nhân (MST) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor={taxCodeInputId} 
                  className="block text-xs font-semibold text-slate-700"
                >
                  Mã số thuế cá nhân (MST)
                </label>
                <span className="text-xs text-slate-400">
                  Không bắt buộc lúc đăng ký
                </span>
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id={taxCodeInputId}
                  type="text"
                  maxLength={14}
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value.replace(/[^0-9-]/g, ''))}
                  placeholder="10 số ghi trên chứng từ thuế"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800 font-mono"
                />
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Dùng để tự động gán vào tờ khai nháp 02/QTT (chuẩn hóa MST theo số CCCD 12 số trên Cổng Dịch vụ công / Cổng Thuế).</span>
              </p>
            </div>

            {/* Trường 4: Mật khẩu đăng nhập */}
            <div>
              <label 
                htmlFor={passwordInputId} 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Mật khẩu đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id={passwordInputId}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Tối thiểu 8 ký tự, gồm số & chữ"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 flex-1 max-w-[200px] mr-3">
                  <span className="text-slate-500 text-[11px] whitespace-nowrap">Độ an toàn:</span>
                  <div className="flex items-center gap-1 w-full">
                    <div className={`h-1.5 rounded-full flex-1 transition-all ${strength.score >= 1 ? strength.barColor : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full flex-1 transition-all ${strength.score >= 2 ? strength.barColor : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full flex-1 transition-all ${strength.score >= 3 ? strength.barColor : 'bg-slate-200'}`} />
                  </div>
                </div>
                <span className={`text-[11px] font-medium ${strength.color}`}>
                  {strength.text}
                </span>
              </div>
            </div>

            {/* Trường 5: Xác nhận mật khẩu */}
            <div>
              <label 
                htmlFor={confirmPasswordInputId} 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <input
                  id={confirmPasswordInputId}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Nhập lại mật khẩu vừa tạo"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Điều khoản dịch vụ checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id={agreeTermsInputId}
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <span className="text-xs text-slate-600 leading-tight">
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-emerald-700 font-medium hover:underline cursor-pointer"
                  >
                    Điều khoản dịch vụ
                  </button>{' '}
                  và{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-emerald-700 font-medium hover:underline cursor-pointer"
                  >
                    Chính sách bảo mật
                  </button>{' '}
                  của ThuTra.
                </span>
              </label>
            </div>

            {/* Hộp Cam kết Bảo mật (Privacy Box) */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ThuTra cam kết dữ liệu thu nhập và chứng từ của bạn chỉ được lưu trữ và xử lý phục vụ tính toán cá nhân, không chia sẻ cho bất kỳ bên thứ ba nào.
              </p>
            </div>

            {/* CTA Button: bg-emerald-600 hover:bg-emerald-700 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer text-xs sm:text-sm group disabled:opacity-75 disabled:cursor-wait mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang khởi tạo không gian làm việc...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký tài khoản & Bắt đầu</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider: Hoặc tiếp tục với */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-slate-400 font-normal select-none">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Đăng ký nhanh với Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-700 transition duration-150 shadow-2xs cursor-pointer active:scale-[0.99] disabled:opacity-60"
          >
            {/* Google Multi-Color SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Đăng ký nhanh với tài khoản Google</span>
          </button>

          {/* Chuyển hướng Đăng nhập */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Đã có tài khoản ThuTra?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>

        {/* C. THẺ THÔNG TIN MÃ HÓA CỤC BỘ (Local Encryption Pill) */}
        <div className="w-full max-w-[500px] mt-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-[11.5px] text-slate-600">Dữ liệu được mã hóa cục bộ khi đối soát hóa đơn</span>
          </div>
          <span className="bg-slate-100 text-slate-700 font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded border border-slate-200 select-none">
            SHA-256
          </span>
        </div>
      </main>

      {/* ========================================================= */}
      {/* D. FOOTER TRANG & TUYÊN BỐ PHÁP LÝ ĐỘC LẬP               */}
      {/* ========================================================= */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-4 flex flex-col items-center justify-center text-center">
        {/* Dòng lưu ý pháp lý */}
        <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed mb-2">
          Lưu ý: ThuTra là công cụ hỗ trợ tính toán và kiểm tra lỗi độc lập. Dữ liệu thuế do người dùng tự nhập và tự chịu trách nhiệm khi nộp lên cơ quan thuế.
        </p>

        {/* Dòng bản quyền & Liên kết */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-500">
          <span>© 2024 ThuTra TNCN. Bản quyền đã được bảo lưu.</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center gap-3 text-slate-600">
            <button 
              type="button" 
              onClick={() => showToast('Chính sách bảo mật: Toàn bộ dữ liệu được lưu trữ an toàn.')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Chính sách bảo mật
            </button>
            <span className="text-slate-300">•</span>
            <button 
              type="button" 
              onClick={() => showToast('Điều khoản dịch vụ: ThuTra cam kết bảo vệ quyền riêng tư người dùng.')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Điều khoản dịch vụ
            </button>
            <span className="text-slate-300">•</span>
            <button 
              type="button" 
              onClick={() => showToast('Hotline hỗ trợ kỹ thuật: 1900 6868 hoặc email support@thutra.vn')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Hỗ trợ kỹ thuật
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL: Hướng dẫn eTax */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3 text-emerald-700">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Hướng dẫn Đăng ký & Kê khai eTax</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-1">1. Đăng ký tài khoản ThuTra</p>
                <p>Nhập họ tên và email. Mã số thuế (MST) không bắt buộc lúc đăng ký và có thể cập nhật sau khi tải lên chứng từ khấu trừ thuế TNCN.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-1">2. Mã hóa dữ liệu SHA-256</p>
                <p>Chứng từ điện tử XML được phân tích trực tiếp tại trình duyệt mà không yêu cầu lưu trữ mật khẩu eTax cấp cao.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Điều khoản dịch vụ & Chính sách bảo mật */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3 text-emerald-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Điều khoản & Bảo mật ThuTra</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                ThuTra cung cấp giải pháp hỗ trợ tính toán thuế độc lập, đối soát chứng từ khấu trừ thuế điện tử và kết xuất hồ sơ theo định dạng chuẩn XML của Tổng cục Thuế.
              </p>
              <ul className="list-disc list-inside space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <li>Bảo mật tuyệt đối thông tin thu nhập cá nhân.</li>
                <li>Không bán hoặc cung cấp dữ liệu cho bất kỳ đơn vị quảng cáo nào.</li>
                <li>Hỗ trợ người dùng xuất tờ khai nháp 02/QTT hợp lệ.</li>
              </ul>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Đồng ý & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
