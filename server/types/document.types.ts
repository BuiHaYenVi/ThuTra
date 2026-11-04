// ==============================================================================
// Định nghĩa Kiểu dữ liệu Chứng từ Thuế & Bóc tách OCR (Document Types)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

/**
 * Phân loại loại chứng từ thuế theo chuẩn thông tư & nghị định thuế TNCN
 */
export enum DocumentType {
  WITHHOLDING_TAX = 'withholding_cert_form02', // Chứng từ khấu trừ thuế TNCN điện tử (NĐ 123)
  SALARY_CONFIRMATION = 'salary_confirmation', // Thư xác nhận thu nhập / Bảng lương
  LABOR_CONTRACT = 'labor_contract',           // Hợp đồng lao động
  DEPENDENT_PROOF = 'dependent_id_proof',      // Giấy tờ chứng minh người phụ thuộc (CCCD/Khai sinh)
  CHARITY_RECEIPT = 'charity_receipt',         // Biên lai từ thiện, nhân đạo (R07)
  PENSION_RECEIPT = 'pension_receipt',         // Chứng từ hưu trí tự nguyện (R13)
}

/**
 * Trạng thái đối soát xác thực chứng từ
 */
export enum VerificationStatus {
  PENDING = 'unverified',            // Chưa xác thực
  AUTO_VERIFIED = 'verified_auto',   // AI bóc tách tin cậy cao
  VERIFIED = 'verified_manual',      // Người dùng đã đối soát và xác nhận chính thức
  REJECTED = 'flagged_discrepancy',  // Phát hiện sai lệch số liệu
}

/**
 * Trạng thái tiến trình OCR AI
 */
export enum OcrStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Dữ liệu bóc tách được từ OCR AI
 */
export interface ExtractedOcrData {
  tax_code_issuer: string;     // Mã số thuế tổ chức chi trả thu nhập
  issuer_name: string;         // Tên tổ chức chi trả
  document_number: string;     // Số chứng từ / Ký hiệu mẫu (e-Chungtu)
  serial_number?: string;      // Ký hiệu seri chứng từ
  gross_income: number;        // Tổng thu nhập chịu thuế đã chi trả (VNĐ)
  tax_deducted: number;        // Số thuế TNCN đã khấu trừ (VNĐ)
  tax_year: number;            // Năm tính thuế
  confidence_score: number;    // Độ tin cậy (0.00 đến 1.00)
  needs_manual_review: boolean;// Cờ cảnh báo nếu confidence_score < 0.85
  raw_text?: string;           // Văn bản thô bóc tách
  signer_info?: {              // Thông tin chữ ký điện tử (NĐ 123)
    organization?: string;
    serial?: string;
    is_valid?: boolean;
  };
}

/**
 * Entity Document trong cơ sở dữ liệu (Bảng tax_documents)
 */
export interface TaxDocumentDbEntity {
  id: string;
  user_id: string;
  profile_id: string | null;
  income_source_id: string | null;
  doc_type: string;
  file_name: string;
  file_url: string;
  file_size_bytes: string | number;
  mime_type: string;
  file_hash_sha256: string | null;
  ocr_status: string;
  ocr_confidence: number | null;
  ocr_extracted_payload: ExtractedOcrData | Record<string, any>;
  verification_status: string;
  is_digital_signature_valid: boolean;
  certificate_serial: string | null;
  signer_organization: string | null;
  verified_at: string | null;
  retention_expires_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * DTO dữ liệu upload chứng từ
 */
export interface UploadDocumentDto {
  docType?: DocumentType;
  taxYear?: number;
}

/**
 * DTO xác nhận số liệu sau khi đối chiếu ảnh gốc
 */
export interface ConfirmDocumentDto {
  issuerName: string;
  taxCodeIssuer: string;
  documentNumber?: string;
  grossIncome: number;
  taxDeducted: number;
  taxYear: number;
  createIncomeSource?: boolean; // Tự động đồng bộ sang income_sources (mặc định: true)
}

/**
 * DTO truy vấn danh sách chứng từ (Pagination & Filtering)
 */
export interface DocumentListQueryDto {
  page?: number;
  limit?: number;
  docType?: DocumentType;
  status?: VerificationStatus;
  taxYear?: number;
}

/**
 * DTO phản hồi chuẩn hóa gửi về cho Client
 */
export interface DocumentResponseDto {
  id: string;
  userId: string;
  profileId: string | null;
  incomeSourceId: string | null;
  docType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  ocrStatus: OcrStatus;
  ocrConfidence: number;
  verificationStatus: VerificationStatus;
  extractedData: ExtractedOcrData;
  isDigitalSignatureValid: boolean;
  verifiedAt: string | null;
  createdAt: string;
  retentionExpiresAt: string;
}
