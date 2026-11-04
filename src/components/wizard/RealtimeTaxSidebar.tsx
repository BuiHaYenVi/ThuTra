import React from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { initialWizardStep2Data, formatCurrency } from '../../data/mockWizardStep2';
import type { RealtimeEstimateData } from '../../data/mockWizardStep2';

interface RealtimeTaxSidebarProps {
  data?: RealtimeEstimateData;
  onViewTaxFormula?: () => void;
}

export const RealtimeTaxSidebar: React.FC<RealtimeTaxSidebarProps> = ({
  data = initialWizardStep2Data.realtimeEstimate,
  onViewTaxFormula
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Main Calculation Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#046a4e]" />
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
              Ước tính sau bước 2
            </h3>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Real-time</span>
          </span>
        </div>

        {/* Highlight Result Card */}
        <div 
          onClick={onViewTaxFormula}
          className="bg-[#f0fbf7] border border-emerald-200/90 rounded-2xl p-4 text-center shadow-2xs space-y-1.5 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            DỰ KIẾN TRẠNG THÁI QUYẾT TOÁN
          </span>
          <div className="text-3xl font-extrabold text-[#046a4e] tracking-tight">
            +{formatCurrency(data.estimatedRefund)} VNĐ
          </div>
          <span className="bg-[#046a4e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs mt-1">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{data.refundStatusText}</span>
          </span>
        </div>

        {/* Breakdown Items List */}
        <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-slate-600">
            <span>Tổng thu nhập tính đến hiện tại:</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatCurrency(data.totalIncomeToDate)} VNĐ
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Tổng thuế TNCN đã tạm nộp:</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatCurrency(data.totalTaxWithheldToDate)} VNĐ
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Giảm trừ bản thân (11tr x 12th):</span>
            <span className="font-bold text-slate-900 font-mono">
              - {formatCurrency(data.personalDeduction)} VNĐ
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Giảm trừ 1 người phụ thuộc:</span>
            <span className="font-bold text-slate-900 font-mono">
              - {formatCurrency(data.dependentsDeduction)} VNĐ
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>BHXH bắt buộc đã trừ:</span>
            <span className="font-bold text-slate-900 font-mono">
              - {formatCurrency(data.insuranceDeduction)} VNĐ
            </span>
          </div>
        </div>

        {/* Law Note Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-600">
          <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
            @
          </div>
          <p>{data.lawNote}</p>
        </div>
      </div>

      {/* 2. Preparation for Step 3 Box */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Chuẩn bị cho Bước 3</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Kiểm tra lỗi trùng lặp mã chứng từ điện tử</span>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>So khớp tờ khai 02/QTT với cơ sở dữ liệu Tổng Cục Thuế</span>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Sinh mã hồ sơ hoàn thuế qua eTax Mobile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
