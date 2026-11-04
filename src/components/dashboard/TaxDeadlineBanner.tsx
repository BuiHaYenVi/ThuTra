import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { mockTaxData, formatVND } from '../../data/mockTaxData';

interface TaxDeadlineBannerProps {
  onViewMissingDocs?: () => void;
  onExportDeclaration?: () => void;
}

export const TaxDeadlineBanner: React.FC<TaxDeadlineBannerProps> = ({
  onViewMissingDocs,
  onExportDeclaration
}) => {
  return (
    <div className="bg-[#eefbf6] border border-emerald-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Icon + Deadline Info + Status Description */}
        <div className="flex items-start gap-4">
          {/* Green Clock Box */}
          <div className="w-11 h-11 rounded-xl bg-[#046a4e] flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
            <Clock className="w-5 h-5 text-emerald-100" />
          </div>

          <div className="flex flex-col">
            {/* Countdown Badge & Deadline Title */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-[#046a4e] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center">
                Còn {mockTaxData.daysRemaining} ngày
              </span>
              <h2 className="font-bold text-slate-900 text-sm tracking-tight">
                Hạn chót tự quyết toán TNCN: {mockTaxData.deadlineDate} (Kỳ thuế {mockTaxData.taxYear})
              </h2>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Tình trạng hồ sơ: Đủ điều kiện <strong className="font-semibold text-slate-800">HOÀN THUẾ</strong> ước tính{' '}
              <span className="text-[#046a4e] font-extrabold">
                {formatVND(mockTaxData.estimatedRefund, true)}
              </span>{' '}
              theo {mockTaxData.regulationCode}. Bạn có thể nộp tờ khai sớm để Kho Bạc hoàn tiền trong 3-6 ngày làm việc.
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
          <button
            onClick={onViewMissingDocs}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            Xem chứng từ còn thiếu ({mockTaxData.missingDocumentsCount})
          </button>

          <button
            onClick={onExportDeclaration}
            className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Kiểm tra & Xuất tờ khai ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
