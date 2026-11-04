// ==============================================================================
// Định tuyến Endpoint Thẩm tra & Quyết toán Thuế (Audit Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 3
// ==============================================================================

import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   POST /api/audit/calculate
 * @desc    Tính thử thuế TNCN nhanh theo biểu lũy tiến 7 bậc dựa trên dữ liệu tạm thời (không lưu database)
 * @access  Public / Authenticated
 */
router.post(
  '/calculate',
  auditController.calculate
);

/**
 * @route   POST /api/audit/run/:profileId
 * @desc    Chạy toàn bộ bộ máy thẩm tra 15 rules, tính toán thuế và lưu kết quả vào database
 * @access  Private (Taxpayer User or Super Admin)
 */
router.post(
  '/run/:profileId',
  authMiddleware,
  dbSessionMiddleware,
  auditController.runAudit
);

/**
 * @route   GET /api/audit/history/:profileId
 * @desc    Lấy danh sách lịch sử các lần thẩm tra của hồ sơ thuế
 * @access  Private (Taxpayer User, Admin Manager Read-only, Super Admin)
 */
router.get(
  '/history/:profileId',
  authMiddleware,
  dbSessionMiddleware,
  auditController.getHistory
);

/**
 * @route   GET /api/audit/report/:auditRunId
 * @desc    Xem báo cáo chi tiết của một phiên thẩm tra (kết quả 15 rules, bảng kê 7 bậc, hướng dẫn khắc phục)
 * @access  Private (Taxpayer User, Admin Manager Read-only, Super Admin)
 */
router.get(
  '/report/:auditRunId',
  authMiddleware,
  dbSessionMiddleware,
  auditController.getReport
);

export const auditRouter = router;
