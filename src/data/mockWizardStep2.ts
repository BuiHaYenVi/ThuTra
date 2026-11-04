export interface WizardStep {
  stepNumber: number;
  badge: string;
  badgeType: 'completed' | 'active' | 'pending';
  subBadge?: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'active' | 'pending';
}

export interface SalaryIncomeData {
  companyName: string;
  contractTypeBadge: string;
  eCertificateBadge: string;
  taxCode: string;
  taxAuthority: string;
  fileName: string;
  workingPeriod: string;
  totalTaxableIncome: number;
  taxWithheld: number;
  insuranceDeduction: number;
  applyPersonalDeduction: boolean;
}

export interface FreelanceIncomeData {
  contractTitle: string;
  categoryBadge: string;
  rateBadge: string;
  payerTaxCode: string;
  branch: string;
  paymentMonth: string;
  totalIncomeBeforeTax: number;
  taxWithheld10Percent: number;
  certificateRefNumber: string;
}

export interface RealtimeEstimateData {
  totalIncomeToDate: number;
  totalTaxWithheldToDate: number;
  personalDeduction: number;
  dependentsDeduction: number;
  insuranceDeduction: number;
  estimatedRefund: number;
  refundStatusText: string;
  lawNote: string;
}

export interface WizardStep2State {
  currentPeriod: string;
  userMST: string;
  userName: string;
  userInitials: string;
  scannedFileName: string;
  ocrConfidence: number;
  steps: WizardStep[];
  salaryIncome: SalaryIncomeData;
  freelanceIncome: FreelanceIncomeData;
  realtimeEstimate: RealtimeEstimateData;
}

export const initialWizardStep2Data: WizardStep2State = {
  currentPeriod: "2024 - 2026",
  userMST: "8492019381",
  userName: "Nguyễn Hoàng Nam",
  userInitials: "NH",
  scannedFileName: "Chung_tu_thue_ABC.pdf",
  ocrConfidence: 99,
  steps: [
    {
      stepNumber: 1,
      badge: "BƯỚC 1",
      badgeType: "completed",
      subBadge: "1 NPT hợp lệ",
      title: "Người phụ thuộc & Bản thân",
      subtitle: "• Đã xác thực CCCD",
      status: "completed"
    },
    {
      stepNumber: 2,
      badge: "BƯỚC 2 • ĐANG THỰC HIỆN",
      badgeType: "active",
      subBadge: "✨ Bóc tách số liệu",
      title: "Thu nhập & Chứng từ khấu trừ",
      subtitle: "Đã tải 2 chứng từ điện tử",
      status: "active"
    },
    {
      stepNumber: 3,
      badge: "BƯỚC 3",
      badgeType: "pending",
      title: "Kiểm tra lỗi & Xuất hồ sơ",
      subtitle: "Chạy Rule Engine & ký số XML",
      status: "pending"
    }
  ],
  salaryIncome: {
    companyName: "Công ty Cổ phần Công nghệ ABC",
    contractTypeBadge: "HĐLĐ > 3 tháng (Lũy tiến)",
    eCertificateBadge: "✨ e-Chungtu điện tử",
    taxCode: "0312345678",
    taxAuthority: "Cục Thuế TP. Hồ Chí Minh",
    fileName: "Chung_tu_thue_ABC.pdf",
    workingPeriod: "Từ 01/2026 đến 07/2026 (7 tháng)",
    totalTaxableIncome: 180000000,
    taxWithheld: 14200000,
    insuranceDeduction: 18900000,
    applyPersonalDeduction: true
  },
  freelanceIncome: {
    contractTitle: "Hợp đồng dịch vụ tư vấn (Freelance UI/UX)",
    categoryBadge: "Thu nhập vãng lai khấu trừ 10% tại nguồn",
    rateBadge: "Chứng từ 10%",
    payerTaxCode: "0109876543",
    branch: "Chi nhánh Hà Nội",
    paymentMonth: "Tháng 04/2026",
    totalIncomeBeforeTax: 50000000,
    taxWithheld10Percent: 5000000,
    certificateRefNumber: "CT04/2026/0912"
  },
  realtimeEstimate: {
    totalIncomeToDate: 230000000,
    totalTaxWithheldToDate: 19200000,
    personalDeduction: -132000000,
    dependentsDeduction: -52800000,
    insuranceDeduction: -18900000,
    estimatedRefund: 3250000,
    refundStatusText: "ĐƯỢC HOÀN THUẾ TỪ CỤC THUẾ",
    lawNote: "Lưu ý luật thuế: Bạn đã chọn đăng ký giảm trừ bản thân 11tr/tháng tại Công ty ABC. Hệ thống sẽ tự động gộp 50tr thu nhập vãng lai để tính thuế theo biểu lũy tiến từng phần thống nhất tại Bước 3."
  }
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('vi-VN').format(Math.abs(val));
};
