import React from 'react';
import { 
  FileText, 
  Calendar, 
  FileSpreadsheet, 
  BookOpen, 
  Sparkles, 
  Bell, 
  ChevronDown 
} from 'lucide-react';
import { mockForecastUser } from '../../data/mockForecastData';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAiModal?: () => void;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAiModal,
  onLogoClick
}) => {
  const tabs = [
    { id: 'tax_period', label: 'Kỳ tính thuế 2024', icon: Calendar },
    { id: 'declaration', label: 'Tờ khai 02/QTT', icon: FileSpreadsheet },
    { id: 'etax_guide', label: 'Hướng dẫn eTax', icon: BookOpen },
    { id: 'law_qa', label: 'Hỏi đáp Luật (AI)', icon: Sparkles, badge: 'v3.5' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* 1. Left: Brand & Logo */}
      <div 
        onClick={onLogoClick}
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        title="Về Trang chủ Tổng quan quyết toán"
      >
        <div className="w-9 h-9 rounded-xl bg-[#046a4e] flex items-center justify-center text-white shadow-xs shrink-0">
          <FileText className="w-5 h-5 text-emerald-100" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">ThuTra TNCN</span>
            <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              THÔNG MINH
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal leading-tight">
            Hệ thống Quyết toán Thuế Cá nhân
          </span>
        </div>
      </div>

      {/* 2. Middle: Navigation Tabs */}
      <nav className="flex items-center gap-6 h-full text-xs font-medium text-slate-600">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'law_qa' && onOpenAiModal) {
                  onOpenAiModal();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={`h-full flex items-center gap-1.5 relative transition-colors cursor-pointer px-1 ${
                isActive
                  ? 'text-slate-900 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#046a4e]'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#046a4e]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Deadline alert pill & User Profile */}
      <div className="flex items-center gap-3.5">
        {/* Deadline notification alert */}
        <div className="hidden lg:flex items-center gap-1.5 bg-red-50/90 border border-red-200/80 text-red-700 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
          <Bell className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>3 ngày trước deadline 30/04</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100 cursor-pointer hover:opacity-90 transition-opacity">
          <img
            src={mockForecastUser.avatarUrl}
            alt={mockForecastUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {mockForecastUser.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight mt-0.5 font-mono">
              MST: {mockForecastUser.mst}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-1">
            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {mockForecastUser.plan}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
              {mockForecastUser.etaxStatus}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>
      </div>
    </header>
  );
};
