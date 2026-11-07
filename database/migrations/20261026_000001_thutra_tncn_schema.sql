SET client_encoding = 'UTF8';

-- ==============================================================================
-- HỆ THỐNG THẨM TRA & QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN (ThuTra TNCN)
-- Database: PostgreSQL 14+ / Supabase / Neon
-- Migration: 20261026_000001_thutra_tncn_schema.sql
-- Mô tả: Schema hoàn chỉnh gồm RBAC (3 Roles), RLS, Chuẩn hóa Bảng,
--       Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và Seed Data (R01-R15).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & TIỆN ÍCH HỆ THỐNG
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ENUM (ENUM TYPES)
-- ------------------------------------------------------------------------------

-- Vai trò người dùng (RBAC 3 Role theo yêu cầu nghiệp vụ)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',   -- Toàn quyền tối cao, quản trị tham số, phân quyền admin
        'admin_manager', -- Quản lý luật R01-R15, RAG tri thức, xem audit log ẩn danh
        'user'           -- Người nộp thuế, toàn quyền CRUD trên dữ liệu cá nhân
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trạng thái tài khoản người dùng
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM (
        'active',               -- Đang hoạt động bình thường
        'pending_verification', -- Chờ xác thực email / CCCD
        'locked',               -- Khóa tạm thời do nghi vấn bảo mật
        'inactive'              -- Ngừng kích hoạt
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trạng thái hồ sơ quyết toán thuế
DO $$ BEGIN
    CREATE TYPE tax_filing_status AS ENUM (
        'draft',            -- Hồ sơ nháp, người dùng đang nhập liệu
        'validating',       -- Đang chạy Rule Engine (R01 - R15)
        'ready_to_file',    -- Đã đối soát xong, sẵn sàng kết xuất XML/nộp
        'submitted',        -- Đã nộp sang Cổng thuế eTax / Tổng cục Thuế
        'accepted',         -- Cơ quan thuế tiếp nhận hồ sơ hợp lệ
        'rejected',         -- CQT yêu cầu giải trình / từ chối
        'refund_processed'  -- Kho bạc Nhà nước đã duyệt hoàn thuế
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Phân loại nguồn thu nhập
DO $$ BEGIN
    CREATE TYPE income_category AS ENUM (
        'salary_contract',  -- HĐLĐ từ 3 tháng trở lên (biểu lũy tiến từng phần)
        'freelance_10pct',  -- Vãng lai khấu trừ 10% tại nguồn (thù lao, dịch vụ)
        'foreign_income',   -- Thu nhập nhận từ nước ngoài
        'severance',        -- Trợ cấp thôi việc / mất việc làm
        'other'             -- Các nguồn hợp pháp khác
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Phân loại chứng từ thuế & OCR
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'withholding_cert_form02', -- Chứng từ khấu trừ thuế TNCN điện tử (NĐ 123)
        'salary_confirmation',     -- Thư xác nhận thu nhập năm / Bảng lương
        'labor_contract',          -- Hợp đồng lao động
        'dependent_id_proof',      -- CCCD/Giấy khai sinh/Thẻ sinh viên NPT
        'charity_receipt',         -- Biên lai đóng góp từ thiện, nhân đạo (R07)
        'pension_receipt',         -- Chứng từ đóng hưu trí tự nguyện (R13)
        'tax_return_form02_xml'    -- Tờ khai quyết toán thuế 02/QTT-TNCN XML
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trạng thái xử lý OCR AI
DO $$ BEGIN
    CREATE TYPE ocr_processing_status AS ENUM (
        'pending',      -- Chờ xử lý hàng đợi
        'processing',   -- AI đang bóc tách số liệu
        'completed',    -- Bóc tách thành công
        'failed'        -- Lỗi xử lý ảnh/PDF
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trạng thái xác thực chứng từ
DO $$ BEGIN
    CREATE TYPE document_verification_status AS ENUM (
        'unverified',           -- Chưa xác thực
        'verified_auto',        -- AI bóc tách tin cậy cao + khớp Cục Thuế
        'verified_manual',      -- Người dùng đã rà soát và xác nhận
        'flagged_discrepancy'   -- Lệch số liệu giữa chứng từ và tờ khai
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Mối quan hệ người phụ thuộc (Điều 9 Thông tư 111/2013/TT-BTC)
DO $$ BEGIN
    CREATE TYPE dependent_relation_type AS ENUM (
        'mother',                  -- Mẹ đẻ / mẹ nuôi / mẹ kế
        'father',                  -- Cha đẻ / cha nuôi / cha dượng
        'child_under_18',          -- Con dưới 18 tuổi
        'child_over_18_student',   -- Con từ 18 tuổi trở lên đang học ĐH/CĐ
        'spouse',                  -- Vợ hoặc chồng không có khả năng lao động
        'disabled_relative',       -- Người tàn tật không nơi nương tựa
        'other'                    -- Người phụ thuộc hợp pháp khác
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Mức độ nghiêm trọng của Rule thẩm tra
DO $$ BEGIN
    CREATE TYPE rule_risk_level AS ENUM (
        'error',      -- Lỗi nghiêm trọng: chặn nộp, có nguy cơ phạt tiền/truy thu
        'warning',    -- Cảnh báo: có xung đột dữ liệu cần giải trình
        'suggestion'  -- Gợi ý tối ưu: quyền lợi hoàn thuế, giảm trừ hợp pháp
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Nhóm danh mục Rule
DO $$ BEGIN
    CREATE TYPE rule_category AS ENUM (
        'deductions',     -- Giảm trừ bản thân, từ thiện, hưu trí
        'dependents',     -- Người phụ thuộc, trùng MST NPT
        'routing',        -- Định tuyến Cơ quan thuế quyết toán
        'incomes',        -- Ngưỡng vãng lai, miễn thuế
        'insurance',      -- Bảo hiểm bắt buộc, trần lương cơ sở
        'authorization',  -- Điều kiện ủy quyền quyết toán
        'deadline',       -- Thời hạn nộp hồ sơ, phạt chậm nộp
        'reconciliation', -- Đối soát chênh lệch tờ khai và chứng từ
        'residence'       -- Tình trạng cư trú thuế
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------------------------
-- 2. HÀM HỖ TRỢ PHÂN QUYỀN VÀ BẢO MẬT PHIÊN (AUTH & CONTEXT HELPERS)
-- ------------------------------------------------------------------------------

-- Lấy User ID của phiên làm việc hiện tại
CREATE OR REPLACE FUNCTION current_app_user_id() 
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Lấy Role của phiên làm việc hiện tại
CREATE OR REPLACE FUNCTION current_app_user_role() 
RETURNS user_role AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_role', true), '')::user_role;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Kiểm tra xem có phải Super Admin không
CREATE OR REPLACE FUNCTION is_super_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (current_app_user_role() = 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE;

-- Kiểm tra xem có phải Admin Manager không
CREATE OR REPLACE FUNCTION is_admin_manager() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (current_app_user_role() = 'admin_manager');
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------------------
-- 3. HÀM CHE MỜ DỮ LIỆU CÁ NHÂN (DATA MASKING - NGHỊ ĐỊNH 13/2023/NĐ-CP)
-- ------------------------------------------------------------------------------

-- Che mờ số CCCD (12 số): chỉ giữ 3 số đầu và 3 số cuối (ví dụ: 079******492)
CREATE OR REPLACE FUNCTION mask_cccd(p_cccd TEXT)
RETURNS TEXT AS $$
BEGIN
    IF p_cccd IS NULL OR length(trim(p_cccd)) < 6 THEN
        RETURN '***';
    END IF;
    p_cccd := trim(p_cccd);
    RETURN substr(p_cccd, 1, 3) || repeat('*', greatest(length(p_cccd) - 6, 4)) || substr(p_cccd, length(p_cccd) - 2, 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Che mờ Mã số thuế (MST 10 số): giữ 3 số đầu và 2 số cuối (ví dụ: 849*****81)
CREATE OR REPLACE FUNCTION mask_mst(p_mst TEXT)
RETURNS TEXT AS $$
BEGIN
    IF p_mst IS NULL OR length(trim(p_mst)) < 5 THEN
        RETURN '***';
    END IF;
    p_mst := trim(p_mst);
    RETURN substr(p_mst, 1, 3) || repeat('*', greatest(length(p_mst) - 5, 4)) || substr(p_mst, length(p_mst) - 1, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger cập nhật trường updated_at tự động
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CLOCK_TIMESTAMP();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. BẢNG 1: USERS (Thông tin tài khoản, phân quyền RBAC và trạng thái)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    cccd VARCHAR(20) UNIQUE,
    mst VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    address TEXT,
    tax_department_code VARCHAR(20),
    tax_department_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'user',
    status user_status NOT NULL DEFAULT 'active',
    is_vneid_verified BOOLEAN NOT NULL DEFAULT false,
    vneid_level SMALLINT DEFAULT 0 CHECK (vneid_level IN (0, 1, 2)),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    last_login_at TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'Quản lý tài khoản người dùng, phân quyền RBAC 3 cấp (super_admin, admin_manager, user)';
COMMENT ON COLUMN users.role IS 'Phân quyền hệ thống: super_admin (tối cao), admin_manager (nghiệp vụ), user (người nộp thuế)';
COMMENT ON COLUMN users.cccd IS 'Số Căn cước công dân gắn chip (12 số chuẩn Đề án 06)';
COMMENT ON COLUMN users.mst IS 'Mã số thuế cá nhân đã chuẩn hóa theo CCCD';

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ------------------------------------------------------------------------------
-- 5. BẢNG 2: TAX_PROFILES (Kỳ quyết toán, cơ quan thuế, tổng hợp số liệu tính thuế)
-- ------------------------------------------------------------------------------
CREATE TABLE tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tax_year SMALLINT NOT NULL CHECK (tax_year BETWEEN 2000 AND 2100),
    period_title VARCHAR(100) NOT NULL DEFAULT 'Kỳ quyết toán thuế TNCN',
    filing_status tax_filing_status NOT NULL DEFAULT 'draft',
    tax_department_code VARCHAR(20) NOT NULL,
    tax_department_name VARCHAR(255) NOT NULL,
    routing_legal_basis TEXT,
    is_tax_resident BOOLEAN NOT NULL DEFAULT true, -- R11: Tình trạng cư trú
    stay_days_in_year SMALLINT NOT NULL DEFAULT 365,
    is_authorized_finalization BOOLEAN NOT NULL DEFAULT false, -- R06: Ủy quyền cơ quan chi trả

    -- Tổng hợp tài chính bắt buộc dùng NUMERIC(15, 2)
    total_taxable_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00,       -- Tổng thu nhập chịu thuế
    personal_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,  -- Tổng giảm trừ bản thân (R10)
    dependent_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- Tổng giảm trừ NPT (R01, R02)
    insurance_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- Tổng giảm trừ BHXH, BHYT, BHTN (R05)
    charity_deduction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,   -- Giảm trừ đóng góp từ thiện (R07)
    voluntary_pension_deduction NUMERIC(15, 2) NOT NULL DEFAULT 0.00,-- Giảm trừ hưu trí tự nguyện (R13)
    assessable_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00,          -- Thu nhập tính thuế (TNTT)
    tax_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,                -- Thuế TNCN phát sinh trong kỳ
    tax_withheld_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,         -- Tổng số thuế đã khấu trừ tại nguồn
    tax_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,                -- Số thuế còn phải nộp (+) hoặc hoàn lại (-)
    is_exempt_under_50k BOOLEAN NOT NULL DEFAULT false,              -- R14: Miễn nộp nếu chênh lệch <= 50.000đ

    -- Thông tin tài khoản ngân hàng nhận tiền hoàn thuế
    refund_bank_name VARCHAR(150),
    refund_bank_branch VARCHAR(150),
    refund_account_number VARCHAR(50),
    refund_account_holder VARCHAR(150),

    submission_date TIMESTAMPTZ,
    submission_ack_code VARCHAR(100), -- Mã giao dịch điện tử của Tổng cục Thuế
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    CONSTRAINT uq_user_tax_year UNIQUE (user_id, tax_year)
);

COMMENT ON TABLE tax_profiles IS 'Hồ sơ quyết toán thuế TNCN theo từng năm của người nộp thuế';
COMMENT ON COLUMN tax_profiles.tax_balance IS 'Giá trị chênh lệch: > 0 là số tiền phải nộp thêm, < 0 là số tiền được Kho bạc hoàn';

CREATE TRIGGER trg_tax_profiles_updated_at
BEFORE UPDATE ON tax_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ------------------------------------------------------------------------------
-- 6. BẢNG 3: INCOME_SOURCES (Nguồn thu nhập HĐLĐ, vãng lai, bảo hiểm, số tháng)
-- ------------------------------------------------------------------------------
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES tax_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category income_category NOT NULL DEFAULT 'salary_contract',
    payer_name VARCHAR(255) NOT NULL,
    payer_mst VARCHAR(20) NOT NULL,
    payer_branch VARCHAR(255),
    tax_authority_name VARCHAR(255),
    contract_title VARCHAR(255),
    is_active_in_december BOOLEAN NOT NULL DEFAULT false, -- R04: Phục vụ xác định CQT tháng 12
    working_months_count SMALLINT NOT NULL DEFAULT 12,
    period_start_date DATE,
    period_end_date DATE,

    -- Số liệu tài chính chính xác tuyệt đối NUMERIC(15, 2)
    total_income_gross NUMERIC(15, 2) NOT NULL DEFAULT 0.00,      -- Tổng thu nhập phát sinh trước thuế
    total_taxable_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00,    -- Thu nhập chịu thuế
    tax_withheld NUMERIC(15, 2) NOT NULL DEFAULT 0.00,            -- Số thuế đã khấu trừ
    withholding_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,         -- Thuế suất khấu trừ (10% hoặc lũy tiến)
    insurance_deduction NUMERIC(15, 2) NOT NULL DEFAULT 0.00,     -- Tiền bảo hiểm bắt buộc trích nộp
    
    apply_personal_deduction BOOLEAN NOT NULL DEFAULT false,      -- R10: Đăng ký giảm trừ bản thân tại tổ chức này
    personal_deduction_months SMALLINT NOT NULL DEFAULT 0,
    e_certificate_code VARCHAR(100),                              -- R08, R09: Số chứng từ khấu trừ thuế điện tử
    is_e_certificate_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

COMMENT ON TABLE income_sources IS 'Chi tiết từng nguồn thu nhập từ các đơn vị chi trả trong năm';
COMMENT ON COLUMN income_sources.apply_personal_deduction IS 'Cảnh báo R10: Nếu có >= 2 tổ chức cùng bật cờ này sẽ bị cảnh báo vi phạm';

CREATE TRIGGER trg_income_sources_updated_at
BEFORE UPDATE ON income_sources
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ------------------------------------------------------------------------------
-- 7. BẢNG 4: TAX_DOCUMENTS (File đính kèm, kết quả OCR AI và trạng thái đối soát)
-- ------------------------------------------------------------------------------
CREATE TABLE tax_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    income_source_id UUID REFERENCES income_sources(id) ON DELETE SET NULL,
    doc_type document_type NOT NULL DEFAULT 'withholding_cert_form02',
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    file_hash_sha256 VARCHAR(64),
    
    -- Trạng thái bóc tách OCR AI
    ocr_status ocr_processing_status NOT NULL DEFAULT 'pending',
    ocr_confidence NUMERIC(5, 2) CHECK (ocr_confidence BETWEEN 0 AND 100),
    ocr_extracted_payload JSONB DEFAULT '{}'::jsonb, -- Dữ liệu bóc tách thô dạng JSON
    
    -- Xác thực theo chuẩn Nghị định 123/2020/NĐ-CP
    verification_status document_verification_status NOT NULL DEFAULT 'unverified',
    is_digital_signature_valid BOOLEAN NOT NULL DEFAULT false,
    certificate_serial VARCHAR(100),
    signer_organization VARCHAR(255),
    verified_at TIMESTAMPTZ,
    
    -- Tuân thủ lưu trữ dữ liệu theo Nghị định 13/2023/NĐ-CP
    retention_expires_at TIMESTAMPTZ NOT NULL DEFAULT (CLOCK_TIMESTAMP() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

COMMENT ON TABLE tax_documents IS 'Chứng từ thuế điện tử, phiếu lương, hợp đồng và kết quả OCR AI';
COMMENT ON COLUMN tax_documents.retention_expires_at IS 'Hạn lưu trữ dữ liệu tối thiểu tuân thủ nguyên tắc Data Minimization (NĐ 13/2023)';

CREATE TRIGGER trg_tax_documents_updated_at
BEFORE UPDATE ON tax_documents
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ------------------------------------------------------------------------------
-- 8. BẢNG 5: DEPENDENTS (Thông tin Người phụ thuộc, tháng giảm trừ, định danh CCCD)
-- ------------------------------------------------------------------------------
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES tax_profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    relation_type dependent_relation_type NOT NULL DEFAULT 'child_under_18',
    relation_title VARCHAR(150), -- Ví dụ: Mẹ đẻ ngoài độ tuổi lao động
    cccd VARCHAR(20) NOT NULL,   -- R01: Số CCCD 12 số định danh
    mst VARCHAR(20),             -- R01: Mã số thuế người phụ thuộc
    has_mst BOOLEAN NOT NULL DEFAULT false,
    date_of_birth DATE,
    is_valid_cqt BOOLEAN NOT NULL DEFAULT true, -- Khớp cơ sở dữ liệu Thuế quốc gia
    
    start_month VARCHAR(7) NOT NULL, -- Định dạng YYYY-MM
    end_month VARCHAR(7) NOT NULL,   -- Định dạng YYYY-MM
    months_applied SMALLINT NOT NULL DEFAULT 12 CHECK (months_applied BETWEEN 1 AND 12),
    
    -- Tiền tệ NUMERIC(15, 2)
    monthly_deduction NUMERIC(15, 2) NOT NULL DEFAULT 4400000.00,
    total_deduction NUMERIC(15, 2) NOT NULL DEFAULT 52800000.00,
    
    commitment_checked BOOLEAN NOT NULL DEFAULT true, -- Người nộp thuế cam kết chịu trách nhiệm
    proof_document_id UUID REFERENCES tax_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    CONSTRAINT uq_dependent_in_profile UNIQUE (profile_id, cccd)
);

COMMENT ON TABLE dependents IS 'Danh sách người phụ thuộc đăng ký giảm trừ gia cảnh (4.4tr/tháng/người)';

CREATE TRIGGER trg_dependents_updated_at
BEFORE UPDATE ON dependents
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ------------------------------------------------------------------------------
-- 9. BẢNG 6: TAX_RULES (Danh mục bộ 15 quy tắc thẩm tra R01 - R15)
-- ------------------------------------------------------------------------------
CREATE TABLE tax_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE, -- R01, R02, ..., R15
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    legal_reference VARCHAR(255) NOT NULL, -- Ví dụ: Điều 9 TT 111/2013, TT 80/2021
    risk_level rule_risk_level NOT NULL DEFAULT 'warning',
    risk_level_label VARCHAR(100) NOT NULL,
    category rule_category NOT NULL DEFAULT 'deductions',
    execution_frequency VARCHAR(100) DEFAULT '100% hồ sơ',
    condition_snippet TEXT NOT NULL, -- Biểu thức logic / JS / SQL thẩm tra
    is_active BOOLEAN NOT NULL DEFAULT true,
    version VARCHAR(20) NOT NULL DEFAULT 'v2.4',
    updated_by_name VARCHAR(100) DEFAULT 'Admin Nghiệp vụ',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

COMMENT ON TABLE tax_rules IS 'Bộ quy tắc nghiệp vụ thẩm tra tự động phát hiện sai sót quyết toán thuế (R01-R15)';

CREATE TRIGGER trg_tax_rules_updated_at
BEFORE UPDATE ON tax_rules
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Bảng phụ: Lịch sử cập nhật thay đổi quy tắc (Audit log cho tax_rules)
CREATE TABLE tax_rule_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES tax_rules(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    editor_name VARCHAR(100) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

-- ------------------------------------------------------------------------------
-- 10. BẢNG 7: SYSTEM_SETTINGS (Tham số thuế động do super_admin quản lý)
-- ------------------------------------------------------------------------------
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- 'deduction', 'insurance', 'threshold', 'rate'
    description TEXT NOT NULL,
    legal_basis VARCHAR(255) NOT NULL,
    
    -- Giá trị số bắt buộc dùng NUMERIC(15, 2)
    numeric_value NUMERIC(15, 2),
    text_value TEXT,
    json_value JSONB,
    unit VARCHAR(20) NOT NULL, -- 'VNĐ/tháng', 'VNĐ/năm', '%', 'hệ số'
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

COMMENT ON TABLE system_settings IS 'Cấu hình tham số thuế động toàn hệ thống (mức giảm trừ, lương cơ sở, trần bảo hiểm)';

CREATE TRIGGER trg_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Bảng phụ: Biểu thuế lũy tiến từng phần (Điều 22 Luật Thuế TNCN)
CREATE TABLE progressive_tax_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bracket_level SMALLINT NOT NULL UNIQUE CHECK (bracket_level BETWEEN 1 AND 7),
    monthly_min NUMERIC(15, 2) NOT NULL,
    monthly_max NUMERIC(15, 2), -- NULL là không giới hạn trên (Bậc 7 > 80tr)
    yearly_min NUMERIC(15, 2) NOT NULL,
    yearly_max NUMERIC(15, 2),  -- NULL là không giới hạn trên (> 960tr)
    tax_rate NUMERIC(5, 2) NOT NULL, -- 5%, 10%, 15%, 20%, 25%, 30%, 35%
    subtraction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- Số trừ tính nhanh
    quick_calc_formula VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 11. BẢNG 8: RAG_LEGAL_DOCUMENTS (Kho tri thức pháp lý RAG nạp Vector)
-- ------------------------------------------------------------------------------
CREATE TABLE rag_legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE, -- TT 111/2013/TT-BTC, TT 80/2021/TT-BTC, ...
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,    -- Thông tư Bộ Tài Chính, Nghị định Chính phủ
    chunks_count INTEGER NOT NULL DEFAULT 0,
    vector_status VARCHAR(50) NOT NULL DEFAULT 'Ready',
    cosine_similarity_avg NUMERIC(5, 3) DEFAULT 0.950,
    last_embedded_at TIMESTAMPTZ DEFAULT CLOCK_TIMESTAMP(),
    full_content TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

COMMENT ON TABLE rag_legal_documents IS 'Kho tài liệu văn bản quy phạm pháp luật phục vụ nạp RAG và giải đáp AI';

-- ------------------------------------------------------------------------------
-- 12. BẢNG 9: AUDIT_LOGS (Nhật ký kiểm toán, lưu vết thẩm tra, tuân thủ NĐ 13)
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    operator VARCHAR(150) NOT NULL,
    purpose TEXT NOT NULL,
    action_type VARCHAR(100) NOT NULL DEFAULT 'RULE_EVALUATION',
    
    -- Dữ liệu cá nhân BẮT BUỘC che mờ theo Nghị định 13/2023/NĐ-CP
    masked_cccd VARCHAR(30) NOT NULL,
    masked_mst VARCHAR(30) NOT NULL,
    
    triggered_rules TEXT[] DEFAULT '{}', -- Mảng các mã rule vi phạm: ['R10', 'R01']
    violation_details JSONB DEFAULT '{}'::jsonb,
    minimization_status VARCHAR(50) NOT NULL DEFAULT 'Tuân thủ 100%',
    
    -- Thời hạn tự động xóa/thanh trừng log (Data Retention Policy)
    retention_expires_at TIMESTAMPTZ NOT NULL DEFAULT (CLOCK_TIMESTAMP() + INTERVAL '30 days'),
    client_ip VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

COMMENT ON TABLE audit_logs IS 'Nhật ký kiểm toán hệ thống được ẩn danh hóa danh tính tuân thủ Nghị định 13/2023/NĐ-CP';

-- Trigger tự động che mờ CCCD và MST trước khi INSERT vào audit_logs
CREATE OR REPLACE FUNCTION trg_fn_mask_audit_data()
RETURNS TRIGGER AS $$
BEGIN
    NEW.masked_cccd := mask_cccd(NEW.masked_cccd);
    NEW.masked_mst  := mask_mst(NEW.masked_mst);
    IF NEW.retention_expires_at IS NULL THEN
        NEW.retention_expires_at := CLOCK_TIMESTAMP() + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_mask_audit_log
BEFORE INSERT ON audit_logs
FOR EACH ROW EXECUTE FUNCTION trg_fn_mask_audit_data();

-- ------------------------------------------------------------------------------
-- 13. THIẾT LẬP CHỈ MỤC TỐI ƯU HIỆU NĂNG (INDEXES)
-- ------------------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cccd ON users(cccd);
CREATE INDEX idx_users_mst ON users(mst);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_tax_profiles_user_year ON tax_profiles(user_id, tax_year);
CREATE INDEX idx_tax_profiles_status ON tax_profiles(filing_status);
CREATE INDEX idx_tax_profiles_dept ON tax_profiles(tax_department_code);

CREATE INDEX idx_income_sources_profile ON income_sources(profile_id);
CREATE INDEX idx_income_sources_user ON income_sources(user_id);
CREATE INDEX idx_income_sources_category ON income_sources(category);
CREATE INDEX idx_income_sources_e_cert ON income_sources(e_certificate_code);

CREATE INDEX idx_tax_documents_user ON tax_documents(user_id);
CREATE INDEX idx_tax_documents_profile ON tax_documents(profile_id);
CREATE INDEX idx_tax_documents_type ON tax_documents(doc_type);

CREATE INDEX idx_dependents_profile ON dependents(profile_id);
CREATE INDEX idx_dependents_user ON dependents(user_id);
CREATE INDEX idx_dependents_cccd ON dependents(cccd);
CREATE INDEX idx_dependents_mst ON dependents(mst);

CREATE INDEX idx_tax_rules_code ON tax_rules(code);
CREATE INDEX idx_tax_rules_category ON tax_rules(category);
CREATE INDEX idx_tax_rules_active ON tax_rules(is_active);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_profile ON audit_logs(profile_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ------------------------------------------------------------------------------
-- 14. CHÍNH SÁCH BẢO MẬT PHÂN QUYỀN MỨC DÒNG (ROW-LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------

-- Kích hoạt RLS trên tất cả các bảng nhạy cảm
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressive_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 14.1. RLS CHO BẢNG: USERS
-- ==============================================================================
-- Super Admin: Toàn quyền (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY rls_users_super_admin ON users
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: Xem danh bạ tài khoản phục vụ hỗ trợ, nhưng KHÔNG xem/sửa mật khẩu hay tài khoản super_admin
CREATE POLICY rls_users_admin_manager_select ON users
    FOR SELECT
    TO PUBLIC
    USING (is_admin_manager() AND role != 'super_admin');

-- User: Chỉ xem và sửa thông tin tài khoản của chính mình
CREATE POLICY rls_users_user_select ON users
    FOR SELECT
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND id = current_app_user_id());

CREATE POLICY rls_users_user_update ON users
    FOR UPDATE
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND id = current_app_user_id())
    WITH CHECK (
        current_app_user_role() = 'user' 
        AND id = current_app_user_id() 
        AND role = 'user' -- Chặn người dùng tự nâng quyền lên admin
    );

-- ==============================================================================
-- 14.2. RLS CHO BẢNG: TAX_PROFILES (Dữ liệu tài chính & quyết toán)
-- ==============================================================================
-- Super Admin: Toàn quyền giám sát mức tối cao
CREATE POLICY rls_tax_profiles_super_admin ON tax_profiles
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: BỊ CHẶN HOÀN TOÀN TRUY CẬP DỮ LIỆU TÀI CHÍNH THÔ CỦA NGƯỜI DÙNG
-- (Không tạo policy cho admin_manager trên bảng tax_profiles => Mặc định REJECT)

-- User: Toàn quyền CRUD trên hồ sơ của chính mình
CREATE POLICY rls_tax_profiles_user ON tax_profiles
    FOR ALL
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND user_id = current_app_user_id())
    WITH CHECK (current_app_user_role() = 'user' AND user_id = current_app_user_id());

-- ==============================================================================
-- 14.3. RLS CHO BẢNG: INCOME_SOURCES (Nguồn thu nhập HĐLĐ, vãng lai)
-- ==============================================================================
CREATE POLICY rls_income_sources_super_admin ON income_sources
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: BỊ CHẶN HOÀN TOÀN TRUY CẬP SỐ LIỆU THU NHẬP CỦA NGƯỜI DÙNG

CREATE POLICY rls_income_sources_user ON income_sources
    FOR ALL
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND user_id = current_app_user_id())
    WITH CHECK (current_app_user_role() = 'user' AND user_id = current_app_user_id());

-- ==============================================================================
-- 14.4. RLS CHO BẢNG: TAX_DOCUMENTS (Chứng từ, kết quả OCR AI)
-- ==============================================================================
CREATE POLICY rls_tax_documents_super_admin ON tax_documents
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: BỊ CHẶN HOÀN TOÀN TRUY CẬP CHỨNG TỪ & FILE ĐÍNH KÈM CÁ NHÂN

CREATE POLICY rls_tax_documents_user ON tax_documents
    FOR ALL
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND user_id = current_app_user_id())
    WITH CHECK (current_app_user_role() = 'user' AND user_id = current_app_user_id());

-- ==============================================================================
-- 14.5. RLS CHO BẢNG: DEPENDENTS (Người phụ thuộc)
-- ==============================================================================
CREATE POLICY rls_dependents_super_admin ON dependents
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: BỊ CHẶN HOÀN TOÀN TRUY CẬP DỮ LIỆU ĐỊNH DANH NGƯỜI PHỤ THUỘC

CREATE POLICY rls_dependents_user ON dependents
    FOR ALL
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND user_id = current_app_user_id())
    WITH CHECK (current_app_user_role() = 'user' AND user_id = current_app_user_id());

-- ==============================================================================
-- 14.6. RLS CHO BẢNG: TAX_RULES & TAX_RULE_HISTORY (Bộ quy tắc R01-R15)
-- ==============================================================================
-- Super Admin: Toàn quyền quản trị
CREATE POLICY rls_tax_rules_super_admin ON tax_rules
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: Quản lý danh mục bộ quy tắc (CRUD)
CREATE POLICY rls_tax_rules_admin_manager ON tax_rules
    FOR ALL
    TO PUBLIC
    USING (is_admin_manager())
    WITH CHECK (is_admin_manager());

-- User: Chỉ được đọc các rule đang kích hoạt (is_active = true)
CREATE POLICY rls_tax_rules_user_select ON tax_rules
    FOR SELECT
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND is_active = true);

-- Policy cho bảng lịch sử rule
CREATE POLICY rls_tax_rule_history_admin ON tax_rule_history
    FOR ALL
    TO PUBLIC
    USING (is_super_admin() OR is_admin_manager())
    WITH CHECK (is_super_admin() OR is_admin_manager());

-- ==============================================================================
-- 14.7. RLS CHO BẢNG: SYSTEM_SETTINGS & PROGRESSIVE BRACKETS (Tham số thuế)
-- ==============================================================================
-- Super Admin: Toàn quyền thay đổi mức giảm trừ, trần lương cơ sở, cấu hình bảo mật
CREATE POLICY rls_system_settings_super_admin ON system_settings
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: Chỉ đọc tham số hệ thống
CREATE POLICY rls_system_settings_admin_manager ON system_settings
    FOR SELECT
    TO PUBLIC
    USING (is_admin_manager());

-- User: Chỉ đọc các tham số đang kích hoạt (phục vụ tính toán trên giao diện)
CREATE POLICY rls_system_settings_user ON system_settings
    FOR SELECT
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND is_active = true);

-- Biểu thuế lũy tiến: Super admin quản lý, Admin manager & User chỉ đọc
CREATE POLICY rls_progressive_tax_brackets_super_admin ON progressive_tax_brackets
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

CREATE POLICY rls_progressive_tax_brackets_read ON progressive_tax_brackets
    FOR SELECT
    TO PUBLIC
    USING (is_admin_manager() OR (current_app_user_role() = 'user' AND is_active = true));

-- ==============================================================================
-- 14.8. RLS CHO BẢNG: RAG_LEGAL_DOCUMENTS (Kho tri thức pháp lý)
-- ==============================================================================
-- Super Admin: Toàn quyền
CREATE POLICY rls_rag_docs_super_admin ON rag_legal_documents
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: Nạp tri thức pháp lý RAG, đồng bộ vector
CREATE POLICY rls_rag_docs_admin_manager ON rag_legal_documents
    FOR ALL
    TO PUBLIC
    USING (is_admin_manager())
    WITH CHECK (is_admin_manager());

-- User: Chỉ đọc tài liệu văn bản công khai
CREATE POLICY rls_rag_docs_user ON rag_legal_documents
    FOR SELECT
    TO PUBLIC
    USING (current_app_user_role() = 'user');

-- ==============================================================================
-- 14.9. RLS CHO BẢNG: AUDIT_LOGS (Nhật ký kiểm toán)
-- ==============================================================================
-- Super Admin: Giám sát toàn bộ audit log hệ thống
CREATE POLICY rls_audit_logs_super_admin ON audit_logs
    FOR ALL
    TO PUBLIC
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Admin Manager: Xem nhật ký kiểm toán ĐÃ ẨN DANH / CHE MỜ (SELECT only)
CREATE POLICY rls_audit_logs_admin_manager ON audit_logs
    FOR SELECT
    TO PUBLIC
    USING (is_admin_manager());

-- User: Chỉ xem audit log thuộc hồ sơ của chính mình
CREATE POLICY rls_audit_logs_user ON audit_logs
    FOR SELECT
    TO PUBLIC
    USING (current_app_user_role() = 'user' AND user_id = current_app_user_id());

-- ==============================================================================
-- 15. VIEW AN TOÀN CHO BÁO CÁO KPI & KIỂM TOÁN (DATA MINIMIZATION VIEW)
-- ==============================================================================
-- View tổng hợp KPI cho Admin Manager không để lộ thông tin tài chính cá nhân
CREATE OR REPLACE VIEW v_kpi_rule_violations_summary AS
SELECT 
    tr.code AS rule_code,
    tr.title AS rule_title,
    tr.risk_level,
    tr.category,
    COUNT(al.id) AS violation_count,
    MAX(al.created_at) AS last_triggered_at
FROM tax_rules tr
LEFT JOIN audit_logs al ON tr.code = ANY(al.triggered_rules)
GROUP BY tr.code, tr.title, tr.risk_level, tr.category
ORDER BY violation_count DESC;

-- View danh sách Audit Log dành riêng cho Admin Manager (đã đảm bảo che mờ)
CREATE OR REPLACE VIEW v_anonymized_audit_logs AS
SELECT 
    id,
    created_at AS timestamp,
    operator,
    purpose,
    masked_cccd,
    masked_mst,
    triggered_rules,
    minimization_status,
    retention_expires_at
FROM audit_logs
ORDER BY created_at DESC;

-- ==============================================================================
-- 16. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 16.1. Seed Data: Tài khoản quản trị & người dùng mẫu
-- Mật khẩu mẫu: 'Admin@123456' (Hash bcrypt mẫu)
-- ------------------------------------------------------------------------------
INSERT INTO users (
    id, email, phone, password_hash, full_name, cccd, mst, date_of_birth, address, 
    tax_department_code, tax_department_name, role, status, is_vneid_verified, vneid_level, two_factor_enabled
) VALUES
-- 1. Super Admin Tối Cao
(
    '00000000-0000-0000-0000-000000000001',
    'superadmin@thutra.vn',
    '0901000001',
    '$2b$10$S371vmTE5bPK41vj2XV6aebNQaFXqVJEyNUihfi7NP7mCPFgQjI1u',
    'Quản trị viên Hệ thống Tối cao',
    '001085000001',
    '8000000001',
    '1985-01-01',
    'Số 123 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, TP. Hà Nội',
    '00100',
    'Cục Thuế TP. Hà Nội',
    'super_admin',
    'active',
    true,
    2,
    true
),
-- 2. Admin Manager Nghiệp Vụ
(
    '00000000-0000-0000-0000-000000000002',
    'admin.manager@thutra.vn',
    '0901000002',
    '$2b$10$S371vmTE5bPK41vj2XV6aebNQaFXqVJEyNUihfi7NP7mCPFgQjI1u',
    'Quản trị viên Nghiệp vụ & Pháp chế',
    '001088000002',
    '8000000002',
    '1988-06-15',
    'Số 45 Nguyễn Du, Quận 1, TP. Hồ Chí Minh',
    '79000',
    'Cục Thuế TP. Hồ Chí Minh',
    'admin_manager',
    'active',
    true,
    2,
    true
),
-- 3. Người nộp thuế mẫu (User - Khớp hoàn toàn với mock UI)
(
    '00000000-0000-0000-0000-000000000003',
    'nam.nguyen@example.com',
    '0908 123 456',
    '$2b$10$S371vmTE5bPK41vj2XV6aebNQaFXqVJEyNUihfi7NP7mCPFgQjI1u',
    'Nguyễn Hoàng Nam',
    '079095012345',
    '8492019381',
    '1998-08-15',
    'Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh',
    '79119',
    'Chi cục Thuế Quận Bình Thạnh (TP.HCM)',
    'user',
    'active',
    true,
    2,
    true
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16.2. Seed Data: Cấu hình tham số thuế động (System Settings)
-- ------------------------------------------------------------------------------
INSERT INTO system_settings (
    setting_key, category, description, legal_basis, numeric_value, unit, is_active, effective_from
) VALUES
-- Mức giảm trừ gia cảnh
('personal_deduction_monthly', 'deduction', 'Mức giảm trừ gia cảnh cho bản thân người nộp thuế hàng tháng', 'Nghị quyết 954/2020/UBTVQH14', 11000000.00, 'VNĐ/tháng', true, '2020-07-01'),
('personal_deduction_yearly', 'deduction', 'Mức giảm trừ gia cảnh cho bản thân cả năm (12 tháng)', 'Nghị quyết 954/2020/UBTVQH14', 132000000.00, 'VNĐ/năm', true, '2020-07-01'),
('dependent_deduction_monthly', 'deduction', 'Mức giảm trừ cho mỗi người phụ thuộc hợp pháp hàng tháng', 'Nghị quyết 954/2020/UBTVQH14', 4400000.00, 'VNĐ/tháng', true, '2020-07-01'),
('dependent_deduction_yearly', 'deduction', 'Mức giảm trừ cho mỗi người phụ thuộc hợp pháp cả năm', 'Nghị quyết 954/2020/UBTVQH14', 52800000.00, 'VNĐ/năm', true, '2020-07-01'),

-- Mức lương cơ sở & Trần đóng Bảo hiểm xã hội
('base_salary', 'insurance', 'Mức lương cơ sở áp dụng làm căn cứ tính trần đóng BHXH, BHYT', 'Nghị định 73/2024/NĐ-CP', 2340000.00, 'VNĐ/tháng', true, '2024-07-01'),
('max_insurance_base_multiplier', 'insurance', 'Hệ số trần đóng BHXH tối đa (20 lần mức lương cơ sở)', 'Điều 89 Luật BHXH 2014', 20.00, 'hệ số', true, '2024-07-01'),
('regional_min_wage_zone1', 'insurance', 'Lương tối thiểu vùng I làm căn cứ đóng BHTN tối đa 20 lần', 'Nghị định 74/2024/NĐ-CP', 4960000.00, 'VNĐ/tháng', true, '2024-07-01'),

-- Tỷ lệ trích đóng bảo hiểm trừ vào lương người lao động
('social_insurance_rate', 'insurance', 'Tỷ lệ đóng Bảo hiểm Xã hội bắt buộc (8%)', 'Luật BHXH 2014', 8.00, '%', true, '2020-01-01'),
('health_insurance_rate', 'insurance', 'Tỷ lệ đóng Bảo hiểm Y tế bắt buộc (1.5%)', 'Luật BHYT', 1.50, '%', true, '2020-01-01'),
('unemployment_insurance_rate', 'insurance', 'Tỷ lệ đóng Bảo hiểm Thất nghiệp bắt buộc (1.0%)', 'Luật Việc làm 2013', 1.00, '%', true, '2020-01-01'),

-- Ngưỡng khấu trừ thu nhập vãng lai và miễn thuế
('withholding_flat_rate', 'threshold', 'Tỷ lệ khấu trừ thuế tại nguồn đối với thu nhập vãng lai (10%)', 'Thông tư 111/2013/TT-BTC', 10.00, '%', true, '2013-10-01'),
('withholding_threshold', 'threshold', 'Ngưỡng chi trả thu nhập vãng lai từ mức này trở lên bắt buộc khấu trừ 10%', 'Thông tư 111/2013/TT-BTC', 2000000.00, 'VNĐ/lần', true, '2013-10-01'),
('exemption_threshold', 'threshold', 'Số thuế phát sinh sau quyết toán từ 50.000đ trở xuống được miễn nộp', 'Điểm e Khoản 2 Điều 8 NĐ 126/2020', 50000.00, 'VNĐ', true, '2020-12-05'),
('max_voluntary_pension_yearly', 'deduction', 'Mức giảm trừ tối đa đóng quỹ hưu trí tự nguyện', 'Nghị định 12/2015/NĐ-CP', 12000000.00, 'VNĐ/năm', true, '2015-01-01'),
('late_payment_penalty_rate_per_day', 'rate', 'Tỷ lệ tính tiền chậm nộp thuế trên mỗi ngày quá hạn', 'Luật Quản lý Thuế 2019', 0.03, '%/ngày', true, '2020-07-01')
ON CONFLICT (setting_key) DO UPDATE 
SET numeric_value = EXCLUDED.numeric_value, updated_at = CLOCK_TIMESTAMP();

-- ------------------------------------------------------------------------------
-- 16.3. Seed Data: Biểu thuế lũy tiến từng phần (7 bậc thuế chuẩn)
-- ------------------------------------------------------------------------------
INSERT INTO progressive_tax_brackets (
    bracket_level, monthly_min, monthly_max, yearly_min, yearly_max, tax_rate, subtraction_amount, quick_calc_formula
) VALUES
(1, 0.00, 5000000.00, 0.00, 60000000.00, 5.00, 0.00, 'TNTT x 5%'),
(2, 5000000.00, 10000000.00, 60000000.00, 120000000.00, 10.00, 250000.00, 'TNTT x 10% - 0.25 trđ'),
(3, 10000000.00, 18000000.00, 120000000.00, 216000000.00, 15.00, 750000.00, 'TNTT x 15% - 0.75 trđ'),
(4, 18000000.00, 32000000.00, 216000000.00, 384000000.00, 20.00, 1650000.00, 'TNTT x 20% - 1.65 trđ'),
(5, 32000000.00, 52000000.00, 384000000.00, 624000000.00, 25.00, 3250000.00, 'TNTT x 25% - 3.25 trđ'),
(6, 52000000.00, 80000000.00, 624000000.00, 960000000.00, 30.00, 5850000.00, 'TNTT x 30% - 5.85 trđ'),
(7, 80000000.00, NULL, 960000000.00, NULL, 35.00, 9850000.00, 'TNTT x 35% - 9.85 trđ')
ON CONFLICT (bracket_level) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16.4. Seed Data: Danh mục 15 Quy tắc thẩm tra (Rules R01 - R15)
-- ------------------------------------------------------------------------------
INSERT INTO tax_rules (
    code, title, description, legal_reference, risk_level, risk_level_label, 
    category, execution_frequency, condition_snippet, is_active, version, updated_by_name
) VALUES
-- R01
(
    'R01',
    'Kiểm tra định dạng và MST người phụ thuộc',
    'Xác thực số định danh CCCD 12 số, ngày tháng năm sinh và MST cá nhân của NPT.',
    'Thông tư 80/2021/TT-BTC',
    'warning',
    'Cảnh báo xung đột',
    'dependents',
    '48% hồ sơ có NPT',
    '!dependent.mst || !/^[0-9]{12}$/.test(dependent.cccd)',
    true,
    'v2.4',
    'Hệ thống (Auto)'
),
-- R02
(
    'R02',
    'Kiểm tra tính trùng lặp người phụ thuộc giữa các cá nhân kê khai',
    'Cùng một người phụ thuộc không được tính giảm trừ cho hai người nộp thuế trong cùng năm.',
    'Thông tư 111/2013/TT-BTC',
    'error',
    'Lỗi nghiêm trọng',
    'dependents',
    '14% hồ sơ có NPT',
    'checkNationalDatabaseDuplicate(dependent.cccd, taxYear)',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R03
(
    'R03',
    'Kiểm tra ngưỡng thu nhập vãng lai được miễn khấu trừ 10%',
    'Xác minh các khoản chi trả dưới 2.000.000 VNĐ/lần không bị khấu trừ tại nguồn.',
    'Thông tư 111/2013/TT-BTC',
    'suggestion',
    'Gợi ý tối ưu',
    'incomes',
    '22% hồ sơ',
    'paymentAmount < 2000000 && withholdingRate === 0',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R04
(
    'R04',
    'Tự động xác định CQT quyết toán theo nơi làm việc tháng 12',
    'Áp dụng Điều 45 TT 80/2021 để định tuyến cơ quan thuế nộp tờ khai chuẩn xác.',
    'Điều 45 Thông tư 80/2021/TT-BTC',
    'suggestion',
    'Gợi ý tối ưu',
    'routing',
    '100% hồ sơ',
    'routeTaxOffice(lastEmployerMonth12, permanentAddress)',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R05
(
    'R05',
    'Xác định tính hợp lệ của khoản đóng góp bảo hiểm bắt buộc',
    'Kiểm tra trần đóng BHXH, BHYT, BHTN theo mức lương cơ sở quy định tại thời điểm quyết toán.',
    'Luật BHXH 2014 & Nghị định 73/2024/NĐ-CP',
    'suggestion',
    'Gợi ý tối ưu',
    'insurance',
    '95% hồ sơ có HĐLĐ',
    'insuranceBase = Math.min(salary, baseSalary * 20)',
    true,
    'v2.3',
    'Admin Kỹ thuật'
),
-- R06
(
    'R06',
    'Kiểm tra điều kiện ủy quyền quyết toán thay tại tổ chức duy nhất',
    'Điều kiện cá nhân ký HĐLĐ từ 3 tháng trở lên và thực tế đang làm việc tại thời điểm ủy quyền.',
    'Nghị định 126/2020/NĐ-CP',
    'warning',
    'Cảnh báo xung đột',
    'authorization',
    '52% hồ sơ 1 nguồn',
    'has3MonthContract && isWorkingAtAuthorizationTime && activeSourcesCount === 1',
    true,
    'v2.2',
    'Admin Kỹ thuật'
),
-- R07
(
    'R07',
    'Rà soát chứng từ đóng góp từ thiện, nhân đạo hợp pháp',
    'Khoản đóng góp vào quỹ từ thiện, khuyến học được thành lập hợp pháp được trừ trước thuế.',
    'Thông tư 111/2013/TT-BTC',
    'suggestion',
    'Gợi ý tối ưu',
    'deductions',
    '8% hồ sơ',
    'charityFund.isLicensed && charityReceipt.isValid',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R08
(
    'R08',
    'Đối soát thu nhập vãng lai 10% với chứng từ điện tử e-Chungtu',
    'So sánh mã số chứng từ khấu trừ thuế TNCN điện tử theo chuẩn Nghị định 123.',
    'Nghị định 123/2020/NĐ-CP',
    'error',
    'Lỗi nghiêm trọng',
    'incomes',
    '35% hồ sơ vãng lai',
    'verifyWithholdingDoc(docNumber, serialNumber, signerCert)',
    true,
    'v2.3',
    'Admin Kỹ thuật'
),
-- R09
(
    'R09',
    'Đối soát chênh lệch thu nhập chịu thuế giữa Form 02/QTT và e-Chungtu',
    'Kiểm tra độ khớp số liệu tổng thu nhập chịu thuế kê khai so với tổng tiền trên chứng từ điện tử.',
    'Thông tư 80/2021/TT-BTC',
    'error',
    'Lỗi nghiêm trọng',
    'reconciliation',
    '74% hồ sơ',
    'Math.abs(form02Total - eChungtuSum) < 1000',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R10
(
    'R10',
    'Phát hiện trùng lặp giảm trừ bản thân giữa 2 tổ chức chi trả',
    'Kiểm tra nếu cá nhân đăng ký giảm trừ bản thân tại >= 2 công ty trong cùng kỳ tính thuế.',
    'Điều 9 Thông tư 111/2013/TT-BTC',
    'error',
    'Lỗi nghiêm trọng',
    'deductions',
    '62% hồ sơ 2 nguồn',
    'count(companies.filter(c => c.personalDeductionApplied === true)) > 1',
    true,
    'v2.4',
    'Admin Kỹ thuật (H.Nam)'
),
-- R11
(
    'R11',
    'Xác thực tình trạng cư trú thuế (>= 183 ngày hoặc nơi ở thường xuyên)',
    'Áp dụng công thức tính thuế cho cá nhân cư trú (biểu lũy tiến) hoặc không cư trú (thuế suất 20%).',
    'Thông tư 111/2013/TT-BTC',
    'warning',
    'Cảnh báo xung đột',
    'residence',
    '12% hồ sơ có yếu tố nước ngoài',
    'stayDays >= 183 || hasPermanentResidence === true',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R12
(
    'R12',
    'Cảnh báo vượt ngưỡng nộp phạt chậm quyết toán sau 02/05',
    'Tự động tính số ngày quá hạn và tiền phạt chậm nộp 0.03%/ngày theo Luật Quản lý Thuế.',
    'Khoản 2 Điều 59 Luật Quản lý Thuế 2019',
    'warning',
    'Cảnh báo xung đột',
    'deadline',
    '18% hồ sơ chậm nộp',
    'daysOverdue > 0 ? (taxOwed * 0.0003 * daysOverdue) : 0',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R13
(
    'R13',
    'Kiểm tra giới hạn trần đóng quỹ hưu trí tự nguyện (1.000.000 đ/tháng)',
    'Khoản đóng quỹ hưu trí tự nguyện được giảm trừ tối đa không quá 12 triệu đồng/năm.',
    'Nghị định 12/2015/NĐ-CP & TT 111/2013',
    'suggestion',
    'Gợi ý tối ưu',
    'deductions',
    '11% hồ sơ',
    'voluntaryPensionDeduction = Math.min(actualPaid, 12000000)',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R14
(
    'R14',
    'Miễn nghĩa vụ nộp thuế quyết toán khi phát sinh thêm từ 50.000 VNĐ trở xuống',
    'Cá nhân có số thuế phát sinh phải nộp thêm sau quyết toán từ 50.000 đ trở xuống được miễn nộp.',
    'Điểm e Khoản 2 Điều 8 Nghị định 126/2020/NĐ-CP',
    'suggestion',
    'Gợi ý tối ưu',
    'incomes',
    '19% hồ sơ',
    'taxOwedAfterFinalization <= 50000 && taxOwedAfterFinalization > 0',
    true,
    'v2.4',
    'Admin Kỹ thuật'
),
-- R15
(
    'R15',
    'Kiểm tra tính đồng bộ tài khoản Định danh điện tử VNeID và eTax Mobile',
    'Xác thực tài khoản VNeID mức 2 đã liên kết chính chủ với MST phục vụ nộp thuế điện tử.',
    'Nghị định 59/2022/NĐ-CP',
    'warning',
    'Cảnh báo xung đột',
    'authorization',
    '88% hồ sơ nộp trực tuyến',
    'vneidLevel === 2 && vneidMstLinked === true',
    true,
    'v2.4',
    'Admin Kỹ thuật'
)
ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    legal_reference = EXCLUDED.legal_reference,
    condition_snippet = EXCLUDED.condition_snippet,
    risk_level = EXCLUDED.risk_level,
    updated_at = CLOCK_TIMESTAMP();

-- ------------------------------------------------------------------------------
-- 16.5. Seed Data: Kho tri thức pháp lý RAG (RAG Legal Documents)
-- ------------------------------------------------------------------------------
INSERT INTO rag_legal_documents (code, title, category, chunks_count, vector_status, cosine_similarity_avg)
VALUES
('TT 111/2013/TT-BTC', 'Hướng dẫn thực hiện Luật Thuế thu nhập cá nhân & các Nghị định quy định chi tiết', 'Thông tư Bộ Tài Chính', 56, 'Ready', 0.962),
('TT 80/2021/TT-BTC', 'Hướng dẫn thi hành một số điều của Luật Quản lý Thuế & Nghị định 126/2020/NĐ-CP', 'Thông tư Bộ Tài Chính', 42, 'Ready', 0.941),
('NĐ 126/2020/NĐ-CP', 'Quy định chi tiết một số điều của Luật Quản lý Thuế về khai thuế, nộp thuế, quyết toán', 'Nghị định Chính phủ', 24, 'Ready', 0.915),
('NĐ 123/2020/NĐ-CP', 'Quy định về hóa đơn, chứng từ khấu trừ thuế TNCN điện tử', 'Nghị định Chính phủ', 16, 'Ready', 0.887),
('NĐ 13/2023/NĐ-CP', 'Nghị định về Bảo vệ dữ liệu cá nhân (Personal Data Protection) & Data Minimization', 'Nghị định Chính phủ', 10, 'Ready', 0.953)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16.6. Seed Data: Dữ liệu hồ sơ mẫu cho người dùng (Nguyễn Hoàng Nam)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000003';
    v_profile_id UUID;
    v_doc_id UUID;
BEGIN
    -- 1. Tạo hồ sơ quyết toán kỳ 2024
    INSERT INTO tax_profiles (
        user_id, tax_year, period_title, filing_status, tax_department_code, tax_department_name,
        routing_legal_basis, is_tax_resident, stay_days_in_year,
        total_taxable_income, personal_deduction_amount, dependent_deduction_amount, 
        insurance_deduction_amount, assessable_income, tax_payable, tax_withheld_total, tax_balance,
        refund_bank_name, refund_bank_branch, refund_account_number, refund_account_holder
    ) VALUES (
        v_user_id, 2024, 'Kỳ quyết toán thuế TNCN 2024', 'ready_to_file', '79119', 'Chi cục Thuế Quận Bình Thạnh, TP.HCM',
        'Điều 45 Thông tư 80/2021/TT-BTC căn cứ theo cơ quan chi trả thu nhập cuối cùng trong năm', true, 365,
        230000000.00, 132000000.00, 52800000.00, 18900000.00, 26300000.00, 15950000.00, 19200000.00, -3250000.00,
        'Ngân hàng TMCP Ngoại thương Việt Nam', 'Chi nhánh TP. Hồ Chí Minh', '0071 0012 8899', 'NGUYEN HOANG NAM'
    )
    ON CONFLICT (user_id, tax_year) DO UPDATE 
    SET tax_balance = EXCLUDED.tax_balance
    RETURNING id INTO v_profile_id;

    -- 2. Thêm nguồn thu nhập 1: HĐLĐ Công ty ABC
    INSERT INTO income_sources (
        profile_id, user_id, category, payer_name, payer_mst, payer_branch, tax_authority_name,
        contract_title, is_active_in_december, working_months_count,
        total_income_gross, total_taxable_income, tax_withheld, withholding_rate, insurance_deduction,
        apply_personal_deduction, personal_deduction_months, e_certificate_code, is_e_certificate_verified
    ) VALUES (
        v_profile_id, v_user_id, 'salary_contract', 'Công ty Cổ phần Công nghệ ABC', '0312345678', 'Trụ sở chính TP.HCM', 'Cục Thuế TP. Hồ Chí Minh',
        'Hợp đồng lao động không xác định thời hạn (Kỹ sư Phần mềm)', true, 12,
        180000000.00, 180000000.00, 14200000.00, 0.00, 18900000.00,
        true, 12, 'CT01/2024/ABC89', true
    );

    -- 3. Thêm nguồn thu nhập 2: HĐ dịch vụ Freelance 10%
    INSERT INTO income_sources (
        profile_id, user_id, category, payer_name, payer_mst, payer_branch, tax_authority_name,
        contract_title, is_active_in_december, working_months_count,
        total_income_gross, total_taxable_income, tax_withheld, withholding_rate, insurance_deduction,
        apply_personal_deduction, personal_deduction_months, e_certificate_code, is_e_certificate_verified
    ) VALUES (
        v_profile_id, v_user_id, 'freelance_10pct', 'Công ty Cổ phần Truyền thông Đa phương tiện XYZ', '0109876543', 'Chi nhánh Hà Nội', 'Cục Thuế TP. Hà Nội',
        'Hợp đồng dịch vụ tư vấn thiết kế UI/UX', false, 1,
        50000000.00, 50000000.00, 5000000.00, 10.00, 0.00,
        false, 0, 'CT04/2026/0912', true
    );

    -- 4. Thêm chứng từ đính kèm
    INSERT INTO tax_documents (
        user_id, profile_id, doc_type, file_name, file_url, file_size_bytes, mime_type,
        ocr_status, ocr_confidence, verification_status, is_digital_signature_valid
    ) VALUES (
        v_user_id, v_profile_id, 'withholding_cert_form02', 'Chung_tu_thue_ABC.pdf', '/storage/docs/Chung_tu_thue_ABC.pdf', 1048576, 'application/pdf',
        'completed', 99.00, 'verified_auto', true
    ) RETURNING id INTO v_doc_id;

    -- 5. Thêm người phụ thuộc (Mẹ đẻ)
    INSERT INTO dependents (
        user_id, profile_id, full_name, relation_type, relation_title, cccd, mst, has_mst,
        date_of_birth, is_valid_cqt, start_month, end_month, months_applied, monthly_deduction, total_deduction, proof_document_id
    ) VALUES (
        v_user_id, v_profile_id, 'Trần Thị Mai', 'mother', 'Mẹ đẻ (ngoài độ tuổi lao động)', '019283748201', '8091234567', true,
        '1958-05-12', true, '2024-01', '2024-12', 12, 4400000.00, 52800000.00, v_doc_id
    )
    ON CONFLICT (profile_id, cccd) DO NOTHING;

    -- 6. Ghi vết Audit Log thẩm tra tự động (Data Minimization)
    INSERT INTO audit_logs (
        profile_id, user_id, operator, purpose, action_type, masked_cccd, masked_mst,
        triggered_rules, minimization_status, retention_expires_at
    ) VALUES
    (
        v_profile_id, v_user_id, 'RuleEngine_Daemon_Worker_01', 
        'Thẩm tra tự động điều kiện giảm trừ gia cảnh (Điều 9 NĐ 13/2023)', 'RULE_EVALUATION',
        '079095012345', '8492019381', ARRAY['R10', 'R01'], 'Tuân thủ 100%', CLOCK_TIMESTAMP() + INTERVAL '30 days'
    ),
    (
        v_profile_id, v_user_id, 'RuleEngine_Daemon_Worker_02', 
        'Định tuyến Chi cục Thuế nộp tờ khai 02/QTT theo Điều 45 TT 80', 'ROUTING_VERIFICATION',
        '079095012345', '8492019381', ARRAY['R04'], 'Tuân thủ 100%', CLOCK_TIMESTAMP() + INTERVAL '30 days'
    );
END $$;

-- ------------------------------------------------------------------------------
-- 17. HOÀN TẤT MIGRATION
-- ------------------------------------------------------------------------------
COMMIT;
