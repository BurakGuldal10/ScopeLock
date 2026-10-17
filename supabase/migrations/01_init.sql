-- ==============================================================================
-- SCOPELOCK DATABASE SCHEMA (V2 - GÜVENLİK VE TEST ONAYLI)
-- Geliştirici: Vanlı (Kıdemli Full-Stack)
-- Denetleyenler: Ali Oda (Siber Güvenlik) & Jony (QA & Test)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLOLAR
-- ==============================================================================

-- 1.1 Workspaces (Ajans / Geliştirici Çalışma Alanı)
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 1.2 Clients (Müşteriler)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 1.3 Approval Requests (Onay ve Revizyon Talepleri)
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scope_details JSONB DEFAULT '[]'::jsonb NOT NULL,
    additional_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (additional_fee >= 0.00),
    status VARCHAR(50) DEFAULT 'beklemede' NOT NULL CHECK (status IN ('beklemede', 'onaylandi', 'revizyon_istendi')),
    access_token UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days') NOT NULL,
    revision_notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 1.4 Client Signatures (Yasal Bağlayıcı İmza ve Adli Kanıt Kaydı - Bire-Bir İlişki)
CREATE TABLE IF NOT EXISTS client_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID UNIQUE NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    signer_name VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    signature_svg_data TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 1.5 Audit Logs (Değiştirilemez ve Silinemez Güvenlik Günlüğü)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    request_id UUID REFERENCES approval_requests(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 2. İNDEKSLER
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_workspace ON clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_approval_workspace ON approval_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_logs(workspace_id);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ==============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Workspaces: Sadece sahibi olan kullanıcı tam yetkilidir
CREATE POLICY "workspaces_owner_all" ON workspaces FOR ALL TO authenticated
    USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Clients: Sadece ait olduğu workspace'in sahibi erişebilir
CREATE POLICY "clients_owner_all" ON clients FOR ALL TO authenticated
    USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()))
    WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Approval Requests: Sadece ajans sahibi erişebilir. (Anonim müşteriler sadece güvenli RPC üzerinden erişir!)
CREATE POLICY "approval_requests_owner_all" ON approval_requests FOR ALL TO authenticated
    USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()))
    WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Signatures: Sadece ilgili talebin sahibi olan ajans okuyabilir
CREATE POLICY "signatures_owner_select" ON client_signatures FOR SELECT TO authenticated
    USING (request_id IN (SELECT id FROM approval_requests WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())));

-- Audit Logs: Sadece ajans sahibi okuyabilir. (UPDATE ve DELETE politikası KESİNLİKLE YOKTUR - İmmutable)
CREATE POLICY "audit_logs_owner_select" ON audit_logs FOR SELECT TO authenticated
    USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- ==============================================================================
-- 4. GÜVENLİ RPC FONKSİYONLARI (Search-path injection ve Race-condition korumalı)
-- ==============================================================================

-- Fonksiyon 1: Token ile Onay Talebini Getirme (Numaralandırma / Veri İfşası Korumalı)
CREATE OR REPLACE FUNCTION get_approval_by_token(p_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT 
        ar.id,
        ar.title,
        ar.description,
        ar.scope_details,
        ar.additional_fee,
        ar.status,
        ar.expires_at,
        ar.created_at,
        c.name AS client_name,
        c.email AS client_email,
        c.company AS client_company,
        w.name AS workspace_name
    INTO v_record
    FROM approval_requests ar
    JOIN workspaces w ON ar.workspace_id = w.id
    JOIN clients c ON ar.client_id = c.id
    WHERE ar.access_token = p_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Geçersiz veya bulunamayan onay tokenı' USING ERRCODE = 'P0002';
    END IF;

    IF v_record.expires_at < now() AND v_record.status = 'beklemede' THEN
        RAISE EXCEPTION 'Bu onay linkinin süresi dolmuştur' USING ERRCODE = 'P0003';
    END IF;

    RETURN to_jsonb(v_record);
END;
$$;

-- Fonksiyon 2: Müşteri Onay ve Dijital İmza (Row-Level Lock, Replay Attack & Boşluk Korumalı)
CREATE OR REPLACE FUNCTION submit_client_approval(
    p_token UUID,
    p_signer_name VARCHAR(255),
    p_signer_email VARCHAR(255),
    p_signature_svg TEXT,
    p_ip_address VARCHAR(45),
    p_user_agent TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_request approval_requests%ROWTYPE;
BEGIN
    -- Boşluk ve geçersiz veri doğrulaması (Jony QA Denetimi)
    IF TRIM(COALESCE(p_signer_name, '')) = '' OR TRIM(COALESCE(p_signer_email, '')) = '' OR TRIM(COALESCE(p_signature_svg, '')) = '' THEN
        RAISE EXCEPTION 'İmzalayan adı, e-posta ve imza verisi boş bırakılamaz' USING ERRCODE = 'P0005';
    END IF;

    -- Satır kilitleme (FOR UPDATE ile aynı anda birden fazla eşzamanlı isteği engelle)
    SELECT * INTO v_request
    FROM approval_requests
    WHERE access_token = p_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Onay talebi bulunamadı' USING ERRCODE = 'P0002';
    END IF;

    IF v_request.status != 'beklemede' THEN
        RAISE EXCEPTION 'Bu talep zaten % durumundadır. Tekrar imzalanamaz!', v_request.status USING ERRCODE = 'P0004';
    END IF;

    IF v_request.expires_at < now() THEN
        RAISE EXCEPTION 'Onay linkinin süresi dolmuştur!' USING ERRCODE = 'P0003';
    END IF;

    -- 1. Durumu güncelle
    UPDATE approval_requests
    SET status = 'onaylandi', updated_at = now()
    WHERE id = v_request.id;

    -- 2. İmzayı güvenli tabloya ekle
    INSERT INTO client_signatures (
        request_id, signer_name, signer_email, signature_svg_data, ip_address, user_agent, signed_at
    ) VALUES (
        v_request.id, TRIM(p_signer_name), TRIM(p_signer_email), p_signature_svg, p_ip_address, p_user_agent, now()
    );

    -- 3. Değiştirilemez denetim günlüğü (Audit Log) oluştur
    INSERT INTO audit_logs (workspace_id, request_id, event_type, details)
    VALUES (
        v_request.workspace_id,
        v_request.id,
        'REQUEST_APPROVED',
        jsonb_build_object(
            'signer_name', TRIM(p_signer_name),
            'signer_email', TRIM(p_signer_email),
            'ip_address', p_ip_address,
            'user_agent', p_user_agent,
            'timestamp', now()
        )
    );

    RETURN jsonb_build_object('success', true, 'status', 'onaylandi');
END;
$$;

-- Fonksiyon 3: Müşteri Revizyon Talebi (Boşluk Korumalı)
CREATE OR REPLACE FUNCTION submit_client_revision(
    p_token UUID,
    p_revision_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_request approval_requests%ROWTYPE;
BEGIN
    IF TRIM(COALESCE(p_revision_notes, '')) = '' THEN
        RAISE EXCEPTION 'Revizyon gerekçesi boş bırakılamaz' USING ERRCODE = 'P0005';
    END IF;

    SELECT * INTO v_request
    FROM approval_requests
    WHERE access_token = p_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Onay talebi bulunamadı' USING ERRCODE = 'P0002';
    END IF;

    IF v_request.status != 'beklemede' THEN
        RAISE EXCEPTION 'Bu talep üzerinde işlem yapılamaz' USING ERRCODE = 'P0004';
    END IF;

    UPDATE approval_requests
    SET status = 'revizyon_istendi', revision_notes = TRIM(p_revision_notes), updated_at = now()
    WHERE id = v_request.id;

    INSERT INTO audit_logs (workspace_id, request_id, event_type, details)
    VALUES (
        v_request.workspace_id,
        v_request.id,
        'REVISION_REQUESTED',
        jsonb_build_object('notes', TRIM(p_revision_notes), 'timestamp', now())
    );

    RETURN jsonb_build_object('success', true, 'status', 'revizyon_istendi');
END;
$$;

-- Fonksiyon izinleri: Anon ve authenticated roller RPC'leri çağırabilir
GRANT EXECUTE ON FUNCTION get_approval_by_token(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_client_approval(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_client_revision(UUID, TEXT) TO anon, authenticated;
