import React from 'react';
import { 
  Users, 
  User, 
  Pencil, 
  Trash2, 
  CheckSquare, 
  Square,
  UserPlus 
} from 'lucide-react';
import type { Dependent } from '../../data/mockWizardStep1';
import { QuickAddDependentBar } from './QuickAddDependentBar';

interface DependentListCardProps {
  dependents: Dependent[];
  onOpenAddModal: () => void;
  onEditDependent: (dependent: Dependent) => void;
  onDeleteDependent: (id: string) => void;
  onToggleCommitment: (id: string) => void;
  onQuickAdd: (fullName: string, relation: string) => void;
  onOpenModalWithPrefill?: (name: string, relation: string) => void;
}

export const DependentListCard: React.FC<DependentListCardProps> = ({
  dependents,
  onOpenAddModal,
  onEditDependent,
  onDeleteDependent,
  onToggleCommitment,
  onQuickAdd,
  onOpenModalWithPrefill
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
              2. Danh sách Người phụ thuộc đăng ký giảm trừ
            </h3>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Mỗi người phụ thuộc hợp pháp được giảm trừ 4.400.000 VNĐ/tháng (52.800.000 VNĐ/năm)
            </p>
          </div>
        </div>

        <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-center">
          {dependents.length} NPT đã ghi nhận
        </span>
      </div>

      {/* 2. List of Dependents Cards or Empty State */}
      {dependents.length === 0 ? (
        <div className="py-10 px-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/70 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-center justify-center text-blue-500/60 mb-3 shadow-inner">
            <Users className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            Chưa có người phụ thuộc nào được ghi nhận
          </h4>
          <p className="text-xs text-slate-500 max-w-md mt-1.5 mb-5 leading-relaxed">
            Bạn chưa đăng ký người phụ thuộc nào. Nếu có con nhỏ hoặc cha mẹ ngoài độ tuổi lao động, hãy thêm để được giảm trừ 4.400.000 đ/tháng.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm người phụ thuộc đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {dependents.map((dep, index) => (
          <div
            key={dep.id}
            className="border border-slate-200/90 rounded-2xl p-4 bg-white space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
          >
            {/* Subcard Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#046a4e] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px]">
                  {dep.title || `Người phụ thuộc #${index + 1}: ${dep.relation}`}
                </h4>
                {dep.hasMst && (
                  <span className="bg-emerald-50 text-[#046a4e] border border-emerald-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                    Đã có MST NPT
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditDependent(dep)}
                  className="flex items-center gap-1 text-slate-600 hover:text-[#046a4e] text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-slate-500" />
                  <span>Sửa</span>
                </button>

                <button
                  onClick={() => onDeleteDependent(dep.id)}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>

            {/* Subcard 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Col 1 */}
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-[11px] block">Họ và tên người phụ thuộc:</span>
                  <strong className="font-extrabold text-slate-900 text-xs">
                    {dep.fullName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Mã số thuế NPT:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {dep.mst || 'Chưa cấp MST'}
                    </span>
                    {dep.isValidCqt && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Hợp lệ CQT
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-[11px] block">Quan hệ với người nộp thuế:</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {dep.relation}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Thời gian áp dụng năm 2024:</span>
                  <span className="font-bold text-[#046a4e] text-xs">
                    Từ {dep.startMonth} đến {dep.endMonth} ({dep.monthsApplied} tháng)
                  </span>
                </div>
              </div>

              {/* Col 3 */}
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-[11px] block">CCCD / Ngày tháng năm sinh:</span>
                  <span className="font-mono text-slate-700 text-xs">
                    {dep.cccd} • {dep.birthDate}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Mức giảm trừ tính toán:</span>
                  <div className="text-base sm:text-lg font-black text-[#046a4e] tracking-tight mt-0.5">
                    {new Intl.NumberFormat('vi-VN').format(dep.totalDeduction)} VNĐ
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Commitment Checkbox */}
            <div 
              onClick={() => onToggleCommitment(dep.id)}
              className="pt-2 border-t border-slate-100 flex items-start gap-2 cursor-pointer group text-[11px] text-slate-600 select-none"
            >
              {dep.commitmentChecked ? (
                <CheckSquare className="w-4 h-4 text-[#046a4e] shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed group-hover:text-slate-900 transition-colors">
                Cam kết mẹ không có thu nhập hoặc thu nhập bình quân tháng trong năm từ tất cả các nguồn không vượt quá 1.000.000 VNĐ theo Điều 9 Thông tư 111/2013/TT-BTC.
              </p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* 3. Dashed Add Dependent Card */}
      <div
        onClick={onOpenAddModal}
        className="border-2 border-dashed border-slate-300 hover:border-[#046a4e] hover:bg-emerald-50/20 rounded-2xl p-5 text-center transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 group-hover:text-[#046a4e] text-slate-500 flex items-center justify-center mx-auto mb-2 transition-colors">
          <UserPlus className="w-5 h-5" />
        </div>
        <h4 className="font-extrabold text-[#046a4e] text-xs sm:text-sm">
          + Thêm người phụ thuộc khác
        </h4>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
          Con chưa thành niên (dưới 18 tuổi), con đang theo học đại học, cha mẹ già ngoài độ tuổi lao động hoặc người tàn tật không nơi nương tựa.
        </p>
      </div>

      {/* 4. Quick Add Bar */}
      <QuickAddDependentBar 
        onQuickAdd={onQuickAdd} 
        onOpenModalWithPrefill={onOpenModalWithPrefill}
      />
    </div>
  );
};
