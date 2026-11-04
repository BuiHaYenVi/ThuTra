// ==============================================================================
// Context & Provider Quản lý Hồ sơ Quyết toán Thuế (TaxFilingContext)
// Hệ thống: ThuTra TNCN - Tầng 3: State Management Layer
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { profileApi } from '../services/profile.api';
import { taxDeclarationApi } from '../services/tax-declaration.api';
import { documentApi } from '../services/document.api';
import { auditApi } from '../services/audit.api';
import { storageUtil } from '../utils/storage.util';
import { ApiClientError } from '../types/api.types';
import { useAuth } from './AuthContext';
import type {
  TaxProfileDto,
  CreateProfileDto,
  UpdateProfileDto,
  IncomeSourceDto,
  CreateIncomeSourceDto,
  UpdateIncomeSourceDto,
  DependentDto,
  CreateDependentDto,
  UpdateDependentDto,
  TaxDocumentDto,
  AuditRunResultDto,
} from '../types/business.types';

export interface TaxFilingContextType {
  activeProfile: TaxProfileDto | null;
  profilesList: TaxProfileDto[];
  incomeSources: IncomeSourceDto[];
  dependents: DependentDto[];
  documents: TaxDocumentDto[];
  latestAuditResult: AuditRunResultDto | null;
  isFilingLoading: boolean;
  filingError: string | null;

  // Hành động với Hồ sơ
  loadUserProfiles: () => Promise<TaxProfileDto[]>;
  selectActiveProfile: (profileId: string) => Promise<void>;
  createNewProfile: (
    payloadOrYear: CreateProfileDto | number,
    taxOfficeCode?: string,
    taxOfficeName?: string
  ) => Promise<TaxProfileDto>;
  updateActiveProfile: (payload: UpdateProfileDto) => Promise<TaxProfileDto>;
  deleteProfile: (id: string) => Promise<void>;

  // Hành động với Nguồn thu nhập
  addIncomeSource: (payload: CreateIncomeSourceDto) => Promise<IncomeSourceDto>;
  updateIncomeSource: (id: string, payload: UpdateIncomeSourceDto) => Promise<IncomeSourceDto>;
  removeIncomeSource: (id: string) => Promise<void>;

  // Hành động với Người phụ thuộc
  addDependent: (payload: CreateDependentDto) => Promise<DependentDto>;
  updateDependent: (id: string, payload: UpdateDependentDto) => Promise<DependentDto>;
  removeDependent: (id: string) => Promise<void>;

  // Hành động với Chứng từ & Thẩm tra
  refreshDocuments: () => Promise<void>;
  executeAudit: () => Promise<AuditRunResultDto>;
  refreshActiveProfileData: () => Promise<void>;
  clearFilingError: () => void;
}

const TaxFilingContext = createContext<TaxFilingContextType | undefined>(undefined);

export interface TaxFilingProviderProps {
  children: React.ReactNode;
}

export const TaxFilingProvider: React.FC<TaxFilingProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeProfile, setActiveProfile] = useState<TaxProfileDto | null>(null);
  const [profilesList, setProfilesList] = useState<TaxProfileDto[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSourceDto[]>([]);
  const [dependents, setDependents] = useState<DependentDto[]>([]);
  const [documents, setDocuments] = useState<TaxDocumentDto[]>([]);
  const [latestAuditResult, setLatestAuditResult] = useState<AuditRunResultDto | null>(null);
  const [isFilingLoading, setIsFilingLoading] = useState<boolean>(false);
  const [filingError, setFilingError] = useState<string | null>(null);

  /**
   * Tải toàn bộ dữ liệu phụ thuộc của một kỳ quyết toán thuế
   */
  const loadProfileSubData = useCallback(async (profileId: string) => {
    try {
      const [incomesRes, depsRes, docsRes] = await Promise.all([
        taxDeclarationApi.getIncomeSources(profileId).catch(() => ({ data: [] as IncomeSourceDto[] })),
        taxDeclarationApi.getDependents(profileId).catch(() => ({ data: [] as DependentDto[] })),
        documentApi.getDocuments().catch(() => ({ data: { documents: [] as TaxDocumentDto[] } })),
      ]);

      setIncomeSources(incomesRes.data || []);
      setDependents(depsRes.data || []);
      setDocuments(docsRes.data?.documents || []);
    } catch (err: unknown) {
      console.warn('[TaxFilingContext] Không thể tải đầy đủ dữ liệu phụ:', err);
    }
  }, []);

  /**
   * Chọn kỳ quyết toán thuế làm hồ sơ hiện hành
   */
  const selectActiveProfile = useCallback(async (profileId: string) => {
    if (!profileId) return;
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await profileApi.getProfileById(profileId);
      if (res.success && res.data) {
        setActiveProfile(res.data);
        storageUtil.setActiveProfileId(profileId);
        await loadProfileSubData(profileId);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [loadProfileSubData]);

  /**
   * Lấy danh sách toàn bộ các kỳ quyết toán thuế của người dùng
   */
  const loadUserProfiles = useCallback(async (): Promise<TaxProfileDto[]> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await profileApi.getProfiles();
      const list = res.data || [];
      setProfilesList(list);

      // Nếu đã có kỳ thuế lưu trong storage và tồn tại trong danh sách, chọn kỳ đó
      const savedProfileId = storageUtil.getActiveProfileId();
      if (savedProfileId && list.some((p) => p.id === savedProfileId)) {
        await selectActiveProfile(savedProfileId);
      } else if (list.length > 0) {
        // Tự động chọn hồ sơ đầu tiên
        await selectActiveProfile(list[0].id);
      } else {
        setActiveProfile(null);
        setIncomeSources([]);
        setDependents([]);
        setDocuments([]);
      }

      return list;
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      return [];
    } finally {
      setIsFilingLoading(false);
    }
  }, [selectActiveProfile]);

  /**
   * Tự động khởi tạo dữ liệu hồ sơ khi đăng nhập thành công
   */
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      loadUserProfiles();
    } else {
      // Khi đăng xuất, reset toàn bộ state về rỗng
      setActiveProfile(null);
      setProfilesList([]);
      setIncomeSources([]);
      setDependents([]);
      setDocuments([]);
      setLatestAuditResult(null);
      setFilingError(null);
    }
  }, [isAuthenticated, isAuthLoading, loadUserProfiles]);

  /**
   * Khởi tạo kỳ quyết toán mới
   */
  const createNewProfile = useCallback(
    async (
      payloadOrYear: CreateProfileDto | number,
      taxOfficeCode?: string,
      taxOfficeName?: string
    ): Promise<TaxProfileDto> => {
      setIsFilingLoading(true);
      setFilingError(null);
      try {
        const normalizedPayload: CreateProfileDto =
          typeof payloadOrYear === 'number'
            ? {
                taxYear: payloadOrYear,
                taxDepartmentCode: taxOfficeCode || '105',
                taxDepartmentName: taxOfficeName || 'Cục Thuế TP Hồ Chí Minh',
                periodTitle: `Quyết toán thuế TNCN ${payloadOrYear}`,
              }
            : {
                ...payloadOrYear,
                taxDepartmentCode: payloadOrYear.taxDepartmentCode || payloadOrYear.taxOfficeCode || '105',
                taxDepartmentName: payloadOrYear.taxDepartmentName || payloadOrYear.taxOfficeName || 'Cục Thuế TP Hồ Chí Minh',
              };

        const res = await profileApi.createProfile(normalizedPayload);
        if (res.success && res.data) {
          setProfilesList((prev) => [res.data, ...prev]);
          setActiveProfile(res.data);
          storageUtil.setActiveProfileId(res.data.id);
          setIncomeSources([]);
          setDependents([]);
          return res.data;
        }
        throw new Error('Không thể khởi tạo hồ sơ quyết toán.');
      } catch (err: unknown) {
        const clientErr = ApiClientError.fromError(err);
        setFilingError(clientErr.message);
        throw clientErr;
      } finally {
        setIsFilingLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật thông tin kỳ quyết toán hiện hành
   */
  const updateActiveProfile = useCallback(async (payload: UpdateProfileDto): Promise<TaxProfileDto> => {
    if (!activeProfile) throw new Error('Không có hồ sơ thuế nào đang được chọn.');
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await profileApi.updateProfile(activeProfile.id, payload);
      if (res.success && res.data) {
        setActiveProfile(res.data);
        setProfilesList((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
        return res.data;
      }
      throw new Error('Không thể cập nhật hồ sơ quyết toán.');
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [activeProfile]);

  /**
   * Xóa hồ sơ quyết toán
   */
  const deleteProfile = useCallback(async (id: string): Promise<void> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      await profileApi.deleteProfile(id);
      setProfilesList((prev) => prev.filter((p) => p.id !== id));
      if (activeProfile?.id === id) {
        storageUtil.removeActiveProfileId();
        setActiveProfile(null);
        setIncomeSources([]);
        setDependents([]);
      }
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [activeProfile]);

  /**
   * Làm mới toàn bộ số liệu của hồ sơ hiện hành (đồng bộ tài chính hai chiều)
   */
  const refreshActiveProfileData = useCallback(async (): Promise<void> => {
    if (!activeProfile) return;
    try {
      const [profileRes, incomesRes, depsRes] = await Promise.all([
        profileApi.getProfileById(activeProfile.id),
        taxDeclarationApi.getIncomeSources(activeProfile.id),
        taxDeclarationApi.getDependents(activeProfile.id),
      ]);

      if (profileRes.success && profileRes.data) {
        setActiveProfile(profileRes.data);
        setProfilesList((prev) => prev.map((p) => (p.id === profileRes.data.id ? profileRes.data : p)));
      }
      setIncomeSources(incomesRes.data || []);
      setDependents(depsRes.data || []);
    } catch (err: unknown) {
      console.warn('[TaxFilingContext] Lỗi khi làm mới hồ sơ hiện hành:', err);
    }
  }, [activeProfile]);

  /**
   * Thêm nguồn thu nhập mới
   */
  const addIncomeSource = useCallback(async (payload: CreateIncomeSourceDto): Promise<IncomeSourceDto> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await taxDeclarationApi.createIncomeSource(payload);
      if (res.success && res.data) {
        setIncomeSources((prev) => [...prev, res.data]);
        // Tự động làm mới tài chính hồ sơ
        await refreshActiveProfileData();
        return res.data;
      }
      throw new Error('Không thể thêm nguồn thu nhập.');
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [refreshActiveProfileData]);

  /**
   * Cập nhật nguồn thu nhập
   */
  const updateIncomeSource = useCallback(async (id: string, payload: UpdateIncomeSourceDto): Promise<IncomeSourceDto> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await taxDeclarationApi.updateIncomeSource(id, payload);
      if (res.success && res.data) {
        setIncomeSources((prev) => prev.map((item) => (item.id === id ? res.data : item)));
        await refreshActiveProfileData();
        return res.data;
      }
      throw new Error('Không thể cập nhật nguồn thu nhập.');
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [refreshActiveProfileData]);

  /**
   * Xóa nguồn thu nhập
   */
  const removeIncomeSource = useCallback(async (id: string): Promise<void> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      await taxDeclarationApi.deleteIncomeSource(id);
      setIncomeSources((prev) => prev.filter((item) => item.id !== id));
      await refreshActiveProfileData();
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [refreshActiveProfileData]);

  /**
   * Thêm người phụ thuộc mới
   */
  const addDependent = useCallback(async (payload: CreateDependentDto): Promise<DependentDto> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      // 1. Xác định profileId hợp lệ (từ payload, activeProfile hoặc profilesList)
      let targetProfileId = payload.profileId || activeProfile?.id;
      if (!targetProfileId && profilesList.length > 0) {
        targetProfileId = profilesList[0].id;
        await selectActiveProfile(targetProfileId);
      }

      if (!targetProfileId) {
        // Tự động khởi tạo hồ sơ nếu chưa có
        const newProfile = await createNewProfile(2025, '105', 'Cục Thuế TP Hồ Chí Minh');
        targetProfileId = newProfile.id;
      }

      const safePayload: CreateDependentDto = {
        ...payload,
        profileId: targetProfileId,
      };

      const res = await taxDeclarationApi.createDependent(safePayload);
      if (res.success && res.data) {
        setDependents((prev) => [...prev, res.data]);
        // Tự động làm mới tài chính hồ sơ & danh sách NPT
        await refreshActiveProfileData();
        return res.data;
      }
      throw new Error('Không thể đăng ký người phụ thuộc.');
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [activeProfile, profilesList, selectActiveProfile, createNewProfile, refreshActiveProfileData]);

  /**
   * Cập nhật thông tin người phụ thuộc
   */
  const updateDependent = useCallback(async (id: string, payload: UpdateDependentDto): Promise<DependentDto> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await taxDeclarationApi.updateDependent(id, payload);
      if (res.success && res.data) {
        setDependents((prev) => prev.map((item) => (item.id === id ? res.data : item)));
        await refreshActiveProfileData();
        return res.data;
      }
      throw new Error('Không thể cập nhật người phụ thuộc.');
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [refreshActiveProfileData]);

  /**
   * Xóa người phụ thuộc
   */
  const removeDependent = useCallback(async (id: string): Promise<void> => {
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      await taxDeclarationApi.deleteDependent(id);
      setDependents((prev) => prev.filter((item) => item.id !== id));
      await refreshActiveProfileData();
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [refreshActiveProfileData]);

  /**
   * Làm mới danh sách chứng từ
   */
  const refreshDocuments = useCallback(async (): Promise<void> => {
    try {
      const res = await documentApi.getDocuments();
      setDocuments(res.data?.documents || []);
    } catch (err: unknown) {
      console.warn('[TaxFilingContext] Không thể làm mới danh sách chứng từ:', err);
    }
  }, []);

  /**
   * Kích hoạt chạy toàn bộ Động cơ Thẩm tra 15 Rules (R01 - R15)
   */
  const executeAudit = useCallback(async (): Promise<AuditRunResultDto> => {
    if (!activeProfile) throw new Error('Không có kỳ quyết toán nào đang được chọn để thẩm tra.');
    setIsFilingLoading(true);
    setFilingError(null);
    try {
      const res = await auditApi.runAudit(activeProfile.id);
      if (res.success && res.data) {
        setLatestAuditResult(res.data);
        await refreshActiveProfileData();
        return res.data;
      }
      throw new Error('Lỗi không xác định khi thực thi thẩm tra thuế.');
    } catch (err: unknown) {
      const clientErr = ApiClientError.fromError(err);
      setFilingError(clientErr.message);
      throw clientErr;
    } finally {
      setIsFilingLoading(false);
    }
  }, [activeProfile, refreshActiveProfileData]);

  const clearFilingError = useCallback(() => {
    setFilingError(null);
  }, []);

  const value = useMemo<TaxFilingContextType>(() => ({
    activeProfile,
    profilesList,
    incomeSources,
    dependents,
    documents,
    latestAuditResult,
    isFilingLoading,
    filingError,
    loadUserProfiles,
    selectActiveProfile,
    createNewProfile,
    updateActiveProfile,
    deleteProfile,
    addIncomeSource,
    updateIncomeSource,
    removeIncomeSource,
    addDependent,
    updateDependent,
    removeDependent,
    refreshDocuments,
    executeAudit,
    refreshActiveProfileData,
    clearFilingError,
  }), [
    activeProfile,
    profilesList,
    incomeSources,
    dependents,
    documents,
    latestAuditResult,
    isFilingLoading,
    filingError,
    loadUserProfiles,
    selectActiveProfile,
    createNewProfile,
    updateActiveProfile,
    deleteProfile,
    addIncomeSource,
    updateIncomeSource,
    removeIncomeSource,
    addDependent,
    updateDependent,
    removeDependent,
    refreshDocuments,
    executeAudit,
    refreshActiveProfileData,
    clearFilingError,
  ]);

  return <TaxFilingContext.Provider value={value}>{children}</TaxFilingContext.Provider>;
};

/**
 * Hook truy xuất trạng thái quyết toán thuế
 */
export function useTaxFiling(): TaxFilingContextType {
  const context = useContext(TaxFilingContext);
  if (!context) {
    throw new Error('useTaxFiling() phải được sử dụng bên trong một <TaxFilingProvider>');
  }
  return context;
}

export default TaxFilingContext;
