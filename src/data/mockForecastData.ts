export interface UserProfile {
  name: string;
  mst: string;
  plan: string;
  etaxStatus: string;
  avatarUrl: string;
}

export interface ForecastSummary {
  taxYear: number;
  taxPeriod: string;
  verificationBadge: string;
  progressMonth: number;
  progressPercent: number;
  syncNote: string;
  
  // Forecast Results
  estimatedRefund: number;
  refundEligibilityNote: string;
  lastUpdated: string;
  
  // Breakdown
  totalTaxWithheld: number;
  totalIncomeRecorded: number;
  realTaxPayable: number;
  personalDeductionNote: string;
  sourcesCount: number;
}

export interface IncomeStreamItem {
  id: string;
  companyName: string;
  shortCode: string;
  codeBgColor: string;
  codeTextColor: string;
  contractType: string;
  refCode: string; // e.g. "MST: 0108929101" or "Hợp đồng dịch vụ số #928"
  
  // Stats
  primaryStatLabel: string;
  primaryStatValue: number;
  
  secondaryStatLabel: string;
  secondaryStatValue: number;
  
  tertiaryStatLabel: string;
  tertiaryStatValue: string | number;
  
  // Badges & Status
  statusBadge: {
    text: string;
    type: 'success' | 'warning' | 'info';
  };
  
  actionType: 'view_xml' | 'upload_required' | 'locked';
  actionLabel: string;
  
  isWarning?: boolean;
}

export interface RiskAlert {
  title: string;
  level: string;
  detectedIssue: string;
  legalNotice: string;
  consequences: string;
  actionText: string;
}

export interface AiPrompt {
  id: string;
  question: string;
  answerPreview: string;
}

export interface TrustBadge {
  id: string;
  title: string;
  description: string;
  iconType: 'shield' | 'zap' | 'headset';
}

export const mockForecastUser: UserProfile = {
  name: "Nguyễn Hoàng Nam",
  mst: "8492019381",
  plan: "Gói Freelancer",
  etaxStatus: "eTax OK",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80"
};

export const mockForecastSummary: ForecastSummary = {
  taxYear: 2026,
  taxPeriod: "Kỳ quyết toán 2024 - 2025",
  verificationBadge: "Kho Bạc Nhà Nước Xác Thực",
  progressMonth: 10,
  progressPercent: 83,
  syncNote: "Dữ liệu được đồng bộ hóa từ chứng từ thuế điện tử e-Chungtu và hệ thống Tổng cục Thuế",
  
  estimatedRefund: 3250000,
  refundEligibilityNote: "Đủ điều kiện hoàn thuế tự động vào tài khoản ngân hàng",
  lastUpdated: "Cập nhật lúc 09:42 hôm nay",
  
  totalTaxWithheld: 24500000,
  totalIncomeRecorded: 280000000,
  realTaxPayable: 21250000,
  personalDeductionNote: "(i) Đã tính trừ 132.000.000đ giảm trừ gia cảnh bản thân (11tr/tháng)",
  sourcesCount: 3
};

export const mockIncomeStreams: IncomeStreamItem[] = [
  {
    id: "INC-ABC",
    companyName: "Công ty Cổ phần Công nghệ ABC",
    shortCode: "ABC",
    codeBgColor: "bg-blue-50 text-blue-700 border-blue-200",
    codeTextColor: "text-blue-700",
    contractType: "Hợp đồng lao động (> 3 tháng)",
    refCode: "MST: 0108929101",
    primaryStatLabel: "Tổng thu nhập",
    primaryStatValue: 220000000,
    secondaryStatLabel: "Thuế đã tạm khấu trừ",
    secondaryStatValue: 18000000,
    tertiaryStatLabel: "Bảo hiểm bắt buộc",
    tertiaryStatValue: 23100000,
    statusBadge: {
      text: "Đã có chứng từ điện tử (e-Chungtu)",
      type: "success"
    },
    actionType: "view_xml",
    actionLabel: "Xem file XML",
    isWarning: false
  },
  {
    id: "INC-FREELANCE",
    companyName: "Dự án Freelance UI/UX (Công ty VinaDesign)",
    shortCode: "🎨",
    codeBgColor: "bg-amber-50 text-amber-700 border-amber-200",
    codeTextColor: "text-amber-700",
    contractType: "Vãng lai (Khấu trừ tại nguồn 10%)",
    refCode: "Hợp đồng dịch vụ số #928",
    primaryStatLabel: "Thu nhập thực nhận",
    primaryStatValue: 45000000,
    secondaryStatLabel: "Khấu trừ 10% tại nguồn",
    secondaryStatValue: 4500000,
    tertiaryStatLabel: "Thời gian thanh toán",
    tertiaryStatValue: "15/08/2024",
    statusBadge: {
      text: "Cần tải chứng từ bổ sung",
      type: "warning"
    },
    actionType: "upload_required",
    actionLabel: "Tải lên chứng từ",
    isWarning: true
  },
  {
    id: "INC-VPB",
    companyName: "Đầu tư cổ tức VPBank",
    shortCode: "VPB",
    codeBgColor: "bg-purple-50 text-purple-700 border-purple-200",
    codeTextColor: "text-purple-700",
    contractType: "Đầu tư vốn (Thuế toàn phần 5%)",
    refCode: "Tài khoản lưu ký: 005C82910",
    primaryStatLabel: "Cổ tức tiền mặt",
    primaryStatValue: 15000000,
    secondaryStatLabel: "Thuế 5% toàn phần",
    secondaryStatValue: 2000000,
    tertiaryStatLabel: "Phân loại quyết toán",
    tertiaryStatValue: "Không gộp lũy tiến",
    statusBadge: {
      text: "Khấu trừ tự động qua CTCK",
      type: "info"
    },
    actionType: "locked",
    actionLabel: "Đã khóa sổ",
    isWarning: false
  }
];

export const mockRiskAlert: RiskAlert = {
  title: "1 RỦI RO CẦN KIỂM TRA",
  level: "Hệ thống phát hiện dấu hiệu bất thường",
  detectedIssue: "Trùng giảm trừ bản thân giữa 2 tổ chức chi trả",
  legalNotice: "Theo Thông tư 111/2013/TT-BTC & Thông tư 80/2021/TT-BTC: Người nộp thuế chỉ được đăng ký giảm trừ bản thân (11 triệu/tháng) tại 01 nơi duy nhất trong năm.",
  consequences: "Việc áp dụng cả 2 nơi sẽ dẫn đến truy thu kèm tiền phạt chậm nộp 0.05%/ngày.",
  actionText: "Khắc phục & Điều chỉnh ngay"
};

export const mockAiPrompts: AiPrompt[] = [
  {
    id: "ai-1",
    question: "Cách tính thuế lũy tiến 7 bậc?",
    answerPreview: "Thuế TNCN từ tiền lương áp dụng biểu thuế 7 bậc từ 5% đến 35% trên phần thu nhập tính thuế sau giảm trừ."
  },
  {
    id: "ai-2",
    question: "Hồ sơ đăng ký người phụ thuộc (4.4tr/tháng)?",
    answerPreview: "Cần mẫu 07/ĐK-NPT-TNCN, bản sao CCCD/giấy khai sinh và giấy tờ chứng minh quan hệ nuôi dưỡng hợp pháp."
  },
  {
    id: "ai-3",
    question: "Quy trình nhận tiền hoàn thuế qua eTax?",
    answerPreview: "Kho Bạc Nhà Nước sẽ giải ngân trực tiếp vào số tài khoản ngân hàng chính chủ đã kê khai trong tờ khai 02/QTT sau 3-6 ngày làm việc."
  }
];

export const mockTrustBadges: TrustBadge[] = [
  {
    id: "trust-1",
    title: "Bảo mật chuẩn ngân hàng",
    description: "Mã hóa 256-bit mọi dữ liệu thu nhập và chứng từ cá nhân.",
    iconType: "shield"
  },
  {
    id: "trust-2",
    title: "Xuất file XML eTax chuẩn 100%",
    description: "Tải tờ khai 02/QTT-TNCN tương thích hoàn toàn với Tổng cục Thuế.",
    iconType: "zap"
  },
  {
    id: "trust-3",
    title: "Bảo hành hồ sơ hoàn thuế",
    description: "Chuyên viên hỗ trợ giải trình với cán bộ thuế quận/huyện nếu có thắc mắc.",
    iconType: "headset"
  }
];

export const formatMoneyVND = (amount: number, showPrefix: boolean = false): string => {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(amount));
  if (showPrefix) {
    return amount >= 0 ? `+${formatted} VNĐ` : `-${formatted} VNĐ`;
  }
  return `${formatted} VNĐ`;
};
