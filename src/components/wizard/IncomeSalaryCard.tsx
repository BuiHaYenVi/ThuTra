import React, { useState } from 'react';
import { 
  Building2, 
  Eye, 
  Trash2, 
  Calendar, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { initialWizardStep2Data, formatCurrency } from '../../data/mockWizardStep2';
import type { SalaryIncomeData } from '../../data/mockWizardStep2';

interface IncomeSalaryCardProps {
  data?: SalaryIncomeData;
  onChange?: (updated: SalaryIncomeData) => void;
  onDelete?: () => void;
  onViewFile?: () => void;
}

export const IncomeSalaryCard: React.FC<IncomeSalaryCardProps> = ({
  data = initialWizardStep2Data.salaryIncome,
  onChange,
  onDelete,
  onViewFile
}) => {
  const [formData, setFormData] = useState<SalaryIncomeData>(data);

  const handleFieldChange = (field: keyof SalaryIncomeData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header: Company Info, Badges & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#046a4e] shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {formData.companyName}
              </h3>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {formData.contractTypeBadge}
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span>{formData.eCertificateBadge}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              MST: {formData.taxCode} &nbsp;•&nbsp; {formData.taxAuthority}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end sm:self-start">
          <button
            onClick={onViewFile}
            className="text-xs text-slate-600 hover:text-[#046a4e] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem file (PDF)</span>
          </button>

          <button
            onClick={onDelete}
            title="Xóa nguồn này"
            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Grid 4 Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Field 1: Working Period */}
        <div>
          <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
            <div className="flex items-center gap-1">
              <span>Thời gian làm việc trong năm</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={formData.workingPeriod}
              onChange={(e) => handleFieldChange('workingPeriod', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-9"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Field 2: Total Taxable Income */}
        <div>
          <div className="flex items-center justify-between font-semibold mb-1">
            <span className="text-slate-700">Tổng thu nhập chịu thuế</span>
            <span className="text-[11px] text-slate-400 font-normal">Bóc tách từ Mục [10]</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formatCurrency(formData.totalTaxableIncome)}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                handleFieldChange('totalTaxableIncome', num);
              }}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-12 text-right sm:text-left"
            />
            <span className="absolute right-3 text-slate-400 text-xs font-semibold pointer-events-none">
              VNĐ
            </span>
          </div>
        </div>

        {/* Field 3: Tax Withheld */}
        <div>
          <div className="flex items-center justify-between font-semibold mb-1">
            <span className="text-slate-700">Số thuế TNCN đã khấu trừ</span>
            <span className="text-[11px] text-slate-400 font-normal">Mục [14] Chứng từ</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formatCurrency(formData.taxWithheld)}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                handleFieldChange('taxWithheld', num);
              }}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-12 text-right sm:text-left"
            />
            <span className="absolute right-3 text-slate-400 text-xs font-semibold pointer-events-none">
              VNĐ
            </span>
          </div>
        </div>

        {/* Field 4: Insurance Deduction */}
        <div>
          <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
            <div className="flex items-center gap-1">
              <span>BHXH &amp; các khoản đóng bảo hiểm trừ thuế</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formatCurrency(formData.insuranceDeduction)}
              onChange={(e) => {
                const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                handleFieldChange('insuranceDeduction', num);
              }}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 pr-12 text-right sm:text-left"
            />
            <span className="absolute right-3 text-slate-400 text-xs font-semibold pointer-events-none">
              VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Box: Personal Deduction Toggle */}
      <div className="bg-[#f0fbf7] border border-emerald-200/90 rounded-xl p-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#046a4e] shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">
                Áp dụng giảm trừ bản thân tại đơn vị này
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                11.000.000đ/tháng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Theo Luật Thuế TNCN: Người nộp thuế có thu nhập từ 2 nơi trở lên chỉ được đăng ký tính giảm trừ gia cảnh bản thân tại 01 nơi duy nhất trong năm.
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={formData.applyPersonalDeduction}
            onChange={(e) => handleFieldChange('applyPersonalDeduction', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#046a4e]"></div>
        </label>
      </div>
    </div>
  );
};
