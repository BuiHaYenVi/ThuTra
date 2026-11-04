import React from 'react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';

interface Step1FooterProps {
  onBackDashboard?: () => void;
  onProceedToStep2?: () => void;
}

export const Step1Footer: React.FC<Step1FooterProps> = ({
  onBackDashboard,
  onProceedToStep2
}) => {
  return (
    <footer className="bg-white border-t border-slate-200/90 py-3.5 sticky bottom-0 z-20 shadow-sm">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Hủy & Quay lại Dashboard */}
        <button
          onClick={onBackDashboard}
          className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Hủy &amp; Quay lại Dashboard</span>
        </button>

        {/* Middle: Security Guarantee */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tự động lưu thay đổi &nbsp;•&nbsp; Bảo mật mã hóa thông tin theo chuẩn an toàn tài chính</span>
        </div>

        {/* Right: Proceed to Step 2 */}
        <button
          onClick={onProceedToStep2}
          className="w-full sm:w-auto bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Lưu &amp; Tiếp tục: Bước 2 (Thu nhập &amp; Chứng từ)</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
        </button>
      </div>
    </footer>
  );
};
