import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { TaxForecastBanner } from './TaxForecastBanner';
import { IncomeStreamList } from './IncomeStreamList';
import { DocumentUploadBox } from './DocumentUploadBox';
import { DeadlineWidget } from './DeadlineWidget';
import { RiskAlertWidget } from './RiskAlertWidget';
import { AiAssistantWidget } from './AiAssistantWidget';
import { FooterTrustBadges } from './FooterTrustBadges';
import { 
  CalculationFormulaModal, 
  FixRiskModal, 
  AiChatModal 
} from './ForecastModals';
import type { IncomeStreamItem, AiPrompt } from '../../data/mockForecastData';

interface TaxForecastPageProps {
  onNavigateToDashboard?: () => void;
  onNavigateToStep1?: () => void;
  onNavigateToStep2?: () => void;
  onNavigateToStep3?: () => void;
  onNavigateToChatbot?: () => void;
}

export const TaxForecastPage: React.FC<TaxForecastPageProps> = ({ 
  onNavigateToDashboard,
  onNavigateToStep1,
  onNavigateToStep2,
  onNavigateToStep3,
  onNavigateToChatbot
}) => {
  const [activeTab, setActiveTab] = useState('tax_period');

  // Modals state
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'declaration' && onNavigateToStep3) {
      onNavigateToStep3();
    } else if (tabId === 'etax_guide' && onNavigateToStep2) {
      onNavigateToStep2();
    } else if (tabId === 'law_qa' && onNavigateToChatbot) {
      onNavigateToChatbot();
    }
  };

  const handleSelectAiPrompt = (prompt: AiPrompt) => {
    setAiQuestion(prompt.question);
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onLogoClick={onNavigateToDashboard}
        onTabChange={handleTabChange}
        onOpenAiModal={() => {
          if (onNavigateToChatbot) {
            onNavigateToChatbot();
          } else {
            setAiQuestion('Hỏi đáp quy chuẩn thuế TNCN mới nhất theo Thông tư 80/2021');
            setIsAiModalOpen(true);
          }
        }}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Hero Forecast Card */}
        <TaxForecastBanner
          onStartSettlement={() => {
            if (onNavigateToStep1) onNavigateToStep1();
            else alert('Bắt đầu quy trình quyết toán 3 bước tự động...');
          }}
          onViewFormula={() => setIsFormulaModalOpen(true)}
          onOpenEtaxPortal={() => {
            alert('Đang kết nối cổng Dịch vụ công Quốc gia & eTax Mobile...');
          }}
        />

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Nguồn thu nhập & Upload - ~65% width) */}
          <div className="lg:col-span-8 space-y-4">
            <IncomeStreamList
              onAddIncomeClick={() => {
                alert('Mở form thêm nguồn thu nhập mới...');
              }}
              onUploadRequiredClick={(item: IncomeStreamItem) => {
                alert(`Tải lên chứng từ bổ sung cho nguồn: ${item.companyName}`);
              }}
              onViewXmlClick={(item: IncomeStreamItem) => {
                alert(`Đang mở xem chi tiết chứng từ XML: ${item.companyName}`);
              }}
            />

            {/* Drag & Drop Upload Zone */}
            <DocumentUploadBox
              onFileSelect={(file) => {
                alert(`Đã nhận chứng từ: ${file.name}`);
              }}
              onSyncEtaxMobile={() => {
                alert('Đang gửi yêu cầu đồng bộ eTax Mobile...');
              }}
            />
          </div>

          {/* Right Column (Widgets: Deadline, Risk Alert, AI Assistant - ~35% width) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget 1: Deadline Counter */}
            <DeadlineWidget
              onOpenGuide={() => {
                alert('Mở cẩm nang hướng dẫn quyết toán nhanh trong 15 phút');
              }}
            />

            {/* Widget 2: Risk Alert Rule Engine */}
            <RiskAlertWidget
              onFixRisk={() => setIsRiskModalOpen(true)}
            />

            {/* Widget 3: Mini AI Chatbot */}
            <AiAssistantWidget
              onSelectPrompt={handleSelectAiPrompt}
              onOpenFullChat={() => {
                if (onNavigateToChatbot) {
                  onNavigateToChatbot();
                } else {
                  setAiQuestion('');
                  setIsAiModalOpen(true);
                }
              }}
            />
          </div>
        </div>

        {/* 3. Footer Trust Badges & Copyright */}
        <FooterTrustBadges />
      </main>

      {/* Interactive Modals */}
      <CalculationFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />

      <FixRiskModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
      />

      <AiChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuestion={aiQuestion}
      />
    </div>
  );
};
