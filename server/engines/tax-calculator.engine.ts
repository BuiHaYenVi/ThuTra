// ==============================================================================
// Động cơ Tính toán Biểu thuế Lũy tiến từng phần (Tax Calculator Engine)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { TaxBracketDetail, TaxCalculationBreakdown } from '../types/audit.types';

// Các tham số thuế chuẩn theo Luật Thuế TNCN & Nghị quyết 954/2020/UBTVQH14
export const TAX_CONSTANTS = {
  PERSONAL_DEDUCTION_MONTHLY: 11000000.0, // 11 triệu/tháng
  PERSONAL_DEDUCTION_YEARLY: 132000000.0, // 132 triệu/năm
  DEPENDENT_DEDUCTION_MONTHLY: 4400000.0, // 4.4 triệu/tháng
  DEPENDENT_DEDUCTION_YEARLY: 52800000.0, // 52.8 triệu/năm
  MAX_VOLUNTARY_PENSION_YEARLY: 12000000.0, // Tối đa 12 triệu/năm
  EXEMPTION_THRESHOLD_UNDER_50K: 50000.0, // Miễn nộp <= 50.000đ (NĐ 126/2020)
};

/**
 * Ngưỡng 7 bậc lũy tiến tính theo năm (VNĐ)
 */
interface BracketDefinition {
  bracket: number;
  monthlyRange: string;
  yearlyRange: string;
  min: number;
  max: number | null;
  rate: number;
  quickCalcFormula: string;
}

const BRACKET_DEFINITIONS: BracketDefinition[] = [
  { bracket: 1, monthlyRange: 'Đến 5 triệu VNĐ', yearlyRange: 'Đến 60 triệu VNĐ', min: 0, max: 60000000, rate: 5, quickCalcFormula: 'TNTT x 5%' },
  { bracket: 2, monthlyRange: 'Trên 5 - 10 triệu VNĐ', yearlyRange: 'Trên 60 - 120 triệu VNĐ', min: 60000000, max: 120000000, rate: 10, quickCalcFormula: 'TNTT x 10% - 3 trđ' },
  { bracket: 3, monthlyRange: 'Trên 10 - 18 triệu VNĐ', yearlyRange: 'Trên 120 - 216 triệu VNĐ', min: 120000000, max: 216000000, rate: 15, quickCalcFormula: 'TNTT x 15% - 9 trđ' },
  { bracket: 4, monthlyRange: 'Trên 18 - 32 triệu VNĐ', yearlyRange: 'Trên 216 - 384 triệu VNĐ', min: 216000000, max: 384000000, rate: 20, quickCalcFormula: 'TNTT x 20% - 19.8 trđ' },
  { bracket: 5, monthlyRange: 'Trên 32 - 52 triệu VNĐ', yearlyRange: 'Trên 384 - 624 triệu VNĐ', min: 384000000, max: 624000000, rate: 25, quickCalcFormula: 'TNTT x 25% - 39 trđ' },
  { bracket: 6, monthlyRange: 'Trên 52 - 80 triệu VNĐ', yearlyRange: 'Trên 624 - 960 triệu VNĐ', min: 624000000, max: 960000000, rate: 30, quickCalcFormula: 'TNTT x 30% - 70.2 trđ' },
  { bracket: 7, monthlyRange: 'Trên 80 triệu VNĐ', yearlyRange: 'Trên 960 triệu VNĐ', min: 960000000, max: null, rate: 35, quickCalcFormula: 'TNTT x 35% - 118.2 trđ' },
];

export class TaxCalculatorEngine {
  /**
   * Làm tròn số tiền chính xác chuẩn NUMERIC(15, 2)
   */
  public static roundCurrency(value: number): number {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  /**
   * Tính chi tiết từng bậc trong biểu thuế lũy tiến 7 bậc
   */
  public static calculateBrackets(taxableIncome: number): {
    totalTax: number;
    highestBracket: number;
    details: TaxBracketDetail[];
  } {
    const tntt = Math.max(0, this.roundCurrency(taxableIncome));
    let totalTax = 0;
    let highestBracket = 0;
    const details: TaxBracketDetail[] = [];

    for (const def of BRACKET_DEFINITIONS) {
      let amountInBracket = 0;

      if (tntt > def.min) {
        if (def.max === null) {
          // Bậc 7: Không giới hạn trên
          amountInBracket = tntt - def.min;
        } else {
          amountInBracket = Math.min(tntt, def.max) - def.min;
        }
      }

      const bracketTax = this.roundCurrency((amountInBracket * def.rate) / 100);
      if (amountInBracket > 0) {
        highestBracket = def.bracket;
        totalTax += bracketTax;
      }

      details.push({
        bracket: def.bracket,
        monthlyRange: def.monthlyRange,
        yearlyRange: def.yearlyRange,
        taxableAmountInBracket: this.roundCurrency(amountInBracket),
        rate: def.rate,
        taxAmount: bracketTax,
        quickCalcFormula: def.quickCalcFormula,
      });
    }

    return {
      totalTax: this.roundCurrency(totalTax),
      highestBracket,
      details,
    };
  }

  /**
   * Tính toán toàn diện bảng kê nghĩa vụ thuế từ các số liệu đầu vào
   */
  public static calculate(params: {
    grossIncome: number;
    personalDeductionMonths?: number;
    dependentsTotalMonths?: number;
    insuranceDeduction?: number;
    charityDeduction?: number;
    voluntaryPensionDeduction?: number;
    taxDeducted?: number;
  }): TaxCalculationBreakdown {
    const grossIncome = Math.max(0, this.roundCurrency(params.grossIncome));
    const personalMonths = params.personalDeductionMonths !== undefined ? params.personalDeductionMonths : 12;
    const personalDeduction = this.roundCurrency(personalMonths * TAX_CONSTANTS.PERSONAL_DEDUCTION_MONTHLY);

    const depMonths = Math.max(0, params.dependentsTotalMonths || 0);
    const dependentDeduction = this.roundCurrency(depMonths * TAX_CONSTANTS.DEPENDENT_DEDUCTION_MONTHLY);

    const insuranceDeduction = Math.max(0, this.roundCurrency(params.insuranceDeduction || 0));
    const charityDeduction = Math.max(0, this.roundCurrency(params.charityDeduction || 0));

    // Quỹ hưu trí tự nguyện tối đa 12.000.000 VNĐ/năm
    const rawPension = Math.max(0, this.roundCurrency(params.voluntaryPensionDeduction || 0));
    const voluntaryPensionDeduction = Math.min(rawPension, TAX_CONSTANTS.MAX_VOLUNTARY_PENSION_YEARLY);

    // Tổng giảm trừ
    const totalDeductions = this.roundCurrency(
      personalDeduction +
      dependentDeduction +
      insuranceDeduction +
      charityDeduction +
      voluntaryPensionDeduction
    );

    // Thu nhập tính thuế (TNTT = max(0, grossIncome - totalDeductions))
    const taxableIncome = Math.max(0, this.roundCurrency(grossIncome - totalDeductions));

    // Tính thuế lũy tiến từng phần
    const { totalTax: taxLiability, highestBracket, details: bracketDetails } = this.calculateBrackets(taxableIncome);

    // Đối soát thuế đã khấu trừ tại nguồn
    const taxDeducted = Math.max(0, this.roundCurrency(params.taxDeducted || 0));

    let taxRefund = 0;
    let taxPayable = 0;
    let isExemptUnder50k = false;

    if (taxDeducted >= taxLiability) {
      taxRefund = this.roundCurrency(taxDeducted - taxLiability);
      taxPayable = 0;
    } else {
      taxPayable = this.roundCurrency(taxLiability - taxDeducted);
      taxRefund = 0;

      // Quy tắc miễn nộp nếu số thuế phát sinh <= 50.000 VNĐ
      if (taxPayable > 0 && taxPayable <= TAX_CONSTANTS.EXEMPTION_THRESHOLD_UNDER_50K) {
        isExemptUnder50k = true;
      }
    }

    return {
      grossIncome,
      personalDeduction,
      dependentDeduction,
      insuranceDeduction,
      charityDeduction,
      voluntaryPensionDeduction,
      totalDeductions,
      taxableIncome,
      taxLiability,
      taxDeducted,
      taxRefund,
      taxPayable,
      appliedBracket: highestBracket,
      isExemptUnder50k,
      bracketDetails,
    };
  }
}
