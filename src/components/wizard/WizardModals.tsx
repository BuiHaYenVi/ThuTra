import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const WizardBaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

import { IncomeFormModal } from '../modals/IncomeFormModal';
export { IncomeFormModal };

// 1. Modal Thêm nguồn thủ công (Hợp nhất sử dụng IncomeFormModal)
export const AddManualIncomeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  return (
    <IncomeFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={(data) => {
        alert(`Đã thêm nguồn thu nhập: ${data.companyName} (${new Intl.NumberFormat('vi-VN').format(data.totalIncome)} VNĐ)`);
      }}
    />
  );
};

// 2. Modal Xem bản scan chứng từ
export const ViewScanModal: React.FC<{ isOpen: boolean; onClose: () => void; fileName?: string }> = ({
  isOpen,
  onClose,
  fileName = 'Chung_tu_thue_ABC.pdf'
}) => {
  return (
    <WizardBaseModal isOpen={isOpen} onClose={onClose} title={`Xem chi tiết bản scan: ${fileName}`}>
      <div className="space-y-4 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">{fileName}</h4>
          <p className="text-slate-500 text-[11px] mt-1">
            Chứng từ khấu trừ thuế TNCN điện tử theo Thông tư 78/2021/TT-BTC
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Chữ ký số hợp lệ: Công ty Cổ phần Công nghệ ABC</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-3 space-y-1.5 bg-white text-[11px]">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Mã số thuế tổ chức chi trả:</span>
            <span className="font-mono font-bold text-slate-800">0312345678</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Người nộp thuế:</span>
            <span className="font-bold text-slate-800">Nguyễn Hoàng Nam (MST: 8492019381)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Mục [10] Tổng thu nhập chịu thuế:</span>
            <span className="font-mono font-bold text-slate-800">180.000.000 VNĐ</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Mục [14] Số thuế TNCN đã khấu trừ:</span>
            <span className="font-mono font-bold text-emerald-700">14.200.000 VNĐ</span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </WizardBaseModal>
  );
};

// 3. Modal Kiểm tra Rule Engine Bước 3
export const RuleEngineCheckModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  return (
    <WizardBaseModal isOpen={isOpen} onClose={onClose} title="Chạy Rule Engine &amp; So khớp CSDL Tổng Cục Thuế">
      <div className="space-y-4 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950">Kiểm tra hợp lệ 100%</h4>
            <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
              Dữ liệu thu nhập từ Công ty ABC và Hợp đồng Freelance đã được đối soát thành công, không phát hiện trùng lặp mã chứng từ hoặc khai sai mức giảm trừ.
            </p>
          </div>
        </div>

        <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white text-[11px]">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Chứng từ khấu trừ e-Chungtu đã được cấp mã hợp lệ CQT</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mức giảm trừ bản thân 11tr/tháng áp dụng đúng 01 đơn vị</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đủ điều kiện xuất XML nộp qua cổng Thuế điện tử eTax</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              alert('Đang tiến hành tạo tờ khai Quyết toán thuế 02/QTT-TNCN và mã hồ sơ eTax Mobile...');
              onClose();
            }}
            className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
          >
            Tiến hành Xuất hồ sơ
          </button>
        </div>
      </div>
    </WizardBaseModal>
  );
};
