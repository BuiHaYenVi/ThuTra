import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { Dependent } from '../../data/mockWizardStep1';

interface DependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dependent: Partial<Dependent>) => void;
  initialData?: Dependent | null;
}

const mapRelationToType = (relationText?: string): 'mother' | 'father' | 'child_under_18' | 'child_over_18_student' | 'disabled_relative' | 'spouse' | 'other' => {
  if (!relationText) return 'child_under_18';
  const lower = relationText.toLowerCase();
  if (['mother', 'father', 'child_under_18', 'child_over_18_student', 'spouse', 'disabled_relative', 'other'].includes(lower)) {
    return lower as any;
  }
  if (lower.includes('mẹ') || lower.includes('me')) return 'mother';
  if (lower.includes('cha') || lower.includes('bố') || lower.includes('ba')) return 'father';
  if (lower.includes('đh') || lower.includes('dh') || (lower.includes('con') && (lower.includes('18') || lower.includes('đang học')) && !lower.includes('dưới'))) {
    return 'child_over_18_student';
  }
  if (lower.includes('con')) return 'child_under_18';
  if (lower.includes('vợ') || lower.includes('chồng')) return 'spouse';
  if (lower.includes('tàn tật') || lower.includes('khuyết tật')) return 'disabled_relative';
  return 'other';
};

export const DependentModal: React.FC<DependentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('Con dưới 18 tuổi');
  const [cccd, setCccd] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [mst, setMst] = useState('');
  const [startMonth, setStartMonth] = useState('2025-01');
  const [endMonth, setEndMonth] = useState('2025-12');
  const [monthsApplied, setMonthsApplied] = useState(12);
  const [commitmentChecked, setCommitmentChecked] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setRelation(initialData.relation || 'Con dưới 18 tuổi');
      setCccd(initialData.cccd && /^\d{12}$/.test(initialData.cccd) ? initialData.cccd : '');
      setBirthDate(initialData.birthDate || '');
      setMst(initialData.mst || '');
      setStartMonth(initialData.startMonth || '2025-01');
      setEndMonth(initialData.endMonth || '2025-12');
      setMonthsApplied(initialData.monthsApplied || 12);
      setCommitmentChecked(initialData.commitmentChecked ?? true);
    } else {
      setFullName('');
      setRelation('Con dưới 18 tuổi');
      setCccd('');
      setBirthDate('');
      setMst('');
      setStartMonth('2025-01');
      setEndMonth('2025-12');
      setMonthsApplied(12);
      setCommitmentChecked(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSampleCccd = () => {
    const random6 = Math.floor(100000 + Math.random() * 900000).toString();
    setCccd(`079225${random6}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Vui lòng nhập họ và tên người phụ thuộc.');
      return;
    }

    const cleanDigits = cccd.replace(/\D/g, '');
    const finalCccd = cleanDigits.length === 12 
      ? cleanDigits 
      : `079225${Math.floor(100000 + Math.random() * 900000)}`;

    const relationType = mapRelationToType(relation);
    const totalDeduction = monthsApplied * 4400000;

    onSave({
      id: initialData?.id || `dep-${Date.now()}`,
      title: initialData?.title || `Người phụ thuộc: ${relation.split(' ')[0]}`,
      fullName: fullName.trim(),
      relation,
      relationType,
      cccd: finalCccd,
      birthDate: birthDate || '01/01/2015',
      mst: mst.trim(),
      hasMst: Boolean(mst.trim()),
      isValidCqt: true,
      startMonth,
      endMonth,
      monthsApplied,
      monthlyDeduction: 4400000,
      totalDeduction,
      commitmentChecked
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            {initialData ? 'Chỉnh sửa Người phụ thuộc' : 'Thêm Người phụ thuộc mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Họ và tên */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Họ và tên người phụ thuộc *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Trần Thị Mai hoặc Nguyễn Hoàng Minh"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] outline-none font-bold text-slate-800"
              />
            </div>

            {/* Mối quan hệ */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Quan hệ với người nộp thuế *
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] outline-none text-slate-800"
              >
                <option value="Mẹ đẻ (ngoài độ tuổi lao động)">Mẹ đẻ (ngoài độ tuổi lao động)</option>
                <option value="Cha đẻ (ngoài độ tuổi lao động)">Cha đẻ (ngoài độ tuổi lao động)</option>
                <option value="Con dưới 18 tuổi">Con dưới 18 tuổi</option>
                <option value="Con trên 18 tuổi đang học ĐH">Con trên 18 tuổi đang học ĐH</option>
                <option value="Người tàn tật không nơi nương tựa">Người tàn tật không nơi nương tựa</option>
              </select>
            </div>

            {/* Số CCCD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Số CCCD / Mã định danh (12 số)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSampleCccd}
                  className="text-[10px] text-[#046a4e] hover:text-[#03543e] font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Tạo số mẫu</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={12}
                value={cccd}
                onChange={(e) => setCccd(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="079225123456"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Chuẩn 12 chữ số (tự sinh ngẫu nhiên nếu để trống)
              </span>
            </div>

            {/* Ngày tháng năm sinh */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày sinh (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="12/05/1958"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
              />
            </div>

            {/* MST NPT */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã số thuế NPT (nếu có)
              </label>
              <input
                type="text"
                value={mst}
                onChange={(e) => setMst(e.target.value)}
                placeholder="8091234567"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
              />
            </div>

            {/* Số tháng áp dụng */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số tháng áp dụng trong năm
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={monthsApplied}
                onChange={(e) => setMonthsApplied(Number(e.target.value) || 12)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Mức giảm trừ tự tính */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Mức giảm trừ gia cảnh tính toán:</span>
            <span className="text-base font-extrabold text-[#046a4e]">
              {new Intl.NumberFormat('vi-VN').format(monthsApplied * 4400000)} VNĐ
            </span>
          </div>

          {/* Cam kết */}
          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={commitmentChecked}
              onChange={(e) => setCommitmentChecked(e.target.checked)}
              className="mt-0.5 rounded text-[#046a4e] focus:ring-[#046a4e]"
            />
            <span className="text-[11px] text-slate-600 leading-relaxed">
              Cam kết người phụ thuộc không có thu nhập hoặc thu nhập bình quân tháng trong năm dưới 1.000.000 VNĐ theo Điều 9 Thông tư 111/2013/TT-BTC.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#046a4e] hover:bg-[#03543e] text-white font-bold rounded-xl cursor-pointer shadow-xs"
            >
              Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
