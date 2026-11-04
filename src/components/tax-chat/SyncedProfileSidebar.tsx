import React from 'react';
import { 
  ClipboardList, 
  Building2, 
  ArrowRight 
} from 'lucide-react';
import { mockSynchronizedProfile } from '../../data/mockChatData';

interface SyncedProfileSidebarProps {
  onOpenSettlementForm?: () => void;
}

export const SyncedProfileSidebar: React.FC<SyncedProfileSidebarProps> = ({
  onOpenSettlementForm
}) => {
  const profile = mockSynchronizedProfile;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#046a4e] flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Hồ sơ đang đồng bộ
          </h3>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></span>
      </div>

      {/* 2. Taxpayer Info List */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-slate-100/70">
          <span className="text-slate-500">Người nộp thuế:</span>
          <span className="font-bold text-slate-900">{profile.taxpayerName}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100/70">
          <span className="text-slate-500">Mã số thuế cá nhân:</span>
          <span className="font-mono font-bold text-slate-900">{profile.mst}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-500">Thu nhập ghi nhận:</span>
          <span className="font-mono font-bold text-slate-900">
            {new Intl.NumberFormat('vi-VN').format(profile.recordedIncome)} đ
          </span>
        </div>
      </div>

      {/* 3. Estimated Tax Refund Box */}
      <div className="bg-[#f0fbf7] border border-emerald-200/90 rounded-xl p-3.5 space-y-1 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            Ước tính tiền thuế
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
            ĐƯỢC HOÀN
          </span>
        </div>

        <div className="text-2xl font-extrabold text-[#046a4e] tracking-tight">
          +{new Intl.NumberFormat('vi-VN').format(profile.estimatedRefund)} VNĐ
        </div>

        <p className="text-[10px] text-slate-500 leading-tight pt-0.5">
          Dựa trên {profile.withholdingDocsCount} chứng từ khấu trừ 10% đã xác nhận
        </p>
      </div>

      {/* 4. Expected Tax Authority Box */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] text-slate-500 font-medium block">
          Cơ quan thuế thụ lý dự kiến:
        </span>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 px-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#046a4e] border border-emerald-200/80 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 text-xs truncate">
            {profile.taxAuthority}
          </span>
        </div>
      </div>

      {/* 5. CTA Button: Open Settlement Form 02/QTT */}
      <div className="pt-2">
        <button
          onClick={onOpenSettlementForm}
          className="w-full bg-[#e8f5e9] hover:bg-[#c8e6c9] active:scale-[0.99] text-[#046a4e] border border-emerald-200 text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Mở toàn bộ hồ sơ quyết toán 02/QTT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
