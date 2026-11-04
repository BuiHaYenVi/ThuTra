import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Shield, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  EyeOff,
  FileText, 
  Download, 
  Smartphone,
  Copy,
  Check,
  Info,
  ChevronRight,
  ShieldCheck,
  Key,
  Laptop,
  Edit3,
  ArrowLeftRight,
  X
} from 'lucide-react';
import type { ScreenType } from '../App';
import type { 
  TaxpayerProfile, 
  BankAccountInfo, 
  SecuritySettings, 
  PrivacySettings
} from '../data/mockUserProfile';
import {
  initialTaxpayerProfile,
  initialBankAccountInfo,
  initialSecuritySettings,
  initialPrivacySettings,
  TAX_DEPARTMENTS_OPTIONS
} from '../data/mockUserProfile';

interface ProfileSettingsPageProps {
  onNavigate?: (screen: ScreenType) => void;
  onNavigateToDashboard?: () => void;
  onLogout?: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  onNavigate,
  onNavigateToDashboard,
  onLogout,
}) => {

  // Horizontal Profile Tabs state
  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'security' | 'privacy'>('profile');

  // Form State: Taxpayer Info
  const [profile, setProfile] = useState<TaxpayerProfile>(() => {
    const saved = localStorage.getItem('thutra_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialTaxpayerProfile;
      }
    }
    return initialTaxpayerProfile;
  });

  // Form State: Bank Account Info
  const [bankInfo, setBankInfo] = useState<BankAccountInfo>(() => {
    const saved = localStorage.getItem('thutra_bank_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialBankAccountInfo;
      }
    }
    return initialBankAccountInfo;
  });

  // Form State: Security & 2FA
  const [security, setSecurity] = useState<SecuritySettings>(initialSecuritySettings);

  // Form State: Privacy
  const [privacy, setPrivacy] = useState<PrivacySettings>(initialPrivacySettings);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI Feedback States
  const [toastMessage, setToastMessage] = useState<string | null>(
    '✓ Đã cập nhật thông tin hồ sơ thành công! Dữ liệu đã sẵn sàng cho tờ khai thuế 2024.'
  );
  const [isCopiedMst, setIsCopiedMst] = useState(false);

  // Modals
  const [isPreview02Open, setIsPreview02Open] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Handlers
  const handleProfileChange = (field: keyof TaxpayerProfile, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('thutra_user_profile', JSON.stringify(profile));
    setToastMessage('✓ Đã cập nhật thông tin hồ sơ thành công! Dữ liệu đã sẵn sàng cho tờ khai thuế 2024.');
    setTimeout(() => {
      // Keep visible or auto fade after 5s
    }, 5000);
  };

  const handleCopyMst = () => {
    navigator.clipboard.writeText(profile.mst);
    setIsCopiedMst(true);
    setTimeout(() => setIsCopiedMst(false), 2000);
  };

  const handleBackupData = () => {
    const backupData = {
      taxpayerProfile: profile,
      bankAccount: bankInfo,
      security: security,
      privacy: privacy,
      exportedAt: new Date().toISOString(),
      system: 'ThuTra TNCN 2024',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThuTra_Backup_MST_${profile.mst}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage('✓ Đã sao lưu dữ liệu cục bộ thành công vào tệp JSON!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      alert('Mật khẩu mới phải có ít nhất 8 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setToastMessage('✓ Đã cập nhật mật khẩu bảo mật mới thành công!');
  };

  const handleCheckNapas = () => {
    setToastMessage('✓ Napas xác nhận: Tài khoản ngân hàng khớp 100% với CCCD ' + profile.idCard);
  };

  const scrollToSection = (sectionId: string, tab: 'profile' | 'bank' | 'security' | 'privacy') => {
    setActiveTab(tab);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToDashboard = () => {
    if (onNavigate) onNavigate('dashboard');
    else if (onNavigateToDashboard) onNavigateToDashboard();
  };

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={handleBackToDashboard}
          className="hover:text-slate-700 transition-colors cursor-pointer"
        >
          Tổng quan
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600 font-medium">Cài đặt tài khoản</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#046a4e] font-semibold">Hồ sơ người nộp thuế</span>
      </nav>

          {/* Page Title & Fast Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Hồ sơ cá nhân & Cài đặt tài khoản
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Quản lý thông tin định danh thuế, tài khoản ngân hàng nhận tiền hoàn và bảo mật cá nhân trên ThuTra.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPreview02Open(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Xem trước tờ khai mẫu 02/QTT</span>
              </button>

              <button
                type="button"
                onClick={handleBackupData}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Sao lưu dữ liệu cục bộ</span>
              </button>
            </div>
          </div>

          {/* Sticky Horizontal Navigation Tabs */}
          <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-16 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-1 rounded-t-xl">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-xs font-medium">
              <button
                type="button"
                onClick={() => scrollToSection('section-taxpayer', 'profile')}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-[#046a4e] text-[#046a4e] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Thông tin Người nộp thuế</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('section-bank', 'bank')}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'bank'
                    ? 'border-[#046a4e] text-[#046a4e] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tài khoản Ngân hàng Hoàn thuế</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('section-security', 'security')}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-[#046a4e] text-[#046a4e] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Bảo mật & Đăng nhập</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('section-privacy', 'privacy')}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'privacy'
                    ? 'border-[#046a4e] text-[#046a4e] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Dữ liệu & Quyền riêng tư</span>
              </button>
            </div>
          </div>

          {/* Quick Profile Summary Banner Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-200 text-[#046a4e] font-bold text-lg flex items-center justify-center shrink-0 shadow-inner ring-2 ring-emerald-100">
                {profile.avatarInitials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {profile.fullName}
                  </h2>
                  <span className="bg-emerald-50 text-[#046a4e] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    {profile.plan}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                    <span className="font-medium text-slate-600">MST: {profile.mst}</span>
                    <button
                      type="button"
                      onClick={handleCopyMst}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                      title="Sao chép MST"
                    >
                      {isCopiedMst ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="bg-emerald-50 text-[#046a4e] text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-[#046a4e]" />
                    <span>Đã xác thực CCCD gắn chip</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-2.5 self-start md:self-auto shrink-0">
              <p className="text-[11px] text-slate-500 font-medium">Trạng thái hồ sơ 2024</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{profile.status2024}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Thông tin định danh người nộp thuế (Mẫu 02/QTT Form) */}
          <div id="section-taxpayer" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Thông tin định danh người nộp thuế
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dữ liệu được trích xuất trực tiếp phục vụ Tờ khai quyết toán thuế TNCN mẫu 02/QTT
                </p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium self-start">
                Theo Thông tư 80/2021/TT-BTC
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Họ và tên */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Họ và tên người nộp thuế <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* 2. Số điện thoại di động */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Số điện thoại di động <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* 3. Số CCCD / CMND */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Số CCCD / CMND <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {profile.idCardType}
                    </span>
                  </div>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.idCard}
                      onChange={(e) => handleProfileChange('idCard', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* 4. Email nhận thông báo thuế */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Email nhận thông báo thuế <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã xác thực
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* 5. Mã số thuế cá nhân (MST) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Mã số thuế cá nhân (MST) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {profile.mstStatus}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">#</span>
                    <input
                      type="text"
                      value={profile.mst}
                      onChange={(e) => handleProfileChange('mst', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800 font-mono font-medium"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {profile.mstLinkedNote}
                  </p>
                </div>

                {/* 6. Địa chỉ thường trú */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Địa chỉ thường trú (theo CCCD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* 7. Ngày sinh */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => handleProfileChange('dob', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* 8. Cơ quan thuế quản lý trực tiếp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cơ quan thuế quản lý trực tiếp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={profile.taxDepartment}
                      onChange={(e) => handleProfileChange('taxDepartment', e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] text-slate-800 appearance-none cursor-pointer"
                    >
                      {TAX_DEPARTMENTS_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {profile.taxDepartmentParent}
                  </p>
                </div>
              </div>

              {/* Toast message simulation matching design */}
              {toastMessage && (
                <div className="mt-4 bg-white border border-emerald-200 shadow-md rounded-xl p-3 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#046a4e] flex items-center justify-center shrink-0 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">
                        Đã cập nhật thông tin hồ sơ thành công!
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Dữ liệu đã sẵn sàng cho tờ khai thuế 2024.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToastMessage(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProfile(initialTaxpayerProfile)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#046a4e] hover:bg-[#03543e] rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Lưu thay đổi thông tin cá nhân</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Tài khoản Ngân hàng Nhận Hoàn Thuế */}
          <div id="section-bank" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Tài khoản Ngân hàng Nhận Hoàn Thuế
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thông tin dùng để Kho Bạc Nhà Nước giải ngân tiền hoàn thuế thu nhập cá nhân trực tiếp.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl self-start">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>01 Tài khoản nhận hoàn duy nhất trên Tờ khai 02/QTT</span>
              </span>
            </div>

            {/* Light Blue Info Box */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-900">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Thông tin tài khoản ngân hàng này sẽ được tự động điền vào <strong>Mục đăng ký nhận hoàn thuế</strong> trên tờ khai 02/QTT-TNCN khi xuất file XML gửi lên Cổng Thuế Nhà Nước.
              </p>
            </div>

            {/* Bank Card & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-2">
              {/* Left Column: Bank Card Component */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="w-full bg-gradient-to-br from-[#065f46] via-[#046a4e] to-[#022c22] rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[190px]">
                  {/* Subtle card sheen decoration */}
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none"></div>
                  <div className="absolute right-12 top-4 w-28 h-28 rounded-full bg-emerald-400/10 blur-xl pointer-events-none"></div>

                  {/* Card Header */}
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-xs font-black tracking-wider text-emerald-100">
                        {bankInfo.bankShortName}
                      </p>
                      <p className="text-[10px] text-emerald-200/90 font-medium">
                        {bankInfo.bankName}
                      </p>
                    </div>
                    {/* Metallic Golden Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-300 shadow-inner flex flex-col justify-center p-1 relative">
                      <div className="border-t border-b border-amber-700/40 h-2 w-full"></div>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="my-3 relative z-10">
                    <p className="text-[9px] uppercase tracking-widest text-emerald-300/80 font-medium">
                      SỐ TÀI KHOẢN HƯỞNG THỤ
                    </p>
                    <p className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-white mt-0.5">
                      {bankInfo.accountNumber}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-300/80 font-medium">
                        CHỦ TÀI KHOẢN
                      </p>
                      <p className="font-mono text-xs font-semibold text-white tracking-wide mt-0.5">
                        {bankInfo.accountHolder}
                      </p>
                    </div>
                    <span className="bg-emerald-950/70 border border-emerald-400/30 text-[10px] text-emerald-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Tài khoản chính</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Account Details & Napas Reconciliation */}
              <div className="lg:col-span-7 bg-slate-50/60 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <h4 className="text-xs font-bold text-slate-800">
                        Tài khoản mặc định nhận hoàn thuế
                      </h4>
                    </div>
                    <span className="bg-emerald-50 text-[#046a4e] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Sẵn sàng liên kết eTax
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Ngân hàng phát hành:</span>
                      <strong className="text-slate-800 text-xs block mt-0.5 font-semibold">
                        {bankInfo.bankName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Chi nhánh thụ hưởng:</span>
                      <strong className="text-slate-800 text-xs block mt-0.5 font-semibold">
                        {bankInfo.bankBranch}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Họ và tên chủ tài khoản:</span>
                      <strong className="text-slate-800 text-xs block mt-0.5 font-mono font-semibold">
                        {bankInfo.accountHolder}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Tình trạng đối soát danh tính:</span>
                      <span className="text-[#046a4e] text-xs font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" /> {bankInfo.matchRate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditBankModalOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Thay đổi tài khoản ngân hàng</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckNapas}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kiểm tra lại với Napas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bảo mật & Đăng nhập */}
          <div id="section-security" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Bảo mật & Đăng nhập
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bảo vệ thông tin thu nhập, sao kê tài chính và chứng từ thuế điện tử của bạn.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Change Password */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Key className="w-4 h-4 text-slate-500" />
                  <span>Đổi mật khẩu truy cập</span>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] pr-9 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập tối thiểu 8 ký tự kèm chữ số"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] pr-9 text-slate-800 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter */}
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#046a4e] h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: newPassword.length === 0 ? '60%' : newPassword.length >= 8 ? '85%' : '35%',
                          }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Độ mạnh mật khẩu: <span className="font-semibold text-emerald-700">Khá an toàn</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20 focus:border-[#046a4e] pr-9 text-slate-800 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#046a4e] hover:border-emerald-300 border border-slate-200 rounded-xl transition-all cursor-pointer mt-1"
                  >
                    Cập nhật mật khẩu
                  </button>
                </form>
              </div>

              {/* Right Column: 2FA & Active Devices */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span>Xác thực đa yếu tố (2FA)</span>
                </div>

                {/* 2FA Toggle Box */}
                <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      Xác thực 2 lớp qua Email / Mã OTP
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Yêu cầu mã xác thực OTP 6 số gửi về email mỗi khi bạn xuất file quyết toán XML hoặc thay đổi STK ngân hàng.
                    </p>
                  </div>
                  {/* Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      security.twoFactorEnabled ? 'bg-[#046a4e]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        security.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Active Devices List */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold text-slate-600">
                    Thiết bị đang hoạt động
                  </p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 text-xs">
                      <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-800">
                        MacBook Pro (Chrome 124) • TP. Hồ Chí Minh (Phiên hiện tại)
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Đang trực tuyến"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dữ liệu & Quyền riêng tư (Data Privacy) */}
          <div id="section-privacy" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Dữ liệu & Quyền riêng tư
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm soát cách thức lưu trữ chứng từ khấu trừ và dữ liệu mã hóa trên trình duyệt của bạn.
              </p>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-3.5 text-xs">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={privacy.autoDeleteDocs}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, autoDeleteDocs: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#046a4e] focus:ring-[#046a4e]/20 cursor-pointer accent-[#046a4e]"
                />
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-slate-900 block leading-tight">
                    Xóa toàn bộ chứng từ đã tải lên sau khi hoàn thành quyết toán và xuất file XML thành công
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                    Bảo vệ chứng từ khấu trừ thuế điện tử và bảng kê thu nhập khỏi việc lưu lại trên máy chủ sau khi bạn hoàn tất nộp tờ khai.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={privacy.noLocalStorage}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, noLocalStorage: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#046a4e] focus:ring-[#046a4e]/20 cursor-pointer accent-[#046a4e]"
                />
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-slate-900 block leading-tight">
                    Không lưu trữ cục bộ dữ liệu thu nhập trên trình duyệt này
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                    Khi bật tùy chọn này, bạn sẽ cần nhập lại thông tin hoặc tải lại tệp sao kê trong phiên làm việc kế tiếp.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={privacy.aesEncryption}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, aesEncryption: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#046a4e] focus:ring-[#046a4e]/20 cursor-pointer accent-[#046a4e]"
                />
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-slate-900 block leading-tight">
                    Mã hóa cục bộ dữ liệu nháp bằng chuẩn AES-256
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                    Mọi phép tính lũy tiến và tiền giảm trừ người phụ thuộc sẽ được mã hóa an toàn trên trình duyệt của bạn.
                  </span>
                </div>
              </label>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 sm:p-5 mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Vùng nguy hiểm: Xóa tài khoản và toàn bộ dữ liệu quyết toán</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn mọi chứng từ khấu trừ, lịch sử tính thuế và thông tin định danh của bạn khỏi hệ thống ThuTra. Dữ liệu không thể khôi phục sau khi xóa.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa vĩnh viễn tài khoản ThuTra</span>
                </button>
              </div>
            </div>
          </div>

      {/* MODAL 1: Xem trước tờ khai mẫu 02/QTT */}
      {isPreview02Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPreview02Open(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#046a4e] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xem Trước Tờ Khai Quyết Toán Mẫu 02/QTT-TNCN
                </h3>
                <p className="text-xs text-slate-500">
                  Kỳ tính thuế: Năm 2024 • Ban hành kèm Thông tư 80/2021/TT-BTC
                </p>
              </div>
            </div>

            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">[01] Người nộp thuế:</span>
                  <span className="font-bold text-slate-800">{profile.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">[02] Mã số thuế:</span>
                  <span className="font-mono font-bold text-slate-800">{profile.mst}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">[03] Số CCCD:</span>
                  <span className="font-mono font-bold text-slate-800">{profile.idCard}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">[04] Điện thoại:</span>
                  <span className="font-bold text-slate-800">{profile.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">[05] Cơ quan thuế thụ lý hồ sơ:</span>
                <span className="font-bold text-slate-800">{profile.taxDepartment}</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg text-emerald-900">
                <span className="font-bold block text-xs">[48] Đăng ký nhận hoàn thuế qua tài khoản ngân hàng:</span>
                <p className="mt-1">
                  Chủ TK: <strong>{bankInfo.accountHolder}</strong> • STK: <strong>{bankInfo.accountNumber}</strong> • Ngân hàng: <strong>{bankInfo.bankName}</strong> ({bankInfo.bankBranch})
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setIsPreview02Open(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Thay đổi tài khoản ngân hàng */}
      {isEditBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsEditBankModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Thay đổi tài khoản ngân hàng nhận hoàn thuế
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập số tài khoản ngân hàng chính chủ đứng tên <strong>{profile.fullName}</strong>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('thutra_bank_info', JSON.stringify(bankInfo));
                setIsEditBankModalOpen(false);
                setToastMessage('✓ Đã cập nhật số tài khoản nhận tiền hoàn thuế thành công!');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngân hàng thụ hưởng</label>
                <input
                  type="text"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số tài khoản hưởng thụ</label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#046a4e]/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chi nhánh</label>
                <input
                  type="text"
                  value={bankInfo.bankBranch}
                  onChange={(e) => setBankInfo(prev => ({ ...prev, bankBranch: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046a4e]/20"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditBankModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#046a4e] hover:bg-[#03543e] rounded-xl font-semibold"
                >
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 4: Xác nhận xóa tài khoản */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 relative text-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Bạn có chắc chắn muốn xóa tài khoản?
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Toàn bộ dữ liệu quyết toán thuế TNCN, lịch sử tính toán và chứng từ khấu trừ sẽ bị xóa vĩnh viễn khỏi trình duyệt.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteAccountModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-medium"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  setIsDeleteAccountModalOpen(false);
                  onLogout?.();
                }}
                className="px-4 py-2 text-white bg-rose-700 hover:bg-rose-800 rounded-xl font-semibold"
              >
                Xác nhận xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
