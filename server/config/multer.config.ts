// ==============================================================================
// Cấu hình Multer Upload & Bộ lọc An toàn Tệp tin (Multer Configuration)
// Hệ thống: ThuTra TNCN - Giai đoạn 2
// ==============================================================================

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/app-error';

// Danh sách MIME types được phép upload
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

// Giới hạn kích thước tệp: 10MB
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Thư mục lưu trữ tài liệu gốc
export const UPLOAD_BASE_DIR = path.resolve(process.cwd(), 'storage/uploads/documents');

// Khởi tạo thư mục gốc nếu chưa tồn tại
if (!fs.existsSync(UPLOAD_BASE_DIR)) {
  fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
}

/**
 * Cấu hình lưu trữ tệp tin an toàn (Multer DiskStorage)
 */
const storage = multer.diskStorage({
  destination: (req: Request, _file: Express.Multer.File, cb) => {
    // Tách riêng thư mục cho từng người dùng để cô lập dữ liệu
    const userId = req.user?.id || 'anonymous';
    const userDir = path.join(UPLOAD_BASE_DIR, userId);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },

  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Trích xuất phần mở rộng an toàn
    const ext = path.extname(file.originalname).toLowerCase();
    // Sinh tên tệp an toàn: Timestamp + UUIDv4 + ext để ngăn chặn Path Traversal & xung đột
    const uniqueFileName = `${Date.now()}_${crypto.randomUUID()}${ext}`;
    cb(null, uniqueFileName);
  },
});

/**
 * Bộ lọc định dạng tệp nghiêm ngặt (FileFilter)
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        'Định dạng tệp không được hỗ trợ. Hệ thống chỉ chấp nhận tài liệu PDF, ảnh PNG hoặc JPG.',
        [
          {
            field: 'file',
            message: `Tệp tải lên có định dạng '${file.mimetype}'. Chỉ chấp nhận: application/pdf, image/png, image/jpeg.`,
            code: 'INVALID_FILE_TYPE',
          },
        ]
      )
    );
  }
};

// Instance Multer nội bộ
const uploadInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1, // Mỗi lần chỉ nhận 1 tệp chứng từ
  },
});

/**
 * Middleware bọc Multer để bẫy lỗi dung lượng và lỗi upload chuẩn AppError
 */
export function uploadDocumentMiddleware(req: Request, res: Response, next: NextFunction): void {
  const uploadSingle = uploadInstance.single('file');

  uploadSingle(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              'Dung lượng tệp vượt quá giới hạn tối đa cho phép (10MB).',
              413,
              'PAYLOAD_TOO_LARGE',
              [
                {
                  field: 'file',
                  message: 'Kích thước tệp vượt quá 10MB.',
                  code: 'LIMIT_FILE_SIZE',
                },
              ]
            )
          );
        }
        return next(
          new ValidationError(`Lỗi tải tệp: ${err.message}`, [
            { field: 'file', message: err.message, code: err.code },
          ])
        );
      }
      return next(err);
    }

    if (!req.file) {
      return next(
        new ValidationError('Vui lòng chọn tệp chứng từ thuế cần tải lên.', [
          {
            field: 'file',
            message: 'Trường tệp tin (file) là bắt buộc.',
            code: 'FILE_REQUIRED',
          },
        ])
      );
    }

    next();
  });
}
