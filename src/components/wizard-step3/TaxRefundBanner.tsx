import { 
  ShieldCheck, 
  Building2, 
  Check,
  AlertCircle
} from 'lucide-react';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

export const TaxRefundBanner: React.FC = () => {
  const { activeProfile, latestAuditResult } = useTaxFiling();
  const financial = activeProfile?.financialSummary;

  const taxWithheld = financial?.taxWithheldTotal ?? 0;
  const taxPayable = financial?.taxPayable ?? 0;
  const balance = financial?.taxBalance ?? (taxWithheld - taxPayable);
  const taxOverpaid = balance > 0 ? balance : 0;
  const taxUnderpaid = balance < 0 ? Math.abs(balance) : 0;

  const rulesScanned = latestAuditResult?.totalRulesScanned ?? 15;
  const taxYear = activeProfile?.taxYear ?? 2025;

  const formatVndMoney = (num: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(num))} đ`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Top Title & Scanner Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div>
          <span className="text-[11px] text-slate-400 font-normal block leading-tight">
            Thẩm định hồ sơ quyết toán thuế năm {taxYear}
          </span>
          <h2 className="font-extrabold text-slate-900 text-base tracking-tight mt-0.5">
            Kết quả quyết toán thuế năm {taxYear} của bạn
          </h2>
        </div>

        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 self-start sm:self-center">
          <ShieldCheck className="w-3 h-3 text-emerald-700" />
          <span>Đã chạy Rule Engine kiểm tra {rulesScanned}/15 quy tắc</span>
        </span>
      </div>

      {/* 2. Main Verdict Split Card */}
      <div className={`border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs ${
        taxUnderpaid > 0 
          ? 'bg-amber-50/60 border-amber-200' 
          : 'bg-[#f0fbf7] border-emerald-200/90'
      }`}>
        {/* Left Side: Estimated Refund / Underpaid */}
        <div className="space-y-1 max-w-md">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
            taxUnderpaid > 0 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {taxUnderpaid > 0 ? (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>CẦN NỘP THÊM THUẾ TNCN</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>ĐỦ ĐIỀU KIỆN NHẬN HOÀN THUẾ</span>
              </>
            )}
          </span>

          <div className={`text-3xl font-extrabold tracking-tight ${
            taxUnderpaid > 0 ? 'text-amber-600' : 'text-[#046a4e]'
          }`}>
            {taxUnderpaid > 0 
              ? `-${new Intl.NumberFormat('vi-VN').format(taxUnderpaid)} VNĐ` 
              : `+${new Intl.NumberFormat('vi-VN').format(taxOverpaid)} VNĐ`}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            {taxUnderpaid > 0 
              ? 'Vui lòng hoàn thành nộp số thuế còn thiếu trước ngày 30/04/2025 vào tài khoản Thu Ngân sách Nhà nước để tránh tiền chậm nộp 0.03%/ngày.' 
              : 'Kho Bạc Nhà nước sẽ hoàn trả trực tiếp vào tài khoản ngân hàng thụ hưởng đã đăng ký eTax của bạn sau khi CQT duyệt hồ sơ điện tử.'}
          </p>
        </div>

        {/* Right Side: Quick Stats Box */}
        <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 px-4 min-w-[220px] space-y-1 self-stretch md:self-auto flex flex-col justify-center shadow-2xs">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 text-[11px]">Tổng thuế đã nộp:</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatVndMoney(taxWithheld)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 text-[11px]">Nghĩa vụ thực tế:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {formatVndMoney(taxPayable)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tax Authority Location Box */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#046a4e] shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-600 font-medium">
                Cơ quan thuế tiếp nhận hồ sơ:
              </span>
              <span className="bg-slate-200/90 text-slate-700 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded">
                Mã CQT: {activeProfile?.taxDepartmentCode || '105'}
              </span>
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs">
              {activeProfile?.taxDepartmentName || 'Cục Thuế TP Hồ Chí Minh'}
            </h4>

            <p className="text-[10px] text-slate-400 leading-tight">
              {activeProfile?.routingLegalBasis || 'Xác định nơi nộp hồ sơ theo Nơi cư trú và làm việc (NĐ 126/2020/NĐ-CP)'}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Cổng eTax sẵn sàng tiếp nhận</span>
          </span>
        </div>
      </div>
    </div>
  );
};
