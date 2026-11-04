// ==============================================================================
// Định tuyến Endpoint Quản trị Hệ thống & Kiểm toán (Admin Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/admin/rules
 * @desc    Lấy danh sách toàn bộ quy tắc thẩm tra kèm trạng thái và căn cứ pháp lý
 * @access  Private (admin_manager, super_admin)
 */
router.get(
  '/rules',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  adminController.getRules
);

/**
 * @route   GET /api/admin/rules/:id
 * @desc    Xem chi tiết cấu hình và ngưỡng kiểm tra của 1 quy tắc theo ID hoặc Code
 * @access  Private (admin_manager, super_admin)
 */
router.get(
  '/rules/:id',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  adminController.getRuleById
);

/**
 * @route   PUT /api/admin/rules/:id
 * @desc    Cập nhật quy tắc thẩm tra, tự động tăng version và ghi bản ghi vào tax_rule_history
 * @access  Private (super_admin)
 */
router.put(
  '/rules/:id',
  authMiddleware,
  requireRoles('super_admin'),
  dbSessionMiddleware,
  adminController.updateRule
);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Lấy danh sách nhật ký kiểm toán hệ thống có phân trang và che mờ dữ liệu Nghị định 13
 * @access  Private (admin_manager, super_admin)
 */
router.get(
  '/audit-logs',
  authMiddleware,
  requireRoles('admin_manager', 'super_admin'),
  dbSessionMiddleware,
  adminController.getAuditLogs
);

export const adminRouter = router;
