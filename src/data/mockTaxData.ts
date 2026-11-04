export interface TaxUser {
  name: string;
  mst: string;
  taxDepartment: string;
  etaxStatus: string;
  avatarUrl: string;
}

export interface SettlementStep {
  stepNumber: number;
  badge: string;
  badgeType: 'completed' | 'in_progress' | 'pending';
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface IncomeSource {
  id: string;
  companyName: string;
  contractType: string;
  totalIncome: number;
  taxDeducted: number;
  documentStatus: 'verified' | 'pending_original' | 'unverified';
  documentCode?: string;
  issueDate?: string;
}

export interface TaxBracketDetail {
  bracket: number;
  range: string;
  rate: number;
  taxablePortion: number;
  taxAmount: number;
  status: 'active' | 'inactive';
}

export interface TaxSettlementData {
  taxYear: number;
  deadlineDate: string;
  daysRemaining: number;
  regulationCode: string;
  estimatedRefund: number;
  missingDocumentsCount: number;
  
  // KPI Metrics
  totalTaxableIncome: number;
  taxAlreadyDeducted: number;
  totalDeductions: number;
  
  // Deductions breakdown
  deductionsBreakdown: {
    personal: number;
    dependents: number;
    dependentsCount: number;
    insurance: number;
    charity: number;
  };

  // Stepper
  stepperSteps: SettlementStep[];

  // Income Sources
  incomeSources: IncomeSource[];

  // Progressive Tax Table (Biểu thuế lũy tiến)
  progressiveBrackets: TaxBracketDetail[];
}

export const mockTaxUser: TaxUser = {
  name: "Nguyễn Hoàng Nam",
  mst: "8492019381",
  taxDepartment: "Q.1 TP.HCM",
  etaxStatus: "eTax OK",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80"
};

export const mockTaxData: TaxSettlementData = {
  taxYear: 2024,
  deadlineDate: "02/05/2025",
  daysRemaining: 28,
  regulationCode: "Thông tư 80/2021/TT-BTC",
  estimatedRefund: 18450000,
  missingDocumentsCount: 1,

  totalTaxableIncome: 584200000,
  taxAlreadyDeducted: 76850000,
  totalDeductions: 223300000,

  deductionsBreakdown: {
    personal: 132000000, // 11tr x 12 tháng
    dependents: 52800000, // 4.4tr x 12 tháng (1 NPT: Mẹ ruột)
    dependentsCount: 1,
    insurance: 38500000, // BHXH, BHYT, BHTN
    charity: 0
  },

  stepperSteps: [
    {
      stepNumber: 1,
      badge: "Hoàn thành 3/3",
      badgeType: "completed",
      title: "Thu thập chứng từ khấu trừ",
      description: "Đã kết nối dữ liệu từ 2 công ty HĐLĐ và 1 hợp đồng vãng lai.",
      status: "completed"
    },
    {
      stepNumber: 2,
      badge: "Hợp lệ (1 NPT)",
      badgeType: "completed",
      title: "Khai báo người phụ thuộc",
      description: "Mẹ ruột nghỉ hưu (mã NPT: 0192837482) đã được CQT phê duyệt.",
      status: "completed"
    },
    {
      stepNumber: 3,
      badge: "Đang tối ưu",
      badgeType: "in_progress",
      title: "Rà soát biểu lũy tiến",
      description: "Kiểm tra mức giảm trừ thiện nguyện & đối soát tỷ lệ khấu trừ 10% vãng lai.",
      status: "in_progress"
    },
    {
      stepNumber: 4,
      badge: "Chờ nộp",
      badgeType: "pending",
      title: "Nộp tờ khai 02/QTT & eTax",
      description: "Ký số trực tiếp bằng eTax Mobile hoặc tải file XML nộp qua cổng DVC.",
      status: "pending"
    }
  ],

  incomeSources: [
    {
      id: "INC-01",
      companyName: "Công ty Cổ phần Công nghệ FPT",
      contractType: "HĐLĐ > 3 tháng (Toàn thời gian)",
      totalIncome: 420000000,
      taxDeducted: 58500000,
      documentStatus: "verified",
      documentCode: "CT-2024-FPT-09283",
      issueDate: "15/01/2025"
    },
    {
      id: "INC-02",
      companyName: "Công ty TNHH Shopee Việt Nam",
      contractType: "Hợp đồng tư vấn giải pháp (Vãng lai 10%)",
      totalIncome: 110000000,
      taxDeducted: 11000000,
      documentStatus: "verified",
      documentCode: "CT-2024-SPV-48192",
      issueDate: "20/01/2025"
    },
    {
      id: "INC-03",
      companyName: "Tổ hợp Giáo dục Topica (Edumall)",
      contractType: "Thù lao giảng dạy & cố vấn (Vãng lai 10%)",
      totalIncome: 54200000,
      taxDeducted: 7350000,
      documentStatus: "pending_original",
      documentCode: "Chưa có file XML",
      issueDate: "Chờ gửi bưu điện"
    }
  ],

  progressiveBrackets: [
    {
      bracket: 1,
      range: "Đến 60 triệu (≤ 5 tr/tháng)",
      rate: 5,
      taxablePortion: 60000000,
      taxAmount: 3000000,
      status: "active"
    },
    {
      bracket: 2,
      range: "Trên 60 đến 120 triệu (5 - 10 tr/tháng)",
      rate: 10,
      taxablePortion: 60000000,
      taxAmount: 6000000,
      status: "active"
    },
    {
      bracket: 3,
      range: "Trên 120 đến 216 triệu (10 - 18 tr/tháng)",
      rate: 15,
      taxablePortion: 96000000,
      taxAmount: 14400000,
      status: "active"
    },
    {
      bracket: 4,
      range: "Trên 216 đến 384 triệu (18 - 32 tr/tháng)",
      rate: 20,
      taxablePortion: 144900000, // 360.9tr - 216tr = 144.9tr
      taxAmount: 28980000, // 144.9tr * 20%
      status: "active"
    },
    {
      bracket: 5,
      range: "Trên 384 đến 624 triệu (32 - 52 tr/tháng)",
      rate: 25,
      taxablePortion: 0,
      taxAmount: 0,
      status: "inactive"
    },
    {
      bracket: 6,
      range: "Trên 624 đến 960 triệu (52 - 80 tr/tháng)",
      rate: 30,
      taxablePortion: 0,
      taxAmount: 0,
      status: "inactive"
    },
    {
      bracket: 7,
      range: "Trên 960 triệu (> 80 tr/tháng)",
      rate: 35,
      taxablePortion: 0,
      taxAmount: 0,
      status: "inactive"
    }
  ]
};

// Helper format VND currency
export const formatVND = (amount: number, showSign: boolean = false): string => {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(amount));
  if (showSign) {
    return amount > 0 ? `+${formatted} đ` : `-${formatted} đ`;
  }
  return `${formatted} đ`;
};
