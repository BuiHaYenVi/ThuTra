import React from 'react';
import { formatVnd } from '../../data/mockWizardStep1';

interface DeductionSummarySidebarProps {
  personalDeduction?: number;
  dependentDeduction?: number;
  dependentCount?: number;
}

export const DeductionSummarySidebar: React.FC<DeductionSummarySidebarProps> = ({
  personalDeduction = 132000000,
  dependentDeduction = 52800000,
  dependentCount = 1
}) => {
  const totalDeduction = personalDeduction + dependentDeduction;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
          Tóm tắt Mức Giảm trừ Dự kiến
        </h3>
        <span className="bg-emerald-50 text-[#046a4e] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
          Bước 1 • Tạm tính
        </span>
      </div>

      {/* 2. Calculation Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>Giảm trừ bản thân (12 tháng):</span>
          <span className="font-bold text-slate-900 font-mono">
            {formatVnd(personalDeduction)}
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-slate-600">
            <span>Giảm trừ NPT ({dependentCount} người):</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatVnd(dependentDeduction)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {dependentCount} người x 12 tháng x 4.400.000
          </div>
        </div>
      </div>

      {/* 3. Total Deduction Box */}
      <div className="border-t border-slate-100 pt-3 space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          TỔNG CỘNG GIẢM TRỪ GIA CẢNH
        </span>
        <div className="text-3xl font-black text-[#046a4e] tracking-tight">
          {formatVnd(totalDeduction)}
        </div>
      </div>

      {/* 4. Financial Context Explanation */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
        Khoản tiền này sẽ được trừ trực tiếp vào <strong className="text-slate-900 font-bold">Tổng thu nhập chịu thuế tại Bước 2</strong> để xác định Thu nhập tính thuế theo biểu thuế lũy tiến.
      </div>
    </div>
  );
};
