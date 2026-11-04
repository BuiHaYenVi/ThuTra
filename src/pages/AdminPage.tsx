import React, { useState, useMemo, useEffect } from 'react';
import {
  Sliders,
  SlidersHorizontal,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  Plus,
  Edit3,
  History,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  FileText,
  UserCheck,
  Database,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Save,
  Check,
  Info
} from 'lucide-react';
import type {
  AdminRule,
  RiskLevel,
  TaxParametersConfig
} from '../data/mockAdminRules';
import {
  initialAdminRules,
  defaultTaxParameters,
  progressiveTaxBrackets,
  mockRagDocuments,
  mockMaskedAuditLogs
} from '../data/mockAdminRules';
import { adminApi } from '../services/admin.api';
import type { ScreenType } from '../App';
import type { AuditLogItemDto } from '../types/business.types';

interface AdminPageProps {
  onNavigate?: (screen: ScreenType) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  // 1. Tab State - 4 separate, distinct tabs
  const [activeTab, setActiveTab] = useState<'rules' | 'parameters' | 'knowledge' | 'privacy'>('rules');

  // 2. Rules List State
  const [rules, setRules] = useState<AdminRule[]>(initialAdminRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | RiskLevel>('all');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // 3. Modals & Drawers State
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AdminRule | null>(null);
  const [historyRule, setHistoryRule] = useState<AdminRule | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 4. Dynamic Tax Parameters State
  const [taxParams, setTaxParams] = useState<TaxParametersConfig>(defaultTaxParameters);
  const [simulatedMonthlyIncome, setSimulatedMonthlyIncome] = useState<number>(35000000); // 35 triệu/tháng
  const [simulatedDependents, setSimulatedDependents] = useState<number>(1);

  // 5. Data Minimization & Privacy State (Decree 13/2023/NĐ-CP)
  const [isDataMasked, setIsDataMasked] = useState<boolean>(true);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState<boolean>(true);
  const [blockRawExport, setBlockRawExport] = useState<boolean>(true);
  const [immutableAuditLog, setImmutableAuditLog] = useState<boolean>(true);
  const [serverAuditLogs, setServerAuditLogs] = useState<AuditLogItemDto[]>([]);

  // 6. RAG Knowledge Query Sandbox State
  const [ragQuery, setRagQuery] = useState('Người phụ thuộc trên 18 tuổi đang theo học đại học cần hồ sơ chứng minh gì?');
  const [ragQueryResult, setRagQueryResult] = useState<string | null>(null);
  const [isQueryingRag, setIsQueryingRag] = useState(false);

  // Add Rule Form State
  const [newRuleForm, setNewRuleForm] = useState<Partial<AdminRule>>({
    code: 'R16',
    title: '',
    description: '',
    legalReference: 'TT 80/2021',
    riskLevel: 'warning',
    category: 'deductions',
    isActive: true
  });

  // Calculate active rules count
  const activeRulesCount = useMemo(() => rules.filter(r => r.isActive).length, [rules]);
  const totalRulesCount = rules.length;

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      // Risk filter
      if (selectedRiskFilter !== 'all' && rule.riskLevel !== selectedRiskFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && !rule.isActive) return false;
      if (statusFilter === 'inactive' && rule.isActive) return false;
      // Category filter
      if (selectedCategoryFilter !== 'all' && rule.category !== selectedCategoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = rule.code.toLowerCase().includes(q);
        const matchTitle = rule.title.toLowerCase().includes(q);
        const matchDesc = rule.description.toLowerCase().includes(q);
        const matchLegal = rule.legalReference.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchDesc && !matchLegal) {
          return false;
        }
      }
      return true;
    });
  }, [rules, selectedRiskFilter, statusFilter, selectedCategoryFilter, searchQuery]);

  // Nạp dữ liệu thật từ Backend khi mở trang
  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      try {
        const rulesRes = await adminApi.getAdminRules();
        if (isMounted && rulesRes.data && rulesRes.data.length > 0) {
          setRules(prev => {
            return rulesRes.data.map(serverRule => {
              const existing = prev.find(p => p.code === serverRule.code);
              return {
                id: serverRule.id || serverRule.code,
                code: serverRule.code,
                title: serverRule.title,
                description: serverRule.description,
                legalReference: serverRule.legalReference || 'TT 80/2021',
                riskLevel: (serverRule.riskLevel as RiskLevel) || 'warning',
                riskLevelLabel:
                  serverRule.riskLevel === 'error'
                    ? 'Lỗi nghiêm trọng'
                    : serverRule.riskLevel === 'warning'
                    ? 'Cảnh báo xung đột'
                    : 'Gợi ý tối ưu',
                isActive: serverRule.isActive,
                category: (serverRule.category as any) || 'deductions',
                executionFrequency: existing?.executionFrequency || '100% hồ sơ quét',
                lastUpdated: 'Máy chủ thật',
                updatedBy: serverRule.updatedByName || 'Admin Kỹ thuật',
                conditionSnippet: serverRule.conditionSnippet || existing?.conditionSnippet || 'ruleValidator() === true',
                history: existing?.history || []
              };
            });
          });
        }
      } catch (err: unknown) {
        console.warn('Lỗi khi nạp rules từ backend:', err);
      }

      try {
        const settingsRes = await adminApi.getPublicSettings();
        if (isMounted && settingsRes.data) {
          setTaxParams(prev => ({
            ...prev,
            personalDeductionMonthly: settingsRes.data.personalDeductionMonthly || prev.personalDeductionMonthly,
            personalDeductionYearly: settingsRes.data.personalDeductionYearly || prev.personalDeductionYearly,
            dependentDeductionMonthly: settingsRes.data.dependentDeductionMonthly || prev.dependentDeductionMonthly,
            dependentDeductionYearly: settingsRes.data.dependentDeductionYearly || prev.dependentDeductionYearly,
            baseSalary: settingsRes.data.baseSalary || prev.baseSalary,
          }));
        }
      } catch (err: unknown) {
        console.warn('Lỗi khi nạp settings:', err);
      }

      try {
        const auditRes = await adminApi.getAuditLogs({ limit: 20 });
        if (isMounted && auditRes.data?.items) {
          setServerAuditLogs(auditRes.data.items);
        }
      } catch (err: unknown) {
        console.warn('Lỗi khi nạp audit logs từ backend:', err);
      }
    };

    fetchAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Toggle Rule Status
  const handleToggleRule = async (ruleId: string) => {
    const targetRule = rules.find(r => r.id === ruleId || r.code === ruleId);
    if (!targetRule) return;
    const nextState = !targetRule.isActive;

    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isActive: nextState } : r))
    );
    showToast(`Đã ${nextState ? 'kích hoạt' : 'vô hiệu hóa'} quy tắc ${targetRule.code}`);

    try {
      await adminApi.updateAdminRule(targetRule.code, { isActive: nextState });
    } catch (err: unknown) {
      console.warn('Không thể đồng bộ trạng thái rule lên server:', err);
    }
  };

  // Handle Add New Rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.title || !newRuleForm.code) {
      alert('Vui lòng nhập mã quy tắc và tiêu đề');
      return;
    }

    const newRule: AdminRule = {
      id: newRuleForm.code,
      code: newRuleForm.code,
      title: newRuleForm.title || 'Quy tắc mới',
      description: newRuleForm.description || '',
      legalReference: newRuleForm.legalReference || 'TT 80/2021',
      riskLevel: newRuleForm.riskLevel || 'warning',
      riskLevelLabel:
        newRuleForm.riskLevel === 'error'
          ? 'Lỗi nghiêm trọng'
          : newRuleForm.riskLevel === 'warning'
          ? 'Cảnh báo xung đột'
          : 'Gợi ý tối ưu',
      isActive: true,
      category: (newRuleForm.category as AdminRule['category']) || 'deductions',
      executionFrequency: 'Quy tắc mới tạo',
      lastUpdated: 'Hôm nay',
      updatedBy: 'Admin Kỹ thuật',
      conditionSnippet: 'customLogicRule() === true',
      history: [
        {
          version: 'v1.0',
          date: 'Hôm nay',
          editor: 'Admin Kỹ thuật',
          note: 'Khởi tạo quy tắc kiểm tra mới'
        }
      ]
    };

    setRules(prev => [newRule, ...prev]);
    setIsAddRuleModalOpen(false);
    setNewRuleForm({
      code: `R${rules.length + 2}`,
      title: '',
      description: '',
      legalReference: 'TT 80/2021',
      riskLevel: 'warning',
      category: 'deductions',
      isActive: true
    });
    showToast(`Đã thêm thành công quy tắc ${newRule.code}!`);
  };

  // Handle Update Rule
  const handleUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setRules(prev =>
      prev.map(r => {
        if (r.id === editingRule.id) {
          return {
            ...editingRule,
            lastUpdated: 'Vừa xong',
            updatedBy: 'Admin Kỹ thuật',
            history: [
              {
                version: 'v2.4 (Mới)',
                date: 'Hôm nay',
                editor: 'Admin Kỹ thuật',
                note: `Cập nhật nội dung & cấu hình điều kiện (${editingRule.legalReference})`
              },
              ...(r.history || [])
            ]
          };
        }
        return r;
      })
    );
    setEditingRule(null);
    showToast(`Đã lưu thay đổi cho quy tắc ${editingRule.code}`);
  };

  // Handle Synchronize Schema
  const triggerSync = () => {
    setIsSyncModalOpen(true);
    setIsSyncing(true);
    setSyncProgress(10);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  // RAG Semantic Query simulation
  const handleRunRagQuery = () => {
    setIsQueryingRag(true);
    setTimeout(() => {
      setIsQueryingRag(false);
      setRagQueryResult(
        'Căn cứ Tiết d.1.2 Điểm d Khoản 1 Điều 9 Thông tư 111/2013/TT-BTC:\n' +
        '• Con từ 18 tuổi trở lên đang theo học tại các trường đại học, cao đẳng, trung cấp chuyên nghiệp, dạy nghề (kể cả du học) có thu nhập bình quân tháng trong năm không quá 1.000.000 đồng.\n' +
        '• Hồ sơ chứng minh: Bản chụp CCCD/CMND của con + Bản sao Thẻ sinh viên hoặc Giấy xác nhận của nhà trường hoặc bản sao chứng từ nộp học phí.\n' +
        '• Tương đồng ngữ nghĩa vector: 0.948 (text-embedding-3 / pgvector top-1 match).'
      );
    }, 700);
  };

  // Calculate simulated tax with dynamic parameters
  const simulatedTax = useMemo(() => {
    const personal = taxParams.personalDeductionMonthly;
    const dependents = taxParams.dependentDeductionMonthly * simulatedDependents;
    const insurance = simulatedMonthlyIncome * (taxParams.socialInsuranceRate + taxParams.healthInsuranceRate + taxParams.unemploymentInsuranceRate) / 100;
    const taxableIncome = Math.max(0, simulatedMonthlyIncome - personal - dependents - insurance);

    // Calculate with progressive 7 brackets
    let tax = 0;
    if (taxableIncome <= 5000000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      tax = taxableIncome * 0.1 - 250000;
    } else if (taxableIncome <= 18000000) {
      tax = taxableIncome * 0.15 - 750000;
    } else if (taxableIncome <= 32000000) {
      tax = taxableIncome * 0.2 - 1650000;
    } else if (taxableIncome <= 52000000) {
      tax = taxableIncome * 0.25 - 3250000;
    } else if (taxableIncome <= 80000000) {
      tax = taxableIncome * 0.3 - 5850000;
    } else {
      tax = taxableIncome * 0.35 - 9850000;
    }

    return {
      taxableIncome,
      tax: Math.max(0, Math.round(tax)),
      insurance: Math.round(insurance),
      personal,
      dependents
    };
  }, [simulatedMonthlyIncome, simulatedDependents, taxParams]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      {onNavigate && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="hover:text-emerald-700 font-medium transition-colors cursor-pointer"
          >
            Bảng điều khiển
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Phân hệ Quản trị Rule Engine</span>
        </div>
      )}

      {/* ========================================================
          A. HEADER PHÂN HỆ ADMIN (Khối Card trắng bo góc trên cùng)
          ======================================================== */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Bên trái: Icon + Tiêu đề lớn + 3 Badges */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#046a4e] shadow-2xs shrink-0">
                <Sliders className="w-6 h-6 text-[#046a4e]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  Trung tâm Quản trị Quy tắc & Vận hành Hệ thống ThuTra
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Giám sát bộ máy Rule Engine thời gian thực, quản lý logic đối soát thuế và bảo vệ quyền riêng tư
                </p>
              </div>
            </div>

            {/* 3 Badges thông tin */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Badge 1: Xanh lam nhạt */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-2xs">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Quyền hạn: Quản trị viên Kỹ thuật (System Admin)</span>
              </div>

              {/* Badge 2: Xanh ngọc nhạt */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#046a4e] border border-emerald-200/80 text-xs font-semibold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#046a4e]" />
                <span>Chế độ Bảo mật: Data Minimization (Privacy by Design)</span>
              </div>

              {/* Badge 3: Tím pastel nhạt */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-semibold shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Phiên bản Rule Engine: v2.4 (TT 80/2021 & TT 111/2013)</span>
              </div>
            </div>
          </div>

          {/* Bên phải: Nút Đồng bộ + Nút Thêm Quy tắc */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-start lg:self-center">
            {/* Nút viền trắng: Đồng bộ Biểu mẫu Mới */}
            <button
              type="button"
              onClick={triggerSync}
              className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-200/90 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Đồng bộ Biểu mẫu Mới</span>
            </button>

            {/* Nút xanh lục đậm (#046a4e): Thêm Quy tắc Kiểm tra Mới */}
            <button
              type="button"
              onClick={() => setIsAddRuleModalOpen(true)}
              className="bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.98] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-100" />
              <span>+ Thêm Quy tắc Kiểm tra Mới</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          B. 4 THẺ KPI GIÁM SÁT VẬN HÀNH (Grid 4 cột đều nhau)
          ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: 100% Hoạt động */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#046a4e]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="bg-emerald-50 text-[#046a4e] border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#046a4e]"></span>
              <span>100% Hoạt động</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeRulesCount}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {totalRulesCount}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-1">Rules Đang hoạt động</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              Không phát hiện tắc nghẽn logic
            </p>
          </div>
        </div>

        {/* Thẻ 2: Tần suất cao */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Tần suất cao
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rule R10
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-1">Trùng giảm trừ bản thân</h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5 leading-tight">
              Xuất hiện ở 62% hồ sơ 2 nguồn
            </p>
          </div>
        </div>

        {/* Thẻ 3: Cơ sở Tri thức AI */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Ready (pgvector)
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                148
              </span>
              <span className="text-sm font-semibold text-slate-400">
                Chunks
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-1">Cơ sở Tri thức RAG Chatbot</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              Embeddings text-embedding-3
            </p>
          </div>
        </div>

        {/* Thẻ 4: Đạt chuẩn thẩm định */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#046a4e]">
              <CheckCircle2 className="w-5 h-5 text-[#046a4e]" />
            </div>
            <span className="bg-teal-50 text-[#046a4e] border border-teal-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Đạt chuẩn thẩm định
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#046a4e] tracking-tight">
              98.6%
            </div>
            <h3 className="text-xs font-bold text-slate-800 mt-1">Tỷ lệ Hồ sơ Hợp lệ sau Rà soát</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              Giảm thiểu 92% rủi ro truy thu
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          C. THANH TABS ĐIỀU HƯỚNG (KHẮC PHỤC TRIỆT ĐỂ LỖI DÍNH CHÙM CHỮ)
          Tách riêng thành 4 button độc lập có gap-2, segmented styling
          ======================================================== */}
      <nav aria-label="Phân hệ Quản trị Tabs" className="bg-slate-200/70 p-1.5 rounded-2xl border border-slate-200/90 flex flex-wrap lg:flex-nowrap gap-2 items-center w-full shadow-2xs">
        {/* Tab 1: Quản trị Quy tắc Rule Engine */}
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-1 text-center ${
            activeTab === 'rules'
              ? 'bg-[#046a4e] text-white shadow-sm ring-1 ring-[#046a4e]/20'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <SlidersHorizontal className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'rules' ? 'text-emerald-200' : 'text-slate-500'}`} />
          <span>1. Quản trị Quy tắc Rule Engine</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
            activeTab === 'rules' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {totalRulesCount}
          </span>
        </button>

        {/* Tab 2: Cấu hình Tham số Thuế Động */}
        <button
          type="button"
          onClick={() => setActiveTab('parameters')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-1 text-center ${
            activeTab === 'parameters'
              ? 'bg-[#046a4e] text-white shadow-sm ring-1 ring-[#046a4e]/20'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <Sliders className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'parameters' ? 'text-emerald-200' : 'text-slate-500'}`} />
          <span>2. Cấu hình Tham số Thuế Động</span>
        </button>

        {/* Tab 3: Cơ sở Tri thức RAG AI */}
        <button
          type="button"
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-1 text-center ${
            activeTab === 'knowledge'
              ? 'bg-[#046a4e] text-white shadow-sm ring-1 ring-[#046a4e]/20'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'knowledge' ? 'text-emerald-200' : 'text-slate-500'}`} />
          <span>3. Cơ sở Tri thức RAG AI</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
            activeTab === 'knowledge' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-100 text-slate-600'
          }`}>
            148
          </span>
        </button>

        {/* Tab 4: Giám sát & Quyền riêng tư (Masked Log) - NĐ 13/2023 */}
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-1 text-center ${
            activeTab === 'privacy'
              ? 'bg-[#046a4e] text-white shadow-sm ring-1 ring-[#046a4e]/20'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'privacy' ? 'text-emerald-200' : 'text-slate-500'}`} />
          <span>4. Giám sát & Quyền riêng tư (Masked Log)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
        </button>
      </nav>

      {/* ========================================================
          TAB 1: QUẢN TRỊ QUY TẮC RULE ENGINE (BẢNG QUY TẮC)
          ======================================================== */}
      {activeTab === 'rules' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {/* Header Bảng & Bộ lọc */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tiêu đề & Badge Active */}
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Danh mục quy tắc xác thực ({filteredRules.length} Rules)
              </h2>
              <span className="bg-emerald-50 text-[#046a4e] border border-emerald-200/90 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#046a4e]"></span>
                <span>v2.4 Active</span>
              </span>
            </div>

            {/* Công cụ Lọc & Tìm kiếm */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              {/* Dropdown Mức độ rủi ro */}
              <div className="relative min-w-[170px]">
                <select
                  value={selectedRiskFilter}
                  onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] font-medium cursor-pointer"
                >
                  <option value="all">Tất cả mức độ rủi ro</option>
                  <option value="error">🔴 Lỗi nghiêm trọng</option>
                  <option value="warning">🟠 Cảnh báo xung đột</option>
                  <option value="suggestion">🟢 Gợi ý tối ưu</option>
                </select>
              </div>

              {/* Ô tìm kiếm nhanh */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc rule, từ khóa..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-700 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Nút Bộ lọc nâng cao */}
              <button
                type="button"
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isAdvancedFilterOpen || selectedCategoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'bg-emerald-50 text-[#046a4e] border-emerald-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Bộ lọc nâng cao</span>
              </button>
            </div>
          </div>

          {/* Panel Bộ lọc nâng cao khi mở */}
          {isAdvancedFilterOpen && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Phân nhóm:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="all">Tất cả nhóm</option>
                  <option value="deductions">Giảm trừ gia cảnh</option>
                  <option value="dependents">Người phụ thuộc</option>
                  <option value="routing">Định tuyến CQT</option>
                  <option value="incomes">Nguồn thu nhập & Chứng từ</option>
                  <option value="insurance">Bảo hiểm bắt buộc</option>
                  <option value="authorization">Ủy quyền quyết toán</option>
                  <option value="deadline">Hạn chót & Chậm nộp</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang bật (Active)</option>
                  <option value="inactive">Đã tắt (Inactive)</option>
                </select>
              </div>

              {(selectedCategoryFilter !== 'all' || statusFilter !== 'all' || selectedRiskFilter !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    setStatusFilter('all');
                    setSelectedRiskFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-emerald-700 hover:underline font-semibold ml-auto cursor-pointer"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Bảng dữ liệu Quy tắc (Rules Table) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-20 text-center">Mã Rule</th>
                  <th className="py-3 px-4 min-w-[280px]">Nội dung quy tắc thẩm tra</th>
                  <th className="py-3 px-4 w-44">Căn cứ pháp lý</th>
                  <th className="py-3 px-4 w-44 text-center">Mức độ rủi ro</th>
                  <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                  <th className="py-3 px-4 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium">Không tìm thấy quy tắc nào phù hợp với bộ lọc</p>
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => {
                    return (
                      <tr
                        key={rule.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          !rule.isActive ? 'opacity-60 bg-slate-50/40' : ''
                        }`}
                      >
                        {/* 1. Mã Rule */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-mono font-bold text-[#046a4e] text-xs bg-emerald-50/80 border border-emerald-200/80 px-2 py-1 rounded-md">
                            {rule.code}
                          </span>
                        </td>

                        {/* 2. Nội dung quy tắc thẩm tra */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-900 text-xs leading-snug">
                              {rule.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {rule.description}
                            </p>
                          </div>
                        </td>

                        {/* 3. Căn cứ pháp lý */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                            <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{rule.legalReference}</span>
                          </span>
                        </td>

                        {/* 4. Mức độ rủi ro */}
                        <td className="py-4 px-4 text-center">
                          {rule.riskLevel === 'error' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>{rule.riskLevelLabel}</span>
                            </span>
                          )}
                          {rule.riskLevel === 'warning' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{rule.riskLevelLabel}</span>
                            </span>
                          )}
                          {rule.riskLevel === 'suggestion' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#046a4e] border border-emerald-200 text-[11px] font-semibold whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{rule.riskLevelLabel}</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Trạng thái (Interactive Switch Toggle) */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={rule.isActive}
                            onClick={() => handleToggleRule(rule.id)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors mx-auto ${
                              rule.isActive ? 'bg-[#046a4e]' : 'bg-slate-300'
                            }`}
                            title={rule.isActive ? 'Bấm để tắt quy tắc' : 'Bấm để bật quy tắc'}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                rule.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        {/* 6. Thao tác (Edit & History) */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Nút Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingRule(rule)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa quy tắc"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Nút History */}
                            <button
                              type="button"
                              onClick={() => setHistoryRule(rule)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Xem lịch sử phiên bản"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bảng Footer Thông kê */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Hiển thị <strong>{filteredRules.length}</strong> / <strong>{totalRulesCount}</strong> quy tắc thẩm tra đã kích hoạt trên toàn hệ thống
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{rules.filter(r => r.riskLevel === 'error').length} Lỗi nghiêm trọng</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{rules.filter(r => r.riskLevel === 'warning').length} Cảnh báo xung đột</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{rules.filter(r => r.riskLevel === 'suggestion').length} Gợi ý tối ưu</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 2: CẤU HÌNH THAM SỐ THUẾ ĐỘNG (DYNAMIC PARAMETERS)
          ======================================================== */}
      {activeTab === 'parameters' && (
        <section className="space-y-6">
          {/* Header Card Giới thiệu */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Cấu hình Tham số Thuế Thu nhập Cá nhân Động
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các tham số này được toàn bộ Rule Engine & Máy tính thuế tham chiếu động, không hardcode trong mã nguồn.
                </p>
              </div>
              <span className="bg-emerald-50 text-[#046a4e] border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                Hiệu lực: Kỳ tính thuế 2024 - 2025
              </span>
            </div>

            {/* Grid Tham số chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {/* 1. Mức giảm trừ bản thân */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Giảm trừ bản thân (Tháng)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">NQ 954/2020</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={taxParams.personalDeductionMonthly}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTaxParams(prev => ({
                        ...prev,
                        personalDeductionMonthly: val,
                        personalDeductionYearly: val * 12
                      }));
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tương đương {new Intl.NumberFormat('vi-VN').format(taxParams.personalDeductionYearly)} VNĐ/năm
                </p>
              </div>

              {/* 2. Mức giảm trừ người phụ thuộc */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Giảm trừ 01 NPT (Tháng)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">NQ 954/2020</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={taxParams.dependentDeductionMonthly}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTaxParams(prev => ({
                        ...prev,
                        dependentDeductionMonthly: val,
                        dependentDeductionYearly: val * 12
                      }));
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tương đương {new Intl.NumberFormat('vi-VN').format(taxParams.dependentDeductionYearly)} VNĐ/năm/người
                </p>
              </div>

              {/* 3. Lương cơ sở đóng trần BHXH */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Mức lương cơ sở (BHXH trần)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">NĐ 73/2024</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={taxParams.baseSalary}
                    onChange={(e) => setTaxParams(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Trần đóng 20 lần: {new Intl.NumberFormat('vi-VN').format(taxParams.baseSalary * 20)} VNĐ/tháng
                </p>
              </div>

              {/* 4. Tỷ lệ trích BHXH, BHYT, BHTN */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Tỷ lệ Bảo hiểm bắt buộc (NLĐ)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">BHXH (8%)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={taxParams.socialInsuranceRate}
                      onChange={(e) => setTaxParams(prev => ({ ...prev, socialInsuranceRate: Number(e.target.value) }))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">BHYT (1.5%)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={taxParams.healthInsuranceRate}
                      onChange={(e) => setTaxParams(prev => ({ ...prev, healthInsuranceRate: Number(e.target.value) }))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">BHTN (1%)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={taxParams.unemploymentInsuranceRate}
                      onChange={(e) => setTaxParams(prev => ({ ...prev, unemploymentInsuranceRate: Number(e.target.value) }))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center font-bold"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Tổng tỷ lệ trừ trước thuế: {(taxParams.socialInsuranceRate + taxParams.healthInsuranceRate + taxParams.unemploymentInsuranceRate).toFixed(1)}%
                </p>
              </div>

              {/* 5. Khấu trừ vãng lai 10% */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Ngưỡng khấu trừ vãng lai 10%
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">TT 111/2013</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={taxParams.withholdingThreshold}
                    onChange={(e) => setTaxParams(prev => ({ ...prev, withholdingThreshold: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Chi trả từ 2 triệu/lần trở lên bắt buộc khấu trừ 10%
                </p>
              </div>

              {/* 6. Ngưỡng miễn nộp thêm sau quyết toán */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Ngưỡng miễn nộp thêm
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">NĐ 126/2020</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={taxParams.exemptionThreshold}
                    onChange={(e) => setTaxParams(prev => ({ ...prev, exemptionThreshold: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Số thuế phát sinh thêm ≤ 50.000 VNĐ được miễn nộp
                </p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setTaxParams(defaultTaxParameters);
                  showToast('Đã khôi phục tham số mặc định theo TT 111 & NQ 954');
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Khôi phục mặc định pháp luật
              </button>

              <button
                type="button"
                onClick={() => showToast('Đã lưu và áp dụng tham số thuế mới trên toàn hệ thống!')}
                className="bg-[#046a4e] hover:bg-[#03543e] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-200" />
                <span>Lưu & Cập nhật Rule Engine</span>
              </button>
            </div>
          </div>

          {/* Biểu thuế luỹ tiến từng phần 7 bậc */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Biểu thuế Luỹ tiến Từng phần 7 Bậc (Áp dụng cho thu nhập từ Tiền lương, Tiền công)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-4 w-16 text-center">Bậc</th>
                    <th className="py-2.5 px-4">Thu nhập tính thuế / Tháng</th>
                    <th className="py-2.5 px-4">Thu nhập tính thuế / Năm</th>
                    <th className="py-2.5 px-4 text-center">Thuế suất</th>
                    <th className="py-2.5 px-4">Công thức tính nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {progressiveTaxBrackets.map((item) => (
                    <tr key={item.bracket} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-bold text-center text-slate-700">
                        Bậc {item.bracket}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {item.monthlyRange}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">
                        {item.yearlyRange}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-bold text-[#046a4e] bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.rate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                        {item.quickCalcFormula}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bộ Mô phỏng Tác động Live Simulation Sandbox */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-100">
                  Sandbox Mô phỏng Tác động Biến số Thuế Tức thì
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Live Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Thu nhập gộp giả định (VNĐ/tháng):
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={simulatedMonthlyIncome}
                  onChange={(e) => setSimulatedMonthlyIncome(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Số người phụ thuộc đăng ký:
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={simulatedDependents}
                  onChange={(e) => setSimulatedDependents(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
                />
              </div>

              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400">Thuế TNCN tạm tính / tháng:</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {new Intl.NumberFormat('vi-VN').format(simulatedTax.tax)} VNĐ
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Thu nhập tính thuế: {new Intl.NumberFormat('vi-VN').format(simulatedTax.taxableIncome)} VNĐ
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 3: CƠ SỞ TRI THỨC RAG AI (KNOWLEDGE BASE)
          ======================================================== */}
      {activeTab === 'knowledge' && (
        <section className="space-y-6">
          {/* Header Card Giới thiệu RAG */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Cơ sở Tri thức Pháp lý Thuế RAG (Retrieval-Augmented Generation)
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Hệ thống vector embeddings phục vụ Chatbot Trợ lý Thuế & Thẩm tra logic Rule Engine tự động trích dẫn căn cứ luật
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast('Đang quét và đồng bộ lại 148 chunks văn bản pháp luật...');
                }}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                <span>Re-index Vector Embeddings</span>
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <span className="text-slate-400 text-xs">Vector Database Engine:</span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">PostgreSQL pgvector</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">HNSW index (Cosine distance)</p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <span className="text-slate-400 text-xs">Embedding Model:</span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">text-embedding-3-small</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">1536 chiều, chunk size 512 tokens</p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <span className="text-slate-400 text-xs">Điểm Cosine trung bình:</span>
                <h4 className="text-sm font-bold text-[#046a4e] mt-1">0.932 / 1.000</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Độ chính xác truy xuất cao</p>
              </div>
            </div>

            {/* Danh sách Văn bản Pháp lý đã Nạp */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Danh mục Văn bản Nguồn trong Vector Store ({mockRagDocuments.length} văn bản)
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {mockRagDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 bg-white hover:bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                          {doc.code}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {doc.category}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {doc.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-slate-500 text-[11px]">
                      <span className="font-medium">
                        <strong>{doc.chunksCount}</strong> Chunks
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Semantic Query Testing Playground */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Công cụ Thử nghiệm Truy vấn Ngữ nghĩa (Semantic Search Tester)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">pgvector Top-K RAG</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Nhập câu hỏi nghiệp vụ hoặc tình huống thuế..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleRunRagQuery}
                disabled={isQueryingRag}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isQueryingRag ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-200" />
                )}
                <span>Truy vấn Vector</span>
              </button>
            </div>

            {ragQueryResult && (
              <div className="bg-slate-50 border border-purple-200 rounded-xl p-4 text-xs space-y-2 animate-fadeIn">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                  Kết quả trích xuất Chunk cao nhất (Top Match):
                </span>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {ragQueryResult}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 4: GIÁM SÁT & QUYỀN RIÊNG TƯ (MASKED LOG)
          TÍCH HỢP NGHỊ ĐỊNH 13/2023/NĐ-CP (DATA MINIMIZATION)
          ======================================================== */}
      {activeTab === 'privacy' && (
        <section className="space-y-6">
          {/* Card Tuyên bố Tuân thủ Nghị định 13/2023/NĐ-CP */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#046a4e] shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#046a4e]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Tuân thủ Nguyên tắc Thu nhỏ Dữ liệu (Data Minimization)
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Nghị định 13/2023/NĐ-CP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                    Hệ thống ThuTra Rule Engine được kiến trúc theo tiêu chuẩn <strong>Privacy by Design</strong>: Chỉ xử lý các trường dữ liệu tối thiểu phục vụ kiểm tra logic thuế; tuyệt đối không lưu trữ dữ liệu định danh thô (Raw PII) trong log vận hành.
                  </p>
                </div>
              </div>

              {/* Toggle Live Data Masking Switch */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 shrink-0 self-start lg:self-center">
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {isDataMasked ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
                    <span>Chế độ Che Dấu PII (Masking)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isDataMasked ? 'Đang che giấu theo NĐ 13' : 'Hiển thị dữ liệu quản trị'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDataMasked(!isDataMasked)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isDataMasked ? 'bg-[#046a4e]' : 'bg-amber-500'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isDataMasked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 4 Trụ cột Tuân thủ NĐ 13/2023 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trụ cột 1</span>
                <h4 className="text-xs font-bold text-slate-900">Giới hạn Mục đích</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Chỉ sử dụng dữ liệu để kiểm tra nghĩa vụ quyết toán TNCN theo Điều 9 NĐ 13.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trụ cột 2</span>
                <h4 className="text-xs font-bold text-slate-900">Thu nhỏ Dữ liệu</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Tự động che giấu số CCCD, MST, STK ngân hàng và số điện thoại trên toàn bộ nhật ký.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trụ cột 3</span>
                <h4 className="text-xs font-bold text-slate-900">Giới hạn Lưu trữ</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Tự động hủy In-memory cache sau khi kết thúc phiên; hủy Audit log sau 30 ngày.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trụ cột 4</span>
                <h4 className="text-xs font-bold text-slate-900">Mã hóa Toàn diện</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Mã hóa AES-256 đối với trường nhạy cảm và HMAC-SHA256 với định danh tạm thời.
                </p>
              </div>
            </div>

            {/* Sandbox So sánh: Raw Data vs Data Minimization */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Minh chứng Thực thi Data Minimization (Trước vs Sau Xử lý Thẩm tra)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Dữ liệu Gốc (Bị chặn ghi log) */}
                <div className="bg-white border border-rose-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-rose-700 font-bold font-sans text-xs pb-1 border-b border-rose-100">
                    <span>❌ Dữ liệu Gốc Cá nhân (Raw PII - Không lưu trữ)</span>
                    <span className="text-[10px] bg-rose-50 px-2 py-0.5 rounded">Nguy cơ cao</span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div>CCCD: <strong className="text-slate-900">{isDataMasked ? '079******492' : '079095018492'}</strong></div>
                    <div>Họ và tên: <strong className="text-slate-900">{isDataMasked ? 'Ng*** H**** N**' : 'Nguyễn Hoàng Nam'}</strong></div>
                    <div>MST cá nhân: <strong className="text-slate-900">{isDataMasked ? '849*****81' : '8492019381'}</strong></div>
                    <div>Thu nhập chịu thuế: <strong className="text-slate-900">324.000.000 VNĐ</strong></div>
                    <div>STK nhận hoàn thuế: <strong className="text-slate-900">{isDataMasked ? '************1012' : '19034567891012'}</strong></div>
                  </div>
                </div>

                {/* Dữ liệu Thu Nhỏ (Tuân thủ NĐ 13/2023) */}
                <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[#046a4e] font-bold font-sans text-xs pb-1 border-b border-emerald-100">
                    <span>✅ Dữ liệu Sau Thu Nhỏ (Data Minimization)</span>
                    <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Đạt chuẩn NĐ 13</span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div>Pseudonym Token: <strong className="text-emerald-700">sha256_e9c3...81f4</strong></div>
                    <div>Thẩm tra giảm trừ bản thân: <strong className="text-emerald-700">Valid (1/1 nguồn)</strong></div>
                    <div>Thẩm tra người phụ thuộc: <strong className="text-emerald-700">Passed (R01, R02)</strong></div>
                    <div>Dải bậc thuế TNTT: <strong className="text-emerald-700">Bậc 2 (10%)</strong></div>
                    <div>Bộ nhớ tạm In-Memory: <strong className="text-emerald-700">Tự động Purge sau 0.05s</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng Nhật ký Thẩm tra An toàn (Masked Audit Logs) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Nhật ký Giám sát Xử lý Rule Engine (Masked Audit Logs)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toàn bộ thông tin định danh cá nhân đã được tự động che dấu theo Nghị định 13/2023/NĐ-CP
                </p>
              </div>

              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {serverAuditLogs.length > 0 ? serverAuditLogs.length : mockMaskedAuditLogs.length} Phiên gần nhất
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-3 px-4">Mã Phiên / Log ID</th>
                    <th className="py-3 px-4">Thời điểm</th>
                    <th className="py-3 px-4">Định danh Masked</th>
                    <th className="py-3 px-4">Mục đích xử lý (Điều 9 NĐ 13)</th>
                    <th className="py-3 px-4 text-center">Rules Thẩm tra</th>
                    <th className="py-3 px-4 text-center">Hạn lưu vết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {serverAuditLogs.length > 0 ? (
                    serverAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {log.id.length > 12 ? `${log.id.slice(0, 8)}...` : log.id}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          <div>CCCD: {isDataMasked ? log.maskedCccd : '079095018492'}</div>
                          <div className="text-[10px] text-slate-400">MST: {isDataMasked ? log.maskedMst : '8492019381'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {log.purpose || 'Quyết toán thuế TNCN'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {(log.triggeredRules || []).map(r => (
                              <span key={r} className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 text-[11px] whitespace-nowrap">
                          {log.minimizationStatus || '1 năm'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    mockMaskedAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {log.id}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          <div>CCCD: {isDataMasked ? log.maskedCccd : '079095018492'}</div>
                          <div className="text-[10px] text-slate-400">MST: {isDataMasked ? log.maskedMst : '8492019381'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {log.purpose}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {log.triggeredRules.map(r => (
                              <span key={r} className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 text-[11px] whitespace-nowrap">
                          {log.retentionExpires}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thiết lập Chính sách Quyền riêng tư (Privacy Controls) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Cấu hình Chính sách Bảo vệ Dữ liệu Cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={autoPurgeEnabled}
                  onChange={(e) => setAutoPurgeEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-[#046a4e] focus:ring-[#046a4e]"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Tự động Purge sau 30 ngày</span>
                  <span className="text-[11px] text-slate-400">Xóa vĩnh viễn nhật ký thẩm tra vượt quá thời hạn lưu vết tối thiểu.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={blockRawExport}
                  onChange={(e) => setBlockRawExport(e.target.checked)}
                  className="mt-0.5 rounded text-[#046a4e] focus:ring-[#046a4e]"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Chặn xuất dữ liệu thô (Raw)</span>
                  <span className="text-[11px] text-slate-400">Ngăn quản trị viên xuất file Excel chứa số CCCD đầy đủ.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={immutableAuditLog}
                  onChange={(e) => setImmutableAuditLog(e.target.checked)}
                  className="mt-0.5 rounded text-[#046a4e] focus:ring-[#046a4e]"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Ghi vết Audit bất biến</span>
                  <span className="text-[11px] text-slate-400">Lưu vết mọi hành động bật/tắt hoặc sửa đổi quy tắc kiểm tra.</span>
                </div>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          MODAL 1: THÊM QUY TẮC KIỂM TRA MỚI
          ======================================================== */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#046a4e]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Thêm Quy tắc Kiểm tra Mới vào Rule Engine
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã Rule:</label>
                  <input
                    type="text"
                    required
                    value={newRuleForm.code}
                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mức độ rủi ro:</label>
                  <select
                    value={newRuleForm.riskLevel}
                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="error">🔴 Lỗi nghiêm trọng</option>
                    <option value="warning">🟠 Cảnh báo xung đột</option>
                    <option value="suggestion">🟢 Gợi ý tối ưu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu đề quy tắc:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đối soát mức trần đóng bảo hiểm bắt buộc..."
                  value={newRuleForm.title}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả chi tiết cách thẩm tra:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Kiểm tra nếu điều kiện cá nhân vi phạm quy định..."
                  value={newRuleForm.description}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Căn cứ pháp lý:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: TT 80/2021"
                    value={newRuleForm.legalReference}
                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, legalReference: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phân loại:</label>
                  <select
                    value={newRuleForm.category}
                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="deductions">Giảm trừ gia cảnh</option>
                    <option value="dependents">Người phụ thuộc</option>
                    <option value="routing">Định tuyến CQT</option>
                    <option value="incomes">Nguồn thu nhập</option>
                    <option value="insurance">Bảo hiểm bắt buộc</option>
                    <option value="authorization">Ủy quyền</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#046a4e] hover:bg-[#03543e] text-white px-5 py-2 rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Tạo quy tắc mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: CHỈNH SỬA QUY TẮC HIỆN CÓ
          ======================================================== */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#046a4e]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Chỉnh sửa Quy tắc: <span className="font-mono text-[#046a4e]">{editingRule.code}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu đề quy tắc:</label>
                <input
                  type="text"
                  required
                  value={editingRule.title}
                  onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả cách kiểm tra:</label>
                <textarea
                  rows={2}
                  required
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Căn cứ pháp lý:</label>
                  <input
                    type="text"
                    required
                    value={editingRule.legalReference}
                    onChange={(e) => setEditingRule({ ...editingRule, legalReference: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mức độ rủi ro:</label>
                  <select
                    value={editingRule.riskLevel}
                    onChange={(e) => {
                      const level = e.target.value as RiskLevel;
                      const label =
                        level === 'error'
                          ? 'Lỗi nghiêm trọng'
                          : level === 'warning'
                          ? 'Cảnh báo xung đột'
                          : 'Gợi ý tối ưu';
                      setEditingRule({ ...editingRule, riskLevel: level, riskLevelLabel: label });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="error">🔴 Lỗi nghiêm trọng</option>
                    <option value="warning">🟠 Cảnh báo xung đột</option>
                    <option value="suggestion">🟢 Gợi ý tối ưu</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="bg-[#046a4e] hover:bg-[#03543e] text-white px-5 py-2 rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: LỊCH SỬ THAY ĐỔI QUY TẮC (AUDIT TRAIL)
          ======================================================== */}
      {historyRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Lịch sử Hiệu chỉnh Rule Engine: <span className="font-mono text-[#046a4e]">{historyRule.code}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryRule(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-800">{historyRule.title}</p>
              <p className="text-slate-400 text-[11px]">Căn cứ: {historyRule.legalReference}</p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dòng thời gian phiên bản (Version Audit Trail):
              </h4>
              <div className="space-y-2 border-l-2 border-purple-200 pl-3">
                {historyRule.history && historyRule.history.length > 0 ? (
                  historyRule.history.map((h, idx) => (
                    <div key={idx} className="relative pb-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600 absolute -left-[17px] top-1"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                          {h.version}
                        </span>
                        <span className="text-[11px] text-slate-400">{h.date}</span>
                        <span className="text-[11px] text-slate-500 font-medium">({h.editor})</span>
                      </div>
                      <p className="text-slate-700 mt-1 leading-relaxed text-[11px]">
                        {h.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Chưa ghi nhận lịch sử thay đổi phiên bản.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHistoryRule(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ĐỒNG BỘ BIỂU MẪU MỚI (SYNC MODAL)
          ======================================================== */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#046a4e] flex items-center justify-center mx-auto">
              <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Đồng bộ Biểu mẫu & Quy định Thuế Mới Nhất
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kết nối Cổng dịch vụ Thuế điện tử Tổng cục Thuế và Cổng Pháp luật Quốc gia
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#046a4e] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                {isSyncing ? `Đang đồng bộ... ${syncProgress}%` : 'Hoàn tất 100%'}
              </span>
            </div>

            {!isSyncing && (
              <div className="bg-emerald-50 text-[#046a4e] border border-emerald-200 rounded-xl p-3 text-xs font-medium text-left">
                ✓ Đã cập nhật Schema tờ khai 02/QTT-TNCN chuẩn Thông tư 80/2021<br />
                ✓ Đã tải 148 vector embeddings mới nhất<br />
                ✓ Hệ thống Rule Engine đã sẵn sàng vận hành
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => {
                  setIsSyncModalOpen(false);
                  showToast('Đồng bộ dữ liệu biểu mẫu thành công!');
                }}
                className="bg-[#046a4e] hover:bg-[#03543e] text-white text-xs font-bold px-6 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? 'Vui lòng chờ...' : 'Đã hiểu & Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
