// ==============================================================================
// Tầng Truy cập Dữ liệu Chứng từ Thuế (Document Repository / DAO)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import { PoolClient } from 'pg';
import { 
  TaxDocumentDbEntity, 
  ExtractedOcrData, 
  DocumentType, 
  VerificationStatus, 
  DocumentListQueryDto 
} from '../types/document.types';

export class DocumentRepository {
  /**
   * Thêm mới bản ghi chứng từ thuế vào cơ sở dữ liệu
   * Thực thi dưới transaction của client có RLS context
   */
  public async create(
    client: PoolClient,
    data: {
      userId: string;
      profileId?: string | null;
      docType: DocumentType;
      fileName: string;
      fileUrl: string;
      fileSizeBytes: number;
      mimeType: string;
      fileHashSha256?: string | null;
      ocrConfidence: number;
      ocrExtractedPayload: ExtractedOcrData;
      isDigitalSignatureValid?: boolean;
      certificateSerial?: string | null;
      signerOrganization?: string | null;
    }
  ): Promise<TaxDocumentDbEntity> {
    const query = `
      INSERT INTO tax_documents (
        user_id,
        profile_id,
        doc_type,
        file_name,
        file_url,
        file_size_bytes,
        mime_type,
        file_hash_sha256,
        ocr_status,
        ocr_confidence,
        ocr_extracted_payload,
        verification_status,
        is_digital_signature_valid,
        certificate_serial,
        signer_organization,
        retention_expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9, $10, 'unverified', $11, $12, $13,
        (CLOCK_TIMESTAMP() + INTERVAL '30 days')
      )
      RETURNING *;
    `;

    const values = [
      data.userId,
      data.profileId || null,
      data.docType,
      data.fileName,
      data.fileUrl,
      data.fileSizeBytes,
      data.mimeType,
      data.fileHashSha256 || null,
      data.ocrConfidence,
      JSON.stringify(data.ocrExtractedPayload),
      data.isDigitalSignatureValid ?? false,
      data.certificateSerial || null,
      data.signerOrganization || null,
    ];

    const result = await client.query<TaxDocumentDbEntity>(query, values);
    return result.rows[0];
  }

  /**
   * Truy vấn chi tiết một chứng từ theo ID
   * Chịu sự chi phối trực tiếp của chính sách RLS (Trả về 0 dòng nếu không phải của mình)
   */
  public async findById(client: PoolClient, id: string): Promise<TaxDocumentDbEntity | null> {
    const query = `
      SELECT *
      FROM tax_documents
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      LIMIT 1;
    `;

    const result = await client.query<TaxDocumentDbEntity>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Lấy danh sách chứng từ kèm điều kiện lọc và phân trang
   * RLS tự động giới hạn chỉ trả về tài liệu của người dùng hiện tại
   */
  public async findByUserId(
    client: PoolClient,
    queryParams: DocumentListQueryDto
  ): Promise<{ rows: TaxDocumentDbEntity[]; total: number }> {
    const page = Math.max(1, queryParams.page || 1);
    const limit = Math.max(1, Math.min(100, queryParams.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['(user_id = current_app_user_id() OR is_super_admin())'];
    const values: any[] = [];
    let paramIndex = 1;

    // Lọc theo loại chứng từ
    if (queryParams.docType) {
      conditions.push(`doc_type = $${paramIndex++}`);
      values.push(queryParams.docType);
    }

    // Lọc theo trạng thái xác thực
    if (queryParams.status) {
      conditions.push(`verification_status = $${paramIndex++}`);
      values.push(queryParams.status);
    }

    // Lọc theo năm tính thuế trong metadata JSONB
    if (queryParams.taxYear) {
      conditions.push(`(ocr_extracted_payload->>'tax_year')::int = $${paramIndex++}`);
      values.push(queryParams.taxYear);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Đếm tổng số bản ghi thỏa điều kiện
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM tax_documents
      ${whereClause};
    `;
    const countResult = await client.query<{ total: string }>(countQuery, values);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Lấy danh sách phân trang
    const listQuery = `
      SELECT *
      FROM tax_documents
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    const listValues = [...values, limit, offset];
    const listResult = await client.query<TaxDocumentDbEntity>(listQuery, listValues);

    return {
      rows: listResult.rows,
      total,
    };
  }

  /**
   * Cập nhật số liệu xác nhận chính thức từ người dùng
   * Chuyển trạng thái sang `verified_manual` và ghi nhận `verified_at = CLOCK_TIMESTAMP()`
   */
  public async updateConfirmData(
    client: PoolClient,
    id: string,
    verifiedData: {
      issuerName: string;
      taxCodeIssuer: string;
      documentNumber?: string;
      grossIncome: number;
      taxDeducted: number;
      taxYear: number;
    }
  ): Promise<TaxDocumentDbEntity | null> {
    const query = `
      UPDATE tax_documents
      SET 
        verification_status = 'verified_manual',
        verified_at = CLOCK_TIMESTAMP(),
        ocr_extracted_payload = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                ocr_extracted_payload,
                '{issuer_name}', to_jsonb($2::text)
              ),
              '{tax_code_issuer}', to_jsonb($3::text)
            ),
            '{gross_income}', to_jsonb($4::numeric)
          ),
          '{tax_deducted}', to_jsonb($5::numeric)
        ),
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin())
      RETURNING *;
    `;

    const values = [
      id,
      verifiedData.issuerName,
      verifiedData.taxCodeIssuer,
      verifiedData.grossIncome,
      verifiedData.taxDeducted,
    ];

    const result = await client.query<TaxDocumentDbEntity>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Xóa chứng từ theo ID
   * Chịu sự chi phối của RLS policy
   */
  public async deleteById(client: PoolClient, id: string): Promise<boolean> {
    const query = `
      DELETE FROM tax_documents
      WHERE id = $1 AND (user_id = current_app_user_id() OR is_super_admin());
    `;

    const result = await client.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Tự động tìm hoặc khởi tạo Tax Profile theo năm quyết toán của người dùng
   */
  public async ensureTaxProfile(
    client: PoolClient,
    userId: string,
    taxYear: number
  ): Promise<string> {
    // 1. Kiểm tra profile hiện có
    const checkQuery = `
      SELECT id FROM tax_profiles
      WHERE user_id = $1 AND tax_year = $2
      LIMIT 1;
    `;
    const checkRes = await client.query<{ id: string }>(checkQuery, [userId, taxYear]);
    if (checkRes.rows[0]) {
      return checkRes.rows[0].id;
    }

    // 2. Lấy thông tin cơ quan thuế mặc định từ bảng users
    const userQuery = `
      SELECT tax_department_code, tax_department_name
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const userRes = await client.query<{
      tax_department_code: string | null;
      tax_department_name: string | null;
    }>(userQuery, [userId]);

    const deptCode = userRes.rows[0]?.tax_department_code || '79119';
    const deptName = userRes.rows[0]?.tax_department_name || 'Chi cục Thuế Quận Bình Thạnh (TP.HCM)';

    // 3. Khởi tạo Tax Profile nháp
    const insertQuery = `
      INSERT INTO tax_profiles (
        user_id,
        tax_year,
        period_title,
        filing_status,
        tax_department_code,
        tax_department_name
      ) VALUES (
        $1, $2, $3, 'draft', $4, $5
      )
      ON CONFLICT (user_id, tax_year) DO UPDATE
      SET updated_at = CLOCK_TIMESTAMP()
      RETURNING id;
    `;

    const insertRes = await client.query<{ id: string }>(insertQuery, [
      userId,
      taxYear,
      `Kỳ quyết toán thuế TNCN năm ${taxYear}`,
      deptCode,
      deptName,
    ]);

    return insertRes.rows[0].id;
  }

  /**
   * Đồng bộ nguồn thu nhập vào bảng income_sources sau khi đối soát xong chứng từ
   */
  public async syncIncomeSource(
    client: PoolClient,
    profileId: string,
    userId: string,
    data: {
      payerName: string;
      payerMst: string;
      contractTitle: string;
      totalTaxableIncome: number;
      taxWithheld: number;
      eCertificateCode?: string;
    }
  ): Promise<string> {
    const query = `
      INSERT INTO income_sources (
        profile_id,
        user_id,
        category,
        payer_name,
        payer_mst,
        contract_title,
        total_income_gross,
        total_taxable_income,
        tax_withheld,
        withholding_rate,
        e_certificate_code,
        is_e_certificate_verified
      ) VALUES (
        $1, $2, 'salary_contract', $3, $4, $5, $6, $6, $7, 0.00, $8, true
      )
      RETURNING id;
    `;

    const result = await client.query<{ id: string }>(query, [
      profileId,
      userId,
      data.payerName,
      data.payerMst,
      data.contractTitle,
      data.totalTaxableIncome,
      data.taxWithheld,
      data.eCertificateCode || null,
    ]);

    return result.rows[0].id;
  }
}

export const documentRepository = new DocumentRepository();
