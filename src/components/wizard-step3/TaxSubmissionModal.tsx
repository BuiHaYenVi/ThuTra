import React, { useEffect } from 'react';
import { 
  Clock, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  AlertCircle
} from 'lucide-react';

export interface TaxSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  taxOffice?: string;
  onDownloadXml?: () => void;
}

export const TaxSubmissionModal: React.FC<TaxSubmissionModalProps> = ({
  isOpen,
  onClose,
  fileName = 'to-khai-02-QTT-TNCN-2024-8492019381.xml',
  taxOffice = 'Chi cục Thuế Q. Bình Thạnh',
  onDownloadXml
}) => {
  // Đóng modal khi nhấn phím Escape
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

  // Xử lý tải file XML trực tiếp
  const handleDownload = () => {
    if (onDownloadXml) {
      onDownloadXml();
    } else {
      const mockXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<HDon xmlns="http://kekhaithue.gdt.gov.vn/TKhai/02_QTT_TNCN_2024">
  <ThongTinChung>
    <KyTinhThue>2024</KyTinhThue>
    <MST>8492019381</MST>
    <TenNNT>Nguyễn Hoàng Nam</TenNNT>
    <CoQuanThue>${taxOffice}</CoQuanThue>
    <SoTienHoan>4850000</SoTienHoan>
  </ThongTinChung>
</HDon>`;
      const blob = new Blob([mockXmlContent], { type: 'application/xml;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Nút CTA chính: Tải tệp XML & Mở trang thuedientu.gdt.gov.vn
  const handleDownloadAndOpenPortal = () => {
    handleDownload();
    window.open('https://thuedientu.gdt.gov.vn', '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      {/* Khung Modal Chính (max-w-2xl w-full) */}
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden relative select-none animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* B. HEADER MODAL                                           */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 pb-2 sm:pb-3 shrink-0">
          {/* Hàng 1: Tiêu đề + Nút đóng X */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              3 Bước Tự Nộp Tờ Khai 02/QTT Lên Cổng Thuế Điện Tử
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors cursor-pointer shrink-0 -mt-1 -mr-1"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hàng 2: Badge thời gian thực hiện */}
          <div className="mt-1">
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 font-medium border border-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thời gian thực hiện: ~2 phút</span>
            </span>
          </div>

          {/* Hàng 3: Text giới thiệu */}
          <p className="text-xs text-slate-600 mt-2 mb-1 leading-relaxed">
            ThuTra đã tạo sẵn tệp XML chuẩn định dạng Tổng cục Thuế Việt Nam (XSD). Bạn chỉ cần thực hiện 3 thao tác đơn giản dưới đây:
          </p>
        </div>

        {/* ========================================================= */}
        {/* C. NỘI DUNG 3 BƯỚC HƯỚNG DẪN & LƯU Ý                      */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-2 overflow-y-auto space-y-3 flex-1">
          {/* ------------------------------------------------------- */}
          {/* Bước 1: Tải file tờ khai XML về máy tính                */}
          {/* ------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 bg-white hover:border-emerald-200 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Tải file tờ khai XML về máy tính
                </h3>
              </div>

              {/* Badge góc phải: ✓ Đã sẵn sàng tải về */}
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium border border-emerald-100 shrink-0 inline-flex items-center gap-1">
                <span>✓</span>
                <span>Đã sẵn sàng tải về</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 mb-2 leading-relaxed pl-8.5">
              Bấm nút &apos;Tải file dữ liệu tờ khai 02/QTT-TNCN (.XML)&apos; từ ThuTra và lưu vào thư mục máy tính của bạn (không mở chỉnh sửa thủ công để tránh hỏng mã cấu trúc XSD).
            </p>

            {/* Box file đính kèm */}
            <div className="ml-8.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 sm:py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {/* Icon mã nguồn {} */}
                <span className="text-emerald-700 font-bold font-mono text-sm shrink-0 leading-none">
                  &#123;&#125;
                </span>
                <span className="font-mono text-slate-700 font-medium truncate text-[11.5px]">
                  {fileName}
                </span>
                <span className="text-slate-400 text-[11px] shrink-0">(24 KB)</span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer shrink-0 ml-3"
              >
                Tải ngay
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* Bước 2: Đăng nhập Cổng Thuế Nhà Nước                     */}
          {/* ------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 bg-white hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Đăng nhập Cổng Thuế Nhà Nước
              </h3>
            </div>

            <p className="text-xs text-slate-600 mt-1 mb-2 leading-relaxed pl-8.5">
              Truy cập <strong className="text-slate-800">thuedientu.gdt.gov.vn</strong> → Chọn phân hệ <strong className="text-slate-800">&apos;Cá nhân&apos;</strong> → Đăng nhập bằng tài khoản thuế cá nhân hoặc tài khoản định danh điện tử VNeID Mức 2 (Bộ Công An).
            </p>

            {/* Box link cổng thuế */}
            <a
              href="https://thuedientu.gdt.gov.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-8.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-lg px-3 py-1.5 sm:py-2 flex items-center justify-between text-xs text-slate-700 hover:text-emerald-700 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11.5px]">
                  Trang web chính thức: <span className="underline decoration-slate-300 group-hover:decoration-emerald-500">https://thuedientu.gdt.gov.vn</span>
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
            </a>
          </div>

          {/* ------------------------------------------------------- */}
          {/* Bước 3: Tải tệp XML & Gửi tờ khai chính thức            */}
          {/* ------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 bg-white hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Tải tệp XML &amp; Gửi tờ khai chính thức
              </h3>
            </div>

            <p className="text-xs text-slate-600 mt-1 mb-2 leading-relaxed pl-8.5">
              Vào menu <strong className="text-slate-800">&apos;Quyết toán thuế&apos;</strong> → <strong className="text-slate-800">&apos;Kê khai trực tuyến&apos;</strong> → Chọn <strong className="text-slate-800">&apos;Gửi tệp tờ khai XML&apos;</strong> → Đính kèm tệp XML đã tải cùng các chứng từ PDF giải trình (nếu có) → Bấm <strong className="text-slate-800">&apos;Nộp tờ khai&apos;</strong>.
            </p>

            {/* Tag xác nhận tự động */}
            <div className="ml-8.5 text-xs text-emerald-900 bg-emerald-50/70 p-2 sm:p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11.5px]">
                Mã số thuế &amp; Cơ quan thuế (<strong className="font-semibold">{taxOffice}</strong>) đã được điền sẵn chính xác trong file.
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* D. BOX LƯU Ý QUAN TRỌNG (Warning Banner)                */}
          {/* ------------------------------------------------------- */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 text-left mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-950 block mb-0.5">Lưu ý quan trọng:</span>
              <p className="text-amber-900/90 text-[11px] leading-relaxed">
                Sau khi nộp thành công trên Cổng Thuế Điện Tử, Tổng cục Thuế sẽ gửi thông báo tiếp nhận hồ sơ về Email và SMS của bạn trong vòng 1-2 ngày làm việc. Hãy lưu lại mã giao dịch điện tử để tra cứu tiến độ hoàn thuế.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* E. FOOTER MODAL                                           */}
        {/* ========================================================= */}
        <div className="p-3.5 sm:p-4 px-5 sm:px-6 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Đóng hướng dẫn
          </button>

          <button
            type="button"
            onClick={handleDownloadAndOpenPortal}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-semibold px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Tải tệp XML &amp; Mở trang thuedientu.gdt.gov.vn</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxSubmissionModal;
