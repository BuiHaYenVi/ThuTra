import React, { useState } from 'react';
import { 
  Briefcase, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Receipt 
} from 'lucide-react';
import { initialWizardStep2Data, formatCurrency } from '../../data/mockWizardStep2';
import type { FreelanceIncomeData } from '../../data/mockWizardStep2';

interface IncomeFreelanceCardProps {
  data?: FreelanceIncomeData;
  onChange?: (updated: FreelanceIncomeData) => void;
  onDelete?: () => void;
}

export const IncomeFreelanceCard: React.FC<IncomeFreelanceCardProps> = ({
  data = initialWizardStep2Data.freelanceIncome,
  onChange,
  onDelete
}) => {
  const [formData, setFormData] = useState<FreelanceIncomeData>(data);

  const handleFieldChange = (field: keyof FreelanceIncomeData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header: Contract Info, Badges & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
            <Briefcase className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {formData.contractTitle}
              </h3>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {formData.categoryBadge}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              MST Đơn vị chi trả: {formData.payerTaxCode} &nbsp;•&nbsp; {formData.branch}
            </p>
          </div>
        </div>

        {/* Right Badge & Trash */}
        <div className="flex items-center gap-2 self-end sm:self-start">
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
            <Receipt className="w-3 h-3 text-slate-500" />
            <span>{formData.rateBadge}</span>
          </span>

          <button
            onClick={onDelete}
            title="Xóa nguồn này"
            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Grid of 3 Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        {/* Field 1: Payment Month */}
        <div>
          <span className="text-slate-700 font-semibold block mb-1">
            Thời điểm chi trả
          </span>
          <div className="relative">
            <input
              type="text"
              value={formData.paymentMonth}
              onChange={(e) => handleFieldChange('paymentMonth', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-9"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Field 2: Total Income Before Tax */}
        <div>
          <div className="flex items-center justify-between font-semibold mb-1">
            <span className="text-slate-700">Tổng thu nhập chi trả</span>
            <span className="text-[10px] text-slate-400 font-normal">Chưa trừ 10%</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formatCurrency(formData.totalIncomeBeforeTax)}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                handleFieldChange('totalIncomeBeforeTax', num);
              }}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-12 text-right sm:text-left"
            />
            <span className="absolute right-3 text-slate-400 text-xs font-semibold pointer-events-none">
              VNĐ
            </span>
          </div>
        </div>

        {/* Field 3: Tax Withheld 10% */}
        <div>
          <div className="flex items-center justify-between font-semibold mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-700">Số thuế đã khấu trừ (10%)</span>
              <div 
                className="relative group cursor-pointer"
                title="Xem quy định cam kết miễn trừ 10% mẫu 08/CK-TNCN"
              >
                <span className="text-slate-400 hover:text-[#046a4e]">
                  ⓘ
                </span>
                <div className="hidden group-hover:block absolute right-0 sm:left-0 bottom-full mb-1 w-64 p-2.5 bg-slate-900 text-white text-[10.5px] rounded-xl shadow-xl z-30 leading-relaxed pointer-events-none">
                  <strong className="text-emerald-400 block mb-0.5">Cam kết mẫu 08/CK-TNCN:</strong>
                  Cá nhân chỉ có thu nhập duy nhất tại đây hoặc ước tính cả năm dưới 132 triệu VNĐ được làm cam kết để tạm thời không bị khấu trừ 10%.
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Khấu trừ tại nguồn</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formatCurrency(formData.taxWithheld10Percent)}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                handleFieldChange('taxWithheld10Percent', num);
              }}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-12 text-right sm:text-left"
            />
            <span className="absolute right-3 text-slate-400 text-xs font-semibold pointer-events-none">
              VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* Inline Legal Box: Mẫu 08/CK-TNCN guidance */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2.5 px-3 flex items-start gap-2 text-[11px] text-sky-900">
        <span className="font-bold text-sky-700 shrink-0 mt-0.5 text-xs">ⓘ</span>
        <div className="leading-relaxed">
          <strong className="font-semibold text-sky-950">Quy định miễn khấu trừ 10% (Mẫu 08/CK-TNCN):</strong> Nếu ước tính tổng thu nhập trong năm chưa đến mức phải nộp thuế (dưới 132 triệu đồng/năm), cá nhân có thể nộp bản cam kết mẫu 08 gửi đơn vị chi trả để nhận đủ 100% thu nhập mà không bị tạm trừ 10%.
        </div>
      </div>

      {/* 3. Footer Strip */}
      <div className="bg-[#f0fbf7] border border-emerald-200/90 rounded-xl p-2.5 px-3 flex items-center gap-2 text-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
        <span className="text-slate-600 text-[11px]">
          Đã có chứng từ khấu trừ thuế TNCN vãng lai số{' '}
          <strong className="font-mono text-slate-800 font-semibold">{formData.certificateRefNumber}</strong>{' '}
          đính kèm theo quy định.
        </span>
      </div>
    </div>
  );
};
