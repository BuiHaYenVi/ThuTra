// ==============================================================================
// Định tuyến Endpoint Tham số Hệ thống (Setting Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/settings/public
 * @desc    Lấy danh mục tham số thuế công khai và biểu thuế lũy tiến 7 bậc (Public, không cần token)
 * @access  Public
 */
router.get(
  '/public',
  dbSessionMiddleware,
  settingController.getPublicSettings
);

/**
 * @route   PUT /api/settings
 * @desc    Cập nhật tham số hệ thống (chỉ super_admin)
 * @access  Private (super_admin)
 */
router.put(
  '/',
  authMiddleware,
  requireRoles('super_admin'),
  dbSessionMiddleware,
  settingController.updateSettings
);

export const settingRouter = router;
