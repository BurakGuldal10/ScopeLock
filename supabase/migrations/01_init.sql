-- =============================================================================
-- ScopeLock — 01_init.sql
-- Schema v2: TypeScript katmanıyla tam uyumlu
-- Tablo eşlemesi:
--   workspaces        → agencies
--   clients           → projects (client_name, client_email kolonları ile)
--   approval_requests → signoffs (client_signatures gömüldü)
--   audit_logs        → audit_logs (workspace_id → agency_id)
-- Güvenlik: Ali Oda katmanları korundu (FOR UPDATE, TRIM/COALESCE, SECURITY DEFINER)
-- Kısıtlamalar: Jony kısıtlamaları korundu (CHECK, UNIQUE token, expiry, duplicate)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Uzantılar
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================================================
-- TABLOLAR
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- agencies (workspaces yerine)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agencies (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ---------------------------------------------------------------------------
-- projects (clients yerine — client bilgileri gömülü)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id    UUID        NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    client_name  VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ---------------------------------------------------------------------------
-- signoffs (approval_requests + client_signatures → tek tablo)
-- Jony: CHECK (additional_fee >= 0.00), UNIQUE token (replay attack koruması)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signoffs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agency_id       UUID        NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT        NOT NULL,
    additional_fee  NUMERIC(10, 2) DEFAULT 0.00 NOT NULL
                        CHECK (additional_fee >= 0.00),
    file_url        TEXT,
    status          VARCHAR(50) DEFAULT 'beklemede' NOT NULL
                        CHECK (status IN ('beklemede', 'onaylandi', 'revizyon_istendi')),
    -- Replay attack koruması: token UNIQUE
    token           UUID        UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    -- client_signatures tablosundan gelen kolonlar (gömüldü)
    signature_data  TEXT,
    signed_at       TIMESTAMPTZ,
    signer_ip       VARCHAR(45),
    revision_notes  TEXT,
    pdf_url         TEXT,
    expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days') NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ---------------------------------------------------------------------------
-- audit_logs (workspace_id → agency_id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id   UUID        NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    signoff_id  UUID        REFERENCES signoffs(id) ON DELETE SET NULL,
    event_type  VARCHAR(100) NOT NULL,
    details     JSONB       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================================================
-- UPDATED_AT TRIGGER
-- Ali Oda: SECURITY DEFINER + search_path eklendi
-- ===========================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_signoffs_updated_at
    BEFORE UPDATE ON signoffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================================================
ALTER TABLE agencies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE signoffs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- agencies politikaları
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "agencies_select" ON agencies;
CREATE POLICY "agencies_select" ON agencies
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "agencies_insert" ON agencies;
CREATE POLICY "agencies_insert" ON agencies
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "agencies_update" ON agencies;
CREATE POLICY "agencies_update" ON agencies
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "agencies_delete" ON agencies;
CREATE POLICY "agencies_delete" ON agencies
    FOR DELETE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- projects politikaları
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects
    FOR SELECT USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
    FOR INSERT WITH CHECK (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects
    FOR UPDATE USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "projects_delete" ON projects;
CREATE POLICY "projects_delete" ON projects
    FOR DELETE USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

-- ---------------------------------------------------------------------------
-- signoffs politikaları
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "signoffs_select" ON signoffs;
CREATE POLICY "signoffs_select" ON signoffs
    FOR SELECT USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "signoffs_insert" ON signoffs;
CREATE POLICY "signoffs_insert" ON signoffs
    FOR INSERT WITH CHECK (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "signoffs_update" ON signoffs;
CREATE POLICY "signoffs_update" ON signoffs
    FOR UPDATE USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "signoffs_delete" ON signoffs;
CREATE POLICY "signoffs_delete" ON signoffs
    FOR DELETE USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

-- ---------------------------------------------------------------------------
-- audit_logs politikaları (sadece SELECT — yazma RPC üzerinden)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
        agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
    );

-- ===========================================================================
-- RPC FONKSİYONLARI
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- get_approval_by_token
-- Ali Oda: token ile sorgula, projects JOIN, süresi dolmuş token kontrolü
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_approval_by_token(p_token UUID)
RETURNS TABLE (
    id              UUID,
    project_id      UUID,
    agency_id       UUID,
    title           VARCHAR(255),
    description     TEXT,
    additional_fee  NUMERIC(10, 2),
    file_url        TEXT,
    status          VARCHAR(50),
    token           UUID,
    signature_data  TEXT,
    signed_at       TIMESTAMPTZ,
    signer_ip       VARCHAR(45),
    revision_notes  TEXT,
    pdf_url         TEXT,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ,
    project_name    VARCHAR(255),
    client_name     VARCHAR(255),
    client_email    VARCHAR(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.project_id,
        s.agency_id,
        s.title,
        s.description,
        s.additional_fee,
        s.file_url,
        s.status,
        s.token,
        s.signature_data,
        s.signed_at,
        s.signer_ip,
        s.revision_notes,
        s.pdf_url,
        s.expires_at,
        s.created_at,
        s.updated_at,
        p.name        AS project_name,
        p.client_name,
        p.client_email
    FROM signoffs s
    JOIN projects p ON p.id = s.project_id
    WHERE s.token = p_token
      AND s.expires_at > now();  -- Süresi dolmuş token kontrolü (Jony)
END;
$$;

-- ---------------------------------------------------------------------------
-- submit_client_approval
-- Ali Oda: FOR UPDATE row lock, TRIM/COALESCE boşluk kontrolü
-- Jony: duplicate signature koruması (status zaten 'onaylandi' ise hata)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_client_approval(
    p_token         UUID,
    p_signature_data TEXT,
    p_signer_ip     VARCHAR(45)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_signoff signoffs%ROWTYPE;
BEGIN
    -- Ali Oda: Row-level lock — eşzamanlı çift onay engeli
    SELECT * INTO v_signoff
    FROM signoffs
    WHERE token = p_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Geçersiz veya süresi dolmuş token.';
    END IF;

    -- Jony: Süresi dolmuş token kontrolü
    IF v_signoff.expires_at <= now() THEN
        RAISE EXCEPTION 'Token süresi dolmuş.';
    END IF;

    -- Jony: Duplicate signature koruması
    IF v_signoff.status = 'onaylandi' THEN
        RAISE EXCEPTION 'Bu onay zaten imzalanmış.';
    END IF;

    -- Ali Oda: Boşluk kontrolü (TRIM + COALESCE)
    IF LENGTH(TRIM(COALESCE(p_signature_data, ''))) = 0 THEN
        RAISE EXCEPTION 'İmza verisi boş olamaz.';
    END IF;

    UPDATE signoffs
    SET
        status         = 'onaylandi',
        signature_data = p_signature_data,
        signed_at      = now(),
        signer_ip      = p_signer_ip,
        updated_at     = now()
    WHERE token = p_token;

    -- audit_logs kaydı (agency_id + signoff_id)
    INSERT INTO audit_logs (agency_id, signoff_id, event_type, details)
    VALUES (
        v_signoff.agency_id,
        v_signoff.id,
        'client_approved',
        jsonb_build_object(
            'token',     p_token,
            'signer_ip', p_signer_ip,
            'signed_at', now()
        )
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- submit_client_revision
-- Ali Oda: FOR UPDATE row lock, TRIM/COALESCE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_client_revision(
    p_token          UUID,
    p_revision_notes TEXT,
    p_signer_ip      VARCHAR(45)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_signoff signoffs%ROWTYPE;
BEGIN
    -- Ali Oda: Row-level lock
    SELECT * INTO v_signoff
    FROM signoffs
    WHERE token = p_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Geçersiz veya süresi dolmuş token.';
    END IF;

    -- Jony: Süresi dolmuş token kontrolü
    IF v_signoff.expires_at <= now() THEN
        RAISE EXCEPTION 'Token süresi dolmuş.';
    END IF;

    -- Zaten kesinleşmiş veya işlem görmüş durum kontrolü
    IF v_signoff.status IN ('onaylandi', 'revizyon_istendi') THEN
        RAISE EXCEPTION 'Bu onay talebi için zaten bir işlem gerçekleştirilmiş (% durrumunda).', v_signoff.status;
    END IF;

    -- Ali Oda: Boşluk kontrolü
    IF LENGTH(TRIM(COALESCE(p_revision_notes, ''))) = 0 THEN
        RAISE EXCEPTION 'Revizyon notu boş olamaz.';
    END IF;

    UPDATE signoffs
    SET
        status         = 'revizyon_istendi',
        revision_notes = p_revision_notes,
        updated_at     = now()
    WHERE token = p_token;

    -- audit_logs kaydı
    INSERT INTO audit_logs (agency_id, signoff_id, event_type, details)
    VALUES (
        v_signoff.agency_id,
        v_signoff.id,
        'client_revision_requested',
        jsonb_build_object(
            'token',          p_token,
            'revision_notes', p_revision_notes,
            'signer_ip',      p_signer_ip,
            'requested_at',   now()
        )
    );
END;
$$;

-- ===========================================================================
-- GRANT — anon ve authenticated rolleri için izinler
-- ===========================================================================
GRANT EXECUTE ON FUNCTION get_approval_by_token(UUID)                              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_client_approval(UUID, TEXT, VARCHAR(45))          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_client_revision(UUID, TEXT, VARCHAR(45))          TO anon, authenticated;
