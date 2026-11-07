// ==============================================================================
// Định tuyến Endpoint Chatbot AI Hỏi đáp Pháp luật Thuế (Tax Chat Routes)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dbSessionMiddleware } from '../middlewares/db-session.middleware';

const router = Router();

/**
 * @route   GET /api/chat/suggestions
 * @desc    Lấy danh mục các chủ đề câu hỏi gợi ý phổ biến
 * @access  Public
 */
router.get('/suggestions', chatController.getSuggestions);

/**
 * @route   POST /api/chat/ask
 * @desc    Gửi câu hỏi và nhận phân tích pháp lý AI
 * @access  Public / Authenticated (Hỗ trợ cả khách vãng lai và người đã đăng nhập)
 */
router.post(
  '/ask',
  dbSessionMiddleware,
  chatController.askQuestion
);

export const chatRouter = router;
