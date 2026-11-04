import React, { useState } from 'react';
import { 
  History, 
  ArrowRight, 
  Download, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  Building2, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Search,
  DollarSign,
  Calendar,
  CreditCard,
  Eye,
  X
} from 'lucide-react';
import type { ScreenType } from '../App';

interface SettlementHistoryPageProps {
  onNavigate?: (screen: ScreenType) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToWizard2?: () => void;
}

export interface SettlementRecord {
  id: string;
  year: number;
  title: string;
  status: 'draft' | 'completed_refunded' | 'authorized_company';
  statusBadge: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  declarationCode: string;
  taxOffice: string;
  companyName?: string;
  companyMst?: string;
  submissionDate?: string;
  disbursementDate?: string;
  totalTaxableIncome: number;
  taxWithheld: number;
  actualTaxDue: number;
  refundAmount: number; // positive = refund
  bankAccount?: string;
  xmlFileName?: string;
  receiptFileName?: string;
  summaryNote: string;
  stepsTimeline: {
    name: string;
    date: string;
    done: boolean;
  }[];
}

const mockSettlementRecords: SettlementRecord[] = [
  {
    id: 'SETTLE-2024',
    year: 2024,
    title: 'Hồ sơ Quyết toán Thuế TNCN Kỳ tính thuế 2024',
    status: 'draft',
    statusBadge: 'Đang soạn thảo • Chưa nộp',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200/90',
    declarationCode: '02/QTT-TNCN-2024-DRAFT',
    taxOffice: 'Chi cục Thuế Quận Bình Thạnh, TP.HCM',
    companyName: 'Công ty Cổ phần Công nghệ FPT (Toàn thời gian) & Shopee VN',
    submissionDate: 'Dự kiến nộp trước 02/05/2025',
    totalTaxableIncome: 584200000,
    taxWithheld: 76850000,
    actualTaxDue: 58400000,
    refundAmount: 18450000,
    xmlFileName: 'to-khai-02-QTT-TNCN-2024-DRAFT.xml',
    summaryNote: 'Hệ thống đã tự động gộp 2 nguồn thu nhập (HĐLĐ FPT và Hợp đồng Shopee), áp dụng giảm trừ gia cảnh bản thân và 1 người phụ thuộc (Mẹ ruột).',
    stepsTimeline: [
      { name: 'Khai báo người phụ thuộc (Mẹ ruột)', date: '10/01/2025', done: true },
      { name: 'Đối soát 2 chứng từ khấu trừ thuế', date: '15/01/2025', done: true },
      { name: 'Chạy Rule Engine kiểm tra sai sót', date: 'Đang thực hiện', done: false },
      { name: 'Nộp tờ khai XML lên Thuế điện tử', date: 'Chờ hoàn tất', done: false }
    ]
  },
  {
    id: 'SETTLE-2023',
    year: 2023,
    title: 'Hồ sơ Quyết toán Thuế TNCN Kỳ tính thuế 2023',
    status: 'completed_refunded',
    statusBadge: 'Đã quyết toán thành công • Kho Bạc đã giải ngân hoàn thuế',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-[#046a4e]',
    badgeBorder: 'border-emerald-200/90',
    declarationCode: 'TT-2023-8492019381-QTT',
    taxOffice: 'Chi cục Thuế Quận Bình Thạnh, TP.HCM',
    companyName: 'Công ty Cổ phần Công nghệ FPT & Tổ hợp Giáo dục Topica',
    submissionDate: '18/04/2024 14:28:10',
    disbursementDate: '05/05/2024 09:15:00',
    totalTaxableIncome: 490000000,
    taxWithheld: 62400000,
    actualTaxDue: 56200000,
    refundAmount: 6200000,
    bankAccount: 'Vietcombank - CN Tân Định - STK: ****8899',
    xmlFileName: 'to-khai-02-QTT-TNCN-2023-CHINH-THUC.xml',
    receiptFileName: 'Bien-lai-xac-nhan-hoan-thue-2023.pdf',
    summaryNote: 'Cục Thuế TP.HCM đã ban hành Quyết định hoàn thuế số 49201/QĐ-CT ngày 28/04/2024. Kho bạc Nhà nước đã ủy nhiệm chi số tiền 6.200.000 VNĐ về tài khoản ngân hàng.',
    stepsTimeline: [
      { name: 'Nộp tờ khai 02/QTT điện tử', date: '18/04/2024', done: true },
      { name: 'CQT tiếp nhận và thông báo hợp lệ', date: '19/04/2024', done: true },
      { name: 'Ban hành quyết định hoàn thuế', date: '28/04/2024', done: true },
      { name: 'Kho Bạc giải ngân tiền hoàn', date: '05/05/2024', done: true }
    ]
  },
  {
    id: 'SETTLE-2022',
    year: 2022,
    title: 'Hồ sơ Quyết toán Thuế TNCN Kỳ tính thuế 2022',
    status: 'authorized_company',
    statusBadge: 'Ủy quyền doanh nghiệp quyết toán thay',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200/90',
    declarationCode: 'UQ-08-2022-FPT-8492019381',
    taxOffice: 'Chi cục Thuế Quận Cầu Giấy, TP. Hà Nội',
    companyName: 'Công ty Cổ phần Công nghệ FPT',
    companyMst: '0101248141',
    submissionDate: '28/03/2023 (Quyết toán qua doanh nghiệp chi trả)',
    totalTaxableIncome: 380000000,
    taxWithheld: 42500000,
    actualTaxDue: 42500000,
    refundAmount: 0,
    summaryNote: 'Người nộp thuế đã ký Giấy ủy quyền quyết toán thuế TNCN mẫu 08/UQ-TNCN cho Công ty FPT do chỉ có 1 nguồn thu nhập duy nhất trong năm. FPT đã hoàn tất nghĩa vụ quyết toán thay.',
    stepsTimeline: [
      { name: 'Ký giấy ủy quyền mẫu 08/UQ-TNCN', date: '15/03/2023', done: true },
      { name: 'Doanh nghiệp tổng hợp bảng kê 05-1/BK', date: '25/03/2023', done: true },
      { name: 'CQT Cầu Giấy xác nhận quyết toán', date: '28/03/2023', done: true },
      { name: 'Không phát sinh thừa hoặc thiếu', date: 'Hoàn tất', done: true }
    ]
  }
];

export const SettlementHistoryPage: React.FC<SettlementHistoryPageProps> = ({
  onNavigate,
  onNavigateToDashboard,
  onNavigateToWizard2
}) => {
  const [filter, setFilter] = useState<'all' | 'draft' | 'refunded' | 'authorized'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SettlementRecord | null>(null);

  // Download simulation helpers
  const handleDownloadXml = (record: SettlementRecord) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<HDon xmlns="http://kekhaithue.gdt.gov.vn/TNCN/2024">
  <TTChung>
    <PBan>2.1.0</PBan>
    <THdon>Tờ khai quyết toán thuế thu nhập cá nhân 02/QTT-TNCN</THdon>
    <KyKKhai>Năm ${record.year}</KyKKhai>
    <MaHSo>${record.declarationCode}</MaHSo>
    <MST>8492019381</MST>
    <TenNNT>Nguyễn Hoàng Nam</TenNNT>
    <CQTTiepNhan>${record.taxOffice}</CQTTiepNhan>
  </TTChung>
  <NDung>
    <TongThuNhapChiuThue>${record.totalTaxableIncome}</TongThuNhapChiuThue>
    <ThueDaKhauTru>${record.taxWithheld}</ThueDaKhauTru>
    <ThuePhatSinhThucTe>${record.actualTaxDue}</ThuePhatSinhThucTe>
    <SoThueDeNghiHoan>${record.refundAmount}</SoThueDeNghiHoan>
  </NDung>
</HDon>`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = record.xmlFileName || `to-khai-02-QTT-${record.year}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Đã tải thành công tệp XML Tờ khai quyết toán năm ${record.year}: ${record.xmlFileName}`);
  };

  const handleDownloadReceipt = (record: SettlementRecord) => {
    alert(`Đang tải Biên lai điện tử tiếp nhận & Thông báo chấp nhận hồ sơ quyết toán năm ${record.year} từ Tổng cục Thuế (PDF)...`);
  };

  const filteredRecords = mockSettlementRecords.filter(item => {
    if (filter === 'draft' && item.status !== 'draft') return false;
    if (filter === 'refunded' && item.status !== 'completed_refunded') return false;
    if (filter === 'authorized' && item.status !== 'authorized_company') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.year.toString().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.declarationCode.toLowerCase().includes(q) ||
        item.taxOffice.toLowerCase().includes(q) ||
        (item.companyName && item.companyName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleBackToDashboard = () => {
    if (onNavigate) onNavigate('dashboard');
    else if (onNavigateToDashboard) onNavigateToDashboard();
  };

  const handleContinueSettlement = () => {
    if (onNavigate) onNavigate('wizard_step2');
    else if (onNavigateToWizard2) onNavigateToWizard2();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="text-slate-500 hover:text-[#046a4e] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Bảng điều khiển</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-bold">Lịch sử quyết toán các năm</span>
        </div>

        <button
          type="button"
          onClick={handleBackToDashboard}
          className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          ← Quay lại Dashboard
        </button>
      </div>

          {/* Top Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-700/60 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  <span>Sổ cái Quyết toán Thuế TNCN (2022 - 2024)</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Lịch Sử Quyết Toán & Tiến Trình Hoàn Thuế
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Theo dõi trạng thái tiếp nhận tờ khai 02/QTT, kết quả rà soát hồ sơ, lệnh chuyển tiền hoàn thuế từ Kho bạc Nhà nước và lưu trữ chứng từ pháp lý qua từng năm tài chính.
                </p>
              </div>

              {/* Quick Stat Pill */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[240px] space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Tổng tiền đã hoàn lũy kế:</span>
                  <span className="text-emerald-400 font-bold">100% Đã nhận</span>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  +6.200.000 đ
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã giải ngân qua Vietcombank</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#046a4e] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Kỳ tính thuế theo dõi</span>
                  <strong className="text-base font-extrabold text-slate-900">3 Năm (2022 - 2024)</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Hồ sơ đang mở</span>
                  <strong className="text-base font-extrabold text-slate-900">Kỳ 2024 (Đang soạn)</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Dự kiến hoàn năm 2024</span>
                  <strong className="text-base font-extrabold text-emerald-600">+18.450.000 đ</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Tuân thủ pháp lý</span>
                  <strong className="text-base font-extrabold text-blue-700">100% An toàn CQT</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#046a4e] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả các năm (3)
              </button>
              <button
                type="button"
                onClick={() => setFilter('draft')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filter === 'draft'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đang soạn thảo (1)
              </button>
              <button
                type="button"
                onClick={() => setFilter('refunded')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filter === 'refunded'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đã hoàn thuế (1)
              </button>
              <button
                type="button"
                onClick={() => setFilter('authorized')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filter === 'authorized'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Ủy quyền DN (1)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm năm, mã tờ khai, cơ quan thuế..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-700"
              />
            </div>
          </div>

          {/* List of Settlement Records by Tax Year */}
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const isYear2024 = record.year === 2024;
              const isYear2023 = record.year === 2023;
              const isYear2022 = record.year === 2022;

              return (
                <div
                  key={record.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Row: Year, Title, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                        isYear2024 ? 'bg-amber-100 text-amber-800' : isYear2023 ? 'bg-emerald-100 text-[#046a4e]' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.year}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                            {record.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-600 font-semibold">
                            Mã hồ sơ: {record.declarationCode}
                          </span>
                          <span>•</span>
                          <span>{record.taxOffice}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 self-start sm:self-center shadow-2xs ${record.badgeBg} ${record.badgeText} ${record.badgeBorder}`}>
                      {isYear2024 && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                      {isYear2023 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {isYear2022 && <Building2 className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{record.statusBadge}</span>
                    </span>
                  </div>

                  {/* Middle Content 3-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50/70 rounded-xl p-4 border border-slate-200/70">
                    {/* Col 1: Financial Figures */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Số liệu quyết toán
                      </span>
                      <div className="flex justify-between text-slate-600">
                        <span>Tổng thu nhập chịu thuế:</span>
                        <strong className="text-slate-900 font-bold">
                          {new Intl.NumberFormat('vi-VN').format(record.totalTaxableIncome)} đ
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Thuế đã tạm khấu trừ:</span>
                        <span className="text-slate-800 font-semibold">
                          {new Intl.NumberFormat('vi-VN').format(record.taxWithheld)} đ
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Thuế thực tế phải nộp:</span>
                        <span className="text-slate-800 font-semibold">
                          {new Intl.NumberFormat('vi-VN').format(record.actualTaxDue)} đ
                        </span>
                      </div>
                    </div>

                    {/* Col 2: Settlement Status & Refund */}
                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Kết quả hoàn thuế / Nghĩa vụ
                      </span>
                      {record.refundAmount > 0 ? (
                        <div>
                          <div className="text-lg sm:text-xl font-black text-[#046a4e]">
                            +{new Intl.NumberFormat('vi-VN').format(record.refundAmount)} đ
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {isYear2023 ? 'Đã giải ngân về tài khoản ngân hàng' : 'Dự kiến được Kho Bạc hoàn trả'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-extrabold text-blue-800">
                            Cân bằng nghĩa vụ thuế (0 đ)
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Doanh nghiệp chi trả đã khấu trừ đủ 100%
                          </span>
                        </div>
                      )}

                      {record.bankAccount && (
                        <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{record.bankAccount}</span>
                        </div>
                      )}
                    </div>

                    {/* Col 3: Submission Info & Organization */}
                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Đơn vị chi trả & Pháp lý
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {record.companyName}
                      </p>
                      {record.submissionDate && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          Thời gian: {record.submissionDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description note */}
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{record.summaryNote}</span>
                  </div>

                  {/* Bottom Actions Row tailored per year */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Action 1: Year 2024 -> Tiếp tục quyết toán */}
                    {isYear2024 && (
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleContinueSettlement}
                          className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <span>Tiếp tục quyết toán</span>
                          <ArrowRight className="w-4 h-4 text-emerald-200" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Xem tiến trình</span>
                        </button>
                      </div>
                    )}

                    {/* Action 2: Year 2023 -> Tải lại XML & Tải biên lai CQT */}
                    {isYear2023 && (
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleDownloadXml(record)}
                          className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Tải lại tờ khai XML</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(record)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tải biên lai CQT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="text-xs text-slate-600 hover:text-[#046a4e] font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Chi tiết hồ sơ</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    )}

                    {/* Action 3: Year 2022 -> Giấy xác nhận ủy quyền */}
                    {isYear2022 && (
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => alert('Đang tải Giấy xác nhận đã hoàn thành quyết toán thuế năm 2022 do Công ty FPT phát hành...')}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tải giấy xác nhận ủy quyền (Mẫu 08)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="text-xs text-slate-600 hover:text-[#046a4e] font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Xem chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    )}

                    <span className="text-[11px] text-slate-400 italic font-normal">
                      Lưu trữ chuẩn eTax & Cổng Thuế điện tử
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

      {/* Detail Modal for a specific year */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#046a4e] font-extrabold flex items-center justify-center text-xs">
                  {selectedRecord.year}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Chi tiết tiến trình Kỳ quyết toán {selectedRecord.year}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedRecord.declarationCode}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline steps */}
            <div className="space-y-3 py-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nhật ký xử lý hồ sơ:
              </h4>
              <div className="space-y-2.5">
                {selectedRecord.stepsTimeline.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={`font-medium ${step.done ? 'text-slate-800' : 'text-slate-500'}`}>
                        {step.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {step.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              {selectedRecord.year === 2024 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(null);
                    handleContinueSettlement();
                  }}
                  className="bg-[#046a4e] hover:bg-[#03543e] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Mở tờ khai 2024 →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadXml(selectedRecord);
                  }}
                  className="bg-[#046a4e] hover:bg-[#03543e] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Tải XML</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
