import React, { useState } from 'react';
import { 
  Search, 
  Smartphone, 
  Bell, 
  HelpCircle, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ScreenType } from '../../App';

interface HeaderProps {
  currentScreen?: ScreenType;
  onNavigate?: (screen: ScreenType) => void;
  onSearch?: (query: string) => void;
  onOpenEtaxModal?: () => void;
  onNavigateToForecast?: () => void;
  onNavigateToSettlementStep3?: () => void;
  onNavigateToStep2?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToHistory?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentScreen,
  onNavigate,
  onSearch, 
  onOpenEtaxModal,
  onNavigateToForecast,
  onNavigateToSettlementStep3,
  onNavigateToStep2,
  onNavigateToSettings,
  onNavigateToHistory,
  onLogout
}) => {
  const { user, logout } = useAuth();
  const [internalTab, setInternalTab] = useState<'year' | 'form' | 'guide'>('year');
  const [searchVal, setSearchVal] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'TT';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const activeTab = (() => {
    if (currentScreen === 'history' || currentScreen === 'forecast' || currentScreen === 'calculation') return 'year';
    if (currentScreen === 'wizard_step3' || currentScreen === 'export') return 'form';
    if (currentScreen === 'wizard_step2' || currentScreen === 'income') return 'guide';
    return internalTab;
  })();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Brand/Badge + Search box */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {currentScreen === 'admin' && (
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-[#046a4e] border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 select-none shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#046a4e]"></span>
            <span>Admin Engine</span>
          </div>
        )}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder={currentScreen === 'admin' ? "Tìm rule, căn cứ pháp lý, thông tư..." : "Tìm chứng từ, mã số thuế, cơ quan..."}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Middle: Navigation tabs matching two-line label style */}
      <div className="flex items-center gap-6 h-full text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => {
            setInternalTab('year');
            if (onNavigate) onNavigate('history');
            else if (onNavigateToHistory) onNavigateToHistory();
            else if (onNavigateToForecast) onNavigateToForecast();
          }}
          className={`h-full flex flex-col justify-center text-left relative transition-colors cursor-pointer py-1 ${
            activeTab === 'year' && currentScreen !== 'admin'
              ? 'text-slate-900 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#046a4e]'
              : 'hover:text-slate-900'
          }`}
          title="Xem Lịch sử quyết toán các năm (2022 - 2024)"
        >
          <span className="leading-tight text-[11px] text-slate-400 font-normal">Kỳ tính thuế</span>
          <span className="leading-tight font-bold text-xs text-slate-800">2024</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setInternalTab('form');
            if (onNavigate) onNavigate('export');
            else if (onNavigateToSettlementStep3) onNavigateToSettlementStep3();
          }}
          className={`h-full flex flex-col justify-center text-left relative transition-colors cursor-pointer py-1 ${
            activeTab === 'form' && currentScreen !== 'admin'
              ? 'text-slate-900 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#046a4e]'
              : 'hover:text-slate-900'
          }`}
          title="Xem Tờ khai quyết toán 02/QTT & Kiểm tra lỗi"
        >
          <span className="leading-tight text-[11px] text-slate-400 font-normal">Tờ khai</span>
          <span className="leading-tight font-bold text-xs text-slate-800">02/QTT</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setInternalTab('guide');
            if (onNavigate) onNavigate('income');
            else if (onNavigateToStep2) onNavigateToStep2();
          }}
          className={`h-full flex flex-col justify-center text-left relative transition-colors cursor-pointer py-1 ${
            activeTab === 'guide' && currentScreen !== 'admin'
              ? 'text-slate-900 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#046a4e]'
              : 'hover:text-slate-900'
          }`}
          title="Nạp chứng từ khấu trừ & Hướng dẫn eTax"
        >
          <span className="leading-tight text-[11px] text-slate-400 font-normal">Hướng dẫn</span>
          <span className="leading-tight font-bold text-xs text-slate-800">eTax</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNavigate) onNavigate('admin');
          }}
          className={`h-full flex flex-col justify-center text-left relative transition-colors cursor-pointer py-1 ${
            currentScreen === 'admin'
              ? 'text-slate-900 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#046a4e]'
              : 'hover:text-slate-900'
          }`}
          title="Quản trị Rule Engine & Vận hành Hệ thống"
        >
          <span className="leading-tight text-[11px] text-slate-400 font-normal">Quản trị</span>
          <span className="leading-tight font-bold text-xs text-[#046a4e]">Rule Engine</span>
        </button>

        {/* MST Pill */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 select-none">
          <span className="text-slate-400 font-sans font-normal">MST:</span>
          <span>8492019381</span>
        </div>

        {/* Nộp eTax Mobile Button */}
        <button 
          type="button"
          onClick={() => {
            if (onOpenEtaxModal) onOpenEtaxModal();
            else if (onNavigate) onNavigate('wizard_step3');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#046a4e] hover:bg-[#03543e] text-white text-xs font-medium transition-all shadow-xs cursor-pointer ml-1"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
          <span>Nộp eTax Mobile</span>
        </button>
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button 
          type="button"
          aria-label="Thông báo"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Help Icon */}
        <button 
          type="button"
          aria-label="Trợ giúp"
          onClick={() => {
            if (onNavigate) onNavigate('chatbot');
          }}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-90 transition-opacity select-none"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#046a4e] font-bold text-xs flex items-center justify-center ring-1 ring-emerald-200">
              {getInitials(user?.fullName)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.fullName || 'Chưa đăng nhập'}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {user?.mst ? `MST: ${user.mst}` : `Vai trò: ${user?.role || 'Khách'}`}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-500">
                Đăng nhập với tư cách: <br/>
                <strong className="text-slate-800">{user?.fullName || 'Người nộp thuế'}</strong>
                <span className="block text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                  [{user?.role || 'user'}]
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onNavigate) onNavigate('settings');
                  else if (onNavigateToSettings) onNavigateToSettings();
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>⚙️</span>
                <span>Hồ sơ cá nhân & Cài đặt</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onNavigate) onNavigate('history');
                  else if (onNavigateToHistory) onNavigateToHistory();
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>📜</span>
                <span>Lịch sử quyết toán các năm</span>
              </button>
              {(user?.role === 'admin_manager' || user?.role === 'super_admin') && (
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate('admin');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#046a4e] hover:bg-emerald-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>🛡️</span>
                  <span>Trung tâm Quản trị Rule Engine</span>
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  setIsUserMenuOpen(false);
                  await logout();
                  if (onLogout) onLogout();
                  else if (onNavigate) onNavigate('login');
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100"
              >
                <span>🚪</span>
                <span>Đăng xuất phiên làm việc</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
