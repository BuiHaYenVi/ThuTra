import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { StepHeader } from './StepHeader';
import { OcrUploader } from './OcrUploader';
import { IncomeSalaryCard } from './IncomeSalaryCard';
import { IncomeFreelanceCard } from './IncomeFreelanceCard';
import { RealtimeTaxSidebar } from './RealtimeTaxSidebar';
import { WizardFooter } from './WizardFooter';
import { 
  ViewScanModal, 
  RuleEngineCheckModal 
} from './WizardModals';
import { RuleEngineScanningModal } from './RuleEngineScanningModal';
import { IncomeFormModal } from '../modals/IncomeFormModal';
import { initialWizardStep2Data } from '../../data/mockWizardStep2';
import type { SalaryIncomeData, FreelanceIncomeData, RealtimeEstimateData } from '../../data/mockWizardStep2';

import { useTaxFiling } from '../../contexts/TaxFilingContext';
import type { IncomeFormData } from '../modals/IncomeFormModal';

interface WizardStep2PageProps {
  onBackToStep1?: () => void;
  onProceedToStep3?: () => void;
  onBackToDashboard?: () => void;
  onStepClick?: (step: number) => void;
}

export const WizardStep2Page: React.FC<WizardStep2PageProps> = ({
  onBackToStep1,
  onProceedToStep3,
  onBackToDashboard,
  onStepClick
}) => {
  const { activeProfile, incomeSources, addIncomeSource, executeAudit, createNewProfile } = useTaxFiling();

  const [hasSalary, setHasSalary] = useState(true);
  const [hasFreelance, setHasFreelance] = useState(true);
  const [salaryData, setSalaryData] = useState<SalaryIncomeData>(initialWizardStep2Data.salaryIncome);
  const [freelanceData, setFreelanceData] = useState<FreelanceIncomeData>(initialWizardStep2Data.freelanceIncome);

  const financial = activeProfile?.financialSummary;
  const totalIncome = financial?.totalTaxableIncome ?? (salaryData.totalTaxableIncome + freelanceData.totalIncomeBeforeTax);
  const totalTax = financial?.taxWithheldTotal ?? (salaryData.taxWithheld + freelanceData.taxWithheld10Percent);

  const [estimateData, setEstimateData] = useState<RealtimeEstimateData>(() => ({
    ...initialWizardStep2Data.realtimeEstimate,
    totalIncomeToDate: totalIncome,
    totalTaxWithheldToDate: totalTax
  }));

  // Modals state
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [isViewScanOpen, setIsViewScanOpen] = useState(false);
  const [isRuleEngineOpen, setIsRuleEngineOpen] = useState(false);
  const [isScanningRules, setIsScanningRules] = useState(false);

  const incomeStreamsCount = incomeSources.length > 0 ? incomeSources.length : (hasSalary ? 1 : 0) + (hasFreelance ? 1 : 0);

  // Recalculate totals when inputs change
  const handleSalaryChange = (updated: SalaryIncomeData) => {
    setSalaryData(updated);
    setEstimateData(prev => ({
      ...prev,
      totalIncomeToDate: updated.totalTaxableIncome + (hasFreelance ? freelanceData.totalIncomeBeforeTax : 0),
      totalTaxWithheldToDate: updated.taxWithheld + (hasFreelance ? freelanceData.taxWithheld10Percent : 0)
    }));
  };

  const handleFreelanceChange = (updated: FreelanceIncomeData) => {
    setFreelanceData(updated);
    setEstimateData(prev => ({
      ...prev,
      totalIncomeToDate: (hasSalary ? salaryData.totalTaxableIncome : 0) + updated.totalIncomeBeforeTax,
      totalTaxWithheldToDate: (hasSalary ? salaryData.taxWithheld : 0) + updated.taxWithheld10Percent
    }));
  };

  const handleDeleteSalary = () => {
    setHasSalary(false);
  };

  const handleDeleteFreelance = () => {
    setHasFreelance(false);
  };

  const handleStartRuleEngineCheck = async () => {
    setIsScanningRules(true);
    try {
      if (activeProfile?.id) {
        await executeAudit();
      }
    } catch (err: unknown) {
      console.warn('Audit warning:', err);
    }
  };

  const handleRuleEngineComplete = () => {
    setIsScanningRules(false);
    if (onProceedToStep3) {
      onProceedToStep3();
    }
  };

  const handleSaveManualIncome = async (data: IncomeFormData) => {
    try {
      let targetProfileId = activeProfile?.id;
      if (!targetProfileId) {
        const created = await createNewProfile(2025, '105', 'Cục Thuế TP Hồ Chí Minh');
        targetProfileId = created.id;
      }

      await addIncomeSource({
        profileId: targetProfileId,
        payerName: data.companyName,
        payerMst: data.taxCode,
        totalIncomeGross: data.totalIncome,
        totalTaxableIncome: data.totalIncome,
        taxWithheld: data.taxWithheld,
        insuranceDeduction: data.insuranceDeduction || 0,
      });

      setIsAddManualOpen(false);
    } catch (err: unknown) {
      alert('Không thể lưu nguồn thu nhập.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      <div>
        {/* 1. Header with Top identification and 3-step Stepper */}
        <StepHeader
          onLogoClick={onBackToDashboard}
          onSaveDraft={onBackToDashboard}
          onHotlineClick={() => alert('Tổng đài hỗ trợ pháp lý TNCN: 1900 6868 (8:00 - 18:00)')}
          onStepClick={(step) => {
            if (step === 1 && onBackToStep1) onBackToStep1();
            if (step === 3) {
              handleStartRuleEngineCheck();
            }
            if (onStepClick) onStepClick(step);
          }}
        />

        {/* 2. Main Content Body */}
        <main className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (~65% width) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Smart OCR Upload Box */}
              <OcrUploader
                onScanFile={(fileName) => {
                  setHasSalary(true);
                  alert(`Đã hoàn tất bóc tách tự động dữ liệu từ file: ${fileName}`);
                }}
                onViewScan={() => setIsViewScanOpen(true)}
                onOpenMobileCamera={() => {
                  alert('Vui lòng quét mã QR trên màn hình bằng ứng dụng eTax Mobile');
                }}
              />

              {/* Section: Danh mục nguồn thu nhập */}
              <div className="pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">
                      Các nguồn thu nhập chịu thuế đã nhận
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hệ thống tổng hợp và phân loại các hợp đồng tính lũy tiến và thu nhập khấu trừ vãng lai 10%.
                    </p>
                  </div>

                  <span className="bg-slate-100 text-slate-600 border border-slate-200/80 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center">
                    {incomeStreamsCount} Nguồn thu nhập
                  </span>
                </div>

                {/* Empty State or List of Cards */}
                {incomeStreamsCount === 0 ? (
                  <div className="py-12 px-6 border border-dashed border-slate-200 rounded-2xl bg-white shadow-2xs flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                      <Wallet className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      Chưa có nguồn thu nhập nào được ghi nhận
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
                      Hãy thêm các nguồn thu nhập từ Hợp đồng lao động hoặc thu nhập vãng lai để hệ thống tính toán chi tiết.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddManualOpen(true)}
                      className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Thêm nguồn thu nhập đầu tiên</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Card 1: HĐLĐ Lũy tiến (Công ty Cổ phần Công nghệ ABC) */}
                    {hasSalary && (
                      <IncomeSalaryCard
                        data={salaryData}
                        onChange={handleSalaryChange}
                        onDelete={handleDeleteSalary}
                        onViewFile={() => setIsViewScanOpen(true)}
                      />
                    )}

                    {/* Card 2: Freelance Khấu trừ 10% */}
                    {hasFreelance && (
                      <IncomeFreelanceCard
                        data={freelanceData}
                        onChange={handleFreelanceChange}
                        onDelete={handleDeleteFreelance}
                      />
                    )}

                    {/* Add Manual Source Button */}
                    <button
                      onClick={() => setIsAddManualOpen(true)}
                      className="w-full bg-white hover:bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-[#046a4e] text-xs font-semibold py-3 px-4 rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#046a4e]" />
                      <span>Thêm nguồn thu nhập thủ công (Hợp đồng khác / Cho thuê tài sản / Đầu tư vốn)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (~35% width) */}
            <div className="lg:col-span-4">
              <RealtimeTaxSidebar
                data={estimateData}
                onViewTaxFormula={() => setIsRuleEngineOpen(true)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Bottom Navigation Footer */}
      <WizardFooter
        onBackStep={() => {
          if (onBackToStep1) onBackToStep1();
          else alert('Quay lại Bước 1: Khai báo người phụ thuộc');
        }}
        onNextStep={handleStartRuleEngineCheck}
      />

      {/* Modals */}
      <IncomeFormModal
        isOpen={isAddManualOpen}
        onClose={() => setIsAddManualOpen(false)}
        onSave={(data) => {
          handleSaveManualIncome(data);
          if (data.category === 'labor') {
            setHasSalary(true);
            setSalaryData(prev => ({
              ...prev,
              companyName: data.companyName,
              totalTaxableIncome: data.totalIncome,
              taxWithheld: data.taxWithheld,
              insuranceDeduction: data.insuranceDeduction || prev.insuranceDeduction,
            }));
          } else {
            setHasFreelance(true);
            setFreelanceData(prev => ({
              ...prev,
              contractTitle: `Hợp đồng: ${data.companyName}`,
              totalIncomeBeforeTax: data.totalIncome,
              taxWithheld10Percent: data.taxWithheld,
            }));
          }
          setEstimateData(prev => ({
            ...prev,
            totalIncomeToDate: prev.totalIncomeToDate + data.totalIncome,
            totalTaxWithheldToDate: prev.totalTaxWithheldToDate + data.taxWithheld,
          }));
          alert(`Đã thêm nguồn thu nhập thành công: ${data.companyName} (${new Intl.NumberFormat('vi-VN').format(data.totalIncome)} VNĐ)`);
        }}
      />

      <ViewScanModal
        isOpen={isViewScanOpen}
        onClose={() => setIsViewScanOpen(false)}
        fileName={initialWizardStep2Data.scannedFileName}
      />

      <RuleEngineCheckModal
        isOpen={isRuleEngineOpen}
        onClose={() => setIsRuleEngineOpen(false)}
      />

      {/* 1.5s Intermediate Rule Engine Scanning Modal */}
      <RuleEngineScanningModal
        isOpen={isScanningRules}
        onComplete={handleRuleEngineComplete}
      />
    </div>
  );
};
