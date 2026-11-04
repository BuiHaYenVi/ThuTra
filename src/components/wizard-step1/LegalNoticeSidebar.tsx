import React from 'react';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';
import { mockLegalConditions } from '../../data/mockWizardStep1';

export const LegalNoticeSidebar: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#046a4e] flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4" />
        </div>
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
          Điều kiện &amp; Căn cứ Pháp lý
        </h3>
      </div>

      {/* 2. Checklist conditions */}
      <div className="space-y-3 text-xs">
        {mockLegalConditions.map((cond) => (
          <div key={cond.id} className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-600 text-[11px]">
              <strong className="text-slate-900 font-bold">{cond.title} </strong>
              {cond.description}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Amber Duplicate Warning Box */}
      <div className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] text-amber-950">
          <strong className="font-bold text-amber-900">Lưu ý quan trọng:</strong> Mỗi người phụ thuộc chỉ được tính giảm trừ cho <strong className="font-bold">01 người nộp thuế</strong> duy nhất trong năm. Nếu đăng ký trùng lặp giữa các anh/chị/em, hồ sơ sẽ bị CQT từ chối và truy thu thuế.
        </p>
      </div>
    </div>
  );
};
