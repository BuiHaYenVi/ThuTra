// ==============================================================================
// Tầng Dịch vụ Kho Tri thức Pháp lý RAG (RAG Document Service)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { PoolClient } from 'pg';
import { ragRepository } from '../repositories/rag.repository';
import {
  RagDocumentEntity,
  RagDocumentDto,
  CreateRagDocumentDto,
  UpdateRagDocumentDto,
  SyncVectorResponseDto,
} from '../types/rag.types';
import { UserContext } from '../types/auth.types';
import { ValidationError, NotFoundError, ConflictError } from '../errors/app-error';

export class RagService {
  private mapToDto(entity: RagDocumentEntity): RagDocumentDto {
    return {
      id: entity.id,
      code: entity.code,
      title: entity.title,
      category: entity.category,
      chunksCount: Number(entity.chunks_count || 0),
      vectorStatus: entity.vector_status,
      cosineSimilarityAvg: Number(entity.cosine_similarity_avg || 0.95),
      lastEmbeddedAt: new Date(entity.last_embedded_at).toISOString(),
      fullContent: entity.full_content,
      createdAt: new Date(entity.created_at).toISOString(),
      updatedAt: new Date(entity.updated_at).toISOString(),
    };
  }

  /**
   * Lấy danh sách văn bản pháp lý
   */
  public async getDocuments(client: PoolClient, search?: string): Promise<RagDocumentDto[]> {
    const list = await ragRepository.findAll(client, search);
    return list.map(this.mapToDto);
  }

  /**
   * Lấy chi tiết văn bản
   */
  public async getDocumentById(client: PoolClient, id: string): Promise<RagDocumentDto> {
    const doc = await ragRepository.findById(client, id);
    if (!doc) {
      throw new NotFoundError(`Không tìm thấy tài liệu văn bản pháp lý với ID: ${id}`);
    }
    return this.mapToDto(doc);
  }

  /**
   * Tạo văn bản pháp lý mới
   */
  public async createDocument(
    client: PoolClient,
    user: UserContext,
    dto: CreateRagDocumentDto
  ): Promise<RagDocumentDto> {
    if (!dto.code || !dto.code.trim()) {
      throw new ValidationError('Mã số văn bản (code) không được để trống.');
    }
    if (!dto.title || !dto.title.trim()) {
      throw new ValidationError('Tiêu đề văn bản (title) không được để trống.');
    }
    if (!dto.category || !dto.category.trim()) {
      throw new ValidationError('Phân loại văn bản (category) không được để trống.');
    }

    const existing = await ragRepository.findByCode(client, dto.code);
    if (existing) {
      throw new ConflictError(`Văn bản với mã '${dto.code}' đã tồn tại trong kho tri thức.`);
    }

    const created = await ragRepository.create(client, user.id, dto);
    return this.mapToDto(created);
  }

  /**
   * Cập nhật văn bản
   */
  public async updateDocument(
    client: PoolClient,
    id: string,
    dto: UpdateRagDocumentDto
  ): Promise<RagDocumentDto> {
    const existing = await ragRepository.findById(client, id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy tài liệu với ID: ${id}`);
    }

    const updated = await ragRepository.update(client, id, dto);
    if (!updated) {
      throw new NotFoundError(`Cập nhật thất bại, không tìm thấy tài liệu ID: ${id}`);
    }
    return this.mapToDto(updated);
  }

  /**
   * Xóa văn bản
   */
  public async deleteDocument(client: PoolClient, id: string): Promise<void> {
    const existing = await ragRepository.findById(client, id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy tài liệu với ID: ${id}`);
    }

    const deleted = await ragRepository.delete(client, id);
    if (!deleted) {
      throw new NotFoundError(`Không thể xóa tài liệu ID: ${id}`);
    }
  }

  /**
   * Kích hoạt đồng bộ hóa vector embeddings (mô phỏng nhúng vector AI)
   */
  public async syncVector(client: PoolClient, id: string): Promise<SyncVectorResponseDto> {
    const doc = await ragRepository.findById(client, id);
    if (!doc) {
      throw new NotFoundError(`Không tìm thấy tài liệu với ID: ${id}`);
    }

    // Tính toán số chunks và cosine similarity
    const contentLength = (doc.full_content || doc.title).length;
    const chunks = Math.max(8, Math.round(contentLength / 180) + Math.floor(Math.random() * 6 + 10));
    const similarity = Math.round((0.92 + Math.random() * 0.06) * 1000) / 1000;

    const updated = await ragRepository.syncVector(client, id, chunks, similarity);
    if (!updated) {
      throw new NotFoundError(`Lỗi khi cập nhật trạng thái vector cho tài liệu: ${id}`);
    }

    return {
      documentId: updated.id,
      code: updated.code,
      chunksGenerated: chunks,
      vectorStatus: 'Ready',
      cosineSimilarityAvg: similarity,
      embeddedAt: new Date().toISOString(),
      message: `Đã nạp thành công ${chunks} vector chunks cho văn bản ${updated.code} vào CSDL RAG.`,
    };
  }
}

export const ragService = new RagService();
