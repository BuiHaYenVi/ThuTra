// ==============================================================================
// Gom Nhóm Toàn bộ API Router (Main API Router)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { Router, Request, Response } from 'express';
import { authRouter } from './auth.routes';
import { documentRouter } from './document.routes';
import { auditRouter } from './audit.routes';
import { profileRouter } from './profile.routes';
import { incomeRouter } from './income.routes';
import { dependentRouter } from './dependent.routes';
import { userRouter } from './user.routes';
import { settingRouter } from './setting.routes';
import { adminRouter } from './admin.routes';
import { ragRouter } from './rag.routes';
import { chatRouter } from './chat.routes';
import type { ApiResponse } from '../types/api.types';

const router = Router();

// Endpoint kiểm tra trạng thái sức khỏe máy chủ
router.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    statusCode: 200,
    message: 'Dịch vụ Backend ThuTra TNCN đang hoạt động ổn định.',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'ThuTra TNCN Authentication & RLS Session API',
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
});

// Gắn các nhánh router
router.use('/auth', authRouter);
router.use('/documents', documentRouter);
router.use('/audit', auditRouter);
router.use('/profiles', profileRouter);
router.use('/income-sources', incomeRouter);
router.use('/dependents', dependentRouter);
router.use('/users', userRouter);
router.use('/settings', settingRouter);
router.use('/admin', adminRouter);
router.use('/admin/rag-documents', ragRouter);
router.use('/chat', chatRouter);

export const mainApiRouter = router;
