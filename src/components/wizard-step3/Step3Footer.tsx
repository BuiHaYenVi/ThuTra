import React from 'react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';

interface Step3FooterProps {
  onBackStep?: () => void;
  onSubmitEtax?: () => void;
}

export const Step3Footer: React.FC<Step3FooterProps> = ({
  onBackStep,
  onSubmitEtax
}) => {
  return (
    <footer className="bg-white border-t border-slate-200/90 py-3.5 sticky bottom-0 z-20 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Back to Step 2 */}
        <button
          onClick={onBackStep}
          className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Quay lại: Bước 2 (Thu nhập &amp; Chứng từ)</span>
        </button>

        {/* Middle: Security Guarantee */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo mật chuẩn ngân hàng 256-bit &nbsp;•&nbsp; Dữ liệu mã hóa cục bộ</span>
        </div>

        {/* Right: Submit eTax Button */}
        <button
          onClick={onSubmitEtax}
          className="w-full sm:w-auto bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Nộp Tờ Khai Lên eTax Ngay</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
        </button>
      </div>
    </footer>
  );
};
