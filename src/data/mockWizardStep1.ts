export interface PersonalTaxpayer {
  fullName: string;
  cccd: string;
  mst: string;
  phone: string;
  email: string;
  address: string;
  isVerifiedVNeID: boolean;
  personalDeductionPerMonth: number;
  personalDeductionMonths: number;
  totalPersonalDeduction: number;
}

export interface Dependent {
  id: string;
  index: number;
  title: string;
  fullName: string;
  relation: string;
  relationType: 'mother' | 'father' | 'child_under_18' | 'child_over_18_student' | 'disabled' | 'disabled_relative' | 'spouse' | 'other';
  cccd: string;
  birthDate: string;
  mst: string;
  hasMst: boolean;
  isValidCqt: boolean;
  startMonth: string;
  endMonth: string;
  monthsApplied: number;
  monthlyDeduction: number;
  totalDeduction: number;
  commitmentChecked: boolean;
}

export interface LegalConditionItem {
  id: string;
  title: string;
  description: string;
  isMet: boolean;
}

export const mockPersonalTaxpayer: PersonalTaxpayer = {
  fullName: "Nguyễn Hoàng Nam",
  cccd: "079095012345",
  mst: "8492019381",
  phone: "0908 123 456",
  email: "nam.nguyen@example.com",
  address: "Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
  isVerifiedVNeID: true,
  personalDeductionPerMonth: 11000000,
  personalDeductionMonths: 12,
  totalPersonalDeduction: 132000000
};

export const mockInitialDependents: Dependent[] = [
  {
    id: "dep-1",
    index: 1,
    title: "Người phụ thuộc #1: Mẹ ruột",
    fullName: "Trần Thị Mai",
    relation: "Mẹ đẻ (ngoài độ tuổi lao động)",
    relationType: "mother",
    cccd: "0192837482",
    birthDate: "12/05/1958",
    mst: "8091234567",
    hasMst: true,
    isValidCqt: true,
    startMonth: "01/2024",
    endMonth: "12/2024",
    monthsApplied: 12,
    monthlyDeduction: 4400000,
    totalDeduction: 52800000,
    commitmentChecked: true
  }
];

export const mockLegalConditions: LegalConditionItem[] = [
  {
    id: "cond-1",
    title: "Con dưới 18 tuổi:",
    description: "Chỉ cần bản sao Giấy khai sinh hoặc CCCD gắn chip của con.",
    isMet: true
  },
  {
    id: "cond-2",
    title: "Con từ 18 tuổi trở lên:",
    description: "Đang học đại học/cao đẳng cần Giấy xác nhận sinh viên hợp lệ.",
    isMet: true
  },
  {
    id: "cond-3",
    title: "Cha mẹ ngoài độ tuổi lao động:",
    description: "Nam từ đủ 61 tuổi, Nữ từ đủ 56 tuổi (thu nhập bình quân ≤ 1 triệu/tháng).",
    isMet: true
  }
];

export const formatVnd = (amount: number): string => {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
};
