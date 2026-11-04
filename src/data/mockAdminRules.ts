export type RiskLevel = 'error' | 'warning' | 'suggestion';

export interface AdminRule {
  id: string; // e.g. "R10"
  code: string;
  title: string;
  description: string;
  legalReference: string;
  riskLevel: RiskLevel;
  riskLevelLabel: string;
  isActive: boolean;
  category: 'deductions' | 'dependents' | 'routing' | 'incomes' | 'insurance' | 'authorization' | 'deadline' | 'reconciliation' | 'residence';
  executionFrequency: string; // e.g. "62% hồ sơ 2 nguồn"
  lastUpdated: string;
  updatedBy: string;
  conditionSnippet?: string;
  history?: {
    version: string;
    date: string;
    editor: string;
    note: string;
  }[];
}

export const initialAdminRules: AdminRule[] = [
  {
    id: 'R10',
    code: 'R10',
    title: 'Phát hiện trùng lặp giảm trừ bản thân giữa 2 tổ chức chi trả',
    description: 'Kiểm tra nếu cá nhân đăng ký giảm trừ bản thân tại >= 2 công ty trong cùng kỳ tính thuế.',
    legalReference: 'TT 111/2013',
    riskLevel: 'error',
    riskLevelLabel: 'Lỗi nghiêm trọng',
    isActive: true,
    category: 'deductions',
    executionFrequency: '62% hồ sơ 2 nguồn',
    lastUpdated: '15/01/2024',
    updatedBy: 'Admin Kỹ thuật (H.Nam)',
    conditionSnippet: 'count(companies.filter(c => c.personalDeductionApplied === true)) > 1',
    history: [
      { version: 'v2.4', date: '15/01/2024', editor: 'Admin Kỹ thuật', note: 'Chuẩn hóa căn cứ Điều 9 Thông tư 111/2013/TT-BTC' },
      { version: 'v2.1', date: '04/08/2023', editor: 'ThuTra Bot', note: 'Bổ sung cơ chế auto-reconcile giảm trừ về 01 tổ chức' }
    ]
  },
  {
    id: 'R01',
    code: 'R01',
    title: 'Kiểm tra định dạng và MST người phụ thuộc',
    description: 'Xác thực số định danh CCCD 12 số, ngày tháng năm sinh và MST cá nhân của NPT.',
    legalReference: 'TT 80/2021',
    riskLevel: 'warning',
    riskLevelLabel: 'Cảnh báo xung đột',
    isActive: true,
    category: 'dependents',
    executionFrequency: '48% hồ sơ có NPT',
    lastUpdated: '10/01/2024',
    updatedBy: 'Hệ thống (Auto)',
    conditionSnippet: '!dependent.mst || !/^[0-9]{12}$/.test(dependent.cccd)',
    history: [
      { version: 'v2.4', date: '10/01/2024', editor: 'Hệ thống (Auto)', note: 'Đồng bộ định dạng 12 số CCCD theo Đề án 06' }
    ]
  },
  {
    id: 'R04',
    code: 'R04',
    title: 'Tự động xác định CQT quyết toán theo nơi làm việc tháng 12',
    description: 'Áp dụng Điều 45 TT 80/2021 để định tuyến cơ quan thuế nộp tờ khai chuẩn xác.',
    legalReference: 'Điều 45 TT 80/2021',
    riskLevel: 'suggestion',
    riskLevelLabel: 'Gợi ý tối ưu',
    isActive: true,
    category: 'routing',
    executionFrequency: '100% hồ sơ',
    lastUpdated: '02/01/2024',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'routeTaxOffice(lastEmployerMonth12, permanentAddress)',
    history: [
      { version: 'v2.4', date: '02/01/2024', editor: 'Admin Kỹ thuật', note: 'Tự động mapping mã CQT 79119 Bình Thạnh' }
    ]
  },
  {
    id: 'R08',
    code: 'R08',
    title: 'Đối soát thu nhập vãng lai 10% với chứng từ điện tử e-Chungtu',
    description: 'So sánh mã số chứng từ khấu trừ thuế TNCN điện tử theo chuẩn Nghị định 123.',
    legalReference: 'NĐ 123/2020',
    riskLevel: 'error',
    riskLevelLabel: 'Lỗi nghiêm trọng',
    isActive: true,
    category: 'incomes',
    executionFrequency: '35% hồ sơ vãng lai',
    lastUpdated: '20/12/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'verifyWithholdingDoc(docNumber, serialNumber, signerCert)',
    history: [
      { version: 'v2.3', date: '20/12/2023', editor: 'Admin Kỹ thuật', note: 'Bổ sung kiểm tra chữ ký số token XML' }
    ]
  },
  {
    id: 'R12',
    code: 'R12',
    title: 'Cảnh báo vượt ngưỡng nộp phạt chậm quyết toán sau 02/05',
    description: 'Tự động tính số ngày quá hạn và tiền phạt chậm nộp 0.03%/ngày theo Luật Quản lý Thuế.',
    legalReference: 'Luật Quản lý Thuế',
    riskLevel: 'warning',
    riskLevelLabel: 'Cảnh báo xung đột',
    isActive: true,
    category: 'deadline',
    executionFrequency: '18% hồ sơ chậm nộp',
    lastUpdated: '12/01/2024',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'daysOverdue > 0 ? (taxOwed * 0.0003 * daysOverdue) : 0',
    history: [
      { version: 'v2.4', date: '12/01/2024', editor: 'Admin Kỹ thuật', note: 'Cập nhật lịch hạn chót 02/05/2025 cho cá nhân trực tiếp' }
    ]
  },
  {
    id: 'R02',
    code: 'R02',
    title: 'Kiểm tra tính trùng lặp người phụ thuộc giữa các cá nhân kê khai',
    description: 'Cùng một người phụ thuộc không được tính giảm trừ cho hai người nộp thuế trong cùng năm.',
    legalReference: 'TT 111/2013',
    riskLevel: 'error',
    riskLevelLabel: 'Lỗi nghiêm trọng',
    isActive: true,
    category: 'dependents',
    executionFrequency: '14% hồ sơ có NPT',
    lastUpdated: '05/01/2024',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'checkNationalDatabaseDuplicate(dependent.cccd, taxYear)',
    history: [
      { version: 'v2.4', date: '05/01/2024', editor: 'Admin Kỹ thuật', note: 'Bật kiểm tra chéo cổng Thuế Quốc gia' }
    ]
  },
  {
    id: 'R05',
    code: 'R05',
    title: 'Xác định tính hợp lệ của khoản đóng góp bảo hiểm bắt buộc',
    description: 'Kiểm tra ở trần đóng BHXH, BHYT, BHTN theo mức lương cơ sở quy định tại thời điểm quyết toán.',
    legalReference: 'Luật BHXH 2014',
    riskLevel: 'suggestion',
    riskLevelLabel: 'Gợi ý tối ưu',
    isActive: true,
    category: 'insurance',
    executionFrequency: '95% hồ sơ có HĐLĐ',
    lastUpdated: '18/12/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'insuranceBase = Math.min(salary, baseSalary * 20)',
    history: [
      { version: 'v2.3', date: '18/12/2023', editor: 'Admin Kỹ thuật', note: 'Cập nhật mức lương cơ sở mới' }
    ]
  },
  {
    id: 'R06',
    code: 'R06',
    title: 'Kiểm tra điều kiện ủy quyền quyết toán thay tại tổ chức duy nhất',
    description: 'Điều kiện cá nhân ký HĐLĐ từ 3 tháng trở lên và thực tế đang làm việc tại thời điểm ủy quyền.',
    legalReference: 'NĐ 126/2020',
    riskLevel: 'warning',
    riskLevelLabel: 'Cảnh báo xung đột',
    isActive: true,
    category: 'authorization',
    executionFrequency: '52% hồ sơ 1 nguồn',
    lastUpdated: '14/12/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'has3MonthContract && isWorkingAtAuthorizationTime && activeSourcesCount === 1',
    history: [
      { version: 'v2.2', date: '14/12/2023', editor: 'Admin Kỹ thuật', note: 'Kiểm tra mẫu 08/UQ-QTT-TNCN' }
    ]
  },
  {
    id: 'R03',
    code: 'R03',
    title: 'Kiểm tra ngưỡng thu nhập vãng lai được miễn khấu trừ 10%',
    description: 'Xác minh các khoản chi trả dưới 2.000.000 VNĐ/lần không bị khấu trừ tại nguồn.',
    legalReference: 'TT 111/2013',
    riskLevel: 'suggestion',
    riskLevelLabel: 'Gợi ý tối ưu',
    isActive: true,
    category: 'incomes',
    executionFrequency: '22% hồ sơ',
    lastUpdated: '01/12/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'paymentAmount < 2000000 && withholdingRate === 0'
  },
  {
    id: 'R07',
    code: 'R07',
    title: 'Rà soát chứng từ đóng góp từ thiện, nhân đạo hợp pháp',
    description: 'Khoản đóng góp vào quỹ từ thiện, khuyến học được thành lập hợp pháp được trừ trước thuế.',
    legalReference: 'TT 111/2013',
    riskLevel: 'suggestion',
    riskLevelLabel: 'Gợi ý tối ưu',
    isActive: true,
    category: 'deductions',
    executionFrequency: '8% hồ sơ',
    lastUpdated: '28/11/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'charityFund.isLicensed && charityReceipt.isValid'
  },
  {
    id: 'R09',
    code: 'R09',
    title: 'Đối soát chênh lệch thu nhập chịu thuế giữa Form 02/QTT và e-Chungtu',
    description: 'Kiểm tra độ khớp số liệu tổng thu nhập chịu thuế kê khai so với tổng tiền trên chứng từ điện tử.',
    legalReference: 'TT 80/2021',
    riskLevel: 'error',
    riskLevelLabel: 'Lỗi nghiêm trọng',
    isActive: true,
    category: 'reconciliation',
    executionFrequency: '74% hồ sơ',
    lastUpdated: '08/01/2024',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'Math.abs(form02Total - eChungtuSum) < 1000'
  },
  {
    id: 'R11',
    code: 'R11',
    title: 'Xác thực tình trạng cư trú thuế (>= 183 ngày hoặc nơi ở thường xuyên)',
    description: 'Áp dụng công thức tính thuế cho cá nhân cư trú (biểu lũy tiến) hoặc không cư trú (thuế suất 20%).',
    legalReference: 'TT 111/2013',
    riskLevel: 'warning',
    riskLevelLabel: 'Cảnh báo xung đột',
    isActive: true,
    category: 'residence',
    executionFrequency: '12% hồ sơ có yếu tố nước ngoài',
    lastUpdated: '19/11/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'stayDays >= 183 || hasPermanentResidence === true'
  },
  {
    id: 'R13',
    code: 'R13',
    title: 'Kiểm tra giới hạn trần đóng quỹ hưu trí tự nguyện (1.000.000 đ/tháng)',
    description: 'Khoản đóng quỹ hưu trí tự nguyện được giảm trừ tối đa không quá 12 triệu đồng/năm.',
    legalReference: 'NĐ 12/2015',
    riskLevel: 'suggestion',
    riskLevelLabel: 'Gợi ý tối ưu',
    isActive: true,
    category: 'deductions',
    executionFrequency: '11% hồ sơ',
    lastUpdated: '05/11/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'voluntaryPensionDeduction = Math.min(actualPaid, 12000000)'
  },
  {
    id: 'R14',
    code: 'R14',
    title: 'Miễn nghĩa vụ nộp thuế quyết toán khi phát sinh thêm từ 50.000 VNĐ trở xuống',
    description: 'Cá nhân có số thuế phát sinh phải nộp thêm sau quyết toán từ 50.000 đ trở xuống được miễn nộp.',
    legalReference: 'NĐ 126/2020',
    riskLevel: 'suggestion',
    riskLevelLabel: 'Gợi ý tối ưu',
    isActive: true,
    category: 'incomes',
    executionFrequency: '19% hồ sơ',
    lastUpdated: '12/10/2023',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'taxOwedAfterFinalization <= 50000 && taxOwedAfterFinalization > 0'
  },
  {
    id: 'R15',
    code: 'R15',
    title: 'Kiểm tra tính đồng bộ tài khoản Định danh điện tử VNeID và eTax Mobile',
    description: 'Xác thực tài khoản VNeID mức 2 đã liên kết chính chủ với MST phục vụ nộp thuế điện tử.',
    legalReference: 'NĐ 59/2022',
    riskLevel: 'warning',
    riskLevelLabel: 'Cảnh báo xung đột',
    isActive: true,
    category: 'authorization',
    executionFrequency: '88% hồ sơ nộp trực tuyến',
    lastUpdated: '22/01/2024',
    updatedBy: 'Admin Kỹ thuật',
    conditionSnippet: 'vneidLevel === 2 && vneidMstLinked === true'
  }
];

export interface TaxParametersConfig {
  personalDeductionMonthly: number; // 11,000,000
  personalDeductionYearly: number; // 132,000,000
  dependentDeductionMonthly: number; // 4,400,000
  dependentDeductionYearly: number; // 52,800,000
  baseSalary: number; // 2,340,000 (from 01/07/2024)
  maxInsuranceMultiplier: number; // 20
  regionalMinWageZone1: number; // 4,960,000
  socialInsuranceRate: number; // 8%
  healthInsuranceRate: number; // 1.5%
  unemploymentInsuranceRate: number; // 1%
  withholdingFlatRate: number; // 10%
  withholdingThreshold: number; // 2,000,000
  exemptionThreshold: number; // 50,000
}

export const defaultTaxParameters: TaxParametersConfig = {
  personalDeductionMonthly: 11000000,
  personalDeductionYearly: 132000000,
  dependentDeductionMonthly: 4400000,
  dependentDeductionYearly: 52800000,
  baseSalary: 2340000,
  maxInsuranceMultiplier: 20,
  regionalMinWageZone1: 4960000,
  socialInsuranceRate: 8.0,
  healthInsuranceRate: 1.5,
  unemploymentInsuranceRate: 1.0,
  withholdingFlatRate: 10.0,
  withholdingThreshold: 2000000,
  exemptionThreshold: 50000
};

export interface ProgressiveBracket {
  bracket: number;
  monthlyRange: string;
  yearlyRange: string;
  rate: number;
  quickCalcFormula: string;
}

export const progressiveTaxBrackets: ProgressiveBracket[] = [
  { bracket: 1, monthlyRange: 'Đến 5 triệu VNĐ', yearlyRange: 'Đến 60 triệu VNĐ', rate: 5, quickCalcFormula: 'TNTT x 5%' },
  { bracket: 2, monthlyRange: 'Trên 5 - 10 triệu VNĐ', yearlyRange: 'Trên 60 - 120 triệu VNĐ', rate: 10, quickCalcFormula: 'TNTT x 10% - 0.25 trđ' },
  { bracket: 3, monthlyRange: 'Trên 10 - 18 triệu VNĐ', yearlyRange: 'Trên 120 - 216 triệu VNĐ', rate: 15, quickCalcFormula: 'TNTT x 15% - 0.75 trđ' },
  { bracket: 4, monthlyRange: 'Trên 18 - 32 triệu VNĐ', yearlyRange: 'Trên 216 - 384 triệu VNĐ', rate: 20, quickCalcFormula: 'TNTT x 20% - 1.65 trđ' },
  { bracket: 5, monthlyRange: 'Trên 32 - 52 triệu VNĐ', yearlyRange: 'Trên 384 - 624 triệu VNĐ', rate: 25, quickCalcFormula: 'TNTT x 25% - 3.25 trđ' },
  { bracket: 6, monthlyRange: 'Trên 52 - 80 triệu VNĐ', yearlyRange: 'Trên 624 - 960 triệu VNĐ', rate: 30, quickCalcFormula: 'TNTT x 30% - 5.85 trđ' },
  { bracket: 7, monthlyRange: 'Trên 80 triệu VNĐ', yearlyRange: 'Trên 960 triệu VNĐ', rate: 35, quickCalcFormula: 'TNTT x 35% - 9.85 trđ' }
];

export interface RagDocument {
  id: string;
  code: string;
  title: string;
  category: string;
  chunksCount: number;
  vectorStatus: 'Ready' | 'Syncing' | 'Outdated';
  lastEmbeddedDate: string;
  cosineSimilarityAvg: number;
}

export const mockRagDocuments: RagDocument[] = [
  {
    id: 'doc-tt111',
    code: 'TT 111/2013/TT-BTC',
    title: 'Hướng dẫn thực hiện Luật Thuế thu nhập cá nhân & các Nghị định quy định chi tiết',
    category: 'Thông tư Bộ Tài Chính',
    chunksCount: 56,
    vectorStatus: 'Ready',
    lastEmbeddedDate: '15/01/2024',
    cosineSimilarityAvg: 0.962
  },
  {
    id: 'doc-tt80',
    code: 'TT 80/2021/TT-BTC',
    title: 'Hướng dẫn thi hành một số điều của Luật Quản lý Thuế & Nghị định 126/2020/NĐ-CP',
    category: 'Thông tư Bộ Tài Chính',
    chunksCount: 42,
    vectorStatus: 'Ready',
    lastEmbeddedDate: '15/01/2024',
    cosineSimilarityAvg: 0.941
  },
  {
    id: 'doc-nd126',
    code: 'NĐ 126/2020/NĐ-CP',
    title: 'Quy định chi tiết một số điều của Luật Quản lý Thuế về khai thuế, nộp thuế, quyết toán',
    category: 'Nghị định Chính phủ',
    chunksCount: 24,
    vectorStatus: 'Ready',
    lastEmbeddedDate: '12/01/2024',
    cosineSimilarityAvg: 0.915
  },
  {
    id: 'doc-nd123',
    code: 'NĐ 123/2020/NĐ-CP',
    title: 'Quy định về hóa đơn, chứng từ khấu trừ thuế TNCN điện tử',
    category: 'Nghị định Chính phủ',
    chunksCount: 16,
    vectorStatus: 'Ready',
    lastEmbeddedDate: '08/01/2024',
    cosineSimilarityAvg: 0.887
  },
  {
    id: 'doc-nd13',
    code: 'NĐ 13/2023/NĐ-CP',
    title: 'Nghị định về Bảo vệ dữ liệu cá nhân (Personal Data Protection) & Data Minimization',
    category: 'Nghị định Chính phủ',
    chunksCount: 10,
    vectorStatus: 'Ready',
    lastEmbeddedDate: '20/01/2024',
    cosineSimilarityAvg: 0.953
  }
];

export interface MaskedAuditLog {
  id: string;
  timestamp: string;
  operator: string;
  purpose: string;
  maskedCccd: string;
  maskedMst: string;
  triggeredRules: string[];
  minimizationStatus: 'Tuân thủ 100%' | 'Đã Masking';
  retentionExpires: string;
}

export const mockMaskedAuditLogs: MaskedAuditLog[] = [
  {
    id: 'LOG-2024-9842',
    timestamp: '17/10/2024 20:42:15',
    operator: 'RuleEngine_Daemon_Worker_01',
    purpose: 'Thẩm tra tự động điều kiện giảm trừ gia cảnh (Điều 9 NĐ 13/2023)',
    maskedCccd: '079******492',
    maskedMst: '849*****81',
    triggeredRules: ['R10', 'R01'],
    minimizationStatus: 'Tuân thủ 100%',
    retentionExpires: '16/11/2024 (30 ngày)'
  },
  {
    id: 'LOG-2024-9841',
    timestamp: '17/10/2024 20:30:08',
    operator: 'RuleEngine_Daemon_Worker_02',
    purpose: 'Định tuyến Chi cục Thuế nộp tờ khai 02/QTT theo Điều 45 TT 80',
    maskedCccd: '024******118',
    maskedMst: '010*****39',
    triggeredRules: ['R04'],
    minimizationStatus: 'Tuân thủ 100%',
    retentionExpires: '16/11/2024 (30 ngày)'
  },
  {
    id: 'LOG-2024-9840',
    timestamp: '17/10/2024 19:55:40',
    operator: 'RuleEngine_Daemon_Worker_01',
    purpose: 'Đối soát chứng từ khấu trừ 10% e-Chungtu Nghị định 123',
    maskedCccd: '048******762',
    maskedMst: '852*****04',
    triggeredRules: ['R08', 'R09'],
    minimizationStatus: 'Tuân thủ 100%',
    retentionExpires: '16/11/2024 (30 ngày)'
  },
  {
    id: 'LOG-2024-9839',
    timestamp: '17/10/2024 18:22:19',
    operator: 'Admin_Audit_Inspector',
    purpose: 'Kiểm toán bảo mật Data Minimization theo định kỳ tuần',
    maskedCccd: '001******931',
    maskedMst: '031*****72',
    triggeredRules: ['R02', 'R06'],
    minimizationStatus: 'Tuân thủ 100%',
    retentionExpires: '16/11/2024 (30 ngày)'
  }
];
