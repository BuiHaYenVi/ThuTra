import React from 'react';
import { 
  Code, 
  Download, 
  PlayCircle, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface ExportXmlSectionProps {
  onDownloadXml?: () => void;
  onWatchVideoGuide?: () => void;
  onDownloadSchedule?: () => void;
  onDownloadPdfReport?: () => void;
}

export const ExportXmlSection: React.FC<ExportXmlSectionProps> = ({
  onDownloadXml,
  onWatchVideoGuide,
  onDownloadSchedule,
  onDownloadPdfReport
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#046a4e] shrink-0">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
              Nộp hồ sơ quyết toán trực tuyến lên Cổng Thuế Điện Tử
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chuẩn hóa dữ liệu tờ khai 02/QTT-TNCN tương thích 100% với hệ thống Tổng cục Thuế
            </p>
          </div>
        </div>
      </div>

      {/* 2. Grid 2 Functional Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Official XML File */}
        <div className="border-2 border-emerald-400/90 bg-[#f4fbf8] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <span>&lt;&gt;</span>
              <span>Tệp Tờ Khai Chính Thức (.XML)</span>
            </h4>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tải file dữ liệu tờ khai 02/QTT-TNCN (.XML) chuẩn định dạng XSD của Tổng cục Thuế Việt Nam.
            </p>

            <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 pt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Tương thích thuedientu.gdt.gov.vn &amp; eTax Mobile</span>
            </span>
          </div>

          <button
            onClick={onDownloadXml}
            className="w-full bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-200" />
            <span>Tải file dữ liệu tờ khai 02/QTT-TNCN (.XML)</span>
          </button>
        </div>

        {/* Box 2: Express Submission Video Guide */}
        <div className="border border-blue-200/90 bg-blue-50/20 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 text-blue-900">
              <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Hướng Dẫn Nộp Tốc Hành</span>
            </h4>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Xem video trực quan 30 giây hướng dẫn đăng nhập bằng VNeID / MST và tải tệp lên cổng thuế điện tử.
            </p>

            <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Thời gian thực hiện: chỉ từ 2 đến 3 phút</span>
            </span>
          </div>

          <button
            onClick={onWatchVideoGuide}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem video hướng dẫn nộp 30 giây trên Cổng Thuế</span>
          </button>
        </div>
      </div>

      {/* 3. Supplementary Attachments Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <span className="text-slate-400 text-[11px]">
          Hồ sơ giải trình bổ sung đi kèm:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onDownloadSchedule}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Tờ Bảng kê đính kèm 02-1/BK-TNCN</span>
          </button>

          <button
            onClick={onDownloadPdfReport}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>Phiếu tổng hợp số liệu giải trình PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
