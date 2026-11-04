// ==============================================================================
// Nhóm 1: Tính hợp lệ của Chứng từ & Pháp lý (R01 - R04)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { BaseRule } from '../rule.interface';
import { AuditContext, RuleExecutionResult, AuditSeverity, AuditStatus } from '../../../types/audit.types';
import { DocumentType } from '../../../types/document.types';

/**
 * R01: Phát hiện trùng lặp chứng từ (cùng số ký hiệu / mã chứng từ giữa các nguồn thu)
 */
export class RuleR01DuplicateDocument implements BaseRule {
  public readonly code = 'R01';
  public readonly name = 'Phát hiện trùng lặp chứng từ khấu trừ';
  public readonly defaultSeverity = AuditSeverity.CRITICAL;
  public readonly category = 'DOCUMENT_VALIDITY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const docNumbers = new Map<string, number>();
    const duplicates: string[] = [];

    for (const doc of context.documents) {
      const payload = typeof doc.ocr_extracted_payload === 'string'
        ? JSON.parse(doc.ocr_extracted_payload)
        : doc.ocr_extracted_payload || {};

      const num = payload.document_number?.trim();
      if (num) {
        const count = (docNumbers.get(num) || 0) + 1;
        docNumbers.set(num, count);
        if (count === 2) {
          duplicates.push(num);
        }
      }
    }

    if (duplicates.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.FAILED,
        message: `Phát hiện ${duplicates.length} số chứng từ khấu trừ bị trùng lặp trong hồ sơ: [${duplicates.join(', ')}].`,
        details: { duplicateNumbers: duplicates },
        suggestedFix: 'Vui lòng kiểm tra lại các tệp chứng từ tải lên, xóa bớt chứng từ trùng lặp để tránh bị cơ quan thuế xử phạt kê khai trùng.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Không phát hiện trùng lặp mã chứng từ hoặc ký hiệu chứng từ khấu trừ.',
    };
  }
}

/**
 * R02: Kiểm tra tính nhất quán của Mã số thuế tổ chức chi trả và MST cá nhân
 */
export class RuleR02TaxCodeConsistency implements BaseRule {
  public readonly code = 'R02';
  public readonly name = 'Kiểm tra tính nhất quán Mã số thuế tổ chức chi trả';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'DOCUMENT_VALIDITY';

  private isValidMst(mst?: string | null): boolean {
    if (!mst) return false;
    const clean = mst.trim().replace(/-/g, '');
    return /^[0-9]{10}([0-9]{3})?$/.test(clean);
  }

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const invalidMsts: Array<{ source: string; mst: string }> = [];

    // Kiểm tra MST các nguồn thu
    for (const inc of context.incomeSources) {
      if (!this.isValidMst(inc.payerMst)) {
        invalidMsts.push({ source: inc.payerName, mst: inc.payerMst });
      }
    }

    // Kiểm tra MST trong chứng từ
    for (const doc of context.documents) {
      const payload = typeof doc.ocr_extracted_payload === 'string'
        ? JSON.parse(doc.ocr_extracted_payload)
        : doc.ocr_extracted_payload || {};

      if (payload.tax_code_issuer && !this.isValidMst(payload.tax_code_issuer)) {
        invalidMsts.push({ source: doc.file_name, mst: payload.tax_code_issuer });
      }
    }

    if (invalidMsts.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Phát hiện ${invalidMsts.length} tổ chức chi trả có Mã số thuế không đúng định dạng chuẩn 10 hoặc 13 số.`,
        details: { invalidMsts },
        suggestedFix: 'Rà soát lại MST doanh nghiệp trên chứng từ khấu trừ thuế điện tử e-Chungtu để đảm bảo tờ khai hợp lệ.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Mã số thuế của các tổ chức chi trả đều hợp lệ theo chuẩn Tổng cục Thuế.',
    };
  }
}

/**
 * R03: Cảnh báo chứng từ chưa được người nộp thuế đối soát/xác nhận (unverified)
 */
export class RuleR03UnverifiedDocuments implements BaseRule {
  public readonly code = 'R03';
  public readonly name = 'Cảnh báo chứng từ chưa đối soát xác nhận';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'DOCUMENT_VALIDITY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const unverifiedDocs = context.documents.filter(
      (doc) => doc.verification_status === 'unverified'
    );

    if (unverifiedDocs.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Còn ${unverifiedDocs.length} chứng từ đang ở trạng thái 'Chưa đối soát'. Số liệu tính thuế có thể chưa phản ánh số thực tế.`,
        details: {
          unverifiedCount: unverifiedDocs.length,
          docNames: unverifiedDocs.map((d) => d.file_name),
        },
        suggestedFix: 'Vui lòng nhấn nút "Đối soát & Xác nhận" tại danh sách chứng từ để hoàn tất kiểm tra số liệu trước khi kết xuất tờ khai 02/QTT.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Tất cả các chứng từ thuế tải lên đều đã được đối soát và xác nhận chính thức.',
    };
  }
}

/**
 * R04: Kiểm tra chữ ký số hoặc tính hợp thức của e-Chungtu
 */
export class RuleR04DigitalSignature implements BaseRule {
  public readonly code = 'R04';
  public readonly name = 'Kiểm tra tính hợp thức của chữ ký số e-Chungtu';
  public readonly defaultSeverity = AuditSeverity.WARNING;
  public readonly category = 'DOCUMENT_VALIDITY';

  public async execute(context: AuditContext): Promise<RuleExecutionResult> {
    const invalidSignatureDocs = context.documents.filter((doc) => {
      // Chỉ áp dụng với chứng từ khấu trừ thuế điện tử
      if (doc.doc_type === DocumentType.WITHHOLDING_TAX) {
        return doc.is_digital_signature_valid === false;
      }
      return false;
    });

    if (invalidSignatureDocs.length > 0) {
      return {
        ruleCode: this.code,
        ruleName: this.name,
        severity: this.defaultSeverity,
        status: AuditStatus.WARNING,
        message: `Có ${invalidSignatureDocs.length} chứng từ khấu trừ điện tử chưa xác thực được chữ ký số hợp lệ theo Nghị định 123/2020/NĐ-CP.`,
        details: {
          invalidSignatureDocs: invalidSignatureDocs.map((d) => d.file_name),
        },
        suggestedFix: 'Yêu cầu tổ chức chi trả cung cấp bản thể hiện có đóng dấu số hợp lệ hoặc file XML gốc có chữ ký token.',
      };
    }

    return {
      ruleCode: this.code,
      ruleName: this.name,
      severity: this.defaultSeverity,
      status: AuditStatus.PASSED,
      message: 'Chữ ký số và tính hợp thức của các chứng từ điện tử đều hợp lệ.',
    };
  }
}
