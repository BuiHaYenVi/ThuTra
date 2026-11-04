-- ==============================================================================
-- HỆ THỐNG THUTRA TNCN - MIGRATION GIAI ĐOẠN 3
-- File: database/migrations/20261026_000002_audit_runs_and_findings.sql
-- Mô tả: Bổ sung bảng audit_runs, audit_findings, view audit_rules và cấu hình RLS
-- ==============================================================================

-- 1. View audit_rules (đồng bộ với tax_rules để hỗ trợ linh hoạt)
CREATE OR REPLACE VIEW audit_rules AS
SELECT 
    id,
    code AS rule_code,
    title AS rule_name,
    description,
    legal_reference,
    risk_level AS severity,
    category,
    condition_snippet,
    is_active,
    version,
    created_at,
    updated_at
FROM tax_rules;

-- 2. Bảng audit_runs (Lịch sử các phiên thẩm tra thuế)
CREATE TABLE IF NOT EXISTS audit_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES tax_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PASSED, WARNING, FAILED, PENDING
    total_rules_scanned INT NOT NULL DEFAULT 15,
    rules_passed_count INT NOT NULL DEFAULT 0,
    rules_warning_count INT NOT NULL DEFAULT 0,
    rules_failed_count INT NOT NULL DEFAULT 0,
    
    -- Số liệu tài chính sau khi tính toán (NUMERIC 15, 2)
    gross_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    taxable_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_liability NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_deducted NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_refund NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    
    calculation_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

-- 3. Bảng audit_findings (Chi tiết các phát hiện vi phạm / cảnh báo của 15 rules)
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_run_id UUID NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES tax_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rule_code VARCHAR(10) NOT NULL, -- R01 - R15
    rule_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'WARNING', -- CRITICAL, WARNING, INFO
    status VARCHAR(50) NOT NULL DEFAULT 'PASSED',    -- PASSED, FAILED, WARNING
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    suggested_fix TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

-- 4. Kích hoạt Row-Level Security (RLS)
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

-- 5. Chính sách RLS cho audit_runs
DO $$ BEGIN
    DROP POLICY IF EXISTS rls_audit_runs_super_admin ON audit_runs;
    CREATE POLICY rls_audit_runs_super_admin ON audit_runs
        FOR ALL TO PUBLIC
        USING (is_super_admin())
        WITH CHECK (is_super_admin());

    DROP POLICY IF EXISTS rls_audit_runs_user ON audit_runs;
    CREATE POLICY rls_audit_runs_user ON audit_runs
        FOR ALL TO PUBLIC
        USING (current_app_user_role() = 'user' AND user_id = current_app_user_id())
        WITH CHECK (current_app_user_role() = 'user' AND user_id = current_app_user_id());
END $$;

-- 6. Chính sách RLS cho audit_findings
DO $$ BEGIN
    DROP POLICY IF EXISTS rls_audit_findings_super_admin ON audit_findings;
    CREATE POLICY rls_audit_findings_super_admin ON audit_findings
        FOR ALL TO PUBLIC
        USING (is_super_admin())
        WITH CHECK (is_super_admin());

    DROP POLICY IF EXISTS rls_audit_findings_user ON audit_findings;
    CREATE POLICY rls_audit_findings_user ON audit_findings
        FOR ALL TO PUBLIC
        USING (current_app_user_role() = 'user' AND user_id = current_app_user_id())
        WITH CHECK (current_app_user_role() = 'user' AND user_id = current_app_user_id());
END $$;

-- 7. Chỉ mục tối ưu hiệu năng
CREATE INDEX IF NOT EXISTS idx_audit_runs_profile ON audit_runs(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_runs_user ON audit_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_runs_created ON audit_runs(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_findings_run ON audit_findings(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_profile ON audit_findings(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_rule ON audit_findings(rule_code);
