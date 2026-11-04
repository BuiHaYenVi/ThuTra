// ==============================================================================
// Định tuyến Endpoint Nguồn Thu nhập (Income Routes)
// Hệ thống: ThuTra TNCN - Giai đoạn 4
// ==============================================================================

import { Router } from 'express';
import { incomeController } from '../controllers/income.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/income-sources
 * @desc    Lấy danh sách nguồn thu nhập theo profileId
 * @access  Private (Bearer Token required)
 */
router.get(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  incomeController.getIncomeSources
);

/**
 * @route   POST /api/income-sources
 * @desc    Thêm mới một nguồn thu nhập
 * @access  Private (Bearer Token required)
 */
router.post(
  '/',
  authMiddleware,
  dbSessionMiddleware,
  incomeController.create
);

/**
 * @route   GET /api/income-sources/:id
 * @desc    Xem chi tiết nguồn thu nhập
 * @access  Private (Bearer Token required)
 */
router.get(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  incomeController.getById
);

/**
 * @route   PUT /api/income-sources/:id
 * @desc    Cập nhật thông tin nguồn thu nhập
 * @access  Private (Bearer Token required)
 */
router.put(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  incomeController.update
);

/**
 * @route   DELETE /api/income-sources/:id
 * @desc    Xóa nguồn thu nhập
 * @access  Private (Bearer Token required)
 */
router.delete(
  '/:id',
  authMiddleware,
  dbSessionMiddleware,
  incomeController.delete
);

export const incomeRouter = router;
