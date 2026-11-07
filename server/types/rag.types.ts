// ==============================================================================
// Định nghĩa Kiểu Dữ liệu Kho Tri thức Pháp lý RAG (RAG Legal Documents Types)
// Hệ thống: ThuTra TNCN
// ==============================================================================

export interface RagDocumentEntity {
  id: string;
  code: string;
  title: string;
  category: string;
  chunks_count: number;
  vector_status: 'Ready' | 'Processing' | 'Failed' | 'Pending';
  cosine_similarity_avg: number;
  last_embedded_at: string | Date;
  full_content?: string;
  created_by?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface RagDocumentDto {
  id: string;
  code: string;
  title: string;
  category: string;
  chunksCount: number;
  vectorStatus: 'Ready' | 'Processing' | 'Failed' | 'Pending';
  cosineSimilarityAvg: number;
  lastEmbeddedAt: string;
  fullContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRagDocumentDto {
  code: string;
  title: string;
  category: string;
  fullContent?: string;
  chunksCount?: number;
}

export interface UpdateRagDocumentDto {
  title?: string;
  category?: string;
  fullContent?: string;
  chunksCount?: number;
  vectorStatus?: 'Ready' | 'Processing' | 'Failed' | 'Pending';
}

export interface SyncVectorResponseDto {
  documentId: string;
  code: string;
  chunksGenerated: number;
  vectorStatus: 'Ready';
  cosineSimilarityAvg: number;
  embeddedAt: string;
  message: string;
}
