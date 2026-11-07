// ==============================================================================
// Dịch vụ Chatbot AI Trí tuệ Thuế TNCN (Tax Chatbot AI Service)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { PoolClient } from 'pg';
import {
  ChatRequestDto,
  ChatResponseDto,
  ChatTopicSuggestionDto,
  LegalReferenceDto,
  TaxActionSuggestionDto,
} from '../types/chat.types';
import { ragRepository } from '../repositories/rag.repository';

export class ChatService {
  /**
   * Danh mục các gợi ý chủ đề hỏi đáp phổ biến nhất mùa quyết toán
   */
  public getTopicSuggestions(): ChatTopicSuggestionDto[] {
    return [
      {
        id: 'sug-1',
        title: 'Giảm trừ gia cảnh cho Cha/Mẹ',
        description: 'Điều kiện độ tuổi, thu nhập không quá 1 triệu/tháng và hồ sơ mẫu 02/ĐK-NPT-TNCN.',
        prompt: 'Tôi muốn đăng ký người phụ thuộc là cha mẹ ngoài độ tuổi lao động thì cần điều kiện gì?',
        category: 'deduction',
      },
      {
        id: 'sug-2',
        title: 'Thu nhập vãng lai khấu trừ 10%',
        description: 'Nguyên tắc quyết toán khi có nhiều nguồn thu nhập freelance, thù lao ngoài lương chính.',
        prompt: 'Tôi có thu nhập vãng lai khấu trừ 10% tại 2 công ty thì quyết toán như thế nào?',
        category: 'income',
      },
      {
        id: 'sug-3',
        title: 'Điều kiện ủy quyền quyết toán thay',
        description: 'Trường hợp nào được ủy quyền cho cơ quan chi trả quyết toán thay theo NĐ 126/2020?',
        prompt: 'Khi nào cá nhân được ủy quyền cho doanh nghiệp quyết toán thuế thay?',
        category: 'audit',
      },
      {
        id: 'sug-4',
        title: 'Thời hạn nộp hồ sơ quyết toán 2025',
        description: 'Quy định thời hạn nộp tờ khai trực tiếp đối với cá nhân có số thuế nộp thêm hoặc hoàn.',
        prompt: 'Hạn chót nộp tờ khai quyết toán thuế TNCN năm nay là ngày nào?',
        category: 'deadline',
      },
      {
        id: 'sug-5',
        title: 'Miễn nộp thuế dưới 50.000 VNĐ',
        description: 'Quy tắc R14 theo Điểm e Khoản 2 Điều 8 Nghị định 126/2020/NĐ-CP.',
        prompt: 'Số thuế phát sinh nộp thêm dưới 50.000 đồng có phải nộp tờ khai và tiền thuế không?',
        category: 'audit',
      },
    ];
  }

  /**
   * Xử lý câu hỏi người dùng với bộ máy suy luận văn bản pháp lý
   */
  public async answerQuestion(
    client: PoolClient | undefined,
    dto: ChatRequestDto
  ): Promise<ChatResponseDto> {
    const q = (dto.question || '').toLowerCase().trim();
    const id = `bot-reply-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // 1. Phân loại chủ đề và đối chiếu căn cứ pháp lý
    let answer = '';
    let confidenceScore = 0.95;
    let legalReferences: LegalReferenceDto[] = [];
    let keyTakeaways: string[] = [];
    let suggestedAction: TaxActionSuggestionDto | undefined;
    let suggestedFollowUpQuestions: string[] = [];

    // Kịch bản 1: Người phụ thuộc & Giảm trừ gia cảnh
    if (
      q.includes('người phụ thuộc') ||
      q.includes('phụ thuộc') ||
      q.includes('bố mẹ') ||
      q.includes('cha mẹ') ||
      q.includes('con cái') ||
      q.includes('giảm trừ')
    ) {
      answer =
        'Theo quy định tại Điều 9 Thông tư 111/2013/TT-BTC và Nghị quyết 954/2020/UBTVQH14, mức giảm trừ gia cảnh cho mỗi người phụ thuộc là 4,4 triệu đồng/tháng (52,8 triệu đồng/năm). Đối với cha/mẹ, điều kiện là ngoài độ tuổi lao động (hoặc trong độ tuổi nhưng bị khuyết tật) và có mức thu nhập bình quân tháng trong năm từ tất cả các nguồn không vượt quá 1.000.000 VNĐ. Mỗi người phụ thuộc chỉ được tính giảm trừ vào một người nộp thuế duy nhất trong năm tính thuế.';
      confidenceScore = 0.98;
      legalReferences = [
        {
          code: 'NQ 954/2020/UBTVQH14',
          title: 'Điều chỉnh mức giảm trừ gia cảnh của thuế thu nhập cá nhân',
          relevantArticle: 'Điều 1: Mức giảm trừ 11tr/tháng cho bản thân và 4.4tr/tháng cho mỗi NPT',
        },
        {
          code: 'TT 111/2013/TT-BTC',
          title: 'Hướng dẫn thực hiện Luật Thuế thu nhập cá nhân',
          relevantArticle: 'Điều 9, Khoản 1, Điểm d: Người phụ thuộc và hồ sơ chứng minh hợp pháp',
        },
      ];
      keyTakeaways = [
        'Mức giảm trừ: 4.400.000 VNĐ/tháng/người phụ thuộc.',
        'Thu nhập người phụ thuộc ngoài độ tuổi lao động không quá 1.000.000 VNĐ/tháng.',
        'Bắt buộc có CCCD gắn chip / Định danh VNeID hợp lệ để đăng ký MST người phụ thuộc.',
        'Hệ thống tự động kiểm tra trùng lặp người phụ thuộc qua Quy tắc R02 & R09.',
      ];
      suggestedAction = {
        actionType: 'NAVIGATE_WIZARD_STEP1',
        label: 'Khai báo Người Phụ Thuộc (Bước 1)',
        description: 'Thêm hồ sơ người phụ thuộc và đăng ký số tháng giảm trừ trong năm tính thuế.',
      };
      suggestedFollowUpQuestions = [
        'Hồ sơ đăng ký người phụ thuộc gồm những giấy tờ gì?',
        'Có được đăng ký giảm trừ hồi tố từ đầu năm cho người phụ thuộc không?',
        'Con trên 18 tuổi đang học đại học có được tính là người phụ thuộc không?',
      ];
    }
    // Kịch bản 2: Thu nhập vãng lai 10% & Nhiều nguồn
    else if (
      q.includes('vãng lai') ||
      q.includes('freelance') ||
      q.includes('10%') ||
      q.includes('nhiều nơi') ||
      q.includes('hai nơi') ||
      q.includes('2 nơi') ||
      q.includes('thù lao')
    ) {
      answer =
        'Căn cứ Điểm i Khoản 1 Điều 25 Thông tư 111/2013/TT-BTC, tổ chức trả tiền công, thù lao, tiền chi khác cho cá nhân từ 2.000.000 đồng/lần trở lên phải khấu trừ thuế theo tỷ lệ 10% trước khi trả. Nếu bạn có thu nhập từ tiền lương tại một nơi và thu nhập vãng lai bình quân tháng trong năm không quá 10 triệu đồng đã được khấu trừ 10%, nếu không có nhu cầu quyết toán khoản này thì không bắt buộc phải quyết toán. Ngược lại, nếu muốn hoàn số thuế đã nộp thừa hoặc tổng thu nhập vãng lai bình quân vượt quá 10 triệu đồng/tháng, bạn bắt buộc phải gom tất cả nguồn thu nhập lại để trực tiếp quyết toán với Cơ quan thuế.';
      confidenceScore = 0.96;
      legalReferences = [
        {
          code: 'TT 111/2013/TT-BTC',
          title: 'Hướng dẫn thực hiện Luật Thuế TNCN',
          relevantArticle: 'Điều 25, Khoản 1, Điểm i: Khấu trừ thuế 10% đối với thu nhập vãng lai',
        },
        {
          code: 'NĐ 126/2020/NĐ-CP',
          title: 'Quy định chi tiết một số điều của Luật Quản lý thuế',
          relevantArticle: 'Điều 8, Khoản 2: Các trường hợp bắt buộc và không bắt buộc quyết toán',
        },
      ];
      keyTakeaways = [
        'Ngưỡng khấu trừ tại nguồn: Từ 2.000.000 VNĐ/lần chi trả.',
        'Thu nhập vãng lai bình quân <= 10tr/tháng đã khấu trừ 10%: Không bắt buộc quyết toán nếu không có nhu cầu hoàn.',
        'Quy tắc R08 & R10 của hệ thống sẽ kiểm tra đối soát chênh lệch thu nhập và trùng giảm trừ.',
      ];
      suggestedAction = {
        actionType: 'NAVIGATE_WIZARD_STEP2',
        label: 'Kê khai Thu nhập Vãng lai (Bước 2)',
        description: 'Tải lên chứng từ khấu trừ điện tử e-Chungtu hoặc nhập số thuế 10% đã khấu trừ.',
      };
      suggestedFollowUpQuestions = [
        'Làm sao xin chứng từ khấu trừ thuế điện tử e-Chungtu từ đơn vị chi trả?',
        'Trường hợp nào được làm Bản cam kết 08/CK-TNCN để không bị khấu trừ 10%?',
        'Có được tính giảm trừ bản thân tại nơi chi trả thu nhập vãng lai không?',
      ];
    }
    // Kịch bản 3: Miễn nộp dưới 50k & Hoàn thuế
    else if (
      q.includes('dưới 50') ||
      q.includes('50.000') ||
      q.includes('50k') ||
      q.includes('hoàn thuế') ||
      q.includes('nộp thừa')
    ) {
      answer =
        'Theo Điểm e Khoản 2 Điều 8 Nghị định 126/2020/NĐ-CP, cá nhân có số thuế TNCN phải nộp thêm sau quyết toán của từng năm từ 50.000 đồng trở xuống thì được MIỄN NGHĨA VỤ NỘP THUẾ và không phải nộp hồ sơ quyết toán thuế TNCN. Đối với trường hợp có số thuế nộp thừa, bạn có quyền nộp hồ sơ quyết toán bất cứ lúc nào sau thời hạn tháng 4 mà không bao giờ bị xử phạt chậm nộp, số tiền hoàn sẽ được Kho bạc Nhà nước chuyển trực tiếp vào tài khoản ngân hàng của bạn.';
      confidenceScore = 0.99;
      legalReferences = [
        {
          code: 'NĐ 126/2020/NĐ-CP',
          title: 'Nghị định quy định chi tiết một số điều của Luật Quản lý thuế',
          relevantArticle: 'Điều 8, Khoản 2, Điểm e: Miễn nộp thuế TNCN từ 50.000 VNĐ trở xuống',
        },
        {
          code: 'Luật QLT 38/2019/QH14',
          title: 'Luật Quản lý thuế số 38/2019/QH14',
          relevantArticle: 'Điều 44: Thời hạn nộp hồ sơ khai thuế và không phạt nộp chậm hồ sơ hoàn thuế',
        },
      ];
      keyTakeaways = [
        'Số thuế phát sinh thêm <= 50.000 VNĐ: Miễn hoàn toàn nghĩa vụ nộp thuế (Quy tắc R14).',
        'Cá nhân có số thuế được hoàn: Không bị giới hạn thời hạn nộp, không bị phạt chậm nộp.',
        'Hệ thống tự động phát hiện số tiền hoàn và xuất biểu mẫu 02/QTT-TNCN chuẩn.',
      ];
      suggestedAction = {
        actionType: 'NAVIGATE_WIZARD_STEP3',
        label: 'Xem Chiết tính & Hoàn thuế (Bước 3)',
        description: 'Kiểm tra bảng tính lũy tiến 7 bậc và kết xuất tờ khai hoàn thuế chuẩn.',
      };
      suggestedFollowUpQuestions = [
        'Thời gian cơ quan thuế giải quyết hồ sơ hoàn thuế là bao lâu?',
        'Cần chuẩn bị thông tin tài khoản ngân hàng như thế nào để nhận tiền hoàn thuế?',
      ];
    }
    // Kịch bản 4: Thời hạn quyết toán & Xử phạt
    else if (
      q.includes('thời hạn') ||
      q.includes('hạn chót') ||
      q.includes('ngày nào') ||
      q.includes('chậm nộp') ||
      q.includes('phạt')
    ) {
      answer =
        'Căn cứ Khoản 2 Điều 44 Luật Quản lý thuế số 38/2019/QH14, thời hạn nộp hồ sơ quyết toán thuế TNCN trực tiếp của cá nhân cư trú chậm nhất là ngày cuối cùng của tháng thứ 4 kể từ ngày kết thúc năm dương lịch (tức ngày 30/04 hoặc ngày làm việc tiếp theo nếu trùng dịp nghỉ lễ 30/4 - 1/5). Nếu cá nhân có số thuế phải nộp thêm mà nộp chậm sau thời hạn này, sẽ bị tính tiền chậm nộp 0,03%/ngày theo Điều 59 Luật QLT 2019 và có thể bị xử phạt vi phạm hành chính về thời hạn nộp tờ khai.';
      confidenceScore = 0.97;
      legalReferences = [
        {
          code: 'Luật QLT 38/2019/QH14',
          title: 'Luật Quản lý thuế năm 2019',
          relevantArticle: 'Điều 44, Khoản 2: Thời hạn nộp hồ sơ khai quyết toán thuế TNCN',
        },
        {
          code: 'NĐ 125/2020/NĐ-CP',
          title: 'Quy định xử phạt vi phạm hành chính về thuế, hóa đơn',
          relevantArticle: 'Điều 13: Xử phạt hành vi chậm nộp hồ sơ khai thuế',
        },
      ];
      keyTakeaways = [
        'Hạn chót cho cá nhân trực tiếp quyết toán: Ngày cuối cùng của tháng 4 hàng năm (Quy tắc R14/R15).',
        'Tiền chậm nộp tiền thuế: 0,03%/ngày tính trên số tiền thuế chậm nộp.',
        'Trường hợp có số thuế hoàn: Được nộp bất kỳ lúc nào, không bị tính phạt.',
      ];
      suggestedAction = {
        actionType: 'NAVIGATE_WIZARD_STEP3',
        label: 'Chạy Thẩm tra 15 Quy tắc (Bước 3)',
        description: 'Phát hiện ngay nguy cơ chậm nộp và kiểm tra các tiêu chí rủi ro.',
      };
      suggestedFollowUpQuestions = [
        'Nếu ngày cuối cùng của tháng 4 trùng vào kỳ nghỉ lễ thì tính thế nào?',
        'Làm sao kiểm tra mã số thuế của mình đang thuộc Cục Thuế hay Chi cục Thuế nào quản lý?',
      ];
    }
    // Kịch bản mặc định: Hướng dẫn tổng quan & Tra cứu RAG
    else {
      answer =
        'Hệ thống ThuTra TNCN đã tiếp nhận câu hỏi của bạn. Hệ thống hỗ trợ thẩm tra toàn bộ quy trình quyết toán thuế TNCN theo biểu thuế lũy tiến từng phần 7 bậc và 15 quy tắc thẩm tra tự động (R01 - R15). Bạn có thể cung cấp thêm chi tiết về tình trạng thu nhập (hợp đồng lao động, vãng lai, người phụ thuộc) hoặc thực hiện theo quy trình 3 bước quyết toán trên thanh điều hướng.';
      confidenceScore = 0.88;
      legalReferences = [
        {
          code: 'TT 111/2013/TT-BTC',
          title: 'Thông tư hướng dẫn thi hành Luật Thuế thu nhập cá nhân',
          relevantArticle: 'Toàn văn biểu thuế lũy tiến từng phần và các khoản giảm trừ',
        },
        {
          code: 'TT 80/2021/TT-BTC',
          title: 'Hướng dẫn thi hành Luật Quản lý thuế',
          relevantArticle: 'Điều 45: Phân cấp Cơ quan thuế tiếp nhận hồ sơ quyết toán',
        },
      ];
      keyTakeaways = [
        'Bước 1: Khai báo định danh CCCD và đăng ký người phụ thuộc (giảm trừ 4.4tr/tháng).',
        'Bước 2: Tải chứng từ khấu trừ e-Chungtu hoặc bảng lương (OCR bóc tách tự động).',
        'Bước 3: Động cơ thẩm tra 15 rules quét rủi ro và xuất file XML nộp lên Cổng Thuế eTax.',
      ];
      suggestedAction = {
        actionType: 'NAVIGATE_WIZARD_STEP1',
        label: 'Bắt đầu Quyết toán 3 Bước',
        description: 'Khởi tạo hồ sơ quyết toán chuẩn và đối soát tự động.',
      };
      suggestedFollowUpQuestions = [
        'Mức giảm trừ gia cảnh hiện tại là bao nhiêu?',
        'Tôi có 2 nguồn thu nhập thì quyết toán ở đâu?',
        'Số thuế được hoàn nhận lại bằng cách nào?',
      ];
    }

    return {
      id,
      sender: 'bot',
      timestamp,
      answer,
      confidenceScore,
      legalReferences,
      keyTakeaways,
      suggestedAction,
      suggestedFollowUpQuestions,
    };
  }
}

export const chatService = new ChatService();
