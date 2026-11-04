// ==============================================================================
// Tầng Dịch vụ Nghiệp vụ Chứng từ Thuế (Document Service)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PoolClient } from 'pg';
import { documentRepository } from '../repositories/document.repository';
import { ocrService } from './ocr.service';
import { 
  DocumentType, 
  VerificationStatus, 
  OcrStatus, 
  UploadDocumentDto, 
  ConfirmDocumentDto, 
  DocumentListQueryDto, 
  DocumentResponseDto, 
  TaxDocumentDbEntity 
} from '../types/document.types';
import type { UserContext } from '../types/auth.types';
import { 
  NotFoundError, 
  ValidationError, 
  AppError 
} from '../errors/app-error';

export class DocumentService {
  /**
   * Chuyển đổi Entity cơ sở dữ liệu sang DTO phản hồi người dùng
   */
  private mapToResponseDto(entity: TaxDocumentDbEntity): DocumentResponseDto {
    const rawPayload = typeof entity.ocr_extracted_payload === 'string'
      ? JSON.parse(entity.ocr_extracted_payload)
      : entity.ocr_extracted_payload || {};

    return {
      id: entity.id,
      userId: entity.user_id,
      profileId: entity.profile_id,
      incomeSourceId: entity.income_source_id,
      docType: entity.doc_type as DocumentType,
      fileName: entity.file_name,
      fileUrl: entity.file_url,
      fileSizeBytes: Number(entity.file_size_bytes),
      mimeType: entity.mime_type,
      ocrStatus: entity.ocr_status as OcrStatus,
      ocrConfidence: Number(entity.ocr_confidence || 0),
      verificationStatus: entity.verification_status as VerificationStatus,
      extractedData: {
        tax_code_issuer: rawPayload.tax_code_issuer || '',
        issuer_name: rawPayload.issuer_name || '',
        document_number: rawPayload.document_number || '',
        serial_number: rawPayload.serial_number,
        gross_income: Number(rawPayload.gross_income || 0),
        tax_deducted: Number(rawPayload.tax_deducted || 0),
        tax_year: Number(rawPayload.tax_year || new Date().getFullYear()),
        confidence_score: Number(rawPayload.confidence_score || 0),
        needs_manual_review: Boolean(rawPayload.needs_manual_review),
        raw_text: rawPayload.raw_text,
        signer_info: rawPayload.signer_info,
      },
      isDigitalSignatureValid: Boolean(entity.is_digital_signature_valid),
      verifiedAt: entity.verified_at,
      createdAt: entity.created_at,
      retentionExpiresAt: entity.retention_expires_at,
    };
  }

  /**
   * Tính toán mã băm SHA-256 của tệp để kiểm tra tính toàn vẹn
   */
  private calculateFileSha256(filePath: string): string {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Upload chứng từ thuế mới, bóc tách OCR và lưu trữ vào database
   */
  public async uploadDocument(
    user: UserContext,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    client: PoolClient
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new ValidationError('Không tìm thấy tệp tải lên.', [
        { field: 'file', message: 'Tệp tin là bắt buộc.' },
      ]);
    }

    const docType = dto.docType || DocumentType.WITHHOLDING_TAX;

    // 1. Tính mã băm SHA-256 của tệp
    const fileHash = this.calculateFileSha256(file.path);

    // 2. Kích hoạt OCR Service bóc tách dữ liệu
    const ocrResult = await ocrService.extract(
      file.path,
      file.originalname,
      file.mimetype,
      docType
    );

    // 3. Xác định năm quyết toán thuế & Tự động gắn/tạo Tax Profile
    const taxYear = dto.taxYear || ocrResult.tax_year || new Date().getFullYear();
    const profileId = await documentRepository.ensureTaxProfile(client, user.id, taxYear);

    // 4. Đường dẫn URL tệp phục vụ tải về hoặc xem trước
    const relativeFileUrl = `/storage/uploads/documents/${user.id}/${path.basename(file.path)}`;

    // 5. Lưu bản ghi vào cơ sở dữ liệu qua RLS Client
    const createdEntity = await documentRepository.create(client, {
      userId: user.id,
      profileId,
      docType,
      fileName: file.originalname,
      fileUrl: relativeFileUrl,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      fileHashSha256: fileHash,
      ocrConfidence: Math.round(ocrResult.confidence_score * 100),
      ocrExtractedPayload: ocrResult,
      isDigitalSignatureValid: Boolean(ocrResult.signer_info?.is_valid),
      certificateSerial: ocrResult.signer_info?.serial,
      signerOrganization: ocrResult.signer_info?.organization,
    });

    return this.mapToResponseDto(createdEntity);
  }

  /**
   * Lấy danh sách chứng từ của người dùng (tự động lọc theo RLS session)
   */
  public async getDocuments(
    _user: UserContext,
    queryParams: DocumentListQueryDto,
    client: PoolClient
  ): Promise<{
    documents: DocumentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, queryParams.page || 1);
    const limit = Math.max(1, Math.min(100, queryParams.limit || 20));

    const { rows, total } = await documentRepository.findByUserId(client, queryParams);

    return {
      documents: rows.map((row) => this.mapToResponseDto(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Lấy chi tiết một chứng từ
   * RLS bảo đảm người dùng khác không thể xem được (ném 404 để giấu ID)
   */
  public async getDocumentById(
    _user: UserContext,
    documentId: string,
    client: PoolClient
  ): Promise<DocumentResponseDto> {
    const entity = await documentRepository.findById(client, documentId);

    if (!entity) {
      throw new NotFoundError(
        'Không tìm thấy chứng từ thuế yêu cầu hoặc bạn không có quyền truy cập.'
      );
    }

    return this.mapToResponseDto(entity);
  }

  /**
   * Xác nhận số liệu sau khi người dùng đối chiếu ảnh gốc
   * Kiểm tra tính hợp lệ của số liệu tiền tệ & chuyển trạng thái sang verified_manual
   */
  public async confirmDocument(
    user: UserContext,
    documentId: string,
    dto: ConfirmDocumentDto,
    client: PoolClient
  ): Promise<DocumentResponseDto> {
    // 1. Kiểm tra tồn tại và quyền sở hữu qua RLS
    const existingDoc = await documentRepository.findById(client, documentId);
    if (!existingDoc) {
      throw new NotFoundError(
        'Không tìm thấy chứng từ thuế cần xác nhận hoặc bạn không có quyền truy cập.'
      );
    }

    // 2. Xác thực số liệu tiền tệ nghiêm ngặt
    const errors: Array<{ field: string; message: string }> = [];

    const grossIncome = Number(dto.grossIncome);
    const taxDeducted = Number(dto.taxDeducted);
    const taxYear = Number(dto.taxYear);

    if (isNaN(grossIncome) || grossIncome < 0) {
      errors.push({
        field: 'grossIncome',
        message: 'Tổng thu nhập chịu thuế phải là số không âm (>= 0 VNĐ).',
      });
    }

    if (isNaN(taxDeducted) || taxDeducted < 0) {
      errors.push({
        field: 'taxDeducted',
        message: 'Số thuế đã khấu trừ phải là số không âm (>= 0 VNĐ).',
      });
    }

    if (!isNaN(grossIncome) && !isNaN(taxDeducted) && taxDeducted > grossIncome) {
      errors.push({
        field: 'taxDeducted',
        message: 'Số thuế đã khấu trừ không thể lớn hơn tổng thu nhập chịu thuế.',
      });
    }

    if (!dto.taxCodeIssuer || !dto.taxCodeIssuer.trim()) {
      errors.push({
        field: 'taxCodeIssuer',
        message: 'Mã số thuế đơn vị chi trả là bắt buộc.',
      });
    }

    if (!dto.issuerName || !dto.issuerName.trim()) {
      errors.push({
        field: 'issuerName',
        message: 'Tên tổ chức chi trả thu nhập là bắt buộc.',
      });
    }

    if (isNaN(taxYear) || taxYear < 2000 || taxYear > 2100) {
      errors.push({
        field: 'taxYear',
        message: 'Năm tính thuế phải nằm trong khoảng từ năm 2000 đến 2100.',
      });
    }

    if (errors.length > 0) {
      throw new ValidationError('Số liệu đối soát chứng từ không hợp lệ.', errors);
    }

    // 3. Cập nhật số liệu vào tax_documents
    const updatedEntity = await documentRepository.updateConfirmData(client, documentId, {
      issuerName: dto.issuerName.trim(),
      taxCodeIssuer: dto.taxCodeIssuer.trim(),
      documentNumber: dto.documentNumber?.trim(),
      grossIncome,
      taxDeducted,
      taxYear,
    });

    if (!updatedEntity) {
      throw new NotFoundError('Không thể cập nhật chứng từ thuế.');
    }

    // 4. Nếu là chứng từ khấu trừ thuế (Withholding Tax), tự động đồng bộ sang bảng income_sources
    if (
      existingDoc.doc_type === DocumentType.WITHHOLDING_TAX &&
      dto.createIncomeSource !== false &&
      existingDoc.profile_id
    ) {
      try {
        await documentRepository.syncIncomeSource(client, existingDoc.profile_id, user.id, {
          payerName: dto.issuerName.trim(),
          payerMst: dto.taxCodeIssuer.trim(),
          contractTitle: `Thu nhập theo chứng từ ${dto.documentNumber || existingDoc.file_name}`,
          totalTaxableIncome: grossIncome,
          taxWithheld: taxDeducted,
          eCertificateCode: dto.documentNumber,
        });
      } catch (err: any) {
        console.warn('[Sync Income Source Warning]:', err.message);
      }
    }

    return this.mapToResponseDto(updatedEntity);
  }

  /**
   * Xóa chứng từ thuế:
   * Thực hiện xóa toàn vẹn 2 chiều: Xóa DB trong transaction RLS -> Xóa file vật lý trên đĩa
   */
  public async deleteDocument(
    _user: UserContext,
    documentId: string,
    client: PoolClient
  ): Promise<{ success: true; message: string; deletedId: string }> {
    // 1. Kiểm tra tồn tại chứng từ trong database
    const existingDoc = await documentRepository.findById(client, documentId);
    if (!existingDoc) {
      throw new NotFoundError(
        'Không tìm thấy chứng từ cần xóa hoặc bạn không có quyền truy cập.'
      );
    }

    // 2. Xóa bản ghi trong database trước
    const isDeleted = await documentRepository.deleteById(client, documentId);
    if (!isDeleted) {
      throw new AppError('Xóa chứng từ không thành công trong cơ sở dữ liệu.', 500);
    }

    // 3. Dọn dẹp tệp tin vật lý trên đĩa cứng
    if (existingDoc.file_url) {
      try {
        // Chuyển relative URL về đường dẫn vật lý
        const relativePath = existingDoc.file_url.replace(/^\/storage\//, 'storage/');
        const physicalPath = path.resolve(process.cwd(), relativePath);

        if (fs.existsSync(physicalPath)) {
          fs.unlinkSync(physicalPath);
        }
      } catch (fileErr: any) {
        console.warn(`[File Cleanup Warning]: Không thể xóa tệp vật lý (${fileErr.message})`);
      }
    }

    return {
      success: true,
      message: 'Đã xóa chứng từ thuế và dọn dẹp tệp tin vật lý thành công.',
      deletedId: documentId,
    };
  }
}

export const documentService = new DocumentService();
