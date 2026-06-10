-- PHẦN 1: KIẾN TRÚC DATABASE (SUPABASE SCHEMA)
-- Hãy chạy các lệnh SQL này trong Supabase SQL Editor để thiết lập 2 bảng dữ liệu.

-- 1. Định nghĩa enum cho Trạng thái Workflow
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused');

-- 2. Định nghĩa enum cho Trạng thái Log
CREATE TYPE execution_status AS ENUM ('success', 'failed');

-- 3. Tạo bảng automation_workflows (Lưu thông tin luồng vẽ)
CREATE TABLE IF NOT EXISTS public.automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status workflow_status NOT NULL DEFAULT 'draft',
    react_flow_data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::JSONB,
    n8n_webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tạo bảng automation_logs (Lịch sử thực thi tự động hóa)
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    status execution_status NOT NULL,
    execution_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_automation_workflows_updated_at
    BEFORE UPDATE ON public.automation_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
