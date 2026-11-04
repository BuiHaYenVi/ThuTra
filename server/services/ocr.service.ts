// ==============================================================================
// Dịch vụ Bóc tách OCR AI (OCR Service - Adapter Pattern)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import path from 'path';
import fs from 'fs';
import { DocumentType, ExtractedOcrData } from '../types/document.types';

/**
 * Giao diện trừu tượng cho OCR Engine (Adapter Pattern)
 * Cho phép dễ dàng chuyển đổi linh hoạt giữa Mock Engine, Google Cloud Vision, AWS Textract hoặc Tesseract
 */
export interface IOcrEngine {
  extractData(
    filePath: string,
    originalFileName: string,
    mimeType: string,
    docType: DocumentType
  ): Promise<ExtractedOcrData>;
}

/**
 * Mock OCR Engine thông minh:
 * - Nhận diện mẫu chứng từ khấu trừ thuế TNCN điện tử theo chuẩn Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC
 * - Bóc tách MST đơn vị chi trả, Tên doanh nghiệp, Số chứng từ, Tổng thu nhập, Số thuế đã khấu trừ
 * - Tự động tính toán điểm tin cậy `confidence_score` (0.00 -> 1.00)
 * - Nếu `confidence_score < 0.85`, tự động bật cờ `needs_manual_review`
 */
export class MockOcrEngine implements IOcrEngine {
  public async extractData(
    filePath: string,
    originalFileName: string,
    mimeType: string,
    docType: DocumentType
  ): Promise<ExtractedOcrData> {
    const fileNameLower = originalFileName.toLowerCase();

    // 1. Kịch bản tệp chất lượng thấp / mờ nhòe (Mô phỏng confidence thấp < 0.85)
    if (
      fileNameLower.includes('mo') ||
      fileNameLower.includes('noisy') ||
      fileNameLower.includes('blur') ||
      fileNameLower.includes('low_res')
    ) {
      return {
        tax_code_issuer: '0312999888',
        issuer_name: 'Công ty TNHH Dịch vụ Thương mại Khang Thịnh',
        document_number: 'CT03/2024/KT01',
        serial_number: '2C24TTC',
        gross_income: 75000000,
        tax_deducted: 7500000,
        tax_year: 2024,
        confidence_score: 0.76, // < 0.85
        needs_manual_review: true,
        raw_text:
          'CHỨNG TỪ KHẤU TRỪ THUẾ THU NHẬP CÁ NHÂN... Đơn vị chi trả: Công ty Khang Thịnh... [Chữ mờ khó đọc]',
      };
    }

    // 2. Kịch bản Chứng minh Người phụ thuộc (CCCD / Giấy khai sinh)
    if (docType === DocumentType.DEPENDENT_PROOF || fileNameLower.includes('cccd') || fileNameLower.includes('birth')) {
      return {
        tax_code_issuer: '8091234567',
        issuer_name: 'Cục Cảnh sát Quản lý hành chính về trật tự xã hội (C06)',
        document_number: '019283748201',
        serial_number: 'CCCD-CHIP',
        gross_income: 0,
        tax_deducted: 0,
        tax_year: new Date().getFullYear(),
        confidence_score: 0.98,
        needs_manual_review: false,
        raw_text:
          'CĂN CƯỚC CÔNG DÂN... Họ và tên: TRẦN THỊ MAI... Ngày sinh: 12/05/1958... Nơi thường trú: TP. Hồ Chí Minh.',
        signer_info: {
          organization: 'Cục Cảnh sát QLHC về TTXH',
          serial: 'CA-BCA-2024',
          is_valid: true,
        },
      };
    }

    // 3. Kịch bản Chứng từ khấu trừ ABC (Khớp với dữ liệu mẫu trên UI / mockWizardStep2)
    if (fileNameLower.includes('abc')) {
      return {
        tax_code_issuer: '0312345678',
        issuer_name: 'Công ty Cổ phần Công nghệ ABC',
        document_number: 'CT01/2024/ABC89',
        serial_number: '1C24TTC',
        gross_income: 180000000,
        tax_deducted: 14200000,
        tax_year: 2024,
        confidence_score: 0.99,
        needs_manual_review: false,
        raw_text:
          'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nCHỨNG TỪ KHẤU TRỪ THUẾ THU NHẬP CÁ NHÂN ĐIỆN TỬ\nMẫu số: 02/QTT-TNCN\nKý hiệu: 1C24TTC - Số: CT01/2024/ABC89\nTổ chức chi trả: Công ty Cổ phần Công nghệ ABC\nMã số thuế: 0312345678\nTổng thu nhập chịu thuế đã chi trả: 180.000.000 VNĐ\nSố thuế thu nhập cá nhân đã khấu trừ: 14.200.000 VNĐ\nBảo hiểm bắt buộc trích nộp: 18.900.000 VNĐ',
        signer_info: {
          organization: 'Công ty Cổ phần Công nghệ ABC',
          serial: '540412348911',
          is_valid: true,
        },
      };
    }

    // 4. Kịch bản Chứng từ FPT
    if (fileNameLower.includes('fpt')) {
      return {
        tax_code_issuer: '0101248141',
        issuer_name: 'Công ty Cổ phần FPT',
        document_number: 'CT02/2024/FPT99',
        serial_number: '1C24TTC',
        gross_income: 240000000,
        tax_deducted: 21500000,
        tax_year: 2024,
        confidence_score: 0.98,
        needs_manual_review: false,
        raw_text:
          'CHỨNG TỪ KHẤU TRỪ THUẾ THU NHẬP CÁ NHÂN ĐIỆN TỬ\nTổ chức chi trả: Công ty Cổ phần FPT\nMST: 0101248141\nTổng thu nhập chịu thuế: 240.000.000 VNĐ\nSố thuế đã khấu trừ: 21.500.000 VNĐ',
        signer_info: {
          organization: 'Công ty Cổ phần FPT',
          serial: '540199283711',
          is_valid: true,
        },
      };
    }

    // 5. Kịch bản Chứng từ vãng lai 10% (XYZ / Freelance)
    if (fileNameLower.includes('xyz') || fileNameLower.includes('freelance') || fileNameLower.includes('tu_van')) {
      return {
        tax_code_issuer: '0109876543',
        issuer_name: 'Công ty Cổ phần Truyền thông Đa phương tiện XYZ',
        document_number: 'CT04/2024/0912',
        serial_number: '2C24TTC',
        gross_income: 50000000,
        tax_deducted: 5000000,
        tax_year: 2024,
        confidence_score: 0.96,
        needs_manual_review: false,
        raw_text:
          'CHỨNG TỪ KHẤU TRỪ THUẾ TNCN ĐIỆN TỬ\nTổ chức chi trả: Công ty Cổ phần Truyền thông Đa phương tiện XYZ\nMST: 0109876543\nKhoản chi trả: Thù lao dịch vụ tư vấn thiết kế UI/UX\nTổng thu nhập chịu thuế: 50.000.000 VNĐ\nSố thuế đã khấu trừ (10%): 5.000.000 VNĐ',
        signer_info: {
          organization: 'Công ty Cổ phần Truyền thông Đa phương tiện XYZ',
          serial: '540776512399',
          is_valid: true,
        },
      };
    }

    // 6. Kịch bản mặc định (Bóc tách tự động tổng quát)
    return {
      tax_code_issuer: '0318889999',
      issuer_name: 'Tổ chức Chi trả Thu nhập Tiêu chuẩn',
      document_number: `CT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      serial_number: '1C24TTC',
      gross_income: 120000000,
      tax_deducted: 9600000,
      tax_year: 2024,
      confidence_score: 0.92,
      needs_manual_review: false,
      raw_text: `CHỨNG TỪ KHẤU TRỪ THUẾ TNCN ĐIỆN TỬ\nTệp tin: ${originalFileName}\nĐịnh dạng: ${mimeType}\nBóc tách thành công qua ThuTra OCR AI Engine.`,
      signer_info: {
        organization: 'Chứng thực Chữ ký số Quốc gia VNPT-CA',
        serial: '889922114455',
        is_valid: true,
      },
    };
  }
}

/**
 * Service điều phối OCR chính
 */
export class OcrService {
  private engine: IOcrEngine;

  constructor(engine?: IOcrEngine) {
    this.engine = engine || new MockOcrEngine();
  }

  /**
   * Thay đổi OCR Engine khi cần (ví dụ: chuyển sang Google Vision OCR)
   */
  public setEngine(engine: IOcrEngine): void {
    this.engine = engine;
  }

  /**
   * Bóc tách dữ liệu từ tài liệu
   */
  public async extract(
    filePath: string,
    originalFileName: string,
    mimeType: string,
    docType: DocumentType = DocumentType.WITHHOLDING_TAX
  ): Promise<ExtractedOcrData> {
    return this.engine.extractData(filePath, originalFileName, mimeType, docType);
  }
}

export const ocrService = new OcrService();
