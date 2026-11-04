import React, { useState } from 'react';
import { ChatNavbar } from './ChatNavbar';
import { ChatArea } from './ChatArea';
import { SyncedProfileSidebar } from './SyncedProfileSidebar';
import { LegalReferenceCard } from './LegalReferenceCard';
import { ExportPdfModal, LegalLibraryModal, AttachDocumentModal } from './TaxChatModals';
import { mockInitialMessages } from '../../data/mockChatData';
import type { ChatMessage, PromptChip, LegalDocument } from '../../data/mockChatData';

interface TaxChatPageProps {
  onNavigateToOverview?: () => void;
  onNavigateToIncomes?: () => void;
  onNavigateToSettlementStep3?: () => void;
}

export const TaxChatPage: React.FC<TaxChatPageProps> = ({
  onNavigateToOverview,
  onNavigateToIncomes,
  onNavigateToSettlementStep3
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialMessages);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Modals state
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isLegalLibraryOpen, setIsLegalLibraryOpen] = useState(false);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocument | null>(null);
  const [isAttachDocOpen, setIsAttachDocOpen] = useState(false);

  // Send new user message
  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    // Simulate smart AI legal retrieval
    setTimeout(() => {
      let botResponse: ChatMessage;

      // Smart pattern matching for tax topics
      const lower = text.toLowerCase();
      if (lower.includes('người phụ thuộc') || lower.includes('bố mẹ') || lower.includes('giảm trừ')) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          type: 'legal_analysis',
          legalAnalysis: {
            title: 'Quy định Giảm trừ Gia cảnh Người Phụ thuộc',
            badge: 'Nghị quyết 954 & TT 111/2013',
            points: [
              {
                num: 1,
                title: 'Mức giảm trừ gia cảnh người phụ thuộc:',
                content: 'Mỗi người phụ thuộc được tính giảm trừ 4.400.000 đ/tháng (52.800.000 đ/năm). Điều kiện là người phụ thuộc phải được cấp Mã số thuế cá nhân theo quy định.'
              },
              {
                num: 2,
                title: 'Điều kiện đối với bố mẹ ngoài độ tuổi lao động:',
                content: 'Cha đẻ, mẹ đẻ ngoài độ tuổi lao động (nam từ đủ 61 tuổi, nữ từ đủ 56 tuổi) không có thu nhập hoặc thu nhập bình quân tháng trong năm không vượt quá 1.000.000 đ.'
              },
              {
                num: 3,
                title: 'Hồ sơ pháp lý cần nộp kèm:',
                content: 'CCCD người phụ thuộc, Giấy khai sinh của bạn (chứng minh quan hệ con - cha mẹ), Bản kê khai Mẫu 02/TH hoặc đăng ký trực tiếp trên ứng dụng eTax Mobile.'
              }
            ],
            conclusion: 'ThuTra AI khuyến nghị bạn hoàn thiện đăng ký sớm trước thời điểm nộp hồ sơ quyết toán để được truy thu mức giảm trừ từ tháng 1 trọn năm 2024.',
            legalReferences: ['Khoản 1 Điều 9 Thông tư 111/2013/TT-BTC', 'Nghị quyết 954/2020/UBTVQH14']
          }
        };
      } else if (lower.includes('chứng từ') || lower.includes('công ty cũ')) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          type: 'legal_analysis',
          legalAnalysis: {
            title: 'Xử lý Vấn đề Chứng Từ Khấu Trừ Thuế Điện Tử',
            badge: 'Nghị định 123/2020/NĐ-CP',
            points: [
              {
                num: 1,
                title: 'Nghĩa vụ cấp chứng từ khấu trừ:',
                content: 'Tổ chức chi trả thu nhập có trách nhiệm cấp chứng từ khấu trừ thuế điện tử cho cá nhân sau khi khấu trừ 10% tại nguồn theo Điều 31 Nghị định 123/2020/NĐ-CP.'
              },
              {
                num: 2,
                title: 'Phương án đối soát số liệu dự phòng:',
                content: 'Trong trường hợp đơn vị cũ giải thể hoặc chậm trễ, bạn gửi bản sao kê tài khoản nhận lương kèm thư xác nhận thu nhập tới Chi cục Thuế nơi tiếp nhận hồ sơ.'
              }
            ],
            conclusion: 'Hồ sơ quyết toán trực tuyến trên ThuTra hỗ trợ đính kèm sao kê thay thế nếu có giải trình bằng văn bản theo đúng hướng dẫn của Cục Thuế TP.HCM.',
            legalReferences: ['Nghị định 123/2020/NĐ-CP', 'Công văn 883/TCT-DNNCN']
          }
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          type: 'legal_analysis',
          legalAnalysis: {
            title: 'Phân tích Tư vấn Pháp lý Thuế TNCN',
            badge: 'RAG Pháp luật Thuế 2024',
            points: [
              {
                num: 1,
                title: 'Đối chiếu quy định thuế hiện hành:',
                content: `Hệ thống đã ghi nhận câu hỏi của bạn: "${text}". Dựa trên hồ sơ đồng bộ (MST: 8492019381), bạn đang có 2 nguồn thu nhập đã khấu trừ tại nguồn.`
              },
              {
                num: 2,
                title: 'Biện pháp tối ưu hóa nghĩa vụ thuế:',
                content: 'Thực hiện kê khai tổng hợp toàn bộ các nguồn thu nhập theo mẫu 02/QTT-TNCN trực tiếp tại Chi cục Thuế Quận Bình Thạnh để nhận hoàn trả số tiền thuế khấu trừ vượt mức.'
              }
            ],
            conclusion: 'Bạn có thể tiếp tục trò chuyện hoặc bấm "Mở toàn bộ hồ sơ quyết toán 02/QTT" để đưa dữ liệu phân tích này vào Tờ khai chính thức.',
            legalReferences: ['Thông tư 111/2013/TT-BTC', 'Thông tư 80/2021/TT-BTC']
          }
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsAiTyping(false);
    }, 850);
  };

  // Clicking a quick prompt chip
  const handleSelectPromptChip = (chip: PromptChip) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: 'user',
      text: chip.query
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    setTimeout(() => {
      if (chip.fullResponse) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          type: 'legal_analysis',
          legalAnalysis: chip.fullResponse
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      setIsAiTyping(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      <div>
        {/* 1. Top Navigation Bar */}
        <ChatNavbar
          activeTab="legal"
          onLogoClick={onNavigateToOverview}
          onSelectTab={(tab) => {
            if (tab === 'overview' && onNavigateToOverview) onNavigateToOverview();
            if (tab === 'incomes' && onNavigateToIncomes) onNavigateToIncomes();
          }}
          onOpenHelp={() => setIsLegalLibraryOpen(true)}
          onOpenNotifications={() => alert('Thông báo hệ thống: Đã cập nhật cơ sở dữ liệu Luật Quản lý Thuế mới nhất 2024.')}
        />

        {/* 2. Main 2-Column Content Body */}
        <main className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Chatbot Area (~68%) */}
            <div className="lg:col-span-8">
              <ChatArea
                messages={messages}
                onSendMessage={handleSendMessage}
                onSelectPromptChip={handleSelectPromptChip}
                onExportPdf={() => setIsExportPdfOpen(true)}
                onShareChat={() => alert('Đã sao chép liên kết phiên tư vấn pháp lý AI vào bộ nhớ tạm!')}
                onSettingsClick={() => setIsLegalLibraryOpen(true)}
                onAttachFile={() => setIsAttachDocOpen(true)}
                onCaptureCamera={() => setIsAttachDocOpen(true)}
                onVoiceInput={() => alert('Đang kích hoạt micro thu âm giọng nói câu hỏi pháp lý...')}
                isAiTyping={isAiTyping}
              />
            </div>

            {/* Right Column: Synced Profile & Legal References (~32%) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Hồ sơ đang đồng bộ */}
              <SyncedProfileSidebar
                onOpenSettlementForm={onNavigateToSettlementStep3}
              />

              {/* Card 2: Văn bản Pháp luật áp dụng */}
              <LegalReferenceCard
                onViewAll={() => {
                  setSelectedLegalDoc(null);
                  setIsLegalLibraryOpen(true);
                }}
                onSelectDoc={(doc) => {
                  setSelectedLegalDoc(doc);
                  setIsLegalLibraryOpen(true);
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Interactive Modals */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
      />

      <LegalLibraryModal
        isOpen={isLegalLibraryOpen}
        onClose={() => {
          setIsLegalLibraryOpen(false);
          setSelectedLegalDoc(null);
        }}
        selectedDoc={selectedLegalDoc}
      />

      <AttachDocumentModal
        isOpen={isAttachDocOpen}
        onClose={() => setIsAttachDocOpen(false)}
      />
    </div>
  );
};
