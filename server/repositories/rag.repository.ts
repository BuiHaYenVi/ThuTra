// ==============================================================================
// Tầng Truy vấn Cơ sở Dữ liệu Kho Tri thức RAG (RAG Document Repository)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { PoolClient } from 'pg';
import { RagDocumentEntity, CreateRagDocumentDto, UpdateRagDocumentDto } from '../types/rag.types';

export class RagRepository {
  /**
   * Lấy danh sách toàn bộ văn bản pháp lý (chịu sự chi phối của RLS)
   */
  public async findAll(client: PoolClient, search?: string): Promise<RagDocumentEntity[]> {
    let query = `
      SELECT 
        id, code, title, category, chunks_count, vector_status,
        cosine_similarity_avg, last_embedded_at, full_content,
        created_by, created_at, updated_at
      FROM rag_legal_documents
    `;
    const params: any[] = [];

    if (search && search.trim()) {
      query += ` WHERE title ILIKE $1 OR code ILIKE $1 OR category ILIKE $1`;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY created_at DESC;`;

    const result = await client.query<RagDocumentEntity>(query, params);
    return result.rows;
  }

  /**
   * Lấy chi tiết văn bản pháp lý theo ID
   */
  public async findById(client: PoolClient, id: string): Promise<RagDocumentEntity | null> {
    const query = `
      SELECT 
        id, code, title, category, chunks_count, vector_status,
        cosine_similarity_avg, last_embedded_at, full_content,
        created_by, created_at, updated_at
      FROM rag_legal_documents
      WHERE id = $1;
    `;
    const result = await client.query<RagDocumentEntity>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Lấy chi tiết văn bản pháp lý theo mã code (ví dụ: TT 111/2013/TT-BTC)
   */
  public async findByCode(client: PoolClient, code: string): Promise<RagDocumentEntity | null> {
    const query = `
      SELECT 
        id, code, title, category, chunks_count, vector_status,
        cosine_similarity_avg, last_embedded_at, full_content,
        created_by, created_at, updated_at
      FROM rag_legal_documents
      WHERE code = $1;
    `;
    const result = await client.query<RagDocumentEntity>(query, [code]);
    return result.rows[0] || null;
  }

  /**
   * Tạo văn bản pháp lý mới
   */
  public async create(
    client: PoolClient,
    userId: string,
    dto: CreateRagDocumentDto
  ): Promise<RagDocumentEntity> {
    const chunks = dto.chunksCount || Math.max(12, Math.floor(Math.random() * 30 + 15));
    const query = `
      INSERT INTO rag_legal_documents (
        code, title, category, chunks_count, vector_status,
        cosine_similarity_avg, full_content, created_by, last_embedded_at
      )
      VALUES ($1, $2, $3, $4, 'Ready', 0.945, $5, $6, CLOCK_TIMESTAMP())
      RETURNING *;
    `;
    const result = await client.query<RagDocumentEntity>(query, [
      dto.code.trim(),
      dto.title.trim(),
      dto.category.trim(),
      chunks,
      dto.fullContent || null,
      userId,
    ]);
    return result.rows[0];
  }

  /**
   * Cập nhật văn bản pháp lý
   */
  public async update(
    client: PoolClient,
    id: string,
    dto: UpdateRagDocumentDto
  ): Promise<RagDocumentEntity | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(dto.title.trim());
    }
    if (dto.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(dto.category.trim());
    }
    if (dto.fullContent !== undefined) {
      fields.push(`full_content = $${idx++}`);
      values.push(dto.fullContent);
    }
    if (dto.chunksCount !== undefined) {
      fields.push(`chunks_count = $${idx++}`);
      values.push(dto.chunksCount);
    }
    if (dto.vectorStatus !== undefined) {
      fields.push(`vector_status = $${idx++}`);
      values.push(dto.vectorStatus);
    }

    if (fields.length === 0) return this.findById(client, id);

    fields.push(`updated_at = CLOCK_TIMESTAMP()`);
    values.push(id);

    const query = `
      UPDATE rag_legal_documents
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const result = await client.query<RagDocumentEntity>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Xóa văn bản pháp lý
   */
  public async delete(client: PoolClient, id: string): Promise<boolean> {
    const query = `DELETE FROM rag_legal_documents WHERE id = $1;`;
    const result = await client.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Cập nhật trạng thái Vector Sync
   */
  public async syncVector(
    client: PoolClient,
    id: string,
    chunks: number,
    similarity: number
  ): Promise<RagDocumentEntity | null> {
    const query = `
      UPDATE rag_legal_documents
      SET 
        vector_status = 'Ready',
        chunks_count = $1,
        cosine_similarity_avg = $2,
        last_embedded_at = CLOCK_TIMESTAMP(),
        updated_at = CLOCK_TIMESTAMP()
      WHERE id = $3
      RETURNING *;
    `;
    const result = await client.query<RagDocumentEntity>(query, [chunks, similarity, id]);
    return result.rows[0] || null;
  }
}

export const ragRepository = new RagRepository();
