import React, { useState } from 'react';
import { TaxDeadlineBanner } from '../components/dashboard/TaxDeadlineBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { SettlementStepper } from '../components/dashboard/SettlementStepper';
import { IncomeTable } from '../components/dashboard/IncomeTable';
import { TaxBreakdownCard } from '../components/dashboard/TaxBreakdownCard';
import { IncomeFormModal } from '../components/modals/IncomeFormModal';
import type { IncomeFormData } from '../components/modals/IncomeFormModal';
import { useTaxFiling } from '../contexts/TaxFilingContext';
import { 
  MissingDocsModal, 
  DeductionDetailModal, 
  ExportDeclarationModal, 
  FullBracketsModal 
} from '../components/dashboard/Modals';
import type { ScreenType } from '../App';

interface DashboardPageProps {
  onNavigate?: (screen: ScreenType) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { activeProfile, createNewProfile, addIncomeSource } = useTaxFiling();
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isMissingDocsOpen, setIsMissingDocsOpen] = useState(false);
  const [isDeductionOpen, setIsDeductionOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFullBracketsOpen, setIsFullBracketsOpen] = useState(false);

  const handleCreateOrResumeProfile = async () => {
    if (!activeProfile) {
      try {
        await createNewProfile(2025, '105', 'Cục Thuế TP Hồ Chí Minh');
      } catch (err: unknown) {
        console.error('Không thể tạo hồ sơ:', err);
      }
    }
    onNavigate?.('wizard_step1');
  };

  const handleSaveIncome = async (data: IncomeFormData) => {
    try {
      let targetProfileId = activeProfile?.id;
      if (!targetProfileId) {
        const created = await createNewProfile(2025, '105', 'Cục Thuế TP Hồ Chí Minh');
        targetProfileId = created.id;
      }

      await addIncomeSource({
        profileId: targetProfileId,
        payerName: data.companyName || 'Công ty chi trả thu nhập',
        payerMst: data.taxCode || '0300123456',
        totalIncomeGross: data.totalIncome,
        totalTaxableIncome: data.totalIncome,
        taxWithheld: data.taxWithheld,
        insuranceDeduction: data.insuranceDeduction || 0,
      });

      setIsAddIncomeOpen(false);
    } catch {
      alert('Không thể lưu nguồn thu nhập. Vui lòng kiểm tra lại kết nối!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Notification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-2xl p-3 px-4 shadow-2xs text-xs text-slate-500">
        <button
          type="button"
          onClick={handleCreateOrResumeProfile}
          className="text-[#046a4e] font-bold hover:underline flex items-center gap-1.5 cursor-pointer bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-100 transition-colors self-start sm:self-auto"
        >
          <span>✨ {activeProfile ? 'Tiếp tục quyết toán 3 bước (Bước 1) →' : 'Khởi tạo kỳ quyết toán 2025 ngay (Bước 1) →'}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">
            Kỳ quyết toán: <strong className="text-emerald-800">{activeProfile?.taxYear || 2025}</strong> ({activeProfile?.periodTitle || '02/QTT-TNCN'})
          </span>
        </div>
      </div>

      {/* Main Dashboard Widgets */}
      <TaxDeadlineBanner
        onViewMissingDocs={() => setIsMissingDocsOpen(true)}
        onExportDeclaration={() => onNavigate?.('wizard_step3')}
      />

      <KpiCards onShowDeductionDetails={() => setIsDeductionOpen(true)} />

      <SettlementStepper
        onStepClick={(step) => {
          if (step === 1) onNavigate?.('wizard_step1');
          if (step === 2) onNavigate?.('wizard_step2');
          if (step === 3) onNavigate?.('wizard_step3');
          if (step === 4) setIsExportOpen(true);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <IncomeTable
            onUploadXml={() => setIsMissingDocsOpen(true)}
            onFilterClick={() => {}}
            onViewSourceDetails={(src) => {
              alert(`Nguồn thu nhập: ${src.payerName}\nMST: ${src.payerMst || 'Chưa có'}\nTổng thu nhập: ${new Intl.NumberFormat('vi-VN').format(src.totalIncomeGross)} đ\nThuế đã khấu trừ: ${new Intl.NumberFormat('vi-VN').format(src.taxWithheld ?? 0)} đ`);
            }}
            onAddIncome={() => setIsAddIncomeOpen(true)}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <TaxBreakdownCard onShowFullBrackets={() => setIsFullBracketsOpen(true)} />
        </div>
      </div>

      {/* Modals */}
      <IncomeFormModal 
        isOpen={isAddIncomeOpen} 
        onClose={() => setIsAddIncomeOpen(false)} 
        onSave={handleSaveIncome} 
      />
      <MissingDocsModal isOpen={isMissingDocsOpen} onClose={() => setIsMissingDocsOpen(false)} />
      <DeductionDetailModal isOpen={isDeductionOpen} onClose={() => setIsDeductionOpen(false)} />
      <ExportDeclarationModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <FullBracketsModal isOpen={isFullBracketsOpen} onClose={() => setIsFullBracketsOpen(false)} />
    </div>
  );
};
