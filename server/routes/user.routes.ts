// ==============================================================================
// Định tuyến Endpoint Thông tin Tài khoản & Người dùng (User Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Cập nhật thông tin hồ sơ cá nhân (họ tên, SĐT, địa chỉ, cơ quan thuế)
 * @access  Private (Bearer Token required)
 */
router.put(
  '/profile',
  authMiddleware,
  dbSessionMiddleware,
  userController.updateProfile
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Đổi mật khẩu người dùng
 * @access  Private (Bearer Token required)
 */
router.put(
  '/change-password',
  authMiddleware,
  dbSessionMiddleware,
  userController.changePassword
);

export const userRouter = router;
