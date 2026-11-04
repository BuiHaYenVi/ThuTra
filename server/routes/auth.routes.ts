// ==============================================================================
// Định tuyến Endpoint Xác thực (Authentication Routes)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';
import { validateLoginRequest } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản người nộp thuế mới
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập tài khoản và nhận Access Token + Refresh Token
 * @access  Public
 */
router.post('/login', validateLoginRequest, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin tài khoản hiện tại qua RLS Session Context
 * @access  Private (Bearer Token required)
 */
router.get('/me', authMiddleware, dbSessionMiddleware, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Thu hồi phiên làm việc và đăng xuất an toàn
 * @access  Private (Bearer Token required)
 */
router.post('/logout', authMiddleware, authController.logout);

export const authRouter = router;
