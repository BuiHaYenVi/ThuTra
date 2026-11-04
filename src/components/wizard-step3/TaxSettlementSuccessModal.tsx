import React, { useEffect } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  FileText, 
  LayoutDashboard, 
  ArrowRight, 
  Check,
  Wallet
} from 'lucide-react';

export interface TaxSettlementSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementId?: string;
  refundAmount?: number;
  taxOffice?: string;
  onDownloadPdf?: () => void;
  onGoToDashboard?: () => void;
}

export const TaxSettlementSuccessModal: React.FC<TaxSettlementSuccessModalProps> = ({
  isOpen,
  onClose,
  settlementId = 'TT-2026-8492019381-QTT',
  refundAmount = 18450000,
  taxOffice = 'Chi cục Thuế Quận Bình Thạnh, TP.HCM',
  onDownloadPdf,
  onGoToDashboard
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

  // Định dạng tiền tệ
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(refundAmount);

  const handleDownloadPdf = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      alert('Đang tải Phiếu tổng hợp số liệu giải trình quyết toán thuế (PDF)...');
    }
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      {/* Khung Modal Chính (max-w-xl w-full) */}
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-5 sm:p-6 relative select-none animate-zoom-in max-h-[96vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X ở góc trên bên phải */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Đóng modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================= */}
        {/* B. HEADER & HUY HIỆU THÀNH CÔNG (Celebration Icon)         */}
        {/* ========================================================= */}
        <div className="text-center">
          {/* Huy hiệu trung tâm hình hoa cúc / rosette cách điệu */}
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-2.5 text-emerald-700 shadow-2xs">
            <svg 
              className="w-6 h-6 text-emerald-700" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2l2.4 2.2 3.2-.4 1.3 3 2.9 1.4-.4 3.2 2.2 2.4-2.2 2.4.4 3.2-2.9 1.4-1.3 3-3.2-.4L12 22l-2.4-2.2-3.2.4-1.3-3-2.9-1.4.4-3.2-2.2-2.4 2.2-2.4-.4-3.2 2.9-1.4 1.3-3 3.2.4L12 2z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>

          {/* Tiêu đề chính */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Hồ Sơ Quyết Toán Đã Được Kiểm Tra An Toàn!
          </h2>

          {/* Phụ đề */}
          <p className="text-xs text-slate-500 mt-1 mb-3.5 leading-relaxed max-w-md mx-auto">
            Không còn phát hiện sai sót vi phạm quy tắc thuế. Dưới đây là thông số tóm tắt của bạn:
          </p>
        </div>

        {/* ========================================================= */}
        {/* C. THẺ TÓM TẮT KẾT QUẢ QUYẾT TOÁN (Summary Result Card)    */}
        {/* ========================================================= */}
        <div className="border border-slate-200 rounded-xl p-3 sm:p-3.5 bg-white mb-3 shadow-2xs">
          {/* Hàng 1: Mã hồ sơ & Trạng thái (Top Meta Row) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Mã hồ sơ lưu trữ ThuTra:</span>
              <span className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-[11px] font-medium">
                {settlementId}
              </span>
            </div>

            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-100 inline-flex items-center gap-1">
              <span>✓</span>
              <span>15/15 rules hợp lệ</span>
            </span>
          </div>

          {/* Hàng 2: Khối Kết quả Rà soát Quyết toán (Highlight Box) */}
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block">
                KẾT QUẢ RÀ SOÁT QUYẾT TOÁN
              </span>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                  +{formattedAmount}
                </span>
                <span className="text-xs font-bold text-emerald-800 ml-1.5">
                  VNĐ
                </span>
              </div>
            </div>

            {/* Badge pill lớn: Đủ điều kiện hoàn thuế */}
            <div className="bg-emerald-800 text-white text-xs px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-xs shrink-0">
              <Wallet className="w-3.5 h-3.5 text-emerald-200" />
              <span>Đủ điều kiện hoàn thuế</span>
            </div>
          </div>

          {/* Hàng 3: Lưới 2 cột thông số pháp lý & kiểm tra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100">
            {/* Cột 1: Cơ quan thuế thụ lý theo luật */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2 sm:p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Cơ quan thuế thụ lý theo luật:</span>
              </div>
              <p className="font-bold text-xs text-slate-900 leading-tight">
                {taxOffice}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                (Theo Điều 45 Thông tư 80/2021/TT-BTC)
              </p>
            </div>

            {/* Cột 2: Tình trạng kiểm tra an toàn */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2 sm:p-2.5 text-left">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Tình trạng kiểm tra an toàn:</span>
              </div>
              <p className="font-bold text-xs text-slate-900 leading-tight">
                Đã rà soát 15/15 rules
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                0 lỗi nghiêm trọng • Không trùng giảm trừ • Chuẩn lũy tiến
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* D. THẺ DANH SÁCH KIỂM TRA HOÀN TẤT & BƯỚC TIẾP THEO       */}
        {/* ========================================================= */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 mb-4 text-left">
          {/* Header Checklist */}
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
            <span className="font-bold text-[11px] text-slate-800 tracking-wider">
              CHECKLIST HOÀN TẤT &amp; BƯỚC TIẾP THEO
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              Tiến độ: 2/3 bước
            </span>
          </div>

          {/* Checklist items */}
          <div className="space-y-1.5 mt-2 text-xs text-slate-700">
            {/* Item 1 */}
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </span>
              <span className="leading-snug">
                Đã cân đối thời gian làm việc &amp; giảm trừ bản thân (<strong>132.000.000 đ/năm</strong>)
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </span>
              <span className="leading-snug">
                Đã tổng hợp đầy đủ chứng từ khấu trừ 10% và HĐLĐ (<strong>2 chứng từ e-Chungtu hợp lệ</strong>)
              </span>
            </div>

            {/* Khối bước tiếp theo (Next Action Highlight) */}
            <div className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2 mt-2 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <ArrowRight className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 leading-snug">
                  Cần làm tiếp: Tải file XML và tải lên thuedientu.gdt.gov.vn theo hướng dẫn
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  ThuTra đã đóng gói sẵn định dạng tương thích hệ thống iCaNhan Tổng Cục Thuế.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* E. FOOTER MODAL (Hai nút hành động chính)                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Nút bên trái (Phụ): Tải bản tổng hợp giải trình PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Tải bản tổng hợp giải trình (PDF)</span>
          </button>

          {/* Nút bên phải (Chính - Primary CTA): Về Trang Tổng Quan */}
          <button
            type="button"
            onClick={handleGoToDashboard}
            className="text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-200" />
            <span>Về Trang Tổng Quan (Dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxSettlementSuccessModal;
