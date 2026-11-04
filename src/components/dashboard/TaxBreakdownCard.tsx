import { TrendingUp, ChevronRight } from 'lucide-react';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

interface TaxBreakdownCardProps {
  onShowFullBrackets?: () => void;
}

export const TaxBreakdownCard: React.FC<TaxBreakdownCardProps> = ({ onShowFullBrackets }) => {
  const { activeProfile, dependents } = useTaxFiling();
  const financial = activeProfile?.financialSummary;

  const totalTaxableIncome = financial?.totalTaxableIncome ?? 0;
  const personalDeduction = financial?.personalDeductionAmount ?? 132000000;
  const dependentDeduction = financial?.dependentDeductionAmount ?? (dependents.length * 52800000);
  const insuranceDeduction = financial?.insuranceDeductionAmount ?? 0;
  const totalDeductions = personalDeduction + dependentDeduction + insuranceDeduction + (financial?.charityDeductionAmount ?? 0);
  const taxableIncome = financial?.assessableIncome ?? Math.max(0, totalTaxableIncome - totalDeductions);
  const taxPayable = financial?.taxPayable ?? 0;
  const taxWithheld = financial?.taxWithheldTotal ?? 0;
  const balance = financial?.taxBalance ?? (taxWithheld - taxPayable);
  const taxOverpaid = balance > 0 ? balance : 0;
  const taxUnderpaid = balance < 0 ? Math.abs(balance) : 0;

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN').format(Math.round(num));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#046a4e]" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">
              Biểu thuế lũy tiến từng phần
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
            TNCN-{activeProfile?.taxYear || 2025}
          </span>
        </div>

        {/* Calculation summary rows */}
        <div className="py-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Tổng thu nhập chịu thuế:</span>
            <span className="font-bold text-slate-900">
              {formatVND(totalTaxableIncome)} đ
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Tổng các khoản giảm trừ:</span>
            <span className="font-bold text-slate-900">
              - {formatVND(totalDeductions)} đ
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-2 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-slate-700">
                Thu nhập tính thuế (TNTT):
              </span>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-xl font-extrabold text-[#046a4e] tracking-tight">
                  {formatVND(taxableIncome)}
                </span>
                <span className="text-xs text-slate-500 font-normal">đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Progressive Tax Brackets Preview */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 mt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Biểu thuế lũy tiến:</span>
            <span className="text-emerald-700 font-semibold">Theo Luật Thuế TNCN</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Bậc 1 (Đến 60tr/năm - 5%):</span>
              <span className="font-mono font-medium text-slate-800">
                {formatVND(Math.min(taxableIncome, 60000000) * 0.05)} đ
              </span>
            </div>
            {taxableIncome > 60000000 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Bậc 2 (60tr - 120tr - 10%):</span>
                <span className="font-mono font-medium text-slate-800">
                  {formatVND(Math.min(Math.max(0, taxableIncome - 60000000), 60000000) * 0.1)} đ
                </span>
              </div>
            )}
            {taxableIncome > 120000000 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Bậc 3 (120tr - 216tr - 15%):</span>
                <span className="font-mono font-medium text-slate-800">
                  {formatVND(Math.min(Math.max(0, taxableIncome - 120000000), 96000000) * 0.15)} đ
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Thuế TNCN thực tế:</span>
            <span className="text-[#046a4e]">{formatVND(taxPayable)} đ</span>
          </div>
        </div>
      </div>

      {/* Footer details toggle */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">
          Chênh lệch:{' '}
          <strong className={taxOverpaid > 0 ? 'text-emerald-700' : taxUnderpaid > 0 ? 'text-amber-700' : 'text-slate-700'}>
            {taxOverpaid > 0 
              ? `+${formatVND(taxOverpaid)} đ (Hoàn)` 
              : taxUnderpaid > 0 
              ? `-${formatVND(taxUnderpaid)} đ (Nộp thêm)` 
              : '0 đ'}
          </strong>
        </span>
        <button
          type="button"
          onClick={onShowFullBrackets}
          className="text-[#046a4e] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Chi tiết bảng tính</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
