import React from 'react';
import { 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Bookmark, 
  Headphones, 
  Check 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

interface Step3HeaderProps {
  onSaveDraft?: () => void;
  onHotlineClick?: () => void;
  onStepClick?: (step: number) => void;
  onLogoClick?: () => void;
}

export const Step3Header: React.FC<Step3HeaderProps> = ({
  onSaveDraft,
  onHotlineClick,
  onStepClick,
  onLogoClick
}) => {
  const { user } = useAuth();
  const { activeProfile } = useTaxFiling();

  const userInitials = React.useMemo(() => {
    if (!user?.fullName) return 'TN';
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-2xs">
      {/* 1. Top Bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          title="Về Trang chủ Tổng quan quyết toán"
        >
          <div className="w-9 h-9 rounded-xl bg-[#046a4e] flex items-center justify-center text-white shadow-2xs shrink-0">
            <FileText className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">ThuTra TNCN</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Chuẩn Thông tư 80/2021/TT-BTC &amp; eTax Mobile
              </span>
            </div>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-600">
          {/* Tax Period */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700 text-[11px]">
              Kỳ tính thuế: <strong className="font-bold">Năm {activeProfile?.taxYear || 2025}</strong>
            </span>
          </div>

          {/* User MST */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#046a4e]" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-[11px] text-slate-800 leading-tight">
                MST: {user?.mst || 'Chưa cập nhật'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                ({user?.fullName || 'Người nộp thuế'})
              </span>
            </div>
          </div>

          {/* Save & Exit Button */}
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <span>Lưu nháp &amp; Thoát</span>
          </button>

          {/* Hotline */}
          <button
            onClick={onHotlineClick}
            className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-[#046a4e] transition-colors cursor-pointer text-xs"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span>Hotline Pháp lý</span>
          </button>

          {/* Avatar with name */}
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-slate-300">
              {userInitials}
            </div>
            <span className="hidden sm:inline font-semibold text-xs text-slate-800">
              {user?.fullName || 'Người nộp thuế'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stepper 3 Steps */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Step 1: Completed */}
            <div
              onClick={() => onStepClick && onStepClick(1)}
              className="rounded-xl p-2.5 px-3 border border-slate-200/80 bg-slate-50/60 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    BƯỚC 1
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.2 rounded-full">
                    1 NPT hợp lệ
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">
                  Người phụ thuộc &amp; Bản thân
                </h4>
              </div>
            </div>

            {/* Step 2: Completed */}
            <div
              onClick={() => onStepClick && onStepClick(2)}
              className="rounded-xl p-2.5 px-3 border border-slate-200/80 bg-slate-50/60 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    BƯỚC 2
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.2 rounded-full">
                    2 chứng từ đã đối soát
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">
                  Thu nhập &amp; Chứng từ khấu trừ
                </h4>
              </div>
            </div>

            {/* Step 3: ACTIVE (Viền xanh lá đậm) */}
            <div
              onClick={() => onStepClick && onStepClick(3)}
              className="rounded-xl p-2.5 px-3 border-2 border-[#046a4e] bg-white shadow-xs flex items-center gap-3 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#046a4e] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#046a4e] uppercase tracking-wider">
                    BƯỚC 3 (HIỆN TẠI)
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    15 Rules Scanner - Hoàn thuế
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs truncate">
                  Kiểm tra lỗi &amp; Xuất hồ sơ
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
