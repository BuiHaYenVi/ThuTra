import React from 'react';
import { 
  Building2, 
  Headphones, 
  Bookmark, 
  ShieldCheck, 
  Users, 
  FileText, 
  Send 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

interface Step1HeaderProps {
  dependentCount?: number;
  onSaveDraft?: () => void;
  onHotlineClick?: () => void;
  onStepClick?: (step: number) => void;
  onLogoClick?: () => void;
}

export const Step1Header: React.FC<Step1HeaderProps> = ({
  dependentCount = 1,
  onSaveDraft,
  onHotlineClick,
  onStepClick,
  onLogoClick
}) => {
  const { user } = useAuth();
  const { activeProfile } = useTaxFiling();

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-2xs">
      {/* 1. Top Bar */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          title="Về Trang chủ Tổng quan quyết toán"
        >
          <div className="w-9 h-9 rounded-xl bg-[#046a4e] flex items-center justify-center text-white shadow-2xs shrink-0">
            <Building2 className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              ThuTra TNCN
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-[#046a4e] border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#046a4e]"></span>
              <span>Quyết toán Thuế TNCN Thông minh</span>
            </span>
            <span className="hidden md:inline-block bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-medium px-2.5 py-0.5 rounded-xl">
              Kỳ quyết toán: {activeProfile?.taxYear || 2025}
            </span>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {/* User info & MST */}
          <div className="flex flex-col text-right">
            <span className="font-extrabold text-slate-800 text-xs leading-tight">
              {user?.fullName || 'Người nộp thuế'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 justify-end mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono">MST: {user?.mst || 'Chưa cập nhật'}</span>
            </div>
          </div>

          {/* Hotline */}
          <button
            onClick={onHotlineClick}
            className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-500" />
            <span>Hotline: <strong>1900 6886</strong></span>
          </button>

          {/* Save & Exit */}
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <span>Lưu nháp &amp; Thoát</span>
          </button>
        </div>
      </div>

      {/* 2. Stepper 3 Steps */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1: ACTIVE (Viền xanh lá đậm) */}
          <div
            onClick={() => onStepClick && onStepClick(1)}
            className="rounded-2xl p-3 px-4 border-2 border-[#046a4e] bg-white shadow-xs flex items-center gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#046a4e] uppercase tracking-wider">
                  BƯỚC 1 • ĐANG THỰC HIỆN
                </span>
                <span className="bg-[#046a4e] text-white text-[9px] font-bold px-2 py-0.2 rounded-full shadow-2xs">
                  {dependentCount} NPT hợp lệ
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                Người phụ thuộc &amp; Bản thân
              </h4>
            </div>
          </div>

          {/* Step 2: Next step (Mờ) */}
          <div
            onClick={() => onStepClick && onStepClick(2)}
            className="rounded-2xl p-3 px-4 border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 flex items-center gap-3.5 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                BƯỚC 2
              </span>
              <h4 className="font-bold text-slate-700 text-xs sm:text-sm truncate mt-0.5">
                Thu nhập &amp; Chứng từ khấu trừ
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Tải chứng từ e-Chungtu
              </p>
            </div>
          </div>

          {/* Step 3: Next step (Mờ) */}
          <div
            onClick={() => onStepClick && onStepClick(3)}
            className="rounded-2xl p-3 px-4 border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 flex items-center gap-3.5 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                BƯỚC 3
              </span>
              <h4 className="font-bold text-slate-700 text-xs sm:text-sm truncate mt-0.5">
                Kiểm tra lỗi &amp; Xuất hồ sơ
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Chạy Rule Engine &amp; Ký số XML
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
