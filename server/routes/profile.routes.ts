// ==============================================================================
// Định tuyến Endpoint Hồ sơ Quyết toán Thuế (Profile Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/profiles
 * @desc    Lấy danh sách các kỳ quyết toán thuế của người dùng (tự động phân quyền RLS)
 * @access  Private (Bearer Token required)
 */
router.get(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  profileController.getProfiles
);

/**
 * @route   POST /api/profiles
 * @desc    Khởi tạo kỳ quyết toán thuế mới (chống tạo trùng lặp cùng năm)
 * @access  Private (Bearer Token required)
 */
router.post(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  profileController.create
);

/**
 * @route   GET /api/profiles/:id
 * @desc    Lấy chi tiết hồ sơ quyết toán thuế
 * @access  Private (Bearer Token required)
 */
router.get(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  profileController.getById
);

/**
 * @route   PUT /api/profiles/:id
 * @desc    Cập nhật thông tin hồ sơ quyết toán thuế
 * @access  Private (Bearer Token required)
 */
router.put(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  profileController.update
);

/**
 * @route   DELETE /api/profiles/:id
 * @desc    Xóa hồ sơ quyết toán thuế (chỉ cho phép khi ở trạng thái draft)
 * @access  Private (Bearer Token required)
 */
router.delete(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  profileController.delete
);

export const profileRouter = router;
