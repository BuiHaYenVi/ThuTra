import React from 'react';
import { 
  TrendingUp, 
  Landmark, 
  ShieldCheck, 
  Receipt, 
  CreditCard, 
  Coins, 
  ArrowRight, 
  Calculator 
} from 'lucide-react';
import { mockForecastSummary, formatMoneyVND } from '../../data/mockForecastData';

interface TaxForecastBannerProps {
  onStartSettlement?: () => void;
  onViewFormula?: () => void;
  onOpenEtaxPortal?: () => void;
}

export const TaxForecastBanner: React.FC<TaxForecastBannerProps> = ({
  onStartSettlement,
  onViewFormula,
  onOpenEtaxPortal
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
      {/* 1. Header: Title, Tags & Progress */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#046a4e] shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight">
                Dự báo nghĩa vụ thuế TNCN năm {mockForecastSummary.taxYear}
              </h1>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {mockForecastSummary.taxPeriod}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                {mockForecastSummary.verificationBadge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">
              {mockForecastSummary.syncNote}
            </p>
          </div>
        </div>

        {/* Progress Bar (Tháng 10/12) */}
        <div className="flex flex-col items-end gap-1.5 self-start lg:self-center">
          <span className="text-[11px] font-semibold text-slate-600">
            Tiến độ năm tính thuế: Tháng {mockForecastSummary.progressMonth}/12 ({mockForecastSummary.progressPercent}%)
          </span>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#046a4e] rounded-full transition-all duration-500"
              style={{ width: `${mockForecastSummary.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Body: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-4">
        {/* Left Column: Result Card (Mint / Emerald soft background) */}
        <div className="lg:col-span-6 bg-[#f0fbf7] border border-emerald-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-[#046a4e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                KẾT QUẢ ƯỚC TÍNH TỰ ĐỘNG
              </span>
              <div className="w-9 h-9 rounded-full bg-[#046a4e] text-white flex items-center justify-center shadow-xs">
                <Landmark className="w-4 h-4 text-emerald-100" />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                DỰ KIẾN ĐƯỢC NHÀ NƯỚC HOÀN LẠI:
              </span>
              <div className="text-3xl font-extrabold text-[#046a4e] tracking-tight">
                {formatMoneyVND(mockForecastSummary.estimatedRefund, true)}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{mockForecastSummary.refundEligibilityNote}</span>
            </div>
            <span className="text-slate-400 font-normal">
              {mockForecastSummary.lastUpdated}
            </span>
          </div>
        </div>

        {/* Right Column: Breakdown Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                TỔNG HỢP QUYẾT TOÁN KỲ
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                ★ {mockForecastSummary.sourcesCount} nguồn thu nhập hợp lệ
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Line 1: Tax withheld */}
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tổng thuế đã tạm khấu trừ:</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">
                  {formatMoneyVND(mockForecastSummary.totalTaxWithheld)}
                </span>
              </div>

              {/* Line 2: Total income */}
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tổng thu nhập ghi nhận:</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">
                  {formatMoneyVND(mockForecastSummary.totalIncomeRecorded)}
                </span>
              </div>

              {/* Line 3: Real tax payable */}
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thuế TNCN thực tế phải nộp:</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">
                  {formatMoneyVND(mockForecastSummary.realTaxPayable)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
            {mockForecastSummary.personalDeductionNote}
          </div>
        </div>
      </div>

      {/* 3. Footer Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onStartSettlement}
            className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>&lt; Bắt đầu quyết toán 3 bước ngay</span>
          </button>

          <button
            onClick={onViewFormula}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem chi tiết công thức tính</span>
          </button>
        </div>

        <button
          onClick={onOpenEtaxPortal}
          className="text-xs font-semibold text-[#046a4e] hover:text-[#03543e] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-center"
        >
          <span>Nộp eTax Mobile trực tiếp qua Cổng Thuế</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
