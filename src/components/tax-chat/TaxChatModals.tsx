import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  UploadCloud 
} from 'lucide-react';
import { mockSynchronizedProfile, mockLegalDocuments } from '../../data/mockChatData';
import type { LegalDocument } from '../../data/mockChatData';

// Base Modal Wrapper
export const BaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// 1. Export Advisory PDF Modal
export const ExportPdfModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Phiếu Tư Vấn Pháp Lý Quyết Toán Thuế TNCN (PDF)">
      <div className="space-y-4 text-xs text-slate-700">
        {/* Printable Sheet Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 font-sans text-slate-800">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#046a4e] text-white flex items-center justify-center font-bold text-xs">
                TT
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  HỆ THỐNG THUTRA TNCN
                </h4>
                <p className="text-[10px] text-slate-500">
                  Trợ lý Pháp lý &amp; Tối ưu Quyết toán Thuế Cá nhân
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              <div>Số: TV-2024/QLT-8492</div>
              <div>Ngày cấp: 15/10/2026</div>
            </div>
          </div>

          {/* Taxpayer Info */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">Người nộp thuế: </span>
              <strong className="font-bold text-slate-900">{mockSynchronizedProfile.taxpayerName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Mã số thuế: </span>
              <strong className="font-bold font-mono text-slate-900">{mockSynchronizedProfile.mst}</strong>
            </div>
            <div>
              <span className="text-slate-500">Kỳ tính thuế: </span>
              <strong>{mockSynchronizedProfile.taxYear}</strong>
            </div>
            <div>
              <span className="text-slate-500">Cơ quan thụ lý: </span>
              <strong>{mockSynchronizedProfile.taxAuthority}</strong>
            </div>
          </div>

          {/* Consultation Summary */}
          <div className="space-y-2 text-[11px]">
            <h5 className="font-bold text-slate-900 text-xs border-l-2 border-[#046a4e] pl-2">
              KẾT LUẬN TƯ VẤN PHÁP LÝ (2 NGUỒN THU NHẬP)
            </h5>
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 leading-relaxed">
              <p>
                <strong>1. Thu nhập từ tiền lương, tiền công (30.000.000 đ/tháng):</strong> Khấu trừ theo biểu lũy tiến từng phần theo Điều 22 Luật Thuế TNCN sau khi trừ giảm trừ bản thân 11 triệu/tháng và các khoản bảo hiểm bắt buộc 10.5%.
              </p>
              <p>
                <strong>2. Thu nhập vãng lai freelance (15.000.000 đ/tháng):</strong> Đã được khấu trừ 10% tại nguồn theo Điểm i Khoản 1 Điều 25 Thông tư 111/2013/TT-BTC.
              </p>
              <p>
                <strong>3. Hướng giải quyết quyết toán:</strong> Cá nhân thuộc diện bắt buộc tự quyết toán trực tiếp với Chi cục Thuế Quận Bình Thạnh. Dự kiến được <strong>hoàn thuế +3.250.000 VNĐ</strong> khi quyết toán gộp cả năm.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
            <span>Xác thực bởi ThuTra AI Rule Engine v3.5</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Chuẩn Thông tư 80/2021/TT-BTC
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In tài liệu</span>
          </button>
          <button
            onClick={() => {
              alert('Đang tải file "Phieu_Tu_Van_Thue_TNCN_NguyenHoangNam.pdf"...');
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#046a4e] hover:bg-[#03543e] text-white rounded-xl font-bold cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-200" />
            <span>Tải tệp PDF chính thức</span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// 2. Legal Library Modal (All documents)
export const LegalLibraryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedDoc?: LegalDocument | null;
}> = ({ isOpen, onClose, selectedDoc }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('ALL');

  const filteredDocs = mockLegalDocuments.filter((doc) => {
    const matchesSearch = 
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'ALL' || doc.docType === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Cơ Sở Dữ Liệu Văn Bản Pháp Luật Thuế TNCN">
      <div className="space-y-4 text-xs">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo số hiệu thông tư, nghị định, từ khóa..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#046a4e]/20"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'THÔNG TƯ', 'NGHỊ ĐỊNH', 'NGHỊ QUYẾT'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-2.5 py-1.5 rounded-xl font-semibold text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                  activeType === t
                    ? 'bg-[#046a4e] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'ALL' ? 'Tất cả' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Document Highlight */}
        {selectedDoc && (
          <div className="bg-emerald-50/60 border border-emerald-300 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-bold px-2 py-0.5 rounded ${selectedDoc.docTypeBadgeColor}`}>
                {selectedDoc.docType}
              </span>
              <span className="text-slate-500 font-medium">Cơ quan ban hành: {selectedDoc.issuer}</span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">{selectedDoc.code}</h4>
            <p className="text-[11px] text-slate-700 leading-relaxed">{selectedDoc.fullTitle}</p>
            <div className="text-[10px] text-slate-500">Hiệu lực thi hành từ: {selectedDoc.effectiveDate}</div>
          </div>
        )}

        {/* List of Documents */}
        <div className="space-y-2.5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors space-y-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={`font-bold px-1.5 py-0.2 rounded ${doc.docTypeBadgeColor}`}>
                  {doc.docType}
                </span>
                <span className="text-slate-400 font-medium">{doc.issuer}</span>
              </div>
              <h5 className="font-bold text-slate-900 text-xs">{doc.code}</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed">{doc.summary}</p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Hiệu lực từ: {doc.effectiveDate}</span>
                <span className="text-[#046a4e] font-semibold hover:underline cursor-pointer">
                  Xem điều khoản chi tiết →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
};

// 3. Attach Document Modal (OCR / Statement Parsing)
export const AttachDocumentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [fileUploaded, setFileUploaded] = useState(false);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Đính Kèm Chứng Từ Khấu Trừ Điện Tử (Mẫu 123)">
      <div className="space-y-4 text-xs">
        <div className="border-2 border-dashed border-slate-300 hover:border-[#046a4e] rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 cursor-pointer transition-colors">
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800 text-xs">
            Kéo thả hoặc tải lên tệp XML / PDF Chứng từ khấu trừ
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Hỗ trợ chứng từ khấu trừ thuế TNCN điện tử theo Nghị định 123/2020/NĐ-CP hoặc sao kê ngân hàng có giao dịch trích 10%.
          </p>
          <button
            onClick={() => setFileUploaded(true)}
            className="mt-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            Chọn tệp từ máy tính
          </button>
        </div>

        {fileUploaded && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <h5 className="font-bold text-emerald-950 text-xs">
                Đã bóc tách thành công: ChungTu_KhauTru_ABC_Tech.xml
              </h5>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Số tiền thu nhập: 15.000.000 đ/tháng • Thuế TNCN 10% đã khấu trừ: 1.500.000 đ/tháng. Dữ liệu đã sẵn sàng để đối soát trong phiên chat.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              alert('Đã đồng bộ dữ liệu chứng từ vào ngữ cảnh trợ lý ThuTra AI!');
              onClose();
            }}
            className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
          >
            Đưa vào phiên tư vấn
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
