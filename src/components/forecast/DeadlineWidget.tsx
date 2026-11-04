import React from 'react';
import { Clock, BookOpen } from 'lucide-react';

interface DeadlineWidgetProps {
  onOpenGuide?: () => void;
}

export const DeadlineWidget: React.FC<DeadlineWidgetProps> = ({ onOpenGuide }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <Clock className="w-4 h-4" />
          </div>
          <span className="bg-[#b91c1c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
            Hạn chót quan trọng
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-xs text-slate-600 font-medium">
            Hạn nộp tờ khai tự quyết toán:
          </span>
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">
            14 NGÀY NỮA
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
          Hạn cuối theo Luật Quản lý Thuế: <strong className="text-slate-700">30/04/2025</strong> (Ngày làm việc tiếp theo: <strong className="text-slate-700">02/05/2025</strong>).
        </p>
      </div>

      <button
        onClick={onOpenGuide}
        className="mt-3.5 w-full bg-sky-50 hover:bg-sky-100/90 border border-sky-200/90 text-sky-800 font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
        <span>Cẩm nang quyết toán nhanh trong 15 phút</span>
      </button>
    </div>
  );
};
