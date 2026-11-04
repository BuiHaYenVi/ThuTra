import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { mockSettlementResultData } from '../../data/mockSettlementResult';

interface AiTaxOptimizationCardProps {
  onApplyOptimization?: () => void;
}

export const AiTaxOptimizationCard: React.FC<AiTaxOptimizationCardProps> = ({
  onApplyOptimization
}) => {
  const { optimization } = mockSettlementResultData;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Phương án tối ưu nghĩa vụ thuế của bạn theo luật hiện hành
          </h3>
        </div>

        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 self-start sm:self-center shadow-2xs">
          <Sparkles className="w-3 h-3 text-indigo-200" />
          <span>Trợ lý AI Tối ưu thuế TNCN</span>
        </span>
      </div>

      {/* 2. Side-by-Side Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Initial Scenario (Before Optimization) */}
        <div className="border border-rose-200 bg-rose-50/20 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Phương án ban đầu (Chưa tối ưu)
            </span>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
              {optimization.initial.badge}
            </span>
          </div>

          <div className="text-base font-extrabold text-rose-700 tracking-tight">
            {optimization.initial.amountText}
          </div>

          <p className="text-[11px] text-slate-500 leading-tight pt-1">
            {optimization.initial.note}
          </p>
        </div>

        {/* AI Optimized Scenario */}
        <div className="border-2 border-emerald-400 bg-emerald-50/30 rounded-xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Phương án sau tối ưu AI
            </span>
            <span className="bg-[#046a4e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
              {optimization.optimized.badge}
            </span>
          </div>

          <div className="text-base font-extrabold text-[#046a4e] tracking-tight">
            {optimization.optimized.amountText}
          </div>

          <p className="text-[11px] text-slate-600 font-medium leading-tight pt-1">
            {optimization.optimized.note}
          </p>
        </div>
      </div>

      {/* 3. Conclusion & Advice Box */}
      <div className="bg-[#f0fbf7] border border-emerald-200/90 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Tổng mức chênh lệch có lợi cho bạn:
          </span>
          <span className="bg-emerald-100 text-[#046a4e] border border-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full inline-block shadow-2xs">
            {optimization.totalBenefitText}
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">
          {optimization.aiAdvice}
        </p>

        <div>
          <button
            onClick={onApplyOptimization}
            className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Áp dụng đề xuất tối ưu này vào tờ khai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
