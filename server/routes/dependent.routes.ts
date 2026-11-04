// ==============================================================================
// Định tuyến Endpoint Người phụ thuộc (Dependent Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Router } from 'express';
import { dependentController } from '../controllers/dependent.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/dependents
 * @desc    Lấy danh sách người phụ thuộc theo profileId
 * @access  Private (Bearer Token required)
 */
router.get(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  dependentController.getDependents
);

/**
 * @route   POST /api/dependents
 * @desc    Đăng ký người phụ thuộc mới
 * @access  Private (Bearer Token required)
 */
router.post(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  dependentController.create
);

/**
 * @route   GET /api/dependents/:id
 * @desc    Xem chi tiết người phụ thuộc
 * @access  Private (Bearer Token required)
 */
router.get(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  dependentController.getById
);

/**
 * @route   PUT /api/dependents/:id
 * @desc    Cập nhật thông tin hoặc số tháng giảm trừ
 * @access  Private (Bearer Token required)
 */
router.put(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  dependentController.update
);

/**
 * @route   DELETE /api/dependents/:id
 * @desc    Xóa người phụ thuộc
 * @access  Private (Bearer Token required)
 */
router.delete(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  dependentController.delete
);

export const dependentRouter = router;
