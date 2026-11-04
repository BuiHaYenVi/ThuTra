import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Home,
  Check,
  Percent
} from 'lucide-react';

export type IncomeCategory = 'labor' | 'freelance' | 'capital' | 'rental';

export interface IncomeFormData {
  id?: string;
  category: IncomeCategory;
  companyName: string;
  taxCode: string;
  fromMonth: string;
  toMonth: string;
  totalIncome: number;
  taxWithheld: number;
  insuranceDeduction?: number;
  applyPersonalDeduction: boolean;
  notes?: string;
}

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: IncomeFormData) => void;
  initialData?: Partial<IncomeFormData> | null;
  initialCategory?: IncomeCategory;
}

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialCategory = 'labor'
}) => {
  const [category, setCategory] = useState<IncomeCategory>(initialCategory);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [fromMonth, setFromMonth] = useState('01/2024');
  const [toMonth, setToMonth] = useState('12/2024');
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [taxWithheld, setTaxWithheld] = useState<number>(0);
  const [insuranceDeduction, setInsuranceDeduction] = useState<number>(0);
  const [applyPersonalDeduction, setApplyPersonalDeduction] = useState(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || initialCategory);
      setCompanyName(initialData.companyName || '');
      setTaxCode(initialData.taxCode || '');
      setFromMonth(initialData.fromMonth || '01/2024');
      setToMonth(initialData.toMonth || '12/2024');
      setTotalIncome(initialData.totalIncome || 0);
      setTaxWithheld(initialData.taxWithheld || 0);
      setInsuranceDeduction(initialData.insuranceDeduction || 0);
      setApplyPersonalDeduction(initialData.applyPersonalDeduction ?? true);
    } else {
      setCategory(initialCategory);
      setCompanyName('');
      setTaxCode('');
      setFromMonth('01/2024');
      setToMonth('12/2024');
      setTotalIncome(0);
      setTaxWithheld(0);
      setInsuranceDeduction(0);
      setApplyPersonalDeduction(true);
    }
  }, [initialData, initialCategory, isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Auto-calc helper when switching categories or entering income
  const handleCategoryChange = (newCat: IncomeCategory) => {
    setCategory(newCat);
    if (newCat === 'freelance') {
      setApplyPersonalDeduction(false);
      if (totalIncome > 0) setTaxWithheld(Math.round(totalIncome * 0.1));
    } else if (newCat === 'capital') {
      setApplyPersonalDeduction(false);
      if (totalIncome > 0) setTaxWithheld(Math.round(totalIncome * 0.05));
    } else if (newCat === 'rental') {
      setApplyPersonalDeduction(false);
      if (totalIncome > 0) setTaxWithheld(Math.round(totalIncome * 0.05));
    } else {
      setApplyPersonalDeduction(true);
    }
  };

  const handleIncomeChange = (val: string) => {
    const num = Number(val.replace(/\D/g, '')) || 0;
    setTotalIncome(num);
    if (category === 'freelance') {
      setTaxWithheld(Math.round(num * 0.1));
    } else if (category === 'capital') {
      setTaxWithheld(Math.round(num * 0.05));
    } else if (category === 'rental') {
      setTaxWithheld(Math.round(num * 0.05));
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert('Vui lòng nhập tên công ty hoặc tổ chức chi trả thu nhập');
      return;
    }
    if (totalIncome <= 0) {
      alert('Vui lòng nhập tổng thu nhập chịu thuế hợp lệ (> 0 VNĐ)');
      return;
    }

    const payload: IncomeFormData = {
      id: initialData?.id || `inc-${Date.now()}`,
      category,
      companyName: companyName.trim(),
      taxCode: taxCode.trim() || 'Chưa cung cấp',
      fromMonth,
      toMonth,
      totalIncome,
      taxWithheld,
      insuranceDeduction: category === 'labor' ? insuranceDeduction : 0,
      applyPersonalDeduction: category === 'labor' ? applyPersonalDeduction : false,
    };

    if (onSave) onSave(payload);
    onClose();
  };

  const categoryTabs = [
    {
      id: 'labor' as IncomeCategory,
      label: 'Hợp đồng lao động (> 3 tháng)',
      sub: 'Tính lũy tiến từng phần',
      icon: Briefcase
    },
    {
      id: 'freelance' as IncomeCategory,
      label: 'Freelance / Vãng lai',
      sub: 'Khấu trừ 10% tại nguồn',
      icon: FileText
    },
    {
      id: 'capital' as IncomeCategory,
      label: 'Đầu tư vốn / Cổ tức',
      sub: 'Thuế toàn phần 5%',
      icon: TrendingUp
    },
    {
      id: 'rental' as IncomeCategory,
      label: 'Cho thuê tài sản / Khác',
      sub: 'Thuế TNCN 5% + GTGT 5%',
      icon: Home
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#046a4e] flex items-center justify-center border border-emerald-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {initialData ? 'Chỉnh sửa nguồn thu nhập' : 'Thêm nguồn thu nhập chịu thuế'}
              </h3>
              <p className="text-xs text-slate-500">
                Khai báo thông tin tổ chức chi trả để tổng hợp vào Tờ khai 02/QTT-TNCN
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* 1. Segmented Category Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Phân loại hình thức thu nhập <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              {categoryTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategoryChange(tab.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#046a4e] font-bold shadow-xs border border-emerald-200/80 ring-1 ring-emerald-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-[#046a4e]' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight block">{tab.label}</span>
                    <span className="text-[9.5px] font-normal text-slate-400 mt-0.5 leading-tight block">{tab.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Company & Tax Code */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-8">
              <label className="block font-semibold text-slate-700 mb-1">
                Tên tổ chức, doanh nghiệp chi trả thu nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] outline-none text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block font-semibold text-slate-700 mb-1">
                Mã số thuế bên chi trả
              </label>
              <input
                type="text"
                placeholder="0312345678"
                maxLength={14}
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value.replace(/[^0-9-]/g, ''))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] outline-none font-mono text-slate-800"
              />
            </div>
          </div>

          {/* 3. Working Time Period (From Month - To Month) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Khoảng thời gian nhận thu nhập trong năm quyết toán</span>
              </label>
              <span className="text-[10px] text-slate-400">Năm 2024</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Từ tháng:</span>
                <select
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = (i + 1).toString().padStart(2, '0');
                    return <option key={m} value={`${m}/2024`}>{`Tháng ${m}/2024`}</option>;
                  })}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Đến tháng:</span>
                <select
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = (i + 1).toString().padStart(2, '0');
                    return <option key={m} value={`${m}/2024`}>{`Tháng ${m}/2024`}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Financial Inputs: Total Income & Tax Withheld */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Tổng thu nhập chịu thuế <span className="text-red-500">*</span>
                </label>
                <div 
                  className="relative cursor-pointer"
                  onMouseEnter={() => setShowTooltip('income')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                  {showTooltip === 'income' && (
                    <div className="absolute right-0 bottom-full mb-1 w-56 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg z-30 leading-relaxed pointer-events-none">
                      Tổng thu nhập trước khi trừ thuế và bảo hiểm ghi tại Mục [10] hoặc [11] trên chứng từ khấu trừ thuế.
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={totalIncome ? formatNumber(totalIncome) : ''}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-full pl-3 pr-12 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] outline-none font-bold font-mono text-slate-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Số thuế đã tạm khấu trừ
                </label>
                <div 
                  className="relative cursor-pointer"
                  onMouseEnter={() => setShowTooltip('withheld')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Percent className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                  {showTooltip === 'withheld' && (
                    <div className="absolute right-0 bottom-full mb-1 w-56 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg z-30 leading-relaxed pointer-events-none">
                      Số tiền thuế mà tổ chức chi trả đã khấu trừ nộp vào ngân sách, có chứng từ e-Chungtu xác nhận.
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0"
                  value={taxWithheld ? formatNumber(taxWithheld) : ''}
                  onChange={(e) => {
                    const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                    setTaxWithheld(num);
                  }}
                  className="w-full pl-3 pr-12 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] outline-none font-bold font-mono text-emerald-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>
          </div>

          {/* 5. Conditional: Mandatory Insurance deduction (for Labor > 3 months) */}
          {category === 'labor' && (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#046a4e]" />
                  <span>Bảo hiểm bắt buộc đã đóng (BHXH, BHYT, BHTN 10.5%)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (totalIncome > 0) {
                      // Typical Vietnam insurance capped around 36M/month base, or estimate 10.5%
                      const est = Math.min(totalIncome * 0.105, 45360000);
                      setInsuranceDeduction(Math.round(est));
                    }
                  }}
                  className="text-[11px] text-[#046a4e] font-semibold hover:underline cursor-pointer"
                >
                  Tự động ước tính (10.5%)
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0"
                  value={insuranceDeduction ? formatNumber(insuranceDeduction) : ''}
                  onChange={(e) => {
                    const num = Number(e.target.value.replace(/\D/g, '')) || 0;
                    setInsuranceDeduction(num);
                  }}
                  className="w-full pl-3 pr-12 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 outline-none font-bold font-mono text-slate-800 bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs pointer-events-none">
                  VNĐ
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-tight">
                Khoản bảo hiểm bắt buộc này được trừ 100% trước khi tính thuế thu nhập cá nhân.
              </p>
            </div>
          )}

          {/* 6. Toggle: Apply Personal Deduction at this Employer */}
          {category === 'labor' && (
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">
                  Áp dụng giảm trừ bản thân tại nguồn này (132.000.000 đ/năm)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Theo quy định, người nộp thuế chỉ được chọn <strong>01 nơi duy nhất</strong> có HĐLĐ trên 3 tháng để tính giảm trừ gia cảnh cho bản thân.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setApplyPersonalDeduction(!applyPersonalDeduction)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  applyPersonalDeduction ? 'bg-[#046a4e]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    applyPersonalDeduction ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Quick Legal Guidance Box (Non-intrusive) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Lưu ý pháp lý:</strong> Thu nhập từ nhiều nguồn sẽ được hệ thống tự động cộng dồn và áp dụng biểu thuế lũy tiến từng phần theo Điều 22 Luật Thuế TNCN khi quyết toán cuối năm.
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#046a4e] hover:bg-[#03543e] rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{initialData ? 'Cập nhật nguồn thu nhập' : 'Lưu nguồn thu nhập'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
