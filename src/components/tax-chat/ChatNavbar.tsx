import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Scale, 
  HelpCircle, 
  Bell 
} from 'lucide-react';
import { mockSynchronizedProfile } from '../../data/mockChatData';

interface ChatNavbarProps {
  activeTab?: string;
  onSelectTab?: (tab: 'overview' | 'incomes' | 'legal') => void;
  onOpenHelp?: () => void;
  onOpenNotifications?: () => void;
  onLogoClick?: () => void;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  activeTab = 'legal',
  onSelectTab,
  onOpenHelp,
  onOpenNotifications,
  onLogoClick
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-30">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          title="Về Trang chủ Tổng quan quyết toán"
        >
          <div className="w-9 h-9 rounded-xl bg-[#046a4e] flex items-center justify-center text-white shadow-2xs shrink-0">
            <Building2 className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
              ThuTra TNCN
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              Trợ lý Thuế Thông Minh
            </span>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-6 h-full">
          {/* Tab 1: Tổng quan quyết toán */}
          <button
            onClick={() => onSelectTab && onSelectTab('overview')}
            className={`h-full flex items-center gap-2 px-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#046a4e] text-[#046a4e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            <span>Tổng quan quyết toán</span>
          </button>

          {/* Tab 2: Nguồn thu nhập & Chứng từ */}
          <button
            onClick={() => onSelectTab && onSelectTab('incomes')}
            className={`h-full flex items-center gap-2 px-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'incomes'
                ? 'border-[#046a4e] text-[#046a4e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Nguồn thu nhập &amp; Chứng từ</span>
          </button>

          {/* Tab 3: Hỗ trợ pháp lý TNCN (ACTIVE) */}
          <button
            onClick={() => onSelectTab && onSelectTab('legal')}
            className={`h-full flex items-center gap-2 px-2 text-xs font-extrabold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'legal'
                ? 'border-[#046a4e] text-[#046a4e]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-[#046a4e]" />
            <span>Hỗ trợ pháp lý TNCN</span>
            <span className="bg-emerald-100 text-[#046a4e] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              v3.5
            </span>
          </button>
        </nav>

        {/* Right: MST, Help, Notifications, User */}
        <div className="flex items-center gap-3 text-xs">
          {/* MST Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-600">
              MST: <strong className="font-bold text-slate-800">{mockSynchronizedProfile.mst}</strong>
            </span>
          </div>

          {/* Help Icon */}
          <button
            onClick={onOpenHelp}
            aria-label="Trợ giúp"
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications Icon with red badge */}
          <button
            onClick={onOpenNotifications}
            aria-label="Thông báo"
            className="relative w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-emerald-500/30 overflow-hidden">
              <span className="bg-[#046a4e] text-white w-full h-full flex items-center justify-center text-xs font-semibold">
                HN
              </span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-bold text-slate-800 text-[11px] leading-tight">
                {mockSynchronizedProfile.taxpayerName}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Kỳ tính thuế {mockSynchronizedProfile.taxYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
