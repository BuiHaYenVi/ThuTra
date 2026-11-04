// ==============================================================================
// Định tuyến Endpoint Quản lý Chứng từ Thuế & OCR (Document Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';
import { uploadDocumentMiddleware } from '../config/multer.config';

const router = Router();

/**
 * @route   POST /api/documents/upload
 * @desc    Tải lên tệp chứng từ (PDF, PNG, JPG), bóc tách OCR AI và lưu nháp
 * @access  Private (Bearer Token required)
 */
router.post(
  '/upload',
  authMiddleware,
  uploadDocumentMiddleware,
  dbSessionMiddleware,
  documentController.upload
);

/**
 * @route   GET /api/documents
 * @desc    Lấy danh sách chứng từ của người dùng (phân trang, lọc theo loại/trạng thái)
 * @access  Private (Bearer Token required)
 */
router.get(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  documentController.getDocuments
);

/**
 * @route   GET /api/documents/:id
 * @desc    Lấy chi tiết một chứng từ kèm dữ liệu bóc tách OCR thô
 * @access  Private (Bearer Token required)
 */
router.get(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  documentController.getById
);

/**
 * @route   PUT /api/documents/:id/confirm
 * @desc    Xác nhận số liệu đối soát chính thức (chuyển sang verified_manual)
 * @access  Private (Bearer Token required)
 */
router.put(
  '/:id/confirm',
  authMiddleware,
  dbSessionMiddleware,
  documentController.confirm
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Xóa chứng từ trong cơ sở dữ liệu và xóa tệp vật lý trên đĩa
 * @access  Private (Bearer Token required)
 */
router.delete(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  documentController.delete
);

export const documentRouter = router;
