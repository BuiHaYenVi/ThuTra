export interface PromptChip {
  id: string;
  icon: string;
  label: string;
  query: string;
  fullResponse?: {
    title: string;
    badge: string;
    points: Array<{
      num: number;
      title: string;
      content: string;
    }>;
    conclusion?: string;
    legalReferences?: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  timestamp: string;
  text?: string;
  type?: 'greeting' | 'user' | 'legal_analysis';
  legalAnalysis?: {
    title: string;
    badge: string;
    points: Array<{
      num: number;
      title: string;
      content: string;
    }>;
    conclusion?: string;
    legalReferences?: string[];
  };
}

export interface SynchronizedTaxProfile {
  taxpayerName: string;
  mst: string;
  recordedIncome: number;
  estimatedRefund: number;
  withholdingDocsCount: number;
  taxAuthority: string;
  taxYear: string;
}

export interface LegalDocument {
  id: string;
  docType: 'THÔNG TƯ' | 'NGHỊ ĐỊNH' | 'NGHỊ QUYẾT' | 'LUẬT';
  docTypeBadgeColor: string;
  issuer: string;
  code: string;
  summary: string;
  fullTitle?: string;
  effectiveDate?: string;
}

export const mockSynchronizedProfile: SynchronizedTaxProfile = {
  taxpayerName: "Nguyễn Hoàng Nam",
  mst: "8492019381",
  recordedIncome: 280000000,
  estimatedRefund: 3250000,
  withholdingDocsCount: 2,
  taxAuthority: "Chi cục Thuế Quận Bình Thạnh (TP.HCM)",
  taxYear: "2024"
};

export const mockPromptChips: PromptChip[] = [
  {
    id: "chip-1",
    icon: "⚡",
    label: "Làm 2 công ty cùng lúc thì quyết toán ở đâu?",
    query: "Làm 2 công ty cùng lúc thì cuối năm quyết toán ở đâu?",
    fullResponse: {
      title: "Xác định Nơi Nộp Hồ sơ Quyết toán 2 Nơi",
      badge: "Điều 45 Thông tư 80/2021/TT-BTC",
      points: [
        {
          num: 1,
          title: "Trường hợp còn làm việc tại 1 trong 2 công ty tại thời điểm quyết toán:",
          content: "Bạn nộp hồ sơ quyết toán tại Chi cục Thuế quản lý trực tiếp tổ chức chi trả thu nhập mà bạn đang tính giảm trừ gia cảnh cho bản thân."
        },
        {
          num: 2,
          title: "Trường hợp đã nghỉ việc tại cả 2 công ty hoặc thay đổi nơi làm việc:",
          content: "Nộp hồ sơ quyết toán tại Chi cục Thuế nơi cá nhân cư trú (thường trú hoặc tạm trú đã đăng ký theo Luật Cư trú)."
        },
        {
          num: 3,
          title: "Trường hợp có 1 nguồn HĐLĐ dài hạn và 1 nguồn vãng lai (khấu trừ 10%):",
          content: "Địa điểm quyết toán là Chi cục Thuế quản lý cơ quan chi trả thu nhập có ký HĐLĐ trên 3 tháng (nơi tính giảm trừ bản thân 11 triệu/tháng)."
        }
      ],
      conclusion: "Hệ thống ThuTra đã tự động xác định cơ quan thụ lý của bạn là Chi cục Thuế Quận Bình Thạnh, TP.HCM dựa trên tổ chức chi trả cuối cùng.",
      legalReferences: ["Khoản 8 Điều 11 Nghị định 126/2020/NĐ-CP", "Điều 45 Thông tư 80/2021/TT-BTC"]
    }
  },
  {
    id: "chip-2",
    icon: "💼",
    label: "Thu nhập freelance dưới 100 triệu có phải nộp thuế không?",
    query: "Thu nhập freelance dưới 100 triệu có phải nộp thuế không?",
    fullResponse: {
      title: "Quy định Thuế TNCN Đối với Thu nhập Freelance",
      badge: "Thông tư 111/2013/TT-BTC & Thông tư 40/2021",
      points: [
        {
          num: 1,
          title: "Khấu trừ tại nguồn từng lần chi trả từ 2.000.000 đ:",
          content: "Đơn vị chi trả thu nhập có nghĩa vụ khấu trừ 10% thuế TNCN trước khi trả cho bạn theo Điểm i Khoản 1 Điều 25 Thông tư 111/2013/TT-BTC, bất kể tổng cả năm có vượt 100 triệu hay không."
        },
        {
          num: 2,
          title: "Trường hợp cá nhân kinh doanh / hộ kinh doanh:",
          content: "Nếu bạn đăng ký mã số thuế kinh doanh hộ/cá nhân, doanh thu từ 100 triệu đồng/năm trở xuống thuộc diện không phải nộp thuế GTGT và thuế TNCN."
        },
        {
          num: 3,
          title: "Quyết toán hoàn thuế cuối năm:",
          content: "Nếu cả năm tổng thu nhập sau khi trừ giảm trừ gia cảnh (132 triệu/năm) chưa đến mức phải nộp thuế bậc cao, bạn được làm thủ tục quyết toán để nhận hoàn lại toàn bộ số thuế 10% đã bị khấu trừ."
        }
      ],
      conclusion: "Bạn nên yêu cầu bên thuê cấp Chứng từ khấu trừ thuế TNCN điện tử để đối soát và nhận hoàn tiền.",
      legalReferences: ["Điều 25 Thông tư 111/2013/TT-BTC", "Thông tư 40/2021/TT-BTC"]
    }
  },
  {
    id: "chip-3",
    icon: "👨‍👩‍👧",
    label: "Cách đăng ký người phụ thuộc để được giảm trừ 4.4tr/tháng?",
    query: "Cách đăng ký người phụ thuộc để được giảm trừ 4.4tr/tháng?",
    fullResponse: {
      title: "Thủ tục Đăng ký Người Phụ Thuộc Hợp lệ",
      badge: "Mẫu 02TH & Nghị quyết 954/2020",
      points: [
        {
          num: 1,
          title: "Mức giảm trừ và đối tượng hợp lệ:",
          content: "Mức giảm trừ gia cảnh cho mỗi người phụ thuộc là 4.400.000 đ/tháng (52.800.000 đ/năm). Đối tượng bao gồm: con dưới 18 tuổi, con đang học ĐH không có thu nhập, cha mẹ ngoài độ tuổi lao động hoặc không có thu nhập (hoặc thu nhập bình quân tháng trong năm dưới 1 triệu đồng)."
        },
        {
          num: 2,
          title: "Hồ sơ chứng minh người phụ thuộc:",
          content: "Căn cước công dân của người phụ thuộc, Giấy khai sinh (chứng minh quan hệ), và Giấy xác nhận tình trạng thu nhập/cư trú đối với bố mẹ ngoài độ tuổi lao động."
        },
        {
          num: 3,
          title: "Đăng ký cấp MST người phụ thuộc:",
          content: "Nộp Mẫu 02TH qua công ty chi trả hoặc đăng ký trực tiếp trên Cổng dịch vụ công Thuế Điện Tử (thuedientu.gdt.gov.vn) hoặc app eTax Mobile."
        }
      ],
      conclusion: "Đăng ký sớm trong kỳ quyết toán sẽ giúp bạn tối ưu trực tiếp từ 4.400.000đ đến hơn 15.000.000đ tiền hoàn thuế.",
      legalReferences: ["Nghị quyết 954/2020/UBTVQH14", "Khoản 1 Điều 9 Thông tư 111/2013/TT-BTC"]
    }
  },
  {
    id: "chip-4",
    icon: "📄",
    label: "Công ty cũ từ chối cấp chứng từ khấu trừ thì làm thế nào?",
    query: "Công ty cũ từ chối cấp chứng từ khấu trừ thì làm thế nào?",
    fullResponse: {
      title: "Quyền Lợi & Giải Pháp Khi Thiếu Chứng Từ Khấu Trừ",
      badge: "Nghị định 123/2020/NĐ-CP",
      points: [
        {
          num: 1,
          title: "Nghĩa vụ pháp lý của tổ chức chi trả:",
          content: "Theo Khoản 2 Điều 25 Thông tư 111/2013 và Nghị định 123/2020/NĐ-CP, tổ chức trả thu nhập đã khấu trừ thuế bắt buộc phải cấp chứng từ khấu trừ thuế TNCN điện tử theo yêu cầu của cá nhân, trừ trường hợp đã ủy quyền quyết toán."
        },
        {
          num: 2,
          title: "Các bước xử lý khi công ty cũ trì hoãn:",
          content: "1. Gửi văn bản hoặc email yêu cầu chính thức kèm trích dẫn Điều 31 Nghị định 123/2020. 2. Nếu đơn vị đã phá sản/ngừng hoạt động, bạn sử dụng Sao kê ngân hàng và Thư xác nhận thu nhập nộp lên CQT để được đối soát trên cơ sở dữ liệu ngành thuế."
        },
        {
          num: 3,
          title: "Hỗ trợ từ Cơ quan Thuế:",
          content: "Cơ quan thuế nơi tiếp nhận hồ sơ có trách nhiệm phối hợp rà soát mã số thuế doanh nghiệp trên hệ thống hóa đơn/chứng từ điện tử quốc gia để bảo vệ quyền lợi người lao động."
        }
      ],
      conclusion: "Bạn có thể gửi công văn kiến nghị lên Chi cục Thuế quản lý doanh nghiệp nếu bị từ chối cấp chứng từ trái luật.",
      legalReferences: ["Nghị định 123/2020/NĐ-CP", "Điều 25 Thông tư 111/2013/TT-BTC"]
    }
  }
];

export const mockInitialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "bot",
    timestamp: "10:14",
    type: "greeting",
    text: "Xin chào anh **Nguyễn Hoàng Nam**! Tôi là trợ lý pháp lý AI của hệ thống ThuTra. Tôi sẵn sàng hỗ trợ rà soát các hợp đồng, mức trích nộp 10% và phương án quyết toán trực tiếp tối ưu nhất cho kỳ tính thuế này."
  },
  {
    id: "msg-2",
    sender: "user",
    timestamp: "10:15",
    type: "user",
    text: "Mình làm dev chính thức lương 30tr, tối làm thêm freelance nhận 15tr/tháng thì cuối năm tính thuế thế nào bot?"
  },
  {
    id: "msg-3",
    sender: "bot",
    timestamp: "10:15",
    type: "legal_analysis",
    legalAnalysis: {
      title: "Phân tích Nghĩa vụ Quyết toán Thuế",
      badge: "Tình huống 2 Nguồn Thu Nhập",
      points: [
        {
          num: 1,
          title: "Nguồn lương chính thức (30.000.000 đ/tháng):",
          content: "Do bạn ký hợp đồng lao động trên 3 tháng, công ty sẽ khấu trừ thuế theo **Biểu lũy tiến từng phần (7 bậc)** sau khi giảm trừ gia cảnh bản thân (11 tr/tháng) và các khoản bảo hiểm bắt buộc (BHXH, BHYT, BHTN 10.5%)."
        },
        {
          num: 2,
          title: "Nguồn thu nhập freelance (15.000.000 đ/tháng):",
          content: "Đây là khoản thu nhập vãng lai (không ký HĐLĐ hoặc ký dưới 3 tháng). Đơn vị chi trả có nghĩa vụ khấu trừ tại nguồn **10% (tương đương 1.500.000 đ/tháng)** đối với mỗi lần chi trả từ 2.000.000 đ trở lên."
        },
        {
          num: 3,
          title: "Thủ tục quyết toán cuối năm (Bắt buộc tự quyết toán):",
          content: "Do có từ 2 nguồn thu nhập trong năm, bạn **không được ủy quyền quyết toán** cho công ty chính thức mà phải trực tiếp làm Tờ khai 02/QTT-TNCN. ThuTra sẽ tổng hợp cả 2 nguồn, tính lại thuế theo biểu lũy tiến cả năm và đối chiếu với tổng thuế đã khấu trừ để xác định số tiền được hoàn trả hoặc phải nộp thêm."
        }
      ],
      conclusion: "ThuTra AI ước tính bạn có khả năng nhận lại tiền hoàn thuế do khoản khấu trừ 10% tại nguồn cao hơn nghĩa vụ lũy tiến thực tế sau khi tính đủ giảm trừ gia cảnh.",
      legalReferences: ["Thông tư 111/2013/TT-BTC", "Thông tư 80/2021/TT-BTC"]
    }
  }
];

export const mockLegalDocuments: LegalDocument[] = [
  {
    id: "leg-1",
    docType: "THÔNG TƯ",
    docTypeBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    issuer: "Bộ Tài chính",
    code: "Thông tư 111/2013/TT-BTC",
    summary: "Hướng dẫn thực hiện Luật Thuế TNCN, quy định chi tiết 10 bậc khấu trừ 10% và phương pháp tính lũy...",
    fullTitle: "Thông tư 111/2013/TT-BTC hướng dẫn thực hiện Luật Thuế thu nhập cá nhân",
    effectiveDate: "01/10/2013"
  },
  {
    id: "leg-2",
    docType: "THÔNG TƯ",
    docTypeBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    issuer: "Bộ Tài chính",
    code: "Thông tư 80/2021/TT-BTC",
    summary: "Quy định địa điểm nộp hồ sơ quyết toán khi cá nhân có nhiều nguồn thu nhập vãng lai trong năm tài...",
    fullTitle: "Thông tư 80/2021/TT-BTC hướng dẫn thi hành một số điều của Luật Quản lý thuế",
    effectiveDate: "01/01/2022"
  },
  {
    id: "leg-3",
    docType: "NGHỊ ĐỊNH",
    docTypeBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    issuer: "Chính phủ",
    code: "Nghị định 123/2020/NĐ-CP",
    summary: "Quy định việc chuyển đổi sang chứng từ khấu trừ thuế TNCN điện tử bắt buộc từ 01/07/2022.",
    fullTitle: "Nghị định 123/2020/NĐ-CP quy định về hóa đơn, chứng từ",
    effectiveDate: "01/07/2022"
  },
  {
    id: "leg-4",
    docType: "NGHỊ QUYẾT",
    docTypeBadgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    issuer: "UBTV Quốc hội",
    code: "Nghị quyết 954/2020/UBTVQH14",
    summary: "Điều chỉnh mức giảm trừ gia cảnh thuế TNCN lên 11 triệu đồng/tháng cho bản thân và 4.4 triệu...",
    fullTitle: "Nghị quyết 954/2020/UBTVQH14 về điều chỉnh mức giảm trừ gia cảnh của thuế thu nhập cá nhân",
    effectiveDate: "01/07/2020"
  }
];
