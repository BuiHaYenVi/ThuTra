export interface RuleWarning {
  id: string;
  code: string;
  level: 'high_risk' | 'warning' | 'info';
  levelBadgeText: string;
  title: string;
  description: string;
  comparisonText?: {
    before: string;
    after: string;
  };
  legalReference?: string;
  actionText?: string;
  resolved: boolean;
}

export interface TaxOptimizationScenario {
  initial: {
    badge: string;
    amountText: string;
    note: string;
  };
  optimized: {
    badge: string;
    amountText: string;
    note: string;
  };
  totalBenefitText: string;
  benefitAmount: number;
  aiAdvice: string;
}

export interface SettlementSummaryStats {
  totalTaxableIncome: number;
  personalDeduction: number;
  dependentsDeduction: number;
  insuranceDeduction: number;
  taxableIncomeTNTT: number;
  taxPayable: number;
  taxWithheld: number;
  refundAmount: number;
  appliedBracket: string;
  bracketDescription: string;
}

export interface TaxAuthorityInfo {
  code: string;
  name: string;
  legalBasis: string;
  etaxPortalStatus: string;
}

export interface SettlementResultData {
  taxYear: number;
  periodText: string;
  userMST: string;
  userName: string;
  avatarText: string;
  rulesScannedCount: number;
  rulesTotalCount: number;
  authority: TaxAuthorityInfo;
  summary: SettlementSummaryStats;
  warnings: RuleWarning[];
  optimization: TaxOptimizationScenario;
}

export const mockSettlementResultData: SettlementResultData = {
  taxYear: 2026,
  periodText: "2024 - 2025",
  userMST: "8492019381",
  userName: "Nguyễn Hoàng Nam",
  avatarText: "H. Nam",
  rulesScannedCount: 15,
  rulesTotalCount: 15,
  authority: {
    code: "79119",
    name: "Chi cục Thuế Quận Bình Thạnh, TP.HCM",
    legalBasis: "Tự động xác định theo quy định tại Điều 45 Thông tư 80/2021/TT-BTC dựa trên tổ chức chi trả thu nhập cuối cùng trong năm.",
    etaxPortalStatus: "Cổng eTax TP.HCM: Sẵn sàng"
  },
  summary: {
    totalTaxableIncome: 324000000,
    personalDeduction: -132000000,
    dependentsDeduction: -52800000,
    insuranceDeduction: -25920000,
    taxableIncomeTNTT: 113280000,
    taxPayable: 19500000,
    taxWithheld: 24350000,
    refundAmount: 4850000,
    appliedBracket: "Bậc 2 (10%)",
    bracketDescription: "Thu nhập cao nhất rơi vào bậc 2: 5 - 10 triệu đồng/tháng."
  },
  warnings: [
    {
      id: "R10",
      code: "Rule R10",
      level: "high_risk",
      levelBadgeText: "RỦI RO CAO - ĐÃ TỰ ĐỘNG HIỆU CHỈNH",
      title: "Phát hiện trùng lặp giảm trừ gia cảnh bản thân (Rule R10)",
      description: "Cả 2 công ty (Công ty CP Công nghệ ABC và HĐ Tư vấn) đều đang tính giảm trừ 11 triệu/tháng cho bạn trong tháng 5 và tháng 6. ThuTra đã tự động hiệu chỉnh lại mức giảm trừ về đúng 01 nơi duy nhất để bạn không bị cơ quan thuế truy thu phạt 0.05%/ngày.",
      comparisonText: {
        before: "14 tháng x 11.000.000đ",
        after: "Chuẩn 12 tháng x 11.000.000đ = 132.000.000đ"
      },
      resolved: true
    },
    {
      id: "R01",
      code: "Rule R01",
      level: "warning",
      levelBadgeText: "CẦN BỔ SUNG TRƯỚC KHI NỘP",
      title: "Chưa bổ sung Mã số thuế của người phụ thuộc (Rule R01)",
      description: "Người phụ thuộc (Mẹ đẻ - CCCD 0192837482) chưa được điền MST cá nhân. Cần bổ sung ngay để hồ sơ không bị Cục Thuế từ chối và giữ nguyên mức giảm trừ 52.800.000 VNĐ.",
      legalReference: "Quy định: Điểm c Khoản 1 Điều 9 Thông tư 111/2013/TT-BTC.",
      actionText: "Bổ sung ngay MST người phụ thuộc",
      resolved: false
    }
  ],
  optimization: {
    initial: {
      badge: "Cần nộp thêm",
      amountText: "Nộp thêm 1.200.000 VNĐ",
      note: "Chưa khai báo giảm trừ mẹ đẻ hết độ tuổi lao động."
    },
    optimized: {
      badge: "Được hoàn tiền",
      amountText: "Hoàn lại +3.650.000 VNĐ",
      note: "Đã tính hợp lệ giảm trừ gia cảnh người phụ thuộc trọn 12 tháng."
    },
    totalBenefitText: "Tiết kiệm và mang lại thêm: 4.850.000 VNĐ",
    benefitAmount: 4850000,
    aiAdvice: "Đăng ký bổ sung mẹ đẻ (ngoài độ tuổi lao động, không có lương hưu) làm Người phụ thuộc hợp pháp tính từ tháng 1/2026 sẽ giúp bạn chuyển từ diện phải nộp thêm tiền sang được nhận tiền hoàn thuế từ Kho Bạc."
  }
};

export const formatVndMoney = (val: number, showSign: boolean = false): string => {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(val));
  if (showSign) {
    return val > 0 ? `+${formatted} VNĐ` : `-${formatted} VNĐ`;
  }
  return `${formatted} đ`;
};
