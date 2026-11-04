export interface TaxpayerProfile {
  fullName: string;
  phone: string;
  idCard: string;
  idCardType: string;
  email: string;
  emailVerified: boolean;
  mst: string;
  mstStatus: string;
  mstLinkedNote: string;
  address: string;
  dob: string;
  taxDepartment: string;
  taxDepartmentParent: string;
  avatarInitials: string;
  plan: string;
  cccdChipVerified: boolean;
  status2024: string;
}

export interface BankAccountInfo {
  bankName: string;
  bankShortName: string;
  bankBranch: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
  etaxReady: boolean;
  napasMatched: boolean;
  matchRate: string;
}

export interface SecurityDevice {
  id: string;
  device: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  activeDevices: SecurityDevice[];
}

export interface PrivacySettings {
  autoDeleteDocs: boolean;
  noLocalStorage: boolean;
  aesEncryption: boolean;
}

export const initialTaxpayerProfile: TaxpayerProfile = {
  fullName: 'Nguyễn Hoàng Nam',
  phone: '0908 123 456',
  idCard: '079095012345',
  idCardType: 'Định danh 12 số',
  email: 'nam.nguyen@example.com',
  emailVerified: true,
  mst: '8492019381',
  mstStatus: 'Mã số thuế chính thức',
  mstLinkedNote: 'MST đã được chuẩn hóa theo số CCCD 12 số trên Cổng Dịch vụ công / Cổng Thuế.',
  address: 'Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh',
  dob: '1998-08-15',
  taxDepartment: 'Chi cục Thuế Quận Bình Thạnh (TP.HCM)',
  taxDepartmentParent: 'Thuộc Cục Thuế TP. Hồ Chí Minh',
  avatarInitials: 'HN',
  plan: 'Gói Cá nhân Miễn phí',
  cccdChipVerified: true,
  status2024: 'Đang chuẩn bị tờ khai',
};

export const initialBankAccountInfo: BankAccountInfo = {
  bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
  bankShortName: 'VIETCOMBANK',
  bankBranch: 'Chi nhánh TP. Hồ Chí Minh',
  accountNumber: '0071 0012 8899',
  accountHolder: 'NGUYEN HOANG NAM',
  isDefault: true,
  etaxReady: true,
  napasMatched: true,
  matchRate: 'Khớp 100% với CCCD',
};

export const initialSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  activeDevices: [
    {
      id: '1',
      device: 'MacBook Pro (Chrome 124)',
      location: 'TP. Hồ Chí Minh',
      isCurrent: true,
      lastActive: 'Phiên hiện tại',
    },
  ],
};

export const initialPrivacySettings: PrivacySettings = {
  autoDeleteDocs: true,
  noLocalStorage: false,
  aesEncryption: true,
};

export const TAX_DEPARTMENTS_OPTIONS = [
  'Chi cục Thuế Quận Bình Thạnh (TP.HCM)',
  'Chi cục Thuế Quận 1 (TP.HCM)',
  'Chi cục Thuế Thành phố Thủ Đức (TP.HCM)',
  'Chi cục Thuế Quận 3 (TP.HCM)',
  'Chi cục Thuế Quận 7 (TP.HCM)',
  'Chi cục Thuế Quận Cầu Giấy (Hà Nội)',
  'Chi cục Thuế Quận Ba Đình (Hà Nội)',
  'Chi cục Thuế Quận Đống Đa (Hà Nội)',
];
