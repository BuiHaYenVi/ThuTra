// ==============================================================================
// Định tuyến Endpoint Kho Tri thức Pháp lý RAG (RAG Document Routes)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Router } from 'express';
import { ragController } from '../controllers/rag.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/admin/rag-documents
 * @desc    Lấy danh mục tài liệu quy phạm pháp luật
 * @access  Private (Mọi tài khoản đã đăng nhập)
 */
router.get(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  ragController.getDocuments
);

/**
 * @route   GET /api/admin/rag-documents/:id
 * @desc    Lấy chi tiết một tài liệu
 * @access  Private (Mọi tài khoản đã đăng nhập)
 */
router.get(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  ragController.getDocumentById
);

/**
 * @route   POST /api/admin/rag-documents
 * @desc    Nạp thêm văn bản pháp quy mới vào kho RAG
 * @access  Private (admin_manager, super_admin)
 */
router.post(
  '/',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  ragController.createDocument
);

/**
 * @route   PUT /api/admin/rag-documents/:id
 * @desc    Cập nhật thông tin văn bản
 * @access  Private (admin_manager, super_admin)
 */
router.put(
  '/:id',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  ragController.updateDocument
);

/**
 * @route   DELETE /api/admin/rag-documents/:id
 * @desc    Xóa văn bản khỏi kho RAG
 * @access  Private (admin_manager, super_admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  ragController.deleteDocument
);

/**
 * @route   POST /api/admin/rag-documents/:id/sync
 * @desc    Đồng bộ vector chunks cho văn bản pháp lý
 * @access  Private (admin_manager, super_admin)
 */
router.post(
  '/:id/sync',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  ragController.syncVector
);

export const ragRouter = router;
