import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  LayoutGrid, 
  Users, 
  Calculator, 
  FileCheck, 
  Scale, 
  Layers,
  Settings,
  SlidersHorizontal,
  History
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTaxFiling } from '../../contexts/TaxFilingContext';
import type { ScreenType } from '../../App';

interface SidebarProps {
  currentScreen?: ScreenType;
  onNavigate?: (screen: ScreenType) => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onAddIncomeClick?: () => void;
  onLogoClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  activeTab = 'overview',
  onSelectTab,
  onAddIncomeClick,
  onLogoClick
}) => {
  const { user } = useAuth();
  const { activeProfile } = useTaxFiling();

  const userInitials = React.useMemo(() => {
    if (!user?.fullName) return 'TN';
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  const effectiveTab = (() => {
    if (currentScreen === 'dashboard') return 'overview';
    if (currentScreen === 'history') return 'history';
    if (currentScreen === 'dependents' || currentScreen === 'wizard_step1') return 'dependents';
    if (currentScreen === 'income' || currentScreen === 'wizard_step2') return 'incomes';
    if (currentScreen === 'export' || currentScreen === 'wizard_step3') return 'export';
    if (currentScreen === 'calculation' || currentScreen === 'forecast') return 'calculator';
    if (currentScreen === 'chat' || currentScreen === 'chatbot') return 'chatbot';
    if (currentScreen === 'settings') return 'settings';
    if (currentScreen === 'admin') return 'admin';
    return activeTab;
  })();

  const processMenuItems = [
    {
      id: 'overview',
      label: 'Tổng quan quyết toán',
      icon: LayoutGrid,
      badge: null,
      hasDot: true
    },
    {
      id: 'incomes',
      label: 'Nguồn thu nhập & Chứng từ',
      icon: Layers,
      active: false,
      badge: '3 cty',
      hasDot: false
    },
    {
      id: 'dependents',
      label: 'Người phụ thuộc & Giảm trừ',
      icon: Users,
      active: false,
      badge: null,
      hasDot: false
    },
    {
      id: 'calculator',
      label: 'Bảng tính & Tối ưu thuế',
      icon: Calculator,
      active: false,
      badge: null,
      hasDot: false
    },
    {
      id: 'export',
      label: 'Xuất hồ sơ & eTax',
      icon: FileCheck,
      active: false,
      badge: null,
      hasDot: false
    },
    {
      id: 'history',
      label: 'Lịch sử Quyết toán',
      icon: History,
      active: false,
      badge: '3 kỳ',
      hasDot: false
    }
  ];

  const handleItemClick = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    if (onNavigate) {
      if (id === 'overview') onNavigate('dashboard');
      else if (id === 'history') onNavigate('history');
      else if (id === 'incomes') onNavigate('income');
      else if (id === 'dependents') onNavigate('dependents');
      else if (id === 'calculator') onNavigate('calculation');
      else if (id === 'export') onNavigate('export');
      else if (id === 'chatbot') onNavigate('chat');
      else if (id === 'settings') onNavigate('settings');
      else if (id === 'admin') onNavigate('admin');
    }
  };

  const handleLogoClick = () => {
    if (onLogoClick) onLogoClick();
    if (onNavigate) onNavigate('dashboard');
  };

  const handleAddIncome = () => {
    if (onAddIncomeClick) onAddIncomeClick();
    if (onNavigate) onNavigate('income');
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between shadow-2xs select-none sticky top-20 min-h-[calc(100vh-6rem)]">
      <div className="p-4 flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={handleLogoClick}
          className="flex items-start gap-3 pb-4 cursor-pointer hover:opacity-90 transition-opacity border-b border-slate-100"
          title="Về Trang chủ Bảng điều khiển Quyết toán"
        >
          <div className="w-10 h-10 rounded-xl bg-[#046a4e] flex items-center justify-center text-white shadow-sm shrink-0">
            <FileText className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-[15px] tracking-tight">ThuTra TNCN</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                2024
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
              Hồ sơ: Cần đối soát chứng từ
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={handleAddIncome}
          className="w-full bg-[#046a4e] hover:bg-[#03543e] active:scale-[0.99] text-white font-medium text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-150 my-3.5 group cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
          <span>Thêm nguồn thu nhập</span>
        </button>

        {/* 1. SECTION: QUY TRÌNH QUYẾT TOÁN */}
        <div className="space-y-1">
          <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quy trình quyết toán
          </div>

          <nav className="space-y-1">
            {processMenuItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = effectiveTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                    isItemActive
                      ? 'bg-[#e7f5f0] text-[#046a4e] font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isItemActive ? 'text-[#046a4e]' : 'text-slate-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>

                  {item.hasDot && isItemActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#046a4e] shrink-0 ml-1"></span>
                  )}

                  {item.badge && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 2. SECTION: PHÂN HỆ QUẢN TRỊ (ADMIN) */}
        <div className="space-y-1 mt-3 pt-2 border-t border-slate-100/80">
          <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Phân hệ Quản trị (Admin)
          </div>

          <button
            type="button"
            onClick={() => handleItemClick('admin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
              effectiveTab === 'admin'
                ? 'bg-[#e7f5f0] text-[#046a4e] font-bold shadow-2xs ring-1 ring-[#046a4e]/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal
                className={`w-4 h-4 shrink-0 ${
                  effectiveTab === 'admin' ? 'text-[#046a4e]' : 'text-slate-400'
                }`}
              />
              <span className="whitespace-nowrap">Bộ máy Quy tắc & Vận hành</span>
            </div>

            {effectiveTab === 'admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#046a4e] shrink-0 ml-1"></span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Area: Secondary links, User info, Engine footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col space-y-3">
        <div className="space-y-1">
          <button 
            type="button"
            onClick={() => handleItemClick('chatbot')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
              effectiveTab === 'chatbot' ? 'bg-[#e7f5f0] text-[#046a4e] font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Scale className={`w-4 h-4 ${effectiveTab === 'chatbot' ? 'text-[#046a4e]' : 'text-slate-400'}`} />
            <span>Hỗ trợ pháp lý TNCN</span>
          </button>
          <button 
            type="button"
            onClick={() => handleItemClick('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
              effectiveTab === 'settings' ? 'bg-[#e7f5f0] text-[#046a4e] font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-4 h-4 ${effectiveTab === 'settings' ? 'text-[#046a4e]' : 'text-slate-400'}`} />
            <span>Cài đặt tài khoản</span>
          </button>
        </div>

        {/* User Mini Card */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                MST: {user?.mst || 'Chưa cập nhật'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                CQT: {activeProfile?.taxDepartmentName || 'Cục Thuế TP. Hà Nội'}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin_manager' ? 'Admin' : 'eTax Active'}
          </span>
        </div>

        {/* Engine Status Footer: Engine v2.4 kèm chấm tròn xanh lá */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
          <span>Engine v2.4</span>
          <span className="w-2 h-2 rounded-full bg-[#046a4e] ring-2 ring-emerald-100"></span>
        </div>
      </div>
    </div>
  );
};
