import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Step3BaseModal: React.FC<BaseModalProps> = ({
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

// 1. Modal Bổ sung MST Người Phụ Thuộc (Rule R01)
export const AddDependentMstModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [mst, setMst] = useState('0192837482');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đã cập nhật Mã số thuế người phụ thuộc: ${mst}! Lỗi Rule R01 đã được giải quyết.`);
    onClose();
  };

  return (
    <Step3BaseModal isOpen={isOpen} onClose={onClose} title="Bổ sung Mã số thuế người phụ thuộc (Mẹ đẻ)">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-amber-900 text-[11px] leading-relaxed">
            Theo Thông tư 111/2013/TT-BTC, người phụ thuộc cần có MST cá nhân để hệ thống Tổng cục Thuế cấp mã xác thực mức giảm trừ 52.800.000 VNĐ.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Họ và tên người phụ thuộc:
          </label>
          <input
            type="text"
            readOnly
            value="Nguyễn Thị Mai (Mẹ đẻ - CCCD: 0192837482)"
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Mã số thuế người phụ thuộc (10 số):
          </label>
          <input
            type="text"
            required
            maxLength={10}
            value={mst}
            onChange={(e) => setMst(e.target.value)}
            placeholder="Nhập 10 chữ số MST..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20 outline-none font-mono font-bold text-slate-800"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
          >
            Xác nhận &amp; Cập nhật hồ sơ
          </button>
        </div>
      </form>
    </Step3BaseModal>
  );
};

// 2. Modal Nộp eTax Trực tuyến
export const EtaxSubmissionModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onCompleteToDashboard?: () => void;
}> = ({
  isOpen,
  onClose,
  onCompleteToDashboard
}) => {
  const [step, setStep] = useState<'confirm' | 'otp' | 'success'>('confirm');
  const [otp, setOtp] = useState('');

  return (
    <Step3BaseModal isOpen={isOpen} onClose={onClose} title="Nộp tờ khai trực tiếp lên Cổng Thuế Điện Tử">
      {step === 'confirm' && (
        <div className="space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-emerald-900 text-[11px] leading-relaxed">
              Hồ sơ đã được kiểm tra hợp lệ 15/15 quy tắc và đủ điều kiện nhận hoàn thuế <strong>+4.850.000 VNĐ</strong> từ Kho Bạc Nhà Nước.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5 text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Mẫu hồ sơ:</span>
              <span className="font-bold text-slate-800">Tờ khai 02/QTT-TNCN (Kỳ 2026)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Người nộp thuế:</span>
              <span className="font-bold text-slate-800">Nguyễn Hoàng Nam (MST: 8492019381)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Cơ quan thuế tiếp nhận:</span>
              <span className="font-bold text-slate-800">Chi cục Thuế Quận Bình Thạnh, TP.HCM</span>
            </div>
            <div className="flex justify-between py-1 text-emerald-800 font-bold">
              <span>Số thuế được hoàn trả:</span>
              <span>+4.850.000 VNĐ</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => setStep('otp')}
              className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
            >
              Ký số &amp; Gửi mã OTP eTax
            </button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 text-center leading-relaxed">
            Hệ thống Cổng Thuế điện tử đã gửi mã OTP 6 số tới số điện thoại đăng ký eTax Mobile (098****381).
          </p>

          <div className="flex justify-center my-3">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-48 text-center text-xl tracking-widest font-mono font-bold px-3 py-2 border-2 border-[#046a4e] rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setStep('confirm')}
              className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
            >
              Quay lại
            </button>
            <button
              onClick={() => setStep('success')}
              className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
            >
              Xác nhận nộp tờ khai
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-3 py-2 text-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#046a4e] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-base">
            Nộp hồ sơ quyết toán thành công!
          </h4>
          <p className="text-slate-600 text-[11px] max-w-sm mx-auto leading-relaxed">
            Mã giao dịch điện tử: <strong className="font-mono text-slate-800">GD-2026-BT-91823</strong>. Kho Bạc Nhà nước sẽ tiến hành thẩm định và hoàn trả trực tiếp vào tài khoản ngân hàng trong 3 - 6 ngày làm việc.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onCompleteToDashboard) onCompleteToDashboard();
              }}
              className="px-5 py-2.5 bg-[#046a4e] text-white font-bold rounded-xl hover:bg-[#03543e] cursor-pointer shadow-xs"
            >
              Quay về Dashboard
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </Step3BaseModal>
  );
};

export { TaxSubmissionModal } from './TaxSubmissionModal';
export type { TaxSubmissionModalProps } from './TaxSubmissionModal';
export { TaxSettlementSuccessModal } from './TaxSettlementSuccessModal';
export type { TaxSettlementSuccessModalProps } from './TaxSettlementSuccessModal';
