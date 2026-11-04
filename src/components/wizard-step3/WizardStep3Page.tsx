import React, { useState, useEffect } from 'react';
import { Step3Header } from './Step3Header';
import { TaxRefundBanner } from './TaxRefundBanner';
import { RuleEngineWarnings } from './RuleEngineWarnings';
import { AiTaxOptimizationCard } from './AiTaxOptimizationCard';
import { ExportXmlSection } from './ExportXmlSection';
import { TaxSummarySidebar } from './TaxSummarySidebar';
import { Step3Footer } from './Step3Footer';
import { useTaxFiling } from '../../contexts/TaxFilingContext';
import { 
  AddDependentMstModal, 
  EtaxSubmissionModal, 
  TaxSubmissionModal,
  TaxSettlementSuccessModal 
} from './Step3Modals';

interface WizardStep3PageProps {
  onBackToStep2?: () => void;
  onGoToStep1?: () => void;
  onBackToDashboard?: () => void;
  onStepClick?: (step: number) => void;
}

export const WizardStep3Page: React.FC<WizardStep3PageProps> = ({
  onBackToStep2,
  onGoToStep1,
  onBackToDashboard,
  onStepClick
}) => {
  const { activeProfile, executeAudit } = useTaxFiling();
  const [isAddMstOpen, setIsAddMstOpen] = useState(false);
  const [isEtaxSubmitOpen, setIsEtaxSubmitOpen] = useState(false);
  const [isTaxSubmissionOpen, setIsTaxSubmissionOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Tự động kích hoạt kiểm tra 15 rules từ Backend
  useEffect(() => {
    if (activeProfile?.id) {
      executeAudit().catch((err: unknown) => {
        console.warn('Lỗi khi kích hoạt thẩm tra 15 rules:', err);
      });
    }
  }, [activeProfile?.id, executeAudit]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      <div>
        {/* 1. Top Header Bar & Stepper */}
        <Step3Header
          onLogoClick={onBackToDashboard}
          onSaveDraft={onBackToDashboard}
          onHotlineClick={() => alert('Hotline hỗ trợ pháp lý TNCN: 1900 6868')}
          onStepClick={(step) => {
            if (step === 1 && onGoToStep1) onGoToStep1();
            if (step === 2 && onBackToStep2) onBackToStep2();
            if (onStepClick) onStepClick(step);
          }}
        />

        {/* 2. Main Content Body */}
        <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (Main Results, Rules, AI Optimization, Export XML) ~65% */}
            <div className="lg:col-span-8 space-y-4">
              {/* Part 1: Tax Refund Verdict & Authority Locator */}
              <TaxRefundBanner />

              {/* Part 2: Rule Engine Scanner (R10 High Risk & R01 Amber Warning) */}
              <RuleEngineWarnings
                onOpenRuleDetail={(ruleId) => {
                  alert(`Chi tiết điều chỉnh ${ruleId}: Tự động loại bỏ trùng lặp tháng 5 & 6, giữ nguyên 12 tháng giảm trừ tại Công ty CP Công nghệ ABC.`);
                }}
                onAddDependentMst={() => setIsAddMstOpen(true)}
              />

              {/* Part 3: AI Tax Optimizer */}
              <AiTaxOptimizationCard
                onApplyOptimization={() => {
                  alert('Đã áp dụng phương án tối ưu thuế của Trợ lý AI vào Tờ khai 02/QTT!');
                }}
              />

              {/* Part 4: Export XML & Express Submission Guide */}
              <ExportXmlSection
                onDownloadXml={() => setIsTaxSubmissionOpen(true)}
                onWatchVideoGuide={() => setIsTaxSubmissionOpen(true)}
                onDownloadSchedule={() => {
                  alert('Đang tải Tờ Bảng kê chi tiết 02-1/BK-TNCN...');
                }}
                onDownloadPdfReport={() => {
                  alert('Đang tải Phiếu tổng hợp số liệu giải trình quyết toán thuế PDF...');
                }}
              />
            </div>

            {/* Right Column (Sidebar Summary & Legal Safety) ~35% */}
            <div className="lg:col-span-4">
              <TaxSummarySidebar />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Bottom Sticky Action Bar */}
      <Step3Footer
        onBackStep={onBackToStep2}
        onSubmitEtax={() => setIsSuccessModalOpen(true)}
      />

      {/* Modals */}
      <AddDependentMstModal
        isOpen={isAddMstOpen}
        onClose={() => setIsAddMstOpen(false)}
      />

      <EtaxSubmissionModal
        isOpen={isEtaxSubmitOpen}
        onClose={() => setIsEtaxSubmitOpen(false)}
        onCompleteToDashboard={onBackToDashboard}
      />

      <TaxSubmissionModal
        isOpen={isTaxSubmissionOpen}
        onClose={() => setIsTaxSubmissionOpen(false)}
        taxOffice="Chi cục Thuế Q. Bình Thạnh"
        fileName="to-khai-02-QTT-TNCN-2024-8492019381.xml"
      />

      <TaxSettlementSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        settlementId="TT-2026-8492019381-QTT"
        refundAmount={18450000}
        taxOffice="Chi cục Thuế Quận Bình Thạnh, TP.HCM"
        onDownloadPdf={() => alert('Đang tải bản tổng hợp giải trình quyết toán thuế (PDF)...')}
        onGoToDashboard={onBackToDashboard}
      />
    </div>
  );
};
