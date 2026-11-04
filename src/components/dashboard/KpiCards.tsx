import { 
  FileSpreadsheet, 
  CreditCard, 
  ShieldCheck, 
  Check,
  AlertCircle
} from 'lucide-react';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

interface KpiCardsProps {
  onShowDeductionDetails?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ onShowDeductionDetails }) => {
  const { activeProfile, incomeSources, dependents } = useTaxFiling();

  const financial = activeProfile?.financialSummary;
  const totalTaxableIncome = financial?.totalTaxableIncome ?? 0;
  const taxWithheld = financial?.taxWithheldTotal ?? 0;
  const personalDeduction = financial?.personalDeductionAmount ?? 132000000;
  const dependentDeduction = financial?.dependentDeductionAmount ?? (dependents.length * 52800000);
  const insuranceDeduction = financial?.insuranceDeductionAmount ?? 0;
  const totalDeductions = personalDeduction + dependentDeduction + insuranceDeduction + (financial?.charityDeductionAmount ?? 0);
  const balance = financial?.taxBalance ?? (taxWithheld - (financial?.taxPayable ?? 0));
  const taxOverpaid = balance > 0 ? balance : 0;
  const taxUnderpaid = balance < 0 ? Math.abs(balance) : 0;

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN').format(Math.round(num));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Tổng thu nhập chịu thuế */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-medium">Tổng thu nhập chịu thuế</span>
            <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center text-slate-500">
              <FileSpreadsheet className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatVND(totalTaxableIncome)}
            </span>
            <span className="text-xs text-slate-500 font-normal">đ</span>
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Từ {incomeSources.length > 0 ? `${incomeSources.length} đơn vị chi trả` : 'chưa có nguồn tiền'}</span>
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <span>{incomeSources.length > 0 ? '100% Khai báo' : 'Cần bổ sung'}</span>
            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Card 2: Thuế đã tạm khấu trừ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-medium">Thuế đã tạm khấu trừ</span>
            <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center text-slate-500">
              <CreditCard className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatVND(taxWithheld)}
            </span>
            <span className="text-xs text-slate-500 font-normal">đ</span>
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Chứng từ e-Chungtu</span>
          <span className="text-slate-600 font-medium">{incomeSources.length} nguồn ghi nhận</span>
        </div>
      </div>

      {/* Card 3: Tổng giảm trừ gia cảnh & BH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-medium">Tổng giảm trừ gia cảnh & BH</span>
            <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center text-slate-500">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatVND(totalDeductions)}
            </span>
            <span className="text-xs text-slate-500 font-normal">đ</span>
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Bản thân + {dependents.length} NPT</span>
          <button 
            type="button"
            onClick={onShowDeductionDetails}
            className="text-slate-600 font-medium underline hover:text-[#046a4e] cursor-pointer"
          >
            Chi tiết
          </button>
        </div>
      </div>

      {/* Card 4: SỐ THUẾ ƯỚC TÍNH ĐƯỢC HOÀN HOẶC PHẢI NỘP THÊM */}
      <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative ${
        taxUnderpaid > 0 
          ? 'border-amber-400/90 ring-1 ring-amber-400/20' 
          : 'border-emerald-500/90 ring-1 ring-emerald-500/20'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
              {taxUnderpaid > 0 ? 'SỐ THUẾ PHẢI NỘP THÊM' : 'SỐ THUẾ ƯỚC TÍNH ĐƯỢC HOÀN'}
            </span>
            <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${
              taxUnderpaid > 0 ? 'bg-amber-600' : 'bg-[#046a4e]'
            }`}>
              {taxUnderpaid > 0 ? 'Nộp thêm' : taxOverpaid > 0 ? 'Hoàn Thuế' : 'Cân Bằng'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-2xl lg:text-[28px] font-extrabold tracking-tight ${
              taxUnderpaid > 0 ? 'text-amber-600' : 'text-[#046a4e]'
            }`}>
              {taxUnderpaid > 0 
                ? `-${formatVND(taxUnderpaid)}` 
                : taxOverpaid > 0 
                ? `+${formatVND(taxOverpaid)}` 
                : '0'}
            </span>
            <span className="text-xs text-slate-500 font-normal">đ</span>
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            {taxUnderpaid > 0 ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="text-slate-600">
              {taxUnderpaid > 0 ? 'Hạn nộp 30/04/2025' : 'Tối ưu hoàn thuế hợp lệ'}
            </span>
          </div>
          <span className="text-slate-600 font-medium">Kho Bạc chi trả</span>
        </div>
      </div>
    </div>
  );
};
