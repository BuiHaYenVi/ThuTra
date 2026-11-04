import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardFooterProps {
  onBackStep?: () => void;
  onNextStep?: () => void;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
  onBackStep,
  onNextStep
}) => {
  return (
    <footer className="bg-white border-t border-slate-200/90 py-3.5 sticky bottom-0 z-20 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Back Button */}
        <button
          onClick={onBackStep}
          className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Quay lại: Bước 1 (Người phụ thuộc)</span>
        </button>

        {/* Middle: Auto-save status */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Đã tự động lưu nháp lúc 09:45 &nbsp;•&nbsp; An toàn SSL 256-bit</span>
        </div>

        {/* Right: Next Step CTA */}
        <button
          onClick={onNextStep}
          className="w-full sm:w-auto bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Tiếp tục: Chạy kiểm tra lỗi (Rule Engine)</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
        </button>
      </div>
    </footer>
  );
};
