import React from 'react';
import { 
  X, 
  Upload,
  Download, 
  AlertTriangle, 
  Smartphone, 
  ShieldCheck 
} from 'lucide-react';
import { mockTaxData, mockTaxUser, formatVND } from '../../data/mockTaxData';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BaseModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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

// Modal: Thêm nguồn thu nhập (Hợp nhất sử dụng IncomeFormModal)
export const AddIncomeModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (source: any) => void }> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  return (
    <IncomeFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={(data) => {
        onAdd({
          id: data.id || `INC-0${Date.now()}`,
          companyName: data.companyName,
          contractType: data.category === 'labor' 
            ? 'HĐLĐ > 3 tháng (Toàn thời gian)'
            : data.category === 'freelance'
            ? 'Hợp đồng tư vấn giải pháp (Vãng lai 10%)'
            : data.category === 'capital'
            ? 'Đầu tư vốn / Cổ tức (5%)'
            : 'Cho thuê tài sản / Khác',
          totalIncome: data.totalIncome,
          taxDeducted: data.taxWithheld,
          documentStatus: 'verified',
          documentCode: `CT-2024-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: 'Hôm nay'
        });
      }}
    />
  );
};

// Modal: Xem chứng từ còn thiếu
export const MissingDocsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Chứng từ khấu trừ còn thiếu (1/3)">
      <div className="space-y-4 text-xs">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">Tổ hợp Giáo dục Topica (Edumall)</span>
            <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
              Khoản thù lao <strong className="font-semibold">54.200.000 đ</strong> (đã tạm khấu trừ{' '}
              <strong className="font-semibold">7.350.000 đ</strong>) chưa được nộp chứng từ khấu trừ thuế điện tử (e-Chungtu XML) hoặc bản gốc có dấu đỏ.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-800 text-xs">Cách thức xử lý hợp lệ:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-600 text-[11px]">
            <li>Liên hệ phòng Kế toán Topica đề nghị xuất chứng từ khấu trừ thuế TNCN điện tử chuẩn XML.</li>
            <li>Hoặc yêu cầu gửi chuyển phát nhanh bản giấy gốc chứng từ khấu trừ thuế (mẫu CTT56).</li>
            <li>Sau khi nhận file XML, bấm vào nút "Tải lên e-Chungtu" để hệ thống tự động ký duyệt.</li>
          </ul>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <label className="block font-semibold text-slate-700 text-xs mb-1.5">
            Tải lên bản scan hoặc file XML thay thế ngay bây giờ:
          </label>
          <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center bg-white cursor-pointer hover:bg-emerald-50/30 transition-colors">
            <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="font-medium text-slate-700">Kéo thả file XML hoặc PDF chứng từ vào đây</p>
            <span className="text-[10px] text-slate-400">Dung lượng tối đa: 10MB</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#046a4e] text-white font-medium rounded-xl hover:bg-[#03543e]"
          >
            Đã hiểu & Tiếp tục
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// Modal: Chi tiết Giảm trừ gia cảnh & BH
export const DeductionDetailModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const d = mockTaxData.deductionsBreakdown;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Chi tiết các khoản giảm trừ gia cảnh & Bảo hiểm (2024)">
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[11px]">Giảm trừ bản thân:</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              {formatVND(d.personal)}
            </p>
            <span className="text-[10px] text-slate-400">11.000.000 đ × 12 tháng</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[11px]">Người phụ thuộc (1 NPT):</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              {formatVND(d.dependents)}
            </p>
            <span className="text-[10px] text-slate-400">4.400.000 đ × 12 tháng (Mẹ ruột)</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-[11px]">Bảo hiểm bắt buộc đã đóng (BHXH, BHYT, BHTN):</span>
            <span className="text-base font-bold text-slate-900">
              {formatVND(d.insurance)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Được đối soát tự động từ dữ liệu đóng bảo hiểm VssID của BHXH Việt Nam.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
          <span>Tổng cộng các khoản giảm trừ:</span>
          <span className="text-[#046a4e]">{formatVND(mockTaxData.totalDeductions)}</span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#046a4e] text-white font-medium rounded-xl hover:bg-[#03543e]"
          >
            Đóng
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// Modal: Biểu thuế lũy tiến 7 bậc chi tiết
export const FullBracketsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Biểu thuế lũy tiến từng phần Luật Thuế TNCN (7 Bậc)">
      <div className="space-y-4 text-xs">
        <p className="text-slate-600 text-[11px]">
          Căn cứ theo Điều 22 Luật Thuế thu nhập cá nhân và Thông tư 111/2013/TT-BTC. Áp dụng cho thu nhập từ tiền lương, tiền công sau khi đã trừ các khoản giảm trừ:
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3">BẬC</th>
                <th className="py-2.5 px-3">PHẦN THU NHẬP NĂM</th>
                <th className="py-2.5 px-3 text-center">THUẾ SUẤT</th>
                <th className="py-2.5 px-3 text-right">SỐ THUẾ TÍNH THEO BẬC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {mockTaxData.progressiveBrackets.map((b) => (
                <tr key={b.bracket} className={b.status === 'active' ? 'bg-emerald-50/40' : ''}>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Bậc {b.bracket}</td>
                  <td className="py-2.5 px-3 text-slate-600">{b.range}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-emerald-800">{b.rate}%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                    {formatVND(b.taxAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">Tổng thuế phải nộp cả năm:</span>
          <span className="font-bold text-[#046a4e] text-sm">58.400.000 đ</span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#046a4e] text-white font-medium rounded-xl hover:bg-[#03543e]"
          >
            Đóng
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// Modal: Xuất tờ khai 02/QTT & nộp eTax
export const ExportDeclarationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Kiểm tra & Xuất tờ khai Quyết toán 02/QTT-TNCN">
      <div className="space-y-4 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900">Hồ sơ đã sẵn sàng kết xuất dữ liệu</h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Tờ khai được tạo theo chuẩn biểu mẫu Thông tư 80/2021/TT-BTC, tích hợp mã vạch hai chiều QR-Data và chữ ký số cá nhân.
            </p>
          </div>
        </div>

        <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Mẫu tờ khai:</span>
            <span className="font-semibold text-slate-800">02/QTT-TNCN (Kỳ tính thuế 2024)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Người nộp thuế:</span>
            <span className="font-semibold text-slate-800">{mockTaxUser.name} (MST: {mockTaxUser.mst})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Cơ quan thuế nhận:</span>
            <span className="font-semibold text-slate-800">Chi cục Thuế Quận 1 - Cục Thuế TP.HCM</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Số thuế đề nghị hoàn:</span>
            <span className="font-bold text-[#046a4e]">{formatVND(mockTaxData.estimatedRefund, true)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Phương thức nhận tiền:</span>
            <span className="font-semibold text-slate-800">Kho bạc Nhà nước chuyển khoản trực tiếp</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              alert('Đang tải file XML 02/QTT-TNCN chuẩn Tổng Cục Thuế...');
              onClose();
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải file XML Tờ khai</span>
          </button>

          <button
            onClick={() => {
              alert('Đã kết nối trực tiếp cổng Dịch vụ công eTax Mobile! Vui lòng mở app eTax Mobile để xác nhận mã OTP.');
              onClose();
            }}
            className="flex-1 bg-[#046a4e] hover:bg-[#03543e] text-white py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <span>Nộp trực tuyến qua eTax</span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
