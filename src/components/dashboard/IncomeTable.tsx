import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Wallet,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { useTaxFiling } from '../../contexts/TaxFilingContext';
import type { IncomeSourceDto } from '../../types/business.types';

interface IncomeTableProps {
  onUploadXml?: () => void;
  onFilterClick?: () => void;
  onViewSourceDetails?: (source: IncomeSourceDto) => void;
  onAddIncome?: () => void;
}

export const IncomeTable: React.FC<IncomeTableProps> = ({
  onUploadXml,
  onFilterClick,
  onViewSourceDetails,
  onAddIncome
}) => {
  const { incomeSources, removeIncomeSource, activeProfile } = useTaxFiling();
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'pending'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSources = incomeSources.filter((item) => {
    if (filterType === 'verified') return Boolean(item.taxWithheld && item.taxWithheld > 0);
    if (filterType === 'pending') return !item.taxWithheld || item.taxWithheld === 0;
    return true;
  });

  const toggleFilter = () => {
    if (filterType === 'all') setFilterType('verified');
    else if (filterType === 'verified') setFilterType('pending');
    else setFilterType('all');
    if (onFilterClick) onFilterClick();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nguồn thu nhập từ "${name}"?`)) {
      setDeletingId(id);
      try {
        await removeIncomeSource(id);
      } catch {
        alert('Không thể xóa nguồn thu nhập. Vui lòng thử lại.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">
              Danh sách nguồn thu nhập & Chứng từ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rà soát chi tiết {incomeSources.length} nguồn tiền chịu thuế trong kỳ quyết toán {activeProfile?.taxYear || 2025}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFilter}
              className={`border text-xs font-medium px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                filterType !== 'all' 
                  ? 'bg-emerald-50 border-emerald-300 text-[#046a4e]' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {filterType === 'all' && 'Lọc nguồn'}
                {filterType === 'verified' && 'Lọc: Đã có khấu trừ'}
                {filterType === 'pending' && 'Lọc: Chưa khấu trừ'}
              </span>
            </button>

            <button
              onClick={onUploadXml}
              className="bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Tải lên e-Chungtu (XML)</span>
            </button>

            <button
              onClick={onAddIncome}
              className="bg-[#046a4e] hover:bg-[#03543e] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nguồn</span>
            </button>
          </div>
        </div>

        {/* Table content or Empty State */}
        {filteredSources.length === 0 ? (
          <div className="py-12 px-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 my-3 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600/70 mb-3 shadow-inner">
              <Wallet className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              Chưa có nguồn thu nhập nào được ghi nhận
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
              Hãy thêm các nguồn thu nhập từ Hợp đồng lao động, công việc tự do hoặc thù lao vãng lai để hệ thống tự động tính toán số thuế được hoàn.
            </p>
            <button
              type="button"
              onClick={onAddIncome}
              className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Khai báo nguồn thu nhập đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-2">ĐƠN VỊ CHI TRẢ & PHÂN LOẠI</th>
                  <th className="py-3 px-2">TỔNG THU NHẬP</th>
                  <th className="py-3 px-2">ĐÃ KHẤU TRỪ</th>
                  <th className="py-3 px-2">TÌNH TRẠNG CHỨNG TỪ</th>
                  <th className="py-3 px-2 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSources.map((item) => {
                  const isVerified = (item.taxWithheld ?? 0) > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Unit & Type */}
                      <td className="py-3.5 px-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 group-hover:text-[#046a4e] transition-colors">
                            {item.payerName}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            MST: {item.payerMst || 'Chưa cung cấp'}
                          </span>
                        </div>
                      </td>

                      {/* Total Income */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <span className="font-bold text-slate-900">
                          {new Intl.NumberFormat('vi-VN').format(item.totalIncomeGross)}
                        </span>
                        <span className="text-slate-400 ml-0.5">đ</span>
                      </td>

                      {/* Tax Deducted */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          {new Intl.NumberFormat('vi-VN').format(item.taxWithheld ?? 0)}
                        </span>
                        <span className="text-slate-400 ml-0.5">đ</span>
                      </td>

                      {/* Document Status */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        {isVerified ? (
                          <div className="inline-flex flex-col items-start">
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 text-emerald-700" />
                              <span>Đã khấu trừ thuế</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {item.id.slice(0, 8)}...
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-start">
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Chưa khấu trừ</span>
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Khấu trừ 0đ
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewSourceDetails && onViewSourceDetails(item)}
                            className="text-xs text-slate-600 hover:text-[#046a4e] font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id, item.payerName)}
                            title="Xóa nguồn thu nhập"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table Footer info note */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Tổng cộng: {filteredSources.length} nguồn thu nhập</span>
        <span className="text-emerald-700 font-medium">Đã đối soát thuế lũy tiến & vãng lai</span>
      </div>
    </div>
  );
};
