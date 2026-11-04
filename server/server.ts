// ==============================================================================
// Khởi chạy Máy chủ HTTP Backend (Server Bootstrap)
// Hệ thống: ThuTra TNCN
// ==============================================================================

import { app } from './app';
import { env } from './config/env.config';
import { pool, checkDatabaseConnection } from './config/database';

async function bootstrap() {
  console.log('------------------------------------------------------------');
  console.log('🚀 Khởi động Backend API - Hệ thống ThuTra TNCN (Phase 1)');
  console.log('------------------------------------------------------------');

  // Kiểm tra kết nối Database PostgreSQL
  await checkDatabaseConnection();

  const server = app.listen(env.PORT, () => {
    console.log(`✅ Máy chủ đang lắng nghe tại: http://localhost:${env.PORT}`);
    console.log(`📌 Môi trường hoạt động: ${env.NODE_ENV}`);
    console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);
    console.log(`🛡️  Healthcheck: http://localhost:${env.PORT}/api/health`);
    console.log('------------------------------------------------------------');
  });

  // Xử lý dừng máy chủ an toàn (Graceful Shutdown)
  const shutdown = async (signal: string) => {
    console.log(`\n[${signal}] Nhận tín hiệu dừng máy chủ. Đang giải phóng tài nguyên...`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('✅ Đã đóng toàn bộ kết nối PostgreSQL Pool.');
        process.exit(0);
      } catch (err: any) {
        console.error('❌ Lỗi khi đóng PostgreSQL Pool:', err.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('❌ Lỗi nghiêm trọng khi khởi động máy chủ:', err);
  process.exit(1);
});
