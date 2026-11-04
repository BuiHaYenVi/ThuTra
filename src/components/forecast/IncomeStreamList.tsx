import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  ChevronDown 
} from 'lucide-react';
import { mockIncomeStreams } from '../../data/mockForecastData';
import type { IncomeStreamItem } from '../../data/mockForecastData';

interface IncomeStreamListProps {
  onAddIncomeClick?: () => void;
  onUploadRequiredClick?: (item: IncomeStreamItem) => void;
  onViewXmlClick?: (item: IncomeStreamItem) => void;
}

export const IncomeStreamList: React.FC<IncomeStreamListProps> = ({
  onAddIncomeClick,
  onUploadRequiredClick,
  onViewXmlClick
}) => {
  const [filterSource, setFilterSource] = useState('all');

  const filteredItems = mockIncomeStreams.filter((item) => {
    if (filterSource === 'all') return true;
    if (filterSource === 'action_needed') return item.isWarning;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Nguồn thu nhập & Chứng từ
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý và đối soát các dòng thu nhập trong năm tài chính
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium pl-3 pr-8 py-2 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 cursor-pointer"
            >
              <option value="all">Tất cả nguồn (3)</option>
              <option value="action_needed">Cần hành động (1)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Add Income Button */}
          <button
            onClick={onAddIncomeClick}
            className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-200" />
            <span>Thêm nguồn thu nhập</span>
          </button>
        </div>
      </div>

      {/* 2. List of 3 Income Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 transition-all shadow-xs relative bg-white ${
                item.isWarning
                  ? 'border-2 border-amber-300 ring-1 ring-amber-100'
                  : 'border border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {/* Optional warning top badge */}
              {item.isWarning && (
                <div className="absolute -top-2.5 right-6 bg-amber-400 text-amber-950 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
                  <span>!</span>
                  <span>Hành động cần thiết</span>
                </div>
              )}

              {/* Top Row: Logo + Company Info + Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  {/* Short code square */}
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${item.codeBgColor}`}
                  >
                    {item.shortCode}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 text-xs">
                      {item.companyName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-600">{item.contractType}</span>
                      <span>•</span>
                      <span className="font-mono">{item.refCode}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {item.statusBadge.type === 'success' && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                      <span>{item.statusBadge.text}</span>
                    </span>
                  )}

                  {item.statusBadge.type === 'warning' && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{item.statusBadge.text}</span>
                    </span>
                  )}

                  {item.statusBadge.type === 'info' && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                      <span>{item.statusBadge.text}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: 3 Stats Columns & Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <div className="grid grid-cols-3 gap-2 sm:gap-6 flex-1 text-left">
                  {/* Stat 1 */}
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {item.primaryStatLabel}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs font-mono">
                      {typeof item.primaryStatValue === 'number'
                        ? `${new Intl.NumberFormat('vi-VN').format(item.primaryStatValue)}đ`
                        : item.primaryStatValue}
                    </span>
                  </div>

                  {/* Stat 2 */}
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {item.secondaryStatLabel}
                    </span>
                    <span className="font-bold text-slate-800 text-xs font-mono">
                      {typeof item.secondaryStatValue === 'number'
                        ? `${new Intl.NumberFormat('vi-VN').format(item.secondaryStatValue)}đ`
                        : item.secondaryStatValue}
                    </span>
                  </div>

                  {/* Stat 3 */}
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {item.tertiaryStatLabel}
                    </span>
                    <span className="font-bold text-slate-700 text-xs font-mono">
                      {typeof item.tertiaryStatValue === 'number'
                        ? `${new Intl.NumberFormat('vi-VN').format(item.tertiaryStatValue)}đ`
                        : item.tertiaryStatValue}
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="shrink-0 flex items-center justify-end">
                  {item.actionType === 'view_xml' && (
                    <button
                      onClick={() => onViewXmlClick && onViewXmlClick(item)}
                      className="text-xs text-slate-600 hover:text-[#046a4e] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.actionLabel}</span>
                    </button>
                  )}

                  {item.actionType === 'upload_required' && (
                    <button
                      onClick={() => onUploadRequiredClick && onUploadRequiredClick(item)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-800" />
                      <span>{item.actionLabel}</span>
                    </button>
                  )}

                  {item.actionType === 'locked' && (
                    <div className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.actionLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
