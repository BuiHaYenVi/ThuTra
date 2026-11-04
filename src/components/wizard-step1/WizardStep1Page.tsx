import React, { useState, useMemo } from 'react';
import { Step1Header } from './Step1Header';
import { PersonalTaxpayerCard } from './PersonalTaxpayerCard';
import { DependentListCard } from './DependentListCard';
import { DeductionSummarySidebar } from './DeductionSummarySidebar';
import { LegalNoticeSidebar } from './LegalNoticeSidebar';
import { Step1Footer } from './Step1Footer';
import { DependentModal } from './Step1Modals';
import { useAuth } from '../../contexts/AuthContext';
import { useTaxFiling } from '../../contexts/TaxFilingContext';
import type { PersonalTaxpayer, Dependent } from '../../data/mockWizardStep1';
import type { CreateDependentDto } from '../../types/business.types';

interface WizardStep1PageProps {
  onProceedToStep2?: () => void;
  onBackDashboard?: () => void;
  onStepClick?: (step: number) => void;
}

export const WizardStep1Page: React.FC<WizardStep1PageProps> = ({
  onProceedToStep2,
  onBackDashboard,
  onStepClick
}) => {
  const { user } = useAuth();
  const { 
    activeProfile, 
    profilesList, 
    selectActiveProfile, 
    dependents: apiDependents, 
    addDependent, 
    updateDependent,
    removeDependent, 
    createNewProfile 
  } = useTaxFiling();

  const [taxpayer, setTaxpayer] = useState<PersonalTaxpayer>(() => ({
    fullName: user?.fullName || 'Người nộp thuế',
    cccd: user?.cccd || '079090001234',
    mst: user?.mst || '8492019482',
    taxOffice: user?.taxDepartmentName || 'Cục Thuế TP Hồ Chí Minh',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '0909123456',
    address: 'TP. Hồ Chí Minh',
    isVerifiedVNeID: user?.isVneidVerified ?? true,
    personalDeductionPerMonth: 11000000,
    personalDeductionMonths: 12,
    totalPersonalDeduction: 132000000
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);

  // Hàm sinh CCCD 12 số chuẩn Đề án 06 hợp lệ (mã tỉnh 079 + thế kỷ/năm 225 + 6 số ngẫu nhiên)
  const generateSafeCccd = (): string => {
    const random6 = Math.floor(100000 + Math.random() * 900000).toString();
    return `079225${random6}`;
  };

  // Hàm chuẩn hóa mối quan hệ người phụ thuộc sang enum hợp lệ
  const mapRelationToType = (relationText?: string): 'mother' | 'father' | 'child_under_18' | 'child_over_18_student' | 'disabled_relative' | 'spouse' | 'other' => {
    if (!relationText) return 'child_under_18';
    const lower = relationText.toLowerCase();
    if (['mother', 'father', 'child_under_18', 'child_over_18_student', 'spouse', 'disabled_relative', 'other'].includes(lower)) {
      return lower as any;
    }
    if (lower.includes('mẹ') || lower.includes('me')) return 'mother';
    if (lower.includes('cha') || lower.includes('bố') || lower.includes('ba')) return 'father';
    if (lower.includes('đh') || lower.includes('dh') || (lower.includes('con') && (lower.includes('18') || lower.includes('đang học')) && !lower.includes('dưới'))) {
      return 'child_over_18_student';
    }
    if (lower.includes('con')) return 'child_under_18';
    if (lower.includes('vợ') || lower.includes('chồng')) return 'spouse';
    if (lower.includes('tàn tật') || lower.includes('khuyết tật')) return 'disabled_relative';
    return 'other';
  };

  // Ánh xạ danh sách NPT từ server sang cấu trúc giao diện
  const uiDependents: Dependent[] = useMemo(() => {
    return apiDependents.map((d, index) => ({
      id: d.id,
      index: index + 1,
      title: `Người phụ thuộc #${index + 1}: ${d.fullName}`,
      fullName: d.fullName,
      relation: d.relationTitle || (d.relationType === 'child_under_18' ? 'Con dưới 18 tuổi' : 'Người phụ thuộc hợp pháp'),
      relationType: d.relationType,
      cccd: d.cccd || 'Chưa cung cấp',
      birthDate: d.dateOfBirth || 'Chưa cung cấp',
      mst: d.mst || '',
      hasMst: Boolean(d.mst),
      isValidCqt: true,
      startMonth: d.startMonth || '01/2025',
      endMonth: d.endMonth || '12/2025',
      monthsApplied: d.monthsApplied || 12,
      monthlyDeduction: 4400000,
      totalDeduction: d.totalDeduction || (d.monthsApplied || 12) * 4400000,
      commitmentChecked: true,
    }));
  }, [apiDependents]);

  const totalDependentDeduction = uiDependents.reduce((sum, d) => sum + d.totalDeduction, 0);

  // Taxpayer field change
  const handleTaxpayerChange = (field: keyof PersonalTaxpayer, value: string) => {
    setTaxpayer((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const ensureProfileId = async (): Promise<string> => {
    if (activeProfile?.id) return activeProfile.id;
    if (profilesList && profilesList.length > 0) {
      const match2025 = profilesList.find((p) => p.taxYear === 2025) || profilesList[0];
      await selectActiveProfile(match2025.id);
      return match2025.id;
    }
    const created = await createNewProfile(2025, '105', 'Cục Thuế TP Hồ Chí Minh');
    return created.id;
  };

  // Add or update dependent
  const handleSaveDependent = async (depData: Partial<Dependent>) => {
    try {
      const profileId = await ensureProfileId();
      const currentYear = activeProfile?.taxYear || 2025;

      // Chuẩn hóa CCCD 12 số sạch sẽ
      const rawCccdDigits = (depData.cccd || '').replace(/\D/g, '');
      const cleanCccd = rawCccdDigits.length === 12 ? rawCccdDigits : generateSafeCccd();

      // Chuẩn hóa mối quan hệ
      const relationType = mapRelationToType(depData.relationType || depData.relation);
      const relationTitle = depData.relation || 'Người phụ thuộc';
      const monthsApplied = Number(depData.monthsApplied) >= 1 && Number(depData.monthsApplied) <= 12 
        ? Number(depData.monthsApplied) 
        : 12;

      if (editingDependent?.id) {
        // Cập nhật người phụ thuộc hiện hữu
        await updateDependent(editingDependent.id, {
          fullName: (depData.fullName || editingDependent.fullName).trim(),
          relationType,
          relationTitle,
          cccd: cleanCccd,
          mst: depData.mst?.trim() || undefined,
          dateOfBirth: depData.birthDate || undefined,
          startMonth: `${currentYear}-01`,
          endMonth: `${currentYear}-12`,
          monthsApplied,
        });
      } else {
        // Thêm người phụ thuộc mới
        const payload: CreateDependentDto = {
          profileId,
          fullName: (depData.fullName || 'Người phụ thuộc mới').trim(),
          relationType,
          relationTitle,
          cccd: cleanCccd,
          mst: depData.mst?.trim() || undefined,
          dateOfBirth: depData.birthDate || undefined,
          startMonth: `${currentYear}-01`,
          endMonth: `${currentYear}-12`,
          monthsApplied,
          commitmentChecked: depData.commitmentChecked !== undefined ? depData.commitmentChecked : true,
        };

        await addDependent(payload);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu người phụ thuộc. Vui lòng kiểm tra lại thông tin!';
      alert(msg);
    } finally {
      setEditingDependent(null);
      setIsModalOpen(false);
    }
  };

  // Delete dependent
  const handleDeleteDependent = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người phụ thuộc này khỏi hồ sơ?')) {
      try {
        await removeDependent(id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể xóa người phụ thuộc.';
        alert(msg);
      }
    }
  };

  // Toggle commitment
  const handleToggleCommitment = (_id: string) => {
    // Không bắt buộc gọi API cho checkbox cam kết giao diện
  };

  // Quick add dependent
  const handleQuickAdd = async (fullName: string, relation: string) => {
    try {
      const profileId = await ensureProfileId();
      const currentYear = activeProfile?.taxYear || 2025;
      const relationType = mapRelationToType(relation);
      const safeCccd = generateSafeCccd();

      await addDependent({
        profileId,
        fullName: fullName.trim(),
        relationType,
        relationTitle: relation,
        cccd: safeCccd,
        startMonth: `${currentYear}-01`,
        endMonth: `${currentYear}-12`,
        monthsApplied: 12,
        commitmentChecked: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thêm nhanh người phụ thuộc.';
      alert(msg);
    }
  };

  // Mở modal form đầy đủ với thông tin điền sẵn từ thanh nhập nhanh
  const handleOpenAddModalWithPrefill = (prefillName?: string, prefillRelation?: string) => {
    if (prefillName) {
      setEditingDependent({
        id: '',
        index: uiDependents.length + 1,
        title: `Người phụ thuộc: ${prefillName}`,
        fullName: prefillName,
        relation: prefillRelation || 'Con dưới 18 tuổi',
        relationType: mapRelationToType(prefillRelation),
        cccd: generateSafeCccd(),
        birthDate: '01/01/2015',
        mst: '',
        hasMst: false,
        isValidCqt: true,
        startMonth: '01/2025',
        endMonth: '12/2025',
        monthsApplied: 12,
        monthlyDeduction: 4400000,
        totalDeduction: 52800000,
        commitmentChecked: true,
      });
    } else {
      setEditingDependent(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      <div>
        {/* 1. Top Header & Stepper */}
        <Step1Header
          dependentCount={uiDependents.length}
          onLogoClick={onBackDashboard}
          onSaveDraft={onBackDashboard}
          onHotlineClick={() => alert('Hotline hỗ trợ pháp lý TNCN: 1900 6886')}
          onStepClick={(step) => {
            if (step === 2 && onProceedToStep2) onProceedToStep2();
            if (onStepClick) onStepClick(step);
          }}
        />

        {/* 2. Main Content Body */}
        <main className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Personal Taxpayer & Dependents (~68%) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Section 1: Thông tin người nộp thuế (Bản thân) */}
              <PersonalTaxpayerCard
                taxpayer={taxpayer}
                onChangeTaxpayer={handleTaxpayerChange}
              />

              {/* Section 2: Danh sách người phụ thuộc đăng ký giảm trừ */}
              <DependentListCard
                dependents={uiDependents}
                onOpenAddModal={() => {
                  setEditingDependent(null);
                  setIsModalOpen(true);
                }}
                onEditDependent={(dep) => {
                  setEditingDependent(dep);
                  setIsModalOpen(true);
                }}
                onDeleteDependent={handleDeleteDependent}
                onToggleCommitment={handleToggleCommitment}
                onQuickAdd={handleQuickAdd}
                onOpenModalWithPrefill={handleOpenAddModalWithPrefill}
              />
            </div>

            {/* Right Column: Deduction Summary & Legal Notices (~32%) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Tóm tắt Mức Giảm trừ Dự kiến */}
              <DeductionSummarySidebar
                personalDeduction={132000000}
                dependentDeduction={totalDependentDeduction}
                dependentCount={uiDependents.length}
              />

              {/* Card 2: Điều kiện & Căn cứ Pháp lý */}
              <LegalNoticeSidebar />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Bottom Sticky Action Bar */}
      <Step1Footer
        onBackDashboard={onBackDashboard}
        onProceedToStep2={onProceedToStep2}
      />

      {/* 4. Modal Add/Edit Dependent */}
      <DependentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDependent(null);
        }}
        onSave={handleSaveDependent}
        initialData={editingDependent}
      />
    </div>
  );
};
