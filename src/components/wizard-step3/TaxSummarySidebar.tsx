import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

const formatVndMoney = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';
};

export const TaxSummarySidebar: React.FC = () => {
  const { activeProfile, dependents } = useTaxFiling();
  const summary = activeProfile?.financialSummary;

  const totalIncome = summary?.totalTaxableIncome || 0;
  const personalDeduction = summary?.personalDeductionAmount || 132000000;
  const dependentDeduction = summary?.dependentDeductionAmount || 0;
  const insuranceDeduction = summary?.insuranceDeductionAmount || 0;
  const taxableIncome = summary?.assessableIncome || 0;
  const calculatedTax = summary?.taxPayable || 0;
  const withheldTax = summary?.taxWithheldTotal || 0;
  const refundOrDue = summary?.taxBalance || 0;

  return (
    <div className="space-y-4">
      {/* 1. Main Tax Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Tóm tắt số liệu quyết toán
          </h3>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-mono font-medium px-2 py-0.5 rounded">
            Tờ khai 02/QTT
          </span>
        </div>

        {/* Lines */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Tổng thu nhập chịu thuế:</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatVndMoney(totalIncome)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Giảm trừ bản thân (12 th):</span>
            <span className="font-bold text-slate-900 font-mono">
              - {formatVndMoney(personalDeduction)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Giảm trừ người phụ thuộc ({dependents.length} NPT):</span>
            <span className="font-bold text-slate-900 font-mono">
              - {formatVndMoney(dependentDeduction)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Bảo hiểm bắt buộc đã trừ:</span>
            <span className="font-bold text-slate-900 font-mono">
              - {formatVndMoney(insuranceDeduction)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-bold text-xs text-slate-800">
            <span>Thu nhập tính thuế:</span>
            <span className="font-mono text-slate-900">
              {formatVndMoney(taxableIncome)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Thuế TNCN phát sinh:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatVndMoney(calculatedTax)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Thuế TNCN đã khấu trừ:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatVndMoney(withheldTax)}
            </span>
          </div>

          {/* Refund Box */}
          <div className={`border-t border-dashed pt-2.5 mt-2 rounded-xl p-2.5 px-3 flex items-center justify-between ${
            refundOrDue > 0
              ? 'border-emerald-300 bg-emerald-50/40 text-[#046a4e]'
              : refundOrDue < 0
              ? 'border-rose-300 bg-rose-50/40 text-rose-700'
              : 'border-slate-300 bg-slate-50 text-slate-700'
          }`}>
            <div>
              <span className="text-[11px] font-bold uppercase block">
                {refundOrDue > 0
                  ? 'SỐ THUẾ ĐƯỢC HOÀN:'
                  : refundOrDue < 0
                  ? 'SỐ THUẾ PHẢI NỘP THÊM:'
                  : 'CÂN BẰNG NGHĨA VỤ THUẾ:'}
              </span>
              <span className="text-[10px] text-slate-500">
                {refundOrDue > 0
                  ? 'Kho bạc hoàn trả'
                  : refundOrDue < 0
                  ? 'Nộp vào NSNN'
                  : 'Không phát sinh chênh lệch'}
              </span>
            </div>
            <div className="text-lg font-extrabold font-mono">
              {refundOrDue > 0 ? `+${formatVndMoney(refundOrDue)}` : formatVndMoney(Math.abs(refundOrDue))}
            </div>
          </div>
        </div>

        {/* Progressive Tax Bracket Progress */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 text-[11px]">Bậc thuế lũy tiến:</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              {taxableIncome > 0 ? 'Lũy tiến 7 bậc' : 'Chưa phát sinh'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#046a4e] rounded-full w-[35%]"></div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Áp dụng theo Luật Thuế TNCN số 04/2007/QH12 &amp; TT 111/2013/TT-BTC
          </p>
        </div>
      </div>

      {/* 2. Legal Safety Guarantee Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-1.5 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Đảm bảo an toàn pháp lý</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          ThuTra áp dụng 15 quy tắc kiểm tra theo đúng chuẩn kê khai ngành thuế. Hồ sơ tải về đáp ứng đầy đủ Thông tư 80/2021/TT-BTC để nộp trực tuyến mà không cần đến trực tiếp cơ quan thuế.
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">Hỗ trợ đối soát chứng từ:</span>
          <span className="text-slate-800 font-bold">24/7 Miễn phí</span>
        </div>
      </div>
    </div>
  );
};
