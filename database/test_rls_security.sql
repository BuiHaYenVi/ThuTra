-- ==============================================================================
-- KỊCH BẢN KIỂM THỬ PHÂN QUYỀN VÀ BẢO MẬT RLS (ThuTra TNCN)
-- File: database/test_rls_security.sql
-- Mô tả: Mô phỏng 3 phiên làm việc của super_admin, admin_manager, user
--       để kiểm tra tính toàn vẹn của Row-Level Security & Nghị định 13.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TEST CASE 1: PHIÊN LÀM VIỆC CỦA USER THƯỜNG (NGUYỄN HOÀNG NAM)
-- ------------------------------------------------------------------------------
BEGIN;
-- Thiết lập ngữ cảnh phiên người dùng
SET LOCAL app.current_user_id = '00000000-0000-0000-0000-000000000003';
SET LOCAL app.current_user_role = 'user';

-- 1.1. User đọc thông tin cá nhân của chính mình -> THÀNH CÔNG (trả về 1 dòng)
SELECT id, email, full_name, cccd, mst, role FROM users;

-- 1.2. User đọc hồ sơ quyết toán của chính mình -> THÀNH CÔNG (trả về hồ sơ 2024)
SELECT id, tax_year, period_title, tax_department_name, total_taxable_income, tax_balance 
FROM tax_profiles;

-- 1.3. User đọc các quy tắc thẩm tra đang kích hoạt -> THÀNH CÔNG (15 rules R01-R15)
SELECT code, title, risk_level, is_active FROM tax_rules;

-- 1.4. User cố tình cập nhật tham số thuế hệ thống -> THẤT BẠI (0 rows updated do RLS chặn)
UPDATE system_settings 
SET numeric_value = 15000000.00 
WHERE setting_key = 'personal_deduction_monthly';

-- 1.5. User cố tình đọc hồ sơ của người khác -> THẤT BẠI (RLS tự động lọc chỉ trả về dữ liệu của chính mình)
SELECT COUNT(*) AS should_be_zero FROM tax_profiles WHERE user_id != '00000000-0000-0000-0000-000000000003';

ROLLBACK;

-- ------------------------------------------------------------------------------
-- TEST CASE 2: PHIÊN LÀM VIỆC CỦA ADMIN_MANAGER (NGHIỆP VỤ & PHÁP CHẾ)
-- ------------------------------------------------------------------------------
BEGIN;
-- Thiết lập ngữ cảnh phiên Admin Manager
SET LOCAL app.current_user_id = '00000000-0000-0000-0000-000000000002';
SET LOCAL app.current_user_role = 'admin_manager';

-- 2.1. Admin Manager xem và cập nhật bộ quy tắc R01-R15 -> THÀNH CÔNG
SELECT code, title, legal_reference, version FROM tax_rules WHERE code = 'R10';

UPDATE tax_rules 
SET description = 'Kiểm tra nếu cá nhân đăng ký giảm trừ bản thân tại >= 2 công ty (Cập nhật bởi Admin Manager)'
WHERE code = 'R10';

-- 2.2. Admin Manager xem danh sách tài liệu RAG tri thức pháp lý -> THÀNH CÔNG
SELECT code, title, chunks_count, vector_status FROM rag_legal_documents;

-- 2.3. Admin Manager xem audit log ẩn danh (Đã che mờ CCCD/MST theo NĐ 13) -> THÀNH CÔNG
SELECT operator, purpose, masked_cccd, masked_mst, triggered_rules, minimization_status 
FROM v_anonymized_audit_logs;

-- 2.4. BẢO MẬT TRỌNG YẾU: Admin Manager BỊ CHẶN TRUY CẬP DỮ LIỆU TÀI CHÍNH THÔ
-- Kết quả trả về 0 dòng vì RLS từ chối truy cập bảng tài chính cá nhân của người dùng!
SELECT COUNT(*) AS forbidden_tax_profiles_count FROM tax_profiles;
SELECT COUNT(*) AS forbidden_income_sources_count FROM income_sources;
SELECT COUNT(*) AS forbidden_dependents_count FROM dependents;
SELECT COUNT(*) AS forbidden_tax_documents_count FROM tax_documents;

-- 2.5. Admin Manager cố tình sửa tham số thuế (Lương cơ sở / Giảm trừ) -> BỊ CHẶN (0 rows)
UPDATE system_settings 
SET numeric_value = 2500000.00 
WHERE setting_key = 'base_salary';

ROLLBACK;

-- ------------------------------------------------------------------------------
-- TEST CASE 3: PHIÊN LÀM VIỆC CỦA SUPER_ADMIN (TOÀN QUYỀN HỆ THỐNG)
-- ------------------------------------------------------------------------------
BEGIN;
-- Thiết lập ngữ cảnh phiên Super Admin
SET LOCAL app.current_user_id = '00000000-0000-0000-0000-000000000001';
SET LOCAL app.current_user_role = 'super_admin';

-- 3.1. Super Admin có quyền xem tất cả tài khoản trong hệ thống
SELECT email, full_name, role, status FROM users;

-- 3.2. Super Admin có quyền thay đổi phân quyền cho admin_manager hoặc user
UPDATE users 
SET status = 'active'
WHERE email = 'admin.manager@thutra.vn';

-- 3.3. Super Admin có quyền cập nhật tham số thuế hệ thống (ví dụ: lương cơ sở) -> THÀNH CÔNG
UPDATE system_settings 
SET numeric_value = 2340000.00, updated_at = CLOCK_TIMESTAMP()
WHERE setting_key = 'base_salary';

-- 3.4. Super Admin giám sát tổng quan hồ sơ toàn hệ thống -> THÀNH CÔNG
SELECT COUNT(*) AS total_profiles_monitored FROM tax_profiles;

ROLLBACK;

-- ------------------------------------------------------------------------------
-- TEST CASE 4: KIỂM TRA HÀM MASKING THEO NGHỊ ĐỊNH 13/2023/NĐ-CP
-- ------------------------------------------------------------------------------
SELECT 
    mask_cccd('079095012345') AS masked_cccd_result, -- Kết quả kỳ vọng: 079******345
    mask_mst('8492019381')     AS masked_mst_result;   -- Kết quả kỳ vọng: 849*****81
