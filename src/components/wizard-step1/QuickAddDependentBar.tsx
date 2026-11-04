import React, { useState } from 'react';
import { Info, Plus, ChevronDown, ExternalLink } from 'lucide-react';

interface QuickAddDependentBarProps {
  onQuickAdd: (fullName: string, relation: string) => void;
  onOpenModalWithPrefill?: (name: string, relation: string) => void;
}

export const QuickAddDependentBar: React.FC<QuickAddDependentBarProps> = ({
  onQuickAdd,
  onOpenModalWithPrefill
}) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Con dưới 18 tuổi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onQuickAdd(name.trim(), relation);
    setName('');
  };

  const handleOpenDetailedModal = () => {
    if (onOpenModalWithPrefill) {
      onOpenModalWithPrefill(name.trim(), relation);
    }
  };

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Nhập nhanh Người phụ thuộc bổ sung (nếu có):</span>
        </div>
        <button
          type="button"
          onClick={handleOpenDetailedModal}
          className="text-[11px] text-[#046a4e] hover:text-[#03543e] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Nhập form chi tiết (CCCD, Ngày sinh)</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Input Row */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Họ và tên con / NPT (VD: Nguyễn Hoàng An)..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
          >
            <option value="Con dưới 18 tuổi">Quan hệ: Con dưới 18 tuổi</option>
            <option value="Con trên 18 tuổi đang học ĐH">Quan hệ: Con đang học ĐH</option>
            <option value="Cha đẻ (ngoài độ tuổi lao động)">Quan hệ: Cha đẻ ngoài độ tuổi</option>
            <option value="Mẹ đẻ (ngoài độ tuổi lao động)">Quan hệ: Mẹ đẻ ngoài độ tuổi</option>
            <option value="Người tàn tật không nơi nương tựa">Quan hệ: Người tàn tật</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-[#046a4e] hover:bg-[#03543e] text-white active:scale-[0.99] font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Lưu nhanh</span>
        </button>
      </form>
    </div>
  );
};
